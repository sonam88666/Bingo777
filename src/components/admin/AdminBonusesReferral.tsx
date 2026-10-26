import React, { useState } from 'react';
import {
  Gift,
  Percent,
  Users,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { store } from '../../services/store';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../common/Toast';

interface AdminBonusesReferralProps {
  adminId: string;
  masterToken?: string;
}

export const AdminBonusesReferral: React.FC<AdminBonusesReferralProps> = ({ adminId, masterToken }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'settings' | 'referral_list' | 'history'>('settings');

  const currentSettings = store.getAdminSettings();
  const referrals = store.getReferrals();

  const [signupBonusEnabled, setSignupBonusEnabled] = useState<boolean>(currentSettings.featureSignupBonus !== false);
  const [signupBonusAmount, setSignupBonusAmount] = useState<number>(currentSettings.signupBonusAmount || 120);

  const [firstDepositEnabled, setFirstDepositEnabled] = useState<boolean>(currentSettings.featureFirstDepositBonus !== false);
  const [firstDepositPercent, setFirstDepositPercent] = useState<number>(currentSettings.firstDepositBonusPercent || 100);

  const [referralEnabled, setReferralEnabled] = useState<boolean>(currentSettings.featureReferrals !== false);
  const [referralBonusAmount, setReferralBonusAmount] = useState<number>(currentSettings.referralBonusAmount || 120);

  const [qualifyingBetAmount, setQualifyingBetAmount] = useState<number>(currentSettings.referralDailyBetRequirement || 100);
  const [qualificationDays, setQualificationDays] = useState<number>(currentSettings.referralRequiredDays || 10);
  const [checkInBonuses, setCheckInBonuses] = useState<number[]>(
    currentSettings.checkInBonuses || [10, 25, 50, 80, 150, 250, 500]
  );

  const tokenToUse = masterToken || sessionStorage.getItem('bingo777_master_admin_token') || 'BINGO_MASTER_2026_KEY';

  const handleToggleProgram = (
    program: 'signup_bonus' | 'first_deposit_bonus' | 'referrals',
    nextState: boolean
  ) => {
    if (program === 'signup_bonus') setSignupBonusEnabled(nextState);
    if (program === 'first_deposit_bonus') setFirstDepositEnabled(nextState);
    if (program === 'referrals') setReferralEnabled(nextState);

    store.toggleFeatureModule(
      program,
      nextState,
      true,
      adminId,
      `Toggled ${program} from Bonuses & Referral screen`
    );
    apiClient.toggleFeature(program, nextState, true, 'Bonus toggle update', adminId, tokenToUse).catch(() => {});
    showToast(`${program.replace(/_/g, ' ').toUpperCase()} ${nextState ? 'Enabled' : 'Disabled'}`, 'info');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      signupBonusAmount: Math.max(0, Number(signupBonusAmount)),
      firstDepositBonusPercent: Math.max(0, Number(firstDepositPercent)),
      referralBonusAmount: Math.max(0, Number(referralBonusAmount)),
      referralDailyBetRequirement: Math.max(10, Number(qualifyingBetAmount)),
      referralRequiredDays: Math.max(1, Number(qualificationDays)),
      checkInBonuses: checkInBonuses.map((v) => Math.max(0, Number(v))),
      featureSignupBonus: signupBonusEnabled,
      featureFirstDepositBonus: firstDepositEnabled,
      featureReferrals: referralEnabled
    };

    store.updateAdminSettings(updated, adminId);
    await apiClient.updateSettings(updated, adminId, tokenToUse).catch(() => {});
    showToast('Bonus & Referral settings saved and synchronized!', 'success');
  };

  const handleReviewReferral = async (refId: string, action: 'approve' | 'reject') => {
    const reason =
      action === 'approve'
        ? 'Qualifying activity verified by Master Admin'
        : 'Did not meet qualifying activity requirements';

    if (action === 'approve') {
      const res = store.adminApproveReferral(refId, adminId, reason);
      await apiClient.reviewReferral(refId, action, reason, adminId, tokenToUse).catch(() => {});
      if (res.success) {
        showToast('Referral bonus approved & credited to referrer wallet!', 'success');
      } else {
        showToast(res.error || 'Could not approve referral bonus', 'error');
      }
    } else {
      const res = store.adminRejectReferral(refId, adminId, reason);
      await apiClient.reviewReferral(refId, action, reason, adminId, tokenToUse).catch(() => {});
      if (res.success) {
        showToast('Referral request rejected', 'info');
      } else {
        showToast(res.error || 'Could not reject referral', 'error');
      }
    }
  };

  const activeReferrals = referrals.filter((r) => r.status !== 'credited' && r.status !== 'rejected');
  const historyReferrals = referrals.filter((r) => r.status === 'credited' || r.status === 'rejected');

  return (
    <div className="space-y-4">
      {/* Top Segmented Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl grid grid-cols-3 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          Settings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('referral_list')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'referral_list'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          Referral List ({activeReferrals.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          History ({historyReferrals.length})
        </button>
      </div>

      {/* TAB 1: SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-3.5">
          {/* Card 1: Signup Bonus */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-slate-100 text-sm">Signup Bonus</div>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="font-mono font-black text-base text-amber-400">₹</span>
                  <input
                    type="number"
                    min={0}
                    max={5000}
                    value={signupBonusAmount}
                    onChange={(e) => setSignupBonusAmount(Number(e.target.value))}
                    className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 font-mono font-black text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Pending until first deposit</div>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={signupBonusEnabled}
              onClick={() => handleToggleProgram('signup_bonus', !signupBonusEnabled)}
              className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center shrink-0 ${
                signupBonusEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
            </button>
          </div>

          {/* Card 2: First Deposit Bonus */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-slate-100 text-sm">First Deposit Bonus</div>
                <div className="flex items-center space-x-1.5 mt-1">
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={firstDepositPercent}
                    onChange={(e) => setFirstDepositPercent(Number(e.target.value))}
                    className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 font-mono font-black text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <span className="font-mono font-black text-base text-amber-400">%</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">On first approved deposit</div>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={firstDepositEnabled}
              onClick={() => handleToggleProgram('first_deposit_bonus', !firstDepositEnabled)}
              className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center shrink-0 ${
                firstDepositEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
            </button>
          </div>

          {/* Card 3: Referral Bonus */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-slate-100 text-sm">Referral Bonus</div>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="font-mono font-black text-base text-amber-400">₹</span>
                  <input
                    type="number"
                    min={0}
                    max={5000}
                    value={referralBonusAmount}
                    onChange={(e) => setReferralBonusAmount(Number(e.target.value))}
                    className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 font-mono font-black text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  After {qualificationDays} days betting activity
                </div>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={referralEnabled}
              onClick={() => handleToggleProgram('referrals', !referralEnabled)}
              className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center shrink-0 ${
                referralEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
            </button>
          </div>

          {/* Referral Settings Section */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <h4 className="font-bold text-slate-100 text-sm">Referral Settings</h4>

            <div className="flex items-center justify-between gap-3">
              <label className="text-xs sm:text-sm font-medium text-slate-300">
                Qualifying Bet Amount
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 w-40">
                <span className="font-mono font-bold text-amber-400 text-xs mr-1">₹</span>
                <input
                  type="number"
                  min={10}
                  value={qualifyingBetAmount}
                  onChange={(e) => setQualifyingBetAmount(Number(e.target.value))}
                  className="w-full bg-transparent font-mono font-bold text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="text-xs sm:text-sm font-medium text-slate-300">
                Qualification Days
              </label>
              <select
                value={qualificationDays}
                onChange={(e) => setQualificationDays(Number(e.target.value))}
                className="w-40 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value={3}>3 Days</option>
                <option value={5}>5 Days</option>
                <option value={7}>7 Days</option>
                <option value={10}>10 Days</option>
                <option value={15}>15 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>
          </div>

          {/* 7-Day Attendance Streak Bonus Configuration */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <h4 className="font-bold text-slate-100 text-sm">7-Day Attendance Streak Bonus Amounts</h4>
            <p className="text-[11px] text-slate-400">Configure daily check-in rewards for Day 1 through Day 7 (Jackpot)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {checkInBonuses.map((val, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Day {idx + 1} {idx === 6 ? '(Jackpot)' : ''}</span>
                  <div className="flex items-center mt-1">
                    <span className="font-mono text-amber-400 text-xs mr-1">₹</span>
                    <input
                      type="number"
                      min={0}
                      value={val}
                      onChange={(e) => {
                        const newArr = [...checkInBonuses];
                        newArr[idx] = Number(e.target.value);
                        setCheckInBonuses(newArr);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-mono font-bold text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition active:scale-[0.99]"
          >
            Save Settings
          </button>
        </form>
      )}

      {/* TAB 2: REFERRAL LIST */}
      {activeTab === 'referral_list' && (
        <div className="space-y-3">
          {activeReferrals.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-slate-400 text-xs">
              No active or pending referral qualifications right now.
            </div>
          ) : (
            activeReferrals.map((ref) => (
              <div
                key={ref.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-100">
                      Referrer: <span className="font-mono text-amber-400">{ref.referrerUid}</span> ({ref.referrerUsername})
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      Referred User: <span className="font-mono font-bold text-slate-100">{ref.referredUid}</span> ({ref.referredUsername})
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Progress: {ref.qualifyingDaysCompleted}/{currentSettings.referralRequiredDays} Days (₹{ref.bonusAmount} Bonus)
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    {ref.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleReviewReferral(ref.id, 'approve')}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Credit ₹{ref.bonusAmount}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewReferral(ref.id, 'reject')}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {historyReferrals.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-slate-400 text-xs">
              No settled referral bonus history yet.
            </div>
          ) : (
            historyReferrals.map((ref) => (
              <div
                key={ref.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-slate-100">
                    {ref.referrerUsername} ({ref.referrerUid}) &rarr; {ref.referredUsername} ({ref.referredUid})
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Bonus: ₹{ref.bonusAmount} · Days: {ref.qualifyingDaysCompleted}/{currentSettings.referralRequiredDays}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    ref.status === 'credited'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {ref.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
