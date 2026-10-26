import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Percent,
  Flame,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { LiveBet, UserRecord } from '../../types';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';

interface BetAnalyticsVisualizerProps {
  userBets: LiveBet[];
  user: UserRecord | null;
  onOpenDeposit?: () => void;
  onOpenAuth?: () => void;
}

export interface DayMetric {
  dateStr: string; // YYYY-MM-DD
  displayDate: string; // "19 Oct"
  fullDate: string; // "19 Oct 2026, Monday"
  timestamp: number;
  betsCount: number;
  totalStaked: number;
  totalPayout: number;
  netPnl: number;
  winsCount: number;
  lossesCount: number;
  winRate: number; // 0 to 100
  cumulativePnl: number;
  bets: LiveBet[];
}

export const BetAnalyticsVisualizer: React.FC<BetAnalyticsVisualizerProps> = ({
  userBets,
  user,
  onOpenDeposit,
  onOpenAuth
}) => {
  const { showToast } = useToast();
  const [timeframeDays, setTimeframeDays] = useState<7 | 14 | 30>(30);
  const [chartMode, setChartMode] = useState<'pnl' | 'cumulative' | 'winrate'>('pnl');
  const [gameFilter, setGameFilter] = useState<'all' | 'wingo' | 'trx'>('all');
  const [hoveredDay, setHoveredDay] = useState<DayMetric | null>(null);
  const [expandedDayStr, setExpandedDayStr] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'date' | 'pnl' | 'bets'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // If user has very few bets or none, provide option to seed demo data
  const handleSeedDemoData = () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    store.seedUserHistoricalBetsForDemo(user.uid, user.username);
    showToast('Loaded 30-day realistic betting performance history!', 'success');
  };

  // Filtered Bets by Game
  const effectiveBets = useMemo(() => {
    return userBets.filter((b) => {
      if (gameFilter === 'wingo' && b.gameId !== 'wingo' && b.roundPeriod.startsWith('TRX')) return false;
      if (gameFilter === 'trx' && !b.roundPeriod.startsWith('TRX') && b.gameId !== 'trx_wingo') return false;
      return true;
    });
  }, [userBets, gameFilter]);

  // Aggregate metrics across the selected window (default 30 days)
  const { dailyMetrics, summary } = useMemo(() => {
    const now = new Date();
    // Normalize to start of today
    const days: DayMetric[] = [];
    const dateMap = new Map<string, LiveBet[]>();

    // Index all bets by YYYY-MM-DD
    effectiveBets.forEach((b) => {
      const d = new Date(b.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!dateMap.has(key)) dateMap.set(key, []);
      dateMap.get(key)!.push(b);
    });

    // Build array of past N days up to today
    for (let i = timeframeDays - 1; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() - i);
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dateNum = String(targetDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${dateNum}`;

      const betsOnDay = dateMap.get(dateKey) || [];
      let staked = 0;
      let payout = 0;
      let wins = 0;
      let losses = 0;

      betsOnDay.forEach((b) => {
        staked += b.amount;
        payout += b.actualPayout || 0;
        if (b.status === 'won') wins++;
        else if (b.status === 'lost') losses++;
      });

      const netPnl = payout - staked;
      const settledCount = wins + losses;
      const winRate = settledCount > 0 ? Math.round((wins / settledCount) * 100) : 0;

      const shortMonth = targetDate.toLocaleString('en-US', { month: 'short' });
      const weekday = targetDate.toLocaleString('en-US', { weekday: 'short' });

      days.push({
        dateStr: dateKey,
        displayDate: `${dateNum} ${shortMonth}`,
        fullDate: `${dateNum} ${shortMonth} ${year}, ${weekday}`,
        timestamp: targetDate.getTime(),
        betsCount: betsOnDay.length,
        totalStaked: staked,
        totalPayout: payout,
        netPnl,
        winsCount: wins,
        lossesCount: losses,
        winRate,
        cumulativePnl: 0,
        bets: betsOnDay
      });
    }

    // Compute Running Cumulative PnL
    let runningPnl = 0;
    days.forEach((d) => {
      runningPnl += d.netPnl;
      d.cumulativePnl = runningPnl;
    });

    // Compute Window Totals & KPI Summary
    let totalWagered = 0;
    let totalReturns = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let totalBets = 0;
    let bestDayPnl = -Infinity;
    let bestDayDate = 'N/A';
    let worstDayPnl = Infinity;

    // Track active win streaks
    let currentStreak = 0;
    let longestWinStreak = 0;
    let tempWinStreak = 0;

    // Sort bets chronologically for streak computation
    const chronologicalBets = [...effectiveBets].sort((a, b) => a.timestamp - b.timestamp);
    chronologicalBets.forEach((b) => {
      if (b.status === 'won') {
        tempWinStreak++;
        if (tempWinStreak > longestWinStreak) longestWinStreak = tempWinStreak;
      } else if (b.status === 'lost') {
        tempWinStreak = 0;
      }
    });

    // Current streak from the end
    for (let k = chronologicalBets.length - 1; k >= 0; k--) {
      if (chronologicalBets[k].status === 'won') currentStreak++;
      else break;
    }

    days.forEach((d) => {
      totalWagered += d.totalStaked;
      totalReturns += d.totalPayout;
      totalWins += d.winsCount;
      totalLosses += d.lossesCount;
      totalBets += d.betsCount;
      if (d.betsCount > 0) {
        if (d.netPnl > bestDayPnl) {
          bestDayPnl = d.netPnl;
          bestDayDate = d.displayDate;
        }
        if (d.netPnl < worstDayPnl) {
          worstDayPnl = d.netPnl;
        }
      }
    });

    const netProfit = totalReturns - totalWagered;
    const totalSettled = totalWins + totalLosses;
    const overallWinRate = totalSettled > 0 ? Math.round((totalWins / totalSettled) * 100) : 0;
    const roiPercent = totalWagered > 0 ? Math.round((netProfit / totalWagered) * 1000) / 10 : 0;
    const profitFactor = totalWagered > 0 && totalReturns > 0 ? (totalReturns / totalWagered).toFixed(2) : '1.00';

    return {
      dailyMetrics: days,
      summary: {
        totalWagered,
        totalReturns,
        netProfit,
        totalWins,
        totalLosses,
        totalBets,
        overallWinRate,
        roiPercent,
        profitFactor,
        bestDayPnl: bestDayPnl === -Infinity ? 0 : bestDayPnl,
        bestDayDate: bestDayDate === 'N/A' ? 'None' : bestDayDate,
        currentStreak,
        longestWinStreak
      }
    };
  }, [effectiveBets, timeframeDays]);

  // Breakdown by Bet Category
  const categoryStats = useMemo(() => {
    const stats: Record<string, { label: string; bets: number; staked: number; won: number; wins: number; total: number }> = {
      size: { label: 'Big / Small', bets: 0, staked: 0, won: 0, wins: 0, total: 0 },
      color: { label: 'Color Picks', bets: 0, staked: 0, won: 0, wins: 0, total: 0 },
      number: { label: 'Direct Numbers', bets: 0, staked: 0, won: 0, wins: 0, total: 0 }
    };

    effectiveBets.forEach((b) => {
      const type = b.betType === 'size' ? 'size' : b.betType === 'color' ? 'color' : 'number';
      stats[type].bets++;
      stats[type].staked += b.amount;
      stats[type].won += b.actualPayout || 0;
      if (b.status === 'won') stats[type].wins++;
      if (b.status === 'won' || b.status === 'lost') stats[type].total++;
    });

    return Object.entries(stats).map(([key, item]) => {
      const winRate = item.total > 0 ? Math.round((item.wins / item.total) * 100) : 0;
      const net = item.won - item.staked;
      return {
        key,
        label: item.label,
        bets: item.bets,
        staked: item.staked,
        won: item.won,
        net,
        winRate
      };
    });
  }, [effectiveBets]);

  // Sorted daily rows for ledger table
  const sortedDays = useMemo(() => {
    const list = [...dailyMetrics];
    list.sort((a, b) => {
      if (sortField === 'date') return sortAsc ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
      if (sortField === 'pnl') return sortAsc ? a.netPnl - b.netPnl : b.netPnl - a.netPnl;
      if (sortField === 'bets') return sortAsc ? a.betsCount - b.betsCount : b.betsCount - a.betsCount;
      return 0;
    });
    return list;
  }, [dailyMetrics, sortField, sortAsc]);

  // SVG Chart Geometry Constants
  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 36;
  const paddingY = 24;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // Chart scaling calculations
  const chartData = useMemo(() => {
    const count = dailyMetrics.length;
    if (count === 0) return { bars: [], linePoints: [], zeroY: innerHeight / 2, maxVal: 1, minVal: -1 };

    let maxVal = 0;
    let minVal = 0;

    if (chartMode === 'pnl') {
      const pnls = dailyMetrics.map((d) => d.netPnl);
      const maxAbs = Math.max(...pnls.map((v) => Math.abs(v)), 100);
      maxVal = maxAbs;
      minVal = -maxAbs;
    } else if (chartMode === 'cumulative') {
      const cumuls = dailyMetrics.map((d) => d.cumulativePnl);
      const high = Math.max(...cumuls, 50);
      const low = Math.min(...cumuls, -50);
      const rangePadding = (high - low) * 0.15 || 50;
      maxVal = high + rangePadding;
      minVal = low - rangePadding;
    } else {
      // winrate mode: 0 to 100
      maxVal = 100;
      minVal = 0;
    }

    const range = maxVal - minVal || 1;
    const getY = (val: number) => {
      const normalized = (val - minVal) / range;
      return paddingY + innerHeight * (1 - normalized);
    };

    const zeroY = getY(0);

    // Build bars or points
    const stepX = innerWidth / (count - 1 || 1);
    const bars = dailyMetrics.map((d, idx) => {
      const x = paddingX + idx * stepX;
      const y = getY(d.netPnl);
      const isPositive = d.netPnl >= 0;
      const barTop = isPositive ? y : zeroY;
      const barHeight = Math.max(Math.abs(y - zeroY), 3);
      return {
        x,
        y: barTop,
        height: barHeight,
        netPnl: d.netPnl,
        day: d,
        isPositive
      };
    });

    const points = dailyMetrics.map((d, idx) => {
      const x = paddingX + idx * stepX;
      const val = chartMode === 'cumulative' ? d.cumulativePnl : d.winRate;
      const y = getY(val);
      return { x, y, day: d, value: val };
    });

    // Create smooth SVG curve path string
    let pathD = '';
    let areaD = '';
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cx = (p0.x + p1.x) / 2;
        pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
      }
      areaD = `${pathD} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`;
    }

    return { bars, points, pathD, areaD, zeroY, maxVal, minVal };
  }, [dailyMetrics, chartMode, innerHeight, innerWidth, paddingX, paddingY]);

  return (
    <div className="space-y-6">
      {/* Visualizer Header with Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-black">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-brand font-black text-sm sm:text-base text-slate-100 tracking-wide">
                Bet Analytics & Performance Visualizer
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Last {timeframeDays} Days
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive financial trajectory, win/loss ratios & historical PnL analysis.
            </p>
          </div>
        </div>

        {/* Timeframe & Demo Controls */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto">
          {([7, 14, 30] as const).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setTimeframeDays(days)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                timeframeDays === days
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {days}D
            </button>
          ))}
          {user && effectiveBets.length < 5 && (
            <button
              type="button"
              onClick={handleSeedDemoData}
              title="Load 30 days of realistic betting history to preview visualizations"
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center space-x-1 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load 30D Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI 4-Card Performance Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Net P&L */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Net Profit / Loss</span>
            {summary.netProfit >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className={`font-mono text-xl sm:text-2xl font-black ${
            summary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {summary.netProfit >= 0 ? `+₹${summary.netProfit.toLocaleString()}` : `-₹${Math.abs(summary.netProfit).toLocaleString()}`}
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-[10px]">
            <span className={`px-1.5 py-0.5 rounded-md font-bold ${
              summary.roiPercent >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {summary.roiPercent >= 0 ? `+${summary.roiPercent}% ROI` : `${summary.roiPercent}% ROI`}
            </span>
            <span className="text-slate-500">Return: {summary.profitFactor}x</span>
          </div>
        </div>

        {/* KPI 2: Win Rate */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Win Rate</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-amber-300">
            {summary.overallWinRate}%
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="text-emerald-400 font-bold">{summary.totalWins} Wins</span>
            <span className="text-slate-600">•</span>
            <span className="text-rose-400 font-bold">{summary.totalLosses} Losses</span>
            <span className="text-slate-600">•</span>
            <span>{summary.totalBets} Bets</span>
          </div>
        </div>

        {/* KPI 3: Total Turnover */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Total Turnover</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-slate-100">
            ₹{summary.totalWagered.toLocaleString()}
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Payout: ₹{summary.totalReturns.toLocaleString()}</span>
            <span className="text-slate-500">{summary.totalBets} rounds</span>
          </div>
        </div>

        {/* KPI 4: Streaks & Best Day */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Best Day & Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-mono text-lg sm:text-xl font-black text-emerald-400">
              +₹{summary.bestDayPnl.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">({summary.bestDayDate})</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center space-x-1">
            <span className="text-amber-400 font-bold flex items-center space-x-1">
              <span>🔥 Current: {summary.currentStreak} in a row</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">Max: {summary.longestWinStreak}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Visualizer Chart Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
        {/* Chart View Mode Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setChartMode('pnl')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                chartMode === 'pnl'
                  ? 'bg-amber-500 text-slate-950 shadow font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Daily Net P&L (₹)</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('cumulative')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                chartMode === 'cumulative'
                  ? 'bg-amber-500 text-slate-950 shadow font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Cumulative Trajectory</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('winrate')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                chartMode === 'winrate'
                  ? 'bg-amber-500 text-slate-950 shadow font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Win Rate %</span>
            </button>
          </div>

          {/* Game filter dropdown */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-semibold">Game:</span>
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-200 font-bold focus:outline-none focus:border-amber-500 text-xs"
            >
              <option value="all">All Games</option>
              <option value="wingo">Win Go Color / Numbers</option>
              <option value="trx">TRX Hash Win Go</option>
            </select>
          </div>
        </div>

        {/* Hover Tooltip Readout Display */}
        <div className="min-h-10 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
          {hoveredDay ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-amber-400">{hoveredDay.fullDate}:</span>
                <span className="font-mono text-slate-300">
                  {hoveredDay.betsCount} bets (₹{hoveredDay.totalStaked.toLocaleString()} staked)
                </span>
              </div>
              <div className="flex items-center space-x-3 font-mono">
                <span className="text-slate-400">Win Rate: <strong className="text-amber-300">{hoveredDay.winRate}%</strong></span>
                <span className="text-slate-400">
                  Net:{' '}
                  <strong className={hoveredDay.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {hoveredDay.netPnl >= 0 ? `+₹${hoveredDay.netPnl}` : `-₹${Math.abs(hoveredDay.netPnl)}`}
                  </strong>
                </span>
                {chartMode === 'cumulative' && (
                  <span className="text-slate-400">
                    Running Total:{' '}
                    <strong className={hoveredDay.cumulativePnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                      {hoveredDay.cumulativePnl >= 0 ? `+₹${hoveredDay.cumulativePnl}` : `-₹${Math.abs(hoveredDay.cumulativePnl)}`}
                    </strong>
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="text-slate-400 text-[11px] flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Hover or tap any day on the chart below to inspect detailed performance breakdown.</span>
            </div>
          )}
        </div>

        {/* SVG Interactive Canvas */}
        <div className="relative w-full overflow-x-auto pt-2">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[550px] select-none"
          >
            <defs>
              <linearGradient id="profitBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id="lossBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e11d48" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="curveAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="curveLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* Grid & Zero Guideline */}
            <line
              x1={paddingX}
              y1={chartData.zeroY}
              x2={chartWidth - paddingX}
              y2={chartData.zeroY}
              stroke="#475569"
              strokeDasharray="4 4"
              strokeWidth="1.2"
            />
            <text
              x={paddingX - 6}
              y={chartData.zeroY + 3}
              textAnchor="end"
              fill="#94a3b8"
              fontSize="10"
              fontFamily="monospace"
            >
              {chartMode === 'winrate' ? '50%' : '₹0'}
            </text>

            {/* Top Baseline label */}
            <text
              x={paddingX - 6}
              y={paddingY + 4}
              textAnchor="end"
              fill="#64748b"
              fontSize="9"
              fontFamily="monospace"
            >
              {chartMode === 'winrate' ? '100%' : `+₹${Math.round(chartData.maxVal)}`}
            </text>

            {/* Bottom Baseline label */}
            <text
              x={paddingX - 6}
              y={chartHeight - paddingY + 3}
              textAnchor="end"
              fill="#64748b"
              fontSize="9"
              fontFamily="monospace"
            >
              {chartMode === 'winrate' ? '0%' : `-₹${Math.abs(Math.round(chartData.minVal))}`}
            </text>

            {/* MODE 1: Daily P&L Dual-Directional Bar Chart */}
            {chartMode === 'pnl' && (
              <g>
                {chartData.bars.map((bar, idx) => {
                  const isHovered = hoveredDay?.dateStr === bar.day.dateStr;
                  const barWidth = Math.max(6, Math.min(18, (innerWidth / dailyMetrics.length) * 0.65));
                  return (
                    <g
                      key={bar.day.dateStr}
                      onMouseEnter={() => setHoveredDay(bar.day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={() => setExpandedDayStr(expandedDayStr === bar.day.dateStr ? null : bar.day.dateStr)}
                      className="cursor-pointer transition-all"
                    >
                      {/* Bar body */}
                      <rect
                        x={bar.x - barWidth / 2}
                        y={bar.y}
                        width={barWidth}
                        height={bar.height}
                        rx={barWidth > 8 ? 3 : 1.5}
                        fill={
                          bar.day.betsCount === 0
                            ? '#1e293b'
                            : bar.isPositive
                            ? 'url(#profitBarGrad)'
                            : 'url(#lossBarGrad)'
                        }
                        stroke={isHovered ? '#fbbf24' : 'transparent'}
                        strokeWidth="1.5"
                        opacity={isHovered ? 1 : 0.88}
                      />
                      {/* Interactive hover column mask */}
                      <rect
                        x={bar.x - innerWidth / (dailyMetrics.length * 2)}
                        y={paddingY}
                        width={innerWidth / dailyMetrics.length}
                        height={innerHeight}
                        fill="transparent"
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* MODE 2 & 3: Cumulative Line or Win Rate Curve */}
            {(chartMode === 'cumulative' || chartMode === 'winrate') && (
              <g>
                {/* Gradient area under the line */}
                <path d={chartData.areaD} fill="url(#curveAreaGrad)" />
                {/* Main line */}
                <path
                  d={chartData.pathD}
                  fill="none"
                  stroke="url(#curveLineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Point markers */}
                {chartData.points.map((pt) => {
                  const isHovered = hoveredDay?.dateStr === pt.day.dateStr;
                  return (
                    <g
                      key={pt.day.dateStr}
                      onMouseEnter={() => setHoveredDay(pt.day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={() => setExpandedDayStr(expandedDayStr === pt.day.dateStr ? null : pt.day.dateStr)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : pt.day.betsCount > 0 ? 3.5 : 2}
                        fill={isHovered ? '#fbbf24' : pt.value >= 0 ? '#10b981' : '#f43f5e'}
                        stroke="#020617"
                        strokeWidth="2"
                        className="transition-all"
                      />
                      {/* Invisible hover hitbox */}
                      <circle cx={pt.x} cy={pt.y} r={12} fill="transparent" />
                    </g>
                  );
                })}
              </g>
            )}

            {/* X-Axis Date Ticks (every 4-6 days to avoid crowding) */}
            {dailyMetrics.map((d, idx) => {
              const count = dailyMetrics.length;
              const step = count <= 7 ? 1 : count <= 14 ? 2 : 4;
              if (idx % step !== 0 && idx !== count - 1) return null;
              const stepX = innerWidth / (count - 1 || 1);
              const x = paddingX + idx * stepX;
              return (
                <text
                  key={d.dateStr}
                  x={x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {d.displayDate}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Category Performance Breakdown & Secondary Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bet Selection Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center space-x-1.5">
              <PieChartIcon className="w-4 h-4 text-amber-400" />
              <span>Win Rate by Selection Type</span>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">{effectiveBets.length} sample bets</span>
          </div>

          <div className="space-y-3 pt-1">
            {categoryStats.map((cat) => (
              <div key={cat.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{cat.label}</span>
                  <div className="flex items-center space-x-2 font-mono text-[11px]">
                    <span className="text-amber-400 font-bold">{cat.winRate}% Win</span>
                    <span className="text-slate-500">({cat.bets} bets)</span>
                    <span className={cat.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {cat.net >= 0 ? `+₹${cat.net}` : `-₹${Math.abs(cat.net)}`}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                  <div
                    style={{ width: `${cat.winRate}%` }}
                    className={`h-full rounded-full transition-all ${
                      cat.winRate >= 50 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 30-Day Win / Loss Capital Ratio Donut & Insights */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Capital Flow & Efficiency</span>
            </span>
            <span className="text-emerald-400 text-[11px] font-mono">
              {summary.roiPercent >= 0 ? `+${summary.roiPercent}% ROI` : `${summary.roiPercent}% ROI`}
            </span>
          </div>

          <div className="flex items-center justify-around py-2">
            {/* Visual Mini Donut */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray={`${summary.overallWinRate} ${100 - summary.overallWinRate}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono font-black text-sm text-slate-100">{summary.overallWinRate}%</span>
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Accuracy</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-400">Total Returns:</span>
                <strong className="text-emerald-400">₹{summary.totalReturns.toLocaleString()}</strong>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-slate-400">Total Stakes:</span>
                <strong className="text-slate-200">₹{summary.totalWagered.toLocaleString()}</strong>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-slate-400">Profit Multiplier:</span>
                <strong className="text-amber-300">{summary.profitFactor}x</strong>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Historical Best Win Day:</span>
            <strong className="text-emerald-400 font-mono">
              +{summary.bestDayPnl.toLocaleString()} ({summary.bestDayDate})
            </strong>
          </div>
        </div>
      </div>

      {/* 30-Day Daily Activity Ledger (Expandable Table) */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-brand font-black text-xs sm:text-sm text-slate-100 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>30-Day Daily Breakdown Ledger</span>
            </h4>
            <span className="text-[11px] text-slate-500">
              Click any date to view individual round tickets placed on that day.
            </span>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-1.5 text-xs">
            <button
              type="button"
              onClick={() => {
                if (sortField === 'date') setSortAsc(!sortAsc);
                else { setSortField('date'); setSortAsc(false); }
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                sortField === 'date'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Date {sortField === 'date' && (sortAsc ? '↑' : '↓')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (sortField === 'pnl') setSortAsc(!sortAsc);
                else { setSortField('pnl'); setSortAsc(false); }
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                sortField === 'pnl'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Net P&L {sortField === 'pnl' && (sortAsc ? '↑' : '↓')}
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60 font-mono text-xs max-h-96 overflow-y-auto">
          {sortedDays.map((d) => {
            const isExpanded = expandedDayStr === d.dateStr;
            const hasActivity = d.betsCount > 0;
            return (
              <div key={d.dateStr} className="transition">
                <div
                  onClick={() => hasActivity && setExpandedDayStr(isExpanded ? null : d.dateStr)}
                  className={`p-3 sm:px-4 flex items-center justify-between transition ${
                    hasActivity ? 'hover:bg-slate-900/60 cursor-pointer' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-200">{d.displayDate}</span>
                    <span className="text-[10px] text-slate-500 font-sans">
                      {d.betsCount} {d.betsCount === 1 ? 'bet' : 'bets'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 sm:space-x-6">
                    <div className="hidden sm:block text-right">
                      <span className="text-[10px] text-slate-500 block">Staked</span>
                      <span className="text-slate-300">₹{d.totalStaked.toLocaleString()}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Win Rate</span>
                      <span className={d.winRate >= 50 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                        {hasActivity ? `${d.winRate}%` : '—'}
                      </span>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="text-[10px] text-slate-500 block">Net PnL</span>
                      <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                        !hasActivity
                          ? 'text-slate-500'
                          : d.netPnl >= 0
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {hasActivity
                          ? d.netPnl >= 0
                            ? `+₹${d.netPnl}`
                            : `-₹${Math.abs(d.netPnl)}`
                          : '₹0'}
                      </span>
                    </div>

                    {hasActivity && (
                      <span className="text-slate-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded bets for that day */}
                {isExpanded && d.bets.length > 0 && (
                  <div className="bg-slate-900/90 p-3.5 space-y-2 border-t border-slate-800 text-xs">
                    <div className="text-[10px] uppercase font-bold text-amber-400 mb-2">
                      Rounds on {d.fullDate}:
                    </div>
                    {d.bets.map((b) => (
                      <div
                        key={b.betId}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-200">Period {b.roundPeriod}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-sans bg-slate-800 text-amber-300">
                              {b.betType.toUpperCase()}: {b.betValue.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Stake: ₹{b.amount}</span>
                          <span className={`font-bold ${
                            b.status === 'won' ? 'text-emerald-400' : b.status === 'lost' ? 'text-rose-400' : 'text-amber-400'
                          }`}>
                            {b.status === 'won'
                              ? `+₹${(b.actualPayout || 0) - b.amount}`
                              : b.status === 'lost'
                              ? `-₹${b.amount}`
                              : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
