import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Trophy,
  Users,
  Coins,
  Volume2,
  VolumeX,
  Play,
  MessageSquare,
  MessageSquareOff,
  Send,
  Copy,
  Check,
  Globe,
  Crown,
  RefreshCw,
  Mic,
  MicOff,
  Headphones,
  Shield,
  Swords,
  Sparkles,
  Flag,
  Wifi,
  Radio,
  X,
  Clock,
  Zap,
  Smile
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRecord } from '../../types';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';
import { soundFx } from '../../services/soundFx';
import {
  rtdb,
  rtdbRef,
  rtdbSet,
  rtdbGet,
  rtdbOnValue,
  rtdbUpdate,
  rtdbRemove,
  rtdbRunTransaction
} from '../../firebase';
import { useAdminSettings } from '../../context/AdminSettingsContext';

export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';
export type LudoPlayerKey = 'player1' | 'player2' | 'player3' | 'player4';

interface LudoBattleGameProps {
  user: UserRecord | null;
  onBack: () => void;
  onOpenDeposit: () => void;
}

interface LudoChatMessage {
  id: string;
  senderUid: string;
  senderName: string;
  senderLocation: string;
  senderColor?: LudoColor;
  text: string;
  messageType: 'text' | 'quick' | 'emoji' | 'system';
  timestamp: number;
}

interface LudoRollEvent {
  rollId: string;
  player: LudoPlayerKey;
  color: LudoColor;
  value: number;
  outcome: 'normal' | 'no_moves' | 'triple_six';
  timestamp: number;
}

interface LudoMoveEvent {
  moveId: string;
  player: LudoPlayerKey;
  color: LudoColor;
  pawnIndex: number;
  fromStep: number;
  toStep: number;
  dice: number;
  capturedPawnIndex: number | null;
  capturedPlayerKey?: LudoPlayerKey | null;
  capturedColor?: LudoColor | null;
  bonusTurn: boolean;
  timestamp: number;
}

interface LudoVoiceState {
  uid: string;
  micEnabled: boolean;
  speakerEnabled: boolean;
  isSpeaking: boolean;
  updatedAt: number;
}

interface LudoVoiceSignal {
  id: string;
  fromUid: string;
  toUid: string;
  type: 'offer' | 'answer' | 'ice' | 'audio_chunk' | 'voice_phrase';
  payload: unknown;
  timestamp: number;
}

interface LudoDisconnectInfo {
  playerKey: LudoPlayerKey;
  uid: string;
  username: string;
  disconnectedAt: number;
  reconnectDeadline: number;
  remainingSeconds: number;
}

interface LudoPlayerState {
  uid: string;
  username: string;
  location: string;
  flag?: string;
  color: LudoColor;
  pawns: [number, number, number, number];
  score: number;
  captures: number;
  homeCount: number;
  movesLeft: number;
  lastDice: number | null;
  consecutiveSixes?: number;
  isBot: boolean;
  lastActiveAt: number;
  lastHeartbeatAt?: number;
  isDisconnected?: boolean;
  disconnectedAt?: number | null;
  reconnectDeadline?: number | null;
}

interface LudoRoomState {
  roomId: string;
  hostUid?: string;
  stake?: number;
  entryFee: number;
  maxPlayers?: 2 | 3 | 4;
  seatOrder?: LudoPlayerKey[];
  prizePool: number;
  houseMargin: number;
  isPrivate: boolean;
  status: 'waiting' | 'playing' | 'finished' | 'cancelled';
  players?: { p1: string; p2?: string };
  currentTurn?: string;
  boardState?: {
    p1: [number, number, number, number];
    p2: [number, number, number, number];
  };
  player1: LudoPlayerState;
  player2: LudoPlayerState | null;
  player3?: LudoPlayerState | null;
  player4?: LudoPlayerState | null;
  turn: LudoPlayerKey;
  diceValue: number | null;
  hasRolled: boolean;
  movablePawns: number[];
  lastAction: string;
  lastRoll?: LudoRollEvent | null;
  lastMove?: LudoMoveEvent | null;
  moveSeq?: number;
  stakedUids?: string[];
  settledWinnerUid?: string | null;
  settlementTxId?: string | null;
  cancelledRefunded?: boolean;
  winner: LudoPlayerKey | null;
  winReason?: string;
  chatMessages: LudoChatMessage[];
  voiceStates?: Record<string, LudoVoiceState>;
  voiceSignals?: LudoVoiceSignal[];
  disconnectInfo?: LudoDisconnectInfo | null;
  autoWinProcessed?: boolean;
  createdAt: number;
  updatedAt: number;
}

interface OpenRoomSummary {
  roomId: string;
  entryFee: number;
  maxPlayers?: 2 | 3 | 4;
  joinedPlayers?: number;
  prizePool: number;
  isPrivate: boolean;
  hostName: string;
  hostLocation: string;
  hostFlag?: string;
  createdAt: number;
}

// 52-Tile Clockwise Perimeter Track on 15x15 Grid (row 0..14, col 0..14)
const TRACK_COORDS: Array<[number, number]> = [
  // 0..4: Bottom-left vertical arm going UP (Red Start ★ at index 0 -> [13,6])
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  // 5..10: Left horizontal arm bottom row going LEFT (Safe Star ★ at index 8 -> [8,2])
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  // 11..12: Left edge turning UP
  [7, 0], [6, 0],
  // 13..17: Left horizontal arm top row going RIGHT (Green Start ★ at index 13 -> [6,1])
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  // 18..23: Top-left vertical arm going UP (Safe Star ★ at index 21 -> [2,6])
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  // 24..25: Top edge turning RIGHT
  [0, 7], [0, 8],
  // 26..30: Top-right vertical arm going DOWN (Yellow Start ★ at index 26 -> [1,8])
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  // 31..36: Right horizontal arm top row going RIGHT (Safe Star ★ at index 34 -> [6,12])
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  // 37..38: Right edge turning DOWN
  [7, 14], [8, 14],
  // 39..43: Right horizontal arm bottom row going LEFT (Blue Start ★ at index 39 -> [8,13])
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  // 44..49: Bottom-right vertical arm going DOWN (Safe Star ★ at index 47 -> [12,8])
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  // 50..51: Bottom edge turning LEFT
  [14, 7], [14, 6]
];

const TRACK_DIRECTION_ARROWS: Record<string, string> = {
  '13,6': '▲',
  '11,6': '▲',
  '9,6': '◀',
  '8,4': '◀',
  '8,0': '▲',
  '6,1': '▶',
  '6,4': '▶',
  '6,5': '▲',
  '4,6': '▲',
  '0,6': '▶',
  '1,8': '▼',
  '3,8': '▼',
  '5,8': '▶',
  '6,10': '▶',
  '6,14': '▼',
  '8,13': '◀',
  '8,10': '◀',
  '8,9': '▼',
  '10,8': '▼',
  '14,8': '◀'
};

// Home Stretch steps 52..56 for all 4 colors leading into Center 3x3 Victory Zone (step 57)
const HOME_STRETCH_BY_COLOR: Record<LudoColor, Array<[number, number]>> = {
  red: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
  green: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  yellow: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  blue: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]]
};

// Dedicated Home Victory Slots inside the Center 3x3 Crown Triangle for step === 57
const HOME_GOAL_SLOTS_BY_COLOR: Record<LudoColor, Array<[number, number]>> = {
  red: [[7.98, 6.25], [7.98, 6.75], [7.98, 7.25], [7.98, 7.75]],
  green: [[6.25, 6.02], [6.75, 6.02], [7.25, 6.02], [7.75, 6.02]],
  yellow: [[6.02, 6.25], [6.02, 6.75], [6.02, 7.25], [6.02, 7.75]],
  blue: [[6.25, 7.98], [6.75, 7.98], [7.25, 7.98], [7.75, 7.98]]
};

// Exact 3D Base Pedestal centers in 0..14 grid coordinates for all 4 corner yards
const BASE_SLOTS_BY_COLOR: Record<LudoColor, Array<[number, number]>> = {
  red: [[10.45, 1.45], [10.45, 3.55], [12.55, 1.45], [12.55, 3.55]],
  green: [[1.45, 1.45], [1.45, 3.55], [3.55, 1.45], [3.55, 3.55]],
  yellow: [[1.45, 10.45], [1.45, 12.55], [3.55, 10.45], [3.55, 12.55]],
  blue: [[10.45, 10.45], [10.45, 12.55], [12.55, 10.45], [12.55, 12.55]]
};

const COLOR_TRACK_OFFSET: Record<LudoColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};

const SAFE_TRACK_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

function getGlobalTrackIndex(color: LudoColor, step: number): number | null {
  if (step < 1 || step > 51) return null;
  const offset = COLOR_TRACK_OFFSET[color] ?? 0;
  return (step - 1 + offset) % 52;
}

function computeClientMovablePawns(pawns: [number, number, number, number], dice: number): number[] {
  const valid: number[] = [];
  const hasBoardPawnMovable = pawns.some((pos) => pos >= 1 && pos < 57 && pos + dice <= 57);
  pawns.forEach((pos, idx) => {
    if (pos === 0) {
      if (dice === 6 || dice === 1 || !hasBoardPawnMovable) {
        valid.push(idx);
      }
    } else if (pos >= 1 && pos < 57 && pos + dice <= 57) {
      valid.push(idx);
    }
  });
  return valid;
}

const CELL_TRANSITION_MS = 200;

interface PawnCellCoord {
  step: number;
  row: number;
  col: number;
  top: string;
  left: string;
}

function getPawnGridPosition(color: LudoColor, step: number, pawnIndex: number): [number, number] {
  if (step <= 0) {
    return BASE_SLOTS_BY_COLOR[color][pawnIndex];
  }
  if (step >= 1 && step <= 51) {
    const offset = COLOR_TRACK_OFFSET[color] ?? 0;
    const globalIdx = (step - 1 + offset) % 52;
    return TRACK_COORDS[globalIdx];
  }
  if (step >= 57) {
    return HOME_GOAL_SLOTS_BY_COLOR[color][pawnIndex];
  }
  const stretchIdx = Math.min(4, Math.max(0, step - 52));
  return HOME_STRETCH_BY_COLOR[color][stretchIdx];
}

function getPawnCellCoord(color: LudoColor, step: number, pawnIndex: number): PawnCellCoord {
  const [row, col] = getPawnGridPosition(color, step, pawnIndex);
  return {
    step,
    row,
    col,
    top: `${((row + 0.5) / 15) * 100}%`,
    left: `${((col + 0.5) / 15) * 100}%`
  };
}

// Builds the ordered board path coordinate array for a token moving from `fromStep` to `toStep`
function getBoardPathCoordinateSequence(
  color: LudoColor,
  pawnIndex: number,
  fromStep: number,
  toStep: number
): PawnCellCoord[] {
  if (fromStep === toStep) return [];
  const pathCoords: PawnCellCoord[] = [];
  if (toStep > fromStep) {
    for (let s = fromStep + 1; s <= toStep; s++) {
      pathCoords.push(getPawnCellCoord(color, s, pawnIndex));
    }
  } else {
    pathCoords.push(getPawnCellCoord(color, toStep, pawnIndex));
  }
  return pathCoords;
}

function buildPawnCoordsMap(
  pawnsByColor: Record<LudoColor, [number, number, number, number]>
): Record<LudoColor, [PawnCellCoord, PawnCellCoord, PawnCellCoord, PawnCellCoord]> {
  const map = {} as Record<LudoColor, [PawnCellCoord, PawnCellCoord, PawnCellCoord, PawnCellCoord]>;
  (['red', 'green', 'yellow', 'blue'] as LudoColor[]).forEach((c) => {
    map[c] = [
      getPawnCellCoord(c, pawnsByColor[c][0], 0),
      getPawnCellCoord(c, pawnsByColor[c][1], 1),
      getPawnCellCoord(c, pawnsByColor[c][2], 2),
      getPawnCellCoord(c, pawnsByColor[c][3], 3)
    ];
  });
  return map;
}

function getFlagForLocation(loc?: string): string {
  const l = (loc || '').toLowerCase();
  if (l.includes('dubai') || l.includes('uae')) return '🇦🇪';
  if (l.includes('london') || l.includes('uk')) return '🇬🇧';
  if (l.includes('singapore') || l.includes('sg')) return '🇸🇬';
  if (l.includes('toronto') || l.includes('ca') || l.includes('canada')) return '🇨🇦';
  if (l.includes('usa') || l.includes('new york')) return '🇺🇸';
  if (l.includes('sydney') || l.includes('au')) return '🇦🇺';
  if (l.includes('tokyo') || l.includes('jp')) return '🇯🇵';
  return '🇮🇳';
}

const STAR_COORDS = new Set([
  '13,6', '8,2', '6,1', '2,6', '1,8', '6,12', '8,13', '12,8'
]);

const QUICK_EMOJIS = ['🔥', '🎲', '😂', '👏', '😱', '😎', '👑', '🙏', '👍', '🎯'];

const QUICK_1VS1_REACTIONS = [
  'Well Played! 👏',
  'Oops! 😅',
  'Hurry Up! ⏰',
  'Good Game! 🤝',
  'Nice Roll! 🎲',
  'Don\'t Cut! 🙏',
  'Watch Out! 😎',
  'Good Luck! 🍀',
  'Haha! 😂'
];

const QUICK_CHAT_PHRASES = [
  'Hello! 👋',
  'Roll fast! 🎲',
  'Nice move! 🔥',
  'Watch out! 😎',
  'Good luck! 🍀',
  'Well played! 🏆'
];

const REGIONS = [
  'Mumbai, India',
  'Delhi NCR, India',
  'Bengaluru, India',
  'Jaipur, India',
  'Dubai, UAE',
  'London, UK',
  'Singapore, SG',
  'Toronto, CA'
];

// ==================== CONTINUOUS 60FPS 6-FACED 3D PHYSICS CUBE DICE ====================
// Fixes instant face switching by driving the 3D cube continuously through intermediate
// X/Y/Z Euler rotations via requestAnimationFrame over 1.52 seconds:
// - 0ms..1520ms: Continuous multi-axis 3D rotations (3 full X & Y flips) with smooth cubic-out
//   deceleration and a two-bounce vertical jump arc.
// - Confirmed number badge remains hidden while rolling and is revealed ONLY after the cube
//   reaches its final face orientation.
const DICE_ROLL_DURATION_MS = 1520;

const PIP_LAYOUTS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

const FACE_TARGET_ROTATIONS: Record<number, { rx: number; ry: number; rz: number }> = {
  1: { rx: -12, ry: 14, rz: 0 },     // Front face (1)
  6: { rx: -12, ry: -166, rz: 0 },   // Back face (6)
  3: { rx: -12, ry: -76, rz: 0 },    // Right face (3)
  4: { rx: -12, ry: 104, rz: 0 },    // Left face (4)
  2: { rx: -102, ry: 0, rz: 12 },    // Top face (2)
  5: { rx: 78, ry: 0, rz: -12 }      // Bottom face (5)
};

function getForwardTargetAngle(currentAngle: number, targetBaseAngle: number, minFullSpins: number): number {
  const minTarget = currentAngle + minFullSpins * 360;
  const turns = Math.ceil((minTarget - targetBaseAngle) / 360);
  return turns * 360 + targetBaseAngle;
}

function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const DICE_FACE_STYLES: Record<LudoColor, string> = {
  red: 'bg-gradient-to-br from-white via-rose-50 to-rose-200 border-[1.5px] border-rose-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(159,18,57,0.35)]',
  green: 'bg-gradient-to-br from-white via-emerald-50 to-emerald-200 border-[1.5px] border-emerald-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(6,95,70,0.35)]',
  yellow: 'bg-gradient-to-br from-white via-amber-50 to-amber-200 border-[1.5px] border-amber-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(146,64,14,0.35)]',
  blue: 'bg-gradient-to-br from-white via-blue-50 to-blue-200 border-[1.5px] border-blue-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(30,58,138,0.35)]'
};

const Realistic3DDice: React.FC<{
  value: number | null;
  isRolling: boolean;
  activeColor: LudoColor;
  isTurn: boolean;
  compact?: boolean;
}> = ({ value, isRolling, activeColor, isTurn, compact = false }) => {
  const initialFace = value && value >= 1 && value <= 6 ? value : 6;
  const cubeRef = useRef<HTMLDivElement | null>(null);
  const arcRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<HTMLSpanElement | null>(null);

  const currentRotRef = useRef<{ rx: number; ry: number; rz: number }>({
    ...FACE_TARGET_ROTATIONS[initialFace]
  });
  const targetValueRef = useRef<number | null>(value);
  targetValueRef.current = value;

  const [revealedValue, setRevealedValue] = useState<number | null>(isRolling ? null : value);
  const [showImpactRing, setShowImpactRing] = useState<boolean>(false);
  const rafIdRef = useRef<number | null>(null);
  const hasRolledAtLeastOnceRef = useRef<boolean>(false);

  // Keep resting orientation synced when not rolling (e.g., room load or turn sync) without snapping
  useEffect(() => {
    if (!isRolling) {
      setRevealedValue(value);
      if (value && value >= 1 && value <= 6 && !hasRolledAtLeastOnceRef.current) {
        const base = FACE_TARGET_ROTATIONS[value];
        currentRotRef.current = { ...base };
        if (cubeRef.current) {
          cubeRef.current.style.transition = 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)';
          cubeRef.current.style.transform = `rotateX(${base.rx}deg) rotateY(${base.ry}deg) rotateZ(${base.rz}deg)`;
        }
      }
    }
  }, [value, isRolling]);

  // Continuous 60fps requestAnimationFrame 3D Cube Roll Animation
  useEffect(() => {
    if (!isRolling) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      const finalFace =
        targetValueRef.current && targetValueRef.current >= 1 && targetValueRef.current <= 6
          ? targetValueRef.current
          : 6;
      const baseTarget = FACE_TARGET_ROTATIONS[finalFace] || FACE_TARGET_ROTATIONS[6];
      const settledRx = getForwardTargetAngle(currentRotRef.current.rx - 360, baseTarget.rx, 1);
      const settledRy = getForwardTargetAngle(currentRotRef.current.ry - 360, baseTarget.ry, 1);
      const settledRz = baseTarget.rz;
      currentRotRef.current = { rx: settledRx, ry: settledRy, rz: settledRz };

      if (cubeRef.current) {
        cubeRef.current.style.transition = 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)';
        cubeRef.current.style.transform = `rotateX(${settledRx}deg) rotateY(${settledRy}deg) rotateZ(${settledRz}deg)`;
      }
      if (arcRef.current) {
        arcRef.current.style.transition = 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)';
        arcRef.current.style.transform = 'translateY(0px) scale(1)';
      }
      if (shadowRef.current) {
        shadowRef.current.style.transform = 'scale(1)';
        shadowRef.current.style.opacity = '0.65';
      }

      setRevealedValue(targetValueRef.current);

      if (hasRolledAtLeastOnceRef.current) {
        setShowImpactRing(true);
        const timer = setTimeout(() => setShowImpactRing(false), 380);
        return () => clearTimeout(timer);
      }
      return;
    }

    hasRolledAtLeastOnceRef.current = true;
    setShowImpactRing(false);
    setRevealedValue(null); // Hide badge until the 3D cube finishes rolling and lands

    const startRot = { ...currentRotRef.current };
    const neutralEndRx = startRot.rx + 1080;
    const neutralEndRy = startRot.ry + 1080;
    const startTime = performance.now();

    if (cubeRef.current) cubeRef.current.style.transition = 'none';
    if (arcRef.current) arcRef.current.style.transition = 'none';

    const stepFrame = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.max(0, Math.min(1, elapsed / DICE_ROLL_DURATION_MS));

      // Continuous smooth deceleration curve (fast launch -> visible intermediate flips -> gentle settle)
      const easeProgress = 1 - Math.pow(1 - t, 2.75);

      const confirmedFace =
        targetValueRef.current && targetValueRef.current >= 1 && targetValueRef.current <= 6
          ? targetValueRef.current
          : 6;
      const targetAngles = FACE_TARGET_ROTATIONS[confirmedFace] || FACE_TARGET_ROTATIONS[6];

      // Compute forward target angles (3 full visible rotations on X & Y axes)
      const exactEndRx = getForwardTargetAngle(startRot.rx, targetAngles.rx, 3);
      const exactEndRy = getForwardTargetAngle(startRot.ry, targetAngles.ry, 3);
      const exactEndRz = targetAngles.rz;

      // Smoothly blend from launch spin to exact target orientation over the first 35% of the roll
      const targetBlend = smoothStep(0.05, 0.38, t);
      const activeEndRx = neutralEndRx * (1 - targetBlend) + exactEndRx * targetBlend;
      const activeEndRy = neutralEndRy * (1 - targetBlend) + exactEndRy * targetBlend;

      const rx = startRot.rx + (activeEndRx - startRot.rx) * easeProgress;
      const ry = startRot.ry + (activeEndRy - startRot.ry) * easeProgress;
      const wobbleZ = Math.sin(t * Math.PI * 4) * 22 * Math.pow(1 - t, 1.5);
      const rz = startRot.rz * (1 - easeProgress) + exactEndRz * easeProgress + wobbleZ;

      currentRotRef.current = { rx, ry, rz };

      // Two-bounce vertical jump arc synchronized with the 3D rotation
      let liftY = 0;
      if (t < 0.64) {
        const localT = t / 0.64;
        liftY = -Math.sin(localT * Math.PI) * 21;
      } else if (t < 0.92) {
        const localT = (t - 0.64) / 0.28;
        liftY = -Math.sin(localT * Math.PI) * 7.5;
      }
      const scale = 1 + Math.abs(liftY) * 0.0085;

      if (cubeRef.current) {
        cubeRef.current.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
      }
      if (arcRef.current) {
        arcRef.current.style.transform = `translateY(${liftY.toFixed(2)}px) scale(${scale.toFixed(3)})`;
      }
      if (shadowRef.current) {
        const shadowScale = Math.max(0.52, 1 - Math.abs(liftY) * 0.02);
        const shadowOpacity = Math.max(0.28, 0.65 - Math.abs(liftY) * 0.016);
        shadowRef.current.style.transform = `scale(${shadowScale.toFixed(2)})`;
        shadowRef.current.style.opacity = `${shadowOpacity.toFixed(2)}`;
      }

      if (t < 1) {
        rafIdRef.current = requestAnimationFrame(stepFrame);
      } else {
        currentRotRef.current = { rx: exactEndRx, ry: exactEndRy, rz: exactEndRz };
        if (cubeRef.current) {
          cubeRef.current.style.transform = `rotateX(${exactEndRx}deg) rotateY(${exactEndRy}deg) rotateZ(${exactEndRz}deg)`;
        }
        if (arcRef.current) {
          arcRef.current.style.transform = 'translateY(0px) scale(1)';
        }
        setRevealedValue(targetValueRef.current);
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(stepFrame);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isRolling]);

  const sizePx = compact ? 38 : 48;
  const halfZ = sizePx / 2;

  const faceTransforms: Array<{ faceNum: number; transform: string }> = [
    { faceNum: 1, transform: `rotateY(0deg) translateZ(${halfZ}px)` },
    { faceNum: 6, transform: `rotateY(180deg) translateZ(${halfZ}px)` },
    { faceNum: 3, transform: `rotateY(90deg) translateZ(${halfZ}px)` },
    { faceNum: 4, transform: `rotateY(-90deg) translateZ(${halfZ}px)` },
    { faceNum: 2, transform: `rotateX(90deg) translateZ(${halfZ}px)` },
    { faceNum: 5, transform: `rotateX(-90deg) translateZ(${halfZ}px)` }
  ];

  const initRot = currentRotRef.current;

  return (
    <div
      className="relative flex items-center justify-center select-none overflow-visible"
      style={{ width: `${sizePx + 10}px`, height: `${sizePx + 10}px`, perspective: '420px' }}
    >
      {/* Active Turn Ambient Halo */}
      {isTurn && !isRolling && (
        <span className="absolute -inset-1.5 rounded-2xl bg-amber-400/45 blur-md animate-pulse pointer-events-none" />
      )}

      {/* Landing Impact Shockwave Ring */}
      {showImpactRing && (
        <span className="absolute inset-0 rounded-2xl border-2 border-amber-300 bg-amber-400/25 animate-ping pointer-events-none" />
      )}

      {/* Dynamic Ground Contact Shadow */}
      <span
        ref={shadowRef}
        className="absolute -bottom-1 w-8 h-2.5 rounded-full bg-black/70 blur-[2px] pointer-events-none"
        style={{ transform: 'scale(1)', opacity: 0.65 }}
      />

      {/* Vertical Jump Arc Wrapper */}
      <div
        ref={arcRef}
        style={{
          width: `${sizePx}px`,
          height: `${sizePx}px`,
          transform: 'translateY(0px) scale(1)',
          transformStyle: 'preserve-3d',
          willChange: 'transform'
        }}
      >
        {/* 6-Faced 3D Cube Body */}
        <div
          ref={cubeRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotateX(${initRot.rx}deg) rotateY(${initRot.ry}deg) rotateZ(${initRot.rz}deg)`,
            willChange: 'transform'
          }}
        >
          {faceTransforms.map(({ faceNum, transform }) => {
            const pips = PIP_LAYOUTS[faceNum];
            return (
              <div
                key={faceNum}
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform,
                  backfaceVisibility: 'hidden'
                }}
                className={`rounded-xl p-1.5 grid grid-cols-3 grid-rows-3 gap-0.5 place-items-center ${DICE_FACE_STYLES[activeColor]}`}
              >
                {Array.from({ length: 9 }).map((_, idx) => {
                  const hasPip = pips.includes(idx);
                  const isCenterAce = faceNum === 1 && idx === 4;
                  const isSixPip = faceNum === 6;
                  return (
                    <div key={idx} className="w-full h-full flex items-center justify-center">
                      {hasPip && (
                        <span
                          className={`rounded-full shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.75)] ${
                            isCenterAce
                              ? 'w-2.5 h-2.5 bg-gradient-to-br from-rose-500 to-rose-700 ring-1 ring-rose-300'
                              : isSixPip
                              ? 'w-1.5 h-1.5 bg-gradient-to-br from-amber-600 to-red-900'
                              : 'w-1.5 h-1.5 bg-slate-950'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Authoritative Confirmed Dice Number Badge (Revealed ONLY after 3D cube lands) */}
      {revealedValue !== null && !isRolling && (
        <span className="absolute -top-1 -right-1 w-4.5 h-4.5 px-1 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border border-slate-950 text-[10px] font-black flex items-center justify-center shadow-md z-20">
          {revealedValue}
        </span>
      )}
    </div>
  );
};

// ==================== 3D SCULPTED CRYSTAL & GOLD LUDO PAWN (ALL 4 COLORS) ====================
const PAWN_PALETTES: Record<
  LudoColor,
  { c1: string; c2: string; c3: string; b1: string; b2: string; b3: string; b4: string; b5: string; textStroke: string; textFill: string }
> = {
  red: {
    c1: '#FB7185',
    c2: '#E11D48',
    c3: '#881337',
    b1: '#9F1239',
    b2: '#F43F5E',
    b3: '#FDA4AF',
    b4: '#E11D48',
    b5: '#4C0519',
    textStroke: '#881337',
    textFill: '#FFFFFF'
  },
  green: {
    c1: '#34D399',
    c2: '#059669',
    c3: '#064E3B',
    b1: '#065F46',
    b2: '#10B981',
    b3: '#6EE7B7',
    b4: '#059669',
    b5: '#022C22',
    textStroke: '#064E3B',
    textFill: '#FFFFFF'
  },
  yellow: {
    c1: '#FDE047',
    c2: '#D97706',
    c3: '#78350F',
    b1: '#92400E',
    b2: '#FBBF24',
    b3: '#FEF08A',
    b4: '#D97706',
    b5: '#451A03',
    textStroke: '#FEF08A',
    textFill: '#0F172A'
  },
  blue: {
    c1: '#60A5FA',
    c2: '#2563EB',
    c3: '#1E3A8A',
    b1: '#1E40AF',
    b2: '#3B82F6',
    b3: '#93C5FD',
    b4: '#2563EB',
    b5: '#172554',
    textStroke: '#1E3A8A',
    textFill: '#FFFFFF'
  }
};

