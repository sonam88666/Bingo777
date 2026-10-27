export type BetColor = 'green' | 'violet' | 'red';
export type BetSize = 'big' | 'small';

export type GameId = 'wingo' | 'trx_wingo' | 'aviator' | 'k3_dice' | 'wheel' | 'ludo' | 'quiz_battle' | 'dragon_tiger';

export interface UserRecord {
  uid: string;
  phone: string;
  username: string;
  balance: number;
  vipLevel: number;
  status: 'active' | 'suspended' | 'banned' | 'deactivated';
  createdAt: number;
  lastActive: number;
  isOnline: boolean;
  avatarSeed?: string;
  totalBetsCount: number;
  totalWonAmount: number;
  totalLostAmount: number;
  totalDeposited?: number;
  totalWithdrawn?: number;
  devices: Record<string, DeviceRecord>;
  role?: 'user' | 'master_admin';
  referralCode: string;
  referredBy?: string;
  referredByCode?: string;
  referralCount?: number;
  signupBonusStatus: 'pending' | 'credited';
  signupBonusAmount: number;
  signupBonusTxId?: string;
  firstDepositBonusStatus: 'pending' | 'credited' | 'not_eligible';
  firstDepositBonusAmount?: number;
  firstDepositBonusTxId?: string;
  firstDepositApprovedAt?: number;
  dailyBettingActivity?: Record<string, number>;
  lastWheelSpinAt?: number;
  lastCheckInDate?: string;
  checkInDay?: number;
  signupBonusClaimed?: boolean;
  signupBonusPending?: number;
  firstDepositBonusClaimed?: boolean;
  lastLogin?: number;
  passwordHash?: string;
}

export interface DeviceRecord {
  deviceId: string;
  deviceName: string;
  browser: string;
  os: string;
  registeredAt: number;
  lastUsedAt: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: number;
  approvedBy?: string;
  rejectionReason?: string;
  requestedAt?: number;
  deviceModel?: string;
  osVersion?: string;
}

export interface LiveBet {
  betId: string;
  uid: string;
  username: string;
  gameId?: GameId;
  roundPeriod: string;
  gameType: '30s' | '1min' | '3min' | '5min';
  betType: 'color' | 'number' | 'size' | 'k3_sum' | 'k3_dice' | '5d_digit' | 'crash_multiplier';
  betValue: string; // 'green', 'violet', 'red', '0'...'9', 'big', 'small'
  amount: number;
  multiplier: number;
  potentialPayout: number;
  status: 'pending' | 'won' | 'lost';
  actualPayout: number;
  timestamp: number;
}

export interface GameRound {
  period: string; // e.g. "20261013001"
  gameType: '30s' | '1min' | '3min' | '5min';
  startTime: number;
  endTime: number;
  winningNumber: number; // 0 - 9
  winningColor: BetColor[]; // e.g. [green] or [red, violet] (0 is red+violet, 5 is green+violet)
  winningSize: BetSize; // big (5-9) or small (0-4)
  totalBetVolume: number;
  totalPayout: number;
  hash: string;
  isResolved: boolean;
  manualOverrideNumber?: number | null;
  blockHash?: string; // For TRX Win Go
}

// Aviator / Crash Game Models
export interface AviatorBet {
  id: string;
  uid: string;
  username: string;
  station?: 1 | 2;
  amount: number;
  cashedOutMultiplier?: number;
  autoCashoutMultiplier?: number;
  payout: number;
  status: 'in_flight' | 'cashed_out' | 'crashed';
  placedAt?: number;
  cashedOutAt?: number;
  txId?: string;
  payoutTxId?: string;
  isBot?: boolean;
  avatarBg?: string;
}

export interface AviatorRound {
  roundId: string;
  roundNumber?: number;
  startTime: number;
  flightStartTime?: number;
  crashTime?: number;
  crashMultiplier: number;
  currentMultiplier?: number;
  status: 'waiting' | 'flying' | 'crashed';
  manualCrashOverride?: number | null;
  serverSeedHash?: string;
  serverSeed?: string;
  clientSeed?: string;
  nonce?: number;
  hmacHash?: string;
  rtp?: number;
  bets: Record<string, AviatorBet>;
}

