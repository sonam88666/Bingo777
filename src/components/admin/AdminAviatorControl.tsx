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

export interface RtdbAviatorAdminConfig {
  targetRtp: number;
  maxMultiplierCap: number;
  streakBreakerEnabled: boolean;
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
    nextCrashOverride: null,
    forceCrashNow: false,
    gameEnabled: true
  });

  // Form inputs
  const [overrideInput, setOverrideInput] = useState<string>('');
  const [targetRtpInput, setTargetRtpInput] = useState<number>(95);
  const [maxCapInput, setMaxCapInput] = useState<number>(50);
  const [streakBreakerInput, setStreakBreakerInput] = useState<boolean>(true);
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
    1.85;

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
        : 'Cleared Next Crash Override — Controlled RTP & Streak-Breaker active',
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

    store.updateAviatorEngineConfig(
      {
        rtpPercent: safeRtp,
        houseEdgePercent: Math.round((100 - safeRtp) * 100) / 100,
        maxMultiplierCap: safeCap,
        streakBreakerEnabled: streakBreakerInput,
        enabled: gameEnabledInput,
        paused: !gameEnabledInput
      } as any,
      adminId
    );

    try {
      await rtdbUpdate(rtdbRef(rtdb, 'admin_settings/aviator'), {
        targetRtp: safeRtp,
        maxMultiplierCap: safeCap,
        streakBreakerEnabled: streakBreakerInput,
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
        `Saved Aviator Engine Parameters (RTP: ${safeRtp}%, Cap: ${safeCap}x, Streak Breaker: ${
          streakBreakerInput ? 'ON' : 'OFF'
        })`,
        'success'
      );
    } catch {
      showToast('Saved locally, syncing to Realtime Database...', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle for Streak Breaker or Game Enabled
  const handleQuickToggle = async (
    field: 'streakBreakerEnabled' | 'gameEnabled',
    nextVal: boolean
  ) => {
    if (field === 'streakBreakerEnabled') {
      setStreakBreakerInput(nextVal);
      store.updateAviatorEngineConfig({ streakBreakerEnabled: nextVal } as any, adminId);
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
      field === 'streakBreakerEnabled'
        ? `Anti-Runaway Streak Breaker turned ${nextVal ? 'ON' : 'OFF'}`
        : `Aviator Crash Game ${nextVal ? 'ENABLED' : 'PAUSED (Maintenance Overlay Active)'}`,
      'info'
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
            <div className="flex items-center gap-2">
              <h3 className="font-brand font-black text-base sm:text-lg text-white">
                Firebase Real-Time Aviator Crash Engine Control
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                /admin_settings/aviator
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Anti-runaway probability distribution, instant crash override, streak breaker & live flight mirror
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

      {/* Top 3-Column Grid: Live Flight Mirror | Next Round Crash Override | Anti-Runaway & Status Switches */}
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
              <span className={lastCrash > 10 ? 'text-fuchsia-400 font-bold' : 'text-sky-400 font-bold'}>
                {lastCrash.toFixed(2)}x {lastCrash > 10 && rtdbConfig.streakBreakerEnabled ? '(Streak Breaker Next <2.5x)' : ''}
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
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {rtdbConfig.nextCrashOverride !== null
                ? `LOCKED: ${rtdbConfig.nextCrashOverride.toFixed(2)}x`
                : 'AUTO RTP RNG'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="1.0"
              placeholder="e.g. 2.50"
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

          {/* 5 Required Preset Buttons: 1.00x, 1.50x, 2.50x, 10.00x, 50.00x */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-500 block font-semibold">
              1-Tap Next Crash Presets (Resets to null after 1 round):
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {[1.0, 1.5, 2.5, 10.0, 50.0].map((preset) => {
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

        {/* 3. Anti-Runaway Streak Breaker & Master Aviator Enable Switches */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
          {/* Anti-Runaway Streak Breaker Switch */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Anti-Runaway Streak Breaker</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                If previous flight &gt; 10.00x, forces next round below 2.50x
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
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Power className="w-3.5 h-3.5 text-rose-400" />
                <span>Enable / Disable Aviator</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                When OFF, pauses flights & shows Maintenance Overlay
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

      {/* Bottom Engine Configuration Form (Target RTP, Max Multiplier Cap & Save Button) */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">
              Engine Probability & Ceiling Configuration (5-Tier Realistic Distribution)
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Target RTP Input */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300">
                Target RTP (%)
              </label>
              <span className="text-[10px] font-mono text-emerald-400">
                House Margin: {Math.max(1, 100 - targetRtpInput)}%
              </span>
            </div>
            <input
              type="number"
              min="85"
              max="99"
              step="0.5"
              value={targetRtpInput}
              onChange={(e) => setTargetRtpInput(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Max Multiplier Cap Input + Quick Cap Buttons */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300">
                Max Multiplier Cap (Hard Crash Ceiling)
              </label>
              <span className="text-[10px] font-mono text-amber-300">
                Plane crashes immediately if it reaches {maxCapInput}x
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                min="2"
                max="1000"
                value={maxCapInput}
                onChange={(e) => setMaxCapInput(Number(e.target.value))}
                className="w-28 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              />
              <div className="flex items-center gap-1.5 flex-1">
                {[10, 20, 50, 100].map((capPreset) => (
                  <button
                    key={capPreset}
                    type="button"
                    onClick={() => setMaxCapInput(capPreset)}
                    className={`px-3 py-2 rounded-xl font-mono text-xs font-black border transition cursor-pointer ${
                      maxCapInput === capPreset
                        ? 'bg-amber-500 text-slate-950 border-amber-300'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    {capPreset}x Cap
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[10px] font-mono">
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="text-rose-400 font-bold block">1.00x – 1.20x</span>
            <span>~10% Instant Bust</span>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="text-sky-400 font-bold block">1.21x – 2.00x</span>
            <span>~45% Common Low</span>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="text-purple-400 font-bold block">2.01x – 5.00x</span>
            <span>~30% Medium Run</span>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="text-amber-400 font-bold block">5.01x – 15.00x</span>
            <span>~12% High Flight</span>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="text-fuchsia-400 font-bold block">15.01x – {maxCapInput}x</span>
            <span>≤3% Rare Capped</span>
          </div>
        </div>
      </div>
    </div>
  );
};
