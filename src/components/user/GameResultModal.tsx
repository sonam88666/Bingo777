import React, { useEffect } from 'react';
import { 
  Crown, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Receipt,
  ShieldCheck,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RoundSettlementNotice } from '../../types';
import { soundFx } from '../../services/soundFx';

interface GameResultModalProps {
  settlement: RoundSettlementNotice | null;
  queuedCount?: number;
  onClose: () => void;
  onContinue?: () => void;
}

/**
 * Large Glowing 3D Golden Heart Emblem for WIN Popup
 */
const Golden3DHeartEmblem: React.FC = () => (
  <div className="relative inline-flex items-center justify-center py-1">
    {/* Intense Radial Golden-Emerald Aura */}
    <div className="absolute w-32 h-32 rounded-full bg-amber-400/35 blur-2xl animate-pulse pointer-events-none" />
    <div className="absolute w-24 h-24 rounded-full bg-emerald-400/25 blur-xl pointer-events-none" />

    {/* Floating 3D Gold Coin Left */}
    <div className="absolute -left-8 top-3 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-100 border-2 border-yellow-200 flex items-center justify-center shadow-[0_4px_12px_rgba(245,158,11,0.7)] animate-bounce z-20">
      <span className="font-mono text-xs font-black text-amber-950">₹</span>
    </div>

    {/* Floating Sparkle Top Left */}
    <Sparkles className="absolute -left-5 -top-2 w-5 h-5 text-yellow-200 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)] animate-pulse z-20" />

    {/* Crown Crest Atop the 3D Golden Heart */}
    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-600 p-1 rounded-full border border-yellow-100 shadow-[0_0_15px_rgba(251,191,36,0.9)]">
      <Crown className="w-4 h-4 text-amber-950 fill-amber-950" />
    </div>

    {/* Large Glowing 3D Golden Heart SVG */}
    <svg
      viewBox="0 0 140 130"
      className="w-28 h-26 sm:w-32 sm:h-28 drop-shadow-[0_10px_22px_rgba(245,158,11,0.65)] relative z-10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 3D Extrusion Base Dark Gold Gradient */}
        <linearGradient id="winHeartDepth" x1="70" y1="10" x2="70" y2="124" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="50%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>

        {/* Main 3D Sculpted Metallic Gold Body */}
        <radialGradient id="winHeartBody" cx="38%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="22%" stopColor="#FDE047" />
          <stop offset="52%" stopColor="#F59E0B" />
          <stop offset="82%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>

        {/* Inner Rim Metallic Bevel */}
        <linearGradient id="winHeartRim" x1="20" y1="15" x2="120" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Top-Left Glossy Specular Highlight */}
        <linearGradient id="winHeartGloss" x1="35" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
          <stop offset="60%" stopColor="#FEF9C3" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FEF9C3" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 3D Back Extrusion Layer (Depth Shadow) */}
      <path
        d="M70 120C70 120 14 84 14 43C14 23 30 10 49 10C60 10 67 16 70 23C73 16 80 10 91 10C110 10 126 23 126 43C126 84 70 120 70 120Z"
        transform="translate(0, 5)"
        fill="url(#winHeartDepth)"
      />

      {/* Main 3D Golden Heart Surface */}
      <path
        d="M70 118C70 118 14 82 14 42C14 22 30 9 49 9C60 9 67 15 70 22C73 15 80 9 91 9C110 9 126 22 126 42C126 82 70 118 70 118Z"
        fill="url(#winHeartBody)"
        stroke="url(#winHeartRim)"
        strokeWidth="3"
      />

      {/* Inner Faceted 3D Heart Glow */}
      <path
        d="M70 108C70 108 24 76 24 43C24 27 36 17 50 17C59 17 66 22 70 29C74 22 81 17 90 17C104 17 116 27 116 43C116 76 70 108 70 108Z"
        stroke="#FEF08A"
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />

      {/* Specular 3D Left Lobe Reflection */}
      <path
        d="M30 42C30 28 40 20 51 20C56 20 60 22 62 25C52 26 40 34 35 49C32 48 30 45 30 42Z"
        fill="url(#winHeartGloss)"
      />

      {/* Specular 3D Right Lobe Reflection */}
      <ellipse
        cx="98"
        cy="29"
        rx="10"
        ry="5"
        transform="rotate(-20 98 29)"
        fill="#FFFFFF"
        fillOpacity="0.55"
      />
    </svg>

    {/* Floating 3D Gold Coin Right */}
    <div className="absolute -right-8 top-4 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-100 border-2 border-yellow-200 flex items-center justify-center shadow-[0_4px_12px_rgba(245,158,11,0.7)] animate-bounce [animation-delay:150ms] z-20">
      <span className="font-mono text-xs font-black text-amber-950">₹</span>
    </div>

    {/* Floating Sparkle Bottom Right */}
    <Sparkles className="absolute -right-5 bottom-2 w-4 h-4 text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse z-20" />
  </div>
);

