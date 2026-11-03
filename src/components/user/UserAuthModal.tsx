import React, { useState, useEffect } from 'react';
import {
  Phone,
  Lock,
  Gift,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Key,
  User as UserIcon
} from 'lucide-react';
import { UserRecord, DeviceRecord, AuthConfig } from '../../types';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';
import { firebaseSync } from '../../services/firebaseSync';
import { apiClient } from '../../services/apiClient';
import { Bingo777Logo } from '../common/Bingo777Logo';
import {
  auth,
  rtdb,
  rtdbRef,
  rtdbGet,
  rtdbUpdate,
  rtdbOnValue,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getPersistentDeviceId
} from '../../firebase';

import { PhoneLoginModal } from './PhoneLoginModal';

interface UserAuthModalProps {
  onSuccess: (user: UserRecord) => void;
  onClose: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({ onSuccess, onClose }) => {
  const { showToast } = useToast();

  // Real-time listener for /admin_settings/auth_config
  const [authConfig, setAuthConfig] = useState<AuthConfig>(() => {
    const saved = store.getAdminSettings().auth_config;
    return {
      otpLoginEnabled: saved?.otpLoginEnabled ?? false,
      passwordLoginEnabled: saved?.passwordLoginEnabled ?? true,
      directLoginEnabled: saved?.directLoginEnabled ?? true,
      allowNewUserSignup: saved?.allowNewUserSignup ?? true,
      defaultAuthTab: saved?.defaultAuthTab || 'login',
      defaultLoginMethod: saved?.defaultLoginMethod || 'password',
      showNameFieldOnSignup: false,
      showReferralFieldOnSignup: saved?.showReferralFieldOnSignup ?? true,
      requireReferralOnSignup: saved?.requireReferralOnSignup ?? false,
      minPasswordLength: saved?.minPasswordLength || 6,
      loginPageTitle: saved?.loginPageTitle || 'Bingo777',
      loginPageSubtitle: saved?.loginPageSubtitle || 'Instant Zero-Captcha Auth',
      signupBannerText: saved?.signupBannerText || '100% Captcha-Free Instant Login & Sign Up Active',
      signupButtonText: saved?.signupButtonText || 'Create Account & Claim Bonus',
      loginButtonText: saved?.loginButtonText || 'Login'
    };
  });

  const otpLoginEnabled = Boolean(authConfig.otpLoginEnabled);
  const passwordLoginEnabled = authConfig.passwordLoginEnabled !== false;
  const directLoginEnabled = authConfig.directLoginEnabled !== false;
  const allowNewUserSignup = authConfig.allowNewUserSignup !== false && store.isFeatureEnabled('user_registration');
  const showReferralFieldOnSignup = authConfig.showReferralFieldOnSignup !== false;
  const requireReferralOnSignup = Boolean(authConfig.requireReferralOnSignup);
  const minPasswordLength = Math.max(4, Number(authConfig.minPasswordLength) || 6);

  // Default to 100% Zero-Captcha Login/Register flow
  const [tab, setTab] = useState<'otp' | 'login' | 'register'>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ref')) return 'register';
    const defTab = store.getAdminSettings().auth_config?.defaultAuthTab;
    if (defTab === 'register') return 'register';
    if (defTab === 'otp' && store.getAdminSettings().auth_config?.otpLoginEnabled) return 'otp';
    return 'login';
  });

  // Alternative login sub-mode when on 'login' tab: 'password' | 'direct'
  const [loginMethod, setLoginMethod] = useState<'password' | 'direct'>(() => {
    const cfg = store.getAdminSettings().auth_config;
    if (cfg?.passwordLoginEnabled === false && cfg?.directLoginEnabled !== false) return 'direct';
    if (cfg?.defaultLoginMethod === 'direct' && cfg?.directLoginEnabled !== false) return 'direct';
    return 'password';
  });

  // Form Fields (Name section removed from Sign Up as requested)
  const [phone, setPhone] = useState(() => localStorage.getItem('bingo777_last_phone') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref') || '';
  });

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time onValue listener to /admin_settings/auth_config
  useEffect(() => {
    const authCfgRef = rtdbRef(rtdb, 'admin_settings/auth_config');
    const unsub = rtdbOnValue(
      authCfgRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            setAuthConfig((prev) => ({
              ...prev,
              ...val,
              otpLoginEnabled: Boolean(val.otpLoginEnabled)
            }));
            if (!val.otpLoginEnabled) {
              setTab((curr) => (curr === 'otp' ? 'login' : curr));
            }
            if (val.passwordLoginEnabled === false && val.directLoginEnabled !== false) {
              setLoginMethod('direct');
            } else if (val.directLoginEnabled === false && val.passwordLoginEnabled !== false) {
              setLoginMethod('password');
            }
          }
        }
      },
      (err) => {
        console.warn('[UserAuthModal] RTDB auth_config notice:', err);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    store.syncUsersWithBackend();
    firebaseSync.pullUsersFromRtdb().catch(() => {});
  }, [tab]);

  // Retrieve permanent device record
  const getClientDevice = (): DeviceRecord => {
    return store.getOrCreateClientDevice();
  };

  const [pendingDeviceNotice, setPendingDeviceNotice] = useState<string | null>(null);

  /**
   * Synchronize user login or first-time signup safely in Firebase RTDB (`users/{uid}`)
   * NEVER overwrites existing `role`, `isAdmin`, `wallet`, `totalDeposit`, `totalWithdraw`, or `boundDeviceId`.
   */
  const syncUserRecordSafely = async (
    uid: string,
    cleanPhone: string,
    fallbackUser: UserRecord,
    currentDeviceId: string
  ): Promise<UserRecord> => {
    try {
      const userSnap = await rtdbGet(rtdbRef(rtdb, `users/${uid}`));
      if (userSnap.exists()) {
        const existingData = userSnap.val() || {};
        // Preserve all existing fields (role, isAdmin, wallet, boundDeviceId, createdAt)
        // ONLY call update with login timestamp, online status, and lastUsedDeviceId
        const loginPatch: Record<string, any> = {
          lastLogin: Date.now(),
          lastActive: Date.now(),
          isOnline: true,
          lastUsedDeviceId: currentDeviceId
        };
        await rtdbUpdate(rtdbRef(rtdb, `users/${uid}`), loginPatch);

        const merged = store.updateUserFromFirestore({
          ...existingData,
          ...loginPatch,
          uid,
          phone: existingData.phone || cleanPhone
        });
        const finalUser = merged || store.getUser(uid) || fallbackUser;
        localStorage.setItem('bingo777_session_user', JSON.stringify(finalUser));
        return finalUser;
      } else {
        // Snapshot does not exist -> initialize default fields safely
        const adminSettings = store.getAdminSettings();
        const signupBonus =
          (adminSettings as any).signup_bonus ??
          (adminSettings as any).signupBonus ??
          adminSettings.signupBonusAmount ??
          100;
        const initialWallet =
          typeof fallbackUser.wallet === 'number'
            ? fallbackUser.wallet
            : typeof fallbackUser.balance === 'number'
            ? fallbackUser.balance
            : signupBonus;

        const newPayload: Record<string, any> = {
          uid,
          phone: cleanPhone,
          name: fallbackUser.name || fallbackUser.username || `Player_${cleanPhone.slice(-4)}`,
          username: fallbackUser.username || fallbackUser.name || `Player_${cleanPhone.slice(-4)}`,
          wallet: initialWallet,
          balance: initialWallet,
          totalDeposit: Number(fallbackUser.totalDeposit ?? fallbackUser.totalDeposited ?? 0),
          totalDeposited: Number(fallbackUser.totalDeposited ?? fallbackUser.totalDeposit ?? 0),
          totalWithdraw: Number(fallbackUser.totalWithdraw ?? fallbackUser.totalWithdrawn ?? 0),
          totalWithdrawn: Number(fallbackUser.totalWithdrawn ?? fallbackUser.totalWithdraw ?? 0),
          role: fallbackUser.role || 'user',
          isAdmin: Boolean(fallbackUser.isAdmin || fallbackUser.role === 'admin' || fallbackUser.role === 'master_admin'),
          isBanned: Boolean(fallbackUser.isBanned),
          status: fallbackUser.status || 'active',
          boundDeviceId: fallbackUser.boundDeviceId ?? null,
          registrationDeviceId: fallbackUser.registrationDeviceId || currentDeviceId,
          lastUsedDeviceId: currentDeviceId,
          referralCode: fallbackUser.referralCode || '',
          createdAt: fallbackUser.createdAt || Date.now(),
          lastLogin: Date.now(),
          lastActive: Date.now(),
          isOnline: true
        };
        if (fallbackUser.passwordHash) {
          newPayload.passwordHash = fallbackUser.passwordHash;
        }
        await rtdbUpdate(rtdbRef(rtdb, `users/${uid}`), newPayload);
        const merged = store.updateUserFromFirestore({ ...newPayload, uid });
        const finalUser = merged || fallbackUser;
        localStorage.setItem('bingo777_session_user', JSON.stringify(finalUser));
        return finalUser;
      }
    } catch (err) {
      console.warn('[UserAuthModal] syncUserRecordSafely warning:', err);
      localStorage.setItem('bingo777_session_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  };

  /**
   * Handle 100% Zero-Captcha Login (Mobile Number + Password via virtual email `${phone}@bingo777.in`)
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setPendingDeviceNotice(null);

    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    if (!password) {
      showToast('Please enter your password', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await firebaseSync.pullUsersFromRtdb().catch(() => {});
      const device = getClientDevice();
      const currentDeviceId = getPersistentDeviceId();
      const virtualEmail = `${cleanPhone}@bingo777.in`;

      // 1. Attempt Firebase Email/Password Auth with virtual email (`${phone}@bingo777.in`) so reCAPTCHA never triggers
      let firebaseUid: string | null = null;
      let firebaseAuthSucceeded = false;
      try {
        const cred = await signInWithEmailAndPassword(auth, virtualEmail, password);
        if (cred.user) {
          firebaseUid = cred.user.uid;
          firebaseAuthSucceeded = true;
        }
      } catch (authErr: any) {
        const errCode = authErr?.code || '';
        // If user existed in RTDB before virtual email migration, check RTDB record and upgrade to virtual email seamlessly
        const existingInStore = store.findUserByPhone(cleanPhone);
        if (
          existingInStore &&
          (!existingInStore.passwordHash || existingInStore.passwordHash === password) &&
          (errCode === 'auth/user-not-found' || errCode === 'auth/invalid-credential' || errCode === 'auth/operation-not-allowed')
        ) {
          try {
            const createdCred = await createUserWithEmailAndPassword(auth, virtualEmail, password);
            if (createdCred.user) {
              firebaseUid = existingInStore.uid || createdCred.user.uid;
              firebaseAuthSucceeded = true;
            }
          } catch {
            firebaseUid = existingInStore.uid;
          }
        }
      }

      const existingCandidate =
        (firebaseUid ? store.getUser(firebaseUid) : undefined) || store.findUserByPhone(cleanPhone);

      const isUserAdminAccount = Boolean(
        existingCandidate &&
          (existingCandidate.isAdmin === true ||
            existingCandidate.role === 'admin' ||
            existingCandidate.role === 'master_admin')
      );

      if (!isUserAdminAccount && !store.isFeatureEnabled('user_login')) {
        showToast('Member Login is temporarily paused by Master Admin for maintenance.', 'error');
        return;
      }

      if (existingCandidate) {
        if (existingCandidate.isBanned || existingCandidate.status === 'blocked') {
          showToast('Your account has been suspended by Admin.', 'error');
          return;
        }

        // If Admin user, always allow login and preserve Admin role
        if (isUserAdminAccount) {
          if (!firebaseAuthSucceeded && existingCandidate.passwordHash && existingCandidate.passwordHash !== password) {
            showToast('Incorrect password! Please try again.', 'error');
            return;
          }
          const finalAdmin = await syncUserRecordSafely(
            existingCandidate.uid,
            cleanPhone,
            existingCandidate,
            currentDeviceId
          );
          localStorage.setItem('bingo777_active_uid', finalAdmin.uid);
          localStorage.setItem('maanwin_active_uid', finalAdmin.uid);
          localStorage.setItem('bingo777_last_phone', cleanPhone);
          firebaseSync.attachRealtimeUserSync(finalAdmin.uid, cleanPhone);

          showToast(`Welcome back, Admin ${finalAdmin.name || finalAdmin.username}!`, 'success');
          onSuccess(finalAdmin);
          onClose();
          return;
        }

        const loginAttempt = store.attemptDeviceBoundedLogin(cleanPhone, device, password);
        if (loginAttempt.success && loginAttempt.user) {
          const finalUser = await syncUserRecordSafely(
            loginAttempt.user.uid,
            cleanPhone,
            loginAttempt.user,
            currentDeviceId
          );
          localStorage.setItem('bingo777_active_uid', finalUser.uid);
          localStorage.setItem('maanwin_active_uid', finalUser.uid);
          localStorage.setItem('bingo777_last_phone', cleanPhone);
          firebaseSync.attachRealtimeUserSync(finalUser.uid, cleanPhone);

          showToast(`Welcome back, ${finalUser.name || finalUser.username}!`, 'success');
          onSuccess(finalUser);
          onClose();
          return;
        }

        if (loginAttempt.code === 'DEVICE_APPROVAL_REQUIRED') {
          const msg =
            loginAttempt.error ||
            `1 Number = 1 Device Policy: New device (${device.deviceId}) requires Admin approval before login.`;
          setPendingDeviceNotice(msg);
          showToast('New device detected! Sent to Admin for approval.', 'error');
          return;
        }

        showToast(loginAttempt.error || 'Incorrect password! Please try again.', 'error');
        return;
      }

      // If Firebase Auth succeeded for a UID not yet cached locally, check RTDB directly
      if (firebaseUid) {
        const snap = await rtdbGet(rtdbRef(rtdb, `users/${firebaseUid}`));
        if (snap.exists()) {
          const raw = snap.val();
          const restored = store.updateUserFromFirestore({ ...raw, uid: firebaseUid, phone: cleanPhone });
          if (restored) {
            const finalUser = await syncUserRecordSafely(
              firebaseUid,
              cleanPhone,
              restored,
              currentDeviceId
            );
            localStorage.setItem('bingo777_active_uid', finalUser.uid);
            localStorage.setItem('maanwin_active_uid', finalUser.uid);
            localStorage.setItem('bingo777_last_phone', cleanPhone);
            firebaseSync.attachRealtimeUserSync(finalUser.uid, cleanPhone);

            showToast(`Welcome back, ${finalUser.name || finalUser.username}!`, 'success');
            onSuccess(finalUser);
            onClose();
            return;
          }
        }
      }

      // Query authoritative backend disk store fallback
      const serverRes = await apiClient.loginUser(cleanPhone, password, device);
      if (serverRes.success && serverRes.user) {
        const sUser = serverRes.user as UserRecord;
        const restored = store.restoreUserFromBackend(sUser, undefined, password);
        const finalUser = await syncUserRecordSafely(
          restored.uid,
          cleanPhone,
          restored,
          currentDeviceId
        );
        localStorage.setItem('bingo777_active_uid', finalUser.uid);
        localStorage.setItem('maanwin_active_uid', finalUser.uid);
        localStorage.setItem('bingo777_last_phone', cleanPhone);
        firebaseSync.attachRealtimeUserSync(finalUser.uid, cleanPhone);

        showToast(`Welcome back, ${finalUser.name || finalUser.username}!`, 'success');
        onSuccess(finalUser);
        onClose();
        return;
      }

      if (serverRes.code === 'INVALID_PASSWORD') {
        showToast('Incorrect password! Please try again.', 'error');
        return;
      }

      showToast(serverRes.error || 'Account not found with this mobile number. Please Sign Up first.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Direct Mobile Login (Zero-Captcha 1-Click Mobile Login)
   */
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setPendingDeviceNotice(null);

    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await firebaseSync.pullUsersFromRtdb().catch(() => {});
      const device = getClientDevice();
      const currentDeviceId = getPersistentDeviceId();
      device.status = 'approved';

      const existingLocal = store.findUserByPhone(cleanPhone);
      const isSelectedAdmin = Boolean(
        existingLocal &&
          (existingLocal.isAdmin === true ||
            existingLocal.role === 'admin' ||
            existingLocal.role === 'master_admin')
      );

      if (!isSelectedAdmin && !store.isFeatureEnabled('user_login')) {
        showToast('Member Login is temporarily paused by Master Admin for maintenance.', 'error');
        return;
      }

      if (existingLocal) {
        if (existingLocal.isBanned || existingLocal.status === 'blocked') {
          showToast('Your account has been suspended by Admin.', 'error');
          return;
        }
        const finalUser = await syncUserRecordSafely(
          existingLocal.uid,
          cleanPhone,
          existingLocal,
          currentDeviceId
        );
        localStorage.setItem('bingo777_active_uid', finalUser.uid);
        localStorage.setItem('maanwin_active_uid', finalUser.uid);
        localStorage.setItem('bingo777_last_phone', cleanPhone);
        firebaseSync.attachRealtimeUserSync(finalUser.uid, cleanPhone);

        showToast(`Welcome back, ${finalUser.name || finalUser.username}!`, 'success');
        onSuccess(finalUser);
        onClose();
        return;
      }

      // If user doesn't exist yet, create via virtual email and credit Welcome Signup Bonus
      const virtualEmail = `${cleanPhone}@bingo777.in`;
      const autoPin = `Pin@${cleanPhone.slice(-4)}77`;
      let customUid: string | undefined;
      try {
        const cred = await createUserWithEmailAndPassword(auth, virtualEmail, autoPin);
        if (cred.user) {
          customUid = cred.user.uid;
        }
      } catch {}

      const defaultUsername = `Player_${cleanPhone.slice(-4)}`;
      const newUser = store.registerUser(cleanPhone, defaultUsername, device, undefined, customUid, autoPin);
      await apiClient
        .registerUser({
          user: newUser,
          phone: cleanPhone,
          username: newUser.username,
          uid: newUser.uid,
          device
        })
        .catch(() => {});

      const finalUser = await syncUserRecordSafely(newUser.uid, cleanPhone, newUser, currentDeviceId);
      localStorage.setItem('bingo777_active_uid', finalUser.uid);
      localStorage.setItem('maanwin_active_uid', finalUser.uid);
      localStorage.setItem('bingo777_last_phone', cleanPhone);
      firebaseSync.attachRealtimeUserSync(finalUser.uid, cleanPhone);

      showToast(`Welcome! ₹${finalUser.balance} Signup Bonus credited to your wallet.`, 'success');
      onSuccess(finalUser);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle 100% Zero-Captcha Sign Up (Mobile Number + Password via virtual email `${phone}@bingo777.in`)
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setPendingDeviceNotice(null);

    if (!allowNewUserSignup) {
      showToast('New user Sign Up is temporarily paused by Master Admin.', 'error');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    if (password.length < minPasswordLength) {
      showToast(`Password must be at least ${minPasswordLength} characters`, 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Password and Confirm Password do not match!', 'error');
      return;
    }
    if (requireReferralOnSignup && !referralCode.trim()) {
      showToast('Please enter a valid Refer Code to register.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await firebaseSync.pullUsersFromRtdb().catch(() => {});

      const device = getClientDevice();
      const currentDeviceId = getPersistentDeviceId();
      device.status = 'approved';

      const existing = store.findUserByPhone(cleanPhone);
      if (existing) {
        const loginAttempt = store.attemptDeviceBoundedLogin(cleanPhone, device, password);
        if (loginAttempt.success && loginAttempt.user) {
          const finalUser = await syncUserRecordSafely(
            loginAttempt.user.uid,
            cleanPhone,
            loginAttempt.user,
            currentDeviceId
          );
          localStorage.setItem('bingo777_active_uid', finalUser.uid);
          localStorage.setItem('maanwin_active_uid', finalUser.uid);
          localStorage.setItem('bingo777_last_phone', cleanPhone);
          firebaseSync.attachRealtimeUserSync(finalUser.uid, cleanPhone);
          showToast(`Welcome back, ${finalUser.name || finalUser.username}! Logged into your saved account.`, 'success');
          onSuccess(finalUser);
          onClose();
          return;
        }
        showToast('This mobile number is already registered. Please Login with your password.', 'info');
        setTab('login');
        return;
      }

      // Create user in Firebase Auth using virtual email `${cleanPhone}@bingo777.in` (Zero Captcha)
      const virtualEmail = `${cleanPhone}@bingo777.in`;
      let customUid: string | undefined;
      try {
        const userCred = await createUserWithEmailAndPassword(auth, virtualEmail, password);
        if (userCred.user) {
          customUid = userCred.user.uid;
        }
      } catch (err: any) {
        if (err?.code === 'auth/email-already-in-use') {
          try {
            const signInCred = await signInWithEmailAndPassword(auth, virtualEmail, password);
            if (signInCred.user) {
              customUid = signInCred.user.uid;
            }
          } catch {}
        }
      }

      const cleanName = `Player_${cleanPhone.slice(-4)}`;
      const enteredRefCode = referralCode.trim() ? referralCode.trim().toUpperCase() : undefined;
      const newUser = store.registerUser(
        cleanPhone,
        cleanName,
        device,
        enteredRefCode,
        customUid,
        password
      );

      await apiClient
        .registerUser({
          user: newUser,
          phone: cleanPhone,
          username: newUser.username,
          password,
          referralCode: newUser.referralCode,
          referredBy: newUser.referredBy,
          uid: newUser.uid,
          device
        })
        .catch(() => {});

      const finalUser = await syncUserRecordSafely(newUser.uid, cleanPhone, newUser, currentDeviceId);

      localStorage.setItem('bingo777_active_uid', finalUser.uid);
      localStorage.setItem('maanwin_active_uid', finalUser.uid);
      localStorage.setItem('bingo777_last_phone', cleanPhone);

      const linkedRef = store.getAllReferrals().find((r) => r.referredUid === finalUser.uid);
      if (linkedRef) {
        await firebaseSync.pushReferralToFirestore(linkedRef).catch(() => {});
      }
      firebaseSync.attachRealtimeUserSync(finalUser.uid, cleanPhone);

      showToast(`Account created! Welcome ₹${finalUser.balance} Signup Bonus credited to your wallet.`, 'success');
      onSuccess(finalUser);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (otpLoginEnabled && tab === 'otp') {
    return (
      <PhoneLoginModal
        onSuccess={onSuccess}
        onClose={onClose}
        onSwitchToPasswordLogin={() => setTab('login')}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6">
        {/* Clean Brand Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Bingo777Logo size="md" variant="badge" />
            <div>
              <span className="font-brand font-black text-lg bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent block leading-none">
                {authConfig.loginPageTitle || 'Bingo777'}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {authConfig.loginPageSubtitle || 'Instant Zero-Captcha Auth'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Login / Sign Up Switcher */}
        {otpLoginEnabled ? (
          <div className={`grid ${allowNewUserSignup ? 'grid-cols-3' : 'grid-cols-2'} p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold gap-1`}>
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`py-2 rounded-lg transition text-[11px] ${
                tab === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Login
            </button>
            {allowNewUserSignup && (
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`py-2 rounded-lg transition text-[11px] ${
                  tab === 'register'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
            )}
            <button
              type="button"
              onClick={() => setTab('otp')}
              className={`py-2 rounded-lg transition text-[11px] font-bold ${
                tab === 'otp'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              ⚡ SMS OTP
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className={`grid ${allowNewUserSignup ? 'grid-cols-2' : 'grid-cols-1'} p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold gap-1`}>
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`py-2.5 rounded-lg transition text-xs ${
                  tab === 'login'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Login
              </button>
              {allowNewUserSignup && (
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className={`py-2.5 rounded-lg transition text-xs ${
                    tab === 'register'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign Up
                </button>
              )}
            </div>
            {authConfig.signupBannerText && (
              <div className="flex items-center space-x-1.5 text-[10px] text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{authConfig.signupBannerText}</span>
              </div>
            )}
          </div>
        )}

        {/* 1 Number = 1 Device Pending Approval Notice */}
        {pendingDeviceNotice && (
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs leading-relaxed">
            <div className="font-bold text-amber-300 mb-0.5">🔒 1 Number = 1 Device Security Lock</div>
            <div>{pendingDeviceNotice}</div>
          </div>
        )}

        {/* Sub-method switcher on Login tab (Password vs Direct Mobile Login) */}
        {tab === 'login' && passwordLoginEnabled && directLoginEnabled && (
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-bold gap-1">
            <button
              type="button"
              onClick={() => setLoginMethod('password')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                loginMethod === 'password'
                  ? 'bg-slate-800 text-amber-300 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3 h-3" />
              <span>Password Login</span>
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('direct')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                loginMethod === 'direct'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Direct Mobile Login</span>
            </button>
          </div>
        )}

        {/* Form (Zero Captcha, Name section removed from Sign Up) */}
        <form
          onSubmit={tab === 'login' ? (loginMethod === 'direct' ? handleDirectLogin : handleLogin) : handleRegister}
          className="space-y-3.5"
        >
          {/* Mobile Number */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5" />
              <span className="absolute left-9 text-xs font-bold text-amber-400 font-mono">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-16 pr-4 py-2.5 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Password (Only when not in direct mobile mode) */}
          {tab === 'login' && loginMethod === 'direct' ? (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Instant 1-Click Verification: Login with mobile number without password or captcha.</span>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Password / PIN
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  placeholder={tab === 'register' ? `Create password (min ${minPasswordLength} chars)` : 'Enter password'}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (Only on Sign Up) */}
          {tab === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  placeholder="Confirm password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Refer Code (Only on Sign Up when enabled by Admin) */}
          {tab === 'register' && showReferralFieldOnSignup && (
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Refer Code</span>
                <span className="text-[10px] text-slate-500">
                  {requireReferralOnSignup ? 'Required *' : 'Optional'}
                </span>
              </label>
              <div className="relative flex items-center">
                <Gift className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="text"
                  placeholder={requireReferralOnSignup ? 'Enter required refer code' : 'Enter refer code (optional)'}
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  required={requireReferralOnSignup}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 font-mono text-xs text-amber-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/40 active:scale-95 transition mt-2"
          >
            {isSubmitting
              ? 'Authenticating...'
              : tab === 'login'
              ? loginMethod === 'direct'
                ? 'Direct Mobile Login'
                : authConfig.loginButtonText || 'Login'
              : authConfig.signupButtonText || 'Create Account & Claim Bonus'}
          </button>

          {/* Conditional footer switch */}
          {otpLoginEnabled ? (
            <div className="pt-2 text-center border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTab('otp')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold transition flex items-center justify-center space-x-1.5 mx-auto"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Login / Sign Up with Phone SMS OTP &rarr;</span>
              </button>
            </div>
          ) : (
            tab === 'login' && passwordLoginEnabled && directLoginEnabled && (
              <div className="pt-2 text-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLoginMethod(loginMethod === 'password' ? 'direct' : 'password')}
                  className="text-xs text-amber-400/90 hover:text-amber-300 font-semibold transition flex items-center justify-center space-x-1.5 mx-auto"
                >
                  {loginMethod === 'password' ? (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Prefer no password? Switch to Direct Mobile Login &rarr;</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>Have password? Switch to Password Login &rarr;</span>
                    </>
                  )}
                </button>
              </div>
            )
          )}
        </form>
      </div>
    </div>
  );
};