export interface AviatorEngineConfig {
  enabled: boolean;
  paused: boolean;
  rtpPercent: number; // default 97 (3% house edge)
  minBet: number; // default 50
  maxBet: number; // default 50000
  maxPayoutPerBet?: number; // default 500000
  maxMultiplierCap: number; // default 1000
  waitingDurationMs?: number; // default 5000
  crashedDisplayMs?: number; // default 3500
  allowAutoCashout?: boolean;
  allowDualBets?: boolean;
  enableMultiplayerBots?: boolean;
  clientSeed?: string;
  updatedAt: number;
  updatedBy: string;
  nextCrashOverride?: number | null;
  waitDurationSeconds?: number;
  crashDisplaySeconds?: number;
  provablyFairClientSeed?: string;
  houseEdgePercent?: number;
  instantCrashProbabilityPercent?: number;
  autoCashoutAllowed?: boolean;
  dualBetStationsAllowed?: boolean;
}

export interface AviatorRoundHistoryItem {
  roundId: string;
  roundNumber?: number;
  crashMultiplier: number;
  serverSeedHash: string;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  hmacHash: string;
  rtpPercent?: number;
  totalBetVolume?: number;
  totalPayout?: number;
  houseProfit?: number;
  marginPercent?: number;
  betsCount?: number;
  cashedOutCount?: number;
  startedAt?: number;
  crashedAt?: number;
  timestamp?: number;
}

export interface AviatorSimulationReport {
  totalRounds: number;
  rtpPercent: number;
  executionTimeMs: number;
  meanMultiplier: number;
  medianMultiplier: number;
  maxObservedMultiplier: number;
  minObservedMultiplier: number;
  distribution: {
    instantCrash1x: { count: number; percent: number; expectedPercent: number };
    low1_01to1_99x: { count: number; percent: number; expectedPercent: number };
    medium2to9_99x: { count: number; percent: number; expectedPercent: number };
    high10to99_99x: { count: number; percent: number; expectedPercent: number };
    ultra100xPlus: { count: number; percent: number; expectedPercent: number };
  };
  strategyRtpChecks: Array<{
    targetMultiplier: number;
    wins: number;
    winRatePercent: number;
    expectedWinRatePercent: number;
    empiricalRtpPercent: number;
    passed: boolean;
  }>;
  fairnessChecks: {
    cryptographicDeterminismPassed: boolean;
    zeroDuplicateSeedsPassed: boolean;
    independenceFromBetSizePassed: boolean;
    serialCorrelationScore: number;
    serialIndependencePassed: boolean;
    allChecksPassed: boolean;
    failures: string[];
  };
  timestamp: number;
}

// K3 Lotre Dice Game Models
export interface K3Round {
  period: string;
  startTime: number;
  endTime: number;
  dice: [number, number, number]; // 1-6
  sum: number; // 3-18
  size: 'big' | 'small'; // big: 11-18, small: 3-10
  parity: 'odd' | 'even';
  isResolved: boolean;
  manualOverrideDice?: [number, number, number] | null;
}

// 5D Lotre Game Models
export interface FiveDRound {
  period: string;
  startTime: number;
  endTime: number;
  digits: [number, number, number, number, number]; // A, B, C, D, E (0-9)
  sum: number;
  size: 'big' | 'small';
  isResolved: boolean;
  manualOverrideDigits?: [number, number, number, number, number] | null;
}

// Mines Game Model
export interface MinesSession {
  sessionId: string;
  uid: string;
  betAmount: number;
  minesCount: number; // 1 to 24
  gridSize: number; // 25 (5x5)
  mineIndices: number[];
  revealedIndices: number[];
  currentMultiplier: number;
  isGameOver: boolean;
  hasWon: boolean;
  cashedOut: boolean;
  payout: number;
}

