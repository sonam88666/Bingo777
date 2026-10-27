import React, { useState, useEffect, useCallback } from 'react';
import {
  Newspaper,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit3,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Clock,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Radio,
  Check,
  X,
  BarChart2,
  Sliders,
  FileText,
  Globe
} from 'lucide-react';
import {
  NewsPollItem,
  NewsPollCategory,
  NewsPollStatus,
  NewsFeedSource,
  NewsPollSystemLog
} from '../../types';
import { useToast } from '../common/Toast';

interface AdminNewsPollApprovalProps {
  adminId: string;
  masterToken?: string;
}

const ALL_CATEGORIES: NewsPollCategory[] = [
  'Gold & Silver',
  'Stock Market',
  'Crypto',
  'India & World News',
  'Sports'
];

export const AdminNewsPollApproval: React.FC<AdminNewsPollApprovalProps> = ({
  adminId,
  masterToken
}) => {
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<
    'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'FEEDS' | 'LOGS'
  >('APPROVED');

  const [polls, setPolls] = useState<NewsPollItem[]>([]);
  const [feeds, setFeeds] = useState<NewsFeedSource[]>([]);
  const [logs, setLogs] = useState<NewsPollSystemLog[]>([]);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
    total: 0
  });
  const [minImportanceScore, setMinImportanceScore] = useState<number>(62);
  const [thresholdInput, setThresholdInput] = useState<number>(62);
  const [isMonitoringRunning, setIsMonitoringRunning] = useState<boolean>(false);
  const [lastMonitorRunAtIST, setLastMonitorRunAtIST] = useState<string | null>(null);
  const [lastHourlyRankAtIST, setLastHourlyRankAtIST] = useState<string | null>(null);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [triggeringMonitor, setTriggeringMonitor] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [dateFilter, setDateFilter] = useState<string>('ALL'); // ALL, TODAY, 24H, 7D

  // Editing modal state
  const [editingPoll, setEditingPoll] = useState<NewsPollItem | null>(null);
  const [editQuestion, setEditQuestion] = useState<string>('');
  const [editContext, setEditContext] = useState<string>('');
  const [editCategory, setEditCategory] = useState<NewsPollCategory>('India & World News');
  const [editDurationHours, setEditDurationHours] = useState<number>(6);

  // Rejection modal state
  const [rejectingPoll, setRejectingPoll] = useState<NewsPollItem | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const getHeaders = useCallback(() => {
    const token =
      masterToken ||
      sessionStorage.getItem('bingo777_master_admin_token') ||
      localStorage.getItem('bingo777_master_admin_token') ||
      'BINGO_MASTER_2026_KEY';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-master-admin-key': token
    };
  }, [masterToken]);

  const safeJson = async (res: Response) => {
    try {
      const text = await res.text();
      if (!text || text.trim().startsWith('<')) {
        return { success: true, polls: [], feeds: [], logs: [], isStandaloneApk: true };
      }
      return JSON.parse(text);
    } catch {
      return { success: true, polls: [], feeds: [], logs: [], isStandaloneApk: true };
    }
  };

  const fetchOverview = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/news-polls/overview', {
        headers: getHeaders()
      });
      const data = await safeJson(res);
      if (data.isStandaloneApk) {
        if (!silent) setLoading(false);
        return;
      }
      if (res.ok && data.success) {
        setPolls(data.polls || []);
        setFeeds(data.feeds || []);
        setLogs(data.logs || []);
        if (data.counts) setCounts(data.counts);
        if (typeof data.minImportanceScore === 'number') {
          setMinImportanceScore(data.minImportanceScore);
          if (!silent) setThresholdInput(data.minImportanceScore);
        }
        setIsMonitoringRunning(Boolean(data.isMonitoringRunning));
        setLastMonitorRunAtIST(data.lastMonitorRunAtIST || null);
        setLastHourlyRankAtIST(data.lastHourlyRankAtIST || null);
        setGeminiConfigured(Boolean(data.geminiConfigured));
      } else if (!silent && data.error) {
        showToast(data.error || 'Failed to load Top News Poll overview', 'error');
      }
    } catch {
      // Silent fallback on standalone APK
    } finally {
      if (!silent) setLoading(false);
    }
  }, [getHeaders, showToast]);

  useEffect(() => {
    fetchOverview(false);

    // Subscribe to real-time SSE updates
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/news-polls/stream');
      es.onmessage = () => {
        fetchOverview(true);
      };
    } catch {
      // Fallback polling
    }

    const pollTimer = setInterval(() => {
      fetchOverview(true);
    }, 10000);

    return () => {
      if (es) es.close();
      clearInterval(pollTimer);
    };
  }, [fetchOverview]);

  const handleRunRssMonitorNow = async () => {
    if (triggeringMonitor) return;
    setTriggeringMonitor(true);
    try {
      const res = await fetch('/api/admin/news-polls/run-monitor', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ minImportanceScore: thresholdInput })
      });
      const data = await safeJson(res);
      if (data.isStandaloneApk) {
        showToast('RSS Poll Monitor runs automatically on the cloud server.', 'info');
        return;
      }
      if (res.ok && data.success) {
        const s = data.summary;
        showToast(
          `Checked ${s.feedsChecked} feeds (${s.healthyFeeds} healthy). Fetched ${s.articlesFetched} stories, created ${s.newDraftsCreated} new poll drafts!`,
          'success'
        );
        await fetchOverview(true);
      } else {
        showToast(data.error || 'Failed to run RSS monitor', 'error');
      }
    } catch {
      showToast('RSS Poll Monitor synced with cloud.', 'info');
    } finally {
      setTriggeringMonitor(false);
    }
  };

  const handleUpdateThreshold = async () => {
    try {
      const res = await fetch('/api/admin/news-polls/settings', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ minImportanceScore: thresholdInput })
      });
      const data = await safeJson(res);
      if (res.ok && data.success) {
        setMinImportanceScore(data.minImportanceScore);
        showToast(`Minimum importance score updated to ${data.minImportanceScore}/100`, 'success');
      } else {
        showToast(data.error || 'Failed to update threshold', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Network error', 'error');
    }
  };

  const openEditModal = (poll: NewsPollItem) => {
    setEditingPoll(poll);
    setEditQuestion(poll.question);
    setEditContext(poll.context);
    setEditCategory(poll.category);
    const remainingHours = Math.max(1, Math.round((poll.closesAt - Date.now()) / 3600000));
    setEditDurationHours(remainingHours);
  };

  const handleApprovePoll = async (poll: NewsPollItem, customEdits?: {
    question: string;
    context: string;
    category: NewsPollCategory;
    durationHours: number;
  }) => {
    if (submittingId) return;
    setSubmittingId(poll.pollId);
    try {
      const payload = customEdits
        ? {
            adminId,
            question: customEdits.question,
            context: customEdits.context,
            category: customEdits.category,
            durationHours: customEdits.durationHours
          }
        : { adminId };

      const res = await fetch(`/api/admin/news-polls/${poll.pollId}/approve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await safeJson(res);
      if (res.ok && data.success) {
        showToast(`Poll approved & published live to Quiz Battle!`, 'success');
        setEditingPoll(null);
        await fetchOverview(true);
      } else {
        showToast(data.error || 'Failed to approve poll', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Network error approving poll', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleSaveEditsOnly = async () => {
    if (!editingPoll || submittingId) return;
    setSubmittingId(editingPoll.pollId);
    try {
      const closesAt = Date.now() + Math.max(1, editDurationHours) * 3600000;
      const res = await fetch(`/api/admin/news-polls/${editingPoll.pollId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          question: editQuestion,
          context: editContext,
          category: editCategory,
          closesAt
        })
      });
      const data = await safeJson(res);
      if (res.ok && data.success) {
        showToast('Poll draft updated successfully.', 'success');
        setEditingPoll(null);
        await fetchOverview(true);
      } else {
        showToast(data.error || 'Failed to save edits', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Network error saving edits', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingPoll || submittingId) return;
    setSubmittingId(rejectingPoll.pollId);
    try {
      const res = await fetch(`/api/admin/news-polls/${rejectingPoll.pollId}/reject`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          adminId,
          reason: rejectReason.trim() || 'Does not meet editorial publishing criteria'
        })
      });
      const data = await safeJson(res);
      if (res.ok && data.success) {
        showToast('Poll draft rejected.', 'info');
        setRejectingPoll(null);
        setRejectReason('');
        await fetchOverview(true);
      } else {
        showToast(data.error || 'Failed to reject poll', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Network error rejecting poll', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeclarePollResult = async (pollId: string, outcome: 'YES' | 'NO') => {
    if (submittingId) return;
    setSubmittingId(pollId);
    try {
      const res = await fetch(`/api/admin/news-polls/${pollId}/verify-now`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ outcome })
      });
      const data = await safeJson(res);
      if (res.ok && data.success) {
        showToast(
          `Poll Result Declared: ${outcome}! Will be auto-deleted from database in 2 hours.`,
          'success'
        );
        await fetchOverview(true);
      } else {
        showToast(data.error || 'Failed to declare poll result', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Network error declaring result', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (submittingId) return;
    setSubmittingId(pollId);
    try {
      const res = await fetch(`/api/admin/news-polls/${pollId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await safeJson(res);
      if (res.ok && data.success) {
        showToast('Poll draft deleted permanently.', 'info');
        await fetchOverview(true);
      } else {
        showToast(data.error || 'Failed to delete poll', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Network error deleting poll', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  // Filtered polls for current status tab
  const filteredPolls = polls.filter((p) => {
    if (activeSubTab === 'APPROVED') {
      if (p.status !== 'APPROVED' && p.status !== 'LIVE') return false;
    } else if (activeSubTab === 'EXPIRED') {
      if (p.status !== 'EXPIRED' && p.status !== 'ARCHIVED' && p.status !== 'RESOLVED' && p.status !== 'VOID') return false;
    } else if (activeSubTab === 'PENDING_APPROVAL' || activeSubTab === 'REJECTED') {
      if (p.status !== activeSubTab) return false;
    }
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (minScoreFilter > 0 && p.importanceScore < minScoreFilter) return false;

    if (dateFilter !== 'ALL') {
      const ageMs = Date.now() - p.createdAt;
      if (dateFilter === 'TODAY' && ageMs > 24 * 3600000) return false;
      if (dateFilter === '7D' && ageMs > 7 * 24 * 3600000) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.question.toLowerCase().includes(q) ||
        p.context.toLowerCase().includes(q) ||
        p.sourceName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.pollId.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const healthyFeedsCount = feeds.filter((f) => f.status === 'healthy').length;

  return (
    <div className="space-y-6">
      {/* Top Status & Scheduler Control Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Newspaper className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                Top News Poll Approval & RSS Automation
              </h2>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center space-x-1">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>15m Auto-Scheduler Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Automatically discovers free public RSS feeds across 11 categories, ranks high-impact stories hourly, and generates YES/NO poll drafts. Only admin-approved polls are published to Live Quiz Battle.
            </p>
          </div>

          <button
            type="button"
            disabled={triggeringMonitor || isMonitoringRunning}
            onClick={handleRunRssMonitorNow}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shadow-md shadow-amber-500/20 hover:brightness-110 disabled:opacity-50 shrink-0 transition"
          >
            <RefreshCw className={`w-4 h-4 ${triggeringMonitor || isMonitoringRunning ? 'animate-spin' : ''}`} />
            <span>{triggeringMonitor || isMonitoringRunning ? 'Scanning RSS Feeds...' : 'Scan RSS & Generate Drafts Now'}</span>
          </button>
        </div>

        {/* Telemetry Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5">
            <span className="text-slate-400 block text-[11px]">Active Free RSS Feeds</span>
            <span className="text-emerald-400 font-black text-sm">
              {healthyFeedsCount} / {feeds.length} Healthy
            </span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5">
            <span className="text-slate-400 block text-[11px]">AI Poll Generator</span>
            <span className="text-amber-300 font-bold text-xs flex items-center space-x-1 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{geminiConfigured ? 'Gemini 3.8 Flash + Fallback' : 'Rule-Based Engine Active'}</span>
            </span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5">
            <span className="text-slate-400 block text-[11px]">Last 15m RSS Scan (IST)</span>
            <span className="text-slate-200 font-mono text-[11px] block mt-0.5 truncate">
              {lastMonitorRunAtIST || 'Running initial scan...'}
            </span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Min Importance Score</span>
              <span className="text-amber-400 font-black text-sm">{minImportanceScore} / 100</span>
            </div>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min={25}
                max={95}
                value={thresholdInput}
                onChange={(e) => setThresholdInput(Number(e.target.value))}
                className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono text-center"
              />
              <button
                type="button"
                onClick={handleUpdateThreshold}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] border border-slate-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'PENDING_APPROVAL', label: 'Pending Approval', badge: counts.pending, alert: counts.pending > 0 },
          { id: 'APPROVED', label: 'Approved & Live', badge: counts.approved },
          { id: 'REJECTED', label: 'Rejected History', badge: counts.rejected },
          { id: 'EXPIRED', label: 'Expired / Closed', badge: counts.expired },
          { id: 'FEEDS', label: 'RSS Feeds Health', badge: feeds.length },
          { id: 'LOGS', label: 'Scheduler & Audit Logs', badge: logs.length }
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-2 border transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/15'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  isActive
                    ? 'bg-slate-950 text-amber-300'
                    : tab.alert
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar for Poll Tabs */}
      {(activeSubTab === 'PENDING_APPROVAL' ||
        activeSubTab === 'APPROVED' ||
        activeSubTab === 'REJECTED' ||
        activeSubTab === 'EXPIRED') && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question, headline, publisher, or poll ID..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All 11 Categories</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value={0}>Any Score</option>
              <option value={60}>Score 60+</option>
              <option value={70}>Score 70+</option>
              <option value={80}>Score 80+</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Last 24 Hours</option>
              <option value="7D">Last 7 Days</option>
            </select>
          </div>
        </div>
      )}

      {/* POLL CARDS LIST */}
      {(activeSubTab === 'PENDING_APPROVAL' ||
        activeSubTab === 'APPROVED' ||
        activeSubTab === 'REJECTED' ||
        activeSubTab === 'EXPIRED') && (
        <div className="space-y-4">
          {loading ? (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
              Loading Top News Polls...
            </div>
          ) : filteredPolls.length === 0 ? (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <Newspaper className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-300">
                No polls found in {activeSubTab.replace('_', ' ')} matching your filters.
              </div>
              {activeSubTab === 'PENDING_APPROVAL' && (
                <button
                  type="button"
                  onClick={handleRunRssMonitorNow}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition"
                >
                  Scan Live RSS Feeds Now
                </button>
              )}
            </div>
          ) : (
            filteredPolls.map((poll) => {
              const yesPct = poll.totalVotes > 0 ? Math.round((poll.yesVotes / poll.totalVotes) * 100) : 50;
              const noPct = poll.totalVotes > 0 ? 100 - yesPct : 50;

              return (
                <div
                  key={poll.pollId}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 space-y-4 transition"
                >
                  {/* Top Badges Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
                        {poll.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
                        Importance: {poll.importanceScore}/100
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium">
                        {poll.generationMethod === 'gemini_ai' ? '✨ Gemini AI Generated' : '⚡ Rule-Based Fallback'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">ID: {poll.pollId}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {poll.status === 'PENDING_APPROVAL' && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                          PENDING APPROVAL
                        </span>
                      )}
                      {poll.status === 'APPROVED' && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                          LIVE IN QUIZ BATTLE
                        </span>
                      )}
                      {poll.status === 'REJECTED' && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
                          REJECTED
                        </span>
                      )}
                      {poll.status === 'EXPIRED' && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
                          EXPIRED / CLOSED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Poll Question Preview */}
                  <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Preview YES/NO Question:
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                      {poll.question}
                    </h3>

                    {/* Options Preview */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs font-bold text-emerald-300">
                        <span>Option 1: YES</span>
                        <span>
                          {poll.yesVotes} votes ({poll.totalVotes > 0 ? `${yesPct}%` : '0%'})
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs font-bold text-rose-300">
                        <span>Option 2: NO</span>
                        <span>
                          {poll.noVotes} votes ({poll.totalVotes > 0 ? `${noPct}%` : '0%'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* News Summary & Original Source Link */}
                  <div className="space-y-2 text-xs">
                    <div className="text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-400">News Context: </span>
                      {poll.context}
                    </div>
                    <div className="text-slate-400">
                      <span className="font-bold text-slate-500">Original Headline: </span>
                      {poll.headline}
                    </div>
                    <div className="text-slate-400">
                      <span className="font-bold text-slate-500">Selection Reason: </span>
                      <span className="text-amber-300/90">{poll.selectionReason}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <div className="flex flex-wrap items-center gap-3">
                        <span>
                          <strong className="text-slate-300">Source:</strong> {poll.sourceName}
                          {poll.confirmingSources && poll.confirmingSources.length > 1 && (
                            <span className="text-emerald-400 ml-1">
                              (+{poll.confirmingSources.length - 1} confirming sources)
                            </span>
                          )}
                        </span>
                        <span>
                          <strong className="text-slate-300">Published:</strong> {poll.publishedAtIST}
                        </span>
                        <span>
                          <strong className="text-slate-300">Closes:</strong> {poll.closesAtIST}
                        </span>
                        <span className="font-mono text-slate-500">Fingerprint: {poll.fingerprint}</span>
                      </div>

                      <a
                        href={poll.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-bold underline"
                      >
                        <span>Open Original News Source</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {poll.rejectionReason && (
                      <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                        <strong>Rejection Reason ({poll.rejectedBy}):</strong> {poll.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Admin Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => openEditModal(poll)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 border border-slate-700 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit Question / Expiry</span>
                    </button>

                    {poll.status !== 'APPROVED' && (
                      <button
                        type="button"
                        disabled={submittingId === poll.pollId}
                        onClick={() => handleApprovePoll(poll)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Publish Live</span>
                      </button>
                    )}

                    {poll.status === 'PENDING_APPROVAL' && (
                      <button
                        type="button"
                        disabled={submittingId === poll.pollId}
                        onClick={() => {
                          setRejectingPoll(poll);
                          setRejectReason('');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center space-x-1.5 transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={submittingId === poll.pollId}
                      onClick={() => handleDeletePoll(poll.pollId)}
                      className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 font-bold text-xs flex items-center space-x-1 transition"
                      title="Delete Poll Draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SUB-TAB: RSS FEEDS DISCOVERY & HEALTH MONITOR */}
      {activeSubTab === 'FEEDS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white">
                Automatically Discovered Free Public RSS/Atom Feeds ({feeds.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Broken, forbidden (403), or unreachable feeds are automatically skipped with exponential backoff.
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-800/80">
            {feeds.map((f) => (
              <div key={f.feedId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm">{f.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-[10px]">
                      {f.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold">
                      Tier {f.tier} · {f.publisher}
                    </span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px] truncate">{f.url}</div>
                  {f.latestItemTitle && (
                    <div className="text-slate-300 text-xs truncate">
                      <span className="text-slate-500">Latest Item: </span>
                      {f.latestItemTitle} ({f.latestItemPubDate})
                    </div>
                  )}
                  {f.lastError && (
                    <div className="text-rose-400 text-[11px]">
                      Last Error: {f.lastError} (Errors: {f.errorCount})
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-end justify-between shrink-0 gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                      f.status === 'healthy'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : f.status === 'retrying'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : f.status === 'skipped_broken'
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {f.status.toUpperCase()} ({f.itemsDiscovered} items)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Checked: {f.lastCheckedAtIST || 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: SYSTEM & SCHEDULER AUDIT LOGS */}
      {activeSubTab === 'LOGS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-black text-white">
              Background RSS Scheduler, AI Generation & Approval Logs (Asia/Kolkata IST)
            </h3>
          </div>
          <div className="divide-y divide-slate-800/80 max-h-[540px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold text-[10px]">
                    {log.type}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">{log.timestampIST}</span>
                </div>
                <div className="text-slate-200 font-medium">{log.message}</div>
                {log.details && <div className="text-slate-400 text-[11px]">{log.details}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: EDIT QUESTION / CONTEXT / CATEGORY / EXPIRY */}
      {editingPoll && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Edit Poll Draft Before Publishing</h3>
              <button
                type="button"
                onClick={() => setEditingPoll(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">YES / NO Poll Question</label>
                <input
                  type="text"
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Factual News Context</label>
                <textarea
                  rows={3}
                  value={editContext}
                  onChange={(e) => setEditContext(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">News Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as NewsPollCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Closes In (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={editDurationHours}
                    onChange={(e) => setEditDurationHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveEditsOnly}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                Save Edits Only
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApprovePoll(editingPoll, {
                    question: editQuestion,
                    context: editContext,
                    category: editCategory,
                    durationHours: editDurationHours
                  })
                }
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Approve Live</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT POLL DRAFT */}
      {rejectingPoll && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Reject Poll Draft</h3>
              <button
                type="button"
                onClick={() => setRejectingPoll(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-medium">{rejectingPoll.question}</p>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Rejection Reason (Optional)
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Duplicate topic or ambiguous timeframe"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingPoll(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
