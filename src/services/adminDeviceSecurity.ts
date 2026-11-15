import { rtdb, rtdbRef, rtdbGet, rtdbSet, rtdbUpdate, rtdbRemove, getPersistentDeviceId } from '../firebase';
import { store } from './store';

export const MAX_ADMIN_DEVICES = 5;

export type AdminDeviceStatus = 'pending' | 'approved' | 'rejected';

export interface AdminAllowedDeviceRecord {
  deviceId: string;
  deviceName?: string;
  deviceModel?: string;
  browser?: string;
  os?: string;
  phone?: string;
  uid?: string;
  username?: string;
  status: AdminDeviceStatus;
  requestedAt?: number;
  pairedAt?: number;
  approvedAt?: number;
  approvedBy?: string;
  rejectedAt?: number;
  rejectedBy?: string;
  rejectionReason?: string;
  lastUsedAt?: number;
}

/**
 * Returns true ONLY when running inside the AI Studio workspace host (ais-dev-*)
 * or local developer server (localhost / 127.0.0.1).
 * Shared links (ais-pre-*), custom domains, and mobile APKs return false so they
 * must be explicitly approved into one of the 5 Admin Device slots.
 */
export function isAiStudioControlHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = (window.location.hostname || '').toLowerCase();
  const proto = (window.location.protocol || '').toLowerCase();
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isCapacitorOrWebView =
    Boolean((window as any).Capacitor) ||
    proto === 'capacitor:' ||
    proto === 'file:' ||
    /; wv\)/i.test(ua);

  if (isCapacitorOrWebView) return false;

  return (
    host.startsWith('ais-dev-') ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1'
  );
}

/**
 * Normalizes raw RTDB /admin_security/allowed_devices map so legacy entries
 * paired before the approval flow default to 'approved'.
 */
export function normalizeAdminDeviceMap(
  raw: Record<string, any> | null | undefined
): Record<string, AdminAllowedDeviceRecord> {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<string, AdminAllowedDeviceRecord> = {};
  Object.entries(raw).forEach(([key, val]) => {
    if (!val || typeof val !== 'object') return;
    const deviceId = String(val.deviceId || key);
    if (!deviceId) return;
    const rawStatus = val.status;
    const status: AdminDeviceStatus =
      rawStatus === 'pending' || rawStatus === 'rejected' || rawStatus === 'approved'
        ? rawStatus
        : 'approved';
    result[deviceId] = {
      ...val,
      deviceId,
      status
    };
  });
  return result;
}

export function getApprovedAdminDevices(
  map: Record<string, AdminAllowedDeviceRecord>
): AdminAllowedDeviceRecord[] {
  return Object.values(map).filter((d) => d.status === 'approved');
}

export function getPendingAdminDevices(
  map: Record<string, AdminAllowedDeviceRecord>
): AdminAllowedDeviceRecord[] {
  return Object.values(map)
    .filter((d) => d.status === 'pending')
    .sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0));
}

export async function fetchAllowedAdminDevices(): Promise<Record<string, AdminAllowedDeviceRecord>> {
  try {
    const snap = await rtdbGet(rtdbRef(rtdb, 'admin_security/allowed_devices'));
    if (snap.exists()) {
      return normalizeAdminDeviceMap(snap.val());
    }
  } catch {}
  return {};
}

export async function submitAdminDeviceRequest(params: {
  uid: string;
  phone: string;
  username: string;
}): Promise<{
  status: AdminDeviceStatus;
  approvedCount: number;
  deviceId: string;
  deviceName: string;
}> {
  const deviceId = getPersistentDeviceId();
  const clientDev = store.getOrCreateClientDevice();
  const deviceName =
    clientDev.deviceModel || clientDev.deviceName || `${clientDev.os || 'Device'} (${clientDev.browser || 'Browser'})`;

  const allDevices = await fetchAllowedAdminDevices();
  const approvedCount = getApprovedAdminDevices(allDevices).length;
  const existing = allDevices[deviceId];

  if (existing?.status === 'approved') {
    await rtdbUpdate(rtdbRef(rtdb, `admin_security/allowed_devices/${deviceId}`), {
      lastUsedAt: Date.now(),
      phone: params.phone || existing.phone || '',
      uid: params.uid || existing.uid || '',
      username: params.username || existing.username || ''
    }).catch(() => {});
    return { status: 'approved', approvedCount, deviceId, deviceName };
  }

  if (existing?.status === 'rejected') {
    return { status: 'rejected', approvedCount, deviceId, deviceName };
  }

  const now = Date.now();
  const payload: AdminAllowedDeviceRecord = {
    deviceId,
    deviceName,
    deviceModel: clientDev.deviceModel || deviceName,
    browser: clientDev.browser || 'Browser',
    os: clientDev.os || 'OS',
    phone: params.phone,
    uid: params.uid,
    username: params.username,
    status: 'pending',
    requestedAt: existing?.requestedAt || now,
    lastUsedAt: now
  };

  await rtdbSet(rtdbRef(rtdb, `admin_security/allowed_devices/${deviceId}`), payload);
  return { status: 'pending', approvedCount, deviceId, deviceName };
}