export interface DepositRecord {
  id: string;
  uid: string;
  username: string;
  phone: string;
  amount: number; // Credited/Equivalent INR amount in user wallet
  usdtAmount?: number; // If paymentMethod === 'USDT', the amount in USDT ($)
  usdtNetwork?: 'ERC20';
  usdtReceiverAddress?: string;
  paymentMethod: 'UPI' | 'USDT';
  referenceId: string; // 12-Digit UTR or ERC20 Transaction Hash (TXID)
  receiptUrl?: string;
  upiReceiverId?: string; // Which UPI was used (Primary or Secondary Backup)
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  adminNote?: string;
}

export type TransactionType = 
  | 'deposit' 
  | 'withdrawal' 
  | 'bet_placement' 
  | 'game_payout' 
  | 'gift_code' 
  | 'admin_adjustment'
  | 'signup_bonus'
  | 'first_deposit_bonus'
  | 'referral_bonus'
  | 'mlm_commission';

export interface MlmCommissionEntry {
  id: string;
  earnerUid: string;
  sourceUid: string;
  sourceUsername: string;
  level: 1 | 2 | 3;
  ratePercent: number; // 1.0, 0.5, 0.25
  betTurnover: number;
  commissionAmount: number;
  gameName: string;
  timestamp: number;
  claimed: boolean;
}

export interface MlmMemberNode {
  uid: string;
  username: string;
  phoneMasked: string;
  level: 1 | 2 | 3;
  totalTurnover: number;
  commissionGenerated: number;
  joinedAt: number;
  isActiveToday: boolean;
}

export interface MlmDashboardData {
  referralCode: string;
  unclaimedCommission: number;
  totalClaimedCommission: number;
  lifetimeCommission: number;
  todayCommission: number;
  level1Rate: number; // 1.0%
  level2Rate: number; // 0.5%
  level3Rate: number; // 0.25%
  level1Members: MlmMemberNode[];
  level2Members: MlmMemberNode[];
  level3Members: MlmMemberNode[];
  recentCommissions: MlmCommissionEntry[];
}

export interface ReferralRecord {
  id: string; // e.g. "ref_1729000_1729001"
  referrerUid: string;
  referrerUsername: string;
  referredUid: string;
  referredUsername: string;
  referredPhone: string;
  referralCode?: string;
  registeredAt: number;
  firstDepositApprovedAt?: number;
  firstDepositAmount?: number;
  qualifyingDaysCompleted: number; // 0 to 10
  dailyTurnover: Record<string, number>; // "YYYY-MM-DD" -> total settled bets
  status: 'pending_deposit' | 'activity_in_progress' | 'eligible' | 'credited' | 'rejected';
  bonusAmount: number; // ₹120
  creditedAt?: number;
  transactionId?: string;
  rejectionReason?: string;
}

export interface WalletTransaction {
  id: string; // unique transaction ID, e.g. "tx_1729112345678_k9x2"
  uid: string;
  type: TransactionType;
  category: 'credit' | 'debit';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string; // UTR, withdrawalId, betId, period, code
  description: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'rejected';
  metadata?: Record<string, unknown>;
  integritySeal?: string;
}

export interface ReconciliationReport {
  uid: string;
  username: string;
  currentBalance: number;
  calculatedBalance: number;
  discrepancy: number; // current - calculated
  isMatch: boolean;
  totalDeposited: number;
  totalWithdrawn: number;
  totalBet: number;
  totalWon: number;
  totalAdjusted: number;
  totalGifts: number;
  totalBonuses: number;
  transactionsCount: number;
  lastReconciledAt: number;
}

export interface WithdrawalRecord {
  id: string;
  uid: string;
  username: string;
  phone: string;
  amount: number; // INR amount deducted from wallet
  usdtAmount?: number; // If payoutMethod === 'USDT (ERC20)', the USDT ($) payout amount
  payoutMethod: 'Bank Transfer' | 'UPI' | 'USDT (ERC20)';
  accountDetails: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    holderName?: string;
    upiId?: string;
    usdtAddress?: string;
    usdtNetwork?: 'ERC20';
  };
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: number;
  processedAt?: number;
  processedBy?: string;
  rejectionReason?: string;
}

