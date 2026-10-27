import React, { useState, useEffect, useMemo } from 'react';
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
import { UserRecord, GameRound, LiveBet, BetColor, BetSize, RoundSettlementNotice } from '../../types';
import { store } from '../../services/store';
import { soundFx } from '../../services/soundFx';
import { useToast } from '../common/Toast';
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

  // Store data
  const currentRound = store.getCurrentRound(selectedGameType);
  const pastRounds = store.getPastRounds(selectedGameType);
  const liveBets = store.getLiveBets();
  const adminSettings = store.getAdminSettings();

  // Filter user's bets
  const userBets = useMemo(() => {
    if (!user) return [];
    return liveBets.filter((b) => b.uid === user.uid);
  }, [liveBets, user]);

  const [manualNotice, setManualNotice] = useState<RoundSettlementNotice | null>(null);
  const [, setTick] = useState(0);

  // Authoritative real-time reactivity to store updates
  useEffect(() => {
    const unsub = store.subscribe(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  // Round countdown timer loop
  useEffect(() => {
    const updateCountdown = () => {
      const freshRound = store.ensureRoundFreshness(selectedGameType);
      const now = Date.now();
      const diff = Math.max(0, Math.floor((freshRound.endTime - now) / 1000));
      setTimeLeft(diff);
      const locked = diff <= 5;
      setIsLocked(locked);

      // Play tick sound in final 5 seconds
      if (diff <= 5 && diff > 0) {
        soundFx.playCountdownTick(diff <= 2);
      }

      // Auto resolve when time expires and unlock next round
      if (diff === 0) {
        store.resolveRound(undefined, selectedGameType);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [currentRound, showToast, selectedGameType]);

  const totalBetAmount = chipAmount * multiplier;

  const openBetModal = (type: 'color' | 'number' | 'size', value: string) => {
    if (!user) {
      onOpenAuth();
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
    if (!user) return;
    if (isLocked) {
      showToast('Betting locked for this round. Please wait for the next period.', 'error');
      setBetModalOpen(false);
      return;
    }
    if (user.balance < totalBetAmount) {
      showToast('Insufficient wallet balance. Please deposit funds.', 'error');
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

    const result = store.placeBet({
      uid: user.uid,
      username: user.username,
      roundPeriod: currentRound.period,
      gameType: selectedGameType,
      betType: selectedBetType,
      betValue: selectedBetValue,
      amount: totalBetAmount,
      multiplier,
      potentialPayout
    });

    setIsSubmitting(false);
    if (result.success) {
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

  // Color background helper for numbers 0-9
  const getNumberBg = (num: number) => {
    if (num === 0) return 'bg-gradient-to-br from-rose-600 via-rose-600 to-purple-600 border-rose-400';
    if (num === 5) return 'bg-gradient-to-br from-emerald-600 via-emerald-600 to-purple-600 border-emerald-400';
    if (num % 2 === 0) return 'bg-gradient-to-br from-rose-600 to-rose-700 border-rose-400';
    return 'bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-400';
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Game Mode Selector Tabs: only 3 times shown: 30 second, 1 min, and 3 min (5 min removed) */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl">
        {(['30s', '1min', '3min'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setSelectedGameType(mode);
              store.switchRoundMode(mode);
            }}
            className={`py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all ${
              selectedGameType === mode
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Win Go {mode === '30s' ? '30 Sec' : mode === '1min' ? '1 Min' : '3 Min'}</span>
          </button>
        ))}
      </div>

      {/* Live Round Header & Ticking Countdown Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-4 sm:p-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div>
              <div className="text-xs font-semibold text-slate-400">
                Active Period
              </div>
              <div className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-wider mt-0.5">
                {currentRound.period}
              </div>
            </div>

            {user && store.getLatestSettlementNotice(user.uid) && (
              <button
                type="button"
                onClick={() => setManualNotice(store.getLatestSettlementNotice(user.uid))}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition active:scale-95 flex items-center space-x-1.5 shadow-md ${
                  store.getLatestSettlementNotice(user.uid)?.isWin
                    ? 'bg-gradient-to-r from-emerald-500/20 to-amber-500/20 text-amber-300 border-amber-400/50 hover:bg-amber-500/30'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/40 hover:bg-rose-500/20'
                }`}
                title="View your latest round result popup"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Last Result: {store.getLatestSettlementNotice(user.uid)?.isWin ? 'YOU WON!' : 'YOU LOST!'}</span>
              </button>
            )}
          </div>

          {/* Countdown Display */}
          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Time Remaining
              </div>
              <div className={`font-mono text-3xl sm:text-4xl font-black tracking-tight ${
                isLocked ? 'text-rose-500 animate-pulse' : 'text-emerald-400'
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Lock status indicator */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isLocked 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              {isLocked ? <Lock className="w-5 h-5 animate-bounce" /> : <Clock className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Lock Warning Bar */}
        {isLocked && (
          <div className="mt-3 py-1.5 px-3 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-center space-x-1.5 font-semibold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Betting locked! Final 5 seconds countdown before outcome reveal.</span>
          </div>
        )}
      </div>

      {/* Main Betting Area */}
      <div className="space-y-4">
        {/* Color Choice Buttons */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* Green Button */}
          <button
            onClick={() => openBetModal('color', 'green')}
            disabled={isLocked}
            className={`group relative overflow-hidden rounded-2xl p-3 sm:p-4 text-center border transition-all active:scale-95 shadow-xl ${
              isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'
            } bg-gradient-to-br from-emerald-600 to-emerald-800 border-emerald-400/50 shadow-emerald-950/50`}
          >
            <div className="font-brand font-black text-lg sm:text-xl text-white tracking-wide">
              GREEN
            </div>
            <div className="text-[11px] font-bold text-emerald-200 mt-0.5">
              2.0X Payout
            </div>
            <div className="text-[9px] text-emerald-300/80">
              Numbers 1, 3, 7, 9
            </div>
          </button>

          {/* Violet Button */}
          <button
            onClick={() => openBetModal('color', 'violet')}
            disabled={isLocked}
            className={`group relative overflow-hidden rounded-2xl p-3 sm:p-4 text-center border transition-all active:scale-95 shadow-xl ${
              isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'
            } bg-gradient-to-br from-purple-600 to-indigo-800 border-purple-400/50 shadow-purple-950/50`}
          >
            <div className="font-brand font-black text-lg sm:text-xl text-white tracking-wide">
              VIOLET
            </div>
            <div className="text-[11px] font-bold text-purple-200 mt-0.5">
              4.5X Payout
            </div>
            <div className="text-[9px] text-purple-300/80">
              Numbers 0, 5
            </div>
          </button>

          {/* Red Button */}
          <button
            onClick={() => openBetModal('color', 'red')}
            disabled={isLocked}
            className={`group relative overflow-hidden rounded-2xl p-3 sm:p-4 text-center border transition-all active:scale-95 shadow-xl ${
              isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'
            } bg-gradient-to-br from-rose-600 to-rose-800 border-rose-400/50 shadow-rose-950/50`}
          >
            <div className="font-brand font-black text-lg sm:text-xl text-white tracking-wide">
              RED
            </div>
            <div className="text-[11px] font-bold text-rose-200 mt-0.5">
              2.0X Payout
            </div>
            <div className="text-[9px] text-rose-300/80">
              Numbers 2, 4, 6, 8
            </div>
          </button>
        </div>

        {/* Number Choice Grid (0-9) - 9X Odds */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3 sm:p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Number</span>
            </span>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              9.0X Multiplier
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => openBetModal('number', num.toString())}
                disabled={isLocked}
                className={`aspect-square rounded-xl font-mono font-black text-lg sm:text-xl text-white border shadow-md flex items-center justify-center transition-all ${
                  getNumberBg(num)
                } ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Big / Small Choice Buttons */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            onClick={() => openBetModal('size', 'big')}
            disabled={isLocked}
            className={`rounded-2xl p-3 sm:p-4 text-center border transition-all active:scale-95 shadow-xl ${
              isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.01]'
            } bg-gradient-to-r from-amber-600 to-amber-700 border-amber-400/40 shadow-amber-950/40`}
          >
            <div className="font-brand font-black text-base sm:text-lg text-white">
              BIG (5-9)
            </div>
            <div className="text-[11px] font-bold text-amber-200">
              2.0X Multiplier
            </div>
          </button>

          <button
            onClick={() => openBetModal('size', 'small')}
            disabled={isLocked}
            className={`rounded-2xl p-3 sm:p-4 text-center border transition-all active:scale-95 shadow-xl ${
              isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.01]'
            } bg-gradient-to-r from-sky-600 to-sky-700 border-sky-400/40 shadow-sky-950/40`}
          >
            <div className="font-brand font-black text-base sm:text-lg text-white">
              SMALL (0-4)
            </div>
            <div className="text-[11px] font-bold text-sky-200">
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
      {betModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
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
                  ₹{user ? user.balance.toFixed(2) : '0.00'}
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
          </div>
        </div>
      )}

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
