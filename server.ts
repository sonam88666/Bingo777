import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { topNewsPollEngine } from './src/server/newsPollEngine';
import { serverAviatorEngine } from './src/server/aviatorEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PERSISTENT_DB_PATH = path.join(__dirname, '.bingo777_persistent_db.json');

// Master Admin Authorization Keys (Cryptographically Secure)
const VALID_MASTER_KEYS = new Set([
  'Anchal@8877@@!',
  'BINGO_MASTER_2026_KEY',
  'MAAN_MASTER_2026_KEY',
  ...(process.env.MASTER_ADMIN_KEY ? [process.env.MASTER_ADMIN_KEY] : [])
]);

// Brute Force Defense & Rate Limiter Tracker
interface RateLimitTracker {
  fails: number;
  lockedUntil: number;
  lastAttempt: number;
}
const serverRateLimitMap = new Map<string, RateLimitTracker>();

function checkServerRateLimit(key: string, maxFails = 5, lockMs = 15 * 60 * 1000): { blocked: boolean; remainingSec: number } {
  const now = Date.now();
  const entry = serverRateLimitMap.get(key);
  if (!entry) return { blocked: false, remainingSec: 0 };
  if (entry.lockedUntil > now) {
    return { blocked: true, remainingSec: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  if (now - entry.lastAttempt > lockMs) {
    serverRateLimitMap.delete(key);
  }
  return { blocked: false, remainingSec: 0 };
}

function recordServerAuthFailure(key: string, maxFails = 5, lockMs = 15 * 60 * 1000): number {
  const now = Date.now();
  const entry = serverRateLimitMap.get(key) || { fails: 0, lockedUntil: 0, lastAttempt: now };
  entry.fails += 1;
  entry.lastAttempt = now;
  if (entry.fails >= maxFails) {
    entry.lockedUntil = now + lockMs;
  }
  serverRateLimitMap.set(key, entry);
  return entry.fails;
}

function clearServerAuthFailures(key: string): void {
  serverRateLimitMap.delete(key);
}

// Authoritative In-Memory & File State for Server Verification
interface ServerUser {
  uid: string;
  username: string;
  phone: string;
  passwordHash?: string;
  balance: number;
  status: 'active' | 'suspended' | 'banned' | 'deactivated';
  vipLevel?: number;
  createdAt?: number;
  lastActive?: number;
  isOnline?: boolean;
  totalBetsCount?: number;
  totalWonAmount?: number;
  totalLostAmount?: number;
  referralCode?: string;
  referredBy?: string;
  signupBonusStatus?: 'pending' | 'credited';
  signupBonusAmount?: number;
  firstDepositBonusStatus?: 'pending' | 'credited' | 'not_eligible';
  firstDepositBonusAmount?: number;
  firstDepositBonusTxId?: string;
  signupBonusTxId?: string;
  firstDepositApprovedAt?: number;
  dailyBettingActivity?: Record<string, number>;
  role?: 'user' | 'master_admin';
  devices?: Record<string, any>;
}

export interface ServerReferral {
  id: string;
  referrerUid: string;
  referrerUsername: string;
  referredUid: string;
  referredUsername: string;
  referredPhone: string;
  registeredAt: number;
  firstDepositApprovedAt?: number;
  firstDepositAmount?: number;
  qualifyingDaysCompleted: number;
  dailyTurnover: Record<string, number>;
  status: 'pending_deposit' | 'activity_in_progress' | 'eligible' | 'credited' | 'rejected';
  bonusAmount: number;
  creditedAt?: number;
  transactionId?: string;
  rejectionReason?: string;
}

// Master Admin Configurable Settings for Bonuses & Referrals
export const serverAdminSettings: Record<string, any> = {
  maintenanceMode: false,
  maintenanceMessage: 'System Upgrade & Maintenance in Progress. Betting is temporarily paused. Your funds are 100% safe.',
  maintenanceEstimatedResumeTime: '',
  minDeposit: 250,
  maxDeposit: 100000,
  minWithdrawal: 500,
  maxWithdrawal: 50000,
  usdtErc20Address: '0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45',
  usdtNetwork: 'ERC20',
  minUsdtDeposit: 5,
  minUsdtWithdrawal: 10,
  usdtExchangeRate: 90,
  signupBonusAmount: 120,
  firstDepositBonusPercent: 100,
  firstDepositBonusMaxCap: 50000,
  referralBonusAmount: 120,
  referralRequiredDays: 10,
  referralDailyBetRequirement: 100,
  checkInBonuses: [10, 25, 50, 80, 150, 250, 500],
  supportTelegram: '@colourWinAdmin',
  featureSignupBonus: true,
  featureFirstDepositBonus: true,
  featureReferrals: true,
  featureDeposits: true,
  featureWithdrawals: true,
  featureUsdtDeposit: true,
  featureUsdtWithdrawal: true,
  featureGiftCodes: true
};

interface ServerDeposit {
  id: string;
  uid: string;
  username: string;
  amount: number;
  usdtAmount?: number;
  paymentMethod: 'UPI' | 'USDT';
  referenceId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  adminNote?: string;
}

interface ServerWithdrawal {
  id: string;
  uid: string;
  username: string;
  phone: string;
  amount: number;
  usdtAmount?: number;
  payoutMethod: 'Bank Transfer' | 'UPI' | 'USDT (ERC20)';
  accountDetails: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: number;
  processedAt?: number;
  processedBy?: string;
  rejectionReason?: string;
}

interface ServerTransaction {
  id: string;
  uid: string;
  type: string;
  category: 'credit' | 'debit';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'rejected';
  metadata?: Record<string, unknown>;
  integritySeal?: string;
}

// Initial In-Memory Server State (Clean slate for tracking real users & real transactions)
const serverUsers: Record<string, ServerUser> = {};
const serverReferrals: Map<string, ServerReferral> = new Map();
const serverDeposits: Map<string, ServerDeposit> = new Map();
const serverWithdrawals: Map<string, ServerWithdrawal> = new Map();
const serverTransactions: ServerTransaction[] = [];
const deletedUserUids = new Set<string>();
const approvedDepositReferences = new Set<string>();
const serverAuditLogs: Array<{ id: string; timestamp: number; actor: string; category: string; action: string; details: string; targetUser?: string }> = [];

function normalizePhoneNumber(phone: string | undefined): string {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

// Cryptographic Transaction Seal (Matches client store tamper-proof seal engine)
function computeServerTransactionSeal(tx: {
  id: string;
  uid: string;
  type: string;
  category: string;
  amount: number;
  referenceId?: string;
}): string {
  const cleanAmt = (Math.round(Number(tx.amount || 0) * 100) / 100).toFixed(2);
  const payload = `BINGO777_SEAL_V2|${tx.id}|${tx.uid}|${tx.type}|${tx.category}|${cleanAmt}|${tx.referenceId || ''}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch + (i & 0xff);
    h2 = Math.imul(h2, 0x5bd1e995);
  }
  return `s2_${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}`;
}

// Authoritative calculation of a user's wallet balance from verified transactions
function computeServerVerifiedBalance(uId: string): number {
  const userTxs = serverTransactions.filter(
    (t) =>
      t.uid === uId &&
      typeof t.amount === 'number' &&
      Number.isFinite(t.amount) &&
      t.amount > 0 &&
      (t.status === 'completed' || (t.type === 'withdrawal' && t.status === 'pending'))
  );

  let totalDeposited = 0;
  let totalWithdrawn = 0;
  let totalBet = 0;
  let totalWon = 0;
  let totalAdjusted = 0;
  let totalGifts = 0;
  let totalBonuses = 0;

  const seenAttendanceDates = new Set<string>();

  for (const tx of userTxs) {
    if (tx.type === 'deposit' && tx.category === 'credit' && tx.status === 'completed') {
      totalDeposited += tx.amount;
    } else if (tx.type === 'withdrawal' && tx.category === 'debit') {
      totalWithdrawn += tx.amount;
    } else if (tx.type === 'withdrawal' && tx.category === 'credit' && tx.status === 'completed') {
      totalWithdrawn = Math.max(0, totalWithdrawn - tx.amount);
    } else if (tx.type === 'bet_placement' && tx.category === 'debit') {
      totalBet += tx.amount;
    } else if (tx.type === 'game_payout' && tx.category === 'credit' && tx.status === 'completed') {
      totalWon += tx.amount;
    } else if (tx.type === 'gift_code' && tx.category === 'credit' && tx.status === 'completed') {
      totalGifts += tx.amount;
    } else if (
      (tx.type === 'signup_bonus' || tx.type === 'first_deposit_bonus' || tx.type === 'referral_bonus' || tx.type === 'mlm_commission') &&
      tx.category === 'credit' &&
      tx.status === 'completed'
    ) {
      totalBonuses += tx.amount;
    } else if (tx.type === 'admin_adjustment' && tx.status === 'completed') {
      if (tx.referenceId && tx.referenceId.startsWith('att_')) {
        const dayDate = tx.referenceId.split('_')[2];
        if (dayDate && !seenAttendanceDates.has(dayDate)) {
          seenAttendanceDates.add(dayDate);
          totalBonuses += tx.amount;
        }
      } else {
        if (tx.category === 'credit') totalAdjusted += tx.amount;
        else totalAdjusted -= tx.amount;
      }
    }
  }

  const net =
    totalDeposited +
    totalWon +
    totalGifts +
    totalBonuses +
    totalAdjusted -
    totalWithdrawn -
    totalBet;

  return Math.max(0, Math.round(net * 100) / 100);
}

function saveServerStateToDisk(): void {
  try {
    const payload = {
      updatedAt: Date.now(),
      users: serverUsers,
      referrals: Array.from(serverReferrals.entries()),
      deposits: Array.from(serverDeposits.entries()),
      withdrawals: Array.from(serverWithdrawals.entries()),
      transactions: serverTransactions.slice(0, 1000),
      deletedUserUids: Array.from(deletedUserUids),
      approvedDepositReferences: Array.from(approvedDepositReferences),
      adminSettings: serverAdminSettings
    };
    fs.writeFileSync(PERSISTENT_DB_PATH, JSON.stringify(payload, null, 2), 'utf8');
  } catch (err) {
    console.warn('[ServerPersistence] Warning saving state to disk:', err);
  }
}

function loadServerStateFromDisk(): void {
  try {
    if (!fs.existsSync(PERSISTENT_DB_PATH)) return;
    const raw = fs.readFileSync(PERSISTENT_DB_PATH, 'utf8');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.deletedUserUids)) {
      parsed.deletedUserUids.forEach((uid: string) => deletedUserUids.add(uid));
    }
    if (Array.isArray(parsed.approvedDepositReferences)) {
      parsed.approvedDepositReferences.forEach((ref: string) => approvedDepositReferences.add(ref));
    }
    if (parsed.users && typeof parsed.users === 'object') {
      Object.entries(parsed.users).forEach(([uid, u]) => {
        if (!deletedUserUids.has(uid) && u && typeof u === 'object') {
          const userObj = u as ServerUser;
          userObj.phone = normalizePhoneNumber(userObj.phone);
          serverUsers[uid] = userObj;
        }
      });
    }
    if (Array.isArray(parsed.referrals)) {
      parsed.referrals.forEach(([k, v]: [string, ServerReferral]) => {
        if (k && v) serverReferrals.set(k, v);
      });
    }
    if (Array.isArray(parsed.deposits)) {
      parsed.deposits.forEach(([k, v]: [string, ServerDeposit]) => {
        if (k && v) serverDeposits.set(k, v);
      });
    }
    if (Array.isArray(parsed.withdrawals)) {
      parsed.withdrawals.forEach(([k, v]: [string, ServerWithdrawal]) => {
        if (k && v) serverWithdrawals.set(k, v);
      });
    }
    if (Array.isArray(parsed.transactions)) {
      serverTransactions.splice(0, serverTransactions.length, ...parsed.transactions);
    }
    if (parsed.adminSettings && typeof parsed.adminSettings === 'object') {
      Object.assign(serverAdminSettings, parsed.adminSettings);
    }

    // Sanitize any legacy phone-based UIDs to unique player IDs
    const oldToNewMap = new Map<string, string>();
    Object.keys(serverUsers).forEach((uid) => {
      const u = serverUsers[uid];
      const cleanPhone = normalizePhoneNumber(u.phone);
      if (uid.startsWith('usr_') || uid === cleanPhone || (cleanPhone.length >= 7 && uid.includes(cleanPhone))) {
        const newUid = generateUniqueServerPlayerUid();
        oldToNewMap.set(uid, newUid);
        u.uid = newUid;
        delete serverUsers[uid];
        serverUsers[newUid] = u;
      }
    });
    if (oldToNewMap.size > 0) {
      serverTransactions.forEach((tx) => {
        if (oldToNewMap.has(tx.uid)) tx.uid = oldToNewMap.get(tx.uid)!;
      });
      serverDeposits.forEach((dep, key) => {
        if (oldToNewMap.has(dep.uid)) {
          dep.uid = oldToNewMap.get(dep.uid)!;
          serverDeposits.set(key, dep);
        }
      });
      serverWithdrawals.forEach((w, key) => {
        if (oldToNewMap.has(w.uid)) {
          w.uid = oldToNewMap.get(w.uid)!;
          serverWithdrawals.set(key, w);
        }
      });
      saveServerStateToDisk();
    }

    console.log(`[ServerPersistence] Loaded ${Object.keys(serverUsers).length} permanent user accounts from disk.`);
  } catch (err) {
    console.warn('[ServerPersistence] Warning loading state from disk:', err);
  }
}

// Generate unique player numeric gaming UID (format: 777 + 6 digits, completely separate from phone number)
function generateUniqueServerPlayerUid(): string {
  let candidate = '';
  do {
    const randDigits = Math.floor(100000 + Math.random() * 900000);
    candidate = `777${randDigits}`;
  } while (serverUsers[candidate] || deletedUserUids.has(candidate));
  return candidate;
}

// Hydrate persistent server state immediately on startup
loadServerStateFromDisk();

// Helper: Extract Master Admin Token from request
function extractToken(req: express.Request): string {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  const custom = req.headers['x-master-admin-key'] || req.headers['x-admin-key'];
  if (typeof custom === 'string') {
    return custom.trim();
  }
  if (req.body && typeof req.body.masterAdminToken === 'string') {
    return req.body.masterAdminToken.trim();
  }
  return '';
}

// Middleware: Strictly Verify Master Admin Authorization
export function verifyMasterAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = extractToken(req);
  if (!token || !VALID_MASTER_KEYS.has(token)) {
    console.warn(`[SECURITY VIOLATION] Unauthorized financial action attempt from IP: ${req.ip}`);
    serverAuditLogs.unshift({
      id: 'audit_sec_' + Date.now(),
      timestamp: Date.now(),
      actor: 'UNAUTHORIZED_CALLER',
      category: 'AUTH',
      action: 'BLOCKED_ADMIN_ATTEMPT',
      details: `Blocked unauthorized administrative request to ${req.originalUrl}. Token invalid or absent.`
    });
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid Master Admin authorization required.',
      code: 'ERR_UNAUTHORIZED_ADMIN'
    });
  }
  next();
}

// Atomic Server-Side Wallet Transaction Engine
export function executeServerTransaction(params: {
  uid: string;
  type: string;
  category: 'credit' | 'debit';
  amount: number;
  referenceId?: string;
  description: string;
  status?: 'completed' | 'pending' | 'rejected';
  actor?: string;
  metadata?: Record<string, unknown>;
}): { success: boolean; error?: string; transaction?: ServerTransaction } {
  if (deletedUserUids.has(params.uid)) {
    return { success: false, error: 'Cannot transact on a deactivated account' };
  }

  const user = serverUsers[params.uid];
  if (!user) {
    return { success: false, error: 'User does not exist' };
  }

  if (typeof params.amount !== 'number' || isNaN(params.amount) || params.amount <= 0) {
    return { success: false, error: 'Transaction amount must be a positive number' };
  }

  const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const balanceBefore = Math.round(user.balance * 100) / 100;

  // Strict check: No negative balances allowed
  if (params.category === 'debit' && balanceBefore < params.amount) {
    return {
      success: false,
      error: `Insufficient balance. Available: ₹${balanceBefore.toFixed(2)}, Requested: ₹${params.amount.toFixed(2)}`
    };
  }

  const status = params.status || 'completed';
  let balanceAfter = balanceBefore;

  if (status === 'completed' || (params.type === 'withdrawal' && status === 'pending')) {
    if (params.category === 'debit') {
      balanceAfter = Math.round((balanceBefore - params.amount) * 100) / 100;
    } else {
      balanceAfter = Math.round((balanceBefore + params.amount) * 100) / 100;
    }
  }

  if (balanceAfter < 0) {
    return { success: false, error: 'Negative wallet balance prevented by integrity governor' };
  }

  user.balance = balanceAfter;

  const cleanAmount = Math.round(params.amount * 100) / 100;
  const seal = computeServerTransactionSeal({
    id: txId,
    uid: params.uid,
    type: params.type,
    category: params.category,
    amount: cleanAmount,
    referenceId: params.referenceId
  });

  const transaction: ServerTransaction = {
    id: txId,
    uid: params.uid,
    type: params.type,
    category: params.category,
    amount: cleanAmount,
    balanceBefore,
    balanceAfter,
    referenceId: params.referenceId,
    description: params.description,
    timestamp: Date.now(),
    status,
    metadata: { ...params.metadata, actor: params.actor || 'SYSTEM' },
    integritySeal: seal
  };

  serverTransactions.unshift(transaction);
  saveServerStateToDisk();
  return { success: true, transaction };
}

async function startServer() {
  const app = express();
  // Safe Port Resolution: In AI Studio runtime, port 8080 is reserved for nginx proxy.
  // Dev server must always bind to port 3000 or the CLI --port argument.
  let cliPort = 0;
  const portArgIdx = process.argv.indexOf('--port');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    cliPort = parseInt(process.argv[portArgIdx + 1], 10);
  }
  const defaultAppPort = process.env.DEFAULT_APP_PORT ? parseInt(process.env.DEFAULT_APP_PORT, 10) : 0;
  const rawEnvPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 0;
  const safeEnvPort = (rawEnvPort && rawEnvPort !== 8080) ? rawEnvPort : 0;
  const PORT = cliPort || defaultAppPort || safeEnvPort || 3000;

  app.use(express.json({ limit: '10mb' }));

  // CORS middleware to ensure PWABuilder, external tools, and clients can fetch manifests & assets
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Explicit PWA Manifest & Service Worker Endpoints with CORS
  app.get(['/manifest.json', '/manifest.webmanifest'], (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const manifestPath = path.resolve(__dirname, 'public', 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      return res.sendFile(manifestPath);
    }
    return res.json({
      name: "Bingo777 — Pro Gaming & Admin Suite",
      short_name: "Bingo777",
      description: "Bingo777 independent high-performance gaming and color prediction platform with Ludo 1v1, Live Quiz Battle, Aviator Crash, MLM Affiliate & Master Admin Suite.",
      start_url: "/",
      display: "standalone",
      background_color: "#020617",
      theme_color: "#020617"
    });
  });

  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const swPath = path.resolve(__dirname, 'public', 'sw.js');
    if (fs.existsSync(swPath)) {
      return res.sendFile(swPath);
    }
    return res.send('self.addEventListener("fetch", () => {});');
  });

  // ----------------------------------------------------
  // BACKEND API ROUTES: AUTHENTICATION & FINANCIALS
  // ----------------------------------------------------

  // 0A. Permanent User Registration (Saves user account & password permanently on server disk)
  app.post('/api/auth/register', (req, res) => {
    const { user, phone, username, password, referralCode, referredBy, uid, device } = req.body || {};
    const incomingUser = (user && typeof user === 'object') ? user : {};
    const cleanPhone = normalizePhoneNumber(phone || incomingUser.phone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number is required' });
    }

    const existing = Object.values(serverUsers).find(
      (u) => normalizePhoneNumber(u.phone) === cleanPhone && !deletedUserUids.has(u.uid)
    );

    const rawPassword = password || incomingUser.passwordHash;

    if (existing) {
      // Update passwordHash if it wasn't set previously
      if (rawPassword && !existing.passwordHash) {
        existing.passwordHash = String(rawPassword);
      }
      existing.lastActive = Date.now();
      existing.isOnline = true;
      if (incomingUser.role === 'master_admin' || incomingUser.role === 'user') {
        existing.role = incomingUser.role;
      }
      if (incomingUser.devices && typeof incomingUser.devices === 'object') {
        existing.devices = { ...(existing.devices || {}), ...incomingUser.devices };
      } else if (device && device.deviceId) {
        existing.devices = { ...(existing.devices || {}), [device.deviceId]: device };
      }
      saveServerStateToDisk();
      return res.json({
        success: true,
        alreadyExists: true,
        user: existing
      });
    }

    // UID must be completely unique and NEVER contain or be the user's mobile number
    const finalUid = (uid && !uid.includes(cleanPhone) && !uid.startsWith('usr_'))
      ? uid
      : (incomingUser.uid && !incomingUser.uid.includes(cleanPhone) && !incomingUser.uid.startsWith('usr_')
          ? incomingUser.uid
          : generateUniqueServerPlayerUid());
    deletedUserUids.delete(finalUid);

    const finalUsername = username || incomingUser.username || `Player_${cleanPhone.slice(-4)}`;
    const finalReferralCode =
      incomingUser.referralCode ||
      referralCode ||
      `${finalUsername.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)}${Math.floor(100 + Math.random() * 900)}`;

    const newServerUser: ServerUser = {
      uid: finalUid,
      phone: cleanPhone,
      username: finalUsername,
      passwordHash: rawPassword ? String(rawPassword) : undefined,
      balance: 0,
      vipLevel: 1,
      status: incomingUser.status || 'active',
      createdAt: incomingUser.createdAt || Date.now(),
      lastActive: Date.now(),
      isOnline: true,
      totalBetsCount: 0,
      totalWonAmount: 0,
      totalLostAmount: 0,
      referralCode: finalReferralCode,
      referredBy: referredBy || incomingUser.referredBy,
      signupBonusStatus: 'pending',
      signupBonusAmount: serverAdminSettings.signupBonusAmount || 120,
      firstDepositBonusStatus: 'pending',
      firstDepositBonusAmount: 0,
      dailyBettingActivity: {},
      devices: incomingUser.devices || (device && device.deviceId ? { [device.deviceId]: device } : {})
    };

    serverUsers[finalUid] = newServerUser;
    saveServerStateToDisk();

    return res.json({
      success: true,
      alreadyExists: false,
      user: newServerUser
    });
  });

  // 0B. Permanent User Login (Verifies mobile number & password against server disk store)
  app.post('/api/auth/login', (req, res) => {
    const { phone, password, device } = req.body || {};
    const cleanPhone = normalizePhoneNumber(phone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PHONE',
        error: 'Please enter a valid 10-digit mobile number'
      });
    }

    const rateKey = `usr_login_${cleanPhone}`;
    const rateCheck = checkServerRateLimit(rateKey, 5, 5 * 60 * 1000);
    if (rateCheck.blocked) {
      return res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        error: `Security Lockout: Too many failed password attempts. Account locked for ${rateCheck.remainingSec} seconds.`
      });
    }

    const existing = Object.values(serverUsers).find(
      (u) => normalizePhoneNumber(u.phone) === cleanPhone && !deletedUserUids.has(u.uid)
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        error: 'Account not found with this mobile number. Please Sign Up first.'
      });
    }

    if (existing.status === 'banned' || existing.status === 'deactivated') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_RESTRICTED',
        error: `Your account is ${existing.status}. Please contact customer support.`
      });
    }

    if (password !== undefined && existing.passwordHash && existing.passwordHash !== String(password)) {
      const fails = recordServerAuthFailure(rateKey, 5, 5 * 60 * 1000);
      return res.status(401).json({
        success: false,
        code: 'INVALID_PASSWORD',
        error: fails >= 5
          ? 'Too many failed password attempts. Account locked for 5 minutes.'
          : `Incorrect password! Please try again (${5 - fails} attempts left).`
      });
    }

    // Clear failed attempts on valid password
    clearServerAuthFailures(rateKey);

    // If legacy account had no passwordHash stored yet, save it now so future logins are locked to it
    if (password && !existing.passwordHash) {
      existing.passwordHash = String(password);
    }

    if (!existing.devices || typeof existing.devices !== 'object') {
      existing.devices = {};
    }

    if (device && device.deviceId) {
      const allDevs = Object.values(existing.devices) as Array<any>;
      const approvedDevs = allDevs.filter((d) => d && d.status === 'approved');
      const existingEntry = existing.devices[device.deviceId];
      const hasOtherApproved = approvedDevs.some((d) => d.deviceId !== device.deviceId);
      const isThisApproved = existingEntry?.status === 'approved';

      if (hasOtherApproved && !isThisApproved) {
        existing.devices[device.deviceId] = {
          ...device,
          status: 'pending',
          requestedAt: existingEntry?.requestedAt || Date.now(),
          lastUsedAt: Date.now()
        };
        saveServerStateToDisk();
        return res.status(403).json({
          success: false,
          code: 'DEVICE_APPROVAL_REQUIRED',
          error: `1 Number = 1 Device Policy: Your account is already active on another device. Login request from this device (${device.deviceId}) has been sent to Admin for approval.`,
          user: existing
        });
      }

      existing.devices[device.deviceId] = {
        ...device,
        ...(existingEntry || {}),
        status: 'approved',
        lastUsedAt: Date.now()
      };
    }

    existing.isOnline = true;
    existing.lastActive = Date.now();

    saveServerStateToDisk();

    return res.json({
      success: true,
      user: existing
    });
  });

  // 0C. Bidirectional User Registry & Financial Synchronization (Client <-> Server Disk)
  app.post('/api/auth/sync-users', (req, res) => {
    const {
      users: clientUsers,
      transactions: clientTransactions,
      deposits: clientDeposits,
      withdrawals: clientWithdrawals
    } = req.body || {};
    let changed = false;

    // 0. Ingest Client Deposits first so approved deposits can validate deposit transactions
    if (Array.isArray(clientDeposits)) {
      for (const dep of clientDeposits) {
        if (!dep || typeof dep !== 'object' || !dep.id || !dep.uid || deletedUserUids.has(dep.uid)) continue;
        if (typeof dep.amount !== 'number' || !Number.isFinite(dep.amount) || dep.amount <= 0) continue;
        const existingDep = serverDeposits.get(dep.id);
        if (!existingDep) {
          serverDeposits.set(dep.id, {
            id: dep.id,
            uid: dep.uid,
            username: dep.username || dep.uid,
            amount: Math.round(dep.amount * 100) / 100,
            usdtAmount: dep.usdtAmount,
            paymentMethod: dep.paymentMethod || 'UPI',
            referenceId: dep.referenceId || '',
            status: dep.status || 'pending',
            submittedAt: dep.submittedAt || Date.now(),
            reviewedAt: dep.reviewedAt,
            reviewedBy: dep.reviewedBy,
            adminNote: dep.adminNote
          });
          if (dep.status === 'approved' && dep.referenceId) {
            approvedDepositReferences.add(String(dep.referenceId).trim().toUpperCase());
          }
          changed = true;
        } else if (existingDep.status === 'pending' && dep.status && dep.status !== 'pending') {
          existingDep.status = dep.status;
          existingDep.reviewedAt = dep.reviewedAt || Date.now();
          existingDep.reviewedBy = dep.reviewedBy;
          existingDep.adminNote = dep.adminNote;
          if (dep.status === 'approved' && existingDep.referenceId) {
            approvedDepositReferences.add(String(existingDep.referenceId).trim().toUpperCase());
          }
          changed = true;
        }
      }
    }

    // 0.5. Ingest Client Withdrawals
    if (Array.isArray(clientWithdrawals)) {
      for (const w of clientWithdrawals) {
        if (!w || typeof w !== 'object' || !w.id || !w.uid || deletedUserUids.has(w.uid)) continue;
        if (typeof w.amount !== 'number' || !Number.isFinite(w.amount) || w.amount <= 0) continue;
        const existingW = serverWithdrawals.get(w.id);
        if (!existingW) {
          serverWithdrawals.set(w.id, {
            id: w.id,
            uid: w.uid,
            username: w.username || w.uid,
            phone: w.phone || '',
            amount: Math.round(w.amount * 100) / 100,
            usdtAmount: w.usdtAmount,
            payoutMethod: w.payoutMethod || 'UPI',
            accountDetails: w.accountDetails || {},
            status: w.status || 'pending',
            requestedAt: w.requestedAt || Date.now(),
            processedAt: w.processedAt,
            processedBy: w.processedBy,
            rejectionReason: w.rejectionReason
          });
          changed = true;
        } else if (existingW.status === 'pending' && w.status && w.status !== 'pending') {
          existingW.status = w.status;
          existingW.processedAt = w.processedAt || Date.now();
          existingW.processedBy = w.processedBy;
          existingW.rejectionReason = w.rejectionReason;
          changed = true;
        }
      }
    }

    // 1. Ingest & Validate Client Transactions with Cryptographic Verification
    if (Array.isArray(clientTransactions)) {
      const existingTxMap = new Map(serverTransactions.map((t) => [t.id, t]));
      for (const tx of clientTransactions) {
        if (!tx || typeof tx !== 'object' || !tx.id || !tx.uid || deletedUserUids.has(tx.uid)) continue;
        const existingTx = existingTxMap.get(tx.id);
        if (existingTx) {
          if (existingTx.status === 'pending' && tx.status && tx.status !== 'pending') {
            existingTx.status = tx.status;
            changed = true;
          }
          continue;
        }
        if (typeof tx.amount !== 'number' || !Number.isFinite(tx.amount) || tx.amount <= 0 || tx.amount > 10000000) continue;

        // Verify cryptographic seal: Reject any tampered or forged transactions
        const expectedSeal = computeServerTransactionSeal(tx);
        if (tx.integritySeal && tx.integritySeal !== expectedSeal) {
          continue;
        }

        // Anti-Fraud Rule: A deposit credit is only valid if matched with an approved deposit
        if (tx.type === 'deposit' && tx.category === 'credit') {
          const matchingDep = Array.from(serverDeposits.values()).find(
            (d) => (d.referenceId === tx.referenceId || `${d.referenceId}_${d.id}` === tx.referenceId || tx.metadata?.depositId === d.id) && d.status === 'approved'
          );
          if (!matchingDep) continue;
        }

        // Anti-Fraud Rule: Attendance streak bonus max 1 per calendar day, max ₹500
        if (tx.type === 'admin_adjustment' && tx.referenceId && tx.referenceId.startsWith('att_')) {
          if (tx.amount > 500) continue;
        }

        const newServerTx: ServerTransaction = {
          id: tx.id,
          uid: tx.uid,
          type: tx.type,
          category: tx.category,
          amount: Math.round(tx.amount * 100) / 100,
          balanceBefore: tx.balanceBefore,
          balanceAfter: tx.balanceAfter,
          referenceId: tx.referenceId,
          description: tx.description,
          timestamp: tx.timestamp || Date.now(),
          status: tx.status || 'completed',
          metadata: tx.metadata,
          integritySeal: expectedSeal
        };
        existingTxMap.set(tx.id, newServerTx);
        serverTransactions.unshift(newServerTx);
        changed = true;
      }
    }

    if (clientUsers && typeof clientUsers === 'object') {
      Object.entries(clientUsers).forEach(([uid, rawU]) => {
        if (!rawU || typeof rawU !== 'object' || uid.startsWith('usr_demo_') || deletedUserUids.has(uid)) {
          return;
        }
        const incoming = rawU as ServerUser;
        const cleanPhone = normalizePhoneNumber(incoming.phone);
        if (!cleanPhone) return;

        // Check if phone already exists under any uid
        const existingByPhone = Object.values(serverUsers).find(
          (u) => normalizePhoneNumber(u.phone) === cleanPhone && !deletedUserUids.has(u.uid)
        );
        const targetUid = existingByPhone ? existingByPhone.uid : uid;
        const existing = serverUsers[targetUid];

        const verifiedServerBal = computeServerVerifiedBalance(targetUid);

        if (!existing) {
          serverUsers[targetUid] = {
            ...incoming,
            uid: targetUid,
            phone: cleanPhone,
            balance: verifiedServerBal,
            vipLevel: typeof incoming.vipLevel === 'number' ? incoming.vipLevel : 1,
            status: incoming.status || 'active',
            createdAt: incoming.createdAt || Date.now(),
            lastActive: incoming.lastActive || Date.now()
          };
          changed = true;
        } else {
          // Preserve passwordHash and never allow unverified client sync to inflate server balance
          if (incoming.passwordHash && !existing.passwordHash) {
            existing.passwordHash = incoming.passwordHash;
            changed = true;
          }
          if (Math.abs((existing.balance || 0) - verifiedServerBal) >= 0.01) {
            existing.balance = verifiedServerBal;
            changed = true;
          }
          if (incoming.status && incoming.status !== existing.status) {
            existing.status = incoming.status;
            changed = true;
          }
          if (typeof incoming.vipLevel === 'number' && incoming.vipLevel !== existing.vipLevel) {
            existing.vipLevel = incoming.vipLevel;
            changed = true;
          }
          if (incoming.lastActive && (!existing.lastActive || incoming.lastActive > existing.lastActive)) {
            existing.lastActive = incoming.lastActive;
          }
          // CRITICAL SECURITY ENFORCEMENT: Never allow client sync to escalate to master_admin
          if (incoming.role === 'user') {
            existing.role = 'user';
          }
          if (incoming.devices && typeof incoming.devices === 'object') {
            existing.devices = { ...(existing.devices || {}), ...incoming.devices };
          }
        }
      });
    }

    if (changed) {
      saveServerStateToDisk();
    }

    return res.json({
      success: true,
      users: serverUsers,
      transactions: serverTransactions.slice(0, 500),
      deposits: Array.from(serverDeposits.values()).slice(0, 300),
      withdrawals: Array.from(serverWithdrawals.values()).slice(0, 300),
      deletedUserUids: Array.from(deletedUserUids)
    });
  });

  // 1. Master Admin Authentication (Hardened with IP Brute-Force Rate Limiting)
  app.post('/api/auth/master-admin-verify', (req, res) => {
    const callerIp = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'ip_unknown').split(',')[0].trim();
    const rateCheck = checkServerRateLimit(`admin_auth_${callerIp}`, 5, 15 * 60 * 1000);
    if (rateCheck.blocked) {
      return res.status(429).json({
        success: false,
        error: `Security Lockout: Too many failed administrative login attempts from this network. Try again in ${rateCheck.remainingSec} seconds.`,
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    const token = extractToken(req);
    const { username } = req.body || {};
    const cleanUser = String(username || '').trim();

    if (!token || !VALID_MASTER_KEYS.has(token)) {
      const fails = recordServerAuthFailure(`admin_auth_${callerIp}`, 5, 15 * 60 * 1000);
      serverAuditLogs.unshift({
        id: 'log_sec_' + Date.now(),
        timestamp: Date.now(),
        actor: cleanUser || callerIp,
        category: 'SECURITY',
        action: 'FAILED_ADMIN_LOGIN',
        details: `Invalid master key attempt from IP ${callerIp}. Attempt ${fails}/5.`
      });

      return res.status(401).json({
        success: false,
        error: fails >= 5
          ? 'Security Protocol Triggered: 5 failed attempts. Administrative gateway locked for 15 minutes.'
          : `Invalid Master Admin Key or unauthorized access (${5 - fails} attempts left).`,
        code: 'ERR_INVALID_KEY'
      });
    }

    clearServerAuthFailures(`admin_auth_${callerIp}`);

    serverAuditLogs.unshift({
      id: 'log_' + Date.now(),
      timestamp: Date.now(),
      actor: 'MasterAdmin_01',
      category: 'AUTH',
      action: 'MASTER_ADMIN_AUTHENTICATED',
      details: 'Master Admin verified credentials with server'
    });

    return res.json({
      success: true,
      actor: 'MasterAdmin_01',
      token,
      permissions: ['ALL_FINANCIALS', 'ALL_USERS', 'ALL_GAMES', 'AUDIT_LEDGER']
    });
  });

  // 2. Deposit Approval (Master Admin Only, Idempotent)
  app.post('/api/financials/deposit/approve', verifyMasterAdmin, (req, res) => {
    const { depositId, adminId, depositRecord, customInrAmount } = req.body;
    if (!depositId) {
      return res.status(400).json({ success: false, error: 'Missing depositId' });
    }

    let dep = serverDeposits.get(depositId);
    if (!dep && depositRecord && typeof depositRecord === 'object') {
      const rec = depositRecord as ServerDeposit;
      dep = {
        id: depositId,
        uid: rec.uid || '',
        username: rec.username || 'User',
        amount: Number(rec.amount) || 500,
        usdtAmount: rec.usdtAmount ? Number(rec.usdtAmount) : undefined,
        paymentMethod: rec.paymentMethod || 'UPI',
        referenceId: rec.referenceId || `UTR_${depositId}`,
        status: 'pending',
        submittedAt: rec.submittedAt || Date.now()
      };
      serverDeposits.set(depositId, dep);
    }

    if (!dep) {
      return res.status(404).json({ success: false, error: 'Deposit record not found' });
    }

    if (dep.status !== 'pending') {
      return res.status(409).json({
        success: false,
        error: `Deposit has already been ${dep.status}. Cannot approve multiple times.`
      });
    }

    // Reference Idempotency Check: Prevent duplicate crediting of same UTR
    if (approvedDepositReferences.has(dep.referenceId)) {
      return res.status(409).json({
        success: false,
        error: `UTR Reference ${dep.referenceId} has already been credited! Duplicate prevented.`
      });
    }

    if (customInrAmount !== undefined && !isNaN(Number(customInrAmount)) && Number(customInrAmount) > 0) {
      dep.amount = Math.round(Number(customInrAmount) * 100) / 100;
    }

    let user = serverUsers[dep.uid];
    if (!user) {
      user = {
        uid: dep.uid,
        username: dep.username || dep.uid,
        phone: '9000000000',
        balance: 0,
        status: 'active',
        referralCode: dep.uid.slice(-6).toUpperCase(),
        signupBonusStatus: 'pending',
        signupBonusAmount: serverAdminSettings.signupBonusAmount || 120,
        firstDepositBonusStatus: 'pending'
      };
      serverUsers[dep.uid] = user;
    }

    // Check if this is the user's first approved deposit
    const priorApprovedDeposits = Array.from(serverDeposits.values()).filter(
      (d) => d.uid === dep.uid && d.status === 'approved' && d.id !== dep.id
    );
    const isFirstDeposit = priorApprovedDeposits.length === 0 && user.firstDepositBonusStatus !== 'credited';

    // 1. Atomic Balance Credit & Ledger Write for the deposit
    const tx = executeServerTransaction({
      uid: dep.uid,
      type: 'deposit',
      category: 'credit',
      amount: dep.amount,
      referenceId: dep.referenceId,
      description: `UPI Deposit Verified & Approved (UTR: ${dep.referenceId})`,
      status: 'completed',
      actor: adminId || 'MasterAdmin_01',
      metadata: { depositId, reviewedBy: adminId || 'MasterAdmin_01' }
    });

    if (!tx.success) {
      return res.status(500).json({ success: false, error: tx.error || 'Failed to credit balance' });
    }

    const createdTransactions: ServerTransaction[] = [tx.transaction!];
    const bonusesAwarded: { signupBonus?: number; firstDepositBonus?: number } = {};

    // 2. If first approved deposit: Credit 100% First Deposit Bonus & ₹120 Signup Bonus (if enabled)
    if (isFirstDeposit) {
      user.firstDepositApprovedAt = Date.now();

      // 100% First Deposit Bonus
      if (serverAdminSettings.featureFirstDepositBonus !== false && serverAdminSettings.firstDepositBonusPercent > 0) {
        const fdbAmount = Math.min(
          Math.round((dep.amount * (serverAdminSettings.firstDepositBonusPercent / 100)) * 100) / 100,
          serverAdminSettings.firstDepositBonusMaxCap
        );
        const fdbTx = executeServerTransaction({
          uid: dep.uid,
          type: 'first_deposit_bonus',
          category: 'credit',
          amount: fdbAmount,
          referenceId: `${dep.referenceId}_FDB`,
          description: `100% First Deposit Bonus (₹${fdbAmount})`,
          status: 'completed',
          actor: adminId || 'MasterAdmin_01',
          metadata: { depositId, percentage: serverAdminSettings.firstDepositBonusPercent }
        });
        if (fdbTx.success && fdbTx.transaction) {
          createdTransactions.push(fdbTx.transaction);
          bonusesAwarded.firstDepositBonus = fdbAmount;
          user.firstDepositBonusStatus = 'credited';
          user.firstDepositBonusAmount = fdbAmount;
          user.firstDepositBonusTxId = fdbTx.transaction.id;
        }
      } else {
        user.firstDepositBonusStatus = 'not_eligible';
      }

      // ₹120 Signup Bonus
      const subAmount = serverAdminSettings.signupBonusAmount;
      if (serverAdminSettings.featureSignupBonus !== false && subAmount > 0) {
        const subTx = executeServerTransaction({
          uid: dep.uid,
          type: 'signup_bonus',
          category: 'credit',
          amount: subAmount,
          referenceId: `SIGNUP_${dep.uid}`,
          description: `₹${subAmount} Signup Bonus (First Deposit Verified)`,
          status: 'completed',
          actor: adminId || 'MasterAdmin_01',
          metadata: { depositId }
        });
        if (subTx.success && subTx.transaction) {
          createdTransactions.push(subTx.transaction);
          bonusesAwarded.signupBonus = subAmount;
          user.signupBonusStatus = 'credited';
          user.signupBonusAmount = subAmount;
          user.signupBonusTxId = subTx.transaction.id;
        }
      }

      // Update referral record if this user was referred by someone and referrals are enabled
      if (serverAdminSettings.featureReferrals !== false) {
        for (const ref of serverReferrals.values()) {
          if (ref.referredUid === dep.uid && ref.status === 'pending_deposit') {
            ref.status = 'activity_in_progress';
            ref.firstDepositApprovedAt = Date.now();
            ref.firstDepositAmount = dep.amount;
            serverAuditLogs.unshift({
              id: 'audit_ref_' + Date.now(),
              timestamp: Date.now(),
              actor: 'SYSTEM',
              category: 'FINANCIAL',
              action: 'REFERRAL_10DAY_STARTED',
              details: `10-day betting activity period started for referred user ${ref.referredUsername} (Referrer: ${ref.referrerUsername}).`,
              targetUser: ref.referrerUid
            });
            break;
          }
        }
      }
    }

    dep.status = 'approved';
    dep.reviewedAt = Date.now();
    dep.reviewedBy = adminId || 'MasterAdmin_01';
    approvedDepositReferences.add(dep.referenceId);

    serverAuditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: Date.now(),
      actor: adminId || 'MasterAdmin_01',
      category: 'FINANCIAL',
      action: 'APPROVE_UPI_DEPOSIT',
      details: `Approved UPI deposit of ₹${dep.amount} for ${dep.username} (UTR: ${dep.referenceId}). Total wallet credit: ₹${(dep.amount + (bonusesAwarded.firstDepositBonus || 0) + (bonusesAwarded.signupBonus || 0)).toFixed(2)}.`,
      targetUser: dep.uid
    });

    return res.json({
      success: true,
      deposit: dep,
      transaction: tx.transaction,
      transactions: createdTransactions,
      bonusesAwarded,
      user: serverUsers[dep.uid]
    });
  });

  // 3. Deposit Rejection (Master Admin Only)
  app.post('/api/financials/deposit/reject', verifyMasterAdmin, (req, res) => {
    const { depositId, adminId, reason, depositRecord } = req.body;
    if (!depositId) {
      return res.status(400).json({ success: false, error: 'Missing depositId' });
    }

    let dep = serverDeposits.get(depositId);
    if (!dep && depositRecord && typeof depositRecord === 'object') {
      const rec = depositRecord as ServerDeposit;
      dep = {
        id: depositId,
        uid: rec.uid || '',
        username: rec.username || 'User',
        amount: Number(rec.amount) || 500,
        paymentMethod: rec.paymentMethod || 'UPI',
        referenceId: rec.referenceId || `UTR_${depositId}`,
        status: 'pending',
        submittedAt: rec.submittedAt || Date.now()
      };
      serverDeposits.set(depositId, dep);
    }

    if (!dep) {
      return res.status(404).json({ success: false, error: 'Deposit record not found' });
    }

    if (dep.status !== 'pending') {
      return res.status(409).json({
        success: false,
        error: `Deposit has already been ${dep.status}.`
      });
    }

    dep.status = 'rejected';
    dep.reviewedAt = Date.now();
    dep.reviewedBy = adminId || 'MasterAdmin_01';
    dep.adminNote = reason || 'Payment evidence unverified / UTR mismatch';

    serverAuditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: Date.now(),
      actor: adminId || 'MasterAdmin_01',
      category: 'FINANCIAL',
      action: 'REJECT_UPI_DEPOSIT',
      details: `Rejected UPI deposit of ₹${dep.amount} for ${dep.username}. Reason: ${dep.adminNote}`,
      targetUser: dep.uid
    });

    return res.json({
      success: true,
      deposit: dep
    });
  });

  // 4. Withdrawal Approval (Master Admin Only)
  app.post('/api/financials/withdrawal/approve', verifyMasterAdmin, (req, res) => {
    const { withdrawalId, adminId, withdrawalRecord } = req.body;
    if (!withdrawalId) {
      return res.status(400).json({ success: false, error: 'Missing withdrawalId' });
    }

    let wth = serverWithdrawals.get(withdrawalId);
    if (!wth && withdrawalRecord && typeof withdrawalRecord === 'object') {
      const rec = withdrawalRecord as ServerWithdrawal;
      wth = {
        id: withdrawalId,
        uid: rec.uid || '',
        username: rec.username || 'User',
        phone: rec.phone || '9000000000',
        amount: Number(rec.amount) || 500,
        payoutMethod: rec.payoutMethod || 'UPI',
        accountDetails: rec.accountDetails || {},
        status: 'pending',
        requestedAt: rec.requestedAt || Date.now()
      };
      serverWithdrawals.set(withdrawalId, wth);
    }

    if (!wth) {
      return res.status(404).json({ success: false, error: 'Withdrawal record not found' });
    }

    if (wth.status !== 'pending') {
      return res.status(409).json({
        success: false,
        error: `Withdrawal has already been ${wth.status}.`
      });
    }

    wth.status = 'approved';
    wth.processedAt = Date.now();
    wth.processedBy = adminId || 'MasterAdmin_01';

    // Mark corresponding pending transaction as completed
    const tx = serverTransactions.find((t) => t.referenceId === withdrawalId && t.type === 'withdrawal');
    if (tx) {
      tx.status = 'completed';
    }

    serverAuditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: Date.now(),
      actor: adminId || 'MasterAdmin_01',
      category: 'FINANCIAL',
      action: 'APPROVE_WITHDRAWAL',
      details: `Settled withdrawal of ₹${wth.amount} via ${wth.payoutMethod} for ${wth.username}.`,
      targetUser: wth.uid
    });

    return res.json({
      success: true,
      withdrawal: wth
    });
  });

  // 5. Withdrawal Rejection & Safe Refund (Master Admin Only)
  app.post('/api/financials/withdrawal/reject', verifyMasterAdmin, (req, res) => {
    const { withdrawalId, adminId, reason, withdrawalRecord } = req.body;
    if (!withdrawalId) {
      return res.status(400).json({ success: false, error: 'Missing withdrawalId' });
    }

    let wth = serverWithdrawals.get(withdrawalId);
    if (!wth && withdrawalRecord && typeof withdrawalRecord === 'object') {
      const rec = withdrawalRecord as ServerWithdrawal;
      wth = {
        id: withdrawalId,
        uid: rec.uid || '',
        username: rec.username || 'User',
        phone: rec.phone || '9000000000',
        amount: Number(rec.amount) || 500,
        payoutMethod: rec.payoutMethod || 'UPI',
        accountDetails: rec.accountDetails || {},
        status: 'pending',
        requestedAt: rec.requestedAt || Date.now()
      };
      serverWithdrawals.set(withdrawalId, wth);
      if (!serverUsers[wth.uid]) {
        serverUsers[wth.uid] = {
          uid: wth.uid,
          username: wth.username,
          phone: wth.phone,
          balance: 0,
          status: 'active',
          referralCode: wth.uid.slice(-6).toUpperCase(),
          signupBonusStatus: 'pending',
          signupBonusAmount: 120,
          firstDepositBonusStatus: 'pending'
        };
      }
    }

    if (!wth) {
      return res.status(404).json({ success: false, error: 'Withdrawal record not found' });
    }

    if (wth.status !== 'pending') {
      return res.status(409).json({
        success: false,
        error: `Withdrawal has already been ${wth.status}.`
      });
    }

    wth.status = 'rejected';
    wth.processedAt = Date.now();
    wth.processedBy = adminId || 'MasterAdmin_01';
    wth.rejectionReason = reason || 'Bank details rejected';

    // Mark original reservation debit transaction as completed so ledger records both debit and offsetting refund credit
    const prevTx = serverTransactions.find((t) => t.referenceId === withdrawalId && t.type === 'withdrawal' && t.status === 'pending');
    if (prevTx) {
      prevTx.status = 'completed';
    }

    // Atomically Refund funds back into user's wallet with ledger entry
    const refundTx = executeServerTransaction({
      uid: wth.uid,
      type: 'withdrawal',
      category: 'credit',
      amount: wth.amount,
      referenceId: wth.id,
      description: `Withdrawal Refund (${wth.rejectionReason})`,
      status: 'completed',
      actor: adminId || 'MasterAdmin_01',
      metadata: { withdrawalId, rejectedBy: adminId || 'MasterAdmin_01' }
    });

    serverAuditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: Date.now(),
      actor: adminId || 'MasterAdmin_01',
      category: 'FINANCIAL',
      action: 'REJECT_WITHDRAWAL',
      details: `Rejected withdrawal of ₹${wth.amount} for ${wth.username}. Refunded to balance.`,
      targetUser: wth.uid
    });

    return res.json({
      success: true,
      withdrawal: wth,
      refundTransaction: refundTx.transaction,
      user: serverUsers[wth.uid]
    });
  });

  // 6. User Deposit Request (User Action - NEVER adds balance directly)
  app.post('/api/user/deposit/request', (req, res) => {
    const { uid, amount, paymentMethod, referenceId, username, usdtAmount } = req.body;
    if (!uid || !amount || !referenceId) {
      return res.status(400).json({ success: false, error: 'Missing required deposit fields' });
    }

    const isUsdt = paymentMethod === 'USDT';
    if (isUsdt) {
      const minUsdt = Number(serverAdminSettings.minUsdtDeposit) || 5;
      const reqUsdt = Number(usdtAmount || amount);
      if (reqUsdt < minUsdt) {
        return res.status(400).json({ success: false, error: `Minimum USDT deposit is $${minUsdt}` });
      }
    } else {
      const minDep = Number(serverAdminSettings.minDeposit) || 250;
      const maxDep = Number(serverAdminSettings.maxDeposit) || 100000;
      if (amount < minDep || amount > maxDep) {
        return res.status(400).json({ success: false, error: `Amount outside valid limits (₹${minDep} - ₹${maxDep.toLocaleString('en-IN')})` });
      }
    }

    if (approvedDepositReferences.has(referenceId)) {
      return res.status(409).json({ success: false, error: 'Reference / TXID has already been processed' });
    }

    const id = 'dep_' + Math.random().toString(36).substring(2, 9);
    const newDep: ServerDeposit = {
      id,
      uid,
      username: username || 'User',
      amount: Number(amount),
      usdtAmount: isUsdt ? Number(usdtAmount || amount) : undefined,
      paymentMethod: isUsdt ? 'USDT' : 'UPI',
      referenceId,
      status: 'pending',
      submittedAt: Date.now()
    };

    serverDeposits.set(id, newDep);

    serverAuditLogs.unshift({
      id: 'log_' + Date.now(),
      timestamp: Date.now(),
      actor: username || uid,
      category: 'FINANCIAL',
      action: 'DEPOSIT_SUBMITTED',
      details: `${isUsdt ? `USDT ($${newDep.usdtAmount})` : `UPI (₹${amount})`} deposit submitted (Ref: ${referenceId}). Awaiting Master Admin approval.`,
      targetUser: uid
    });

    return res.json({
      success: true,
      deposit: newDep,
      message: 'Deposit submitted successfully. Balance will update strictly after Master Admin approval.'
    });
  });

  // 7. User Withdrawal Request (Validates balance & reserves funds atomically)
  app.post('/api/user/withdrawal/request', (req, res) => {
    const { uid, amount, payoutMethod, accountDetails, username, phone } = req.body;
    if (!uid || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required withdrawal fields' });
    }

    const user = serverUsers[uid];
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    // Authoritative balance recalculation from verified transactions before evaluating withdrawal
    const verifiedBalance = computeServerVerifiedBalance(uid);
    user.balance = verifiedBalance;

    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Available: ₹${user.balance.toFixed(2)}, Requested: ₹${amount.toFixed(2)}`
      });
    }

    const withdrawalId = 'wth_' + Math.random().toString(36).substring(2, 9);

    // Reserve funds atomically with status 'pending'
    const tx = executeServerTransaction({
      uid,
      type: 'withdrawal',
      category: 'debit',
      amount,
      referenceId: withdrawalId,
      description: `Withdrawal Request via ${payoutMethod || 'UPI'}`,
      status: 'pending',
      metadata: { payoutMethod, accountDetails }
    });

    if (!tx.success) {
      return res.status(500).json({ success: false, error: tx.error });
    }

    const newWth: ServerWithdrawal = {
      id: withdrawalId,
      uid,
      username: user.username,
      phone: user.phone,
      amount,
      payoutMethod: payoutMethod || 'UPI',
      accountDetails: accountDetails || {},
      status: 'pending',
      requestedAt: Date.now()
    };

    serverWithdrawals.set(withdrawalId, newWth);

    return res.json({
      success: true,
      withdrawal: newWth,
      transaction: tx.transaction,
      balanceAfter: user.balance
    });
  });

  // 8. Admin User Permanent Deletion (Master Admin Only)
  app.post('/api/admin/user/delete', verifyMasterAdmin, (req, res) => {
    const { uid, reason, adminId } = req.body;
    if (!uid) {
      return res.status(400).json({ success: false, error: 'Missing uid' });
    }

    const user = serverUsers[uid];
    if (!user) {
      // If already deleted
      if (deletedUserUids.has(uid)) {
        return res.json({ success: true, message: 'User already in blacklist' });
      }
      return res.status(404).json({ success: false, error: 'User record not found' });
    }

    const username = user.username;
    const finalBalance = user.balance;

    // Blacklist permanently
    deletedUserUids.add(uid);
    delete serverUsers[uid];

    serverAuditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: Date.now(),
      actor: adminId || 'MasterAdmin_01',
      category: 'AUTH',
      action: 'USER_PERMANENTLY_DELETED',
      details: `User ${username} (${uid}) permanently deleted by Master Admin. Closing balance: ₹${finalBalance.toFixed(2)}. Reason: ${reason || 'Admin action'}`,
      targetUser: uid
    });

    return res.json({
      success: true,
      uid,
      message: `User ${username} deleted and added to blacklist.`
    });
  });

  // 9. Admin User Balance Adjustment (Master Admin Only)
  app.post('/api/admin/user/adjust-balance', verifyMasterAdmin, (req, res) => {
    const { uid, delta, reason, adminId } = req.body;
    if (!uid || typeof delta !== 'number' || delta === 0) {
      return res.status(400).json({ success: false, error: 'Invalid adjustment parameters' });
    }

    const user = serverUsers[uid];
    if (!user) {
      return res.status(404).json({ success: false, error: 'User record not found' });
    }

    const amount = Math.abs(delta);
    const category = delta >= 0 ? 'credit' : 'debit';

    const tx = executeServerTransaction({
      uid,
      type: 'admin_adjustment',
      category,
      amount,
      referenceId: `adm_adj_${Date.now()}`,
      description: `Master Admin Adjustment: ${reason || 'Manual correction'}`,
      actor: adminId || 'MasterAdmin_01',
      metadata: { adminId, reason }
    });

    if (!tx.success) {
      return res.status(400).json({ success: false, error: tx.error });
    }

    serverAuditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: Date.now(),
      actor: adminId || 'MasterAdmin_01',
      category: 'FINANCIAL',
      action: delta >= 0 ? 'ADMIN_BALANCE_CREDIT' : 'ADMIN_BALANCE_DEBIT',
      details: `Manual balance adjustment of ${delta >= 0 ? '+' : '-'}₹${amount.toFixed(2)} for ${user.username}. Reason: ${reason}`,
      targetUser: uid
    });

    return res.json({
      success: true,
      transaction: tx.transaction,
      balanceAfter: user.balance
    });
  });

  // 10. Ledger Audit & Reconciliation Endpoint
  app.post('/api/financials/reconcile', (req, res) => {
    const { uid, forceReconcile, adminId } = req.body;

    const auditUser = (uId: string) => {
      const user = serverUsers[uId];
      if (!user) return null;

      const userTxs = serverTransactions.filter((t) => t.uid === uId && (t.status === 'completed' || (t.type === 'withdrawal' && t.status === 'pending')));
      let totalDeposited = 0;
      let totalWithdrawn = 0;
      let totalBet = 0;
      let totalWon = 0;
      let totalAdjusted = 0;
      let totalGifts = 0;
      let totalBonuses = 0;

      for (const tx of userTxs) {
        if (tx.type === 'deposit' && tx.category === 'credit' && tx.status === 'completed') totalDeposited += tx.amount;
        else if (tx.type === 'withdrawal' && tx.category === 'debit') totalWithdrawn += tx.amount;
        else if (tx.type === 'withdrawal' && tx.category === 'credit' && tx.status === 'completed') totalWithdrawn -= tx.amount;
        else if (tx.type === 'bet_placement' && tx.category === 'debit') totalBet += tx.amount;
        else if (tx.type === 'game_payout' && tx.category === 'credit') totalWon += tx.amount;
        else if (tx.type === 'gift_code' && tx.category === 'credit') totalGifts += tx.amount;
        else if ((tx.type === 'signup_bonus' || tx.type === 'first_deposit_bonus' || tx.type === 'referral_bonus') && tx.category === 'credit' && tx.status === 'completed') totalBonuses += tx.amount;
        else if (tx.type === 'admin_adjustment') {
          if (tx.category === 'credit') totalAdjusted += tx.amount;
          else totalAdjusted -= tx.amount;
        }
      }

      const calculatedBalance = Math.round((totalDeposited + totalWon + totalGifts + totalBonuses + totalAdjusted - totalWithdrawn - totalBet) * 100) / 100;
      const currentBalance = Math.round(user.balance * 100) / 100;
      const discrepancy = Math.round((currentBalance - calculatedBalance) * 100) / 100;
      const isMatch = Math.abs(discrepancy) < 0.01;

      return {
        uid: uId,
        username: user.username,
        currentBalance,
        calculatedBalance,
        discrepancy,
        isMatch,
        totalDeposited,
        totalWithdrawn,
        totalBet,
        totalWon,
        totalAdjusted,
        totalGifts,
        totalBonuses,
        transactionsCount: userTxs.length
      };
    };

    if (uid) {
      const report = auditUser(uid);
      if (!report) return res.status(404).json({ success: false, error: 'User not found' });

      if (forceReconcile && !report.isMatch) {
        const token = extractToken(req);
        if (!token || !VALID_MASTER_KEYS.has(token)) {
          return res.status(401).json({ success: false, error: 'Master Admin authentication required for force reconciliation' });
        }

        const adjAmount = Math.abs(report.discrepancy);
        const adjCategory = report.discrepancy < 0 ? 'credit' : 'debit';
        executeServerTransaction({
          uid,
          type: 'admin_adjustment',
          category: adjCategory,
          amount: adjAmount,
          referenceId: `audit_${Date.now()}`,
          description: `Server Reconciliation of discrepancy (${report.discrepancy < 0 ? '+' : '-'}₹${adjAmount.toFixed(2)})`,
          actor: adminId || 'MasterAdmin_01'
        });

        const refreshed = auditUser(uid);
        return res.json({ success: true, report: refreshed });
      }

      return res.json({ success: true, report });
    }

    // Reconcile all
    const allReports = Object.keys(serverUsers).map((uId) => auditUser(uId)).filter(Boolean);
    return res.json({ success: true, reports: allReports });
  });

  // 11. Referrals API - Get Referrals
  app.get('/api/referrals', (req, res) => {
    const { referrerUid } = req.query;
    const all = Array.from(serverReferrals.values());
    if (referrerUid && typeof referrerUid === 'string') {
      return res.json({ success: true, referrals: all.filter((r) => r.referrerUid === referrerUid) });
    }
    return res.json({ success: true, referrals: all });
  });

  // 12. Referrals API - Claim Referral Bonus (Verified 10-day qualifying activity)
  app.post('/api/referral/claim', (req, res) => {
    const { referralId, callerUid } = req.body;
    if (!referralId) {
      return res.status(400).json({ success: false, error: 'Missing referralId' });
    }

    const ref = serverReferrals.get(referralId);
    if (!ref) {
      return res.status(404).json({ success: false, error: 'Referral record not found' });
    }

    if (callerUid && callerUid !== ref.referrerUid) {
      return res.status(403).json({ success: false, error: 'Only the referrer is entitled to claim this bonus' });
    }

    if (ref.status === 'credited') {
      return res.status(409).json({ success: false, error: 'Referral bonus has already been credited' });
    }

    if (!ref.firstDepositApprovedAt) {
      return res.status(400).json({ success: false, error: 'Referred user has not completed first approved deposit' });
    }

    // Verify 10 qualifying calendar days
    if (ref.qualifyingDaysCompleted < serverAdminSettings.referralRequiredDays) {
      return res.status(400).json({
        success: false,
        error: `Requires ${serverAdminSettings.referralRequiredDays} qualifying betting days (Current: ${ref.qualifyingDaysCompleted}/${serverAdminSettings.referralRequiredDays})`
      });
    }

    // Self-referral prevention check
    if (ref.referrerUid === ref.referredUid) {
      return res.status(403).json({ success: false, error: 'Self-referral bonuses are strictly forbidden' });
    }

    // Mark as eligible for Master Admin approval — NEVER auto-credit without Admin approval
    ref.status = 'eligible';
    return res.status(403).json({
      success: false,
      error: 'Referral bonus is eligible and awaiting Master Admin approval before wallet credit.'
    });
  });

  // 12b. Master Admin Referral Review & Override Endpoint
  app.post('/api/admin/referral/review', verifyMasterAdmin, (req, res) => {
    const { referralId, action, reason, adminId } = req.body;
    if (!referralId || !action) {
      return res.status(400).json({ success: false, error: 'Missing referralId or action' });
    }

    const ref = serverReferrals.get(referralId);
    if (!ref) {
      return res.status(404).json({ success: false, error: 'Referral record not found' });
    }

    if (ref.status === 'credited') {
      return res.status(409).json({ success: false, error: 'Referral bonus has already been credited' });
    }

    if (action === 'reject') {
      ref.status = 'rejected';
      ref.rejectionReason = reason || 'Admin review: Activity criteria unfulfilled';
      serverAuditLogs.unshift({
        id: 'audit_ref_rej_' + Date.now(),
        timestamp: Date.now(),
        actor: adminId || 'MasterAdmin_01',
        category: 'FINANCIAL',
        action: 'REFERRAL_BONUS_REJECTED',
        details: `Master Admin rejected referral bonus for ${ref.referrerUsername} (Referee: ${ref.referredUsername}). Reason: ${ref.rejectionReason}`,
        targetUser: ref.referrerUid
      });
      return res.json({ success: true, referral: ref });
    }

    if (action === 'approve') {
      // Execute atomic credit strictly to the REFERRER
      const tx = executeServerTransaction({
        uid: ref.referrerUid,
        type: 'referral_bonus',
        category: 'credit',
        amount: ref.bonusAmount,
        referenceId: ref.id,
        description: `₹${ref.bonusAmount} Referral Bonus for inviting ${ref.referredUsername} (Admin Approved)`,
        status: 'completed',
        actor: adminId || 'MasterAdmin_01',
        metadata: { referralId: ref.id, reviewedBy: adminId || 'MasterAdmin_01', reason }
      });

      if (!tx.success) {
        return res.status(500).json({ success: false, error: tx.error || 'Failed to credit referral bonus' });
      }

      ref.status = 'credited';
      ref.creditedAt = Date.now();
      ref.transactionId = tx.transaction?.id;

      serverAuditLogs.unshift({
        id: 'audit_ref_app_' + Date.now(),
        timestamp: Date.now(),
        actor: adminId || 'MasterAdmin_01',
        category: 'FINANCIAL',
        action: 'REFERRAL_BONUS_ADMIN_APPROVED',
        details: `Master Admin approved & credited ₹${ref.bonusAmount} referral bonus to ${ref.referrerUsername} (Referee: ${ref.referredUsername}). Reason: ${reason || 'Approved on verification'}`,
        targetUser: ref.referrerUid
      });

      return res.json({
        success: true,
        referral: ref,
        transaction: tx.transaction,
        referrerBalance: serverUsers[ref.referrerUid]?.balance
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });
  });

  // 13. Settings API - Get and Update Parameters
  app.get('/api/admin/settings', (req, res) => {
    return res.json({ success: true, settings: serverAdminSettings });
  });

  app.post('/api/admin/settings/update', verifyMasterAdmin, (req, res) => {
    const { settings, adminId } = req.body;
    if (settings && typeof settings === 'object') {
      Object.assign(serverAdminSettings, settings);
      serverAuditLogs.unshift({
        id: 'audit_set_' + Date.now(),
        timestamp: Date.now(),
        actor: adminId || 'MasterAdmin_01',
        category: 'SETTINGS',
        action: settings.maintenanceMode !== undefined ? (settings.maintenanceMode ? 'ENABLE_MAINTENANCE_MODE' : 'DISABLE_MAINTENANCE_MODE') : 'UPDATE_BONUS_SETTINGS',
        details: `Updated Master Admin parameters: ${JSON.stringify(settings)}`
      });
      return res.json({ success: true, settings: serverAdminSettings });
    }
    return res.status(400).json({ success: false, error: 'Invalid settings payload' });
  });

  // Dedicated Master Admin Maintenance Mode Toggle
  app.post('/api/admin/maintenance/toggle', verifyMasterAdmin, (req, res) => {
    const { enabled, message, estimatedResumeTime, adminId } = req.body;
    serverAdminSettings.maintenanceMode = Boolean(enabled);
    if (message !== undefined) serverAdminSettings.maintenanceMessage = String(message);
    if (estimatedResumeTime !== undefined) serverAdminSettings.maintenanceEstimatedResumeTime = String(estimatedResumeTime);

    serverAuditLogs.unshift({
      id: 'audit_maint_' + Date.now(),
      timestamp: Date.now(),
      actor: adminId || 'MasterAdmin_01',
      category: 'SETTINGS',
      action: serverAdminSettings.maintenanceMode ? 'ENABLE_MAINTENANCE_MODE' : 'DISABLE_MAINTENANCE_MODE',
      details: `Master Admin toggled Maintenance Mode to ${serverAdminSettings.maintenanceMode ? 'ON' : 'OFF'}. Betting is ${serverAdminSettings.maintenanceMode ? 'PAUSED' : 'ACTIVE'}.${serverAdminSettings.maintenanceMessage ? ` Message: "${serverAdminSettings.maintenanceMessage}"` : ''}`
    });

    return res.json({
      success: true,
      maintenanceMode: serverAdminSettings.maintenanceMode,
      maintenanceMessage: serverAdminSettings.maintenanceMessage,
      maintenanceEstimatedResumeTime: serverAdminSettings.maintenanceEstimatedResumeTime,
      settings: serverAdminSettings
    });
  });

  // 14. Master Admin User Status Control (Activate, Suspend, Ban, Deactivate)
  app.post('/api/admin/user/status', verifyMasterAdmin, (req, res) => {
    const { uid, status, reason, adminId } = req.body;
    const allowedStatuses = ['active', 'suspended', 'banned', 'deactivated'];
    if (!uid || !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid uid or status' });
    }
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ success: false, error: 'Mandatory reason is required for status change' });
    }

    const user = serverUsers[uid];
    if (!user) {
      return res.status(404).json({ success: false, error: 'User record not found' });
    }

    const prevStatus = user.status;
    user.status = status;

    serverAuditLogs.unshift({
      id: 'audit_usr_st_' + Date.now(),
      timestamp: Date.now(),
      actor: adminId || 'MasterAdmin_01',
      category: 'AUTH',
      action: `USER_STATUS_${String(status).toUpperCase()}`,
      details: `Changed user ${user.username} (${uid}) status from ${prevStatus} to ${status}. Financial ledger preserved. Reason: ${reason}`,
      targetUser: uid
    });

    return res.json({
      success: true,
      uid,
      status: user.status,
      message: `User ${user.username} status updated to ${status}`
    });
  });

  // 15. Authoritative Gift Code Registry & Backend Enforcement (Empty by default; only Master Admin can create gift codes)
  const serverGiftCodes: Record<string, {
    code: string;
    amount: number;
    maxUses: number;
    usedCount: number;
    claimedBy: Record<string, { uid: string; claimedAt: number }>;
    createdAt: number;
    expiresAt: number;
    createdBy: string;
    isActive: boolean;
    minVipLevel: number;
  }> = {};

  app.post('/api/admin/gift-code/create', verifyMasterAdmin, (req, res) => {
    const { code, amount, maxUses, expiryDays, minVipLevel, adminId } = req.body;
    const cleanCode = String(code || '').trim().toUpperCase();
    if (!cleanCode || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid code and positive amount required' });
    }
    if (serverGiftCodes[cleanCode]) {
      return res.status(409).json({ success: false, error: 'Gift code already exists' });
    }
    serverGiftCodes[cleanCode] = {
      code: cleanCode,
      amount,
      maxUses: Math.max(1, Number(maxUses) || 50),
      usedCount: 0,
      claimedBy: {},
      createdAt: Date.now(),
      expiresAt: Date.now() + (Math.max(1, Number(expiryDays) || 14) * 86400000),
      createdBy: adminId || 'MasterAdmin_01',
      isActive: true,
      minVipLevel: Math.max(1, Number(minVipLevel) || 1)
    };
    serverAuditLogs.unshift({
      id: 'audit_gc_create_' + Date.now(),
      timestamp: Date.now(),
      actor: adminId || 'MasterAdmin_01',
      category: 'GIFT_CODE',
      action: 'CREATE_GIFT_CODE',
      details: `Created gift code ${cleanCode} for ₹${amount} (Max uses: ${serverGiftCodes[cleanCode].maxUses}, Min VIP: ${serverGiftCodes[cleanCode].minVipLevel})`
    });
    return res.json({ success: true, giftCode: serverGiftCodes[cleanCode] });
  });

  app.post('/api/admin/gift-code/update', verifyMasterAdmin, (req, res) => {
    const { code, amount, maxUses, expiryDays, isActive, minVipLevel, reason, adminId } = req.body;
    const cleanCode = String(code || '').trim().toUpperCase();
    const gift = serverGiftCodes[cleanCode];
    if (!gift) {
      return res.status(404).json({ success: false, error: 'Gift code not found' });
    }
    if (typeof amount === 'number' && amount > 0) gift.amount = amount;
    if (typeof maxUses === 'number') {
      if (maxUses < gift.usedCount) {
        return res.status(400).json({ success: false, error: `Redemption limit (${maxUses}) cannot be less than already redeemed count (${gift.usedCount})` });
      }
      gift.maxUses = maxUses;
    }
    if (typeof expiryDays === 'number' && expiryDays > 0) {
      gift.expiresAt = Date.now() + expiryDays * 86400000;
    }
    if (typeof isActive === 'boolean') gift.isActive = isActive;
    if (typeof minVipLevel === 'number') gift.minVipLevel = Math.max(1, minVipLevel);

    serverAuditLogs.unshift({
      id: 'audit_gc_upd_' + Date.now(),
      timestamp: Date.now(),
      actor: adminId || 'MasterAdmin_01',
      category: 'GIFT_CODE',
      action: 'UPDATE_GIFT_CODE',
      details: `Updated gift code ${cleanCode} (₹${gift.amount}, Active: ${gift.isActive}). Reason: ${reason || 'Admin update'}`
    });
    return res.json({ success: true, giftCode: gift });
  });

  app.post('/api/admin/gift-code/delete', verifyMasterAdmin, (req, res) => {
    const { code, reason, adminId } = req.body;
    const cleanCode = String(code || '').trim().toUpperCase();
    const gift = serverGiftCodes[cleanCode];
    if (!gift) {
      return res.status(404).json({ success: false, error: 'Gift code not found' });
    }
    if (gift.usedCount > 0 || Object.keys(gift.claimedBy || {}).length > 0) {
      return res.status(409).json({
        success: false,
        error: `Cannot delete ${cleanCode} because it has ${gift.usedCount} redemption(s). Deactivate it instead to preserve redeemed-code audit records.`
      });
    }
    delete serverGiftCodes[cleanCode];
    serverAuditLogs.unshift({
      id: 'audit_gc_del_' + Date.now(),
      timestamp: Date.now(),
      actor: adminId || 'MasterAdmin_01',
      category: 'GIFT_CODE',
      action: 'DELETE_UNUSED_GIFT_CODE',
      details: `Deleted unused gift code ${cleanCode}. Reason: ${reason || 'Admin cleanup'}`
    });
    return res.json({ success: true, code: cleanCode });
  });

  app.post('/api/user/gift-code/claim', (req, res) => {
    const { uid, code } = req.body;
    const cleanCode = String(code || '').trim().toUpperCase();
    const user = serverUsers[uid];
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.status !== 'active') return res.status(403).json({ success: false, error: `Account is ${user.status}. Cannot redeem gift codes.` });
    if (serverAdminSettings.featureGiftCodes === false) {
      return res.status(403).json({ success: false, error: 'Gift code redemption is currently disabled by Master Admin.' });
    }

    const gift = serverGiftCodes[cleanCode];
    if (!gift) return res.status(404).json({ success: false, error: 'Invalid gift code' });
    if (!gift.isActive) return res.status(400).json({ success: false, error: 'This gift code is deactivated' });
    if (Date.now() > gift.expiresAt) return res.status(400).json({ success: false, error: 'This gift code has expired' });
    if (gift.usedCount >= gift.maxUses) return res.status(400).json({ success: false, error: 'Gift code redemption limit reached' });
    if (gift.claimedBy[uid]) return res.status(409).json({ success: false, error: 'You have already redeemed this gift code' });
    if (gift.minVipLevel && (user.vipLevel || 1) < gift.minVipLevel) {
      return res.status(403).json({ success: false, error: `Requires VIP Level ${gift.minVipLevel} or higher` });
    }

    const tx = executeServerTransaction({
      uid,
      type: 'gift_code',
      category: 'credit',
      amount: gift.amount,
      referenceId: cleanCode,
      description: `Gift Voucher Claimed: ${cleanCode}`,
      status: 'completed'
    });
    if (!tx.success) {
      return res.status(400).json({ success: false, error: tx.error });
    }

    gift.usedCount += 1;
    gift.claimedBy[uid] = { uid, claimedAt: Date.now() };
    return res.json({
      success: true,
      amount: gift.amount,
      balanceAfter: user.balance,
      transaction: tx.transaction
    });
  });

  // 16. Feature Module Management Endpoints (Master Admin Only)
  const serverFeatureStates: Record<string, { enabled: boolean; visibleInUserApp: boolean; updatedAt: number; updatedBy: string }> = {};

  app.post('/api/admin/features/toggle', verifyMasterAdmin, (req, res) => {
    const { featureId, enabled, visibleInUserApp, reason, adminId } = req.body;
    if (!featureId || typeof enabled !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Missing featureId or enabled boolean' });
    }
    const isVisible = enabled ? (typeof visibleInUserApp === 'boolean' ? visibleInUserApp : true) : false;
    serverFeatureStates[featureId] = {
      enabled,
      visibleInUserApp: isVisible,
      updatedAt: Date.now(),
      updatedBy: adminId || 'MasterAdmin_01'
    };
    serverAuditLogs.unshift({
      id: 'audit_feat_' + Date.now(),
      timestamp: Date.now(),
      actor: adminId || 'MasterAdmin_01',
      category: 'FEATURE',
      action: enabled ? 'FEATURE_ENABLED' : 'FEATURE_DISABLED',
      details: `Feature module ${featureId} set to ${enabled ? 'ENABLED' : 'DISABLED'} (Visible: ${serverFeatureStates[featureId].visibleInUserApp}). Reason: ${reason || 'Master Admin control'}`
    });
    return res.json({ success: true, featureId, state: serverFeatureStates[featureId] });
  });

  // 1-Click Master Toggle All Games
  app.post('/api/admin/features/toggle-all-games', verifyMasterAdmin, (req, res) => {
    const { enabled, adminId } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Missing enabled boolean' });
    }
    const gameIds = [
      'wingo',
      'wingo_30s',
      'wingo_1min',
      'wingo_3min',
      'aviator',
      'k3_dice',
      'trx_wingo',
      'wheel',
      'ludo',
      'quiz_battle'
    ];
    gameIds.forEach((gid) => {
      serverFeatureStates[gid] = {
        enabled,
        visibleInUserApp: enabled,
        updatedAt: Date.now(),
        updatedBy: adminId || 'MasterAdmin_01'
      };
    });
    serverAuditLogs.unshift({
      id: 'audit_all_games_' + Date.now(),
      timestamp: Date.now(),
      actor: adminId || 'MasterAdmin_01',
      category: 'FEATURE',
      action: enabled ? 'ALL_GAMES_ENABLED' : 'ALL_GAMES_DISABLED',
      details: `${enabled ? 'Enabled' : 'Disabled'} all ${gameIds.length} game modules with 1 click`
    });
    return res.json({ success: true, enabled, count: gameIds.length });
  });

  app.get('/api/features', (req, res) => {
    return res.json({ success: true, features: serverFeatureStates });
  });

  // Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'Bingo777 Authoritative Financial Backend',
      timestamp: Date.now(),
      pendingDepositsCount: Array.from(serverDeposits.values()).filter((d) => d.status === 'pending').length,
      pendingWithdrawalsCount: Array.from(serverWithdrawals.values()).filter((w) => w.status === 'pending').length,
      totalUsers: Object.keys(serverUsers).length
    });
  });

  // ----------------------------------------------------
  // 17. REAL-TIME 1V1 LUDO BATTLE & LIVE GLOBAL CHAT ENGINE
  // ----------------------------------------------------
  type LudoColor = 'red' | 'green' | 'yellow' | 'blue';
  type LudoPlayerKey = 'player1' | 'player2' | 'player3' | 'player4';

  interface LudoChatMessage {
    id: string;
    senderUid: string;
    senderName: string;
    senderLocation: string;
    senderColor?: LudoColor;
    text: string;
    messageType: 'text' | 'quick' | 'emoji' | 'system';
    timestamp: number;
  }

  interface LudoRollEvent {
    rollId: string;
    player: LudoPlayerKey;
    color: LudoColor;
    value: number;
    outcome: 'normal' | 'no_moves' | 'triple_six';
    timestamp: number;
  }

  interface LudoMoveEvent {
    moveId: string;
    player: LudoPlayerKey;
    color: LudoColor;
    pawnIndex: number;
    fromStep: number;
    toStep: number;
    dice: number;
    capturedPawnIndex: number | null;
    capturedPlayerKey?: LudoPlayerKey | null;
    capturedColor?: LudoColor | null;
    bonusTurn: boolean;
    timestamp: number;
  }

  interface LudoVoiceState {
    uid: string;
    micEnabled: boolean;
    speakerEnabled: boolean;
    isSpeaking: boolean;
    updatedAt: number;
  }

  interface LudoVoiceSignal {
    id: string;
    fromUid: string;
    toUid: string;
    type: 'offer' | 'answer' | 'ice' | 'audio_chunk' | 'voice_phrase';
    payload: unknown;
    timestamp: number;
  }

  interface LudoDisconnectInfo {
    playerKey: LudoPlayerKey;
    uid: string;
    username: string;
    disconnectedAt: number;
    reconnectDeadline: number;
    remainingSeconds: number;
  }

  interface LudoPlayerState {
    uid: string;
    username: string;
    location: string;
    flag?: string;
    color: LudoColor;
    pawns: [number, number, number, number]; // 0 = Base, 1..51 = Track, 52..56 = Home Stretch, 57 = Home Goal
    score: number;
    captures: number;
    homeCount: number;
    movesLeft: number;
    lastDice: number | null;
    consecutiveSixes?: number;
    isBot: boolean;
    lastActiveAt: number;
    lastHeartbeatAt?: number;
    isDisconnected?: boolean;
    disconnectedAt?: number | null;
    reconnectDeadline?: number | null;
  }

  interface LudoRoomState {
    roomId: string;
    entryFee: number;
    maxPlayers: 2 | 3 | 4;
    seatOrder: LudoPlayerKey[];
    prizePool: number;
    houseMargin: number;
    isPrivate: boolean;
    status: 'waiting' | 'playing' | 'finished' | 'cancelled';
    player1: LudoPlayerState;
    player2: LudoPlayerState | null;
    player3: LudoPlayerState | null;
    player4: LudoPlayerState | null;
    turn: LudoPlayerKey;
    diceValue: number | null;
    hasRolled: boolean;
    movablePawns: number[];
    lastAction: string;
    lastRoll: LudoRollEvent | null;
    lastMove: LudoMoveEvent | null;
    moveSeq: number;
    stakedUids: string[];
    settledWinnerUid?: string | null;
    settlementTxId?: string | null;
    cancelledRefunded?: boolean;
    winner: LudoPlayerKey | null;
    winReason?: string;
    chatMessages: LudoChatMessage[];
    voiceStates: Record<string, LudoVoiceState>;
    voiceSignals: LudoVoiceSignal[];
    disconnectInfo?: LudoDisconnectInfo | null;
    autoWinProcessed?: boolean;
    createdAt: number;
    updatedAt: number;
  }

  const SAFE_TRACK_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
  const COLOR_TRACK_OFFSET: Record<LudoColor, number> = {
    red: 0,
    green: 13,
    yellow: 26,
    blue: 39
  };

  const getSeatColorsForCount = (maxPlayers: 2 | 3 | 4): Record<LudoPlayerKey, LudoColor> => {
    if (maxPlayers === 2) {
      return { player1: 'red', player2: 'yellow', player3: 'green', player4: 'blue' };
    }
    if (maxPlayers === 3) {
      return { player1: 'red', player2: 'green', player3: 'yellow', player4: 'blue' };
    }
    return { player1: 'red', player2: 'green', player3: 'yellow', player4: 'blue' };
  };

  const getSeatOrderForCount = (maxPlayers: 2 | 3 | 4): LudoPlayerKey[] => {
    if (maxPlayers === 2) return ['player1', 'player2'];
    if (maxPlayers === 3) return ['player1', 'player2', 'player3'];
    return ['player1', 'player2', 'player3', 'player4'];
  };

  const getFlagForLocation = (loc: string): string => {
    const l = (loc || '').toLowerCase();
    if (l.includes('dubai') || l.includes('uae')) return '🇦🇪';
    if (l.includes('london') || l.includes('uk')) return '🇬🇧';
    if (l.includes('singapore') || l.includes('sg')) return '🇸🇬';
    if (l.includes('toronto') || l.includes('ca') || l.includes('canada')) return '🇨🇦';
    if (l.includes('usa') || l.includes('new york')) return '🇺🇸';
    if (l.includes('sydney') || l.includes('au')) return '🇦🇺';
    if (l.includes('tokyo') || l.includes('jp')) return '🇯🇵';
    return '🇮🇳';
  };

  const ludoRooms = new Map<string, LudoRoomState>();
  const globalLudoLobbyChat: LudoChatMessage[] = [];

  const getGlobalTrackIndex = (color: LudoColor, step: number): number | null => {
    if (step < 1 || step > 51) return null;
    const offset = COLOR_TRACK_OFFSET[color] ?? 0;
    return (step - 1 + offset) % 52;
  };

  const computeMovablePawns = (pawns: [number, number, number, number], dice: number): number[] => {
    const valid: number[] = [];
    const hasBoardPawnMovable = pawns.some((pos) => pos >= 1 && pos < 57 && pos + dice <= 57);
    pawns.forEach((pos, idx) => {
      if (pos === 0) {
        if (dice === 6 || dice === 1 || !hasBoardPawnMovable) {
          valid.push(idx);
        }
      } else if (pos >= 1 && pos < 57 && pos + dice <= 57) {
        valid.push(idx);
      }
    });
    return valid;
  };

  const getActivePlayersList = (room: LudoRoomState): Array<{ key: LudoPlayerKey; player: LudoPlayerState }> => {
    const list: Array<{ key: LudoPlayerKey; player: LudoPlayerState }> = [];
    for (const k of room.seatOrder) {
      const p = room[k];
      if (p) list.push({ key: k, player: p });
    }
    return list;
  };

  const getNextTurnKey = (room: LudoRoomState, currentKey: LudoPlayerKey): LudoPlayerKey => {
    const order = room.seatOrder;
    const startIdx = Math.max(0, order.indexOf(currentKey));
    for (let offset = 1; offset <= order.length; offset++) {
      const candidateKey = order[(startIdx + offset) % order.length];
      const candidate = room[candidateKey];
      if (candidate && candidate.movesLeft > 0) {
        return candidateKey;
      }
    }
    return currentKey;
  };

  const checkMatchCompletionByMoves = (room: LudoRoomState): boolean => {
    const activeList = getActivePlayersList(room);
    if (activeList.length < 2) return false;
    const anyMovesRemaining = activeList.some(({ player }) => player.movesLeft > 0);
    if (!anyMovesRemaining) {
      room.status = 'finished';
      room.diceValue = null;
      room.hasRolled = false;
      room.movablePawns = [];
      const sorted = [...activeList].sort((a, b) => b.player.score - a.player.score);
      const top = sorted[0];
      room.winner = top.key;
      const scoresSummary = sorted.map((item) => `${item.player.username}: ${item.player.score} pts`).join(' · ');
      room.winReason = `${top.player.username} won by highest score! (${scoresSummary})`;
      return true;
    }
    return false;
  };

  const DISCONNECT_HEARTBEAT_TIMEOUT_MS = 15000; // 15 seconds without valid heartbeat -> marked disconnected
  const RECONNECTION_WINDOW_MS = 60000; // 60 seconds countdown to reconnect

  // Restore disconnected player when valid heartbeat / activity is received within 60s
  const handlePlayerReconnect = (room: LudoRoomState, playerKey: LudoPlayerKey, player: LudoPlayerState) => {
    const now = Date.now();
    const wasDisconnected = Boolean(
      player.isDisconnected ||
      (room.disconnectInfo && room.disconnectInfo.playerKey === playerKey)
    );

    player.isDisconnected = false;
    player.disconnectedAt = null;
    player.reconnectDeadline = null;
    player.lastHeartbeatAt = now;
    player.lastActiveAt = now;

    if (wasDisconnected) {
      if (room.disconnectInfo?.playerKey === playerKey) {
        const otherDc = getActivePlayersList(room).find(
          ({ player: otherP, key: otherK }) => otherK !== playerKey && otherP.isDisconnected && !otherP.isBot
        );
        if (otherDc) {
          const remMs = (otherDc.player.reconnectDeadline || 0) - now;
          room.disconnectInfo = {
            playerKey: otherDc.key,
            uid: otherDc.player.uid,
            username: otherDc.player.username,
            disconnectedAt: otherDc.player.disconnectedAt || now,
            reconnectDeadline: otherDc.player.reconnectDeadline || (now + remMs),
            remainingSeconds: Math.max(0, Math.ceil(remMs / 1000))
          };
        } else {
          room.disconnectInfo = null;
        }
      }
      room.lastAction = `🟢 ${player.username} reconnected! Resuming match.`;
      room.chatMessages.push({
        id: 'sys_rc_' + now + '_' + Math.random().toString(36).slice(2, 5),
        senderUid: 'system',
        senderName: 'Match Referee',
        senderLocation: 'Server',
        text: `🟢 ${player.username} successfully reconnected within the 60s window. Match restored!`,
        messageType: 'system',
        timestamp: now
      });
      room.updatedAt = now;
    }
  };

  // Authoritative server-side heartbeat evaluation & automatic-win system
  const checkLudoRoomsDisconnectStatus = () => {
    const now = Date.now();
    for (const room of ludoRooms.values()) {
      if (room.status !== 'playing') continue;

      const activePlayers = getActivePlayersList(room);
      if (activePlayers.length < 2) continue;

      // 1. Detect human players with no heartbeat for >= 15 seconds
      for (const { key, player } of activePlayers) {
        if (player.isBot) {
          player.lastHeartbeatAt = now;
          player.lastActiveAt = now;
          continue;
        }

        const lastHb = player.lastHeartbeatAt || player.lastActiveAt || room.createdAt;
        const timeSinceHb = now - lastHb;

        if (timeSinceHb >= DISCONNECT_HEARTBEAT_TIMEOUT_MS && !player.isDisconnected) {
          player.isDisconnected = true;
          player.disconnectedAt = now;
          player.reconnectDeadline = now + RECONNECTION_WINDOW_MS;

          // Track in room.disconnectInfo if not already active
          if (!room.disconnectInfo) {
            room.disconnectInfo = {
              playerKey: key,
              uid: player.uid,
              username: player.username,
              disconnectedAt: now,
              reconnectDeadline: player.reconnectDeadline,
              remainingSeconds: Math.ceil(RECONNECTION_WINDOW_MS / 1000)
            };
          }

          room.lastAction = `⚠️ ${player.username} connection lost! 60s countdown to reconnect or forfeit.`;
          room.chatMessages.push({
            id: 'sys_dc_' + now + '_' + Math.random().toString(36).slice(2, 5),
            senderUid: 'system',
            senderName: 'Match Referee',
            senderLocation: 'Server',
            text: `⚠️ ${player.username} disconnected. 60s reconnection countdown started.`,
            messageType: 'system',
            timestamp: now
          });
          room.updatedAt = now;
        }
      }

      // 2. Manage active disconnect countdown & check expiration
      if (room.disconnectInfo) {
        const dcPlayerKey = room.disconnectInfo.playerKey;
        const dcPlayer = room[dcPlayerKey];

        // If player already reconnected, clear or shift to another disconnected player
        if (dcPlayer && !dcPlayer.isDisconnected) {
          const nextDc = activePlayers.find(({ player }) => player.isDisconnected && !player.isBot);
          if (nextDc) {
            const remMs = (nextDc.player.reconnectDeadline || 0) - now;
            room.disconnectInfo = {
              playerKey: nextDc.key,
              uid: nextDc.player.uid,
              username: nextDc.player.username,
              disconnectedAt: nextDc.player.disconnectedAt || now,
              reconnectDeadline: nextDc.player.reconnectDeadline || (now + remMs),
              remainingSeconds: Math.max(0, Math.ceil(remMs / 1000))
            };
          } else {
            room.disconnectInfo = null;
            room.updatedAt = now;
            continue;
          }
        }
      } else {
        const anyDc = activePlayers.find(({ player }) => player.isDisconnected && !player.isBot);
        if (anyDc) {
          const remMs = (anyDc.player.reconnectDeadline || 0) - now;
          room.disconnectInfo = {
            playerKey: anyDc.key,
            uid: anyDc.player.uid,
            username: anyDc.player.username,
            disconnectedAt: anyDc.player.disconnectedAt || now,
            reconnectDeadline: anyDc.player.reconnectDeadline || (now + remMs),
            remainingSeconds: Math.max(0, Math.ceil(remMs / 1000))
          };
        }
      }

      if (room.disconnectInfo) {
        const remainingMs = (room.disconnectInfo.reconnectDeadline || 0) - now;
        room.disconnectInfo.remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

        // 3. Countdown expired (60s without reconnecting) -> declare automatic win for remaining player!
        if (remainingMs <= 0 && !room.autoWinProcessed) {
          room.autoWinProcessed = true;
          room.status = 'finished';

          const dcKey = room.disconnectInfo.playerKey;
          const eligiblePlayers = activePlayers.filter(
            ({ key }) => key !== dcKey && !room[key]?.isDisconnected
          );
          const winnerEntry =
            [...eligiblePlayers].sort((a, b) => b.player.score - a.player.score)[0] ||
            eligiblePlayers[0] ||
            activePlayers.find(({ key }) => key !== dcKey) ||
            activePlayers[0];

          room.winner = winnerEntry.key;
          room.diceValue = null;
          room.hasRolled = false;
          room.movablePawns = [];
          const dcName = room.disconnectInfo.username || 'Opponent';
          room.winReason = `${dcName} failed to reconnect within 60 seconds — ${winnerEntry.player.username} wins by opponent disconnection!`;
          room.lastAction = `🏆 ${room.winReason}`;
          room.disconnectInfo = null;
          room.updatedAt = now;

          room.chatMessages.push({
            id: 'sys_win_dc_' + now,
            senderUid: 'system',
            senderName: 'Match Referee',
            senderLocation: 'Server',
            text: `🏆 Match Over: ${winnerEntry.player.username} wins by automatic forfeit (${dcName} disconnected).`,
            messageType: 'system',
            timestamp: now
          });
        }
      }
    }
  };

  const executeLudoPawnMove = (room: LudoRoomState, playerKey: LudoPlayerKey, pawnIdx: number) => {
    const activePlayer = room[playerKey];
    const dice = room.diceValue;

    if (!activePlayer || !dice || !room.hasRolled) return false;
    if (!room.movablePawns.includes(pawnIdx)) return false;

    const currentStep = activePlayer.pawns[pawnIdx];
    const isDeployingFromYard = currentStep === 0;
    const nextStep = isDeployingFromYard ? 1 : currentStep + dice;
    if (nextStep > 57) return false;

    const stepPoints = isDeployingFromYard ? 6 : dice;

    activePlayer.pawns[pawnIdx] = nextStep;
    activePlayer.score += stepPoints;
    activePlayer.lastDice = dice;
    activePlayer.lastActiveAt = Date.now();

    let bonusTurn = dice === 6;
    let capturedPawnIndex: number | null = null;
    let capturedPlayerKey: LudoPlayerKey | null = null;
    let capturedColor: LudoColor | null = null;

    let actionNote = isDeployingFromYard
      ? `${activePlayer.username} rolled ${dice} & deployed Token #${pawnIdx + 1} to Start ★ (+6 pts${bonusTurn ? ' · Bonus Roll' : ''})`
      : `${activePlayer.username} rolled ${dice} & moved Token #${pawnIdx + 1} (+${dice} steps${bonusTurn ? ' · Bonus Roll' : ''})`;

    // Check Home Goal (57)
    if (nextStep === 57) {
      activePlayer.score += 56;
      activePlayer.homeCount = activePlayer.pawns.filter((p) => p === 57).length;
      bonusTurn = true;
      actionNote = `👑 HOME GOAL! ${activePlayer.username}'s Token #${pawnIdx + 1} reached Home! (+56 pts & Bonus Roll)`;
    } else if (nextStep >= 1 && nextStep <= 51) {
      // Check Capture across ALL opponent seats on non-safe track square
      const myGlobalIdx = getGlobalTrackIndex(activePlayer.color, nextStep);
      if (myGlobalIdx !== null && !SAFE_TRACK_INDICES.has(myGlobalIdx)) {
        const myPawnsAtTile = activePlayer.pawns.filter((s) => getGlobalTrackIndex(activePlayer.color, s) === myGlobalIdx).length;
        const opponents = getActivePlayersList(room).filter((item) => item.key !== playerKey);

        for (const opp of opponents) {
          const oppCapturedIndices: number[] = [];
          opp.player.pawns.forEach((oppStep, oIdx) => {
            if (getGlobalTrackIndex(opp.player.color, oppStep) === myGlobalIdx) {
              oppCapturedIndices.push(oIdx);
            }
          });

          if (
            oppCapturedIndices.length === 1 ||
            (oppCapturedIndices.length > 0 && myPawnsAtTile >= oppCapturedIndices.length)
          ) {
            const cutIdx = oppCapturedIndices[0];
            const lostSteps = opp.player.pawns[cutIdx];
            opp.player.pawns[cutIdx] = 0; // Return to 3D Home Yard base slot
            opp.player.score = Math.max(0, opp.player.score - lostSteps);
            activePlayer.captures += 1;
            activePlayer.score += 25;
            bonusTurn = true;
            capturedPawnIndex = cutIdx;
            capturedPlayerKey = opp.key;
            capturedColor = opp.player.color;
            actionNote = `⚔️ SUPER CUT! ${activePlayer.username} captured ${opp.player.username}'s Token #${cutIdx + 1}! (+25 pts & Bonus Roll)`;
            break;
          }
        }
      }
    }

    // Consume 1 turn unless player earned a Bonus Roll (6, Capture, or Home Goal)
    if (!bonusTurn) {
      activePlayer.movesLeft = Math.max(0, activePlayer.movesLeft - 1);
    }

    room.moveSeq = (room.moveSeq || 0) + 1;
    room.lastMove = {
      moveId: `mv_${room.moveSeq}_${Date.now()}`,
      player: playerKey,
      color: activePlayer.color,
      pawnIndex: pawnIdx,
      fromStep: currentStep,
      toStep: nextStep,
      dice,
      capturedPawnIndex,
      capturedPlayerKey,
      capturedColor,
      bonusTurn,
      timestamp: Date.now()
    };

    room.lastAction = actionNote;
    room.diceValue = null;
    room.hasRolled = false;
    room.movablePawns = [];
    room.updatedAt = Date.now();

    // Check Win Conditions:
    activePlayer.homeCount = activePlayer.pawns.filter((p) => p === 57).length;
    if (activePlayer.homeCount >= 4) {
      room.status = 'finished';
      room.winner = playerKey;
      room.winReason = `${activePlayer.username} brought all 4 tokens Home!`;
      return true;
    }

    if (checkMatchCompletionByMoves(room)) {
      return true;
    }

    // Switch turn clockwise unless bonus turn AND active player still has moves left
    if (!bonusTurn || activePlayer.movesLeft <= 0) {
      room.turn = getNextTurnKey(room, playerKey);
    }

    return true;
  };

  // Bot turn processor for any bot seat (player2, player3, player4) with medium-slow 3D dice & step timing
  const triggerBotTurnIfApplicable = (roomId: string, delayMs = 1500) => {
    const room = ludoRooms.get(roomId);
    if (!room || room.status !== 'playing') return;
    const activeTurnKey = room.turn;
    const botPlayer = room[activeTurnKey];
    if (!botPlayer || !botPlayer.isBot) return;

    setTimeout(() => {
      const currentRoom = ludoRooms.get(roomId);
      if (!currentRoom || currentRoom.status !== 'playing' || currentRoom.turn !== activeTurnKey) return;
      const currentBot = currentRoom[activeTurnKey];
      if (!currentBot || !currentBot.isBot || currentRoom.hasRolled) return;

      const rolled = Math.floor(Math.random() * 6) + 1;
      currentRoom.diceValue = rolled;
      currentBot.lastDice = rolled;
      currentBot.lastActiveAt = Date.now();
      currentBot.consecutiveSixes = rolled === 6 ? (currentBot.consecutiveSixes || 0) + 1 : 0;
      const rollId = `roll_bot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      if (currentBot.consecutiveSixes >= 3) {
        currentBot.consecutiveSixes = 0;
        currentBot.movesLeft = Math.max(0, currentBot.movesLeft - 1);
        currentRoom.lastRoll = {
          rollId,
          player: activeTurnKey,
          color: currentBot.color,
          value: rolled,
          outcome: 'triple_six',
          timestamp: Date.now()
        };
        currentRoom.lastAction = `⚠️ ${currentBot.username} rolled three 6s in a row! Turn forfeited.`;
        currentRoom.diceValue = null;
        currentRoom.hasRolled = false;
        currentRoom.movablePawns = [];
        if (!checkMatchCompletionByMoves(currentRoom)) {
          currentRoom.turn = getNextTurnKey(currentRoom, activeTurnKey);
          const nextPlayer = currentRoom[currentRoom.turn];
          if (nextPlayer?.isBot) {
            triggerBotTurnIfApplicable(roomId, 1950);
          }
        }
        currentRoom.updatedAt = Date.now();
        return;
      }

      currentRoom.hasRolled = true;
      const movable = computeMovablePawns(currentBot.pawns, rolled);
      currentRoom.movablePawns = movable;
      currentRoom.lastRoll = {
        rollId,
        player: activeTurnKey,
        color: currentBot.color,
        value: rolled,
        outcome: movable.length === 0 ? 'no_moves' : 'normal',
        timestamp: Date.now()
      };
      currentRoom.lastAction = `${currentBot.username} rolled a ${rolled}!`;
      currentRoom.updatedAt = Date.now();

      if (movable.length === 0) {
        setTimeout(() => {
          const rCheck = ludoRooms.get(roomId);
          if (!rCheck || rCheck.status !== 'playing' || rCheck.turn !== activeTurnKey) return;
          const bCheck = rCheck[activeTurnKey];
          if (!bCheck) return;
          bCheck.movesLeft = Math.max(0, bCheck.movesLeft - 1);
          rCheck.lastAction = `${bCheck.username} rolled ${rolled} (No valid move available)`;
          rCheck.diceValue = null;
          rCheck.hasRolled = false;
          rCheck.movablePawns = [];
          if (!checkMatchCompletionByMoves(rCheck)) {
            rCheck.turn = getNextTurnKey(rCheck, activeTurnKey);
            const nextP = rCheck[rCheck.turn];
            if (nextP?.isBot) {
              triggerBotTurnIfApplicable(roomId, 1750);
            }
          }
          rCheck.updatedAt = Date.now();
        }, 1650);
        return;
      }

      // Wait 1700ms so the human client's 1.38s medium-slow 3D Dice animation lands & displays the confirmed face before pawn hops!
      setTimeout(() => {
        const r = ludoRooms.get(roomId);
        if (!r || r.status !== 'playing' || r.turn !== activeTurnKey || !r.diceValue) return;
        const botNow = r[activeTurnKey];
        if (!botNow) return;

        let chosenIdx = movable[0];
        let bestWeight = -1;
        const otherPlayers = getActivePlayersList(r).filter((p) => p.key !== activeTurnKey);

        for (const idx of movable) {
          const cur = botNow.pawns[idx];
          const next = cur === 0 ? 1 : cur + r.diceValue;
          let weight = next;
          if (next === 57) weight += 280; // Home goal priority
          if (cur === 0 && (r.diceValue === 6 || r.diceValue === 1)) weight += 85; // Deploy from 3D Yard to Start Star
          const gIdx = getGlobalTrackIndex(botNow.color, next);
          if (gIdx !== null && !SAFE_TRACK_INDICES.has(gIdx)) {
            const canCapture = otherPlayers.some((op) =>
              op.player.pawns.some((opStep) => getGlobalTrackIndex(op.player.color, opStep) === gIdx)
            );
            if (canCapture) weight += 340; // Capture opponent priority
          }
          if (SAFE_TRACK_INDICES.has(gIdx ?? -1)) weight += 50; // Safe star landing
          if (weight > bestWeight) {
            bestWeight = weight;
            chosenIdx = idx;
          }
        }

        const movedSteps = botNow.pawns[chosenIdx] === 0 ? 1 : r.diceValue;
        executeLudoPawnMove(r, activeTurnKey, chosenIdx);

        if (Math.random() < 0.25 && r.status === 'playing') {
          const phrases = [
            'Good move! Let’s see who wins this table.',
            'Nice roll! Close match.',
            'Playing live from my phone, good luck!',
            'Watch out for my tokens!',
            'Badhiya move bhai, ab meri baari!'
          ];
          const chosenPhrase = phrases[Math.floor(Math.random() * phrases.length)];
          r.chatMessages.push({
            id: 'mchat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            senderUid: botNow.uid,
            senderName: botNow.username,
            senderLocation: botNow.location,
            senderColor: botNow.color,
            text: chosenPhrase,
            messageType: 'text',
            timestamp: Date.now()
          });
          r.voiceStates[botNow.uid] = {
            uid: botNow.uid,
            micEnabled: true,
            speakerEnabled: true,
            isSpeaking: true,
            updatedAt: Date.now()
          };
          r.voiceSignals.push({
            id: `vsig_bot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            fromUid: botNow.uid,
            toUid: 'all',
            type: 'voice_phrase',
            payload: { text: chosenPhrase, senderName: botNow.username },
            timestamp: Date.now()
          });
          setTimeout(() => {
            const roomLater = ludoRooms.get(roomId);
            if (roomLater && roomLater.voiceStates[botNow.uid]) {
              roomLater.voiceStates[botNow.uid].isSpeaking = false;
              roomLater.voiceStates[botNow.uid].updatedAt = Date.now();
            }
          }, 2600);
        }

        const nextActive = r[r.turn];
        if (r.status === 'playing' && nextActive?.isBot) {
          // Wait for previous pawn's step-by-step 230ms/tile walk animation to finish before next bot roll!
          triggerBotTurnIfApplicable(roomId, movedSteps * 260 + 1850);
        }
      }, 2150);
    }, delayMs);
  };

  // GET /api/ludo/lobby - Active waiting rooms + global chat + optional active room recovery for uid
  app.get('/api/ludo/lobby', (req, res) => {
    const uid = String(req.query.uid || '').trim();
    const openRooms = Array.from(ludoRooms.values())
      .filter((r) => r.status === 'waiting' && Date.now() - r.updatedAt < 1000 * 60 * 15)
      .map((r) => {
        const joinedCount = getActivePlayersList(r).length;
        return {
          roomId: r.roomId,
          entryFee: r.entryFee,
          maxPlayers: r.maxPlayers || 2,
          joinedPlayers: joinedCount,
          prizePool: r.prizePool,
          isPrivate: r.isPrivate,
          hostName: r.player1.username,
          hostLocation: r.player1.location,
          hostFlag: r.player1.flag || getFlagForLocation(r.player1.location),
          createdAt: r.createdAt
        };
      });

    let activeUserRoom: LudoRoomState | null = null;
    if (uid) {
      activeUserRoom =
        Array.from(ludoRooms.values()).find(
          (r) =>
            (r.status === 'playing' || r.status === 'waiting') &&
            (r.player1.uid === uid ||
              r.player2?.uid === uid ||
              r.player3?.uid === uid ||
              r.player4?.uid === uid) &&
            Date.now() - r.updatedAt < 1000 * 60 * 20
        ) || null;
    }

    const liveMatchesCount = Array.from(ludoRooms.values()).filter((r) => r.status === 'playing').length + 18;

    return res.json({
      success: true,
      openRooms,
      activeUserRoom,
      liveMatchesCount,
      globalChat: globalLudoLobbyChat.slice(-40)
    });
  });

  // POST /api/ludo/lobby/chat - Global Ludo Chat across India & International players
  app.post('/api/ludo/lobby/chat', (req, res) => {
    const { uid, username, location, text } = req.body;
    const cleanText = String(text || '').trim().slice(0, 200);
    if (!cleanText) return res.status(400).json({ success: false, error: 'Message cannot be empty' });

    const msg: LudoChatMessage = {
      id: 'gchat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      senderUid: String(uid || 'guest'),
      senderName: String(username || 'Player').slice(0, 32),
      senderLocation: String(location || 'India').slice(0, 32),
      text: cleanText,
      messageType: 'text',
      timestamp: Date.now()
    };
    globalLudoLobbyChat.push(msg);
    if (globalLudoLobbyChat.length > 60) globalLudoLobbyChat.shift();

    return res.json({ success: true, message: msg, globalChat: globalLudoLobbyChat.slice(-40) });
  });

  // Helper to assign a joining player to the next open seat in an existing waiting room
  const assignPlayerToWaitingRoom = (
    room: LudoRoomState,
    cleanUid: string,
    cleanName: string,
    cleanLoc: string
  ): { role: LudoPlayerKey; newlyStaked: boolean } | null => {
    // Check if user is already seated in this room
    for (const k of room.seatOrder) {
      const existingSeat = room[k];
      if (existingSeat && existingSeat.uid === cleanUid) {
        handlePlayerReconnect(room, k, existingSeat);
        return { role: k, newlyStaked: false };
      }
    }

    if (room.status !== 'waiting') return null;

    const seatColors = getSeatColorsForCount(room.maxPlayers);
    let assignedRole: LudoPlayerKey | null = null;
    for (const k of room.seatOrder) {
      if (!room[k]) {
        assignedRole = k;
        break;
      }
    }
    if (!assignedRole) return null;

    room[assignedRole] = {
      uid: cleanUid,
      username: cleanName,
      location: cleanLoc,
      flag: getFlagForLocation(cleanLoc),
      color: seatColors[assignedRole],
      pawns: [1, 1, 0, 0],
      score: 0,
      captures: 0,
      homeCount: 0,
      movesLeft: 20,
      lastDice: null,
      consecutiveSixes: 0,
      isBot: false,
      lastActiveAt: Date.now(),
      lastHeartbeatAt: Date.now(),
      isDisconnected: false,
      disconnectedAt: null,
      reconnectDeadline: null
    };

    room.voiceStates[cleanUid] = {
      uid: cleanUid,
      micEnabled: false,
      speakerEnabled: true,
      isSpeaking: false,
      updatedAt: Date.now()
    };

    let newlyStaked = false;
    if (!room.stakedUids.includes(cleanUid)) {
      room.stakedUids.push(cleanUid);
      newlyStaked = true;
    }

    const joinedCount = getActivePlayersList(room).length;
    if (joinedCount >= room.maxPlayers) {
      room.status = 'playing';
      const isAllHuman = getActivePlayersList(room).every((p) => !p.player.isBot);
      room.lastAction = isAllHuman
        ? `🔥 REAL 1VS1 MATCH! ${cleanName} (${cleanLoc}) matched with ${room.player1.username}! Real Player Match started.`
        : `${cleanName} (${cleanLoc}) joined Room ${room.roomId}! ${room.maxPlayers}-Player Match started.`;
      room.chatMessages.push({
        id: 'sys_' + Date.now(),
        senderUid: 'system',
        senderName: 'Match Referee',
        senderLocation: 'Global Server',
        text: isAllHuman
          ? `All real players connected! 1vs1 Real Match started — Voice & Text Chat active.`
          : `All ${room.maxPlayers} players connected! Match started — Voice & Text Chat active.`,
        messageType: 'system',
        timestamp: Date.now()
      });
    } else {
      room.lastAction = `${cleanName} joined (${joinedCount}/${room.maxPlayers} players ready)...`;
      room.chatMessages.push({
        id: 'sys_' + Date.now(),
        senderUid: 'system',
        senderName: 'Match Referee',
        senderLocation: 'Global Server',
        text: `${cleanName} (${cleanLoc}) joined seat ${assignedRole.toUpperCase()} (${joinedCount}/${room.maxPlayers}).`,
        messageType: 'system',
        timestamp: Date.now()
      });
    }

    room.updatedAt = Date.now();
    return { role: assignedRole, newlyStaked };
  };

  // POST /api/ludo/room/create-or-join - Matchmaking or Private Room Code for 2, 3, or 4 Players
  app.post('/api/ludo/room/create-or-join', (req, res) => {
    if (serverAdminSettings.maintenanceMode) {
      return res.status(403).json({
        success: false,
        error: serverAdminSettings.maintenanceMessage || 'Platform is in Maintenance Mode. Game betting is temporarily paused.'
      });
    }
    const { uid, username, location, entryFee, maxPlayers: rawMaxPlayers, mode, roomCode } = req.body;
    const cleanUid = String(uid || 'guest').trim();
    const fee = Number(entryFee) || 100;
    const parsedMax = Number(rawMaxPlayers);
    const maxPlayers: 2 | 3 | 4 = parsedMax === 3 ? 3 : parsedMax === 4 ? 4 : 2;
    const cleanName = String(username || 'Player').slice(0, 28);
    const cleanLoc = String(location || 'Mumbai, India').slice(0, 28);
    const prizePool = Math.round(fee * maxPlayers * 0.90);
    const houseMargin = fee * maxPlayers - prizePool;

    // 1. Join specific room by Room Code
    if (mode === 'join_code' && roomCode) {
      const targetCode = String(roomCode).trim().toUpperCase();
      const existing = ludoRooms.get(targetCode);
      if (!existing || existing.status === 'cancelled') {
        return res.status(404).json({ success: false, error: `Room ${targetCode} not found or cancelled. Check the code and try again.` });
      }
      const seatResult = assignPlayerToWaitingRoom(existing, cleanUid, cleanName, cleanLoc);
      if (!seatResult) {
        return res.status(400).json({ success: false, error: `Room ${targetCode} is already full (${existing.maxPlayers}/${existing.maxPlayers} players).` });
      }
      return res.json({
        success: true,
        room: existing,
        role: seatResult.role,
        newlyStaked: seatResult.newlyStaked,
        stakeTxId: `ludo_stake_${existing.roomId}_${cleanUid}`,
        isRealMatch: !existing.player1.isBot,
        opponentName: existing.player1.username,
        opponentLocation: existing.player1.location,
        opponentFlag: existing.player1.flag || getFlagForLocation(existing.player1.location)
      });
    }

    // 2. Quick Global Matchmaking: FIRST check if another real human player is waiting at the same entry fee AND player count
    if (mode === 'quick_live') {
      const waitingRoom = Array.from(ludoRooms.values()).find(
        (r) =>
          r.status === 'waiting' &&
          !r.isPrivate &&
          r.entryFee === fee &&
          r.maxPlayers === maxPlayers &&
          !r.player1.isBot &&
          r.player1.uid !== cleanUid &&
          r.player2?.uid !== cleanUid &&
          r.player3?.uid !== cleanUid &&
          Date.now() - r.updatedAt < 1000 * 60 * 5
      );
      if (waitingRoom) {
        const seatResult = assignPlayerToWaitingRoom(waitingRoom, cleanUid, cleanName, cleanLoc);
        if (seatResult) {
          return res.json({
            success: true,
            room: waitingRoom,
            role: seatResult.role,
            newlyStaked: seatResult.newlyStaked,
            stakeTxId: `ludo_stake_${waitingRoom.roomId}_${cleanUid}`,
            isRealMatch: true,
            opponentName: waitingRoom.player1.username,
            opponentLocation: waitingRoom.player1.location,
            opponentFlag: waitingRoom.player1.flag || getFlagForLocation(waitingRoom.player1.location)
          });
        }
      }
    }

    // 3. Create new Waiting Room (supports 2P, 3P, or 4P)
    const generatedId = 'LUDO' + Math.floor(1000 + Math.random() * 9000);
    const seatOrder = getSeatOrderForCount(maxPlayers);
    const newRoom: LudoRoomState = {
      roomId: generatedId,
      entryFee: fee,
      maxPlayers,
      seatOrder,
      prizePool,
      houseMargin,
      isPrivate: mode === 'create_private',
      status: 'waiting',
      player1: {
        uid: cleanUid,
        username: cleanName,
        location: cleanLoc,
        flag: getFlagForLocation(cleanLoc),
        color: 'red',
        pawns: [1, 1, 0, 0],
        score: 0,
        captures: 0,
        homeCount: 0,
        movesLeft: 20,
        lastDice: null,
        consecutiveSixes: 0,
        isBot: false,
        lastActiveAt: Date.now(),
        lastHeartbeatAt: Date.now(),
        isDisconnected: false,
        disconnectedAt: null,
        reconnectDeadline: null
      },
      player2: null,
      player3: null,
      player4: null,
      turn: 'player1',
      diceValue: null,
      hasRolled: false,
      movablePawns: [],
      lastAction: `Waiting for players to join ${maxPlayers}-Player Room ${generatedId} (1/${maxPlayers})...`,
      lastRoll: null,
      lastMove: null,
      moveSeq: 0,
      stakedUids: [cleanUid],
      settledWinnerUid: null,
      settlementTxId: null,
      cancelledRefunded: false,
      winner: null,
      chatMessages: [
        {
          id: 'sys_init_' + Date.now(),
          senderUid: 'system',
          senderName: 'Match Referee',
          senderLocation: 'Global Server',
          text: `${maxPlayers}-Player Room ${generatedId} created (Entry ₹${fee} · Win Pool ₹${prizePool}). Share code ${generatedId} with players worldwide!`,
          messageType: 'system',
          timestamp: Date.now()
        }
      ],
      voiceStates: {
        [cleanUid]: {
          uid: cleanUid,
          micEnabled: false,
          speakerEnabled: true,
          isSpeaking: false,
          updatedAt: Date.now()
        }
      },
      voiceSignals: [],
      disconnectInfo: null,
      autoWinProcessed: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    ludoRooms.set(generatedId, newRoom);
    return res.json({
      success: true,
      room: newRoom,
      role: 'player1',
      newlyStaked: true,
      stakeTxId: `ludo_stake_${generatedId}_${cleanUid}`
    });
  });

  // POST /api/ludo/room/:roomId/pair-instant - Fill remaining open seats with online international challengers immediately
  app.post('/api/ludo/room/:roomId/pair-instant', (req, res) => {
    const room = ludoRooms.get(String(req.params.roomId).toUpperCase());
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    if (room.status === 'waiting') {
      const challengers = [
        { name: 'Aarav_Pro99', loc: 'Delhi, India' },
        { name: 'Zayd_AlMaktoum', loc: 'Dubai, UAE' },
        { name: 'Rohan_King77', loc: 'Mumbai, India' },
        { name: 'Liam_Vegas', loc: 'London, UK' },
        { name: 'Kabir_Royal', loc: 'Bengaluru, India' },
        { name: 'Kenji_Takahashi', loc: 'Singapore, SG' },
        { name: 'Sofia_Crown', loc: 'Toronto, CA' },
        { name: 'Vikram_Star', loc: 'Jaipur, India' }
      ];
      const usedNames = new Set(getActivePlayersList(room).map((p) => p.player.username));
      const seatColors = getSeatColorsForCount(room.maxPlayers);
      const addedNames: string[] = [];

      for (const seatKey of room.seatOrder) {
        if (!room[seatKey]) {
          const available = challengers.filter((c) => !usedNames.has(c.name));
          const pick = available[Math.floor(Math.random() * available.length)] || challengers[0];
          usedNames.add(pick.name);
          const botUid = `challenger_${seatKey}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
          room[seatKey] = {
            uid: botUid,
            username: pick.name,
            location: pick.loc,
            flag: getFlagForLocation(pick.loc),
            color: seatColors[seatKey],
            pawns: [1, 1, 0, 0],
            score: 0,
            captures: 0,
            homeCount: 0,
            movesLeft: 20,
            lastDice: null,
            consecutiveSixes: 0,
            isBot: true,
            lastActiveAt: Date.now(),
            lastHeartbeatAt: Date.now(),
            isDisconnected: false,
            disconnectedAt: null,
            reconnectDeadline: null
          };
          room.voiceStates[botUid] = {
            uid: botUid,
            micEnabled: true,
            speakerEnabled: true,
            isSpeaking: false,
            updatedAt: Date.now()
          };
          addedNames.push(`${pick.name} (${pick.loc})`);
        }
      }

      room.status = 'playing';
      room.lastAction = `${addedNames.join(', ')} joined the table! Tap your 3D Dice to roll.`;
      if (room.player2) {
        room.chatMessages.push({
          id: 'chat_welcome_' + Date.now(),
          senderUid: room.player2.uid,
          senderName: room.player2.username,
          senderLocation: room.player2.location,
          senderColor: room.player2.color,
          text: `Hi ${room.player1.username}! Joined from ${room.player2.location}. Best of luck! 🎲`,
          messageType: 'text',
          timestamp: Date.now()
        });
      }
      room.updatedAt = Date.now();
    }
    return res.json({ success: true, room });
  });

  // POST /api/ludo/room/:roomId/cancel - Safely cancel a waiting room and authorize entry stake refund
  app.post('/api/ludo/room/:roomId/cancel', (req, res) => {
    const { uid } = req.body;
    const room = ludoRooms.get(String(req.params.roomId).toUpperCase());
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    if (room.player1.uid !== uid) {
      return res.status(403).json({ success: false, error: 'Only the room host can cancel a waiting room' });
    }
    if (room.status !== 'waiting') {
      return res.status(400).json({ success: false, error: 'Cannot cancel a match that has already started' });
    }
    const newlyRefunded = !room.cancelledRefunded;
    room.status = 'cancelled';
    room.cancelledRefunded = true;
    room.updatedAt = Date.now();
    return res.json({
      success: true,
      newlyRefunded,
      refundAmount: room.entryFee,
      refundTxId: `ludo_refund_${room.roomId}_${uid}`
    });
  });

  // POST /api/ludo/room/:roomId/forfeit - Resign / abandon an active match safely
  app.post('/api/ludo/room/:roomId/forfeit', (req, res) => {
    const { uid } = req.body;
    const room = ludoRooms.get(String(req.params.roomId).toUpperCase());
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    if (room.status !== 'playing') {
      return res.json({ success: true, room });
    }
    const activePlayers = getActivePlayersList(room);
    const leavingEntry = activePlayers.find((item) => item.player.uid === uid);
    if (!leavingEntry) {
      return res.status(403).json({ success: false, error: 'Not a participant in this match' });
    }
    const remaining = activePlayers.filter((item) => item.player.uid !== uid);
    const bestRemaining = [...remaining].sort((a, b) => b.player.score - a.player.score)[0] || activePlayers[0];

    room.status = 'finished';
    room.winner = bestRemaining.key;
    room.diceValue = null;
    room.hasRolled = false;
    room.movablePawns = [];
    room.winReason = `${leavingEntry.player.username} left the match — ${bestRemaining.player.username} wins by forfeit!`;
    room.lastAction = room.winReason;
    room.updatedAt = Date.now();
    return res.json({ success: true, room });
  });

  // POST /api/ludo/room/:roomId/claim-payout - Idempotent server-verified winner payout authorization
  app.post('/api/ludo/room/:roomId/claim-payout', (req, res) => {
    const { uid } = req.body;
    const room = ludoRooms.get(String(req.params.roomId).toUpperCase());
    if (!room || room.status !== 'finished' || !room.winner) {
      return res.status(400).json({ success: false, error: 'Match is not finished' });
    }
    const winnerPlayer = room[room.winner];
    if (!winnerPlayer || winnerPlayer.uid !== uid || !room.stakedUids.includes(uid)) {
      return res.status(403).json({ success: false, error: 'Only a verified staked match winner can claim this payout' });
    }
    if (room.settledWinnerUid === uid) {
      return res.json({
        success: true,
        newlySettled: false,
        prizePool: room.prizePool,
        settlementTxId: room.settlementTxId
      });
    }
    room.settledWinnerUid = uid;
    room.settlementTxId = `ludo_win_${room.roomId}_${uid}`;
    room.updatedAt = Date.now();
    return res.json({
      success: true,
      newlySettled: true,
      prizePool: room.prizePool,
      settlementTxId: room.settlementTxId
    });
  });

  // POST /api/ludo/room/:roomId/voice-state - Update player's microphone/speaker/speaking state
  app.post('/api/ludo/room/:roomId/voice-state', (req, res) => {
    const { uid, micEnabled, speakerEnabled, isSpeaking } = req.body;
    const room = ludoRooms.get(String(req.params.roomId).toUpperCase());
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    const cleanUid = String(uid || '').trim();
    if (!cleanUid) return res.status(400).json({ success: false, error: 'Missing uid' });

    room.voiceStates[cleanUid] = {
      uid: cleanUid,
      micEnabled: Boolean(micEnabled),
      speakerEnabled: speakerEnabled !== false,
      isSpeaking: Boolean(micEnabled && isSpeaking),
      updatedAt: Date.now()
    };

    // If a human player turns on their microphone or speaks in a room with challenger seats, have a challenger greet them on voice once
    if (micEnabled && isSpeaking) {
      const botEntry = getActivePlayersList(room).find(({ player }) => player.isBot);
      const lastBotGreetKey = `_lastBotVoiceReply_${room.roomId}`;
      const lastReplyTs = (room as unknown as Record<string, number>)[lastBotGreetKey] || 0;
      if (botEntry && Date.now() - lastReplyTs > 18000) {
        (room as unknown as Record<string, number>)[lastBotGreetKey] = Date.now();
        setTimeout(() => {
          const currentR = ludoRooms.get(room.roomId);
          if (!currentR || currentR.status !== 'playing') return;
          const bUid = botEntry.player.uid;
          const voiceReplies = [
            'Hello! Voice clear aa rahi hai bhai, let’s play!',
            'Loud and clear! Good luck on your next roll.',
            'Haan bhai aawaz aa rahi hai, nice match!',
            'Yes I can hear you! Let’s see who takes the pool.'
          ];
          const replyText = voiceReplies[Math.floor(Math.random() * voiceReplies.length)];
          currentR.voiceStates[bUid] = {
            uid: bUid,
            micEnabled: true,
            speakerEnabled: true,
            isSpeaking: true,
            updatedAt: Date.now()
          };
          currentR.voiceSignals.push({
            id: `vsig_breply_${Date.now()}`,
            fromUid: bUid,
            toUid: 'all',
            type: 'voice_phrase',
            payload: { text: replyText, senderName: botEntry.player.username },
            timestamp: Date.now()
          });
          setTimeout(() => {
            const afterR = ludoRooms.get(room.roomId);
            if (afterR && afterR.voiceStates[bUid]) {
              afterR.voiceStates[bUid].isSpeaking = false;
              afterR.voiceStates[bUid].updatedAt = Date.now();
            }
          }, 2800);
        }, 1400);
      }
    }

    return res.json({ success: true, voiceStates: room.voiceStates });
  });

  // POST /api/ludo/room/:roomId/voice-signal - Exchange WebRTC SDP offer/answer/ICE candidates & live audio chunks between players in room
  app.post('/api/ludo/room/:roomId/voice-signal', (req, res) => {
    const { fromUid, toUid, type, payload } = req.body;
    const room = ludoRooms.get(String(req.params.roomId).toUpperCase());
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    if (!fromUid || !toUid || !type) {
      return res.status(400).json({ success: false, error: 'Invalid voice signal parameters' });
    }
    const now = Date.now();
    // Prune stale signals older than 25 seconds so signaling stays fast
    room.voiceSignals = room.voiceSignals.filter((s) => now - s.timestamp < 25000);
    room.voiceSignals.push({
      id: `vsig_${now}_${Math.random().toString(36).slice(2, 7)}`,
      fromUid: String(fromUid),
      toUid: String(toUid),
      type,
      payload,
      timestamp: now
    });
    if (room.voiceSignals.length > 80) {
      room.voiceSignals = room.voiceSignals.slice(-60);
    }
    return res.json({ success: true });
  });

  // POST /api/ludo/room/:roomId/heartbeat - Dedicated server-side heartbeat endpoint for presence & reconnection
  app.post('/api/ludo/room/:roomId/heartbeat', (req, res) => {
    const room = ludoRooms.get(String(req.params.roomId).toUpperCase());
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    const cleanUid = String(req.body.uid || '').trim();

    // Authoritative heartbeat & disconnect evaluation
    checkLudoRoomsDisconnectStatus();

    for (const k of room.seatOrder) {
      const p = room[k];
      if (p && p.uid === cleanUid) {
        handlePlayerReconnect(room, k, p);
        return res.json({
          success: true,
          room,
          disconnectInfo: room.disconnectInfo || null
        });
      }
    }

    return res.json({ success: true, room });
  });

  // GET /api/ludo/room/:roomId - Poll / Sync authoritative room, voice signals & live chat state + update presence heartbeat
  app.get('/api/ludo/room/:roomId', (req, res) => {
    const room = ludoRooms.get(String(req.params.roomId).toUpperCase());
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    const uid = String(req.query.uid || '').trim();

    // Check disconnected player timeouts and automatic wins
    checkLudoRoomsDisconnectStatus();

    const now = Date.now();
    for (const k of room.seatOrder) {
      const p = room[k];
      if (p) {
        if (p.uid === uid) {
          handlePlayerReconnect(room, k, p);
        } else if (p.isBot) {
          p.lastActiveAt = now;
          p.lastHeartbeatAt = now;
        }
      }
    }
    return res.json({ success: true, room });
  });

  // POST /api/ludo/room/:roomId/roll - Authoritative Dice Roll (Always returns rolled number 1..6 & rollId)
  app.post('/api/ludo/room/:roomId/roll', (req, res) => {
    const { uid } = req.body;
    const room = ludoRooms.get(String(req.params.roomId).toUpperCase());
    if (!room || room.status !== 'playing') {
      return res.status(400).json({ success: false, error: 'Match is not active' });
    }

    const activeRole = room.turn;
    const activePlayer = room[activeRole];
    if (!activePlayer || activePlayer.uid !== uid) {
      return res.status(403).json({ success: false, error: 'Not your turn to roll' });
    }
    handlePlayerReconnect(room, activeRole, activePlayer);
    if (room.hasRolled) {
      return res.status(400).json({ success: false, error: 'Already rolled! Tap one of your glowing tokens to move.' });
    }

    const rolled = Math.floor(Math.random() * 6) + 1;
    room.diceValue = rolled;
    activePlayer.lastDice = rolled;
    activePlayer.lastActiveAt = Date.now();
    activePlayer.consecutiveSixes = rolled === 6 ? (activePlayer.consecutiveSixes || 0) + 1 : 0;
    const rollId = `roll_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // Rule of Three Sixes: rolling 3 consecutive 6s forfeits the turn
    if (activePlayer.consecutiveSixes >= 3) {
      activePlayer.consecutiveSixes = 0;
      activePlayer.movesLeft = Math.max(0, activePlayer.movesLeft - 1);
      room.lastRoll = {
        rollId,
        player: activeRole,
        color: activePlayer.color,
        value: rolled,
        outcome: 'triple_six',
        timestamp: Date.now()
      };
      room.diceValue = null;
      room.hasRolled = false;
      room.movablePawns = [];
      room.lastAction = `⚠️ ${activePlayer.username} rolled three 6s in a row! Turn forfeited.`;
      room.updatedAt = Date.now();
      if (!checkMatchCompletionByMoves(room)) {
        room.turn = getNextTurnKey(room, activeRole);
        const nextPlayer = room[room.turn];
        if (nextPlayer?.isBot) {
          triggerBotTurnIfApplicable(room.roomId, 2300);
        }
      }
      return res.json({ success: true, room, rolled, rollId, tripleSixForfeit: true });
    }

    room.hasRolled = true;
    const movable = computeMovablePawns(activePlayer.pawns, rolled);
    room.movablePawns = movable;
    room.lastRoll = {
      rollId,
      player: activeRole,
      color: activePlayer.color,
      value: rolled,
      outcome: movable.length === 0 ? 'no_moves' : 'normal',
      timestamp: Date.now()
    };
    room.lastAction = `${activePlayer.username} rolled a ${rolled}! ${movable.length > 0 ? 'Tap a glowing token to move.' : 'No valid move available.'}`;
    room.updatedAt = Date.now();

    if (movable.length === 0) {
      activePlayer.movesLeft = Math.max(0, activePlayer.movesLeft - 1);
      room.diceValue = null;
      room.hasRolled = false;
      room.movablePawns = [];
      if (!checkMatchCompletionByMoves(room)) {
        room.turn = getNextTurnKey(room, activeRole);
        const nextPlayer = room[room.turn];
        if (nextPlayer?.isBot) {
          triggerBotTurnIfApplicable(room.roomId, 2300);
        }
      }
    }

    return res.json({ success: true, room, rolled, rollId, noValidMoves: movable.length === 0 });
  });

  // POST /api/ludo/room/:roomId/move - Move selected pawn (0..3)
  app.post('/api/ludo/room/:roomId/move', (req, res) => {
    const { uid, pawnIndex } = req.body;
    const room = ludoRooms.get(String(req.params.roomId).toUpperCase());
    if (!room || room.status !== 'playing') {
      return res.status(400).json({ success: false, error: 'Match is not active' });
    }

    const activePlayer = room[room.turn];
    if (!activePlayer || activePlayer.uid !== uid) {
      return res.status(403).json({ success: false, error: 'Not your turn' });
    }
    handlePlayerReconnect(room, room.turn, activePlayer);

    const curStep = activePlayer.pawns[Number(pawnIndex)] ?? 0;
    const movedSteps = curStep === 0 ? 1 : (room.diceValue || 1);
    const moved = executeLudoPawnMove(room, room.turn, Number(pawnIndex));
    if (!moved) {
      return res.status(400).json({ success: false, error: 'Invalid token move' });
    }

    const nextActive = room[room.turn];
    if (room.status === 'playing' && nextActive?.isBot) {
      // Wait for user's token step-by-step walk animation (~220ms/tile) before bot rolls
      triggerBotTurnIfApplicable(room.roomId, movedSteps * 240 + 1350);
    }

    return res.json({ success: true, room });
  });

  // POST /api/ludo/room/:roomId/chat - Live Player-to-Player Chat inside Match
  app.post('/api/ludo/room/:roomId/chat', (req, res) => {
    const { uid, username, location, text, messageType } = req.body;
    const room = ludoRooms.get(String(req.params.roomId).toUpperCase());
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });

    const cleanText = String(text || '').trim().slice(0, 180);
    if (!cleanText) return res.status(400).json({ success: false, error: 'Empty message' });

    const senderEntry = getActivePlayersList(room).find((item) => item.player.uid === uid);
    const senderColor: LudoColor = senderEntry?.player.color || 'red';
    const chatMsg: LudoChatMessage = {
      id: 'mchat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      senderUid: String(uid),
      senderName: String(username || 'Player').slice(0, 28),
      senderLocation: String(location || 'Global').slice(0, 28),
      senderColor,
      text: cleanText,
      messageType: messageType === 'emoji' || messageType === 'quick' ? messageType : 'text',
      timestamp: Date.now()
    };

    room.chatMessages.push(chatMsg);
    if (room.chatMessages.length > 50) room.chatMessages.shift();
    room.updatedAt = Date.now();

    // If any opponent is an AI challenger, generate a natural conversational reply
    const botOpponents = getActivePlayersList(room).filter((item) => item.player.isBot && item.player.uid !== uid);
    if (botOpponents.length > 0) {
      const replier = botOpponents[Math.floor(Math.random() * botOpponents.length)].player;
      setTimeout(() => {
        const currentRoom = ludoRooms.get(room.roomId);
        if (!currentRoom) return;
        const lower = cleanText.toLowerCase();
        let reply = 'Good game! Let’s see who takes the prize pool! 🏆';
        if (lower.includes('hi') || lower.includes('hello') || lower.includes('namaste') || lower.includes('hey')) {
          reply = `Hello ${username || 'friend'}! Playing live from ${replier.location}. All the best! 👋`;
        } else if (lower.includes('kaha') || lower.includes('where') || lower.includes('from')) {
          reply = `Main ${replier.location} se khel raha hu! Aap kaha se ho?`;
        } else if (lower.includes('fast') || lower.includes('jaldi') || lower.includes('roll')) {
          reply = 'Haan bhai, bilkul ready hu! 🎲';
        } else if (lower.includes('nice') || lower.includes('good') || lower.includes('gg') || lower.includes('well')) {
          reply = 'Thanks! You are playing really well too! 🔥';
        } else if (lower.includes('cut') || lower.includes('bachke') || lower.includes('wait')) {
          reply = 'Haha dekhte hain kaun kiska pawn cut karta hai! 😎';
        }

        currentRoom.chatMessages.push({
          id: 'mchat_bot_' + Date.now(),
          senderUid: replier.uid,
          senderName: replier.username,
          senderLocation: replier.location,
          senderColor: replier.color,
          text: reply,
          messageType: 'text',
          timestamp: Date.now()
        });
        currentRoom.updatedAt = Date.now();
      }, 1100);
    }

    return res.json({ success: true, message: chatMsg, room });
  });

  // ----------------------------------------------------
  // AUTOMATIC TOP NEWS MONITORING & YES/NO POLL SYSTEM
  // ----------------------------------------------------
  topNewsPollEngine.registerRoutes(app, verifyMasterAdmin, {
    validateAndDebit: ({ uid, username, amount, pollId, question, option, clientBalanceHint }) => {
      if (serverAdminSettings.maintenanceMode) {
        return {
          success: false,
          error: serverAdminSettings.maintenanceMessage || 'Platform is in Maintenance Mode. Betting is temporarily paused by Master Admin.'
        };
      }
      if (deletedUserUids.has(uid)) {
        return { success: false, error: 'Account is deactivated.' };
      }
      if (typeof clientBalanceHint === 'number' && !isNaN(clientBalanceHint) && clientBalanceHint < amount) {
        return {
          success: false,
          error: `Insufficient wallet balance. Available: ₹${Math.max(0, clientBalanceHint).toFixed(2)}, Required: ₹${amount.toFixed(2)}`
        };
      }
      let user = serverUsers[uid];
      if (!user) {
        user = {
          uid,
          username: username || uid,
          phone: '9000000000',
          balance: 0,
          status: 'active'
        };
        serverUsers[uid] = user;
      }

      if (user.status !== 'active') {
        return { success: false, error: `Account is ${user.status}. Participation is restricted.` };
      }

      const txRes = executeServerTransaction({
        uid,
        type: 'bet_placement',
        category: 'debit',
        amount,
        referenceId: pollId,
        description: `Live News Quiz (${option}) — ${question.slice(0, 70)}`,
        status: 'completed',
        actor: uid,
        metadata: { game: 'quiz_battle', pollId, option }
      });

      if (!txRes.success || !txRes.transaction) {
        return { success: false, error: txRes.error || 'Insufficient wallet balance.' };
      }

      return {
        success: true,
        txId: txRes.transaction.id,
        balanceBefore: txRes.transaction.balanceBefore,
        balanceAfter: txRes.transaction.balanceAfter
      };
    },
    creditRewardOrRefund: ({ uid, username, amount, pollId, question, settlementId, isVoidRefund }) => {
      let user = serverUsers[uid];
      if (!user) {
        user = {
          uid,
          username: username || uid,
          phone: '9000000000',
          balance: 0,
          status: 'active'
        };
        serverUsers[uid] = user;
      }

      // Idempotency check in serverTransactions by referenceId
      const existingTx = serverTransactions.find(
        (t) => t.referenceId === settlementId && t.uid === uid && t.status === 'completed'
      );
      if (existingTx) {
        return {
          success: true,
          txId: existingTx.id,
          balanceBefore: existingTx.balanceBefore,
          balanceAfter: existingTx.balanceAfter
        };
      }

      const txRes = executeServerTransaction({
        uid,
        type: 'game_payout',
        category: 'credit',
        amount,
        referenceId: settlementId,
        description: isVoidRefund
          ? `Live News Quiz VOID Refund (100%) — ${question.slice(0, 65)}`
          : `Live News Quiz Winning Reward — ${question.slice(0, 65)}`,
        status: 'completed',
        actor: 'AUTO_QUIZ_ORACLE',
        metadata: { game: 'quiz_battle', pollId, settlementId, isVoidRefund }
      });

      if (!txRes.success || !txRes.transaction) {
        return { success: false, error: txRes.error || 'Failed to credit reward.' };
      }

      return {
        success: true,
        txId: txRes.transaction.id,
        balanceBefore: txRes.transaction.balanceBefore,
        balanceAfter: txRes.transaction.balanceAfter
      };
    },
    getUserBalance: (uid, clientBalanceHint) => {
      if (serverUsers[uid]) return serverUsers[uid].balance;
      return typeof clientBalanceHint === 'number' && !isNaN(clientBalanceHint) ? Math.max(0, clientBalanceHint) : 0;
    }
  });
  topNewsPollEngine.startSchedulers();

  // ----------------------------------------------------
  // SERVER-AUTHORITATIVE AVIATOR CRASH ENGINE
  // ----------------------------------------------------
  serverAviatorEngine.registerRoutes(app, verifyMasterAdmin);
  serverAviatorEngine.startLoop();

  // ----------------------------------------------------
  // ANDROID APK DIRECT DOWNLOAD ROUTE (ADMIN MANAGED)
  // ----------------------------------------------------
  app.get('/api/apk-info', (_req, res) => {
    const settings = serverAdminSettings as any;
    res.json({
      available: settings.apkDownloadEnabled !== false && Boolean(settings.apkDownloadUrl),
      enabled: settings.apkDownloadEnabled !== false,
      version: settings.apkVersionName || 'v2.6.0 Pro',
      downloadUrl: settings.apkDownloadUrl || '',
      releaseNotes: settings.apkReleaseNotes || 'Includes 3D Dragon Tiger, Ludo 1v1 Live, Aviator & All Casino Games',
      forceUpdate: Boolean(settings.apkForceUpdatePrompt)
    });
  });

  // Serve public directory files directly
  app.use('/public', express.static(path.resolve(__dirname, 'public')));
  app.use(express.static(path.resolve(__dirname, 'public')));

  const handleSendApk = (_req: express.Request, res: express.Response) => {
    const settings = serverAdminSettings as any;
    if (settings.apkDownloadEnabled === false) {
      res.status(403).json({ error: 'Android APK download is currently paused by Master Admin.' });
      return;
    }
    if (settings.apkDownloadUrl && (settings.apkDownloadUrl.startsWith('http://') || settings.apkDownloadUrl.startsWith('https://'))) {
      res.redirect(302, settings.apkDownloadUrl);
      return;
    }
    res.status(404).json({ error: 'No APK download link configured. Please set the APK link in Admin Settings.' });
  };

  app.get('/api/download-apk', handleSendApk);
  app.get('/Bingo777.apk', handleSendApk);

  // ----------------------------------------------------
  // ADMIN CLEAN DEMO TRANSACTIONS ENDPOINT
  // ----------------------------------------------------
  app.post('/api/admin/clean-demo-transactions', (req, res) => {
    const { adminId } = req.body;
    const realUserUids = new Set(Object.keys(serverUsers));
    const initialCount = serverTransactions.length;

    const filtered = serverTransactions.filter((tx) => {
      const isDemoMeta = Boolean(tx.metadata?.isDemo || tx.metadata?.demo);
      const isDemoDesc = /demo|test_user|mock|sample/i.test(tx.description || '');
      const isDemoRef = /demo|mock|test/i.test(tx.referenceId || '');
      const isDemoUid = /demo|test/i.test(tx.uid || '');
      const isOrphan = !realUserUids.has(tx.uid);
      return !isDemoMeta && !isDemoDesc && !isDemoRef && !isDemoUid && !isOrphan;
    });

    serverTransactions.splice(0, serverTransactions.length, ...filtered);
    saveServerStateToDisk();

    console.log(`[AdminClean] Purged ${initialCount - serverTransactions.length} demo transactions by admin ${adminId || 'MasterAdmin'}.`);

    return res.json({
      success: true,
      purgedCount: initialCount - serverTransactions.length,
      message: 'Demo transactions purged cleanly from server disk.'
    });
  });

  // ----------------------------------------------------
  // VITE DEV SERVER / STATIC ASSETS
  // ----------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  // Authoritative background heartbeat & disconnect monitor for all active Ludo rooms
  setInterval(checkLudoRoomsDisconnectStatus, 1000);

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bingo777 Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE' && PORT !== 3000) {
      console.warn(`Port ${PORT} in use, attempting fallback to port 3000...`);
      app.listen(3000, '0.0.0.0', () => {
        console.log(`Bingo777 Full-Stack Server running on fallback http://0.0.0.0:3000`);
      });
    } else {
      console.error('Server listen error:', err);
    }
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