export interface GiftCode {
  code: string;
  amount: number;
  maxUses: number;
  usedCount: number;
  claimedBy: Record<string, { uid: string; claimedAt: number }>;
  createdAt: number;
  expiresAt: number;
  createdBy: string;
  isActive: boolean;
  minVipLevel?: number;
}

export interface ChatMessage {
  id: string;
  uid: string;
  username: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: number;
  read: boolean;
}

export interface AdminSettings {
  appName: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  maintenanceEstimatedResumeTime?: string;
  announcement: string;
  // Financial Thresholds
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  // Official UPI Cashier (Primary & Backup Channel)
  officialUpiId: string;
  officialUpiName: string;
  secondaryUpiId?: string; // Backup UPI ID (e.g. suman.1299@superyes)
  secondaryUpiName?: string; // Backup UPI Merchant Name (e.g. SUMAN ENTERPRISES)
  // Official USDT (ERC20) Cashier & Limits
  usdtErc20Address?: string; // Default: 0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45
  usdtNetwork?: string; // Default: 'ERC20'
  minUsdtDeposit?: number; // Default: $5
  minUsdtWithdrawal?: number; // Default: $10
  usdtExchangeRate?: number; // Default: 90 INR per 1 USDT
  // Platform Zero-Loss Engine & House Edge
  zeroPlatformLossMode: boolean; // When true: platform never runs at a loss
  minPlatformProfitPercent: number; // e.g. 15% guaranteed house retention
  autoGameResolution: boolean; // if false, admin decides outcome
  colorGreenMultiplier: number;
  colorRedMultiplier: number;
  colorVioletMultiplier: number;
  numberMultiplier: number;
  sizeMultiplier: number;
  payoutFeePercent: number;
  supportPhone: string;
  supportTelegram: string;
  aviatorCrashRTP: number; // e.g. 97%
  k3Multiplier: number;
  minesHouseEdge: number;
  // Bonus & Referral Configuration
  signupBonusAmount: number; // default ₹120
  firstDepositBonusPercent: number; // default 100%
  firstDepositBonusMaxCap: number; // default e.g. 50000
  referralBonusAmount: number; // default ₹120
  referralRequiredDays: number; // default 10 calendar days
  referralDailyBetRequirement: number; // default ₹100 settled daily turnover
  checkInBonuses: number[]; // e.g. [10, 25, 50, 80, 150, 250, 500]
  mlmLevel1Rate?: number; // default 1.0%
  mlmLevel2Rate?: number; // default 0.5%
  mlmLevel3Rate?: number; // default 0.25%
  featureMlm?: boolean; // default true
  // Feature Modules Management
  featureWinGo30s?: boolean;
  featureWinGo1min?: boolean;
  featureWinGo3min?: boolean;
  featureTrxWinGo?: boolean;
  featureAviator?: boolean;
  featureK3Dice?: boolean;
  feature5DLotre?: boolean;
  featureMines?: boolean;
  featureDeposits?: boolean;
  featureWithdrawals?: boolean;
  featureUsdtDeposit?: boolean;
  featureUsdtWithdrawal?: boolean;
  featureGiftCodes?: boolean;
  featureReferrals?: boolean;
  featureSignupBonus?: boolean;
  featureFirstDepositBonus?: boolean;
  featureLiveChat?: boolean;
  featureDeviceApproval?: boolean;
  roundDurationSeconds?: number;
  upiId?: string;
  upiMerchantName?: string;
  requireDeviceApproval?: boolean;
  announcementText?: string;
  // Multiple UPI Management
  upiChannels?: UpiChannel[];
  activeUpiChannelId?: string;
  // Android APK & Update Management
  apkDownloadEnabled?: boolean;
  apkVersionName?: string;
  apkFileName?: string;
  apkDownloadUrl?: string;
  apkFileSize?: string;
  apkReleaseNotes?: string;
  apkForceUpdatePrompt?: boolean;
}

