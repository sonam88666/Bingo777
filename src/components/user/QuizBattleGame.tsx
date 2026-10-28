import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Newspaper,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Trophy,
  Radio,
  History,
  Sparkles,
  Wallet,
  Coins,
  Award
} from 'lucide-react';
import {
  UserRecord,
  NewsPollItem,
  NewsPollCategory,
  NewsPollLeaderboardEntry,
  NewsQuizSettlementRecord
} from '../../types';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';
import { rtdb, rtdbRef, rtdbSet, rtdbOnValue } from '../../firebase';

interface QuizBattleGameProps {
  user: UserRecord | null;
  onBack: () => void;
  onOpenDeposit?: () => void;
}

// Strictly 5 Categories
const FIVE_CATEGORIES: NewsPollCategory[] = [
  'Gold & Silver',
  'Stock Market',
  'Crypto',
  'India & World News',
  'Sports'
];

const STAKE_PRESETS = [10, 20, 50, 100, 250, 500, 1000];
const HOUSE_MARGIN_RATE = 0.15; // 15% House Margin on overall bet pool
const WINNER_POOL_RATE = 0.85; // 85% of overall bet pool distributed to winners
const BASE_MULTIPLIER = 1.7; // 2.0x minus 15% House Margin = 1.70x
const TWO_HOURS_MS = 2 * 60 * 60 * 1000; // 2 hours retention after result declaration

function formatCountdown(closesAt: number, now: number): string {
  const diff = Math.max(0, closesAt - now);
  if (diff <= 0) return 'Result Verifying...';
  const totalSec = Math.floor(diff / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) {
    return `${hrs}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  }
  return `${mins}m ${String(secs).padStart(2, '0')}s`;
}

function getPollDbExpiryMs(poll: NewsPollItem): number {
  if (typeof poll.expiresFromDbAt === 'number' && poll.expiresFromDbAt > 0) {
    return poll.expiresFromDbAt;
  }
  const resolvedAt = poll.verifiedAt || poll.cleanedUpFromActiveAt || poll.closesAt || Date.now();
  return resolvedAt + TWO_HOURS_MS;
}

function formatDbDeleteCountdown(poll: NewsPollItem, now: number): string {
  const expiresAt = getPollDbExpiryMs(poll);
  const diff = Math.max(0, expiresAt - now);
  if (diff <= 0) return 'Deleting from DB...';
  const totalSec = Math.floor(diff / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) {
    return `${hrs}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  }
  return `${mins}m ${String(secs).padStart(2, '0')}s`;
}

function calculateProjectedWin(
  poll: NewsPollItem,
  option: 'YES' | 'NO',
  stakeAmount: number
): number {
  const curYes = Number(poll.yesPool) || 0;
  const curNo = Number(poll.noPool) || 0;
  const oppPool = option === 'YES' ? curNo : curYes;
  const sidePool = option === 'YES' ? curYes : curNo;

  if (oppPool > 0) {
    const nextTotalPool = curYes + curNo + stakeAmount;
    const nextDistributable = nextTotalPool * WINNER_POOL_RATE; // 85% after 15% house margin
    const nextSidePool = sidePool + stakeAmount;
    return Math.round((stakeAmount / nextSidePool) * nextDistributable * 100) / 100;
  }
  return Math.round(stakeAmount * BASE_MULTIPLIER * 100) / 100;
}

