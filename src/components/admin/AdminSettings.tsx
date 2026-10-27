import React, { useState } from 'react';
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
  Radio
} from 'lucide-react';
import { AdminSettings, UpiChannel } from '../../types';
import { store } from '../../services/store';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../common/Toast';

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

  React.useEffect(() => {
    return store.subscribe(() => {
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
