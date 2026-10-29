import React, { useState } from 'react';
import {
  User,
  Search,
  MoreVertical,
  Plus,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Coins,
  FileSpreadsheet,
  ShieldCheck,
  Gift,
  Clock,
  Settings,
  ChevronRight,
  Ban,
  Edit3,
  ArrowLeft,
  Trash2,
  RotateCcw,
  RefreshCw,
  Key,
  Copy
} from 'lucide-react';
import { UserRecord } from '../../types';
import { store } from '../../services/store';
import { apiClient } from '../../services/apiClient';
import { firebaseSync } from '../../services/firebaseSync';
import { useToast } from '../common/Toast';

interface AdminUsersProps {
  adminId: string;
  masterToken?: string;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ adminId, masterToken }) => {
  const { showToast } = useToast();
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    return store.subscribe(() => setTick((t) => t + 1));
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'admins' | 'banned'>('all');
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);

  const handleForceFirebaseSync = async () => {
    setIsSyncingFirebase(true);
    try {
      const res = await firebaseSync.forceSyncFromFirebase();
      if (res.success) {
        showToast(`Firebase Synced! Total Users: ${Object.keys(store.getUsers()).length}`, 'success');
      } else {
        showToast(res.message || 'Firebase Sync error', 'error');
      }
    } catch {
      showToast('Firebase Sync failed', 'error');
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  // Dedicated User Details Sub-Screen State
  const [selectedUserUid, setSelectedUserUid] = useState<string | null>(null);
  const [activeDrillDown, setActiveDrillDown] = useState<'none' | 'transactions' | 'bets' | 'bonus' | 'login' | 'settings'>('none');

  // Balance Add / Deduct Modal
  const [balanceModalMode, setBalanceModalMode] = useState<'credit' | 'debit' | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Add Manual User Modal
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newBalance, setNewBalance] = useState<number>(0);
  const [newVip, setNewVip] = useState<number>(1);

  // Edit User Modal
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editReferralCode, setEditReferralCode] = useState('');
  const [editVip, setEditVip] = useState<number>(1);
  const [editStatus, setEditStatus] = useState<UserRecord['status']>('active');
  const [editReason, setEditReason] = useState('');

  // Quick Inline Password Reset State
  const [quickNewPassword, setQuickNewPassword] = useState('');

  // Ban / Unban Confirmation Modal
  const [showBanModal, setShowBanModal] = useState<boolean>(false);
  const [banReason, setBanReason] = useState('');

  // Hard Delete Confirmation Modal State
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserRecord | null>(null);
  const [isHardDeleting, setIsHardDeleting] = useState<boolean>(false);
  const [localDeletedUids, setLocalDeletedUids] = useState<Set<string>>(new Set());

  const copyText = (value: string, label: string) => {
    try {
      navigator.clipboard.writeText(value);
      showToast(`Copied ${label}: ${value}`, 'success');
    } catch {
      showToast(`${label}: ${value}`, 'info');
    }
  };

  const usersMap = store.getUsers();
  const users = Object.values(usersMap).filter((u) => !localDeletedUids.has(u.uid));
  const deletedBackups = Object.values(store.getDeletedUsersBackup());
  const tokenToUse = masterToken || sessionStorage.getItem('bingo777_master_admin_token') || 'BINGO_MASTER_2026_KEY';

  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const bannedOrRestrictedCount = users.filter((u) => u.status !== 'active').length;
  const adminUsersList = store.getAdminUsers();
  const maxAdminSlots = 5;

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      searchTerm === '' ||
      u.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);
    if (!matchSearch) return false;
    if (filterTab === 'active') return u.status === 'active';
    if (filterTab === 'admins') return u.role === 'master_admin';
    if (filterTab === 'banned') return u.status !== 'active';
    return true;
  });

  const selectedUser = selectedUserUid ? usersMap[selectedUserUid] || null : null;

  const handleCreateManualUser = (e: React.FormEvent) => {
    e.preventDefault();
    const res = store.createManualUser(
      {
        username: newUsername,
        phone: newPhone,
        password: newPassword.trim() || '123456',
        vipLevel: newVip,
        initialBalance: newBalance,
        reason: 'Created via + Add Manual User in Admin Console'
      },
      adminId
    );
    if (res.success && res.user) {
      showToast(`Created user ${res.user.username} (${res.user.uid}) | Password: ${res.user.passwordHash}`, 'success');
      setShowAddUserModal(false);
      setNewUsername('');
      setNewPhone('');
      setNewPassword('123456');
      setNewBalance(0);
      setNewVip(1);
    } else {
      showToast(res.error || 'Failed to create user', 'error');
    }
  };

  const handleExecuteBalanceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !balanceModalMode) return;
    if (adjustAmount <= 0) {
      showToast('Amount must be positive', 'error');
      return;
    }
    if (!adjustReason.trim()) {
      showToast('Mandatory audit reason is required', 'error');
      return;
    }

    const delta = balanceModalMode === 'credit' ? adjustAmount : -adjustAmount;
    const ok = store.adjustUserBalance(selectedUser.uid, delta, adjustReason.trim(), adminId);
    if (ok) {
      await apiClient.adjustBalance(selectedUser.uid, delta, adjustReason.trim(), adminId, tokenToUse).catch(() => {});
      showToast(
        `${balanceModalMode === 'credit' ? 'Added' : 'Deducted'} ₹${adjustAmount} for ${selectedUser.uid}`,
        'success'
      );
      setBalanceModalMode(null);
      setAdjustReason('');
    } else {
      showToast('Cannot deduct more than available wallet balance', 'error');
    }
  };

  const openEditUserModal = (u: UserRecord) => {
    setEditUsername(u.username);
    setEditPhone(u.phone);
    setEditPassword(u.passwordHash || '');
    setEditReferralCode(u.referralCode || '');
    setEditVip(u.vipLevel);
    setEditStatus(u.status);
    setEditReason('Updated profile & credentials via Edit User');
    setShowEditModal(true);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const res = store.updateUserProfile(
      selectedUser.uid,
      {
        username: editUsername,
        phone: editPhone,
        password: editPassword.trim() || undefined,
        referralCode: editReferralCode.trim() || undefined,
        vipLevel: editVip,
        status: editStatus,
        reason: editReason || 'Admin profile edit'
      },
      adminId
    );
    if (res.success) {
      await apiClient.updateUserStatus(selectedUser.uid, editStatus, editReason || 'Admin edit', adminId, tokenToUse).catch(() => {});
      showToast(`Updated profile & password for ${selectedUser.uid}`, 'success');
      setShowEditModal(false);
    } else {
      showToast(res.error || 'Failed to update user', 'error');
    }
  };

  const handleConfirmBanToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const nextStatus = selectedUser.status === 'active' ? 'banned' : 'active';
    const reason = banReason.trim() || (nextStatus === 'banned' ? 'Account banned by Master Admin' : 'Account unbanned by Master Admin');

    const ok = store.toggleUserStatus(selectedUser.uid, nextStatus, reason, adminId);
    if (ok) {
      await apiClient.updateUserStatus(selectedUser.uid, nextStatus, reason, adminId, tokenToUse).catch(() => {});
      showToast(
        `User ${selectedUser.uid} is now ${nextStatus.toUpperCase()}`,
        nextStatus === 'active' ? 'success' : 'info'
      );
      setShowBanModal(false);
      setBanReason('');
    }
  };

  const handleCompleteUserDelete = async (targetUser: UserRecord) => {
    if (!targetUser || !targetUser.uid) return;
    setIsHardDeleting(true);

    const uid = targetUser.uid;
    const phone = targetUser.phone;
    const username = targetUser.username;

    // 1. Frontend UI State Cleanup (Immediately filter out targetUser so UI updates without page refresh)
    setLocalDeletedUids((prev) => new Set([...prev, uid]));
    if (selectedUserUid === uid) {
      setSelectedUserUid(null);
    }
    setConfirmDeleteUser(null);

    try {
      // 2. Local Authoritative Store Purge & Blacklist
      store.hardDeleteUser(uid, adminId, 'Permanently deleted by Master Admin');

      // 3. Backend Admin SDK Deletion (Calls firebase-admin auth().deleteUser & server cleanup)
      await apiClient.hardDeleteUser(uid, adminId, tokenToUse, phone).catch((err) => {
        console.warn('Backend hard-delete error:', err);
      });

      // 4. Client-side Realtime Database & Firestore multi-path purge
      await firebaseSync.hardDeleteUserFromFirebase(uid, phone).catch((err) => {
        console.warn('FirebaseSync purge error:', err);
      });

      showToast(`User ${username} (${uid}) permanently deleted and wiped from all databases and Auth.`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error occurred during complete user deletion', 'error');
    } finally {
      setIsHardDeleting(false);
    }
  };

  const handleSafeDeleteUser = (u: UserRecord) => {
    setConfirmDeleteUser(u);
  };

  // ============================================================================
  // DEDICATED SUB-SCREEN: USER DETAILS (Matches Reference Image Screen #4)
  // ============================================================================
  if (selectedUser) {
    const userDeposits = store.getDeposits().filter((d) => d.uid === selectedUser.uid && d.status === 'approved');
    const userWithdrawals = store.getWithdrawals().filter((w) => w.uid === selectedUser.uid && w.status === 'approved');
    const totalUserDeposits = userDeposits.reduce((s, d) => s + d.amount, 0);
    const totalUserWithdrawals = userWithdrawals.reduce((s, w) => s + w.amount, 0);
    const userTransactions = store.getTransactions(selectedUser.uid);
    const userBets = store.getLiveBets().filter((b) => b.uid === selectedUser.uid);
    const userReferrals = store.getReferrals().filter(
      (r) => r.referrerUid === selectedUser.uid || r.referredUid === selectedUser.uid
    );
    const devicesList = Object.values(selectedUser.devices || {});

    return (
      <div className="space-y-4">
        {/* Sub-screen Back Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setSelectedUserUid(null);
              setActiveDrillDown('none');
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs flex items-center space-x-1.5 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to User Management</span>
          </button>
          <span className="font-mono text-xs text-slate-500">UID: {selectedUser.uid}</span>
        </div>

        {/* 1. Top User Identity Card + Login Credentials & Password Management */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-black text-slate-900 text-base sm:text-lg truncate">
                    {selectedUser.uid}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      selectedUser.status === 'active'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {selectedUser.status === 'active' ? 'Active' : selectedUser.status.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800">
                    VIP {selectedUser.vipLevel}
                  </span>
                  {selectedUser.role === 'master_admin' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950 shadow-sm">
                      ★ ADMIN (Maintenance Bypass)
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-700 font-semibold mt-0.5">
                  {selectedUser.username} · +91 {selectedUser.phone}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Joined: {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openEditUserModal(selectedUser)}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Full Edit</span>
            </button>
          </div>

          {/* User Login Credentials (Phone, UID, Password View & Instant Password Reset) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Mobile Number</span>
                  <span className="font-mono font-black text-slate-900 text-xs">+91 {selectedUser.phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(selectedUser.phone, 'Mobile Number')}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                  title="Copy Phone"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-700 flex items-center space-x-1">
                    <Key className="w-3 h-3" />
                    <span>Login Password</span>
                  </span>
                  <span className="font-mono font-black text-slate-950 text-sm">
                    {selectedUser.passwordHash || 'Not Set'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(selectedUser.passwordHash || '', 'Password')}
                  className="p-1.5 rounded-lg bg-amber-200/70 hover:bg-amber-300 text-amber-900"
                  title="Copy Password"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Referral Code</span>
                  <span className="font-mono font-black text-blue-700 text-xs">{selectedUser.referralCode || 'N/A'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(selectedUser.referralCode || '', 'Referral Code')}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                  title="Copy Referral Code"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Instant Password Change Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Enter new password to change..."
                value={quickNewPassword}
                onChange={(e) => setQuickNewPassword(e.target.value)}
                className="flex-1 min-w-[160px] bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => {
                  if (!quickNewPassword.trim()) {
                    showToast('Please enter a new password first', 'error');
                    return;
                  }
                  const res = store.updateUserProfile(
                    selectedUser.uid,
                    {
                      password: quickNewPassword.trim(),
                      reason: 'Password updated by Admin'
                    },
                    adminId
                  );
                  if (res.success) {
                    showToast(`Password updated to "${quickNewPassword.trim()}" for ${selectedUser.username}!`, 'success');
                    setQuickNewPassword('');
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center space-x-1.5 shadow-sm transition shrink-0"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Update Password</span>
              </button>
            </div>

            {/* Quick Account Status & VIP Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-slate-600 text-[11px] mr-1">Account Status:</span>
                {(['active', 'suspended', 'banned', 'deactivated'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={async () => {
                      const ok = store.toggleUserStatus(selectedUser.uid, st, `Status set to ${st} by Admin`, adminId);
                      if (ok) {
                        await apiClient.updateUserStatus(selectedUser.uid, st, `Status set to ${st}`, adminId, tokenToUse).catch(() => {});
                        showToast(`User status updated to ${st.toUpperCase()}`, st === 'active' ? 'success' : 'info');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase transition ${
                      selectedUser.status === st
                        ? st === 'active'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600 text-[11px]">VIP:</span>
                <select
                  value={selectedUser.vipLevel}
                  onChange={(e) => {
                    const nextVip = Number(e.target.value);
                    store.updateUserProfile(
                      selectedUser.uid,
                      { vipLevel: nextVip, reason: `VIP changed to ${nextVip} by Admin` },
                      adminId
                    );
                    showToast(`Updated ${selectedUser.username} to VIP ${nextVip}`, 'success');
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                    <option key={v} value={v}>VIP {v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 1B. Admin Selection (Max 5 Limit) & 1 Number = 1 Device Control Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Admin Access & Maintenance Bypass ({adminUsersList.length}/{maxAdminSlots} Admins)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Selected Admin users can use the app normally even when Maintenance Mode is ON.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextAdminState = selectedUser.role !== 'master_admin';
                const res = store.setUserAdminRole(
                  selectedUser.uid,
                  nextAdminState,
                  adminId,
                  nextAdminState ? 'Promoted to Admin via User Management' : 'Removed from Admin via User Management'
                );
                if (res.success) {
                  showToast(
                    nextAdminState
                      ? `✅ ${selectedUser.username} is now Admin (${res.adminCount}/${maxAdminSlots})! Maintenance Mode bypassed.`
                      : `Removed Admin role from ${selectedUser.username} (${res.adminCount}/${maxAdminSlots})`,
                    nextAdminState ? 'success' : 'info'
                  );
                } else {
                  showToast(res.error || 'Could not update Admin status', 'error');
                }
              }}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm transition shrink-0 ${
                selectedUser.role === 'master_admin'
                  ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              }`}
            >
              {selectedUser.role === 'master_admin'
                ? 'Remove Admin Role'
                : `+ Select as Admin (${adminUsersList.length}/${maxAdminSlots})`}
            </button>
          </div>

          {/* 1 Number = 1 Device Status & Pending Device Approval */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <div className="font-bold text-slate-800">
                1 Number = 1 Device Policy ({devicesList.filter((d) => d.status === 'approved').length}/1 Active Device)
              </div>
              <div className="text-[11px] text-slate-500">
                {devicesList.some((d) => d.status === 'pending')
                  ? `⚠️ ${devicesList.filter((d) => d.status === 'pending').length} new device(s) waiting for your approval!`
                  : 'Multiple device login is blocked without your approval.'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {devicesList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    store.resetUserDeviceLock(selectedUser.uid, adminId);
                    showToast(`Reset 1-Device lock for ${selectedUser.username}. Next login will bind new device.`, 'success');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition"
                >
                  Reset Device Lock
                </button>
              )}
            </div>
          </div>

          {devicesList.filter((d) => d.status === 'pending').map((pendingDev) => (
            <div
              key={pendingDev.deviceId}
              className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="font-bold text-amber-900">
                  Pending 2nd Device Request: {pendingDev.deviceName || pendingDev.deviceModel}
                </div>
                <div className="text-[11px] text-amber-700 font-mono">
                  ID: {pendingDev.deviceId} · {pendingDev.os} · {pendingDev.browser}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    store.approveDevice(selectedUser.uid, pendingDev.deviceId, adminId);
                    showToast(`Approved device ${pendingDev.deviceId} and revoked old device (1 Number = 1 Device)!`, 'success');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                >
                  Approve (Replace Old Device)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    store.rejectDevice(selectedUser.uid, pendingDev.deviceId, adminId, 'Rejected by Admin (1 Number = 1 Device policy)');
                    showToast(`Rejected device ${pendingDev.deviceId}`, 'info');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px]"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Wallet Balance Card with Green "Add" & Red "Deduct" Buttons */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Wallet Balance</div>
              <div className="font-mono font-black text-xl sm:text-2xl text-slate-900 tabular-nums">
                ₹{selectedUser.balance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setBalanceModalMode('credit');
                setAdjustAmount(500);
                setAdjustReason('');
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition active:scale-95"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setBalanceModalMode('debit');
                setAdjustAmount(100);
                setAdjustReason('');
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition active:scale-95"
            >
              Deduct
            </button>
          </div>
        </div>

        {/* 3. 2x2 Summary Metrics Grid matching Reference Image */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">Total Deposits</div>
              <div className="font-mono font-black text-base text-slate-900 tabular-nums truncate">
                ₹{totalUserDeposits.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">Total Withdrawals</div>
              <div className="font-mono font-black text-base text-slate-900 tabular-nums truncate">
                ₹{totalUserWithdrawals.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">Total Bets</div>
              <div className="font-mono font-black text-base text-slate-900 tabular-nums">
                {selectedUser.totalBetsCount}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">Total Win</div>
              <div className="font-mono font-black text-base text-slate-900 tabular-nums truncate">
                ₹{selectedUser.totalWonAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* 4. 5 Interactive Drill-Down Navigation Rows matching Reference Image */}
        <div className="space-y-2">
          {([
            {
              id: 'transactions',
              label: 'Transaction History',
              count: userTransactions.length,
              icon: FileSpreadsheet,
              iconColor: 'text-blue-600 bg-blue-50'
            },
            {
              id: 'bets',
              label: 'Bet History',
              count: userBets.length,
              icon: ShieldCheck,
              iconColor: 'text-amber-600 bg-amber-50'
            },
            {
              id: 'bonus',
              label: 'Bonus & Referral',
              count: userReferrals.length,
              icon: Gift,
              iconColor: 'text-orange-600 bg-orange-50'
            },
            {
              id: 'login',
              label: 'Login History',
              count: devicesList.length,
              icon: Clock,
              iconColor: 'text-amber-600 bg-amber-50'
            },
            {
              id: 'settings',
              label: 'Account Settings',
              count: undefined,
              icon: Settings,
              iconColor: 'text-blue-600 bg-blue-50'
            }
          ] as const).map((item) => {
            const Icon = item.icon;
            const isOpen = activeDrillDown === item.id;
            return (
              <div key={item.id} className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveDrillDown(isOpen ? 'none' : item.id)}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      {item.label} {item.count !== undefined ? `(${item.count})` : ''}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>

                {/* Expanded Section Content */}
                {isOpen && (
                  <div className="p-3.5 bg-slate-50 border-t border-slate-100 space-y-2 max-h-64 overflow-y-auto text-xs">
                    {item.id === 'transactions' && (
                      userTransactions.length === 0 ? (
                        <div className="text-slate-400 py-3 text-center">No wallet transactions for this user.</div>
                      ) : (
                        userTransactions.map((tx) => (
                          <div key={tx.id} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-800">{tx.description}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{new Date(tx.timestamp).toLocaleString()}</div>
                            </div>
                            <div className={`font-mono font-bold tabular-nums ${tx.category === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {tx.category === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                            </div>
                          </div>
                        ))
                      )
                    )}

                    {item.id === 'bets' && (
                      userBets.length === 0 ? (
                        <div className="text-slate-400 py-3 text-center">No recent bets recorded in active session.</div>
                      ) : (
                        userBets.map((b) => (
                          <div key={b.betId} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-800">
                                Period {b.roundPeriod} · Pick: {b.betValue.toUpperCase()}
                              </div>
                              <div className="text-[11px] text-slate-400">Stake: ₹{b.amount}</div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              b.status === 'won' ? 'bg-emerald-500 text-white' : b.status === 'lost' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                              {b.status} {b.actualPayout > 0 ? `(+₹${b.actualPayout})` : ''}
                            </span>
                          </div>
                        ))
                      )
                    )}

                    {item.id === 'bonus' && (
                      <div className="space-y-1.5 text-slate-700">
                        <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                          <span>Referral Code:</span>
                          <strong className="font-mono text-blue-600">{selectedUser.referralCode || 'N/A'}</strong>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                          <span>Signup Bonus Claimed:</span>
                          <strong>{selectedUser.signupBonusClaimed ? 'Yes' : `Pending (₹${selectedUser.signupBonusPending || 0})`}</strong>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                          <span>First Deposit Bonus Claimed:</span>
                          <strong>{selectedUser.firstDepositBonusClaimed ? 'Yes' : 'No'}</strong>
                        </div>
                      </div>
                    )}

                    {item.id === 'login' && (
                      devicesList.length === 0 ? (
                        <div className="text-slate-400 py-3 text-center">
                          No bound device currently locked. Next login will automatically bind primary device.
                        </div>
                      ) : (
                        devicesList.map((dev) => (
                          <div key={dev.deviceId} className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="font-bold text-slate-800">{dev.deviceName || dev.deviceModel}</div>
                              <div className="text-[11px] text-slate-400">
                                ID: <span className="font-mono">{dev.deviceId}</span> · {dev.os} · {dev.browser} · {new Date(dev.lastUsedAt).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  dev.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : dev.status === 'pending'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {dev.status}
                              </span>
                              {dev.status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    store.approveDevice(selectedUser.uid, dev.deviceId, adminId);
                                    showToast(`Approved device ${dev.deviceId} (1 Number = 1 Device)`, 'success');
                                  }}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                                >
                                  Approve
                                </button>
                              )}
                              {dev.status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    store.rejectDevice(selectedUser.uid, dev.deviceId, adminId, 'Revoked by Admin');
                                    showToast(`Revoked device ${dev.deviceId}`, 'info');
                                  }}
                                  className="px-2 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px]"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )
                    )}

                    {item.id === 'settings' && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => openEditUserModal(selectedUser)}
                          className="px-3 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                        >
                          Edit Profile & VIP Tier
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteUser(selectedUser)}
                          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-rose-600/30 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete User (Permanent Hard-Delete)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 5. Bottom 2 Primary Action Buttons matching Reference Image: Red "Ban User" & Blue "Edit User" */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowBanModal(true)}
            className="py-3.5 rounded-2xl bg-[#EF4444] hover:bg-rose-600 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition active:scale-[0.99]"
          >
            <Ban className="w-4 h-4" />
            <span>{selectedUser.status === 'active' ? 'Ban User' : 'Unban User'}</span>
          </button>

          <button
            type="button"
            onClick={() => openEditUserModal(selectedUser)}
            className="py-3.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition active:scale-[0.99]"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit User</span>
          </button>
        </div>

        {/* Add / Deduct Balance Modal */}
        {balanceModalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {balanceModalMode === 'credit' ? 'Add Wallet Funds (+)' : 'Deduct Wallet Funds (-)'} — {selectedUser.uid}
                </h3>
                <button
                  type="button"
                  onClick={() => setBalanceModalMode(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleExecuteBalanceAdjustment} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Amount (₹)</label>
                  <input
                    type="number"
                    min={1}
                    step="any"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono font-bold text-base text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Mandatory Audit Reason *</label>
                  <input
                    type="text"
                    placeholder="e.g. Manual VIP bonus / Balance correction"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                    required
                  />
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setBalanceModalMode(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs shadow-md ${
                      balanceModalMode === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    Confirm {balanceModalMode === 'credit' ? `+₹${adjustAmount}` : `-₹${adjustAmount}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Edit User — {selectedUser.uid}</h3>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEditUser} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone (10 digits)</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs font-bold text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-amber-700 mb-1 block">Login Password</label>
                    <input
                      type="text"
                      placeholder="Set / Change Password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full bg-amber-50/70 border border-amber-200 rounded-xl px-3.5 py-2 font-mono text-xs font-black text-slate-950"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">VIP Level</label>
                    <select
                      value={editVip}
                      onChange={(e) => setEditVip(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                        <option key={v} value={v}>VIP {v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Account Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as UserRecord['status'])}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Referral Code</label>
                    <input
                      type="text"
                      value={editReferralCode}
                      onChange={(e) => setEditReferralCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-mono text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Audit Reason</label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                    required
                  />
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Ban / Unban Modal */}
        {showBanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 text-slate-900">
              <h3 className="font-bold text-base text-slate-900">
                {selectedUser.status === 'active' ? `Ban User ${selectedUser.uid}?` : `Unban User ${selectedUser.uid}?`}
              </h3>
              <form onSubmit={handleConfirmBanToggle} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Administrative Reason *</label>
                  <input
                    type="text"
                    placeholder="Enter reason for audit log..."
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                    required
                  />
                </div>
                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowBanModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // MAIN SCREEN: USER MANAGEMENT LIST (Matches Reference Image Screen #3)
  // ============================================================================
  return (
    <div className="space-y-4">
      {/* Search Bar + Firebase Sync Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by UID, name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200/90 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:border-blue-600"
          />
        </div>
        <button
          type="button"
          onClick={handleForceFirebaseSync}
          disabled={isSyncingFirebase}
          className="px-3.5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition shrink-0"
          title="Force Sync all players and balances from Firebase Realtime Database"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFirebase ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync Firebase</span>
          <span className="sm:hidden">Sync</span>
        </button>
      </div>

      {/* Segmented Filter Pills matching Reference Image + Admins (X/5) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
            filterTab === 'all'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300/70'
          }`}
        >
          All ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('active')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
            filterTab === 'active'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300/70'
          }`}
        >
          Active ({activeUsersCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('admins')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
            filterTab === 'admins'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }`}
        >
          ★ Admins ({adminUsersList.length}/{maxAdminSlots})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('banned')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
            filterTab === 'banned'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300/70'
          }`}
        >
          Banned ({bannedOrRestrictedCount})
        </button>
      </div>

      {/* User Rows List matching Reference Image */}
      <div className="space-y-2.5">
        {filteredUsers.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
            No users found matching your search.
          </div>
        ) : (
          filteredUsers.map((u) => {
            const hasPendingDevice = Object.values(u.devices || {}).some((d) => d.status === 'pending');
            return (
              <div
                key={u.uid}
                onClick={() => setSelectedUserUid(u.uid)}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-blue-400 cursor-pointer flex items-center justify-between gap-3 transition active:scale-[0.99]"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono font-black text-slate-900 text-sm truncate">
                        {u.uid} <span className="font-sans font-semibold text-xs text-slate-500">({u.username})</span>
                      </span>
                      {u.role === 'master_admin' && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500 text-slate-950">
                          ★ ADMIN
                        </span>
                      )}
                      {hasPendingDevice && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                          🔒 New Device Pending
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                      <span>+91 {u.phone}</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px]">
                        🔑 Pass: {u.passwordHash || 'Not Set'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        VIP {u.vipLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {u.status === 'active' ? 'Active' : 'Banned'}
                    </span>
                    <div className="text-xs text-slate-700 font-semibold mt-1 tabular-nums">
                      Balance: <strong className="font-mono text-slate-900">₹{u.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteUser(u);
                    }}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition"
                    title="Hard Delete User (Permanent Wipe)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Full-Width Primary Blue "+ Add Manual User" Button */}
      <button
        type="button"
        onClick={() => setShowAddUserModal(true)}
        className="w-full py-3.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition active:scale-[0.99]"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Add Manual User</span>
      </button>

      {/* Archived User Backups if any */}
      {deletedBackups.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-slate-800 text-xs">Archived User Backups ({deletedBackups.length})</h4>
          {deletedBackups.map((bk) => (
            <div key={bk.uid} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50">
              <span>{bk.username} ({bk.uid}) · ₹{bk.balance.toFixed(0)}</span>
              <button
                type="button"
                onClick={() => {
                  const res = store.restoreDeletedUser(bk.uid, adminId);
                  if (res.success) showToast(`Restored ${bk.username}`, 'success');
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Manual User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Add Manual User</h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualUser} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Full Name / Username</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Mobile Number (10 digits)</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-amber-700 mb-1 block">Login Password</label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-amber-50/70 border border-amber-200 rounded-xl px-3.5 py-2 font-mono text-xs font-black text-slate-950"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Opening Balance (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={newBalance}
                    onChange={(e) => setNewBalance(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">VIP Tier</label>
                  <select
                    value={newVip}
                    onChange={(e) => setNewVip(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                  >
                    {[1, 2, 3, 4, 5].map((v) => (
                      <option key={v} value={v}>VIP {v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permanent Hard-Delete Confirmation Modal */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border-2 border-rose-500 rounded-3xl p-5 shadow-2xl space-y-4 text-slate-900 overflow-hidden">
            <div className="flex items-center space-x-3 text-rose-600 pb-3 border-b border-rose-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">Permanent Hard-Delete User</h3>
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Irreversible Action</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">UID:</span>
                <span className="font-mono font-black text-slate-900">{confirmDeleteUser.uid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Username:</span>
                <span className="font-bold text-slate-900">{confirmDeleteUser.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Mobile Phone:</span>
                <span className="font-mono font-bold text-slate-900">+91 {confirmDeleteUser.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Wallet Balance:</span>
                <span className="font-mono font-black text-rose-700">₹{confirmDeleteUser.balance.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800">This action will completely wipe out:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong>Firebase Authentication</strong> account (instant logout across all devices)</li>
                <li><strong>/users/{confirmDeleteUser.uid}</strong> profile & balance</li>
                <li><strong>/wallets/{confirmDeleteUser.uid}</strong> & ledger transactions</li>
                <li><strong>/bets/{confirmDeleteUser.uid}</strong> & game history records</li>
                <li><strong>/ludo_rooms</strong> (any rooms hosted or joined by user)</li>
                <li><strong>/admin_security</strong> allowed phone & device whitelist</li>
              </ul>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                disabled={isHardDeleting}
                onClick={() => setConfirmDeleteUser(null)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isHardDeleting}
                onClick={() => handleCompleteUserDelete(confirmDeleteUser)}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isHardDeleting ? 'Deleting Permanently...' : 'Confirm Hard Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