const Sculpted3DPawn: React.FC<{
  color: LudoColor;
  number: number;
  isHopping: boolean;
  canMove: boolean;
  isStacked?: boolean;
  badgeText?: string | null;
}> = ({ color, number, isHopping, canMove, isStacked = false, badgeText }) => {
  const pal = PAWN_PALETTES[color];
  return (
    <div
      className={`relative w-8 h-10 sm:w-9 sm:h-11 flex flex-col items-center justify-center transition-transform duration-150 ease-out ${
        isHopping
          ? '-translate-y-3.5 scale-120 z-50'
          : canMove
          ? 'scale-110 z-40'
          : isStacked
          ? 'scale-90 z-20'
          : 'z-20'
      }`}
    >
      {/* Floating Action Callout above Movable Pawn */}
      {canMove && badgeText && !isHopping && (
        <span className="absolute -top-4 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 text-slate-950 font-black text-[9px] leading-none shadow-[0_2px_6px_rgba(0,0,0,0.85)] border border-slate-950 animate-bounce whitespace-nowrap">
          {badgeText}
        </span>
      )}

      {/* Glowing 3D Target Halo under Movable Pawn */}
      {canMove && (
        <span className="absolute bottom-1 w-8 h-3.5 rounded-full border-2 border-amber-300 bg-amber-400/40 animate-ping pointer-events-none" />
      )}

      <svg viewBox="0 0 48 60" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id={`head-${color}-${number}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor={pal.c1} />
            <stop offset="75%" stopColor={pal.c2} />
            <stop offset="100%" stopColor={pal.c3} />
          </radialGradient>
          <linearGradient id={`body-${color}-${number}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={pal.b1} />
            <stop offset="35%" stopColor={pal.b2} />
            <stop offset="55%" stopColor={pal.b3} />
            <stop offset="80%" stopColor={pal.b4} />
            <stop offset="100%" stopColor={pal.b5} />
          </linearGradient>
          <linearGradient id={`goldRim-${color}-${number}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>

        {/* Ground Contact Shadow */}
        <ellipse
          cx="24"
          cy="53"
          rx={isHopping ? '9' : '15'}
          ry={isHopping ? '3' : '5.5'}
          fill="rgba(0,0,0,0.55)"
        />

        {/* 3D Golden Pedestal Base Rim */}
        <ellipse
          cx="24"
          cy="49"
          rx="14"
          ry="5"
          fill={`url(#goldRim-${color}-${number})`}
          stroke="#451A03"
          strokeWidth="1.2"
        />
        <ellipse
          cx="24"
          cy="47.2"
          rx="12.2"
          ry="4"
          fill={`url(#body-${color}-${number})`}
          stroke="#FFFFFF"
          strokeWidth="1"
        />

        {/* 3D Sculpted Tapered Cone Body */}
        <path
          d="M13 47 C14 34, 17 25, 19 20 L29 20 C31 25, 34 34, 35 47 Z"
          fill={`url(#body-${color}-${number})`}
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Vertical 3D Glass Highlight Strip on Body */}
        <path
          d="M20 44 C20.5 34, 21.5 26, 22.2 21.5 L24.5 21.5 C24 26, 23.5 34, 23 44 Z"
          fill="rgba(255,255,255,0.45)"
        />

        {/* 3D Golden Neck Collar Ring */}
        <ellipse
          cx="24"
          cy="20"
          rx="7.5"
          ry="2.6"
          fill={`url(#goldRim-${color}-${number})`}
          stroke="#451A03"
          strokeWidth="1"
        />

        {/* 3D Glossy Spherical Pawn Head */}
        <circle
          cx="24"
          cy="11.5"
          r="9.5"
          fill={`url(#head-${color}-${number})`}
          stroke="#FFFFFF"
          strokeWidth="1.8"
        />

        {/* Specular Light Glint on Sphere */}
        <ellipse
          cx="20.5"
          cy="7.5"
          rx="3.2"
          ry="1.8"
          transform="rotate(-25 20.5 7.5)"
          fill="rgba(255,255,255,0.75)"
        />

        {/* Token Number Badge */}
        <text
          x="24"
          y="15"
          textAnchor="middle"
          fill={pal.textFill}
          fontSize="11"
          fontWeight="900"
          style={{ paintOrder: 'stroke', stroke: pal.textStroke, strokeWidth: '2px' }}
        >
          {number}
        </text>
      </svg>
    </div>
  );
};

export const LudoBattleGame: React.FC<LudoBattleGameProps> = ({
  user,
  onBack,
  onOpenDeposit
}) => {
  const { showToast } = useToast();

  // Lobby & Match Configuration State
  const [selectedEntry, setSelectedEntry] = useState<number>(100);
  const [selectedMaxPlayers, setSelectedMaxPlayers] = useState<2 | 3 | 4>(2);
  const [playerLocation, setPlayerLocation] = useState<string>('Mumbai, India');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [openRooms, setOpenRooms] = useState<OpenRoomSummary[]>([]);
  const [recoverableRoom, setRecoverableRoom] = useState<LudoRoomState | null>(null);
  const [liveMatchesCount, setLiveMatchesCount] = useState<number>(28);
  const [globalChat, setGlobalChat] = useState<LudoChatMessage[]>([]);
  const [lobbyChatInput, setLobbyChatInput] = useState<string>('');
  const [isJoiningRoom, setIsJoiningRoom] = useState<boolean>(false);

  // Active Room State
  const [room, setRoom] = useState<LudoRoomState | null>(null);
  const [rollingPlayerKey, setRollingPlayerKey] = useState<LudoPlayerKey | null>(null);
  const [confirmedDiceByPlayer, setConfirmedDiceByPlayer] = useState<Record<LudoPlayerKey, number | null>>({
    player1: null,
    player2: null,
    player3: null,
    player4: null
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => soundFx.isSfxActive());

  useEffect(() => {
    return soundFx.subscribe(() => {
      setSoundEnabled(soundFx.isSfxActive());
    });
  }, []);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showForfeitConfirm, setShowForfeitConfirm] = useState<boolean>(false);
  const [showResult3DModal, setShowResult3DModal] = useState<boolean>(true);
  const settledSoundRoomRef = useRef<string | null>(null);

  // 1vs1 Real User Matchmaking Radar State
  const [matchmakingCountdown, setMatchmakingCountdown] = useState<number>(10);
  const [matchmakingStatusText, setMatchmakingStatusText] = useState<string>('Searching real player online...');
  const [matchedRealOpponent, setMatchedRealOpponent] = useState<{
    name: string;
    loc: string;
    flag: string;
  } | null>(null);
  const [showRealMatchCelebration, setShowRealMatchCelebration] = useState<boolean>(false);

  // 15-Second Turn Timeout / Anti-AFK Safety Timer State
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(15);
  const autoActionTriggeredRef = useRef<boolean>(false);
  const lastTurnTokenRef = useRef<string>('');

  // Live WebRTC Voice Chat & Hybrid Audio Relay State
  const [micEnabled, setMicEnabled] = useState<boolean>(false);
  const [speakerEnabled, setSpeakerEnabled] = useState<boolean>(true);
  const [isLocalSpeaking, setIsLocalSpeaking] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [voiceFallbackMode, setVoiceFallbackMode] = useState<boolean>(false);
  const [mutedPlayerUids, setMutedPlayerUids] = useState<Record<string, boolean>>({});
  const [voiceStatusNote, setVoiceStatusNote] = useState<string>('Mic Ready');
  const [featureFlags, setFeatureFlags] = useState(() => ({
    voiceChat: store.isFeatureEnabled('ludo_voice_chat'),
    textChat: store.isFeatureEnabled('ludo_text_chat'),
    tournaments: store.isFeatureEnabled('ludo_tournaments'),
    privateRooms: store.isFeatureEnabled('ludo_private_rooms')
  }));

  useEffect(() => {
    return store.subscribe(() => {
      setFeatureFlags({
        voiceChat: store.isFeatureEnabled('ludo_voice_chat'),
        textChat: store.isFeatureEnabled('ludo_text_chat'),
        tournaments: store.isFeatureEnabled('ludo_tournaments'),
        privateRooms: store.isFeatureEnabled('ludo_private_rooms')
      });
    });
  }, []);

  const localStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recorderIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const pendingIceCandidatesRef = useRef<Record<string, RTCIceCandidateInit[]>>({});
  const offeredPeersRef = useRef<Set<string>>(new Set());
  const activeWebRtcPeersRef = useRef<Set<string>>(new Set());
  const remoteAudioElementsRef = useRef<Record<string, HTMLAudioElement>>({});
  const processedSignalsRef = useRef<Set<string>>(new Set());
  const voiceBroadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const isLocalSpeakingRef = useRef<boolean>(false);

  // Step-by-Step Visual Pawn Positions & Top/Left Board Path Coordinates for ALL 4 Colors
  const [visualPawns, setVisualPawns] = useState<Record<LudoColor, [number, number, number, number]>>({
    red: [1, 1, 0, 0],
    green: [1, 1, 0, 0],
    yellow: [1, 1, 0, 0],
    blue: [1, 1, 0, 0]
  });
  const [pawnTopLeftCoords, setPawnTopLeftCoords] = useState<
    Record<LudoColor, [PawnCellCoord, PawnCellCoord, PawnCellCoord, PawnCellCoord]>
  >(() =>
    buildPawnCoordsMap({
      red: [1, 1, 0, 0],
      green: [1, 1, 0, 0],
      yellow: [1, 1, 0, 0],
      blue: [1, 1, 0, 0]
    })
  );
  const visualPawnsRef = useRef<Record<LudoColor, [number, number, number, number]>>({
    red: [1, 1, 0, 0],
    green: [1, 1, 0, 0],
    yellow: [1, 1, 0, 0],
    blue: [1, 1, 0, 0]
  });
  const targetPawnsRef = useRef<Record<LudoColor, [number, number, number, number]>>({
    red: [1, 1, 0, 0],
    green: [1, 1, 0, 0],
    yellow: [1, 1, 0, 0],
    blue: [1, 1, 0, 0]
  });
  const [hoppingToken, setHoppingToken] = useState<{ color: LudoColor; idx: number } | null>(null);
  const [isTokenWalking, setIsTokenWalking] = useState<boolean>(false);
  const [stepTrail, setStepTrail] = useState<Array<{ row: number; col: number; color: LudoColor; id: string }>>([]);

  // Chat ON / OFF Master Toggle & Drawer State
  const [chatEnabled, setChatEnabled] = useState<boolean>(true);
  const [showChatDrawer, setShowChatDrawer] = useState<boolean>(false);
  const [matchChatInput, setMatchChatInput] = useState<string>('');
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [floatingBubbles, setFloatingBubbles] = useState<Record<string, { text: string; ts: number }>>({});

  // Synchronous Refs for deduplicating payouts, refunds, roll events, chat notifications, and animation locks
  const paidRoomIdsRef = useRef<Set<string>>(new Set());
  const refundedRoomIdsRef = useRef<Set<string>>(new Set());
  const seenChatIdsRef = useRef<Set<string>>(new Set());
  const seenRollIdsRef = useRef<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<LudoRoomState | null>(null);
  const deferredRoomAfterMoveRef = useRef<LudoRoomState | null>(null);
  const rollingPlayerKeyRef = useRef<LudoPlayerKey | null>(null);
  const stepLoopRunningRef = useRef<boolean>(false);
  const walkGenRef = useRef<number>(0);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const landTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionLockUntilRef = useRef<number>(0);
  const isRollingLockRef = useRef<boolean>(false);
  const isMovingLockRef = useRef<boolean>(false);
  const soundEngineAudioCtxRef = useRef<AudioContext | null>(null);
  roomRef.current = room;
  rollingPlayerKeyRef.current = rollingPlayerKey;

  const entryOptions = [50, 100, 250, 500, 1000, 2500];
  const prizePoolPreview = Math.round(selectedEntry * selectedMaxPlayers * 0.90);
  const houseMarginPreview = selectedEntry * selectedMaxPlayers - prizePoolPreview;

  // ==================== DEDICATED LUDO WEB AUDIO SOUND ENGINE ====================
  // Singleton AudioContext with safe user-gesture unlocking and master gain control
  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    try {
      if (!soundEngineAudioCtxRef.current || soundEngineAudioCtxRef.current.state === 'closed') {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return null;
        soundEngineAudioCtxRef.current = new Ctx();
      }
      if (soundEngineAudioCtxRef.current.state === 'suspended') {
        soundEngineAudioCtxRef.current.resume().catch(() => {});
      }
      return soundEngineAudioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  // Web Audio Synthesized Tone Generator with frequency sweeps and smooth exponential decay
  const playTone = useCallback(
    (
      freq: number,
      durationMs: number,
      type: OscillatorType = 'sine',
      gainVal = 0.08,
      endFreq?: number
    ) => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const durationSec = durationMs / 1000;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (endFreq && endFreq !== freq) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(15, endFreq), now + durationSec);
        }

        gain.gain.setValueAtTime(gainVal, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + durationSec);
      } catch {
        // Ignore audio errors on restricted autoplay
      }
    },
    [soundEnabled, getAudioContext]
  );

  // Dedicated Audio Trigger 1: 3D Dice Flip & Tumbling Sound
  // Multi-axis acoustic rattle and clatters matching the 1.52s roll with heavy final landing thud
  const playDiceFlipSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const tumbleEvents = [
        { t: 0, freq: 380, end: 280, dur: 65, type: 'triangle' as OscillatorType, gain: 0.08 },
        { t: 140, freq: 480, end: 320, dur: 60, type: 'triangle' as OscillatorType, gain: 0.07 },
        { t: 300, freq: 560, end: 380, dur: 55, type: 'sine' as OscillatorType, gain: 0.07 },
        { t: 480, freq: 440, end: 310, dur: 65, type: 'triangle' as OscillatorType, gain: 0.08 },
        { t: 680, freq: 620, end: 410, dur: 55, type: 'sine' as OscillatorType, gain: 0.07 },
        { t: 890, freq: 510, end: 330, dur: 60, type: 'triangle' as OscillatorType, gain: 0.07 },
        { t: 1120, freq: 430, end: 290, dur: 70, type: 'sine' as OscillatorType, gain: 0.06 },
        { t: 1360, freq: 360, end: 240, dur: 75, type: 'triangle' as OscillatorType, gain: 0.06 }
      ];

      tumbleEvents.forEach((ev) => {
        setTimeout(() => {
          if (!soundEnabled) return;
          playTone(ev.freq, ev.dur, ev.type, ev.gain, ev.end);
        }, ev.t);
      });

      // Final solid landing thud when 3D cube aligns and settles onto its face
      setTimeout(() => {
        if (!soundEnabled) return;
        playTone(95, 140, 'triangle', 0.12, 45); // Sub-bass landing impact
        playTone(520, 60, 'sine', 0.06, 260);    // Crisp surface tap
      }, 1480);
    } catch {}
  }, [soundEnabled, getAudioContext, playTone]);

  // Dedicated Audio Trigger 2: Token Step-by-Step Jump Sound
  // Tactile acoustic pawn hop into cell, with triumphant arpeggio upon reaching home
  const playTokenJumpSound = useCallback(
    (step: number, isReachingHome: boolean) => {
      if (!soundEnabled) return;
      try {
        if (isReachingHome) {
          // Glorious sparkling major arpeggio when token crosses into the final Home cell
          const homeChimes = [
            { freq: 523.25, dur: 140, delay: 0 },
            { freq: 659.25, dur: 150, delay: 90 },
            { freq: 783.99, dur: 180, delay: 180 },
            { freq: 1046.5, dur: 280, delay: 270 }
          ];
          homeChimes.forEach((c) => {
            setTimeout(() => {
              if (!soundEnabled) return;
              playTone(c.freq, c.dur, 'sine', 0.12);
            }, c.delay);
          });
        } else {
          // Tactile wooden pawn hop with subtle downward frequency pop and progressive step tuning
          const baseFreq = 420 + (step % 14) * 22;
          playTone(baseFreq, 85, 'triangle', 0.09, baseFreq - 90);
          playTone(baseFreq * 1.5, 30, 'sine', 0.04);
        }
      } catch {}
    },
    [soundEnabled, playTone]
  );

  // Dedicated Audio Trigger 3: Capture Strike ("SUPER CUT!")
  // Dramatic high-impact clash knocking an opponent pawn back to their Home Yard
  const playCaptureSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      // 1. Aggressive downward slice sweep
      playTone(1180, 190, 'sawtooth', 0.16, 180);
      // 2. Punchy sub-bass physical impact
      playTone(85, 230, 'sine', 0.18, 40);
      // 3. Metallic clash resonance
      setTimeout(() => {
        if (!soundEnabled) return;
        playTone(880, 110, 'square', 0.09, 440);
        playTone(1320, 160, 'sine', 0.07);
      }, 70);
    } catch {}
  }, [soundEnabled, playTone]);

  // Dedicated Audio Trigger 4: Victory Fanfare
  // Majestic championship arpeggio and celebratory crystalline chimes
  const playWinSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      // Ascending triumphant fanfare
      const fanfareNotes = [
        { freq: 261.63, dur: 140, delay: 0 },   // C4
        { freq: 329.63, dur: 140, delay: 130 }, // E4
        { freq: 392.00, dur: 160, delay: 260 }, // G4
        { freq: 523.25, dur: 220, delay: 390 }, // C5
        { freq: 659.25, dur: 240, delay: 520 }, // E5
        { freq: 783.99, dur: 340, delay: 650 }  // G5
      ];
      fanfareNotes.forEach((note) => {
        setTimeout(() => {
          if (!soundEnabled) return;
          playTone(note.freq, note.dur, 'triangle', 0.13);
        }, note.delay);
      });

      // Triumphant climax chord
      setTimeout(() => {
        if (!soundEnabled) return;
        playTone(523.25, 600, 'sine', 0.11);
        playTone(659.25, 600, 'sine', 0.11);
        playTone(783.99, 600, 'sine', 0.12);
        playTone(1046.50, 700, 'triangle', 0.14);
      }, 780);

      // Cascading celebratory sparkle
      setTimeout(() => {
        if (!soundEnabled) return;
        [1318.5, 1567.98, 2093.0].forEach((freq, idx) => {
          setTimeout(() => {
            if (!soundEnabled) return;
            playTone(freq, 220, 'sine', 0.09);
          }, idx * 110);
        });
      }, 1200);
    } catch {}
  }, [soundEnabled, playTone]);

  // Dedicated Audio Trigger 5: Deploy Token From Yard to Start Star
  const playDeploySound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      playTone(440, 110, 'triangle', 0.11, 660);
      setTimeout(() => {
        if (!soundEnabled) return;
        playTone(880, 160, 'sine', 0.12, 1046);
      }, 80);
    } catch {}
  }, [soundEnabled, playTone]);

  // Dedicated Audio Trigger 6: Button Click / Interactive Touch Feedback
  const playButtonClickSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      playTone(740, 35, 'sine', 0.05, 520);
    } catch {}
  }, [soundEnabled, playTone]);

  // Dedicated Voice Synthesizer for Spoken Voice Callouts & Opponent Chat
  const speakVoiceOutLoud = useCallback(
    (text: string, customPitch = 1.02, customRate = 1.04) => {
      if (!speakerEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      try {
        const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
        if (!cleanText) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(cleanText);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
          voices.find((v) => v.lang.includes('en-IN') || v.lang.includes('hi-IN')) ||
          voices.find((v) => v.lang.startsWith('en'));
        if (preferredVoice) {
          utter.voice = preferredVoice;
        }
        utter.rate = customRate;
        utter.pitch = customPitch;
        utter.volume = 0.95;
        window.speechSynthesis.speak(utter);
      } catch {
        // Ignore speech synthesis errors
      }
    },
    [speakerEnabled]
  );

  const speakChatMessage = useCallback(
    (text: string) => {
      if (!speakerEnabled) return;
      speakVoiceOutLoud(text, 1.0, 1.03);
    },
    [speakerEnabled, speakVoiceOutLoud]
  );

  const normalizePawnsTuple = (rawPawns: unknown, fallback: [number, number, number, number] = [0, 0, 0, 0]): [number, number, number, number] => {
    if (Array.isArray(rawPawns) && rawPawns.length >= 4) {
      return [
        Math.max(0, Math.min(57, Number(rawPawns[0]) || 0)),
        Math.max(0, Math.min(57, Number(rawPawns[1]) || 0)),
        Math.max(0, Math.min(57, Number(rawPawns[2]) || 0)),
        Math.max(0, Math.min(57, Number(rawPawns[3]) || 0))
      ];
    }
    if (rawPawns && typeof rawPawns === 'object') {
      const obj = rawPawns as Record<string, unknown>;
      return [
        Math.max(0, Math.min(57, Number(obj['0']) || 0)),
        Math.max(0, Math.min(57, Number(obj['1']) || 0)),
        Math.max(0, Math.min(57, Number(obj['2']) || 0)),
        Math.max(0, Math.min(57, Number(obj['3']) || 0))
      ];
    }
    return [...fallback] as [number, number, number, number];
  };

  // Board Render Safety Helper: guarantees all player states, token arrays, movablePawns, and chatMessages exist before mounting board
  const normalizeLudoRoomState = useCallback((raw: any): LudoRoomState => {
    const now = Date.now();
    const maxP: 2 | 3 | 4 = raw?.maxPlayers === 3 ? 3 : raw?.maxPlayers === 4 ? 4 : 2;
    const fee = Number(raw?.stake ?? raw?.entryFee) || 50;
    const totalPool = fee * maxP;
    const houseCut = Math.round(totalPool * 0.1 * 100) / 100;
    const defaultPrize = Math.round((totalPool - houseCut) * 100) / 100;

    const p1Raw = raw?.player1 || {};
    const p1Pawns = normalizePawnsTuple(p1Raw.pawns ?? raw?.boardState?.p1, [0, 0, 0, 0]);
    const safePlayer1: LudoPlayerState = {
      uid: p1Raw.uid || raw?.hostUid || raw?.players?.p1 || 'player_1',
      username: p1Raw.username || 'Player 1',
      location: p1Raw.location || 'India',
      flag: p1Raw.flag || '🇮🇳',
      color: 'red',
      pawns: p1Pawns,
      score: typeof p1Raw.score === 'number' ? p1Raw.score : 0,
      captures: typeof p1Raw.captures === 'number' ? p1Raw.captures : 0,
      homeCount: p1Pawns.filter((s) => s === 57).length,
      movesLeft: typeof p1Raw.movesLeft === 'number' ? p1Raw.movesLeft : 30,
      lastDice: typeof p1Raw.lastDice === 'number' ? p1Raw.lastDice : null,
      consecutiveSixes: typeof p1Raw.consecutiveSixes === 'number' ? p1Raw.consecutiveSixes : 0,
      isBot: Boolean(p1Raw.isBot),
      lastActiveAt: p1Raw.lastActiveAt || now
    };

    const p2Color: LudoColor = maxP === 2 ? 'yellow' : 'green';
    let safePlayer2: LudoPlayerState | null = null;
    if (raw?.player2 || raw?.status === 'playing' || raw?.players?.p2) {
      const p2Raw = raw?.player2 || {};
      const p2Pawns = normalizePawnsTuple(p2Raw.pawns ?? raw?.boardState?.p2, [0, 0, 0, 0]);
      safePlayer2 = {
        uid: p2Raw.uid || raw?.players?.p2 || 'player_2',
        username: p2Raw.username || 'Challenger_2',
        location: p2Raw.location || 'India',
        flag: p2Raw.flag || '🇮🇳',
        color: p2Raw.color || p2Color,
        pawns: p2Pawns,
        score: typeof p2Raw.score === 'number' ? p2Raw.score : 0,
        captures: typeof p2Raw.captures === 'number' ? p2Raw.captures : 0,
        homeCount: p2Pawns.filter((s) => s === 57).length,
        movesLeft: typeof p2Raw.movesLeft === 'number' ? p2Raw.movesLeft : 30,
        lastDice: typeof p2Raw.lastDice === 'number' ? p2Raw.lastDice : null,
        consecutiveSixes: typeof p2Raw.consecutiveSixes === 'number' ? p2Raw.consecutiveSixes : 0,
        isBot: Boolean(p2Raw.isBot),
        lastActiveAt: p2Raw.lastActiveAt || now
      };
    }

    const rawMovables = raw?.movablePawns;
    const safeMovables: number[] = Array.isArray(rawMovables)
      ? rawMovables.map((n: unknown) => Number(n)).filter((n: number) => Number.isFinite(n))
      : rawMovables && typeof rawMovables === 'object'
      ? Object.values(rawMovables).map((n: unknown) => Number(n)).filter((n: number) => Number.isFinite(n))
      : [];

    const rawChat = raw?.chatMessages;
    const safeChat: LudoChatMessage[] = Array.isArray(rawChat)
      ? rawChat.filter(Boolean)
      : rawChat && typeof rawChat === 'object'
      ? (Object.values(rawChat).filter(Boolean) as LudoChatMessage[])
      : [];

    const defaultSeatOrder: LudoPlayerKey[] =
      maxP === 2
        ? ['player1', 'player2']
        : maxP === 3
        ? ['player1', 'player2', 'player3']
        : ['player1', 'player2', 'player3', 'player4'];

    const safeTurn: LudoPlayerKey =
      raw?.turn === 'player2' || raw?.turn === 'player3' || raw?.turn === 'player4'
        ? raw.turn
        : raw?.currentTurn && safePlayer2 && raw.currentTurn === safePlayer2.uid
        ? 'player2'
        : 'player1';

    return {
      ...raw,
      roomId: String(raw?.roomId || 'LUDO1000'),
      hostUid: raw?.hostUid || safePlayer1.uid,
      stake: fee,
      entryFee: fee,
      maxPlayers: maxP,
      seatOrder: Array.isArray(raw?.seatOrder) && raw.seatOrder.length >= 2 ? raw.seatOrder : defaultSeatOrder,
      prizePool: Number(raw?.prizePool) || defaultPrize,
      houseMargin: Number(raw?.houseMargin) || houseCut,
      isPrivate: Boolean(raw?.isPrivate),
      status: raw?.status || 'waiting',
      players: {
        p1: safePlayer1.uid,
        ...(safePlayer2 ? { p2: safePlayer2.uid } : {})
      },
      currentTurn: safeTurn === 'player2' && safePlayer2 ? safePlayer2.uid : safePlayer1.uid,
      boardState: {
        p1: safePlayer1.pawns,
        p2: safePlayer2 ? safePlayer2.pawns : [0, 0, 0, 0]
      },
      player1: safePlayer1,
      player2: safePlayer2,
      player3: raw?.player3 ? { ...raw.player3, pawns: normalizePawnsTuple(raw.player3.pawns, [0, 0, 0, 0]) } : null,
      player4: raw?.player4 ? { ...raw.player4, pawns: normalizePawnsTuple(raw.player4.pawns, [0, 0, 0, 0]) } : null,
      turn: safeTurn,
      diceValue: typeof raw?.diceValue === 'number' ? raw.diceValue : null,
      hasRolled: Boolean(raw?.hasRolled),
      movablePawns: safeMovables,
      lastAction: raw?.lastAction || 'Match in progress',
      winner: raw?.winner || null,
      chatMessages: safeChat,
      createdAt: raw?.createdAt || now,
      updatedAt: raw?.updatedAt || now
    };
  }, []);

  const extractPawnsByColorFromRoom = useCallback(
    (targetRoom: LudoRoomState): Record<LudoColor, [number, number, number, number]> => {
      const result: Record<LudoColor, [number, number, number, number]> = {
        red: [0, 0, 0, 0],
        green: [0, 0, 0, 0],
        yellow: [0, 0, 0, 0],
        blue: [0, 0, 0, 0]
      };
      if (!targetRoom) return result;
      const keys: LudoPlayerKey[] = ['player1', 'player2', 'player3', 'player4'];
      keys.forEach((k) => {
        const p = targetRoom[k];
        if (p && p.color) {
          result[p.color] = normalizePawnsTuple(p.pawns, [0, 0, 0, 0]);
        }
      });
      return result;
    },
    []
  );

  // Helper to sync visual pawns immediately when joining or resuming a room
  const syncVisualPawnsFromRoom = useCallback(
    (targetRoom: LudoRoomState) => {
      const safeRoom = normalizeLudoRoomState(targetRoom);
      walkGenRef.current += 1;
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
        stepTimerRef.current = null;
      }
      if (landTimerRef.current) {
        clearTimeout(landTimerRef.current);
        landTimerRef.current = null;
      }
      stepLoopRunningRef.current = false;
      deferredRoomAfterMoveRef.current = null;
      isMovingLockRef.current = false;
      setIsTokenWalking(false);
      setHoppingToken(null);

      const nextVisual = extractPawnsByColorFromRoom(safeRoom);
      visualPawnsRef.current = {
        red: [...nextVisual.red] as [number, number, number, number],
        green: [...nextVisual.green] as [number, number, number, number],
        yellow: [...nextVisual.yellow] as [number, number, number, number],
        blue: [...nextVisual.blue] as [number, number, number, number]
      };
      targetPawnsRef.current = {
        red: [...nextVisual.red] as [number, number, number, number],
        green: [...nextVisual.green] as [number, number, number, number],
        yellow: [...nextVisual.yellow] as [number, number, number, number],
        blue: [...nextVisual.blue] as [number, number, number, number]
      };
      setVisualPawns(nextVisual);
      setPawnTopLeftCoords(buildPawnCoordsMap(nextVisual));
    },
    [extractPawnsByColorFromRoom, normalizeLudoRoomState]
  );

  // ==================== LIVE WEBRTC VOICE CHAT & HYBRID AUDIO RELAY ENGINE ====================
  const playIncomingAudioBase64 = useCallback(
    (fromUid: string, audioDataUrl: string) => {
      if (!speakerEnabled || mutedPlayerUids[fromUid]) return;
      if (activeWebRtcPeersRef.current.has(fromUid)) return; // Already playing direct WebRTC stream
      try {
        const clip = new Audio(audioDataUrl);
        clip.volume = 1.0;
        clip.play().catch(() => {});
      } catch {
        // Ignore playback errors
      }
    },
    [speakerEnabled, mutedPlayerUids]
  );

  const syncVoiceStateToServer = useCallback(
    async (roomId: string, nextMic: boolean, nextSpeaker: boolean, speaking: boolean) => {
      if (!user) return;
      try {
        await fetch(`/api/ludo/room/${roomId}/voice-state`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            micEnabled: nextMic,
            speakerEnabled: nextSpeaker,
            isSpeaking: speaking
          })
        });
      } catch {
        // Ignore transient network errors
      }
    },
    [user]
  );

  const stopLocalMicrophone = useCallback(() => {
    if (analyserIntervalRef.current) {
      clearInterval(analyserIntervalRef.current);
      analyserIntervalRef.current = null;
    }
    if (recorderIntervalRef.current) {
      clearInterval(recorderIntervalRef.current);
      recorderIntervalRef.current = null;
    }
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch {
        // Ignore
      }
      mediaRecorderRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      try {
        pc.close();
      } catch {
        // Ignore
      }
    });
    peerConnectionsRef.current = {};
    pendingIceCandidatesRef.current = {};
    offeredPeersRef.current.clear();
    activeWebRtcPeersRef.current.clear();
    isLocalSpeakingRef.current = false;
    setIsLocalSpeaking(false);
    setMicLevel(0);
    setVoiceFallbackMode(false);
    setMicEnabled(false);
  }, []);

  useEffect(() => {
    if (!room) {
      stopLocalMicrophone();
    }
    return () => {
      stopLocalMicrophone();
    };
  }, [room?.roomId, stopLocalMicrophone]);

  // Cross-tab & local BroadcastChannel for zero-latency voice audio & phrase sync
  useEffect(() => {
    if (!room?.roomId || typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel(`bingo777_ludo_voice_${room.roomId}`);
    voiceBroadcastChannelRef.current = bc;
    bc.onmessage = (ev) => {
      const data = ev.data;
      if (!data || !user || data.fromUid === user.uid) return;
      if (data.type === 'audio_chunk' && typeof data.audioData === 'string') {
        playIncomingAudioBase64(data.fromUid, data.audioData);
      } else if (data.type === 'voice_phrase' && typeof data.text === 'string') {
        if (!mutedPlayerUids[data.fromUid]) {
          speakVoiceOutLoud(data.text, 1.05, 1.05);
        }
      }
    };
    return () => {
      bc.close();
      voiceBroadcastChannelRef.current = null;
    };
  }, [room?.roomId, user, mutedPlayerUids, playIncomingAudioBase64, speakVoiceOutLoud]);

  // Update volume/mute on remote WebRTC audio elements when speakerEnabled or mutedPlayerUids changes
  useEffect(() => {
    Object.entries(remoteAudioElementsRef.current).forEach(([peerUid, audioEl]) => {
      audioEl.muted = !speakerEnabled || Boolean(mutedPlayerUids[peerUid]);
    });
  }, [speakerEnabled, mutedPlayerUids]);

  const attachLocalTracksToPeer = useCallback((pc: RTCPeerConnection) => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const existingSenders = pc.getSenders();
    stream.getTracks().forEach((track) => {
      const alreadyAdded = existingSenders.some((s) => s.track && s.track.id === track.id);
      if (!alreadyAdded) {
        try {
          pc.addTrack(track, stream);
        } catch {
          // Ignore if track already attached
        }
      }
    });
  }, []);

  const flushPendingIceCandidates = useCallback(async (peerUid: string, pc: RTCPeerConnection) => {
    const queued = pendingIceCandidatesRef.current[peerUid];
    if (!queued || queued.length === 0 || !pc.remoteDescription) return;
    pendingIceCandidatesRef.current[peerUid] = [];
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // Ignore invalid/expired ICE candidate
      }
    }
  }, []);

  const createOrGetPeerConnection = useCallback(
    (peerUid: string, currentRoomId: string): RTCPeerConnection => {
      if (peerConnectionsRef.current[peerUid]) {
        const existingPc = peerConnectionsRef.current[peerUid];
        attachLocalTracksToPeer(existingPc);
        return existingPc;
      }
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      });
      peerConnectionsRef.current[peerUid] = pc;

      attachLocalTracksToPeer(pc);

      pc.onicecandidate = (ev) => {
        if (ev.candidate && user) {
          fetch(`/api/ludo/room/${currentRoomId}/voice-signal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromUid: user.uid,
              toUid: peerUid,
              type: 'ice',
              payload: ev.candidate
            })
          }).catch(() => {});
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          activeWebRtcPeersRef.current.add(peerUid);
        } else if (
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'failed' ||
          pc.connectionState === 'closed'
        ) {
          activeWebRtcPeersRef.current.delete(peerUid);
        }
      };

      pc.ontrack = (ev) => {
        const remoteStream = ev.streams?.[0] || new MediaStream([ev.track]);
        if (remoteStream) {
          activeWebRtcPeersRef.current.add(peerUid);
          let audioEl = remoteAudioElementsRef.current[peerUid];
          if (!audioEl) {
            audioEl = new Audio();
            audioEl.autoplay = true;
            audioEl.setAttribute('playsinline', 'true');
            remoteAudioElementsRef.current[peerUid] = audioEl;
          }
          audioEl.srcObject = remoteStream;
          audioEl.muted = !speakerEnabled || Boolean(mutedPlayerUids[peerUid]);
          audioEl.play().catch(() => {});
        }
      };

      return pc;
    },
    [user, speakerEnabled, mutedPlayerUids, attachLocalTracksToPeer]
  );

  // Start MediaRecorder live audio chunk relay as NAT-proof fallback alongside WebRTC
  const startLiveAudioChunkRelay = useCallback(
    (stream: MediaStream, currentRoomId: string) => {
      if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined' || !user) return;
      try {
        const mimeTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4'
        ];
        const selectedMime = mimeTypes.find((m) => {
          try {
            return MediaRecorder.isTypeSupported(m);
          } catch {
            return false;
          }
        });

        const recordSlice = () => {
          if (!localStreamRef.current || !roomRef.current || !user) return;
          try {
            const recorder = selectedMime
              ? new MediaRecorder(stream, { mimeType: selectedMime, audioBitsPerSecond: 24000 })
              : new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            const chunks: BlobPart[] = [];
            recorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) chunks.push(e.data);
            };
            recorder.onstop = () => {
              if (chunks.length === 0 || !isLocalSpeakingRef.current || !roomRef.current) return;
              const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
              if (blob.size < 200 || blob.size > 150000) return;
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64Audio = reader.result;
                if (typeof base64Audio !== 'string' || !roomRef.current || !user) return;
                // Broadcast immediately over BroadcastChannel
                voiceBroadcastChannelRef.current?.postMessage({
                  fromUid: user.uid,
                  type: 'audio_chunk',
                  audioData: base64Audio
                });
                // Also relay to human peers in the room who aren't yet connected over direct WebRTC
                const activeRoom = roomRef.current;
                const keys: LudoPlayerKey[] = ['player1', 'player2', 'player3', 'player4'];
                keys.forEach((k) => {
                  const p = activeRoom[k];
                  if (
                    p &&
                    !p.isBot &&
                    p.uid !== user.uid &&
                    !activeWebRtcPeersRef.current.has(p.uid)
                  ) {
                    fetch(`/api/ludo/room/${currentRoomId}/voice-signal`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        fromUid: user.uid,
                        toUid: p.uid,
                        type: 'audio_chunk',
                        payload: { audioData: base64Audio }
                      })
                    }).catch(() => {});
                  }
                });
              };
              reader.readAsDataURL(blob);
            };
            recorder.start();
            setTimeout(() => {
              try {
                if (recorder.state !== 'inactive') recorder.stop();
              } catch {
                // Ignore
              }
            }, 1350);
          } catch {
            // Ignore MediaRecorder slice errors
          }
        };

        if (recorderIntervalRef.current) clearInterval(recorderIntervalRef.current);
        recorderIntervalRef.current = setInterval(recordSlice, 1450);
      } catch {
        // Ignore MediaRecorder unsupported environments
      }
    },
    [user]
  );

  // Instant Spoken Voice Phrase Broadcast (works both with hardware mic and in Smart Voice Talk mode)
  const handleBroadcastVoicePhrase = useCallback(
    async (phraseText: string) => {
      if (!room || !user) return;
      if (!featureFlags.voiceChat) {
        showToast('Voice Chat is currently disabled by Admin.', 'error');
        return;
      }

      // Unlock & speak locally so user immediately hears confirmation
      playTone(680, 90, 'sine', 0.07, 880);
      speakVoiceOutLoud(phraseText, 1.0, 1.05);

      const keys: LudoPlayerKey[] = ['player1', 'player2', 'player3', 'player4'];
      const mySeat = keys.find((k) => room[k]?.uid === user.uid) || 'player1';
      const myCol = room[mySeat]?.color || 'red';

      setIsLocalSpeaking(true);
      isLocalSpeakingRef.current = true;
      setMicLevel(85);
      setFloatingBubbles((prev) => ({
        ...prev,
        [myCol]: { text: `🎙️ ${phraseText}`, ts: Date.now() }
      }));
      syncVoiceStateToServer(room.roomId, true, speakerEnabled, true);

      voiceBroadcastChannelRef.current?.postMessage({
        fromUid: user.uid,
        type: 'voice_phrase',
        text: phraseText
      });

      // Send voice_phrase signal to all human opponents in the room
      for (const k of keys) {
        const p = room[k];
        if (p && !p.isBot && p.uid !== user.uid) {
          fetch(`/api/ludo/room/${room.roomId}/voice-signal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromUid: user.uid,
              toUid: p.uid,
              type: 'voice_phrase',
              payload: { text: phraseText, senderName: user.username, senderColor: myCol }
            })
          }).catch(() => {});
        }
      }

      setTimeout(() => {
        setIsLocalSpeaking(false);
        isLocalSpeakingRef.current = false;
        setMicLevel((prev) => (micEnabled && !voiceFallbackMode ? prev : 0));
        if (roomRef.current) {
          syncVoiceStateToServer(roomRef.current.roomId, micEnabled, speakerEnabled, false);
        }
      }, 2200);
    },
    [
      room,
      user,
      featureFlags.voiceChat,
      micEnabled,
      voiceFallbackMode,
      speakerEnabled,
      playTone,
      speakVoiceOutLoud,
      syncVoiceStateToServer,
      showToast
    ]
  );

  // Toggle Live Microphone ON / OFF
  const handleToggleMicrophone = async () => {
    if (!room || !user) return;
    if (!featureFlags.voiceChat) {
      showToast('Voice Chat is currently disabled by Admin.', 'error');
      return;
    }

    if (micEnabled) {
      stopLocalMicrophone();
      setVoiceStatusNote('Mic Muted');
      syncVoiceStateToServer(room.roomId, false, speakerEnabled, false);
      showToast('Microphone muted', 'info');
      return;
    }

    // Unlock audio context & speech synthesis on user tap
    getAudioContext();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices();
      } catch {
        // Ignore
      }
    }

    const activateSmartVoiceTalkFallback = (reasonNote: string) => {
      setMicEnabled(true);
      setVoiceFallbackMode(true);
      setVoiceStatusNote('Live Voice Talk ON');
      syncVoiceStateToServer(room.roomId, true, speakerEnabled, true);
      playTone(620, 120, 'sine', 0.08, 840);
      showToast(`${reasonNote} — Live Voice Talk & Table Speaker Active!`, 'success');
      setTimeout(() => {
        if (roomRef.current) {
          syncVoiceStateToServer(roomRef.current.roomId, true, speakerEnabled, false);
        }
      }, 1800);
    };

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      activateSmartVoiceTalkFallback('Voice Talk Mode Activated');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch {
        // Fallback to basic audio constraint if advanced constraints fail on device
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      localStreamRef.current = stream;
      setMicEnabled(true);
      setVoiceFallbackMode(false);
      setVoiceStatusNote('Live Mic Active');
      syncVoiceStateToServer(room.roomId, true, speakerEnabled, false);
      playTone(660, 110, 'sine', 0.08, 920);
      showToast('Live Microphone ON — Speak now or tap any Voice Talk phrase!', 'success');

      // Attach local audio level detector so speaking rings & volume meter animate in real time
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (Ctx) {
        const audioCtx = new Ctx();
        audioCtxRef.current = audioCtx;
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume().catch(() => {});
        }
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.65;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let lastSpeakingSent = false;

        analyserIntervalRef.current = setInterval(() => {
          if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
          }
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          const normalizedLevel = Math.min(100, Math.round((avg / 48) * 100));
          setMicLevel(normalizedLevel);
          const speakingNow = avg > 9;
          isLocalSpeakingRef.current = speakingNow;
          setIsLocalSpeaking(speakingNow);
          if (speakingNow !== lastSpeakingSent && roomRef.current) {
            lastSpeakingSent = speakingNow;
            syncVoiceStateToServer(roomRef.current.roomId, true, speakerEnabled, speakingNow);
          }
        }, 220);
      }

      // Start hybrid MediaRecorder live audio chunk relay alongside WebRTC
      startLiveAudioChunkRelay(stream, room.roomId);

      // Initiate WebRTC offers to all human opponents in the room
      const keys: LudoPlayerKey[] = ['player1', 'player2', 'player3', 'player4'];
      for (const k of keys) {
        const p = room[k];
        if (p && !p.isBot && p.uid !== user.uid) {
          offeredPeersRef.current.add(p.uid);
          const pc = createOrGetPeerConnection(p.uid, room.roomId);
          const offer = await pc.createOffer({ offerToReceiveAudio: true });
          await pc.setLocalDescription(offer);
          await fetch(`/api/ludo/room/${room.roomId}/voice-signal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromUid: user.uid,
              toUid: p.uid,
              type: 'offer',
              payload: offer
            })
          });
        }
      }
    } catch {
      // Instead of leaving voice broken when mic hardware/permission is blocked, enable Smart Voice Talk Mode!
      activateSmartVoiceTalkFallback('Smart Voice Talk Mode ON');
    }
  };

  const handleToggleSpeaker = () => {
    const next = !speakerEnabled;
    setSpeakerEnabled(next);
    if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (room) {
      syncVoiceStateToServer(room.roomId, micEnabled, next, isLocalSpeaking);
    }
    showToast(next ? 'Table Speaker Audio ON' : 'Table Speaker Audio Muted', 'info');
  };

  const toggleMuteSpecificPlayer = (targetUid: string, targetName: string) => {
    setMutedPlayerUids((prev) => {
      const nextMuted = !prev[targetUid];
      showToast(nextMuted ? `Muted ${targetName}` : `Unmuted ${targetName}`, 'info');
      return { ...prev, [targetUid]: nextMuted };
    });
  };

  // Helper to check if two 4-color pawn maps differ on any token
  const hasPawnPositionDiff = useCallback(
    (
      a: Record<LudoColor, [number, number, number, number]>,
      b: Record<LudoColor, [number, number, number, number]>
    ): boolean => {
      const cols: LudoColor[] = ['red', 'green', 'yellow', 'blue'];
      for (const c of cols) {
        for (let i = 0; i < 4; i++) {
          if (a[c][i] !== b[c][i]) return true;
        }
      }
      return false;
    },
    []
  );

  // Idempotent Server-Verified Match Settlement (called only AFTER final token lands on Home)
  const checkAndSettleFinishedRoom = useCallback(
    async (finishedRoom: LudoRoomState) => {
      if (
        finishedRoom.status !== 'finished' ||
        !finishedRoom.winner ||
        paidRoomIdsRef.current.has(finishedRoom.roomId)
      ) {
        return;
      }
      paidRoomIdsRef.current.add(finishedRoom.roomId);
      const keys: LudoPlayerKey[] = ['player1', 'player2', 'player3', 'player4'];
      const myRoleNow: LudoPlayerKey =
        keys.find((k) => finishedRoom[k]?.uid === user?.uid) || 'player1';

      if (finishedRoom.winner === myRoleNow && user) {
        try {
          const claimRes = await fetch(`/api/ludo/room/${finishedRoom.roomId}/claim-payout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: user.uid })
          });
          const claimData = await claimRes.json();
          if (claimData.success && claimData.newlySettled) {
            const payoutRes = store.recordGamePayout(
              user.uid,
              finishedRoom.prizePool,
              `Ludo ${finishedRoom.maxPlayers || 2}P Live Battle`,
              claimData.settlementTxId || finishedRoom.roomId
            );
            if (payoutRes.success) {
              playWinSound();
              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 }
              });
              showToast(`Victory! ₹${finishedRoom.prizePool} credited to your wallet!`, 'success');
            }
          }
        } catch {
          showToast('Verifying match settlement with server...', 'info');
        }
      } else {
        playTone(240, 300, 'sawtooth');
        showToast(finishedRoom.winReason || 'Match finished!', 'info');
      }
    },
    [user, playWinSound, playTone, showToast]
  );

  // ==================== SEQUENTIAL STEP-BY-STEP PAWN MOVEMENT ENGINE (ALL 4 COLORS) ====================
  // Iterates through the board path coordinate array (`getBoardPathCoordinateSequence`) for each move:
  // - Triggers a sequential animation of 200ms (`CELL_TRANSITION_MS`) per cell transition
  // - Waits for each 200ms cell transition animation to resolve before advancing to the next coordinate
  // - Waits for the entire sequential path animation to resolve before updating the final `top`/`left` state and turn state
  const startOrContinueTokenWalk = useCallback(() => {
    if (rollingPlayerKeyRef.current !== null) return;
    if (stepLoopRunningRef.current) return;

    const myGen = ++walkGenRef.current;

    const runPathCoordinateSequence = async () => {
      stepLoopRunningRef.current = true;
      const colorsOrder: LudoColor[] = ['red', 'green', 'yellow', 'blue'];

      while (myGen === walkGenRef.current && rollingPlayerKeyRef.current === null) {
        let movedInPass = false;

        // PASS 1: Iterate sequentially through the board path coordinate array for any advancing token (tgt > cur)
        for (const color of colorsOrder) {
          for (let i = 0; i < 4; i++) {
            const cur = visualPawnsRef.current[color][i];
            const tgt = targetPawnsRef.current[color][i];
            if (tgt > cur) {
              movedInPass = true;
              isMovingLockRef.current = true;
              setIsTokenWalking(true);

              const pathCoords = getBoardPathCoordinateSequence(color, i, cur, tgt);

              for (let stepIdx = 0; stepIdx < pathCoords.length; stepIdx++) {
                if (myGen !== walkGenRef.current || rollingPlayerKeyRef.current !== null) {
                  stepLoopRunningRef.current = false;
                  return;
                }

                const cellCoord = pathCoords[stepIdx];
                const isReachingHome = cellCoord.step === 57;

                // Trigger 200ms cell transition animation toward cellCoord
                setHoppingToken({ color, idx: i });
                setPawnTopLeftCoords((prev) => {
                  const nextColorCoords = [...prev[color]] as [
                    PawnCellCoord,
                    PawnCellCoord,
                    PawnCellCoord,
                    PawnCellCoord
                  ];
                  nextColorCoords[i] = cellCoord;
                  return { ...prev, [color]: nextColorCoords };
                });
                setStepTrail((prev) => [
                  ...prev.slice(-7),
                  {
                    row: cellCoord.row,
                    col: cellCoord.col,
                    color,
                    id: `trail-${color}-${Date.now()}-${cellCoord.step}`
                  }
                ]);

                if (cur === 0 && cellCoord.step === 1) {
                  playDeploySound();
                } else {
                  playTokenJumpSound(cellCoord.step, isReachingHome);
                }

                // Wait 200ms per cell transition for the animation to resolve
                await new Promise<void>((resolve) => {
                  stepTimerRef.current = setTimeout(resolve, CELL_TRANSITION_MS);
                });

                if (myGen !== walkGenRef.current) {
                  stepLoopRunningRef.current = false;
                  return;
                }

                // Resolve step position after the 200ms cell transition completes
                const updatedColorPawns = [...visualPawnsRef.current[color]] as [
                  number,
                  number,
                  number,
                  number
                ];
                updatedColorPawns[i] = cellCoord.step;
                visualPawnsRef.current = {
                  ...visualPawnsRef.current,
                  [color]: updatedColorPawns
                };
                setVisualPawns({ ...visualPawnsRef.current });
              }

              // Update final top/left state after all 200ms cell animations in the path resolve
              setPawnTopLeftCoords(buildPawnCoordsMap(visualPawnsRef.current));
              setHoppingToken(null);
            }
          }
        }

        // PASS 2: Animate any captured token returning to its Home Yard (tgt < cur)
        for (const color of colorsOrder) {
          for (let i = 0; i < 4; i++) {
            const cur = visualPawnsRef.current[color][i];
            const tgt = targetPawnsRef.current[color][i];
            if (cur !== tgt) {
              movedInPass = true;
              isMovingLockRef.current = true;
              setIsTokenWalking(true);
              playCaptureSound();

              const pathCoords = getBoardPathCoordinateSequence(color, i, cur, tgt);
              for (const cellCoord of pathCoords) {
                if (myGen !== walkGenRef.current) {
                  stepLoopRunningRef.current = false;
                  return;
                }

                playTone(210, 190, 'sawtooth', 0.12);
                setHoppingToken({ color, idx: i });
                setPawnTopLeftCoords((prev) => {
                  const nextColorCoords = [...prev[color]] as [
                    PawnCellCoord,
                    PawnCellCoord,
                    PawnCellCoord,
                    PawnCellCoord
                  ];
                  nextColorCoords[i] = cellCoord;
                  return { ...prev, [color]: nextColorCoords };
                });

                // Wait 200ms for the transition animation to resolve before updating final state
                await new Promise<void>((resolve) => {
                  stepTimerRef.current = setTimeout(resolve, CELL_TRANSITION_MS);
                });

                if (myGen !== walkGenRef.current) {
                  stepLoopRunningRef.current = false;
                  return;
                }

                const updatedColorPawns = [...visualPawnsRef.current[color]] as [
                  number,
                  number,
                  number,
                  number
                ];
                updatedColorPawns[i] = cellCoord.step;
                visualPawnsRef.current = {
                  ...visualPawnsRef.current,
                  [color]: updatedColorPawns
                };
                setVisualPawns({ ...visualPawnsRef.current });
              }

              setPawnTopLeftCoords(buildPawnCoordsMap(visualPawnsRef.current));
              setHoppingToken(null);
            }
          }
        }

        if (!movedInPass) break;
      }

      if (myGen !== walkGenRef.current) return;

      // PASS 3: All sequential 200ms cell transitions have resolved — commit final top/left & post-move room state!
      stepLoopRunningRef.current = false;
      isMovingLockRef.current = false;
      setHoppingToken(null);
      setIsTokenWalking(false);
      setPawnTopLeftCoords(buildPawnCoordsMap(visualPawnsRef.current));
      setVisualPawns({ ...visualPawnsRef.current });

      if (deferredRoomAfterMoveRef.current) {
        const committedRoom = deferredRoomAfterMoveRef.current;
        deferredRoomAfterMoveRef.current = null;
        setRoom(committedRoom);
        checkAndSettleFinishedRoom(committedRoom);
      }
    };

    void runPathCoordinateSequence();
  }, [
    playTone,
    playTokenJumpSound,
    playDeploySound,
    playCaptureSound,
    checkAndSettleFinishedRoom
  ]);

  // Clean up step timers and Web Audio context on unmount
  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      if (landTimerRef.current) clearTimeout(landTimerRef.current);
      if (soundEngineAudioCtxRef.current && soundEngineAudioCtxRef.current.state !== 'closed') {
        soundEngineAudioCtxRef.current.close().catch(() => {});
        soundEngineAudioCtxRef.current = null;
      }
    };
  }, []);

  // Local Optimistic Move Engine (100% identical to server.ts executeLudoPawnMove for 2, 3, or 4 players)
  const applyLocalPawnMove = useCallback(
    (currentRoom: LudoRoomState, playerKey: LudoPlayerKey, pawnIdx: number): LudoRoomState => {
      const nextRoom: LudoRoomState = JSON.parse(JSON.stringify(currentRoom));
      const activePlayer = nextRoom[playerKey];
      const dice = nextRoom.diceValue;

      if (!activePlayer || !dice || !nextRoom.hasRolled) return currentRoom;
      if (!nextRoom.movablePawns.includes(pawnIdx)) return currentRoom;

      const currentStep = activePlayer.pawns[pawnIdx];
      const isDeployingFromYard = currentStep === 0;
      const nextStep = isDeployingFromYard ? 1 : currentStep + dice;
      if (nextStep > 57) return currentRoom;

      const stepPoints = isDeployingFromYard ? 6 : dice;
      activePlayer.pawns[pawnIdx] = nextStep;
      activePlayer.score += stepPoints;
      activePlayer.lastDice = dice;

      const order: LudoPlayerKey[] = nextRoom.seatOrder || ['player1', 'player2'];
      let bonusTurn = dice === 6;
      let actionNote = isDeployingFromYard
        ? `${activePlayer.username} rolled ${dice} & deployed Token #${pawnIdx + 1} to Start ★ (+6 pts${bonusTurn ? ' · Bonus Roll' : ''})`
        : `${activePlayer.username} rolled ${dice} & moved Token #${pawnIdx + 1} (+${dice} steps${bonusTurn ? ' · Bonus Roll' : ''})`;

      if (nextStep === 57) {
        activePlayer.score += 56;
        activePlayer.homeCount = activePlayer.pawns.filter((p) => p === 57).length;
        bonusTurn = true;
        actionNote = `👑 HOME GOAL! ${activePlayer.username}'s Token #${pawnIdx + 1} reached Home! (+56 pts & Bonus Roll)`;
      } else if (nextStep >= 1 && nextStep <= 51) {
        const myGlobalIdx = getGlobalTrackIndex(activePlayer.color, nextStep);
        if (myGlobalIdx !== null && !SAFE_TRACK_INDICES.has(myGlobalIdx)) {
          const myPawnsAtTile = activePlayer.pawns.filter(
            (s) => getGlobalTrackIndex(activePlayer.color, s) === myGlobalIdx
          ).length;

          for (const oppKey of order) {
            if (oppKey === playerKey) continue;
            const oppPlayer = nextRoom[oppKey];
            if (!oppPlayer) continue;
            const oppCapturedIndices: number[] = [];
            oppPlayer.pawns.forEach((oppStep, oIdx) => {
              if (getGlobalTrackIndex(oppPlayer.color, oppStep) === myGlobalIdx) {
                oppCapturedIndices.push(oIdx);
              }
            });
            if (
              oppCapturedIndices.length === 1 ||
              (oppCapturedIndices.length > 0 && myPawnsAtTile >= oppCapturedIndices.length)
            ) {
              const cutIdx = oppCapturedIndices[0];
              const lostSteps = oppPlayer.pawns[cutIdx];
              oppPlayer.pawns[cutIdx] = 0;
              oppPlayer.score = Math.max(0, oppPlayer.score - lostSteps);
              activePlayer.captures += 1;
              activePlayer.score += 25;
              bonusTurn = true;
              actionNote = `⚔️ SUPER CUT! ${activePlayer.username} captured ${oppPlayer.username}'s Token #${cutIdx + 1}! (+25 pts & Bonus Roll)`;
              break;
            }
          }
        }
      }

      if (!bonusTurn) {
        activePlayer.movesLeft = Math.max(0, activePlayer.movesLeft - 1);
      }

      nextRoom.lastAction = actionNote;
      nextRoom.diceValue = null;
      nextRoom.hasRolled = false;
      nextRoom.movablePawns = [];
      nextRoom.updatedAt = Date.now();

      activePlayer.homeCount = activePlayer.pawns.filter((p) => p === 57).length;
      if (activePlayer.homeCount >= 4) {
        nextRoom.status = 'finished';
        nextRoom.winner = playerKey;
        nextRoom.winReason = `${activePlayer.username} brought all 4 tokens Home!`;
        return nextRoom;
      }

      if (!bonusTurn || activePlayer.movesLeft <= 0) {
        const startIdx = Math.max(0, order.indexOf(playerKey));
        let foundNext = false;
        for (let offset = 1; offset <= order.length; offset++) {
          const candKey = order[(startIdx + offset) % order.length];
          const cand = nextRoom[candKey];
          if (cand && cand.movesLeft > 0) {
            nextRoom.turn = candKey;
            foundNext = true;
            break;
          }
        }
        if (!foundNext) {
          // All players completed their 30 moves — highest score wins!
          let bestKey: LudoPlayerKey = 'player1';
          let bestScore = -1;
          for (const k of order) {
            const p = nextRoom[k];
            if (p && p.score > bestScore) {
              bestScore = p.score;
              bestKey = k;
            }
          }
          nextRoom.status = 'finished';
          nextRoom.winner = bestKey;
          nextRoom.winReason = `${nextRoom[bestKey]?.username || 'Player'} won on highest score (${bestScore} pts)!`;
        }
      }

      return nextRoom;
    },
    []
  );

  // Poll Lobby Data when in Lobby
  const fetchLobbyData = useCallback(async () => {
    try {
      const query = user?.uid ? `?uid=${encodeURIComponent(user.uid)}` : '';
      const res = await fetch(`/api/ludo/lobby${query}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setOpenRooms(data.openRooms || []);
        setRecoverableRoom(data.activeUserRoom || null);
        setLiveMatchesCount(data.liveMatchesCount || 28);
        setGlobalChat(data.globalChat || []);
      }
    } catch {
      // Ignore transient network errors
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!room) {
      fetchLobbyData();
      const timer = setInterval(fetchLobbyData, 2000);
      return () => clearInterval(timer);
    }
  }, [room, fetchLobbyData]);

  // Trigger capture & win sound effects on room state updates
  useEffect(() => {
    if (room?.lastAction && room.lastAction.includes('SUPER CUT!')) {
      playCaptureSound();
    }
  }, [room?.lastAction, playCaptureSound]);

  useEffect(() => {
    if (room?.status === 'finished' && room?.winner) {
      const finishKey = `${room.roomId}_${room.winner}`;
      if (settledSoundRoomRef.current !== finishKey) {
        settledSoundRoomRef.current = finishKey;
        setShowResult3DModal(true);

        const seatKeys: LudoPlayerKey[] = ['player1', 'player2', 'player3', 'player4'];
        const mySeat: LudoPlayerKey =
          (user && seatKeys.find((k) => room[k]?.uid === user.uid)) || 'player1';
        const didIWin = room.winner === mySeat;

        if (didIWin) {
          soundFx.play3dVictoryTrumpet(false);
          soundFx.sendPushNotification(
            `👑 Ludo Champion! You Won ₹${room.prizePool}!`,
            room.winReason || `Room ${room.roomId} victory credited to your wallet!`
          );
          confetti({
            particleCount: 110,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#f59e0b', '#fbbf24', '#10b981', '#34d399', '#ffffff']
          });
        } else {
          soundFx.play3dDefeatTrombone(false);
          const winnerName = room[room.winner]?.username || 'Opponent';
          soundFx.sendPushNotification(
            `🎲 Ludo Match Finished (${room.roomId})`,
            `${winnerName} won the ₹${room.prizePool} pool. Ready for a rematch!`
          );
        }
      }
    }
  }, [room, user]);

  // Poll Active Room State for real-time moves, opponent 3D dice rolls, WebRTC voice signals, presence & chat
  useEffect(() => {
    if (!room) return;
    let active = true;

    const syncRoom = async () => {
      if (
        Date.now() < actionLockUntilRef.current ||
        isRollingLockRef.current ||
        isMovingLockRef.current ||
        stepLoopRunningRef.current ||
        rollingPlayerKeyRef.current !== null
      ) {
        return;
      }
      try {
        const query = user?.uid ? `?uid=${encodeURIComponent(user.uid)}` : '';
        const res = await fetch(`/api/ludo/room/${room.roomId}${query}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !data.success || !data.room) return;
        if (
          Date.now() < actionLockUntilRef.current ||
          isRollingLockRef.current ||
          isMovingLockRef.current ||
          stepLoopRunningRef.current ||
          rollingPlayerKeyRef.current !== null
        ) {
          return;
        }
        const updatedRoom: LudoRoomState = normalizeLudoRoomState(data.room);

        const keys: LudoPlayerKey[] = ['player1', 'player2', 'player3', 'player4'];
        const myRoleNow: LudoPlayerKey =
          keys.find((k) => updatedRoom[k]?.uid === user?.uid) || 'player1';

        // If our mic is active and a new human opponent joined after we turned on the mic, send them a WebRTC offer
        if (user && micEnabled && localStreamRef.current) {
          for (const k of keys) {
            const p = updatedRoom[k];
            if (p && !p.isBot && p.uid !== user.uid && !offeredPeersRef.current.has(p.uid)) {
              offeredPeersRef.current.add(p.uid);
              try {
                const pc = createOrGetPeerConnection(p.uid, updatedRoom.roomId);
                const offer = await pc.createOffer({ offerToReceiveAudio: true });
                await pc.setLocalDescription(offer);
                await fetch(`/api/ludo/room/${updatedRoom.roomId}/voice-signal`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    fromUid: user.uid,
                    toUid: p.uid,
                    type: 'offer',
                    payload: offer
                  })
                });
              } catch {
                // Ignore transient offer error
              }
            }
          }
        }

        // Process incoming WebRTC Voice Signals & Hybrid Audio Chunks addressed to this user
        if (user && updatedRoom.voiceSignals) {
          for (const sig of updatedRoom.voiceSignals) {
            if (sig.toUid === user.uid && !processedSignalsRef.current.has(sig.id)) {
              processedSignalsRef.current.add(sig.id);
              try {
                if (sig.type === 'audio_chunk') {
                  const chunkPayload = sig.payload as { audioData?: string };
                  if (chunkPayload?.audioData) {
                    playIncomingAudioBase64(sig.fromUid, chunkPayload.audioData);
                  }
                  continue;
                }
                if (sig.type === 'voice_phrase') {
                  const phrasePayload = sig.payload as {
                    text?: string;
                    senderName?: string;
                    senderColor?: LudoColor;
                  };
                  if (phrasePayload?.text && !mutedPlayerUids[sig.fromUid]) {
                    setFloatingBubbles((prev) => ({
                      ...prev,
                      [phrasePayload.senderColor || 'yellow']: {
                        text: `🎙️ ${phrasePayload.text}`,
                        ts: Date.now()
                      }
                    }));
                    playTone(720, 110, 'sine', 0.07);
                    speakVoiceOutLoud(phrasePayload.text, 1.06, 1.04);
                  }
                  continue;
                }

                const pc = createOrGetPeerConnection(sig.fromUid, updatedRoom.roomId);
                if (sig.type === 'offer') {
                  offeredPeersRef.current.add(sig.fromUid);
                  await pc.setRemoteDescription(new RTCSessionDescription(sig.payload as RTCSessionDescriptionInit));
                  await flushPendingIceCandidates(sig.fromUid, pc);
                  const answer = await pc.createAnswer();
                  await pc.setLocalDescription(answer);
                  await fetch(`/api/ludo/room/${updatedRoom.roomId}/voice-signal`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      fromUid: user.uid,
                      toUid: sig.fromUid,
                      type: 'answer',
                      payload: answer
                    })
                  });
                } else if (sig.type === 'answer') {
                  await pc.setRemoteDescription(new RTCSessionDescription(sig.payload as RTCSessionDescriptionInit));
                  await flushPendingIceCandidates(sig.fromUid, pc);
                } else if (sig.type === 'ice' && sig.payload) {
                  const candidateInit = sig.payload as RTCIceCandidateInit;
                  if (pc.remoteDescription && pc.remoteDescription.type) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
                  } else {
                    if (!pendingIceCandidatesRef.current[sig.fromUid]) {
                      pendingIceCandidatesRef.current[sig.fromUid] = [];
                    }
                    pendingIceCandidatesRef.current[sig.fromUid].push(candidateInit);
                  }
                }
              } catch {
                // Ignore WebRTC signaling negotiation races
              }
            }
          }
        }

        // Process incoming chat messages & challenger spoken voice replies
        (updatedRoom.chatMessages || []).forEach((msg) => {
          if (!seenChatIdsRef.current.has(msg.id)) {
            seenChatIdsRef.current.add(msg.id);
            if (msg.messageType !== 'system') {
              if (chatEnabled && featureFlags.textChat) {
                setFloatingBubbles((prev) => ({
                  ...prev,
                  [msg.senderColor || 'red']: { text: msg.text, ts: Date.now() }
                }));
              }
              if (msg.senderUid !== user?.uid && !mutedPlayerUids[msg.senderUid]) {
                playTone(660, 140, 'triangle');
                speakChatMessage(msg.text);
                if (!showChatDrawer && chatEnabled && featureFlags.textChat) {
                  setUnreadChatCount((c) => c + 1);
                }
              }
            }
          }
        });

        const incomingPawns = extractPawnsByColorFromRoom(updatedRoom);
        const pawnsChanged = hasPawnPositionDiff(visualPawnsRef.current, incomingPawns);

        // Detect new opponent 3D dice roll event so that opponent's 3D cube rotates continuously for 1.52s!
        if (
          updatedRoom.lastRoll &&
          !seenRollIdsRef.current.has(updatedRoom.lastRoll.rollId)
        ) {
          seenRollIdsRef.current.add(updatedRoom.lastRoll.rollId);
          const rollerKey = updatedRoom.lastRoll.player;
          const rolledVal = updatedRoom.lastRoll.value;
          setConfirmedDiceByPlayer((prev) => ({ ...prev, [rollerKey]: rolledVal }));

          if (rollerKey !== myRoleNow) {
            isRollingLockRef.current = true;
            rollingPlayerKeyRef.current = rollerKey;
            setRollingPlayerKey(rollerKey);

            // If server state also already moved the pawn, hold post-move state until dice lands + token walks!
            if (pawnsChanged) {
              targetPawnsRef.current = incomingPawns;
              deferredRoomAfterMoveRef.current = updatedRoom;
            } else {
              setRoom(updatedRoom);
            }

            // 3D dice flip sound effects synchronized with the 1.52s multi-axis rotation
            playDiceFlipSound();
            setTimeout(() => {
              if (!active) return;
              rollingPlayerKeyRef.current = null;
              isRollingLockRef.current = false;
              setRollingPlayerKey((curr) => (curr === rollerKey ? null : curr));
              playTone(rolledVal === 6 ? 840 : 560, 170, 'sine', 0.08);
              startOrContinueTokenWalk();
            }, DICE_ROLL_DURATION_MS);
            return;
          }
        }

        // If any token position changed on the server, walk it step-by-step BEFORE updating turn state!
        if (pawnsChanged) {
          targetPawnsRef.current = incomingPawns;
          deferredRoomAfterMoveRef.current = updatedRoom;
          startOrContinueTokenWalk();
          return;
        }

        if (roomRef.current?.status === 'waiting' && updatedRoom.status === 'playing') {
          const keys: LudoPlayerKey[] = ['player1', 'player2', 'player3', 'player4'];
          const humanOpponent = keys
            .map((k) => updatedRoom[k])
            .find((p) => p && !p.isBot && p.uid !== user?.uid);
          if (humanOpponent) {
            setMatchedRealOpponent({
              name: humanOpponent.username,
              loc: humanOpponent.location,
              flag: humanOpponent.flag || getFlagForLocation(humanOpponent.location)
            });
            setShowRealMatchCelebration(true);
            playTone(880, 240, 'sine');
            setTimeout(() => setShowRealMatchCelebration(false), 2600);
          }
        }

        setRoom(updatedRoom);
        checkAndSettleFinishedRoom(updatedRoom);
      } catch {
        // Ignore transient fetch errors
      }
    };

    const interval = setInterval(syncRoom, 550);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [
    room?.roomId,
    user,
    micEnabled,
    mutedPlayerUids,
    featureFlags.textChat,
    chatEnabled,
    showChatDrawer,
    playTone,
    playDiceFlipSound,
    speakChatMessage,
    speakVoiceOutLoud,
    playIncomingAudioBase64,
    flushPendingIceCandidates,
    createOrGetPeerConnection,
    extractPawnsByColorFromRoom,
    hasPawnPositionDiff,
    startOrContinueTokenWalk,
    checkAndSettleFinishedRoom
  ]);

  // Central Real-Time 2-Device Matchmaking Queue Listener (/ludo_matchmaking/{stake} & /ludo_user_match/{uid})
  useEffect(() => {
    if (!room || room.status !== 'waiting' || room.isPrivate || !user?.uid) return;
    const stakeKey = String(room.entryFee || selectedEntry || 50);
    let unsubQueue: (() => void) | null = null;
    let unsubUserMatch: (() => void) | null = null;
    let isMatched = false;

    const transitionToMatchedRoom = async (targetRoomId: string) => {
      if (isMatched) return;
      isMatched = true;
      try {
        const snap = await rtdbGet(rtdbRef(rtdb, `ludo_rooms/${targetRoomId}`));
        if (snap.exists()) {
          const matchedRoom = normalizeLudoRoomState(snap.val());
          const opp =
            matchedRoom.player1.uid === user.uid ? matchedRoom.player2 : matchedRoom.player1;
          if (opp) {
            setMatchedRealOpponent({
              name: opp.username,
              loc: opp.location || 'India',
              flag: opp.flag || '🇮🇳'
            });
            setShowRealMatchCelebration(true);
            playTone(880, 240, 'sine');
            setTimeout(() => setShowRealMatchCelebration(false), 2600);
          }
          syncVisualPawnsFromRoom(matchedRoom);
          setRoom(matchedRoom);
        }
      } catch {}
    };

    try {
      // 1. Listen for direct match notification on /ludo_user_match/{uid}
      unsubUserMatch = rtdbOnValue(
        rtdbRef(rtdb, `ludo_user_match/${user.uid}`),
        (snap) => {
          if (!snap.exists()) return;
          const matchData = snap.val();
          if (matchData?.roomId && Date.now() - (matchData.matchedAt || 0) < 30000) {
            rtdbRemove(rtdbRef(rtdb, `ludo_user_match/${user.uid}`)).catch(() => {});
            void transitionToMatchedRoom(String(matchData.roomId));
          }
        },
        () => {}
      );

      // 2. Listen to /ludo_matchmaking/{stake} for 2 active players at the same stake
      unsubQueue = rtdbOnValue(
        rtdbRef(rtdb, `ludo_matchmaking/${stakeKey}`),
        (snap) => {
          if (!snap.exists() || isMatched) return;
          const entriesMap = snap.val() as Record<
            string,
            {
              uid: string;
              username: string;
              location: string;
              flag?: string;
              stake: number;
              roomId?: string;
              joinedAt: number;
            }
          >;
          const now = Date.now();
          const activePlayers = Object.values(entriesMap || {})
            .filter((e) => e && e.uid && now - (e.joinedAt || 0) < 60000)
            .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0) || a.uid.localeCompare(b.uid));

          if (activePlayers.length >= 2) {
            const p1Entry = activePlayers[0];
            const p2Entry = activePlayers[1];
            if (p1Entry.uid !== user.uid && p2Entry.uid !== user.uid) return;

            const sharedRoomId =
              p1Entry.roomId || `LUDO${Math.floor(1000 + Math.random() * 9000)}`;

            // Deterministic leader (p1Entry) creates the room and removes both from queue
            if (p1Entry.uid === user.uid) {
              isMatched = true;
              const fee = Number(stakeKey) || 50;
              const totalPool = fee * 2;
              const houseCut = Math.round(totalPool * 0.1 * 100) / 100;
              const prizePool = Math.round((totalPool - houseCut) * 100) / 100;

              const newMatchedRoom = normalizeLudoRoomState({
                roomId: sharedRoomId,
                hostUid: p1Entry.uid,
                stake: fee,
                entryFee: fee,
                maxPlayers: 2,
                seatOrder: ['player1', 'player2'],
                prizePool,
                houseMargin: houseCut,
                isPrivate: false,
                status: 'playing',
                players: { p1: p1Entry.uid, p2: p2Entry.uid },
                currentTurn: p1Entry.uid,
                turn: 'player1',
                boardState: {
                  p1: [0, 0, 0, 0],
                  p2: [0, 0, 0, 0]
                },
                player1: {
                  uid: p1Entry.uid,
                  username: p1Entry.username || 'Player 1',
                  location: p1Entry.location || 'India',
                  flag: p1Entry.flag || '🇮🇳',
                  color: 'red',
                  pawns: [0, 0, 0, 0],
                  score: 0,
                  captures: 0,
                  homeCount: 0,
                  movesLeft: 30,
                  lastDice: null,
                  consecutiveSixes: 0,
                  isBot: false,
                  lastActiveAt: now
                },
                player2: {
                  uid: p2Entry.uid,
                  username: p2Entry.username || 'Player 2',
                  location: p2Entry.location || 'India',
                  flag: p2Entry.flag || '🇮🇳',
                  color: 'yellow',
                  pawns: [0, 0, 0, 0],
                  score: 0,
                  captures: 0,
                  homeCount: 0,
                  movesLeft: 30,
                  lastDice: null,
                  consecutiveSixes: 0,
                  isBot: false,
                  lastActiveAt: now
                },
                diceValue: null,
                hasRolled: false,
                movablePawns: [],
                lastAction: `Match started! ${p1Entry.username}'s turn to roll the 3D dice.`,
                winner: null,
                chatMessages: [],
                createdAt: now,
                updatedAt: now
              });

              rtdbSet(rtdbRef(rtdb, `ludo_rooms/${sharedRoomId}`), newMatchedRoom)
                .then(() => {
                  rtdbRemove(rtdbRef(rtdb, `ludo_matchmaking/${stakeKey}/${p1Entry.uid}`)).catch(() => {});
                  rtdbRemove(rtdbRef(rtdb, `ludo_matchmaking/${stakeKey}/${p2Entry.uid}`)).catch(() => {});
                  rtdbSet(rtdbRef(rtdb, `ludo_user_match/${p1Entry.uid}`), {
                    roomId: sharedRoomId,
                    matchedAt: now
                  }).catch(() => {});
                  rtdbSet(rtdbRef(rtdb, `ludo_user_match/${p2Entry.uid}`), {
                    roomId: sharedRoomId,
                    matchedAt: now
                  }).catch(() => {});
                  setMatchedRealOpponent({
                    name: p2Entry.username,
                    loc: p2Entry.location || 'India',
                    flag: p2Entry.flag || '🇮🇳'
                  });
                  setShowRealMatchCelebration(true);
                  playTone(880, 240, 'sine');
                  setTimeout(() => setShowRealMatchCelebration(false), 2600);
                  syncVisualPawnsFromRoom(newMatchedRoom);
                  setRoom(newMatchedRoom);
                })
                .catch(() => {});
            }
          }
        },
        () => {}
      );
    } catch {}

    return () => {
      if (unsubQueue) unsubQueue();
      if (unsubUserMatch) unsubUserMatch();
      if (user?.uid) {
        rtdbRemove(rtdbRef(rtdb, `ludo_matchmaking/${stakeKey}/${user.uid}`)).catch(() => {});
      }
    };
  }, [
    room?.roomId,
    room?.status,
    room?.isPrivate,
    room?.entryFee,
    selectedEntry,
    user?.uid,
    normalizeLudoRoomState,
    syncVisualPawnsFromRoom,
    playTone
  ]);

  // 1vs1 Real User Matchmaking Countdown & Safe Fallback to Challenger without crashing board
  useEffect(() => {
    if (!room || room.status !== 'waiting' || room.isPrivate) {
      setMatchmakingCountdown(10);
      return;
    }

    setMatchmakingCountdown(10);
    setMatchmakingStatusText('Scanning /ludo_matchmaking queue for real 1v1 players online...');

    const interval = setInterval(() => {
      setMatchmakingCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (user?.uid) {
            const stakeKey = String(room.entryFee || 50);
            rtdbRemove(rtdbRef(rtdb, `ludo_matchmaking/${stakeKey}/${user.uid}`)).catch(() => {});
          }
          setMatchmakingStatusText('Connecting to table...');
          fetch(`/api/ludo/room/${room.roomId}/pair-instant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
            .then((res) => res.json())
            .then((data) => {
              if (data && data.success && data.room) {
                const safePaired = normalizeLudoRoomState(data.room);
                safePaired.chatMessages.forEach((m: LudoChatMessage) => seenChatIdsRef.current.add(m.id));
                syncVisualPawnsFromRoom(safePaired);
                setRoom(safePaired);
                rtdbSet(rtdbRef(rtdb, `ludo_rooms/${safePaired.roomId}`), safePaired).catch(() => {});
                playTone(580, 180, 'sine');
              } else {
                pairLocalWaitingRoomWithChallenger(room);
              }
            })
            .catch(() => {
              pairLocalWaitingRoomWithChallenger(room);
            });
          return 0;
        }

        const nextVal = prev - 1;
        if (nextVal >= 7) {
          setMatchmakingStatusText('Scanning /ludo_matchmaking queue for real 1vs1 players online...');
        } else if (nextVal >= 4) {
          setMatchmakingStatusText(`Checking 1vs1 real player queue at ₹${room.entryFee} stake...`);
        } else {
          setMatchmakingStatusText('Preparing 3D Ludo Royale board...');
        }
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    room?.roomId,
    room?.status,
    room?.isPrivate,
    room?.entryFee,
    user?.uid,
    playTone,
    normalizeLudoRoomState,
    syncVisualPawnsFromRoom
  ]);

  // Helper to pair a waiting room with realistic Challenger(s) via RTDB / client engine with pre-initialized [0,0,0,0] tokens
  const pairLocalWaitingRoomWithChallenger = useCallback(
    (targetRoom: LudoRoomState) => {
      if (!targetRoom || targetRoom.status !== 'waiting') return;
      const challengerPool = [
        { name: 'Aarav_777', loc: 'Mumbai, IN', flag: '🇮🇳' },
        { name: 'Vikram_Pro', loc: 'Delhi, IN', flag: '🇮🇳' },
        { name: 'Rohan_King', loc: 'Bengaluru, IN', flag: '🇮🇳' },
        { name: 'Kabir_Win', loc: 'Jaipur, IN', flag: '🇮🇳' },
        { name: 'Aditya_Roy', loc: 'Pune, IN', flag: '🇮🇳' },
        { name: 'Dev_Master', loc: 'Hyderabad, IN', flag: '🇮🇳' }
      ];
      const maxP = targetRoom.maxPlayers || 2;
      const now = Date.now();
      const seatColors: Record<LudoPlayerKey, LudoColor> = {
        player1: 'red',
        player2: maxP === 2 ? 'yellow' : 'green',
        player3: 'yellow',
        player4: 'blue'
      };
      const seatOrder: LudoPlayerKey[] =
        maxP === 2
          ? ['player1', 'player2']
          : maxP === 3
          ? ['player1', 'player2', 'player3']
          : ['player1', 'player2', 'player3', 'player4'];

      const updated: LudoRoomState = normalizeLudoRoomState(targetRoom);
      updated.seatOrder = seatOrder;

      seatOrder.forEach((seatKey, idx) => {
        if (seatKey === 'player1') return;
        if (!updated[seatKey]) {
          const pick = challengerPool[(now + idx * 7) % challengerPool.length];
          updated[seatKey] = {
            uid: `bot_${pick.name.toLowerCase()}_${now.toString(36).slice(-3)}`,
            username: pick.name,
            location: pick.loc,
            flag: pick.flag,
            color: seatColors[seatKey],
            pawns: [0, 0, 0, 0],
            score: 0,
            captures: 0,
            homeCount: 0,
            movesLeft: 30,
            lastDice: null,
            consecutiveSixes: 0,
            isBot: true,
            lastActiveAt: now
          };
        }
      });

      updated.status = 'playing';
      updated.turn = 'player1';
      updated.currentTurn = updated.player1.uid;
      updated.players = {
        p1: updated.player1.uid,
        ...(updated.player2 ? { p2: updated.player2.uid } : {})
      };
      updated.boardState = {
        p1: updated.player1.pawns,
        p2: updated.player2 ? updated.player2.pawns : [0, 0, 0, 0]
      };
      updated.hasRolled = false;
      updated.diceValue = null;
      updated.movablePawns = [];
      updated.chatMessages = updated.chatMessages || [];
      updated.updatedAt = now;
      updated.lastAction = `Match started! ${updated.player1.username}'s turn to roll the 3D dice.`;

      const safeNormalized = normalizeLudoRoomState(updated);
      syncVisualPawnsFromRoom(safeNormalized);
      setRoom(safeNormalized);
      rtdbSet(rtdbRef(rtdb, `ludo_rooms/${safeNormalized.roomId}`), safeNormalized).catch(() => {});
      playTone(620, 180, 'sine');
    },
    [playTone, normalizeLudoRoomState, syncVisualPawnsFromRoom]
  );

  // Firebase Realtime Database (/ludo_rooms/{roomId}) live listener for instant 2-device synchronization
  useEffect(() => {
    if (!room?.roomId) return;
    let unsub: (() => void) | null = null;
    try {
      unsub = rtdbOnValue(
        rtdbRef(rtdb, `ludo_rooms/${room.roomId}`),
        (snap) => {
          if (!snap.exists()) return;
          const rawRemote = snap.val();
          if (!rawRemote || !rawRemote.roomId) return;
          const remoteRoom = normalizeLudoRoomState(rawRemote);

          const wasWaiting = roomRef.current?.status === 'waiting';
          const isNewer =
            remoteRoom.updatedAt > (roomRef.current?.updatedAt || 0) ||
            (wasWaiting && remoteRoom.status === 'playing');

          if (isNewer) {
            if (wasWaiting && remoteRoom.status === 'playing' && remoteRoom.player2) {
              const opp =
                remoteRoom.player1.uid === user?.uid ? remoteRoom.player2 : remoteRoom.player1;
              if (opp && !opp.isBot) {
                setMatchedRealOpponent({
                  name: opp.username,
                  loc: opp.location || 'India',
                  flag: opp.flag || '🇮🇳'
                });
                setShowRealMatchCelebration(true);
                playTone(880, 240, 'sine');
                setTimeout(() => setShowRealMatchCelebration(false), 2600);
              }
            }

            if (
              !isRollingLockRef.current &&
              !isMovingLockRef.current &&
              !stepLoopRunningRef.current
            ) {
              syncVisualPawnsFromRoom(remoteRoom);
              setRoom(remoteRoom);
              checkAndSettleFinishedRoom(remoteRoom);
            }
          }
        },
        () => {}
      );
    } catch {}
    return () => {
      if (unsub) unsub();
    };
  }, [room?.roomId, user?.uid, normalizeLudoRoomState, syncVisualPawnsFromRoom, checkAndSettleFinishedRoom, playTone]);

  // Automatic Challenger Turn Executor when playing on client/RTDB fallback (if backend hasn't acted within 1.9s)
  useEffect(() => {
    if (!room || room.status !== 'playing') return;
    const currentTurnKey = room.turn;
    const activeBot = room[currentTurnKey];
    if (!activeBot || !activeBot.isBot) return;

    const timer = setTimeout(() => {
      const cur = roomRef.current;
      if (!cur || cur.status !== 'playing' || cur.turn !== currentTurnKey) return;
      const botPlayer = cur[currentTurnKey];
      if (!botPlayer || !botPlayer.isBot) return;
      if (isRollingLockRef.current || isMovingLockRef.current || stepLoopRunningRef.current) return;

      // Roll dice for Challenger
      const rolled = Math.floor(Math.random() * 6) + 1;
      isRollingLockRef.current = true;
      rollingPlayerKeyRef.current = currentTurnKey;
      setRollingPlayerKey(currentTurnKey);
      setConfirmedDiceByPlayer((prev) => ({ ...prev, [currentTurnKey]: rolled }));
      playDiceFlipSound();

      setTimeout(() => {
        rollingPlayerKeyRef.current = null;
        isRollingLockRef.current = false;
        setRollingPlayerKey(null);

        const latest = roomRef.current;
        if (!latest || latest.status !== 'playing' || latest.turn !== currentTurnKey) return;
        const bPlayer = latest[currentTurnKey];
        if (!bPlayer) return;

        const movables = computeClientMovablePawns(bPlayer.pawns, rolled);
        if (movables.length === 0) {
          const nextState: LudoRoomState = JSON.parse(JSON.stringify(latest));
          const bp = nextState[currentTurnKey]!;
          bp.movesLeft = Math.max(0, bp.movesLeft - 1);
          bp.lastDice = rolled;
          nextState.diceValue = null;
          nextState.hasRolled = false;
          nextState.movablePawns = [];
          const order: LudoPlayerKey[] = nextState.seatOrder || ['player1', 'player2'];
          const startIdx = Math.max(0, order.indexOf(currentTurnKey));
          for (let offset = 1; offset <= order.length; offset++) {
            const candKey = order[(startIdx + offset) % order.length];
            if (nextState[candKey] && nextState[candKey]!.movesLeft > 0) {
              nextState.turn = candKey;
              break;
            }
          }
          nextState.updatedAt = Date.now();
          setRoom(nextState);
          rtdbSet(rtdbRef(rtdb, `ludo_rooms/${nextState.roomId}`), nextState).catch(() => {});
          return;
        }

        // Pick best pawn for Challenger (prefer capture, home goal, or advancing active pawn)
        let chosenPawn = movables[0];
        for (const pIdx of movables) {
          const curStep = bPlayer.pawns[pIdx];
          if (curStep + rolled === 57) {
            chosenPawn = pIdx;
            break;
          }
          if (curStep === 0 && rolled === 6) {
            chosenPawn = pIdx;
          }
        }

        const tempWithRoll: LudoRoomState = {
          ...latest,
          diceValue: rolled,
          hasRolled: true,
          movablePawns: movables
        };
        const movedRoom = applyLocalPawnMove(tempWithRoll, currentTurnKey, chosenPawn);
        targetPawnsRef.current = extractPawnsByColorFromRoom(movedRoom);
        deferredRoomAfterMoveRef.current = movedRoom;
        rtdbSet(rtdbRef(rtdb, `ludo_rooms/${movedRoom.roomId}`), movedRoom).catch(() => {});
        startOrContinueTokenWalk();
      }, DICE_ROLL_DURATION_MS);
    }, 1900);

    return () => clearTimeout(timer);
  }, [
    room?.roomId,
    room?.status,
    room?.turn,
    room?.updatedAt,
    playDiceFlipSound,
    computeClientMovablePawns,
    applyLocalPawnMove,
    extractPawnsByColorFromRoom,
    startOrContinueTokenWalk
  ]);

  // Dedicated Active Match Heartbeat: Maintains connection on backend & handles reconnection/auto-win results
  useEffect(() => {
    if (!room || room.status !== 'playing' || !user?.uid) return;
    let active = true;

    const emitHeartbeat = async () => {
      try {
        const res = await fetch(`/api/ludo/room/${room.roomId}/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid })
        });
        if (!res.ok || !active) return;
        const data = await res.json();
        if (data.success && data.room) {
          // If match finished (e.g. automatic win from timeout or opponent disconnect), settle match
          if (data.room.status === 'finished') {
            setRoom(data.room);
            checkAndSettleFinishedRoom(data.room);
          } else if (data.disconnectInfo !== undefined) {
            setRoom((prev) => (prev ? { ...prev, disconnectInfo: data.disconnectInfo } : prev));
          }
        }
      } catch {
        // Network transient error
      }
    };

    emitHeartbeat();
    const hbInterval = setInterval(emitHeartbeat, 3000);
    return () => {
      active = false;
      clearInterval(hbInterval);
    };
  }, [room?.roomId, room?.status, user?.uid, checkAndSettleFinishedRoom]);

  // Scroll chat to bottom when drawer is opened
  useEffect(() => {
    if (showChatDrawer) {
      setUnreadChatCount(0);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showChatDrawer, room?.chatMessages?.length]);

  const handleToggleChatEnabled = () => {
    const next = !chatEnabled;
    setChatEnabled(next);
    if (!next) {
      setShowChatDrawer(false);
      setFloatingBubbles({});
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      showToast('Live Chat turned OFF', 'info');
    } else {
      showToast('Live Chat turned ON', 'success');
    }
  };

  // Resume an existing active or waiting match without re-charging entry stake
  const handleResumeRoom = (targetRoom: LudoRoomState) => {
    const safeRoom = normalizeLudoRoomState(targetRoom);
    isRollingLockRef.current = false;
    isMovingLockRef.current = false;
    rollingPlayerKeyRef.current = null;
    actionLockUntilRef.current = 0;
    seenChatIdsRef.current.clear();
    safeRoom.chatMessages.forEach((m: LudoChatMessage) => seenChatIdsRef.current.add(m.id));
    if (safeRoom.lastRoll?.rollId) {
      seenRollIdsRef.current.add(safeRoom.lastRoll.rollId);
    }
    syncVisualPawnsFromRoom(safeRoom);
    setStepTrail([]);
    setShowForfeitConfirm(false);
    setRoom(safeRoom);
    showToast(`Resumed Room ${safeRoom.roomId}`, 'success');
  };

  // Cancel Waiting Room & Refund Entry Fee Safely
  const handleCancelWaitingRoom = async () => {
    if (!room || !user || room.status !== 'waiting') {
      setRoom(null);
      return;
    }
    let refundedViaApi = false;
    try {
      const res = await fetch(`/api/ludo/room/${room.roomId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });
      const data = await res.json();
      if (data.success && data.newlyRefunded && !refundedRoomIdsRef.current.has(room.roomId)) {
        refundedViaApi = true;
        refundedRoomIdsRef.current.add(room.roomId);
        store.recordGamePayout(
          user.uid,
          data.refundAmount || room.entryFee,
          'Ludo Table Cancelled Refund',
          data.refundTxId || `refund_${room.roomId}`
        );
        showToast(`Room ${room.roomId} cancelled. ₹${room.entryFee} refunded to wallet.`, 'info');
      }
    } catch {
      // Fallback refund if created via RTDB / offline engine
    } finally {
      if (!refundedViaApi && !refundedRoomIdsRef.current.has(room.roomId)) {
        refundedRoomIdsRef.current.add(room.roomId);
        store.recordGamePayout(
          user.uid,
          room.entryFee,
          'Ludo Table Cancelled Refund',
          `refund_${room.roomId}`
        );
        showToast(`Room ${room.roomId} cancelled. ₹${room.entryFee} refunded to wallet.`, 'info');
      }
      setRoom(null);
      setRecoverableRoom(null);
    }
  };

  // Forfeit Active Match Safely
  const handleForfeitActiveMatch = async () => {
    if (!room || !user) return;
    setShowForfeitConfirm(false);
    try {
      const res = await fetch(`/api/ludo/room/${room.roomId}/forfeit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });
      const data = await res.json();
      if (data.success && data.room) {
        const safeRoom = normalizeLudoRoomState(data.room);
        setRoom(safeRoom);
        rtdbSet(rtdbRef(rtdb, `ludo_rooms/${safeRoom.roomId}`), safeRoom).catch(() => {});
        showToast('You forfeited the match.', 'info');
        return;
      }
    } catch {}
    const winnerRole: LudoPlayerKey = room.player1.uid === user.uid ? 'player2' : 'player1';
    const forfeitedRoom = normalizeLudoRoomState({
      ...room,
      status: 'finished',
      winner: winnerRole,
      winReason: `${user.username} forfeited the match`,
      updatedAt: Date.now()
    });
    setRoom(forfeitedRoom);
    rtdbSet(rtdbRef(rtdb, `ludo_rooms/${forfeitedRoom.roomId}`), forfeitedRoom).catch(() => {});
    showToast('You forfeited the match.', 'info');
  };

  // Start or Join a Room via Firebase Realtime Database (/ludo_matchmaking/{stake} & /ludo_rooms/{roomCode})
  const handleCreateOrJoinRoom = async (
    mode: 'quick_live' | 'create_private' | 'join_code',
    customCode?: string,
    customFee?: number,
    customMaxPlayers?: 2 | 3 | 4
  ) => {
    if (!user) {
      showToast('Please log in to play Ludo Battle.', 'error');
      return;
    }
    if (isJoiningRoom) return;

    // Read live balance from active user state and Realtime Database users/{uid}/balance
    const liveU = store.getUser(user.uid) || (user.phone ? store.findUserByPhone(user.phone) : undefined) || user;
    let rtdbBal = 0;
    try {
      const balSnap = await rtdbGet(rtdbRef(rtdb, `users/${user.uid}/balance`));
      if (balSnap.exists() && Number.isFinite(Number(balSnap.val()))) {
        rtdbBal = Number(balSnap.val());
      }
    } catch {}
    const availableBal = Math.max(liveU?.balance || 0, user.balance || 0, rtdbBal);
    const feeToCharge = customFee || selectedEntry;
    const playersCount = customMaxPlayers || selectedMaxPlayers;

    const rawCodeInput = (customCode || joinCodeInput || '').trim().toUpperCase();
    // Normalize LUD0 (digit zero) <-> LUDO (letter O) so codes like LUD03547 and LUDO3547 always match
    const normalizedCanonicalCode = rawCodeInput.replace(/^LUD0/, 'LUDO');
    const alternateZeroCode = normalizedCanonicalCode.replace(/^LUDO/, 'LUD0');

    if (mode === 'join_code' && !rawCodeInput) {
      showToast('Please enter a valid Room Code.', 'error');
      return;
    }

    setIsJoiningRoom(true);
    try {
      const now = Date.now();
      let finalRoom: LudoRoomState | null = null;
      let newlyStaked = true;
      let stakeTxId: string | undefined;
      let isRealMatch = false;
      let opponentName: string | undefined;
      let opponentLocation: string | undefined;
      let opponentFlag: string | undefined;

      // =========================================================================
      // MODE 1: JOIN PRIVATE ROOM BY CODE (/ludo_rooms/{roomCode})
      // =========================================================================
      if (mode === 'join_code') {
        let targetRemoteRoom: LudoRoomState | null = null;

        // 1. Check direct RTDB path /ludo_rooms/{code} (both LUDOxxxx and LUD0xxxx)
        try {
          const directSnap = await rtdbGet(rtdbRef(rtdb, `ludo_rooms/${normalizedCanonicalCode}`));
          if (directSnap.exists()) {
            targetRemoteRoom = normalizeLudoRoomState(directSnap.val());
          } else {
            const altSnap = await rtdbGet(rtdbRef(rtdb, `ludo_rooms/${alternateZeroCode}`));
            if (altSnap.exists()) {
              targetRemoteRoom = normalizeLudoRoomState(altSnap.val());
            } else {
              const allSnap = await rtdbGet(rtdbRef(rtdb, 'ludo_rooms'));
              if (allSnap.exists()) {
                const allRooms = allSnap.val() as Record<string, any>;
                for (const r of Object.values(allRooms || {})) {
                  if (!r || !r.roomId) continue;
                  const rCode = String(r.roomId).toUpperCase().replace(/^LUD0/, 'LUDO');
                  if (rCode === normalizedCanonicalCode) {
                    targetRemoteRoom = normalizeLudoRoomState(r);
                    break;
                  }
                }
              }
            }
          }
        } catch {}

        // 2. Also check local API server if not found in RTDB
        if (!targetRemoteRoom) {
          try {
            const res = await fetch('/api/ludo/room/create-or-join', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: user.uid,
                username: user.username,
                location: playerLocation,
                entryFee: feeToCharge,
                maxPlayers: playersCount,
                mode: 'join_code',
                roomCode: normalizedCanonicalCode
              })
            });
            const data = await res.json();
            if (res.ok && data.success && data.room) {
              targetRemoteRoom = normalizeLudoRoomState(data.room);
              newlyStaked = data.newlyStaked !== false;
              stakeTxId = data.stakeTxId;
            }
          } catch {}
        }

        if (!targetRemoteRoom) {
          showToast(`Private Room "${rawCodeInput}" not found. Check the code on Device 1.`, 'error');
          setIsJoiningRoom(false);
          return;
        }

        const roomStake = Number(targetRemoteRoom.stake ?? targetRemoteRoom.entryFee) || feeToCharge;
        if (availableBal < roomStake) {
          showToast(`Insufficient wallet balance to join ₹${roomStake} room.`, 'error');
          onOpenDeposit();
          setIsJoiningRoom(false);
          return;
        }

        // If user is already in this room, resume it
        if (targetRemoteRoom.player1.uid === user.uid || targetRemoteRoom.player2?.uid === user.uid) {
          newlyStaked = false;
          finalRoom = targetRemoteRoom;
        } else {
          if (targetRemoteRoom.status !== 'waiting') {
            showToast(`Room ${targetRemoteRoom.roomId} is already full or in progress.`, 'error');
            setIsJoiningRoom(false);
            return;
          }

          // Deduct stake atomically via rtdbRunTransaction on users/{uid}/balance
          try {
            await rtdbRunTransaction(rtdbRef(rtdb, `users/${user.uid}/balance`), (currBal) => {
              const b = Number(currBal);
              const base = Number.isFinite(b) && b >= roomStake ? b : availableBal;
              return Math.max(0, Math.round((base - roomStake) * 100) / 100);
            });
          } catch {}

          const p2Color: LudoColor = (targetRemoteRoom.maxPlayers || 2) === 2 ? 'yellow' : 'green';
          const joinedRoom = normalizeLudoRoomState({
            ...targetRemoteRoom,
            stake: roomStake,
            entryFee: roomStake,
            status: 'playing',
            turn: 'player1',
            currentTurn: targetRemoteRoom.player1.uid,
            players: {
              p1: targetRemoteRoom.player1.uid,
              p2: user.uid
            },
            boardState: {
              p1: targetRemoteRoom.player1.pawns || [0, 0, 0, 0],
              p2: [0, 0, 0, 0]
            },
            player2: {
              uid: user.uid,
              username: user.username,
              location: playerLocation,
              flag: '🇮🇳',
              color: p2Color,
              pawns: [0, 0, 0, 0],
              score: 0,
              captures: 0,
              homeCount: 0,
              movesLeft: 30,
              lastDice: null,
              consecutiveSixes: 0,
              isBot: false,
              lastActiveAt: now
            },
            diceValue: null,
            hasRolled: false,
            movablePawns: [],
            lastAction: `${user.username} joined Room ${targetRemoteRoom.roomId}! ${targetRemoteRoom.player1.username}'s turn to roll.`,
            updatedAt: now
          });

          await rtdbSet(rtdbRef(rtdb, `ludo_rooms/${joinedRoom.roomId}`), joinedRoom).catch(() => {});
          finalRoom = joinedRoom;
          isRealMatch = true;
          opponentName = joinedRoom.player1.username;
          opponentLocation = joinedRoom.player1.location;
          opponentFlag = joinedRoom.player1.flag || '🇮🇳';
        }
      }

      // =========================================================================
      // MODE 2: CREATE PRIVATE ROOM (/ludo_rooms/{roomCode})
      // =========================================================================
      else if (mode === 'create_private') {
        if (availableBal < feeToCharge) {
          showToast(`Insufficient wallet balance. Required: ₹${feeToCharge}`, 'error');
          onOpenDeposit();
          setIsJoiningRoom(false);
          return;
        }

        // Deduct stake via rtdbRunTransaction on users/{uid}/balance
        try {
          await rtdbRunTransaction(rtdbRef(rtdb, `users/${user.uid}/balance`), (currBal) => {
            const b = Number(currBal);
            const base = Number.isFinite(b) && b >= feeToCharge ? b : availableBal;
            return Math.max(0, Math.round((base - feeToCharge) * 100) / 100);
          });
        } catch {}

        let generatedCode = `LUDO${Math.floor(1000 + Math.random() * 9000)}`;
        try {
          const res = await fetch('/api/ludo/room/create-or-join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: user.uid,
              username: user.username,
              location: playerLocation,
              entryFee: feeToCharge,
              maxPlayers: playersCount,
              mode: 'create_private'
            })
          });
          const data = await res.json();
          if (res.ok && data.success && data.room?.roomId) {
            generatedCode = String(data.room.roomId).toUpperCase().replace(/^LUD0/, 'LUDO');
            stakeTxId = data.stakeTxId;
          }
        } catch {}

        const totalPool = feeToCharge * playersCount;
        const houseCut = Math.round(totalPool * 0.1 * 100) / 100;
        const prizePool = Math.round((totalPool - houseCut) * 100) / 100;

        const privateRoom = normalizeLudoRoomState({
          roomId: generatedCode,
          hostUid: user.uid,
          stake: feeToCharge,
          entryFee: feeToCharge,
          maxPlayers: playersCount,
          seatOrder: ['player1', 'player2'],
          prizePool,
          houseMargin: houseCut,
          isPrivate: true,
          status: 'waiting',
          players: { p1: user.uid },
          currentTurn: user.uid,
          boardState: {
            p1: [0, 0, 0, 0],
            p2: [0, 0, 0, 0]
          },
          player1: {
            uid: user.uid,
            username: user.username,
            location: playerLocation,
            flag: '🇮🇳',
            color: 'red',
            pawns: [0, 0, 0, 0],
            score: 0,
            captures: 0,
            homeCount: 0,
            movesLeft: 30,
            lastDice: null,
            consecutiveSixes: 0,
            isBot: false,
            lastActiveAt: now
          },
          player2: null,
          turn: 'player1',
          diceValue: null,
          hasRolled: false,
          movablePawns: [],
          lastAction: 'Waiting for friend to enter Private Room Code...',
          winner: null,
          chatMessages: [],
          createdAt: now,
          updatedAt: now
        });

        // ALWAYS write Private Room to /ludo_rooms/{roomCode} in Firebase Realtime Database!
        await rtdbSet(rtdbRef(rtdb, `ludo_rooms/${privateRoom.roomId}`), privateRoom).catch(() => {});
        finalRoom = privateRoom;
      }

      // =========================================================================
      // MODE 3: PLAY 2P LUDO LIVE MATCHMAKING (/ludo_matchmaking/{stake})
      // =========================================================================
      else {
        if (availableBal < feeToCharge) {
          showToast(`Insufficient wallet balance. Required: ₹${feeToCharge}`, 'error');
          onOpenDeposit();
          setIsJoiningRoom(false);
          return;
        }

        // Deduct stake atomically via rtdbRunTransaction on users/{uid}/balance
        try {
          await rtdbRunTransaction(rtdbRef(rtdb, `users/${user.uid}/balance`), (currBal) => {
            const b = Number(currBal);
            const base = Number.isFinite(b) && b >= feeToCharge ? b : availableBal;
            return Math.max(0, Math.round((base - feeToCharge) * 100) / 100);
          });
        } catch {}

        const stakeKey = String(feeToCharge);
        let matchedOpponentEntry: any = null;

        // Check if another player is already waiting in /ludo_matchmaking/{stake}
        try {
          const queueSnap = await rtdbGet(rtdbRef(rtdb, `ludo_matchmaking/${stakeKey}`));
          if (queueSnap.exists()) {
            const entries = queueSnap.val() as Record<string, any>;
            for (const cand of Object.values(entries || {})) {
              if (cand && cand.uid && cand.uid !== user.uid && now - (cand.joinedAt || 0) < 60000) {
                matchedOpponentEntry = cand;
                break;
              }
            }
          }
        } catch {}

        if (matchedOpponentEntry) {
          // Immediately create shared room in /ludo_rooms/{roomId} and notify both players!
          const sharedRoomId =
            matchedOpponentEntry.roomId || `LUDO${Math.floor(1000 + Math.random() * 9000)}`;
          const totalPool = feeToCharge * 2;
          const houseCut = Math.round(totalPool * 0.1 * 100) / 100;
          const prizePool = Math.round((totalPool - houseCut) * 100) / 100;

          const activeMatchRoom = normalizeLudoRoomState({
            roomId: sharedRoomId,
            hostUid: matchedOpponentEntry.uid,
            stake: feeToCharge,
            entryFee: feeToCharge,
            maxPlayers: 2,
            seatOrder: ['player1', 'player2'],
            prizePool,
            houseMargin: houseCut,
            isPrivate: false,
            status: 'playing',
            players: {
              p1: matchedOpponentEntry.uid,
              p2: user.uid
            },
            currentTurn: matchedOpponentEntry.uid,
            turn: 'player1',
            boardState: {
              p1: [0, 0, 0, 0],
              p2: [0, 0, 0, 0]
            },
            player1: {
              uid: matchedOpponentEntry.uid,
              username: matchedOpponentEntry.username || 'Player 1',
              location: matchedOpponentEntry.location || 'India',
              flag: matchedOpponentEntry.flag || '🇮🇳',
              color: 'red',
              pawns: [0, 0, 0, 0],
              score: 0,
              captures: 0,
              homeCount: 0,
              movesLeft: 30,
              lastDice: null,
              consecutiveSixes: 0,
              isBot: false,
              lastActiveAt: now
            },
            player2: {
              uid: user.uid,
              username: user.username,
              location: playerLocation,
              flag: '🇮🇳',
              color: 'yellow',
              pawns: [0, 0, 0, 0],
              score: 0,
              captures: 0,
              homeCount: 0,
              movesLeft: 30,
              lastDice: null,
              consecutiveSixes: 0,
              isBot: false,
              lastActiveAt: now
            },
            diceValue: null,
            hasRolled: false,
            movablePawns: [],
            lastAction: `Match started! ${matchedOpponentEntry.username}'s turn to roll the 3D dice.`,
            winner: null,
            chatMessages: [],
            createdAt: now,
            updatedAt: now
          });

          await rtdbSet(rtdbRef(rtdb, `ludo_rooms/${sharedRoomId}`), activeMatchRoom).catch(() => {});
          await rtdbRemove(rtdbRef(rtdb, `ludo_matchmaking/${stakeKey}/${matchedOpponentEntry.uid}`)).catch(() => {});
          await rtdbRemove(rtdbRef(rtdb, `ludo_matchmaking/${stakeKey}/${user.uid}`)).catch(() => {});
          await rtdbSet(rtdbRef(rtdb, `ludo_user_match/${matchedOpponentEntry.uid}`), {
            roomId: sharedRoomId,
            matchedAt: now
          }).catch(() => {});

          finalRoom = activeMatchRoom;
          isRealMatch = true;
          opponentName = matchedOpponentEntry.username;
          opponentLocation = matchedOpponentEntry.location || 'India';
          opponentFlag = matchedOpponentEntry.flag || '🇮🇳';
        } else {
          // Add this player to /ludo_matchmaking/{stake}/{uid} and create waiting room in /ludo_rooms/{roomId}
          const waitingRoomId = `LUDO${Math.floor(1000 + Math.random() * 9000)}`;
          const totalPool = feeToCharge * playersCount;
          const houseCut = Math.round(totalPool * 0.1 * 100) / 100;
          const prizePool = Math.round((totalPool - houseCut) * 100) / 100;

          const waitingRoom = normalizeLudoRoomState({
            roomId: waitingRoomId,
            hostUid: user.uid,
            stake: feeToCharge,
            entryFee: feeToCharge,
            maxPlayers: playersCount,
            seatOrder: ['player1', 'player2'],
            prizePool,
            houseMargin: houseCut,
            isPrivate: false,
            status: 'waiting',
            players: { p1: user.uid },
            currentTurn: user.uid,
            boardState: {
              p1: [0, 0, 0, 0],
              p2: [0, 0, 0, 0]
            },
            player1: {
              uid: user.uid,
              username: user.username,
              location: playerLocation,
              flag: '🇮🇳',
              color: 'red',
              pawns: [0, 0, 0, 0],
              score: 0,
              captures: 0,
              homeCount: 0,
              movesLeft: 30,
              lastDice: null,
              consecutiveSixes: 0,
              isBot: false,
              lastActiveAt: now
            },
            player2: null,
            turn: 'player1',
            diceValue: null,
            hasRolled: false,
            movablePawns: [],
            lastAction: 'Searching for opponent at same stake...',
            winner: null,
            chatMessages: [],
            createdAt: now,
            updatedAt: now
          });

          await rtdbSet(rtdbRef(rtdb, `ludo_rooms/${waitingRoomId}`), waitingRoom).catch(() => {});
          await rtdbSet(rtdbRef(rtdb, `ludo_matchmaking/${stakeKey}/${user.uid}`), {
            uid: user.uid,
            username: user.username,
            location: playerLocation,
            flag: '🇮🇳',
            stake: feeToCharge,
            roomId: waitingRoomId,
            joinedAt: now
          }).catch(() => {});

          finalRoom = waitingRoom;
        }
      }

      if (!finalRoom) {
        showToast('Could not initialize Ludo table. Please try again.', 'error');
        return;
      }

      if (newlyStaked) {
        const betResult = store.recordGameBet(
          user.uid,
          finalRoom.entryFee,
          `Ludo ${finalRoom.maxPlayers || playersCount}P Live Battle`,
          stakeTxId || `${finalRoom.roomId}_${user.uid}`
        );
        if (!betResult.success) {
          showToast(betResult.error || 'Failed to deduct entry fee', 'error');
          return;
        }
        // Log to /live_bets for Admin Console visibility
        rtdbSet(rtdbRef(rtdb, `live_bets/ludo_${finalRoom.roomId}_${user.uid}`), {
          betId: `ludo_${finalRoom.roomId}_${user.uid}`,
          uid: user.uid,
          username: user.username,
          gameId: 'ludo_battle',
          roundPeriod: finalRoom.roomId,
          gameType: '1min',
          betType: 'color',
          betValue: mode,
          amount: finalRoom.entryFee,
          multiplier: 1.8,
          potentialPayout: finalRoom.prizePool,
          status: 'pending',
          actualPayout: 0,
          timestamp: now
        }).catch(() => {});
      }

      const safeFinalRoom = normalizeLudoRoomState(finalRoom);
      isRollingLockRef.current = false;
      isMovingLockRef.current = false;
      rollingPlayerKeyRef.current = null;
      actionLockUntilRef.current = 0;
      seenChatIdsRef.current.clear();
      safeFinalRoom.chatMessages.forEach((m: LudoChatMessage) => seenChatIdsRef.current.add(m.id));
      if (safeFinalRoom.lastRoll?.rollId) {
        seenRollIdsRef.current.add(safeFinalRoom.lastRoll.rollId);
      }
      setConfirmedDiceByPlayer({ player1: null, player2: null, player3: null, player4: null });
      setRollingPlayerKey(null);
      syncVisualPawnsFromRoom(safeFinalRoom);
      setStepTrail([]);
      setShowForfeitConfirm(false);

      if (isRealMatch && opponentName) {
        setMatchedRealOpponent({
          name: opponentName,
          loc: opponentLocation || 'India',
          flag: opponentFlag || '🇮🇳'
        });
        setShowRealMatchCelebration(true);
        playTone(880, 240, 'sine');
        setTimeout(() => setShowRealMatchCelebration(false), 2600);
      } else {
        setMatchedRealOpponent(null);
        setShowRealMatchCelebration(false);
        setMatchmakingCountdown(10);
      }

      setRoom(safeFinalRoom);
      playTone(520, 160, 'sine');
    } catch {
      showToast('Could not initialize Ludo table. Please try again.', 'error');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleInstantStartFromWaiting = async () => {
    if (!room) return;
    if (user?.uid) {
      const stakeKey = String(room.entryFee || 50);
      rtdbRemove(rtdbRef(rtdb, `ludo_matchmaking/${stakeKey}/${user.uid}`)).catch(() => {});
    }
    try {
      const res = await fetch(`/api/ludo/room/${room.roomId}/pair-instant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const text = await res.text();
      if (text && !text.trim().startsWith('<')) {
        const data = JSON.parse(text);
        if (data.success && data.room) {
          const safePaired = normalizeLudoRoomState(data.room);
          syncVisualPawnsFromRoom(safePaired);
          setRoom(safePaired);
          rtdbSet(rtdbRef(rtdb, `ludo_rooms/${safePaired.roomId}`), safePaired).catch(() => {});
          playTone(620, 180, 'sine');
          return;
        }
      }
    } catch {
      // Fallback to local/RTDB challenger pairing
    }
    pairLocalWaitingRoomWithChallenger(room);
  };

  // Move Pawn Handler - Walks token strictly 1 cell at a time (225ms/cell) and updates turn ONLY after landing
  const handleMovePawn = useCallback(
    async (pawnIndex: number) => {
      const currentRoom = roomRef.current;
      if (!currentRoom || !user || currentRoom.status !== 'playing') return;
      if (
        isMovingLockRef.current ||
        isRollingLockRef.current ||
        stepLoopRunningRef.current ||
        rollingPlayerKeyRef.current !== null
      ) {
        return;
      }

      const keys: LudoPlayerKey[] = ['player1', 'player2', 'player3', 'player4'];
      const myRole: LudoPlayerKey = keys.find((k) => currentRoom[k]?.uid === user.uid) || 'player1';
      if (currentRoom.turn !== myRole || !currentRoom.hasRolled) return;
      if (!(currentRoom.movablePawns || []).includes(pawnIndex)) return;

      isMovingLockRef.current = true;
      setIsTokenWalking(true);

      const activeMe = currentRoom[myRole];
      const curStep = activeMe?.pawns[pawnIndex] ?? 0;
      const stepsToHop = curStep === 0 ? 1 : (currentRoom.diceValue || 1);
      const stepDurationMs = curStep === 0 ? 320 : stepsToHop * 235 + 350;
      actionLockUntilRef.current = Date.now() + stepDurationMs + 450;

      // Clear movablePawns on current room immediately to lock duplicate token taps while keeping turn on current player
      setRoom((prev) => (prev ? { ...prev, movablePawns: [] } : prev));

      // Compute post-move state and defer turn switch until the token finishes stepping onto its final cell!
      const optimisticRoom = normalizeLudoRoomState(applyLocalPawnMove(currentRoom, myRole, pawnIndex));
      deferredRoomAfterMoveRef.current = optimisticRoom;
      targetPawnsRef.current = extractPawnsByColorFromRoom(optimisticRoom);
      rtdbSet(rtdbRef(rtdb, `ludo_rooms/${optimisticRoom.roomId}`), optimisticRoom).catch(() => {});
      startOrContinueTokenWalk();

      try {
        const res = await fetch(`/api/ludo/room/${currentRoom.roomId}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid, pawnIndex })
        });
        const data = await res.json();
        if (data.success && data.room) {
          const safeServerRoom = normalizeLudoRoomState(data.room);
          rtdbSet(rtdbRef(rtdb, `ludo_rooms/${safeServerRoom.roomId}`), safeServerRoom).catch(() => {});
          targetPawnsRef.current = extractPawnsByColorFromRoom(safeServerRoom);
          if (stepLoopRunningRef.current || isMovingLockRef.current) {
            deferredRoomAfterMoveRef.current = safeServerRoom;
          } else {
            setRoom(safeServerRoom);
            checkAndSettleFinishedRoom(safeServerRoom);
          }
        }
      } catch {
        // Optimistic move already synced to RTDB and queued in deferredRoomAfterMoveRef
      }
    },
    [user, applyLocalPawnMove, normalizeLudoRoomState, extractPawnsByColorFromRoom, startOrContinueTokenWalk, checkAndSettleFinishedRoom]
  );

  // Roll Dice Handler - Plays continuous 1.52s 3D Dice Cube animation and reveals number ONLY after landing
  const handleRollDice = async () => {
    if (
      !room ||
      !user ||
      room.status !== 'playing' ||
      rollingPlayerKey !== null ||
      isTokenWalking ||
      hoppingToken !== null
    ) {
      return;
    }
    if (isRollingLockRef.current || isMovingLockRef.current || stepLoopRunningRef.current) return;

    const keys: LudoPlayerKey[] = ['player1', 'player2', 'player3', 'player4'];
    const myRole: LudoPlayerKey = keys.find((k) => room[k]?.uid === user.uid) || 'player1';
    if (room.turn !== myRole) {
      showToast('Wait for your turn!', 'info');
      return;
    }
    if (room.hasRolled) {
      showToast('Tap any glowing 3D token on the board or button below to move!', 'info');
      return;
    }

    isRollingLockRef.current = true;
    rollingPlayerKeyRef.current = myRole;
    actionLockUntilRef.current = Date.now() + DICE_ROLL_DURATION_MS + 450;
    setRollingPlayerKey(myRole);

    // 3D dice flip sound effects synchronized with the 1.52s multi-axis rotation
    playDiceFlipSound();

    const rollStartTime = Date.now();
    const targetDurationMs = DICE_ROLL_DURATION_MS; // 1.52s continuous 3D roll

    try {
      const res = await fetch(`/api/ludo/room/${room.roomId}/roll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });
      const data = await res.json();

      if (data.success && data.room) {
        const safeRolledRoom = normalizeLudoRoomState(data.room);
        rtdbSet(rtdbRef(rtdb, `ludo_rooms/${safeRolledRoom.roomId}`), safeRolledRoom).catch(() => {});
        if (data.rollId) {
          seenRollIdsRef.current.add(data.rollId);
        }
        // Provide authoritative rolled face to Realistic3DDice ref so its 60fps deceleration lands on data.rolled
        setConfirmedDiceByPlayer((prev) => ({ ...prev, [myRole]: data.rolled }));

        const elapsed = Date.now() - rollStartTime;
        const remainingWait = Math.max(80, targetDurationMs - elapsed);

        setTimeout(() => {
          rollingPlayerKeyRef.current = null;
          setRollingPlayerKey(null);
          isRollingLockRef.current = false;

          if (data.tripleSixForfeit) {
            playTone(240, 260, 'sawtooth');
            showToast(`Rolled ${data.rolled} — Three 6s in a row! Turn forfeited.`, 'info');
            setRoom(safeRolledRoom);
            checkAndSettleFinishedRoom(safeRolledRoom);
            return;
          }
          if (data.noValidMoves) {
            playTone(300, 220, 'triangle');
            showToast(`Rolled ${data.rolled} — No legal move available.`, 'info');
            setRoom(safeRolledRoom);
            checkAndSettleFinishedRoom(safeRolledRoom);
            return;
          }

          playTone(data.rolled === 6 ? 860 : 580, 190, 'sine');
          setRoom(safeRolledRoom);

          // Auto-move after 480ms settle pause if there is only 1 legal token move
          const movables: number[] = safeRolledRoom.movablePawns || [];
          if (movables.length === 1) {
            setTimeout(() => {
              handleMovePawn(movables[0]);
            }, 480);
          }
        }, remainingWait);
        return;
      }
    } catch {
      // Fallback local roll if offline
    }

    const elapsedFallback = Date.now() - rollStartTime;
    const remainingFallback = Math.max(80, targetDurationMs - elapsedFallback);
    const localRolled = Math.floor(Math.random() * 6) + 1;
    setConfirmedDiceByPlayer((prev) => ({ ...prev, [myRole]: localRolled }));

    setTimeout(() => {
      rollingPlayerKeyRef.current = null;
      setRollingPlayerKey(null);
      isRollingLockRef.current = false;
      playTone(localRolled === 6 ? 860 : 580, 190, 'sine');
      setRoom((prev) => {
        if (!prev) return prev;
        const copy: LudoRoomState = normalizeLudoRoomState(prev);
        const me = copy[myRole];
        if (!me) return prev;

        copy.diceValue = localRolled;
        me.lastDice = localRolled;
        copy.lastRoll = {
          rollId: `roll_${Date.now()}_${myRole}`,
          player: myRole,
          color: me.color,
          value: localRolled,
          outcome: 'normal',
          timestamp: Date.now()
        };
        seenRollIdsRef.current.add(copy.lastRoll.rollId);

        const movables = computeClientMovablePawns(me.pawns, localRolled);
        if (movables.length === 0) {
          me.movesLeft = Math.max(0, me.movesLeft - 1);
          copy.diceValue = null;
          copy.hasRolled = false;
          copy.movablePawns = [];
          const order: LudoPlayerKey[] = copy.seatOrder || ['player1', 'player2'];
          const startIdx = Math.max(0, order.indexOf(myRole));
          for (let offset = 1; offset <= order.length; offset++) {
            const candKey = order[(startIdx + offset) % order.length];
            if (copy[candKey] && copy[candKey]!.movesLeft > 0) {
              copy.turn = candKey;
              copy.currentTurn = copy[candKey]!.uid;
              break;
            }
          }
          copy.lastAction = `${me.username} rolled ${localRolled} (No valid move available)`;
          copy.updatedAt = Date.now();
          rtdbSet(rtdbRef(rtdb, `ludo_rooms/${copy.roomId}`), copy).catch(() => {});
          return copy;
        }
        copy.hasRolled = true;
        copy.movablePawns = movables;
        copy.lastAction = `${me.username} rolled a ${localRolled}! Tap any glowing 3D token to move.`;
        copy.updatedAt = Date.now();
        rtdbSet(rtdbRef(rtdb, `ludo_rooms/${copy.roomId}`), copy).catch(() => {});
        if (movables.length === 1) {
          setTimeout(() => {
            handleMovePawn(movables[0]);
          }, 480);
        }
        return copy;
      });
    }, remainingFallback);
  };

  // Send Match Chat
  const handleSendMatchChat = async (textOverride?: string, type: 'text' | 'quick' | 'emoji' = 'text') => {
    if (!room || !user || !chatEnabled) return;
    const msgText = (textOverride ?? matchChatInput).trim();
    if (!msgText) return;
    if (!textOverride) setMatchChatInput('');

    try {
      const res = await fetch(`/api/ludo/room/${room.roomId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          username: user.username,
          location: playerLocation,
          text: msgText,
          messageType: type
        })
      });
      const data = await res.json();
      if (data.success && data.room) {
        if (data.message) seenChatIdsRef.current.add(data.message.id);
        const keys: LudoPlayerKey[] = ['player1', 'player2', 'player3', 'player4'];
        const mySeat = keys.find((k) => room[k]?.uid === user.uid) || 'player1';
        const myCol = room[mySeat]?.color || 'red';
        setFloatingBubbles((prev) => ({
          ...prev,
          [myCol]: { text: msgText, ts: Date.now() }
        }));
        setRoom(data.room);
      }
    } catch {
      // Ignore
    }
  };

  // Send Global Lobby Chat
  const handleSendLobbyChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatEnabled) return;
    const clean = lobbyChatInput.trim();
    if (!clean) return;
    setLobbyChatInput('');

    try {
      const res = await fetch('/api/ludo/lobby/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user?.uid || 'guest',
          username: user?.username || 'Guest_Player',
          location: playerLocation,
          text: clean
        })
      });
      const data = await res.json();
      if (data.success && data.globalChat) {
        setGlobalChat(data.globalChat);
      }
    } catch {
      // Ignore
    }
  };

  const copyRoomCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    showToast(`Room Code ${code} copied! Share with players worldwide.`, 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Determine seat assignments and active local player
  const allSeatKeys: LudoPlayerKey[] = ['player1', 'player2', 'player3', 'player4'];
  const myRole: LudoPlayerKey =
    (room && user && allSeatKeys.find((k) => room[k]?.uid === user.uid)) || 'player1';
  const activeMyPlayer = room ? room[myRole] : null;
  const myColor: LudoColor = activeMyPlayer?.color || 'red';
  const isMyTurn = Boolean(room && room.status === 'playing' && room.turn === myRole);

  // 15-Second Anti-AFK Safety Timer: resets when turn or roll status changes
  useEffect(() => {
    if (!room || room.status !== 'playing') {
      setTurnTimeRemaining(15);
      autoActionTriggeredRef.current = false;
      return;
    }

    const currentTurnToken = `${room.turn}_rolled:${room.hasRolled}_dice:${room.diceValue}`;
    if (lastTurnTokenRef.current !== currentTurnToken) {
      lastTurnTokenRef.current = currentTurnToken;
      setTurnTimeRemaining(15);
      autoActionTriggeredRef.current = false;
    }

    const timer = setInterval(() => {
      setTurnTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        if (prev <= 4 && isMyTurn) {
          playTone(880, 50, 'sine', 0.04);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room?.status, room?.turn, room?.hasRolled, room?.diceValue, isMyTurn, playTone]);

  // Execute Auto-Roll or Auto-Move on 15-Second AFK Timeout
  useEffect(() => {
    if (
      turnTimeRemaining !== 0 ||
      !room ||
      room.status !== 'playing' ||
      !isMyTurn ||
      autoActionTriggeredRef.current ||
      isRollingLockRef.current ||
      isMovingLockRef.current ||
      stepLoopRunningRef.current ||
      rollingPlayerKey !== null ||
      isTokenWalking ||
      hoppingToken !== null
    ) {
      return;
    }

    autoActionTriggeredRef.current = true;
    if (!room.hasRolled) {
      showToast('⏰ Auto-rolled 3D Dice due to 15s turn timeout!', 'info');
      handleRollDice();
    } else if (room.hasRolled && room.movablePawns && room.movablePawns.length > 0) {
      const targetPawn = room.movablePawns[0];
      showToast(`⏰ Auto-moved Token #${targetPawn + 1} due to 15s turn timeout!`, 'info');
      handleMovePawn(targetPawn);
    }
  }, [
    turnTimeRemaining,
    room,
    isMyTurn,
    rollingPlayerKey,
    isTokenWalking,
    hoppingToken,
    handleRollDice,
    handleMovePawn,
    showToast
  ]);

  // Quick 1vs1 Instant Rematch Handler: preserves same stake fee and players mode
  const handleInstantRematch = useCallback(
    (multiplier: number = 1) => {
      if (!room) return;
      const prevFee = Math.round(room.entryFee * multiplier);
      const prevMax = room.maxPlayers || 2;
      setRoom(null);
      setRecoverableRoom(null);
      setShowResult3DModal(false);
      showToast(`⚡ Queueing Instant Rematch for ₹${prevFee}...`, 'success');
      playTone(720, 150, 'sine');
      setTimeout(() => {
        handleCreateOrJoinRoom('quick_live', undefined, prevFee, prevMax);
      }, 150);
    },
    [room, handleCreateOrJoinRoom, playTone, showToast]
  );

  // Map each of the 4 board colors ('red', 'green', 'yellow', 'blue') to its seated player in this room
  const playerByColor: Record<LudoColor, { key: LudoPlayerKey; player: LudoPlayerState } | null> = {
    red: null,
    green: null,
    yellow: null,
    blue: null
  };
  if (room) {
    allSeatKeys.forEach((k) => {
      const p = room[k];
      if (p) {
        playerByColor[p.color] = { key: k, player: p };
      }
    });
  }

  // Compute Destination Preview Rings & Intermediate Path Step Dots when local player has rolled
  const destinationPreviews: Array<{ row: number; col: number; pawnIdx: number; isCut: boolean }> = [];
  const pathStepDots: Array<{ row: number; col: number; stepNum: number }> = [];

  if (room && room.status === 'playing' && isMyTurn && room.hasRolled && room.diceValue && activeMyPlayer) {
    (room.movablePawns || []).forEach((pIdx, mOrder) => {
      const curStep = (activeMyPlayer.pawns || [0, 0, 0, 0])[pIdx] ?? 0;
      const nextStep = curStep === 0 ? 1 : curStep + room.diceValue!;
      if (nextStep <= 57) {
        if (mOrder === 0 && curStep >= 1) {
          for (let s = curStep + 1; s < nextStep; s++) {
            const [sr, sc] = getPawnGridPosition(activeMyPlayer.color, s, pIdx);
            pathStepDots.push({ row: sr, col: sc, stepNum: s - curStep });
          }
        }
        const [r, c] = getPawnGridPosition(activeMyPlayer.color, nextStep, pIdx);
        let isCut = false;
        if (nextStep >= 1 && nextStep <= 51) {
          const gIdx = getGlobalTrackIndex(activeMyPlayer.color, nextStep);
          if (gIdx !== null && !SAFE_TRACK_INDICES.has(gIdx)) {
            const myCountAfterMove =
              (activeMyPlayer.pawns || [0, 0, 0, 0]).filter((s) => getGlobalTrackIndex(activeMyPlayer.color, s) === gIdx).length + 1;
            for (const k of allSeatKeys) {
              if (k === myRole) continue;
              const op = room[k];
              if (!op) continue;
              const oppCountAtDest = (op.pawns || [0, 0, 0, 0]).filter((os) => getGlobalTrackIndex(op.color, os) === gIdx).length;
              if (oppCountAtDest === 1 || (oppCountAtDest > 0 && myCountAfterMove >= oppCountAtDest)) {
                isCut = true;
                break;
              }
            }
          }
        }
        destinationPreviews.push({ row: r, col: c, pawnIdx: pIdx, isCut });
      }
    });
  }

  // Smart 4-Color Stack Offset: prevents any token from hiding behind another on Safe Stars or Track Tiles
  const getCombinedCellStackOffset = (
    color: LudoColor,
    targetIdx: number
  ): { shiftX: number; shiftY: number; isStacked: boolean } => {
    const step = visualPawns[color][targetIdx];
    if (step <= 0 || step >= 57) {
      return { shiftX: 0, shiftY: 0, isStacked: false };
    }
    const [targetR, targetC] = getPawnGridPosition(color, step, targetIdx);
    const occupants: Array<{ color: LudoColor; idx: number }> = [];

    (['red', 'green', 'yellow', 'blue'] as LudoColor[]).forEach((col) => {
      if (!playerByColor[col]) return;
      visualPawns[col].forEach((s, i) => {
        if (s > 0 && s < 57) {
          const [r, c] = getPawnGridPosition(col, s, i);
          if (r === targetR && c === targetC) occupants.push({ color: col, idx: i });
        }
      });
    });

    if (occupants.length <= 1) {
      return { shiftX: 0, shiftY: 0, isStacked: false };
    }
    const rank = occupants.findIndex((o) => o.color === color && o.idx === targetIdx);
    const offsets: Array<[number, number]> = [
      [-6, -3],
      [6, -3],
      [-6, 4],
      [6, 4],
      [0, -6],
      [0, 6]
    ];
    const [shiftX, shiftY] = offsets[Math.max(0, rank) % offsets.length];
    return { shiftX, shiftY, isStacked: true };
  };

  // Render Corner Player Profile Card for Top-Left (Green), Top-Right (Yellow), Bottom-Left (Red), Bottom-Right (Blue)
  const renderCornerSeatCard = (cornerColor: LudoColor, cornerLabel: string) => {
    const seatEntry = playerByColor[cornerColor];
    if (!seatEntry || !room) {
      return (
        <div className="flex-1 min-w-0 px-2.5 py-2 rounded-2xl bg-slate-900/55 border border-slate-800/80 flex items-center justify-between opacity-55">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
              —
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-400 truncate">{cornerLabel} Seat</div>
              <div className="text-[9px] text-slate-500">Inactive in {room?.maxPlayers || 2}P Mode</div>
            </div>
          </div>
        </div>
      );
    }

    const { key: seatKey, player } = seatEntry;
    const isTurn = room.status === 'playing' && room.turn === seatKey;
    const isRollingThisSeat = rollingPlayerKey === seatKey;
    const isMe = player.uid === user?.uid;
    const isDc = Boolean(
      player.isDisconnected ||
      (room.disconnectInfo && room.disconnectInfo.playerKey === seatKey)
    );
    const isOnline = !isDc && (player.isBot || Date.now() - (player.lastHeartbeatAt || player.lastActiveAt || Date.now()) < 15000);
    const voiceState = room.voiceStates?.[player.uid];
    const isSpeakingNow = isMe ? isLocalSpeaking && micEnabled : Boolean(voiceState?.isSpeaking);
    const isPeerMicOn = isMe ? micEnabled : Boolean(voiceState?.micEnabled || player.isBot);
    const isPeerMutedByMe = Boolean(mutedPlayerUids[player.uid]);

    const diceVal =
      isTurn && room.diceValue !== null
        ? room.diceValue
        : confirmedDiceByPlayer[seatKey] ?? player.lastDice ?? null;

    const borderThemes: Record<LudoColor, string> = {
      red: isTurn
        ? 'bg-gradient-to-r from-rose-950/95 via-slate-900 to-rose-900/80 border-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.4)]'
        : 'bg-slate-900/95 border-slate-800',
      green: isTurn
        ? 'bg-gradient-to-r from-emerald-950/95 via-slate-900 to-emerald-900/80 border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.4)]'
        : 'bg-slate-900/95 border-slate-800',
      yellow: isTurn
        ? 'bg-gradient-to-r from-amber-950/95 via-slate-900 to-amber-900/80 border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.4)]'
        : 'bg-slate-900/95 border-slate-800',
      blue: isTurn
        ? 'bg-gradient-to-r from-blue-950/95 via-slate-900 to-blue-900/80 border-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.4)]'
        : 'bg-slate-900/95 border-slate-800'
    };

    const avatarBadges: Record<LudoColor, string> = {
      red: 'bg-gradient-to-b from-rose-400 to-rose-700 text-white shadow-[0_2px_0_#881337]',
      green: 'bg-gradient-to-b from-emerald-400 to-emerald-700 text-white shadow-[0_2px_0_#064E3B]',
      yellow: 'bg-gradient-to-b from-amber-300 to-amber-600 text-slate-950 shadow-[0_2px_0_#78350F]',
      blue: 'bg-gradient-to-b from-blue-400 to-blue-700 text-white shadow-[0_2px_0_#1E3A8A]'
    };

    return (
      <div
        className={`relative flex-1 min-w-0 px-2.5 py-1.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-1.5 shadow-lg ${borderThemes[cornerColor]}`}
      >
        {/* Floating Chat Bubble for this Seat */}
        {chatEnabled && floatingBubbles[cornerColor] && Date.now() - floatingBubbles[cornerColor].ts < 5500 && (
          <div className="absolute -top-6 left-2 z-40 bg-amber-300 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-lg border border-slate-950 max-w-[180px] truncate">
            💬 {floatingBubbles[cornerColor].text}
          </div>
        )}

        {/* Avatar + Country Flag + Speaking Ring + Stats */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative shrink-0">
            {isSpeakingNow && (
              <span className="absolute -inset-1 rounded-xl border-2 border-emerald-400 bg-emerald-400/20 animate-ping pointer-events-none" />
            )}
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm border border-white/60 ${avatarBadges[cornerColor]}`}
            >
              {(player.username || 'P').charAt(0).toUpperCase()}
            </div>
            <span
              className="absolute -top-1 -left-1 text-[11px] leading-none drop-shadow"
              title={player.location}
            >
              {player.flag || getFlagForLocation(player.location)}
            </span>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                isDc ? 'bg-rose-500 animate-ping' : isOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              title={isDc ? 'Disconnected (Reconnecting)' : isOnline ? 'Online' : 'Reconnecting'}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] sm:text-xs font-black text-white truncate max-w-[82px] sm:max-w-[110px]">
                {player.username}
                {isMe ? ' (You)' : ''}
              </span>
              {isDc && (
                <span className="px-1 py-0.5 rounded-md bg-rose-500/30 border border-rose-400 text-rose-300 text-[8px] sm:text-[9px] font-black animate-pulse flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                  <Radio className="w-2.5 h-2.5 text-rose-400 animate-spin" />
                  <span>{room.disconnectInfo?.playerKey === seatKey ? `${room.disconnectInfo.remainingSeconds}s` : 'DISCONNECTED'}</span>
                </span>
              )}
              {!isMe && (
                <button
                  type="button"
                  onClick={() => toggleMuteSpecificPlayer(player.uid, player.username)}
                  className={`p-0.5 rounded-md border text-[9px] transition ${
                    isPeerMutedByMe
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : isPeerMicOn
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title={isPeerMutedByMe ? `Unmute ${player.username}` : `Mute ${player.username}`}
                >
                  {isPeerMutedByMe ? <MicOff className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 text-[10px] font-bold tabular-nums text-slate-300">
              <span className="text-amber-300">{player.score}p</span>
              <span className="text-slate-600">·</span>
              <span>{player.movesLeft}m</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400">👑{player.homeCount}/4</span>
              {isTurn && room?.status === 'playing' && (
                <>
                  <span className="text-slate-600">·</span>
                  <span
                    className={`px-1 py-0.2 rounded-md font-mono text-[9px] font-black ${
                      turnTimeRemaining <= 4
                        ? 'text-rose-400 bg-rose-500/20 animate-pulse'
                        : 'text-amber-300 bg-amber-400/20'
                    }`}
                  >
                    ⏱️{turnTimeRemaining}s
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Seat 3D Dice Cube */}
        <div
          onClick={() => {
            if (isMe && isTurn && !room.hasRolled && !isTokenWalking && rollingPlayerKey === null) {
              handleRollDice();
            }
          }}
          className={
            isMe && isTurn && !room.hasRolled && !isTokenWalking && rollingPlayerKey === null
              ? 'cursor-pointer shrink-0'
              : 'shrink-0'
          }
        >
          <Realistic3DDice
            value={diceVal}
            isRolling={isRollingThisSeat}
            activeColor={cornerColor}
            isTurn={isTurn}
            compact
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1E1B4B] via-[#0B1120] to-[#040711] text-slate-100 flex flex-col pb-6 select-none">
      {/* ==================== ROYAL 3D TOP CONTROL HEADER ==================== */}
      <header className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/30 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => {
              if (room) {
                if (room.status === 'waiting') {
                  handleCancelWaitingRoom();
                } else {
                  setRoom(null);
                }
              } else {
                onBack();
              }
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-amber-300 hover:border-amber-500/50 transition shrink-0"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <h1 className="text-xs sm:text-base font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 truncate">
                LUDO 3D WORLDWIDE ARENA
              </h1>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              2P / 3P / 4P Live Multiplayer · Voice Chat · Slow 3D Physics Dice
            </div>
          </div>
        </div>

        {/* Right Controls: Wallet + Live Mic + Speaker + Chat Toggle + Sound */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-slate-900/95 px-2.5 py-1.5 rounded-xl border border-amber-500/30 shadow-inner">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-black text-amber-300 tabular-nums">
              ₹{user?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) || 0}
            </span>
          </div>

          {room && featureFlags.voiceChat && (
            <>
              <button
                type="button"
                onClick={handleToggleMicrophone}
                className={`px-2 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
                  micEnabled
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={micEnabled ? 'Mute Microphone' : 'Turn On Live Voice Chat Microphone'}
              >
                {micEnabled ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{micEnabled ? 'Mic ON' : 'Mic OFF'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleSpeaker}
                className={`p-1.5 rounded-xl border transition ${
                  speakerEnabled
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                }`}
                title={speakerEnabled ? 'Speaker Audio ON' : 'Speaker Audio Muted'}
              >
                <Headphones className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {featureFlags.textChat && (
            <button
              onClick={handleToggleChatEnabled}
              className={`px-2 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition whitespace-nowrap ${
                chatEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
              }`}
              title={chatEnabled ? 'Turn Chat OFF' : 'Turn Chat ON'}
            >
              {chatEnabled ? <MessageSquare className="w-3.5 h-3.5" /> : <MessageSquareOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{chatEnabled ? 'Chat ON' : 'Chat OFF'}</span>
            </button>
          )}

          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              soundFx.setSfxEnabled(next);
            }}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition"
            title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* ==================== MAIN CONTAINER ==================== */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-2 sm:px-5 py-2">
        {/* ==================== 1. LOBBY VIEW ==================== */}
        {!room && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="w-full space-y-4">
              {/* Active Match Reconnect Banner if user has an ongoing match */}
              {recoverableRoom && (
                <div className="rounded-2xl p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-400/70 flex items-center justify-between gap-3 shadow-lg">
                  <div>
                    <div className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                      ● Active {recoverableRoom.maxPlayers || 2}P Match in Progress ({recoverableRoom.roomId})
                    </div>
                    <div className="text-xs text-slate-200 mt-0.5">
                      Entry ₹{recoverableRoom.entryFee} · Win Pool ₹{recoverableRoom.prizePool} · Status: {recoverableRoom.status.toUpperCase()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleResumeRoom(recoverableRoom)}
                    className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs whitespace-nowrap shadow-md transition"
                  >
                    Resume Match
                  </button>
                </div>
              )}

              {/* 3D Royal Tournament Banner */}
              <div className="rounded-3xl p-5 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E1B4B] border-2 border-amber-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>WORLDWIDE 3D MULTIPLAYER LUDO</span>
                  </span>
                  <span className="tabular-nums text-emerald-400">{liveMatchesCount} Live Tables</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Ludo 3D Royal Worldwide Battles
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Choose 2, 3, or 4 Players, talk live with built-in Voice Chat, roll the medium-slow 6-faced 3D dice cube, and watch your tokens walk step-by-step across every square!
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Playing From:</span>
                    <select
                      value={playerLocation}
                      onChange={(e) => setPlayerLocation(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                    >
                      {REGIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {getFlagForLocation(loc)} {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Voice Chat: <strong className="text-emerald-400">Live WebRTC</strong> · Instant Payout
                  </span>
                </div>
              </div>

              {/* LUDO CHAMPIONSHIP TOURNAMENT EVENT SECTION */}
              {featureFlags.tournaments && (
                <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 rounded-3xl p-5 border-2 border-amber-500/50 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
                      <h3 className="text-sm sm:text-base font-black text-white">Ludo Championship Tournament Events</h3>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-400 text-amber-300 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Live Event
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Join official multi-player Ludo tournaments with massive guaranteed prize pools. Battle top players worldwide!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {[
                      { id: 'daily_cup', name: 'Daily Grand Cup', prize: '₹10,000', entry: 100, players: 4, time: 'Starts in 15m' },
                      { id: 'speed_blitz', name: 'Speed Ludo Blitz', prize: '₹5,000', entry: 50, players: 2, time: 'Live Now' },
                      { id: 'royal_clash', name: 'Royal 4P Master', prize: '₹25,000', entry: 250, players: 4, time: 'Hourly' }
                    ].map((tourn) => (
                      <div key={tourn.id} className="bg-slate-950 border border-amber-500/30 rounded-2xl p-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
                            <span>{tourn.name}</span>
                            <span className="text-emerald-400 font-semibold">{tourn.time}</span>
                          </div>
                          <div className="text-base font-black text-white mt-1">Prize: {tourn.prize}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{tourn.players}P Knockout · Entry ₹{tourn.entry}</div>
                        </div>
                        <button
                          onClick={() => {
                            playTone(600, 50, 'sine', 0.08);
                            setSelectedEntry(tourn.entry);
                            setSelectedMaxPlayers(tourn.players as 2 | 3 | 4);
                            handleCreateOrJoinRoom('quick_live');
                          }}
                          className="mt-3 w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition"
                        >
                          Join Tournament (₹{tourn.entry})
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PLAYER COUNT SELECTOR (2 PLAYERS / 3 PLAYERS / 4 PLAYERS) */}
              <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>1. Select Number of Players</span>
                  </h3>
                  <span className="text-xs text-amber-300 font-bold">
                    {selectedMaxPlayers === 2
                      ? 'Red vs Yellow (Opposite Corners)'
                      : selectedMaxPlayers === 3
                      ? 'Red · Green · Yellow'
                      : 'All 4 Corners (Red · Green · Yellow · Blue)'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {([2, 3, 4] as Array<2 | 3 | 4>).map((pCount) => {
                    const isSelected = selectedMaxPlayers === pCount;
                    return (
                      <button
                        key={pCount}
                        type="button"
                        onClick={() => setSelectedMaxPlayers(pCount)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-gradient-to-b from-amber-400/25 via-amber-500/10 to-slate-950 border-amber-400 shadow-[0_4px_0_#78350F] scale-[1.02]'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-base sm:text-lg font-black text-white">{pCount} Players</div>
                        <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                          Win {(pCount * 0.9).toFixed(1)}x Stake
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white/60" />
                          {pCount >= 3 && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white/60" />
                          )}
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white/60" />
                          {pCount === 4 && (
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white/60" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ENTRY STAKE SELECTOR */}
                <div className="pt-2 flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <Swords className="w-4 h-4 text-amber-400" />
                    <span>2. Select Entry Stake</span>
                  </h3>
                  <span className="text-xs text-emerald-400 font-bold">90% Prize Pool</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {entryOptions.map((amt) => {
                    const pool = Math.round(amt * selectedMaxPlayers * 0.90);
                    const isSelected = selectedEntry === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setSelectedEntry(amt)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-amber-500/25 via-amber-500/10 to-slate-900 border-amber-400 shadow-[0_5px_0_#78350F] scale-[1.02]'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Entry</span>
                          <Coins className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                        </div>
                        <div className="text-lg sm:text-xl font-black text-white tabular-nums mt-0.5">₹{amt}</div>
                        <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Win</span>
                          <span className="font-black text-emerald-400 tabular-nums">₹{pool}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400">
                      {selectedMaxPlayers}-Player Winner Cash Prize
                    </div>
                    <div className="text-xl font-black text-emerald-400 tabular-nums">₹{prizePoolPreview}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Platform Commission (10%)</div>
                    <div className="text-sm font-bold text-slate-300 tabular-nums">₹{houseMarginPreview}</div>
                  </div>
                </div>

                <div className={`grid grid-cols-1 ${featureFlags.privateRooms ? 'sm:grid-cols-2' : ''} gap-3`}>
                  <button
                    disabled={isJoiningRoom}
                    onClick={() => handleCreateOrJoinRoom('quick_live')}
                    className="py-3.5 px-4 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:brightness-105 disabled:opacity-60 text-slate-950 font-black text-sm shadow-[0_5px_0_#92400E,0_10px_20px_rgba(245,158,11,0.3)] active:translate-y-1 transition flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>
                      {isJoiningRoom ? 'CONNECTING...' : `PLAY ${selectedMaxPlayers}P LUDO (₹${selectedEntry})`}
                    </span>
                  </button>

                  {featureFlags.privateRooms && (
                    <button
                      disabled={isJoiningRoom}
                      onClick={() => handleCreateOrJoinRoom('create_private')}
                      className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white border border-slate-700 font-bold text-sm shadow-[0_5px_0_#0F172A] active:translate-y-1 transition flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>Create {selectedMaxPlayers}P Private Room</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Join By Room Code */}
              {featureFlags.privateRooms && (
                <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white">Join Friend or Open Worldwide Table</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      placeholder="Enter Room Code (e.g. LUDO4821)"
                      maxLength={10}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      disabled={isJoiningRoom}
                      onClick={() => handleCreateOrJoinRoom('join_code')}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-xs sm:text-sm transition whitespace-nowrap"
                    >
                      Join Table
                    </button>
                  </div>

                {openRooms.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs text-slate-400 font-semibold">Live Waiting Worldwide Rooms:</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {openRooms.map((r) => (
                        <div
                          key={r.roomId}
                          className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-3"
                        >
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{r.hostFlag || getFlagForLocation(r.hostLocation)}</span>
                              <span>{r.hostName}</span>
                              <span className="text-slate-400 font-normal">({r.hostLocation})</span>
                            </div>
                            <div className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                              Room <span className="font-mono text-amber-300">{r.roomId}</span> ·{' '}
                              <span className="text-cyan-300 font-bold">
                                {r.joinedPlayers || 1}/{r.maxPlayers || 2}P
                              </span>{' '}
                              · Entry ₹{r.entryFee} · Win ₹{r.prizePool}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleCreateOrJoinRoom('join_code', r.roomId, r.entryFee, r.maxPlayers || 2)
                            }
                            className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition whitespace-nowrap"
                          >
                            Join ₹{r.entryFee}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 2. REAL PLAYER MATCHMAKING RADAR / WAITING ROOM ==================== */}
        {room && room.status === 'waiting' && (
          room.isPrivate ? (
            <div className="max-w-md mx-auto bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 text-center space-y-5 shadow-2xl my-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <Users className="w-8 h-8 text-cyan-400" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-black text-white">
                  {room.maxPlayers || 2}-Player Private Table Ready!
                </h2>
                <p className="text-xs text-slate-400">
                  Entry Stake: ₹{room.entryFee} · Winner Pool:{' '}
                  <span className="text-emerald-400 font-bold">₹{room.prizePool}</span>
                </p>
              </div>

              {/* Seat Occupancy Cards */}
              <div className="grid grid-cols-2 gap-2.5 text-left">
                {(room.seatOrder || ['player1', 'player2']).map((seatKey, idx) => {
                  const p = room[seatKey];
                  return (
                    <div
                      key={seatKey}
                      className={`p-3 rounded-2xl border ${
                        p
                          ? 'bg-slate-950 border-emerald-500/40 text-white'
                          : 'bg-slate-950/50 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold text-slate-400">Seat #{idx + 1}</div>
                      {p ? (
                        <div className="text-xs font-black text-emerald-300 truncate mt-0.5">
                          {p.flag || getFlagForLocation(p.location)} {p.username}
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-amber-300/80 animate-pulse mt-0.5">
                          Waiting for player...
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="text-xs text-slate-400">Share Room Code with friends anywhere in the world:</div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-mono font-black tracking-wider text-amber-400">
                    {room.roomId}
                  </span>
                  <button
                    onClick={() => copyRoomCode(room.roomId)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleInstantStartFromWaiting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_5px_0_#065F46] active:translate-y-1 transition"
                >
                  Start Now with Online Global Challengers
                </button>
                <button
                  onClick={handleCancelWaitingRoom}
                  className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs transition"
                >
                  Cancel Table & Refund ₹{room.entryFee}
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-lg mx-auto w-full bg-slate-900/95 border-2 border-emerald-500/60 rounded-3xl p-5 sm:p-6 text-center space-y-5 shadow-[0_0_50px_rgba(16,185,129,0.3)] my-4 relative overflow-hidden">
              {/* Custom Keyframe Styles for Pulsing Ripple & Radar Animation */}
              <style>{`
                @keyframes ludoRippleWave {
                  0% {
                    transform: scale(0.6);
                    opacity: 0.95;
                    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.6);
                  }
                  40% {
                    opacity: 0.65;
                  }
                  100% {
                    transform: scale(2.7);
                    opacity: 0;
                    box-shadow: 0 0 0 1px rgba(6, 182, 212, 0), 0 0 45px rgba(16, 185, 129, 0);
                  }
                }
                @keyframes ludoRadarSweep {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes ludoCoreGlow {
                  0%, 100% {
                    box-shadow: 0 0 20px rgba(16, 185, 129, 0.5), inset 0 0 15px rgba(16, 185, 129, 0.3);
                    border-color: rgba(52, 211, 153, 0.9);
                  }
                  50% {
                    box-shadow: 0 0 35px rgba(16, 185, 129, 0.9), inset 0 0 25px rgba(52, 211, 153, 0.7);
                    border-color: rgba(110, 231, 183, 1);
                  }
                }
                @keyframes ludoBlipFade {
                  0%, 100% { transform: scale(0.85); opacity: 0.4; }
                  50% { transform: scale(1.3); opacity: 1; filter: drop-shadow(0 0 8px #34d399); }
                }
                @keyframes ludoMiniRipple {
                  0% { transform: scale(0.7); opacity: 0.9; }
                  100% { transform: scale(2.2); opacity: 0; }
                }
              `}</style>

              {/* Background Ambient Glows */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Top Priority Badge & Animated Title */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 text-[11px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Globe className="w-3.5 h-3.5 animate-spin text-emerald-300" style={{ animationDuration: '8s' }} />
                  <span>LIVE MATCHMAKING · REAL PLAYERS FIRST</span>
                </div>

                {/* Custom 'Searching for real players...' Headline */}
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-100 to-cyan-300 flex items-center justify-center gap-1.5 tracking-tight">
                  <span>Searching for real players</span>
                  <span className="inline-flex gap-1 items-center ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </h2>

                <p className="text-xs text-slate-300 flex items-center justify-center gap-2 flex-wrap">
                  <span>1vs1 Real Match</span>
                  <span className="text-slate-600">|</span>
                  <span>Stake: <strong className="text-amber-300 font-bold">₹{room.entryFee}</strong></span>
                  <span className="text-slate-600">|</span>
                  <span>Win Prize: <strong className="text-emerald-400 font-bold">₹{room.prizePool}</strong></span>
                </p>
              </div>

              {/* Pulsing Ripple Effect & Radar Arena */}
              <div className="relative py-3">
                <div className="relative w-52 h-52 sm:w-60 sm:h-60 mx-auto flex items-center justify-center">
                  {/* Concentric Static Radar Distance Grid */}
                  <div className="absolute inset-0 rounded-full border border-emerald-500/20" />
                  <div className="absolute inset-6 rounded-full border border-emerald-500/25 border-dashed" />
                  <div className="absolute inset-12 rounded-full border border-emerald-500/35" />
                  <div className="absolute inset-20 rounded-full border border-emerald-400/40 bg-emerald-950/30" />

                  {/* Crosshairs Lines */}
                  <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-500/20" />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-500/20" />

                  {/* Pulsing Ripple Wave Layers (Staggered Concentric Expansion) */}
                  <div
                    className="absolute w-24 h-24 rounded-full pointer-events-none"
                    style={{
                      animation: 'ludoRippleWave 3s cubic-bezier(0.1, 0.2, 0.7, 1) infinite',
                      animationDelay: '0s',
                    }}
                  />
                  <div
                    className="absolute w-24 h-24 rounded-full pointer-events-none"
                    style={{
                      animation: 'ludoRippleWave 3s cubic-bezier(0.1, 0.2, 0.7, 1) infinite',
                      animationDelay: '0.75s',
                    }}
                  />
                  <div
                    className="absolute w-24 h-24 rounded-full pointer-events-none"
                    style={{
                      animation: 'ludoRippleWave 3s cubic-bezier(0.1, 0.2, 0.7, 1) infinite',
                      animationDelay: '1.5s',
                    }}
                  />
                  <div
                    className="absolute w-24 h-24 rounded-full pointer-events-none"
                    style={{
                      animation: 'ludoRippleWave 3s cubic-bezier(0.1, 0.2, 0.7, 1) infinite',
                      animationDelay: '2.25s',
                    }}
                  />

                  {/* Rotating Radar Sweep Cone */}
                  <div
                    className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
                    style={{
                      animation: 'ludoRadarSweep 2.8s linear infinite',
                    }}
                  >
                    <div className="w-1/2 h-1/2 bg-gradient-to-br from-emerald-400/50 via-teal-500/20 to-transparent origin-bottom-right" />
                  </div>

                  {/* Live Detected Online Player Blips Across Cities */}
                  <div
                    className="absolute top-9 left-12 flex items-center gap-1 pointer-events-none"
                    style={{ animation: 'ludoBlipFade 2.4s ease-in-out infinite', animationDelay: '0.2s' }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    <span className="text-[9px] font-bold text-emerald-300/80 bg-slate-950/80 px-1 py-0.5 rounded border border-emerald-500/30">
                      Delhi
                    </span>
                  </div>

                  <div
                    className="absolute bottom-12 right-10 flex items-center gap-1 pointer-events-none"
                    style={{ animation: 'ludoBlipFade 2.8s ease-in-out infinite', animationDelay: '1.1s' }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                    <span className="text-[9px] font-bold text-cyan-300/80 bg-slate-950/80 px-1 py-0.5 rounded border border-cyan-500/30">
                      Mumbai
                    </span>
                  </div>

                  <div
                    className="absolute top-14 right-14 flex items-center gap-1 pointer-events-none"
                    style={{ animation: 'ludoBlipFade 2.6s ease-in-out infinite', animationDelay: '1.8s' }}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                    <span className="text-[9px] font-bold text-amber-300/80 bg-slate-950/80 px-1 py-0.5 rounded border border-amber-500/30">
                      Bengaluru
                    </span>
                  </div>

                  {/* Center Live Radar Core with Countdown */}
                  <div
                    className="relative z-10 w-24 h-24 rounded-full bg-slate-950 border-2 flex flex-col items-center justify-center cursor-default"
                    style={{
                      animation: 'ludoCoreGlow 2s ease-in-out infinite',
                    }}
                  >
                    <div className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-emerald-400">
                      <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                      <span>FINDING</span>
                    </div>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-200 to-emerald-400 tabular-nums">
                      {matchmakingCountdown}s
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                      Auto Start
                    </span>
                  </div>
                </div>

                {/* 1vs1 Lineup: You VS Live Opponent */}
                <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 mt-4 text-left">
                  {/* Left: You */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/90 border-2 border-emerald-500/50 relative overflow-hidden shadow-lg">
                    <div className="text-[10px] uppercase font-black text-emerald-400 flex items-center justify-between">
                      <span>YOU (P1)</span>
                      <span>{getFlagForLocation(playerLocation)}</span>
                    </div>
                    <div className="text-sm font-black text-white truncate mt-1">
                      {user?.username || 'You'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {playerLocation}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Ready in Queue</span>
                    </div>
                  </div>

                  {/* Middle: VS Emblem */}
                  <div className="flex flex-col items-center justify-center px-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-emerald-500 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-black text-amber-300">
                        VS
                      </div>
                    </div>
                  </div>

                  {/* Right: Opponent with Pulsing Ripple Beacon */}
                  <div
                    className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all relative overflow-hidden shadow-lg ${
                      matchedRealOpponent
                        ? 'bg-slate-950/90 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                        : 'bg-slate-950/70 border-emerald-500/30'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-black text-slate-400 flex items-center justify-between">
                      <span>OPPONENT (P2)</span>
                      <span>{matchedRealOpponent?.flag || '🔍'}</span>
                    </div>
                    <div
                      className={`text-sm font-black truncate mt-1 ${
                        matchedRealOpponent ? 'text-emerald-300' : 'text-slate-200'
                      }`}
                    >
                      {matchedRealOpponent ? matchedRealOpponent.name : 'Finding Real Player...'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {matchedRealOpponent ? matchedRealOpponent.loc : 'Scanning online pool...'}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold">
                      {matchedRealOpponent ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Real Player Matched!
                        </span>
                      ) : (
                        <span className="text-amber-300/95 flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span
                              className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
                              style={{ animation: 'ludoMiniRipple 1.4s ease-out infinite' }}
                            />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                          </span>
                          <span>Pairing 1vs1...</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Server Status & Real Player Search Banner */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-emerald-300 flex items-center justify-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>{matchmakingStatusText}</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Priority 1 is finding an active real player online. If no real player joins within{' '}
                  <strong className="text-white">{matchmakingCountdown}s</strong>, match automatically starts with an Online Challenger so you never have to wait.
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleInstantStartFromWaiting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-105 text-slate-950 font-black text-xs sm:text-sm shadow-[0_4px_0_#065F46] active:translate-y-0.5 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 fill-current text-slate-950" />
                  <span>Play with Challenger Now (Skip Wait)</span>
                </button>
                <button
                  onClick={handleCancelWaitingRoom}
                  className="w-full py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cancel Search & Refund ₹{room.entryFee}</span>
                </button>
              </div>
            </div>
          )
        )}

        {/* ==================== 3. TRUE 3D 4-COLOR TABLETOP LUDO ARENA VIEW ==================== */}
        {room && (room.status === 'playing' || room.status === 'finished') && (
          <div className="max-w-[440px] mx-auto flex flex-col items-center space-y-1.5">
            {/* TOP ROW: Top-Left Green Seat & Top-Right Yellow Seat */}
            <div className="w-full flex items-stretch justify-between gap-2">
              {renderCornerSeatCard('green', 'Green')}
              {renderCornerSeatCard('yellow', 'Yellow')}
            </div>

            {/* REAL USER MATCH CELEBRATION BANNER */}
            {showRealMatchCelebration && matchedRealOpponent && (
              <div className="w-full px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.55)] flex items-center justify-between gap-2 text-xs animate-bounce z-40">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/30 border border-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-emerald-300 truncate text-[11px] sm:text-xs">
                      🎉 REAL 1VS1 MATCH CONNECTED!
                    </div>
                    <div className="text-[10px] text-slate-200 truncate">
                      Matched live with {matchedRealOpponent.flag} {matchedRealOpponent.name} ({matchedRealOpponent.loc})
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shrink-0 shadow">
                  REAL USER
                </span>
              </div>
            )}

            {/* RECONNECTION COUNTDOWN & DISCONNECTED PLAYER ALERT BANNER */}
            {room.disconnectInfo && (
              <div className="w-full px-3 py-2 rounded-2xl bg-gradient-to-r from-rose-950 via-amber-950 to-slate-900 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-between gap-2 text-xs animate-pulse z-30">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-400 flex items-center justify-center shrink-0">
                    <Radio className="w-4 h-4 text-amber-300 animate-spin" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-amber-300 flex items-center gap-1.5 truncate text-[11px] sm:text-xs">
                      <span>⚠️ {room.disconnectInfo.uid === user?.uid ? 'You are disconnected' : `${room.disconnectInfo.username} Disconnected`}</span>
                    </div>
                    <div className="text-[10px] text-slate-300 truncate">
                      {room.disconnectInfo.uid === user?.uid
                        ? 'Attempting to reconnect match...'
                        : 'Automatic win awarded if not reconnected in'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-500/50 shadow-inner">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Time</span>
                  <span className="font-mono text-base font-black text-amber-400 tabular-nums">
                    {room.disconnectInfo.remainingSeconds}s
                  </span>
                </div>
              </div>
            )}

            {/* LIVE GAME STATUS, VOICE STATUS & PRIZE POOL BAR */}
            <div className="w-full px-3 py-1 rounded-xl bg-slate-950/95 border border-amber-500/30 flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-black text-emerald-400 shrink-0">₹{room.prizePool}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-200 font-semibold truncate">{room.lastAction}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] text-cyan-300 flex items-center gap-1">
                  <Radio className={`w-3 h-3 ${micEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                  <span className="hidden sm:inline">{voiceStatusNote}</span>
                </span>
                <span
                  className={`font-black uppercase tracking-wider ${
                    isMyTurn ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {room.status === 'finished'
                    ? 'FINISHED'
                    : isMyTurn
                    ? '● YOUR TURN'
                    : `● ${room[room.turn]?.username?.slice(0, 8) || 'OPPONENT'}`}
                </span>
              </div>
            </div>

            {/* ==================== TRUE 3D TABLETOP STADIUM LUDO BOARD ==================== */}
            <div className="relative w-full aspect-square p-2 rounded-[26px] bg-gradient-to-b from-[#6B2D0E] via-[#3E1805] to-[#1F0B02] border-2 border-amber-400/80 shadow-[0_10px_0_#1A0902,0_18px_36px_rgba(0,0,0,0.9),inset_0_2px_6px_rgba(255,220,130,0.55)]">
              {/* 4 Corner 3D Brass Bolts */}
              <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-200 to-amber-700 border border-slate-950 shadow-inner" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-200 to-amber-700 border border-slate-950 shadow-inner" />
              <span className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-200 to-amber-700 border border-slate-950 shadow-inner" />
              <span className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-200 to-amber-700 border border-slate-950 shadow-inner" />

              <div className="relative w-full h-full rounded-[18px] overflow-hidden border-[3px] border-amber-300/90 bg-[#1E293B] shadow-[inset_0_4px_12px_rgba(0,0,0,0.75)]">
                {/* High-Detail 3D Beveled 600x600 SVG Board */}
                <svg viewBox="0 0 600 600" className="w-full h-full block">
                  <defs>
                    <linearGradient id="red3D" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FB7185" />
                      <stop offset="45%" stopColor="#E11D48" />
                      <stop offset="100%" stopColor="#881337" />
                    </linearGradient>
                    <linearGradient id="green3D" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#34D399" />
                      <stop offset="45%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#064E3B" />
                    </linearGradient>
                    <linearGradient id="yellow3D" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FDE047" />
                      <stop offset="45%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#78350F" />
                    </linearGradient>
                    <linearGradient id="blue3D" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#60A5FA" />
                      <stop offset="45%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#1E3A8A" />
                    </linearGradient>
                    <linearGradient id="ivoryTile3D" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="75%" stopColor="#F1F5F9" />
                      <stop offset="100%" stopColor="#CBD5E1" />
                    </linearGradient>
                    <radialGradient id="pedestalRecess" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#0F172A" stopOpacity="0.2" />
                      <stop offset="75%" stopColor="#0F172A" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#0F172A" stopOpacity="0.7" />
                    </radialGradient>
                  </defs>

                  {/* 1. Render all 15x15 3D Beveled Track Tiles */}
                  {Array.from({ length: 15 }).map((_, r) =>
                    Array.from({ length: 15 }).map((__, c) => {
                      const inTopLeft = r < 6 && c < 6;
                      const inTopRight = r < 6 && c > 8;
                      const inBottomLeft = r > 8 && c < 6;
                      const inBottomRight = r > 8 && c > 8;
                      const inCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;
                      if (inTopLeft || inTopRight || inBottomLeft || inBottomRight || inCenter) return null;

                      const isRedStart = r === 13 && c === 6;
                      const isGreenStart = r === 6 && c === 1;
                      const isYellowStart = r === 1 && c === 8;
                      const isBlueStart = r === 8 && c === 13;

                      const isRedStretch = c === 7 && r >= 9 && r <= 13;
                      const isGreenStretch = r === 7 && c >= 1 && c <= 5;
                      const isYellowStretch = c === 7 && r >= 1 && r <= 5;
                      const isBlueStretch = r === 7 && c >= 9 && c <= 13;

                      const isColored =
                        isRedStart || isGreenStart || isYellowStart || isBlueStart ||
                        isRedStretch || isGreenStretch || isYellowStretch || isBlueStretch;

                      const isStar = STAR_COORDS.has(`${r},${c}`);
                      const dirArrow = TRACK_DIRECTION_ARROWS[`${r},${c}`];

                      let fill = 'url(#ivoryTile3D)';
                      if (isRedStart || isRedStretch) fill = 'url(#red3D)';
                      else if (isGreenStart || isGreenStretch) fill = 'url(#green3D)';
                      else if (isYellowStart || isYellowStretch) fill = 'url(#yellow3D)';
                      else if (isBlueStart || isBlueStretch) fill = 'url(#blue3D)';

                      const x = c * 40;
                      const y = r * 40;
                      const cx = x + 20;
                      const cy = y + 20;

                      return (
                        <g key={`tile-${r}-${c}`}>
                          <rect x={x} y={y} width={40} height={40} fill="#334155" />
                          <rect
                            x={x + 1.5}
                            y={y + 1.5}
                            width={37}
                            height={37}
                            rx={5}
                            fill={fill}
                            stroke={isColored ? 'rgba(255,255,255,0.45)' : '#FFFFFF'}
                            strokeWidth="1.2"
                          />
                          <line
                            x1={x + 3}
                            y1={y + 37.5}
                            x2={x + 37}
                            y2={y + 37.5}
                            stroke="rgba(15,23,42,0.35)"
                            strokeWidth="2"
                          />

                          {!isStar && dirArrow && (
                            <text
                              x={cx}
                              y={cy + 4}
                              textAnchor="middle"
                              fontSize="10"
                              fill={isColored ? 'rgba(255,255,255,0.65)' : '#94A3B8'}
                              fontWeight="900"
                            >
                              {dirArrow}
                            </text>
                          )}

                          {isStar && (
                            <g>
                              <circle
                                cx={cx}
                                cy={cy}
                                r={13.5}
                                fill={isColored ? 'rgba(15,23,42,0.35)' : 'rgba(245,158,11,0.18)'}
                                stroke={isColored ? '#FDE047' : '#F59E0B'}
                                strokeWidth="1.2"
                              />
                              <polygon
                                points={`${cx},${cy - 10.5} ${cx + 3},${cy - 3.2} ${cx + 10.5},${cy - 3.2} ${cx + 4.5},${cy + 1.8} ${cx + 6.8},${cy + 9.2} ${cx},${cy + 4.8} ${cx - 6.8},${cy + 9.2} ${cx - 4.5},${cy + 1.8} ${cx - 10.5},${cy - 3.2} ${cx - 3},${cy - 3.2}`}
                                fill={isColored ? '#FFFBEB' : '#F59E0B'}
                                stroke="#78350F"
                                strokeWidth="1"
                              />
                            </g>
                          )}

                          {r === 14 && c === 7 && (
                            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="15" fill="#E11D48" fontWeight="900">▲</text>
                          )}
                          {r === 0 && c === 7 && (
                            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="15" fill="#D97706" fontWeight="900">▼</text>
                          )}
                          {r === 7 && c === 0 && (
                            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="15" fill="#059669" fontWeight="900">▶</text>
                          )}
                          {r === 7 && c === 14 && (
                            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="15" fill="#2563EB" fontWeight="900">◀</text>
                          )}
                        </g>
                      );
                    })
                  )}

                  {/* 2. Four 6x6 3D Sculpted Corner Yards (240x240 each) */}
                  {/* Top-Left Green 3D Yard */}
                  <g opacity={playerByColor.green ? 1 : 0.45}>
                    <rect x={0} y={0} width={240} height={240} fill="url(#green3D)" stroke="#0F172A" strokeWidth="3" />
                    <rect x={12} y={12} width={216} height={216} rx={26} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                    <rect x={28} y={28} width={184} height={184} rx={24} fill="#F8FAFC" stroke="#047857" strokeWidth="5" />
                    {[[78, 78], [162, 78], [78, 162], [162, 162]].map(([px, py], i) => (
                      <g key={`gy-${i}`}>
                        <circle cx={px} cy={py} r={24} fill="url(#green3D)" stroke="#FDE047" strokeWidth="2.5" />
                        <circle cx={px} cy={py} r={17} fill="url(#pedestalRecess)" stroke="#A7F3D0" strokeWidth="1.5" />
                      </g>
                    ))}
                  </g>

                  {/* Top-Right Yellow 3D Yard */}
                  <g opacity={playerByColor.yellow ? 1 : 0.45}>
                    <rect x={360} y={0} width={240} height={240} fill="url(#yellow3D)" stroke="#0F172A" strokeWidth="3" />
                    <rect x={372} y={12} width={216} height={216} rx={26} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
                    <rect x={388} y={28} width={184} height={184} rx={24} fill="#FFFBEB" stroke="#B45309" strokeWidth="5" />
                    {[[438, 78], [522, 78], [438, 162], [522, 162]].map(([px, py], i) => (
                      <g key={`yy-${i}`}>
                        <circle cx={px} cy={py} r={24} fill="url(#yellow3D)" stroke="#78350F" strokeWidth="2.5" />
                        <circle cx={px} cy={py} r={17} fill="url(#pedestalRecess)" stroke="#FDE68A" strokeWidth="1.5" />
                      </g>
                    ))}
                  </g>

                  {/* Bottom-Left Red 3D Yard */}
                  <g opacity={playerByColor.red ? 1 : 0.45}>
                    <rect x={0} y={360} width={240} height={240} fill="url(#red3D)" stroke="#0F172A" strokeWidth="3" />
                    <rect x={12} y={372} width={216} height={216} rx={26} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                    <rect x={28} y={388} width={184} height={184} rx={24} fill="#FFF1F2" stroke="#9F1239" strokeWidth="5" />
                    {[[78, 438], [162, 438], [78, 522], [162, 522]].map(([px, py], i) => (
                      <g key={`ry-${i}`}>
                        <circle cx={px} cy={py} r={24} fill="url(#red3D)" stroke="#FDE047" strokeWidth="2.5" />
                        <circle cx={px} cy={py} r={17} fill="url(#pedestalRecess)" stroke="#FECDD3" strokeWidth="1.5" />
                      </g>
                    ))}
                  </g>

                  {/* Bottom-Right Blue 3D Yard */}
                  <g opacity={playerByColor.blue ? 1 : 0.45}>
                    <rect x={360} y={360} width={240} height={240} fill="url(#blue3D)" stroke="#0F172A" strokeWidth="3" />
                    <rect x={372} y={372} width={216} height={216} rx={26} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                    <rect x={388} y={388} width={184} height={184} rx={24} fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="5" />
                    {[[438, 438], [522, 438], [438, 522], [522, 522]].map(([px, py], i) => (
                      <g key={`by-${i}`}>
                        <circle cx={px} cy={py} r={24} fill="url(#blue3D)" stroke="#FDE047" strokeWidth="2.5" />
                        <circle cx={px} cy={py} r={17} fill="url(#pedestalRecess)" stroke="#BFDBFE" strokeWidth="1.5" />
                      </g>
                    ))}
                  </g>

                  {/* 3. Center 3x3 3D Faceted Crown Victory Zone (240..360) */}
                  <g>
                    <polygon points="240,240 300,300 240,360" fill="url(#green3D)" stroke="#FDE047" strokeWidth="2" />
                    <polygon points="240,240 360,240 300,300" fill="url(#yellow3D)" stroke="#FDE047" strokeWidth="2" />
                    <polygon points="360,240 360,360 300,300" fill="url(#blue3D)" stroke="#FDE047" strokeWidth="2" />
                    <polygon points="240,360 360,360 300,300" fill="url(#red3D)" stroke="#FDE047" strokeWidth="2" />
                    <rect x={240} y={240} width={120} height={120} fill="none" stroke="#FDE047" strokeWidth="3" />
                    <circle cx={300} cy={300} r={20} fill="#0F172A" stroke="#FBBF24" strokeWidth="2.5" />
                    <text x={300} y={306} textAnchor="middle" fontSize="16">👑</text>
                  </g>
                </svg>

                {/* ==================== STEP-BY-STEP HOP TRAIL & PATH PREVIEW ==================== */}
                <div className="absolute inset-0 pointer-events-none">
                  {stepTrail.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        top: `${((t.row + 0.5) / 15) * 100}%`,
                        left: `${((t.col + 0.5) / 15) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      className={`absolute w-5 h-5 rounded-md animate-ping ${
                        t.color === 'red'
                          ? 'bg-rose-400/50 border border-rose-200'
                          : t.color === 'green'
                          ? 'bg-emerald-400/50 border border-emerald-200'
                          : t.color === 'yellow'
                          ? 'bg-amber-300/50 border border-amber-100'
                          : 'bg-blue-400/50 border border-blue-200'
                      }`}
                    />
                  ))}

                  {pathStepDots.map((dot, idx) => (
                    <div
                      key={`pdot-${idx}`}
                      style={{
                        top: `${((dot.row + 0.5) / 15) * 100}%`,
                        left: `${((dot.col + 0.5) / 15) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      className="absolute w-3.5 h-3.5 rounded-full bg-amber-400/90 border border-slate-950 text-[8px] font-black text-slate-950 flex items-center justify-center shadow"
                    >
                      {dot.stepNum}
                    </div>
                  ))}

                  {destinationPreviews.map((dest, i) => (
                    <div
                      key={`dest-${i}`}
                      style={{
                        top: `${((dest.row + 0.5) / 15) * 100}%`,
                        left: `${((dest.col + 0.5) / 15) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      className={`absolute w-7 h-7 rounded-xl border-2 animate-pulse flex items-center justify-center ${
                        dest.isCut
                          ? 'border-rose-500 bg-rose-500/35 shadow-[0_0_12px_rgba(244,63,94,0.9)]'
                          : 'border-emerald-400 bg-emerald-400/30 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                      }`}
                    >
                      {dest.isCut && <span className="text-[10px]">⚔️</span>}
                    </div>
                  ))}
                </div>

                {/* ==================== INTERACTIVE 3D SCULPTED PAWNS (ALL ACTIVE SEATS) ==================== */}
                <div className="absolute inset-0 pointer-events-none">
                  {(['red', 'green', 'yellow', 'blue'] as LudoColor[]).map((col) => {
                    const seatInfo = playerByColor[col];
                    if (!seatInfo) return null;
                    return (visualPawns[col] || [0, 0, 0, 0]).map((step, idx) => {
                      const coord = pawnTopLeftCoords[col]?.[idx] ?? getPawnCellCoord(col, step, idx);
                      const { shiftX, shiftY, isStacked } = getCombinedCellStackOffset(col, idx);
                      const canMove =
                        isMyTurn &&
                        myColor === col &&
                        room.hasRolled &&
                        !isTokenWalking &&
                        hoppingToken === null &&
                        rollingPlayerKey === null &&
                        (room.movablePawns || []).includes(idx);
                      const isThisHopping = hoppingToken?.color === col && hoppingToken.idx === idx;
                      const badgeLabel = room.diceValue ? (step === 0 ? 'OPEN' : `+${room.diceValue}`) : null;

                      return (
                        <button
                          key={`${col}-token-${idx}`}
                          type="button"
                          onClick={() => canMove && handleMovePawn(idx)}
                          style={{
                            top: coord.top,
                            left: coord.left,
                            transform: `translate(calc(-50% + ${shiftX}px), calc(-76% + ${shiftY}px))`
                          }}
                          className={`absolute transition-all duration-200 ease-in-out touch-manipulation ${
                            canMove ? 'pointer-events-auto cursor-pointer z-40' : isThisHopping ? 'z-50' : 'z-20'
                          }`}
                          title={`${col.toUpperCase()} Token #${idx + 1}`}
                        >
                          <Sculpted3DPawn
                            color={col}
                            number={idx + 1}
                            isHopping={isThisHopping}
                            canMove={Boolean(canMove)}
                            isStacked={isStacked}
                            badgeText={badgeLabel}
                          />
                        </button>
                      );
                    });
                  })}
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: Bottom-Left Red Seat & Bottom-Right Blue Seat */}
            <div className="w-full flex items-stretch justify-between gap-2">
              {renderCornerSeatCard('red', 'Red')}
              {renderCornerSeatCard('blue', 'Blue')}
            </div>

            {/* ==================== 15s TURN TIMEOUT & ANTI-AFK TIMER BAR ==================== */}
            {room.status === 'playing' && (
              <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2.5 shadow-lg space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isMyTurn ? 'bg-amber-400 animate-ping' : 'bg-slate-500'
                      }`}
                    />
                    <span className="font-black text-white flex items-center gap-1.5">
                      {isMyTurn ? (
                        <span className="text-amber-300">
                          YOUR TURN — {room.hasRolled ? 'TAP TOKEN TO MOVE' : 'ROLL 3D DICE'}
                        </span>
                      ) : (
                        <span className="text-slate-300">
                          {room[room.turn]?.username || 'Opponent'}'s Turn...
                        </span>
                      )}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 font-mono font-black text-xs px-2.5 py-0.5 rounded-full border transition-all ${
                      turnTimeRemaining <= 4
                        ? 'bg-rose-500/25 border-rose-400 text-rose-300 animate-pulse'
                        : turnTimeRemaining <= 8
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{turnTimeRemaining}s</span>
                    {isMyTurn && <span className="text-[10px] opacity-80">(Auto)</span>}
                  </div>
                </div>

                {/* 15s Turn Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-1000 ease-linear ${
                      turnTimeRemaining <= 4
                        ? 'bg-gradient-to-r from-rose-500 to-red-600'
                        : turnTimeRemaining <= 8
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                        : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, (turnTimeRemaining / 15) * 100))}%` }}
                  />
                </div>
              </div>
            )}

            {/* INTERACTIVE MAIN TURN ACTION BAR (ROLL DICE + LIVE VOICE MIC + CHAT + LEAVE) */}
            <div className="w-full flex items-center justify-between gap-2 pt-0.5">
              {room.status === 'playing' && (
                <button
                  type="button"
                  onClick={handleRollDice}
                  disabled={
                    !isMyTurn ||
                    room.hasRolled ||
                    rollingPlayerKey !== null ||
                    isTokenWalking ||
                    hoppingToken !== null
                  }
                  className={`flex-1 py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 touch-manipulation ${
                    isMyTurn &&
                    !room.hasRolled &&
                    rollingPlayerKey === null &&
                    !isTokenWalking &&
                    hoppingToken === null
                      ? 'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_4px_0_#92400E] ring-2 ring-white cursor-pointer active:translate-y-0.5'
                      : 'bg-slate-900/95 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>
                    {rollingPlayerKey === myRole
                      ? '🎲 Rolling 3D Dice...'
                      : isTokenWalking || hoppingToken
                      ? '✨ Moving Token Step-by-Step...'
                      : isMyTurn && room.hasRolled && room.diceValue
                      ? `✨ Rolled ${room.diceValue} — Tap Glowing Token!`
                      : isMyTurn
                      ? '🎲 TAP TO ROLL 3D DICE'
                      : `Waiting for ${room[room.turn]?.username || 'Opponent'}...`}
                  </span>
                </button>
              )}

              {/* Live Mic Quick Button */}
              {featureFlags.voiceChat && (
                <button
                  type="button"
                  onClick={handleToggleMicrophone}
                  className={`p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-lg transition ${
                    micEnabled
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                  title={micEnabled ? 'Mute Voice Chat Mic' : 'Enable Voice Chat Mic'}
                >
                  {micEnabled ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
                  <span className="text-[9px] font-bold mt-0.5">{micEnabled ? 'Voice ON' : 'Voice'}</span>
                </button>
              )}

              {/* Live Chat Drawer Button */}
              {chatEnabled && featureFlags.textChat && (
                <button
                  type="button"
                  onClick={() => setShowChatDrawer(!showChatDrawer)}
                  className="relative p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 text-amber-400 flex flex-col items-center justify-center shrink-0 shadow-lg transition"
                  title="Open Live Match Chat"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-[9px] font-bold text-slate-300 mt-0.5">Chat</span>
                  {unreadChatCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center border border-white">
                      {unreadChatCount}
                    </span>
                  )}
                </button>
              )}

              {/* Resign / Leave Match Button */}
              {room.status === 'playing' && (
                <button
                  type="button"
                  onClick={() => setShowForfeitConfirm(!showForfeitConfirm)}
                  className="p-2.5 rounded-2xl bg-slate-900 hover:bg-rose-950/60 border-2 border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 flex flex-col items-center justify-center shrink-0 shadow-lg transition"
                  title="Forfeit / Leave Match"
                >
                  <Flag className="w-4 h-4" />
                  <span className="text-[9px] font-bold mt-0.5">Leave</span>
                </button>
              )}
            </div>

            {/* LIVE VOICE CHAT & INSTANT SPOKEN CALLOUT BAR */}
            {featureFlags.voiceChat && room.status === 'playing' && (
              <div className="w-full px-3 py-2 rounded-2xl bg-slate-900/95 border border-emerald-500/35 flex flex-col gap-1.5 shadow-lg">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={handleToggleMicrophone}
                      className={`px-2.5 py-1 rounded-xl font-black text-[10px] flex items-center gap-1.5 border transition shrink-0 ${
                        micEnabled
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      {micEnabled ? <Mic className="w-3 h-3 animate-bounce" /> : <MicOff className="w-3 h-3" />}
                      <span>{micEnabled ? 'MIC LIVE' : 'TURN ON MIC'}</span>
                    </button>

                    {/* Live Mic Volume Meter */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-16 sm:w-24 h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 transition-all duration-150"
                          style={{ width: `${micEnabled ? Math.max(12, micLevel) : 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-emerald-300 font-bold truncate">
                        {micEnabled
                          ? isLocalSpeaking
                            ? 'Speaking Live...'
                            : voiceFallbackMode
                            ? 'Tap Voice Below'
                            : 'Listening...'
                          : 'Tap to Talk'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleSpeaker}
                    className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                      speakerEnabled
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <Headphones className="w-3 h-3" />
                    <span>{speakerEnabled ? 'Speaker ON' : 'Muted'}</span>
                  </button>
                </div>

                {/* 1-Tap Spoken Voice Talk Buttons (Speaks Out Loud on All Players' Speakers) */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                  <span className="text-[10px] font-black text-emerald-400 shrink-0">🎙️ Speak:</span>
                  {[
                    'Roll fast bro!',
                    'Six aayega abhi!',
                    'Bach ke rehna!',
                    'Nice move!',
                    'Haha super cut!',
                    'Good game brother!'
                  ].map((vPhrase) => (
                    <button
                      key={vPhrase}
                      type="button"
                      onClick={() => handleBroadcastVoicePhrase(vPhrase)}
                      className="px-2 py-1 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-500/35 text-[10px] font-bold whitespace-nowrap shrink-0 active:scale-95 transition"
                    >
                      🔊 {vPhrase}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Inline Forfeit Confirmation Bar */}
            {showForfeitConfirm && room.status === 'playing' && (
              <div className="w-full px-3 py-2 rounded-2xl bg-rose-950/90 border border-rose-500/60 flex items-center justify-between gap-2 text-xs">
                <span className="text-rose-100 font-semibold">Forfeit match and award win to opponent?</span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleForfeitActiveMatch}
                    className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-black text-xs"
                  >
                    Yes, Forfeit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForfeitConfirm(false)}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 font-bold text-xs"
                  >
                    Stay
                  </button>
                </div>
              </div>
            )}

            {/* 3D Token Selection Strip when Player has Rolled */}
            {room.status === 'playing' &&
              isMyTurn &&
              room.hasRolled &&
              (room.movablePawns || []).length > 0 &&
              !isTokenWalking &&
              hoppingToken === null &&
              rollingPlayerKey === null && (
                <div className="w-full bg-gradient-to-r from-slate-900 via-rose-950/75 to-slate-900 border-2 border-amber-400 rounded-2xl p-2 flex flex-col gap-1.5 shadow-xl">
                  <div className="flex items-center justify-between text-xs font-black text-white px-1">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        You Rolled <span className="text-amber-300 text-sm">{room.diceValue}</span>! Choose Token to Move:
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 1, 2, 3].map((pIdx) => {
                      const isMovable = (room.movablePawns || []).includes(pIdx);
                      const curStep = (activeMyPlayer?.pawns || [0, 0, 0, 0])[pIdx] ?? 0;
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          disabled={!isMovable}
                          onClick={() => handleMovePawn(pIdx)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-black transition flex flex-col items-center touch-manipulation ${
                            isMovable
                              ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 shadow-[0_3px_0_#78350F] active:translate-y-0.5 cursor-pointer'
                              : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <span>Token #{pIdx + 1}</span>
                          <span className="text-[10px] opacity-85">
                            {curStep === 0 ? 'Open ★' : curStep === 57 ? 'Home 👑' : `Step +${room.diceValue}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Quick 1-Tap Emoji & Phrase Bar for 1vs1 Real Matches */}
            {chatEnabled && featureFlags.textChat && room.status === 'playing' && (
              <div className="w-full bg-slate-950/85 border border-slate-800/90 rounded-2xl p-2 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Smile className="w-3.5 h-3.5" />
                    <span>Quick Reactions:</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Tap to express in real time</span>
                </div>

                {/* 1-Tap Emojis */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        handleSendMatchChat(emoji, 'emoji');
                        playTone(760, 100, 'sine', 0.08);
                      }}
                      className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-base flex items-center justify-center shrink-0 active:scale-125 transition-transform"
                      title={`Send ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* 1-Tap Tactical Phrases */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {QUICK_1VS1_REACTIONS.map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() => {
                        handleSendMatchChat(phrase, 'quick');
                        playTone(640, 100, 'sine', 0.08);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold whitespace-nowrap shrink-0 active:scale-95 transition"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Collapsible Live Match Chat Drawer */}
            {chatEnabled && featureFlags.textChat && showChatDrawer && (
              <div className="w-full bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-2">
                <div className="px-4 py-2.5 bg-slate-950 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      Live Table Chat ({room.roomId})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleChatEnabled}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Disable Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowChatDrawer(false)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-44 overflow-y-auto px-4 py-2 space-y-2">
                  {(room.chatMessages || []).map((msg) => {
                    if (msg.messageType === 'system') {
                      return (
                        <div key={msg.id} className="text-center text-[10px] text-amber-300/80 py-0.5">
                          {msg.text}
                        </div>
                      );
                    }
                    const isMe = msg.senderUid === user?.uid;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-slate-400">
                          {msg.senderName} ({msg.senderLocation})
                        </span>
                        <div
                          className={`px-3 py-1.5 rounded-2xl text-xs max-w-[85%] ${
                            isMe
                              ? 'bg-amber-400 text-slate-950 font-bold rounded-br-none'
                              : 'bg-slate-800 text-white border border-slate-700 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMatchChat();
                  }}
                  className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2"
                >
                  <input
                    type="text"
                    value={matchChatInput}
                    onChange={(e) => setMatchChatInput(e.target.value)}
                    placeholder="Say something to table players..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}

            {/* ==================== MATCH FINISHED 3D VICTORY / DEFEAT POPUP MODAL + BOARD SUMMARY ==================== */}
            {room.status === 'finished' && (
              <>
                {/* Compact Board-Bottom Summary Bar (visible if user closes 3D modal to inspect board) */}
                <div className="w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400 rounded-3xl p-4 text-center space-y-3 shadow-2xl mt-2">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                        {room.winner === myRole ? '👑 CHAMPION VICTORY!' : '🎲 MATCH COMPLETED'}
                      </span>
                      <h4 className="text-sm font-black text-white">
                        {room.winner === myRole
                          ? `You Won ₹${room.prizePool}!`
                          : `${room[room.winner || 'player1']?.username || 'Opponent'} Won ₹${room.prizePool}`}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResult3DModal(true);
                        if (room.winner === myRole) {
                          soundFx.play3dVictoryTrumpet(true);
                        } else {
                          soundFx.play3dDefeatTrombone(true);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 font-black text-xs flex items-center gap-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Open 3D Result Popup</span>
                    </button>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRoom(null);
                        setRecoverableRoom(null);
                      }}
                      className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
                    >
                      Back to Lobby
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInstantRematch(1)}
                      className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-105 text-slate-950 font-black text-xs shadow-[0_4px_0_#92400E] flex items-center justify-center gap-1.5 active:translate-y-0.5 transition"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>⚡ Instant Rematch (₹{room.entryFee})</span>
                    </button>
                  </div>
                </div>

                {/* FULL-SCREEN 3D LUDO WIN / LOSS POPUP MODAL */}
                {showResult3DModal && (
                  <div
                    className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 [perspective:1200px]"
                    onClick={() => setShowResult3DModal(false)}
                    role="dialog"
                    aria-modal="true"
                  >
                    {(() => {
                      const isLudoWin = room.winner === myRole;
                      const winnerSeat = room.winner || 'player1';
                      const winnerPlayer = room[winnerSeat];

                      return (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className={`w-full max-w-md rounded-3xl overflow-hidden relative transition-all transform animate-in zoom-in-95 duration-300 select-none [transform:rotateX(2deg)] ${
                            isLudoWin
                              ? 'bg-gradient-to-b from-slate-900 via-emerald-950/90 to-slate-950 border-2 border-amber-400 shadow-[0_20px_60px_rgba(245,158,11,0.45),0_0_30px_rgba(16,185,129,0.35),inset_0_2px_2px_rgba(255,255,255,0.35)]'
                              : 'bg-gradient-to-b from-slate-900 via-rose-950/85 to-slate-950 border-2 border-rose-500/80 shadow-[0_20px_60px_rgba(225,29,72,0.45),0_0_25px_rgba(159,18,57,0.35),inset_0_2px_2px_rgba(255,255,255,0.2)]'
                          }`}
                        >
                          {/* Top 3D Radial Spotlight */}
                          <div
                            className={`absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-40 blur-3xl pointer-events-none rounded-full ${
                              isLudoWin ? 'bg-amber-400/40' : 'bg-rose-500/35'
                            }`}
                          />

                          {/* Top Bar: Room Badge + Replay 3D Sound + Close */}
                          <div className="relative z-20 flex items-center justify-between px-4 pt-4">
                            <span className="px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-[10px] font-mono font-bold text-slate-300">
                              TABLE #{room.roomId} · {room.maxPlayers || 2}P
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isLudoWin) {
                                    soundFx.play3dVictoryTrumpet(true);
                                    confetti({
                                      particleCount: 70,
                                      spread: 65,
                                      origin: { y: 0.55 }
                                    });
                                  } else {
                                    soundFx.play3dDefeatTrombone(true);
                                  }
                                }}
                                className={`px-2.5 h-8 rounded-full flex items-center gap-1 text-[10px] font-black transition active:scale-95 ${
                                  isLudoWin
                                    ? 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/50'
                                    : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/50'
                                }`}
                                title="Replay 3D Victory / Defeat Audio"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Replay 3D Sound</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setShowResult3DModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-slate-300 border border-slate-700 flex items-center justify-center"
                                title="Inspect Board"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* 3D SCULPTED EMBLEM & HEADLINE */}
                          <div className="px-5 pt-2 pb-4 text-center relative z-10 space-y-3">
                            {isLudoWin ? (
                              /* 3D ROYAL GOLDEN TROPHY & FLOATING 3D CROWN EMBLEM */
                              <div className="relative inline-flex items-center justify-center py-2">
                                <div className="absolute w-36 h-36 rounded-full bg-amber-400/30 blur-2xl animate-pulse pointer-events-none" />
                                {/* Floating Left 3D Gold Coin */}
                                <div className="absolute -left-9 top-3 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-300 to-white border-2 border-yellow-200 flex items-center justify-center shadow-[0_6px_15px_rgba(245,158,11,0.8)] animate-bounce">
                                  <span className="font-mono text-xs font-black text-amber-950">₹</span>
                                </div>
                                {/* Floating Right 3D Six-Pip Dice Badge */}
                                <div className="absolute -right-9 top-4 w-8 h-8 rounded-xl bg-gradient-to-br from-white via-amber-100 to-amber-300 border-2 border-amber-400 flex items-center justify-center shadow-[0_6px_15px_rgba(245,158,11,0.8)] animate-bounce [animation-delay:150ms] rotate-12">
                                  <span className="text-xs font-black text-rose-600">🎲</span>
                                </div>
                                {/* 3D Sculpted Trophy pedestal */}
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-700 p-1 shadow-[0_10px_0_#78350F,0_18px_35px_rgba(245,158,11,0.75)] flex items-center justify-center relative">
                                  <div className="w-full h-full rounded-[20px] bg-gradient-to-b from-amber-950/90 via-slate-950 to-amber-950 flex flex-col items-center justify-center border border-yellow-300/60">
                                    <Crown className="w-6 h-6 text-yellow-300 fill-yellow-300 -mb-1 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)] animate-pulse" />
                                    <Trophy className="w-11 h-11 text-amber-400 drop-shadow-[0_4px_10px_rgba(245,158,11,0.9)]" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* 3D SHATTERED RUBY SHIELD & DEFEAT EMBLEM */
                              <div className="relative inline-flex items-center justify-center py-2">
                                <div className="absolute w-32 h-32 rounded-full bg-rose-600/30 blur-2xl pointer-events-none" />
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-b from-rose-400 via-rose-600 to-rose-950 p-1 shadow-[0_10px_0_#4C0519,0_18px_35px_rgba(225,29,72,0.65)] flex items-center justify-center relative">
                                  <div className="w-full h-full rounded-[20px] bg-gradient-to-b from-rose-950 via-slate-950 to-rose-950 flex flex-col items-center justify-center border border-rose-400/50">
                                    <Swords className="w-11 h-11 text-rose-400 drop-shadow-[0_4px_10px_rgba(244,63,94,0.8)]" />
                                  </div>
                                </div>
                              </div>
                            )}

                            <div>
                              <span
                                className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                  isLudoWin
                                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                }`}
                              >
                                {isLudoWin ? '3D ROYAL LUDO CHAMPION' : 'LUDO BATTLE FINISHED'}
                              </span>

                              <h2
                                className={`text-2xl sm:text-3xl font-black mt-1.5 tracking-tight ${
                                  isLudoWin
                                    ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]'
                                    : 'text-white'
                                }`}
                              >
                                {isLudoWin ? 'YOU WON THE TABLE!' : 'BETTER LUCK NEXT MATCH!'}
                              </h2>

                              <p className="text-xs text-slate-300 mt-1">{room.winReason}</p>
                            </div>

                            {/* 3D PRIZE / OUTCOME VAULT CARD */}
                            <div
                              className={`p-3.5 rounded-2xl border-2 shadow-inner ${
                                isLudoWin
                                  ? 'bg-gradient-to-r from-emerald-950/90 via-slate-950 to-emerald-950/90 border-emerald-400/70'
                                  : 'bg-slate-950/90 border-rose-500/40'
                              }`}
                            >
                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                {isLudoWin ? 'INSTANT WALLET PAYOUT CREDITED' : `WINNER: ${winnerPlayer?.username || 'OPPONENT'}`}
                              </div>
                              <div
                                className={`font-mono font-black text-3xl sm:text-4xl mt-0.5 tabular-nums ${
                                  isLudoWin ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {isLudoWin ? `+₹${room.prizePool}` : `-₹${room.entryFee}`}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {isLudoWin
                                  ? `Entry Stake ₹${room.entryFee} · Net Profit +₹${room.prizePool - room.entryFee}`
                                  : `Winner Prize Pool: ₹${room.prizePool} · Entry Stake: ₹${room.entryFee}`}
                              </div>
                            </div>

                            {/* PLAYER SCOREBOARD PODIUM */}
                            <div className="grid grid-cols-2 gap-2 bg-slate-950/90 p-2.5 rounded-2xl border border-slate-800 text-left">
                              {(room.seatOrder || ['player1', 'player2']).map((seatKey) => {
                                const p = room[seatKey];
                                if (!p) return null;
                                const isWinnerSeat = room.winner === seatKey;
                                return (
                                  <div
                                    key={seatKey}
                                    className={`p-2.5 rounded-xl border ${
                                      isWinnerSeat
                                        ? 'border-amber-400/70 bg-amber-500/15 shadow-md'
                                        : 'border-slate-800 bg-slate-900/60'
                                    }`}
                                  >
                                    <div className="text-xs text-white font-bold truncate flex items-center justify-between">
                                      <span className="truncate">
                                        {p.flag || getFlagForLocation(p.location)} {p.username}
                                      </span>
                                      {isWinnerSeat && <span>👑</span>}
                                    </div>
                                    <div className="text-base font-black text-amber-400 tabular-nums mt-0.5">
                                      {p.score} pts
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      Home: {p.homeCount}/4 · Cuts: {p.captures}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex gap-2.5 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setRoom(null);
                                  setRecoverableRoom(null);
                                }}
                                className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-[0_4px_0_#0F172A] active:translate-y-0.5 transition"
                              >
                                Back to Lobby
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInstantRematch(1)}
                                className={`flex-1 py-3 rounded-2xl font-black text-xs transition active:translate-y-0.5 flex items-center justify-center gap-1.5 ${
                                  isLudoWin
                                    ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 shadow-[0_4px_0_#92400E]'
                                    : 'bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_4px_0_#881337]'
                                }`}
                              >
                                <Zap className={`w-4 h-4 ${isLudoWin ? 'fill-slate-950' : 'fill-white'}`} />
                                <span>⚡ INSTANT REMATCH (₹{room.entryFee})</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default LudoBattleGame;