function buildDefaultLivePolls(now: number): NewsPollItem[] {
  const hourSlot = Math.floor(now / (30 * 60 * 1000));
  const closesBase = (hourSlot + 1) * 30 * 60 * 1000 + 15 * 60 * 1000;
  const templates: Array<{
    idSuffix: string;
    category: NewsPollCategory;
    headline: string;
    summary: string;
    question: string;
    source: string;
    yesVotes: number;
    noVotes: number;
    yesPool: number;
    noPool: number;
  }> = [
    {
      idSuffix: 'gold_mcx_1',
      category: 'Gold & Silver',
      headline: 'MCX 24K Gold Futures Hold Above Key Intraday Support Level in Mumbai Bullion Trade',
      summary: 'Strong retail and global central bank demand keeps Indian 24K gold spot prices resilient.',
      question: 'Will 24K Gold MCX price trade in the GREEN at the end of this session window?',
      source: 'Bullion Desk India',
      yesVotes: 42,
      noVotes: 29,
      yesPool: 2850,
      noPool: 1960
    },
    {
      idSuffix: 'silver_spot_2',
      category: 'Gold & Silver',
      headline: 'Silver Industrial Demand Surges Alongside Solar & EV Manufacturing Orders',
      summary: 'Silver 1Kg contracts show active volume across domestic commodity exchanges.',
      question: 'Will MCX Silver 1Kg maintain gains above today’s opening benchmark?',
      source: 'Commodity Wire',
      yesVotes: 36,
      noVotes: 24,
      yesPool: 2140,
      noPool: 1520
    },
    {
      idSuffix: 'nifty_50_1',
      category: 'Stock Market',
      headline: 'NIFTY 50 & Bank Nifty See Heavy Institutional Activity Near Psychological Resistance',
      summary: 'IT and Banking heavyweights lead intraday momentum on NSE and BSE.',
      question: 'Will NIFTY 50 index hold above its 20-period intraday moving average at close?',
      source: 'Dalal Street Live',
      yesVotes: 58,
      noVotes: 41,
      yesPool: 4620,
      noPool: 3290
    },
    {
      idSuffix: 'btc_usdt_1',
      category: 'Crypto',
      headline: 'Bitcoin (BTC/USDT) & Ethereum Order Books Show High Liquidity Across Global Spot Markets',
      summary: 'ETF inflows and derivatives funding rates point to active intraday volatility.',
      question: 'Will Bitcoin (BTC/USDT) close higher than its current hourly opening price?',
      source: 'Crypto Market Pulse',
      yesVotes: 64,
      noVotes: 47,
      yesPool: 5400,
      noPool: 3850
    },
    {
      idSuffix: 'india_news_1',
      category: 'India & World News',
      headline: 'Digital Payments & UPI Transaction Volumes Record New Daily Milestone Across India',
      summary: 'High-frequency digital commerce and instant settlement adoption continues to expand.',
      question: 'Will India’s daily digital payment volume index exceed yesterday’s benchmark?',
      source: 'India Economic Desk',
      yesVotes: 49,
      noVotes: 19,
      yesPool: 3120,
      noPool: 1410
    },
    {
      idSuffix: 'sports_cricket_1',
      category: 'Sports',
      headline: 'T20 Powerplay Strike Rates & Boundary Percentages Reach Season Highs',
      summary: 'Top-order batters dominate early overs on flat subcontinental pitches.',
      question: 'Will the batting side score 48+ runs in the first 6 Powerplay overs of the featured match?',
      source: 'Cricket Analytics Live',
      yesVotes: 73,
      noVotes: 52,
      yesPool: 6180,
      noPool: 4420
    }
  ];

  return templates.map((t, idx) => {
    const totalVotes = t.yesVotes + t.noVotes;
    const totalPool = t.yesPool + t.noPool;
    const houseMargin = Math.round(totalPool * HOUSE_MARGIN_RATE * 100) / 100;
    const distributablePool = Math.round((totalPool - houseMargin) * 100) / 100;
    const pubAt = now - (idx + 1) * 120000;
    const closeAt = closesBase + idx * 5 * 60 * 1000;
    const istNow = new Date(pubAt).toLocaleString('en-IN');
    const istClose = new Date(closeAt).toLocaleString('en-IN');
    return {
      pollId: `poll_rtdb_${hourSlot}_${t.idSuffix}`,
      question: t.question,
      options: ['YES', 'NO'],
      category: t.category,
      context: t.summary,
      headline: t.headline,
      resolutionRule: 'Verified against official exchange / market benchmark at poll close.',
      verificationWindowHours: 2,
      isMarketDisclaimerRequired: false,
      sourceUrl: 'https://bingo777.live',
      sourceName: t.source,
      confirmingSources: [t.source],
      publishedAt: pubAt,
      publishedAtIST: istNow,
      createdAt: pubAt,
      createdAtIST: istNow,
      opensAt: pubAt,
      opensAtIST: istNow,
      closesAt: closeAt,
      closesAtIST: istClose,
      importanceScore: 95,
      selectionReason: 'Featured Live Market Event',
      fingerprint: t.idSuffix,
      generationMethod: 'rule_based_fallback',
      status: 'LIVE',
      yesVotes: t.yesVotes,
      noVotes: t.noVotes,
      totalVotes,
      yesPool: t.yesPool,
      noPool: t.noPool,
      totalPool,
      houseMarginPercent: 15,
      houseMarginAmount: houseMargin,
      distributablePool,
      rewardMultiplier: BASE_MULTIPLIER
    };
  });
}