/**
 * Large Broken Red 3D Heart Emblem for LOSS Popup
 */
const BrokenRed3DHeartEmblem: React.FC = () => (
  <div className="relative inline-flex items-center justify-center py-1">
    {/* Deep Crimson Ambient Glow */}
    <div className="absolute w-32 h-32 rounded-full bg-rose-600/30 blur-2xl pointer-events-none" />
    <div className="absolute w-20 h-20 rounded-full bg-red-500/20 blur-xl pointer-events-none" />

    {/* Large 3D Shattered / Broken Red Heart SVG */}
    <svg
      viewBox="0 0 140 130"
      className="w-28 h-26 sm:w-32 sm:h-28 drop-shadow-[0_10px_22px_rgba(225,29,72,0.6)] relative z-10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 3D Dark Crimson Extrusion Depth */}
        <linearGradient id="lossHeartDepth" x1="70" y1="10" x2="70" y2="124" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#881337" />
          <stop offset="55%" stopColor="#4C0519" />
          <stop offset="100%" stopColor="#1F030B" />
        </linearGradient>

        {/* Main 3D Ruby / Red Sculpted Gradient */}
        <radialGradient id="lossHeartBody" cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FFE4E6" />
          <stop offset="20%" stopColor="#FB7185" />
          <stop offset="50%" stopColor="#E11D48" />
          <stop offset="82%" stopColor="#9F1239" />
          <stop offset="100%" stopColor="#4C0519" />
        </radialGradient>

        {/* Inner Fracture Wall Bevel */}
        <linearGradient id="lossCrackWall" x1="65" y1="20" x2="78" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="40%" stopColor="#881337" />
          <stop offset="100%" stopColor="#2A040F" />
        </linearGradient>

        {/* Specular Left Lobe Highlight */}
        <linearGradient id="lossHeartGloss" x1="28" y1="18" x2="55" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="65%" stopColor="#FECDD3" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FECDD3" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* LEFT BROKEN HALF (Tilted & Shifted Slightly Left) */}
      <g transform="translate(-4, 1) rotate(-3 65 65)">
        {/* 3D Depth Extrusion Left Half */}
        <path
          d="M68 118C68 118 14 82 14 42C14 22 30 9 49 9C59 9 65 14 68 21L60 40L72 56L58 77L69 94L68 118Z"
          transform="translate(0, 5)"
          fill="url(#lossHeartDepth)"
        />
        {/* Inner 3D Fracture Edge Wall */}
        <path
          d="M68 21L60 40L72 56L58 77L69 94L68 118L73 115L74 92L64 76L76 55L65 39L72 22Z"
          fill="url(#lossCrackWall)"
        />
        {/* Main Left Heart Lobe */}
        <path
          d="M68 118C68 118 14 82 14 42C14 22 30 9 49 9C59 9 65 14 68 21L60 40L72 56L58 77L69 94L68 118Z"
          fill="url(#lossHeartBody)"
          stroke="#FB7185"
          strokeOpacity="0.7"
          strokeWidth="2"
        />
        {/* Specular Gloss on Left Lobe */}
        <path
          d="M28 41C28 27 38 19 49 19C54 19 57 21 59 23C49 24 38 32 33 47C30 46 28 44 28 41Z"
          fill="url(#lossHeartGloss)"
        />
      </g>

      {/* RIGHT BROKEN HALF (Tilted & Shifted Slightly Right/Down) */}
      <g transform="translate(5, 3) rotate(4 75 65)">
        {/* 3D Depth Extrusion Right Half */}
        <path
          d="M72 118L73 94L62 77L76 56L64 40L72 21C75 14 81 9 91 9C110 9 126 22 126 42C126 82 72 118 72 118Z"
          transform="translate(0, 5)"
          fill="url(#lossHeartDepth)"
        />
        {/* Main Right Heart Lobe */}
        <path
          d="M72 118L73 94L62 77L76 56L64 40L72 21C75 14 81 9 91 9C110 9 126 22 126 42C126 82 72 118 72 118Z"
          fill="url(#lossHeartBody)"
          stroke="#F43F5E"
          strokeOpacity="0.65"
          strokeWidth="2"
        />
        {/* Specular Gloss on Right Lobe */}
        <ellipse
          cx="100"
          cy="28"
          rx="10"
          ry="4.5"
          transform="rotate(-18 100 28)"
          fill="#FFFFFF"
          fillOpacity="0.45"
        />
      </g>
    </svg>
  </div>
);

