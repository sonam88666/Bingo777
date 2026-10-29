import React, { useState, useEffect } from 'react';
import {
  Save,
  DollarSign,
  ShieldCheck,
  Megaphone,
  Gift,
  Sliders,
  AlertTriangle,
  Clock,
  Wrench,
  CheckCircle2,
  Smartphone,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  Radio,
  Flame,
  ShieldAlert,
  Key,
  Lock,
  Eye,
  EyeOff,
  UserX
} from 'lucide-react';
import { AdminSettings, UpiChannel, AppPopupConfig, UserRecord } from '../../types';
import { store } from '../../services/store';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../common/Toast';
import {
  rtdb,
  rtdbRef,
  rtdbGet,
  rtdbSet,
  rtdbUpdate,
  rtdbOnValue,
  rtdbRemove
} from '../../firebase';

interface AdminSettingsProps {
  adminId: string;
}

export const AdminSettingsPanel: React.FC<AdminSettingsProps> = ({ adminId }) => {
  const { showToast } = useToast();
  const [formState, setFormState] = useState<AdminSettings>(store.getAdminSettings());
  const [, setTick] = useState(0);
  const [selectedCandidateUid, setSelectedCandidateUid] = useState<string>('');
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');

  // Multiple UPI Management Form State
  const [newUpiId, setNewUpiId] = useState('');
  const [newUpiMerchantName, setNewUpiMerchantName] = useState('');
  const [newUpiLabel, setNewUpiLabel] = useState('');
  const [newUpiSetAsActive, setNewUpiSetAsActive] = useState(false);

  // 📢 Live Admin Ads & App Update Popup System State (/admin_settings/app_popup)
  const [appPopup, setAppPopup] = useState<AppPopupConfig>({
    enabled: false,
    title: 'Special 100% Deposit Bonus!',
    message: 'Deposit now and get an instant 100% bonus added to your wallet! Limited time offer.',
    imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
    buttonText: 'Claim Bonus Now',
    actionUrl: 'deposit'
  });
  const [isSavingPopup, setIsSavingPopup] = useState(false);

  // 🔐 High-Security Admin Access & Device Lock State (/admin_security)
  const [allowedPhones, setAllowedPhones] = useState<Record<string, { phone: string; name?: string; addedAt?: number }>>({});
  const [allowedDevices, setAllowedDevices] = useState<Record<string, { deviceId: string; phone?: string; pairedAt?: number; status?: string; deviceName?: string }>>({});
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPhoneName, setNewAdminPhoneName] = useState('');
  const [masterAdminPassInput, setMasterAdminPassInput] = useState('Anchal@8877@@!');
  const [showAdminPass, setShowAdminPass] = useState(false);

  useEffect(() => {
    const unsubStore = store.subscribe(() => {
      setTick((t) => t + 1);
      const liveSettings = store.getAdminSettings();
      setFormState((prev) => {
        if (prev.maintenanceMode !== Boolean(liveSettings.maintenanceMode)) {
          return {
            ...prev,
            maintenanceMode: Boolean(liveSettings.maintenanceMode),
            maintenanceMessage: liveSettings.maintenanceMessage || prev.maintenanceMessage,
            maintenanceEstimatedResumeTime: liveSettings.maintenanceEstimatedResumeTime ?? prev.maintenanceEstimatedResumeTime
          };
        }
        return prev;
      });
    });

    let unsubPopup: (() => void) | null = null;
    let unsubPhones: (() => void) | null = null;
    let unsubDevices: (() => void) | null = null;

    try {
      unsubPopup = rtdbOnValue(rtdbRef(rtdb, 'admin_settings/app_popup'), (snap) => {
        if (snap.exists()) {
          const val = snap.val() as AppPopupConfig;
          if (val) setAppPopup(val);
        }
      });

      unsubPhones = rtdbOnValue(rtdbRef(rtdb, 'admin_security/allowed_phones'), (snap) => {
        if (snap.exists()) {
          setAllowedPhones(snap.val() || {});
        } else {
          // Initialize with default admin phone
          setAllowedPhones({
            '9876543210': { phone: '9876543210', name: 'Master Admin Default', addedAt: Date.now() }
          });
        }
      });

      unsubDevices = rtdbOnValue(rtdbRef(rtdb, 'admin_security/allowed_devices'), (snap) => {
        if (snap.exists()) {
          setAllowedDevices(snap.val() || {});
        }
      });
    } catch (e) {
      console.warn('RTDB admin subscriptions error:', e);
    }

    return () => {
      unsubStore();
      if (unsubPopup) unsubPopup();
      if (unsubPhones) unsubPhones();
      if (unsubDevices) unsubDevices();
    };
  }, []);

  const allUsers = Object.values(store.getUsers());
  const selectedAdmins = store.getAdminUsers();
  const maxAdmins = 5;
  const nonAdminCandidates = allUsers.filter((u) => {
    if (u.role === 'master_admin') return false;
    if (!adminSearchQuery.trim()) return true;
    const q = adminSearchQuery.trim().toLowerCase();
    return (
      u.uid.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  const handlePromoteAdmin = (uidToPromote: string) => {
    if (!uidToPromote) {
      showToast('Please select a user to make Admin', 'error');
      return;
    }
    const res = store.setUserAdminRole(
      uidToPromote,
      true,
      adminId,
      'Selected as Admin for Maintenance Mode bypass'
    );
    if (res.success && res.user) {
      showToast(
        `${res.user.username} (+91 ${res.user.phone}) is now Admin (${res.adminCount}/${maxAdmins}). Maintenance Mode bypassed for this user!`,
        'success'
      );
      setSelectedCandidateUid('');
    } else {
      showToast(res.error || 'Could not promote user to Admin', 'error');
    }
  };

  const handleRevokeAdmin = (uidToRevoke: string) => {
    const res = store.setUserAdminRole(
      uidToRevoke,
      false,
      adminId,
      'Removed from Admin Maintenance Mode bypass list'
    );
    if (res.success && res.user) {
      showToast(
        `Removed Admin role from ${res.user.username} (${res.adminCount}/${maxAdmins} Admins active)`,
        'info'
      );
    }
  };

  const upiChannels = formState.upiChannels && formState.upiChannels.length > 0
    ? formState.upiChannels
    : store.getUpiChannels();

  const activeChannelId = formState.activeUpiChannelId || upiChannels.find((c) => c.isActive)?.id || upiChannels[0]?.id;

  const handleSetActiveUpi = (channelId: string) => {
    store.setActiveUpiChannel(channelId, adminId);
    const updatedChannels = (formState.upiChannels || store.getUpiChannels()).map((ch) => ({
      ...ch,
      isActive: ch.id === channelId
    }));
    const target = updatedChannels.find((ch) => ch.id === channelId);
    if (target) {
      setFormState({
        ...formState,
        activeUpiChannelId: channelId,
        upiChannels: updatedChannels,
        officialUpiId: target.upiId,
        officialUpiName: target.merchantName,
        upiId: target.upiId,
        upiMerchantName: target.merchantName
      });
      showToast(`Deposit UPI set to "${target.merchantName}" (${target.upiId})! Ab yahi app me show hoga.`, 'success');
    }
  };

  const handleAddUpiChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpiId.trim() || !newUpiId.includes('@')) {
      showToast('Please enter a valid UPI ID with @ symbol (e.g. name@okhdfcbank)', 'error');
      return;
    }
    const added = store.addUpiChannel(
      {
        upiId: newUpiId.trim(),
        merchantName: newUpiMerchantName.trim() || 'OFFICIAL CASHIER',
        label: newUpiLabel.trim() || undefined,
        setAsActive: newUpiSetAsActive
      },
      adminId
    );

    const updatedChannels = store.getUpiChannels();
    setFormState({
      ...formState,
      upiChannels: updatedChannels,
      ...(newUpiSetAsActive
        ? {
            activeUpiChannelId: added.id,
            officialUpiId: added.upiId,
            officialUpiName: added.merchantName,
            upiId: added.upiId,
            upiMerchantName: added.merchantName
          }
        : {})
    });
    setNewUpiId('');
    setNewUpiMerchantName('');
    setNewUpiLabel('');
    setNewUpiSetAsActive(false);
    showToast(`Added UPI channel "${added.merchantName}" (${added.upiId}) successfully!`, 'success');
  };

  const handleDeleteUpiChannel = (channelId: string) => {
    if (upiChannels.length <= 1) {
      showToast('Cannot delete the only remaining UPI channel. Add another first.', 'error');
      return;
    }
    store.deleteUpiChannel(channelId, adminId);
    const updatedSettings = store.getAdminSettings();
    setFormState({
      ...formState,
      upiChannels: updatedSettings.upiChannels,
      activeUpiChannelId: updatedSettings.activeUpiChannelId,
      officialUpiId: updatedSettings.officialUpiId,
      officialUpiName: updatedSettings.officialUpiName
    });
    showToast('UPI channel removed.', 'info');
  };

  // 📢 Live Ads & App Update Popup broadcast handler
  const handleSaveAppPopup = async (customConfig?: Partial<AppPopupConfig>) => {
    setIsSavingPopup(true);
    try {
      const payload: AppPopupConfig = {
        ...appPopup,
        ...customConfig,
        updatedAt: Date.now(),
        updatedBy: adminId
      };
      setAppPopup(payload);
      await rtdbSet(rtdbRef(rtdb, 'admin_settings/app_popup'), payload);
      showToast(
        payload.enabled
          ? '📢 Live Ads & Update Popup turned ON! Broadcasted to all active user devices.'
          : 'Live Ads & Update Popup turned OFF.',
        'success'
      );
    } catch {
      showToast('Error syncing popup to Firebase RTDB', 'error');
    } finally {
      setIsSavingPopup(false);
    }
  };

  // 🔐 Security Handlers: Allowed Phone Numbers
  const handleAddAllowedPhone = async () => {
    const clean = newAdminPhone.trim().replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    const name = newAdminPhoneName.trim() || 'Admin Member';
    await rtdbSet(rtdbRef(rtdb, `admin_security/allowed_phones/${clean}`), {
      phone: clean,
      name,
      addedAt: Date.now()
    });
    setNewAdminPhone('');
    setNewAdminPhoneName('');
    showToast(`Added +91 ${clean} to Admin Allowed Numbers!`, 'success');
  };

  const handleRemoveAllowedPhone = async (phoneKey: string) => {
    if (Object.keys(allowedPhones).length <= 1) {
      showToast('Cannot remove the only allowed phone number.', 'error');
      return;
    }
    await rtdbRemove(rtdbRef(rtdb, `admin_security/allowed_phones/${phoneKey}`));
    showToast(`Removed +91 ${phoneKey} from Admin Allowed Numbers.`, 'info');
  };

  // 🔐 Security Handlers: Allowed Devices
  const handlePairCurrentDevice = async () => {
    const dev = store.getOrCreateClientDevice();
    await rtdbSet(rtdbRef(rtdb, `admin_security/allowed_devices/${dev.deviceId}`), {
      deviceId: dev.deviceId,
      deviceName: dev.deviceName || 'Admin Hardware Device',
      browser: dev.browser || 'Browser',
      os: dev.os || 'OS',
      pairedAt: Date.now(),
      pairedBy: adminId,
      status: 'approved'
    });
    showToast(`Approved & Locked Current Device (${dev.deviceId}) for Admin Login!`, 'success');
  };

  const handleRemoveAllowedDevice = async (devId: string) => {
    await rtdbRemove(rtdbRef(rtdb, `admin_security/allowed_devices/${devId}`));
    showToast(`Device ${devId} unlinked from Admin approval.`, 'info');
  };

  const handleSaveAdminPassword = async () => {
    if (!masterAdminPassInput.trim()) {
      showToast('Password cannot be empty', 'error');
      return;
    }
    await rtdbSet(rtdbRef(rtdb, 'admin_security/password'), masterAdminPassInput.trim());
    store.updateAdminSettings({ masterAdminPassword: masterAdminPassInput.trim() } as any, adminId);
    showToast('Master Admin Password updated in Firebase RTDB!', 'success');
  };

  const handleUnblockUser = async (u: UserRecord) => {
    store.setUserBlocked(u.uid, false, 'Unblocked by Master Admin', adminId);
    await rtdbSet(rtdbRef(rtdb, `users/${u.uid}/isBlocked`), false).catch(() => {});
    await rtdbSet(rtdbRef(rtdb, `users/${u.uid}/status`), 'active').catch(() => {});
    showToast(`Unblocked user ${u.username} (+91 ${u.phone}). Access restored.`, 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    store.updateAdminSettings(formState, adminId);
    await apiClient
      .updateSettings(formState as unknown as Record<string, unknown>, adminId)
      .catch(() => {});
    showToast('Master Admin settings saved & synchronized across the app!', 'success');
  };

  const handleQuickToggleMaintenance = async (nextState: boolean) => {
    const updated = { ...formState, maintenanceMode: nextState };
    setFormState(updated);
    store.updateAdminSettings(updated, adminId);
    await apiClient
      .toggleMaintenanceMode(
        nextState,
        updated.maintenanceMessage,
        updated.maintenanceEstimatedResumeTime,
        adminId
      )
      .catch(() => {});
    showToast(
      nextState
        ? '⚠️ Maintenance Mode Activated! Selected Admins (up to 5) can use app normally; all other users see Maintenance Mode.'
        : '✅ Maintenance Mode Deactivated! Normal betting resumed for everyone.',
      nextState ? 'info' : 'success'
    );
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* 1. MASTER ADMIN MAINTENANCE MODE & EMERGENCY BETTING FREEZE */}
      <div className={`p-5 rounded-3xl border-2 transition-all shadow-2xl ${
        formState.maintenanceMode
          ? 'bg-gradient-to-br from-rose-950/60 via-slate-900 to-amber-950/40 border-rose-500 shadow-rose-900/20'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner ${
              formState.maintenanceMode
                ? 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${formState.maintenanceMode ? 'animate-pulse text-rose-400' : ''}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-brand font-black text-base text-white">System Maintenance Mode</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  formState.maintenanceMode
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                }`}>
                  {formState.maintenanceMode ? '● ACTIVE — BETS PAUSED' : '● NORMAL OPERATION'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                When active, normal users see Maintenance Mode, while your selected Admins (Max 5) can use the app normally.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleQuickToggleMaintenance(!formState.maintenanceMode)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 shadow-md ${
                formState.maintenanceMode
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <span>{formState.maintenanceMode ? 'Turn Maintenance OFF' : 'Activate Maintenance Mode'}</span>
            </button>
          </div>
        </div>

        {/* Maintenance Configuration Controls */}
        <div className="mt-4 space-y-3.5">
          <div>
            <label className="text-slate-300 text-xs font-bold block mb-1">
              User App Overlay Message
            </label>
            <textarea
              rows={2}
              value={formState.maintenanceMessage || ''}
              placeholder="e.g. System Upgrade & Scheduled Maintenance in Progress. Betting is temporarily paused. Your funds are 100% safe."
              onChange={(e) => setFormState({ ...formState, maintenanceMessage: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
            />
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-500 font-semibold">Quick Presets:</span>
              <button
                type="button"
                onClick={() =>
                  setFormState({
                    ...formState,
                    maintenanceMessage:
                      'Scheduled system upgrade in progress to enhance gameplay & server speed. Betting is temporarily paused. All wallet balances are 100% safe.'
                  })
                }
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                Server Upgrade
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormState({
                    ...formState,
                    maintenanceMessage:
                      'Routine security check and database optimization. Game betting will resume shortly. Withdrawals and deposits remain verified.'
                  })
                }
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                Routine Audit
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormState({
                    ...formState,
                    maintenanceMessage:
                      'Emergency maintenance by Master Admin. Placing new bets is temporarily disabled. Our team is working to restore services quickly.'
                  })
                }
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                Emergency Maintenance
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Estimated Resumption Time (Optional)</span>
              </label>
              <input
                type="text"
                value={formState.maintenanceEstimatedResumeTime || ''}
                placeholder="e.g. 30 Minutes or 11:30 PM IST"
                onChange={(e) =>
                  setFormState({ ...formState, maintenanceEstimatedResumeTime: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Displayed to players in the maintenance overlay modal.</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-center text-[11px] space-y-1">
              <div className="font-bold text-slate-200 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Bypass & Real-Time Enforcement</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Selected Admin users (up to 5) bypass Maintenance Mode completely — app & games run 100% normally for them while all other users see Maintenance Mode.
              </p>
            </div>
          </div>

          {/* 5-ADMIN LIMIT SELECTOR FOR MAINTENANCE MODE BYPASS */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white">
                  Selected Admins — Maintenance Mode Bypass
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                  selectedAdmins.length >= maxAdmins
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                }`}
              >
                Admin Slots: {selectedAdmins.length} / {maxAdmins}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Jis user ko aap yahan Admin select karenge (Max 5 Admins), unke liye Maintenance Mode me bhi app bilkul normal chalega, aur baki sabhi users ko Maintenance Mode show hoga.
            </p>

            {/* Current Selected Admins List (Max 5) */}
            {selectedAdmins.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-[11px] text-slate-400">
                No users selected as Admin yet (0/{maxAdmins}). Select a user below or from the Users section.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedAdmins.map((adm, idx) => (
                  <div
                    key={adm.uid}
                    className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px]">
                          ADMIN #{idx + 1}
                        </span>
                        <span className="font-bold text-xs text-white truncate">{adm.username}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {adm.uid} · +91 {adm.phone}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeAdmin(adm.uid)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-[10px] transition shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add User to Admin Slots (when < 5) */}
            <div className="pt-1 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                placeholder="Filter by mobile number or name..."
                className="sm:w-48 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
              <select
                value={selectedCandidateUid}
                onChange={(e) => setSelectedCandidateUid(e.target.value)}
                disabled={selectedAdmins.length >= maxAdmins}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-50"
              >
                <option value="">
                  {selectedAdmins.length >= maxAdmins
                    ? '5/5 Admin Limit Reached — Remove an Admin first'
                    : `Select user to make Admin (${nonAdminCandidates.length} available)...`}
                </option>
                {nonAdminCandidates.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.username} (+91 {u.phone}) — {u.uid}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedCandidateUid || selectedAdmins.length >= maxAdmins}
                onClick={() => handlePromoteAdmin(selectedCandidateUid)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs transition shrink-0"
              >
                + Make Admin ({selectedAdmins.length}/{maxAdmins})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment & UPI Gateway */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">UPI Merchant & Deposit/Withdrawal Limits</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Multiple UPI Channels List */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Multiple UPI Channels ({upiChannels.length})</span>
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Jis UPI ID ko aap select karenge (Active), wahi exact UPI ID user app me deposit ke liye show hogi.
                  </p>
                </div>
              </div>

              {/* UPI Channels Cards */}
              <div className="space-y-2">
                {upiChannels.map((channel, idx) => {
                  const isActive = channel.id === activeChannelId || channel.isActive;
                  return (
                    <div
                      key={channel.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handleSetActiveUpi(channel.id)}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition ${
                              isActive
                                ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                                : 'border-slate-600 bg-slate-950 text-transparent hover:border-slate-400'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-current" />
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold text-[9px]">
                                {channel.label || `Channel ${idx + 1}`}
                              </span>
                              {isActive ? (
                                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-[9px] uppercase animate-pulse">
                                  ● SHOWN IN APP (ACTIVE)
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetActiveUpi(channel.id)}
                                  className="text-[9px] font-bold text-amber-400 hover:underline"
                                >
                                  Click to Show in App &rarr;
                                </button>
                              )}
                            </div>
                            <div className="font-mono font-black text-xs sm:text-sm text-slate-100 truncate mt-1">
                              {channel.upiId}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              Merchant: <strong className="text-slate-200">{channel.merchantName}</strong>
                            </div>
                          </div>
                        </div>

                        {upiChannels.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUpiChannel(channel.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 transition shrink-0"
                            title="Delete this UPI ID"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New UPI ID Inline Form */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <span className="text-[11px] font-black text-slate-200 block flex items-center space-x-1">
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Another UPI ID</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    placeholder="UPI ID (e.g. mobile@paytm or name@oksbi)"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <input
                    type="text"
                    value={newUpiMerchantName}
                    onChange={(e) => setNewUpiMerchantName(e.target.value)}
                    placeholder="Merchant Display Name"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center space-x-2 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUpiSetAsActive}
                      onChange={(e) => setNewUpiSetAsActive(e.target.checked)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0"
                    />
                    <span>Set as Active (App me abhi show karein)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddUpiChannel}
                    disabled={!newUpiId.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs transition flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add UPI ID</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Min UPI Deposit (₹)</label>
                <input
                  type="number"
                  value={formState.minDeposit}
                  onChange={(e) => setFormState({ ...formState, minDeposit: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Max UPI Deposit (₹)</label>
                <input
                  type="number"
                  value={formState.maxDeposit}
                  onChange={(e) => setFormState({ ...formState, maxDeposit: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Min UPI Withdrawal (₹)</label>
                <input
                  type="number"
                  value={formState.minWithdrawal}
                  onChange={(e) => setFormState({ ...formState, minWithdrawal: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-amber-300"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Max Withdrawal (₹)</label>
                <input
                  type="number"
                  value={formState.maxWithdrawal}
                  onChange={(e) => setFormState({ ...formState, maxWithdrawal: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-100"
                />
              </div>
            </div>

            {/* USDT (ERC20) Gateway & Minimum Limits */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-teal-500/40 space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-teal-300 uppercase tracking-wider">
                  USDT (ERC20) Deposit & Withdrawal Gateway
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">
                  ERC20 Network
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Official USDT (ERC20) Receiver Wallet Address
                </label>
                <input
                  type="text"
                  value={formState.usdtErc20Address || '0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45'}
                  onChange={(e) =>
                    setFormState({ ...formState, usdtErc20Address: e.target.value.trim() })
                  }
                  className="w-full bg-slate-950 border border-teal-500/40 rounded-xl px-3.5 py-2 font-mono font-bold text-teal-300 text-xs focus:outline-none focus:border-teal-400"
                  placeholder="0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Min Deposit ($)</label>
                  <input
                    type="number"
                    min={1}
                    value={formState.minUsdtDeposit ?? 5}
                    onChange={(e) =>
                      setFormState({ ...formState, minUsdtDeposit: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-teal-300"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Min Withdraw ($)</label>
                  <input
                    type="number"
                    min={1}
                    value={formState.minUsdtWithdrawal ?? 10}
                    onChange={(e) =>
                      setFormState({ ...formState, minUsdtWithdrawal: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-teal-300"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">1 USDT = ₹ INR</label>
                  <input
                    type="number"
                    min={1}
                    value={formState.usdtExchangeRate ?? 90}
                    onChange={(e) =>
                      setFormState({ ...formState, usdtExchangeRate: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-amber-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Engine & Multipliers */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">Game Engine & Payout Multipliers</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="font-bold text-slate-100">Zero Platform Loss Engine</div>
                <div className="text-[11px] text-slate-400">
                  Protects platform house margin automatically on high exposure rounds
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormState({ ...formState, zeroPlatformLossMode: !formState.zeroPlatformLossMode })
                }
                className={`w-12 h-7 rounded-full p-1 flex items-center transition ${
                  formState.zeroPlatformLossMode ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow block" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Green (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formState.colorGreenMultiplier}
                  onChange={(e) =>
                    setFormState({ ...formState, colorGreenMultiplier: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Red (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formState.colorRedMultiplier}
                  onChange={(e) =>
                    setFormState({ ...formState, colorRedMultiplier: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Violet (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formState.colorVioletMultiplier}
                  onChange={(e) =>
                    setFormState({ ...formState, colorVioletMultiplier: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Number (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formState.numberMultiplier}
                  onChange={(e) =>
                    setFormState({ ...formState, numberMultiplier: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Big/Small (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formState.sizeMultiplier}
                  onChange={(e) =>
                    setFormState({ ...formState, sizeMultiplier: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Fee (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formState.payoutFeePercent}
                  onChange={(e) =>
                    setFormState({ ...formState, payoutFeePercent: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bonus & Referral Parameters */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Gift className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">Signup, First Deposit & Referral Bonuses</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Signup Bonus (₹)</label>
              <input
                type="number"
                value={formState.signupBonusAmount}
                onChange={(e) =>
                  setFormState({ ...formState, signupBonusAmount: Number(e.target.value) })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">1st Deposit Bonus (%)</label>
              <input
                type="number"
                value={formState.firstDepositBonusPercent}
                onChange={(e) =>
                  setFormState({ ...formState, firstDepositBonusPercent: Number(e.target.value) })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Referral Bonus (₹)</label>
              <input
                type="number"
                value={formState.referralBonusAmount}
                onChange={(e) =>
                  setFormState({ ...formState, referralBonusAmount: Number(e.target.value) })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Qualifying Days</label>
              <input
                type="number"
                value={formState.referralRequiredDays}
                onChange={(e) =>
                  setFormState({ ...formState, referralRequiredDays: Number(e.target.value) })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Security & System Controls */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-100">Security & Operational Controls</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="font-bold text-slate-100">Require Device Approval</div>
                <div className="text-[11px] text-slate-400">
                  Hold new unrecognized devices for Master Admin approval
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormState({ ...formState, requireDeviceApproval: !formState.requireDeviceApproval })
                }
                className={`w-12 h-7 rounded-full p-1 flex items-center transition ${
                  formState.requireDeviceApproval ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow block" />
              </button>
            </div>

            <div>
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5 mb-1">
                <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                <span>App Marquee Announcement</span>
              </label>
              <textarea
                rows={2}
                value={formState.announcementText}
                onChange={(e) => setFormState({ ...formState, announcementText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Official Telegram Support Handle
              </label>
              <input
                type="text"
                value={formState.supportTelegram || '@colourWinAdmin'}
                onChange={(e) => setFormState({ ...formState, supportTelegram: e.target.value })}
                placeholder="@colourWinAdmin"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-sky-400 focus:outline-none focus:border-sky-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Official Telegram channel for user customer support</span>
            </div>
          </div>
        </div>

        {/* 4. ANDROID APK & APP UPDATE MANAGEMENT */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm text-slate-100">Android APK & App Update Management</h3>
                <p className="text-[10px] text-slate-400">Download Android APK & Update pura yahan se manage karein</p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
              formState.apkDownloadEnabled !== false
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}>
              {formState.apkDownloadEnabled !== false ? '● APK ACTIVE' : '● APK PAUSED'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* APK Download Enable Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="font-bold text-slate-100">Allow Android APK Download</div>
                <div className="text-[11px] text-slate-400">
                  Enable or disable APK file downloads for website and mobile users
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormState({ ...formState, apkDownloadEnabled: formState.apkDownloadEnabled === false ? true : false })
                }
                className={`w-12 h-7 rounded-full p-1 flex items-center transition ${
                  formState.apkDownloadEnabled !== false ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow block" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  App Download Direct Link (URL) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formState.apkDownloadUrl || ''}
                    onChange={(e) => setFormState({ ...formState, apkDownloadUrl: e.target.value.trim() })}
                    placeholder="https://drive.google.com/... ya https://github.com/.../app-debug.apk"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-sky-400 focus:outline-none focus:border-sky-500"
                  />
                  {formState.apkDownloadUrl && formState.apkDownloadUrl.startsWith('http') && (
                    <a
                      href={formState.apkDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-xl font-bold text-xs flex items-center space-x-1 shrink-0 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test Link</span>
                    </a>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Aap yahan apni APK ka direct link (Google Drive, GitHub Release, MediaFire, etc.) paste karein. User download button dabane par sidhe is link se app download kar sakega.
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  App Version Name
                </label>
                <input
                  type="text"
                  value={formState.apkVersionName || 'v2.6.0 Pro'}
                  onChange={(e) => setFormState({ ...formState, apkVersionName: e.target.value })}
                  placeholder="e.g. v2.6.0 Pro"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Update Release Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={formState.apkReleaseNotes || 'Includes 3D Dragon Tiger, Ludo 1v1 Live, Aviator & All Casino Games'}
                  onChange={(e) => setFormState({ ...formState, apkReleaseNotes: e.target.value })}
                  placeholder="Naye features aur update details likhein..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. 📢 LIVE ADMIN ADS & APP UPDATE POPUP SYSTEM (/admin_settings/app_popup) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 shadow-2xl space-y-4 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>Live Ads & App Update Popup System</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400">
                    /admin_settings/app_popup
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Broadcast promotions, bonus offers, or app updates directly to all active players in real time
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                appPopup.enabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {appPopup.enabled ? '● POPUP LIVE ON APP' : '● POPUP OFF'}
              </span>
              <button
                type="button"
                onClick={() => handleSaveAppPopup({ enabled: !appPopup.enabled })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  appPopup.enabled
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
                }`}
              >
                {appPopup.enabled ? 'Turn OFF' : 'Turn ON Live'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Announcement / Offer Title *
                </label>
                <input
                  type="text"
                  value={appPopup.title}
                  onChange={(e) => setAppPopup({ ...appPopup, title: e.target.value })}
                  placeholder="e.g. Mega Welcome Bonus 100%!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Message Description *
                </label>
                <textarea
                  rows={3}
                  value={appPopup.message}
                  onChange={(e) => setAppPopup({ ...appPopup, message: e.target.value })}
                  placeholder="Offer details, update notes, promo code, etc."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Banner / Offer Image URL
                </label>
                <input
                  type="url"
                  value={appPopup.imageUrl || ''}
                  onChange={(e) => setAppPopup({ ...appPopup, imageUrl: e.target.value.trim() })}
                  placeholder="https://... (PNG/JPG image link)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-sky-400 font-mono focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={appPopup.buttonText}
                    onChange={(e) => setAppPopup({ ...appPopup, buttonText: e.target.value })}
                    placeholder="Claim Now / Update App"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Action / Update Link
                  </label>
                  <input
                    type="text"
                    value={appPopup.actionUrl || ''}
                    onChange={(e) => setAppPopup({ ...appPopup, actionUrl: e.target.value.trim() })}
                    placeholder="deposit / https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-sky-400 font-mono focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Quick Template Fill Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAppPopup({
                      ...appPopup,
                      title: `New App Update Available (${formState.apkVersionName || 'v2.6.0'})`,
                      message: formState.apkReleaseNotes || 'A new update is available with enhanced graphics, fast payouts and bug fixes. Download and update now!',
                      buttonText: 'Update App Now',
                      actionUrl: formState.apkDownloadUrl || '',
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-bold text-[10px] transition flex items-center gap-1"
                >
                  <span>⚡ Use APK Link (App Update Template)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAppPopup({
                      ...appPopup,
                      title: `Special ₹${formState.signupBonusAmount || 100} Bonus Offer!`,
                      message: 'Deposit now and unlock mega rewards, VIP cashback, and instant withdrawals on all games.',
                      buttonText: 'Deposit & Play',
                      actionUrl: 'deposit',
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-[10px] transition flex items-center gap-1"
                >
                  <span>🎁 Bonus Promo Template</span>
                </button>
              </div>

              <button
                type="button"
                disabled={isSavingPopup}
                onClick={() => handleSaveAppPopup()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 active:scale-[0.99] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
              >
                <Flame className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>{isSavingPopup ? 'Broadcasting...' : '📢 Save & Broadcast Live to All Users'}</span>
              </button>
            </div>

            {/* Live Visual Preview */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Live Player Popup Preview
              </span>

              <div className="w-full max-w-xs rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-400/60 p-4 shadow-xl text-center space-y-2.5 overflow-hidden">
                {appPopup.imageUrl && (
                  <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                    <img
                      src={appPopup.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                    />
                  </div>
                )}
                <h4 className="font-black text-white text-sm">{appPopup.title || 'Special Notice'}</h4>
                <p className="text-[11px] text-slate-300 line-clamp-2">{appPopup.message || 'Announcement description here...'}</p>
                <button
                  type="button"
                  className="w-full py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs"
                >
                  {appPopup.buttonText || 'Claim Now'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 6. 🔐 HIGH-SECURITY ADMIN ACCESS & DEVICE LOCK SYSTEM (/admin_security) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-rose-500/40 shadow-2xl space-y-5 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>High-Security Admin Login & Device Lock</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-rose-400">
                    /admin_security
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Strict 3-Tier Security: Mobile Number + Approved Device ID + Admin Password with Instant Auto-Block
                </p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase">
              🛡️ AUTO-BLOCK INTRUDERS ACTIVE
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
            {/* 1. Allowed Mobile Numbers */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>1. Allowed Admin Mobile Numbers</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Object.keys(allowedPhones).length} Registered
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Only users registered with these phone numbers can attempt Admin Login. All other numbers will be instantly blocked!
              </p>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {Object.entries(allowedPhones).map(([phoneKey, data]: [string, any]) => (
                  <div
                    key={phoneKey}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-black text-amber-300">+91 {phoneKey}</div>
                      <div className="text-[10px] text-slate-400">{data?.name || 'Administrator'}</div>
                    </div>
                    {Object.keys(allowedPhones).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAllowedPhone(phoneKey)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="Remove allowed number"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Allowed Phone Form */}
              <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                <input
                  type="text"
                  maxLength={10}
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit Phone"
                  className="w-32 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  value={newAdminPhoneName}
                  onChange={(e) => setNewAdminPhoneName(e.target.value)}
                  placeholder="Admin Name / Role"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleAddAllowedPhone}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* 2. Approved Admin Hardware Devices */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>2. Approved Admin Hardware Devices</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Object.keys(allowedDevices).length} Devices
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Admin Panel is hardware-locked to approved device IDs. Any unapproved device attempting login is auto-blocked.
              </p>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {Object.keys(allowedDevices).length === 0 ? (
                  <div className="text-center py-4 text-slate-500 italic text-[11px]">
                    No hardware devices locked yet. Click below to pair your current device.
                  </div>
                ) : (
                  Object.entries(allowedDevices).map(([devId, data]: [string, any]) => (
                    <div
                      key={devId}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[11px] font-bold text-emerald-400 truncate" title={devId}>
                          {devId}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {data?.deviceName || 'Device'} • {data?.browser || 'Browser'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllowedDevice(devId)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition shrink-0 ml-2"
                        title="Unlink device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={handlePairCurrentDevice}
                className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pair & Approve My Current Device Now</span>
              </button>
            </div>

            {/* 3. Master Admin Password Configuration */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Key className="w-4 h-4 text-amber-400" />
                <span>3. Master Admin Secret Password</span>
              </div>
              <p className="text-[11px] text-slate-400">
                This password is required at Tier 3 of the Admin Gate. Default: <code className="text-amber-400">Anchal@8877@@!</code>
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={masterAdminPassInput}
                    onChange={(e) => setMasterAdminPassInput(e.target.value)}
                    placeholder="Master Admin Password"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveAdminPassword}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition"
                >
                  Update
                </button>
              </div>
            </div>

            {/* 4. Blocked Intruders Manager */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <UserX className="w-4 h-4 text-rose-400" />
                  <span>4. Blocked Intruders & Accounts</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {allUsers.filter((u) => u.isBlocked || u.status === 'blocked').length} Blocked
                </span>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {allUsers.filter((u) => u.isBlocked || u.status === 'blocked').length === 0 ? (
                  <div className="text-center py-4 text-slate-500 italic text-[11px]">
                    No users currently blocked. Intruders will be isolated here automatically.
                  </div>
                ) : (
                  allUsers
                    .filter((u) => u.isBlocked || u.status === 'blocked')
                    .map((blockedUser) => (
                      <div
                        key={blockedUser.uid}
                        className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-rose-200">
                            {blockedUser.username} (+91 {blockedUser.phone})
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {blockedUser.blockedReason || 'Security auto-block'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnblockUser(blockedUser)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 font-bold text-[10px] transition shrink-0 ml-2"
                        >
                          Unblock
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition active:scale-[0.99]"
      >
        <Save className="w-4 h-4" />
        <span>Save All Admin Settings</span>
      </button>
    </form>
  );
};
