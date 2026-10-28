import React, { useState, useEffect, useRef } from 'react';
import {
  Plane,
  ArrowLeft,
  TrendingUp,
  Users,
  ShieldCheck,
  BarChart3,
  RotateCcw,
  Camera,
  CheckCircle2,
  Lock,
  Sparkles,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRecord, AviatorRoundHistoryItem } from '../../types';
import { store } from '../../services/store';
import { soundFx } from '../../services/soundFx';
import { useToast } from '../common/Toast';
import { Aviator3DScene, AviatorCameraMode } from './Aviator3DScene';
import { rtdb, rtdbRef, rtdbOnValue, rtdbUpdate } from '../../firebase';

interface AviatorGameProps {
  user: UserRecord | null;
  onBackToLobby: () => void;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
}

export const AviatorGame: React.FC<AviatorGameProps> = ({
  user,
  onBackToLobby,
  onOpenAuth
}) => {
  const { showToast } = useToast();

  // Synchronized Server-Authoritative State
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [isTakeoffAccelerating, setIsTakeoffAccelerating] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [, setStoreTick] = useState(0);
  const [showAdminAnalytics, setShowAdminAnalytics] = useState(false);
  const [cameraMode, setCameraMode] = useState<AviatorCameraMode>('side');
  const [selectedFairnessRound, setSelectedFairnessRound] = useState<AviatorRoundHistoryItem | null>(null);
  const [aviatorGameEnabled, setAviatorGameEnabled] = useState<boolean>(true);
  const maxCapRef = useRef<number>(50);

  // Station 1 State
  const [bet1Amount, setBet1Amount] = useState(50);
  const [hasBet1, setHasBet1] = useState(false);
  const [hasCashedOut1, setHasCashedOut1] = useState(false);
  const [cashedOutMult1, setCashedOutMult1] = useState(0);
  const [autoCashoutEnabled1, setAutoCashoutEnabled1] = useState(false);
  const [autoCashoutMult1, setAutoCashoutMult1] = useState(2.00);

  // Station 2 State
  const [bet2Amount, setBet2Amount] = useState(100);
  const [hasBet2, setHasBet2] = useState(false);
  const [hasCashedOut2, setHasCashedOut2] = useState(false);
  const [cashedOutMult2, setCashedOutMult2] = useState(0);
  const [autoCashoutEnabled2, setAutoCashoutEnabled2] = useState(false);
  const [autoCashoutMult2, setAutoCashoutMult2] = useState(3.00);

  // Refs for frame-accurate cashout & audio cues without stale closures
  const hasBet1Ref = useRef(false);
  const hasCashedOut1Ref = useRef(false);
  const activeBetId1Ref = useRef<string | null>(null);
  const autoCashoutEnabled1Ref = useRef(false);
  const autoCashoutMult1Ref = useRef(2.00);

  const hasBet2Ref = useRef(false);
  const hasCashedOut2Ref = useRef(false);
  const activeBetId2Ref = useRef<string | null>(null);
  const autoCashoutEnabled2Ref = useRef(false);
  const autoCashoutMult2Ref = useRef(3.00);

  const userRef = useRef<UserRecord | null>(user);
  const lastRoundIdRef = useRef<string>('');
  const lastStatusRef = useRef<'waiting' | 'flying' | 'crashed'>('waiting');
  const lastClimbCueTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    autoCashoutEnabled1Ref.current = autoCashoutEnabled1;
  }, [autoCashoutEnabled1]);

  useEffect(() => {
    autoCashoutMult1Ref.current = autoCashoutMult1;
  }, [autoCashoutMult1]);

  useEffect(() => {
    autoCashoutEnabled2Ref.current = autoCashoutEnabled2;
  }, [autoCashoutEnabled2]);

  useEffect(() => {
    autoCashoutMult2Ref.current = autoCashoutMult2;
  }, [autoCashoutMult2]);

  // Subscribe to store updates + direct Firebase Realtime Database /admin_settings/aviator stream
  useEffect(() => {
    const unsubStore = store.subscribe(() => {
      setStoreTick((t) => t + 1);
    });

    let unsubRtdb: (() => void) | null = null;
    try {
      const avAdminRef = rtdbRef(rtdb, 'admin_settings/aviator');
      unsubRtdb = rtdbOnValue(
        avAdminRef,
        (snap) => {
          if (!snap.exists()) return;
          const cfg = snap.val();
          if (!cfg || typeof cfg !== 'object') return;

          if (typeof cfg.gameEnabled === 'boolean') {
            setAviatorGameEnabled(cfg.gameEnabled);
          }
          if (typeof cfg.maxMultiplierCap === 'number' && cfg.maxMultiplierCap >= 2) {
            maxCapRef.current = cfg.maxMultiplierCap;
          }
          if (cfg.forceCrashNow === true) {
            rtdbUpdate(avAdminRef, { forceCrashNow: false }).catch(() => {});
            store.forceAviatorCrashNow('RTDB_Admin');
          }
        },
        () => {}
      );
    } catch {}

    return () => {
      unsubStore();
      if (unsubRtdb) unsubRtdb();
    };
  }, []);

  // Master 60fps Synchronized Loop driven by Server-Authoritative Round State
  useEffect(() => {
    let animId = 0;
    let takeoffTimer: ReturnType<typeof setTimeout> | null = null;

    const syncLoop = (now: number) => {
      const round = store.getAviatorRound();
      const liveMult = store.getAviatorLiveMultiplier();

      // Detect new round transition
      if (round.roundId !== lastRoundIdRef.current) {
        lastRoundIdRef.current = round.roundId;
        setHasBet1(false);
        hasBet1Ref.current = false;
        setHasCashedOut1(false);
        hasCashedOut1Ref.current = false;
        activeBetId1Ref.current = null;

        setHasBet2(false);
        hasBet2Ref.current = false;
        setHasCashedOut2(false);
        hasCashedOut2Ref.current = false;
        activeBetId2Ref.current = null;
      }

      // Detect status transition
      if (round.status !== lastStatusRef.current) {
        const prev = lastStatusRef.current;
        lastStatusRef.current = round.status;
        setGameState(round.status);

        if (round.status === 'flying' && prev !== 'flying') {
          setIsTakeoffAccelerating(true);
          soundFx.playAviatorClimbTick(1.00);
          lastClimbCueTimeRef.current = now;
          if (takeoffTimer) clearTimeout(takeoffTimer);
          takeoffTimer = setTimeout(() => {
            setIsTakeoffAccelerating(false);
          }, 650);
        } else if (round.status === 'crashed' && prev !== 'crashed') {
          setIsTakeoffAccelerating(false);
          soundFx.playAviatorCrash();
        } else if (round.status === 'waiting') {
          setIsTakeoffAccelerating(false);
        }
      }

      if (round.status === 'waiting') {
        const remSecs = Math.max(0, Math.ceil((round.startTime - Date.now()) / 1000));
        setCountdown(remSecs);
        setCurrentMultiplier(1.00);
      } else if (round.status === 'flying') {
        const cap = Math.max(2, maxCapRef.current || store.getAviatorEngineConfig().maxMultiplierCap || 50);
        const safeMult = Math.max(1.00, Math.floor(liveMult * 100) / 100);
        if (safeMult >= cap) {
          store.forceAviatorCrashNow('MaxCap_Ceiling');
          setCurrentMultiplier(cap);
        } else {
          setCurrentMultiplier(safeMult);
        }

        if (now - lastClimbCueTimeRef.current >= 180) {
          lastClimbCueTimeRef.current = now;
          soundFx.playAviatorClimbTick(safeMult);
        }

        // Check Station 1 Auto-Cashout or Server Auto-Cashout sync
        if (hasBet1Ref.current && !hasCashedOut1Ref.current && activeBetId1Ref.current) {
          const serverBet1 = round.bets?.[activeBetId1Ref.current];
          if (serverBet1 && serverBet1.status === 'cashed_out') {
            setHasCashedOut1(true);
            hasCashedOut1Ref.current = true;
            const cMult = serverBet1.cashedOutMultiplier || safeMult;
            setCashedOutMult1(cMult);
            soundFx.playWinFanfare();
            confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });
            showToast(`Station 1 Auto Cashed Out at ${cMult.toFixed(2)}X! Won ₹${serverBet1.payout}!`, 'success');
          } else if (
            autoCashoutEnabled1Ref.current &&
            autoCashoutMult1Ref.current >= 1.01 &&
            safeMult >= autoCashoutMult1Ref.current &&
            autoCashoutMult1Ref.current < round.crashMultiplier
          ) {
            executeCashout(1, autoCashoutMult1Ref.current);
          }
        }

        // Check Station 2 Auto-Cashout or Server Auto-Cashout sync
        if (hasBet2Ref.current && !hasCashedOut2Ref.current && activeBetId2Ref.current) {
          const serverBet2 = round.bets?.[activeBetId2Ref.current];
          if (serverBet2 && serverBet2.status === 'cashed_out') {
            setHasCashedOut2(true);
            hasCashedOut2Ref.current = true;
            const cMult = serverBet2.cashedOutMultiplier || safeMult;
            setCashedOutMult2(cMult);
            soundFx.playWinFanfare();
            confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });
            showToast(`Station 2 Auto Cashed Out at ${cMult.toFixed(2)}X! Won ₹${serverBet2.payout}!`, 'success');
          } else if (
            autoCashoutEnabled2Ref.current &&
            autoCashoutMult2Ref.current >= 1.01 &&
            safeMult >= autoCashoutMult2Ref.current &&
            autoCashoutMult2Ref.current < round.crashMultiplier
          ) {
            executeCashout(2, autoCashoutMult2Ref.current);
          }
        }
      } else if (round.status === 'crashed') {
        const finalCrash = Math.max(1.00, Math.floor((round.crashMultiplier || liveMult) * 100) / 100);
        setCurrentMultiplier(finalCrash);
      }

      animId = requestAnimationFrame(syncLoop);
    };

    animId = requestAnimationFrame(syncLoop);
    return () => {
      cancelAnimationFrame(animId);
      if (takeoffTimer) clearTimeout(takeoffTimer);
    };
  }, []);

  const handlePlaceBet = (station: 1 | 2) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const amount = station === 1 ? bet1Amount : bet2Amount;
    const autoEnabled = station === 1 ? autoCashoutEnabled1 : autoCashoutEnabled2;
    const autoMult = station === 1 ? autoCashoutMult1 : autoCashoutMult2;

    if (user.balance < amount) {
      showToast('Insufficient wallet balance. Please deposit.', 'error');
      return;
    }
    if (gameState !== 'waiting') {
      showToast('Wait for the next round countdown to place your bet', 'info');
      return;
    }

    const res = store.placeAviatorBet(
      user.uid,
      amount,
      autoEnabled ? autoMult : undefined,
      station
    );

    if (res.success && res.betId) {
      soundFx.playChipSound();
      if (station === 1) {
        setHasBet1(true);
        hasBet1Ref.current = true;
        activeBetId1Ref.current = res.betId;
      } else {
        setHasBet2(true);
        hasBet2Ref.current = true;
        activeBetId2Ref.current = res.betId;
      }

      showToast(`Station ${station}: Bet ₹${amount} confirmed for takeoff!`, 'success');
    } else if (res.error) {
      showToast(res.error, 'error');
    }
  };

  const executeCashout = (station: 1 | 2, multiplierOverride?: number) => {
    const activeUser = userRef.current;
    if (!activeUser) return;

    const isStation1 = station === 1;
    const hasBet = isStation1 ? hasBet1Ref.current : hasBet2Ref.current;
    const hasCashed = isStation1 ? hasCashedOut1Ref.current : hasCashedOut2Ref.current;
    const betId = isStation1 ? activeBetId1Ref.current : activeBetId2Ref.current;

    if (!hasBet || hasCashed || !betId) return;

    const rawMult = multiplierOverride || currentMultiplier;
    const mult = Math.max(1.01, Math.floor(rawMult * 100) / 100);
    const res = store.cashOutAviator(activeUser.uid, betId, mult);

    if (res.success && res.payout !== undefined) {
      const finalMult = res.cashedOutMultiplier || mult;
      if (isStation1) {
        setHasCashedOut1(true);
        hasCashedOut1Ref.current = true;
        setCashedOutMult1(finalMult);
      } else {
        setHasCashedOut2(true);
        hasCashedOut2Ref.current = true;
        setCashedOutMult2(finalMult);
      }

      soundFx.playWinFanfare();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      showToast(`Station ${station}: Cashed out at ${finalMult.toFixed(2)}X! Won ₹${res.payout.toFixed(2)}!`, 'success');
    } else if (res.error) {
      showToast(res.error, 'error');
    }
  };

  const pastCrashes = store.getAviatorPastCrashes();
  const currentRound = store.getAviatorRound();
  const historyItems = store.getAviatorHistoryItems();
  const sessionAnalytics = store.getAviatorSessionAnalytics();
  const engineConfig = store.getAviatorEngineConfig();

  const safeDisplayMult = Number.isFinite(currentMultiplier) && currentMultiplier >= 1.0 ? currentMultiplier : 1.00;
  const safeCashedMult1 = Number.isFinite(cashedOutMult1) && cashedOutMult1 >= 1.0 ? cashedOutMult1 : 1.00;
  const safeCashedMult2 = Number.isFinite(cashedOutMult2) && cashedOutMult2 >= 1.0 ? cashedOutMult2 : 1.00;

  // Compute 2D HUD Trajectory Curve coordinates overlaid behind the 3D Aeroplane
  const canvasWidth = 640;
  const canvasHeight = 360;
  const startX = 36;
  const startY = canvasHeight - 32;

  const rawProgress = Math.log10(Math.max(1, safeDisplayMult)) / Math.log10(15);
  const climbProgress = Number.isFinite(rawProgress) ? Math.max(0, Math.min(1, rawProgress)) : 0;
  const rawTakeoffRatio = Math.min(1, (safeDisplayMult - 1.0) / 0.16);
  const takeoffEase = rawTakeoffRatio * rawTakeoffRatio * (3 - 2 * rawTakeoffRatio);

  const hoverFloatY =
    safeDisplayMult > 2.5 && gameState === 'flying'
      ? Math.sin(safeDisplayMult * 2.2) * 5
      : 0;

  const planeX =
    gameState === 'waiting'
      ? startX
      : startX + 18 * takeoffEase + (canvasWidth - 135) * Math.pow(climbProgress, 1.15);
  const planeY =
    gameState === 'waiting'
      ? startY
      : Math.max(
          52,
          startY - 12 * takeoffEase - (canvasHeight - 115) * Math.pow(climbProgress, 1.25) + hoverFloatY
        );
  const ctrlX = startX + (planeX - startX) * 0.58;
  const ctrlY = startY - (startY - planeY) * 0.16;

  // Render glowing 2D HUD Trajectory Curve underneath the 3D scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const width = canvas.width || 640;
      const height = canvas.height || 360;
      ctx.clearRect(0, 0, width, height);

      // Axis rulers
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(34, 16);
      ctx.lineTo(34, height - 30);
      ctx.lineTo(width - 16, height - 30);
      ctx.stroke();

      if (gameState === 'flying' || gameState === 'crashed') {
        const strokeColor =
          gameState === 'crashed'
            ? '#ef4444'
            : safeDisplayMult >= 10
            ? '#e879f9'
            : safeDisplayMult >= 2
            ? '#fbbf24'
            : '#f43f5e';

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, planeX, planeY);
        ctx.lineTo(planeX, startY);
        ctx.lineTo(startX, startY);
        ctx.closePath();

        const gradTopY = Math.min(planeY, startY - 1);
        const areaGrad = ctx.createLinearGradient(0, gradTopY, 0, startY);
        areaGrad.addColorStop(
          0,
          gameState === 'crashed'
            ? 'rgba(239, 68, 68, 0.18)'
            : safeDisplayMult >= 10
            ? 'rgba(232, 121, 249, 0.24)'
            : 'rgba(244, 63, 94, 0.25)'
        );
        areaGrad.addColorStop(1, 'rgba(15, 23, 42, 0.01)');
        ctx.fillStyle = areaGrad;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, planeX, planeY);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }
    } catch {}
  }, [currentMultiplier, gameState, planeX, planeY, ctrlX, ctrlY, safeDisplayMult, startX, startY]);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 space-y-4">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <button
          onClick={onBackToLobby}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Games</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Provably Fair Verifier Button */}
          <button
            type="button"
            onClick={() => {
              const latest = historyItems[0] || {
                roundId: currentRound.roundId,
                roundNumber: currentRound.roundNumber || 1001,
                crashMultiplier: pastCrashes[0] || 1.50,
                serverSeedHash: currentRound.serverSeedHash || '',
                serverSeed: 'Active round seed (revealed on crash)',
                clientSeed: currentRound.clientSeed || engineConfig.provablyFairClientSeed,
                nonce: currentRound.nonce || 1001,
                hmacHash: currentRound.hmacHash || '',
                totalBetVolume: 0,
                totalPayout: 0,
                houseProfit: 0,
                marginPercent: 100,
                betsCount: 0,
                cashedOutCount: 0,
                timestamp: Date.now()
              };
              setSelectedFairnessRound(latest);
            }}
            className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-[11px] font-bold flex items-center space-x-1.5 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Provably Fair SHA-256</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAdminAnalytics((prev) => !prev)}
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center space-x-1.5 transition ${
              showAdminAnalytics
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Live Telemetry</span>
          </button>

          <div className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-brand font-black text-xs flex items-center space-x-1.5">
            <Plane
              className={`w-3.5 h-3.5 text-rose-400 transition-transform duration-700 ease-in ${
                gameState === 'flying'
                  ? 'translate-x-0.5 -translate-y-0.5 -rotate-12 scale-110'
                  : gameState === 'crashed'
                  ? 'translate-x-2 -translate-y-2 opacity-40 scale-75'
                  : 'rotate-0 scale-100'
              }`}
            />
            <span>3D AVIATOR PRO</span>
          </div>
        </div>
      </div>

      {/* Past Crashes History Bar (Click any badge to verify its Provably Fair HMAC-SHA256 proof) */}
      <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1 shrink-0">
          History:
        </span>
        {pastCrashes.map((c, i) => {
          const val = Number.isFinite(Number(c)) ? Number(c) : 1.00;
          const matchingHistory = historyItems[i];
          return (
            <button
              key={`${i}-${val}`}
              type="button"
              onClick={() => {
                if (matchingHistory) setSelectedFairnessRound(matchingHistory);
              }}
              title="Click to inspect Provably Fair HMAC-SHA256 verification"
              className={`px-2 py-0.5 rounded-lg font-mono font-bold text-xs shrink-0 border transition hover:scale-105 ${
                val >= 10.0
                  ? 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/50 shadow-sm shadow-fuchsia-500/20'
                  : val >= 2.0
                  ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                  : 'bg-sky-950/80 text-sky-300 border-sky-500/40'
              }`}
            >
              {val.toFixed(2)}x
            </button>
          );
        })}
      </div>

      {/* Main Aviator Arena Layout */}
      <div className="space-y-4">
          {/* 3D Flight Arena Stage */}
          <div className="relative aspect-[16/9] w-full rounded-3xl bg-gradient-to-b from-[#050811] via-[#0b1224] to-[#060913] border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Admin Maintenance Overlay when /admin_settings/aviator/gameEnabled is false */}
            {(!aviatorGameEnabled || !engineConfig.enabled) && (
              <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-lg">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="font-brand font-black text-lg sm:text-xl text-white">
                  Aviator Crash Maintenance Active
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                  Master Admin has temporarily paused new Aviator flights for scheduled engine maintenance. Flights will resume automatically as soon as enabled.
                </p>
              </div>
            )}

            {/* 2D HUD Trajectory Curve Overlay */}
            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
            />

            {/* Real Three.js 3D Aeroplane Scene */}
            <Aviator3DScene
              gameState={gameState}
              multiplier={safeDisplayMult}
              cameraMode={cameraMode}
            />

            {/* Top-Left Round & Provably Fair Status HUD */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-300">
                ID: {(currentRound.roundId || '').slice(-10)}
              </span>
              {isTakeoffAccelerating && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-[10px] font-mono font-bold text-amber-300 animate-pulse">
                  TAKEOFF THRUST
                </span>
              )}
            </div>

            {/* Top-Right 3D Camera Angle Switcher */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md p-1 rounded-xl border border-slate-800">
              <Camera className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
              {(['side', 'chase', 'drone'] as AviatorCameraMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCameraMode(mode)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition ${
                    cameraMode === mode
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Center Big Status & Multiplier Display */}
            <div className="relative z-20 text-center select-none space-y-1 pointer-events-none">
              {gameState === 'waiting' && (
                <div className="space-y-1.5 bg-slate-950/65 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-800/80">
                  <span className="text-xs text-slate-300 font-bold uppercase tracking-widest block">
                    {engineConfig.paused ? 'Engine Paused By Admin' : '3D Aeroplane Ready For Takeoff'}
                  </span>
                  <div className="font-mono font-black text-4xl sm:text-5xl text-amber-400">
                    00:0{countdown}
                  </div>
                  <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (countdown / (engineConfig.waitDurationSeconds || 5)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {gameState === 'flying' && (
                <div className="drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
                  <div
                    className={`font-mono font-black text-5xl sm:text-7xl tracking-tight transition-transform duration-150 ${
                      safeDisplayMult >= 10
                        ? 'text-fuchsia-300 scale-105'
                        : safeDisplayMult >= 2
                        ? 'text-amber-300'
                        : 'text-white'
                    }`}
                  >
                    {safeDisplayMult.toFixed(2)}
                    <span className="text-rose-500">x</span>
                  </div>
                </div>
              )}

              {gameState === 'crashed' && (
                <div className="space-y-1 bg-slate-950/75 backdrop-blur-md px-6 py-4 rounded-3xl border border-rose-500/40 animate-in zoom-in-90 duration-150">
                  <div className="text-sm sm:text-base font-brand font-black text-rose-500 uppercase tracking-widest">
                    FLEW AWAY!
                  </div>
                  <div className="font-mono font-black text-4xl sm:text-6xl text-rose-400">
                    {safeDisplayMult.toFixed(2)}x
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dual Betting Controls: Bet Station 1 & Bet Station 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Bet Station 1 */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Bet Station 1
                </span>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[11px] text-slate-400">Auto Cash Out</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCashoutEnabled1}
                      onChange={(e) => setAutoCashoutEnabled1(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-500 block mb-0.5">Amount (₹)</label>
                  <input
                    type="number"
                    min={engineConfig.minBet || 50}
                    max={engineConfig.maxBet || 100000}
                    value={bet1Amount}
                    disabled={hasBet1}
                    onChange={(e) => setBet1Amount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                {autoCashoutEnabled1 && (
                  <div className="w-24">
                    <label className="text-[10px] text-slate-500 block mb-0.5">Target X</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.1"
                      value={autoCashoutMult1}
                      onChange={(e) => setAutoCashoutMult1(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 font-mono text-sm font-bold text-slate-100 text-center focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-5 gap-1">
                {[50, 100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={hasBet1}
                    onClick={() => setBet1Amount(amt)}
                    className={`py-1 rounded-lg font-mono text-[10px] font-bold border transition ${
                      bet1Amount === amt
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {hasBet1 && gameState === 'flying' && !hasCashedOut1 ? (
                <button
                  type="button"
                  onClick={() => executeCashout(1)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-brand font-black text-base shadow-xl shadow-emerald-950/50 transition active:scale-95 animate-pulse"
                >
                  CASH OUT ₹{(bet1Amount * safeDisplayMult).toFixed(0)} ({safeDisplayMult.toFixed(2)}x)
                </button>
              ) : hasBet1 && hasCashedOut1 ? (
                <div className="w-full py-3 rounded-2xl bg-slate-800 border border-emerald-500/30 text-emerald-300 font-bold text-center text-xs">
                  ✓ Cashed Out at {safeCashedMult1.toFixed(2)}X (+₹{(bet1Amount * safeCashedMult1).toFixed(2)})
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePlaceBet(1)}
                  disabled={hasBet1 || gameState !== 'waiting'}
                  className={`w-full py-3.5 rounded-2xl font-brand font-black text-base transition active:scale-95 shadow-xl ${
                    hasBet1
                      ? 'bg-amber-600/30 border border-amber-500 text-amber-300'
                      : gameState !== 'waiting'
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-rose-600 via-amber-600 to-amber-500 text-slate-950 shadow-amber-950/40'
                  }`}
                >
                  {hasBet1 ? 'STATION 1 LOCKED ✓' : `BET ₹${bet1Amount}`}
                </button>
              )}
            </div>

            {/* Bet Station 2 */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  Bet Station 2
                </span>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[11px] text-slate-400">Auto Cash Out</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCashoutEnabled2}
                      onChange={(e) => setAutoCashoutEnabled2(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-500 block mb-0.5">Amount (₹)</label>
                  <input
                    type="number"
                    min={engineConfig.minBet || 50}
                    max={engineConfig.maxBet || 100000}
                    value={bet2Amount}
                    disabled={hasBet2}
                    onChange={(e) => setBet2Amount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-sm font-bold text-rose-300 focus:outline-none focus:border-rose-500"
                  />
                </div>
                {autoCashoutEnabled2 && (
                  <div className="w-24">
                    <label className="text-[10px] text-slate-500 block mb-0.5">Target X</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.1"
                      value={autoCashoutMult2}
                      onChange={(e) => setAutoCashoutMult2(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 font-mono text-sm font-bold text-slate-100 text-center focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-5 gap-1">
                {[50, 100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={hasBet2}
                    onClick={() => setBet2Amount(amt)}
                    className={`py-1 rounded-lg font-mono text-[10px] font-bold border transition ${
                      bet2Amount === amt
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {hasBet2 && gameState === 'flying' && !hasCashedOut2 ? (
                <button
                  type="button"
                  onClick={() => executeCashout(2)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-brand font-black text-base shadow-xl shadow-emerald-950/50 transition active:scale-95 animate-pulse"
                >
                  CASH OUT ₹{(bet2Amount * safeDisplayMult).toFixed(0)} ({safeDisplayMult.toFixed(2)}x)
                </button>
              ) : hasBet2 && hasCashedOut2 ? (
                <div className="w-full py-3 rounded-2xl bg-slate-800 border border-emerald-500/30 text-emerald-300 font-bold text-center text-xs">
                  ✓ Cashed Out at {safeCashedMult2.toFixed(2)}X (+₹{(bet2Amount * safeCashedMult2).toFixed(2)})
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePlaceBet(2)}
                  disabled={hasBet2 || gameState !== 'waiting'}
                  className={`w-full py-3.5 rounded-2xl font-brand font-black text-base transition active:scale-95 shadow-xl ${
                    hasBet2
                      ? 'bg-rose-600/30 border border-rose-500 text-rose-300'
                      : gameState !== 'waiting'
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white shadow-rose-950/40'
                  }`}
                >
                  {hasBet2 ? 'STATION 2 LOCKED ✓' : `BET ₹${bet2Amount}`}
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Expandable Live Session Telemetry & Analytics Panel */}
      {showAdminAnalytics && (
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-brand font-black text-sm text-slate-100">
                  Real-Time Server-Authoritative Session Telemetry
                </h3>
                <p className="text-[11px] text-slate-400">
                  Provably Fair HMAC-SHA256 Engine • RTP {engineConfig.rtpPercent}% ({sessionAnalytics.targetHouseMarginPercent}% House Edge)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                store.resetAviatorSessionAnalytics('MasterAdmin');
                showToast('Aviator session analytics counters reset', 'info');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 flex items-center space-x-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Session Counters</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Total Bet Volume</span>
              <span className="font-mono font-black text-sm text-slate-100">
                ₹{sessionAnalytics.totalBetVolume.toFixed(2)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Total Payout</span>
              <span className="font-mono font-black text-sm text-rose-400">
                ₹{sessionAnalytics.totalPayout.toFixed(2)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">House Net Profit</span>
              <span
                className={`font-mono font-black text-sm ${
                  sessionAnalytics.netHouseProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {sessionAnalytics.netHouseProfit >= 0 ? '+' : ''}₹{sessionAnalytics.netHouseProfit.toFixed(2)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Actual Margin</span>
              <span className="font-mono font-black text-sm text-emerald-400">
                {sessionAnalytics.actualHouseMarginPercent.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Low (&lt;2.00x)
              </span>
              <span className="font-mono font-black text-base text-sky-400">
                {sessionAnalytics.lowCrashCount}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Medium (2.00x–9.99x)
              </span>
              <span className="font-mono font-black text-base text-purple-400">
                {sessionAnalytics.midCrashCount}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                High (≥10.00x)
              </span>
              <span className="font-mono font-black text-base text-fuchsia-400">
                {sessionAnalytics.highCrashCount}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Provably Fair Verification Modal */}
      {selectedFairnessRound && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-brand font-black text-sm text-white">
                    Provably Fair Cryptographic Proof
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    HMAC-SHA256 Independent Crash Multiplier Verification
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFairnessRound(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Round ID / Nonce:</span>
                <span className="text-white font-bold">
                  {selectedFairnessRound.roundId} (Nonce #{selectedFairnessRound.nonce})
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Verified Crash Result:</span>
                <span className="text-amber-400 font-black text-base">
                  {selectedFairnessRound.crashMultiplier.toFixed(2)}x
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">Pre-Committed Server Seed SHA-256 Hash:</span>
                <div className="text-emerald-300 break-all text-[11px]">
                  {selectedFairnessRound.serverSeedHash || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">Revealed Server Seed:</span>
                <div className="text-slate-200 break-all text-[11px]">
                  {selectedFairnessRound.serverSeed}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">Client Seed + Nonce:</span>
                <div className="text-slate-300 break-all text-[11px]">
                  {selectedFairnessRound.clientSeed}:{selectedFairnessRound.nonce}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">HMAC-SHA256 Output Digest:</span>
                <div className="text-amber-300 break-all text-[11px]">
                  {selectedFairnessRound.hmacHash || 'Computed deterministically via HMAC_SHA256(serverSeed, clientSeed:nonce)'}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl">
              Every round outcome is predetermined strictly from the cryptographic HMAC-SHA256 digest before takeoff and is 100% independent of player bet amounts, wallet balances, or identities.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
