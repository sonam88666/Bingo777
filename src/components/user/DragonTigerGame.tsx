import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Clock,
  Trophy,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
  Zap,
  Crown,
  Volume2,
  VolumeX,
  Coins,
  Users,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRecord } from '../../types';
import { store } from '../../services/store';
import { soundFx } from '../../services/soundFx';
import { useToast } from '../common/Toast';

interface DragonTigerGameProps {
  user: UserRecord | null;
  onBackToLobby: () => void;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
}

type BetSide = 'dragon' | 'tie' | 'tiger';
type RoundOutcome = 'dragon' | 'tie' | 'tiger';

interface Card {
  value: number; // 1-13 (1=Ace, 11=Jack, 12=Queen, 13=King)
  suit: '♠' | '♥' | '♣' | '♦';
  label: string;
}

interface RoadmapEntry {
  period: string;
  winner: RoundOutcome;
  dragonCard: Card;
  tigerCard: Card;
}

const SUITS: ('♠' | '♥' | '♣' | '♦')[] = ['♠', '♥', '♣', '♦'];
const LABELS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const CHIP_CONFIG = [
  { value: 10, label: '₹10', ring: 'border-sky-300', bg: 'from-sky-500 via-blue-600 to-blue-900', shadow: '#1E3A8A' },
  { value: 50, label: '₹50', ring: 'border-emerald-300', bg: 'from-emerald-400 via-teal-600 to-emerald-950', shadow: '#064E3B' },
  { value: 100, label: '₹100', ring: 'border-amber-200', bg: 'from-amber-400 via-orange-500 to-amber-900', shadow: '#78350F' },
  { value: 500, label: '₹500', ring: 'border-purple-300', bg: 'from-purple-500 via-fuchsia-600 to-purple-950', shadow: '#4A044E' },
  { value: 1000, label: '₹1K', ring: 'border-rose-200', bg: 'from-rose-500 via-red-600 to-rose-950', shadow: '#881337' },
  { value: 5000, label: '₹5K', ring: 'border-yellow-100', bg: 'from-yellow-200 via-amber-400 to-yellow-700', shadow: '#713F12' }
];

const VIP_SEATS = [
  { name: 'Vikram_VIP', city: 'Mumbai', avatar: 'V', color: 'from-red-500 to-rose-800' },
  { name: 'Rohan_777', city: 'Delhi', avatar: 'R', color: 'from-amber-400 to-orange-700' },
  { name: 'Arjun_King', city: 'Bengaluru', avatar: 'A', color: 'from-emerald-400 to-teal-800' },
  { name: 'Kabir_Pro', city: 'Jaipur', avatar: 'K', color: 'from-purple-500 to-indigo-900' }
];

