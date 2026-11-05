import { rtdb, rtdbRef, rtdbGet, rtdbSet } from '../firebase';
import { store } from './store';

const PENDING_REF_STORAGE_KEY = 'bingo777_pending_referral_code';
const ATTRIBUTION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours window for browser-to-APK download attribution

/**
 * Extracts referral code from current URL search params or hash if present.
 * Supports ?ref=CODE, ?referral=CODE, ?invite=CODE, ?code=CODE, or #ref=CODE
 */
export function extractReferralCodeFromUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const fromSearch =
      searchParams.get('ref') ||
      searchParams.get('referral') ||
      searchParams.get('invite') ||
      searchParams.get('code') ||
      '';
    if (fromSearch.trim()) {
      return fromSearch.trim().toUpperCase();
    }

    if (window.location.hash) {
      const hashClean = window.location.hash.replace(/^#\/?/, '');
      const hashQueryIdx = hashClean.indexOf('?');
      const hashParamString = hashQueryIdx >= 0 ? hashClean.slice(hashQueryIdx + 1) : hashClean;
      const hashParams = new URLSearchParams(hashParamString);
      const fromHash =
        hashParams.get('ref') ||
        hashParams.get('referral') ||
        hashParams.get('invite') ||
        hashParams.get('code') ||
        '';
      if (fromHash.trim()) {
        return fromHash.trim().toUpperCase();
      }
    }
  } catch {
    // Ignore URL parse errors
  }
  return '';
}

/**
 * Computes a deterministic hardware signature shared between mobile browser (Chrome)
 * and the installed Android APK / WebView on the same physical phone.
 */
