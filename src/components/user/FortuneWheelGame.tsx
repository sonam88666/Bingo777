import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Trophy, 
  RotateCw, 
  Gift, 
  ShieldCheck, 
  Lock,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRecord } from '../../types';
import { store } from '../../services/store';
import { soundFx } from '../../services/soundFx';
import { useToast } from '../common/Toast';

interface FortuneWheelGameProps {
  user: UserRecord | null;
  onBackToLobby: () => void;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
}

interface WheelSector {
  label: string;
  multiplier: number;
  cashAmount: number;
  color: string;
  isSpecial?: boolean;
}

const SECTORS: WheelSector[] = [
  { label: '₹100', multiplier: 2.0, cashAmount: 100, color: '#f59e0b' },
  { label: '₹20', multiplier: 0.4, cashAmount: 20, color: '#10b981' },
  { label: '₹500', multiplier: 10.0, cashAmount: 500, color: '#ef4444', isSpecial: true },
  { label: '₹50', multiplier: 1.0, cashAmount: 50, color: '#3b82f6' },
  { label: '₹200', multiplier: 4.0, cashAmount: 200, color: '#8b5cf6' },
  { label: '₹10', multiplier: 0.2, cashAmount: 10, color: '#14b8a6' },
  { label: '₹1,000', multiplier: 20.0, cashAmount: 1000, color: '#eab308', isSpecial: true },
  { label: '₹80', multiplier: 1.6, cashAmount: 80, color: '#ec4899' },
];

const COOLDOWN_24H_MS = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds

