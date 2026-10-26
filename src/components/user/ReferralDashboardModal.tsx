import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Copy, 
  Share2, 
  Gift, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  Award,
  XCircle,
  Sparkles,
  Layers,
  Wallet,
  Zap,
  Calculator,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRecord, ReferralRecord, AdminSettings, MlmDashboardData } from '../../types';
import { store } from '../../services/store';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../common/Toast';

interface ReferralDashboardModalProps {
  user: UserRecord;
  onClose: () => void;
  onOpenDeposit?: () => void;
}

export const ReferralDashboardModal: React.FC<ReferralDashboardModalProps> = ({
  user,
  onClose,
  onOpenDeposit
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'mlm_hub' | 'direct_bonus'>('mlm_hub');
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [isClaimingMlm, setIsClaimingMlm] = useState(false);

  // Interactive MLM Calculator state
  const [calcL1Count, setCalcL1Count] = useState<number>(10);
  const [calcDailyTurnover, setCalcDailyTurnover] = useState<number>(2000);

  const [mlmData, setMlmData] = useState<MlmDashboardData>(() => store.getMlmDashboardData(user.uid));
  const adminSettings: AdminSettings = store.getAdminSettings();
  const referrals: ReferralRecord[] = store.getUserReferrals(user.uid);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setMlmData(store.getMlmDashboardData(user.uid));
    });
    return () => unsub();
  }, [user.uid]);

  const referralCode = user.referralCode || 'BINGO777';
  const shareUrl = `https://bingo777.in/?ref=${referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    showToast(`Referral Code "${referralCode}" copied to clipboard!`, 'info');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    showToast('Referral invitation link copied!', 'info');
  };

  const handleClaimMlmCommission = () => {
    if (mlmData.unclaimedCommission <= 0) {
      showToast('No unclaimed MLM commission available right now. Simulate or wait for downline bets!', 'info');
      return;
    }
    setIsClaimingMlm(true);
    setTimeout(() => {
      const res = store.claimMlmCommission(user.uid);
      setIsClaimingMlm(false);
      if (res.success) {
        confetti({ particleCount: 110, spread: 80, origin: { y: 0.55 } });
        showToast(
          `🎉 ₹${res.claimedAmount?.toFixed(2)} 3-Tier MLM Commission credited to your main wallet!`,
          'success'
        );
        setMlmData(store.getMlmDashboardData(user.uid));
      } else {
        showToast(res.error || 'Could not claim MLM commission', 'error');
      }
    }, 300);
  };

  const handleSimulateDownline = () => {
    const res = store.simulateMlmDownlineTurnover(user.uid);
    if (res.success) {
      setMlmData(store.getMlmDashboardData(user.uid));
      showToast(`⚡ Live Downline Turnover: ${res.summary}`, 'success');
    }
  };

  const handleClaimBonus = async (ref: ReferralRecord) => {
    if (ref.status === 'credited') {
      showToast('This referral bonus has already been credited to your wallet.', 'info');
      return;
    }
    if (ref.qualifyingDaysCompleted < adminSettings.referralRequiredDays) {
      showToast(
        `Requires ${adminSettings.referralRequiredDays} qualifying betting days (Current: ${ref.qualifyingDaysCompleted}/${adminSettings.referralRequiredDays})`,
        'error'
      );
      return;
    }

    setClaimingId(ref.id);
    try {
      const serverRes = await apiClient.claimReferral(ref.id, user.uid);
      if (!serverRes.success) {
        showToast(serverRes.error || 'Failed to claim referral bonus from server', 'error');
        setClaimingId(null);
        return;
      }

      store.claimReferralBonus(ref.id, user.uid);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast(`🎉 ₹${ref.bonusAmount} Referral Bonus successfully credited to your wallet!`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error claiming bonus', 'error');
    } finally {
      setClaimingId(null);
    }
  };

  const totalEarned = referrals
    .filter((r) => r.status === 'credited')
    .reduce((sum, r) => sum + r.bonusAmount, 0);

  const pendingCount = referrals.filter(
    (r) => r.status === 'pending_deposit' || r.status === 'activity_in_progress'
  ).length;

  // Projected MLM Earnings Calculator math (assuming each L1 invites 3 L2, and each L2 invites 3 L3)
  const calcL2Count = calcL1Count * 3;
  const calcL3Count = calcL2Count * 3;
  const projL1Daily = (calcL1Count * calcDailyTurnover * 1.0) / 100;
  const projL2Daily = (calcL2Count * calcDailyTurnover * 0.5) / 100;
  const projL3Daily = (calcL3Count * calcDailyTurnover * 0.25) / 100;
  const projTotalDaily = projL1Daily + projL2Daily + projL3Daily;
  const projTotalMonthly = projTotalDaily * 30;

  const allNetworkMembers = [
    ...mlmData.level1Members,
    ...mlmData.level2Members,
    ...mlmData.level3Members
  ];
  const filteredMembers =
    selectedTierFilter === 'all'
      ? allNetworkMembers
      : allNetworkMembers.filter((m) => m.level === selectedTierFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-purple-900 to-amber-700 text-white flex items-center justify-between shadow-lg relative shrink-0 border-b border-amber-400/30">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1 shadow-sm">
              <Layers className="w-3 h-3" />
              <span>3-TIER MLM AFFILIATE & ₹{adminSettings.referralBonusAmount} REFER HUB</span>
            </span>
            <h3 className="font-brand font-black text-xl sm:text-2xl text-white leading-tight">
              Multi-Level Partner Commission Center
            </h3>
            <p className="text-xs font-medium text-amber-200/90">
              Earn L1 (1.0%) · L2 (0.5%) · L3 (0.25%) lifetime betting turnover commissions + ₹{adminSettings.referralBonusAmount} direct bonuses!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950/40 hover:bg-slate-950/70 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-white/15"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pt-3 bg-slate-950 border-b border-slate-800 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('mlm_hub')}
            className={`flex-1 py-2.5 px-3 rounded-t-2xl text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'mlm_hub'
                ? 'bg-indigo-950/60 text-amber-300 border-amber-400'
                : 'bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3-Tier MLM Commission (L1·L2·L3)</span>
            {mlmData.unclaimedCommission > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                ₹{mlmData.unclaimedCommission}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('direct_bonus')}
            className={`flex-1 py-2.5 px-3 rounded-t-2xl text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'direct_bonus'
                ? 'bg-amber-950/40 text-amber-300 border-amber-400'
                : 'bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Direct ₹{adminSettings.referralBonusAmount} Bonus & Welcome</span>
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Shared Referral Code & Invite Link Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Your Partner Code</span>
                <span className="font-mono font-black text-amber-300 text-base tracking-wider">
                  {referralCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center space-x-1 active:scale-95 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="truncate mr-2">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">3-Tier Affiliate Link</span>
                <span className="font-mono text-xs text-slate-300 truncate block">{shareUrl}</span>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-black flex items-center space-x-1 active:scale-95 transition shrink-0"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {activeTab === 'mlm_hub' ? (
            <>
              {/* 1. UNCLAIMED MLM COMMISSION VAULT & INSTANT WALLET WITHDRAWAL */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-950 to-emerald-950/60 border-2 border-emerald-500/40 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase">
                        Real-Time Affiliate Vault
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Today: +₹{mlmData.todayCommission.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-baseline space-x-2">
                      <span className="font-mono font-black text-2xl sm:text-3xl text-emerald-400">
                        ₹{mlmData.unclaimedCommission.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        Available to Claim
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Lifetime Earned: <strong className="text-amber-300">₹{mlmData.lifetimeCommission.toFixed(2)}</strong> · Total Withdrawn: <strong className="text-slate-200">₹{mlmData.totalClaimedCommission.toFixed(2)}</strong>
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <button
                      type="button"
                      onClick={handleClaimMlmCommission}
                      disabled={isClaimingMlm || mlmData.unclaimedCommission <= 0}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:brightness-105 disabled:opacity-40 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/60 flex items-center justify-center space-x-1.5 active:scale-95 transition"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>
                        {isClaimingMlm
                          ? 'Transferring...'
                          : `Withdraw ₹${mlmData.unclaimedCommission.toFixed(2)} to Main Wallet`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. 3-LEVEL PYRAMID TIER BREAKDOWN CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Level 1 */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-black text-[10px]">
                      LEVEL 1 · DIRECT
                    </span>
                    <span className="font-mono font-black text-sm text-amber-400">1.00%</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Members</span>
                      <span className="font-mono font-black text-lg text-white">
                        {mlmData.level1Members.length}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Commission</span>
                      <span className="font-mono font-black text-sm text-emerald-400">
                        ₹{mlmData.level1Members.reduce((s, m) => s + m.commissionGenerated, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5">
                    Friends directly invited by your referral code
                  </p>
                </div>

                {/* Level 2 */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-black text-[10px]">
                      LEVEL 2 · SUB-TEAM
                    </span>
                    <span className="font-mono font-black text-sm text-purple-400">0.50%</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Members</span>
                      <span className="font-mono font-black text-lg text-white">
                        {mlmData.level2Members.length}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Commission</span>
                      <span className="font-mono font-black text-sm text-emerald-400">
                        ₹{mlmData.level2Members.reduce((s, m) => s + m.commissionGenerated, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5">
                    Players invited by your Level 1 direct team
                  </p>
                </div>

                {/* Level 3 */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-sky-500/40 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-black text-[10px]">
                      LEVEL 3 · NETWORK
                    </span>
                    <span className="font-mono font-black text-sm text-sky-400">0.25%</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Members</span>
                      <span className="font-mono font-black text-lg text-white">
                        {mlmData.level3Members.length}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Commission</span>
                      <span className="font-mono font-black text-sm text-emerald-400">
                        ₹{mlmData.level3Members.reduce((s, m) => s + m.commissionGenerated, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5">
                    Extended network invited by Level 2 members
                  </p>
                </div>
              </div>

              {/* 3. INTERACTIVE MLM PASSIVE INCOME CALCULATOR */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      3-Tier Affiliate Passive Income Estimator
                    </h4>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    Est. Monthly: ₹{Math.round(projTotalMonthly).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Direct Invites (Level 1):</span>
                      <span className="font-mono font-black text-amber-300">{calcL1Count} Players</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="100"
                      step="2"
                      value={calcL1Count}
                      onChange={(e) => setCalcL1Count(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      Cascades to ~{calcL2Count} L2 & ~{calcL3Count} L3 players (3x viral ratio)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg. Daily Bet Volume / Player:</span>
                      <span className="font-mono font-black text-emerald-400">₹{calcDailyTurnover}</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="10000"
                      step="500"
                      value={calcDailyTurnover}
                      onChange={(e) => setCalcDailyTurnover(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      Daily Passive Commission: <strong className="text-emerald-300">₹{projTotalDaily.toFixed(0)}/day</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. DOWNLINE TEAM ROSTER WITH LEVEL FILTER */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Downline Affiliate Network ({filteredMembers.length})</span>
                  </h4>
                  <div className="flex gap-1">
                    {(['all', 1, 2, 3] as const).map((tier) => (
                      <button
                        key={String(tier)}
                        type="button"
                        onClick={() => setSelectedTierFilter(tier)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                          selectedTierFilter === tier
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {tier === 'all' ? 'All Tiers' : `L${tier}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.uid}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                              member.level === 1
                                ? 'bg-amber-500/20 text-amber-300'
                                : member.level === 2
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-sky-500/20 text-sky-300'
                            }`}
                          >
                            L{member.level}
                          </span>
                          <span className="font-bold text-slate-200">{member.username}</span>
                          {member.isActiveToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Active Today" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          Turnover: ₹{member.totalTurnover.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-black text-emerald-400 text-xs block">
                          +₹{member.commissionGenerated.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          {member.level === 1 ? '1.0% Rate' : member.level === 2 ? '0.5% Rate' : '0.25% Rate'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. REAL-TIME MLM COMMISSION LEDGER */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Live Commission Feed (L1 · L2 · L3)</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">Instant Settlement</span>
                </div>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {mlmData.recentCommissions.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className={`w-7 h-7 rounded-lg font-mono font-black text-[10px] flex items-center justify-center shrink-0 ${
                            item.level === 1
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : item.level === 2
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          L{item.level}
                        </span>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-200">{item.sourceUsername}</span>
                            <span className="text-[10px] text-slate-400">· {item.gameName}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Bet Volume: ₹{item.betTurnover} ({item.ratePercent}% tier rate)
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-black text-emerald-400 flex items-center justify-end space-x-0.5">
                          <ArrowUpRight className="w-3 h-3" />
                          <span>+₹{item.commissionAmount.toFixed(2)}</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold ${
                            item.claimed ? 'text-slate-500' : 'text-amber-300'
                          }`}
                        >
                          {item.claimed ? 'Withdrawn ✓' : 'Unclaimed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* TAB 2: DIRECT ₹120 REFERRAL BONUSES & WELCOME BONUS STATUS */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Your Real-Time Welcome & First Deposit Status</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Ledger Verified</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">Signup Bonus</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.signupBonusStatus === 'credited'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {user.signupBonusStatus === 'credited' ? 'Credited ✓' : 'Pending 1st Deposit'}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono font-black text-amber-300 text-lg">
                        ₹{user.signupBonusAmount || 120}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {user.signupBonusStatus === 'credited'
                          ? 'In Available Balance'
                          : 'Unlocks on 1st verified deposit'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">100% First Deposit Bonus</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.firstDepositBonusStatus === 'credited'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {user.firstDepositBonusStatus === 'credited' ? 'Credited ✓' : 'Pending 1st Deposit'}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono font-black text-emerald-400 text-lg">
                        {user.firstDepositBonusAmount ? `₹${user.firstDepositBonusAmount}` : '100% Cash Match'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {user.firstDepositBonusStatus === 'credited'
                          ? 'In Available Balance'
                          : 'Matches 100% of 1st deposit'}
                      </span>
                    </div>
                  </div>
                </div>

                {user.signupBonusStatus !== 'credited' && (
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenDeposit) onOpenDeposit();
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center space-x-1.5"
                  >
                    <span>Make 1st UPI Deposit to Claim ₹120 + 100% Bonus &rarr;</span>
                  </button>
                )}
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Direct Invited</span>
                  <span className="font-mono font-black text-base text-slate-100">{referrals.length}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">In Progress</span>
                  <span className="font-mono font-black text-base text-sky-400">{pendingCount}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-emerald-500/30">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Bonus Earned</span>
                  <span className="font-mono font-black text-base text-emerald-400">₹{totalEarned}</span>
                </div>
              </div>

              {/* 3-Step Qualification Rules */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Direct ₹{adminSettings.referralBonusAmount} Bonus Qualification Rules
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-mono font-bold text-amber-400 text-[10px] block">STEP 1</span>
                    <span className="font-bold text-slate-200 block">Sign Up via Code</span>
                    <span className="text-slate-400 text-[10px] block leading-tight">
                      Friend registers with your unique referral code.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-mono font-bold text-amber-400 text-[10px] block">STEP 2</span>
                    <span className="font-bold text-slate-200 block">1st Deposit Approved</span>
                    <span className="text-slate-400 text-[10px] block leading-tight">
                      Friend deposits via UPI and is verified by Master Admin.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-mono font-bold text-amber-400 text-[10px] block">STEP 3</span>
                    <span className="font-bold text-slate-200 block">10-Day Betting Activity</span>
                    <span className="text-slate-400 text-[10px] block leading-tight">
                      Friend completes {adminSettings.referralRequiredDays} days of settled bets (min ₹{adminSettings.referralDailyBetRequirement}/day).
                    </span>
                  </div>
                </div>
              </div>

              {/* User's Direct Referrals List */}
              <div className="space-y-2.5">
                {referrals.map((ref) => {
                  const percent = Math.min(
                    100,
                    Math.round((ref.qualifyingDaysCompleted / adminSettings.referralRequiredDays) * 100)
                  );
                  const isEligible =
                    ref.qualifyingDaysCompleted >= adminSettings.referralRequiredDays &&
                    ref.status !== 'credited';
                  const isCredited = ref.status === 'credited';

                  return (
                    <div
                      key={ref.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCredited
                          ? 'bg-slate-950/80 border-purple-500/30'
                          : isEligible
                          ? 'bg-amber-950/30 border-amber-400/80 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-200 text-sm">{ref.referredUsername}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              +91 {ref.referredPhone.slice(0, 3)}****{ref.referredPhone.slice(-2)}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            Registered: {new Date(ref.registeredAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>

                        <div className="text-right">
                          {isCredited ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold inline-flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-purple-400" />
                              <span>Credited (₹{ref.bonusAmount}) ✓</span>
                            </span>
                          ) : isEligible ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold inline-flex items-center space-x-1 animate-pulse">
                              <Award className="w-3 h-3 text-emerald-400" />
                              <span>Ready to Claim</span>
                            </span>
                          ) : ref.status === 'activity_in_progress' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold inline-flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-sky-400" />
                              <span>10-Day Activity In Progress</span>
                            </span>
                          ) : ref.status === 'rejected' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold inline-flex items-center space-x-1">
                              <XCircle className="w-3 h-3 text-rose-400" />
                              <span>Rejected</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold inline-flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3 text-amber-400" />
                              <span>Pending Deposit</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-semibold flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span>10-Day Qualifying Betting Progress:</span>
                          </span>
                          <span className="font-mono font-bold text-amber-300">
                            {ref.qualifyingDaysCompleted} / {adminSettings.referralRequiredDays} Days ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCredited
                                ? 'bg-purple-500'
                                : isEligible
                                ? 'bg-emerald-400'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {isEligible && (
                        <div className="mt-3 pt-2 border-t border-amber-500/30 flex justify-end">
                          <button
                            onClick={() => handleClaimBonus(ref)}
                            disabled={claimingId === ref.id}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-lg flex items-center space-x-1.5 active:scale-95 transition"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>
                              {claimingId === ref.id
                                ? 'Claiming...'
                                : `Claim ₹${ref.bonusAmount} Referral Bonus Now`}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>3-Tier MLM Commission (1% · 0.5% · 0.25%) + Direct Referral Ledger</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
