import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  User,
  Search,
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
  Copy,
  Download,
  Upload,
  Unlock,
  AlertTriangle,
  Calendar,
  ArrowUpDown,
  Crown,
  Filter
} from 'lucide-react';
import { UserRecord } from '../../types';
import { store } from '../../services/store';
import { apiClient } from '../../services/apiClient';
import { firebaseSync } from '../../services/firebaseSync';
import { rtdb, rtdbRef, rtdbGet, rtdbUpdate, rtdbOnValue } from '../../firebase';
import { useToast } from '../common/Toast';

interface AdminUsersProps {
  adminId: string;
  masterToken?: string;
}

type RoleStatusFilter = 'all' | 'admins' | 'regular' | 'online' | 'banned';
type FraudWalletFilter = 'all' | 'vip_deposited' | 'free_bonus' | 'low_balance' | 'duplicate_device';
type SortOption =
  | 'wallet_desc'
  | 'wallet_asc'
  | 'newest'
  | 'oldest'
  | 'recent_active'
  | 'highest_deposit';
type DateFilterMode = 'createdAt' | 'lastLogin';
type DatePreset = 'all' | 'today' | 'yesterday' | 'last7' | 'last30' | 'custom';

const formatDateTime = (ts?: number): string => {
  if (!ts || ts <= 0) return 'N/A';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return 'N/A';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hh = String(hours).padStart(2, '0');
  return `${dd}/${mm}/${yyyy}, ${hh}:${minutes} ${ampm}`;
};

