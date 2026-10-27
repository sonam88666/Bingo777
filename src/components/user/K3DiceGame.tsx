import React, { useState, useEffect, useRef } from 'react';
import { 
  Dice6, 
  ArrowLeft, 
  Clock, 
  Coins, 
  History, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRecord, K3Round } from '../../types';
import { store } from '../../services/store';
import { soundFx } from '../../services/soundFx';
import { useToast } from '../common/Toast';

interface K3DiceGameProps {
  user: UserRecord | null;
  onBackToLobby: () => void;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
}

export const K3DiceGame: React.FC<K3DiceGameProps> = ({
  user,
  onBackToLobby,
  onOpenDeposit,
  onOpenAuth
}) => {
  const { showToast } = useToast();
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedBetType, setSelectedBetType] = useState<'k3_sum' | 'k3_dice'>('k3_sum');
  const [selectedBetValue, setSelectedBetValue] = useState<string>('big');
  const [betAmount, setBetAmount] = useState<number>(50);
  const [k3Tab, setK3Tab] = useState<'game' | 'mybets'>('game');
  const [, setTick] = useState(0);
  const lastResolvedK3PeriodRef = useRef<string>('');

  useEffect(() => {
    const unsub = store.subscribe(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  const k3Round = store.getK3CurrentRound();
  const pastRounds = store.getK3PastRounds();
  const userK3Bets = user ? store.getLiveBets().filter((b) => b.uid === user.uid && (b.gameId === 'k3_dice' || b.betType.startsWith('k3'))) : [];

  useEffect(() => {
    const updateCountdown = () => {
      const activeRound = store.getK3CurrentRound();
      const now = store.getServerNow();
      const remainingMs = activeRound.endTime - now;
      const diff = Math.max(0, Math.ceil(remainingMs / 1000));
      setTimeLeft(diff);

      if (remainingMs <= 0 && lastResolvedK3PeriodRef.current !== activeRound.period) {
        lastResolvedK3PeriodRef.current = activeRound.period;
        store.resolveK3Round();
        setTick((t) => t + 1);
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

    const res = store.placeK3Bet(user.uid, selectedBetType, selectedBetValue, betAmount);
    if (res.success) {
      soundFx.playChipSound();
      showToast(`Bet of ₹${betAmount} on ${selectedBetValue.toUpperCase()} placed!`, 'success');
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

        <div className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-brand font-black text-xs flex items-center space-x-1.5">
          <Dice6 className="w-3.5 h-3.5 text-purple-400" />
          <span>K3 LOTRE DICE</span>
        </div>
      </div>

      {/* Live Round Header & Rolling Dice Shaker */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-950 border border-slate-800 shadow-xl space-y-4 text-center">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-b border-slate-800/80 pb-3">
          <div className="text-left">
            <span className="text-[10px] text-slate-500 block">Period</span>
            <span className="font-mono font-bold text-amber-300 text-sm">{k3Round.period}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">Rolling In</span>
            <span className="font-mono font-bold text-emerald-400 text-base">{timeLeft}s</span>
          </div>
        </div>

        {/* 3 Dice Shaker Visual */}
        <div className="py-3 flex items-center justify-center space-x-4">
          {k3Round.dice.map((d, i) => (
            <div
              key={i}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-800 border-2 border-rose-400/50 shadow-xl flex items-center justify-center font-mono font-black text-2xl text-white transform hover:rotate-12 transition duration-200"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center space-x-3 text-xs font-mono font-bold">
          <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-amber-300">
            Total Sum: {k3Round.sum}
          </span>
          <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-sky-300">
            {k3Round.size.toUpperCase()}
          </span>
          <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-purple-300">
            {k3Round.parity.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Betting Options */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Select Betting Outcome
        </span>

        <div className="grid grid-cols-2 gap-2">
          {['big', 'small', 'odd', 'even'].map((v) => (
            <button
              key={v}
              onClick={() => {
                setSelectedBetType('k3_sum');
                setSelectedBetValue(v);
              }}
              className={`py-3 rounded-2xl font-brand font-black text-sm uppercase border transition ${
                selectedBetValue === v
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {v} (2.0x)
            </button>
          ))}
        </div>

        {/* Dice Sums 3 to 18 */}
        <div className="pt-2">
          <span className="text-[11px] text-slate-400 font-semibold mb-1.5 block">
            Exact Sum Match (9.0X Multiplier)
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSelectedBetType('k3_sum');
                  setSelectedBetValue(s.toString());
                }}
                className={`py-2 rounded-xl font-mono font-bold text-xs border transition ${
                  selectedBetValue === s.toString()
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Stake and Place Bet */}
        <div className="pt-2 flex items-center space-x-2">
          <input
            type="number"
            min="50"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-sm font-bold text-amber-300 text-center"
          />
          <button
            onClick={handlePlaceBet}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 text-white font-brand font-black text-sm shadow-xl transition active:scale-95"
          >
            CONFIRM K3 BET (₹{betAmount})
          </button>
        </div>
      </div>

      {/* Tabs: Game History & My Bets */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setK3Tab('game')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
              k3Tab === 'game' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Game History ({pastRounds.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setK3Tab('mybets')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
              k3Tab === 'mybets' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>My Bets ({userK3Bets.length})</span>
          </button>
        </div>

        {k3Tab === 'game' ? (
          <div className="divide-y divide-slate-800/80 font-mono text-xs">
            {pastRounds.slice(0, 10).map((r, idx) => (
              <div key={`${r.period}_${idx}`} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-bold block">{r.period}</span>
                  <span className="text-[10px] text-slate-500 font-sans">Sum: {r.sum}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {r.dice.map((d, i) => (
                    <span
                      key={i}
                      className="w-6 h-6 rounded-lg bg-rose-600/30 border border-rose-500/40 text-rose-300 flex items-center justify-center font-black text-xs"
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    r.size === 'big' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}>
                    {r.size.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950 border border-slate-800 text-purple-300">
                    {r.parity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {!user ? (
              <p className="text-center py-6 text-slate-500 text-xs">Please log in to view your K3 bets.</p>
            ) : userK3Bets.length === 0 ? (
              <p className="text-center py-6 text-slate-500 text-xs">No K3 bets placed yet. Roll the dice to begin!</p>
            ) : (
              userK3Bets.map((b) => {
                const isWon = b.status === 'won';
                const isLost = b.status === 'lost';
                return (
                  <div key={b.betId} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                        Select: {b.betValue.toUpperCase()}
                      </span>
                      <span className={`font-mono font-black ${isWon ? 'text-emerald-400' : isLost ? 'text-rose-400' : 'text-amber-400'}`}>
                        {isWon ? `+₹${b.actualPayout.toFixed(2)}` : isLost ? `-₹${b.amount.toFixed(2)}` : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                      <span>Period: <strong className="text-slate-300">{b.roundPeriod}</strong></span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        isWon ? 'bg-emerald-500/20 text-emerald-300' : isLost ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {isWon ? 'Succeed' : isLost ? 'Failed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