export const QuizBattleGame: React.FC<QuizBattleGameProps> = ({
  user,
  onBack,
  onOpenDeposit
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'leaderboard'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStake, setSelectedStake] = useState<number>(20);
  const [activePolls, setActivePolls] = useState<NewsPollItem[]>([]);
  const [completedPolls, setCompletedPolls] = useState<NewsPollItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<NewsPollLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [votingPollId, setVotingPollId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState<number>(Date.now());

  const audioCtxRef = useRef<AudioContext | null>(null);
  const syncedSettlementTxIdsRef = useRef<Set<string>>(new Set());

  const playVoteTone = (freq = 580) => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new Ctx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.15);
    } catch {
      // Ignore audio policy restrictions
    }
  };

  // Synchronize verified winning rewards or void refunds with the client wallet store idempotently
  const syncVerifiedSettlementsWithWallet = useCallback(
    (settlements: NewsQuizSettlementRecord[]) => {
      if (!user?.uid || !Array.isArray(settlements)) return;
      for (const s of settlements) {
        if (s.uid !== user.uid) continue;
        if (s.payoutAmount <= 0 || !s.settlementTxId) continue;
        if (syncedSettlementTxIdsRef.current.has(s.settlementTxId)) continue;

        const existingTx = store.getTransaction(s.settlementTxId);
        if (existingTx) {
          syncedSettlementTxIdsRef.current.add(s.settlementTxId);
          continue;
        }

        const isVoid = s.status === 'REFUNDED_VOID';
        const txResult = store.executeWalletTransaction({
          uid: user.uid,
          type: 'game_payout',
          category: 'credit',
          amount: s.payoutAmount,
          referenceId: s.pollId,
          transactionId: s.settlementTxId,
          description: isVoid
            ? `Live Quiz VOID Refund — ${s.question.slice(0, 55)}`
            : `Live Quiz Won (${s.selectedOption}) — ${s.question.slice(0, 55)}`,
          status: 'completed',
          metadata: {
            game: 'quiz_battle',
            pollId: s.pollId,
            verifiedOutcome: s.verifiedOutcome,
            status: s.status
          }
        });

        if (txResult.success) {
          syncedSettlementTxIdsRef.current.add(s.settlementTxId);
          playVoteTone(isVoid ? 520 : 880);
          showToast(
            isVoid
              ? `VOID Refund: ₹${s.payoutAmount.toFixed(2)} credited to wallet!`
              : `🎉 You Won ₹${s.payoutAmount.toFixed(2)}! (${s.verifiedOutcome})`,
            'success'
          );
        }
      }
    },
    [user?.uid, showToast]
  );

  const [allActivePolls, setAllActivePolls] = useState<NewsPollItem[]>(() => buildDefaultLivePolls(Date.now()));

  // Filter activePolls reactively whenever selectedCategory or allActivePolls updates
  useEffect(() => {
    const now = Date.now();
    const validLive = allActivePolls.filter((p) => {
      if (!p || !p.pollId) return false;
      const st = String(p.status || 'LIVE').toUpperCase();
      const isLiveStatus = st === 'LIVE' || st === 'APPROVED' || st === 'ACTIVE';
      const endTs = Number((p as unknown as { endTime?: number }).endTime || p.closesAt || 0);
      return isLiveStatus && endTs > now;
    });

    const sourceList = validLive.length > 0 ? validLive : buildDefaultLivePolls(now);
    const catNorm = selectedCategory.trim().toLowerCase();
    if (!catNorm || catNorm === 'all') {
      setActivePolls(sourceList);
    } else {
      const filtered = sourceList.filter(
        (p) => String(p.category || '').trim().toLowerCase() === catNorm
      );
      if (filtered.length > 0) {
        setActivePolls(filtered);
      } else {
        // Ensure category always has at least its live approved poll
        const fallbackForCat = buildDefaultLivePolls(now).filter(
          (p) => String(p.category || '').trim().toLowerCase() === catNorm
        );
        setActivePolls(fallbackForCat);
      }
    }
  }, [selectedCategory, allActivePolls]);

  // Persistent Firebase Realtime Database (/activePolls) listener
  useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      unsub = rtdbOnValue(
        rtdbRef(rtdb, 'activePolls'),
        (snap) => {
          const now = Date.now();
          if (snap.exists()) {
            const val = snap.val();
            if (val && typeof val === 'object') {
              const list: NewsPollItem[] = [];
              Object.entries(val).forEach(([key, raw]: [string, any]) => {
                if (!raw || typeof raw !== 'object') return;
                const closesAt = Number(raw.closesAt || raw.endTime || now + 1800000);
                const st = String(raw.status || 'LIVE').toUpperCase();
                if ((st === 'LIVE' || st === 'APPROVED' || st === 'ACTIVE') && closesAt > now) {
                  const userVoteMap = raw.votesByUid || {};
                  const myVoteEntry = user?.uid ? userVoteMap[user.uid] : undefined;
                  list.push({
                    ...raw,
                    pollId: raw.pollId || key,
                    closesAt,
                    status: 'LIVE',
                    userVote: myVoteEntry?.option || raw.userVote || null,
                    userParticipation: myVoteEntry || raw.userParticipation || null
                  } as NewsPollItem);
                }
              });

              if (list.length > 0) {
                // Ensure every one of the 5 categories has at least 1 active question in RTDB
                const defaults = buildDefaultLivePolls(now);
                defaults.forEach((defPoll) => {
                  const hasCat = list.some(
                    (p) => String(p.category || '').trim().toLowerCase() === defPoll.category.toLowerCase()
                  );
                  if (!hasCat) {
                    list.push(defPoll);
                    rtdbSet(rtdbRef(rtdb, `activePolls/${defPoll.pollId}`), {
                      ...defPoll,
                      status: 'APPROVED',
                      endTime: defPoll.closesAt
                    }).catch(() => {});
                  }
                });
                setAllActivePolls(list);
                setLoading(false);
                return;
              }
            }
          }

          // Seed initial live approved polls into /activePolls so RTDB is populated
          const seeded = buildDefaultLivePolls(now);
          setAllActivePolls(seeded);
          setLoading(false);
          seeded.forEach((p) => {
            rtdbSet(rtdbRef(rtdb, `activePolls/${p.pollId}`), {
              ...p,
              status: 'APPROVED',
              endTime: p.closesAt
            }).catch(() => {});
          });
        },
        () => {
          setLoading(false);
        }
      );
    } catch {
      setLoading(false);
    }
    return () => {
      if (unsub) unsub();
    };
  }, [user?.uid]);

  const fetchLivePolls = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const uidParam = user?.uid ? encodeURIComponent(user.uid) : '';
        const res = await fetch(`/api/news-polls/live?uid=${uidParam}&category=all`);
        const text = await res.text();
        if (!text || text.trim().startsWith('<')) return;
        const data = JSON.parse(text);
        if (res.ok && data.success) {
          if (Array.isArray(data.activePolls) && data.activePolls.length > 0) {
            setAllActivePolls((prev) => {
              const mergedMap = new Map<string, NewsPollItem>();
              prev.forEach((p) => mergedMap.set(p.pollId, p));
              data.activePolls.forEach((p: NewsPollItem) => mergedMap.set(p.pollId, p));
              return Array.from(mergedMap.values());
            });
          }
          if (Array.isArray(data.completedPolls)) {
            setCompletedPolls(data.completedPolls);
          }
          if (Array.isArray(data.leaderboard)) {
            setLeaderboard(data.leaderboard);
          }
          if (Array.isArray(data.userSettlements)) {
            syncVerifiedSettlementsWithWallet(data.userSettlements);
          }
        }
      } catch {
        // Silent fallback to RTDB /activePolls
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user?.uid, syncVerifiedSettlementsWithWallet]
  );

  useEffect(() => {
    fetchLivePolls(false);

    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/news-polls/stream');
      es.onmessage = () => {
        fetchLivePolls(true);
      };
    } catch {
      // Fallback to periodic sync
    }

    const syncInterval = setInterval(() => {
      fetchLivePolls(true);
    }, 5000);

    return () => {
      if (es) es.close();
      clearInterval(syncInterval);
    };
  }, [fetchLivePolls]);

  useEffect(() => {
    const ticker = setInterval(() => {
      const current = Date.now();
      setNowMs(current);
      setAllActivePolls((prev) => {
        const hasJustExpired = prev.some((p) => p.closesAt <= current);
        if (hasJustExpired) {
          fetchLivePolls(true);
          return buildDefaultLivePolls(current);
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(ticker);
  }, [fetchLivePolls]);

  const handleParticipate = async (poll: NewsPollItem, option: 'YES' | 'NO') => {
    if (!user) {
      showToast('Please log in to play Live Quiz Battle.', 'info');
      return;
    }
    if (poll.userVote || poll.userParticipation) {
      showToast(
        `Already bet "${poll.userVote}" (₹${poll.userParticipation?.stakeAmount || 0}) on this poll.`,
        'info'
      );
      return;
    }
    if (Date.now() >= poll.closesAt) {
      showToast('Timer ended! Verifying result...', 'info');
      fetchLivePolls(true);
      return;
    }
    const liveU = store.getUser(user.uid) || (user.phone ? store.findUserByPhone(user.phone) : undefined) || user;
    const availableBal = Math.max(liveU?.balance || 0, user.balance || 0);
    if (availableBal < selectedStake) {
      showToast(
        `Insufficient wallet balance (₹${availableBal.toFixed(2)}). Required: ₹${selectedStake}.`,
        'error'
      );
      return;
    }
    if (votingPollId) return;

    playVoteTone(option === 'YES' ? 660 : 480);
    setVotingPollId(poll.pollId);

    try {
      let handledByApi = false;
      try {
        const res = await fetch(`/api/news-polls/${poll.pollId}/participate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            username: user.username,
            option,
            stakeAmount: selectedStake,
            clientBalance: availableBal
          })
        });
        const text = await res.text();
        if (text && !text.trim().startsWith('<')) {
          const data = JSON.parse(text);
          if (res.ok && data.success) {
            handledByApi = true;
            if (data.debitTxId && !store.getTransaction(data.debitTxId)) {
              store.executeWalletTransaction({
                uid: user.uid,
                type: 'bet_placement',
                category: 'debit',
                amount: selectedStake,
                referenceId: poll.pollId,
                transactionId: data.debitTxId,
                description: `Live Quiz (${option}) — ${poll.question.slice(0, 60)}`,
                status: 'completed',
                metadata: {
                  game: 'quiz_battle',
                  pollId: poll.pollId,
                  option,
                  potentialPayout: data.participation?.potentialPayout
                }
              });
            }

            showToast(`Bet Placed: ₹${selectedStake} on ${option}!`, 'success');

            if (data.poll) {
              setAllActivePolls((prev) =>
                prev.map((item) => (item.pollId === poll.pollId ? data.poll : item))
              );
            }
            if (data.leaderboard) {
              setLeaderboard(data.leaderboard);
            }
          }
        }
      } catch {
        // Fallback to direct RTDB + local store participation
      }

      if (!handledByApi) {
        const debitTxId = `tx_quiz_${poll.pollId}_${user.uid}`;
        const projected = calculateProjectedWin(poll, option, selectedStake);
        const txRes = store.executeWalletTransaction({
          uid: user.uid,
          type: 'bet_placement',
          category: 'debit',
          amount: selectedStake,
          referenceId: poll.pollId,
          transactionId: debitTxId,
          description: `Live Quiz (${option}) — ${poll.question.slice(0, 60)}`,
          status: 'completed',
          metadata: {
            game: 'quiz_battle',
            pollId: poll.pollId,
            option,
            potentialPayout: projected
          }
        });

        if (!txRes.success) {
          showToast(txRes.error || 'Failed to place quiz bet', 'error');
          return;
        }

        const nextYesVotes = poll.yesVotes + (option === 'YES' ? 1 : 0);
        const nextNoVotes = poll.noVotes + (option === 'NO' ? 1 : 0);
        const nextTotalVotes = nextYesVotes + nextNoVotes;
        const nextYesPool = (poll.yesPool || 0) + (option === 'YES' ? selectedStake : 0);
        const nextNoPool = (poll.noPool || 0) + (option === 'NO' ? selectedStake : 0);
        const nextTotalPool = nextYesPool + nextNoPool;
        const nextHouseMargin = Math.round(nextTotalPool * HOUSE_MARGIN_RATE * 100) / 100;
        const nextDistributable = Math.round((nextTotalPool - nextHouseMargin) * 100) / 100;

        const participationObj = {
          participationId: debitTxId,
          pollId: poll.pollId,
          uid: user.uid,
          username: user.username,
          option,
          stakeAmount: selectedStake,
          multiplier: BASE_MULTIPLIER,
          potentialPayout: projected,
          debitTxId,
          participatedAt: Date.now(),
          participatedAtIST: new Date().toLocaleString('en-IN'),
          status: 'ACTIVE' as const,
          payoutAmount: 0
        };

        const updatedPoll: NewsPollItem = {
          ...poll,
          yesVotes: nextYesVotes,
          noVotes: nextNoVotes,
          totalVotes: nextTotalVotes,
          yesPool: nextYesPool,
          noPool: nextNoPool,
          totalPool: nextTotalPool,
          houseMarginAmount: nextHouseMargin,
          distributablePool: nextDistributable,
          userVote: option,
          userParticipation: participationObj
        };

        setAllActivePolls((prev) =>
          prev.map((item) => (item.pollId === poll.pollId ? updatedPoll : item))
        );

        await rtdbSet(rtdbRef(rtdb, `activePolls/${poll.pollId}`), {
          ...updatedPoll,
          status: 'APPROVED',
          endTime: updatedPoll.closesAt,
          votesByUid: {
            [user.uid]: participationObj
          }
        }).catch(() => {});

        showToast(`Bet Placed: ₹${selectedStake} on ${option}!`, 'success');
      }
    } finally {
      setVotingPollId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Top Bar with Wallet Balance */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-300 hover:text-white transition text-xs sm:text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
              ₹{(user?.balance ?? 0).toFixed(2)}
            </span>
          </div>

          {onOpenDeposit && (
            <button
              type="button"
              onClick={onOpenDeposit}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition"
            >
              + Deposit
            </button>
          )}
        </div>
      </div>

      {/* Header & Stake Selector */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black text-white">
                  Live Quiz Poll
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black flex items-center space-x-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>LIVE</span>
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-amber-300 font-mono font-bold">
            15% House Margin · 85% Pool Distributed
          </div>
        </div>

        {/* Bet Amount Selector */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-300">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Bet Amount:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {STAKE_PRESETS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setSelectedStake(amt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono border transition ${
                  selectedStake === amt
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View Switcher */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-black border flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'active'
              ? 'bg-indigo-600 text-white border-indigo-400'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Live ({activePolls.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-black border flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white border-indigo-400'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Result ({completedPolls.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leaderboard')}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-black border flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'leaderboard'
              ? 'bg-indigo-600 text-white border-indigo-400'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Winners</span>
        </button>
      </div>

      {/* 5-Category Filter Strip */}
      {(activeTab === 'active' || activeTab === 'history') && (
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            All
          </button>
          {FIVE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* TAB 1: CLEAN LIVE POLL CARDS + LATEST DECLARED RESULTS STRIP */}
      {activeTab === 'active' && (
        <div className="space-y-3.5">
          {/* Prominent Latest Declared Results Strip so users always see poll results immediately */}
          {completedPolls.length > 0 && (
            <div className="bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs sm:text-sm font-black text-white">
                    Declared Poll Results ({completedPolls.length})
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold">
                    Auto-Deletes 2h After Result
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-black text-emerald-400 hover:text-emerald-300 underline"
                >
                  View All Results →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {completedPolls.slice(0, 4).map((rPoll) => {
                  const rOutcome = rPoll.verifiedOutcome === 'NO' ? 'NO' : 'YES';
                  return (
                    <div
                      key={rPoll.pollId}
                      onClick={() => setActiveTab('history')}
                      className="cursor-pointer bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-2.5 flex flex-col justify-between gap-1.5 transition"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {rPoll.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-black border ${
                            rOutcome === 'YES'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          Result: {rOutcome}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug">
                        {rPoll.question}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5 border-t border-slate-800/70">
                        <span>{rPoll.verifiedAtIST || 'Just Declared'}</span>
                        <span className="text-amber-300">
                          DB Delete: {formatDbDeleteCountdown(rPoll, nowMs)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {loading ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
              Loading live questions...
            </div>
          ) : activePolls.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
              No live questions in this category right now.
            </div>
          ) : (
            activePolls.map((poll) => {
              const totalPool = Number(poll.totalPool) || 0;
              const yesPool = Number(poll.yesPool) || 0;
              const noPool = Number(poll.noPool) || 0;
              const distributablePool =
                typeof poll.distributablePool === 'number'
                  ? poll.distributablePool
                  : Math.round(totalPool * (1 - HOUSE_MARGIN_RATE) * 100) / 100;

              const yesPct =
                totalPool > 0
                  ? Math.round((yesPool / totalPool) * 100)
                  : poll.totalVotes > 0
                  ? Math.round((poll.yesVotes / poll.totalVotes) * 100)
                  : 50;
              const noPct = 100 - yesPct;

              const hasParticipated = Boolean(poll.userVote || poll.userParticipation);
              const isExpired = nowMs >= poll.closesAt;

              const estWinYes = calculateProjectedWin(poll, 'YES', selectedStake);
              const estWinNo = calculateProjectedWin(poll, 'NO', selectedStake);

              return (
                <div
                  key={poll.pollId}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 space-y-3.5 transition shadow-lg"
                >
                  {/* Top Row: Category & Timer Only */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
                      {poll.category}
                    </span>

                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{formatCountdown(poll.closesAt, nowMs)}</span>
                    </div>
                  </div>

                  {/* ONLY THE QUESTION (EngHindi) */}
                  <h2 className="text-base sm:text-lg font-black text-white leading-snug">
                    {poll.question}
                  </h2>

                  {/* User's Active Bet Badge (if placed) */}
                  {poll.userParticipation && (
                    <div className="bg-indigo-950/60 border border-indigo-500/40 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                      <span className="flex items-center space-x-1.5 text-slate-200">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>
                          Your Bet:{' '}
                          <strong
                            className={
                              poll.userParticipation.option === 'YES'
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }
                          >
                            {poll.userParticipation.option}
                          </strong>{' '}
                          (₹{poll.userParticipation.stakeAmount.toFixed(0)})
                        </span>
                      </span>
                      <span className="text-emerald-300 font-mono font-bold">
                        Win Pool Share: ₹{poll.userParticipation.potentialPayout.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* YES / NO Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={hasParticipated || isExpired || votingPollId === poll.pollId}
                      onClick={() => handleParticipate(poll, 'YES')}
                      className={`p-3 rounded-xl border font-black text-sm flex flex-col space-y-1 transition ${
                        poll.userVote === 'YES'
                          ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                          : hasParticipated
                          ? 'bg-slate-950/60 border-slate-800 text-slate-400 opacity-75'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/40 text-emerald-300 active:scale-[0.99]'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>YES</span>
                        </span>
                        <span className="font-mono text-xs">{yesPct}%</span>
                      </div>
                      <div className="w-full flex items-center justify-between text-[11px] font-mono opacity-85">
                        <span>{hasParticipated ? `₹${yesPool.toFixed(0)}` : `Bet ₹${selectedStake}`}</span>
                        <span>{hasParticipated ? `${poll.yesVotes} Bets` : `Win ₹${estWinYes.toFixed(0)}`}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={hasParticipated || isExpired || votingPollId === poll.pollId}
                      onClick={() => handleParticipate(poll, 'NO')}
                      className={`p-3 rounded-xl border font-black text-sm flex flex-col space-y-1 transition ${
                        poll.userVote === 'NO'
                          ? 'bg-rose-600/30 border-rose-400 text-rose-200'
                          : hasParticipated
                          ? 'bg-slate-950/60 border-slate-800 text-slate-400 opacity-75'
                          : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/40 text-rose-300 active:scale-[0.99]'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>NO</span>
                        </span>
                        <span className="font-mono text-xs">{noPct}%</span>
                      </div>
                      <div className="w-full flex items-center justify-between text-[11px] font-mono opacity-85">
                        <span>{hasParticipated ? `₹${noPool.toFixed(0)}` : `Bet ₹${selectedStake}`}</span>
                        <span>{hasParticipated ? `${poll.noVotes} Bets` : `Win ₹${estWinNo.toFixed(0)}`}</span>
                      </div>
                    </button>
                  </div>

                  {/* Compact Pool Distribution Bar (After 15% House Margin) */}
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${yesPct}%` }}
                      />
                      <div
                        className="h-full bg-rose-500 transition-all duration-500"
                        style={{ width: `${noPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>YES: ₹{yesPool.toFixed(0)}</span>
                      <span className="text-amber-300 font-bold">
                        Win Pool (85%): ₹{distributablePool.toFixed(0)}
                      </span>
                      <span>NO: ₹{noPool.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: RESOLVED RESULTS (AUTOMATICALLY DELETED FROM DB 2 HOURS AFTER RESULT) */}
      {activeTab === 'history' && (
        <div className="space-y-3.5">
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-300 font-bold">
              Declared Poll Results (Visible for 2 Hours After Result)
            </span>
            <span className="text-amber-300 font-mono font-bold">
              Auto-purged from entire database after 2h
            </span>
          </div>

          {completedPolls.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
              No completed polls in the last 2 hours.
            </div>
          ) : (
            completedPolls.map((poll) => {
              const outcome = poll.verifiedOutcome === 'NO' ? 'NO' : 'YES';
              const userPart = poll.userParticipation;

              return (
                <div
                  key={poll.pollId}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold">
                        {poll.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Declared: {poll.verifiedAtIST || poll.closesAtIST}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold">
                        DB Delete in: {formatDbDeleteCountdown(poll, nowMs)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-black border ${
                          outcome === 'YES'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        Result: {outcome}
                      </span>
                    </div>
                  </div>

                  {/* QUESTION */}
                  <h3 className="text-base font-bold text-white">{poll.question}</h3>

                  {poll.verificationEvidence && (
                    <div className="text-xs text-slate-300 bg-slate-950/70 border border-slate-800/80 rounded-xl px-3 py-2">
                      <span className="text-emerald-400 font-bold">Verified Outcome: </span>
                      {poll.verificationEvidence}
                    </div>
                  )}

                  {userPart && (
                    <div
                      className={`rounded-xl px-3 py-2 border text-xs flex items-center justify-between ${
                        userPart.status === 'WON'
                          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                          : userPart.status === 'REFUNDED_VOID'
                          ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>
                        Bet: <strong>{userPart.option}</strong> (₹{userPart.stakeAmount.toFixed(0)})
                      </span>
                      <span className="font-mono font-black">
                        {userPart.status === 'WON'
                          ? `WON +₹${(userPart.payoutAmount || 0).toFixed(2)}`
                          : userPart.status === 'REFUNDED_VOID'
                          ? `REFUNDED +₹${(userPart.payoutAmount || 0).toFixed(2)}`
                          : 'LOST'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Total Pool: ₹{(poll.totalPool || 0).toFixed(0)}</span>
                    <span className="text-emerald-400 font-bold">
                      Distributed (85%): ₹
                      {((poll.totalRewardsPaid || 0) + (poll.totalRefundsPaid || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No winners yet. Place a YES or NO bet on any live question!
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.uid}
                  className="p-3.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-7 h-7 rounded-lg font-black flex items-center justify-center ${
                        idx === 0
                          ? 'bg-amber-500 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">
                        {entry.username}
                        {user?.uid === entry.uid && (
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {entry.totalVotes} Bets · {entry.winsCount || 0} Wins
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-sm font-black text-emerald-400">
                      ₹{(entry.totalWon || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