// ==================== 1. SCULPTED 3D DRAGON ICON ====================
const Dragon3DIcon: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  isWinner?: boolean;
}> = ({ size = 'md', active = false, isWinner = false }) => {
  const sizeClasses =
    size === 'lg'
      ? 'w-16 h-16 sm:w-20 sm:h-20'
      : size === 'md'
      ? 'w-12 h-12 sm:w-14 sm:h-14'
      : 'w-9 h-9';

  return (
    <div
      className={`relative ${sizeClasses} flex items-center justify-center select-none transition-transform duration-500 ${
        isWinner ? 'scale-115' : active ? 'scale-105' : 'scale-100'
      }`}
    >
      {/* 3D Volumetric Crimson Aura */}
      <div
        className={`absolute -inset-1 rounded-full blur-md transition-opacity duration-500 pointer-events-none ${
          isWinner
            ? 'bg-red-500/80 opacity-100 animate-pulse'
            : 'bg-gradient-to-b from-red-500/40 to-amber-500/30 opacity-85'
        }`}
      />

      {/* 3D Extruded Medallion Base */}
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-yellow-200 via-red-500 to-red-950 p-[2px] shadow-[0_6px_0_#450A0A,0_10px_20px_rgba(220,38,38,0.55)] border border-amber-300/80 flex items-center justify-center overflow-hidden">
        <div className="w-full h-full rounded-[14px] bg-[radial-gradient(circle_at_50%_25%,_#991b1b_0%,_#450a0a_60%,_#090d16_100%)] flex items-center justify-center relative overflow-hidden">
          {/* 3D Specular Glass Top Highlight */}
          <div className="absolute inset-x-1 top-0.5 h-1/3 rounded-t-xl bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

          {/* Detailed 3D Sculpted Imperial Dragon Head SVG */}
          <svg viewBox="0 0 100 100" className="w-[88%] h-[88%] drop-shadow-[0_4px_6px_rgba(0,0,0,0.85)]">
            <defs>
              <linearGradient id="dtDragonHorns3D" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
              <linearGradient id="dtDragonArmor3D" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="45%" stopColor="#E11D48" />
                <stop offset="85%" stopColor="#881337" />
                <stop offset="100%" stopColor="#4C0519" />
              </linearGradient>
              <linearGradient id="dtDragonGoldTrim" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="40%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>

            {/* Sweeping 3D Golden Dragon Horns */}
            <path
              d="M28 32 C16 20, 12 8, 22 6 C26 14, 32 20, 38 26 Z"
              fill="url(#dtDragonHorns3D)"
              stroke="#FEF08A"
              strokeWidth="1.2"
            />
            <path
              d="M72 32 C84 20, 88 8, 78 6 C74 14, 68 20, 62 26 Z"
              fill="url(#dtDragonHorns3D)"
              stroke="#FEF08A"
              strokeWidth="1.2"
            />

            {/* Side Fin Scales / Mane */}
            <path
              d="M20 44 L8 36 L14 52 L6 58 L22 64 Z"
              fill="url(#dtDragonGoldTrim)"
            />
            <path
              d="M80 44 L92 36 L86 52 L94 58 L78 64 Z"
              fill="url(#dtDragonGoldTrim)"
            />

            {/* Main 3D Sculpted Dragon Head Dome & Snout */}
            <path
              d="M30 24 L50 14 L70 24 L80 46 L68 76 L50 90 L32 76 L20 46 Z"
              fill="url(#dtDragonArmor3D)"
              stroke="url(#dtDragonGoldTrim)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Forehead Imperial Golden Crest */}
            <path
              d="M50 16 L58 30 L50 42 L42 30 Z"
              fill="url(#dtDragonGoldTrim)"
            />

            {/* Fierce 3D Golden Eyebrow Ridges */}
            <path
              d="M24 42 L44 48 L42 42 L26 36 Z"
              fill="url(#dtDragonGoldTrim)"
            />
            <path
              d="M76 42 L56 48 L58 42 L74 36 Z"
              fill="url(#dtDragonGoldTrim)"
            />

            {/* Glowing 3D Dragon Eyes */}
            <polygon points="28,46 42,50 38,55 26,51" fill="#FEF08A" />
            <polygon points="72,46 58,50 62,55 74,51" fill="#FEF08A" />
            <circle cx="35" cy="50" r="2.2" fill="#DC2626" />
            <circle cx="65" cy="50" r="2.2" fill="#DC2626" />

            {/* Sculpted Nasal Bridge & Whiskers */}
            <path
              d="M42 54 L50 46 L58 54 L62 70 L50 76 L38 70 Z"
              fill="#9F1239"
              stroke="url(#dtDragonGoldTrim)"
              strokeWidth="1.5"
            />
            <path
              d="M36 66 C20 62, 12 72, 8 82"
              stroke="url(#dtDragonGoldTrim)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M64 66 C80 62, 88 72, 92 82"
              stroke="url(#dtDragonGoldTrim)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Dragon Fangs & Roaring Jaw */}
            <polygon points="38,72 42,82 46,74" fill="#FFFFFF" />
            <polygon points="62,72 58,82 54,74" fill="#FFFFFF" />
            <circle cx="45" cy="65" r="2.5" fill="#450A0A" />
            <circle cx="55" cy="65" r="2.5" fill="#450A0A" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ==================== 2. SCULPTED 3D TIGER ICON ====================
const Tiger3DIcon: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  isWinner?: boolean;
}> = ({ size = 'md', active = false, isWinner = false }) => {
  const sizeClasses =
    size === 'lg'
      ? 'w-16 h-16 sm:w-20 sm:h-20'
      : size === 'md'
      ? 'w-12 h-12 sm:w-14 sm:h-14'
      : 'w-9 h-9';

  return (
    <div
      className={`relative ${sizeClasses} flex items-center justify-center select-none transition-transform duration-500 ${
        isWinner ? 'scale-115' : active ? 'scale-105' : 'scale-100'
      }`}
    >
      {/* 3D Volumetric Amber-Gold Aura */}
      <div
        className={`absolute -inset-1 rounded-full blur-md transition-opacity duration-500 pointer-events-none ${
          isWinner
            ? 'bg-amber-400/80 opacity-100 animate-pulse'
            : 'bg-gradient-to-b from-amber-400/40 to-orange-600/30 opacity-85'
        }`}
      />

      {/* 3D Extruded Medallion Base */}
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-yellow-200 via-amber-500 to-amber-950 p-[2px] shadow-[0_6px_0_#451A03,0_10px_20px_rgba(245,158,11,0.55)] border border-yellow-200/90 flex items-center justify-center overflow-hidden">
        <div className="w-full h-full rounded-[14px] bg-[radial-gradient(circle_at_50%_25%,_#b45309_0%,_#451a03_62%,_#090d16_100%)] flex items-center justify-center relative overflow-hidden">
          {/* 3D Specular Glass Top Highlight */}
          <div className="absolute inset-x-1 top-0.5 h-1/3 rounded-t-xl bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

          {/* Detailed 3D Sculpted Bengal Tiger Head SVG */}
          <svg viewBox="0 0 100 100" className="w-[88%] h-[88%] drop-shadow-[0_4px_6px_rgba(0,0,0,0.85)]">
            <defs>
              <linearGradient id="dtTigerFur3D" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="35%" stopColor="#F59E0B" />
                <stop offset="80%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
              <linearGradient id="dtTigerRuff3D" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="70%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>

            {/* 3D Rounded Tiger Ears */}
            <circle cx="24" cy="24" r="12" fill="url(#dtTigerFur3D)" stroke="#FEF08A" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="6" fill="#27272A" />
            <circle cx="76" cy="24" r="12" fill="url(#dtTigerFur3D)" stroke="#FEF08A" strokeWidth="1.5" />
            <circle cx="76" cy="24" r="6" fill="#27272A" />

            {/* Side White & Gold Cheek Ruff */}
            <path
              d="M16 48 L8 56 L16 66 L12 74 L28 78 L50 88 L72 78 L88 74 L84 66 L92 56 L84 48 Z"
              fill="url(#dtTigerRuff3D)"
              stroke="#F59E0B"
              strokeWidth="1.5"
            />

            {/* Main 3D Sculpted Tiger Head */}
            <path
              d="M22 30 C28 16, 72 16, 78 30 C88 46, 84 68, 70 78 C58 86, 42 86, 30 78 C16 68, 12 46, 22 30 Z"
              fill="url(#dtTigerFur3D)"
              stroke="#FEF08A"
              strokeWidth="2"
            />

            {/* Royal King ('Wang' 王) Forehead Stripes & Cheek Stripes */}
            <path
              d="M38 26 H62 M42 33 H58 M50 22 V38"
              stroke="#18181B"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M18 46 L28 48 M16 54 L26 55 M82 46 L72 48 M84 54 L74 55"
              stroke="#18181B"
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* Fierce 3D Glowing Tiger Eyes */}
            <path d="M26 44 L42 48 L38 55 L24 50 Z" fill="#18181B" />
            <path d="M74 44 L58 48 L62 55 L76 50 Z" fill="#18181B" />
            <ellipse cx="34" cy="49" rx="5" ry="3.5" fill="#ECFCCB" />
            <ellipse cx="66" cy="49" rx="5" ry="3.5" fill="#ECFCCB" />
            <circle cx="34" cy="49" r="2" fill="#0F172A" />
            <circle cx="66" cy="49" r="2" fill="#0F172A" />

            {/* 3D Snout & Muzzle Pads */}
            <ellipse cx="42" cy="67" rx="10" ry="8" fill="url(#dtTigerRuff3D)" />
            <ellipse cx="58" cy="67" rx="10" ry="8" fill="url(#dtTigerRuff3D)" />
            <polygon points="42,58 58,58 50,67" fill="#FB7185" stroke="#881337" strokeWidth="1.2" />

            {/* Roaring Mouth & 3D White Fangs */}
            <path d="M38 73 Q50 84 62 73 Z" fill="#450A0A" stroke="#18181B" strokeWidth="1.5" />
            <polygon points="41,73 44,80 47,74" fill="#FFFFFF" />
            <polygon points="59,73 56,80 53,74" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ==================== 3. SCULPTED 3D TIE ICON ====================
const Tie3DIcon: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  isWinner?: boolean;
}> = ({ size = 'md', active = false, isWinner = false }) => {
  const sizeClasses =
    size === 'lg'
      ? 'w-16 h-16 sm:w-20 sm:h-20'
      : size === 'md'
      ? 'w-12 h-12 sm:w-14 sm:h-14'
      : 'w-9 h-9';

  return (
    <div
      className={`relative ${sizeClasses} flex items-center justify-center select-none transition-transform duration-500 ${
        isWinner ? 'scale-115' : active ? 'scale-105' : 'scale-100'
      }`}
    >
      {/* 3D Volumetric Emerald-Gold Aura */}
      <div
        className={`absolute -inset-1 rounded-full blur-md transition-opacity duration-500 pointer-events-none ${
          isWinner
            ? 'bg-emerald-400/85 opacity-100 animate-pulse'
            : 'bg-gradient-to-b from-emerald-400/40 to-teal-600/30 opacity-85'
        }`}
      />

      {/* 3D Extruded Medallion Base */}
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-emerald-200 via-emerald-500 to-emerald-950 p-[2px] shadow-[0_6px_0_#064E3B,0_10px_20px_rgba(16,185,129,0.55)] border border-emerald-200/80 flex items-center justify-center overflow-hidden">
        <div className="w-full h-full rounded-[14px] bg-[radial-gradient(circle_at_50%_25%,_#047857_0%,_#064e3b_62%,_#090d16_100%)] flex items-center justify-center relative overflow-hidden">
          {/* 3D Specular Glass Top Highlight */}
          <div className="absolute inset-x-1 top-0.5 h-1/3 rounded-t-xl bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

          {/* Detailed 3D Sculpted Tie Yin-Yang & Crossed Golden Blades Emblem */}
          <svg viewBox="0 0 100 100" className="w-[88%] h-[88%] drop-shadow-[0_4px_6px_rgba(0,0,0,0.85)]">
            <defs>
              <linearGradient id="dtTieGold3D" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
              <linearGradient id="dtTieEmerald3D" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#064E3B" />
              </linearGradient>
            </defs>

            {/* Crossed 3D Golden Royal Swords */}
            <path
              d="M16 84 L84 16 M72 14 L86 28 M14 72 L28 86"
              stroke="url(#dtTieGold3D)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <path
              d="M84 84 L16 16 M14 28 L28 14 M72 86 L86 72"
              stroke="url(#dtTieGold3D)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />

            {/* Outer 3D Golden Octagon Shield */}
            <circle
              cx="50"
              cy="52"
              r="30"
              fill="url(#dtTieEmerald3D)"
              stroke="url(#dtTieGold3D)"
              strokeWidth="4"
            />

            {/* Dragon Crimson Left Swirl & Tiger Gold Right Swirl (Balance Yin-Yang) */}
            <path
              d="M50 24 A28 28 0 0 0 50 80 A14 14 0 0 0 50 52 A14 14 0 0 1 50 24 Z"
              fill="#E11D48"
              opacity="0.9"
            />
            <path
              d="M50 24 A28 28 0 0 1 50 80 A14 14 0 0 1 50 52 A14 14 0 0 0 50 24 Z"
              fill="#F59E0B"
              opacity="0.9"
            />

            {/* Center 3D Emerald Balance Core */}
            <circle
              cx="50"
              cy="52"
              r="15"
              fill="#022C22"
              stroke="url(#dtTieGold3D)"
              strokeWidth="3"
            />

            {/* Equal / Tie 3D Gold Bars */}
            <rect x="41" y="46" width="18" height="4.5" rx="2.2" fill="#FEF08A" />
            <rect x="41" y="54" width="18" height="4.5" rx="2.2" fill="#FEF08A" />

            {/* Top Imperial Crown */}
            <path
              d="M34 22 L38 10 L50 18 L62 10 L66 22 Z"
              fill="url(#dtTieGold3D)"
              stroke="#FFFBEB"
              strokeWidth="1.2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ==================== TRUE 3D DUAL-SIDED FLIPPING CASINO CARD ====================
const PlayingCard3D: React.FC<{
  card: Card;
  isRevealed: boolean;
  isDealing: boolean;
  side: 'dragon' | 'tiger';
  isWinner: boolean;
}> = ({ card, isRevealed, isDealing, side, isWinner }) => {
  const isRedSuit = card.suit === '♥' || card.suit === '♦';
  const isCourtCard = card.value === 1 || card.value >= 11;

  const borderGlow =
    side === 'dragon'
      ? isWinner
        ? 'ring-4 ring-red-400 shadow-[0_0_35px_rgba(239,68,68,0.85)]'
        : 'shadow-[0_12px_25px_rgba(0,0,0,0.75)]'
      : isWinner
      ? 'ring-4 ring-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.85)]'
      : 'shadow-[0_12px_25px_rgba(0,0,0,0.75)]';

  return (
    <div className="relative select-none" style={{ width: '92px', height: '132px', perspective: '900px' }}>
      {/* Winner Floating Crown */}
      {isWinner && isRevealed && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 font-black text-[9px] shadow-lg border border-white animate-bounce whitespace-nowrap">
          <Crown className="w-3 h-3 fill-slate-950" />
          <span>WINNER</span>
        </div>
      )}

      {/* 3D Card Inner Flipper */}
      <div
        className={`w-full h-full relative transition-all duration-700 rounded-2xl ${borderGlow}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isRevealed
            ? 'rotateY(180deg) translateZ(8px) scale(1.04)'
            : isDealing
            ? 'rotateY(0deg) translateY(-6px) rotateX(12deg)'
            : 'rotateY(0deg) rotateX(6deg)'
        }}
      >
        {/* CARD BACK (0 deg) — Features 3D Dragon / 3D Tiger Icon */}
        <div
          className={`absolute inset-0 rounded-2xl p-1.5 flex flex-col items-center justify-center border-2 ${
            side === 'dragon'
              ? 'bg-gradient-to-br from-red-900 via-slate-950 to-red-950 border-red-400/70'
              : 'bg-gradient-to-br from-amber-800 via-slate-950 to-amber-950 border-amber-400/70'
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            className={`w-full h-full rounded-xl border border-dashed flex flex-col items-center justify-center relative overflow-hidden ${
              side === 'dragon' ? 'border-red-400/40 bg-red-950/40' : 'border-amber-400/40 bg-amber-950/40'
            }`}
          >
            {side === 'dragon' ? (
              <Dragon3DIcon size="sm" />
            ) : (
              <Tiger3DIcon size="sm" />
            )}
            <span className="mt-1.5 text-[9px] font-black tracking-widest text-amber-200/90 uppercase">
              {side === 'dragon' ? 'DRAGON' : 'TIGER'}
            </span>
          </div>
        </div>

        {/* CARD FRONT (180 deg) */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-amber-50 border-2 border-amber-300 p-2 flex flex-col justify-between shadow-inner"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Top-Left Corner Pip */}
          <div className={`flex flex-col items-start leading-none ${isRedSuit ? 'text-red-600' : 'text-slate-900'}`}>
            <span className="text-base font-black tracking-tighter">{card.label}</span>
            <span className="text-xs">{card.suit}</span>
          </div>

          {/* Center 3D Suit / Royal Court Art */}
          <div className="flex flex-col items-center justify-center my-auto relative">
            {isCourtCard && (
              <Crown
                className={`w-4 h-4 -mb-1 ${
                  isRedSuit ? 'text-red-500 fill-red-500/30' : 'text-amber-500 fill-amber-400/40'
                }`}
              />
            )}
            <span
              className={`text-4xl leading-none drop-shadow-sm ${
                isRedSuit ? 'text-red-600' : 'text-slate-900'
              }`}
            >
              {card.suit}
            </span>
            <span className="mt-1 px-1.5 py-0.2 rounded bg-slate-900/10 text-[9px] font-mono font-bold text-slate-700">
              {card.value} PTS
            </span>
          </div>

          {/* Bottom-Right Corner Pip (Inverted) */}
          <div
            className={`flex flex-col items-start leading-none rotate-180 self-end ${
              isRedSuit ? 'text-red-600' : 'text-slate-900'
            }`}
          >
            <span className="text-base font-black tracking-tighter">{card.label}</span>
            <span className="text-xs">{card.suit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DragonTigerGame: React.FC<DragonTigerGameProps> = ({
  user,
  onBackToLobby,
  onOpenDeposit,
  onOpenAuth
}) => {
  const { showToast } = useToast();

  // Round & 3D Table State
  const [roundPeriod, setRoundPeriod] = useState<string>(() => `DT${Date.now().toString().slice(-6)}`);
  const [countdown, setCountdown] = useState<number>(15);
  const [isDealing, setIsDealing] = useState<boolean>(false);
  const [revealStage, setRevealStage] = useState<'betting' | 'dragon_revealed' | 'tiger_revealed' | 'result'>('betting');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => soundFx.isSfxActive());
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showVictoryPopup, setShowVictoryPopup] = useState<boolean>(false);
  const [lastRoundResult, setLastRoundResult] = useState<{
    period: string;
    status: 'win' | 'loss';
    winner: RoundOutcome;
    dragonCard: Card;
    tigerCard: Card;
    totalBet: number;
    totalWon: number;
    netProfit: number;
    tieRefund: number;
    betsPlaced: Record<BetSide, number>;
  } | null>(null);

  // Active Cards on the 3D Table
  const [dragonCard, setDragonCard] = useState<Card>({ value: 12, suit: '♠', label: 'Q' });
  const [tigerCard, setTigerCard] = useState<Card>({ value: 9, suit: '♥', label: '9' });
  const [roundWinner, setRoundWinner] = useState<RoundOutcome | null>(null);

  // Selected 3D Casino Chip
  const [selectedChip, setSelectedChip] = useState<number>(100);

  // Current Round User Bets (ONLY 3 ZONES: Dragon, Tie, Tiger)
  const [userBets, setUserBets] = useState<Record<BetSide, number>>({
    dragon: 0,
    tie: 0,
    tiger: 0
  });
  const [lastPlacedBets, setLastPlacedBets] = useState<Record<BetSide, number>>({
    dragon: 0,
    tie: 0,
    tiger: 0
  });

  // Live Table Totals (Crowd + User)
  const [tableTotals, setTableTotals] = useState<Record<BetSide, number>>({
    dragon: 26580,
    tie: 6710,
    tiger: 19980
  });

  // 24-Round Bead Plate Roadmap History
  const [roadmap, setRoadmap] = useState<RoadmapEntry[]>(() => [
    { period: 'DT884101', winner: 'dragon', dragonCard: { value: 11, suit: '♠', label: 'J' }, tigerCard: { value: 6, suit: '♦', label: '6' } },
    { period: 'DT884102', winner: 'tiger', dragonCard: { value: 4, suit: '♣', label: '4' }, tigerCard: { value: 13, suit: '♥', label: 'K' } },
    { period: 'DT884103', winner: 'dragon', dragonCard: { value: 9, suit: '♥', label: '9' }, tigerCard: { value: 5, suit: '♠', label: '5' } },
    { period: 'DT884104', winner: 'dragon', dragonCard: { value: 12, suit: '♦', label: 'Q' }, tigerCard: { value: 8, suit: '♣', label: '8' } },
    { period: 'DT884105', winner: 'tie', dragonCard: { value: 7, suit: '♠', label: '7' }, tigerCard: { value: 7, suit: '♥', label: '7' } },
    { period: 'DT884106', winner: 'tiger', dragonCard: { value: 3, suit: '♦', label: '3' }, tigerCard: { value: 10, suit: '♠', label: '10' } },
    { period: 'DT884107', winner: 'tiger', dragonCard: { value: 8, suit: '♣', label: '8' }, tigerCard: { value: 11, suit: '♥', label: 'J' } },
    { period: 'DT884108', winner: 'dragon', dragonCard: { value: 13, suit: '♠', label: 'K' }, tigerCard: { value: 9, suit: '♦', label: '9' } },
    { period: 'DT884109', winner: 'tiger', dragonCard: { value: 2, suit: '♥', label: '2' }, tigerCard: { value: 6, suit: '♣', label: '6' } },
    { period: 'DT884110', winner: 'dragon', dragonCard: { value: 10, suit: '♦', label: '10' }, tigerCard: { value: 4, suit: '♠', label: '4' } },
    { period: 'DT884111', winner: 'dragon', dragonCard: { value: 12, suit: '♥', label: 'Q' }, tigerCard: { value: 7, suit: '♣', label: '7' } },
    { period: 'DT884112', winner: 'tiger', dragonCard: { value: 5, suit: '♠', label: '5' }, tigerCard: { value: 13, suit: '♦', label: 'K' } }
  ]);

  const userBetsRef = useRef(userBets);
  userBetsRef.current = userBets;
  const tableTotalsRef = useRef(tableTotals);
  tableTotalsRef.current = tableTotals;
  const roundPeriodRef = useRef(roundPeriod);
  roundPeriodRef.current = roundPeriod;
  const userRef = useRef(user);
  userRef.current = user;
  const isDealingRef = useRef<boolean>(false);
  const dealTimersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      dealTimersRef.current.forEach((id) => window.clearTimeout(id));
      dealTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    return soundFx.subscribe(() => {
      setSoundEnabled(soundFx.isSfxActive());
    });
  }, []);

  // Simulate live crowd bets trickling onto the 3D table during open betting
  useEffect(() => {
    if (isDealing || countdown <= 3) return;
    const crowdTimer = setInterval(() => {
      setTableTotals((prev) => ({
        dragon: prev.dragon + Math.floor(Math.random() * 5 + 1) * 100,
        tie: prev.tie + Math.floor(Math.random() * 4 + 1) * 100,
        tiger: prev.tiger + Math.floor(Math.random() * 5 + 1) * 100
      }));
    }, 1400);
    return () => clearInterval(crowdTimer);
  }, [isDealing, countdown]);

  const startNextBettingRound = useCallback(() => {
    isDealingRef.current = false;
    setIsDealing(false);
    setRevealStage('betting');
    setRoundWinner(null);
    setUserBets({ dragon: 0, tie: 0, tiger: 0 });
    setRoundPeriod(`DT${Date.now().toString().slice(-6)}`);
    setCountdown(15);
    setTableTotals({
      dragon: Math.floor(Math.random() * 18000) + 12000,
      tie: Math.floor(Math.random() * 16000) + 10000,
      tiger: Math.floor(Math.random() * 18000) + 12000
    });
  }, []);

  const handleDealCards = useCallback(() => {
    if (isDealingRef.current) return;
    isDealingRef.current = true;
    setIsDealing(true);
    setRevealStage('betting');
    setShowVictoryPopup(false);

    dealTimersRef.current.forEach((id) => window.clearTimeout(id));
    dealTimersRef.current = [];

    const activeBets = { ...userBetsRef.current };
    const currentTotals = { ...tableTotalsRef.current };
    const currentPeriod = roundPeriodRef.current;
    const currentUser = userRef.current;
    const totalStakedThisRound = activeBets.dragon + activeBets.tie + activeBets.tiger;

    if (totalStakedThisRound > 0) {
      setLastPlacedBets(activeBets);
    }

    const dSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const tSuit = SUITS[Math.floor(Math.random() * SUITS.length)];

    // ==================== HOUSE MARGIN ENGINE: LOWEST BET AMOUNT AMONG THE 3 WINS ====================
    let targetWinner: RoundOutcome = 'dragon';

    if (totalStakedThisRound > 0) {
      const dBet = activeBets.dragon;
      const tieBet = activeBets.tie;
      const tBet = activeBets.tiger;

      if (dBet > 0 && tieBet > 0 && tBet > 0) {
        // User bet on all 3 zones -> pick the zone with the lowest bet amount (and lowest payout on ties)
        const minBet = Math.min(dBet, tieBet, tBet);
        const candidates: RoundOutcome[] = [];
        if (dBet === minBet) candidates.push('dragon');
        if (tBet === minBet) candidates.push('tiger');
        if (tieBet === minBet) candidates.push('tie');

        if (candidates.length === 1) {
          targetWinner = candidates[0];
        } else {
          // Tie-breaker by lowest payout liability
          const payouts: Record<RoundOutcome, number> = {
            dragon: dBet * 1.98,
            tiger: tBet * 1.98,
            tie: tieBet * 9.0
          };
          candidates.sort((a, b) => payouts[a] - payouts[b]);
          targetWinner = candidates[0];
        }
      } else if (dBet > 0 && tBet > 0 && tieBet === 0) {
        // User bet on Dragon and Tiger
        if (dBet < tBet) {
          targetWinner = 'dragon';
        } else if (tBet < dBet) {
          targetWinner = 'tiger';
        } else {
          // Equal bet on Dragon & Tiger -> Tie has ₹0 bet so Tie wins
          targetWinner = 'tie';
        }
      } else if (dBet > 0 && tieBet > 0 && tBet === 0) {
        // Tiger has ₹0 bet (lowest among the 3)
        targetWinner = 'tiger';
      } else if (tBet > 0 && tieBet > 0 && dBet === 0) {
        // Dragon has ₹0 bet (lowest among the 3)
        targetWinner = 'dragon';
      } else if (dBet > 0) {
        // Only Dragon has bet -> Tiger (₹0) wins
        targetWinner = 'tiger';
      } else if (tBet > 0) {
        // Only Tiger has bet -> Dragon (₹0) wins
        targetWinner = 'dragon';
      } else {
        // Only Tie has bet -> Dragon or Tiger (₹0) wins
        targetWinner = currentTotals.dragon <= currentTotals.tiger ? 'dragon' : 'tiger';
      }
    } else {
      // No user bet placed -> pick whichever of the 3 has the lowest table pot
      if (currentTotals.tie < currentTotals.dragon && currentTotals.tie < currentTotals.tiger && Math.random() < 0.25) {
        targetWinner = 'tie';
      } else if (currentTotals.dragon <= currentTotals.tiger) {
        targetWinner = 'dragon';
      } else {
        targetWinner = 'tiger';
      }
    }

    // Generate authentic card values matching targetWinner
    let dVal = 10;
    let tVal = 7;
    if (targetWinner === 'dragon') {
      dVal = Math.floor(Math.random() * 6) + 8; // 8..13
      tVal = Math.floor(Math.random() * (dVal - 1)) + 1; // 1..(dVal-1)
    } else if (targetWinner === 'tiger') {
      tVal = Math.floor(Math.random() * 6) + 8; // 8..13
      dVal = Math.floor(Math.random() * (tVal - 1)) + 1; // 1..(tVal-1)
    } else {
      const tieRank = Math.floor(Math.random() * 13) + 1;
      dVal = tieRank;
      tVal = tieRank;
    }

    const newDragon: Card = { value: dVal, suit: dSuit, label: LABELS[dVal] };
    const newTiger: Card = { value: tVal, suit: tSuit, label: LABELS[tVal] };

    // Step 1: 3D Flip Dragon Card at 800ms
    const t1 = window.setTimeout(() => {
      setDragonCard(newDragon);
      setRevealStage('dragon_revealed');
      soundFx.playCardFlip();
    }, 800);

    // Step 2: 3D Flip Tiger Card at 1750ms
    const t2 = window.setTimeout(() => {
      setTigerCard(newTiger);
      setRevealStage('tiger_revealed');
      soundFx.playCardFlip();
    }, 1750);

    // Step 3: Settle Winner & Trigger 3D Win/Lose Popup at 2550ms
    const t3 = window.setTimeout(() => {
      const winner: RoundOutcome = targetWinner;

      setRoundWinner(winner);
      setRevealStage('result');
      setRoadmap((prev) => [
        { period: currentPeriod, winner, dragonCard: newDragon, tigerCard: newTiger },
        ...prev.slice(0, 23)
      ]);

      // Calculate verified payout
      let totalWon = 0;
      const tieRefund = 0;

      if (winner === 'dragon' && activeBets.dragon > 0) {
        totalWon += Math.round(activeBets.dragon * 1.98 * 100) / 100;
      } else if (winner === 'tiger' && activeBets.tiger > 0) {
        totalWon += Math.round(activeBets.tiger * 1.98 * 100) / 100;
      } else if (winner === 'tie' && activeBets.tie > 0) {
        totalWon += Math.round(activeBets.tie * 9.0 * 100) / 100;
      }

      if (totalStakedThisRound > 0 && currentUser) {
        if (totalWon > 0) {
          store.recordGamePayout(
            currentUser.uid,
            totalWon,
            'Dragon Tiger 3D',
            `dt_win_${currentPeriod}`
          );
        }

        const netProfit = Math.round((totalWon - totalStakedThisRound) * 100) / 100;
        const isUserVictory = totalWon > 0 && totalWon >= totalStakedThisRound;

        if (isUserVictory) {
          soundFx.play3dVictoryTrumpet();
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.55 } });
          showToast(
            `👑 YOU WON ₹${totalWon.toLocaleString('en-IN')} on ${winner.toUpperCase()}!`,
            'success'
          );
        } else {
          soundFx.play3dDefeatTrombone();
          showToast(
            `💔 ${winner.toUpperCase()} Won · You Lost ₹${Math.abs(netProfit).toLocaleString('en-IN')}`,
            'error'
          );
        }

        setLastRoundResult({
          period: currentPeriod,
          status: isUserVictory ? 'win' : 'loss',
          winner,
          dragonCard: newDragon,
          tigerCard: newTiger,
          totalBet: totalStakedThisRound,
          totalWon,
          netProfit,
          tieRefund,
          betsPlaced: activeBets
        });
        setShowVictoryPopup(true);
      } else {
        soundFx.playWinFanfare();
      }
    }, 2550);

    // Step 4: Unlock Next Round Table at 6200ms
    const t4 = window.setTimeout(() => {
      startNextBettingRound();
    }, 6200);

    // Step 5: Auto-dismiss Result Popup at 7800ms if still open
    const t5 = window.setTimeout(() => {
      setShowVictoryPopup(false);
    }, 7800);

    dealTimersRef.current = [t1, t2, t3, t4, t5];
  }, [showToast, startNextBettingRound]);

  // 1-Second Pure Countdown Timer (StrictMode Safe)
  useEffect(() => {
    if (isDealing) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isDealing]);

  // Trigger Sound & Deal Side Effects Cleanly Outside State Updater
  useEffect(() => {
    if (isDealing) return;
    if (countdown <= 5 && countdown >= 1) {
      soundFx.playCountdownTick();
    }
    if (countdown === 0) {
      handleDealCards();
    }
  }, [countdown, isDealing, handleDealCards]);

  // Place a 3D Chip Bet on Dragon, Tie, or Tiger
  const handlePlaceBet = (side: BetSide, customAmount?: number) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (isDealing || countdown <= 3) {
      showToast('Betting is locked for this deal! Wait for next round.', 'info');
      return;
    }
    const wager = customAmount ?? selectedChip;
    if (user.balance < wager) {
      showToast(`Insufficient wallet balance! Required: ₹${wager}`, 'error');
      onOpenDeposit();
      return;
    }

    const betRefId = `dt_bet_${roundPeriod}_${side}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const betRes = store.recordGameBet(user.uid, wager, `Dragon Tiger 3D [${side.toUpperCase()}]`, betRefId);
    if (!betRes.success) {
      showToast(betRes.error || 'Please wait a moment between bets', 'error');
      return;
    }

    soundFx.playChipSound();
    setUserBets((prev) => ({
      ...prev,
      [side]: prev[side] + wager
    }));
    setTableTotals((prev) => ({
      ...prev,
      [side]: prev[side] + wager
    }));
  };

  // Repeat Previous Round Bets
  const handleRepeatLastBet = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (isDealing || countdown <= 3) {
      showToast('Betting is locked for this deal!', 'info');
      return;
    }
    const totalPrev = lastPlacedBets.dragon + lastPlacedBets.tie + lastPlacedBets.tiger;
    if (totalPrev <= 0) {
      showToast('No previous round bet to repeat.', 'info');
      return;
    }
    if (user.balance < totalPrev) {
      showToast(`Insufficient balance to repeat ₹${totalPrev} bet!`, 'error');
      onOpenDeposit();
      return;
    }

    const betRefId = `dt_rep_${roundPeriod}_${Date.now()}`;
    const res = store.recordGameBet(user.uid, totalPrev, 'Dragon Tiger 3D [REPEAT BET]', betRefId);
    if (!res.success) {
      showToast(res.error || 'Could not repeat bet', 'error');
      return;
    }

    soundFx.playChipSound();
    setUserBets((prev) => ({
      dragon: prev.dragon + lastPlacedBets.dragon,
      tie: prev.tie + lastPlacedBets.tie,
      tiger: prev.tiger + lastPlacedBets.tiger
    }));
    setTableTotals((prev) => ({
      dragon: prev.dragon + lastPlacedBets.dragon,
      tie: prev.tie + lastPlacedBets.tie,
      tiger: prev.tiger + lastPlacedBets.tiger
    }));
    showToast(`Repeated ₹${totalPrev} bet across table!`, 'success');
  };

  // 2X Double Current Bets on Table
  const handleDoubleCurrentBet = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (isDealing || countdown <= 3) {
      showToast('Betting is locked for this deal!', 'info');
      return;
    }
    const currentTotal = userBets.dragon + userBets.tie + userBets.tiger;
    if (currentTotal <= 0) {
      showToast('Place a chip on the table first to double (2X)!', 'info');
      return;
    }
    if (user.balance < currentTotal) {
      showToast(`Insufficient balance to double ₹${currentTotal}!`, 'error');
      onOpenDeposit();
      return;
    }

    const betRefId = `dt_2x_${roundPeriod}_${Date.now()}`;
    const res = store.recordGameBet(user.uid, currentTotal, 'Dragon Tiger 3D [2X DOUBLE]', betRefId);
    if (!res.success) {
      showToast(res.error || 'Could not double bet', 'error');
      return;
    }

    soundFx.playChipSound();
    setUserBets((prev) => ({
      dragon: prev.dragon * 2,
      tie: prev.tie * 2,
      tiger: prev.tiger * 2
    }));
    setTableTotals((prev) => ({
      dragon: prev.dragon + userBets.dragon,
      tie: prev.tie + userBets.tie,
      tiger: prev.tiger + userBets.tiger
    }));
    showToast(`Doubled your table bet to ₹${currentTotal * 2}!`, 'success');
  };

  const totalUserBet = userBets.dragon + userBets.tie + userBets.tiger;
  const dragonVsTigerTotal = Math.max(1, tableTotals.dragon + tableTotals.tiger);
  const dragonPercent = Math.round((tableTotals.dragon / dragonVsTigerTotal) * 100);
  const tigerPercent = 100 - dragonPercent;

  // Roadmap Statistics
  const dragonWinsCount = roadmap.filter((r) => r.winner === 'dragon').length;
  const tigerWinsCount = roadmap.filter((r) => r.winner === 'tiger').length;
  const tieWinsCount = roadmap.filter((r) => r.winner === 'tie').length;

  return (
    <div className="max-w-xl mx-auto px-2.5 sm:px-4 py-2.5 space-y-3 select-none pb-8">
      {/* ==================== 1. ROYAL 3D TOP COMMAND BAR ==================== */}
      <div className="flex items-center justify-between gap-2 bg-slate-950/90 border border-amber-500/30 rounded-2xl px-3 py-2 shadow-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToLobby}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-amber-300 transition active:scale-95"
            title="Back to Lobby"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h1 className="text-xs sm:text-sm font-black tracking-wider bg-gradient-to-r from-red-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                DRAGON vs TIGER 3D
              </h1>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Shoe #{roundPeriod} · 8-Deck 3D Table
            </div>
          </div>
        </div>

        {/* Wallet + Audio + Rules */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenDeposit}
            className="flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-amber-500/40 shadow-inner"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-mono font-black text-amber-300 tabular-nums">
              ₹{user ? user.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => soundFx.toggleMute()}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:border-amber-500/40 transition"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            title="3D Table Rules & Payouts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ==================== 2. 3D PERSPECTIVE CASINO ARENA & CARD SHOE STAGE ==================== */}
      <div className="relative [perspective:1200px]">
        <div
          className="relative overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_top,_#450a0a_0%,_#0f172a_52%,_#451a03_100%)] border-2 border-amber-500/50 p-3.5 sm:p-5 shadow-[0_14px_0_#1E1B4B,0_22px_50px_rgba(0,0,0,0.85)] transition-transform duration-500"
          style={{ transform: 'rotateX(4deg)', transformStyle: 'preserve-3d' }}
        >
          {/* Ambient 3D Dragon Crimson & Tiger Gold Spotlights */}
          <div className="absolute -top-10 -left-10 w-44 h-44 bg-red-600/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />

          {/* Top Bar Inside 3D Arena: Golden Shoe + 3D Countdown Orb + Live Players */}
          <div className="relative z-10 flex items-center justify-between mb-3">
            {/* 3D Golden Card Shoe */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-amber-500/30 shadow-md">
              <div className="w-5 h-6 rounded bg-gradient-to-b from-amber-300 to-amber-700 border border-yellow-200 flex items-center justify-center shadow">
                <span className="text-[9px] font-black text-slate-950">♠</span>
              </div>
              <div className="leading-tight">
                <div className="text-[9px] font-black text-amber-300 uppercase tracking-wider">3D DEALER SHOE</div>
                <div className="text-[10px] text-slate-400 font-mono">Cards: {240 - roadmap.length * 2}/416</div>
              </div>
            </div>

            {/* Central 3D Countdown Ring */}
            <div
              className={`px-3.5 py-1 rounded-2xl border-2 flex items-center gap-1.5 shadow-lg transition-all ${
                isDealing
                  ? 'bg-purple-950/90 border-purple-400 text-purple-200'
                  : countdown <= 5
                  ? 'bg-rose-950/90 border-rose-400 text-rose-200 animate-pulse scale-105'
                  : 'bg-slate-950/90 border-amber-400/70 text-amber-300'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${countdown <= 5 && !isDealing ? 'animate-spin text-rose-400' : ''}`} />
              <span className="font-mono font-black text-xs sm:text-sm tabular-nums">
                {isDealing
                  ? revealStage === 'result'
                    ? 'SETTLING'
                    : 'DEALING 3D'
                  : `${countdown}s`}
              </span>
            </div>

            {/* Live VIP Crowd Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono font-bold text-slate-200 text-[11px]">418 Live</span>
            </div>
          </div>

          {/* MAIN 3D DUEL STAGE: DRAGON PEDESTAL vs TIE CORE vs TIGER PEDESTAL */}
          <div className="relative z-10 grid grid-cols-3 items-center gap-2 py-2">
            {/* LEFT: DRAGON 3D PEDESTAL */}
            <div className="flex flex-col items-center space-y-1.5">
              <Dragon3DIcon
                size="sm"
                active={revealStage === 'dragon_revealed' || roundWinner === 'dragon'}
                isWinner={roundWinner === 'dragon'}
              />

              <PlayingCard3D
                card={dragonCard}
                isRevealed={
                  revealStage === 'dragon_revealed' ||
                  revealStage === 'tiger_revealed' ||
                  revealStage === 'result'
                }
                isDealing={isDealing}
                side="dragon"
                isWinner={roundWinner === 'dragon'}
              />

              <div className="text-center">
                <span className="text-[11px] font-black tracking-wider text-red-300 block">
                  {revealStage !== 'betting' ? `DRAGON: ${dragonCard.value} PTS` : 'DRAGON HAND'}
                </span>
              </div>
            </div>

            {/* CENTER: 3D TIE EMBLEM & LIVE RESULT BANNER */}
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <Tie3DIcon
                size="sm"
                active={roundWinner === 'tie'}
                isWinner={roundWinner === 'tie'}
              />

              {/* Dynamic Status Callout */}
              {roundWinner ? (
                <div
                  className={`px-3 py-1 rounded-xl font-black text-[11px] tracking-wider uppercase border shadow-xl animate-bounce ${
                    roundWinner === 'dragon'
                      ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-300'
                      : roundWinner === 'tiger'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-white'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-200'
                  }`}
                >
                  {`${roundWinner.toUpperCase()} WINS!`}
                </div>
              ) : (
                <div className="px-2.5 py-1 rounded-xl bg-slate-950/85 border border-slate-800 text-[10px] font-bold text-slate-300">
                  {isDealing
                    ? 'Cards Flipping...'
                    : countdown <= 3
                    ? '🔒 No More Bets'
                    : 'Tap Zone Below'}
                </div>
              )}

              {/* Higher Card Rule Micro Hint */}
              <div className="text-[9px] text-slate-400 font-mono">
                K (13) High · A (1) Low
              </div>
            </div>

            {/* RIGHT: TIGER 3D PEDESTAL */}
            <div className="flex flex-col items-center space-y-1.5">
              <Tiger3DIcon
                size="sm"
                active={revealStage === 'tiger_revealed' || roundWinner === 'tiger'}
                isWinner={roundWinner === 'tiger'}
              />

              <PlayingCard3D
                card={tigerCard}
                isRevealed={revealStage === 'tiger_revealed' || revealStage === 'result'}
                isDealing={isDealing}
                side="tiger"
                isWinner={roundWinner === 'tiger'}
              />

              <div className="text-center">
                <span className="text-[11px] font-black tracking-wider text-amber-300 block">
                  {revealStage === 'tiger_revealed' || revealStage === 'result'
                    ? `TIGER: ${tigerCard.value} PTS`
                    : 'TIGER HAND'}
                </span>
              </div>
            </div>
          </div>

          {/* LIVE DRAGON vs TIGER TUG-OF-WAR SENTIMENT BAR */}
          <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
              <span className="text-red-400">
                DRAGON {dragonPercent}% (₹{tableTotals.dragon.toLocaleString('en-IN')})
              </span>
              <span className="text-amber-300">
                (₹{tableTotals.tiger.toLocaleString('en-IN')}) {tigerPercent}% TIGER
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-l-full transition-all duration-500"
                style={{ width: `${dragonPercent}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-r-full transition-all duration-500"
                style={{ width: `${tigerPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 3. SINGLE-LINE 3-COLUMN COMPACT 3D BETTING ZONES (DRAGON · TIE · TIGER) ==================== */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {/* 1. DRAGON 3D BET ZONE */}
        <button
          type="button"
          onClick={() => handlePlaceBet('dragon')}
          disabled={isDealing || countdown <= 3}
          className={`relative rounded-2xl p-2.5 sm:p-3 border-2 transition-all active:translate-y-0.5 flex flex-col items-center justify-between min-h-[124px] overflow-hidden ${
            roundWinner === 'dragon'
              ? 'bg-gradient-to-b from-red-600 via-red-800 to-red-950 border-yellow-300 ring-2 ring-red-400 shadow-[0_6px_0_#450A0A,0_0_25px_rgba(239,68,68,0.6)]'
              : userBets.dragon > 0
              ? 'bg-gradient-to-b from-red-800/90 via-red-950 to-slate-950 border-red-400 shadow-[0_5px_0_#450A0A]'
              : 'bg-gradient-to-b from-red-950/85 via-slate-900 to-slate-950 border-red-500/50 hover:border-red-400 shadow-[0_5px_0_#450A0A]'
          } ${isDealing || countdown <= 3 ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {/* Top Row: Compact 3D Dragon Icon + Label & Odds */}
          <div className="w-full flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <Dragon3DIcon
                size="sm"
                active={userBets.dragon > 0}
                isWinner={roundWinner === 'dragon'}
              />
              <div className="text-left leading-tight">
                <span className="text-xs font-black tracking-wider text-red-300 block">
                  DRAGON
                </span>
                <span className="text-[10px] font-mono font-black text-red-200">
                  1.98X
                </span>
              </div>
            </div>
          </div>

          {/* Middle Row: User Bet Chip or Tap Prompt */}
          {userBets.dragon > 0 ? (
            <div className="my-1.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-amber-400 shadow animate-bounce">
              <span className="text-[10px] font-mono font-black text-amber-300">
                ₹{userBets.dragon.toLocaleString('en-IN')}
              </span>
            </div>
          ) : (
            <div className="my-1.5 text-xs font-black text-white/90 tracking-wide">
              TAP TO BET
            </div>
          )}

          {/* Footer Pot */}
          <div className="w-full flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-red-200/80 pt-1 border-t border-red-500/20">
            <span>Pot</span>
            <span className="font-bold">₹{tableTotals.dragon.toLocaleString('en-IN')}</span>
          </div>
        </button>

        {/* 2. TIE 3D BET ZONE (CENTER IN SAME LINE) */}
        <button
          type="button"
          onClick={() => handlePlaceBet('tie')}
          disabled={isDealing || countdown <= 3}
          className={`relative rounded-2xl p-2.5 sm:p-3 border-2 transition-all active:translate-y-0.5 flex flex-col items-center justify-between min-h-[124px] overflow-hidden ${
            roundWinner === 'tie'
              ? 'bg-gradient-to-b from-emerald-500 via-teal-700 to-emerald-950 border-yellow-300 ring-2 ring-emerald-300 shadow-[0_6px_0_#064E3B,0_0_25px_rgba(16,185,129,0.6)]'
              : userBets.tie > 0
              ? 'bg-gradient-to-b from-emerald-800/90 via-emerald-950 to-slate-950 border-emerald-400 shadow-[0_5px_0_#064E3B]'
              : 'bg-gradient-to-b from-emerald-950/85 via-slate-900 to-slate-950 border-emerald-500/50 hover:border-emerald-400 shadow-[0_5px_0_#022C22]'
          } ${isDealing || countdown <= 3 ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {/* Top Row: Compact 3D Tie Icon + Label & Odds */}
          <div className="w-full flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <Tie3DIcon
                size="sm"
                active={userBets.tie > 0}
                isWinner={roundWinner === 'tie'}
              />
              <div className="text-left leading-tight">
                <span className="text-xs font-black tracking-wider text-emerald-300 block">
                  TIE
                </span>
                <span className="text-[10px] font-mono font-black text-emerald-200">
                  9.0X
                </span>
              </div>
            </div>
          </div>

          {/* Middle Row: User Bet Chip or Tap Prompt */}
          {userBets.tie > 0 ? (
            <div className="my-1.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-amber-400 shadow animate-bounce">
              <span className="text-[10px] font-mono font-black text-amber-300">
                ₹{userBets.tie.toLocaleString('en-IN')}
              </span>
            </div>
          ) : (
            <div className="my-1.5 text-xs font-black text-white/90 tracking-wide">
              TAP TO BET
            </div>
          )}

          {/* Footer Pot */}
          <div className="w-full flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-emerald-200/80 pt-1 border-t border-emerald-500/20">
            <span>Pot</span>
            <span className="font-bold">₹{tableTotals.tie.toLocaleString('en-IN')}</span>
          </div>
        </button>

        {/* 3. TIGER 3D BET ZONE */}
        <button
          type="button"
          onClick={() => handlePlaceBet('tiger')}
          disabled={isDealing || countdown <= 3}
          className={`relative rounded-2xl p-2.5 sm:p-3 border-2 transition-all active:translate-y-0.5 flex flex-col items-center justify-between min-h-[124px] overflow-hidden ${
            roundWinner === 'tiger'
              ? 'bg-gradient-to-b from-amber-500 via-amber-700 to-amber-950 border-white ring-2 ring-amber-300 shadow-[0_6px_0_#451A03,0_0_25px_rgba(245,158,11,0.6)]'
              : userBets.tiger > 0
              ? 'bg-gradient-to-b from-amber-700/90 via-amber-950 to-slate-950 border-amber-300 shadow-[0_5px_0_#451A03]'
              : 'bg-gradient-to-b from-amber-950/85 via-slate-900 to-slate-950 border-amber-500/50 hover:border-amber-400 shadow-[0_5px_0_#451A03]'
          } ${isDealing || countdown <= 3 ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {/* Top Row: Compact 3D Tiger Icon + Label & Odds */}
          <div className="w-full flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <Tiger3DIcon
                size="sm"
                active={userBets.tiger > 0}
                isWinner={roundWinner === 'tiger'}
              />
              <div className="text-left leading-tight">
                <span className="text-xs font-black tracking-wider text-amber-300 block">
                  TIGER
                </span>
                <span className="text-[10px] font-mono font-black text-amber-200">
                  1.98X
                </span>
              </div>
            </div>
          </div>

          {/* Middle Row: User Bet Chip or Tap Prompt */}
          {userBets.tiger > 0 ? (
            <div className="my-1.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-amber-300 shadow animate-bounce">
              <span className="text-[10px] font-mono font-black text-amber-300">
                ₹{userBets.tiger.toLocaleString('en-IN')}
              </span>
            </div>
          ) : (
            <div className="my-1.5 text-xs font-black text-white/90 tracking-wide">
              TAP TO BET
            </div>
          )}

          {/* Footer Pot */}
          <div className="w-full flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-amber-200/80 pt-1 border-t border-amber-500/20">
            <span>Pot</span>
            <span className="font-bold">₹{tableTotals.tiger.toLocaleString('en-IN')}</span>
          </div>
        </button>
      </div>

      {/* ==================== 4. 3D SCULPTED CASINO CHIP RACK & REPEAT / 2X BAR ==================== */}
      <div className="p-3.5 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">
            Select 3D Casino Chip:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRepeatLastBet}
              disabled={isDealing || countdown <= 3}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200 flex items-center gap-1 transition active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Repeat</span>
            </button>
            <button
              type="button"
              onClick={handleDoubleCurrentBet}
              disabled={isDealing || countdown <= 3 || totalUserBet === 0}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-[11px] font-black text-amber-300 flex items-center gap-1 transition active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-3 h-3" />
              <span>2X Double</span>
            </button>
          </div>
        </div>

        {/* 3D Chips Row */}
        <div className="grid grid-cols-6 gap-2 pt-0.5">
          {CHIP_CONFIG.map((chip) => {
            const isSelected = selectedChip === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => {
                  setSelectedChip(chip.value);
                  soundFx.playChipSound();
                }}
                style={{
                  boxShadow: isSelected
                    ? `0 6px 0 ${chip.shadow}, 0 0 18px rgba(251,191,36,0.6)`
                    : `0 4px 0 ${chip.shadow}`
                }}
                className={`relative h-12 rounded-2xl border-2 border-dashed ${chip.ring} bg-gradient-to-b ${chip.bg} flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? '-translate-y-1 scale-105 ring-2 ring-white'
                    : 'opacity-85 hover:opacity-100 active:translate-y-0.5'
                }`}
              >
                <span className="font-mono font-black text-xs text-white drop-shadow">
                  {chip.label}
                </span>
                {isSelected && (
                  <span className="text-[8px] font-black uppercase tracking-wider text-yellow-200">
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Round User Stake Summary */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Your Active Round Stake:
          </span>
          <span className="font-mono font-black text-amber-400 text-sm">
            ₹{totalUserBet.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* ==================== 5. 3D BEAD PLATE ROADMAP & ANALYTICS ==================== */}
      <div className="p-3.5 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-white tracking-wide">
              BEAD PLATE ROADMAP (LAST {roadmap.length} DEALS)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
            <span className="text-red-400">D: {dragonWinsCount}</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400">T: {tigerWinsCount}</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400">Tie: {tieWinsCount}</span>
          </div>
        </div>

        {/* 3D Bead Badges */}
        <div className="grid grid-cols-12 gap-1.5 pt-1">
          {roadmap.slice(0, 24).map((entry, idx) => (
            <div
              key={`${entry.period}_${idx}`}
              title={`#${entry.period}: Dragon ${entry.dragonCard.label}${entry.dragonCard.suit} vs Tiger ${entry.tigerCard.label}${entry.tigerCard.suit}`}
              className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-black border shadow-sm relative ${
                entry.winner === 'dragon'
                  ? 'bg-gradient-to-b from-red-500 to-red-800 text-white border-red-300/60'
                  : entry.winner === 'tiger'
                  ? 'bg-gradient-to-b from-amber-300 to-amber-600 text-slate-950 border-yellow-200'
                  : 'bg-gradient-to-b from-emerald-400 to-emerald-700 text-white border-emerald-200'
              }`}
            >
              {entry.winner === 'dragon' ? 'D' : entry.winner === 'tiger' ? 'T' : 'Tie'}
              {idx === 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />
              )}
            </div>
          ))}
        </div>

        {/* Live VIP Seated Players Strip */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {VIP_SEATS.map((vip) => (
            <div
              key={vip.name}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800 shrink-0"
            >
              <div
                className={`w-6 h-6 rounded-lg bg-gradient-to-br ${vip.color} flex items-center justify-center text-[10px] font-black text-white border border-white/30`}
              >
                {vip.avatar}
              </div>
              <div className="leading-none">
                <div className="text-[10px] font-bold text-slate-200">{vip.name}</div>
                <div className="text-[9px] text-slate-500">{vip.city}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== 6. 3D WIN / LOSE RESULT POPUP MODAL ==================== */}
      {showVictoryPopup && lastRoundResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 [perspective:1000px]"
          onClick={() => {
            setShowVictoryPopup(false);
            if (isDealingRef.current) startNextBettingRound();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ transform: 'rotateX(2deg)' }}
            className={`w-full max-w-sm rounded-3xl p-5 border-2 text-center space-y-3.5 relative overflow-hidden transition-all ${
              lastRoundResult.status === 'win'
                ? 'bg-gradient-to-b from-emerald-950 via-slate-950 to-amber-950/90 border-amber-400 shadow-[0_12px_0_#78350F,0_25px_60px_rgba(245,158,11,0.5)]'
                : 'bg-gradient-to-b from-rose-950 via-slate-950 to-slate-950 border-rose-500/80 shadow-[0_12px_0_#450A0A,0_25px_60px_rgba(225,29,72,0.45)]'
            }`}
          >
            {/* Ambient Top Glow */}
            <div
              className={`absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-32 rounded-full blur-3xl pointer-events-none ${
                lastRoundResult.status === 'win' ? 'bg-amber-400/30' : 'bg-rose-600/30'
              }`}
            />

            {/* Close X Button */}
            <button
              type="button"
              onClick={() => {
                setShowVictoryPopup(false);
                if (isDealingRef.current) startNextBettingRound();
              }}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-400 hover:text-white z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 3D Crest Badge (Winner 3D Emblem or Trophy) */}
            <div className="relative pt-1 flex flex-col items-center">
              {lastRoundResult.winner === 'dragon' ? (
                <Dragon3DIcon size="lg" isWinner={lastRoundResult.status === 'win'} />
              ) : lastRoundResult.winner === 'tiger' ? (
                <Tiger3DIcon size="lg" isWinner={lastRoundResult.status === 'win'} />
              ) : (
                <Tie3DIcon size="lg" isWinner={lastRoundResult.status === 'win'} />
              )}

              <span
                className={`mt-2.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  lastRoundResult.status === 'win'
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                    : lastRoundResult.tieRefund > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                }`}
              >
                {lastRoundResult.status === 'win'
                  ? '🎉 CONGRATULATIONS · YOU WON!'
                  : lastRoundResult.tieRefund > 0
                  ? '⚖️ TIE PUSH · 50% STAKE REFUNDED'
                  : '💔 YOU LOST THIS DEAL'}
              </span>
            </div>

            {/* Hero Win / Loss Amount Readout */}
            <div className="space-y-1">
              <div
                className={`text-3xl sm:text-4xl font-mono font-black tracking-tight drop-shadow ${
                  lastRoundResult.status === 'win' ? 'text-amber-300' : 'text-rose-400'
                }`}
              >
                {lastRoundResult.status === 'win'
                  ? `+₹${lastRoundResult.totalWon.toLocaleString('en-IN')}`
                  : `-₹${Math.abs(lastRoundResult.netProfit).toLocaleString('en-IN')}`}
              </div>

              <div className="text-[11px] font-mono font-bold text-slate-300">
                {lastRoundResult.status === 'win' ? (
                  <span className="text-emerald-400">
                    Net Profit: +₹{lastRoundResult.netProfit.toLocaleString('en-IN')} · Credited to Wallet
                  </span>
                ) : lastRoundResult.tieRefund > 0 ? (
                  <span className="text-amber-300">
                    50% Refunded: +₹{lastRoundResult.tieRefund.toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {lastRoundResult.winner.toUpperCase()} won Deal #{lastRoundResult.period}
                  </span>
                )}
              </div>
            </div>

            {/* 3D Mini Cards Duel Showcase inside Popup */}
            <div className="grid grid-cols-2 gap-2.5 p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800">
              {/* Dragon Mini Card */}
              <div
                className={`relative p-2.5 rounded-xl border flex items-center justify-between ${
                  lastRoundResult.winner === 'dragon'
                    ? 'bg-red-950/80 border-amber-400 ring-1 ring-amber-400/60'
                    : 'bg-slate-900/70 border-slate-800 opacity-80'
                }`}
              >
                {lastRoundResult.winner === 'dragon' && (
                  <span className="absolute -top-2 left-2 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[8px] uppercase">
                    👑 WIN
                  </span>
                )}
                <div className="text-left">
                  <div className="text-[10px] font-black text-red-400">DRAGON</div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {lastRoundResult.dragonCard.value} Pts
                  </div>
                </div>
                <div
                  className={`w-9 h-12 rounded-lg bg-white border border-amber-300 flex flex-col items-center justify-center font-black leading-none shadow ${
                    lastRoundResult.dragonCard.suit === '♥' || lastRoundResult.dragonCard.suit === '♦'
                      ? 'text-red-600'
                      : 'text-slate-900'
                  }`}
                >
                  <span className="text-xs">{lastRoundResult.dragonCard.label}</span>
                  <span className="text-sm">{lastRoundResult.dragonCard.suit}</span>
                </div>
              </div>

              {/* Tiger Mini Card */}
              <div
                className={`relative p-2.5 rounded-xl border flex items-center justify-between ${
                  lastRoundResult.winner === 'tiger'
                    ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-400/60'
                    : 'bg-slate-900/70 border-slate-800 opacity-80'
                }`}
              >
                {lastRoundResult.winner === 'tiger' && (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[8px] uppercase">
                    👑 WIN
                  </span>
                )}
                <div className="text-left">
                  <div className="text-[10px] font-black text-amber-400">TIGER</div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {lastRoundResult.tigerCard.value} Pts
                  </div>
                </div>
                <div
                  className={`w-9 h-12 rounded-lg bg-white border border-amber-300 flex flex-col items-center justify-center font-black leading-none shadow ${
                    lastRoundResult.tigerCard.suit === '♥' || lastRoundResult.tigerCard.suit === '♦'
                      ? 'text-red-600'
                      : 'text-slate-900'
                  }`}
                >
                  <span className="text-xs">{lastRoundResult.tigerCard.label}</span>
                  <span className="text-sm">{lastRoundResult.tigerCard.suit}</span>
                </div>
              </div>
            </div>

            {/* User Bet Receipt Breakdown */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1.5 text-xs font-mono">
              {(['dragon', 'tie', 'tiger'] as BetSide[]).map((side) => {
                const staked = lastRoundResult.betsPlaced[side];
                if (!staked || staked <= 0) return null;

                const isWinningSide =
                  (side === 'dragon' && lastRoundResult.winner === 'dragon') ||
                  (side === 'tiger' && lastRoundResult.winner === 'tiger') ||
                  (side === 'tie' && lastRoundResult.winner === 'tie');

                const isTieHalfRefund =
                  (side === 'dragon' || side === 'tiger') && lastRoundResult.winner === 'tie';

                const sideMultiplier = side === 'dragon' || side === 'tiger' ? 1.98 : 9.0;
                const sideReturn = isWinningSide
                  ? Math.round(staked * sideMultiplier * 100) / 100
                  : isTieHalfRefund
                  ? Math.round(staked * 0.5 * 100) / 100
                  : 0;

                return (
                  <div key={side} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 uppercase">
                      Your {side} Bet (₹{staked}):
                    </span>
                    <span
                      className={`font-black ${
                        isWinningSide
                          ? 'text-emerald-400'
                          : isTieHalfRefund
                          ? 'text-amber-300'
                          : 'text-rose-400'
                      }`}
                    >
                      {isWinningSide
                        ? `WON +₹${sideReturn}`
                        : isTieHalfRefund
                        ? `50% BACK +₹${sideReturn}`
                        : `LOST -₹${staked}`}
                    </span>
                  </div>
                );
              })}

              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-400">
                  Total Stake: ₹{lastRoundResult.totalBet.toLocaleString('en-IN')}
                </span>
                <span
                  className={
                    lastRoundResult.totalWon > 0 ? 'text-amber-300' : 'text-rose-400'
                  }
                >
                  Payout: ₹{lastRoundResult.totalWon.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Buttons: Repeat Bet & Continue */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowVictoryPopup(false);
                  if (isDealingRef.current) {
                    dealTimersRef.current.forEach((id) => window.clearTimeout(id));
                    dealTimersRef.current = [];
                    startNextBettingRound();
                  }
                  window.setTimeout(() => {
                    handleRepeatLastBet();
                  }, 60);
                }}
                className="py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-amber-400/40 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_0_#0F172A] active:translate-y-0.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Repeat ₹{lastRoundResult.totalBet}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowVictoryPopup(false);
                  if (isDealingRef.current) {
                    dealTimersRef.current.forEach((id) => window.clearTimeout(id));
                    dealTimersRef.current = [];
                    startNextBettingRound();
                  }
                }}
                className={`py-2.5 px-3 rounded-2xl font-black text-xs shadow-[0_4px_0_#451A03] active:translate-y-0.5 transition ${
                  lastRoundResult.status === 'win'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950'
                    : 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_4px_0_#450A0A]'
                }`}
              >
                {lastRoundResult.status === 'win' ? 'Continue Playing' : 'Try Next Deal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 7. 3D TABLE RULES & PAYOUTS MODAL ==================== */}
      {showRulesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowRulesModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-slate-900 border border-amber-500/40 p-5 space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">DRAGON TIGER 3D RULES & PAYOUTS</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                One card is dealt face-up to the <strong>Dragon</strong> spot and one card to the <strong>Tiger</strong> spot from an 8-deck shoe. The highest card wins!
              </p>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Card Ranking (Low to High):</span>
                  <span className="text-amber-300 font-bold">A (1) · 2..10 · J (11) · Q (12) · K (13)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">Dragon Win Payout:</span>
                  <span className="text-white font-bold">1.98X</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400">Tiger Win Payout:</span>
                  <span className="text-white font-bold">1.98X</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400">Tie (Same Rank) Payout:</span>
                  <span className="text-white font-bold">9.00X (50% Refund on D/T)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs"
            >
              Got It, Back to 3D Table
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default DragonTigerGame;
