import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Clock, 
  HelpCircle, 
  History, 
  Sparkles, 
  Trophy, 
  Coins, 
  AlertTriangle, 
  Check, 
  Lock, 
  TrendingUp, 
  ChevronRight,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { UserRecord, GameRound, LiveBet, BetColor, BetSize, RoundSettlementNotice } from '../../types';
import { store } from '../../services/store';
import { firebaseSync } from '../../services/firebaseSync';
import { soundFx } from '../../services/soundFx';
import { useToast } from '../common/Toast';
import { useAdminSettings } from '../../context/AdminSettingsContext';
import { GameBetHistorySection } from './GameBetHistorySection';
import { GameResultModal } from './GameResultModal';

interface ColorPredictionGameProps {
  user: UserRecord | null;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
}

export const ColorPredictionGame: React.FC<ColorPredictionGameProps> = ({
  user,
  onOpenDeposit,
  onOpenAuth
}) => {
  const { showToast } = useToast();
  const { settings: adminSettings, isGameEnabled, isMaintenanceActiveForUser } = useAdminSettings();
  const [selectedGameType, setSelectedGameType] = useState<'30s' | '1min' | '3min'>('30s');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'game' | 'history' | 'mybets'>('game');

  // Bet Modal state
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [selectedBetType, setSelectedBetType] = useState<'color' | 'number' | 'size'>('color');
  const [selectedBetValue, setSelectedBetValue] = useState<string>('green');
  const [chipAmount, setChipAmount] = useState<number>(50);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [manualNotice, setManualNotice] = useState<RoundSettlementNotice | null>(null);
  const [tick, setTick] = useState(0);
  const lastResolvedPeriodRef = useRef<string>('');
  const lastTickSoundKeyRef = useRef<string>('');

  // Store data (re-evaluated on every store tick / round settlement)
  const currentRound = store.getCurrentRound(selectedGameType);
  const pastRounds = useMemo(
    () => [...store.getPastRounds(selectedGameType)],
    [selectedGameType, currentRound.period, tick]
  );
  const liveBets = store.getLiveBets();

  // Filter user's bets
  const userBets = useMemo(() => {
    if (!user) return [];
    return liveBets.filter((b) => b.uid === user.uid);
  }, [liveBets, user, tick]);

  // Authoritative real-time reactivity to store updates
  useEffect(() => {
    const unsub = store.subscribe(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  // Global Server-Synchronized Round Countdown Loop
  useEffect(() => {
    const updateCountdown = () => {
      const activeRound = store.getCurrentRound(selectedGameType);
      const now = store.getServerNow();
      const remainingMs = activeRound.endTime - now;
      const diff = Math.max(0, Math.ceil(remainingMs / 1000));

      setTimeLeft(diff);
      const locked = diff <= 5;
      setIsLocked(locked);

      // Play tick sound once per second in final 5 seconds
      if (diff <= 5 && diff > 0) {
        const soundKey = `${activeRound.period}_${diff}`;
        if (lastTickSoundKeyRef.current !== soundKey) {
          lastTickSoundKeyRef.current = soundKey;
          soundFx.playCountdownTick(diff <= 2);
        }
      }

      // Resolve round exactly once when server time reaches endTime (00:00)
      if (remainingMs <= 0) {
        if (lastResolvedPeriodRef.current !== activeRound.period) {
          lastResolvedPeriodRef.current = activeRound.period;
          store.resolveRound(undefined, selectedGameType);
          setTick((t) => t + 1);
        } else {
          store.ensureRoundFreshness(selectedGameType);
          setTick((t) => t + 1);
        }
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 250);

    return () => clearInterval(timer);
  }, [selectedGameType]);

  const totalBetAmount = chipAmount * multiplier;
  const liveUser = user ? (store.getUser(user.uid) || (user.phone ? store.findUserByPhone(user.phone) : undefined) || user) : null;
  const liveWalletBalance = Math.max(
    0,
    typeof liveUser?.balance === 'number' && Number.isFinite(liveUser.balance) ? liveUser.balance : 0,
    typeof user?.balance === 'number' && Number.isFinite(user.balance) ? user.balance : 0
  );

  const openBetModal = (type: 'color' | 'number' | 'size', value: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (isMaintenanceActiveForUser(user.uid)) {
      showToast(adminSettings.maintenanceMessage || 'Platform is under Maintenance Mode. Betting is paused.', 'error');
      return;
    }
    if (!isGameEnabled(`wingo_${selectedGameType}`) || !isGameEnabled('wingo')) {
      showToast(`WinGo ${selectedGameType} is currently disabled by Master Admin.`, 'error');
      return;
    }
    if (isLocked) {
      showToast('Betting is locked for the final 5 seconds of the round', 'error');
      return;
    }
    setSelectedBetType(type);
    setSelectedBetValue(value);
    setMultiplier(1);
    setBetModalOpen(true);
  };

  const handlePlaceBet = () => {
    const activeUser = user ? (store.getUser(user.uid) || (user.phone ? store.findUserByPhone(user.phone) : undefined) || user) : null;
    if (!activeUser) return;
    if (isMaintenanceActiveForUser(activeUser.uid)) {
      showToast(adminSettings.maintenanceMessage || 'Platform is under Maintenance Mode. Betting is paused.', 'error');
      setBetModalOpen(false);
      return;
    }
    if (!isGameEnabled(`wingo_${selectedGameType}`) || !isGameEnabled('wingo')) {
      showToast(`WinGo ${selectedGameType} is currently disabled by Master Admin.`, 'error');
      setBetModalOpen(false);
      return;
    }
    if (isLocked) {
      showToast('Betting locked for this round. Please wait for the next period.', 'error');
      setBetModalOpen(false);
      return;
    }

    // Resolve authoritative live balance across store and props so a stale 0 closure never blocks a funded player
    const availableBalance = Math.max(
      0,
      Math.round(
        Math.max(
          typeof activeUser.balance === 'number' && Number.isFinite(activeUser.balance) ? activeUser.balance : 0,
          typeof user?.balance === 'number' && Number.isFinite(user.balance) ? user.balance : 0
        ) * 100
      ) / 100
    );

    if (availableBalance > (store.getUser(activeUser.uid)?.balance || 0)) {
      store.updateUserFromFirestore({ uid: activeUser.uid, balance: availableBalance });
    }

    if (availableBalance < totalBetAmount) {
      showToast(
        `Insufficient wallet balance. Available: ₹${availableBalance.toFixed(2)}, Requested: ₹${totalBetAmount.toFixed(2)}`,
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    let potentialRate = 2.0;
    if (selectedBetType === 'color') {
      potentialRate = selectedBetValue === 'violet' ? adminSettings.colorVioletMultiplier : adminSettings.colorGreenMultiplier;
    } else if (selectedBetType === 'number') {
      potentialRate = adminSettings.numberMultiplier;
    } else if (selectedBetType === 'size') {
      potentialRate = adminSettings.sizeMultiplier;
    }

    const potentialPayout = totalBetAmount * potentialRate;
    const latestRound = store.getCurrentRound(selectedGameType);

    const result = store.placeBet({
      uid: activeUser.uid,
      username: activeUser.username,
      roundPeriod: latestRound.period,
      gameType: selectedGameType,
      betType: selectedBetType,
      betValue: selectedBetValue,
      amount: totalBetAmount,
      multiplier,
      potentialPayout
    });

    setIsSubmitting(false);
    if (result.success) {
      firebaseSync.verifyAndSyncBetDeductionAtomically(activeUser.uid, totalBetAmount, availableBalance).catch(() => {});
      soundFx.playChipSound();
      showToast(`Bet of ₹${totalBetAmount} placed on ${selectedBetValue.toUpperCase()}!`, 'success');
      setBetModalOpen(false);
    } else {
      showToast(result.error || 'Failed to place bet', 'error');
    }
  };

  // Helper formatting seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3D Sphere / Tile visual classes for numbers 0-9
  const getNumber3DStyles = (num: number) => {
    if (num === 0) {
      return {
        outer:
          'bg-[linear-gradient(145deg,#3b0a26_0%,#1e1035_100%)] border-t border-rose-400/40 border-x border-purple-500/30 border-b-4 border-b-purple-950 shadow-[0_6px_14px_rgba(225,29,72,0.28)]',
        sphere:
          'bg-[linear-gradient(135deg,#ff3b6b_0%,#e11d48_47%,#9333ea_53%,#581c87_100%)] shadow-[inset_-4px_-6px_10px_rgba(0,0,0,0.6),inset_3px_4px_8px_rgba(255,255,255,0.45),0_4px_10px_rgba(147,51,234,0.45)] ring-1 ring-white/25',
        ring: 'border-rose-200/40'
      };
    }
    if (num === 5) {
      return {
        outer:
          'bg-[linear-gradient(145deg,#072e22_0%,#1e1035_100%)] border-t border-emerald-400/40 border-x border-purple-500/30 border-b-4 border-b-purple-950 shadow-[0_6px_14px_rgba(16,185,129,0.28)]',
        sphere:
          'bg-[linear-gradient(135deg,#34d399_0%,#059669_47%,#9333ea_53%,#581c87_100%)] shadow-[inset_-4px_-6px_10px_rgba(0,0,0,0.6),inset_3px_4px_8px_rgba(255,255,255,0.45),0_4px_10px_rgba(16,185,129,0.45)] ring-1 ring-white/25',
        ring: 'border-emerald-200/40'
      };
    }
    if (num % 2 === 0) {
      return {
        outer:
          'bg-[linear-gradient(180deg,#3f0d1d_0%,#1f060e_100%)] border-t border-rose-400/40 border-x border-rose-500/25 border-b-4 border-b-rose-950 shadow-[0_6px_14px_rgba(225,29,72,0.28)]',
        sphere:
          'bg-[radial-gradient(circle_at_32%_26%,#fda4af_0%,#fb7185_18%,#e11d48_58%,#881337_100%)] shadow-[inset_-4px_-6px_10px_rgba(0,0,0,0.6),inset_3px_4px_8px_rgba(255,255,255,0.45),0_4px_10px_rgba(225,29,72,0.5)] ring-1 ring-rose-200/30',
        ring: 'border-rose-200/35'
      };
    }
    return {
      outer:
        'bg-[linear-gradient(180deg,#083526_0%,#041b13_100%)] border-t border-emerald-400/40 border-x border-emerald-500/25 border-b-4 border-b-emerald-950 shadow-[0_6px_14px_rgba(16,185,129,0.28)]',
      sphere:
        'bg-[radial-gradient(circle_at_32%_26%,#a7f3d0_0%,#34d399_18%,#059669_58%,#064e3b_100%)] shadow-[inset_-4px_-6px_10px_rgba(0,0,0,0.6),inset_3px_4px_8px_rgba(255,255,255,0.45),0_4px_10px_rgba(16,185,129,0.5)] ring-1 ring-emerald-200/30',
      ring: 'border-emerald-200/35'
    };
  };

  return (
    <div className="max-w-4xl mx-auto px-2.5 sm:px-4 pt-1.5 pb-3 space-y-2 sm:space-y-3">
      {/* Game Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/95 rounded-xl border border-slate-800/90 shadow-md">
        {(['30s', '1min', '3min'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setSelectedGameType(mode);
              store.switchRoundMode(mode);
            }}
            className={`py-1.5 rounded-lg font-bold text-[11px] sm:text-xs flex items-center justify-center space-x-1 transition-all ${
              selectedGameType === mode
                ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 border-t border-amber-200/60 border-b-2 border-b-amber-700 shadow-[0_2px_8px_rgba(245,158,11,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-3 h-3 shrink-0" />
            <span>Win Go {mode === '30s' ? '30s' : mode === '1min' ? '1m' : '3m'}</span>
          </button>
        ))}
      </div>

      {/* Compact Live Round Header & Ticking Countdown Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/90 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-lg">
        <div className="absolute -top-10 right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between gap-2">
          {/* Left: Active Period */}
          <div className="min-w-0">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Period
              </span>
            </div>
            <div className="font-mono text-base sm:text-xl font-black text-amber-300 tracking-wider leading-tight mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              {currentRound.period}
            </div>
            {user && store.getLatestSettlementNotice(user.uid) && (
              <button
                type="button"
                onClick={() => setManualNotice(store.getLatestSettlementNotice(user.uid))}
                className={`mt-0.5 px-2 py-0.5 rounded text-[9px] font-black border transition active:scale-95 inline-flex items-center space-x-1 shadow-sm ${
                  store.getLatestSettlementNotice(user.uid)?.isWin
                    ? 'bg-gradient-to-r from-emerald-500/20 to-amber-500/20 text-amber-300 border-amber-400/50 hover:bg-amber-500/30'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/40 hover:bg-rose-500/20'
                }`}
                title="View your latest round result popup"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>Last: {store.getLatestSettlementNotice(user.uid)?.isWin ? 'WON' : 'LOST'}</span>
              </button>
            )}
          </div>

          {/* Right: Countdown Display */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="text-right">
              <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Time Remaining
              </div>
              <div
                className={`font-mono text-xl sm:text-2xl font-black tracking-tight leading-none mt-0.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] ${
                  isLocked ? 'text-rose-500 animate-pulse' : 'text-emerald-400'
                }`}
              >
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Lock status indicator */}
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center border shadow-inner ${
                isLocked
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              }`}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5 animate-bounce" /> : <Clock className="w-3.5 h-3.5" />}
            </div>
          </div>
        </div>

        {/* Lock Warning Bar */}
        {isLocked && (
          <div className="mt-1.5 py-0.5 px-2 rounded-md bg-rose-950/80 border border-rose-500/40 text-rose-200 text-[10px] flex items-center justify-center space-x-1.5 font-semibold animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
            <span>Betting locked! Final 5 seconds countdown.</span>
          </div>
        )}
      </div>

      {/* Main Betting Area */}
      <div className="space-y-2 sm:space-y-2.5">
        {/* 3D Color Choice Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {/* Green 3D Button */}
          <button
            onClick={() => openBetModal('color', 'green')}
            disabled={isLocked}
            className={`group relative overflow-hidden rounded-xl py-2 px-1.5 sm:py-2.5 sm:px-2.5 text-center transition-all active:translate-y-0.5 active:scale-[0.98] ${
              isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'
            } bg-[linear-gradient(180deg,#34d399_0%,#10b981_25%,#059669_75%,#065f46_100%)] border-t border-t-emerald-200/70 border-x border-x-emerald-400/40 border-b-[4px] border-b-emerald-950 shadow-[0_6px_14px_rgba(5,150,105,0.4),inset_0_1px_4px_rgba(255,255,255,0.4)]`}
          >
            <div className="absolute inset-x-2 top-0.5 h-1/3 rounded-t-lg bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
            <div className="relative font-brand font-black text-sm sm:text-lg text-white tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
              GREEN
            </div>
            <div className="relative text-[10px] font-extrabold text-emerald-50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
              2.0X Payout
            </div>
            <div className="relative text-[8px] font-semibold text-emerald-100/90">
              Numbers 1, 3, 7, 9
            </div>
          </button>

          {/* Violet 3D Button */}
          <button
            onClick={() => openBetModal('color', 'violet')}
            disabled={isLocked}
            className={`group relative overflow-hidden rounded-xl py-2 px-1.5 sm:py-2.5 sm:px-2.5 text-center transition-all active:translate-y-0.5 active:scale-[0.98] ${
              isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'
            } bg-[linear-gradient(180deg,#c084fc_0%,#9333ea_25%,#7e22ce_75%,#4c1d95_100%)] border-t border-t-purple-200/70 border-x border-x-purple-400/40 border-b-[4px] border-b-purple-950 shadow-[0_6px_14px_rgba(126,34,206,0.4),inset_0_1px_4px_rgba(255,255,255,0.4)]`}
          >
            <div className="absolute inset-x-2 top-0.5 h-1/3 rounded-t-lg bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
            <div className="relative font-brand font-black text-sm sm:text-lg text-white tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
              VIOLET
            </div>
            <div className="relative text-[10px] font-extrabold text-purple-50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
              4.5X Payout
            </div>
            <div className="relative text-[8px] font-semibold text-purple-100/90">
              Numbers 0, 5
            </div>
          </button>

          {/* Red 3D Button */}
          <button
            onClick={() => openBetModal('color', 'red')}
            disabled={isLocked}
            className={`group relative overflow-hidden rounded-xl py-2 px-1.5 sm:py-2.5 sm:px-2.5 text-center transition-all active:translate-y-0.5 active:scale-[0.98] ${
              isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'
            } bg-[linear-gradient(180deg,#fb7185_0%,#f43f5e_25%,#e11d48_75%,#881337_100%)] border-t border-t-rose-200/70 border-x border-x-rose-400/40 border-b-[4px] border-b-rose-950 shadow-[0_6px_14px_rgba(225,29,72,0.4),inset_0_1px_4px_rgba(255,255,255,0.4)]`}
          >
            <div className="absolute inset-x-2 top-0.5 h-1/3 rounded-t-lg bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
            <div className="relative font-brand font-black text-sm sm:text-lg text-white tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
              RED
            </div>
            <div className="relative text-[10px] font-extrabold text-rose-50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
              2.0X Payout
            </div>
            <div className="relative text-[8px] font-semibold text-rose-100/90">
              Numbers 2, 4, 6, 8
            </div>
          </button>
        </div>

        {/* 3D Number Choice Grid (0-9) - 9X Odds */}
        <div className="bg-gradient-to-b from-slate-900/95 to-slate-950 rounded-xl border border-slate-800/90 p-2 sm:p-3 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-200 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Select 3D Number</span>
            </span>
            <span className="text-[10px] font-black text-amber-300 bg-amber-500/15 px-2 py-0.2 rounded-full border border-amber-400/30 shadow-sm">
              9.0X Multiplier
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const style3d = getNumber3DStyles(num);
              return (
                <button
                  key={num}
                  onClick={() => openBetModal('number', num.toString())}
                  disabled={isLocked}
                  className={`group relative aspect-square rounded-xl p-1 flex items-center justify-center transition-all ${
                    style3d.outer
                  } ${
                    isLocked
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:-translate-y-0.5 hover:scale-105 active:translate-y-0.5 active:scale-95'
                  }`}
                >
                  {/* 3D Glossy Billiard/Lottery Sphere */}
                  <div
                    className={`relative w-full h-full rounded-full flex items-center justify-center overflow-hidden ${style3d.sphere}`}
                  >
                    {/* Top-left 3D specular light reflection */}
                    <div className="absolute top-0.5 left-1 w-3 h-1.5 rounded-full bg-white/55 blur-[0.4px] -rotate-12 pointer-events-none" />
                    {/* Inner ring medallion for 3D number depth */}
                    <div
                      className={`w-[70%] h-[70%] rounded-full border ${style3d.ring} bg-black/15 backdrop-blur-[1px] flex items-center justify-center shadow-[inset_0_1px_3px_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.4)]`}
                    >
                      <span className="font-mono font-black text-base sm:text-lg text-white leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {num}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D Big / Small Choice Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          <button
            onClick={() => openBetModal('size', 'big')}
            disabled={isLocked}
            className={`relative overflow-hidden rounded-xl py-2 px-2.5 sm:py-2.5 sm:px-3 text-center transition-all active:translate-y-0.5 active:scale-[0.98] ${
              isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'
            } bg-[linear-gradient(180deg,#fbbf24_0%,#f59e0b_28%,#d97706_75%,#92400e_100%)] border-t border-t-amber-200/75 border-x border-x-amber-400/40 border-b-[4px] border-b-amber-950 shadow-[0_6px_14px_rgba(217,119,6,0.35),inset_0_1px_4px_rgba(255,255,255,0.4)]`}
          >
            <div className="absolute inset-x-3 top-0.5 h-1/3 rounded-t-lg bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
            <div className="relative font-brand font-black text-sm sm:text-base text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
              BIG (5-9)
            </div>
            <div className="relative text-[10px] font-extrabold text-amber-50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
              2.0X Multiplier
            </div>
          </button>

          <button
            onClick={() => openBetModal('size', 'small')}
            disabled={isLocked}
            className={`relative overflow-hidden rounded-xl py-2 px-2.5 sm:py-2.5 sm:px-3 text-center transition-all active:translate-y-0.5 active:scale-[0.98] ${
              isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'
            } bg-[linear-gradient(180deg,#38bdf8_0%,#0284c7_28%,#0369a1_75%,#0c4a6e_100%)] border-t border-t-sky-200/75 border-x border-x-sky-400/40 border-b-[4px] border-b-sky-950 shadow-[0_6px_14px_rgba(2,132,199,0.35),inset_0_1px_4px_rgba(255,255,255,0.4)]`}
          >
            <div className="absolute inset-x-3 top-0.5 h-1/3 rounded-t-lg bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
            <div className="relative font-brand font-black text-sm sm:text-base text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
              SMALL (0-4)
            </div>
            <div className="relative text-[10px] font-extrabold text-sky-50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
              2.0X Multiplier
            </div>
          </button>
        </div>
      </div>

      {/* Tabs: Game History, Chart, My History */}
      <GameBetHistorySection
        pastRounds={pastRounds}
        userBets={userBets}
        user={user}
        onOpenDeposit={onOpenDeposit}
        onOpenAuth={onOpenAuth}
      />

      {/* Bet Sheet Modal */}
      <AnimatePresence>
      {betModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 18 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="w-full sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400 font-semibold">Confirm Prediction</span>
                <div className="font-brand font-black text-lg text-amber-300 flex items-center space-x-2">
                  <span>Win Go {selectedGameType === '30s' ? '30 Sec' : selectedGameType === '1min' ? '1 Min' : '3 Min'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-sans">
                    {selectedBetType.toUpperCase()}: {selectedBetValue.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setBetModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Contract Chip Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-2 block">
                Select Chip Amount (₹)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[50, 100, 200, 500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setChipAmount(amt)}
                    className={`py-2 rounded-xl font-mono font-bold text-xs border transition ${
                      chipAmount === amt
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplier Stepper */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-2 block">
                Quantity Multiplier
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMultiplier(Math.max(1, multiplier - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold hover:bg-slate-700 text-lg"
                >
                  -
                </button>
                <div className="flex-1 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-center text-amber-300 text-base">
                  X{multiplier}
                </div>
                <button
                  onClick={() => setMultiplier(multiplier + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold hover:bg-slate-700 text-lg"
                >
                  +
                </button>
              </div>
              <div className="flex gap-1.5 mt-2">
                {[1, 5, 10, 20, 50, 100].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMultiplier(m)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold border ${
                      multiplier === m
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400'
                    }`}
                  >
                    X{m}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Bet Amount</span>
                <span className="font-mono font-black text-xl text-amber-400">₹{totalBetAmount}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Your Wallet</span>
                <span className="font-mono font-bold text-sm text-slate-200">
                  ₹{liveWalletBalance.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Confirm Bet Action Button */}
            <button
              onClick={handlePlaceBet}
              disabled={isSubmitting || isLocked}
              className={`w-full py-3.5 rounded-2xl font-brand font-black text-base text-slate-950 shadow-xl transition active:scale-95 flex items-center justify-center space-x-2 ${
                isLocked 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-amber-500/20'
              }`}
            >
              <Coins className="w-5 h-5" />
              <span>Confirm Prediction (₹{totalBetAmount})</span>
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Manual Result Modal trigger */}
      {manualNotice && (
        <GameResultModal
          settlement={manualNotice}
          onClose={() => setManualNotice(null)}
          onContinue={() => setManualNotice(null)}
        />
      )}
    </div>
  );
};