export interface UpiChannel {
  id: string;
  upiId: string;
  merchantName: string;
  isActive: boolean;
  label?: string;
  addedAt?: number;
}

export type UserNotificationType =
  | 'support_update'
  | 'withdrawal_processed'
  | 'deposit_processed'
  | 'mlm_commission'
  | 'system_alert';

export interface UserNotification {
  id: string;
  uid: string;
  type: UserNotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  statusBadge?: 'approved' | 'rejected' | 'pending' | 'replied' | 'resolved' | 'info';
  referenceId?: string;
  amount?: number;
  actionTarget?: 'support' | 'wallet_records' | 'wallet_withdraw' | 'referral';
}

export interface AdminCommand {
  commandId: string;
  action: 'maintenance_toggle' | 'balance_override' | 'round_override' | 'device_approval' | 'broadcast';
  payload: Record<string, unknown>;
  issuedBy: string;
  timestamp: number;
  status: 'executed' | 'pending';
}

export interface FeatureModule {
  id: string;
  name: string;
  category: 'GAME' | 'FINANCIAL' | 'BONUS' | 'SECURITY' | 'ENGAGEMENT' | 'CUSTOM';
  description: string;
  enabled: boolean;
  visibleInUserApp: boolean;
  status: 'active' | 'maintenance' | 'deactivated';
  isCoreSystem?: boolean;
  badgeText?: string;
  minVipLevel?: number;
  config?: Record<string, string | number | boolean>;
  updatedAt: number;
  updatedBy: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: number;
  actor: string;
  category: 'AUTH' | 'FINANCIAL' | 'BALANCE' | 'DEVICE' | 'GAME_CONTROL' | 'SETTINGS' | 'FEATURE' | 'GIFT_CODE';
  action: string;
  details: string;
  targetUser?: string;
  affectedRecordId?: string;
  reason?: string;
  outcome?: 'SUCCESS' | 'DENIED' | 'BACKUP_CREATED';
  ipAddress?: string;
}

export interface FirebaseConnectionConfig {
  databaseUrl: string;
  apiKey?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  databaseURL?: string;
  enabled?: boolean;
}

export interface RoundSettlementNotice {
  resultId: string;
  roundPeriod: string;
  gameName?: string;
  gameType: '30s' | '1min' | '3min' | '5min';
  winningNumber: number;
  winningColors: BetColor[];
  winningSize: BetSize;
  uid: string;
  isWin: boolean;
  totalBetAmount: number;
  totalPayout: number;
  netProfit: number;
  walletBalanceAfter: number;
  bets: LiveBet[];
  settledAt: number;
  acknowledged?: boolean;
}

export type NewsPollCategory =
  | 'Gold & Silver'
  | 'Stock Market'
  | 'Crypto'
  | 'India & World News'
  | 'Sports';

export type NewsPollStatus =
  | 'LIVE'
  | 'APPROVED'
  | 'VERIFYING'
  | 'RESOLVED'
  | 'VOID'
  | 'ARCHIVED'
  | 'PENDING_APPROVAL'
  | 'REJECTED'
  | 'EXPIRED';

export type NewsPollOutcome = 'YES' | 'NO' | 'VOID' | 'PENDING';

export interface NewsFeedSource {
  feedId: string;
  name: string;
  publisher: string;
  url: string;
  category: NewsPollCategory;
  tier: 1 | 2;
  isBackup?: boolean;
  status: 'healthy' | 'retrying' | 'failed' | 'skipped_broken' | 'untested';
  lastCheckedAt: number | null;
  lastCheckedAtIST: string | null;
  lastSuccessAt: number | null;
  lastSuccessAtIST: string | null;
  latestItemTitle: string | null;
  latestItemPubDate: string | null;
  itemsDiscovered: number;
  errorCount: number;
  lastError: string | null;
  retryAfter: number | null;
  backoffMs: number;
}

