import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Trophy, 
  Dice1, 
  Dice2, 
  Dice3, 
  Dice4, 
  Dice5, 
  Dice6,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRecord } from '../../types';
import { store } from '../../services/store';
import { soundFx } from '../../services/soundFx';
import { useToast } from '../common/Toast';

interface SevenUpGameProps {
  user: UserRecord | null;
  onBackToLobby: () => void;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
}

type BetTarget = 'down' | 'seven' | 'up';

export const SevenUpGame: React.FC<SevenUpGameProps> = ({
  user,
  onBackToLobby,
  onOpenDeposit,
  onOpenAuth
}) => {
  const { showToast } = useToast();

  const [period, setPeriod] = useState<string>(() => `7U${Date.now().toString().slice(-6)}`);
  const [countdown, setCountdown] = useState<number>(10);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // Dice outcomes
  const [die1, setDie1] = useState<number>(3);
  const [die2, setDie2] = useState<number>(4);
  const [diceTotal, setDiceTotal] = useState<number>(7);
  const [roundResult, setRoundResult] = useState<BetTarget | null>('seven');

  // Selected chip
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const chips = [10, 50, 100, 500, 1000, 5000];

  // User Bets
  const [userBets, setUserBets] = useState<Record<BetTarget, number>>({
    down: 0,
    seven: 0,
    up: 0
  });

  // History
  const [history, setHistory] = useState<{ total: number; target: BetTarget }[]>([
    { total: 5, target: 'down' },
    { total: 7, target: 'seven' },
    { total: 9, target: 'up' },
    { total: 11, target: 'up' },
    { total: 4, target: 'down' },
    { total: 8, target: 'up' },
    { total: 7, target: 'seven' }
  ]);

  // Dice icon helper
  const renderDiceIcon = (num: number) => {
    switch (num) {
      case 1: return <Dice1 className="w-12 h-12 text-slate-900" />;
      case 2: return <Dice2 className="w-12 h-12 text-slate-900" />;
      case 3: return <Dice3 className="w-12 h-12 text-slate-900" />;
      case 4: return <Dice4 className="w-12 h-12 text-slate-900" />;
      case 5: return <Dice5 className="w-12 h-12 text-slate-900" />;
      default: return <Dice6 className="w-12 h-12 text-slate-900" />;
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 4 && prev > 1) {
          soundFx.playCountdownTick(true);
        }
        if (prev <= 1) {
          rollDice();
          return 12;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userBets, user]);

  const rollDice = () => {
    setIsRolling(true);
    soundFx.playDiceRoll();

    // Roll animation
    let rollSteps = 0;
    const interval = setInterval(() => {
      setDie1(Math.floor(Math.random() * 6) + 1);
      setDie2(Math.floor(Math.random() * 6) + 1);
      rollSteps++;
      if (rollSteps >= 10) {
        clearInterval(interval);
        finalizeRoll();
      }
    }, 120);
  };

  const finalizeRoll = () => {
    const adminSettings = store.getAdminSettings();
    let d1 = Math.floor(Math.random() * 6) + 1;
    let d2 = Math.floor(Math.random() * 6) + 1;

    // ZERO PLATFORM LOSS ENGINE:
    if (adminSettings.zeroPlatformLossMode) {
      const downBet = userBets.down || 0;
      const upBet = userBets.up || 0;
      const sevenBet = userBets.seven || 0;

      if (downBet > upBet && downBet > sevenBet) {
        // Player bet on 2-6 (Down) -> Roll 8-12 (Up) so platform wins
        d1 = 5;
        d2 = 4;
      } else if (upBet > downBet && upBet > sevenBet) {
        // Player bet on 8-12 (Up) -> Roll 2-6 (Down) so platform wins
        d1 = 2;
        d2 = 2;
      } else if (sevenBet > 0) {
        // Player bet on 7 -> Roll 5 (Down) so platform wins
        d1 = 3;
        d2 = 2;
      }
    }

    const total = d1 + d2;
    setDie1(d1);
    setDie2(d2);
    setDiceTotal(total);

    let outcome: BetTarget = 'seven';
    if (total < 7) outcome = 'down';
    else if (total > 7) outcome = 'up';

    setRoundResult(outcome);
    setIsRolling(false);
    setHistory((prev) => [{ total, target: outcome }, ...prev.slice(0, 14)]);

    // Check winnings
    let wonAmount = 0;
    if (userBets.down > 0 && outcome === 'down') {
      wonAmount += userBets.down * 2.0;
    }
    if (userBets.seven > 0 && outcome === 'seven') {
      wonAmount += userBets.seven * 5.0; // 5x on 7!
    }
    if (userBets.up > 0 && outcome === 'up') {
      wonAmount += userBets.up * 2.0;
    }

    if (wonAmount > 0 && user) {
      soundFx.playWinFanfare();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      store.updateUserBalance(user.uid, wonAmount, `7 Up 7 Down Win [Total ${total}]`);
      showToast(`🎉 Won ₹${Math.round(wonAmount)} on ${outcome === 'seven' ? 'Lucky 7 (5X)' : outcome.toUpperCase()}!`, 'success');
    }

    setTimeout(() => {
      setUserBets({ down: 0, seven: 0, up: 0 });
      setPeriod(`7U${Date.now().toString().slice(-6)}`);
    }, 2500);
  };

  const handlePlaceBet = (target: BetTarget) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (isRolling || countdown <= 2) {
      showToast('Betting is locked for this roll!', 'error');
      return;
    }
    if (user.balance < selectedChip) {
      showToast('Insufficient balance!', 'error');
      onOpenDeposit();
      return;
    }

    const success = store.updateUserBalance(user.uid, -selectedChip, `Bet 7 Up 7 Down: ${target.toUpperCase()}`);
    if (success) {
      soundFx.playChipSound();
      setUserBets((prev) => ({
        ...prev,
        [target]: prev[target] + selectedChip
      }));
      showToast(`Placed ₹${selectedChip} on ${target === 'seven' ? 'Lucky 7' : target.toUpperCase()}`, 'info');
    }
  };

  const totalUserBet = userBets.down + userBets.seven + userBets.up;

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-3 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToLobby}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            #{period}
          </span>
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
            <Clock className={`w-3.5 h-3.5 ${countdown <= 3 ? 'text-rose-500 animate-spin' : 'text-slate-400'}`} />
            <span className={`font-mono font-bold ${countdown <= 3 ? 'text-rose-400' : 'text-slate-200'}`}>
              {countdown}s
            </span>
          </div>
        </div>
      </div>

      {/* Main Dice Table Display */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-950 via-slate-950 to-indigo-950 border border-blue-500/30 p-6 shadow-2xl text-center">
        <div className="space-y-1">
          <h2 className="font-brand font-black text-xl text-blue-200 tracking-wider">
            7 UP 7 DOWN CASINO
          </h2>
          <p className="text-[11px] text-blue-300/80">
            Roll 2 Dices · Predict Total Sum 2-6, Lucky 7, or 8-12
          </p>
        </div>

        {/* Dice Shaker Box */}
        <div className="my-5 flex items-center justify-center space-x-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-tr from-amber-100 to-white shadow-2xl border-2 border-amber-400 transition-transform duration-200 ${isRolling ? 'rotate-12 scale-110' : ''}`}>
            {renderDiceIcon(die1)}
          </div>
          <div className={`p-3 rounded-2xl bg-gradient-to-tr from-amber-100 to-white shadow-2xl border-2 border-amber-400 transition-transform duration-200 ${isRolling ? '-rotate-12 scale-110' : ''}`}>
            {renderDiceIcon(die2)}
          </div>
        </div>

        {/* Total Outcome Pill */}
        <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-2xl bg-slate-900/90 border border-blue-400/40 shadow-inner">
          <span className="text-xs text-slate-400">Total Sum:</span>
          <span className="font-mono font-black text-2xl text-amber-300">
            {isRolling ? '?' : diceTotal}
          </span>
          {!isRolling && (
            <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${
              roundResult === 'seven' ? 'bg-amber-400 text-slate-950' : roundResult === 'down' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
            }`}>
              {roundResult === 'seven' ? 'Lucky 7' : roundResult === 'down' ? '7 Down' : '7 Up'}
            </span>
          )}
        </div>
      </div>

      {/* 3 Main Betting Zones */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* 7 DOWN (2 - 6) */}
        <button
          onClick={() => handlePlaceBet('down')}
          disabled={isRolling || countdown <= 2}
          className={`relative rounded-2xl p-4 flex flex-col items-center justify-center border-2 transition-all active:scale-95 duration-200 ${
            userBets.down > 0
              ? 'bg-gradient-to-b from-rose-600 to-rose-800 border-rose-300 text-white shadow-lg shadow-rose-900/50'
              : 'bg-rose-950/40 hover:bg-rose-950/60 border-rose-600/40 text-rose-200'
          } ${isRolling || countdown <= 2 ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span className="text-xs font-black text-rose-300">2 - 6</span>
          <span className="text-[11px] font-bold uppercase mt-0.5 text-rose-200">7 DOWN</span>
          <span className="text-lg font-black mt-1 text-white">2.0X</span>
          {userBets.down > 0 && (
            <div className="mt-2 px-2 py-0.5 rounded-full bg-slate-950/90 text-[10px] font-bold text-amber-300 font-mono border border-amber-400">
              ₹{userBets.down}
            </div>
          )}
        </button>

        {/* LUCKY 7 */}
        <button
          onClick={() => handlePlaceBet('seven')}
          disabled={isRolling || countdown <= 2}
          className={`relative rounded-2xl p-4 flex flex-col items-center justify-center border-2 transition-all active:scale-95 duration-200 ${
            userBets.seven > 0
              ? 'bg-gradient-to-b from-amber-500 to-yellow-600 border-amber-200 text-slate-950 shadow-lg shadow-amber-900/50'
              : 'bg-amber-950/40 hover:bg-amber-950/60 border-amber-500/50 text-amber-200'
          } ${isRolling || countdown <= 2 ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span className="text-xs font-black text-amber-300 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>EXACT 7</span>
          </span>
          <span className="text-[11px] font-bold uppercase mt-0.5 text-amber-300">LUCKY 7</span>
          <span className="text-xl font-black mt-1 text-amber-300">5.0X</span>
          {userBets.seven > 0 && (
            <div className="mt-2 px-2 py-0.5 rounded-full bg-slate-950/90 text-[10px] font-bold text-amber-300 font-mono border border-amber-400">
              ₹{userBets.seven}
            </div>
          )}
        </button>

        {/* 7 UP (8 - 12) */}
        <button
          onClick={() => handlePlaceBet('up')}
          disabled={isRolling || countdown <= 2}
          className={`relative rounded-2xl p-4 flex flex-col items-center justify-center border-2 transition-all active:scale-95 duration-200 ${
            userBets.up > 0
              ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 border-emerald-300 text-white shadow-lg shadow-emerald-900/50'
              : 'bg-emerald-950/40 hover:bg-emerald-950/60 border-emerald-600/40 text-emerald-200'
          } ${isRolling || countdown <= 2 ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span className="text-xs font-black text-emerald-300">8 - 12</span>
          <span className="text-[11px] font-bold uppercase mt-0.5 text-emerald-200">7 UP</span>
          <span className="text-lg font-black mt-1 text-white">2.0X</span>
          {userBets.up > 0 && (
            <div className="mt-2 px-2 py-0.5 rounded-full bg-slate-950/90 text-[10px] font-bold text-amber-300 font-mono border border-amber-400">
              ₹{userBets.up}
            </div>
          )}
        </button>
      </div>

      {/* Chip Value Selector */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Select Chip Value:</span>
          {totalUserBet > 0 && (
            <span className="text-amber-400 font-mono font-bold">
              Total Bet: ₹{totalUserBet}
            </span>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {chips.map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setSelectedChip(chip);
                soundFx.playChipSound();
              }}
              className={`w-12 h-12 rounded-full font-mono font-black text-xs shrink-0 flex items-center justify-center transition-all active:scale-95 border-2 ${
                selectedChip === chip
                  ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 border-white shadow-lg shadow-amber-500/40 scale-105'
                  : 'bg-slate-950 text-amber-300 border-amber-500/40 hover:border-amber-400'
              }`}
            >
              ₹{chip >= 1000 ? `${chip / 1000}k` : chip}
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-bold flex items-center space-x-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Recent Rolls History</span>
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {history.map((h, i) => (
            <div
              key={i}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1 text-xs font-mono font-bold shrink-0 shadow ${
                h.target === 'seven'
                  ? 'bg-amber-400 text-slate-950'
                  : h.target === 'down'
                  ? 'bg-rose-950 border border-rose-600/40 text-rose-300'
                  : 'bg-emerald-950 border border-emerald-600/40 text-emerald-300'
              }`}
            >
              <span>{h.total}</span>
              <span className="text-[10px]">
                ({h.target === 'seven' ? '7' : h.target === 'down' ? 'Down' : 'Up'})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
