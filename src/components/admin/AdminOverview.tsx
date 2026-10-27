import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  ShieldCheck,
  ArrowDownCircle,
  ArrowUpCircle,
  Gift,
  Coins,
  TrendingDown,
  CheckCircle2,
  UserPlus,
  Award,
  AlertTriangle,
  Settings,
  Clock
} from 'lucide-react';
import { store } from '../../services/store';
import { apiClient } from '../../services/apiClient';

interface AdminOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigateTab }) => {
  const [adminSettings, setAdminSettings] = useState(store.getAdminSettings());

  useEffect(() => {
    return store.subscribe(() => {
      setAdminSettings(store.getAdminSettings());
    });
  }, []);

  const [confirmMaintTap, setConfirmMaintTap] = useState(false);

  const handleToggleMaintenance = async (nextState: boolean) => {
    if (nextState && !confirmMaintTap) {
      setConfirmMaintTap(true);
      setTimeout(() => setConfirmMaintTap(false), 4000);
      return;
    }
    setConfirmMaintTap(false);
    const updated = { ...adminSettings, maintenanceMode: nextState };
    setAdminSettings(updated);
    store.updateAdminSettings(updated, 'MasterAdmin_01');
    await apiClient
      .toggleMaintenanceMode(nextState, updated.maintenanceMessage, updated.maintenanceEstimatedResumeTime, 'MasterAdmin_01')
      .catch(() => {});
  };
  const users = Object.values(store.getUsers());
  const liveBets = store.getLiveBets();
  const deposits = store.getDeposits();
  const withdrawals = store.getWithdrawals();
  const pastRounds = store.getPastRounds();
  const allTransactions = store.getAllTransactionsFlat();

  const totalUsers = users.length;
  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const activeRatio = totalUsers > 0 ? Math.round((activeUsersCount / totalUsers) * 100) : 100;

