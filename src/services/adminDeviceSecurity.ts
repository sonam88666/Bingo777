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

  // AI Studio workspace preview host (ais-dev-*) is ALWAYS the Super Admin control host,
  // even when opened inside a mobile browser or in-app WebView on the Admin's phone.
  if (host.startsWith('ais-dev-')) return true;

  const isCapacitorOrWebView =
    Boolean((window as any).Capacitor) ||
    proto === 'capacitor:' ||
    proto === 'file:' ||
    /; wv\)/i.test(ua);

  if (isCapacitorOrWebView) return false;

  return (
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
    .sort((a, b) => (b.requestedAt || b.lastUsedAt || 0) - (a.requestedAt || a.lastUsedAt || 0));
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

/**
 * Ensures any APK / mobile device that logged into an Admin account (7088961883, 9012634797, or promoted Admin)
 * and recorded its boundDeviceId / lastUsedDeviceId / devices entry is surfaced in /admin_security/allowed_devices
 * and /users/{uid}/devices so the Super Admin can see and approve it in 1 click.
 */
export async function syncAdminUserDevicesToAllowedMap(): Promise<Record<string, AdminAllowedDeviceRecord>> {
  try {
    const [allowedSnap, usersSnap] = await Promise.all([
      rtdbGet(rtdbRef(rtdb, 'admin_security/allowed_devices')),
      rtdbGet(rtdbRef(rtdb, 'users'))
    ]);
    const allowedMap = allowedSnap.exists() ? normalizeAdminDeviceMap(allowedSnap.val()) : {};
    const usersRaw = usersSnap.exists() ? usersSnap.val() : {};
    if (!usersRaw || typeof usersRaw !== 'object') return allowedMap;

    const now = Date.now();
    const writes: Promise<any>[] = [];

    for (const [uidKey, uVal] of Object.entries(usersRaw) as [string, any][]) {
      if (!uVal || typeof uVal !== 'object') continue;
      const uid = String(uVal.uid || uidKey);
      const cleanPhone = String(uVal.phone || '').replace(/\D/g, '').slice(-10);
      const isMaster = store.isMasterAdminPhone(cleanPhone);
      const isAdminUser = Boolean(
        isMaster || uVal.isAdmin === true || uVal.role === 'admin' || uVal.role === 'master_admin'
      );
      if (!isAdminUser) continue;

      const username = uVal.username || uVal.name || `Admin_${cleanPhone.slice(-4)}`;
      const modelLabel = uVal.deviceModel || uVal.deviceName || uVal.deviceBrand || 'Admin Mobile / APK';

      const candidateIds = new Set<string>();
      if (typeof uVal.lastUsedDeviceId === 'string' && uVal.lastUsedDeviceId.trim()) {
        candidateIds.add(uVal.lastUsedDeviceId.trim());
      }
      if (typeof uVal.boundDeviceId === 'string' && uVal.boundDeviceId.trim()) {
        candidateIds.add(uVal.boundDeviceId.trim());
      }
      if (uVal.devices && typeof uVal.devices === 'object') {
        Object.keys(uVal.devices).forEach((dId) => {
          if (dId && dId.trim()) candidateIds.add(dId.trim());
        });
      }

      for (const devId of candidateIds) {
        const userDevEntry = uVal.devices?.[devId];
        const existingAllowed = allowedMap[devId];

        if (!existingAllowed) {
          // Only auto-surface active/recent Admin devices or explicitly pending user devices
          const isLinuxDesktop =
            (userDevEntry?.os || '').toLowerCase().includes('linux') &&
            !(userDevEntry?.os || '').toLowerCase().includes('android');
          if (isLinuxDesktop && userDevEntry?.status !== 'pending') continue;

          const newRec: AdminAllowedDeviceRecord = {
            deviceId: devId,
            deviceName: userDevEntry?.deviceName || userDevEntry?.deviceModel || modelLabel,
            deviceModel: userDevEntry?.deviceModel || userDevEntry?.deviceName || modelLabel,
            browser: userDevEntry?.browser || 'Android APK / Browser',
            os: userDevEntry?.os || 'Android',
            phone: cleanPhone,
            uid,
            username,
            status: 'pending',
            requestedAt: Number(userDevEntry?.requestedAt || uVal.lastLogin || uVal.updatedAt || now),
            lastUsedAt: Number(userDevEntry?.lastUsedAt || uVal.lastLogin || uVal.updatedAt || now)
          };
          allowedMap[devId] = newRec;
          writes.push(rtdbSet(rtdbRef(rtdb, `admin_security/allowed_devices/${devId}`), newRec).catch(() => {}));
        }

        // Also mirror into users/{uid}/devices/{devId} if missing so user.devices stays in sync
        const targetStatus = allowedMap[devId]?.status || userDevEntry?.status || 'pending';
        if (!userDevEntry || userDevEntry.status !== targetStatus) {
          const syncedUserDev = {
            deviceId: devId,
            deviceName: allowedMap[devId]?.deviceName || userDevEntry?.deviceName || modelLabel,
            deviceModel: allowedMap[devId]?.deviceModel || userDevEntry?.deviceModel || modelLabel,
            browser: allowedMap[devId]?.browser || userDevEntry?.browser || 'Android APK / Browser',
            os: allowedMap[devId]?.os || userDevEntry?.os || 'Android',
            osVersion: userDevEntry?.osVersion || allowedMap[devId]?.os || 'Android',
            registeredAt: Number(userDevEntry?.registeredAt || uVal.createdAt || now),
            requestedAt: Number(allowedMap[devId]?.requestedAt || userDevEntry?.requestedAt || now),
            lastUsedAt: Number(allowedMap[devId]?.lastUsedAt || userDevEntry?.lastUsedAt || now),
            status: targetStatus
          };
          writes.push(
            rtdbUpdate(rtdbRef(rtdb, `users/${uid}/devices/${devId}`), syncedUserDev).catch(() => {})
          );
        }
      }
    }

    // Also ensure any pending entry already in allowedMap with a uid/phone is mirrored to users/{uid}/devices/{devId}
    for (const dev of Object.values(allowedMap)) {
      if (!dev || !dev.deviceId) continue;
      let targetUid = dev.uid;
      if (!targetUid && dev.phone) {
        const cleanP = dev.phone.replace(/\D/g, '').slice(-10);
        const foundEntry = Object.entries(usersRaw).find(
          ([, u]: [string, any]) => u && String(u.phone || '').replace(/\D/g, '').slice(-10) === cleanP
        );
        if (foundEntry) targetUid = String((foundEntry[1] as any).uid || foundEntry[0]);
      }
      if (targetUid && usersRaw[targetUid]) {
        const existingUDev = usersRaw[targetUid]?.devices?.[dev.deviceId];
        if (!existingUDev || existingUDev.status !== dev.status) {
          writes.push(
            rtdbUpdate(rtdbRef(rtdb, `users/${targetUid}/devices/${dev.deviceId}`), {
              deviceId: dev.deviceId,
              deviceName: dev.deviceName || dev.deviceModel || 'Admin APK Device',
              deviceModel: dev.deviceModel || dev.deviceName || 'Admin APK Device',
              browser: dev.browser || 'Chrome',
              os: dev.os || 'Android',
              osVersion: dev.os || 'Android',
              registeredAt: existingUDev?.registeredAt || dev.requestedAt || now,
              requestedAt: dev.requestedAt || now,
              lastUsedAt: dev.lastUsedAt || now,
              status: dev.status
            }).catch(() => {})
          );
        }
      }
    }

    if (writes.length > 0) {
      await Promise.all(writes);
    }
    return allowedMap;
  } catch {
    return fetchAllowedAdminDevices();
  }
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
    if (params.uid) {
      await rtdbUpdate(rtdbRef(rtdb, `users/${params.uid}/devices/${deviceId}`), {
        deviceId,
        deviceName,
        deviceModel: clientDev.deviceModel || deviceName,
        browser: clientDev.browser || 'Browser',
        os: clientDev.os || 'Android',
        osVersion: clientDev.osVersion || clientDev.os || 'Android',
        lastUsedAt: Date.now(),
        status: 'approved'
      }).catch(() => {});
    }
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

  // Also write to users/{uid}/devices/{deviceId} so the pending request is immediately visible in all Device Approval lists
  if (params.uid) {
    const userDevicePayload = {
      ...clientDev,
      deviceId,
      deviceName,
      deviceModel: clientDev.deviceModel || deviceName,
      browser: clientDev.browser || 'Browser',
      os: clientDev.os || 'Android',
      osVersion: clientDev.osVersion || clientDev.os || 'Android',
      registeredAt: existing?.requestedAt || now,
      requestedAt: existing?.requestedAt || now,
      lastUsedAt: now,
      status: 'pending' as const
    };
    await rtdbUpdate(rtdbRef(rtdb, `users/${params.uid}`), {
      lastUsedDeviceId: deviceId,
      deviceName,
      deviceModel: clientDev.deviceModel || deviceName,
      [`devices/${deviceId}`]: userDevicePayload
    }).catch(() => {});

    const localU = store.getUser(params.uid);
    if (localU) {
      store.updateUserFromFirestore({
        ...localU,
        uid: params.uid,
        lastUsedDeviceId: deviceId,
        devices: {
          ...(localU.devices || {}),
          [deviceId]: userDevicePayload
        }
      });
    }
  }

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

  // Resolve target user by uid or phone so we also approve their user record & boundDeviceId
  let resolvedUid = device.uid || existing.uid || '';
  const resolvedPhone = (device.phone || existing.phone || '').replace(/\D/g, '').slice(-10);
  if (!resolvedUid && resolvedPhone) {
    const matchedU = store.findUserByPhone(resolvedPhone);
    if (matchedU) resolvedUid = matchedU.uid;
  }

  const payload: AdminAllowedDeviceRecord = {
    ...existing,
    ...device,
    uid: resolvedUid || device.uid || existing.uid,
    phone: resolvedPhone || device.phone || existing.phone,
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

  if (resolvedUid) {
    await rtdbUpdate(rtdbRef(rtdb, `users/${resolvedUid}`), {
      boundDeviceId: device.deviceId,
      lastUsedDeviceId: device.deviceId,
      [`devices/${device.deviceId}/deviceId`]: device.deviceId,
      [`devices/${device.deviceId}/deviceName`]: payload.deviceName,
      [`devices/${device.deviceId}/deviceModel`]: payload.deviceModel,
      [`devices/${device.deviceId}/browser`]: payload.browser,
      [`devices/${device.deviceId}/os`]: payload.os,
      [`devices/${device.deviceId}/status`]: 'approved',
      [`devices/${device.deviceId}/approvedAt`]: now,
      [`devices/${device.deviceId}/approvedBy`]: adminId,
      [`devices/${device.deviceId}/lastUsedAt`]: now
    }).catch(() => {});

    store.approveDevice(resolvedUid, device.deviceId, adminId);
  }

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
  const allDevices = await fetchAllowedAdminDevices();
  const existing = allDevices[deviceId];
  const now = Date.now();
  await rtdbUpdate(rtdbRef(rtdb, `admin_security/allowed_devices/${deviceId}`), {
    status: 'rejected',
    rejectedAt: now,
    rejectedBy: adminId,
    rejectionReason: reason || 'Not authorized for Admin Panel'
  });

  const targetUid =
    existing?.uid ||
    (existing?.phone ? store.findUserByPhone(existing.phone.replace(/\D/g, '').slice(-10))?.uid : undefined);
  if (targetUid) {
    await rtdbUpdate(rtdbRef(rtdb, `users/${targetUid}/devices/${deviceId}`), {
      status: 'rejected',
      rejectedAt: now,
      rejectedBy: adminId,
      rejectionReason: reason || 'Not authorized for Admin Panel'
    }).catch(() => {});
  }

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
