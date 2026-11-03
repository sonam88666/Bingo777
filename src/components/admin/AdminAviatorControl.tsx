import React, { useState, useEffect } from 'react';
import {
  Plane,
  Zap,
  ShieldAlert,
  SlidersHorizontal,
  Activity,
  Power,
  CheckCircle2,
  RotateCcw,
  Flame
} from 'lucide-react';
import {
  rtdb,
  rtdbRef,
  rtdbOnValue,
  rtdbUpdate,
  rtdbSet
} from '../../firebase';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';
import { AdminTrendsAnalytics } from './AdminTrendsAnalytics';

export interface RtdbAviatorAdminConfig {
  targetRtp: number;
  maxMultiplierCap: number;
  streakBreakerEnabled: boolean;
  oneXTrendEnabled: boolean;
  oneXProbabilityPercent: number;
  highFlowMaxMultiplier: number;
  trendWaveMode: 'AUTO_WAVE' | 'LONG_1X' | 'SHORT_1X' | 'MIX';
  nextCrashOverride: number | null;
  forceCrashNow: boolean;
  gameEnabled: boolean;
  updatedAt?: number;
  updatedBy?: string;
}

export interface RtdbAviatorCurrentRoundMirror {
  roundId: string;
  roundNumber?: number;
  status: 'waiting' | 'flying' | 'crashed';
  currentMultiplier: number;
  crashMultiplier: number;
  lastCrashMultiplier?: number;
  streakBreakerTriggered?: boolean;
  updatedAt: number;
}

interface AdminAviatorControlProps {
  adminId?: string;
}

