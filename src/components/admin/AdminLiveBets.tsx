import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Clock,
  Sliders,
  Dice5
} from 'lucide-react';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';

interface AdminLiveBetsProps {
  adminId?: string;
  initialView?: 'management' | 'logs';
}

export const AdminLiveBets: React.FC<AdminLiveBetsProps> = ({
  adminId = 'MasterAdmin_01',
  initialView = 'management'
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'round_settings' | 'results' | 'bet_options'>(
    initialView === 'logs' ? 'results' : 'round_settings'
  );
  const [adminSelectedMode, setAdminSelectedMode] = useState<'30s' | '1min' | '3min'>('30s');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setActiveTab(initialView === 'logs' ? 'results' : 'round_settings');
  }, [initialView]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    const unsub = store.subscribe(() => setNow(Date.now()));
    return () => {
      clearInterval(timer);
      unsub();
    };
  }, []);

  const adminSettings = store.getAdminSettings();
  const currentRound = store.getCurrentRound(adminSelectedMode);
  const pastRounds = store.getPastRounds(adminSelectedMode);
  const liveBets = store.getLiveBets();
  const activeOverride = store.getWinGoOverride(adminSelectedMode);
  const candidateNums =
    store.getCandidateNumbersForOverride(
      adminSelectedMode,
      currentRound.period,
      currentRound.manualOverrideNumber
    ) || [];

  // Round Settings State
  const [roundDuration, setRoundDuration] = useState<number>(adminSettings.roundDurationSeconds || 60);
  const [autoStartNextRound, setAutoStartNextRound] = useState<boolean>(true);
  const [resultDisplayDelay, setResultDisplayDelay] = useState<number>(3);
  const [allowedTypes, setAllowedTypes] = useState({
    green: true,
    red: true,
    violet: true,
    smallBig: true,
    numbers: true
  });

  // Multipliers State for Bet Options tab
  const [greenMult, setGreenMult] = useState<number>(adminSettings.colorGreenMultiplier || 2);
  const [redMult, setRedMult] = useState<number>(adminSettings.colorRedMultiplier || 2);
  const [violetMult, setVioletMult] = useState<number>(adminSettings.colorVioletMultiplier || 4.5);
  const [sizeMult, setSizeMult] = useState<number>(adminSettings.sizeMultiplier || 2);
  const [numberMult, setNumberMult] = useState<number>(adminSettings.numberMultiplier || 9);
  const [feePercent, setFeePercent] = useState<number>(adminSettings.payoutFeePercent || 2);

  const toggleAllowedType = (key: keyof typeof allowedTypes) => {
    setAllowedTypes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveRoundSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateAdminSettings(
      {
        roundDurationSeconds: roundDuration,
        colorGreenMultiplier: greenMult,
        colorRedMultiplier: redMult,
        colorVioletMultiplier: violetMult,
        sizeMultiplier: sizeMult,
        numberMultiplier: numberMult,
        payoutFeePercent: feePercent
      },
      adminId
    );
    showToast('Game round settings & bet options saved!', 'success');
  };

  const handleSetManualResult = (num: number | null) => {
    store.setManualOverride(num, adminId, adminSelectedMode);
    if (num === null) {
      showToast(`Cleared manual override for Win Go ${adminSelectedMode} — Auto RNG (Fair Mode) active`, 'info');
    } else {
      const sz = num >= 5 ? 'BIG' : 'SMALL';
      const col = num === 0 ? 'RED + VIOLET' : num === 5 ? 'GREEN + VIOLET' : num % 2 === 0 ? 'RED' : 'GREEN';
      showToast(`Locked Period ${currentRound.period} (${adminSelectedMode}) to Number ${num} (${sz}, ${col})`, 'success');
    }
  };

  const handleSetColorOverride = (color: 'green' | 'red' | 'violet') => {
    if (activeOverride?.overrideType === 'color' && activeOverride?.overrideValue === color) {
      store.setWinGoOverride(adminSelectedMode, 'auto', 'auto', adminId);
      showToast(`Cleared color override for Win Go ${adminSelectedMode} — Auto RNG (Fair Mode)`, 'info');
      return;
    }
    store.setWinGoOverride(adminSelectedMode, 'color', color, adminId);
    const label =
      color === 'green'
        ? 'GREEN (Resolving: 1, 3, 7, or 9)'
        : color === 'red'
        ? 'RED (Resolving: 2, 4, 6, or 8)'
        : 'VIOLET / DUAL (Resolving: 0 or 5)';
    showToast(`Locked Period ${currentRound.period} (${adminSelectedMode}) to ${label}`, 'success');
  };

  const handleSetSizeOverride = (size: 'big' | 'small') => {
    if (activeOverride?.overrideType === 'size' && activeOverride?.overrideValue === size) {
      store.setWinGoOverride(adminSelectedMode, 'auto', 'auto', adminId);
      showToast(`Cleared size override for Win Go ${adminSelectedMode} — Auto RNG (Fair Mode)`, 'info');
      return;
    }
    store.setWinGoOverride(adminSelectedMode, 'size', size, adminId);
    const label =
      size === 'big' ? 'BIG (Resolving: 5, 6, 7, 8, or 9)' : 'SMALL (Resolving: 0, 1, 2, 3, or 4)';
    showToast(`Locked Period ${currentRound.period} (${adminSelectedMode}) to ${label}`, 'success');
  };

  const handleClearOverride = () => {
    store.setWinGoOverride(adminSelectedMode, 'auto', 'auto', adminId);
    showToast(`Reverted Win Go ${adminSelectedMode} to Auto RNG (Fair Mode)`, 'info');
  };

  const formatActiveOverrideBadgeText = (): string => {
    if (!activeOverride || activeOverride.overrideType === 'auto') {
      return 'Status: Auto RNG (Fair Mode)';
    }
    if (activeOverride.overrideType === 'color') {
      if (activeOverride.overrideValue === 'green') {
        return 'Active Override: GREEN (Resolving: 1, 3, 7, or 9)';
      }
      if (activeOverride.overrideValue === 'red') {
        return 'Active Override: RED (Resolving: 2, 4, 6, or 8)';
      }
      if (activeOverride.overrideValue === 'violet') {
        return 'Active Override: VIOLET / DUAL (Resolving: 0 or 5)';
      }
    }
    if (activeOverride.overrideType === 'size') {
      if (activeOverride.overrideValue === 'big') {
        return 'Active Override: BIG (Resolving: 5, 6, 7, 8, or 9)';
      }
      if (activeOverride.overrideValue === 'small') {
        return 'Active Override: SMALL (Resolving: 0, 1, 2, 3, or 4)';
      }
    }
    if (activeOverride.overrideType === 'number') {
      const n = Number(activeOverride.overrideValue);
      const sz = n >= 5 ? 'BIG' : 'SMALL';
      const col = n === 0 ? 'RED + VIOLET' : n === 5 ? 'GREEN + VIOLET' : n % 2 === 0 ? 'RED' : 'GREEN';
      return `Active Override: Number ${n} (${sz}, ${col})`;
    }
    return 'Status: Auto RNG (Fair Mode)';
  };

  const remainingSeconds = Math.max(0, Math.floor((currentRound.endTime - now) / 1000));

  return (
    <div className="space-y-4">
      {/* Top Segmented Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl grid grid-cols-3 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('round_settings')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'round_settings'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          Round Settings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('results')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'results'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          Results & Logs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bet_options')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'bet_options'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          Bet Options
        </button>
      </div>

      {/* TAB 1: ROUND SETTINGS */}
      {activeTab === 'round_settings' && (
        <form onSubmit={handleSaveRoundSettings} className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            {/* Row 1: Round Duration */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                Round Duration (seconds)
              </label>
              <select
                value={roundDuration}
                onChange={(e) => setRoundDuration(Number(e.target.value))}
                className="w-36 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value={30}>30</option>
                <option value={60}>60</option>
                <option value={180}>180</option>
              </select>
            </div>

            {/* Row 2: Auto Start Next Round */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                Auto Start Next Round
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={autoStartNextRound}
                onClick={() => setAutoStartNextRound(!autoStartNextRound)}
                className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center shrink-0 ${
                  autoStartNextRound ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
              </button>
            </div>

            {/* Row 3: Result Display Delay */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                Result Display Delay (seconds)
              </label>
              <select
                value={resultDisplayDelay}
                onChange={(e) => setResultDisplayDelay(Number(e.target.value))}
                className="w-36 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={5}>5</option>
              </select>
            </div>
          </div>

          {/* Allowed Bet Types Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <h4 className="font-bold text-slate-100 text-sm">Allowed Bet Types</h4>

            <div className="space-y-2.5">
              {([
                { key: 'green', label: `Green (1:${greenMult})` },
                { key: 'red', label: `Red (1:${redMult})` },
                { key: 'violet', label: `Violet (1:${violetMult})` },
                { key: 'smallBig', label: `Small / Big (1:${sizeMult})` },
                { key: 'numbers', label: `Numbers 0–9 (1:${numberMult})` }
              ] as const).map((item) => {
                const checked = allowedTypes[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleAllowedType(item.key)}
                    className="w-full flex items-center space-x-3 py-1.5 text-left"
                  >
                    {checked ? (
                      <CheckSquare className="w-5 h-5 text-amber-400 shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-600 shrink-0" />
                    )}
                    <span className="text-xs sm:text-sm font-semibold text-slate-200">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition active:scale-[0.99]"
          >
            Save Settings
          </button>
        </form>
      )}

      {/* TAB 2: RESULTS & GAME LOGS */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {/* Mode Selector (30s, 1min, 3min) */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            {(['30s', '1min', '3min'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setAdminSelectedMode(m)}
                className={`py-2 rounded-xl text-xs font-black transition ${
                  adminSelectedMode === m
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Win Go {m === '30s' ? '30 Sec' : m === '1min' ? '1 Min' : '3 Min'}
              </button>
            ))}
          </div>

          {/* Active Round Live Control & 10s Outcome Predictor */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase">
                  Win Go {adminSelectedMode === '30s' ? '30s' : adminSelectedMode === '1min' ? '1m' : '3m'} Active Period
                </span>
                <div className="font-mono font-black text-lg text-slate-100">{currentRound.period}</div>
              </div>
              <div className="text-right tabular-nums">
                <span className="text-xs text-slate-400 flex items-center justify-end space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Countdown</span>
                </span>
                <div className="font-mono font-black text-xl text-amber-400">{remainingSeconds}s</div>
              </div>
            </div>

            {/* 10s Advanced Outcome Predictor Preview Box */}
            {(() => {
              const pred = store.getPredictedOutcome(adminSelectedMode);
              return (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-indigo-950/70 to-slate-950 border border-amber-500/40 flex items-center justify-between gap-3 shadow-lg">
                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      ⚡ 10s Advance Outcome Predictor ({adminSelectedMode})
                    </span>
                    <div className="flex items-center space-x-2 mt-1.5 text-xs text-slate-200">
                      <span>Number: <strong className="text-amber-400 font-mono text-sm">{pred.number}</strong></span>
                      <span>•</span>
                      <span>Color: <strong className="text-emerald-400 uppercase">{pred.colors.join(', ')}</strong></span>
                      <span>•</span>
                      <span>Size: <strong className="text-sky-400 uppercase">{pred.size}</strong></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Status</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {activeOverride ? 'Override Locked' : 'Locked Ready'}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Official Outcome Control for Win Go */}
            <div className="space-y-3.5 pt-1 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-200">
                  Official Outcome Control for Win Go ({adminSelectedMode})
                </div>
                {activeOverride && activeOverride.overrideType !== 'auto' && (
                  <button
                    type="button"
                    onClick={handleClearOverride}
                    className="px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wide bg-slate-800 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 transition active:scale-95"
                  >
                    Clear Override
                  </button>
                )}
              </div>

              {/* Active Outcome Display Badge */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold ${
                  !activeOverride || activeOverride.overrideType === 'auto'
                    ? 'bg-slate-950/90 border-slate-800 text-slate-300'
                    : activeOverride.overrideType === 'color' && activeOverride.overrideValue === 'green'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : activeOverride.overrideType === 'color' && activeOverride.overrideValue === 'red'
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                    : activeOverride.overrideType === 'color' && activeOverride.overrideValue === 'violet'
                    ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                    : activeOverride.overrideType === 'size'
                    ? 'bg-sky-950/60 border-sky-500/50 text-sky-300'
                    : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      !activeOverride || activeOverride.overrideType === 'auto'
                        ? 'bg-slate-500'
                        : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  <span>{formatActiveOverrideBadgeText()}</span>
                </div>
                <span className="text-[10px] font-mono opacity-75">
                  /admin_settings/wingo_override/{adminSelectedMode}
                </span>
              </div>

              {/* 1. Color Overrides */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  1. Color Overrides
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetColorOverride('green')}
                    className={`py-2.5 px-2 rounded-xl font-black text-xs border transition flex flex-col items-center justify-center gap-0.5 ${
                      activeOverride?.overrideType === 'color' && activeOverride?.overrideValue === 'green'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                        : 'bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    <span>Force Green</span>
                    <span className="text-[10px] font-mono opacity-80">1, 3, 7, 9</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetColorOverride('violet')}
                    className={`py-2.5 px-2 rounded-xl font-black text-xs border transition flex flex-col items-center justify-center gap-0.5 ${
                      activeOverride?.overrideType === 'color' && activeOverride?.overrideValue === 'violet'
                        ? 'bg-purple-500 text-white border-purple-300 shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/50'
                        : 'bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border-purple-500/30'
                    }`}
                  >
                    <span>Force Violet / Dual</span>
                    <span className="text-[10px] font-mono opacity-80">0 or 5</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetColorOverride('red')}
                    className={`py-2.5 px-2 rounded-xl font-black text-xs border transition flex flex-col items-center justify-center gap-0.5 ${
                      activeOverride?.overrideType === 'color' && activeOverride?.overrideValue === 'red'
                        ? 'bg-rose-500 text-white border-rose-300 shadow-lg shadow-rose-500/25 ring-2 ring-rose-400/50'
                        : 'bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    <span>Force Red</span>
                    <span className="text-[10px] font-mono opacity-80">2, 4, 6, 8</span>
                  </button>
                </div>
              </div>

              {/* 2. Size Overrides */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  2. Size Overrides
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetSizeOverride('big')}
                    className={`py-2.5 px-3 rounded-xl font-black text-xs border transition flex items-center justify-between ${
                      activeOverride?.overrideType === 'size' && activeOverride?.overrideValue === 'big'
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50'
                        : 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    <span>Force Big</span>
                    <span className="text-[10px] font-mono opacity-85">5 – 9</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetSizeOverride('small')}
                    className={`py-2.5 px-3 rounded-xl font-black text-xs border transition flex items-center justify-between ${
                      activeOverride?.overrideType === 'size' && activeOverride?.overrideValue === 'small'
                        ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-lg shadow-sky-500/25 ring-2 ring-sky-400/50'
                        : 'bg-sky-950/40 hover:bg-sky-900/50 text-sky-300 border-sky-500/30'
                    }`}
                  >
                    <span>Force Small</span>
                    <span className="text-[10px] font-mono opacity-85">0 – 4</span>
                  </button>
                </div>
              </div>

              {/* 3. Specific Number Grid (0 to 9) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  3. Specific Number Lock (0 – 9)
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                    const isExactNumberLocked =
                      activeOverride?.overrideType === 'number' && Number(activeOverride?.overrideValue) === num;
                    const isCandidateInPool =
                      activeOverride &&
                      activeOverride.overrideType !== 'number' &&
                      activeOverride.overrideType !== 'auto' &&
                      candidateNums.includes(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSetManualResult(isExactNumberLocked ? null : num)}
                        className={`py-2 rounded-xl font-mono font-black text-xs border transition ${
                          isExactNumberLocked
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-400/50'
                            : isCandidateInPool
                            ? 'bg-indigo-950/80 text-amber-300 border-amber-500/50'
                            : 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Live & Settled Bets Log */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <h4 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
              <Dice5 className="w-4 h-4 text-amber-400" />
              <span>Player Bets Log ({liveBets.length})</span>
            </h4>
            {liveBets.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">No bets placed yet.</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {liveBets.slice(0, 40).map((b) => (
                  <div
                    key={b.betId}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono uppercase">
                          {b.gameType === 'dragon_tiger' ? 'DRAGON TIGER' : `WINGO ${b.gameType}`}
                        </span>
                        <span>
                          {b.username} ({b.uid}) · #{b.roundPeriod.slice(-6)}
                        </span>
                      </div>
                      <div className="text-slate-400 mt-0.5">
                        Pick: <strong className="uppercase text-amber-300">{b.betValue}</strong> · Stake: ₹{b.amount} ({b.multiplier}x)
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        b.status === 'won'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : b.status === 'lost'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {b.status} {b.actualPayout > 0 ? `+₹${b.actualPayout}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Official Past Round Results */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <h4 className="font-bold text-slate-100 text-sm">Official Round Results History</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pastRounds.slice(0, 20).map((r) => (
                <div
                  key={r.period}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-mono font-bold text-slate-200">Period {r.period}</span>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-mono font-black">
                      #{r.winningNumber}
                    </span>
                    <span className="uppercase font-bold text-slate-300">{r.winningSize}</span>
                    <span className="text-slate-400 font-mono tabular-nums">Payout: ₹{r.totalPayout.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BET OPTIONS & PAYOUT MULTIPLIERS */}
      {activeTab === 'bet_options' && (
        <form onSubmit={handleSaveRoundSettings} className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <h4 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Predefined Payout Multipliers & House Fee</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Green Payout (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={greenMult}
                  onChange={(e) => setGreenMult(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Red Payout (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={redMult}
                  onChange={(e) => setRedMult(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Violet Payout (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={violetMult}
                  onChange={(e) => setVioletMult(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Number 0–9 Payout (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={numberMult}
                  onChange={(e) => setNumberMult(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Big / Small Payout (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sizeMult}
                  onChange={(e) => setSizeMult(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Platform Fee (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={feePercent}
                  onChange={(e) => setFeePercent(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono font-bold text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition active:scale-[0.99]"
          >
            Save Settings
          </button>
        </form>
      )}
    </div>
  );
};