export async function approveAdminDeviceSlot(
  device: Partial<AdminAllowedDeviceRecord> & { deviceId: string },
  adminId: string
): Promise<{ success: boolean; approvedCount: number; error?: string }> {
  const allDevices = await fetchAllowedAdminDevices();
  const approvedList = getApprovedAdminDevices(allDevices);
  const alreadyApproved = allDevices[device.deviceId]?.status === 'approved';

  if (!alreadyApproved && approvedList.length >= MAX_ADMIN_DEVICES) {
    return {
      success: false,
      approvedCount: approvedList.length,
      error: `Maximum ${MAX_ADMIN_DEVICES} Admin Devices limit reached (${approvedList.length}/${MAX_ADMIN_DEVICES}). Remove an existing Admin Device first.`
    };
  }

  const now = Date.now();
  const existing: Partial<AdminAllowedDeviceRecord> = allDevices[device.deviceId] || {};
  const payload: AdminAllowedDeviceRecord = {
    ...existing,
    ...device,
    deviceId: device.deviceId,
    deviceName: device.deviceName || existing.deviceName || 'Admin Hardware Device',
    deviceModel: device.deviceModel || existing.deviceModel || device.deviceName || 'Admin Hardware Device',
    browser: device.browser || existing.browser || 'Browser',
    os: device.os || existing.os || 'OS',
    status: 'approved',
    pairedAt: existing.pairedAt || now,
    approvedAt: now,
    approvedBy: adminId,
    lastUsedAt: now
  };

  await rtdbSet(rtdbRef(rtdb, `admin_security/allowed_devices/${device.deviceId}`), payload);
  store.logAudit({
    actor: adminId,
    category: 'AUTH',
    action: 'APPROVE_ADMIN_DEVICE',
    details: `Approved Admin Hardware Device ${device.deviceId} (${payload.deviceName}). Slots used: ${alreadyApproved ? approvedList.length : approvedList.length + 1}/${MAX_ADMIN_DEVICES}.`,
    outcome: 'SUCCESS'
  });

  return {
    success: true,
    approvedCount: alreadyApproved ? approvedList.length : approvedList.length + 1
  };
}

export async function rejectAdminDeviceSlot(
  deviceId: string,
  adminId: string,
  reason?: string
): Promise<void> {
  await rtdbUpdate(rtdbRef(rtdb, `admin_security/allowed_devices/${deviceId}`), {
    status: 'rejected',
    rejectedAt: Date.now(),
    rejectedBy: adminId,
    rejectionReason: reason || 'Not authorized for Admin Panel'
  });
  store.logAudit({
    actor: adminId,
    category: 'AUTH',
    action: 'REJECT_ADMIN_DEVICE',
    details: `Rejected Admin Hardware Device ${deviceId}. Reason: ${reason || 'Not authorized for Admin Panel'}`,
    outcome: 'DENIED'
  });
}

export async function revokeAdminDeviceSlot(deviceId: string, adminId: string): Promise<void> {
  await rtdbRemove(rtdbRef(rtdb, `admin_security/allowed_devices/${deviceId}`));
  store.logAudit({
    actor: adminId,
    category: 'AUTH',
    action: 'REVOKE_ADMIN_DEVICE',
    details: `Removed Admin Hardware Device ${deviceId} from approved 5-device slots.`,
    outcome: 'DENIED'
  });
}
