import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sliders,
  Sparkles,
  RotateCcw,
  Lock,
  Unlock,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Layers,
  Flame,
  Activity,
  CheckCircle2,
  Zap,
  BarChart3
} from 'lucide-react';
import { store } from '../../services/store';
import { classifyAviatorColorTier } from '../../services/aviatorProvablyFair';
import { AviatorUpcomingTrendNode } from '../../types';
import { useToast } from '../common/Toast';

interface AdminTrendsAnalyticsProps {
  adminId?: string;
}

export const AdminTrendsAnalytics: React.FC<AdminTrendsAnalyticsProps> = ({
  adminId = 'MasterAdmin_01'
}) => {
  const { showToast } = useToast();
  const [, setTick] = useState(0);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [customSlotMultiplier, setCustomSlotMultiplier] = useState<string>('1.45');

  useEffect(() => {
    const unsub = store.subscribe(() => setTick((t) => t + 1));
    const timer = setInterval(() => setTick((t) => t + 1), 200);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const config = store.getAviatorEngineConfig();
  const currentRound = store.getAviatorRound();
  const liveMult = store.getAviatorLiveMultiplier();
  const pastCrashes = store.getAviatorPastCrashes();
  const upcomingNodes: AviatorUpcomingTrendNode[] = store.getAviatorUpcomingTrends(12);

  const selectedNode = upcomingNodes[selectedSlotIndex] || upcomingNodes[0];

  useEffect(() => {
    if (selectedNode) {
      setCustomSlotMultiplier(selectedNode.predictedMultiplier.toFixed(2));
    }
  }, [selectedSlotIndex, selectedNode?.roundNumber]);

  const activeQueue = Array.isArray(config.trendSequenceQueue) ? config.trendSequenceQueue : [];
  const waveMode = config.trendWaveMode || 'AUTO_WAVE';
  const nudgeOffset = config.trendNudgeOffset || 0;
  const maxCap = Math.max(2, Number(config.maxMultiplierCap) || 50);

  // Materialize current 12-round forecast into a mutable array so any slot edit locks cleanly
  const getEditableSequenceArray = (): number[] => {
    return upcomingNodes.map((n) => n.predictedMultiplier);
  };

  const handleUpdateSlotMultiplier = (slotIdx: number, nextVal: number, label?: string) => {
    const cleanVal = Math.min(maxCap, Math.max(1.00, Math.floor(Number(nextVal) * 100) / 100));
    const seq = getEditableSequenceArray();
    seq[slotIdx] = cleanVal;

    // If editing Slot 0 (immediate next round), also clear conflicting single-round override so queue head is authoritative
    if (slotIdx === 0 && config.nextCrashOverride !== null && config.nextCrashOverride !== undefined) {
      store.setAviatorCrashOverride(null, adminId);
    }

    store.setAviatorTrendSequenceQueue(seq, adminId);
    setCustomSlotMultiplier(cleanVal.toFixed(2));
    const tier = classifyAviatorColorTier(cleanVal);
    showToast(
      label ||
        `Slot +${slotIdx + 1} (Round #${upcomingNodes[slotIdx]?.roundNumber}) nudged to ${cleanVal.toFixed(2)}x [${tier.colorLabel}]`,
      'success'
    );
  };

  const handleNudgeSlotDelta = (slotIdx: number, delta: number) => {
    const currentVal = upcomingNodes[slotIdx]?.predictedMultiplier || 1.35;
    const nextVal = Math.max(1.00, Math.min(maxCap, Math.round((currentVal + delta) * 100) / 100));
    handleUpdateSlotMultiplier(
      slotIdx,
      nextVal,
      `Nudged Round #${upcomingNodes[slotIdx]?.roundNumber} by ${delta > 0 ? `+${delta.toFixed(2)}x` : `${delta.toFixed(2)}x`} → ${nextVal.toFixed(2)}x`
    );
  };

  const handleSetSlotTierPreset = (slotIdx: number, tier: 'BLUE_1X' | 'PURPLE_MID' | 'PINK_HIGH') => {
    const rNum = upcomingNodes[slotIdx]?.roundNumber || 1001;
    const micro = ((rNum * 17 + slotIdx * 31) % 35) / 100;
    let target = 1.32;
    if (tier === 'BLUE_1X') {
      target = Math.round((1.18 + micro * 1.6) * 100) / 100; // 1.18x - 1.74x
    } else if (tier === 'PURPLE_MID') {
      target = Math.round((2.35 + micro * 8.5) * 100) / 100; // 2.35x - 5.32x
    } else {
      target = Math.min(maxCap, Math.round((10.80 + micro * 18.0) * 100) / 100); // 10.80x - 17.10x
    }
    handleUpdateSlotMultiplier(
      slotIdx,
      target,
      `Switched Round #${rNum} to ${tier === 'BLUE_1X' ? 'Blue 1x' : tier === 'PURPLE_MID' ? 'Purple Flow' : 'Pink High'} (${target.toFixed(2)}x)`
    );
  };

  const handleInsertStepAtSlot = (slotIdx: number, multValue: number) => {
    const seq = getEditableSequenceArray();
    seq.splice(slotIdx, 0, Math.min(maxCap, Math.max(1.00, multValue)));
    const trimmed = seq.slice(0, 12);
    store.setAviatorTrendSequenceQueue(trimmed, adminId);
    showToast(
      `Inserted ${multValue.toFixed(2)}x at Slot +${slotIdx + 1} and shifted subsequent trend flow`,
      'success'
    );
  };

  const handleRemoveStepAtSlot = (slotIdx: number) => {
    const seq = getEditableSequenceArray();
    seq.splice(slotIdx, 1);
    store.setAviatorTrendSequenceQueue(seq, adminId);
    showToast(`Removed Slot +${slotIdx + 1} and pulled upcoming sequence forward`, 'info');
  };

  const handleApplySequencePreset = (presetName: string, sequence: number[]) => {
    if (config.nextCrashOverride !== null && config.nextCrashOverride !== undefined) {
      store.setAviatorCrashOverride(null, adminId);
    }
    store.setAviatorTrendSequenceQueue(sequence, adminId);
    showToast(`Applied "${presetName}" sequence (${sequence.length} rounds locked)`, 'success');
  };

  const handleClearCustomQueue = () => {
    store.setAviatorTrendSequenceQueue([], adminId);
    if (config.nextCrashOverride !== null && config.nextCrashOverride !== undefined) {
      store.setAviatorCrashOverride(null, adminId);
    }
    showToast('Cleared manual sequence queue — Natural Multi-Wave Trend Engine active', 'info');
  };

  const handleNudgeWavePhase = (deltaSteps: number) => {
    store.nudgeAviatorWaveOffset(deltaSteps, adminId);
    showToast(
      `Wave Phase shifted by ${deltaSteps > 0 ? `+${deltaSteps}` : deltaSteps} step(s) (Offset: ${nudgeOffset + deltaSteps})`,
      'success'
    );
  };

  const handleChangeWaveMode = (nextMode: 'AUTO_WAVE' | 'LONG_1X' | 'SHORT_1X' | 'MIX') => {
    store.updateAviatorEngineConfig({ trendWaveMode: nextMode, oneXTrendEnabled: true }, adminId);
    showToast(`Switched Active Wave Mode to ${nextMode.replace('_', ' ')}`, 'success');
  };

  // Analytics Calculations: Past 30 Rounds vs Upcoming 12 Rounds
  const recentSample = pastCrashes.slice(0, 30);
  const totalRecent = Math.max(1, recentSample.length);
  const recentBlueCount = recentSample.filter((c) => c < 2.0).length;
  const recentPurpleCount = recentSample.filter((c) => c >= 2.0 && c < 10.0).length;
  const recentPinkCount = recentSample.filter((c) => c >= 10.0).length;

  const upcomingBlueCount = upcomingNodes.filter((n) => n.colorTier === 'BLUE_1X').length;
  const upcomingPurpleCount = upcomingNodes.filter((n) => n.colorTier === 'PURPLE_MID').length;
  const upcomingPinkCount = upcomingNodes.filter((n) => n.colorTier === 'PINK_HIGH').length;

  // Consecutive 1x streak metrics
  let currentOneXStreak = 0;
  for (const c of recentSample) {
    if (c < 2.0) currentOneXStreak++;
    else break;
  }

  let maxRecentOneXStreak = 0;
  let runningStreak = 0;
  for (const c of recentSample) {
    if (c < 2.0) {
      runningStreak++;
      if (runningStreak > maxRecentOneXStreak) maxRecentOneXStreak = runningStreak;
    } else {
      runningStreak = 0;
    }
  }

  let maxUpcomingOneXStreak = 0;
  let runningUpcomingStreak = 0;
  for (const n of upcomingNodes) {
    if (n.predictedMultiplier < 2.0) {
      runningUpcomingStreak++;
      if (runningUpcomingStreak > maxUpcomingOneXStreak) maxUpcomingOneXStreak = runningUpcomingStreak;
    } else {
      runningUpcomingStreak = 0;
    }
  }

  const getTierBadgeClasses = (tier: 'BLUE_1X' | 'PURPLE_MID' | 'PINK_HIGH') => {
    if (tier === 'BLUE_1X') {
      return {
        cardBg: 'bg-sky-950/40 border-sky-500/40 hover:border-sky-400',
        pillBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        text: 'text-sky-400',
        barBg: 'bg-sky-400',
        dot: 'bg-sky-400'
      };
    }
    if (tier === 'PURPLE_MID') {
      return {
        cardBg: 'bg-purple-950/40 border-purple-500/40 hover:border-purple-400',
        pillBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        text: 'text-purple-400',
        barBg: 'bg-purple-400',
        dot: 'bg-purple-400'
      };
    }
    return {
      cardBg: 'bg-pink-950/45 border-pink-500/50 hover:border-pink-400',
      pillBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      text: 'text-pink-400',
      barBg: 'bg-pink-400',
      dot: 'bg-pink-400'
    };
  };

  const getWaveBadgeLabel = (wave: 'LONG_1X' | 'SHORT_1X' | 'MIX') => {
    if (wave === 'LONG_1X') return 'LAMBA 1X';
    if (wave === 'SHORT_1X') return 'SHORT 1X';
    return 'MIX FLOW';
  };

  return (
    <div className="space-y-5 text-slate-100">
      {/* 1. Top Live Trend Telemetry & Wave Phase Control Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-indigo-950/40 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white uppercase">
                  Aviator Trends Analytics & Flow Sequencer
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE SYNC</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Visualize upcoming Blue 1x, Purple 2x–9x, and Pink 10x+ multiplier trends and manually nudge or lock the upcoming round sequence.
              </p>
            </div>
          </div>

          {/* Live Round Status & Active Wave Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 flex items-center space-x-3">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Current Round</div>
                <div className="text-xs font-black text-white font-mono">
                  #{currentRound.roundNumber || 1001}{' '}
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.5 rounded uppercase ${
                      currentRound.status === 'flying'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : currentRound.status === 'crashed'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {currentRound.status}
                  </span>
                </div>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Live / Target</div>
                <div className="text-sm font-black font-mono text-amber-300">
                  {currentRound.status === 'flying'
                    ? `${liveMult.toFixed(2)}x`
                    : `${(currentRound.crashMultiplier || 1.45).toFixed(2)}x`}
                </div>
              </div>
            </div>

            <div className="bg-slate-950/90 border border-purple-500/30 rounded-xl px-3 py-2">
              <div className="text-[10px] font-bold text-purple-300 uppercase">
                Wave Phase (Step {(upcomingNodes[0]?.stepInWave ?? 0) + 1}/6)
              </div>
              <div className="text-xs font-black text-white flex items-center space-x-1.5">
                <span>{getWaveBadgeLabel(upcomingNodes[0]?.activeWave || 'LONG_1X')}</span>
                <span className="text-[10px] text-slate-400 font-mono">(Offset: {nudgeOffset >= 0 ? `+${nudgeOffset}` : nudgeOffset})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Mode Selector + Phase Nudge Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black uppercase text-slate-400 mr-1">Wave Cycle Mode:</span>
            {(
              [
                { id: 'AUTO_WAVE', label: '🔄 AUTO WAVE' },
                { id: 'LONG_1X', label: '📉 LAMBA 1X (5x Blue → Flow)' },
                { id: 'SHORT_1X', label: '⚡ SHORT 1X (1–2x Blue → Flow)' },
                { id: 'MIX', label: '🎲 MIX ZIG-ZAG' }
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleChangeWaveMode(m.id)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition border ${
                  waveMode === m.id
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black uppercase text-slate-400 mr-1">Nudge Wave Phase:</span>
            <button
              type="button"
              onClick={() => handleNudgeWavePhase(-1)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold flex items-center space-x-1 transition active:scale-95"
              title="Shift wave cycle backward by 1 round"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
              <span>-1 Step</span>
            </button>
            <button
              type="button"
              onClick={() => handleNudgeWavePhase(1)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold flex items-center space-x-1 transition active:scale-95"
              title="Advance wave cycle forward by 1 round"
            >
              <span>+1 Step</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
            </button>
            <button
              type="button"
              onClick={() => handleNudgeWavePhase(3)}
              className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-[11px] font-bold transition active:scale-95"
              title="Jump 3 steps in wave cycle"
            >
              Skip +3 Steps
            </button>
          </div>
        </div>
      </div>

      {/* 2. Upcoming 12-Round Color & Number Trend Sequence Visualizer */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                Upcoming 12-Round Color & Multiplier Sequence
              </h3>
              {activeQueue.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>{activeQueue.length} QUEUED LOCKS</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center space-x-1">
                  <Unlock className="w-3 h-3" />
                  <span>AUTO WAVE FORECAST</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click any upcoming round card to inspect, or use the quick <span className="text-sky-300 font-bold">1x</span> /{' '}
              <span className="text-purple-300 font-bold">2x+</span> / <span className="text-pink-300 font-bold">10x+</span> buttons on each slot to nudge the flow immediately.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const locked = getEditableSequenceArray();
                store.setAviatorTrendSequenceQueue(locked, adminId);
                showToast('Locked all 12 upcoming forecast rounds into the manual sequence queue!', 'success');
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center space-x-1.5 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock All 12 Slots</span>
            </button>
            {activeQueue.length > 0 && (
              <button
                type="button"
                onClick={handleClearCustomQueue}
                className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-black flex items-center space-x-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Natural Wave</span>
              </button>
            )}
          </div>
        </div>

        {/* Color Tier Legend */}
        <div className="flex flex-wrap items-center gap-3 mb-3.5 px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px]">
          <span className="font-bold text-slate-400 uppercase">Color / Number Tiers:</span>
          <span className="flex items-center space-x-1.5 text-sky-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            <span>Blue 1x (1.00x – 1.99x Low Trend)</span>
          </span>
          <span className="flex items-center space-x-1.5 text-purple-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
            <span>Purple 2x–9x (2.00x – 9.99x Medium Flow)</span>
          </span>
          <span className="flex items-center space-x-1.5 text-pink-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block" />
            <span>Pink 10x+ (10.00x+ High Burst)</span>
          </span>
        </div>

        {/* 12-Slot Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {upcomingNodes.map((node, idx) => {
            const style = getTierBadgeClasses(node.colorTier);
            const isSelected = selectedSlotIndex === idx;
            const isLocked = node.source === 'QUEUED_SEQUENCE' || node.source === 'OVERRIDE_NEXT';

            return (
              <div
                key={`${node.roundNumber}_${idx}`}
                onClick={() => setSelectedSlotIndex(idx)}
                className={`rounded-2xl border p-3 transition-all cursor-pointer relative flex flex-col justify-between ${
                  style.cardBg
                } ${
                  isSelected
                    ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/10'
                    : ''
                }`}
              >
                {/* Top Row: Step offset & Lock badge */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        idx === 0
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900/90 text-slate-300 border border-slate-700/70'
                      }`}
                    >
                      {idx === 0 ? 'NEXT #1' : `+${idx + 1}`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      #{node.roundNumber}
                    </span>
                  </div>

                  {/* Center Multiplier Number & Color Badge */}
                  <div className="my-1.5 text-center">
                    <div className={`text-xl font-black font-mono tracking-tight ${style.text}`}>
                      {node.predictedMultiplier.toFixed(2)}x
                    </div>
                    <div className="mt-1 flex items-center justify-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${style.pillBg}`}
                      >
                        {node.colorLabel}
                      </span>
                    </div>
                  </div>

                  {/* Wave & Source Sub-row */}
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 mt-2 pt-1.5 border-t border-slate-800/70">
                    <span>{getWaveBadgeLabel(node.activeWave)}</span>
                    <span className={isLocked ? 'text-amber-300 font-black' : 'text-slate-500'}>
                      {isLocked ? 'LOCKED' : 'WAVE'}
                    </span>
                  </div>
                </div>

                {/* Quick Inline Nudge Controls on Card */}
                <div
                  className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Color Tier 1-Click Switcher */}
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetSlotTierPreset(idx, 'BLUE_1X')}
                      className={`py-1 rounded text-[9px] font-black border transition ${
                        node.colorTier === 'BLUE_1X'
                          ? 'bg-sky-500 text-slate-950 border-sky-300'
                          : 'bg-slate-950/80 text-sky-300 border-sky-500/30 hover:bg-sky-500/20'
                      }`}
                      title="Set slot to Blue 1x (1.18x–1.75x)"
                    >
                      1x
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetSlotTierPreset(idx, 'PURPLE_MID')}
                      className={`py-1 rounded text-[9px] font-black border transition ${
                        node.colorTier === 'PURPLE_MID'
                          ? 'bg-purple-500 text-white border-purple-300'
                          : 'bg-slate-950/80 text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
                      }`}
                      title="Set slot to Purple Flow (2.35x–5.30x)"
                    >
                      3x
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetSlotTierPreset(idx, 'PINK_HIGH')}
                      className={`py-1 rounded text-[9px] font-black border transition ${
                        node.colorTier === 'PINK_HIGH'
                          ? 'bg-pink-500 text-white border-pink-300'
                          : 'bg-slate-950/80 text-pink-300 border-pink-500/30 hover:bg-pink-500/20'
                      }`}
                      title="Set slot to Pink High (10.80x+)"
                    >
                      12x
                    </button>
                  </div>

                  {/* Fine Nudge - / + */}
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => handleNudgeSlotDelta(idx, -0.25)}
                      className="py-0.5 rounded bg-slate-950/90 hover:bg-slate-800 border border-slate-700/80 text-[9px] font-bold text-slate-300 flex items-center justify-center space-x-0.5"
                    >
                      <Minus className="w-2.5 h-2.5 text-rose-400" />
                      <span>0.25x</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudgeSlotDelta(idx, 0.50)}
                      className="py-0.5 rounded bg-slate-950/90 hover:bg-slate-800 border border-slate-700/80 text-[9px] font-bold text-slate-300 flex items-center justify-center space-x-0.5"
                    >
                      <Plus className="w-2.5 h-2.5 text-emerald-400" />
                      <span>0.50x</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Slot Precision Nudge Editor + 1-Click Sequence Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Cols: Selected Slot Deep Nudge Editor */}
        <div className="lg:col-span-7 bg-slate-900/95 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wide">
                Precision Slot Nudge — Slot +{selectedSlotIndex + 1} (Round #{selectedNode?.roundNumber})
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-950 border border-slate-700 text-amber-300">
              {selectedNode?.colorLabel} • {selectedNode?.numberBandLabel}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Exact Target Multiplier for Round #{selectedNode?.roundNumber}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1.00"
                    max={maxCap}
                    step="0.05"
                    value={customSlotMultiplier}
                    onChange={(e) => setCustomSlotMultiplier(e.target.value)}
                    className="w-32 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-black text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = parseFloat(customSlotMultiplier);
                      if (Number.isFinite(parsed) && parsed >= 1.0) {
                        handleUpdateSlotMultiplier(selectedSlotIndex, parsed);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md transition flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply to Slot +{selectedSlotIndex + 1}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span>Slide to Nudge (1.00x – 25.00x)</span>
                  <span className="text-amber-300 font-mono">{Number(customSlotMultiplier || 1.45).toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1.00"
                  max={Math.min(25, maxCap)}
                  step="0.05"
                  value={Math.min(25, Number(customSlotMultiplier) || 1.45)}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setCustomSlotMultiplier(v.toFixed(2));
                    handleUpdateSlotMultiplier(selectedSlotIndex, v);
                  }}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Number/Color Chips for Selected Slot */}
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                Instant Color / Number Value Chips for Slot +{selectedSlotIndex + 1}:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { val: 1.00, label: '1.00x Bust', cls: 'border-sky-500/40 text-sky-300 bg-sky-950/50' },
                  { val: 1.18, label: '1.18x Low Blue', cls: 'border-sky-500/40 text-sky-300 bg-sky-950/50' },
                  { val: 1.45, label: '1.45x Mid Blue', cls: 'border-sky-500/40 text-sky-300 bg-sky-950/50' },
                  { val: 1.85, label: '1.85x High Blue', cls: 'border-sky-500/40 text-sky-300 bg-sky-950/50' },
                  { val: 2.40, label: '2.40x Purple', cls: 'border-purple-500/40 text-purple-300 bg-purple-950/50' },
                  { val: 4.60, label: '4.60x Purple', cls: 'border-purple-500/40 text-purple-300 bg-purple-950/50' },
                  { val: 8.20, label: '8.20x Deep Purple', cls: 'border-purple-500/40 text-purple-300 bg-purple-950/50' },
                  { val: 12.50, label: '12.50x Pink', cls: 'border-pink-500/40 text-pink-300 bg-pink-950/50' },
                  { val: 22.00, label: '22.00x Mega Pink', cls: 'border-pink-500/40 text-pink-300 bg-pink-950/50' }
                ].map((chip) => (
                  <button
                    key={chip.val}
                    type="button"
                    onClick={() => handleUpdateSlotMultiplier(selectedSlotIndex, chip.val)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black border hover:brightness-125 transition ${chip.cls}`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sequence Queue Shift Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleInsertStepAtSlot(selectedSlotIndex, 1.24)}
                className="px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-[11px] font-bold flex items-center space-x-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert Blue 1.24x Here</span>
              </button>
              <button
                type="button"
                onClick={() => handleInsertStepAtSlot(selectedSlotIndex, 3.25)}
                className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-[11px] font-bold flex items-center space-x-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert Purple 3.25x Here</span>
              </button>
              <button
                type="button"
                onClick={() => handleRemoveStepAtSlot(selectedSlotIndex)}
                className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-[11px] font-bold flex items-center space-x-1 transition"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Skip / Pull Sequence Forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: 1-Click Trend Flow Pattern Injectors */}
        <div className="lg:col-span-5 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wide">
                1-Click Trend Flow Injectors
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Inject pre-engineered multi-round color/number sequences directly into the upcoming Aviator queue:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  handleApplySequencePreset('Lamba 1x Trap (5x Blue → Purple)', [
                    1.18, 1.42, 1.09, 1.64, 1.27, 3.65, 1.22, 1.48, 1.15, 1.56, 2.85, 1.31
                  ])
                }
                className="w-full p-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-800/90 border border-sky-500/30 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-black text-sky-300 group-hover:text-sky-200">
                    📉 Lamba 1x Trap (5x Blue 1x → 1x Purple)
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    1.18x → 1.42x → 1.09x → 1.64x → 1.27x → 3.65x
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-sky-500/20 text-sky-300 text-[10px] font-black">
                  Inject
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplySequencePreset('Short 1x Pulse', [
                    1.32, 1.54, 2.90, 1.19, 1.46, 11.40, 1.14, 1.39, 2.45, 1.28, 1.62, 3.80
                  ])
                }
                className="w-full p-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-800/90 border border-purple-500/30 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-black text-purple-300 group-hover:text-purple-200">
                    ⚡ Short 1x Pulse (2x Blue → Purple → 2x Blue → Pink)
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    1.32x → 1.54x → 2.90x → 1.19x → 1.46x → 11.40x
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-[10px] font-black">
                  Inject
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplySequencePreset('Mix Zig-Zag Flow', [
                    1.36, 2.45, 1.21, 3.30, 1.68, 2.15, 1.14, 4.50, 1.29, 2.75, 1.44, 12.20
                  ])
                }
                className="w-full p-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-800/90 border border-amber-500/30 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-black text-amber-300 group-hover:text-amber-200">
                    🎲 Mix Zig-Zag Flow (Alternating Blue & Purple)
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    1.36x → 2.45x → 1.21x → 3.30x → 1.68x → 2.15x
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-black">
                  Inject
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplySequencePreset('House Recovery Clamp (All Blue 1x)', [
                    1.12, 1.29, 1.04, 1.46, 1.19, 1.34, 1.08, 1.52, 1.16, 1.25, 1.38, 1.14
                  ])
                }
                className="w-full p-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-800/90 border border-rose-500/30 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-black text-rose-300 group-hover:text-rose-200">
                    🛡️ House Recovery Clamp (12x Strict Blue 1x)
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    1.12x → 1.29x → 1.04x → 1.46x → 1.19x → 1.34x
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-[10px] font-black">
                  Inject
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Color & Number Analytics Dashboard (Recent 30 Rounds vs Upcoming 12 Rounds) */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
              Color & Number Distribution Analytics (Historical vs Upcoming Forecast)
            </h3>
          </div>
          <div className="flex items-center space-x-3 text-xs font-bold">
            <span className="text-slate-400">
              Active 1x Streak: <strong className="text-sky-300 font-mono">{currentOneXStreak}r</strong>
            </span>
            <span className="text-slate-400">
              Max Recent 1x Streak: <strong className="text-amber-300 font-mono">{maxRecentOneXStreak}r</strong>
            </span>
            <span className="text-slate-400">
              Upcoming Max 1x Streak: <strong className="text-purple-300 font-mono">{maxUpcomingOneXStreak}r</strong>
            </span>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent 30 Rounds Breakdown */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-black text-slate-300 uppercase">
              <span>Recent {recentSample.length} Completed Rounds</span>
              <span className="text-[10px] text-slate-400 font-mono">ACTUAL HISTORY</span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-sky-300">Blue 1x (1.00x–1.99x)</span>
                  <span className="text-sky-300 font-mono">
                    {recentBlueCount} ({Math.round((recentBlueCount / totalRecent) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((recentBlueCount / totalRecent) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-purple-300">Purple Flow (2.00x–9.99x)</span>
                  <span className="text-purple-300 font-mono">
                    {recentPurpleCount} ({Math.round((recentPurpleCount / totalRecent) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((recentPurpleCount / totalRecent) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-pink-300">Pink High (10.00x+)</span>
                  <span className="text-pink-300 font-mono">
                    {recentPinkCount} ({Math.round((recentPinkCount / totalRecent) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-pink-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((recentPinkCount / totalRecent) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming 12 Rounds Breakdown */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-black text-slate-300 uppercase">
              <span>Upcoming 12 Scheduled Rounds</span>
              <span className="text-[10px] text-amber-300 font-mono">NEXT 12 FORECAST</span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-sky-300">Blue 1x (1.00x–1.99x)</span>
                  <span className="text-sky-300 font-mono">
                    {upcomingBlueCount} ({Math.round((upcomingBlueCount / 12) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((upcomingBlueCount / 12) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-purple-300">Purple Flow (2.00x–9.99x)</span>
                  <span className="text-purple-300 font-mono">
                    {upcomingPurpleCount} ({Math.round((upcomingPurpleCount / 12) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((upcomingPurpleCount / 12) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-pink-300">Pink High (10.00x+)</span>
                  <span className="text-pink-300 font-mono">
                    {upcomingPinkCount} ({Math.round((upcomingPinkCount / 12) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-pink-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((upcomingPinkCount / 12) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Combined Visual Trajectory Strip (Last 8 Completed -> Next 12 Upcoming) */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2.5">
            <span>LIVE MULTIPLIER TRAJECTORY (LAST 8 COMPLETED → NEXT 12 UPCOMING)</span>
            <span className="text-amber-300 font-mono">Click any upcoming bar to select slot</span>
          </div>

          <div className="grid grid-cols-20 gap-1.5 items-end h-28 pt-4 px-1 overflow-x-auto">
            {/* Past 8 Rounds (oldest to newest) */}
            {pastCrashes
              .slice(0, 8)
              .reverse()
              .map((mult, idx) => {
                const tier = classifyAviatorColorTier(mult);
                const style = getTierBadgeClasses(tier.colorTier);
                const heightPct = Math.min(100, Math.max(16, Math.round(Math.log2(mult + 1) * 28)));
                return (
                  <div
                    key={`past_${idx}`}
                    className="flex flex-col items-center justify-end h-full opacity-60"
                    title={`Past Round: ${mult.toFixed(2)}x`}
                  >
                    <span className="text-[9px] font-mono text-slate-400 mb-1">
                      {mult.toFixed(1)}x
                    </span>
                    <div
                      className={`w-full rounded-t-md ${style.barBg}`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[8px] font-bold text-slate-500 mt-1">PAST</span>
                  </div>
                );
              })}

            {/* Upcoming 12 Rounds */}
            {upcomingNodes.map((node, idx) => {
              const style = getTierBadgeClasses(node.colorTier);
              const heightPct = Math.min(
                100,
                Math.max(18, Math.round(Math.log2(node.predictedMultiplier + 1) * 28))
              );
              const isSelected = selectedSlotIndex === idx;
              return (
                <div
                  key={`up_${node.roundNumber}_${idx}`}
                  onClick={() => setSelectedSlotIndex(idx)}
                  className={`flex flex-col items-center justify-end h-full cursor-pointer transition ${
                    isSelected ? 'scale-105' : 'hover:opacity-90'
                  }`}
                  title={`Upcoming +${idx + 1} (#${node.roundNumber}): ${node.predictedMultiplier.toFixed(2)}x`}
                >
                  <span className={`text-[9px] font-mono font-black mb-1 ${style.text}`}>
                    {node.predictedMultiplier.toFixed(1)}x
                  </span>
                  <div
                    className={`w-full rounded-t-md ${style.barBg} ${
                      isSelected ? 'ring-2 ring-amber-300' : ''
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span
                    className={`text-[8px] font-black mt-1 ${
                      idx === 0 ? 'text-amber-300' : 'text-slate-300'
                    }`}
                  >
                    +{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