  const approvedDeposits = deposits.filter((d) => d.status === 'approved');
  const approvedWithdrawals = withdrawals.filter((w) => w.status === 'approved');
  const pendingDeposits = deposits.filter((d) => d.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  const totalDepositsAmount = approvedDeposits.reduce((acc, d) => acc + d.amount, 0);
  const totalWithdrawalsAmount = approvedWithdrawals.reduce((acc, w) => acc + w.amount, 0);

  // Today's & Cumulative Bet Stats
  const totalBetsCount = users.reduce((acc, u) => acc + (u.totalBetsCount || 0), 0) + liveBets.length;
  const totalWinAmount =
    users.reduce((acc, u) => acc + (u.totalWonAmount || 0), 0) +
    pastRounds.reduce((acc, r) => acc + r.totalPayout, 0);
  const totalLossAmount =
    users.reduce((acc, u) => acc + (u.totalLostAmount || 0), 0) +
    Math.max(0, pastRounds.reduce((acc, r) => acc + (r.totalBetVolume - r.totalPayout), 0));

  const formatTimeAgo = (ts: number) => {
    const diffMin = Math.max(1, Math.floor((Date.now() - ts) / 60000));
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  };

  // Build real Recent Activities feed from actual transactions
  const recentActivities = allTransactions.slice(0, 8).map((tx) => {
    if (tx.type === 'deposit') {
      return {
        id: tx.id,
        title: 'Deposit Approved',
        subtitle: tx.uid,
        amount: `₹${tx.amount.toLocaleString('en-IN')}`,
        time: formatTimeAgo(tx.timestamp),
        iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        icon: CheckCircle2
      };
    }
    if (tx.type === 'withdrawal') {
      return {
        id: tx.id,
        title: 'Withdrawal Request',
        subtitle: tx.uid,
        amount: `₹${tx.amount.toLocaleString('en-IN')}`,
        time: formatTimeAgo(tx.timestamp),
        iconBg: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
        icon: ArrowUpCircle
      };
    }
    if (tx.type === 'signup_bonus' || tx.type === 'first_deposit_bonus' || tx.type === 'referral_bonus') {
      return {
        id: tx.id,
        title: 'Bonus Credited',
        subtitle: tx.uid,
        amount: `₹${tx.amount.toLocaleString('en-IN')}`,
        time: formatTimeAgo(tx.timestamp),
        iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        icon: Award
      };
    }
    if (tx.type === 'gift_code') {
      return {
        id: tx.id,
        title: 'Gift Code Redeemed',
        subtitle: tx.uid,
        amount: `₹${tx.amount.toLocaleString('en-IN')}`,
        time: formatTimeAgo(tx.timestamp),
        iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
        icon: Gift
      };
    }
    return {
      id: tx.id,
      title: tx.category === 'credit' ? 'Wallet Credited' : 'Bet Placed',
      subtitle: tx.uid,
      amount: `₹${tx.amount.toLocaleString('en-IN')}`,
      time: formatTimeAgo(tx.timestamp),
      iconBg:
        tx.category === 'credit'
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      icon: tx.category === 'credit' ? Coins : UserPlus
    };
  });

  return (
    <div className="space-y-5">
      {/* Maintenance Mode Emergency Status Banner */}
      <div
        className={`p-4 rounded-2xl border transition-all shadow-xl flex flex-wrap items-center justify-between gap-3 ${
          adminSettings.maintenanceMode
            ? 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/60 border-rose-500/80 shadow-rose-900/30'
            : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              adminSettings.maintenanceMode
                ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${adminSettings.maintenanceMode ? 'animate-pulse text-rose-400' : ''}`}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-brand font-black text-sm text-white">Maintenance Mode</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  adminSettings.maintenanceMode
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {adminSettings.maintenanceMode ? '● ACTIVE — BETTING PAUSED' : '● NORMAL OPERATION'}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {adminSettings.maintenanceMode
                ? (adminSettings.maintenanceMessage || 'Placing new bets is frozen on all games.')
                : 'All games are active and accepting bets normally.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => handleToggleMaintenance(!adminSettings.maintenanceMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 shadow ${
              adminSettings.maintenanceMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <span>
              {adminSettings.maintenanceMode
                ? 'Turn OFF Maintenance'
                : confirmMaintTap
                ? '⚠️ Tap Again to Confirm ON'
                : 'Toggle Maintenance ON'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('settings')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Configure Maintenance Message & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Colorful KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* 1. Total Users */}
        <button
          type="button"
          onClick={() => onNavigateTab('users')}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white shadow-lg text-left flex items-center space-x-3 transition active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-emerald-100 truncate">Total Users</div>
            <div className="font-mono font-black text-xl sm:text-2xl leading-tight tabular-nums">
              {totalUsers.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-100 font-semibold truncate mt-0.5">
              +{users.filter((u) => Date.now() - u.createdAt < 86400000 * 7).length} recent
            </div>
          </div>
        </button>

        {/* 2. Active Users */}
        <button
          type="button"
          onClick={() => onNavigateTab('users')}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-lg text-left flex items-center space-x-3 transition active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-emerald-100 truncate">Active Users</div>
            <div className="font-mono font-black text-xl sm:text-2xl leading-tight tabular-nums">
              {activeUsersCount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-100 font-semibold truncate mt-0.5">
              {activeRatio}% active
            </div>
          </div>
        </button>

        {/* 3. Total Deposits */}
        <button
          type="button"
          onClick={() => onNavigateTab('deposits')}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white shadow-lg text-left flex items-center space-x-3 transition active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-purple-100 truncate">Total Deposits</div>
            <div className="font-mono font-black text-lg sm:text-xl leading-tight tabular-nums truncate">
              ₹{totalDepositsAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-purple-100 font-semibold truncate mt-0.5">
              {approvedDeposits.length} approved
            </div>
          </div>
        </button>

        {/* 4. Total Withdrawals */}
        <button
          type="button"
          onClick={() => onNavigateTab('withdrawals')}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white shadow-lg text-left flex items-center space-x-3 transition active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <ArrowUpCircle className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-amber-100 truncate">Total Withdrawals</div>
            <div className="font-mono font-black text-lg sm:text-xl leading-tight tabular-nums truncate">
              ₹{totalWithdrawalsAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-amber-100 font-semibold truncate mt-0.5">
              {approvedWithdrawals.length} settled
            </div>
          </div>
        </button>

        {/* 5. Pending Deposits */}
        <button
          type="button"
          onClick={() => onNavigateTab('deposits')}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white shadow-lg text-left flex items-center space-x-3 transition active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <ArrowDownCircle className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-rose-100 truncate">Pending Deposits</div>
            <div className="font-mono font-black text-2xl leading-tight tabular-nums">
              {pendingDeposits.length}
            </div>
          </div>
        </button>

        {/* 6. Pending Withdrawals */}
        <button
          type="button"
          onClick={() => onNavigateTab('withdrawals')}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white shadow-lg text-left flex items-center space-x-3 transition active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <ArrowUpCircle className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-blue-100 truncate">Pending Withdrawals</div>
            <div className="font-mono font-black text-2xl leading-tight tabular-nums">
              {pendingWithdrawals.length}
            </div>
          </div>
        </button>
      </div>

      {/* Today's Overview Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="font-bold text-slate-100 text-base">Today's Overview</h3>
          <button
            type="button"
            onClick={() => onNavigateTab('bets_logs')}
            className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg text-center space-y-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Gift className="w-5 h-5" />
            </div>
            <div className="font-mono font-black text-base sm:text-lg text-slate-100 tabular-nums">
              {totalBetsCount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 font-semibold">Total Bets</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg text-center space-y-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Coins className="w-5 h-5" />
            </div>
            <div className="font-mono font-black text-base sm:text-lg text-emerald-400 tabular-nums truncate">
              ₹{totalWinAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 font-semibold">Win Amount</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg text-center space-y-1">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="font-mono font-black text-base sm:text-lg text-rose-400 tabular-nums truncate">
              ₹{totalLossAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 font-semibold">Loss Amount</div>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="font-bold text-slate-100 text-base">Recent Activities</h3>
          <button
            type="button"
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-bold text-amber-400 hover:underline"
          >
            All Ledger &rarr;
          </button>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl divide-y divide-slate-800/80 overflow-hidden">
          {recentActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-100 text-xs sm:text-sm truncate">
                      {act.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      {act.subtitle} · {act.time}
                    </div>
                  </div>
                </div>

                <div className="font-mono font-black text-xs sm:text-sm text-amber-400 tabular-nums shrink-0">
                  {act.amount}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
