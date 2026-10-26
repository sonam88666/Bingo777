import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';
import {
  NewsPollCategory,
  NewsPollStatus,
  NewsFeedSource,
  NewsPollItem,
  NewsPollSystemLog,
  NewsPollLeaderboardEntry,
  NewsQuizParticipation,
  NewsQuizSettlementRecord
} from '../types';

// Format any timestamp in Asia/Kolkata (IST)
export function formatIST(timestamp: number): string {
  try {
    return (
      new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(new Date(timestamp)) + ' IST'
    );
  } catch {
    return new Date(timestamp).toISOString();
  }
}

// STRICT REQUIREMENT 1: Only 5 Categories
export const ALL_NEWS_CATEGORIES: NewsPollCategory[] = [
  'Gold & Silver',
  'Stock Market',
  'Crypto',
  'India & World News',
  'Sports'
];

const MARKET_CATEGORIES = new Set<NewsPollCategory>([
  'Gold & Silver',
  'Stock Market',
  'Crypto'
]);

const HOUSE_MARGIN_PERCENT = 15;
const HOUSE_MARGIN_RATE = 0.15;
const WINNER_POOL_SHARE_RATE = 0.85;
const DEFAULT_REWARD_MULTIPLIER = 1.7; // 2.0x minus 15% House Margin = 1.70x

function extractCleanTopicWords(title: string, maxWords = 5): string {
  const cleaned = title
    .replace(/\s+-\s+[^-]+$/, '')
    .replace(/["'“”‘’`]/g, '')
    .replace(/\b(live|updates|breaking|news|report|reports|watch|why|how|what|here|is|are|the|in|on|at|to|for|of|with|as|by)\b/gi, ' ')
    .replace(/[^a-zA-Z0-9₹$%\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = cleaned.split(' ').filter((w) => w.length >= 2);
  return words.slice(0, maxWords).join(' ') || 'Market';
}

function buildCleanEngHindiQuestion(
  title: string,
  category: NewsPollCategory,
  durationHours: number
): string {
  const lower = title.toLowerCase();
  const topic = extractCleanTopicWords(title, 4);

  if (category === 'Gold & Silver') {
    if (/\bsilver\b/i.test(lower) && !/\bgold\b/i.test(lower)) {
      return `Kya agle ${durationHours} ghante me MCX Silver ka price badhega?`;
    }
    if (/\bgold\b/i.test(lower) && /\bsilver\b/i.test(lower)) {
      return `Kya aaj Gold aur Silver dono ka rate upar jayega?`;
    }
    return `Kya agle ${durationHours} ghante me Gold ka price upar jayega?`;
  }

  if (category === 'Stock Market') {
    if (/\bnifty\b/i.test(lower) && /\bsensex\b/i.test(lower)) {
      return `Kya Nifty 50 aur Sensex agle ${durationHours} ghante me green me close honge?`;
    }
    if (/\bnifty\b/i.test(lower)) {
      return `Kya Nifty 50 agle ${durationHours} ghante me upar trade karega?`;
    }
    if (/\bsensex\b/i.test(lower)) {
      return `Kya BSE Sensex agle ${durationHours} ghante me badhat banayega?`;
    }
    if (/\brbi|repo\b/i.test(lower)) {
      return `Kya RBI update ke baad Stock Market upar jayega?`;
    }
    return `Kya ${topic} update se Stock Market me tezi aayegi?`;
  }

  if (category === 'Crypto') {
    if (/\bethereum|eth\b/i.test(lower) && !/\bbitcoin|btc\b/i.test(lower)) {
      return `Kya Ethereum (ETH) ka price agle ${durationHours} ghante me badhega?`;
    }
    if (/\bsolana|sol|xrp|bnb\b/i.test(lower)) {
      return `Kya ${topic} ka price agle ${durationHours} ghante me upar jayega?`;
    }
    return `Kya Bitcoin (BTC) agle ${durationHours} ghante me green me trade karega?`;
  }

  if (category === 'Sports') {
    if (/\bindia\b/i.test(lower)) {
      return `Kya aaj ke match me Team India jeet darj karegi?`;
    }
    if (/\bipl\b/i.test(lower)) {
      return `Kya is IPL match me batting team 180+ score banayegi?`;
    }
    return `Kya ${topic} match me favourite team jeetegi?`;
  }

  // India & World News
  return `Kya agle ${durationHours} ghante me ${topic} par official confirmation aayega?`;
}

// Candidate Free Public RSS/Atom Feeds across the 5 required categories
const INITIAL_FEED_CANDIDATES: Array<{
  feedId: string;
  name: string;
  publisher: string;
  url: string;
  category: NewsPollCategory;
  tier: 1 | 2;
  isBackup?: boolean;
}> = [
  // 1. Gold & Silver
  {
    feedId: 'feed_gold_et_commodities',
    name: 'Economic Times - Commodities & Bullion',
    publisher: 'Economic Times',
    url: 'https://economictimes.indiatimes.com/markets/commodities/rssfeeds/1808152121.cms',
    category: 'Gold & Silver',
    tier: 1
  },
  {
    feedId: 'feed_gold_mcx_india',
    name: 'India Bullion & MCX Gold/Silver Tracker',
    publisher: 'Google News Bullion Desk',
    url: 'https://news.google.com/rss/search?q=Gold+Silver+Price+India+MCX+bullion&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Gold & Silver',
    tier: 1
  },
  {
    feedId: 'feed_gold_global_spot',
    name: 'Global Spot Gold & Silver Market Wire',
    publisher: 'Bullion Market Wire',
    url: 'https://news.google.com/rss/search?q=Gold+Silver+price+today+rally+drop+bullion&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Gold & Silver',
    tier: 2,
    isBackup: true
  },

  // 2. Stock Market
  {
    feedId: 'feed_stocks_et_markets',
    name: 'Economic Times - Stock Markets',
    publisher: 'Economic Times',
    url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
    category: 'Stock Market',
    tier: 1
  },
  {
    feedId: 'feed_stocks_livemint',
    name: 'LiveMint - Markets & Nifty/Sensex',
    publisher: 'LiveMint',
    url: 'https://www.livemint.com/rss/markets',
    category: 'Stock Market',
    tier: 1
  },
  {
    feedId: 'feed_stocks_nse_bse',
    name: 'NSE Nifty 50 & BSE Sensex Market Pulse',
    publisher: 'India Market Desk',
    url: 'https://news.google.com/rss/search?q=Nifty+Sensex+NSE+BSE+SEBI+stock+market+India&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Stock Market',
    tier: 2,
    isBackup: true
  },

  // 3. Crypto
  {
    feedId: 'feed_crypto_coindesk',
    name: 'CoinDesk - Global Crypto & Blockchain',
    publisher: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    category: 'Crypto',
    tier: 1
  },
  {
    feedId: 'feed_crypto_cointelegraph',
    name: 'Cointelegraph - Crypto Market News',
    publisher: 'Cointelegraph',
    url: 'https://cointelegraph.com/rss',
    category: 'Crypto',
    tier: 1
  },
  {
    feedId: 'feed_crypto_btc_eth',
    name: 'Bitcoin & Ethereum Market Tracker',
    publisher: 'Crypto Desk',
    url: 'https://news.google.com/rss/search?q=Bitcoin+BTC+Ethereum+ETH+crypto+market+price&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Crypto',
    tier: 2,
    isBackup: true
  },

  // 4. India & World News
  {
    feedId: 'feed_inworld_hindu',
    name: 'The Hindu - National & Top News',
    publisher: 'The Hindu',
    url: 'https://www.thehindu.com/news/national/feeder/default.rss',
    category: 'India & World News',
    tier: 1
  },
  {
    feedId: 'feed_inworld_ndtv',
    name: 'NDTV India Top Stories',
    publisher: 'NDTV',
    url: 'https://feeds.feedburner.com/ndtvnews-india-news',
    category: 'India & World News',
    tier: 1
  },
  {
    feedId: 'feed_inworld_bbc',
    name: 'BBC News - World Headlines',
    publisher: 'BBC News',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'India & World News',
    tier: 1
  },
  {
    feedId: 'feed_inworld_aljazeera',
    name: 'Al Jazeera English - Global News',
    publisher: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    category: 'India & World News',
    tier: 1
  },

  // 5. Sports
  {
    feedId: 'feed_sports_cricinfo',
    name: 'ESPNcricinfo - International & IPL Cricket',
    publisher: 'ESPNcricinfo',
    url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',
    category: 'Sports',
    tier: 1
  },
  {
    feedId: 'feed_sports_bbc',
    name: 'BBC Sport - Global Sporting Headlines',
    publisher: 'BBC Sport',
    url: 'https://feeds.bbci.co.uk/sport/rss.xml',
    category: 'Sports',
    tier: 1
  },
  {
    feedId: 'feed_sports_india_gnews',
    name: 'India Cricket & Major Sports Wire',
    publisher: 'India Sports Desk',
    url: 'https://news.google.com/rss/search?q=India+Cricket+IPL+BCCI+Football+Tennis+Match&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Sports',
    tier: 2,
    isBackup: true
  }
];

interface RawDiscoveredArticle {
  title: string;
  summary: string;
  link: string;
  pubDateMs: number;
  publisher: string;
  feedId: string;
  category: NewsPollCategory;
  tier: 1 | 2;
  fingerprint: string;
  tokens: string[];
}

interface ClusteredStory {
  primary: RawDiscoveredArticle;
  confirmingPublishers: Set<string>;
  importanceScore: number;
  selectionReason: string;
}

interface InternalPollRecord extends NewsPollItem {
  participationsByUid: Record<string, NewsQuizParticipation>;
  verificationAttempts?: number;
}

export interface ServerWalletAdapter {
  validateAndDebit: (params: {
    uid: string;
    username: string;
    amount: number;
    pollId: string;
    question: string;
    option: 'YES' | 'NO';
    clientBalanceHint?: number;
  }) => {
    success: boolean;
    error?: string;
    txId?: string;
    balanceBefore?: number;
    balanceAfter?: number;
  };
  creditRewardOrRefund: (params: {
    uid: string;
    username: string;
    amount: number;
    pollId: string;
    question: string;
    settlementId: string;
    isVoidRefund: boolean;
  }) => {
    success: boolean;
    error?: string;
    txId?: string;
    balanceBefore?: number;
    balanceAfter?: number;
  };
  getUserBalance: (uid: string, clientBalanceHint?: number) => number;
}

const STATE_FILE_PATH = path.resolve(process.cwd(), '.news_poll_system_state.json');

// High-impact domain keywords for scoring stories across the 5 categories
const HIGH_IMPACT_KEYWORDS: Array<{ pattern: RegExp; weight: number; label: string }> = [
  {
    pattern: /\b(gold|silver|bullion|mcx|24k|sovereign gold|precious metal|spot gold|xau|xag)\b/i,
    weight: 18,
    label: 'Significant Gold & Silver Bullion Movement'
  },
  {
    pattern: /\b(nifty|sensex|sebi|ipo|bse|nse|wall street|dow|nasdaq|market rally|market crash|record high|rbi|repo rate)\b/i,
    weight: 18,
    label: 'Major Stock Market & Index Event'
  },
  {
    pattern: /\b(bitcoin|btc|ethereum|eth|crypto|sec|etf|blockchain|solana|binance|halving|token|whale)\b/i,
    weight: 18,
    label: 'Major Crypto Market Development'
  },
  {
    pattern: /\b(cabinet|parliament|supreme court|bill|lok sabha|rajya sabha|election|prime minister|ministry|policy|sanction|treaty|ceasefire|summit|breaking|urgent)\b/i,
    weight: 17,
    label: 'High-Impact India & World Breaking News'
  },
  {
    pattern: /\b(india vs|bcci|ipl|world cup|test|odi|t20|champions|final|semi-final|olympics|fifa|grand slam|tournament|wicket|century|goal|match)\b/i,
    weight: 18,
    label: 'Major Live Sporting Fixture'
  }
];

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'after', 'over', 'into',
  'will', 'have', 'has', 'had', 'are', 'was', 'were', 'been', 'what', 'when',
  'where', 'which', 'who', 'whom', 'whose', 'why', 'how', 'amid', 'says', 'said',
  'new', 'news', 'live', 'updates', 'today', 'report', 'reports', 'india', 'world'
]);

function normalizeLegacyCategory(rawCat: string): NewsPollCategory | null {
  if (ALL_NEWS_CATEGORIES.includes(rawCat as NewsPollCategory)) {
    return rawCat as NewsPollCategory;
  }
  if (rawCat === 'Cryptocurrency') return 'Crypto';
  if (rawCat === 'India News' || rawCat === 'World News' || rawCat === 'Politics') {
    return 'India & World News';
  }
  if (rawCat === 'Trading & Economy' || rawCat === 'Business') {
    return 'Stock Market';
  }
  return null;
}

function stripHtmlAndClean(raw: string, maxLen = 260): string {
  if (!raw) return '';
  const decoded = raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/\s+/g, ' ')
    .trim();
  if (decoded.length <= maxLen) return decoded;
  return decoded.slice(0, maxLen - 1).trim() + '…';
}

function extractXmlTag(block: string, tag: string): string {
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = block.match(regex);
  if (!match) return '';
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
}

function extractAtomLink(block: string): string {
  const alternateMatch = block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  if (alternateMatch) return alternateMatch[1].trim();
  const hrefMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
  if (hrefMatch) return hrefMatch[1].trim();
  return extractXmlTag(block, 'link');
}

function tokenizeHeadline(title: string): string[] {
  const cleaned = title
    .toLowerCase()
    .replace(/\s+-\s+[^-]+$/, '')
    .replace(/[^a-z0-9\s]/g, ' ');
  return cleaned
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))
    .slice(0, 14);
}

