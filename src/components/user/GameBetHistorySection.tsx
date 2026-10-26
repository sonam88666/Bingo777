import React, { useState, useMemo } from 'react';
import { 
  History, 
  BarChart3, 
  UserCheck, 
  Copy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  Search
} from 'lucide-react';
import { GameRound, LiveBet, UserRecord } from '../../types';
import { useToast } from '../common/Toast';
import { BetAnalyticsVisualizer } from './BetAnalyticsVisualizer';

interface GameBetHistorySectionProps {
  pastRounds: GameRound[];
  userBets: LiveBet[];
  user: UserRecord | null;
  onOpenDeposit?: () => void;
  onOpenAuth?: () => void;
  defaultTab?: 'game' | 'chart' | 'analytics' | 'mybets';
}

export const GameBetHistorySection: React.FC<GameBetHistorySectionProps> = ({
  pastRounds,
  userBets,
  user,
  onOpenDeposit,
  onOpenAuth,
  defaultTab = 'game'
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'game' | 'chart' | 'analytics' | 'mybets'>(defaultTab);

  // My Bets Filtering
  const [betStatusFilter, setBetStatusFilter] = useState<'all' | 'won' | 'lost' | 'pending'>('all');
  const [betTypeFilter, setBetTypeFilter] = useState<string>('all');
  const [expandedBetId, setExpandedBetId] = useState<string | null>(null);
  const [myBetsPage, setMyBetsPage] = useState(1);
  const itemsPerPage = 6;

  // Chart Timeframe
  const [chartSampleSize, setChartSampleSize] = useState<30 | 50 | 100>(30);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  const formatDateTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getNumberBg = (num: number) => {
    if (num === 0) return 'bg-gradient-to-tr from-rose-600 to-purple-600 text-white';
    if (num === 5) return 'bg-gradient-to-tr from-emerald-600 to-purple-600 text-white';
    if (num % 2 === 0) return 'bg-rose-600 text-white';
    return 'bg-emerald-600 text-white';
  };

  // Filtered User Bets
  const filteredBets = useMemo(() => {
    return userBets.filter((b) => {
      if (betStatusFilter !== 'all' && b.status !== betStatusFilter) return false;
      if (betTypeFilter !== 'all' && b.betType !== betTypeFilter) return false;
      return true;
    });
  }, [userBets, betStatusFilter, betTypeFilter]);

  const totalMyBetsPages = Math.max(1, Math.ceil(filteredBets.length / itemsPerPage));
  const safeMyBetsPage = Math.min(myBetsPage, totalMyBetsPages);
  const paginatedBets = useMemo(() => {
    const start = (safeMyBetsPage - 1) * itemsPerPage;
    return filteredBets.slice(start, start + itemsPerPage);
  }, [filteredBets, safeMyBetsPage, itemsPerPage]);

  // Chart Analytics
  const chartRounds = useMemo(() => {
    return pastRounds.slice(0, chartSampleSize);
  }, [pastRounds, chartSampleSize]);

  const chartStats = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let bigCount = 0;
    let smallCount = 0;
    let greenCount = 0;
    let redCount = 0;
    let violetCount = 0;

    chartRounds.forEach((r) => {
      if (r.winningNumber >= 0 && r.winningNumber <= 9) {
        counts[r.winningNumber]++;
      }
      if (r.winningSize === 'big') bigCount++;
      else smallCount++;

      if (r.winningColor.includes('green')) greenCount++;
      if (r.winningColor.includes('red')) redCount++;
      if (r.winningColor.includes('violet')) violetCount++;
    });

    const total = chartRounds.length || 1;
    const maxFreq = Math.max(...counts, 1);

    return {
      counts,
      maxFreq,
      total,
      bigPercent: Math.round((bigCount / total) * 100),
      smallPercent: Math.round((smallCount / total) * 100),
      greenPercent: Math.round((greenCount / total) * 100),
      redPercent: Math.round((redCount / total) * 100),
      violetPercent: Math.round((violetCount / total) * 100)
    };
  }, [chartRounds]);

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800/90 shadow-2xl overflow-hidden mt-6">
      {/* Top 4 Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-800 bg-slate-950/70 p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('game')}
          className={`py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-brand font-black flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'game'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Game History</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chart')}
          className={`py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-brand font-black flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'chart'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Chart</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-brand font-black flex items-center justify-center space-x-1.5 transition relative ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Bet Analytics</span>
          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
            activeTab === 'analytics' ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300'
          }`}>
            30D
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mybets')}
          className={`py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-brand font-black flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'mybets'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>My History ({userBets.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: GAME HISTORY (CLEAN, ALIGNED PERIOD RECORDS)      */}
      {/* ======================================================== */}
      {activeTab === 'game' && (
        <div className="p-3 sm:p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
            <span className="font-bold text-slate-300">Recent Completed Periods</span>
            <span className="font-mono text-[11px] text-amber-400">{pastRounds.length} rounds logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-bold">Period</th>
                  <th className="py-2.5 px-3 font-bold text-center">Number</th>
                  <th className="py-2.5 px-3 font-bold text-center">Big/Small</th>
                  <th className="py-2.5 px-3 font-bold text-center">Color Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {pastRounds.map((rnd, idx) => (
                  <tr key={`${rnd.period}_${idx}`} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-bold text-slate-200">
                      {rnd.period}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-black text-sm shadow-md ${getNumberBg(rnd.winningNumber)}`}>
                        {rnd.winningNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        rnd.winningSize === 'big' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}>
                        {rnd.winningSize}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {rnd.winningColor.map((c) => (
                          <span
                            key={c}
                            className={`w-3.5 h-3.5 rounded-full shadow-sm ring-1 ring-white/10 ${
                              c === 'green' ? 'bg-emerald-500' : c === 'red' ? 'bg-rose-500' : 'bg-purple-500'
                            }`}
                            title={c}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CHART (TRENDS, DISTRIBUTION & RATIOS)            */}
      {/* ======================================================== */}
      {activeTab === 'chart' && (
        <div className="p-4 sm:p-5 space-y-5">
          {/* Sample Size Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Statistical Sample Window</span>
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
              {([30, 50, 100] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setChartSampleSize(size)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    chartSampleSize === size
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Last {size}
                </button>
              ))}
            </div>
          </div>

          {/* Number Frequency Distribution Bar Chart */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">Winning Number Frequency (0 - 9)</span>
              <span className="text-slate-500 text-[11px] font-mono">Sample: {chartStats.total} rounds</span>
            </div>

            <div className="grid grid-cols-10 gap-1.5 pt-2 items-end h-32 border-b border-slate-800 pb-2">
              {chartStats.counts.map((count, num) => {
                const heightPercent = Math.max(12, Math.round((count / chartStats.maxFreq) * 100));
                return (
                  <div key={num} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono font-bold text-amber-300 mb-1 opacity-80 group-hover:opacity-100">
                      {count}
                    </span>
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[20px] rounded-t-md transition-all ${
                        num === 0 || num === 5 
                          ? 'bg-gradient-to-t from-purple-700 to-amber-400' 
                          : num % 2 === 0 
                          ? 'bg-gradient-to-t from-rose-700 to-rose-400' 
                          : 'bg-gradient-to-t from-emerald-700 to-emerald-400'
                      }`}
                    />
                    <span className="text-xs font-mono font-bold text-slate-300 mt-2">
                      {num}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ratio Breakdown: Big vs Small & Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Big vs Small */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-amber-400">BIG ({chartStats.bigPercent}%)</span>
                <span className="text-sky-400">SMALL ({chartStats.smallPercent}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${chartStats.bigPercent}%` }} className="bg-amber-500 h-full" />
                <div style={{ width: `${chartStats.smallPercent}%` }} className="bg-sky-500 h-full" />
              </div>
            </div>

            {/* Color Distribution */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span className="text-emerald-400">Green: {chartStats.greenPercent}%</span>
                <span className="text-rose-400">Red: {chartStats.redPercent}%</span>
                <span className="text-purple-400">Violet: {chartStats.violetPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${chartStats.greenPercent}%` }} className="bg-emerald-500 h-full" />
                <div style={{ width: `${chartStats.redPercent}%` }} className="bg-rose-500 h-full" />
                <div style={{ width: `${chartStats.violetPercent}%` }} className="bg-purple-500 h-full" />
              </div>
            </div>
          </div>

          {/* Trend Sequence Pills */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Recent Winning Sequence Trend</span>
            <div className="flex items-center space-x-1.5 overflow-x-auto py-2 no-scrollbar">
              {chartRounds.slice(0, 20).map((r, i) => (
                <div key={i} className="flex flex-col items-center space-y-1 shrink-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow ${getNumberBg(r.winningNumber)}`}>
                    {r.winningNumber}
                  </span>
                  <span className={`text-[9px] font-mono font-bold ${r.winningSize === 'big' ? 'text-amber-400' : 'text-sky-400'}`}>
                    {r.winningSize === 'big' ? 'B' : 'S'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: BET ANALYTICS (30-DAY WIN/LOSS VISUALIZER)        */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div className="p-3 sm:p-5">
          <BetAnalyticsVisualizer
            userBets={userBets}
            user={user}
            onOpenDeposit={onOpenDeposit}
            onOpenAuth={onOpenAuth}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: MY HISTORY (PREMIUM SCROLLABLE TRANSACTION LIST)  */}
      {/* ======================================================== */}
      {activeTab === 'mybets' && (
        <div className="p-4 sm:p-5 space-y-4">
          {!user ? (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <p className="text-slate-400 text-xs font-semibold">
                Please log in to view your personalized game & bet history.
              </p>
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg hover:bg-amber-400 transition"
                >
                  Log In Now
                </button>
              )}
            </div>
          ) : userBets.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <TrendingUp className="w-8 h-8 text-amber-500/60 mx-auto" />
              <p className="text-slate-300 font-bold text-xs">No Bets Placed Yet</p>
              <p className="text-slate-500 text-[11px]">
                Your transactions will appear here after selecting Big/Small, colors, or numbers.
              </p>
              {onOpenDeposit && (
                <button
                  type="button"
                  onClick={onOpenDeposit}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg transition"
                >
                  Recharge Wallet
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Quick Analytics Switcher Banner */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300 font-semibold text-[11px] sm:text-xs">
                    Want to see 30-day win/loss trends and cumulative profit charts?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition shadow flex items-center space-x-1 shrink-0"
                >
                  <span>30D Analytics</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Working Bet Filters */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                {/* Status Filter */}
                <div className="flex items-center space-x-1.5 text-xs">
                  <span className="text-slate-500 text-[11px] font-semibold flex items-center space-x-1">
                    <Filter className="w-3 h-3 text-amber-400" />
                    <span>Status:</span>
                  </span>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'won', label: 'Won', color: 'text-emerald-400' },
                    { id: 'lost', label: 'Lost', color: 'text-rose-400' },
                    { id: 'pending', label: 'Pending', color: 'text-amber-400' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => { setBetStatusFilter(st.id as any); setMyBetsPage(1); }}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition ${
                        betStatusFilter === st.id
                          ? 'bg-slate-800 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* Bet Type Filter */}
                <div className="flex items-center space-x-1 text-xs">
                  <span className="text-slate-500 text-[11px]">Selection:</span>
                  <select
                    value={betTypeFilter}
                    onChange={(e) => { setBetTypeFilter(e.target.value); setMyBetsPage(1); }}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-[11px] text-amber-300 font-bold focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="size">Big / Small</option>
                    <option value="color">Colors (Green/Red/Violet)</option>
                    <option value="number">Numbers (0-9)</option>
                  </select>
                </div>
              </div>

              {/* Transaction Cards List */}
              {paginatedBets.length === 0 ? (
                <div className="p-6 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs italic">
                  No bets match the selected filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedBets.map((b) => {
                    const isWon = b.status === 'won';
                    const isLost = b.status === 'lost';
                    const isPending = b.status === 'pending';
                    const isExpanded = expandedBetId === b.betId;
                    const profitLoss = isWon 
                      ? b.actualPayout - b.amount 
                      : isLost 
                      ? -b.amount 
                      : 0;

                    return (
                      <div
                        key={b.betId}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-slate-700/80 transition shadow-lg space-y-2.5"
                      >
                        {/* Header Row: Game Selection Badge & Profit/Loss Amount */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2.5 py-1 rounded-xl font-brand font-black text-xs uppercase tracking-wide flex items-center space-x-1 ${
                              b.betType === 'size'
                                ? b.betValue === 'big'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : b.betType === 'color'
                                ? b.betValue === 'green'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : b.betValue === 'red'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-800 text-slate-200 border border-slate-700'
                            }`}>
                              <span>Select: {b.betValue.toUpperCase()}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                              Bet ₹{b.amount}
                            </span>
                          </div>

                          {/* Profit / Loss with Clear Text Labels */}
                          <div className="text-right">
                            {isWon ? (
                              <div className="flex items-center space-x-1 text-emerald-400">
                                <span className="font-mono font-black text-base">
                                  +₹{b.actualPayout.toFixed(2)}
                                </span>
                              </div>
                            ) : isLost ? (
                              <div className="flex items-center space-x-1 text-rose-400">
                                <span className="font-mono font-black text-base">
                                  -₹{b.amount.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-mono font-bold text-amber-400 text-xs animate-pulse">
                                Round in progress
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle Row: Period, Order ID with Copy, and Status */}
                        <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1 border-t border-slate-900">
                          <div className="flex items-center space-x-2">
                            <span>Period: <strong className="text-slate-200">{b.roundPeriod}</strong></span>
                            <span className="text-slate-600">|</span>
                            <div className="flex items-center space-x-1">
                              <span>Order: <strong className="text-slate-300">{b.betId.substring(0, 10)}...</strong></span>
                              <button
                                type="button"
                                onClick={() => handleCopy(b.betId, 'Order ID')}
                                className="text-amber-400 hover:text-amber-300 transition p-0.5"
                                title="Copy Order ID"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Result Status Badge (Green for Won, Red for Lost, Amber for Pending) */}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center space-x-1 ${
                            isWon
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isLost
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          }`}>
                            {isWon && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                            {isLost && <XCircle className="w-3 h-3 text-rose-400" />}
                            {isPending && <Clock className="w-3 h-3 text-amber-400" />}
                            <span>{isWon ? 'Succeed' : isLost ? 'Failed' : 'Pending'}</span>
                          </span>
                        </div>

                        {/* Bottom Row: Date/Time & Expand Toggle */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span className="font-mono">{formatDateTime(b.timestamp)}</span>
                          <button
                            type="button"
                            onClick={() => setExpandedBetId(isExpanded ? null : b.betId)}
                            className="text-amber-400/90 hover:text-amber-300 font-bold flex items-center space-x-0.5 transition"
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Expandable Bet Breakdown Details */}
                        {isExpanded && (
                          <div className="mt-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono space-y-1.5 divide-y divide-slate-800/60 animate-in fade-in duration-150">
                            <div className="flex justify-between py-1">
                              <span className="text-slate-400 font-sans">Full Order ID:</span>
                              <span className="font-bold text-slate-200 select-all">{b.betId}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-slate-400 font-sans">Contract Money:</span>
                              <span className="font-bold text-slate-200">₹{b.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-slate-400 font-sans">Multiplier Rate:</span>
                              <span className="font-bold text-amber-400">{b.multiplier}X</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-slate-400 font-sans">Delivery Fee (2%):</span>
                              <span className="font-bold text-slate-400">₹{(b.amount * 0.02).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-slate-400 font-sans">Total Net Return:</span>
                              <span className={`font-black ${isWon ? 'text-emerald-400' : isLost ? 'text-rose-400' : 'text-amber-400'}`}>
                                {isWon ? `+₹${b.actualPayout.toFixed(2)}` : isLost ? '₹0.00' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalMyBetsPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                  <span className="font-mono text-[11px]">
                    Page <strong className="text-amber-300">{safeMyBetsPage}</strong> of <strong>{totalMyBetsPages}</strong> ({filteredBets.length} bets)
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      disabled={safeMyBetsPage <= 1}
                      onClick={() => setMyBetsPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none flex items-center space-x-1 transition font-bold"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>

                    <button
                      type="button"
                      disabled={safeMyBetsPage >= totalMyBetsPages}
                      onClick={() => setMyBetsPage((p) => Math.min(totalMyBetsPages, p + 1))}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none flex items-center space-x-1 transition font-bold"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