export interface NewsQuizParticipation {
  participationId: string;
  pollId: string;
  uid: string;
  username: string;
  option: 'YES' | 'NO';
  stakeAmount: number;
  multiplier: number;
  potentialPayout: number;
  debitTxId: string;
  participatedAt: number;
  participatedAtIST: string;
  status: 'ACTIVE' | 'WON' | 'LOST' | 'REFUNDED_VOID';
  payoutAmount?: number;
  settlementTxId?: string;
  settledAt?: number;
  settledAtIST?: string;
  clientSynced?: boolean;
}

export interface NewsQuizSettlementRecord {
  settlementId: string;
  pollId: string;
  question: string;
  category: NewsPollCategory;
  uid: string;
  username: string;
  selectedOption: 'YES' | 'NO';
  verifiedOutcome: 'YES' | 'NO' | 'VOID';
  stakeAmount: number;
  payoutAmount: number;
  netProfit: number;
  status: 'WON' | 'LOST' | 'REFUNDED_VOID';
  debitTxId: string;
  settlementTxId: string;
  settledAt: number;
  settledAtIST: string;
}

export interface NewsPollItem {
  pollId: string;
  question: string;
  options: ['YES', 'NO'];
  category: NewsPollCategory;
  context: string;
  headline: string;
  resolutionRule: string;
  verificationWindowHours: number;
  isMarketDisclaimerRequired: boolean;
  sourceUrl: string;
  sourceName: string;
  confirmingSources: string[];
  publishedAt: number;
  publishedAtIST: string;
  createdAt: number;
  createdAtIST: string;
  opensAt: number;
  opensAtIST: string;
  closesAt: number;
  closesAtIST: string;
  importanceScore: number;
  selectionReason: string;
  fingerprint: string;
  generationMethod: 'gemini_ai' | 'rule_based_fallback';
  generationNote?: string;
  status: NewsPollStatus;
  outcome?: NewsPollOutcome;
  verifiedOutcome?: 'YES' | 'NO' | 'VOID';
  verificationSource?: string;
  verificationEvidence?: string;
  verifiedAt?: number;
  verifiedAtIST?: string;
  expiresFromDbAt?: number;
  expiresFromDbAtIST?: string;
  cleanedUpFromActiveAt?: number;
  cleanedUpFromActiveAtIST?: string;
  approvedBy?: string;
  approvedAt?: number;
  approvedAtIST?: string;
  rejectedBy?: string;
  rejectedAt?: number;
  rejectedAtIST?: string;
  rejectionReason?: string;
  yesVotes: number;
  noVotes: number;
  totalVotes: number;
  yesPool: number;
  noPool: number;
  totalPool: number;
  houseMarginPercent?: number;
  houseMarginAmount?: number;
  distributablePool?: number;
  rewardMultiplier: number;
  winnersCount?: number;
  totalRewardsPaid?: number;
  totalRefundsPaid?: number;
  userVote?: 'YES' | 'NO' | null;
  userParticipation?: NewsQuizParticipation | null;
}

export interface NewsPollSystemLog {
  id: string;
  timestamp: number;
  timestampIST: string;
  type:
    | 'FEED_DISCOVERY'
    | 'RSS_MONITOR'
    | 'HOURLY_RANK'
    | 'POLL_GENERATED'
    | 'AUTO_PUBLISHED'
    | 'PARTICIPATION_RECORDED'
    | 'RESULT_VERIFIED'
    | 'REWARDS_PROCESSED'
    | 'SERVER_CLEANUP'
    | 'ADMIN_APPROVAL'
    | 'ADMIN_REJECT'
    | 'POLL_EXPIRED'
    | 'ERROR';
  message: string;
  details?: string;
}

export interface NewsPollLeaderboardEntry {
  uid: string;
  username: string;
  totalVotes: number;
  winsCount?: number;
  totalStaked?: number;
  totalWon?: number;
  categoriesVoted: number;
  lastVotedAt: number;
  lastVotedAtIST: string;
}

