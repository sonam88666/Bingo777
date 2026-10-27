import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  Coins, 
  History, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { UserRecord, GameRound, BetColor } from '../../types';
import { store } from '../../services/store';
import { soundFx } from '../../services/soundFx';
import { useToast } from '../common/Toast';
import { GameBetHistorySection } from './GameBetHistorySection';

interface TrxWinGoGameProps {
  user: UserRecord | null;
  onBackToLobby: () => void;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
}

export const TrxWinGoGame: React.FC<TrxWinGoGameProps> = ({
  user,
  onBackToLobby,
  onOpenDeposit,
  onOpenAuth
}) => {
  const { showToast } = useToast();
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedBetType, setSelectedBetType] = useState<'color' | 'number' | 'size'>('color');
  const [selectedBetValue, setSelectedBetValue] = useState<string>('green');
  const [betAmount, setBetAmount] = useState<number>(50);
  const lastResolvedTrxPeriodRef = useRef<string>('');

  const [, setTick] = useState(0);
  useEffect(() => {
    const unsub = store.subscribe(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  const trxRound = store.getTrxCurrentRound();
  const pastRounds = store.getTrxPastRounds();

  useEffect(() => {
    const updateCountdown = () => {
      const activeRound = store.getTrxCurrentRound();
      const now = store.getServerNow();
      const remainingMs = activeRound.endTime - now;
      const diff = Math.max(0, Math.ceil(remainingMs / 1000));
      setTimeLeft(diff);

      if (remainingMs <= 0) {
        if (lastResolvedTrxPeriodRef.current !== activeRound.period) {
          lastResolvedTrxPeriodRef.current = activeRound.period;
          store.resolveTrxRound();
          setTick((t) => t + 1);
        } else {
          store.ensureTrxRoundFreshness();
          setTick((t) => t + 1);
        }
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 250);

    return () => clearInterval(timer);
  }, []);

  const handlePlaceBet = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (user.balance < betAmount) {
      showToast('Insufficient wallet balance', 'error');
      return;
    }

    const res = store.placeBet({
      uid: user.uid,
      username: user.username,
      roundPeriod: trxRound.period,
      gameType: '1min',
      betType: selectedBetType,
      betValue: selectedBetValue,
      amount: betAmount,
      multiplier: 1,
      potentialPayout: betAmount * 2
    });

    if (res.success) {
      soundFx.playChipSound();
      showToast(`TRX Bet of ₹${betAmount} placed on ${selectedBetValue.toUpperCase()}!`, 'success');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBackToLobby}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Games</span>
        </button>

        <div className="px-3 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 font-brand font-black text-xs flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-sky-400" />
          <span>TRX WIN GO (BLOCK HASH)</span>
        </div>
      </div>

      {/* TRX Block Hash Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-950 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-b border-slate-800/80 pb-3">
          <div>
            <span className="text-[10px] text-slate-500 block">TRX Period</span>
            <span className="font-mono font-bold text-amber-300 text-sm">{trxRound.period}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">Next Block In</span>
            <span className="font-mono font-bold text-emerald-400 text-base">{timeLeft}s</span>
          </div>
        </div>

        {/* Live Block Hash Display */}
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Public Tron Blockchain Block Seed
          </span>
          <div className="font-mono text-xs text-sky-300 break-all select-all flex items-center justify-between">
            <span>{trxRound.hash}</span>
            <span className="text-amber-400 font-bold ml-2">***</span>
          </div>
        </div>
      </div>

      {/* Betting Choices */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => { setSelectedBetType('color'); setSelectedBetValue('green'); }}
            className={`py-3.5 rounded-2xl font-brand font-black text-sm border transition shadow-lg ${
              selectedBetValue === 'green' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-900 border-slate-800 text-emerald-400'
            }`}
          >
            GREEN (2.0x)
          </button>
          <button
            onClick={() => { setSelectedBetType('color'); setSelectedBetValue('violet'); }}
            className={`py-3.5 rounded-2xl font-brand font-black text-sm border transition shadow-lg ${
              selectedBetValue === 'violet' ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 border-slate-800 text-purple-400'
            }`}
          >
            VIOLET (4.5x)
          </button>
          <button
            onClick={() => { setSelectedBetType('color'); setSelectedBetValue('red'); }}
            className={`py-3.5 rounded-2xl font-brand font-black text-sm border transition shadow-lg ${
              selectedBetValue === 'red' ? 'bg-rose-600 text-white border-rose-400' : 'bg-slate-900 border-slate-800 text-rose-400'
            }`}
          >
            RED (2.0x)
          </button>
        </div>

        {/* Numbers 0-9 */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-5 gap-2 text-center">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => { setSelectedBetType('number'); setSelectedBetValue(n.toString()); }}
              className={`py-2 rounded-xl font-mono font-black text-base border transition ${
                selectedBetValue === n.toString() ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Stake and Action Button */}
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="50"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-sm font-bold text-amber-300 text-center"
          />
          <button
            onClick={handlePlaceBet}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-brand font-black text-sm shadow-xl transition active:scale-95"
          >
            CONFIRM TRX BET (₹{betAmount})
          </button>
        </div>
      </div>

      {/* Tabs: Game History, Chart, My History */}
      <GameBetHistorySection
        pastRounds={pastRounds}
        userBets={user ? store.getLiveBets().filter((b) => b.uid === user.uid) : []}
        user={user}
        onOpenDeposit={onOpenDeposit}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
};