export const GameResultModal: React.FC<GameResultModalProps> = ({
  settlement,
  queuedCount = 1,
  onClose,
  onContinue
}) => {
  if (!settlement) return null;

  const isWin = settlement.isWin;

  // Sound, push notification, and particle trigger on mount for this unique resultId
  useEffect(() => {
    if (isWin) {
      soundFx.playWinFanfare();
      soundFx.sendPushNotification(
        `🏆 You Won ₹${settlement.totalPayout.toFixed(2)}!`,
        `Period #${settlement.roundPeriod} (${settlement.gameType.toUpperCase()}) settled in your favor!`
      );
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#34d399', '#ffffff'],
        ticks: 200,
        gravity: 1.1,
        scalar: 1.05
      });
    } else {
      soundFx.playLossSound();
      soundFx.sendPushNotification(
        `Round #${settlement.roundPeriod} Result`,
        `Winning Number: ${settlement.winningNumber} (${settlement.winningSize.toUpperCase()}). Next round is live!`
      );
    }
  }, [isWin, settlement.resultId, settlement.totalPayout, settlement.roundPeriod, settlement.gameType, settlement.winningNumber, settlement.winningSize]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAction = () => {
    if (onContinue) {
      onContinue();
    } else {
      onClose();
    }
  };

  // Helper formatting bet value badges
  const renderBetValueBadge = (type: string, val: string) => {
    if (type === 'color') {
      const colorBg = 
        val === 'green' ? 'bg-emerald-500 text-white' :
        val === 'red' ? 'bg-rose-500 text-white' :
        val === 'violet' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-white';
      return (
        <span className={`px-2 py-0.5 rounded-md font-black uppercase text-[11px] shadow-sm ${colorBg}`}>
          {val}
        </span>
      );
    }
    if (type === 'number') {
      return (
        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center justify-center shadow-sm">
          {val}
        </span>
      );
    }
    if (type === 'size') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-sky-500 text-white font-black uppercase text-[11px] shadow-sm">
          {val}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-purple-500/30 border border-purple-400/40 text-purple-200 font-black uppercase text-[11px]">
        {val}
      </span>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isWin ? 'You Win Result Popup' : 'You Lost Result Popup'}
    >
      <div 
        className={`w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden shadow-2xl relative transition-all transform animate-in zoom-in-95 duration-250 select-none ${
          isWin
            ? 'bg-gradient-to-b from-slate-900 via-emerald-950/85 to-slate-950 border-2 border-amber-400/90 shadow-[0_0_55px_rgba(245,158,11,0.4),0_0_25px_rgba(16,185,129,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)]'
            : 'bg-gradient-to-b from-slate-900 via-rose-950/70 to-slate-950 border-2 border-rose-500/75 shadow-[0_0_45px_rgba(225,29,72,0.4),0_0_20px_rgba(159,18,57,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow Radial */}
        <div 
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 blur-3xl pointer-events-none rounded-full ${
            isWin ? 'bg-amber-500/35' : 'bg-rose-500/30'
          }`} 
        />

        {/* Queued Results Indicator (if multiple consecutive rounds settled) */}
        {queuedCount > 1 && (
          <div className="absolute top-3.5 left-4 z-20 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-[10px] font-mono font-bold text-amber-300">
            1 of {queuedCount} Results
          </div>
        )}

        {/* Replay 3D Sound Button + Close Button Top Right */}
        <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              if (isWin) {
                soundFx.play3dVictoryTrumpet(true);
              } else {
                soundFx.play3dDefeatTrombone(true);
              }
            }}
            className={`px-2.5 h-8 rounded-full flex items-center gap-1 text-[10px] font-bold transition-all ${
              isWin
                ? 'bg-slate-950/70 hover:bg-slate-950 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950/70 hover:bg-slate-950 text-rose-300 border border-rose-500/40'
            }`}
            title="Replay 3D Win/Loss Audio"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>3D Sound</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isWin
                ? 'bg-slate-950/60 hover:bg-slate-950 text-amber-300 border border-amber-500/30'
                : 'bg-slate-950/60 hover:bg-slate-950 text-rose-300 border border-rose-500/30'
            }`}
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* HEADER SECTION WITH LARGE 3D HEART EMBLEM */}
        <div className="pt-5 pb-1 px-5 text-center relative z-10">
          {isWin ? (
            /* --- 3D WIN HEADER WITH LARGE GLOWING 3D GOLDEN HEART --- */
            <div className="space-y-1.5">
              <Golden3DHeartEmblem />

              <div>
                <h2 
                  className="font-brand font-black text-3xl sm:text-4xl tracking-wider uppercase bg-gradient-to-b from-yellow-100 via-amber-300 to-amber-500 bg-clip-text text-transparent"
                  style={{ 
                    textShadow: '0 2px 0 #b45309, 0 4px 0 #78350f, 0 6px 0 #451a03, 0 8px 16px rgba(245, 158, 11, 0.6)' 
                  }}
                >
                  YOU WIN!
                </h2>
                <p className="text-xs font-bold text-amber-300/90 tracking-wide mt-0.5">
                  Congratulations! Your settled bet won instant profit.
                </p>
              </div>
            </div>
          ) : (
            /* --- 3D LOSS HEADER WITH LARGE BROKEN RED 3D HEART --- */
            <div className="space-y-1.5">
              <BrokenRed3DHeartEmblem />

              <div>
                <h2 
                  className="font-brand font-black text-3xl sm:text-4xl tracking-wider uppercase bg-gradient-to-b from-rose-100 via-rose-300 to-rose-500 bg-clip-text text-transparent"
                  style={{ 
                    textShadow: '0 2px 0 #991b1b, 0 4px 0 #7f1d1d, 0 6px 0 #450a0a, 0 8px 16px rgba(225, 29, 72, 0.5)' 
                  }}
                >
                  YOU LOST!
                </h2>
                <p className="text-xs font-bold text-rose-300/80 tracking-wide mt-0.5">
                  Better luck next round! Keep playing to hit the jackpot.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MAIN BODY DETAILS CARD */}
        <div className="p-4 sm:p-5 space-y-3.5 relative z-10">
          {/* PRIMARY AMOUNT DISPLAY BANNER */}
          <div className={`p-3.5 sm:p-4 rounded-2xl text-center space-y-1 relative overflow-hidden border shadow-inner ${
            isWin 
              ? 'bg-slate-950/80 border-amber-500/40 shadow-amber-500/5' 
              : 'bg-slate-950/80 border-rose-500/40 shadow-rose-500/5'
          }`}>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              {isWin ? 'Actual Win Amount (Credited)' : 'Settled Payout'}
            </span>

            {isWin ? (
              <div className="flex items-center justify-center space-x-1.5 py-0.5">
                <span className="font-mono font-black text-3xl sm:text-4xl text-amber-300 tracking-tight drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]">
                  +₹{settlement.totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-1.5 py-0.5">
                <span className="font-mono font-black text-3xl sm:text-4xl text-rose-400 tracking-tight drop-shadow-[0_2px_8px_rgba(225,29,72,0.4)]">
                  ₹0.00
                </span>
              </div>
            )}

            {/* Net Status Indicator */}
            <div className="text-[11px] font-bold">
              {isWin ? (
                <span className="text-emerald-400 inline-flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Net Profit: +₹{Math.max(0, settlement.netProfit).toFixed(2)}</span>
                </span>
              ) : (
                <span className="text-rose-400 inline-flex items-center space-x-1">
                  <span>Deducted Amount: -₹{settlement.totalBetAmount.toFixed(2)}</span>
                </span>
              )}
            </div>
          </div>

          {/* DETAILED LEDGER BREAKDOWN */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5 text-xs">
            {/* Round ID / Period */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold flex items-center space-x-1.5">
                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                <span>Round ID ({settlement.gameName || 'Win Go'}):</span>
              </span>
              <span className="font-mono font-black text-slate-200 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                {settlement.roundPeriod}
              </span>
            </div>

            {/* Winning Outcome of the Round */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-900">
              <span className="text-slate-400 font-semibold">Official Result:</span>
              <div className="flex items-center space-x-2">
                <span className={`w-5 h-5 rounded-full font-black text-xs inline-flex items-center justify-center shadow-sm ${
                  settlement.winningNumber === 0 ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white' :
                  settlement.winningNumber === 5 ? 'bg-gradient-to-r from-emerald-600 to-purple-600 text-white' :
                  settlement.winningNumber % 2 === 0 ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {settlement.winningNumber}
                </span>
                <span className="font-bold text-slate-300 text-[11px]">
                  ({settlement.winningColors.join(' + ').toUpperCase()} · {settlement.winningSize.toUpperCase()})
                </span>
              </div>
            </div>

            {/* Selected Bet(s) */}
            <div className="pt-1 border-t border-slate-900 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">
                  {settlement.bets.length > 1 ? `Selected Bets (${settlement.bets.length}):` : 'Selected Bet:'}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Bet Amount: <strong className="text-slate-200">₹{settlement.totalBetAmount.toFixed(2)}</strong>
                </span>
              </div>

              {/* Bets list */}
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {settlement.bets.map((b, idx) => (
                  <div 
                    key={b.betId || idx}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 capitalize">{b.betType.replace('k3_', '')}:</span>
                      {renderBetValueBadge(b.betType, b.betValue)}
                    </div>
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-slate-400">₹{b.amount}</span>
                      <span className="text-slate-600">&rarr;</span>
                      <span className={`font-bold ${b.status === 'won' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {b.status === 'won' ? `+₹${b.actualPayout}` : '₹0.00'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Real-Time Wallet Balance */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-slate-400 font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Final Wallet Credit:</span>
              </span>
              <span className="font-mono font-black text-slate-100 text-sm">
                ₹{settlement.walletBalanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition active:scale-95 shrink-0"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleAction}
              className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-xl ${
                isWin
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/30'
                  : 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-rose-950/50'
              }`}
            >
              <span>{queuedCount > 1 ? `Next Result (${queuedCount - 1} left)` : isWin ? 'Continue Playing' : 'Play Next Round'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer Guarantee with Unique Result ID */}
        <div className="py-2 px-4 bg-slate-950 border-t border-slate-800/80 text-center text-[10px] text-slate-500 flex items-center justify-between">
          <span className="inline-flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-bold">Verified Settlement</span>
          </span>
          <span className="font-mono text-slate-500">ID: {settlement.resultId}</span>
        </div>
      </div>
    </div>
  );
};