export const FortuneWheelGame: React.FC<FortuneWheelGameProps> = ({
  user,
  onBackToLobby,
  onOpenDeposit,
  onOpenAuth
}) => {
  const { showToast } = useToast();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<WheelSector | null>(null);
  const [now, setNow] = useState(Date.now());
  const [recentWins, setRecentWins] = useState<string[]>([
    'Member 98***32 won ₹500',
    'Member 87***10 won ₹1,000',
    'Member 91***05 won ₹200'
  ]);

  const SPIN_COST = 50;

  // Live timer tick for 24h countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check deposit requirement
  const hasApprovedDeposit = user ? (
    store.getDeposits().some((d) => d.uid === user.uid && d.status === 'approved') ||
    store.getTransactions().some((t) => t.uid === user.uid && t.type === 'deposit' && t.status === 'completed') ||
    user.firstDepositBonusStatus === 'credited'
  ) : false;

  // Check 24-Hour limit per user
  const lastSpinTimestamp = user ? (
    user.lastWheelSpinAt || Number(localStorage.getItem(`bingo777_last_spin_${user.uid}`)) || 0
  ) : 0;
  const timeSinceLastSpin = now - lastSpinTimestamp;
  const is24hCooldownActive = lastSpinTimestamp > 0 && timeSinceLastSpin < COOLDOWN_24H_MS;
  const remainingCooldownMs = Math.max(0, COOLDOWN_24H_MS - timeSinceLastSpin);

  const formatCountdown = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleSpin = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (isSpinning) return;

    // 1. Check 24-Hour Limit: Only 1 spin per 24 hours
    if (is24hCooldownActive) {
      showToast(
        `⚠️ Lucky Wheel 24 ghante mein sirf 1 baar spin kar sakte hain! Agla spin ${formatCountdown(remainingCooldownMs)} baad available hoga.`,
        'error'
      );
      return;
    }

    // 2. Requirement: No free spin without approved deposit
    if (!hasApprovedDeposit) {
      showToast('⚠️ Bina deposit ke Lucky Wheel spin nahi kar sakte! Kripya pehle deposit karein.', 'error');
      onOpenDeposit();
      return;
    }

    if (user.balance < SPIN_COST) {
      showToast('Insufficient balance! Recharge to spin.', 'error');
      onOpenDeposit();
      return;
    }

    // Deduct entry
    const success = store.updateUserBalance(user.uid, -SPIN_COST, 'Lucky Wheel Spin Entry');
    if (!success) {
      showToast('Failed to start spin, please try again', 'error');
      return;
    }

    setIsSpinning(true);
    setWonPrize(null);
    soundFx.playChipSound();

    const adminSettings = store.getAdminSettings();
    let targetIdx = Math.floor(Math.random() * SECTORS.length);

    // ZERO PLATFORM LOSS ENGINE:
    if (adminSettings.zeroPlatformLossMode) {
      // Pick safe sectors that do NOT exceed entry spin cost (SPIN_COST = 50)
      const safeIndices = SECTORS
        .map((s, idx) => ({ s, idx }))
        .filter((item) => item.s.cashAmount <= SPIN_COST)
        .map((item) => item.idx);
      if (safeIndices.length > 0) {
        targetIdx = safeIndices[Math.floor(Math.random() * safeIndices.length)];
      }
    }

    const targetSector = SECTORS[targetIdx];

    // Sector angle & precise rotation to top needle (270 deg)
    const sectorAngle = 360 / SECTORS.length;
    const sectorCenter = targetIdx * sectorAngle + sectorAngle / 2;
    const targetOffset = ((270 - sectorCenter) % 360 + 360) % 360;
    const currentFullRotations = Math.floor(rotation / 360);
    const finalRotation = (currentFullRotations + 5) * 360 + targetOffset;

    setRotation(finalRotation);

    // Audio ticks during spin
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      soundFx.playWheelTick();
      tickCount++;
      if (tickCount >= 25) {
        clearInterval(tickInterval);
      }
    }, 120);

    // Stop and resolve prize
    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(targetSector);

      // Record 24-hour timestamp
      store.recordWheelSpin(user.uid);

      if (targetSector.cashAmount > 0) {
        soundFx.playWinFanfare();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        store.updateUserBalance(user.uid, targetSector.cashAmount, `Lucky Wheel Won ${targetSector.label}`);
        showToast(`🎉 Congratulations! You won ${targetSector.label}! (Next spin in 24 hours)`, 'success');
        setRecentWins((prev) => [`You won ${targetSector.label}`, ...prev.slice(0, 4)]);
      }
    }, 4000);
  };

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
          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spin Cost: ₹{SPIN_COST}</span>
          </span>
        </div>
      </div>

      {/* 24-Hour Cooldown Banner */}
      {is24hCooldownActive && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center space-x-2.5 text-indigo-200">
            <Clock className="w-5 h-5 text-indigo-400 shrink-0 animate-pulse" />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-indigo-300">24-Hour Daily Spin Used</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  1 SPIN / 24H
                </span>
              </div>
              <span className="text-[11px] text-slate-300 block mt-0.5">
                Next spin unlocks in: <span className="font-mono font-bold text-amber-300">{formatCountdown(remainingCooldownMs)}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Qualification Banner */}
      {!hasApprovedDeposit ? (
        <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-amber-200">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block text-amber-300">Deposit Required to Spin</span>
              <span className="text-[11px] text-amber-200/80">Make at least 1 verified deposit to unlock Lucky Wheel spins</span>
            </div>
          </div>
          <button
            onClick={onOpenDeposit}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap active:scale-95 transition shrink-0"
          >
            Deposit Now
          </button>
        </div>
      ) : (
        !is24hCooldownActive && (
          <div className="p-2.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Deposit Verified ✓ 1 Daily Spin Available (24h cooldown applies)</span>
          </div>
        )
      )}

      {/* Wheel Stage Box */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-purple-950 via-slate-950 to-amber-950 border border-amber-500/30 p-6 shadow-2xl text-center">
        <div className="space-y-1 mb-6">
          <h2 className="font-brand font-black text-2xl bg-gradient-to-r from-yellow-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
            LUCKY FORTUNE WHEEL
          </h2>
          <p className="text-xs text-amber-200/80">
            Spin to win cash prizes up to ₹1,000! (1 spin per 24 hours)
          </p>
        </div>

        {/* Wheel Apparatus */}
        <div className="relative w-64 h-64 mx-auto my-2 flex items-center justify-center">
          {/* Top Pointer Needle */}
          <div className="absolute -top-3 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-amber-400 filter drop-shadow-[0_2px_6px_rgba(245,158,11,0.8)]" />

          {/* Rotating Wheel Disc */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.35)] relative overflow-hidden transition-transform duration-[4000ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`
            }}
          >
            {/* SVG Wheel Sectors */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {SECTORS.map((sec, idx) => {
                const angle = 360 / SECTORS.length;
                const startAngle = idx * angle;
                const endAngle = (idx + 1) * angle;
                
                // SVG arc path
                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                const textAngle = startAngle + angle / 2;
                const tx = 50 + 32 * Math.cos((Math.PI * textAngle) / 180);
                const ty = 50 + 32 * Math.sin((Math.PI * textAngle) / 180);

                return (
                  <g key={idx}>
                    <path
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                      fill={sec.color}
                      stroke="#0f172a"
                      strokeWidth="0.8"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill="#ffffff"
                      fontSize="5"
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                    >
                      {sec.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Hub Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || is24hCooldownActive}
            className={`absolute z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 border-4 border-slate-950 flex flex-col items-center justify-center text-slate-950 shadow-2xl transition ${
              isSpinning || is24hCooldownActive ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
            }`}
          >
            {is24hCooldownActive ? (
              <Clock className="w-5 h-5 text-slate-950" />
            ) : (
              <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            )}
            <span className="text-[9px] font-black tracking-tight mt-0.5">
              {is24hCooldownActive ? 'WAIT' : 'SPIN'}
            </span>
          </button>
        </div>

        {/* Won Prize Celebration */}
        {wonPrize && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 font-bold text-sm animate-bounce">
            🎉 Winner! Claimed {wonPrize.label} directly to wallet!
          </div>
        )}

        {/* Spin Action CTA */}
        <div className="mt-5 flex justify-center">
          {is24hCooldownActive ? (
            <button
              disabled
              className="px-6 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 font-bold text-xs tracking-wide shadow-inner flex items-center space-x-2 cursor-not-allowed"
            >
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Next Spin in {formatCountdown(remainingCooldownMs)}</span>
            </button>
          ) : (
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/30 flex items-center space-x-2 active:scale-95 transition ${
                isSpinning ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSpinning ? 'SPINNING...' : `SPIN NOW (₹${SPIN_COST})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Prize Table & Winners */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold">
            <Gift className="w-3.5 h-3.5" />
            <span>Wheel Rewards</span>
          </div>
          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Mega Jackpot:</span>
              <span className="font-mono text-amber-400 font-bold">₹1,000 (20X)</span>
            </div>
            <div className="flex justify-between">
              <span>High Prize:</span>
              <span className="font-mono text-rose-400 font-bold">₹500 (10X)</span>
            </div>
            <div className="flex justify-between">
              <span>Limit:</span>
              <span className="font-mono text-sky-400 font-bold">1 Spin / 24h</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>Live Winners</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-400">
            {recentWins.map((win, i) => (
              <div key={i} className="truncate text-emerald-400 font-medium">
                • {win}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