export const AdminUsers: React.FC<AdminUsersProps> = ({ adminId, masterToken }) => {
  const { showToast } = useToast();
  const [, setTick] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Real-time store + Firebase RTDB subscription
  useEffect(() => {
    const unsubStore = store.subscribe(() => setTick((t) => t + 1));
    const unsubRtdb = rtdbOnValue(
      rtdbRef(rtdb, 'users'),
      (snap) => {
        if (snap.exists()) {
          const val = snap.val();
          if (val && typeof val === 'object') {
            Object.entries(val).forEach(([key, raw]: [string, any]) => {
              const uid = raw?.uid || key;
              if (uid && !String(uid).startsWith('usr_demo_')) {
                store.updateUserFromFirestore({ ...raw, uid });
              }
            });
            setTick((t) => t + 1);
          }
        }
      },
      () => {}
    );
    return () => {
      unsubStore();
      unsubRtdb();
    };
  }, []);

  // A. Search Bar
  const [searchTerm, setSearchTerm] = useState('');

  // B. Role & Status Filter Tabs
  const [roleStatusFilter, setRoleStatusFilter] = useState<RoleStatusFilter>('all');

  // C. Wallet, VIP & Fraud Filters
  const [fraudWalletFilter, setFraudWalletFilter] = useState<FraudWalletFilter>('all');

  // D. Balance & Activity Sorting Dropdown
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // E. Complete Date Range Filter
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('createdAt');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customFromDate, setCustomFromDate] = useState<string>('');
  const [customToDate, setCustomToDate] = useState<string>('');

  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Dedicated User Details Sub-Screen State
  const [selectedUserUid, setSelectedUserUid] = useState<string | null>(null);
  const [activeDrillDown, setActiveDrillDown] = useState<
    'none' | 'transactions' | 'bets' | 'bonus' | 'login' | 'settings'
  >('none');

  // Balance Add / Deduct / Set Modal (works from both row quick-action and detail view)
  const [walletEditTargetUser, setWalletEditTargetUser] = useState<UserRecord | null>(null);
  const [balanceModalMode, setBalanceModalMode] = useState<'credit' | 'debit' | 'set' | null>(null);
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

  const handleForceFirebaseSync = async () => {
    setIsSyncingFirebase(true);
    try {
      const res = await firebaseSync.forceSyncFromFirebase();
      if (res.success) {
        showToast(`Synced! Total Users: ${Object.keys(store.getUsers()).length}`, 'success');
      } else {
        showToast(res.message || 'Firebase Sync error', 'error');
      }
    } catch {
      showToast('Firebase Sync failed', 'error');
    } finally {
      setIsSyncingFirebase(false);
    }
  };

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
  const tokenToUse =
    masterToken || sessionStorage.getItem('bingo777_master_admin_token') || 'BINGO_MASTER_2026_KEY';
  const depositsList = store.getDeposits();
  const withdrawalsList = store.getWithdrawals();

  // Compute user helper metrics (wallet, totalDeposit, totalWithdraw, device IDs, admin & banned status)
  const getUserWallet = (u: UserRecord): number => Number(u.wallet ?? u.balance ?? 0);

  const getUserTotalDeposit = (u: UserRecord): number => {
    const storedDep = Number(u.totalDeposit ?? u.totalDeposited ?? 0);
    const approvedSum = depositsList
      .filter((d) => d.uid === u.uid && d.status === 'approved')
      .reduce((s, d) => s + Number(d.amount || 0), 0);
    return Math.max(storedDep, approvedSum);
  };

  const getUserTotalWithdraw = (u: UserRecord): number => {
    const storedWit = Number(u.totalWithdraw ?? u.totalWithdrawn ?? 0);
    const approvedSum = withdrawalsList
      .filter((w) => w.uid === u.uid && w.status === 'approved')
      .reduce((s, w) => s + Number(w.amount || 0), 0);
    return Math.max(storedWit, approvedSum);
  };

  const isUserAdmin = (u: UserRecord): boolean =>
    Boolean(u.isAdmin === true || u.role === 'admin' || u.role === 'master_admin');

  const isUserBanned = (u: UserRecord): boolean =>
    Boolean(
      u.isBanned === true ||
        u.status === 'banned' ||
        u.status === 'blocked' ||
        u.status === 'suspended' ||
        u.status === 'deactivated'
    );

  const isUserOnlineNow = (u: UserRecord): boolean => {
    const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
    const lastTs = Math.max(Number(u.lastLogin || 0), Number(u.lastActive || 0));
    return Boolean(u.isOnline === true || (lastTs > 0 && lastTs >= fiveMinsAgo));
  };

  const getPrimaryDeviceId = (u: UserRecord): string => {
    if (u.lastUsedDeviceId) return u.lastUsedDeviceId;
    if (u.boundDeviceId) return u.boundDeviceId;
    if (u.registrationDeviceId) return u.registrationDeviceId;
    const firstDev = Object.values(u.devices || {})[0];
    return firstDev?.deviceId || '';
  };

  // Build Duplicate Device Fraud map: deviceId -> Set of UIDs sharing that lastUsedDeviceId or registrationDeviceId
  const duplicateDeviceUidSet = useMemo(() => {
    const deviceToUids = new Map<string, Set<string>>();
    users.forEach((u) => {
      const ids = new Set<string>();
      if (u.lastUsedDeviceId) ids.add(u.lastUsedDeviceId);
      if (u.registrationDeviceId) ids.add(u.registrationDeviceId);
      if (u.boundDeviceId) ids.add(u.boundDeviceId);
      Object.values(u.devices || {}).forEach((d) => {
        if (d?.deviceId) ids.add(d.deviceId);
      });
      ids.forEach((devId) => {
        if (!devId) return;
        if (!deviceToUids.has(devId)) {
          deviceToUids.set(devId, new Set());
        }
        deviceToUids.get(devId)!.add(u.uid);
      });
    });

    const dupUids = new Set<string>();
    deviceToUids.forEach((uidSet) => {
      if (uidSet.size > 1) {
        uidSet.forEach((id) => dupUids.add(id));
      }
    });
    return dupUids;
  }, [users]);

  const getSharedDeviceCount = (u: UserRecord): number => {
    const devId = getPrimaryDeviceId(u);
    if (!devId) return 1;
    let count = 0;
    users.forEach((other) => {
      const otherIds = [
        other.lastUsedDeviceId,
        other.registrationDeviceId,
        other.boundDeviceId,
        ...Object.values(other.devices || {}).map((d) => d?.deviceId)
      ].filter(Boolean);
      if (otherIds.includes(devId)) count++;
    });
    return Math.max(1, count);
  };

  // Live Filter Counts
  const counts = useMemo(() => {
    return {
      all: users.length,
      admins: users.filter(isUserAdmin).length,
      regular: users.filter((u) => !isUserAdmin(u)).length,
      online: users.filter(isUserOnlineNow).length,
      banned: users.filter(isUserBanned).length,
      vip_deposited: users.filter((u) => getUserTotalDeposit(u) > 0).length,
      free_bonus: users.filter((u) => getUserTotalDeposit(u) === 0).length,
      low_balance: users.filter((u) => getUserWallet(u) < 10).length,
      duplicate_device: users.filter((u) => duplicateDeviceUidSet.has(u.uid)).length
    };
  }, [users, duplicateDeviceUidSet]);

  // Apply All Filters & Sorting
  const filteredAndSortedUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    // Calculate Date Range bounds
    let startMs: number | null = null;
    let endMs: number | null = null;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (datePreset === 'today') {
      startMs = startOfToday;
      endMs = Date.now() + 86400000;
    } else if (datePreset === 'yesterday') {
      startMs = startOfToday - 86400000;
      endMs = startOfToday - 1;
    } else if (datePreset === 'last7') {
      startMs = Date.now() - 7 * 86400000;
      endMs = Date.now() + 86400000;
    } else if (datePreset === 'last30') {
      startMs = Date.now() - 30 * 86400000;
      endMs = Date.now() + 86400000;
    } else if (datePreset === 'custom') {
      if (customFromDate) {
        startMs = new Date(`${customFromDate}T00:00:00`).getTime();
      }
      if (customToDate) {
        endMs = new Date(`${customToDate}T23:59:59.999`).getTime();
      }
    }

    const filtered = users.filter((u) => {
      // A. Search Bar (Mobile Number, User UID, Name/Username, or Device ID)
      if (q) {
        const primaryDev = getPrimaryDeviceId(u).toLowerCase();
        const allDevIds = Object.values(u.devices || {})
          .map((d) => d?.deviceId?.toLowerCase() || '')
          .join(' ');
        const matchSearch =
          u.uid.toLowerCase().includes(q) ||
          (u.name || '').toLowerCase().includes(q) ||
          (u.username || '').toLowerCase().includes(q) ||
          (u.phone || '').toLowerCase().includes(q) ||
          primaryDev.includes(q) ||
          (u.boundDeviceId || '').toLowerCase().includes(q) ||
          (u.lastUsedDeviceId || '').toLowerCase().includes(q) ||
          (u.registrationDeviceId || '').toLowerCase().includes(q) ||
          allDevIds.includes(q);
        if (!matchSearch) return false;
      }

      // B. Role & Status Filter Tabs
      if (roleStatusFilter === 'admins' && !isUserAdmin(u)) return false;
      if (roleStatusFilter === 'regular' && isUserAdmin(u)) return false;
      if (roleStatusFilter === 'online' && !isUserOnlineNow(u)) return false;
      if (roleStatusFilter === 'banned' && !isUserBanned(u)) return false;

      // C. Wallet, VIP & Fraud Filters
      if (fraudWalletFilter === 'vip_deposited' && getUserTotalDeposit(u) <= 0) return false;
      if (fraudWalletFilter === 'free_bonus' && getUserTotalDeposit(u) > 0) return false;
      if (fraudWalletFilter === 'low_balance' && getUserWallet(u) >= 10) return false;
      if (fraudWalletFilter === 'duplicate_device' && !duplicateDeviceUidSet.has(u.uid)) return false;

      // E. Date Range Filter
      if (startMs !== null || endMs !== null) {
        const targetTs =
          dateFilterMode === 'createdAt'
            ? Number(u.createdAt || 0)
            : Number(u.lastLogin || u.lastActive || u.createdAt || 0);
        if (startMs !== null && targetTs < startMs) return false;
        if (endMs !== null && targetTs > endMs) return false;
      }

      return true;
    });

    // D. Balance & Activity Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'wallet_desc') return getUserWallet(b) - getUserWallet(a);
      if (sortBy === 'wallet_asc') return getUserWallet(a) - getUserWallet(b);
      if (sortBy === 'newest') return Number(b.createdAt || 0) - Number(a.createdAt || 0);
      if (sortBy === 'oldest') return Number(a.createdAt || 0) - Number(b.createdAt || 0);
      if (sortBy === 'recent_active') {
        const aActive = Math.max(Number(a.lastLogin || 0), Number(a.lastActive || 0));
        const bActive = Math.max(Number(b.lastLogin || 0), Number(b.lastActive || 0));
        return bActive - aActive;
      }
      if (sortBy === 'highest_deposit') {
        return getUserTotalDeposit(b) - getUserTotalDeposit(a);
      }
      return 0;
    });
  }, [
    users,
    searchTerm,
    roleStatusFilter,
    fraudWalletFilter,
    sortBy,
    dateFilterMode,
    datePreset,
    customFromDate,
    customToDate,
    duplicateDeviceUidSet
  ]);

  const handleResetAllFilters = () => {
    setSearchTerm('');
    setRoleStatusFilter('all');
    setFraudWalletFilter('all');
    setSortBy('newest');
    setDateFilterMode('createdAt');
    setDatePreset('all');
    setCustomFromDate('');
    setCustomToDate('');
    showToast('All filters reset to default.', 'info');
  };

  // ============================================================================
  // QUICK ROW ACTIONS (Make/Remove Admin, Edit Wallet, Reset Device Lock, Ban/Unban)
  // ============================================================================
  const handleQuickToggleAdmin = async (u: UserRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextAdminState = !isUserAdmin(u);
    const res = store.setUserAdminRole(
      u.uid,
      nextAdminState,
      adminId,
      nextAdminState
        ? 'Promoted to Admin via Quick Row Action (boundDeviceId reset for first login binding)'
        : 'Removed Admin role via Quick Row Action'
    );

    if (res.success) {
      await rtdbUpdate(rtdbRef(rtdb, `users/${u.uid}`), {
        isAdmin: nextAdminState,
        role: nextAdminState ? 'admin' : 'user',
        boundDeviceId: null,
        updatedAt: Date.now()
      }).catch(() => {});

      showToast(
        nextAdminState
          ? `👑 ${u.name || u.username} promoted to Admin! Their device will auto-bind on first Admin login.`
          : `Removed Admin role from ${u.name || u.username}.`,
        nextAdminState ? 'success' : 'info'
      );
    } else {
      showToast(res.error || 'Could not update Admin role', 'error');
    }
  };

  const handleQuickResetDeviceLock = async (u: UserRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    store.resetUserDeviceLock(u.uid, adminId);
    await rtdbUpdate(rtdbRef(rtdb, `users/${u.uid}`), {
      boundDeviceId: null,
      devices: {},
      updatedAt: Date.now()
    }).catch(() => {});
    showToast(
      `🔓 Device Lock reset for ${u.name || u.username}! Next login will bind their new phone.`,
      'success'
    );
  };

  const handleQuickToggleBan = async (u: UserRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentlyBanned = isUserBanned(u);
    const nextBanned = !currentlyBanned;
    const nextStatus = nextBanned ? 'banned' : 'active';
    const reason = nextBanned ? 'Banned via Quick Row Action' : 'Unbanned via Quick Row Action';

    store.toggleUserStatus(u.uid, nextStatus, reason, adminId);
    await rtdbUpdate(rtdbRef(rtdb, `users/${u.uid}`), {
      isBanned: nextBanned,
      status: nextStatus,
      updatedAt: Date.now()
    }).catch(() => {});
    await apiClient.updateUserStatus(u.uid, nextStatus, reason, adminId, tokenToUse).catch(() => {});

    showToast(
      nextBanned
        ? `🚫 ${u.name || u.username} has been banned.`
        : `✅ ${u.name || u.username} has been unbanned.`,
      nextBanned ? 'info' : 'success'
    );
  };

  // ============================================================================
  // 7. USER DATA EXPORT & IMPORT (CSV & JSON)
  // ============================================================================
  const buildExportRecords = (list: UserRecord[]) => {
    return list.map((u) => ({
      uid: u.uid,
      phone: u.phone || '',
      name: u.name || u.username || `Player_${u.uid.slice(-4)}`,
      wallet: getUserWallet(u),
      totalDeposit: getUserTotalDeposit(u),
      totalWithdraw: getUserTotalWithdraw(u),
      role: isUserAdmin(u) ? (u.role === 'master_admin' ? 'master_admin' : 'admin') : 'user',
      isAdmin: isUserAdmin(u),
      isBanned: isUserBanned(u),
      boundDeviceId: u.boundDeviceId ?? null,
      lastUsedDeviceId: getPrimaryDeviceId(u) || null,
      createdAt: u.createdAt || Date.now(),
      lastLogin: u.lastLogin || u.lastActive || u.createdAt || Date.now()
    }));
  };

  const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = (list: UserRecord[], scopeLabel: 'filtered' | 'all') => {
    const rows = buildExportRecords(list);
    const filename = `bingo777_users_${scopeLabel}_${new Date().toISOString().slice(0, 10)}.json`;
    triggerDownload(JSON.stringify(rows, null, 2), filename, 'application/json');
    showToast(`Exported ${rows.length} users to ${filename}`, 'success');
  };

  const handleExportCSV = (list: UserRecord[], scopeLabel: 'filtered' | 'all') => {
    const rows = buildExportRecords(list);
    const headers = [
      'uid',
      'phone',
      'name',
      'wallet',
      'totalDeposit',
      'totalWithdraw',
      'role',
      'isAdmin',
      'isBanned',
      'boundDeviceId',
      'lastUsedDeviceId',
      'createdAt',
      'lastLogin'
    ];
    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const csvLines = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => escapeCsv((r as any)[h])).join(','))
    ];
    const filename = `bingo777_users_${scopeLabel}_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerDownload(csvLines.join('\n'), filename, 'text/csv;charset=utf-8;');
    showToast(`Exported ${rows.length} users to ${filename}`, 'success');
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
  };

  const handleImportUsersFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);

    try {
      const text = await file.text();
      let importedItems: Array<Record<string, any>> = [];

      if (file.name.toLowerCase().endsWith('.json') || text.trim().startsWith('[') || text.trim().startsWith('{')) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          importedItems = parsed;
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.users)) {
            importedItems = parsed.users;
          } else {
            importedItems = Object.entries(parsed).map(([k, v]: [string, any]) =>
              typeof v === 'object' && v ? { uid: k, ...v } : { uid: k }
            );
          }
        }
      } else {
        // Parse CSV
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length >= 2) {
          const headers = parseCsvLine(lines[0]).map((h) => h.trim());
          for (let i = 1; i < lines.length; i++) {
            const cols = parseCsvLine(lines[i]);
            const obj: Record<string, any> = {};
            headers.forEach((h, idx) => {
              obj[h] = cols[idx] !== undefined ? cols[idx].trim() : '';
            });
            importedItems.push(obj);
          }
        }
      }

      if (importedItems.length === 0) {
        showToast('No valid user records found in uploaded file.', 'error');
        return;
      }

      // Fetch current users snapshot from RTDB so existing Admin roles (isAdmin: true) are strictly preserved
      let existingRtdbUsers: Record<string, any> = {};
      try {
        const snap = await rtdbGet(rtdbRef(rtdb, 'users'));
        if (snap.exists() && snap.val() && typeof snap.val() === 'object') {
          existingRtdbUsers = snap.val();
        }
      } catch {}

      let mergedCount = 0;
      for (const item of importedItems) {
        const uid = String(item.uid || '').trim();
        const phone = String(item.phone || '').replace(/\D/g, '').slice(-10);
        if (!uid && !phone) continue;

        const resolvedUid = uid || `usr_${phone}`;
        const existingLocal = store.getUser(resolvedUid);
        const existingCloud = existingRtdbUsers[resolvedUid] || {};

        // Strictly preserve existing Admin roles so no Admin is ever demoted during import
        const wasAlreadyAdmin = Boolean(
          existingCloud.isAdmin === true ||
            existingCloud.role === 'admin' ||
            existingCloud.role === 'master_admin' ||
            existingLocal?.isAdmin === true ||
            existingLocal?.role === 'admin' ||
            existingLocal?.role === 'master_admin'
        );

        const importedIsAdmin =
          wasAlreadyAdmin ||
          item.isAdmin === true ||
          item.isAdmin === 'true' ||
          item.role === 'admin' ||
          item.role === 'master_admin';

        const importedRole = wasAlreadyAdmin
          ? existingCloud.role === 'master_admin' || existingLocal?.role === 'master_admin'
            ? 'master_admin'
            : 'admin'
          : importedIsAdmin
          ? 'admin'
          : 'user';

        const walletVal = Number(
          item.wallet !== undefined && item.wallet !== ''
            ? item.wallet
            : item.balance !== undefined && item.balance !== ''
            ? item.balance
            : existingCloud.wallet ?? existingCloud.balance ?? existingLocal?.balance ?? 0
        );

        const totalDepVal = Number(
          item.totalDeposit !== undefined && item.totalDeposit !== ''
            ? item.totalDeposit
            : existingCloud.totalDeposit ?? existingLocal?.totalDeposit ?? 0
        );

        const totalWitVal = Number(
          item.totalWithdraw !== undefined && item.totalWithdraw !== ''
            ? item.totalWithdraw
            : existingCloud.totalWithdraw ?? existingLocal?.totalWithdraw ?? 0
        );

        const isBannedVal =
          item.isBanned === true ||
          item.isBanned === 'true' ||
          item.status === 'banned' ||
          item.status === 'blocked';

        const nameVal =
          item.name ||
          item.username ||
          existingCloud.name ||
          existingCloud.username ||
          existingLocal?.username ||
          `Player_${resolvedUid.slice(-4)}`;

        const payload: Record<string, any> = {
          uid: resolvedUid,
          phone: phone || existingCloud.phone || existingLocal?.phone || '',
          name: nameVal,
          username: nameVal,
          wallet: Math.max(0, walletVal),
          balance: Math.max(0, walletVal),
          totalDeposit: Math.max(0, totalDepVal),
          totalDeposited: Math.max(0, totalDepVal),
          totalWithdraw: Math.max(0, totalWitVal),
          totalWithdrawn: Math.max(0, totalWitVal),
          role: importedRole,
          isAdmin: importedIsAdmin,
          isBanned: isBannedVal,
          status: isBannedVal ? 'banned' : 'active',
          boundDeviceId:
            existingCloud.boundDeviceId ??
            (item.boundDeviceId && item.boundDeviceId !== 'null' ? item.boundDeviceId : null),
          lastUsedDeviceId:
            item.lastUsedDeviceId && item.lastUsedDeviceId !== 'null'
              ? item.lastUsedDeviceId
              : existingCloud.lastUsedDeviceId || '',
          createdAt: Number(item.createdAt) || existingCloud.createdAt || existingLocal?.createdAt || Date.now(),
          lastLogin: Number(item.lastLogin) || existingCloud.lastLogin || existingLocal?.lastLogin || Date.now(),
          updatedAt: Date.now()
        };

        await rtdbUpdate(rtdbRef(rtdb, `users/${resolvedUid}`), payload).catch(() => {});
        store.updateUserFromFirestore({ ...payload, uid: resolvedUid });
        mergedCount++;
      }

      showToast(
        `✅ Safely imported & merged ${mergedCount} user records into Firebase (all Admin roles preserved)!`,
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Failed to parse import file. Ensure valid JSON or CSV.', 'error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const selectedUser = selectedUserUid ? usersMap[selectedUserUid] || null : null;
  const adminUsersList = store.getAdminUsers();
  const maxAdminSlots = 5;

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
      showToast(
        `Created user ${res.user.username} (${res.user.uid}) | Password: ${res.user.passwordHash}`,
        'success'
      );
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
    const target = walletEditTargetUser || selectedUser;
    if (!target || !balanceModalMode) return;
    if (adjustAmount < 0 || (balanceModalMode !== 'set' && adjustAmount <= 0)) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    const reasonText = adjustReason.trim() || 'Admin wallet update';

    const currentBal = getUserWallet(target);
    const delta =
      balanceModalMode === 'set'
        ? adjustAmount - currentBal
        : balanceModalMode === 'credit'
        ? adjustAmount
        : -adjustAmount;

    if (delta === 0) {
      setBalanceModalMode(null);
      setWalletEditTargetUser(null);
      return;
    }

    const ok = store.adjustUserBalance(target.uid, delta, reasonText, adminId);
    if (ok) {
      const nextWallet = Math.max(0, Math.round((currentBal + delta) * 100) / 100);
      await rtdbUpdate(rtdbRef(rtdb, `users/${target.uid}`), {
        wallet: nextWallet,
        balance: nextWallet,
        updatedAt: Date.now()
      }).catch(() => {});
      await apiClient.adjustBalance(target.uid, delta, reasonText, adminId, tokenToUse).catch(() => {});
      showToast(
        `Updated wallet for ${target.name || target.username} to ₹${nextWallet.toLocaleString('en-IN')}`,
        'success'
      );
      setBalanceModalMode(null);
      setWalletEditTargetUser(null);
      setAdjustReason('');
    } else {
      showToast('Cannot deduct more than available wallet balance', 'error');
    }
  };

  const openEditUserModal = (u: UserRecord) => {
    setEditUsername(u.name || u.username);
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
      await rtdbUpdate(rtdbRef(rtdb, `users/${selectedUser.uid}`), {
        name: editUsername,
        username: editUsername,
        phone: editPhone,
        vipLevel: editVip,
        status: editStatus,
        isBanned: editStatus === 'banned' || editStatus === 'blocked',
        updatedAt: Date.now()
      }).catch(() => {});
      await apiClient
        .updateUserStatus(selectedUser.uid, editStatus, editReason || 'Admin edit', adminId, tokenToUse)
        .catch(() => {});
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
    const nextBanned = nextStatus === 'banned';
    const reason =
      banReason.trim() ||
      (nextStatus === 'banned' ? 'Account banned by Master Admin' : 'Account unbanned by Master Admin');

    const ok = store.toggleUserStatus(selectedUser.uid, nextStatus, reason, adminId);
    if (ok) {
      await rtdbUpdate(rtdbRef(rtdb, `users/${selectedUser.uid}`), {
        isBanned: nextBanned,
        status: nextStatus,
        updatedAt: Date.now()
      }).catch(() => {});
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

    setLocalDeletedUids((prev) => new Set([...prev, uid]));
    if (selectedUserUid === uid) {
      setSelectedUserUid(null);
    }
    setConfirmDeleteUser(null);

    try {
      store.hardDeleteUser(uid, adminId, 'Permanently deleted by Master Admin');
      await apiClient.hardDeleteUser(uid, adminId, tokenToUse, phone).catch((err) => {
        console.warn('Backend hard-delete error:', err);
      });
      await firebaseSync.hardDeleteUserFromFirebase(uid, phone).catch((err) => {
        console.warn('FirebaseSync purge error:', err);
      });
      showToast(
        `User ${username} (${uid}) permanently deleted and wiped from all databases and Auth.`,
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Error occurred during complete user deletion', 'error');
    } finally {
      setIsHardDeleting(false);
    }
  };

  // ============================================================================
  // DEDICATED SUB-SCREEN: USER DETAILS
  // ============================================================================
  if (selectedUser) {
    const totalUserDeposits = getUserTotalDeposit(selectedUser);
    const totalUserWithdrawals = getUserTotalWithdraw(selectedUser);
    const userTransactions = store.getTransactions(selectedUser.uid);
    const userBets = store.getLiveBets().filter((b) => b.uid === selectedUser.uid);
    const userReferrals = store
      .getReferrals()
      .filter((r) => r.referrerUid === selectedUser.uid || r.referredUid === selectedUser.uid);
    const devicesList = Object.values(selectedUser.devices || {});
    const selectedIsAdmin = isUserAdmin(selectedUser);

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
                      !isUserBanned(selectedUser)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {!isUserBanned(selectedUser) ? 'Active' : 'Banned'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800">
                    VIP {selectedUser.vipLevel}
                  </span>
                  {selectedIsAdmin && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950 shadow-sm">
                      👑 ADMIN
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-700 font-semibold mt-0.5">
                  {selectedUser.name || selectedUser.username} · +91 {selectedUser.phone}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Joined: {formatDateTime(selectedUser.createdAt)} · Last Active:{' '}
                  {formatDateTime(selectedUser.lastLogin || selectedUser.lastActive)}
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

          {/* User Login Credentials */}
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
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Bound Device ID</span>
                  <span className="font-mono font-black text-blue-700 text-xs">
                    {selectedUser.boundDeviceId || getPrimaryDeviceId(selectedUser) || 'Unbound'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      selectedUser.boundDeviceId || getPrimaryDeviceId(selectedUser) || '',
                      'Device ID'
                    )
                  }
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                  title="Copy Device ID"
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
                onClick={async () => {
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
                    await rtdbUpdate(rtdbRef(rtdb, `users/${selectedUser.uid}`), {
                      passwordHash: quickNewPassword.trim(),
                      updatedAt: Date.now()
                    }).catch(() => {});
                    showToast(
                      `Password updated to "${quickNewPassword.trim()}" for ${selectedUser.username}!`,
                      'success'
                    );
                    setQuickNewPassword('');
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center space-x-1.5 shadow-sm transition shrink-0"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Update Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1B. Admin Selection & Device Binding Control Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Admin Access & Device Binding ({adminUsersList.length}/{maxAdminSlots} Admins)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Promoting to Admin sets <code className="font-mono">boundDeviceId: null</code> and binds their persistent device on first Admin Panel login.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => handleQuickResetDeviceLock(selectedUser, e)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center space-x-1.5 transition"
              >
                <Unlock className="w-3.5 h-3.5 text-amber-600" />
                <span>Reset Device Lock 🔓</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleQuickToggleAdmin(selectedUser, e)}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm transition shrink-0 ${
                  selectedIsAdmin
                    ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                }`}
              >
                {selectedIsAdmin ? 'Remove Admin Role 👑' : 'Make Admin 👑'}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Wallet Balance Card with Add / Deduct / Set Buttons */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Wallet Balance</div>
              <div className="font-mono font-black text-xl sm:text-2xl text-slate-900 tabular-nums">
                ₹{getUserWallet(selectedUser).toLocaleString('en-IN', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setWalletEditTargetUser(selectedUser);
                setBalanceModalMode('credit');
                setAdjustAmount(500);
                setAdjustReason('');
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition active:scale-95"
            >
              + Add
            </button>
            <button
              type="button"
              onClick={() => {
                setWalletEditTargetUser(selectedUser);
                setBalanceModalMode('debit');
                setAdjustAmount(100);
                setAdjustReason('');
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition active:scale-95"
            >
              - Deduct
            </button>
            <button
              type="button"
              onClick={() => {
                setWalletEditTargetUser(selectedUser);
                setBalanceModalMode('set');
                setAdjustAmount(getUserWallet(selectedUser));
                setAdjustReason('');
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
            >
              ✏️ Set
            </button>
          </div>
        </div>

        {/* 3. 2x2 Summary Metrics Grid */}
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

        {/* 4. Interactive Drill-Down Navigation Rows */}
        <div className="space-y-2">
          {(
            [
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
                label: 'Login & Device History',
                count: devicesList.length,
                icon: Clock,
                iconColor: 'text-amber-600 bg-amber-50'
              },
              {
                id: 'settings',
                label: 'Account Settings & Hard Delete',
                count: undefined,
                icon: Settings,
                iconColor: 'text-blue-600 bg-blue-50'
              }
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isOpen = activeDrillDown === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden"
              >
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
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="p-3.5 bg-slate-50 border-t border-slate-100 space-y-2 max-h-64 overflow-y-auto text-xs">
                    {item.id === 'transactions' &&
                      (userTransactions.length === 0 ? (
                        <div className="text-slate-400 py-3 text-center">
                          No wallet transactions for this user.
                        </div>
                      ) : (
                        userTransactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-slate-800">{tx.description}</div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {formatDateTime(tx.timestamp)}
                              </div>
                            </div>
                            <div
                              className={`font-mono font-bold tabular-nums ${
                                tx.category === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {tx.category === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                            </div>
                          </div>
                        ))
                      ))}

                    {item.id === 'bets' &&
                      (userBets.length === 0 ? (
                        <div className="text-slate-400 py-3 text-center">
                          No recent bets recorded in active session.
                        </div>
                      ) : (
                        userBets.map((b) => (
                          <div
                            key={b.betId}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-slate-800">
                                Period {b.roundPeriod} · Pick: {b.betValue.toUpperCase()}
                              </div>
                              <div className="text-[11px] text-slate-400">Stake: ₹{b.amount}</div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                b.status === 'won'
                                  ? 'bg-emerald-500 text-white'
                                  : b.status === 'lost'
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              {b.status} {b.actualPayout > 0 ? `(+₹${b.actualPayout})` : ''}
                            </span>
                          </div>
                        ))
                      ))}

                    {item.id === 'bonus' && (
                      <div className="space-y-1.5 text-slate-700">
                        <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                          <span>Referral Code:</span>
                          <strong className="font-mono text-blue-600">
                            {selectedUser.referralCode || 'N/A'}
                          </strong>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                          <span>Signup Bonus Claimed:</span>
                          <strong>
                            {selectedUser.signupBonusClaimed
                              ? 'Yes'
                              : `Pending (₹${selectedUser.signupBonusPending || 0})`}
                          </strong>
                        </div>
                      </div>
                    )}

                    {item.id === 'login' && (
                      <div className="space-y-1.5 text-slate-700">
                        <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                          <span>Bound Admin Device ID:</span>
                          <strong className="font-mono text-amber-700">
                            {selectedUser.boundDeviceId || 'None (Will bind on next login)'}
                          </strong>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                          <span>Last Used Device ID:</span>
                          <strong className="font-mono text-slate-900">
                            {selectedUser.lastUsedDeviceId || getPrimaryDeviceId(selectedUser) || 'N/A'}
                          </strong>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                          <span>Registration Device ID:</span>
                          <strong className="font-mono text-slate-900">
                            {selectedUser.registrationDeviceId || getPrimaryDeviceId(selectedUser) || 'N/A'}
                          </strong>
                        </div>
                      </div>
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

        {/* Bottom Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowBanModal(true)}
            className="py-3.5 rounded-2xl bg-[#EF4444] hover:bg-rose-600 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition active:scale-[0.99]"
          >
            <Ban className="w-4 h-4" />
            <span>{!isUserBanned(selectedUser) ? 'Ban User' : 'Unban User'}</span>
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
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Name / Username</label>
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
                        <option key={v} value={v}>
                          VIP {v}
                        </option>
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
                {!isUserBanned(selectedUser)
                  ? `Ban User ${selectedUser.uid}?`
                  : `Unban User ${selectedUser.uid}?`}
              </h3>
              <form onSubmit={handleConfirmBanToggle} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">
                    Administrative Reason *
                  </label>
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
  // MAIN SCREEN: ADVANCED USER MANAGEMENT DASHBOARD (FILTERS, FRAUD, EXPORT/IMPORT)
  // ============================================================================
  const activeWalletTarget = walletEditTargetUser || selectedUser;

  return (
    <div className="space-y-4">
      {/* 1. EXPORT & IMPORT TOOLBAR (CSV & JSON) */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-md flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <FileSpreadsheet className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-xs font-black text-slate-100">
              User Data Export & Import (CSV / JSON)
            </div>
            <div className="text-[10px] text-slate-400">
              Filtered: <strong className="text-amber-300">{filteredAndSortedUsers.length}</strong> users · Total Database: <strong className="text-emerald-300">{users.length}</strong> users
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleExportCSV(filteredAndSortedUsers, 'filtered')}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center space-x-1 transition shadow-xs"
          >
            <Download className="w-3 h-3" />
            <span>Export Filtered (CSV)</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportJSON(filteredAndSortedUsers, 'filtered')}
            className="px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center space-x-1 transition shadow-xs"
          >
            <Download className="w-3 h-3" />
            <span>Export Filtered (JSON)</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV(users, 'all')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] flex items-center space-x-1 transition"
          >
            <Download className="w-3 h-3 text-amber-400" />
            <span>All (CSV)</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportJSON(users, 'all')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] flex items-center space-x-1 transition"
          >
            <Download className="w-3 h-3 text-amber-400" />
            <span>All (JSON)</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv,application/json,text/csv"
            onChange={handleImportUsersFile}
            className="hidden"
          />
          <button
            type="button"
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center space-x-1 transition shadow-xs disabled:opacity-50"
          >
            <Upload className="w-3 h-3" />
            <span>{isImporting ? 'Importing...' : 'Import Users (JSON / CSV)'}</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH BAR + SORT DROPDOWN + SYNC BUTTON */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Instant Search by Mobile Number, User UID, Name, or Device ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-xs focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* D. Balance & Activity Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-3 py-2 shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 mr-1.5 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none pr-2"
            >
              <option value="wallet_desc">Wallet: High to Low 💰</option>
              <option value="wallet_asc">Wallet: Low to High</option>
              <option value="newest">Newest Joined First</option>
              <option value="oldest">Oldest Joined First</option>
              <option value="recent_active">Recently Active</option>
              <option value="highest_deposit">Highest Depositor</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleForceFirebaseSync}
            disabled={isSyncingFirebase}
            className="px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFirebase ? 'animate-spin' : ''}`} />
            <span>Refresh 🔄</span>
          </button>
        </div>
      </div>

      {/* 3. B: ROLE & STATUS FILTER TABS */}
      <div className="space-y-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Filter className="w-3 h-3 text-amber-400" />
            <span>Role & Status Filter Tabs</span>
          </span>
          <button
            type="button"
            onClick={handleResetAllFilters}
            className="text-amber-400 hover:text-amber-300 font-bold underline text-[10px]"
          >
            Reset All Filters
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'all', label: `All Users (${counts.all})` },
              { id: 'admins', label: `Admins Only 👑 (${counts.admins})` },
              { id: 'regular', label: `Regular Players 👤 (${counts.regular})` },
              { id: 'online', label: `Online Now 🟢 (${counts.online})` },
              { id: 'banned', label: `Banned / Blocked 🚫 (${counts.banned})` }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                roleStatusFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4. C: WALLET, VIP & FRAUD FILTERS */}
        <div className="pt-2 border-t border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Wallet, VIP & Multi-Account Fraud Filters
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'all', label: `All Wallets (${counts.all})` },
                { id: 'vip_deposited', label: `VIP / Deposited Users 💎 (${counts.vip_deposited})` },
                { id: 'free_bonus', label: `Free Bonus Users 🎁 (${counts.free_bonus})` },
                { id: 'low_balance', label: `Low / Zero Balance 📉 (${counts.low_balance})` },
                { id: 'duplicate_device', label: `Duplicate Device Fraud ⚠️ (${counts.duplicate_device})` }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFraudWalletFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  fraudWalletFilter === tab.id
                    ? tab.id === 'duplicate_device'
                      ? 'bg-rose-500 text-white font-black shadow-sm'
                      : 'bg-sky-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. E: COMPLETE DATE RANGE FILTER */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={dateFilterMode}
              onChange={(e) => setDateFilterMode(e.target.value as DateFilterMode)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-amber-300 focus:outline-none"
            >
              <option value="createdAt">By Joining Date (createdAt)</option>
              <option value="lastLogin">By Last Login (lastLogin)</option>
            </select>

            {(
              [
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'last7', label: 'Last 7 Days' },
                { id: 'last30', label: 'Last 30 Days' }
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setDatePreset(preset.id);
                  setCustomFromDate('');
                  setCustomToDate('');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  datePreset === preset.id
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-semibold">From:</span>
            <input
              type="date"
              value={customFromDate}
              onChange={(e) => {
                setCustomFromDate(e.target.value);
                setDatePreset('custom');
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 font-mono"
            />
            <span className="text-slate-400 font-semibold">To:</span>
            <input
              type="date"
              value={customToDate}
              onChange={(e) => {
                setCustomToDate(e.target.value);
                setDatePreset('custom');
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 6. F: USER ROWS WITH COMPLETE INFO & QUICK ACTIONS */}
      <div className="space-y-2.5">
        {filteredAndSortedUsers.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs space-y-2">
            <div>No users found matching your active filters.</div>
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredAndSortedUsers.map((u) => {
            const uIsAdmin = isUserAdmin(u);
            const uIsBanned = isUserBanned(u);
            const uIsOnline = isUserOnlineNow(u);
            const uWallet = getUserWallet(u);
            const uTotalDep = getUserTotalDeposit(u);
            const uTotalWit = getUserTotalWithdraw(u);
            const uDeviceId = getPrimaryDeviceId(u);
            const isDupDevice = duplicateDeviceUidSet.has(u.uid);
            const sharedCount = isDupDevice ? getSharedDeviceCount(u) : 1;

            return (
              <div
                key={u.uid}
                onClick={() => setSelectedUserUid(u.uid)}
                className={`p-3.5 rounded-2xl bg-white border shadow-xs hover:border-blue-400 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition ${
                  isDupDevice ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/90'
                }`}
              >
                {/* Left: User Identity, Timestamps, Device ID & Fraud Badges */}
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="relative shrink-0">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center ${
                        uIsAdmin
                          ? 'bg-amber-100 text-amber-700'
                          : uIsBanned
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-blue-100 text-[#2563EB]'
                      }`}
                    >
                      {uIsAdmin ? <Crown className="w-6 h-6" /> : <User className="w-6 h-6" />}
                    </div>
                    {uIsOnline && (
                      <span
                        className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"
                        title="Online Now"
                      />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {u.name || u.username}
                      </span>
                      <span className="font-mono text-xs text-slate-500">({u.uid})</span>
                      {uIsAdmin && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950">
                          👑 ADMIN
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          !uIsBanned ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {!uIsBanned ? 'Active' : 'Banned'}
                      </span>
                      {uTotalDep > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                          💎 VIP Depositor
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          🎁 Free Bonus
                        </span>
                      )}
                      {isDupDevice && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>⚠️ Duplicate Device ({sharedCount} Accounts)</span>
                        </span>
                      )}
                    </div>

                    {/* Phone, Password, Device ID Badge */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-mono">
                      <span className="font-bold text-slate-900">+91 {u.phone}</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px]">
                        🔑 Pass: {u.passwordHash || 'Not Set'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                          isDupDevice
                            ? 'bg-rose-100 border border-rose-300 text-rose-800'
                            : 'bg-slate-100 border border-slate-200 text-slate-700'
                        }`}
                        title={`Bound: ${u.boundDeviceId || 'None'} | Last Used: ${uDeviceId || 'None'}`}
                      >
                        📱 Device: {uDeviceId ? uDeviceId.slice(0, 16) : 'Unbound'}
                        {u.boundDeviceId ? ' 🔒' : ''}
                      </span>
                    </div>

                    {/* Formatted Joining Date & Last Active Time (DD/MM/YYYY, hh:mm A) */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span>
                        <strong>Joined:</strong> {formatDateTime(u.createdAt)}
                      </span>
                      <span>
                        <strong>Last Active:</strong> {formatDateTime(u.lastLogin || u.lastActive)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Wallet Metrics & Quick Row Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-end xl:items-center justify-between gap-2.5 shrink-0 border-t lg:border-t-0 pt-2.5 lg:pt-0 border-slate-100">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Wallet</div>
                      <div className="font-mono font-black text-sm text-slate-900 tabular-nums">
                        ₹{uWallet.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-emerald-600 font-semibold uppercase">Deposit</div>
                      <div className="font-mono font-bold text-xs text-emerald-700 tabular-nums">
                        ₹{uTotalDep.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-rose-600 font-semibold uppercase">Withdraw</div>
                      <div className="font-mono font-bold text-xs text-rose-700 tabular-nums">
                        ₹{uTotalWit.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Quick Row Action Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Make/Remove Admin 👑 */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickToggleAdmin(u, e)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition ${
                        uIsAdmin
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900'
                      }`}
                      title="Make or Remove Admin Role (Resets boundDeviceId on promotion)"
                    >
                      {uIsAdmin ? '👑 Admin ON' : '👑 Make Admin'}
                    </button>

                    {/* Edit Wallet ✏️ */}
                    <button
                      type="button"
                      onClick={() => {
                        setWalletEditTargetUser(u);
                        setBalanceModalMode('set');
                        setAdjustAmount(uWallet);
                        setAdjustReason('Quick Wallet Edit');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition"
                      title="Edit Wallet Balance"
                    >
                      ✏️ Wallet
                    </button>

                    {/* Reset Device Lock 🔓 */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickResetDeviceLock(u, e)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition"
                      title="Reset Device Lock (Clears boundDeviceId in 1 click)"
                    >
                      🔓 Reset Device
                    </button>

                    {/* Ban/Unban 🚫 */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickToggleBan(u, e)}
                      className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition ${
                        uIsBanned
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                      }`}
                      title={uIsBanned ? 'Unban User' : 'Ban User'}
                    >
                      {uIsBanned ? '✅ Unban' : '🚫 Ban'}
                    </button>

                    {/* Hard Delete */}
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteUser(u)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                      title="Permanent Hard-Delete User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
          <h4 className="font-bold text-slate-800 text-xs">
            Archived User Backups ({deletedBackups.length})
          </h4>
          {deletedBackups.map((bk) => (
            <div
              key={bk.uid}
              className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50"
            >
              <span>
                {bk.username} ({bk.uid}) · ₹{bk.balance.toFixed(0)}
              </span>
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

      {/* Quick Wallet Edit Modal (Set / Add / Deduct) */}
      {balanceModalMode && activeWalletTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Edit Wallet ✏️ — {activeWalletTarget.name || activeWalletTarget.username} ({activeWalletTarget.uid})
              </h3>
              <button
                type="button"
                onClick={() => {
                  setBalanceModalMode(null);
                  setWalletEditTargetUser(null);
                }}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setBalanceModalMode('set');
                  setAdjustAmount(getUserWallet(activeWalletTarget));
                }}
                className={`py-2 rounded-lg transition ${
                  balanceModalMode === 'set' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                Set Exact Balance
              </button>
              <button
                type="button"
                onClick={() => {
                  setBalanceModalMode('credit');
                  setAdjustAmount(500);
                }}
                className={`py-2 rounded-lg transition ${
                  balanceModalMode === 'credit' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                }`}
              >
                + Add Funds
              </button>
              <button
                type="button"
                onClick={() => {
                  setBalanceModalMode('debit');
                  setAdjustAmount(100);
                }}
                className={`py-2 rounded-lg transition ${
                  balanceModalMode === 'debit' ? 'bg-rose-600 text-white' : 'text-slate-600'
                }`}
              >
                - Deduct Funds
              </button>
            </div>

            <form onSubmit={handleExecuteBalanceAdjustment} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  {balanceModalMode === 'set' ? 'New Wallet Balance (₹)' : 'Amount (₹)'}
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono font-bold text-base text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Audit Note / Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manual VIP bonus / Balance update"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setBalanceModalMode(null);
                    setWalletEditTargetUser(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  Save Wallet Update
                </button>
              </div>
            </form>
          </div>
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
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Full Name / Username
                </label>
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
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">
                    Mobile Number (10 digits)
                  </label>
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
                  <label className="text-xs font-semibold text-amber-700 mb-1 block">
                    Login Password
                  </label>
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
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">
                    Opening Balance (₹)
                  </label>
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
                      <option key={v} value={v}>
                        VIP {v}
                      </option>
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
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                  Irreversible Action
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">UID:</span>
                <span className="font-mono font-black text-slate-900">{confirmDeleteUser.uid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Username:</span>
                <span className="font-bold text-slate-900">
                  {confirmDeleteUser.name || confirmDeleteUser.username}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Mobile Phone:</span>
                <span className="font-mono font-bold text-slate-900">+91 {confirmDeleteUser.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Wallet Balance:</span>
                <span className="font-mono font-black text-rose-700">
                  ₹{getUserWallet(confirmDeleteUser).toFixed(2)}
                </span>
              </div>
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
