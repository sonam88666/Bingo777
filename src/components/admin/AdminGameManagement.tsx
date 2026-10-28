import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Sliders,
  Plane,
  ShieldCheck,
  RotateCcw,
  TrendingUp,
  Play,
  Pause,
  Zap,
  KeyRound,
  Activity,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { AdminGameSwitchboard } from './AdminGameSwitchboard';
import { AdminLiveBets } from './AdminLiveBets';
import { AdminAviatorControl } from './AdminAviatorControl';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';
import { AviatorSimulationReport } from '../../types';

interface AdminGameManagementProps {
  adminId?: string;
  masterToken?: string;
}

export const AdminGameManagement: React.FC<AdminGameManagementProps> = ({
  adminId = 'MasterAdmin_01',
  masterToken
}) => {
  const { showToast } = useToast();
  const [subTab, setSubTab] = useState<'switchboard' | 'wingo_engine' | 'aviator_analytics'>('aviator_analytics');
  const [, setTick] = useState(0);

  // Admin Control Local Inputs
  const config = store.getAviatorEngineConfig();
  const [overrideInput, setOverrideInput] = useState<string>(
    config.nextCrashOverride ? String(config.nextCrashOverride) : ''
  );
  const [rtpInput, setRtpInput] = useState<number>(config.rtpPercent || 97);
  const [minBetInput, setMinBetInput] = useState<number>(config.minBet || 50);
  const [maxBetInput, setMaxBetInput] = useState<number>(config.maxBet || 100000);
  const [maxCapInput, setMaxCapInput] = useState<number>(config.maxMultiplierCap || 1000);
  const [waitSecsInput, setWaitSecsInput] = useState<number>(config.waitDurationSeconds || 5);
  const [clientSeedInput, setClientSeedInput] = useState<string>(
    config.provablyFairClientSeed || 'bingo777-public-aviator-seed-v1'
  );
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [simReport, setSimReport] = useState<AviatorSimulationReport | null>(
    store.getAviatorLastSimulationReport()
  );

  useEffect(() => {
    const unsub = store.subscribe(() => setTick((t) => t + 1));
    const liveTimer = setInterval(() => setTick((t) => t + 1), 120);
    return () => {
      unsub();
      clearInterval(liveTimer);
    };
  }, []);

  const avAnalytics = store.getAviatorSessionAnalytics();
  const avRound = store.getAviatorRound();
  const liveMult = store.getAviatorLiveMultiplier();
  const pastCrashes = store.getAviatorPastCrashes();
  const activeBetsList = Object.values(avRound.bets || {});

  const handleApplyOverride = (val: number | null) => {
    store.setAviatorCrashOverride(val, adminId);
    setOverrideInput(val !== null ? String(val) : '');
    showToast(
      val !== null
        ? `Next Aviator round override locked at ${val.toFixed(2)}x`
        : 'Cleared manual override — Provably Fair HMAC-SHA256 active',
      'info'
    );
  };

  const handleSaveEngineConfig = () => {
    const safeRtp = Math.min(99, Math.max(90, Number(rtpInput) || 97));
    const safeMinBet = Math.max(10, Number(minBetInput) || 50);
    const safeMaxBet = Math.max(safeMinBet, Number(maxBetInput) || 100000);
    const safeMaxCap = Math.max(10, Math.min(10000, Number(maxCapInput) || 1000));
    const safeWait = Math.max(3, Math.min(15, Number(waitSecsInput) || 5));

    store.updateAviatorEngineConfig(
      {
        rtpPercent: safeRtp,
        houseEdgePercent: Math.round((100 - safeRtp) * 100) / 100,
        minBet: safeMinBet,
        maxBet: safeMaxBet,
        maxMultiplierCap: safeMaxCap,
        waitDurationSeconds: safeWait
      },
      adminId
    );
    showToast('Aviator Engine configuration saved & synced to live server', 'success');
  };

  const handleRun100kSimulation = async () => {
    setIsRunningSim(true);
    try {
      const report = await store.runAviatorFairnessSimulation(100000);
      setSimReport(report);
      const rtp2x = report.strategyRtpChecks.find((s) => s.targetMultiplier === 2)?.empiricalRtpPercent ?? report.rtpPercent;
      showToast(
        `Verified 100,000 simulated rounds in ${report.executionTimeMs}ms! Empirical RTP (2x): ${rtp2x}%`,
        'success'
      );
    } finally {
      setIsRunningSim(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-navigation bar */}
      <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-1.5 shadow-xl">
        <button
          type="button"
          onClick={() => setSubTab('switchboard')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            subTab === 'switchboard'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>All Games Switchboard</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('wingo_engine')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            subTab === 'wingo_engine'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Win Go Period Engine</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('aviator_analytics')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            subTab === 'aviator_analytics'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>Aviator Master Control Console</span>
        </button>
      </div>

      {/* Content based on selected subTab */}
      {subTab === 'switchboard' && (
        <AdminGameSwitchboard adminId={adminId} masterToken={masterToken} showTitle={false} />
      )}

      {subTab === 'wingo_engine' && (
        <AdminLiveBets adminId={adminId} initialView="management" />
      )}

      {subTab === 'aviator_analytics' && (
        <div className="space-y-4">
          {/* 0. Firebase Real-Time Aviator Crash Engine Control (/admin_settings/aviator) */}
          <AdminAviatorControl adminId={adminId} />

          {/* 1. Real-Time Server-Authoritative Live Round Mirror & Instant Flight Controls */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-brand font-black text-base text-slate-100">
                    Aviator Master Control Console & Live Server Mirror
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time synchronized server state, Provably Fair HMAC-SHA256 seed controls & 100,000-round Monte Carlo verifier
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    store.toggleAviatorPause(!config.paused, adminId);
                    showToast(
                      !config.paused ? 'Aviator Engine Paused' : 'Aviator Engine Resumed',
                      'info'
                    );
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition ${
                    config.paused
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                  }`}
                >
                  {config.paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{config.paused ? 'Resume Engine' : 'Pause Engine'}</span>
                </button>

                <button
                  type="button"
                  disabled={avRound.status !== 'flying'}
                  onClick={() => {
                    store.forceAviatorCrashNow(adminId);
                    showToast('Forced immediate crash on active Aviator flight!', 'info');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition ${
                    avRound.status === 'flying'
                      ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-950/50'
                      : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Force Crash Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    store.resetAviatorSessionAnalytics(adminId);
                    showToast('Aviator session analytics counters reset', 'info');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center space-x-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reset Counters</span>
                </button>
              </div>
            </div>

            {/* Live Flight Mirror Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Live Server Flight State
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      avRound.status === 'flying'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                        : avRound.status === 'crashed'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {avRound.status}
                  </span>
                </div>

                <div className="text-center py-2">
                  <div className="font-mono font-black text-4xl text-white">
                    {avRound.status === 'waiting'
                      ? '1.00x'
                      : avRound.status === 'flying'
                      ? `${liveMult.toFixed(2)}x`
                      : `${(avRound.crashMultiplier || liveMult).toFixed(2)}x`}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block mt-1">
                    Target Crash Point: <strong className="text-amber-300">{(avRound.crashMultiplier || 1.0).toFixed(2)}x</strong>
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 space-y-1 pt-2 border-t border-slate-900">
                  <div className="flex justify-between">
                    <span>Round ID:</span>
                    <span className="text-slate-200">{avRound.roundId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nonce / Seed Hash:</span>
                    <span className="text-emerald-400">
                      #{avRound.nonce || 1001} ({(avRound.serverSeedHash || '').slice(0, 10)}...)
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Round Crash Override Control */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                    Next Round Crash Point Override
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {config.nextCrashOverride
                      ? `Locked: ${config.nextCrashOverride}x`
                      : 'Mode: Provably Fair RNG'}
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
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = parseFloat(overrideInput);
                      if (Number.isFinite(val) && val >= 1.0) {
                        handleApplyOverride(val);
                      } else {
                        showToast('Enter a valid multiplier >= 1.00', 'error');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                  >
                    Set Next
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyOverride(null)}
                    className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs transition"
                  >
                    Auto RNG
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {[1.0, 1.5, 2.5, 10.0, 50.0].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleApplyOverride(preset)}
                      className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 font-mono text-[10px] font-bold text-slate-300 transition"
                    >
                      {preset.toFixed(1)}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Provably Fair Seed Rotation */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    Provably Fair Seed Management
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">HMAC-SHA256</span>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">
                    Public Client Seed
                  </label>
                  <input
                    type="text"
                    value={clientSeedInput}
                    onChange={(e) => setClientSeedInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    store.rotateAviatorSeeds(clientSeedInput, adminId);
                    showToast('Rotated Server Seed & updated Public Client Seed', 'success');
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition"
                >
                  Rotate Server Seed & Apply Client Seed
                </button>
              </div>
            </div>

            {/* Engine Parameters Configuration Row */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-200">
                  Aviator Engine Parameters (RTP, Bet Limits & Timing)
                </span>
                <button
                  type="button"
                  onClick={handleSaveEngineConfig}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  Save Engine Parameters
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Target RTP (%)</label>
                  <input
                    type="number"
                    min="90"
                    max="99"
                    step="0.5"
                    value={rtpInput}
                    onChange={(e) => setRtpInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-xs font-bold text-emerald-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Min Bet (₹)</label>
                  <input
                    type="number"
                    min="10"
                    value={minBetInput}
                    onChange={(e) => setMinBetInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-xs font-bold text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Max Bet (₹)</label>
                  <input
                    type="number"
                    min="100"
                    value={maxBetInput}
                    onChange={(e) => setMaxBetInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-xs font-bold text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Max Multiplier Cap</label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={maxCapInput}
                    onChange={(e) => setMaxCapInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-xs font-bold text-amber-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Countdown (Secs)</label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={waitSecsInput}
                    onChange={(e) => setWaitSecsInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-xs font-bold text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. 100,000-Round Statistical & Fairness Verification Simulator */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-brand font-black text-base text-slate-100">
                    100,000-Round Monte Carlo Statistical & Fairness Audit
                  </h3>
                  <p className="text-xs text-slate-400">
                    Independently verifies HMAC-SHA256 distribution, natural low/medium/high variance, and RTP accuracy
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isRunningSim}
                onClick={handleRun100kSimulation}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-brand font-black text-xs shadow-lg shadow-emerald-950/50 transition"
              >
                {isRunningSim ? 'Simulating 100,000 Rounds...' : 'Run 100,000-Round Fairness Test'}
              </button>
            </div>

            {simReport ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Instant Crash (1.00x)</span>
                    <span className="font-mono font-black text-sm text-rose-400">
                      {simReport.distribution.instantCrash1x.percent}% ({simReport.distribution.instantCrash1x.count.toLocaleString()})
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Low (1.01x–1.99x)</span>
                    <span className="font-mono font-black text-sm text-sky-400">
                      {simReport.distribution.low1_01to1_99x.percent}% ({simReport.distribution.low1_01to1_99x.count.toLocaleString()})
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Medium (2.00x–9.99x)</span>
                    <span className="font-mono font-black text-sm text-purple-400">
                      {simReport.distribution.medium2to9_99x.percent}% ({simReport.distribution.medium2to9_99x.count.toLocaleString()})
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">High (10.00x–99.99x)</span>
                    <span className="font-mono font-black text-sm text-amber-400">
                      {simReport.distribution.high10to99_99x.percent}% ({simReport.distribution.high10to99_99x.count.toLocaleString()})
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Jackpot (≥100.00x)</span>
                    <span className="font-mono font-black text-sm text-fuchsia-400">
                      {simReport.distribution.ultra100xPlus.percent}% ({simReport.distribution.ultra100xPlus.count.toLocaleString()})
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    {simReport.fairnessChecks.allChecksPassed ? 'FAIRNESS & INDEPENDENCE CHECK PASSED' : 'DEVIATION DETECTED'}
                  </span>
                  <span className="text-slate-300">
                    Empirical RTP (2x): <strong>{simReport.strategyRtpChecks.find((s) => s.targetMultiplier === 2)?.empiricalRtpPercent ?? simReport.rtpPercent}%</strong> (Target {simReport.rtpPercent}%)
                  </span>
                  <span className="text-slate-300">
                    Median: <strong>{simReport.medianMultiplier.toFixed(2)}x</strong> • Mean: <strong>{simReport.meanMultiplier.toFixed(2)}x</strong>
                  </span>
                  <span className="text-slate-400">
                    Execution Time: {simReport.executionTimeMs}ms
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                Click &ldquo;Run 100,000-Round Fairness Test&rdquo; above to execute a live 100,000-round Monte Carlo cryptographic verification.
              </div>
            )}
          </div>

          {/* 3. Session Volume vs. Payout & Round-by-Round Audit Table */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Total Session Bet Volume</span>
                <span className="font-mono font-black text-lg text-slate-100">
                  ₹{avAnalytics.totalBetVolume.toFixed(2)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Total Session Payout</span>
                <span className="font-mono font-black text-lg text-rose-400">
                  ₹{avAnalytics.totalPayout.toFixed(2)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">House Net Profit</span>
                <span
                  className={`font-mono font-black text-lg ${
                    avAnalytics.netHouseProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {avAnalytics.netHouseProfit >= 0 ? '+' : ''}₹{avAnalytics.netHouseProfit.toFixed(2)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">
                  Actual House Margin (Target ≥{avAnalytics.targetHouseMarginPercent}%)
                </span>
                <span className="font-mono font-black text-lg text-emerald-400">
                  {avAnalytics.actualHouseMarginPercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Active Round Bets Monitor */}
            {activeBetsList.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-300 block">
                  Active Round Bets ({activeBetsList.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {activeBetsList.map((b) => (
                    <div
                      key={b.id}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono"
                    >
                      <span>
                        {b.username} (S{b.station || 1}): ₹{b.amount}
                      </span>
                      <span
                        className={
                          b.status === 'cashed_out'
                            ? 'text-emerald-400 font-bold'
                            : b.status === 'crashed'
                            ? 'text-rose-400'
                            : 'text-amber-300'
                        }
                      >
                        {b.status === 'cashed_out'
                          ? `${b.cashedOutMultiplier?.toFixed(2)}x (+₹${b.payout})`
                          : b.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Crashes Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0">
                Recent Crashes:
              </span>
              {pastCrashes.slice(0, 20).map((c, idx) => (
                <span
                  key={`${idx}-${c}`}
                  className={`px-2 py-0.5 rounded-lg font-mono text-xs font-bold shrink-0 border ${
                    c >= 10
                      ? 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/40'
                      : c >= 2
                      ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                      : 'bg-sky-950/80 text-sky-300 border-sky-500/40'
                  }`}
                >
                  {c.toFixed(2)}x
                </span>
              ))}
            </div>

            {/* Session Round-by-Round Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Round ID</th>
                    <th className="py-2.5 px-3">Crash Multiplier</th>
                    <th className="py-2.5 px-3">SHA-256 Commitment</th>
                    <th className="py-2.5 px-3">Bet Volume</th>
                    <th className="py-2.5 px-3">Total Payout</th>
                    <th className="py-2.5 px-3 text-right">House Net & Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 bg-slate-900/50">
                  {avAnalytics.recentRounds.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                        Completed Aviator flights will appear here in real time.
                      </td>
                    </tr>
                  ) : (
                    avAnalytics.recentRounds.map((r) => (
                      <tr key={r.roundId}>
                        <td className="py-2 px-3 text-slate-300">{r.roundId.slice(-12)}</td>
                        <td className="py-2 px-3 font-bold text-amber-300">
                          {r.crashMultiplier.toFixed(2)}x
                        </td>
                        <td className="py-2 px-3 text-emerald-400/80">
                          {(r.serverSeedHash || '').slice(0, 14)}...
                        </td>
                        <td className="py-2 px-3 text-slate-200">₹{r.totalBetVolume.toFixed(2)}</td>
                        <td className="py-2 px-3 text-rose-400">₹{r.totalPayout.toFixed(2)}</td>
                        <td
                          className={`py-2 px-3 text-right font-bold ${
                            r.houseProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {r.houseProfit >= 0 ? '+' : ''}₹{r.houseProfit.toFixed(2)} ({r.marginPercent.toFixed(1)}%)
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
