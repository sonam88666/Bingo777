import React, { useState } from 'react';
import { 
  Gift, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  RotateCw, 
  Coins, 
  Award,
  ChevronRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Users,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRecord } from '../../types';
import { store } from '../../services/store';
import { soundFx } from '../../services/soundFx';
import { useToast } from '../common/Toast';

interface ActivityViewProps {
  user: UserRecord | null;
  onOpenDeposit: () => void;
  onOpenGiftCode: () => void;
  onSelectGame: (gid: any) => void;
  onOpenAuth: () => void;
  onOpenReferral?: () => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  user,
  onOpenDeposit,
  onOpenGiftCode,
  onSelectGame,
  onOpenAuth,
  onOpenReferral
}) => {
  const { showToast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];
  const userCheckInDate = user?.lastCheckInDate || (user ? localStorage.getItem(`bingo777_last_checkin_date_${user.uid}`) : null);
  const hasClaimedToday = userCheckInDate === todayStr;
  const claimedDay = user?.checkInDay || (user ? parseInt(localStorage.getItem(`bingo777_last_checkin_day_${user.uid}`) || '1', 10) : 1);

  const adminSettings = store.getAdminSettings();
  const bonuses = adminSettings.checkInBonuses || [10, 25, 50, 80, 150, 250, 500];

  const checkInDays = [
    { day: 1, reward: bonuses[0] ?? 10, label: 'Day 1' },
    { day: 2, reward: bonuses[1] ?? 25, label: 'Day 2' },
    { day: 3, reward: bonuses[2] ?? 50, label: 'Day 3' },
    { day: 4, reward: bonuses[3] ?? 80, label: 'Day 4' },
    { day: 5, reward: bonuses[4] ?? 150, label: 'Day 5' },
    { day: 6, reward: bonuses[5] ?? 250, label: 'Day 6' },
    { day: 7, reward: bonuses[6] ?? 500, label: 'Day 7 (Jackpot)', jackpot: true }
  ];

  const isSignupBonusEnabled = store.isFeatureEnabled('signup_bonus');
  const isFirstDepositBonusEnabled = store.isFeatureEnabled('first_deposit_bonus');
  const isReferralsEnabled = store.isFeatureEnabled('referrals');
  const isDailyCheckinEnabled = store.isFeatureEnabled('daily_checkin');
  const isWheelEnabled = store.isFeatureEnabled('wheel');
  const isGiftCodesEnabled = store.isFeatureEnabled('gift_codes');

  const handleClaimDaily = (dayObj: typeof checkInDays[0]) => {
    if (!isDailyCheckinEnabled) {
      showToast('7-Day Attendance Streak is currently paused by Master Admin.', 'info');
      return;
    }
    if (!user) {
      onOpenAuth();
      return;
    }
    if (hasClaimedToday) {
      showToast('⚠️ Attendance bonus din mein sirf 1 baar milta hai! Kal dobara aaiye.', 'info');
      return;
    }

    const res = store.claimDailyAttendance(user.uid);
    if (res.success) {
      soundFx.playWinFanfare();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      showToast(`🎉 Claimed ₹${res.amount} Day ${res.day} Attendance Bonus! Added to your wallet.`, 'success');
    } else {
      showToast(res.error || 'Failed to claim attendance bonus', 'error');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-3 space-y-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-900 border border-amber-400/40 p-5 shadow-2xl">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center space-x-1.5 text-xs text-amber-950 font-black bg-amber-300 px-2.5 py-0.5 rounded-full w-max">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DAILY REWARDS & PROMOTIONS</span>
          </div>
          <h2 className="font-brand font-black text-xl text-slate-950">
            Activity & Bonus Center
          </h2>
          <p className="text-xs text-amber-950/80 font-medium max-w-sm">
            Log in daily to claim consecutive bonuses, earn rewards, and spin the lucky wheel!
          </p>
        </div>
      </div>

      {/* 1. SPECIAL BONUS ENTITLEMENT: ₹120 SIGNUP + 100% FIRST DEPOSIT BONUS */}
      {(isSignupBonusEnabled || isFirstDepositBonusEnabled) && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 border border-amber-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-brand font-black text-slate-100 text-sm">
                    First Deposit Welcome Package
                  </h3>
                  <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    100% MATCH + ₹120
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  ₹120 Signup Bonus + 100% Deposit Match credited together on 1st verified deposit
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {isSignupBonusEnabled && (
              <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block font-bold uppercase">Signup Bonus</span>
                <span className="font-mono font-bold text-amber-300">₹120 Cash</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {user?.signupBonusStatus === 'credited' ? (
                    <span className="text-emerald-400 font-bold">Credited to Wallet ✓</span>
                  ) : (
                    <span className="text-amber-400 font-bold">Pending 1st Approved Deposit</span>
                  )}
                </span>
              </div>
            )}

            {isFirstDepositBonusEnabled && (
              <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block font-bold uppercase">Deposit Bonus</span>
                <span className="font-mono font-bold text-emerald-400">100% Match</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {user?.firstDepositBonusStatus === 'credited' ? (
                    <span className="text-emerald-400 font-bold">Credited to Wallet ✓</span>
                  ) : (
                    <span className="text-amber-400 font-bold">Pending 1st Approved Deposit</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {user?.firstDepositBonusStatus !== 'credited' && (
            <button
              onClick={onOpenDeposit}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-brand font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-950/40 active:scale-95 transition"
            >
              <span>Deposit via UPI (Min ₹250) to Unlock Bonuses &rarr;</span>
            </button>
          )}
        </div>
      )}

      {/* 2. REFER & EARN ₹120 PROGRAM CARD */}
      {isReferralsEnabled && (
        <div
          onClick={() => onOpenReferral && onOpenReferral()}
          className="p-4 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/40 hover:border-amber-400 cursor-pointer shadow-xl transition group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0 group-hover:scale-105 transition">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-brand font-black text-sm text-slate-100 group-hover:text-amber-300 transition">
                    Refer & Earn ₹120 Cash
                  </h4>
                  <span className="text-[9px] font-black px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    REAL MONEY
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Invite friends. Earn ₹120 per friend after 10-day betting qualification!
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition shrink-0" />
          </div>
        </div>
      )}

      {/* 7-Day Daily Check-In Streak */}
      {isDailyCheckinEnabled && (
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">7-Day Attendance Streak</h3>
                <p className="text-[11px] text-slate-400">Claim continuous cash bonuses every 24 hours</p>
              </div>
            </div>
            {hasClaimedToday && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Claimed Today ✓
              </span>
            )}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1">
            {checkInDays.map((d) => {
              const isCompleted = d.day < claimedDay;
              const isCurrent = d.day === claimedDay;
              return (
                <div
                  key={d.day}
                  onClick={() => isCurrent && !hasClaimedToday && handleClaimDaily(d)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-between text-center border transition-all cursor-pointer ${
                    d.jackpot
                      ? 'col-span-2 sm:col-span-1 bg-gradient-to-b from-amber-500/20 to-yellow-600/30 border-amber-400'
                      : ''
                  } ${
                    isCompleted
                      ? 'bg-slate-950/60 border-emerald-500/40 text-emerald-300'
                      : isCurrent
                      ? hasClaimedToday
                        ? 'bg-slate-950 border-slate-700 text-slate-400'
                        : 'bg-amber-500 text-slate-950 font-bold border-white shadow-lg shadow-amber-500/30 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-semibold">{d.label}</span>
                  <span className={`font-mono font-black text-xs my-1 ${isCurrent && !hasClaimedToday ? 'text-slate-950' : 'text-amber-400'}`}>
                    ₹{d.reward}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent && !hasClaimedToday ? (
                    <span className="text-[9px] font-black uppercase bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded-full">
                      CLAIM
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-500">Locked</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Featured Promotions List */}
      <div className="space-y-3">
        {/* Lucky Spin Promo */}
        {isWheelEnabled && (
          <div 
            onClick={() => onSelectGame('wheel')}
            className="p-4 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 border border-purple-500/30 hover:border-purple-400 cursor-pointer transition flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 shrink-0">
                <RotateCw className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-slate-100">Lucky Fortune Wheel</h4>
                  <span className="text-[9px] font-black px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    SPIN & WIN
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Spin for immediate prizes up to ₹1,000 cash</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-purple-400 shrink-0" />
          </div>
        )}

        {/* Gift Code Voucher Promo */}
        {isGiftCodesEnabled && (
          <div 
            onClick={onOpenGiftCode}
            className="p-4 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-slate-100">Redeem Gift Voucher</h4>
                  <span className="text-[9px] font-black px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    FREE CASH
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Enter secret codes distributed on official channel</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400 shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
};