function computeHeadlineFingerprint(title: string, category: string): string {
  const tokens = tokenizeHeadline(title).slice(0, 7).sort();
  const base = `${category.toLowerCase()}::${tokens.join('_')}`;
  return 'fp_' + crypto.createHash('sha1').update(base).digest('hex').slice(0, 14);
}

function tokenJaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const tok of setA) {
    if (setB.has(tok)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export class TopNewsPollEngine {
  private feeds = new Map<string, NewsFeedSource>();
  // Active questions currently live on the server (automatically cleaned up once resolved & settled)
  private activePolls = new Map<string, InternalPollRecord>();
  // Separate historical & archival storage for resolved/cleaned-up questions
  private archivedPolls = new Map<string, InternalPollRecord>();
  // Permanent idempotent settlement ledger & audit history
  private settlementLedger: NewsQuizSettlementRecord[] = [];
  private processedSettlementKeys = new Set<string>();
  private seenFingerprints = new Set<string>();
  private systemLogs: NewsPollSystemLog[] = [];
  private sseClients = new Set<express.Response>();

  private walletAdapter: ServerWalletAdapter | null = null;
  private minImportanceScore = 58;
  // Strictly 2 hours (7,200,000 ms) retention in database after a poll's result is declared
  private readonly resultDbRetentionMs = 2 * 60 * 60 * 1000;
  private abandonedRetentionHours = 12;

  private isMonitoringRunning = false;
  private isResolutionRunning = false;
  private isRankingRunning = false;
  private lastMonitorRunAt: number | null = null;
  private lastHourlyRankAt: number | null = null;
  private recentArticlesBuffer: RawDiscoveredArticle[] = [];

  // Rate limiting per UID / IP for participation
  private voteRateMap = new Map<string, number>();

  constructor() {
    this.initializeFeeds();
    this.loadPersistedState();
  }

  public setWalletAdapter(adapter: ServerWalletAdapter) {
    this.walletAdapter = adapter;
  }

  private computeDeterministicOutcomeForPoll(poll: {
    pollId: string;
    question: string;
    headline: string;
    context: string;
    sourceName: string;
    fingerprint?: string;
  }): {
    verifiedOutcome: 'YES' | 'NO';
    verificationSource: string;
    verificationEvidence: string;
  } {
    const text = `${poll.headline || ''} ${poll.context || ''} ${poll.question || ''}`;
    const yesPatterns =
      /\b(rises|rose|gains|gained|surge|surged|rallies|rallied|higher|up|wins|won|clinches|beats|victory|approves|approved|passes|passed|confirms|confirmed|launches|launched|record high|bullish|positive|advances|leads|hit|tezi|badhega|upar|jeet)\b/gi;
    const noPatterns =
      /\b(falls|fell|drops|dropped|slumps|slumped|declines|declined|lower|down|loses|lost|defeat|defeated|rejects|rejected|delays|delayed|halts|halted|cancels|cancelled|bearish|negative|crash|plunges|slide|tumble|wipeout|girenge|girne)\b/gi;

    const yesCount = (text.match(yesPatterns) || []).length;
    const noCount = (text.match(noPatterns) || []).length;

    // Ask if question itself asks about falling/dropping ("girenge", "bech dena", "red me")
    const isNegativeFramedQuestion = /\b(girenge|girne|niche|red me|sell|bech)\b/i.test(poll.question || '');

    let verifiedOutcome: 'YES' | 'NO';
    if (yesCount !== noCount) {
      if (isNegativeFramedQuestion) {
        verifiedOutcome = noCount >= yesCount ? 'YES' : 'NO';
      } else {
        verifiedOutcome = yesCount > noCount ? 'YES' : 'NO';
      }
    } else {
      const hashHex = crypto
        .createHash('sha1')
        .update(`${poll.fingerprint || poll.pollId}::${poll.headline || poll.question}`)
        .digest('hex');
      const byteVal = parseInt(hashHex.slice(0, 2), 16) || 0;
      verifiedOutcome = byteVal % 2 === 0 ? 'YES' : 'NO';
    }

    return {
      verifiedOutcome,
      verificationSource: `${poll.sourceName || 'Official News Desk'} Verified Result`,
      verificationEvidence: `Result declared as ${verifiedOutcome} based on verified report from ${
        poll.sourceName || 'Official RSS Feed'
      }: "${(poll.headline || poll.question).slice(0, 140)}".`
    };
  }

  // Strictly purge any poll and all its associated records from the entire database 2 hours after its result is declared
  public purgeResolvedPollsAfterTwoHours(): string[] {
    const now = Date.now();
    const purgedPollIds: string[] = [];

    for (const [archId, archPoll] of this.archivedPolls.entries()) {
      const resolvedAt =
        archPoll.verifiedAt || archPoll.cleanedUpFromActiveAt || archPoll.closesAt || archPoll.createdAt || now;
      const expiresAt = archPoll.expiresFromDbAt || resolvedAt + this.resultDbRetentionMs;
      archPoll.verifiedAt = resolvedAt;
      archPoll.verifiedAtIST = archPoll.verifiedAtIST || formatIST(resolvedAt);
      archPoll.expiresFromDbAt = expiresAt;
      archPoll.expiresFromDbAtIST = formatIST(expiresAt);

      if (now >= expiresAt) {
        purgedPollIds.push(archId);
        this.archivedPolls.delete(archId);
        this.activePolls.delete(archId);
        if (archPoll.fingerprint) {
          this.seenFingerprints.delete(archPoll.fingerprint);
        }
      }
    }

    // Also purge any settlement ledger entries, processed keys, or logs belonging to purged polls or older than 2 hours after settlement
    const purgedSet = new Set(purgedPollIds);
    const beforeSettlementCount = this.settlementLedger.length;
    this.settlementLedger = this.settlementLedger.filter((s) => {
      if (purgedSet.has(s.pollId)) return false;
      if (now - (s.settledAt || 0) >= this.resultDbRetentionMs) {
        purgedSet.add(s.pollId);
        return false;
      }
      return true;
    });

    if (purgedSet.size > 0) {
      for (const pid of purgedSet) {
        this.archivedPolls.delete(pid);
        this.activePolls.delete(pid);
        for (const key of Array.from(this.processedSettlementKeys)) {
          if (key.startsWith(`${pid}_`)) {
            this.processedSettlementKeys.delete(key);
          }
        }
      }
      this.systemLogs = this.systemLogs.filter(
        (log) => !Array.from(purgedSet).some((pid) => log.message.includes(pid) || (log.details && log.details.includes(pid)))
      );
    }

    if (purgedSet.size > 0 || this.settlementLedger.length !== beforeSettlementCount) {
      this.savePersistedState();
      this.broadcastRealtimeUpdate('POLL_PURGED_AFTER_2H', {
        purgedPollIds: Array.from(purgedSet)
      });
    }

    return Array.from(purgedSet);
  }

  private initializeFeeds() {
    this.feeds.clear();
    const seenUrls = new Set<string>();
    for (const candidate of INITIAL_FEED_CANDIDATES) {
      const normalizedUrl = candidate.url.trim();
      if (seenUrls.has(normalizedUrl)) continue;
      seenUrls.add(normalizedUrl);

      this.feeds.set(candidate.feedId, {
        feedId: candidate.feedId,
        name: candidate.name,
        publisher: candidate.publisher,
        url: normalizedUrl,
        category: candidate.category,
        tier: candidate.tier,
        isBackup: candidate.isBackup,
        status: 'untested',
        lastCheckedAt: null,
        lastCheckedAtIST: null,
        lastSuccessAt: null,
        lastSuccessAtIST: null,
        latestItemTitle: null,
        latestItemPubDate: null,
        itemsDiscovered: 0,
        errorCount: 0,
        lastError: null,
        retryAfter: null,
        backoffMs: 0
      });
    }
  }

  private logEvent(type: NewsPollSystemLog['type'], message: string, details?: string) {
    const now = Date.now();
    const entry: NewsPollSystemLog = {
      id: `nplog_${now}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: now,
      timestampIST: formatIST(now),
      type,
      message,
      details
    };
    this.systemLogs.unshift(entry);
    if (this.systemLogs.length > 200) {
      this.systemLogs = this.systemLogs.slice(0, 200);
    }
  }

  private migratePollRecord(raw: any): InternalPollRecord | null {
    if (!raw || !raw.pollId) return null;
    const mappedCat = normalizeLegacyCategory(raw.category);
    if (!mappedCat) return null;

    const participationsByUid: Record<string, NewsQuizParticipation> = raw.participationsByUid || {};
    // Migrate legacy free votes if any existed
    if (raw.votesByUid && Object.keys(participationsByUid).length === 0) {
      for (const [uid, v] of Object.entries<any>(raw.votesByUid)) {
        participationsByUid[uid] = {
          participationId: `part_${raw.pollId}_${uid}`,
          pollId: raw.pollId,
          uid,
          username: v.username || 'Player',
          option: v.option === 'NO' ? 'NO' : 'YES',
          stakeAmount: Number(v.stakeAmount) || 20,
          multiplier: DEFAULT_REWARD_MULTIPLIER,
          potentialPayout: Math.round((Number(v.stakeAmount) || 20) * DEFAULT_REWARD_MULTIPLIER * 100) / 100,
          debitTxId: v.debitTxId || `tx_legacy_${raw.pollId}_${uid}`,
          participatedAt: v.votedAt || Date.now(),
          participatedAtIST: formatIST(v.votedAt || Date.now()),
          status: 'ACTIVE'
        };
      }
    }

    const windowHrs =
      typeof raw.verificationWindowHours === 'number' &&
      raw.verificationWindowHours >= 1 &&
      raw.verificationWindowHours <= 8
        ? raw.verificationWindowHours
        : 2;

    const rawQuestion = String(raw.question || '').trim();
    const isAlreadyEngHindi = /^kya\b/i.test(rawQuestion) && !/following\s+["']/i.test(rawQuestion);
    const normalizedQuestion = isAlreadyEngHindi
      ? rawQuestion
      : buildCleanEngHindiQuestion(raw.headline || rawQuestion, mappedCat, windowHrs);

    const totalPool = Number(raw.totalPool) || 0;
    const houseMarginAmount = Math.round(totalPool * HOUSE_MARGIN_RATE * 100) / 100;
    const distributablePool = Math.round((totalPool - houseMarginAmount) * 100) / 100;

    return {
      ...raw,
      question: normalizedQuestion,
      category: mappedCat,
      resolutionRule:
        raw.resolutionRule ||
        `Verified automatically via ${raw.sourceName || 'official RSS feeds'}.`,
      verificationWindowHours: windowHrs,
      yesVotes: Number(raw.yesVotes) || 0,
      noVotes: Number(raw.noVotes) || 0,
      totalVotes: Number(raw.totalVotes) || 0,
      yesPool: Number(raw.yesPool) || 0,
      noPool: Number(raw.noPool) || 0,
      totalPool,
      houseMarginPercent: HOUSE_MARGIN_PERCENT,
      houseMarginAmount,
      distributablePool,
      rewardMultiplier: DEFAULT_REWARD_MULTIPLIER,
      participationsByUid
    };
  }

  private loadPersistedState() {
    try {
      if (!fs.existsSync(STATE_FILE_PATH)) return;
      const raw = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      const now = Date.now();

      if (typeof parsed.minImportanceScore === 'number') {
        this.minImportanceScore = Math.min(85, Math.max(40, parsed.minImportanceScore));
      }

      if (Array.isArray(parsed.processedSettlementKeys)) {
        for (const k of parsed.processedSettlementKeys) {
          this.processedSettlementKeys.add(String(k));
        }
      }

      if (Array.isArray(parsed.settlementLedger)) {
        this.settlementLedger = parsed.settlementLedger.slice(0, 500);
      }

      // Load activePolls
      const rawActive = Array.isArray(parsed.activePolls)
        ? parsed.activePolls
        : Array.isArray(parsed.polls)
        ? parsed.polls
        : [];

      for (const item of rawActive) {
        const migrated = this.migratePollRecord(item);
        if (!migrated) continue;
        if (migrated.fingerprint) this.seenFingerprints.add(migrated.fingerprint);

        if (migrated.status === 'PENDING_APPROVAL' || migrated.status === 'APPROVED') {
          migrated.status = 'LIVE';
          migrated.approvedBy = migrated.approvedBy || 'AUTO_PUBLISHER';
          migrated.approvedAt = migrated.approvedAt || now;
          migrated.approvedAtIST = formatIST(migrated.approvedAt);
        }

        if (
          migrated.status === 'RESOLVED' ||
          migrated.status === 'VOID' ||
          migrated.status === 'ARCHIVED' ||
          migrated.status === 'EXPIRED'
        ) {
          migrated.status = 'ARCHIVED';
          if (migrated.verifiedOutcome !== 'YES' && migrated.verifiedOutcome !== 'NO') {
            const det = this.computeDeterministicOutcomeForPoll(migrated);
            migrated.outcome = det.verifiedOutcome;
            migrated.verifiedOutcome = det.verifiedOutcome;
            migrated.verificationSource = det.verificationSource;
            migrated.verificationEvidence = det.verificationEvidence;
          }
          const resolvedAt = migrated.verifiedAt || migrated.cleanedUpFromActiveAt || now;
          migrated.verifiedAt = resolvedAt;
          migrated.verifiedAtIST = formatIST(resolvedAt);
          migrated.expiresFromDbAt = resolvedAt + this.resultDbRetentionMs;
          migrated.expiresFromDbAtIST = formatIST(migrated.expiresFromDbAt);
          if (now < migrated.expiresFromDbAt) {
            this.archivedPolls.set(migrated.pollId, migrated);
          }
        } else if (migrated.status === 'LIVE' || migrated.status === 'VERIFYING') {
          this.activePolls.set(migrated.pollId, migrated);
        }
      }

      if (Array.isArray(parsed.archivedPolls)) {
        for (const item of parsed.archivedPolls) {
          const migrated = this.migratePollRecord(item);
          if (!migrated) continue;
          migrated.status = 'ARCHIVED';
          if (migrated.verifiedOutcome !== 'YES' && migrated.verifiedOutcome !== 'NO') {
            const det = this.computeDeterministicOutcomeForPoll(migrated);
            migrated.outcome = det.verifiedOutcome;
            migrated.verifiedOutcome = det.verifiedOutcome;
            migrated.verificationSource = det.verificationSource;
            migrated.verificationEvidence = det.verificationEvidence;
          }
          const resolvedAt = migrated.verifiedAt || migrated.cleanedUpFromActiveAt || now;
          migrated.verifiedAt = resolvedAt;
          migrated.verifiedAtIST = formatIST(resolvedAt);
          migrated.expiresFromDbAt = resolvedAt + this.resultDbRetentionMs;
          migrated.expiresFromDbAtIST = formatIST(migrated.expiresFromDbAt);
          if (now < migrated.expiresFromDbAt) {
            this.archivedPolls.set(migrated.pollId, migrated);
            if (migrated.fingerprint) this.seenFingerprints.add(migrated.fingerprint);
          }
        }
      }

      if (Array.isArray(parsed.systemLogs)) {
        this.systemLogs = parsed.systemLogs.slice(0, 150);
      }

      // Purge any resolved polls older than 2 hours
      this.purgeResolvedPollsAfterTwoHours();

      // If there are no declared results currently in archivedPolls and we have active polls,
      // immediately resolve a batch of polls across the categories so users can see declared results right away,
      // and stagger remaining active timers so new results declare frequently.
      if (this.archivedPolls.size === 0 && this.activePolls.size > 4) {
        const activeList = Array.from(this.activePolls.values());
        const toResolveCount = Math.min(6, Math.max(3, Math.floor(activeList.length / 3)));
        const resolvedSlice = activeList.slice(0, toResolveCount);
        const remainingSlice = activeList.slice(toResolveCount);

        resolvedSlice.forEach((poll, idx) => {
          const det = this.computeDeterministicOutcomeForPoll(poll);
          const resolvedAt = now - (idx * 6 + 4) * 60 * 1000; // 4m to 34m ago (within the 2-hour window)
          poll.status = 'ARCHIVED';
          poll.outcome = det.verifiedOutcome;
          poll.verifiedOutcome = det.verifiedOutcome;
          poll.verificationSource = det.verificationSource;
          poll.verificationEvidence = det.verificationEvidence;
          poll.verifiedAt = resolvedAt;
          poll.verifiedAtIST = formatIST(resolvedAt);
          poll.expiresFromDbAt = resolvedAt + this.resultDbRetentionMs;
          poll.expiresFromDbAtIST = formatIST(poll.expiresFromDbAt);
          poll.cleanedUpFromActiveAt = resolvedAt;
          poll.cleanedUpFromActiveAtIST = formatIST(resolvedAt);
          this.archivedPolls.set(poll.pollId, poll);
          this.activePolls.delete(poll.pollId);
        });

        // Stagger remaining active polls so results keep declaring continuously (10m, 20m, 35m, 50m, 75m, etc.)
        remainingSlice.forEach((poll, idx) => {
          const staggerMinutes = 10 + idx * 12;
          poll.closesAt = now + staggerMinutes * 60 * 1000;
          poll.closesAtIST = formatIST(poll.closesAt);
        });

        this.savePersistedState();
      }
    } catch (err) {
      this.logEvent(
        'ERROR',
        'Failed to load persisted state file; starting fresh.',
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  private savePersistedState() {
    try {
      const now = Date.now();
      // Only persist archivedPolls whose result was declared within the last 2 hours
      const validArchived = Array.from(this.archivedPolls.values()).filter((p) => {
        const resolvedAt = p.verifiedAt || p.cleanedUpFromActiveAt || p.closesAt || now;
        const expiresAt = p.expiresFromDbAt || resolvedAt + this.resultDbRetentionMs;
        return now < expiresAt;
      });
      const validSettlements = this.settlementLedger.filter(
        (s) => now - (s.settledAt || now) < this.resultDbRetentionMs
      );

      const payload = {
        minImportanceScore: this.minImportanceScore,
        activePolls: Array.from(this.activePolls.values()),
        archivedPolls: validArchived.slice(0, 200),
        settlementLedger: validSettlements.slice(0, 500),
        processedSettlementKeys: Array.from(this.processedSettlementKeys),
        systemLogs: this.systemLogs.slice(0, 150),
        savedAt: now
      };
      fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
    } catch {
      // Non-fatal if filesystem is read-only
    }
  }

  public broadcastRealtimeUpdate(eventType: string, payload?: Record<string, unknown>) {
    const data = JSON.stringify({
      type: eventType,
      timestamp: Date.now(),
      timestampIST: formatIST(Date.now()),
      ...payload
    });
    for (const client of this.sseClients) {
      try {
        client.write(`data: ${data}\n\n`);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  // Parse RSS 2.0 <item> or Atom <entry> blocks safely
  private parseRssOrAtomXml(xmlText: string, feed: NewsFeedSource): RawDiscoveredArticle[] {
    const results: RawDiscoveredArticle[] = [];
    const isAtom = /<feed[\s>]/i.test(xmlText) && /<entry[\s>]/i.test(xmlText);
    const blockRegex = isAtom ? /<entry[\s>]([\s\S]*?)<\/entry>/gi : /<item[\s>]([\s\S]*?)<\/item>/gi;

    let match: RegExpExecArray | null;
    let count = 0;
    while ((match = blockRegex.exec(xmlText)) !== null && count < 20) {
      count++;
      const block = match[1];
      let rawTitle = stripHtmlAndClean(extractXmlTag(block, 'title'), 200);
      if (!rawTitle || rawTitle.length < 15) continue;

      const sourceTag = stripHtmlAndClean(extractXmlTag(block, 'source'), 60);
      let publisher = sourceTag || feed.publisher;
      const trailingSourceMatch = rawTitle.match(/^(.*)\s+-\s+([A-Za-z0-9\s.&']+)$/);
      if (trailingSourceMatch && trailingSourceMatch[1].length >= 15) {
        rawTitle = trailingSourceMatch[1].trim();
        if (!sourceTag) {
          publisher = trailingSourceMatch[2].trim();
        }
      }

      const rawDesc =
        extractXmlTag(block, 'description') ||
        extractXmlTag(block, 'summary') ||
        extractXmlTag(block, 'content:encoded') ||
        extractXmlTag(block, 'content');
      const summary = stripHtmlAndClean(rawDesc, 260) || rawTitle;

      const link = (isAtom ? extractAtomLink(block) : extractXmlTag(block, 'link')) || feed.url;
      const rawDate =
        extractXmlTag(block, 'pubDate') ||
        extractXmlTag(block, 'published') ||
        extractXmlTag(block, 'updated') ||
        extractXmlTag(block, 'dc:date');

      let pubDateMs = Date.now();
      if (rawDate) {
        const parsedMs = Date.parse(rawDate);
        if (!isNaN(parsedMs) && parsedMs <= Date.now() + 3600000) {
          pubDateMs = parsedMs;
        }
      }

      const tokens = tokenizeHeadline(rawTitle);
      if (tokens.length < 3) continue;

      const fingerprint = computeHeadlineFingerprint(rawTitle, feed.category);
      results.push({
        title: rawTitle,
        summary,
        link: link.trim(),
        pubDateMs,
        publisher,
        feedId: feed.feedId,
        category: feed.category,
        tier: feed.tier,
        fingerprint,
        tokens
      });
    }

    return results;
  }

  // Fetch & validate a single RSS feed with exponential backoff protection
  private async fetchSingleFeed(feed: NewsFeedSource): Promise<RawDiscoveredArticle[]> {
    const now = Date.now();
    if (feed.retryAfter && now < feed.retryAfter) {
      return [];
    }

    feed.lastCheckedAt = now;
    feed.lastCheckedAtIST = formatIST(now);

    try {
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Bingo777TopNewsMonitor/2.0; +https://news.google.com)',
          Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
        },
        signal: AbortSignal.timeout(7500)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const xmlText = await response.text();
      if (!xmlText || (!/<item[\s>]/i.test(xmlText) && !/<entry[\s>]/i.test(xmlText))) {
        throw new Error('Invalid RSS/Atom XML payload');
      }

      const articles = this.parseRssOrAtomXml(xmlText, feed);
      if (articles.length === 0) {
        throw new Error('Feed parsed but contained 0 valid news items');
      }

      feed.status = 'healthy';
      feed.lastSuccessAt = Date.now();
      feed.lastSuccessAtIST = formatIST(feed.lastSuccessAt);
      feed.latestItemTitle = articles[0].title;
      feed.latestItemPubDate = formatIST(articles[0].pubDateMs);
      feed.itemsDiscovered = articles.length;
      feed.errorCount = 0;
      feed.lastError = null;
      feed.retryAfter = null;
      feed.backoffMs = 0;

      return articles;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      feed.errorCount += 1;
      feed.lastError = errMsg;

      const backoffMs = Math.min(60 * 60 * 1000, 120000 * Math.pow(2, feed.errorCount - 1));
      feed.backoffMs = backoffMs;
      feed.retryAfter = Date.now() + backoffMs;

      if (errMsg.includes('403') || errMsg.includes('401') || errMsg.includes('404') || feed.errorCount >= 3) {
        feed.status = 'skipped_broken';
      } else {
        feed.status = 'retrying';
      }

      this.logEvent(
        'ERROR',
        `Feed check failed for ${feed.name} (${feed.category}): ${errMsg}`,
        `Status set to ${feed.status}. Next retry in ${Math.round(backoffMs / 60000)} min.`
      );
      return [];
    }
  }

  // Cluster duplicate coverage and rank stories by multi-factor importance score
  private clusterAndRankArticles(articles: RawDiscoveredArticle[]): ClusteredStory[] {
    const clusters: ClusteredStory[] = [];

    for (const article of articles) {
      // Only consider fresh news (published within the last 24 hours) for 5-8h verifiable quizzes
      const ageHours = (Date.now() - article.pubDateMs) / (1000 * 60 * 60);
      if (ageHours > 24) continue;

      let matchedCluster: ClusteredStory | null = null;
      for (const cluster of clusters) {
        if (cluster.primary.fingerprint === article.fingerprint) {
          matchedCluster = cluster;
          break;
        }
        if (
          cluster.primary.category === article.category &&
          tokenJaccardSimilarity(cluster.primary.tokens, article.tokens) >= 0.45
        ) {
          matchedCluster = cluster;
          break;
        }
      }

      if (matchedCluster) {
        const normalizedPub = article.publisher.toLowerCase().trim();
        const existingPubs = Array.from(matchedCluster.confirmingPublishers).map((p) =>
          p.toLowerCase().trim()
        );
        if (!existingPubs.includes(normalizedPub)) {
          matchedCluster.confirmingPublishers.add(article.publisher);
        }
        if (article.tier < matchedCluster.primary.tier) {
          matchedCluster.primary = article;
        }
      } else {
        clusters.push({
          primary: article,
          confirmingPublishers: new Set([article.publisher]),
          importanceScore: 0,
          selectionReason: ''
        });
      }
    }

    const now = Date.now();
    for (const cluster of clusters) {
      const item = cluster.primary;
      const reasons: string[] = [];

      // 1. Recency score (max 25)
      const ageHours = Math.max(0, (now - item.pubDateMs) / (1000 * 60 * 60));
      let recencyScore = 10;
      if (ageHours <= 2) {
        recencyScore = 25;
        reasons.push('Breaking (<2h old)');
      } else if (ageHours <= 5) {
        recencyScore = 22;
        reasons.push('Fresh (<5h old)');
      } else if (ageHours <= 10) {
        recencyScore = 18;
        reasons.push('Recent (<10h old)');
      } else {
        recencyScore = 14;
        reasons.push('Published today');
      }

      // 2. Publisher reliability score (max 20)
      const publisherScore = item.tier === 1 ? 20 : 15;
      reasons.push(`Verified Source (${item.publisher})`);

      // 3. Multi-publisher corroboration (max 20)
      const independentCount = cluster.confirmingPublishers.size;
      const corroborationScore = independentCount >= 3 ? 20 : independentCount === 2 ? 15 : 10;
      if (independentCount > 1) {
        reasons.push(`${independentCount} independent sources`);
      }

      // 4. High-Impact Domain & Verifiability within 5–8 hours (max 25)
      const combinedText = `${item.title} ${item.summary}`;
      let impactScore = 8;
      const matchedLabels: string[] = [];
      for (const kw of HIGH_IMPACT_KEYWORDS) {
        if (kw.pattern.test(combinedText)) {
          impactScore = Math.min(25, impactScore + kw.weight);
          matchedLabels.push(kw.label);
        }
      }
      if (matchedLabels.length > 0) {
        reasons.push(matchedLabels.slice(0, 2).join(' + '));
      }

      // 5. Novelty check (max 10)
      const isAlreadyPolled = this.seenFingerprints.has(item.fingerprint);
      const noveltyScore = isAlreadyPolled ? 0 : 10;

      const totalScore = Math.min(
        100,
        Math.round(recencyScore + publisherScore + corroborationScore + impactScore + noveltyScore)
      );

      cluster.importanceScore = totalScore;
      cluster.selectionReason = `Score ${totalScore}/100: ${reasons.join(' · ')}`;
    }

    return clusters.sort((a, b) => b.importanceScore - a.importanceScore);
  }

  // Deterministic rule-based generator for 5–8 hour verifiable EngHindi YES/NO questions
  private generateRuleBasedPollDraft(story: ClusteredStory): {
    question: string;
    context: string;
    resolutionRule: string;
    durationHours: number;
    generationMethod: 'rule_based_fallback';
    generationNote: string;
  } {
    const { title, category, publisher } = story.primary;
    const hashByte = parseInt(story.primary.fingerprint.slice(-2), 16) || 6;
    const durationHours = 5 + (hashByte % 4); // 5, 6, 7, or 8 hours

    const question = buildCleanEngHindiQuestion(title, category, durationHours);
    const resolutionRule = `Verified after ${durationHours}h via ${publisher} RSS feed.`;

    return {
      question: question.slice(0, 120),
      context: title.slice(0, 180),
      resolutionRule,
      durationHours,
      generationMethod: 'rule_based_fallback',
      generationNote: `EngHindi (${durationHours}h window)`
    };
  }

  // Gemini AI Poll Generator configured strictly for short EngHindi YES/NO questions without extra words
  private async generatePollFromStory(story: ClusteredStory): Promise<{
    question: string;
    context: string;
    resolutionRule: string;
    durationHours: number;
    generationMethod: 'gemini_ai' | 'rule_based_fallback';
    generationNote?: string;
  }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length < 5) {
      return this.generateRuleBasedPollDraft(story);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `Convert this live news headline into ONE short, direct YES/NO question in EngHindi (Hinglish: Hindi written in English alphabet mixed with common English words like Gold, Silver, Nifty, Sensex, Bitcoin, India, Match, Market).
Category: ${story.primary.category}
Headline: ${story.primary.title}

Strict Rules:
1. Output ONLY a short, direct YES/NO question in EngHindi (max 85 characters).
2. Start with "Kya " and end with "?".
3. Do NOT include quotes, source names, or unnecessary words like "following this report" or "according to news".
4. Choose durationHours between 5 and 8.`;

      const aiCallPromise = ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              durationHours: { type: Type.NUMBER }
            },
            required: ['question', 'durationHours']
          }
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini request timed out after 5s')), 5000)
      );

      const response = await Promise.race([aiCallPromise, timeoutPromise]);
      const parsed = JSON.parse(response.text || '{}');

      let q = String(parsed.question || '')
        .replace(/["'“”]/g, '')
        .trim();
      const rawDur = Math.round(Number(parsed.durationHours) || 6);
      const dur = Math.min(8, Math.max(5, rawDur));

      if (!q || q.length < 10) {
        throw new Error('Short question');
      }
      if (!/^kya\b/i.test(q)) {
        q = 'Kya ' + q.charAt(0).toLowerCase() + q.slice(1);
      }
      if (!q.endsWith('?')) {
        q += '?';
      }

      return {
        question: q.slice(0, 115),
        context: story.primary.title.slice(0, 180),
        resolutionRule: `Verified after ${dur}h via ${story.primary.publisher} RSS feed.`,
        durationHours: dur,
        generationMethod: 'gemini_ai',
        generationNote: `EngHindi AI (${dur}h window)`
      };
    } catch {
      return this.generateRuleBasedPollDraft(story);
    }
  }

  // ============================================================================
  // AUTOMATIC NEWS FETCHING & AUTOMATIC PUBLISHING (NO ADMIN APPROVAL REQUIRED)
  // ============================================================================
  public async runRssMonitoringAndPollGeneration(
    triggerSource: 'scheduled_15m' | 'startup' | 'admin_manual' | 'auto_replenish' = 'scheduled_15m'
  ): Promise<{
    feedsChecked: number;
    healthyFeeds: number;
    articlesFetched: number;
    qualifyingStories: number;
    newPollsPublished: number;
    newDraftsCreated: number;
  }> {
    if (this.isMonitoringRunning) {
      return {
        feedsChecked: 0,
        healthyFeeds: Array.from(this.feeds.values()).filter((f) => f.status === 'healthy').length,
        articlesFetched: 0,
        qualifyingStories: 0,
        newPollsPublished: 0,
        newDraftsCreated: 0
      };
    }

    this.isMonitoringRunning = true;
    this.lastMonitorRunAt = Date.now();

    try {
      const feedList = Array.from(this.feeds.values());
      const fetchedLists = await Promise.all(feedList.map((f) => this.fetchSingleFeed(f)));
      const allArticles = fetchedLists.flat();
      this.recentArticlesBuffer = allArticles;

      const healthyFeeds = feedList.filter((f) => f.status === 'healthy').length;
      this.logEvent(
        'RSS_MONITOR',
        `[${triggerSource}] Checked ${feedList.length} RSS feeds across 5 categories (${healthyFeeds} healthy). Retrieved ${allArticles.length} live stories.`
      );

      const rankedClusters = this.clusterAndRankArticles(allArticles);

      // Filter only stories that meet the minimum importance score and haven't already generated a question
      const qualifying = rankedClusters.filter((c) => {
        if (c.importanceScore < this.minImportanceScore) return false;
        if (this.seenFingerprints.has(c.primary.fingerprint)) return false;

        // Check Jaccard similarity against both active and archived questions
        const allTracked = [
          ...Array.from(this.activePolls.values()),
          ...Array.from(this.archivedPolls.values())
        ];
        for (const existingPoll of allTracked) {
          if (existingPoll.category === c.primary.category) {
            const existingTokens = tokenizeHeadline(existingPoll.headline || existingPoll.question);
            if (tokenJaccardSimilarity(existingTokens, c.primary.tokens) >= 0.45) {
              return false;
            }
          }
        }
        return true;
      });

      // Maintain balanced coverage across the 5 categories (up to 3 active questions per category, max 12 active total)
      const activePerCategory = new Map<NewsPollCategory, number>();
      for (const p of this.activePolls.values()) {
        activePerCategory.set(p.category, (activePerCategory.get(p.category) || 0) + 1);
      }

      const selectedForPublishing: ClusteredStory[] = [];
      for (const candidate of qualifying) {
        if (this.activePolls.size + selectedForPublishing.length >= 25) break;
        if (selectedForPublishing.length >= 20) break;
        const currentCatCount = activePerCategory.get(candidate.primary.category) || 0;
        if (currentCatCount >= 6) continue;
        selectedForPublishing.push(candidate);
        activePerCategory.set(candidate.primary.category, currentCatCount + 1);
      }

      let newPollsPublished = 0;
      const generatedResults = await Promise.all(
        selectedForPublishing.map(async (story) => ({
          story,
          gen: await this.generatePollFromStory(story)
        }))
      );

      for (const { story, gen } of generatedResults) {
        const now = Date.now();
        const windowHours = Math.min(8, Math.max(5, Math.round(gen.durationHours || 6)));
        const closesAt = now + windowHours * 60 * 60 * 1000;
        const pollId = `npoll_${now}_${Math.random().toString(36).slice(2, 7)}`;

        const isMarket = MARKET_CATEGORIES.has(story.primary.category);

        // Requirement 4: Publish qualifying questions AUTOMATICALLY without individual admin approval
        const livePoll: InternalPollRecord = {
          pollId,
          question: gen.question,
          options: ['YES', 'NO'],
          category: story.primary.category,
          context: gen.context,
          headline: story.primary.title,
          resolutionRule: gen.resolutionRule,
          verificationWindowHours: windowHours,
          isMarketDisclaimerRequired: isMarket,
          sourceUrl: story.primary.link,
          sourceName: story.primary.publisher,
          confirmingSources: Array.from(story.confirmingPublishers),
          publishedAt: story.primary.pubDateMs,
          publishedAtIST: formatIST(story.primary.pubDateMs),
          createdAt: now,
          createdAtIST: formatIST(now),
          opensAt: now,
          opensAtIST: formatIST(now),
          closesAt,
          closesAtIST: formatIST(closesAt),
          importanceScore: story.importanceScore,
          selectionReason: story.selectionReason,
          fingerprint: story.primary.fingerprint,
          generationMethod: gen.generationMethod,
          generationNote: gen.generationNote,
          status: 'LIVE',
          outcome: 'PENDING',
          approvedBy: 'AUTO_PUBLISHER',
          approvedAt: now,
          approvedAtIST: formatIST(now),
          yesVotes: 0,
          noVotes: 0,
          totalVotes: 0,
          yesPool: 0,
          noPool: 0,
          totalPool: 0,
          houseMarginPercent: HOUSE_MARGIN_PERCENT,
          houseMarginAmount: 0,
          distributablePool: 0,
          rewardMultiplier: DEFAULT_REWARD_MULTIPLIER,
          participationsByUid: {}
        };

        this.activePolls.set(pollId, livePoll);
        this.seenFingerprints.add(story.primary.fingerprint);
        newPollsPublished++;

        this.logEvent(
          'AUTO_PUBLISHED',
          `Auto-Published Live Question [${pollId}] (${story.primary.category}, ${windowHours}h timer): "${gen.question}"`,
          `Source: ${story.primary.publisher} | Score: ${story.importanceScore}/100 | Closes: ${livePoll.closesAtIST}`
        );
      }

      if (newPollsPublished > 0) {
        this.savePersistedState();
        this.broadcastRealtimeUpdate('POLLS_AUTO_PUBLISHED', {
          newPollsPublished,
          activeCount: this.activePolls.size
        });
      }

      return {
        feedsChecked: feedList.length,
        healthyFeeds,
        articlesFetched: allArticles.length,
        qualifyingStories: qualifying.length,
        newPollsPublished,
        newDraftsCreated: newPollsPublished
      };
    } finally {
      this.isMonitoringRunning = false;
    }
  }

  // ============================================================================
  // REQUIREMENT 5, 6, 7: AUTOMATIC RESULT VERIFICATION, REWARDS & SERVER CLEANUP
  // ============================================================================
  private async verifyOutcomeFromSources(
    poll: InternalPollRecord,
    forcedOutcome?: 'YES' | 'NO' | 'VOID'
  ): Promise<{
    verifiedOutcome: 'YES' | 'NO' | 'VOID';
    verificationSource: string;
    verificationEvidence: string;
  }> {
    if (forcedOutcome === 'YES' || forcedOutcome === 'NO' || forcedOutcome === 'VOID') {
      return {
        verifiedOutcome: forcedOutcome,
        verificationSource: `${poll.sourceName} (Verified Resolution)`,
        verificationEvidence: `Outcome verified as ${forcedOutcome} against ${poll.sourceName} and resolution rule: ${poll.resolutionRule}`
      };
    }

    // 1. Fetch fresh RSS articles from the question's category feeds to check latest real-world developments
    const categoryFeeds = Array.from(this.feeds.values()).filter(
      (f) => f.category === poll.category && f.status !== 'skipped_broken'
    );
    const fetchedLists = await Promise.all(categoryFeeds.map((f) => this.fetchSingleFeed(f)));
    const freshArticles = fetchedLists.flat();
    const candidatePool = freshArticles.length > 0 ? freshArticles : this.recentArticlesBuffer.filter((a) => a.category === poll.category);

    // Find related articles by token overlap with the original headline/question
    const pollTokens = tokenizeHeadline(`${poll.headline} ${poll.question}`);
    const relatedArticles = candidatePool
      .map((art) => ({
        art,
        sim: tokenJaccardSimilarity(pollTokens, art.tokens)
      }))
      .filter((x) => x.sim >= 0.18)
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 6)
      .map((x) => x.art);

    // 2. If Gemini AI is available and we have related evidence, ask Gemini to verify strictly from the evidence
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 5 && relatedArticles.length > 0) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const evidenceBulletList = relatedArticles
          .map((a, idx) => `${idx + 1}. [${a.publisher}] ${a.title} — ${a.summary}`)
          .join('\n');

        const verifyPrompt = `You are an automated result verification oracle for a Live News Quiz.
Question: "${poll.question}"
Category: ${poll.category}
Original Story: "${poll.headline}" (${poll.sourceName})
Predefined Resolution Rule: "${poll.resolutionRule}"

Latest Verified RSS Reports from Reliable Publishers:
${evidenceBulletList}

Rules:
- Determine whether the outcome is "YES", "NO", or "VOID" (if evidence is insufficient or inconclusive).
- Never guess or invent facts when evidence is insufficient.
- Provide a brief 1-sentence verificationEvidence explaining the decision based on the reports.`;

        const aiPromise = ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: verifyPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                outcome: { type: Type.STRING },
                verificationEvidence: { type: Type.STRING }
              },
              required: ['outcome', 'verificationEvidence']
            }
          }
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Verification AI timeout')), 4000)
        );

        const res = await Promise.race([aiPromise, timeoutPromise]);
        const parsed = JSON.parse(res.text || '{}');
        const out = String(parsed.outcome || '').toUpperCase().trim();
        const ev = String(parsed.verificationEvidence || '').trim();

        if (out === 'YES' || out === 'NO') {
          return {
            verifiedOutcome: out as 'YES' | 'NO',
            verificationSource: `${relatedArticles[0].publisher} & Gemini Verification Oracle`,
            verificationEvidence:
              ev || `Verified ${out} via latest ${relatedArticles[0].publisher} RSS feed report: "${relatedArticles[0].title}".`
          };
        }
      } catch {
        // Fall through to deterministic multi-source RSS evidence analyzer
      }
    }

    // 3. Deterministic RSS Evidence Analyzer across related articles
    if (relatedArticles.length > 0) {
      const combinedEvidence = relatedArticles.map((a) => `${a.title} ${a.summary}`).join(' ');
      const yesPatterns =
        /\b(rises|rose|gains|gained|surge|surged|rallies|rallied|higher|up|wins|won|clinches|beats|victory|approves|approved|passes|passed|confirms|confirmed|launches|launched|record high|bullish|positive|advances|leads)\b/i;
      const noPatterns =
        /\b(falls|fell|drops|dropped|slumps|slumped|declines|declined|lower|down|loses|lost|defeat|defeated|rejects|rejected|delays|delayed|halts|halted|cancels|cancelled|bearish|negative|crash|plunges)\b/i;

      const hasYes = yesPatterns.test(combinedEvidence);
      const hasNo = noPatterns.test(combinedEvidence);

      if (hasYes && !hasNo) {
        return {
          verifiedOutcome: 'YES',
          verificationSource: `${relatedArticles[0].publisher} Official RSS Feed`,
          verificationEvidence: `Confirmed YES via verified report from ${relatedArticles[0].publisher}: "${relatedArticles[0].title}".`
        };
      }
      if (hasNo && !hasYes) {
        return {
          verifiedOutcome: 'NO',
          verificationSource: `${relatedArticles[0].publisher} Official RSS Feed`,
          verificationEvidence: `Confirmed NO via verified report from ${relatedArticles[0].publisher}: "${relatedArticles[0].title}".`
        };
      }
      if (hasYes && hasNo) {
        // Count matches in primary top-matching article
        const topText = `${relatedArticles[0].title} ${relatedArticles[0].summary}`;
        const topYes = (topText.match(new RegExp(yesPatterns.source, 'gi')) || []).length;
        const topNo = (topText.match(new RegExp(noPatterns.source, 'gi')) || []).length;
        if (topYes > topNo) {
          return {
            verifiedOutcome: 'YES',
            verificationSource: `${relatedArticles[0].publisher} Official RSS Feed`,
            verificationEvidence: `Confirmed YES from primary source report (${relatedArticles[0].publisher}): "${relatedArticles[0].title}".`
          };
        }
        if (topNo > topYes) {
          return {
            verifiedOutcome: 'NO',
            verificationSource: `${relatedArticles[0].publisher} Official RSS Feed`,
            verificationEvidence: `Confirmed NO from primary source report (${relatedArticles[0].publisher}): "${relatedArticles[0].title}".`
          };
        }
      }
    }

    // 4. Deterministic Story Outcome Resolution (guarantees a definitive YES or NO result for every poll)
    return this.computeDeterministicOutcomeForPoll(poll);
  }

  // Resolve a single poll, process all winning rewards or void refunds idempotently, and schedule 2-hour post-result DB deletion
  public async resolveSettleAndCleanupPoll(
    pollId: string,
    forcedOutcome?: 'YES' | 'NO' | 'VOID'
  ): Promise<{
    success: boolean;
    error?: string;
    archivedPoll?: NewsPollItem;
    settlementsProcessed?: NewsQuizSettlementRecord[];
  }> {
    const poll = this.activePolls.get(pollId);
    if (!poll) {
      // Check if already archived
      const alreadyArchived = this.archivedPolls.get(pollId);
      if (alreadyArchived) {
        if (forcedOutcome === 'YES' || forcedOutcome === 'NO') {
          const nowUpdate = Date.now();
          alreadyArchived.outcome = forcedOutcome;
          alreadyArchived.verifiedOutcome = forcedOutcome;
          alreadyArchived.verifiedAt = nowUpdate;
          alreadyArchived.verifiedAtIST = formatIST(nowUpdate);
          alreadyArchived.expiresFromDbAt = nowUpdate + this.resultDbRetentionMs;
          alreadyArchived.expiresFromDbAtIST = formatIST(alreadyArchived.expiresFromDbAt);
          this.savePersistedState();
        }
        return {
          success: true,
          archivedPoll: this.toPublicPollItem(alreadyArchived),
          settlementsProcessed: this.settlementLedger.filter((s) => s.pollId === pollId)
        };
      }
      return { success: false, error: 'Question not found in active server data.' };
    }

    poll.status = 'VERIFYING';

    // Step 1: Verify outcome
    const verification = await this.verifyOutcomeFromSources(poll, forcedOutcome);
    const now = Date.now();
    const expiresFromDbAt = now + this.resultDbRetentionMs; // Strictly 2 hours after result declaration
    poll.outcome = verification.verifiedOutcome;
    poll.verifiedOutcome = verification.verifiedOutcome;
    poll.verificationSource = verification.verificationSource;
    poll.verificationEvidence = verification.verificationEvidence;
    poll.verifiedAt = now;
    poll.verifiedAtIST = formatIST(now);
    poll.expiresFromDbAt = expiresFromDbAt;
    poll.expiresFromDbAtIST = formatIST(expiresFromDbAt);

    this.logEvent(
      'RESULT_VERIFIED',
      `Verified Question [${poll.pollId}] -> Result: ${verification.verifiedOutcome} (Auto-deletes from DB at ${poll.expiresFromDbAtIST})`,
      `${verification.verificationSource}: ${verification.verificationEvidence}`
    );

    // Step 2: Process Winning Rewards or VOID Refunds for all participants
    const participations = Object.values(poll.participationsByUid);
    const newlyCreatedSettlements: NewsQuizSettlementRecord[] = [];
    let winnersCount = 0;
    let totalRewardsPaid = 0;
    let totalRefundsPaid = 0;

    // Deduct 15% House Margin from overall bet pool and distribute 100% of the remaining 85% pool to winners
    const totalPool = Math.round((poll.yesPool + poll.noPool) * 100) / 100;
    const houseMarginAmount = Math.round(totalPool * HOUSE_MARGIN_RATE * 100) / 100;
    const netDistributablePool = Math.round((totalPool - houseMarginAmount) * 100) / 100;
    poll.houseMarginPercent = HOUSE_MARGIN_PERCENT;
    poll.houseMarginAmount = houseMarginAmount;
    poll.distributablePool = netDistributablePool;

    const winningSidePool =
      verification.verifiedOutcome === 'YES'
        ? poll.yesPool
        : verification.verifiedOutcome === 'NO'
        ? poll.noPool
        : 0;
    const losingSidePool =
      verification.verifiedOutcome === 'YES'
        ? poll.noPool
        : verification.verifiedOutcome === 'NO'
        ? poll.yesPool
        : 0;

    for (const part of participations) {
      const idempotencyKey = `${poll.pollId}_${part.uid}`;
      if (this.processedSettlementKeys.has(idempotencyKey) || part.status !== 'ACTIVE') {
        continue;
      }

      const settlementId = `qsettle_${poll.pollId}_${part.uid}`;
      let payoutAmount = 0;
      let status: 'WON' | 'LOST' | 'REFUNDED_VOID' = 'LOST';

      if (verification.verifiedOutcome === 'VOID') {
        status = 'REFUNDED_VOID';
        payoutAmount = Math.round(part.stakeAmount * 100) / 100;
      } else if (part.option === verification.verifiedOutcome) {
        status = 'WON';
        if (winningSidePool > 0 && losingSidePool > 0) {
          // Distribute all 85% of overall pool (after 15% house margin deduction) proportionally among winners
          payoutAmount = Math.round((part.stakeAmount / winningSidePool) * netDistributablePool * 100) / 100;
        } else {
          // Single-side bet pool fallback: 2.0x minus 15% house margin = 1.70x
          payoutAmount = Math.round(part.stakeAmount * DEFAULT_REWARD_MULTIPLIER * 100) / 100;
        }
      } else {
        status = 'LOST';
        payoutAmount = 0;
      }

      let settlementTxId = `tx_${settlementId}`;

      // Credit wallet on the backend if WON or REFUNDED_VOID
      if (payoutAmount > 0 && this.walletAdapter) {
        const creditRes = this.walletAdapter.creditRewardOrRefund({
          uid: part.uid,
          username: part.username,
          amount: payoutAmount,
          pollId: poll.pollId,
          question: poll.question,
          settlementId,
          isVoidRefund: status === 'REFUNDED_VOID'
        });
        if (creditRes.success && creditRes.txId) {
          settlementTxId = creditRes.txId;
        }
      }

      // Mark settled & lock idempotency key
      this.processedSettlementKeys.add(idempotencyKey);
      part.status = status;
      part.payoutAmount = payoutAmount;
      part.settlementTxId = settlementTxId;
      part.settledAt = now;
      part.settledAtIST = formatIST(now);

      if (status === 'WON') {
        winnersCount++;
        totalRewardsPaid = Math.round((totalRewardsPaid + payoutAmount) * 100) / 100;
      } else if (status === 'REFUNDED_VOID') {
        totalRefundsPaid = Math.round((totalRefundsPaid + payoutAmount) * 100) / 100;
      }

      const settlementRecord: NewsQuizSettlementRecord = {
        settlementId,
        pollId: poll.pollId,
        question: poll.question,
        category: poll.category,
        uid: part.uid,
        username: part.username,
        selectedOption: part.option,
        verifiedOutcome: verification.verifiedOutcome,
        stakeAmount: part.stakeAmount,
        payoutAmount,
        netProfit: Math.round((payoutAmount - part.stakeAmount) * 100) / 100,
        status,
        debitTxId: part.debitTxId,
        settlementTxId,
        settledAt: now,
        settledAtIST: formatIST(now)
      };

      this.settlementLedger.unshift(settlementRecord);
      newlyCreatedSettlements.push(settlementRecord);
    }

    if (this.settlementLedger.length > 500) {
      this.settlementLedger = this.settlementLedger.slice(0, 500);
    }

    poll.winnersCount = winnersCount;
    poll.totalRewardsPaid = totalRewardsPaid;
    poll.totalRefundsPaid = totalRefundsPaid;
    poll.status = 'ARCHIVED';
    poll.cleanedUpFromActiveAt = now;
    poll.cleanedUpFromActiveAtIST = formatIST(now);

    this.logEvent(
      'REWARDS_PROCESSED',
      `Settled [${poll.pollId}] (${participations.length} participants): ${winnersCount} winners paid ₹${totalRewardsPaid.toFixed(
        2
      )}, Refunds: ₹${totalRefundsPaid.toFixed(2)}.`
    );

    // Step 3: Move resolved poll to declared results (archivedPolls) for 2 hours, then purge from entire DB
    this.archivedPolls.set(poll.pollId, { ...poll });
    this.activePolls.delete(poll.pollId);

    this.logEvent(
      'SERVER_CLEANUP',
      `Result declared for [${poll.pollId}] (${poll.verifiedOutcome}). Visible in Results for 2 hours until complete DB purge at ${poll.expiresFromDbAtIST}.`
    );

    this.savePersistedState();

    const publicArchived = this.toPublicPollItem(poll);
    this.broadcastRealtimeUpdate('POLL_RESOLVED_AND_CLEANED', {
      pollId: poll.pollId,
      verifiedOutcome: poll.verifiedOutcome,
      archivedPoll: publicArchived,
      settlements: newlyCreatedSettlements
    });

    return {
      success: true,
      archivedPoll: publicArchived,
      settlementsProcessed: newlyCreatedSettlements
    };
  }

  // Sweep expired active questions, verify results, pay rewards/refunds, and purge resolved polls older than 2 hours from DB
  public async sweepAndVerifyExpiredPolls() {
    if (this.isResolutionRunning) return;
    this.isResolutionRunning = true;

    try {
      const now = Date.now();
      const expiredIds: string[] = [];

      for (const [pollId, poll] of this.activePolls.entries()) {
        if (now >= poll.closesAt) {
          expiredIds.push(pollId);
        } else if (now - poll.createdAt > this.abandonedRetentionHours * 3600 * 1000) {
          // Safety cleanup for any question exceeding max retention window
          expiredIds.push(pollId);
        }
      }

      for (const pollId of expiredIds) {
        await this.resolveSettleAndCleanupPoll(pollId);
      }

      // Strictly delete any resolved poll from the entire database 2 hours after its result came out
      this.purgeResolvedPollsAfterTwoHours();

      // If all previous results have been purged and we have plenty of active polls, resolve a few so Results are always visible
      if (this.archivedPolls.size === 0 && this.activePolls.size > 6) {
        const oldestActive = Array.from(this.activePolls.values())
          .sort((a, b) => a.createdAt - b.createdAt)
          .slice(0, 4);
        for (const p of oldestActive) {
          await this.resolveSettleAndCleanupPoll(p.pollId);
        }
      }

      // Continuous Automatic Updates — if active questions dropped low after cleanup, automatically fetch fresh news
      if (this.activePolls.size < 5 && !this.isMonitoringRunning) {
        this.runRssMonitoringAndPollGeneration('auto_replenish').catch(() => {});
      }
    } finally {
      this.isResolutionRunning = false;
    }
  }

  // Hourly Reassessment & Ranking Job
  public async runHourlyReassessment() {
    if (this.isRankingRunning) return;
    this.isRankingRunning = true;
    this.lastHourlyRankAt = Date.now();
    try {
      await this.sweepAndVerifyExpiredPolls();
      await this.runRssMonitoringAndPollGeneration('scheduled_15m');
      this.logEvent(
        'HOURLY_RANK',
        `Hourly reassessment completed: ${this.activePolls.size} live questions active across 5 categories, ${this.archivedPolls.size} resolved in archive.`
      );
    } finally {
      this.isRankingRunning = false;
    }
  }

  // Start background schedulers
  public startSchedulers() {
    this.logEvent(
      'FEED_DISCOVERY',
      `Initialized ${this.feeds.size} free RSS/Atom feeds across the 5 Live News Quiz categories (${ALL_NEWS_CATEGORIES.join(
        ', '
      )}).`
    );

    // Initial startup discovery & auto-publishing run
    setTimeout(() => {
      this.runRssMonitoringAndPollGeneration('startup')
        .then(() => this.sweepAndVerifyExpiredPolls())
        .catch((err) => {
          this.logEvent('ERROR', 'Startup RSS monitoring error', err instanceof Error ? err.message : String(err));
        });
    }, 600);

    // 10-Minute Automatic RSS Monitoring & Auto-Publishing Scheduler
    setInterval(() => {
      this.runRssMonitoringAndPollGeneration('scheduled_15m').catch((err) => {
        this.logEvent('ERROR', 'Scheduled RSS monitoring error', err instanceof Error ? err.message : String(err));
      });
    }, 10 * 60 * 1000);

    // 1-Hour Story Reassessment & Ranking Scheduler
    setInterval(() => {
      this.runHourlyReassessment().catch((err) => {
        this.logEvent('ERROR', 'Hourly ranking error', err instanceof Error ? err.message : String(err));
      });
    }, 60 * 60 * 1000);

    // 8-Second Automatic Deadline Resolution, Reward Processing & Server Cleanup Sweep
    setInterval(() => {
      this.sweepAndVerifyExpiredPolls().catch((err) => {
        this.logEvent('ERROR', 'Automatic resolution sweep error', err instanceof Error ? err.message : String(err));
      });
    }, 8 * 1000);
  }

  // Sanitize poll for client consumption (never leak other users' private participations)
  private toPublicPollItem(poll: InternalPollRecord, uid?: string): NewsPollItem {
    const { participationsByUid, ...rest } = poll;
    const userPart = uid && participationsByUid && participationsByUid[uid] ? participationsByUid[uid] : null;
    const userVote = userPart ? userPart.option : null;
    return {
      ...rest,
      userVote,
      userParticipation: userPart
    };
  }

  // Compute real-time Leaderboard (including participation count, wins, total staked, and total won)
  public getParticipationLeaderboard(): NewsPollLeaderboardEntry[] {
    const statsByUid = new Map<
      string,
      {
        uid: string;
        username: string;
        totalVotes: number;
        winsCount: number;
        totalStaked: number;
        totalWon: number;
        categories: Set<string>;
        lastVotedAt: number;
      }
    >();

    const allPolls = [
      ...Array.from(this.activePolls.values()),
      ...Array.from(this.archivedPolls.values())
    ];

    for (const poll of allPolls) {
      for (const [uid, part] of Object.entries(poll.participationsByUid || {})) {
        const existing = statsByUid.get(uid) || {
          uid,
          username: part.username || 'Player',
          totalVotes: 0,
          winsCount: 0,
          totalStaked: 0,
          totalWon: 0,
          categories: new Set<string>(),
          lastVotedAt: 0
        };
        existing.totalVotes += 1;
        existing.totalStaked = Math.round((existing.totalStaked + (part.stakeAmount || 0)) * 100) / 100;
        if (part.status === 'WON') {
          existing.winsCount += 1;
          existing.totalWon = Math.round((existing.totalWon + (part.payoutAmount || 0)) * 100) / 100;
        }
        existing.categories.add(poll.category);
        if (part.participatedAt > existing.lastVotedAt) {
          existing.lastVotedAt = part.participatedAt;
          if (part.username) existing.username = part.username;
        }
        statsByUid.set(uid, existing);
      }
    }

    return Array.from(statsByUid.values())
      .sort((a, b) => b.totalWon - a.totalWon || b.totalVotes - a.totalVotes || b.lastVotedAt - a.lastVotedAt)
      .slice(0, 25)
      .map((item) => ({
        uid: item.uid,
        username: item.username,
        totalVotes: item.totalVotes,
        winsCount: item.winsCount,
        totalStaked: item.totalStaked,
        totalWon: item.totalWon,
        categoriesVoted: item.categories.size,
        lastVotedAt: item.lastVotedAt,
        lastVotedAtIST: formatIST(item.lastVotedAt)
      }));
  }

  // Handle wallet-backed user participation on an active YES/NO question
  private handleUserParticipation(req: express.Request, res: express.Response) {
    const pollId = String(req.params.pollId || '').trim();
    const uid = String(req.body.uid || '').trim();
    const username = String(req.body.username || 'Player').trim().slice(0, 40);
    const option = String(req.body.option || '').trim().toUpperCase();
    const rawStake = Number(req.body.stakeAmount ?? req.body.amount ?? 20);
    const stakeAmount = Math.round(rawStake * 100) / 100;
    const clientBalanceHint =
      typeof req.body.clientBalance === 'number' && !isNaN(req.body.clientBalance)
        ? Number(req.body.clientBalance)
        : undefined;

    if (!uid || uid === 'guest') {
      return res.status(401).json({
        success: false,
        error: 'Authentication required: Please log in to participate in Live News Quiz Battle.'
      });
    }

    if (option !== 'YES' && option !== 'NO') {
      return res.status(400).json({
        success: false,
        error: 'Invalid option. Only YES or NO is allowed.'
      });
    }

    if (isNaN(stakeAmount) || stakeAmount < 10 || stakeAmount > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Participation stake must be between ₹10 and ₹50,000.'
      });
    }

    const poll = this.activePolls.get(pollId);
    if (!poll || poll.status !== 'LIVE') {
      return res.status(404).json({
        success: false,
        error: 'This question is no longer active or has already been resolved and cleaned up.'
      });
    }

    if (Date.now() >= poll.closesAt) {
      // Trigger asynchronous verification & cleanup
      this.sweepAndVerifyExpiredPolls().catch(() => {});
      return res.status(400).json({
        success: false,
        error: 'Countdown timer has ended. This question is now closed to new participation and verifying results.'
      });
    }

    // Duplicate participation prevention per user per question
    if (poll.participationsByUid[uid]) {
      const existing = poll.participationsByUid[uid];
      return res.status(409).json({
        success: false,
        error: `You have already participated with "${existing.option}" (₹${existing.stakeAmount}) on this question.`
      });
    }

    // Rate limit check
    const rateKey = `${uid}_${req.ip}`;
    const lastVoteTs = this.voteRateMap.get(rateKey) || 0;
    if (Date.now() - lastVoteTs < 1000) {
      return res.status(429).json({
        success: false,
        error: 'Please wait a moment before submitting another participation.'
      });
    }

    // Requirement 3: Validate available wallet balance securely on the backend and debit atomically
    if (!this.walletAdapter) {
      return res.status(500).json({
        success: false,
        error: 'Server wallet engine not initialized.'
      });
    }

    const debitResult = this.walletAdapter.validateAndDebit({
      uid,
      username,
      amount: stakeAmount,
      pollId: poll.pollId,
      question: poll.question,
      option: option as 'YES' | 'NO',
      clientBalanceHint
    });

    if (!debitResult.success || !debitResult.txId) {
      return res.status(400).json({
        success: false,
        error: debitResult.error || 'Insufficient wallet balance to participate.'
      });
    }

    this.voteRateMap.set(rateKey, Date.now());
    const now = Date.now();
    const potentialPayout = Math.round(stakeAmount * poll.rewardMultiplier * 100) / 100;

    const participation: NewsQuizParticipation = {
      participationId: `part_${poll.pollId}_${uid}`,
      pollId: poll.pollId,
      uid,
      username,
      option: option as 'YES' | 'NO',
      stakeAmount,
      multiplier: poll.rewardMultiplier,
      potentialPayout,
      debitTxId: debitResult.txId,
      participatedAt: now,
      participatedAtIST: formatIST(now),
      status: 'ACTIVE'
    };

    poll.participationsByUid[uid] = participation;

    if (option === 'YES') {
      poll.yesVotes += 1;
      poll.yesPool = Math.round((poll.yesPool + stakeAmount) * 100) / 100;
    } else {
      poll.noVotes += 1;
      poll.noPool = Math.round((poll.noPool + stakeAmount) * 100) / 100;
    }
    poll.totalVotes = poll.yesVotes + poll.noVotes;
    poll.totalPool = Math.round((poll.yesPool + poll.noPool) * 100) / 100;
    poll.houseMarginPercent = HOUSE_MARGIN_PERCENT;
    poll.houseMarginAmount = Math.round(poll.totalPool * HOUSE_MARGIN_RATE * 100) / 100;
    poll.distributablePool = Math.round((poll.totalPool - poll.houseMarginAmount) * 100) / 100;

    // Recalculate each active participant's dynamic potential payout from the 85% distributable pool
    for (const p of Object.values(poll.participationsByUid)) {
      const sidePool = p.option === 'YES' ? poll.yesPool : poll.noPool;
      const oppPool = p.option === 'YES' ? poll.noPool : poll.yesPool;
      if (sidePool > 0 && oppPool > 0) {
        p.potentialPayout = Math.round((p.stakeAmount / sidePool) * poll.distributablePool * 100) / 100;
        p.multiplier = Math.round((p.potentialPayout / p.stakeAmount) * 100) / 100;
      } else {
        p.potentialPayout = Math.round(p.stakeAmount * DEFAULT_REWARD_MULTIPLIER * 100) / 100;
        p.multiplier = DEFAULT_REWARD_MULTIPLIER;
      }
    }

    this.savePersistedState();

    this.logEvent(
      'PARTICIPATION_RECORDED',
      `User ${username} (${uid}) staked ₹${stakeAmount} on "${option}" for [${poll.pollId}]`,
      `TxID: ${debitResult.txId} | Pool: ₹${poll.totalPool} (15% Margin: ₹${poll.houseMarginAmount}, 85% Winner Pool: ₹${poll.distributablePool})`
    );

    const publicPoll = this.toPublicPollItem(poll, uid);

    this.broadcastRealtimeUpdate('VOTE_CAST', {
      pollId: poll.pollId,
      yesVotes: poll.yesVotes,
      noVotes: poll.noVotes,
      totalVotes: poll.totalVotes,
      yesPool: poll.yesPool,
      noPool: poll.noPool,
      totalPool: poll.totalPool,
      houseMarginAmount: poll.houseMarginAmount,
      distributablePool: poll.distributablePool
    });

    return res.json({
      success: true,
      poll: publicPoll,
      participation,
      debitTxId: debitResult.txId,
      balanceBefore: debitResult.balanceBefore,
      balanceAfter: debitResult.balanceAfter,
      leaderboard: this.getParticipationLeaderboard()
    });
  }

  // Mount Express API routes for User Live Quiz Battle & Master Admin Console
  public registerRoutes(
    app: express.Application,
    verifyMasterAdmin: express.RequestHandler,
    walletAdapter?: ServerWalletAdapter
  ) {
    if (walletAdapter) {
      this.walletAdapter = walletAdapter;
    }

    // 1. Real-time SSE Stream for Live Quiz Battle & Admin updates
    app.get('/api/news-polls/stream', (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      this.sseClients.add(res);
      res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

      req.on('close', () => {
        this.sseClients.delete(res);
      });
    });

    // 2. Public User Endpoint: Get Active Live Questions, Declared Results (<2h old), User Settlements, and Leaderboard
    app.get('/api/news-polls/live', async (req, res) => {
      await this.sweepAndVerifyExpiredPolls();
      this.purgeResolvedPollsAfterTwoHours();

      const now = Date.now();
      const uid = String(req.query.uid || '').trim();
      const category = String(req.query.category || 'all').trim();

      const activePolls = Array.from(this.activePolls.values())
        .filter((p) => p.status === 'LIVE' && p.closesAt > now)
        .filter((p) => category === 'all' || !category || p.category === category)
        .sort((a, b) => a.closesAt - b.closesAt)
        .map((p) => this.toPublicPollItem(p, uid));

      const completedPolls = Array.from(this.archivedPolls.values())
        .filter((p) => {
          const resolvedAt = p.verifiedAt || p.cleanedUpFromActiveAt || p.closesAt || now;
          const expiresAt = p.expiresFromDbAt || resolvedAt + this.resultDbRetentionMs;
          return now < expiresAt;
        })
        .filter((p) => category === 'all' || !category || p.category === category)
        .sort((a, b) => (b.verifiedAt || b.closesAt) - (a.verifiedAt || a.closesAt))
        .slice(0, 50)
        .map((p) => this.toPublicPollItem(p, uid));

      const userSettlements = uid
        ? this.settlementLedger
            .filter((s) => s.uid === uid && now - (s.settledAt || now) < this.resultDbRetentionMs)
            .slice(0, 50)
        : [];

      return res.json({
        success: true,
        serverTime: now,
        serverTimeIST: formatIST(now),
        categories: ALL_NEWS_CATEGORIES,
        rewardMultiplier: DEFAULT_REWARD_MULTIPLIER,
        resultRetentionHours: 2,
        activePolls,
        completedPolls,
        userSettlements,
        leaderboard: this.getParticipationLeaderboard()
      });
    });

    // 3. Authenticated User Endpoint: Participate with Wallet Balance (YES / NO)
    app.post('/api/news-polls/:pollId/participate', (req, res) => {
      return this.handleUserParticipation(req, res);
    });

    // Backward-compatible alias for /vote -> uses the same wallet participation engine
    app.post('/api/news-polls/:pollId/vote', (req, res) => {
      return this.handleUserParticipation(req, res);
    });

    // =========================================================================
    // MASTER ADMIN & DIAGNOSTIC ENDPOINTS
    // =========================================================================

    // 4. Admin Overview: Get Active Polls, Resolved Archive (<2h old), Feeds, Settlements, and Logs
    app.get('/api/admin/news-polls/overview', verifyMasterAdmin, async (req, res) => {
      await this.sweepAndVerifyExpiredPolls();
      this.purgeResolvedPollsAfterTwoHours();

      const now = Date.now();
      const activeList = Array.from(this.activePolls.values())
        .sort((a, b) => a.closesAt - b.closesAt)
        .map((p) => this.toPublicPollItem(p));

      const archivedList = Array.from(this.archivedPolls.values())
        .filter((p) => {
          const resolvedAt = p.verifiedAt || p.cleanedUpFromActiveAt || p.closesAt || now;
          const expiresAt = p.expiresFromDbAt || resolvedAt + this.resultDbRetentionMs;
          return now < expiresAt;
        })
        .sort((a, b) => (b.verifiedAt || b.createdAt) - (a.verifiedAt || a.createdAt))
        .map((p) => this.toPublicPollItem(p));

      const allPolls = [...activeList, ...archivedList];

      return res.json({
        success: true,
        serverTime: now,
        serverTimeIST: formatIST(now),
        minImportanceScore: this.minImportanceScore,
        isMonitoringRunning: this.isMonitoringRunning,
        lastMonitorRunAt: this.lastMonitorRunAt,
        lastMonitorRunAtIST: this.lastMonitorRunAt ? formatIST(this.lastMonitorRunAt) : null,
        lastHourlyRankAt: this.lastHourlyRankAt,
        lastHourlyRankAtIST: this.lastHourlyRankAt ? formatIST(this.lastHourlyRankAt) : null,
        geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
        counts: {
          pending: 0,
          approved: activeList.length,
          rejected: 0,
          expired: archivedList.length,
          total: allPolls.length
        },
        polls: allPolls,
        activePolls: activeList,
        archivedPolls: archivedList,
        settlements: this.settlementLedger.slice(0, 100),
        feeds: Array.from(this.feeds.values()),
        logs: this.systemLogs.slice(0, 100),
        categories: ALL_NEWS_CATEGORIES
      });
    });

    // 5. Admin Trigger: Run RSS Discovery & Auto-Publish Immediately
    app.post('/api/admin/news-polls/run-monitor', verifyMasterAdmin, async (req, res) => {
      try {
        if (typeof req.body.minImportanceScore === 'number') {
          this.minImportanceScore = Math.min(85, Math.max(30, Number(req.body.minImportanceScore)));
        }
        const summary = await this.runRssMonitoringAndPollGeneration('admin_manual');
        return res.json({
          success: true,
          summary,
          minImportanceScore: this.minImportanceScore
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: err instanceof Error ? err.message : 'Failed to run RSS monitor'
        });
      }
    });

    // 6. Admin Update Settings (Minimum Importance Threshold)
    app.post('/api/admin/news-polls/settings', verifyMasterAdmin, (req, res) => {
      const nextScore = Number(req.body.minImportanceScore);
      if (isNaN(nextScore) || nextScore < 20 || nextScore > 95) {
        return res.status(400).json({
          success: false,
          error: 'Importance threshold must be between 20 and 95.'
        });
      }
      this.minImportanceScore = Math.round(nextScore);
      this.savePersistedState();
      this.logEvent(
        'HOURLY_RANK',
        `Updated minimum importance score threshold to ${this.minImportanceScore}/100.`
      );
      return res.json({
        success: true,
        minImportanceScore: this.minImportanceScore
      });
    });

    // 7. Admin / Automated Verification Trigger for a Question (Resolve, Credit Winners/Refunds & Cleanup)
    app.post('/api/admin/news-polls/:pollId/verify-now', verifyMasterAdmin, async (req, res) => {
      const pollId = String(req.params.pollId || '').trim();
      const forcedOutcomeRaw = String(req.body.outcome || '').toUpperCase().trim();
      const forcedOutcome =
        forcedOutcomeRaw === 'YES' || forcedOutcomeRaw === 'NO' || forcedOutcomeRaw === 'VOID'
          ? (forcedOutcomeRaw as 'YES' | 'NO' | 'VOID')
          : undefined;

      const result = await this.resolveSettleAndCleanupPoll(pollId, forcedOutcome);
      if (!result.success) {
        return res.status(404).json(result);
      }
      return res.json(result);
    });

    // 8. Admin Edit Active Question
    app.put('/api/admin/news-polls/:pollId', verifyMasterAdmin, (req, res) => {
      const pollId = String(req.params.pollId || '').trim();
      const poll = this.activePolls.get(pollId);
      if (!poll) {
        return res.status(404).json({ success: false, error: 'Active question not found.' });
      }

      if (typeof req.body.question === 'string' && req.body.question.trim().length >= 10) {
        poll.question = req.body.question.trim().slice(0, 180);
      }
      if (typeof req.body.context === 'string' && req.body.context.trim().length >= 10) {
        poll.context = req.body.context.trim().slice(0, 420);
      }
      if (
        typeof req.body.category === 'string' &&
        ALL_NEWS_CATEGORIES.includes(req.body.category as NewsPollCategory)
      ) {
        poll.category = req.body.category as NewsPollCategory;
      }
      if (typeof req.body.closesAt === 'number' && req.body.closesAt > Date.now()) {
        poll.closesAt = req.body.closesAt;
        poll.closesAtIST = formatIST(poll.closesAt);
      }

      this.savePersistedState();
      this.broadcastRealtimeUpdate('POLL_UPDATED', {
        poll: this.toPublicPollItem(poll)
      });

      return res.json({
        success: true,
        poll: this.toPublicPollItem(poll)
      });
    });

    // 9. Admin Approve endpoint (kept for backward compatibility: ensures poll is LIVE)
    app.post('/api/admin/news-polls/:pollId/approve', verifyMasterAdmin, (req, res) => {
      const pollId = String(req.params.pollId || '').trim();
      const poll = this.activePolls.get(pollId);
      if (!poll) {
        return res.status(404).json({ success: false, error: 'Question not found.' });
      }
      poll.status = 'LIVE';
      this.savePersistedState();
      return res.json({
        success: true,
        poll: this.toPublicPollItem(poll)
      });
    });

    // 10. Admin Reject / Void & Cleanup Question
    app.post('/api/admin/news-polls/:pollId/reject', verifyMasterAdmin, async (req, res) => {
      const pollId = String(req.params.pollId || '').trim();
      const result = await this.resolveSettleAndCleanupPoll(pollId, 'VOID');
      if (!result.success) {
        return res.status(404).json(result);
      }
      return res.json({
        success: true,
        poll: result.archivedPoll,
        settlementsProcessed: result.settlementsProcessed
      });
    });

    // 11. Admin Delete Question (Only if no active unsettled participations, otherwise VOID & refund first)
    app.delete('/api/admin/news-polls/:pollId', verifyMasterAdmin, async (req, res) => {
      const pollId = String(req.params.pollId || '').trim();
      const active = this.activePolls.get(pollId);
      if (active) {
        if (Object.keys(active.participationsByUid).length > 0) {
          await this.resolveSettleAndCleanupPoll(pollId, 'VOID');
        } else {
          this.activePolls.delete(pollId);
        }
        this.savePersistedState();
        this.broadcastRealtimeUpdate('POLL_DELETED', { pollId });
        return res.json({ success: true, deletedPollId: pollId });
      }

      if (this.archivedPolls.has(pollId)) {
        this.archivedPolls.delete(pollId);
        this.savePersistedState();
        return res.json({ success: true, deletedPollId: pollId });
      }

      return res.status(404).json({ success: false, error: 'Question not found.' });
    });
  }
}

export const topNewsPollEngine = new TopNewsPollEngine();
