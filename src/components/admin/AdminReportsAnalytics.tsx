import React from 'react';
import {
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Dice5,
  Award,
  Download
} from 'lucide-react';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';

export const AdminReportsAnalytics: React.FC = () => {
  const { showToast } = useToast();
  const users = Object.values(store.getUsers());
  const deposits = store.getDeposits();
  const withdrawals = store.getWithdrawals();
  const transactions = store.getAllTransactionsFlat();
  const pastRounds = store.getPastRounds();

  const approvedDeposits = deposits.filter((d) => d.status === 'approved');
  const approvedWithdrawals = withdrawals.filter((w) => w.status === 'approved');

  const totalDeposits = approvedDeposits.reduce((s, d) => s + d.amount, 0);
  const totalWithdrawals = approvedWithdrawals.reduce((s, w) => s + w.amount, 0);
  const netCashflow = totalDeposits - totalWithdrawals;

  const totalBetVolume =
    transactions
      .filter((t) => t.type === 'bet_placement' && t.status === 'completed')
      .reduce((s, t) => s + t.amount, 0) +
    pastRounds.reduce((s, r) => s + r.totalBetVolume, 0);

  const totalGamePayouts =
    transactions
      .filter((t) => t.type === 'game_payout' && t.status === 'completed')
      .reduce((s, t) => s + t.amount, 0) +
    pastRounds.reduce((s, r) => s + r.totalPayout, 0);

  const grossGamingRevenue = totalBetVolume - totalGamePayouts;
  const totalBonusesDistributed = transactions
    .filter(
      (t) =>
        (t.type === 'signup_bonus' ||
          t.type === 'first_deposit_bonus' ||
          t.type === 'referral_bonus' ||
          t.type === 'gift_code') &&
        t.status === 'completed'
    )
    .reduce((s, t) => s + t.amount, 0);

  const totalUserWalletLiability = users.reduce((s, u) => s + (u.balance || 0), 0);

  const handleExportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      metrics: {
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.status === 'active').length,
        totalDeposits,
        totalWithdrawals,
        netCashflow,
        totalBetVolume,
        totalGamePayouts,
        grossGamingRevenue,
        totalBonusesDistributed,
        totalUserWalletLiability
      }
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bingo777_analytics_report_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Analytics report downloaded', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-100 text-sm">Real-Time Financial & Game Analytics</h3>
          <p className="text-xs text-slate-400">Computed from live database transactions & rounds</p>
        </div>
        <button
          type="button"
          onClick={handleExportReport}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-md transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Approved Deposits</span>
            <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono font-black text-lg text-slate-100 tabular-nums">
            ₹{totalDeposits.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            {approvedDeposits.length} verified requests
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/30 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Settled Withdrawals</span>
            <ArrowUpCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-mono font-black text-lg text-slate-100 tabular-nums">
            ₹{totalWithdrawals.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-rose-400 font-semibold">
            {approvedWithdrawals.length} completed payouts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Net Cashflow</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div
            className={`font-mono font-black text-lg tabular-nums ${
              netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {netCashflow >= 0 ? '+' : ''}₹{netCashflow.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Deposits minus Withdrawals</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Bonuses & Gifts</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono font-black text-lg text-amber-400 tabular-nums">
            ₹{totalBonusesDistributed.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Signup + Deposit + Referral + Gift</div>
        </div>
      </div>

      {/* Game Performance & Margin Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <Dice5 className="w-5 h-5 text-amber-400" />
          <h4 className="font-bold text-slate-100 text-sm">Game Turnover & House Margin</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">Total Betting Volume</span>
            <span className="font-mono font-black text-lg text-slate-100 tabular-nums mt-1 block">
              ₹{totalBetVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">Total Player Winnings</span>
            <span className="font-mono font-black text-lg text-amber-400 tabular-nums mt-1 block">
              ₹{totalGamePayouts.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">Gross Gaming Revenue (GGR)</span>
            <span
              className={`font-mono font-black text-lg tabular-nums mt-1 block ${
                grossGamingRevenue >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              ₹{grossGamingRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Visual Ratio Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Payout Ratio (RTP)</span>
            <span className="font-mono text-amber-400">
              {totalBetVolume > 0 ? ((totalGamePayouts / totalBetVolume) * 100).toFixed(1) : '0.0'}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex">
            <div
              className="bg-amber-500 h-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  totalBetVolume > 0 ? (totalGamePayouts / totalBetVolume) * 100 : 50
                )}%`
              }}
            />
            <div className="bg-emerald-500 flex-1 h-full" />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Amber: Player Payouts</span>
            <span>Emerald: House Retained Margin</span>
          </div>
        </div>
      </div>

      {/* Top Players by Balance & Activity */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-100 text-sm">Top Player Wallets & Liability</h4>
          <span className="text-xs font-mono font-bold text-amber-400">
            Total Liability: ₹{totalUserWalletLiability.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="space-y-2">
          {[...users]
            .sort((a, b) => b.balance - a.balance)
            .slice(0, 6)
            .map((u) => (
              <div
                key={u.uid}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-100">{u.username}</span>{' '}
                  <span className="font-mono text-slate-400">({u.uid})</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Bets: {u.totalBetsCount} · Won: ₹{u.totalWonAmount.toLocaleString('en-IN')} · Lost: ₹
                    {u.totalLostAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="font-mono font-black text-amber-400 text-sm tabular-nums">
                  ₹{u.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