export const AdminAviatorControl: React.FC<AdminAviatorControlProps> = ({
  adminId = 'MasterAdmin_01'
}) => {
  const { showToast } = useToast();
  const [, setTick] = useState(0);

  // Realtime Database /admin_settings/aviator state
  const [rtdbConfig, setRtdbConfig] = useState<RtdbAviatorAdminConfig>({
    targetRtp: 95,
    maxMultiplierCap: 50,
    streakBreakerEnabled: true,
    oneXTrendEnabled: true,
    oneXProbabilityPercent: 82,
    highFlowMaxMultiplier: 12,
    trendWaveMode: 'AUTO_WAVE',
    nextCrashOverride: null,
    forceCrashNow: false,
    gameEnabled: true
  });

  // Form inputs
  const [overrideInput, setOverrideInput] = useState<string>('');
  const [targetRtpInput, setTargetRtpInput] = useState<number>(95);
  const [maxCapInput, setMaxCapInput] = useState<number>(50);
  const [streakBreakerInput, setStreakBreakerInput] = useState<boolean>(true);
  const [oneXTrendInput, setOneXTrendInput] = useState<boolean>(true);
  const [oneXProbInput, setOneXProbInput] = useState<number>(82);
  const [highFlowMaxInput, setHighFlowMaxInput] = useState<number>(12);
  const [trendWaveModeInput, setTrendWaveModeInput] = useState<'AUTO_WAVE' | 'LONG_1X' | 'SHORT_1X' | 'MIX'>('AUTO_WAVE');
  const [gameEnabledInput, setGameEnabledInput] = useState<boolean>(true);

  // Live Flight Mirror from /aviator_rounds/current
  const [liveMirror, setLiveMirror] = useState<RtdbAviatorCurrentRoundMirror | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Subscribe to store & RTDB /admin_settings/aviator + /aviator_rounds/current
  useEffect(() => {
    const unsubStore = store.subscribe(() => setTick((t) => t + 1));
    const timer = setInterval(() => setTick((t) => t + 1), 120);

    let unsubConfig: (() => void) | null = null;
    let unsubMirror: (() => void) | null = null;

    try {
      const configRef = rtdbRef(rtdb, 'admin_settings/aviator');
      unsubConfig = rtdbOnValue(
        configRef,
        (snap) => {
          if (snap.exists()) {
            const val = snap.val();
            const nextCfg: RtdbAviatorAdminConfig = {
              targetRtp: Number(val.targetRtp) || 95,
              maxMultiplierCap: Number(val.maxMultiplierCap) || 50,
              streakBreakerEnabled: val.streakBreakerEnabled !== false,
              oneXTrendEnabled: val.oneXTrendEnabled !== false,
              oneXProbabilityPercent:
                typeof val.oneXProbabilityPercent === 'number' &&
                val.oneXProbabilityPercent >= 55 &&
                val.oneXProbabilityPercent <= 96
                  ? val.oneXProbabilityPercent
                  : 82,
              highFlowMaxMultiplier:
                typeof val.highFlowMaxMultiplier === 'number' && val.highFlowMaxMultiplier >= 3
                  ? val.highFlowMaxMultiplier
                  : 12,
              trendWaveMode:
                val.trendWaveMode === 'LONG_1X' ||
                val.trendWaveMode === 'SHORT_1X' ||
                val.trendWaveMode === 'MIX' ||
                val.trendWaveMode === 'AUTO_WAVE'
                  ? val.trendWaveMode
                  : 'AUTO_WAVE',
              nextCrashOverride:
                val.nextCrashOverride !== null &&
                val.nextCrashOverride !== undefined &&
                Number.isFinite(Number(val.nextCrashOverride)) &&
                Number(val.nextCrashOverride) >= 1.0
                  ? Number(val.nextCrashOverride)
                  : null,
              forceCrashNow: Boolean(val.forceCrashNow),
              gameEnabled: val.gameEnabled !== false,
              updatedAt: val.updatedAt,
              updatedBy: val.updatedBy
            };
            setRtdbConfig(nextCfg);
            setTargetRtpInput(nextCfg.targetRtp);
            setMaxCapInput(nextCfg.maxMultiplierCap);
            setStreakBreakerInput(nextCfg.streakBreakerEnabled);
            setOneXTrendInput(nextCfg.oneXTrendEnabled);
            setOneXProbInput(nextCfg.oneXProbabilityPercent);
            setHighFlowMaxInput(nextCfg.highFlowMaxMultiplier);
            setTrendWaveModeInput(nextCfg.trendWaveMode);
            setGameEnabledInput(nextCfg.gameEnabled);
            setOverrideInput(
              nextCfg.nextCrashOverride !== null ? String(nextCfg.nextCrashOverride) : ''
            );
          } else {
            // Seed default /admin_settings/aviator node if missing
            const defaultCfg: RtdbAviatorAdminConfig = {
              targetRtp: 95,
              maxMultiplierCap: 50,
              streakBreakerEnabled: true,
              oneXTrendEnabled: true,
              oneXProbabilityPercent: 82,
              highFlowMaxMultiplier: 12,
              trendWaveMode: 'AUTO_WAVE',
              nextCrashOverride: null,
              forceCrashNow: false,
              gameEnabled: true,
              updatedAt: Date.now(),
              updatedBy: adminId
            };
            rtdbSet(configRef, defaultCfg).catch(() => {});
          }
        },
        () => {}
      );

      const mirrorRef = rtdbRef(rtdb, 'aviator_rounds/current');
      unsubMirror = rtdbOnValue(
        mirrorRef,
        (snap) => {
          if (snap.exists()) {
            setLiveMirror(snap.val() as RtdbAviatorCurrentRoundMirror);
          }
        },
        () => {}
      );
    } catch {}

    return () => {
      unsubStore();
      clearInterval(timer);
      if (unsubConfig) unsubConfig();
      if (unsubMirror) unsubMirror();
    };
  }, [adminId]);

  const localRound = store.getAviatorRound();
  const localLiveMult = store.getAviatorLiveMultiplier();
  const pastCrashes = store.getAviatorPastCrashes();
  const lastCrash = pastCrashes[0] || liveMirror?.lastCrashMultiplier || 1.45;

  const displayStatus = liveMirror?.status || localRound.status;
  const displayRoundId = liveMirror?.roundId || localRound.roundId;
  const displayLiveMult =
    displayStatus === 'waiting'
      ? 1.00
      : displayStatus === 'flying'
      ? Math.max(localLiveMult, liveMirror?.currentMultiplier || 1.00)
      : localRound.crashMultiplier || liveMirror?.crashMultiplier || 1.00;
  const displayTargetCrash =
    rtdbConfig.nextCrashOverride ??
    localRound.crashMultiplier ??
    liveMirror?.crashMultiplier ??
    1.45;

  // 1. Set Next Round Crash Override
  const handleSetNextCrashOverride = async (val: number | null) => {
    const cleanVal =
      val !== null && Number.isFinite(val) && val >= 1.0
        ? Math.floor(val * 100) / 100
        : null;

    setOverrideInput(cleanVal !== null ? String(cleanVal) : '');
    store.setAviatorCrashOverride(cleanVal, adminId);

    try {
      await rtdbUpdate(rtdbRef(rtdb, 'admin_settings/aviator'), {
        nextCrashOverride: cleanVal,
        updatedAt: Date.now(),
        updatedBy: adminId
      });
      await rtdbUpdate(rtdbRef(rtdb, 'admin_settings'), {
        aviatorNextCrash: cleanVal
      });
    } catch {}

    showToast(
      cleanVal !== null
        ? `Next Round Crash Override locked at ${cleanVal.toFixed(2)}x (auto-resets after flight)`
        : 'Cleared Next Crash Override — 1x Trend & Occasional Flow RNG active',
      'success'
    );
  };

  // 2. Emergency Force Crash Now
  const handleForceCrashNow = async () => {
    store.forceAviatorCrashNow(adminId);
    try {
      await rtdbUpdate(rtdbRef(rtdb, 'admin_settings/aviator'), {
        forceCrashNow: true,
        updatedAt: Date.now(),
        updatedBy: adminId
      });
      const crashNowMult = Math.max(1.00, Math.floor(displayLiveMult * 100) / 100);
      await rtdbUpdate(rtdbRef(rtdb, 'aviator_rounds/current'), {
        status: 'crashed',
        currentMultiplier: crashNowMult,
        crashMultiplier: crashNowMult,
        updatedAt: Date.now()
      });
    } catch {}
    showToast('EMERGENCY CRASH TRIGGERED: Live flight terminated on all connected devices!', 'info');
  };

  // 3. Save Engine Parameters to /admin_settings/aviator
  const handleSaveEngineParameters = async () => {
    setIsSaving(true);
    const safeRtp = Math.min(99, Math.max(85, Number(targetRtpInput) || 95));
    const safeCap = Math.min(1000, Math.max(2, Number(maxCapInput) || 50));
    const safeOneXProb = Math.min(96, Math.max(55, Number(oneXProbInput) || 82));
    const safeFlowMax = Math.min(safeCap, Math.max(3, Number(highFlowMaxInput) || 12));

    store.updateAviatorEngineConfig(
      {
        rtpPercent: safeRtp,
        houseEdgePercent: Math.round((100 - safeRtp) * 100) / 100,
        maxMultiplierCap: safeCap,
        streakBreakerEnabled: streakBreakerInput,
        oneXTrendEnabled: oneXTrendInput,
        oneXProbabilityPercent: safeOneXProb,
        highFlowMaxMultiplier: safeFlowMax,
        trendWaveMode: trendWaveModeInput,
        enabled: gameEnabledInput,
        paused: !gameEnabledInput
      },
      adminId
    );

    try {
      await rtdbUpdate(rtdbRef(rtdb, 'admin_settings/aviator'), {
        targetRtp: safeRtp,
        maxMultiplierCap: safeCap,
        streakBreakerEnabled: streakBreakerInput,
        oneXTrendEnabled: oneXTrendInput,
        oneXProbabilityPercent: safeOneXProb,
        highFlowMaxMultiplier: safeFlowMax,
        trendWaveMode: trendWaveModeInput,
        gameEnabled: gameEnabledInput,
        updatedAt: Date.now(),
        updatedBy: adminId
      });
      await rtdbUpdate(rtdbRef(rtdb, 'admin_settings'), {
        aviatorTargetRtp: safeRtp,
        aviatorMaxCap: safeCap,
        aviatorEnabled: gameEnabledInput
      });
      showToast(
        `Saved Aviator Engine Parameters (Wave: ${trendWaveModeInput}, 1x Trend: ${oneXTrendInput ? `${safeOneXProb}%` : 'OFF'})`,
        'success'
      );
    } catch {
      showToast('Saved locally, syncing to Realtime Database...', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle for 1x Trend Mode, Streak Breaker, or Game Enabled
  const handleQuickToggle = async (
    field: 'oneXTrendEnabled' | 'streakBreakerEnabled' | 'gameEnabled',
    nextVal: boolean
  ) => {
    if (field === 'oneXTrendEnabled') {
      setOneXTrendInput(nextVal);
      store.updateAviatorEngineConfig({ oneXTrendEnabled: nextVal }, adminId);
    } else if (field === 'streakBreakerEnabled') {
      setStreakBreakerInput(nextVal);
      store.updateAviatorEngineConfig({ streakBreakerEnabled: nextVal }, adminId);
    } else {
      setGameEnabledInput(nextVal);
      store.updateAviatorEngineConfig({ enabled: nextVal, paused: !nextVal }, adminId);
    }

    try {
      await rtdbUpdate(rtdbRef(rtdb, 'admin_settings/aviator'), {
        [field]: nextVal,
        updatedAt: Date.now(),
        updatedBy: adminId
      });
      if (field === 'gameEnabled') {
        await rtdbUpdate(rtdbRef(rtdb, 'admin_settings'), {
          aviatorEnabled: nextVal
        });
      }
    } catch {}

    showToast(
      field === 'oneXTrendEnabled'
        ? `1x Trend + Occasional Flow Mode turned ${nextVal ? 'ON (1x Wala Trend Active)' : 'OFF'}`
        : field === 'streakBreakerEnabled'
        ? `Anti-Runaway Streak Breaker turned ${nextVal ? 'ON' : 'OFF'}`
        : `Aviator Crash Game ${nextVal ? 'ENABLED' : 'PAUSED (Maintenance Overlay Active)'}`,
      'info'
    );
  };

  // Quick 1x Probability Preset Change
  const handleSelectOneXProbability = async (prob: number) => {
    const safeProb = Math.min(96, Math.max(55, prob));
    setOneXProbInput(safeProb);
    setOneXTrendInput(true);
    store.updateAviatorEngineConfig(
      { oneXTrendEnabled: true, oneXProbabilityPercent: safeProb },
      adminId
    );
    try {
      await rtdbUpdate(rtdbRef(rtdb, 'admin_settings/aviator'), {
        oneXTrendEnabled: true,
        oneXProbabilityPercent: safeProb,
        updatedAt: Date.now(),
        updatedBy: adminId
      });
    } catch {}
    showToast(
      `1x Trend set to ${safeProb}% (1.00x–1.98x) & ${100 - safeProb}% Occasional Flow (2x+)`,
      'success'
    );
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500/25 to-amber-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-lg">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-brand font-black text-base sm:text-lg text-white">
                Firebase Real-Time Aviator Crash Engine Control
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                /admin_settings/aviator
              </span>
              {oneXTrendInput && (
                <span className="px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-500/40 text-[10px] font-mono font-bold text-sky-300">
                  1X TREND ({oneXProbInput}%) + OCCASIONAL FLOW ({100 - oneXProbInput}%)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              1x Trend dominance (1.00x–1.98x) with occasional 2x+ high flows, instant crash override &amp; live flight mirror
            </p>
          </div>
        </div>

        {/* Emergency Force Crash Now Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleForceCrashNow}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-brand font-black text-xs uppercase tracking-wider border border-rose-400/50 shadow-lg shadow-rose-950/80 flex items-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <Zap className="w-4 h-4 animate-pulse" />
            <span>Force Crash Now</span>
          </button>
        </div>
      </div>

      {/* Top 3-Column Grid: Live Flight Mirror | Next Round Crash Override | 1x Trend & Status Switches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* 1. Live Flight Mirror (/aviator_rounds/current) */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Live Flight Mirror
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                displayStatus === 'flying'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                  : displayStatus === 'crashed'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {displayStatus}
            </span>
          </div>

          <div className="text-center py-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
            <div
              className={`font-mono font-black text-4xl tracking-tight ${
                displayStatus === 'crashed'
                  ? 'text-rose-500'
                  : displayStatus === 'flying'
                  ? 'text-emerald-400'
                  : 'text-amber-300'
              }`}
            >
              {displayLiveMult.toFixed(2)}x
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center justify-center gap-2">
              <span>
                Target Ceiling: <strong className="text-amber-300">{displayTargetCrash.toFixed(2)}x</strong>
              </span>
              <span>•</span>
              <span>
                Cap: <strong className="text-rose-300">{rtdbConfig.maxMultiplierCap}x</strong>
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 space-y-1 pt-1 border-t border-slate-900">
            <div className="flex justify-between">
              <span>Active Round:</span>
              <span className="text-slate-200 font-bold">{displayRoundId}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Flight Result:</span>
              <span className={lastCrash >= 2.0 ? 'text-purple-400 font-bold' : 'text-sky-400 font-bold'}>
                {lastCrash.toFixed(2)}x {lastCrash >= 2.0 && oneXTrendInput ? '(Next: 1x Pullback)' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Next Round Crash Override (/admin_settings/aviator/nextCrashOverride) */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              Next Round Crash Override
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                rtdbConfig.nextCrashOverride !== null
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
              }`}
            >
              {rtdbConfig.nextCrashOverride !== null
                ? `LOCKED: ${rtdbConfig.nextCrashOverride.toFixed(2)}x`
                : oneXTrendInput
                ? 'AUTO 1X TREND RNG'
                : 'AUTO RTP RNG'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="1.0"
              placeholder="e.g. 1.45"
              value={overrideInput}
              onChange={(e) => setOverrideInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => {
                const parsed = parseFloat(overrideInput);
                if (Number.isFinite(parsed) && parsed >= 1.0) {
                  handleSetNextCrashOverride(parsed);
                } else {
                  showToast('Enter a valid crash multiplier >= 1.00', 'error');
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shrink-0 cursor-pointer"
            >
              Set Next Crash
            </button>
            {rtdbConfig.nextCrashOverride !== null && (
              <button
                type="button"
                onClick={() => handleSetNextCrashOverride(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs"
                title="Clear Override"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick 1x vs Flow Instant Trigger + 5 Preset Buttons */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const rand1x = Math.floor((1.12 + Math.random() * 0.72) * 100) / 100;
                  handleSetNextCrashOverride(rand1x);
                }}
                className="py-1.5 px-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 font-mono text-[10px] font-bold transition cursor-pointer"
              >
                Force 1x Next (1.1x–1.8x)
              </button>
              <button
                type="button"
                onClick={() => {
                  const randFlow = Math.floor((2.25 + Math.random() * 3.6) * 100) / 100;
                  handleSetNextCrashOverride(randFlow);
                }}
                className="py-1.5 px-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 font-mono text-[10px] font-bold transition cursor-pointer"
              >
                Allow Flow Next (2.2x–5.8x)
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1.0, 1.35, 1.75, 2.5, 10.0].map((preset) => {
                const isSelected = rtdbConfig.nextCrashOverride === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSetNextCrashOverride(preset)}
                    className={`py-1.5 rounded-xl font-mono text-[11px] font-black border transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                    }`}
                  >
                    {preset.toFixed(2)}x
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. 1x Trend Mode, Streak Breaker & Master Aviator Enable Switches */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2.5">
          {/* 1x Trend + Occasional Flow Switch + Dynamic Wave Selector */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-sky-500/30 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-sky-400" />
                  <span>1x Trend Wave Engine (Lamba / Short / Mix)</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Auto alternates Lamba 1x Trend, Short 1x Trend &amp; Mix Flow
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleQuickToggle('oneXTrendEnabled', !oneXTrendInput)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black border transition shrink-0 cursor-pointer ${
                  oneXTrendInput
                    ? 'bg-sky-400 text-slate-950 border-sky-300 shadow-sm shadow-sky-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {oneXTrendInput ? '1X ON' : 'OFF'}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  { id: 'AUTO_WAVE', label: 'AUTO WAVE' },
                  { id: 'LONG_1X', label: 'LAMBA 1X' },
                  { id: 'SHORT_1X', label: 'SHORT 1X' },
                  { id: 'MIX', label: 'MIX FLOW' }
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={async () => {
                    setTrendWaveModeInput(mode.id);
                    setOneXTrendInput(true);
                    store.updateAviatorEngineConfig(
                      { oneXTrendEnabled: true, trendWaveMode: mode.id },
                      adminId
                    );
                    try {
                      await rtdbUpdate(rtdbRef(rtdb, 'admin_settings/aviator'), {
                        oneXTrendEnabled: true,
                        trendWaveMode: mode.id,
                        updatedAt: Date.now(),
                        updatedBy: adminId
                      });
                    } catch {}
                    showToast(`Aviator Trend Wave set to ${mode.label}`, 'info');
                  }}
                  className={`py-1 rounded-lg font-mono text-[9px] font-black border transition cursor-pointer ${
                    trendWaveModeInput === mode.id && oneXTrendInput
                      ? 'bg-sky-400 text-slate-950 border-sky-200'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Anti-Runaway Streak Breaker Switch */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Anti-Runaway Streak Breaker</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                After any high flight, pulls next round back into 1x range
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleQuickToggle('streakBreakerEnabled', !streakBreakerInput)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black border transition shrink-0 cursor-pointer ${
                streakBreakerInput
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {streakBreakerInput ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Enable / Disable Aviator Switch */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Power className="w-3.5 h-3.5 text-rose-400" />
                <span>Enable / Disable Aviator</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                When OFF, pauses flights &amp; shows Maintenance Overlay
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleQuickToggle('gameEnabled', !gameEnabledInput)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black border transition shrink-0 cursor-pointer ${
                gameEnabledInput
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                  : 'bg-rose-600 text-white border-rose-400'
              }`}
            >
              {gameEnabledInput ? 'ENABLED' : 'PAUSED'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Engine Configuration Form (1x Trend %, Occasional Flow Ceiling, Target RTP, Max Cap & Save Button) */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">
              1x Trend Dominance &amp; Occasional Flow Configuration
            </span>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveEngineParameters}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-brand font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving to RTDB...' : 'Save Engine Parameters'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* 1x Trend Probability (%) */}
          <div className="p-3 rounded-xl bg-slate-900 border border-sky-500/30 space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-sky-300">
                1x Trend Frequency (1.00x – 1.98x %)
              </label>
              <span className="text-[10px] font-mono text-purple-300">
                Occasional Flow (2x+): {Math.max(4, 100 - oneXProbInput)}%
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                min="55"
                max="96"
                value={oneXProbInput}
                onChange={(e) => setOneXProbInput(Number(e.target.value))}
                className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs font-bold text-sky-300 focus:outline-none focus:border-sky-400"
              />
              <div className="flex items-center gap-1.5 flex-1">
                {[75, 82, 88, 92].map((probPreset) => (
                  <button
                    key={probPreset}
                    type="button"
                    onClick={() => handleSelectOneXProbability(probPreset)}
                    className={`px-2.5 py-2 rounded-xl font-mono text-[11px] font-black border transition cursor-pointer ${
                      oneXProbInput === probPreset
                        ? 'bg-sky-400 text-slate-950 border-sky-300'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    {probPreset}% 1x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Occasional Flow Ceiling */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300">
                Occasional Flow Max
              </label>
              <span className="text-[10px] font-mono text-purple-400">
                Kabhi-Kabhi {highFlowMaxInput}x
              </span>
            </div>
            <input
              type="number"
              min="3"
              max={maxCapInput}
              value={highFlowMaxInput}
              onChange={(e) => setHighFlowMaxInput(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Hard Max Multiplier Cap */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300">
                Hard Crash Cap
              </label>
              <span className="text-[10px] font-mono text-amber-300">
                Max {maxCapInput}x
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="2"
                max="1000"
                value={maxCapInput}
                onChange={(e) => setMaxCapInput(Number(e.target.value))}
                className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 font-mono text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              />
              {[15, 50].map((capPreset) => (
                <button
                  key={capPreset}
                  type="button"
                  onClick={() => setMaxCapInput(capPreset)}
                  className={`px-2 py-2 rounded-xl font-mono text-[10px] font-black border transition cursor-pointer ${
                    maxCapInput === capPreset
                      ? 'bg-amber-500 text-slate-950 border-amber-300'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  {capPreset}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Distribution Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[10px] font-mono">
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="text-rose-400 font-bold block">1.00x – 1.22x</span>
            <span>~18% Early 1x Bust</span>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-sky-500/30 text-slate-300">
            <span className="text-sky-400 font-bold block">1.23x – 1.62x</span>
            <span>~38% Core 1x Trend</span>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-sky-500/30 text-slate-300">
            <span className="text-cyan-400 font-bold block">1.63x – 1.98x</span>
            <span>~26% Upper 1x Trend</span>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-purple-500/30 text-slate-300">
            <span className="text-purple-400 font-bold block">2.00x – 4.40x</span>
            <span>~13% Kabhi-Kabhi Flow</span>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-amber-500/30 text-slate-300">
            <span className="text-amber-400 font-bold block">4.41x – {highFlowMaxInput}x+</span>
            <span>~5% Rare High Flow</span>
          </div>
        </div>
      </div>

      {/* Upcoming Color & Number Trends Analytics & Sequence Nudge Panel */}
      <AdminTrendsAnalytics adminId={adminId} />
    </div>
  );
};