export function getDeviceHardwareSignature(): string {
  try {
    const dev = store.getOrCreateClientDevice();
    const model = (dev.deviceModel || dev.deviceName || 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    const os = (dev.osVersion || dev.os || 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    const screenRes =
      typeof window !== 'undefined' && window.screen
        ? `${Math.min(window.screen.width, window.screen.height)}x${Math.max(
            window.screen.width,
            window.screen.height
          )}`
        : '0x0';
    const tz =
      typeof Intl !== 'undefined'
        ? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'tz').replace(/[^a-zA-Z0-9]/g, '_')
        : 'tz';
    return `hw_${os}_${model}_${screenRes}_${tz}`.slice(0, 96);
  } catch {
    return 'hw_default';
  }
}

/**
 * Synchronously gets the currently known referral code from URL or localStorage/sessionStorage.
 */
export function getSavedReferralCode(): string {
  const urlCode = extractReferralCodeFromUrl();
  if (urlCode) {
    try {
      localStorage.setItem(PENDING_REF_STORAGE_KEY, urlCode);
      sessionStorage.setItem(PENDING_REF_STORAGE_KEY, urlCode);
    } catch {}
    return urlCode;
  }

  try {
    const savedLocal = localStorage.getItem(PENDING_REF_STORAGE_KEY);
    if (savedLocal && savedLocal.trim()) {
      return savedLocal.trim().toUpperCase();
    }
    const savedSession = sessionStorage.getItem(PENDING_REF_STORAGE_KEY);
    if (savedSession && savedSession.trim()) {
      return savedSession.trim().toUpperCase();
    }
  } catch {}
  return '';
}

/**
 * Captures a referral code (from URL or explicit action like clicking Download App on a referral link)
 * and persists it locally + to Firebase RTDB + Server so that even if the user downloads and opens
 * the APK, their referrer's code is automatically filled in on first launch.
 */
export async function captureAndPersistReferralCode(explicitCode?: string): Promise<string> {
  const code = (explicitCode || getSavedReferralCode()).trim().toUpperCase();
  if (!code) return '';

  try {
    localStorage.setItem(PENDING_REF_STORAGE_KEY, code);
    sessionStorage.setItem(PENDING_REF_STORAGE_KEY, code);
  } catch {}

  const hwSig = getDeviceHardwareSignature();
  const dev = store.getOrCreateClientDevice();
  const now = Date.now();

  const payload = {
    referralCode: code,
    hwSig,
    deviceModel: dev.deviceModel || dev.deviceName || 'Mobile Device',
    osVersion: dev.osVersion || dev.os || 'Android',
    screenResolution: dev.screenResolution || '',
    timestamp: now,
    expiresAt: now + ATTRIBUTION_TTL_MS
  };

  // 1. Save to Server for IP + Hardware deferred attribution
  fetch('/api/referrals/track-download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});

  // 2. Save to Firebase RTDB under pending_referrals/by_hw/{hwSig}
  try {
    await rtdbSet(rtdbRef(rtdb, `pending_referrals/by_hw/${hwSig}`), payload);
  } catch {}

  return code;
}

/**
 * Resolves the referral code on app startup or Signup screen mount.
 * Checks:
 * 1. URL query/hash (?ref=CODE)
 * 2. localStorage / sessionStorage
 * 3. Server IP + Hardware deferred attribution (/api/referrals/resolve-download)
 * 4. Firebase RTDB hardware signature deferred attribution (pending_referrals/by_hw/{hwSig})
 */
export async function resolveDeferredReferralCodeAsync(): Promise<string> {
  // If already in URL, capture and persist to cloud for APK handoff as well
  const urlCode = extractReferralCodeFromUrl();
  if (urlCode) {
    await captureAndPersistReferralCode(urlCode);
    return urlCode;
  }

  // Check local storage
  const existingLocal = getSavedReferralCode();
  if (existingLocal) {
    return existingLocal;
  }

  const hwSig = getDeviceHardwareSignature();
  const now = Date.now();

  // Check Server deferred attribution (matches same IP or hardware signature from referral link download)
  try {
    const res = await fetch(`/api/referrals/resolve-download?hwSig=${encodeURIComponent(hwSig)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.referralCode && typeof data.referralCode === 'string') {
        const matched = data.referralCode.trim().toUpperCase();
        if (matched) {
          try {
            localStorage.setItem(PENDING_REF_STORAGE_KEY, matched);
            sessionStorage.setItem(PENDING_REF_STORAGE_KEY, matched);
          } catch {}
          return matched;
        }
      }
    }
  } catch {}

  // Check Firebase RTDB deferred attribution by hardware signature
  try {
    const snap = await rtdbGet(rtdbRef(rtdb, `pending_referrals/by_hw/${hwSig}`));
    if (snap.exists()) {
      const val = snap.val();
      if (
        val &&
        typeof val.referralCode === 'string' &&
        val.referralCode.trim() &&
        now - Number(val.timestamp || 0) <= ATTRIBUTION_TTL_MS
      ) {
        const matched = val.referralCode.trim().toUpperCase();
        try {
          localStorage.setItem(PENDING_REF_STORAGE_KEY, matched);
          sessionStorage.setItem(PENDING_REF_STORAGE_KEY, matched);
        } catch {}
        return matched;
      }
    }
  } catch {}

  return '';
}

/**
 * Clears the pending referral code after the new user successfully registers.
 */
export async function clearPendingReferralCode(): Promise<void> {
  try {
    localStorage.removeItem(PENDING_REF_STORAGE_KEY);
    sessionStorage.removeItem(PENDING_REF_STORAGE_KEY);
  } catch {}
  try {
    const hwSig = getDeviceHardwareSignature();
    fetch('/api/referrals/clear-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hwSig })
    }).catch(() => {});
    await rtdbSet(rtdbRef(rtdb, `pending_referrals/by_hw/${hwSig}`), null);
  } catch {}
}

/**
 * Official domain used for all referral & invite links.
 */
export const OFFICIAL_REFERRAL_BASE_URL = 'https://www.bingo777.in';

/**
 * Builds the universal referral invite & download link for a user's referral code.
 */
export function buildReferralInviteUrl(referralCode: string): string {
  const cleanCode = (referralCode || 'BINGO777').trim().toUpperCase();
  return `${OFFICIAL_REFERRAL_BASE_URL}/?ref=${encodeURIComponent(cleanCode)}`;
}

