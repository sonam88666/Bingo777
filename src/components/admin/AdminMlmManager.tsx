import React, { useState, useEffect } from 'react';
import {
  Layers,
  Users,
  Settings,
  Gift,
  Zap,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  ShieldCheck,
  Percent,
  Award
} from 'lucide-react';
import { store } from '../../services/store';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../common/Toast';
import { AdminSettings, MlmCommissionEntry } from '../../types';

interface AdminMlmManagerProps {
  adminId: string;
  masterToken?: string;
}

export const AdminMlmManager: React.FC<AdminMlmManagerProps> = ({ adminId, masterToken }) => {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'members' | 'commissions' | 'settings'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [, setTick] = useState(0);

  const adminSettings: AdminSettings = store.getAdminSettings();
  const referrals = store.getReferrals();

  // Local state for admin editable MLM settings
  const [l1Rate, setL1Rate] = useState<number>(adminSettings.mlmLevel1Rate ?? 1.0);
  const [l2Rate, setL2Rate] = useState<number>(adminSettings.mlmLevel2Rate ?? 0.5);
  const [l3Rate, setL3Rate] = useState<number>(adminSettings.mlmLevel3Rate ?? 0.25);
  const [mlmFeatureEnabled, setMlmFeatureEnabled] = useState<boolean>(adminSettings.featureMlm !== false);
  const [bonusAmt, setBonusAmt] = useState<number>(adminSettings.referralBonusAmount || 120);

  const tokenToUse = masterToken || sessionStorage.getItem('bingo777_master_admin_token') || 'BINGO_MASTER_2026_KEY';
  const allCommissions: MlmCommissionEntry[] = store.getAllMlmCommissions();

  useEffect(() => {
    return store.subscribe(() => setTick((t) => t + 1));
  }, []);

  const handleSaveMlmSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      referralBonusAmount: Math.max(0, Number(bonusAmt)),
      mlmLevel1Rate: Math.max(0, Number(l1Rate)),
      mlmLevel2Rate: Math.max(0, Number(l2Rate)),
      mlmLevel3Rate: Math.max(0, Number(l3Rate)),
      featureMlm: mlmFeatureEnabled
    };
    store.updateAdminSettings(updated, adminId);
    await apiClient.updateSettings(updated, adminId, tokenToUse).catch(() => {});
    showToast('MLM Affiliate & Referral Master Settings successfully saved!', 'success');
  };

  const handleSimulateGlobalMlmTurnover = () => {
    const realReferral = referrals[0];
    if (!realReferral) {
      showToast('No active referrals found. Real users must invite downline players to distribute commissions.', 'info');
      return;
    }
    const targetUid = realReferral.referredUid;
    const turnover = Math.floor(1000 + Math.random() * 2000);
    store.distributeMlmCommission(targetUid, turnover, 'Admin Live Test');
    showToast(`⚡ Distributed ₹${turnover} turnover through real MLM 3-Tier chain!`, 'success');
  };

  const allUsers = Object.values(store.getUsers());

  return (
    <div className="space-y-4">
      {/* Top Banner Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border border-amber-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
              Master Admin Control Center
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold">● Fully Managed</span>
          </div>
          <h3 className="font-brand font-black text-xl text-white">
            3-Tier Multi-Level Marketing (MLM) & Referral Management
          </h3>
          <p className="text-xs text-slate-300">
            Configure L1 (1%), L2 (0.5%), L3 (0.25%) commission rates, monitor downline trees, and audit affiliate settlements.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimulateGlobalMlmTurnover}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg active:scale-95 transition shrink-0"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Simulate Global Network Turnover</span>
        </button>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl grid grid-cols-4 gap-1">
        {(['overview', 'members', 'commissions', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveSubTab(tab)}
            className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition ${
              activeSubTab === tab
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {tab === 'overview' ? 'Overview' : tab === 'members' ? 'Network Tree' : tab === 'commissions' ? 'Ledger' : 'Rates & Config'}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Referral Links</span>
              <span className="font-mono font-black text-2xl text-amber-300">{referrals.length}</span>
              <span className="text-[10px] text-slate-400 block">Active partnership chains</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Level 1 Direct Rate</span>
              <span className="font-mono font-black text-2xl text-amber-400">{l1Rate}%</span>
              <span className="text-[10px] text-emerald-400 block">Direct Turnover Cut</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Level 2 Sub-Team Rate</span>
              <span className="font-mono font-black text-2xl text-purple-400">{l2Rate}%</span>
              <span className="text-[10px] text-purple-300 block">Indirect Team Cut</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Level 3 Network Rate</span>
              <span className="font-mono font-black text-2xl text-sky-400">{l3Rate}%</span>
              <span className="text-[10px] text-sky-300 block">Extended Network Cut</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>MLM Affiliate Engine Status</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              The 3-Tier Multi-Level Marketing engine automatically intercepts every settled bet across Win Go, Aviator, Ludo, and K3 Dice. It calculates fractional commissions in real time and distributes them up the referrer tree to Level 1, Level 2, and Level 3 uplines instantly.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-amber-400 font-bold block">Auto-Distribution</span>
                <span className="text-slate-400 text-[11px]">Fired on every successful bet settlement without manual delay.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-purple-400 font-bold block">Wallet Integration</span>
                <span className="text-slate-400 text-[11px]">Users withdraw accumulated MLM commissions directly into their main wallet balance.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-sky-400 font-bold block">Audit Trail</span>
                <span className="text-slate-400 text-[11px]">Every claim and distribution is logged in the system audit trail and transaction ledger.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: NETWORK TREE & MEMBERS */}
      {activeSubTab === 'members' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search referrer or referee username / phone..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex gap-1.5 shrink-0">
              {(['all', 1, 2, 3] as const).map((tier) => (
                <button
                  key={String(tier)}
                  type="button"
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition ${
                    tierFilter === tier
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {tier === 'all' ? 'All Tiers' : `Tier L${tier}`}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Referrer (Upline)</th>
                    <th className="p-3.5">Referred Player (Downline)</th>
                    <th className="p-3.5">Registered Date</th>
                    <th className="p-3.5">10-Day Progress</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {referrals
                    .filter(
                      (r) =>
                        r.referrerUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.referredUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.referredPhone.includes(searchTerm)
                    )
                    .map((ref) => (
                      <tr key={ref.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-bold text-amber-300">{ref.referrerUsername}</td>
                        <td className="p-3.5 font-bold text-white">
                          {ref.referredUsername}
                          <span className="text-[10px] text-slate-500 font-mono block">
                            +91 {ref.referredPhone}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">
                          {new Date(ref.registeredAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-3.5 font-mono text-cyan-300">
                          {ref.qualifyingDaysCompleted} / {adminSettings.referralRequiredDays} Days
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 ${
                              ref.status === 'credited'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : ref.status === 'eligible'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            <span>{ref.status.toUpperCase()}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: COMMISSIONS LEDGER */}
      {activeSubTab === 'commissions' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                All Downline Commission Transactions ({allCommissions.length})
              </h4>
              <p className="text-[11px] text-slate-400">
                Real-time ledger of L1, L2, and L3 commissions distributed across the platform.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const headers = ['ID', 'Earner_UID', 'Source_Username', 'Level', 'Rate_Percent', 'Bet_Turnover', 'Commission_Amount', 'Game', 'Claimed', 'Timestamp'];
                const rows = allCommissions.map((c) => [
                  c.id,
                  c.earnerUid,
                  `"${c.sourceUsername}"`,
                  `L${c.level}`,
                  c.ratePercent,
                  c.betTurnover,
                  c.commissionAmount.toFixed(2),
                  `"${c.gameName}"`,
                  c.claimed ? 'CLAIMED' : 'UNCLAIMED',
                  new Date(c.timestamp).toISOString()
                ]);
                const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bingo777_mlm_commissions_${Date.now()}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('MLM Commission CSV Ledger downloaded!', 'success');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Earner UID</th>
                    <th className="p-3.5">Downline Player</th>
                    <th className="p-3.5">Tier</th>
                    <th className="p-3.5">Game / Source</th>
                    <th className="p-3.5">Turnover</th>
                    <th className="p-3.5">Commission</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {allCommissions.slice(0, 50).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono text-amber-300 font-bold">{c.earnerUid}</td>
                      <td className="p-3.5 font-bold text-white">{c.sourceUsername}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            c.level === 1
                              ? 'bg-amber-500/20 text-amber-300'
                              : c.level === 2
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-sky-500/20 text-sky-300'
                          }`}
                        >
                          L{c.level} ({c.ratePercent}%)
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300">{c.gameName}</td>
                      <td className="p-3.5 font-mono text-slate-400">₹{c.betTurnover.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 font-mono font-black text-emerald-400">+₹{c.commissionAmount.toFixed(2)}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            c.claimed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {c.claimed ? 'CLAIMED' : 'VAULT'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: RATES & CONFIGURATION */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveMlmSettings} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white">Configure MLM & Referral Parameters</h4>
            <p className="text-xs text-slate-400">Adjust tier percentages and direct referral bonus rewards instantly.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Level 1 Rate (%)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="10"
                value={l1Rate}
                onChange={(e) => setL1Rate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Level 2 Rate (%)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="10"
                value={l2Rate}
                onChange={(e) => setL2Rate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Level 3 Rate (%)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="10"
                value={l3Rate}
                onChange={(e) => setL3Rate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Direct Referral Bonus (₹)</label>
              <input
                type="number"
                min="0"
                max="5000"
                value={bonusAmt}
                onChange={(e) => setBonusAmt(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Master Program Switch</label>
              <div className="flex items-center space-x-3 pt-1">
                <button
                  type="button"
                  onClick={() => setMlmFeatureEnabled(!mlmFeatureEnabled)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                    mlmFeatureEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {mlmFeatureEnabled ? 'MLM ENGINE ACTIVE ✓' : 'MLM ENGINE PAUSED'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition active:scale-95"
            >
              Save MLM Master Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
