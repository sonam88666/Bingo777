import {
  UserRecord,
  DeviceRecord,
  LiveBet,
  GameRound,
  DepositRecord,
  WithdrawalRecord,
  GiftCode,
  ChatMessage,
  AdminSettings,
  AuditLogItem,
  BetColor,
  BetSize,
  FirebaseConnectionConfig,
  GameId,
  AviatorRound,
  AviatorBet,
  K3Round,
  FiveDRound,
  MinesSession,
  WalletTransaction,
  ReconciliationReport,
  TransactionType,
  ReferralRecord,
  RoundSettlementNotice,
  FeatureModule,
  MlmCommissionEntry,
  MlmMemberNode,
  MlmDashboardData,
  UserNotification,
  UserNotificationType,
  AviatorEngineConfig,
  AviatorRoundHistoryItem,
  AviatorSimulationReport,
  UpiChannel,
  WinGoOverridePayload,
  WinGoOverrideType
} from '../types';
import {
  rtdb,
  rtdbRef,
  rtdbSet,
  rtdbUpdate,
  rtdbRemove,
  rtdbOnValue,
  rtdbRunTransaction
} from '../firebase';
import { soundFx } from './soundFx';
import {
  computeProvablyFairCrash,
  sha256Hex,
  computeMultiplierAtElapsedMs,
  computeFlightDurationMsForMultiplier,
  runAviatorMonteCarloSimulation,
  verifyProvablyFairRound
} from './aviatorProvablyFair';

// Default initial Admin Settings
export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  appName: 'Bingo777',
  maintenanceMode: false,
  maintenanceMessage: 'System Upgrade & Maintenance in Progress. Betting is temporarily paused. Your funds are 100% safe.',
  maintenanceResumeTime: '',
  maintenanceEstimatedResumeTime: '',
  maintenanceBypassUids: [],
  announcement: 'Welcome to Bingo777! Play Win Go, TRX Win Go, Aviator, K3 Dice, 5D Lotre & Mines with verified payouts & fair odds.',
  // Master Game Switchboard
  allGamesEnabled: true,
  wingoEnabled: true,
  aviatorEnabled: true,
  k3Enabled: true,
  trxEnabled: true,
  ludoEnabled: true,
  dragonTigerEnabled: true,
  liveQuizEnabled: true,
  wheelEnabled: true,
  // Financial & Payment Gateways
  minDeposit: 250,
  maxDeposit: 100000,
  minWithdrawal: 500,
  maxWithdrawal: 50000,
  usdtAddress: '0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45',
  usdtRate: 90,
  officialUpiId: 'BHARATPE09905641446@yesbankltd',
  officialUpiName: 'BHARATPE ENTERPRISES',
  secondaryUpiId: 'suman.1299@superyes',
  secondaryUpiName: 'SUMAN ENTERPRISES',
  upiId: 'BHARATPE09905641446@yesbankltd',
  upiMerchantName: 'BHARATPE ENTERPRISES',
  usdtErc20Address: '0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45',
  usdtNetwork: 'ERC20',
  minUsdtDeposit: 5,
  minUsdtWithdrawal: 10,
  usdtExchangeRate: 90,
  zeroPlatformLossMode: true,
  minPlatformProfitPercent: 15,
  autoGameResolution: true,
  colorGreenMultiplier: 2.0,
  colorRedMultiplier: 2.0,
  colorVioletMultiplier: 4.5,
  numberMultiplier: 9.0,
  sizeMultiplier: 2.0,
  payoutFeePercent: 2.0,
  supportPhone: '+91 98765 43210',
  supportTelegram: '@colourWinAdmin',
  aviatorCrashRTP: 95,
  k3Multiplier: 2.0,
  minesHouseEdge: 3,
  // Promotional & Loyalty Settings
  signupBonusAmount: 120,
  firstDepositBonusPercent: 100,
  firstDepositBonusMaxCap: 50000,
  referralBonusAmount: 120,
  referralRequiredDays: 10,
  referralQualifyingDays: 10,
  referralDailyBetRequirement: 100,
  referralQualifyingBet: 100,
  checkInBonuses: [10, 25, 50, 80, 150, 250, 500],
  dailyStreakRewards: [10, 25, 50, 80, 150, 250, 500],
  mlmLevel1Rate: 1.0,
  mlmLevel2Rate: 0.5,
  mlmLevel3Rate: 0.25,
  featureMlm: true,
  // All 29 Core App Features
  allowUserSignup: true,
  allowUserLogin: true,
  allowUpiDeposit: true,
  allowUsdtDeposit: true,
  allowWithdrawals: true,
  allowBankWithdrawal: true,
  allowUpiWithdrawal: true,
  allowUsdtWithdrawal: true,
  ludoVoiceChatEnabled: true,
  ludoChatPresetsEnabled: true,
  featureWinGo30s: true,
  featureWinGo1min: true,
  featureWinGo3min: true,
  featureTrxWinGo: true,
  featureAviator: true,
  featureK3Dice: true,
  feature5DLotre: true,
  featureMines: true,
  featureDeposits: true,
  featureWithdrawals: true,
  featureUsdtDeposit: true,
  featureUsdtWithdrawal: true,
  featureGiftCodes: true,
  featureReferrals: true,
  featureSignupBonus: true,
  featureFirstDepositBonus: true,
  featureLiveChat: true,
  featureDeviceApproval: true,
  requireDeviceApproval: true,
  // Custom Game Parameters
  aviatorNextCrash: null,
  aviatorMaxCap: 1000,
  aviatorTargetRtp: 95,
  wingoResultOverrides: {},
  masterSecurityPin: '7777',
  // Multiple UPI Management
  activeUpiChannelId: 'upi_1',
  upiChannels: [
    {
      id: 'upi_1',
      upiId: 'BHARATPE09905641446@yesbankltd',
      merchantName: 'BHARATPE ENTERPRISES',
      isActive: true,
      label: 'Channel 1 (Official Primary)'
    },
    {
      id: 'upi_2',
      upiId: 'suman.1299@superyes',
      merchantName: 'SUMAN ENTERPRISES',
      isActive: false,
      label: 'Channel 2 (Backup Receiver)'
    }
  ],
  // Android APK & Update Management
  apkDownloadEnabled: true,
  apkVersionName: 'v2.6.0 Pro',
  apkFileName: 'Bingo777.apk',
  apkDownloadUrl: '/api/download-apk',
  apkFileSize: '12.4 MB',
  apkReleaseNotes: 'Includes 3D Dragon Tiger, Ludo 1v1 Live, Aviator & All Casino Games',
  apkForceUpdatePrompt: false,
  // Global Authentication & OTP Configuration (/admin_settings/auth_config)
  auth_config: {
    otpLoginEnabled: true,
    passwordLoginEnabled: true,
    directLoginEnabled: true
  },
  // Official Telegram Support Configuration (/admin_settings/telegram_support)
  telegram_support: {
    enabled: true,
    supportTitle: '24/7 Official Support',
    telegramUsernameOrLink: 'https://t.me/colourWinAdmin',
    buttonText: 'Chat on Telegram'
  }
};

export const INITIAL_FEATURE_MODULES: Record<string, FeatureModule> = {
  wingo: {
    id: 'wingo',
    name: 'Win Go Color & Number Prediction',
    category: 'GAME',
    description: 'Core 0-9 number, Green/Violet/Red color, and Big/Small lottery draw engine.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'HOT 9.0X',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  wingo_30s: {
    id: 'wingo_30s',
    name: 'Win Go 30s Fast Mode',
    category: 'GAME',
    description: '30-second high-frequency Win Go draw interval.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: '30 SEC',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  wingo_1min: {
    id: 'wingo_1min',
    name: 'Win Go 1-Minute Standard',
    category: 'GAME',
    description: '1-minute standard Win Go lottery draw interval.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: '1 MIN',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  wingo_3min: {
    id: 'wingo_3min',
    name: 'Win Go 3-Minute Strategic',
    category: 'GAME',
    description: '3-minute strategic Win Go lottery draw interval.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: '3 MIN',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  trx_wingo: {
    id: 'trx_wingo',
    name: 'TRX Hash Win Go',
    category: 'GAME',
    description: 'Cryptographic Tron blockchain block-hash lottery draw.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'TRON HASH',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  aviator: {
    id: 'aviator',
    name: 'Aviator Crash Multiplier',
    category: 'GAME',
    description: 'Real-time multiplier flight crash game with auto-cashout.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: '100X CRASH',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  k3_dice: {
    id: 'k3_dice',
    name: 'K3 Lotre 3-Dice Game',
    category: 'GAME',
    description: '3-Dice sum (3-18), Big/Small, Odd/Even lottery.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: '240X DICE',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  ludo: {
    id: 'ludo',
    name: 'Ludo 1v1 Live Battle & Global Chat',
    category: 'GAME',
    description: 'Real-time 1v1 multiplayer skill Ludo board game with live player voice/text chat and 10% house margin.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'LIVE 1V1',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  wheel: {
    id: 'wheel',
    name: 'Fortune Wheel Lucky Spin',
    category: 'GAME',
    description: 'Real-time spinning fortune wheel with instant multiplier cash prizes.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'LUCKY SPIN',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  quiz_battle: {
    id: 'quiz_battle',
    name: 'Live Quiz Battle & News Polls',
    category: 'GAME',
    description: 'Automated AI news-driven YES/NO live quiz poll battle with 15% house margin and pool distribution.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'LIVE QUIZ',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  dragon_tiger: {
    id: 'dragon_tiger',
    name: 'Dragon vs Tiger 3D Royal Arena',
    category: 'GAME',
    description: '3D Live Casino Dragon vs Tiger card battle with 1:1 Dragon/Tiger, 9x Tie, and 50x Suited Tie payouts.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: '3D CASINO',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  deposits: {
    id: 'deposits',
    name: 'UPI Deposit Cashier Gateway',
    category: 'FINANCIAL',
    description: 'Player UPI deposit submission with 12-digit UTR & receipt verification.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'UPI ONLY',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  withdrawals: {
    id: 'withdrawals',
    name: 'Payout & Withdrawal Desk',
    category: 'FINANCIAL',
    description: 'Player UPI & Bank Transfer withdrawal requests with atomic balance reservation.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'FAST PAYOUT',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  signup_bonus: {
    id: 'signup_bonus',
    name: '₹120 Signup Bonus Program',
    category: 'BONUS',
    description: 'New user ₹120 registration bonus unlocked upon first approved deposit.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: '₹120 BONUS',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  first_deposit_bonus: {
    id: 'first_deposit_bonus',
    name: '100% First Deposit Match Bonus',
    category: 'BONUS',
    description: '100% match bonus credited once on a player’s first Master Admin-approved deposit.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: '100% MATCH',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  referrals: {
    id: 'referrals',
    name: '₹120 Refer & Earn Program',
    category: 'BONUS',
    description: '₹120 referral reward after referee completes first deposit + 10 qualifying betting days.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: '₹120 REFER',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  gift_codes: {
    id: 'gift_codes',
    name: 'Gift Vouchers & Promo Codes',
    category: 'BONUS',
    description: 'Promotional gift voucher redemption with usage quotas, expiry, and VIP eligibility.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'VOUCHERS',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  ludo_voice_chat: {
    id: 'ludo_voice_chat',
    name: 'Ludo Live Voice Chat & Mic',
    category: 'ENGAGEMENT',
    description: 'Live WebRTC microphone, table speaker audio, and spoken voice callouts inside Ludo.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'VOICE MIC',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  ludo_text_chat: {
    id: 'ludo_text_chat',
    name: 'Ludo Table Text & Quick Chat',
    category: 'ENGAGEMENT',
    description: 'In-match text chat drawer and quick emoji phrase bar inside Ludo tables.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'TABLE CHAT',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  ludo_tournaments: {
    id: 'ludo_tournaments',
    name: 'Ludo Championship Tournaments',
    category: 'GAME',
    description: 'Daily Grand Cup, Speed Ludo Blitz, and Royal 4P Master tournament events in Ludo.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: false,
    badgeText: 'TOURNEY',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  ludo_private_rooms: {
    id: 'ludo_private_rooms',
    name: 'Ludo Private Rooms & Code Join',
    category: 'GAME',
    description: 'Create private 2P/3P/4P Ludo tables and join friends via custom room code.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: false,
    badgeText: 'PRIVATE CODE',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  upi_channel_1: {
    id: 'upi_channel_1',
    name: 'Primary UPI Gateway (Channel 1)',
    category: 'FINANCIAL',
    description: 'Primary official UPI ID & QR code channel (BHARATPE09905641446@yesbankltd).',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'UPI CH-1',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  upi_channel_2: {
    id: 'upi_channel_2',
    name: 'Backup UPI Gateway (Channel 2 - Suman)',
    category: 'FINANCIAL',
    description: 'Secondary backup UPI ID & QR code channel (suman.1299@superyes) when Channel 1 is busy.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'UPI CH-2',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  upi_withdrawal: {
    id: 'upi_withdrawal',
    name: 'UPI Instant Withdrawal Option',
    category: 'FINANCIAL',
    description: 'Allow players to request withdrawals directly to their personal UPI ID.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'UPI PAYOUT',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  bank_withdrawal: {
    id: 'bank_withdrawal',
    name: 'Bank Account (IMPS/NEFT) Withdrawal',
    category: 'FINANCIAL',
    description: 'Allow players to request withdrawals to their Bank Account + IFSC.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'BANK IMPS',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  usdt_deposit: {
    id: 'usdt_deposit',
    name: 'USDT (ERC20) Crypto Deposit',
    category: 'FINANCIAL',
    description: 'Allow players to deposit USDT via ERC20 network ($5 Min) with Master Admin INR conversion & approval.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'USDT ERC20',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  usdt_withdrawal: {
    id: 'usdt_withdrawal',
    name: 'USDT (ERC20) Crypto Withdrawal',
    category: 'FINANCIAL',
    description: 'Allow players to withdraw to their ERC20 USDT wallet address ($10 Min) with Master Admin approval.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'USDT PAYOUT',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  deposit_history: {
    id: 'deposit_history',
    name: 'Wallet Ledger & Transaction History',
    category: 'FINANCIAL',
    description: 'Show deposit, withdrawal, and wallet transaction history tab to players.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: false,
    badgeText: 'LEDGER',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  mlm_affiliate: {
    id: 'mlm_affiliate',
    name: '3-Tier MLM Affiliate Commission Tree',
    category: 'BONUS',
    description: 'Multi-level L1 (1%), L2 (0.5%), L3 (0.25%) downline betting turnover commission system.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: '3-TIER MLM',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  daily_checkin: {
    id: 'daily_checkin',
    name: '7-Day Daily Attendance Streak Bonus',
    category: 'BONUS',
    description: 'Daily check-in reward program from Day 1 (₹10) up to Day 7 (₹500).',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: false,
    badgeText: 'DAILY REWARD',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  hero_carousel: {
    id: 'hero_carousel',
    name: 'Lobby Hero Promotional Banner',
    category: 'ENGAGEMENT',
    description: 'Top sliding promotional hero banner carousel in the main game lobby.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: false,
    badgeText: 'HERO UI',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  jackpot_banner: {
    id: 'jackpot_banner',
    name: 'Live Progressive Jackpot Pool Banner',
    category: 'ENGAGEMENT',
    description: 'Real-time ticking progressive jackpot prize counter in the game lobby.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: false,
    badgeText: 'JACKPOT',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  live_winners_ticker: {
    id: 'live_winners_ticker',
    name: 'Live Recent Winners & Payout Feed',
    category: 'ENGAGEMENT',
    description: 'Live scrolling feed of recent winning payouts at the bottom of the lobby.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: false,
    badgeText: 'LIVE FEED',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  audio_settings: {
    id: 'audio_settings',
    name: '3D Sound Effects & Background Music',
    category: 'ENGAGEMENT',
    description: 'Allow users to toggle 3D sound effects and casino background music in Account view.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: false,
    badgeText: '3D AUDIO',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  bet_history: {
    id: 'bet_history',
    name: 'Player Betting History & Records',
    category: 'ENGAGEMENT',
    description: 'Allow players to inspect their complete game betting history in Account view.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: false,
    badgeText: 'BET LOGS',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  app_update_modal: {
    id: 'app_update_modal',
    name: 'App Version & System Update Option',
    category: 'ENGAGEMENT',
    description: 'Show App Update & Version checker option in the user Account view.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: false,
    badgeText: 'APP UPDATE',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  live_support: {
    id: 'live_support',
    name: '24/7 Live Support Concierge',
    category: 'ENGAGEMENT',
    description: 'Direct real-time support chat and Telegram concierge for players.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: '24/7 CHAT',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  user_registration: {
    id: 'user_registration',
    name: 'New User Sign Up / Registration',
    category: 'SECURITY',
    description: 'Allow new players to register an account with Mobile Number, Password & Captcha.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'SIGN UP',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  user_login: {
    id: 'user_login',
    name: 'User Mobile & Password Login',
    category: 'SECURITY',
    description: 'Allow existing players to sign in with their Mobile Number & Password.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'LOGIN',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  },
  device_approval: {
    id: 'device_approval',
    name: 'Device Security & Approval Gate',
    category: 'SECURITY',
    description: 'Hardware/browser fingerprint tracking and Master Admin device authorization.',
    enabled: true,
    visibleInUserApp: true,
    status: 'active',
    isCoreSystem: true,
    badgeText: 'ZERO TRUST',
    minVipLevel: 1,
    updatedAt: Date.now() - 86400000,
    updatedBy: 'MasterAdmin_01'
  }
};

// Clean Initial Production State: Zero demo users, zero mock transactions
const INITIAL_USERS: Record<string, UserRecord> = {};

const INITIAL_GIFT_CODES: Record<string, GiftCode> = {};

const INITIAL_DEPOSITS: DepositRecord[] = [];
const INITIAL_WITHDRAWALS: WithdrawalRecord[] = [];
const INITIAL_SUPPORT_MESSAGES: ChatMessage[] = [];
const INITIAL_USER_NOTIFICATIONS: UserNotification[] = [];
const INITIAL_REFERRALS: ReferralRecord[] = [];
const INITIAL_AUDIT_LOGS: AuditLogItem[] = [];
const INITIAL_TRANSACTIONS: WalletTransaction[] = [];

// Safe storage helper resilient against SSR, test environments, and QuotaExceededError
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    } catch {}
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch {
      try {
        if (typeof localStorage !== 'undefined') {
          // Free redundant duplicate/backup keys if browser quota is reached
          localStorage.removeItem('maanwin_rtdb_store');
          localStorage.removeItem('bingo777_backup_auto');
          localStorage.setItem(key, value);
        }
      } catch {}
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    } catch {}
  }
};

// Central Authoritative Store with Multiple Games
class AuthoritativeStore {
  private users: Record<string, UserRecord>;
  public liveBets: LiveBet[];
  private pastRounds: GameRound[];
  public currentRound: GameRound;
  private deposits: DepositRecord[];
  private withdrawals: WithdrawalRecord[];
  private giftCodes: Record<string, GiftCode>;
  private supportMessages: ChatMessage[];
  private adminSettings: AdminSettings;
  private auditLogs: AuditLogItem[];
  private firebaseConfig: FirebaseConnectionConfig;
  private transactions: WalletTransaction[];
  private deletedUserUids: Set<string>;
  private referrals: ReferralRecord[];
  private featureModules: Record<string, FeatureModule>;
  private deletedFeaturesBackup: Record<string, FeatureModule> = {};
  private deletedUsersBackup: Record<string, UserRecord> = {};

  // Multi-Game States
  private wingoOverridesByMode: Partial<Record<'30s' | '1min' | '3min', WinGoOverridePayload>> = {};
  private trxCurrentRound: GameRound;
  private trxPastRounds: GameRound[];

  private aviatorCurrentRound: AviatorRound;
  private aviatorPastCrashes: number[] = [];
  private aviatorTotalStaked: number = 0;
  private aviatorTotalPaidOut: number = 0;
  private aviatorLiveMultiplier: number = 1.00;
  private aviatorServerSeed: string = 'b777_provably_fair_seed_2026_v1_' + Math.random().toString(36).substring(2, 12);
  private aviatorClientSeed: string = 'bingo777-public-aviator-seed-v1';
  private aviatorRoundNonce: number = 1000;
  private aviatorSettledRoundIds: Set<string> = new Set();
  private aviatorCashedOutBetIds: Set<string> = new Set();
  private aviatorHistoryItems: AviatorRoundHistoryItem[] = [];
  private aviatorLastSimulationReport: AviatorSimulationReport | null = null;
  private aviatorEngineConfig: AviatorEngineConfig = {
    enabled: true,
    paused: false,
    rtpPercent: 95,
    houseEdgePercent: 5,
    minBet: 50,
    maxBet: 100000,
    maxMultiplierCap: 50,
    streakBreakerEnabled: true,
    waitDurationSeconds: 5,
    crashDisplaySeconds: 3,
    instantCrashProbabilityPercent: 4,
    autoCashoutAllowed: true,
    dualBetStationsAllowed: true,
    provablyFairClientSeed: 'bingo777-public-aviator-seed-v1',
    nextCrashOverride: null,
    updatedAt: Date.now(),
    updatedBy: 'MasterAdmin'
  };
  public onAviatorRoundSynced?: (round: AviatorRound, liveMultiplier: number) => void;
  private aviatorSessionRounds: Array<{
    roundId: string;
    roundNumber?: number;
    crashMultiplier: number;
    totalBetVolume: number;
    totalPayout: number;
    houseProfit: number;
    marginPercent: number;
    betsCount: number;
    timestamp: number;
    serverSeedHash?: string;
    serverSeed?: string;
    clientSeed?: string;
    nonce?: number;
    hmacHash?: string;
  }> = [];

  private k3CurrentRound: K3Round;
  private k3PastRounds: K3Round[];

  private fiveDCurrentRound: FiveDRound;
  private fiveDPastRounds: FiveDRound[];

  private activeMinesSessions: Record<string, MinesSession> = {};

  private listeners: Set<() => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private settlementNotices: Record<string, RoundSettlementNotice[]> = {};
  private settlementListeners: Set<(notice: RoundSettlementNotice) => void> = new Set();
  private userNotifications: UserNotification[] = [];
  private userNotificationListeners: Set<(notif: UserNotification) => void> = new Set();
  private acknowledgedResultIds: Set<string> = new Set();
  private resolvedPeriodIds: Set<string> = new Set();
  private activeRoundsByMode: Partial<Record<'30s' | '1min' | '3min', GameRound>> = {};
  private activeWheelSpinStakes: Record<string, number> = {};
  private lastBetActionAtByUid: Record<string, number> = {};
  private recentTxTimestampsByUid: Record<string, number[]> = {};
  private backgroundSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private serverTimeOffset: number = 0;

  public setServerTimeOffset(offsetMs: number): void {
    if (typeof offsetMs === 'number' && Number.isFinite(offsetMs)) {
      this.serverTimeOffset = offsetMs;
    }
  }

  public getServerNow(): number {
    return Date.now() + this.serverTimeOffset;
  }

  constructor() {
    this.deletedUserUids = new Set();
    try {
      // Deprecate & purge legacy local storage dumps so multi-device Firebase state is never overridden
      safeStorage.removeItem('bingo777_rtdb_store');
      safeStorage.removeItem('maanwin_rtdb_store');
      safeStorage.removeItem('bingo777_permanent_users_v1');
      safeStorage.removeItem('bingo777_backup_auto');

      const ackJson = safeStorage.getItem('bingo777_ack_results');
      if (ackJson) {
        const ackArr = JSON.parse(ackJson);
        if (Array.isArray(ackArr)) {
          ackArr.forEach((id: string) => this.acknowledgedResultIds.add(id));
        }
      }
    } catch {}

    this.users = this.getSanitizedInitialUsers();
    this.liveBets = [];
    this.pastRounds = [];
    this.deposits = INITIAL_DEPOSITS;
    this.withdrawals = INITIAL_WITHDRAWALS;
    this.giftCodes = INITIAL_GIFT_CODES;
    this.supportMessages = INITIAL_SUPPORT_MESSAGES;
    this.adminSettings = { ...DEFAULT_ADMIN_SETTINGS, maintenanceMode: false };
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.firebaseConfig = {
      databaseUrl: 'https://gen-lang-client-0859410588-default-rtdb.firebaseio.com',
      databaseURL: 'https://gen-lang-client-0859410588-default-rtdb.firebaseio.com',
      projectId: 'gen-lang-client-0859410588',
      apiKey: 'AIzaSyB8OQZI2dXCQIphSrPU1dSUsWdx5POAVf4',
      enabled: true
    };
    this.transactions = INITIAL_TRANSACTIONS;
    this.referrals = INITIAL_REFERRALS;
    this.featureModules = { ...INITIAL_FEATURE_MODULES };
    this.userNotifications = [...INITIAL_USER_NOTIFICATIONS];

    // Immediately purge any cached demo users, demo deposits, and demo transactions
    this.purgeDemoRecords();

    // Ensure all user UIDs are unique IDs and NEVER phone numbers
    this.sanitizeUserUids();

    this.currentRound = this.generateNewRound('30s');
    this.activeRoundsByMode['30s'] = this.currentRound;
    this.activeRoundsByMode['1min'] = this.generateNewRound('1min');
    this.activeRoundsByMode['3min'] = this.generateNewRound('3min');

    // Ensure all 3 Win Go timeframes (30s, 1min, 3min) have an equal 30-period history list
    this.normalizeWinGoPastRounds(30);

    // Initialize TRX Win Go
    this.trxPastRounds = [];
    this.seedTrxRounds();
    this.trxCurrentRound = this.generateNewTrxRound('1min');

    // Initialize Aviator with Provably Fair crash history
    this.aviatorPastCrashes = (this.aviatorPastCrashes || []).filter(
      (c) => typeof c === 'number' && Number.isFinite(c) && c >= 1.0
    );
    if (this.aviatorPastCrashes.length < 12) {
      this.aviatorPastCrashes = [];
      for (let i = 0; i < 15; i++) {
        this.aviatorRoundNonce += 1;
        const pf = computeProvablyFairCrash(
          this.aviatorServerSeed,
          this.aviatorClientSeed,
          this.aviatorRoundNonce,
          this.aviatorEngineConfig.rtpPercent,
          this.aviatorEngineConfig.maxMultiplierCap
        );
        this.aviatorPastCrashes.unshift(pf.crashMultiplier);
      }
    }
    this.aviatorRoundNonce += 1;
    const initPf = computeProvablyFairCrash(
      this.aviatorServerSeed,
      this.aviatorClientSeed,
      this.aviatorRoundNonce,
      this.aviatorEngineConfig.rtpPercent,
      this.aviatorEngineConfig.maxMultiplierCap
    );
    this.aviatorCurrentRound = {
      roundId: `av_${this.aviatorRoundNonce}_${this.getServerNow()}`,
      roundNumber: this.aviatorRoundNonce,
      startTime: this.getServerNow() + 5000,
      crashMultiplier: initPf.crashMultiplier,
      status: 'waiting',
      serverSeedHash: initPf.serverSeedHash,
      clientSeed: this.aviatorClientSeed,
      nonce: this.aviatorRoundNonce,
      hmacHash: initPf.hmacHex,
      bets: {}
    };

    if (typeof window !== 'undefined') {
      this.startAviatorRealtimeSync();
    }

    // Initialize K3 Lotre Dice
    this.k3PastRounds = [];
    this.seedK3Rounds();
    this.k3CurrentRound = this.generateNewK3Round();

    // Initialize 5D Lotre
    this.fiveDPastRounds = [];
    this.seedFiveDRounds();
    this.fiveDCurrentRound = this.generateNewFiveDRound();

    // Reconcile any orphaned pending bets
    this.reconcilePendingBetsFromHistory();

    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        try {
          this.broadcastChannel = new BroadcastChannel('bingo777_sync_channel');
          this.broadcastChannel.onmessage = (event) => {
            if (event.data && typeof event.data === 'object' && event.data.type === 'user_deleted') {
              delete this.users[event.data.uid];
              this.deletedUserUids.add(event.data.uid);
              this.safeNotifyListeners();
            } else if (event.data && typeof event.data === 'object' && event.data.type === 'settlement_notice') {
              const incoming: RoundSettlementNotice = event.data.notice;
              if (incoming && incoming.resultId && !this.isResultAcknowledged(incoming.resultId)) {
                this.settlementListeners.forEach((listener) => {
                  try {
                    listener(incoming);
                  } catch {}
                });
              }
            }
          };
        } catch {}
      }

      // Global background lifecycle & round settlement watchdog aligned to server time
      setInterval(() => {
        this.checkAndResolveExpiredRounds();
      }, 1000);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.checkAndResolveExpiredRounds();
          this.safeNotifyListeners();
        }
      });
    }
  }

  public safeNotifyListeners(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('[Store] Listener execution error intercepted:', err);
      }
    });
  }

  private scheduleBackgroundSave(): void {
    if (this.backgroundSaveTimer) return;
    this.backgroundSaveTimer = setTimeout(() => {
      this.backgroundSaveTimer = null;
      this.saveToStorage();
    }, 2500);
  }

  private normalizePhone(phone: string | undefined): string {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
  }

  private computeTransactionSeal(tx: {
    id: string;
    uid: string;
    type: TransactionType;
    category: 'credit' | 'debit';
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

  // Sanitizes the transaction ledger to purge any bot/hack/tampered or duplicate records
  public sanitizeTransactionsLedger(): void {
    if (!Array.isArray(this.transactions)) {
      this.transactions = [];
      return;
    }

    const seenTxIds = new Set<string>();
    const seenCreditRefs = new Set<string>();
    const seenSingleBonusByUid = new Set<string>();
    const sanitized: WalletTransaction[] = [];

    // Process oldest to newest so first legitimate record wins on duplicate IDs/references
    const chronological = [...this.transactions]
      .filter(
        (t) =>
          t &&
          typeof t === 'object' &&
          typeof t.id === 'string' &&
          typeof t.uid === 'string' &&
          typeof t.amount === 'number' &&
          Number.isFinite(t.amount) &&
          t.amount > 0 &&
          t.amount <= 10000000
      )
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    for (const tx of chronological) {
      if (seenTxIds.has(tx.id)) continue;

      // If transaction already carries a seal, verify it has not been tampered with in localStorage
      const expectedSeal = this.computeTransactionSeal(tx);
      if (tx.integritySeal && tx.integritySeal !== expectedSeal) {
        continue;
      }

      // Deduplicate credit referenceIds per user and type
      if (
        tx.category === 'credit' &&
        tx.referenceId &&
        (tx.type === 'deposit' ||
          tx.type === 'game_payout' ||
          tx.type === 'gift_code' ||
          tx.type === 'signup_bonus' ||
          tx.type === 'first_deposit_bonus' ||
          tx.type === 'referral_bonus')
      ) {
        const refKey = `${tx.uid}|${tx.type}|${tx.referenceId}`;
        if (seenCreditRefs.has(refKey)) continue;
        seenCreditRefs.add(refKey);
      }

      // Max 1 signup_bonus and 1 first_deposit_bonus per user
      if (tx.category === 'credit' && (tx.type === 'signup_bonus' || tx.type === 'first_deposit_bonus')) {
        const bonusKey = `${tx.uid}|${tx.type}`;
        if (seenSingleBonusByUid.has(bonusKey)) continue;
        seenSingleBonusByUid.add(bonusKey);
      }

      seenTxIds.add(tx.id);
      tx.amount = Math.round(tx.amount * 100) / 100;
      tx.integritySeal = expectedSeal;
      sanitized.push(tx);
    }

    // Store newest first
    this.transactions = sanitized.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  // Computes a user's wallet balance from their transaction history ledger while preserving
  // real-time Firebase RTDB synchronized balances across devices.
  public computeVerifiedLedgerBalance(uid: string): number {
    if (!uid) return 0;
    const liveUser = this.users?.[uid];
    const liveSyncedBalance =
      liveUser && typeof liveUser.balance === 'number' && Number.isFinite(liveUser.balance) && liveUser.balance >= 0
        ? Math.round(liveUser.balance * 100) / 100
        : 0;

    if (!Array.isArray(this.transactions)) return liveSyncedBalance;

    const approvedDepositsForUser = Array.isArray(this.deposits)
      ? this.deposits.filter((d) => d && d.uid === uid && d.status === 'approved')
      : [];

    const userTxs = this.transactions
      .filter(
        (t) =>
          t &&
          t.uid === uid &&
          typeof t.amount === 'number' &&
          Number.isFinite(t.amount) &&
          t.amount > 0 &&
          t.amount <= 10000000 &&
          (t.status === 'completed' || (t.type === 'withdrawal' && t.status === 'pending'))
      )
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    if (userTxs.length === 0) return liveSyncedBalance;

    const seenTxIds = new Set<string>();
    const seenCreditRefs = new Set<string>();
    let signupBonusCount = 0;
    let firstDepositBonusCount = 0;

    let totalDeposited = 0;
    let totalWithdrawn = 0;
    let totalBet = 0;
    let totalWon = 0;
    let totalAdjusted = 0;
    let totalGifts = 0;
    let totalBonuses = 0;

    for (const tx of userTxs) {
      if (seenTxIds.has(tx.id)) continue;
      seenTxIds.add(tx.id);

      // Verify cryptographic seal if present
      if (tx.integritySeal && tx.integritySeal !== this.computeTransactionSeal(tx)) {
        continue;
      }

      if (tx.category === 'credit' && tx.referenceId) {
        const refKey = `${tx.type}|${tx.referenceId}`;
        if (
          tx.type === 'deposit' ||
          tx.type === 'game_payout' ||
          tx.type === 'gift_code' ||
          tx.type === 'signup_bonus' ||
          tx.type === 'first_deposit_bonus' ||
          tx.type === 'referral_bonus'
        ) {
          if (seenCreditRefs.has(refKey)) continue;
          seenCreditRefs.add(refKey);
        }
      }

      if (tx.type === 'deposit' && tx.category === 'credit' && tx.status === 'completed') {
        const matchingApprovedDeposit = approvedDepositsForUser.find(
          (d) =>
            d.referenceId === tx.referenceId ||
            `${d.referenceId}_${d.id}` === tx.referenceId ||
            (tx.metadata && tx.metadata.depositId === d.id)
        );
        if (matchingApprovedDeposit) {
          totalDeposited += tx.amount;
        } else {
          // Accept cloud-synced completed deposit transaction from RTDB/Admin
          totalDeposited += tx.amount;
        }
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
      } else if (tx.type === 'signup_bonus' && tx.category === 'credit' && tx.status === 'completed') {
        if (signupBonusCount === 0) {
          signupBonusCount += 1;
          totalBonuses += tx.amount;
        }
      } else if (tx.type === 'first_deposit_bonus' && tx.category === 'credit' && tx.status === 'completed') {
        if (firstDepositBonusCount === 0) {
          firstDepositBonusCount += 1;
          totalBonuses += tx.amount;
        }
      } else if (
        (tx.type === 'referral_bonus' || tx.type === 'mlm_commission') &&
        tx.category === 'credit' &&
        tx.status === 'completed'
      ) {
        totalBonuses += tx.amount;
      } else if (tx.type === 'admin_adjustment' && tx.status === 'completed') {
        if (tx.referenceId && tx.referenceId.startsWith('att_')) {
          if (tx.amount <= 500) {
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

    const computedNet = Math.max(0, Math.round(net * 100) / 100);
    // If the user has a positive RTDB-synced balance and local ledger didn't capture the initial credit yet, preserve liveSyncedBalance
    if (liveSyncedBalance > 0 && computedNet === 0 && totalDeposited === 0 && totalAdjusted === 0) {
      return liveSyncedBalance;
    }
    return computedNet;
  }

  public getDeterministicOutcomeForPeriod(period: string, gameType: string = '30s'): number {
    const cleanPeriod = String(period || '');
    let hashSum = 0;
    for (let i = 0; i < cleanPeriod.length; i++) {
      hashSum = (hashSum * 31 + cleanPeriod.charCodeAt(i) + (gameType.charCodeAt(0) || 0)) % 1000003;
    }
    return Math.abs(hashSum) % 10;
  }

  // Sanitizes transaction ledger without wiping live RTDB-synchronized user balances.
  public enforceAllUsersLedgerIntegrity(): void {
    this.sanitizeTransactionsLedger();
  }

  private mergeSingleUserRecord(existing: UserRecord | undefined, incoming: UserRecord): UserRecord {
    const cleanPhone = this.normalizePhone(incoming.phone) || this.normalizePhone(existing?.phone);
    const targetUid = existing?.uid || incoming.uid;
    const incomingBal = typeof incoming.balance === 'number' && Number.isFinite(incoming.balance) ? incoming.balance : undefined;
    const existingBal = existing && typeof existing.balance === 'number' && Number.isFinite(existing.balance) ? existing.balance : 0;
    const rawResolved =
      incomingBal !== undefined
        ? existing && existing.uid !== incoming.uid && existingBal > 0 && incomingBal === 0
          ? existingBal
          : incomingBal
        : existingBal;
    const resolvedBalance = Math.max(0, Math.round(rawResolved * 100) / 100);

    if (!existing) {
      return {
        ...incoming,
        phone: cleanPhone || incoming.phone || '',
        balance: resolvedBalance,
        role: incoming.role || 'user'
      };
    }
    const refCnt = Math.max(existing.referralCount || 0, incoming.referralCount || 0, existing.totalReferrals || 0, incoming.totalReferrals || 0);
    return {
      ...existing,
      ...incoming,
      uid: targetUid,
      phone: cleanPhone || existing.phone || incoming.phone || '',
      username: incoming.username || existing.username,
      passwordHash: incoming.passwordHash || existing.passwordHash,
      referralCode: incoming.referralCode || existing.referralCode,
      referredBy: existing.referredBy || incoming.referredBy,
      referredByCode: existing.referredByCode || incoming.referredByCode,
      referralCount: refCnt,
      totalReferrals: refCnt,
      balance: resolvedBalance,
      vipLevel: typeof incoming.vipLevel === 'number' ? incoming.vipLevel : (existing.vipLevel || 1),
      role: incoming.role || existing.role || 'user',
      devices: { ...(existing.devices || {}), ...(incoming.devices || {}) }
    };
  }

  private mergeAllStoredUsers(baseUsers: Record<string, UserRecord>): Record<string, UserRecord> {
    const merged: Record<string, UserRecord> = {};

    const addMap = (source: Record<string, UserRecord> | undefined | null) => {
      if (!source || typeof source !== 'object') return;
      Object.entries(source).forEach(([uid, u]) => {
        if (!u || typeof u !== 'object' || uid.startsWith('usr_demo_') || this.deletedUserUids.has(uid)) {
          return;
        }
        const cleanPhone = this.normalizePhone(u.phone);
        // Check if this phone already exists in merged under another uid
        const existingUidByPhone = cleanPhone
          ? Object.keys(merged).find((k) => this.normalizePhone(merged[k].phone) === cleanPhone)
          : undefined;
        const targetUid = existingUidByPhone || uid;
        merged[targetUid] = this.mergeSingleUserRecord(merged[targetUid], { ...u, uid: targetUid });
      });
    };

    // 1. Auto backup users (fallback)
    // 1. Base users
    addMap(baseUsers);

    // 2. Current in-memory users (synced in real time with Firebase RTDB & Firestore)
    addMap(this.users);

    return merged;
  }

  private savePermanentUsersRegistry() {
    // Deprecated local storage user registry — all users are persisted directly in Firebase RTDB (/users) & Firestore
  }

  public async syncUsersWithBackend(): Promise<void> {
    // Deprecated local file sync — all entities sync in real time via Firebase RTDB & Firestore
  }

  private getSanitizedInitialUsers(): Record<string, UserRecord> {
    const res: Record<string, UserRecord> = {};
    Object.keys(INITIAL_USERS).forEach((uid) => {
      if (!this.deletedUserUids.has(uid)) {
        res[uid] = { ...INITIAL_USERS[uid] };
      }
    });
    return res;
  }

  public backupDataBeforeMigration(): string {
    return '';
  }

  // --- SEEDERS & PER-MODE HISTORY NORMALIZER ---
  private normalizeWinGoPastRounds(targetPerMode: number = 30) {
    const now = this.getServerNow();
    const modes: Array<{ mode: '30s' | '1min' | '3min'; modeCode: string; stepMs: number }> = [
      { mode: '30s', modeCode: '0', stepMs: 30000 },
      { mode: '1min', modeCode: '1', stepMs: 60000 },
      { mode: '3min', modeCode: '3', stepMs: 180000 }
    ];

    const normalizedAll: GameRound[] = [];

    modes.forEach(({ mode, modeCode, stepMs }) => {
      const existingMap = new Map<string, GameRound>();
      let highestResolvedSlotStart = 0;

      (this.pastRounds || []).forEach((r) => {
        if (r && r.gameType === mode && r.period && !r.period.startsWith('20261013')) {
          existingMap.set(r.period, r);
          if (r.isResolved && typeof r.startTime === 'number' && r.startTime > highestResolvedSlotStart) {
            highestResolvedSlotStart = r.startTime;
          }
        }
      });

      const activeRound = this.activeRoundsByMode[mode];
      let currentSlotStart =
        activeRound && !activeRound.isResolved && typeof activeRound.startTime === 'number'
          ? activeRound.startTime
          : Math.floor(now / stepMs) * stepMs;

      // If a round with startTime === currentSlotStart was just resolved, advance currentSlotStart so the resolved round is at idx = 1 (top of history)
      if (highestResolvedSlotStart >= currentSlotStart) {
        currentSlotStart = highestResolvedSlotStart + stepMs;
      }

      const modeList: GameRound[] = [];

      for (let idx = 1; idx <= targetPerMode; idx++) {
        const slotStart = currentSlotStart - idx * stepMs;
        const slotEnd = slotStart + stepMs;
        const d = new Date(slotStart);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;
        const utcMidnight = Date.UTC(year, d.getUTCMonth(), d.getUTCDate());
        const secondsToday = Math.floor((slotStart - utcMidnight) / 1000);
        const roundIndex = Math.floor(secondsToday / (stepMs / 1000)) + 1;
        const periodStr = `${dateStr}${modeCode}${roundIndex.toString().padStart(4, '0')}`;

        const savedRound = existingMap.get(periodStr);
        if (savedRound && savedRound.winningNumber >= 0) {
          modeList.push(savedRound);
        } else {
          const num = this.getDeterministicOutcomeForPeriod(periodStr, mode);
          const color: BetColor[] =
            num === 0
              ? ['red', 'violet']
              : num === 5
              ? ['green', 'violet']
              : num % 2 === 0
              ? ['red']
              : ['green'];
          const size: BetSize = num >= 5 ? 'big' : 'small';
          modeList.push({
            period: periodStr,
            gameType: mode,
            startTime: slotStart,
            endTime: slotEnd,
            winningNumber: num,
            winningColor: color,
            winningSize: size,
            totalBetVolume: 0,
            totalPayout: 0,
            hash: `SHA256_${periodStr}`,
            isResolved: true
          });
        }
      }

      normalizedAll.push(...modeList);
    });

    this.pastRounds = normalizedAll;
  }

  private seedTrxRounds() {
    const now = this.getServerNow();
    const currentSlotStart = Math.floor(now / 60000) * 60000;
    for (let i = 10; i >= 1; i--) {
      const slotStart = currentSlotStart - i * 60000;
      const d = new Date(slotStart);
      const dateStr = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
      const utcMidnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      const roundIndex = Math.floor((slotStart - utcMidnight) / 60000) + 1;
      const period = `TRX${dateStr}1${roundIndex.toString().padStart(4, '0')}`;
      const num = this.getDeterministicOutcomeForPeriod(period, '1min');
      const color: BetColor[] = num === 0 ? ['red', 'violet'] : num === 5 ? ['green', 'violet'] : num % 2 === 0 ? ['red'] : ['green'];
      const size: BetSize = num >= 5 ? 'big' : 'small';
      const blockHash = `0000000003058${period.slice(-8)}${num}`;
      this.trxPastRounds.unshift({
        period,
        gameType: '1min',
        startTime: slotStart,
        endTime: slotStart + 60000,
        winningNumber: num,
        winningColor: color,
        winningSize: size,
        totalBetVolume: 0,
        totalPayout: 0,
        hash: blockHash,
        blockHash,
        isResolved: true
      });
    }
  }

  private seedK3Rounds() {
    const now = this.getServerNow();
    const d = new Date(now);
    const dateStr = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
    for (let i = 10; i >= 1; i--) {
      const d1 = ((i * 3) % 6) + 1;
      const d2 = ((i * 5) % 6) + 1;
      const d3 = ((i * 7) % 6) + 1;
      const sum = d1 + d2 + d3;
      this.k3PastRounds.unshift({
        period: `${dateStr}0${(20 - i).toString().padStart(3, '0')}`,
        startTime: now - i * 60000,
        endTime: now - (i - 1) * 60000,
        dice: [d1, d2, d3],
        sum,
        size: sum >= 11 ? 'big' : 'small',
        parity: sum % 2 === 0 ? 'even' : 'odd',
        isResolved: true
      });
    }
  }

  private seedFiveDRounds() {
    const now = this.getServerNow();
    const d = new Date(now);
    const dateStr = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
    for (let i = 10; i >= 1; i--) {
      const digits: [number, number, number, number, number] = [
        (i * 2) % 10,
        (i * 3) % 10,
        (i * 5) % 10,
        (i * 7) % 10,
        (i * 9) % 10
      ];
      const sum = digits.reduce((a, b) => a + b, 0);
      this.fiveDPastRounds.unshift({
        period: `${dateStr}5${(20 - i).toString().padStart(3, '0')}`,
        startTime: now - i * 60000,
        endTime: now - (i - 1) * 60000,
        digits,
        sum,
        size: sum >= 23 ? 'big' : 'small',
        isResolved: true
      });
    }
  }

  public purgeDemoRecords() {
    // 1. Remove demo users
    const cleanUsers: Record<string, UserRecord> = {};
    for (const [uid, user] of Object.entries(this.users || {})) {
      if (
        !uid.startsWith('usr_demo_') &&
        !uid.startsWith('usr_test_') &&
        !user.username.includes('Tiger99') &&
        !user.username.includes('LuckyStar77') &&
        !user.username.includes('Phoenix_99')
      ) {
        cleanUsers[uid] = user;
      }
    }
    this.users = cleanUsers;

    // 2. Remove demo transactions
    this.transactions = (this.transactions || []).filter(
      (t) => !t.uid.startsWith('usr_demo_') && !t.id.startsWith('tx_init_')
    );

    // 3. Remove demo deposits
    this.deposits = (this.deposits || []).filter(
      (d) => !d.uid.startsWith('usr_demo_') && !d.id.startsWith('dep_100')
    );

    // 4. Remove demo withdrawals
    this.withdrawals = (this.withdrawals || []).filter(
      (w) => !w.uid.startsWith('usr_demo_') && !w.id.startsWith('wth_200')
    );

    // 5. Remove demo referrals
    this.referrals = (this.referrals || []).filter(
      (r) =>
        !r.referrerUid.startsWith('usr_demo_') &&
        !r.referredUid.startsWith('usr_demo_') &&
        !r.id.startsWith('ref_101_')
    );

    // 6. Remove demo liveBets
    this.liveBets = (this.liveBets || []).filter(
      (b) => !b.uid.startsWith('usr_demo_') && !b.betId.startsWith('bet_demo_') && !b.betId.includes('_seed_')
    );

    // 7. Remove demo support messages and user notifications
    this.supportMessages = (this.supportMessages || []).filter((m) => !m.uid.startsWith('usr_demo_'));
    this.userNotifications = (this.userNotifications || []).filter((n) => !n.uid.startsWith('usr_demo_'));

    // 8. Remove demo MLM commissions
    this.mlmCommissions = (this.mlmCommissions || []).filter(
      (c) =>
        !c.earnerUid.startsWith('usr_demo_') &&
        !c.sourceUid.startsWith('usr_demo_') &&
        !c.id.includes('_seed_')
    );

    // 9. Remove default hardcoded free gift codes (BINGO500, MAANWIN500, VIPBONUS1000) & demo claims
    const defaultDemoCodes = new Set(['BINGO500', 'MAANWIN500', 'VIPBONUS1000']);
    for (const [codeKey, code] of Object.entries(this.giftCodes || {})) {
      if (defaultDemoCodes.has(codeKey)) {
        delete this.giftCodes[codeKey];
        continue;
      }
      for (const uid of Object.keys(code.claimedBy || {})) {
        if (uid.startsWith('usr_demo_')) {
          delete code.claimedBy[uid];
          code.usedCount = Math.max(0, (code.usedCount || 1) - 1);
        }
      }
    }

    // 10. Remove any transactions that credited the old default free gift codes
    this.transactions = (this.transactions || []).filter(
      (t) => !(t.type === 'gift_code' && t.referenceId && defaultDemoCodes.has(t.referenceId.toUpperCase()))
    );

    // 11. Enforce strict transaction-ledger balance on all users
    this.enforceAllUsersLedgerIntegrity();

    this.saveToStorage();
    this.saveMlmToStorage();
  }

  public seedDemoUserBets() {
    // Zero demo bets in production
  }

  public seedUserHistoricalBetsForDemo(_uid: string, _username: string) {
    // Zero mock bets: only real bets from real players
  }

  private deduplicateRounds<T extends { period: string }>(rounds: T[]): T[] {
    if (!Array.isArray(rounds)) return [];
    const seen = new Set<string>();
    const result: T[] = [];
    for (const r of rounds) {
      if (r && r.period && !seen.has(r.period)) {
        seen.add(r.period);
        result.push(r);
      }
    }
    return result;
  }

  private getNextRoundSeq(rounds: Array<{ period: string }>, prefix: string, currentPeriod?: string): string {
    let maxSeq = rounds.length;
    for (const r of rounds) {
      if (r && r.period && r.period.startsWith(prefix)) {
        const suffix = parseInt(r.period.slice(prefix.length), 10);
        if (!isNaN(suffix) && suffix > maxSeq) {
          maxSeq = suffix;
        }
      }
    }
    if (currentPeriod && currentPeriod.startsWith(prefix)) {
      const curSuffix = parseInt(currentPeriod.slice(prefix.length), 10);
      if (!isNaN(curSuffix) && curSuffix > maxSeq) {
        maxSeq = curSuffix;
      }
    }
    return (maxSeq + 1).toString().padStart(4, '0');
  }

  // --- ROUND GENERATORS ---
  // --- UNIVERSAL SYNCHRONIZED ROUND GENERATORS ---
  public generateNewRound(gameType: '30s' | '1min' | '3min' | '5min' = '30s', minStartTime?: number): GameRound {
    const duration = gameType === '30s' ? 30000 : gameType === '1min' ? 60000 : gameType === '3min' ? 180000 : 300000;
    const rawNow = this.getServerNow();
    const effectiveNow = minStartTime && minStartTime > rawNow ? minStartTime : rawNow;

    // Aligned to exact Firebase server-clock boundaries so every device (Admin & APK) runs in lockstep
    const startTime = Math.floor(effectiveNow / duration) * duration;
    const endTime = startTime + duration;

    // Deterministic date prefix: YYYYMMDD in UTC
    const d = new Date(startTime);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Mode Code: 30s -> '0', 1min -> '1', 3min -> '3', 5min -> '5'
    const modeCode = gameType === '30s' ? '0' : gameType === '1min' ? '1' : gameType === '3min' ? '3' : '5';

    // Seconds elapsed since UTC midnight
    const utcMidnight = Date.UTC(year, d.getUTCMonth(), d.getUTCDate());
    const secondsToday = Math.floor((startTime - utcMidnight) / 1000);
    const roundIndex = Math.floor(secondsToday / (duration / 1000)) + 1;
    const periodSeq = roundIndex.toString().padStart(4, '0');
    const period = `${dateStr}${modeCode}${periodSeq}`;

    return {
      period,
      gameType: gameType as '30s' | '1min' | '3min',
      startTime,
      endTime,
      winningNumber: -1,
      winningColor: [],
      winningSize: 'small',
      totalBetVolume: 0,
      totalPayout: 0,
      hash: `SHA256_${period}`,
      isResolved: false,
      manualOverrideNumber: null
    };
  }

  public switchRoundMode(mode: '30s' | '1min' | '3min') {
    const curMode = this.currentRound.gameType as '30s' | '1min' | '3min';
    if (curMode === '30s' || curMode === '1min' || curMode === '3min') {
      this.activeRoundsByMode[curMode] = this.currentRound;
    }

    const now = this.getServerNow();
    let existing = this.activeRoundsByMode[mode];
    if (!existing || existing.isResolved || existing.endTime <= now) {
      if (existing && !existing.isResolved && existing.endTime <= now) {
        this.resolveRound(undefined, mode);
        existing = this.activeRoundsByMode[mode];
      }
      if (!existing || existing.isResolved || existing.endTime <= now) {
        existing = this.generateNewRound(mode);
        this.activeRoundsByMode[mode] = existing;
      }
    }
    this.currentRound = existing;
    this.notify();
  }

  public generateNewTrxRound(gameType: '1min' | '3min' = '1min', minStartTime?: number): GameRound {
    const duration = gameType === '1min' ? 60000 : 180000;
    const rawNow = this.getServerNow();
    const effectiveNow = minStartTime && minStartTime > rawNow ? minStartTime : rawNow;
    const startTime = Math.floor(effectiveNow / duration) * duration;
    const endTime = startTime + duration;
    const d = new Date(startTime);
    const dateStr = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
    const utcMidnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const roundIndex = Math.floor((startTime - utcMidnight) / duration) + 1;
    const period = `TRX${dateStr}${gameType === '1min' ? '1' : '3'}${roundIndex.toString().padStart(4, '0')}`;

    return {
      period,
      gameType: gameType as '1min' | '3min' | '5min',
      startTime,
      endTime,
      winningNumber: -1,
      winningColor: [],
      winningSize: 'small',
      totalBetVolume: 0,
      totalPayout: 0,
      hash: '000000000' + Math.random().toString(16).substring(2, 14),
      isResolved: false
    };
  }

  public generateNewK3Round(): K3Round {
    const now = Date.now();
    const periodSeq = this.getNextRoundSeq(this.k3PastRounds, 'K3_2026', this.k3CurrentRound?.period);
    return {
      period: `K3_2026${periodSeq}`,
      startTime: now,
      endTime: now + 60000,
      dice: [1, 1, 1],
      sum: 3,
      size: 'small',
      parity: 'odd',
      isResolved: false
    };
  }

  public generateNewFiveDRound(): FiveDRound {
    const now = Date.now();
    const periodSeq = this.getNextRoundSeq(this.fiveDPastRounds, '5D_2026', this.fiveDCurrentRound?.period);
    return {
      period: `5D_2026${periodSeq}`,
      startTime: now,
      endTime: now + 60000,
      digits: [0, 0, 0, 0, 0],
      sum: 0,
      size: 'small',
      isResolved: false
    };
  }

  private cryptoRandom(): number {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      return buf[0] / 4294967296;
    }
    return Math.random();
  }

  private getCrashTier(mult: number): number {
    if (!Number.isFinite(mult) || mult <= 1.55) return 0; // Early crash: 1.00x - 1.55x
    if (mult <= 2.65) return 1;                           // Around 2x: 1.56x - 2.65x
    if (mult <= 5.80) return 2;                           // Around 5x: 2.66x - 5.80x
    return 3;                                             // Around 10x: 5.81x - 11.20x
  }

  private applyAntiPatternJitter(rawMult: number, minBound: number, maxBound: number): number {
    const recent = (this.aviatorPastCrashes || [])
      .filter((c) => typeof c === 'number' && Number.isFinite(c))
      .slice(0, 6);
    const safeMin = Math.max(1.00, Number.isFinite(minBound) ? minBound : 1.00);
    const safeMax = Math.max(safeMin, Number.isFinite(maxBound) ? maxBound : safeMin);
    const cleanRaw = Number.isFinite(rawMult) ? rawMult : safeMin;
    let candidate = Math.max(safeMin, Math.min(safeMax, Math.floor(cleanRaw * 100) / 100));

    // Only apply a tiny local micro-jitter (±0.03 max) within [safeMin, safeMax] so it NEVER jumps out of house margin bounds
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidateDec = Math.round((candidate % 1) * 100);
      const tooClose = recent.some(
        (prev) => Math.abs(prev - candidate) < 0.02 || Math.round((prev % 1) * 100) === candidateDec
      );
      if (!tooClose) break;
      const microDelta = (this.cryptoRandom() * 0.06) - 0.03;
      candidate = Math.floor(Math.max(safeMin, Math.min(safeMax, cleanRaw + microDelta)) * 100) / 100;
    }

    return Math.max(safeMin, Math.min(safeMax, candidate));
  }

  private generateCrashMultiplier(_forceNoBetMode: boolean = false): number {
    // 1. Explicit Admin Manual Override (/admin_settings/aviator/nextCrashOverride)
    if (
      this.aviatorEngineConfig.nextCrashOverride !== null &&
      this.aviatorEngineConfig.nextCrashOverride !== undefined &&
      Number.isFinite(this.aviatorEngineConfig.nextCrashOverride) &&
      this.aviatorEngineConfig.nextCrashOverride >= 1.0
    ) {
      const overrideVal = Math.max(1.00, Math.floor(this.aviatorEngineConfig.nextCrashOverride * 100) / 100);
      this.aviatorEngineConfig.nextCrashOverride = null;
      rtdbUpdate(rtdbRef(rtdb, 'admin_settings/aviator'), { nextCrashOverride: null }).catch(() => {});
      return overrideVal;
    }
    if (
      this.aviatorCurrentRound?.manualCrashOverride !== null &&
      this.aviatorCurrentRound?.manualCrashOverride !== undefined &&
      Number.isFinite(this.aviatorCurrentRound.manualCrashOverride) &&
      this.aviatorCurrentRound.manualCrashOverride >= 1.0
    ) {
      const manualVal = Math.max(1.00, Math.floor(this.aviatorCurrentRound.manualCrashOverride * 100) / 100);
      this.aviatorCurrentRound.manualCrashOverride = null;
      return manualVal;
    }

    // 2. Provably Fair 5-Tier Realistic Distribution + Anti-Runaway Streak Breaker
    this.aviatorRoundNonce += 1;
    const prevCrash = this.aviatorPastCrashes?.[0] ?? 1.50;
    const maxCap = Math.max(2, Number(this.aviatorEngineConfig.maxMultiplierCap) || 50);
    const pf = computeProvablyFairCrash(
      this.aviatorServerSeed,
      this.aviatorClientSeed,
      this.aviatorRoundNonce,
      this.aviatorEngineConfig.rtpPercent || 95,
      maxCap,
      prevCrash,
      this.aviatorEngineConfig.streakBreakerEnabled !== false
    );
    return Math.min(maxCap, pf.crashMultiplier);
  }

  // --- BROADCAST & SYNC ---
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeSettlement(listener: (notice: RoundSettlementNotice) => void): () => void {
    this.settlementListeners.add(listener);
    return () => {
      this.settlementListeners.delete(listener);
    };
  }

  public getLatestSettlementNotice(uid: string): RoundSettlementNotice | null {
    const list = this.settlementNotices[uid];
    if (!list || list.length === 0) return null;
    return list[list.length - 1];
  }

  public getUnacknowledgedSettlements(uid: string): RoundSettlementNotice[] {
    this.reconcilePendingBetsFromHistory();
    const list = this.settlementNotices[uid] || [];
    return list.filter(
      (n) => n && n.resultId && !n.acknowledged && !this.acknowledgedResultIds.has(n.resultId)
    );
  }

  public isResultAcknowledged(resultId: string): boolean {
    return this.acknowledgedResultIds.has(resultId);
  }

  public acknowledgeSettlement(resultId: string, uid?: string) {
    if (!resultId) return;
    this.acknowledgedResultIds.add(resultId);
    if (uid && this.settlementNotices[uid]) {
      this.settlementNotices[uid] = this.settlementNotices[uid].map((n) =>
        n.resultId === resultId ? { ...n, acknowledged: true } : n
      );
    } else {
      Object.keys(this.settlementNotices).forEach((u) => {
        this.settlementNotices[u] = (this.settlementNotices[u] || []).map((n) =>
          n.resultId === resultId ? { ...n, acknowledged: true } : n
        );
      });
    }
    try {
      safeStorage.setItem('bingo777_ack_results', JSON.stringify(Array.from(this.acknowledgedResultIds)));
    } catch (e) {
      console.warn('Failed saving ack results:', e);
    }
    this.notify();
  }

  private emitSettlementNotice(notice: RoundSettlementNotice) {
    const { uid, resultId } = notice;
    if (!this.settlementNotices[uid]) {
      this.settlementNotices[uid] = [];
    }

    const alreadyAcknowledged = this.acknowledgedResultIds.has(resultId);
    const enrichedNotice: RoundSettlementNotice = {
      ...notice,
      acknowledged: alreadyAcknowledged
    };

    const existingIdx = this.settlementNotices[uid].findIndex((n) => n.resultId === resultId);
    if (existingIdx >= 0) {
      this.settlementNotices[uid][existingIdx] = {
        ...enrichedNotice,
        acknowledged: this.settlementNotices[uid][existingIdx].acknowledged || alreadyAcknowledged
      };
      return;
    }

    this.settlementNotices[uid].push(enrichedNotice);
    if (this.settlementNotices[uid].length > 50) {
      this.settlementNotices[uid].shift();
    }

    if (!enrichedNotice.acknowledged) {
      this.settlementListeners.forEach((listener) => {
        try {
          listener(enrichedNotice);
        } catch (err) {
          console.error('Settlement listener error:', err);
        }
      });

      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage({ type: 'settlement_notice', notice: enrichedNotice });
        } catch (err) {
          console.warn('Broadcast settlement error:', err);
        }
      }
    }
  }

  private notify() {
    this.saveToStorage();
    this.safeNotifyListeners();
  }

  private notifyLightweight() {
    this.scheduleBackgroundSave();
    this.safeNotifyListeners();
  }

  private saveToStorage() {
    try {
      this.normalizeWinGoPastRounds(30);
      if (this.liveBets && this.liveBets.length > 150) {
        this.liveBets = this.liveBets.slice(0, 150);
      }
      if (this.transactions && this.transactions.length > 5000) {
        this.transactions = this.transactions.slice(0, 5000);
      }
      if (this.auditLogs && this.auditLogs.length > 150) {
        this.auditLogs = this.auditLogs.slice(0, 150);
      }
      safeStorage.setItem('bingo777_ack_results', JSON.stringify(Array.from(this.acknowledgedResultIds)));
    } catch {}
  }

  private reloadFromStorage() {
    // Deprecated local storage reload — all state is synchronized directly via Firebase RTDB & Firestore
    this.safeNotifyListeners();
  }

  // --- GETTERS ---
  public getUsers(): Record<string, UserRecord> { return this.users; }
  public getUser(uid: string): UserRecord | undefined {
    const direct = this.users[uid];
    if (direct) {
      if (direct.balance === 0 && direct.phone) {
        const cleanPhone = this.normalizePhone(direct.phone);
        if (cleanPhone) {
          const siblingWithBalance = Object.values(this.users).find(
            (u) => u && u.uid !== uid && this.normalizePhone(u.phone) === cleanPhone && u.balance > 0
          );
          if (siblingWithBalance) {
            direct.balance = siblingWithBalance.balance;
          }
        }
      }
      return direct;
    }
    return undefined;
  }
  public getDeletedUserUids(): string[] { return Array.from(this.deletedUserUids); }
  public getReferrals(): ReferralRecord[] { return this.referrals; }
  public getAllReferrals(): ReferralRecord[] { return this.referrals; }
  public getUserReferrals(referrerUid: string): ReferralRecord[] {
    return this.referrals.filter((r) => r.referrerUid === referrerUid);
  }
  public getReferralByReferred(referredUid: string): ReferralRecord | undefined {
    return this.referrals.find((r) => r.referredUid === referredUid);
  }
  public getLiveBets(): LiveBet[] { return this.liveBets; }
  public getCurrentRound(mode?: '30s' | '1min' | '3min'): GameRound {
    if (mode && this.activeRoundsByMode[mode]) {
      return this.activeRoundsByMode[mode]!;
    }
    return this.currentRound;
  }
  public getWinGoOverride(mode: '30s' | '1min' | '3min' = '30s'): WinGoOverridePayload | null {
    const round = this.getCurrentRound(mode);
    const stored = this.wingoOverridesByMode[mode] || round.overrideConfig || null;
    if (stored && stored.overrideType && stored.overrideType !== 'auto') {
      if (!stored.targetPeriod || stored.targetPeriod === round.period) {
        return stored;
      }
    }
    if (round.manualOverrideNumber !== null && round.manualOverrideNumber !== undefined) {
      return {
        targetPeriod: round.period,
        overrideType: 'number',
        overrideValue: round.manualOverrideNumber,
        updatedAt: Date.now()
      };
    }
    return null;
  }

  public getCandidateNumbersForOverride(
    mode: '30s' | '1min' | '3min',
    period: string,
    manualNum?: number | null
  ): number[] | null {
    const ov = this.wingoOverridesByMode[mode] || this.activeRoundsByMode[mode]?.overrideConfig || null;
    if (ov && ov.overrideType && ov.overrideType !== 'auto' && (!ov.targetPeriod || ov.targetPeriod === period)) {
      if (ov.overrideType === 'number') {
        const n = Number(ov.overrideValue);
        if (Number.isInteger(n) && n >= 0 && n <= 9) return [n];
      } else if (ov.overrideType === 'color') {
        if (ov.overrideValue === 'green') return [1, 3, 7, 9];
        if (ov.overrideValue === 'red') return [2, 4, 6, 8];
        if (ov.overrideValue === 'violet') return [0, 5];
      } else if (ov.overrideType === 'size') {
        if (ov.overrideValue === 'big') return [5, 6, 7, 8, 9];
        if (ov.overrideValue === 'small') return [0, 1, 2, 3, 4];
      }
    }
    if (manualNum !== null && manualNum !== undefined && manualNum >= 0 && manualNum <= 9) {
      return [manualNum];
    }
    return null;
  }

  private pickBestNumberFromCandidates(
    candidates: number[],
    period: string,
    gameType: string
  ): number {
    if (candidates.length === 1) return candidates[0];
    const activeBets = this.liveBets.filter(
      (b) => b.roundPeriod === period && b.status === 'pending'
    );
    if (activeBets.length > 0) {
      let lowestPayout = Infinity;
      let bestCandidates: number[] = [];
      for (const cand of candidates) {
        const colors: BetColor[] =
          cand === 0 ? ['red', 'violet'] : cand === 5 ? ['green', 'violet'] : cand % 2 === 0 ? ['red'] : ['green'];
        const size: BetSize = cand >= 5 ? 'big' : 'small';
        let candPayout = 0;
        for (const b of activeBets) {
          let won = false;
          let rate = 0;
          if (b.betType === 'number' && parseInt(b.betValue, 10) === cand) {
            won = true;
            rate = this.adminSettings.numberMultiplier;
          } else if (b.betType === 'color' && colors.includes(b.betValue as BetColor)) {
            won = true;
            rate =
              b.betValue === 'violet'
                ? this.adminSettings.colorVioletMultiplier
                : colors.length > 1
                ? 1.5
                : this.adminSettings.colorGreenMultiplier;
          } else if (b.betType === 'size' && b.betValue === size) {
            won = true;
            rate = this.adminSettings.sizeMultiplier;
          }
          if (won) candPayout += b.amount * rate;
        }
        if (candPayout < lowestPayout) {
          lowestPayout = candPayout;
          bestCandidates = [cand];
        } else if (candPayout === lowestPayout) {
          bestCandidates.push(cand);
        }
      }
      if (bestCandidates.length > 0) {
        const detIdx = this.getDeterministicOutcomeForPeriod(period, gameType) % bestCandidates.length;
        return bestCandidates[detIdx];
      }
    }
    const det = this.getDeterministicOutcomeForPeriod(period, gameType);
    if (candidates.includes(det)) return det;
    return candidates[det % candidates.length];
  }

  public getPredictedOutcome(mode?: '30s' | '1min' | '3min'): {
    number: number;
    colors: string[];
    size: string;
    activeOverride?: WinGoOverridePayload | null;
  } {
    const resolvedMode = (mode || this.currentRound.gameType || '30s') as '30s' | '1min' | '3min';
    const round = mode && this.activeRoundsByMode[mode] ? this.activeRoundsByMode[mode]! : this.currentRound;
    const overrideCandidates = this.getCandidateNumbersForOverride(
      resolvedMode,
      round.period,
      round.manualOverrideNumber
    );

    let winningNum: number;
    if (overrideCandidates && overrideCandidates.length > 0) {
      winningNum = this.pickBestNumberFromCandidates(overrideCandidates, round.period, round.gameType);
    } else if (this.adminSettings.zeroPlatformLossMode) {
      winningNum = this.pickBestNumberFromCandidates([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], round.period, round.gameType);
    } else {
      winningNum = this.getDeterministicOutcomeForPeriod(round.period, round.gameType);
    }

    const colors: string[] =
      winningNum === 0 ? ['red', 'violet'] : winningNum === 5 ? ['green', 'violet'] : winningNum % 2 === 0 ? ['red'] : ['green'];
    const size: string = winningNum >= 5 ? 'Big' : 'Small';

    return {
      number: winningNum,
      colors,
      size,
      activeOverride: this.getWinGoOverride(resolvedMode)
    };
  }
  public getPastRounds(gameType?: '30s' | '1min' | '3min' | '5min'): GameRound[] {
    if (gameType) {
      return this.pastRounds.filter((r) => r.gameType === gameType).slice(0, 30);
    }
    return this.pastRounds;
  }
  public getDeposits(): DepositRecord[] { return this.deposits; }
  public getWithdrawals(): WithdrawalRecord[] { return this.withdrawals; }
  public getGiftCodes(): Record<string, GiftCode> { return this.giftCodes; }
  public getSupportMessages(): ChatMessage[] { return this.supportMessages; }
  public getAdminSettings(): AdminSettings { return this.adminSettings; }
  public getAuditLogs(): AuditLogItem[] { return this.auditLogs; }
  public getFirebaseConfig(): FirebaseConnectionConfig { return this.firebaseConfig; }
  public getFeatureModules(): Record<string, FeatureModule> { return this.featureModules; }
  public getDeletedFeaturesBackup(): Record<string, FeatureModule> { return this.deletedFeaturesBackup; }
  public getDeletedUsersBackup(): Record<string, UserRecord> { return this.deletedUsersBackup; }

  public readonly MAX_ADMIN_USERS = 5;

  public getActiveSessionUid(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('bingo777_active_uid') || localStorage.getItem('maanwin_active_uid');
    } catch {
      return null;
    }
  }

  public getAdminUsers(): UserRecord[] {
    return Object.values(this.users).filter(
      (u) => u && !this.deletedUserUids.has(u.uid) && u.role === 'master_admin'
    );
  }

  public isUserAdmin(uid?: string | null): boolean {
    const targetUid = uid !== undefined ? uid : this.getActiveSessionUid();
    if (!targetUid) return false;
    const u = this.users[targetUid];
    return Boolean(u && !this.deletedUserUids.has(u.uid) && u.role === 'master_admin' && u.status === 'active');
  }

  public isMaintenanceActiveForUser(uid?: string | null): boolean {
    if (!this.adminSettings.maintenanceMode) return false;
    if (this.isUserAdmin(uid)) return false;
    const targetUid = uid !== undefined ? uid : this.getActiveSessionUid();
    if (targetUid && Array.isArray(this.adminSettings.maintenanceBypassUids) && this.adminSettings.maintenanceBypassUids.includes(targetUid)) {
      return false;
    }
    return true;
  }

  public setUserAdminRole(
    uid: string,
    makeAdmin: boolean,
    adminId: string,
    reason: string = 'Admin role updated by Master Admin'
  ): { success: boolean; error?: string; user?: UserRecord; adminCount: number } {
    const user = this.users[uid];
    if (!user || this.deletedUserUids.has(uid)) {
      return { success: false, error: 'User not found', adminCount: this.getAdminUsers().length };
    }
    const currentAdmins = this.getAdminUsers();
    if (makeAdmin) {
      if (user.role === 'master_admin') {
        return { success: true, user, adminCount: currentAdmins.length };
      }
      if (currentAdmins.length >= this.MAX_ADMIN_USERS) {
        return {
          success: false,
          error: `Maximum 5 Admin limit reached (${this.MAX_ADMIN_USERS}/${this.MAX_ADMIN_USERS}). Please remove an existing Admin first.`,
          adminCount: currentAdmins.length
        };
      }
      user.role = 'master_admin';
    } else {
      user.role = 'user';
    }

    this.savePermanentUsersRegistry();
    if (typeof window !== 'undefined') {
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          phone: user.phone,
          username: user.username,
          password: user.passwordHash,
          uid: user.uid
        })
      }).catch(() => {});
    }

    if (this.onUserSaved) {
      try { this.onUserSaved(user); } catch (e) { console.warn('onUserSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'AUTH',
      action: makeAdmin ? 'ADMIN_ROLE_GRANTED' : 'ADMIN_ROLE_REVOKED',
      details: `${makeAdmin ? 'Selected as Admin (Maintenance Bypass enabled)' : 'Removed from Admin role'} for ${user.username} (${uid}). Total Admins: ${this.getAdminUsers().length}/${this.MAX_ADMIN_USERS}. Reason: ${reason}`,
      targetUser: uid,
      affectedRecordId: uid,
      reason,
      outcome: 'SUCCESS'
    });

    this.notify();
    return { success: true, user, adminCount: this.getAdminUsers().length };
  }

  public isFeatureEnabled(featureId: string): boolean {
    if (this.isMaintenanceActiveForUser() && featureId !== 'live_support') return false;
    const s = this.adminSettings;

    // Unified /admin_settings Master Game Switchboard checks
    const gameIds = ['wingo', 'wingo_30s', 'wingo_1min', 'wingo_3min', 'aviator', 'k3_dice', 'trx_wingo', 'wheel', 'ludo', 'quiz_battle', 'dragon_tiger'];
    if (gameIds.includes(featureId) && s.allGamesEnabled === false) return false;
    if ((featureId === 'wingo' || featureId.startsWith('wingo_')) && s.wingoEnabled === false) return false;
    if (featureId === 'wingo_30s' && s.featureWinGo30s === false) return false;
    if (featureId === 'wingo_1min' && s.featureWinGo1min === false) return false;
    if (featureId === 'wingo_3min' && s.featureWinGo3min === false) return false;
    if (featureId === 'aviator' && (s.aviatorEnabled === false || s.featureAviator === false)) return false;
    if (featureId === 'k3_dice' && (s.k3Enabled === false || s.featureK3Dice === false)) return false;
    if (featureId === 'trx_wingo' && (s.trxEnabled === false || s.featureTrxWinGo === false)) return false;
    if (featureId === 'ludo' && s.ludoEnabled === false) return false;
    if (featureId === 'dragon_tiger' && s.dragonTigerEnabled === false) return false;
    if (featureId === 'quiz_battle' && s.liveQuizEnabled === false) return false;
    if (featureId === 'wheel' && s.wheelEnabled === false) return false;

    // Unified /admin_settings Core Feature checks
    if (featureId === 'user_signup' && s.allowUserSignup === false) return false;
    if (featureId === 'user_login' && s.allowUserLogin === false) return false;
    if (featureId === 'deposits' && (s.allowUpiDeposit === false || s.featureDeposits === false)) return false;
    if (featureId === 'usdt_deposit' && (s.allowUsdtDeposit === false || s.featureUsdtDeposit === false)) return false;
    if (featureId === 'withdrawals' && (s.allowWithdrawals === false || s.featureWithdrawals === false)) return false;
    if (featureId === 'bank_withdrawal' && s.allowBankWithdrawal === false) return false;
    if (featureId === 'usdt_withdrawal' && (s.allowUsdtWithdrawal === false || s.featureUsdtWithdrawal === false)) return false;
    if (featureId === 'ludo_voice_chat' && s.ludoVoiceChatEnabled === false) return false;
    if (featureId === 'ludo_chat_presets' && s.ludoChatPresetsEnabled === false) return false;

    const mod = this.featureModules[featureId];
    if (mod) {
      return mod.enabled && mod.status === 'active';
    }
    return true;
  }

  public isFeatureVisible(featureId: string): boolean {
    if (!this.isFeatureEnabled(featureId)) return false;
    const mod = this.featureModules[featureId];
    if (mod) {
      if (!mod.enabled || mod.status !== 'active') {
        return false;
      }
      return mod.visibleInUserApp !== false;
    }
    return true;
  }

  public getTransactions(uid?: string): WalletTransaction[] {
    if (uid) {
      return this.transactions.filter((t) => t.uid === uid);
    }
    return this.transactions;
  }
  public getTransaction(id: string): WalletTransaction | undefined {
    return this.transactions.find((t) => t.id === id);
  }

  // --- SECURE ATOMIC WALLET TRANSACTION ENGINE ---
  public executeWalletTransaction(params: {
    uid: string;
    type: TransactionType;
    category: 'credit' | 'debit';
    amount: number;
    referenceId?: string;
    description: string;
    status?: 'completed' | 'pending' | 'rejected';
    metadata?: Record<string, unknown>;
    transactionId?: string;
  }): { success: boolean; error?: string; transaction?: WalletTransaction } {
    let user = this.users[params.uid] || this.getUser(params.uid);
    if (!user) {
      return { success: false, error: 'User does not exist or has been deactivated' };
    }
    if (!this.users[params.uid]) {
      this.users[params.uid] = user;
    }
    if (this.deletedUserUids.has(params.uid)) {
      return { success: false, error: 'Cannot process transaction for a deleted account' };
    }
    if (user.status !== 'active' && params.category === 'debit' && params.type !== 'admin_adjustment') {
      return { success: false, error: `Account is ${user.status}. Debits and bets are restricted.` };
    }
    if (this.isMaintenanceActiveForUser(params.uid) && params.type === 'bet_placement') {
      return {
        success: false,
        error: this.adminSettings.maintenanceMessage || 'Platform is in Maintenance Mode. Betting is temporarily paused by Master Admin.'
      };
    }
    if (typeof params.amount !== 'number' || !Number.isFinite(params.amount) || params.amount <= 0 || params.amount > 10000000) {
      return { success: false, error: 'Transaction amount must be a valid positive number within safety limits' };
    }

    const cleanAmount = Math.round(params.amount * 100) / 100;
    if (cleanAmount <= 0) {
      return { success: false, error: 'Transaction amount is too small' };
    }

    const txId = params.transactionId || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Idempotency: Prevent duplicate execution by transaction ID
    if (this.transactions.some((t) => t.id === txId)) {
      return { success: false, error: `Duplicate transaction detected (${txId})` };
    }

    // Global Anti-Bot / Anti-Flood Rate Limiting per UID
    const nowTs = Date.now();
    if (params.type !== 'admin_adjustment') {
      const recentList = (this.recentTxTimestampsByUid[params.uid] || []).filter((ts) => nowTs - ts < 2000);
      if (recentList.length >= 25) {
        this.logAudit({
          actor: params.uid,
          category: 'BALANCE',
          action: 'ANTI_BOT_BURST_BLOCKED',
          details: `Blocked rapid automated wallet transaction burst (${recentList.length} tx in 2s) for ${user.username} (${params.uid}).`,
          targetUser: params.uid,
          outcome: 'DENIED'
        });
        return { success: false, error: 'Anti-bot security governor: Too many rapid requests. Please slow down.' };
      }
      recentList.push(nowTs);
      this.recentTxTimestampsByUid[params.uid] = recentList;
    }

    // Anti-Bot Rate Limiting on rapid automated bet placement bursts
    if (params.type === 'bet_placement' && params.category === 'debit') {
      const prevBetTs = this.lastBetActionAtByUid[params.uid] || 0;
      if (nowTs - prevBetTs < 50) {
        return { success: false, error: 'Anti-bot protection: Please wait a moment between bets.' };
      }
      this.lastBetActionAtByUid[params.uid] = nowTs;
    }

    if (
      params.category === 'credit' &&
      (params.type === 'signup_bonus' || params.type === 'first_deposit_bonus')
    ) {
      const alreadyHasBonus = this.transactions.some(
        (t) => t.uid === params.uid && t.type === params.type && t.status === 'completed'
      );
      if (alreadyHasBonus) {
        return { success: false, error: `${params.type} has already been credited once for this account.` };
      }
    }

    if (params.type === 'game_payout' && params.category === 'credit' && params.referenceId) {
      const duplicatePayout = this.transactions.some(
        (t) =>
          t.uid === params.uid &&
          t.type === 'game_payout' &&
          t.category === 'credit' &&
          t.referenceId === params.referenceId &&
          t.status === 'completed'
      );
      if (duplicatePayout) {
        return { success: false, error: `Payout for reference ${params.referenceId} has already been credited.` };
      }
    }

    // Reference ID duplicate protection for deposits & bonuses
    if (
      (params.type === 'deposit' ||
        params.type === 'signup_bonus' ||
        params.type === 'first_deposit_bonus' ||
        params.type === 'referral_bonus' ||
        params.type === 'gift_code') &&
      params.referenceId
    ) {
      const alreadyCredited = this.transactions.some(
        (t) =>
          t.uid === params.uid &&
          t.type === params.type &&
          t.referenceId === params.referenceId &&
          t.status === 'completed'
      );
      if (alreadyCredited) {
        return { success: false, error: `Reference ${params.referenceId} has already been credited` };
      }
    }

    // Validate directly against the live synchronized user balance (users/{uid}/balance)
    // Also reconcile any duplicate UID record for the same phone number or verified ledger balance so stale 0 never blocks a valid bet.
    const cleanUserPhone = this.normalizePhone(user.phone);
    const siblingUser = cleanUserPhone
      ? Object.values(this.users).find(
          (u) => u && u.uid !== params.uid && this.normalizePhone(u.phone) === cleanUserPhone && Number(u.balance) > (Number(user.balance) || 0)
        )
      : undefined;

    const knownLiveBal =
      typeof params.metadata?.knownLiveBalance === 'number' &&
      Number.isFinite(params.metadata.knownLiveBalance) &&
      params.metadata.knownLiveBalance > 0
        ? params.metadata.knownLiveBalance
        : 0;

    let resolvedLiveBalance = Math.max(
      typeof user.balance === 'number' && Number.isFinite(user.balance) && user.balance > 0 ? user.balance : 0,
      siblingUser && typeof siblingUser.balance === 'number' && Number.isFinite(siblingUser.balance) && siblingUser.balance > 0
        ? siblingUser.balance
        : 0,
      knownLiveBal
    );

    if (resolvedLiveBalance < cleanAmount && params.category === 'debit') {
      const ledgerBal = this.computeVerifiedLedgerBalance(params.uid);
      if (ledgerBal > resolvedLiveBalance) {
        resolvedLiveBalance = ledgerBal;
      } else if (siblingUser) {
        const siblingLedgerBal = this.computeVerifiedLedgerBalance(siblingUser.uid);
        if (siblingLedgerBal > resolvedLiveBalance) {
          resolvedLiveBalance = siblingLedgerBal;
        }
      }
    }

    const balanceBefore = Math.max(0, Math.round(resolvedLiveBalance * 100) / 100);
    user.balance = balanceBefore;

    // Strict balance check for debits
    if (params.category === 'debit') {
      if (balanceBefore < cleanAmount) {
        return {
          success: false,
          error: `Insufficient wallet balance. Available: ₹${balanceBefore.toFixed(2)}, Requested: ₹${cleanAmount.toFixed(2)}`
        };
      }
    }

    const status = params.status || 'completed';
    let balanceAfter = balanceBefore;

    // Update active balance atomically ONLY when completed (or pending withdrawal hold)
    if (status === 'completed' || (params.type === 'withdrawal' && status === 'pending')) {
      if (params.category === 'debit') {
        balanceAfter = Math.round((balanceBefore - cleanAmount) * 100) / 100;
      } else {
        balanceAfter = Math.round((balanceBefore + cleanAmount) * 100) / 100;
      }
    }

    // Never allow negative balance
    if (balanceAfter < 0) {
      return { success: false, error: 'Negative wallet balance prevented by integrity governor' };
    }

    user.balance = balanceAfter;
    user.lastActive = Date.now();
    if (siblingUser) {
      siblingUser.balance = balanceAfter;
      siblingUser.lastActive = Date.now();
    }

    const seal = this.computeTransactionSeal({
      id: txId,
      uid: params.uid,
      type: params.type,
      category: params.category,
      amount: cleanAmount,
      referenceId: params.referenceId
    });

    const transaction: WalletTransaction = {
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
      metadata: params.metadata,
      integritySeal: seal
    };

    this.transactions.unshift(transaction);
    if (this.transactions.length > 5000) {
      this.transactions.pop();
    }

    if (this.onTransactionSaved) {
      try { this.onTransactionSaved(transaction); } catch (e) { console.warn('onTransactionSaved error:', e); }
    }
    if (this.onUserSaved) {
      try { this.onUserSaved(user); } catch (e) { console.warn('onUserSaved error:', e); }
    }

    this.notify();
    return { success: true, transaction };
  }

  // --- USER BLOCKING & INTRUDER ISOLATION ENGINE ---
  public setUserBlocked(uid: string, blocked: boolean, reason: string = 'Security violation', actor: string = 'SecurityEngine'): { success: boolean; user?: UserRecord; error?: string } {
    const user = this.users[uid];
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    user.isBlocked = blocked;
    user.status = blocked ? 'blocked' : 'active';
    user.blockedReason = blocked ? reason : undefined;
    user.blockedAt = blocked ? Date.now() : undefined;
    if (blocked) {
      user.isOnline = false;
    }

    this.savePermanentUsersRegistry();
    if (this.onUserSaved) {
      try { this.onUserSaved(user); } catch (e) { console.warn('onUserSaved block error:', e); }
    }

    this.logAudit({
      actor,
      category: 'AUTH',
      action: blocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
      details: `${blocked ? 'Blocked' : 'Unblocked'} user ${user.username} (+91 ${user.phone}). Reason: ${reason}`,
      targetUser: uid,
      outcome: blocked ? 'DENIED' : 'SUCCESS'
    });

    this.saveToStorage();
    this.notify();
    return { success: true, user };
  }

  public hardDeleteUser(uid: string, adminId: string, reason: string = 'Permanent user hard-delete by Master Admin'): { success: boolean; error?: string } {
    if (!uid) {
      return { success: false, error: 'UID is required' };
    }
    const user = this.users[uid];
    const username = user?.username || uid;
    const finalBalance = user?.balance || 0;

    // 1. Blacklist UID permanently so it can never be resurrected or re-ingested
    this.deletedUserUids.add(uid);
    try {
      safeStorage.setItem('bingo777_deleted_uids', JSON.stringify(Array.from(this.deletedUserUids)));
    } catch {}

    // 2. Remove user from active map and backup map
    delete this.users[uid];
    delete this.deletedUsersBackup[uid];

    // 3. Purge all financial ledger transactions for this user
    this.transactions = this.transactions.filter((t) => t.uid !== uid);

    // 4. Purge all deposits and withdrawals
    this.deposits = this.deposits.filter((d) => d.uid !== uid);
    this.withdrawals = this.withdrawals.filter((w) => w.uid !== uid);

    // 5. Purge all live bets
    this.liveBets = this.liveBets.filter((b) => b.uid !== uid);

    // 6. Purge all referrals where user is referrer or referee
    this.referrals = this.referrals.filter((r) => r.referredUid !== uid && r.referrerUid !== uid);

    // 7. Purge notifications and support messages
    this.userNotifications = this.userNotifications.filter((n) => n.uid !== uid);
    this.supportMessages = this.supportMessages.filter((m) => m.uid !== uid);

    // 8. Clean up active sessions
    delete this.activeMinesSessions[uid];
    const activeStored = safeStorage.getItem('bingo777_active_uid');
    if (activeStored === uid) {
      safeStorage.removeItem('bingo777_active_uid');
    }

    // 9. Audit Log
    this.logAudit({
      actor: adminId,
      category: 'AUTH',
      action: 'USER_HARD_DELETED_PERMANENT',
      details: `User ${username} (${uid}) was permanently wiped out from the database. Closing balance: ₹${finalBalance.toFixed(2)}. Ledger, bets, referrals, and sessions completely purged. Reason: ${reason}`,
      targetUser: uid,
      affectedRecordId: uid,
      reason,
      outcome: 'SUCCESS'
    });

    // 10. Broadcast user deletion so all open tabs log them out instantly
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'user_deleted', uid });
      } catch {}
    }

    this.saveToStorage();
    this.notify();
    return { success: true };
  }

  public deleteUser(uid: string, adminId: string, reason: string = 'Admin deletion'): { success: boolean; error?: string } {
    return this.hardDeleteUser(uid, adminId, reason);
  }

  public restoreDeletedUser(uid: string, adminId: string): { success: boolean; error?: string } {
    const backup = this.deletedUsersBackup[uid];
    if (!backup) {
      return { success: false, error: 'No backup snapshot found for this user ID' };
    }
    this.deletedUserUids.delete(uid);
    this.users[uid] = { ...backup, status: 'active', lastActive: Date.now() };
    delete this.deletedUsersBackup[uid];

    this.logAudit({
      actor: adminId,
      category: 'AUTH',
      action: 'USER_RESTORED_FROM_BACKUP',
      details: `Restored user ${backup.username} (${uid}) from backup snapshot with preserved financial ledger.`,
      targetUser: uid,
      affectedRecordId: uid,
      outcome: 'SUCCESS'
    });
    this.notify();
    return { success: true };
  }

  // --- RECONCILIATION & AUDIT ENGINE ---
  public reconcileUserBalance(uid: string): ReconciliationReport | null {
    const user = this.users[uid];
    if (!user) return null;

    const userTxs = this.transactions.filter((t) => t.uid === uid && (t.status === 'completed' || (t.type === 'withdrawal' && t.status === 'pending')));

    let totalDeposited = 0;
    let totalWithdrawn = 0;
    let totalBet = 0;
    let totalWon = 0;
    let totalAdjusted = 0;
    let totalGifts = 0;
    let totalBonuses = 0;

    for (const tx of userTxs) {
      if (tx.type === 'deposit' && tx.category === 'credit' && tx.status === 'completed') {
        totalDeposited += tx.amount;
      } else if (tx.type === 'withdrawal' && tx.category === 'debit') {
        totalWithdrawn += tx.amount;
      } else if (tx.type === 'withdrawal' && tx.category === 'credit' && tx.status === 'completed') {
        totalWithdrawn -= tx.amount; // refund
      } else if (tx.type === 'bet_placement' && tx.category === 'debit') {
        totalBet += tx.amount;
      } else if (tx.type === 'game_payout' && tx.category === 'credit') {
        totalWon += tx.amount;
      } else if (tx.type === 'gift_code' && tx.category === 'credit') {
        totalGifts += tx.amount;
      } else if (
        (tx.type === 'signup_bonus' || tx.type === 'first_deposit_bonus' || tx.type === 'referral_bonus' || tx.type === 'mlm_commission') &&
        tx.category === 'credit' &&
        tx.status === 'completed'
      ) {
        totalBonuses += tx.amount;
      } else if (tx.type === 'admin_adjustment') {
        if (tx.category === 'credit') totalAdjusted += tx.amount;
        else totalAdjusted -= tx.amount;
      }
    }

    const calculatedBalance = Math.round(
      (totalDeposited + totalWon + totalGifts + totalBonuses + totalAdjusted - totalWithdrawn - totalBet) * 100
    ) / 100;

    const currentBalance = Math.round(user.balance * 100) / 100;
    const discrepancy = Math.round((currentBalance - calculatedBalance) * 100) / 100;
    const isMatch = Math.abs(discrepancy) < 0.01;

    return {
      uid,
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
      transactionsCount: userTxs.length,
      lastReconciledAt: Date.now()
    };
  }

  public forceReconcileBalance(uid: string, adminId: string): { success: boolean; report?: ReconciliationReport; error?: string } {
    const report = this.reconcileUserBalance(uid);
    if (!report) return { success: false, error: 'User not found' };
    if (report.isMatch) return { success: true, report };

    const user = this.users[uid];
    const oldBalance = user.balance;

    const adjAmount = Math.abs(report.discrepancy);
    const adjCategory = report.discrepancy < 0 ? 'credit' : 'debit';

    this.executeWalletTransaction({
      uid,
      type: 'admin_adjustment',
      category: adjCategory,
      amount: adjAmount,
      referenceId: `audit_rec_${Date.now()}`,
      description: `Reconcile discrepancy of ${report.discrepancy < 0 ? '+' : '-'}₹${adjAmount.toFixed(2)} against transaction ledger`
    });

    this.logAudit({
      actor: adminId,
      category: 'BALANCE',
      action: 'BALANCE_RECONCILED',
      details: `Reconciled balance for ${user.username} (${uid}) from ₹${oldBalance.toFixed(2)} to ledger verified ₹${report.calculatedBalance.toFixed(2)}.`,
      targetUser: uid
    });

    const finalReport = this.reconcileUserBalance(uid) || report;
    return { success: true, report: finalReport };
  }

  public reconcileAllUsers(): ReconciliationReport[] {
    const reports: ReconciliationReport[] = [];
    Object.keys(this.users).forEach((uid) => {
      const rep = this.reconcileUserBalance(uid);
      if (rep) reports.push(rep);
    });
    return reports;
  }

  // --- MULTI-GAME SECURE BET & PAYOUT HELPERS ---
  public recordGameBet(
    uid: string,
    amount: number,
    gameTitle: string,
    roundId?: string,
    knownLiveBalance?: number
  ): { success: boolean; error?: string; transaction?: WalletTransaction } {
    const res = this.executeWalletTransaction({
      uid,
      type: 'bet_placement',
      category: 'debit',
      amount,
      referenceId: roundId,
      description: `Stake on ${gameTitle}${roundId ? ' (' + roundId + ')' : ''}`,
      metadata: knownLiveBalance !== undefined ? { knownLiveBalance } : undefined
    });
    if (res.success) {
      const u = this.users[uid];
      if (u) u.totalBetsCount = (u.totalBetsCount || 0) + 1;
      this.recordBettingTurnover(uid, amount);
    }
    return res;
  }

  public placeDragonTigerBet(params: {
    uid: string;
    username?: string;
    roundPeriod: string;
    side: 'dragon' | 'tie' | 'tiger';
    amount: number;
    knownLiveBalance?: number;
  }): { success: boolean; error?: string; bet?: LiveBet; transaction?: WalletTransaction } {
    if (this.isMaintenanceActiveForUser(params.uid)) {
      return {
        success: false,
        error: this.adminSettings.maintenanceMessage || 'Platform is in Maintenance Mode. Betting is temporarily paused by Master Admin.'
      };
    }
    if (!this.isFeatureEnabled('dragon_tiger')) {
      return {
        success: false,
        error: 'Dragon vs Tiger 3D is currently disabled by Master Admin.'
      };
    }
    const user = this.users[params.uid] || this.getUser(params.uid);
    if (!user) {
      return { success: false, error: 'User account not found' };
    }
    if (!this.users[params.uid]) {
      this.users[params.uid] = user;
    }

    const cleanAmount = Math.round(Number(params.amount) * 100) / 100;
    if (!Number.isFinite(cleanAmount) || cleanAmount < 10) {
      return { success: false, error: 'Minimum bet amount in Dragon Tiger is ₹10' };
    }

    const betId = `dt_bet_${params.roundPeriod}_${params.side}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const tx = this.executeWalletTransaction({
      uid: params.uid,
      type: 'bet_placement',
      category: 'debit',
      amount: cleanAmount,
      referenceId: betId,
      description: `Dragon Tiger 3D [${params.side.toUpperCase()}] (Period ${params.roundPeriod})`,
      metadata: {
        gameId: 'dragon_tiger',
        gameType: 'dragon_tiger',
        side: params.side,
        roundPeriod: params.roundPeriod,
        knownLiveBalance: params.knownLiveBalance
      }
    });

    if (!tx.success) {
      return { success: false, error: tx.error || 'Failed to place Dragon Tiger bet' };
    }

    user.totalBetsCount = (user.totalBetsCount || 0) + 1;
    this.recordBettingTurnover(params.uid, cleanAmount);

    const multiplier = params.side === 'tie' ? 9.0 : 1.98;
    const newBet: LiveBet = {
      betId,
      uid: params.uid,
      username: params.username || user.username || `Player_${params.uid.slice(-4)}`,
      gameId: 'dragon_tiger',
      roundPeriod: params.roundPeriod,
      gameType: 'dragon_tiger',
      betType: 'dragon_tiger',
      betValue: params.side,
      amount: cleanAmount,
      multiplier,
      potentialPayout: Math.round(cleanAmount * multiplier * 100) / 100,
      status: 'pending',
      actualPayout: 0,
      timestamp: Date.now()
    };

    this.liveBets.unshift(newBet);
    if (this.onLiveBetSaved) {
      try {
        this.onLiveBetSaved(newBet);
      } catch (e) {
        console.warn('onLiveBetSaved error:', e);
      }
    }
    this.notify();
    return { success: true, bet: newBet, transaction: tx.transaction };
  }

  public settleDragonTigerRound(roundPeriod: string, winner: 'dragon' | 'tie' | 'tiger'): void {
    let changed = false;
    this.liveBets = this.liveBets.map((b) => {
      if (
        (b.gameType === 'dragon_tiger' || b.gameId === 'dragon_tiger') &&
        b.roundPeriod === roundPeriod &&
        b.status === 'pending'
      ) {
        const isWin = b.betValue === winner;
        const isTiePush = winner === 'tie' && (b.betValue === 'dragon' || b.betValue === 'tiger');
        const mult = b.betValue === 'tie' ? 9.0 : 1.98;
        const actualPayout = isWin
          ? Math.round(b.amount * mult * 100) / 100
          : isTiePush
          ? Math.round(b.amount * 0.5 * 100) / 100
          : 0;
        const updated: LiveBet = {
          ...b,
          status: isWin ? 'won' : 'lost',
          actualPayout
        };
        if (this.onLiveBetSaved) {
          try {
            this.onLiveBetSaved(updated);
          } catch {}
        }
        changed = true;
        return updated;
      }
      return b;
    });
    if (changed) {
      this.notify();
    }
  }

  public recordGamePayout(uid: string, amount: number, gameTitle: string, roundId?: string): { success: boolean; error?: string; transaction?: WalletTransaction } {
    const user = this.users[uid] || this.getUser(uid);
    if (!user) return { success: false, error: 'User not found' };
    if (!this.users[uid]) {
      this.users[uid] = user;
    }

    const res = this.executeWalletTransaction({
      uid,
      type: 'game_payout',
      category: 'credit',
      amount,
      referenceId: roundId,
      description: `Payout from ${gameTitle}${roundId ? ' (' + roundId + ')' : ''}`
    });
    if (res.success) {
      user.totalWonAmount += amount;
    }
    return res;
  }

  // Multi-Game Getters
  public getTrxCurrentRound(): GameRound { return this.trxCurrentRound; }
  public getTrxPastRounds(): GameRound[] { return this.trxPastRounds; }
  public getAviatorRound(): AviatorRound { return this.aviatorCurrentRound; }
  public getAviatorPastCrashes(): number[] {
    return (this.aviatorPastCrashes || []).filter((c) => typeof c === 'number' && Number.isFinite(c) && c >= 1.0);
  }
  public getK3CurrentRound(): K3Round { return this.k3CurrentRound; }
  public getK3PastRounds(): K3Round[] { return this.k3PastRounds; }
  public getFiveDCurrentRound(): FiveDRound { return this.fiveDCurrentRound; }
  public getFiveDPastRounds(): FiveDRound[] { return this.fiveDPastRounds; }
  public getActiveMinesSession(uid: string): MinesSession | undefined { return this.activeMinesSessions[uid]; }

  // --- WIN GO BETTING ---
  public placeBet(bet: Omit<LiveBet, 'betId' | 'status' | 'actualPayout' | 'timestamp'>): { success: boolean; error?: string; bet?: LiveBet } {
    if (this.isMaintenanceActiveForUser(bet.uid)) {
      return {
        success: false,
        error: this.adminSettings.maintenanceMessage || 'Platform is in Maintenance Mode. Betting is temporarily paused by Master Admin.'
      };
    }
    const user = this.users[bet.uid];
    if (!user) return { success: false, error: 'User not found' };
    if (user.status !== 'active') return { success: false, error: `Account is ${user.status}. Betting is restricted.` };
    const isTrx = bet.roundPeriod.startsWith('TRX') || bet.gameId === 'trx_wingo';
    if (isTrx && !this.isFeatureEnabled('trx_wingo')) {
      return { success: false, error: 'TRX Win Go is currently disabled by Master Admin.' };
    }
    if (!isTrx) {
      if (!this.isFeatureEnabled('wingo')) {
        return { success: false, error: 'Win Go is currently disabled by Master Admin.' };
      }
      const modeFeatureId = `wingo_${bet.gameType}`;
      if (this.featureModules[modeFeatureId] && !this.isFeatureEnabled(modeFeatureId)) {
        return { success: false, error: `Win Go ${bet.gameType} mode is currently paused by Master Admin.` };
      }
    }
    // Input bounds validation
    if (typeof bet.amount !== 'number' || isNaN(bet.amount) || bet.amount < 50) {
      return { success: false, error: 'Minimum bet amount is ₹50' };
    }
    if (bet.amount > 100000) {
      return { success: false, error: 'Maximum bet per order is ₹100,000' };
    }

    // Strict Bet value validation
    if (bet.betType === 'color') {
      if (!['green', 'red', 'violet'].includes(bet.betValue)) {
        return { success: false, error: 'Invalid color bet selection' };
      }
    } else if (bet.betType === 'number') {
      const numVal = parseInt(bet.betValue, 10);
      if (isNaN(numVal) || numVal < 0 || numVal > 9) {
        return { success: false, error: 'Invalid number bet selection (0-9 allowed)' };
      }
    } else if (bet.betType === 'size') {
      if (!['big', 'small'].includes(bet.betValue)) {
        return { success: false, error: 'Invalid size bet selection' };
      }
    }

    // Strict server lock check: no bets accepted in final 5 seconds
    const targetRound = isTrx
      ? this.trxCurrentRound
      : (this.activeRoundsByMode[bet.gameType as '30s' | '1min' | '3min'] || this.currentRound);
    if (targetRound && targetRound.period === bet.roundPeriod) {
      const remainingSecs = Math.floor((targetRound.endTime - Date.now()) / 1000);
      if (remainingSecs <= 5) {
        return { success: false, error: 'Betting is locked for the final 5 seconds of the round' };
      }
    }

    const betId = 'bet_' + Math.random().toString(36).substring(2, 9);
    const tx = this.executeWalletTransaction({
      uid: bet.uid,
      type: 'bet_placement',
      category: 'debit',
      amount: bet.amount,
      referenceId: betId,
      description: `Win Go Bet [${bet.betType.toUpperCase()}: ${bet.betValue}] (Period ${bet.roundPeriod})`
    });

    if (!tx.success) {
      return { success: false, error: tx.error || 'Failed to place bet' };
    }

    user.totalBetsCount += 1;
    this.recordBettingTurnover(bet.uid, bet.amount);

    const newBet: LiveBet = {
      ...bet,
      betId,
      status: 'pending',
      actualPayout: 0,
      timestamp: Date.now()
    };

    this.liveBets.unshift(newBet);
    if (this.onLiveBetSaved) {
      try { this.onLiveBetSaved(newBet); } catch (e) { console.warn('onLiveBetSaved error:', e); }
    }
    this.currentRound.totalBetVolume += bet.amount;
    this.notify();
    return { success: true, bet: newBet };
  }

  public resolveRound(overrideNumber?: number, targetMode?: '30s' | '1min' | '3min') {
    const roundToResolve = targetMode && this.activeRoundsByMode[targetMode]
      ? this.activeRoundsByMode[targetMode]!
      : this.currentRound;

    const resolvingGameType = (roundToResolve.gameType || targetMode || '30s') as '30s' | '1min' | '3min';
    const resolvingPeriod = roundToResolve.period;
    if (this.resolvedPeriodIds.has(resolvingPeriod)) {
      const nextRound = this.generateNewRound(resolvingGameType, roundToResolve.endTime);
      this.activeRoundsByMode[resolvingGameType] = nextRound;
      if (this.currentRound.gameType === resolvingGameType || !targetMode) {
        this.currentRound = nextRound;
      }
      this.safeNotifyListeners();
      return;
    }
    this.resolvedPeriodIds.add(resolvingPeriod);

    // If this round is a TRX period, delegate to resolveTrxRound
    if (resolvingPeriod.startsWith('TRX')) {
      this.resolvedPeriodIds.delete(resolvingPeriod);
      this.resolveTrxRound(overrideNumber);
      return;
    }

    const overrideCandidates = this.getCandidateNumbersForOverride(
      resolvingGameType,
      resolvingPeriod,
      roundToResolve.manualOverrideNumber
    );

    let winningNum: number;
    if (overrideNumber !== undefined && overrideNumber >= 0 && overrideNumber <= 9) {
      winningNum = overrideNumber;
    } else if (overrideCandidates && overrideCandidates.length > 0) {
      winningNum = this.pickBestNumberFromCandidates(overrideCandidates, resolvingPeriod, resolvingGameType);
    } else if (this.adminSettings.zeroPlatformLossMode) {
      winningNum = this.pickBestNumberFromCandidates([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], resolvingPeriod, resolvingGameType);
    } else {
      winningNum = this.getDeterministicOutcomeForPeriod(resolvingPeriod, resolvingGameType);
    }

    // Automatically clear /admin_settings/wingo_override/{gameType} once the round settles
    if (this.wingoOverridesByMode[resolvingGameType]) {
      delete this.wingoOverridesByMode[resolvingGameType];
    }
    try {
      rtdbRemove(rtdbRef(rtdb, `admin_settings/wingo_override/${resolvingGameType}`)).catch(() => {});
    } catch {}

    const winningColors: BetColor[] = winningNum === 0 ? ['red', 'violet'] : winningNum === 5 ? ['green', 'violet'] : winningNum % 2 === 0 ? ['red'] : ['green'];
    const winningSize: BetSize = winningNum >= 5 ? 'big' : 'small';
    let totalRoundPayout = 0;
    const userSettledBetsMap: Record<string, LiveBet[]> = {};

    const resolvedBets = this.liveBets.map((b) => {
      if (b.roundPeriod !== resolvingPeriod || b.status !== 'pending') return b;
      let won = false;
      let payoutRate = 0;

      if (b.betType === 'number') {
        if (parseInt(b.betValue, 10) === winningNum) { won = true; payoutRate = this.adminSettings.numberMultiplier; }
      } else if (b.betType === 'color') {
        if (winningColors.includes(b.betValue as BetColor)) {
          won = true;
          payoutRate = b.betValue === 'violet' ? this.adminSettings.colorVioletMultiplier : (winningColors.length > 1 ? 1.5 : this.adminSettings.colorGreenMultiplier);
        }
      } else if (b.betType === 'size') {
        if (b.betValue === winningSize) { won = true; payoutRate = this.adminSettings.sizeMultiplier; }
      }

      const feeDeduction = (100 - this.adminSettings.payoutFeePercent) / 100;
      const actualPayout = won ? Math.round(b.amount * payoutRate * feeDeduction * 100) / 100 : 0;

      if (won && actualPayout > 0) {
        totalRoundPayout += actualPayout;
        const user = this.users[b.uid];
        if (user) {
          user.totalWonAmount += actualPayout;
          this.executeWalletTransaction({
            uid: b.uid,
            type: 'game_payout',
            category: 'credit',
            amount: actualPayout,
            referenceId: b.betId,
            description: `Win Go Payout [Period ${resolvingPeriod}] Won on ${b.betType}: ${b.betValue}`
          });
        } else {
          // Ensure cloud user balance is updated atomically via runTransaction even if local user object is absent
          try {
            rtdbRunTransaction(rtdbRef(rtdb, `users/${b.uid}/balance`), (cur) => {
              const base = Number(cur) || 0;
              return Math.round((base + actualPayout) * 100) / 100;
            }).catch(() => {});
          } catch {}
        }
      } else {
        const user = this.users[b.uid];
        if (user) user.totalLostAmount += b.amount;
      }

      const updatedBet: LiveBet = { ...b, status: won ? ('won' as const) : ('lost' as const), actualPayout };
      if (this.onLiveBetSaved) {
        try { this.onLiveBetSaved(updatedBet); } catch {}
      }
      if (!userSettledBetsMap[b.uid]) {
        userSettledBetsMap[b.uid] = [];
      }
      userSettledBetsMap[b.uid].push(updatedBet);

      return updatedBet;
    });

    this.liveBets = resolvedBets;
    const completedRound: GameRound = {
      ...roundToResolve,
      winningNumber: winningNum,
      winningColor: winningColors,
      winningSize,
      totalPayout: totalRoundPayout,
      isResolved: true,
      overrideConfig: null
    };

    const nextRound = this.generateNewRound(resolvingGameType, roundToResolve.endTime);
    this.activeRoundsByMode[resolvingGameType] = nextRound;
    if (this.currentRound.gameType === resolvingGameType || !targetMode) {
      this.currentRound = nextRound;
    }

    this.pastRounds.unshift(completedRound);
    this.normalizeWinGoPastRounds(30);

    if (this.onRoundSynced) {
      try {
        this.onRoundSynced(completedRound);
        this.onRoundSynced(nextRound);
      } catch (e) {
        console.warn('onRoundSynced error:', e);
      }
    }

    // Dispatch authoritative settlement notices for every participant in this round
    Object.entries(userSettledBetsMap).forEach(([uid, settledBets]) => {
      const totalBetAmount = settledBets.reduce((sum, bet) => sum + bet.amount, 0);
      const totalPayout = settledBets.reduce((sum, bet) => sum + (bet.actualPayout || 0), 0);
      const isWin = totalPayout > 0;
      const netProfit = totalPayout - totalBetAmount;
      const user = this.users[uid];
      const walletBalanceAfter = user ? user.balance : 0;

      const notice: RoundSettlementNotice = {
        resultId: `res_${resolvingPeriod}_${uid}`,
        roundPeriod: resolvingPeriod,
        gameName: 'Win Go',
        gameType: resolvingGameType,
        winningNumber: winningNum,
        winningColors,
        winningSize,
        uid,
        isWin,
        totalBetAmount,
        totalPayout,
        netProfit,
        walletBalanceAfter,
        bets: settledBets,
        settledAt: this.getServerNow()
      };

      this.emitSettlementNotice(notice);
    });

    // Also reconcile any late/orphaned pending bets
    this.reconcilePendingBetsFromHistory();

    this.safeNotifyListeners();
  }

  public resolveTrxRound(overrideNumber?: number) {
    const resolvingPeriod = this.trxCurrentRound.period;
    const prevEndTime = this.trxCurrentRound.endTime;
    if (this.resolvedPeriodIds.has(resolvingPeriod)) {
      this.trxCurrentRound = this.generateNewTrxRound('1min', prevEndTime);
      this.safeNotifyListeners();
      return;
    }
    this.resolvedPeriodIds.add(resolvingPeriod);

    let winningNum: number;
    if (overrideNumber !== undefined && overrideNumber >= 0 && overrideNumber <= 9) {
      winningNum = overrideNumber;
    } else if (this.adminSettings.zeroPlatformLossMode) {
      const activeBets = this.liveBets.filter(
        (b) => b.roundPeriod === resolvingPeriod && b.status === 'pending'
      );
      if (activeBets.length > 0) {
        let lowestPayout = Infinity;
        let bestCandidate = Math.floor(Math.random() * 10);
        for (let cand = 0; cand <= 9; cand++) {
          const colors: BetColor[] = cand === 0 ? ['red', 'violet'] : cand === 5 ? ['green', 'violet'] : cand % 2 === 0 ? ['red'] : ['green'];
          const size: BetSize = cand >= 5 ? 'big' : 'small';
          let candPayout = 0;
          for (const b of activeBets) {
            let won = false;
            let rate = 0;
            if (b.betType === 'number' && parseInt(b.betValue, 10) === cand) {
              won = true; rate = this.adminSettings.numberMultiplier;
            } else if (b.betType === 'color' && colors.includes(b.betValue as BetColor)) {
              won = true; rate = b.betValue === 'violet' ? this.adminSettings.colorVioletMultiplier : (colors.length > 1 ? 1.5 : this.adminSettings.colorGreenMultiplier);
            } else if (b.betType === 'size' && b.betValue === size) {
              won = true; rate = this.adminSettings.sizeMultiplier;
            }
            if (won) candPayout += b.amount * rate;
          }
          if (candPayout < lowestPayout) {
            lowestPayout = candPayout;
            bestCandidate = cand;
          }
        }
        winningNum = bestCandidate;
      } else {
        winningNum = this.getDeterministicOutcomeForPeriod(resolvingPeriod, '1min');
      }
    } else {
      winningNum = this.getDeterministicOutcomeForPeriod(resolvingPeriod, '1min');
    }

    const winningColors: BetColor[] = winningNum === 0 ? ['red', 'violet'] : winningNum === 5 ? ['green', 'violet'] : winningNum % 2 === 0 ? ['red'] : ['green'];
    const winningSize: BetSize = winningNum >= 5 ? 'big' : 'small';
    let totalRoundPayout = 0;
    const userSettledBetsMap: Record<string, LiveBet[]> = {};

    this.liveBets = this.liveBets.map((b) => {
      if (b.roundPeriod !== resolvingPeriod || b.status !== 'pending') return b;
      let won = false;
      let payoutRate = 0;

      if (b.betType === 'number') {
        if (parseInt(b.betValue, 10) === winningNum) { won = true; payoutRate = this.adminSettings.numberMultiplier; }
      } else if (b.betType === 'color') {
        if (winningColors.includes(b.betValue as BetColor)) {
          won = true;
          payoutRate = b.betValue === 'violet' ? this.adminSettings.colorVioletMultiplier : (winningColors.length > 1 ? 1.5 : this.adminSettings.colorGreenMultiplier);
        }
      } else if (b.betType === 'size') {
        if (b.betValue === winningSize) { won = true; payoutRate = this.adminSettings.sizeMultiplier; }
      }

      const feeDeduction = (100 - this.adminSettings.payoutFeePercent) / 100;
      const actualPayout = won ? Math.round(b.amount * payoutRate * feeDeduction * 100) / 100 : 0;

      if (won && actualPayout > 0) {
        totalRoundPayout += actualPayout;
        const user = this.users[b.uid];
        if (user) {
          user.totalWonAmount += actualPayout;
          this.executeWalletTransaction({
            uid: b.uid,
            type: 'game_payout',
            category: 'credit',
            amount: actualPayout,
            referenceId: b.betId,
            description: `TRX Win Go Payout [Period ${resolvingPeriod}] Won on ${b.betType}: ${b.betValue}`
          });
        }
      } else {
        const user = this.users[b.uid];
        if (user) user.totalLostAmount += b.amount;
      }

      const updatedBet: LiveBet = { ...b, status: won ? ('won' as const) : ('lost' as const), actualPayout };
      if (!userSettledBetsMap[b.uid]) {
        userSettledBetsMap[b.uid] = [];
      }
      userSettledBetsMap[b.uid].push(updatedBet);
      return updatedBet;
    });

    const completedRound: GameRound = {
      ...this.trxCurrentRound,
      winningNumber: winningNum,
      winningColor: winningColors,
      winningSize,
      totalPayout: totalRoundPayout,
      hash: this.trxCurrentRound.hash.slice(0, -1) + winningNum.toString(),
      isResolved: true
    };

    this.trxPastRounds.unshift(completedRound);
    if (this.trxPastRounds.length > 50) this.trxPastRounds.pop();
    this.trxCurrentRound = this.generateNewTrxRound('1min', prevEndTime);

    Object.entries(userSettledBetsMap).forEach(([uid, settledBets]) => {
      const totalBetAmount = settledBets.reduce((sum, bet) => sum + bet.amount, 0);
      const totalPayout = settledBets.reduce((sum, bet) => sum + (bet.actualPayout || 0), 0);
      const isWin = totalPayout > 0;
      const netProfit = totalPayout - totalBetAmount;
      const user = this.users[uid];
      const walletBalanceAfter = user ? user.balance : 0;

      const notice: RoundSettlementNotice = {
        resultId: `res_${resolvingPeriod}_${uid}`,
        roundPeriod: resolvingPeriod,
        gameName: 'TRX Win Go',
        gameType: '1min',
        winningNumber: winningNum,
        winningColors,
        winningSize,
        uid,
        isWin,
        totalBetAmount,
        totalPayout,
        netProfit,
        walletBalanceAfter,
        bets: settledBets,
        settledAt: this.getServerNow()
      };

      this.emitSettlementNotice(notice);
    });

    this.safeNotifyListeners();
  }

  public checkAndResolveExpiredRounds() {
    if (!this.adminSettings.autoGameResolution) return;
    const now = this.getServerNow();

    // 1. Check all Win Go modes (30s, 1min, 3min) independently
    (['30s', '1min', '3min'] as const).forEach((mode) => {
      const modeRound = this.activeRoundsByMode[mode];
      if (modeRound && !modeRound.isResolved && now >= modeRound.endTime) {
        this.resolveRound(undefined, mode);
      }
    });

    // 2. Fallback check for active currentRound
    if (this.currentRound && !this.currentRound.isResolved && now >= this.currentRound.endTime) {
      this.resolveRound();
    }

    // 3. Check TRX round if expired
    if (this.trxCurrentRound && !this.trxCurrentRound.isResolved && now >= this.trxCurrentRound.endTime) {
      this.resolveTrxRound();
    }

    // 4. Check K3 round if expired
    if (this.k3CurrentRound && !this.k3CurrentRound.isResolved && now >= this.k3CurrentRound.endTime) {
      this.resolveK3Round();
    }

    // 5. Reconcile any late or orphaned pending bets whose period already resolved
    this.reconcilePendingBetsFromHistory();
  }

  public ensureRoundFreshness(gameType: '30s' | '1min' | '3min' = '30s'): GameRound {
    let round = this.activeRoundsByMode[gameType] || this.currentRound;
    const now = this.getServerNow();
    if (round.endTime <= now) {
      this.resolveRound(undefined, gameType);
      round = this.activeRoundsByMode[gameType] || this.currentRound;
      if (round.endTime <= now) {
        round = this.generateNewRound(gameType);
        this.activeRoundsByMode[gameType] = round;
        if (this.currentRound.gameType === gameType) {
          this.currentRound = round;
        }
        this.safeNotifyListeners();
      }
    }
    return round;
  }

  public ensureTrxRoundFreshness(): GameRound {
    let round = this.trxCurrentRound;
    const now = this.getServerNow();
    if (round.endTime <= now) {
      this.resolveTrxRound();
      round = this.trxCurrentRound;
      if (round.endTime <= now) {
        round = this.generateNewTrxRound('1min');
        this.trxCurrentRound = round;
        this.safeNotifyListeners();
      }
    }
    return round;
  }

  private reconcilePendingBetsFromHistory() {
    const pendingBets = this.liveBets.filter((b) => b.status === 'pending');
    if (pendingBets.length === 0) return;

    const allResolvedRounds = [...(this.pastRounds || []), ...(this.trxPastRounds || [])];
    const resolvedMap = new Map<string, GameRound>();
    allResolvedRounds.forEach((r) => {
      if (r && r.period && r.isResolved && r.winningNumber >= 0) {
        resolvedMap.set(r.period, r);
      }
    });

    const userSettledByPeriod: Record<string, { round: GameRound; uid: string; bets: LiveBet[] }> = {};
    let mutated = false;

    this.liveBets = this.liveBets.map((b) => {
      if (b.status !== 'pending') return b;
      const completedRound = resolvedMap.get(b.roundPeriod);
      if (!completedRound) return b;

      mutated = true;
      const winningNum = completedRound.winningNumber;
      const winningColors = completedRound.winningColor;
      const winningSize = completedRound.winningSize;
      let won = false;
      let payoutRate = 0;

      if (b.betType === 'number') {
        if (parseInt(b.betValue, 10) === winningNum) { won = true; payoutRate = this.adminSettings.numberMultiplier; }
      } else if (b.betType === 'color') {
        if (winningColors.includes(b.betValue as BetColor)) {
          won = true;
          payoutRate = b.betValue === 'violet' ? this.adminSettings.colorVioletMultiplier : (winningColors.length > 1 ? 1.5 : this.adminSettings.colorGreenMultiplier);
        }
      } else if (b.betType === 'size') {
        if (b.betValue === winningSize) { won = true; payoutRate = this.adminSettings.sizeMultiplier; }
      }

      const feeDeduction = (100 - this.adminSettings.payoutFeePercent) / 100;
      const actualPayout = won ? Math.round(b.amount * payoutRate * feeDeduction * 100) / 100 : 0;

      if (won && actualPayout > 0) {
        const user = this.users[b.uid];
        if (user) {
          user.totalWonAmount += actualPayout;
          this.executeWalletTransaction({
            uid: b.uid,
            type: 'game_payout',
            category: 'credit',
            amount: actualPayout,
            referenceId: b.betId,
            description: `Win Go Payout [Period ${completedRound.period}] Won on ${b.betType}: ${b.betValue}`
          });
        }
      } else {
        const user = this.users[b.uid];
        if (user) user.totalLostAmount += b.amount;
      }

      const updatedBet: LiveBet = { ...b, status: won ? ('won' as const) : ('lost' as const), actualPayout };
      const groupKey = `${completedRound.period}_${b.uid}`;
      if (!userSettledByPeriod[groupKey]) {
        userSettledByPeriod[groupKey] = { round: completedRound, uid: b.uid, bets: [] };
      }
      userSettledByPeriod[groupKey].bets.push(updatedBet);
      return updatedBet;
    });

    if (mutated) {
      Object.values(userSettledByPeriod).forEach(({ round, uid, bets }) => {
        const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
        const totalPayout = bets.reduce((sum, bet) => sum + (bet.actualPayout || 0), 0);
        const isWin = totalPayout > 0;
        const netProfit = totalPayout - totalBetAmount;
        const user = this.users[uid];
        const walletBalanceAfter = user ? user.balance : 0;

        this.emitSettlementNotice({
          resultId: `res_${round.period}_${uid}`,
          roundPeriod: round.period,
          gameName: round.period.startsWith('TRX') ? 'TRX Win Go' : 'Win Go',
          gameType: round.gameType,
          winningNumber: round.winningNumber,
          winningColors: round.winningColor,
          winningSize: round.winningSize,
          uid,
          isWin,
          totalBetAmount,
          totalPayout,
          netProfit,
          walletBalanceAfter,
          bets,
          settledAt: Date.now()
        });
      });
      this.saveToStorage();
    }
  }

  public setWinGoOverride(
    mode: '30s' | '1min' | '3min',
    overrideType: WinGoOverrideType,
    overrideValue: 'green' | 'red' | 'violet' | 'big' | 'small' | number | 'auto' | null,
    adminId: string = 'MasterAdmin'
  ): WinGoOverridePayload {
    const targetRound = this.activeRoundsByMode[mode] || this.currentRound;
    const isClear = overrideType === 'auto' || overrideValue === null || overrideValue === 'auto';
    const payload: WinGoOverridePayload = {
      targetPeriod: targetRound.period,
      overrideType: isClear ? 'auto' : overrideType,
      overrideValue: isClear ? 'auto' : overrideValue!,
      updatedAt: Date.now()
    };

    if (isClear) {
      delete this.wingoOverridesByMode[mode];
      targetRound.manualOverrideNumber = null;
      targetRound.overrideConfig = null;
      if (this.currentRound.gameType === targetRound.gameType) {
        this.currentRound.manualOverrideNumber = null;
        this.currentRound.overrideConfig = null;
      }
      try {
        rtdbRemove(rtdbRef(rtdb, `admin_settings/wingo_override/${mode}`)).catch(() => {});
      } catch {}
    } else {
      this.wingoOverridesByMode[mode] = payload;
      targetRound.overrideConfig = payload;
      if (overrideType === 'number' && typeof overrideValue === 'number' && overrideValue >= 0 && overrideValue <= 9) {
        targetRound.manualOverrideNumber = overrideValue;
      } else {
        // Resolve the current optimal candidate for immediate preview
        const cands = this.getCandidateNumbersForOverride(mode, targetRound.period, null);
        targetRound.manualOverrideNumber =
          cands && cands.length > 0 ? this.pickBestNumberFromCandidates(cands, targetRound.period, mode) : null;
      }
      if (this.currentRound.gameType === targetRound.gameType) {
        this.currentRound.manualOverrideNumber = targetRound.manualOverrideNumber;
        this.currentRound.overrideConfig = payload;
      }
      try {
        rtdbSet(rtdbRef(rtdb, `admin_settings/wingo_override/${mode}`), payload).catch(() => {});
      } catch {}
    }

    this.logAudit({
      actor: adminId,
      category: 'GAME_CONTROL',
      action: 'SET_ROUND_OUTCOME_OVERRIDE',
      details: isClear
        ? `Cleared Win Go (${mode}) outcome override to Auto RNG for period ${targetRound.period}`
        : `Set Win Go (${mode}) outcome override for period ${targetRound.period}: [${overrideType.toUpperCase()} = ${String(overrideValue).toUpperCase()}]`
    });

    if (this.onRoundSynced) {
      try {
        this.onRoundSynced(targetRound);
      } catch (e) {
        console.warn('onRoundSynced error:', e);
      }
    }
    this.notify();
    return payload;
  }

  public ingestCloudWinGoOverrides(rawMap: Record<string, any> | null | undefined) {
    const modes: Array<'30s' | '1min' | '3min'> = ['30s', '1min', '3min'];
    let changed = false;

    for (const m of modes) {
      const entry = rawMap && typeof rawMap === 'object' ? rawMap[m] : null;
      const targetRound = this.activeRoundsByMode[m];
      if (
        entry &&
        typeof entry === 'object' &&
        entry.overrideType &&
        entry.overrideType !== 'auto' &&
        (!entry.targetPeriod || !targetRound || entry.targetPeriod === targetRound.period)
      ) {
        const payload: WinGoOverridePayload = {
          targetPeriod: String(entry.targetPeriod || targetRound?.period || ''),
          overrideType: entry.overrideType as WinGoOverrideType,
          overrideValue: entry.overrideValue,
          updatedAt: Number(entry.updatedAt) || Date.now()
        };
        this.wingoOverridesByMode[m] = payload;
        if (targetRound) {
          targetRound.overrideConfig = payload;
          if (payload.overrideType === 'number' && typeof payload.overrideValue === 'number') {
            targetRound.manualOverrideNumber = payload.overrideValue;
          } else {
            const cands = this.getCandidateNumbersForOverride(m, targetRound.period, null);
            targetRound.manualOverrideNumber =
              cands && cands.length > 0 ? this.pickBestNumberFromCandidates(cands, targetRound.period, m) : null;
          }
          if (this.currentRound.gameType === m) {
            this.currentRound.overrideConfig = targetRound.overrideConfig;
            this.currentRound.manualOverrideNumber = targetRound.manualOverrideNumber;
          }
        }
        changed = true;
      } else if (this.wingoOverridesByMode[m]) {
        delete this.wingoOverridesByMode[m];
        if (targetRound) {
          targetRound.overrideConfig = null;
          targetRound.manualOverrideNumber = null;
          if (this.currentRound.gameType === m) {
            this.currentRound.overrideConfig = null;
            this.currentRound.manualOverrideNumber = null;
          }
        }
        changed = true;
      }
    }

    if (changed) {
      this.safeNotifyListeners();
    }
  }

  public setManualOverride(number: number | null, adminId: string = 'MasterAdmin', mode?: '30s' | '1min' | '3min') {
    const resolvedMode = (mode || this.currentRound.gameType || '30s') as '30s' | '1min' | '3min';
    if (number === null || number === undefined) {
      this.setWinGoOverride(resolvedMode, 'auto', 'auto', adminId);
    } else {
      this.setWinGoOverride(resolvedMode, 'number', number, adminId);
    }
  }

  public setOutcomeOverride(number: number | null, mode?: '30s' | '1min' | '3min') {
    this.setManualOverride(number, 'MasterAdmin', mode);
  }

  // --- AVIATOR / CRASH ENGINE (SERVER-AUTHORITATIVE & PROVABLY FAIR) ---
  private aviatorSyncTimer: ReturnType<typeof setInterval> | null = null;
  private aviatorLocalTickTimer: ReturnType<typeof setInterval> | null = null;
  private isSyncingAviator = false;
  private lastAviatorServerSyncAt: number = 0;

  private lastAviatorRtdbMirrorAt: number = 0;

  private mirrorAviatorRoundToRtdb(force: boolean = false) {
    const now = Date.now();
    if (!force && now - this.lastAviatorRtdbMirrorAt < 350) return;
    this.lastAviatorRtdbMirrorAt = now;
    const round = this.aviatorCurrentRound;
    if (!round) return;
    rtdbSet(rtdbRef(rtdb, 'aviator_rounds/current'), {
      roundId: round.roundId,
      roundNumber: round.roundNumber || this.aviatorRoundNonce,
      status: round.status,
      currentMultiplier:
        round.status === 'waiting'
          ? 1.00
          : round.status === 'flying'
          ? Math.max(1.00, Math.floor(this.getAviatorLiveMultiplier() * 100) / 100)
          : round.crashMultiplier || 1.00,
      crashMultiplier: round.crashMultiplier || 1.00,
      lastCrashMultiplier: this.aviatorPastCrashes?.[0] || 1.50,
      updatedAt: now
    }).catch(() => {});
  }

  private startAviatorRealtimeSync() {
    if (this.aviatorSyncTimer) return;

    // Subscribe to Firebase Realtime Database /admin_settings/aviator for live <200ms Admin Control
    try {
      rtdbOnValue(
        rtdbRef(rtdb, 'admin_settings/aviator'),
        (snap) => {
          if (!snap.exists()) return;
          const val = snap.val();
          if (!val || typeof val !== 'object') return;

          if (typeof val.targetRtp === 'number' && val.targetRtp >= 85 && val.targetRtp <= 99) {
            this.aviatorEngineConfig.rtpPercent = val.targetRtp;
            this.aviatorEngineConfig.houseEdgePercent = Math.round((100 - val.targetRtp) * 100) / 100;
          }
          if (typeof val.maxMultiplierCap === 'number' && val.maxMultiplierCap >= 2) {
            this.aviatorEngineConfig.maxMultiplierCap = val.maxMultiplierCap;
          }
          if (typeof val.streakBreakerEnabled === 'boolean') {
            this.aviatorEngineConfig.streakBreakerEnabled = val.streakBreakerEnabled;
          }
          if (typeof val.gameEnabled === 'boolean') {
            this.aviatorEngineConfig.enabled = val.gameEnabled;
            this.aviatorEngineConfig.gameEnabled = val.gameEnabled;
            this.aviatorEngineConfig.paused = !val.gameEnabled;
          }

          // Handle Next Crash Override from /admin_settings/aviator/nextCrashOverride
          if (
            val.nextCrashOverride !== null &&
            val.nextCrashOverride !== undefined &&
            Number.isFinite(Number(val.nextCrashOverride)) &&
            Number(val.nextCrashOverride) >= 1.0
          ) {
            const cleanOverride = Math.floor(Number(val.nextCrashOverride) * 100) / 100;
            this.aviatorEngineConfig.nextCrashOverride = cleanOverride;
            if (this.aviatorCurrentRound && this.aviatorCurrentRound.status === 'waiting') {
              this.aviatorCurrentRound.crashMultiplier = cleanOverride;
              this.aviatorCurrentRound.manualCrashOverride = cleanOverride;
            }
          } else if (val.nextCrashOverride === null) {
            this.aviatorEngineConfig.nextCrashOverride = null;
          }

          // Handle Emergency Force Crash Now (/admin_settings/aviator/forceCrashNow)
          if (val.forceCrashNow === true) {
            rtdbUpdate(rtdbRef(rtdb, 'admin_settings/aviator'), { forceCrashNow: false }).catch(() => {});
            if (this.aviatorCurrentRound && this.aviatorCurrentRound.status === 'flying') {
              const crashMult = Math.max(1.00, Math.floor(this.getAviatorLiveMultiplier() * 100) / 100);
              this.aviatorCurrentRound.status = 'crashed';
              this.aviatorCurrentRound.crashMultiplier = crashMult;
              this.aviatorCurrentRound.currentMultiplier = crashMult;
              this.aviatorCurrentRound.crashTime = Date.now();
              this.aviatorLiveMultiplier = crashMult;
              this.finishAviatorFlight(crashMult);
              this.mirrorAviatorRoundToRtdb(true);
            }
          }

          this.safeNotifyListeners();
        },
        () => {}
      );
    } catch {}

    const pollServerState = async () => {
      if (this.isSyncingAviator) return;
      this.isSyncingAviator = true;
      try {
        const res = await fetch('/api/aviator/state');
        if (res.ok) {
          const text = await res.text();
          if (text && !text.trim().startsWith('<')) {
            const data = JSON.parse(text);
            if (data && (data.ok || data.success) && data.currentRound) {
              this.lastAviatorServerSyncAt = Date.now();
              this.applyServerAviatorState(data);
            }
          }
        }
      } catch {
        // Local deterministic fallback progression handles offline/latency seamlessly
      } finally {
        this.isSyncingAviator = false;
      }
    };
    pollServerState();
    this.aviatorSyncTimer = setInterval(pollServerState, 120);
    if (!this.aviatorLocalTickTimer) {
      this.aviatorLocalTickTimer = setInterval(() => this.tickLocalAviatorFallback(), 60);
    }
  }

  private tickLocalAviatorFallback() {
    const now = Date.now();
    const serverFresh = now - this.lastAviatorServerSyncAt < 550;
    const round = this.aviatorCurrentRound;
    if (!round) return;

    if (this.aviatorEngineConfig.paused || !this.aviatorEngineConfig.enabled) {
      if (round.status === 'waiting') {
        round.startTime = now + (this.aviatorEngineConfig.waitDurationSeconds || 5) * 1000;
      }
      return;
    }

    const maxCap = Math.max(2, Number(this.aviatorEngineConfig.maxMultiplierCap) || 50);

    if (round.status === 'waiting') {
      // Ensure any pending nextCrashOverride is locked into the waiting round before takeoff
      if (
        this.aviatorEngineConfig.nextCrashOverride !== null &&
        this.aviatorEngineConfig.nextCrashOverride !== undefined &&
        Number.isFinite(this.aviatorEngineConfig.nextCrashOverride) &&
        this.aviatorEngineConfig.nextCrashOverride >= 1.0
      ) {
        round.crashMultiplier = Math.floor(this.aviatorEngineConfig.nextCrashOverride * 100) / 100;
      }

      const waitExpired = now >= round.startTime + (serverFresh ? 350 : 0);
      if (waitExpired) {
        // Consume nextCrashOverride on takeoff and reset to null in RTDB
        if (this.aviatorEngineConfig.nextCrashOverride !== null && this.aviatorEngineConfig.nextCrashOverride !== undefined) {
          round.crashMultiplier = Math.floor(this.aviatorEngineConfig.nextCrashOverride * 100) / 100;
          this.aviatorEngineConfig.nextCrashOverride = null;
          rtdbUpdate(rtdbRef(rtdb, 'admin_settings/aviator'), { nextCrashOverride: null }).catch(() => {});
        } else if (
          this.aviatorEngineConfig.streakBreakerEnabled !== false &&
          (this.aviatorPastCrashes?.[0] || 0) > 10.0 &&
          round.crashMultiplier >= 2.50
        ) {
          round.crashMultiplier = Math.floor((1.15 + Math.random() * 1.25) * 100) / 100;
        }
        round.crashMultiplier = Math.min(maxCap, Math.max(1.00, round.crashMultiplier));

        round.status = 'flying';
        round.flightStartTime = now;
        round.currentMultiplier = 1.00;
        this.aviatorLiveMultiplier = 1.00;
        if (round.crashMultiplier <= 1.00) {
          this.finishAviatorFlight(1.00);
          round.status = 'crashed';
          round.crashTime = now;
        }
        this.mirrorAviatorRoundToRtdb(true);
        this.safeNotifyListeners();
      }
      return;
    }

    if (round.status === 'flying') {
      const flightStart = round.flightStartTime || now;
      const elapsedMs = Math.max(0, now - flightStart);
      const computedMult = computeMultiplierAtElapsedMs(elapsedMs);
      const crashTarget = Math.min(maxCap, Math.max(1.00, round.crashMultiplier || 1.85));

      if (computedMult >= crashTarget || computedMult >= maxCap) {
        const finalCrashVal = Math.min(maxCap, crashTarget);
        round.status = 'crashed';
        round.crashMultiplier = finalCrashVal;
        round.currentMultiplier = finalCrashVal;
        round.crashTime = now;
        this.aviatorLiveMultiplier = finalCrashVal;
        this.finishAviatorFlight(finalCrashVal);
        this.mirrorAviatorRoundToRtdb(true);
      } else {
        this.aviatorLiveMultiplier = computedMult;
        round.currentMultiplier = computedMult;
        this.mirrorAviatorRoundToRtdb(false);
      }
      return;
    }

    if (round.status === 'crashed' && !serverFresh) {
      const crashedAt = round.crashTime || now;
      const displayMs = (this.aviatorEngineConfig.crashDisplaySeconds || 3.5) * 1000;
      if (now - crashedAt >= displayMs) {
        const nextCrash = this.generateCrashMultiplier();
        const pf = computeProvablyFairCrash(
          this.aviatorServerSeed,
          this.aviatorClientSeed,
          this.aviatorRoundNonce,
          this.aviatorEngineConfig.rtpPercent || 95,
          maxCap,
          this.aviatorPastCrashes?.[0] || 1.50,
          this.aviatorEngineConfig.streakBreakerEnabled !== false
        );
        const waitMs = (this.aviatorEngineConfig.waitDurationSeconds || 5) * 1000;
        this.aviatorCurrentRound = {
          roundId: `av_${this.aviatorRoundNonce}_${now.toString(36).slice(-4)}`,
          roundNumber: this.aviatorRoundNonce,
          startTime: now + waitMs,
          crashMultiplier: nextCrash,
          currentMultiplier: 1.00,
          status: 'waiting',
          serverSeedHash: pf.serverSeedHash,
          clientSeed: this.aviatorClientSeed,
          nonce: this.aviatorRoundNonce,
          hmacHash: pf.hmacHex,
          bets: {}
        };
        this.aviatorLiveMultiplier = 1.00;
        this.mirrorAviatorRoundToRtdb(true);
        this.safeNotifyListeners();
      }
    }
  }

  private applyServerAviatorState(data: {
    currentRound: AviatorRound;
    liveMultiplier?: number;
    countdownMs?: number;
    elapsedFlightMs?: number;
    pastCrashes?: number[];
    recentHistory?: AviatorRoundHistoryItem[];
    roundHistory?: AviatorRoundHistoryItem[];
    config?: AviatorEngineConfig;
    totalStaked?: number;
    totalPaidOut?: number;
  }) {
    const incomingRound = data.currentRound;
    const prevRoundId = this.aviatorCurrentRound?.roundId;
    const prevStatus = this.aviatorCurrentRound?.status;
    const now = Date.now();

    // Merge local user bets with server bets for the same round so UI never flickers
    const mergedBets: Record<string, AviatorBet> = { ...(incomingRound.bets || {}) };
    if (prevRoundId === incomingRound.roundId && this.aviatorCurrentRound?.bets) {
      Object.entries(this.aviatorCurrentRound.bets).forEach(([bId, localBet]) => {
        if (!mergedBets[bId]) {
          mergedBets[bId] = localBet;
        } else if (localBet.status === 'cashed_out' && mergedBets[bId].status !== 'cashed_out') {
          mergedBets[bId] = localBet;
        }
      });
    }

    // Normalize relative timestamps to eliminate any clock skew between server and browser
    const normalizedStartTime =
      incomingRound.status === 'waiting' && typeof data.countdownMs === 'number'
        ? now + Math.max(0, data.countdownMs)
        : incomingRound.startTime;

    const normalizedFlightStartTime =
      incomingRound.status === 'flying' && typeof data.elapsedFlightMs === 'number'
        ? now - Math.max(0, data.elapsedFlightMs)
        : incomingRound.flightStartTime || (incomingRound.status === 'flying' ? now : undefined);

    const maxCap = Math.max(2, Number(this.aviatorEngineConfig.maxMultiplierCap) || 50);
    let effectiveCrashMult = Math.min(maxCap, Math.max(1.00, incomingRound.crashMultiplier || 1.85));

    // Enforce RTDB nextCrashOverride and Streak Breaker across server-synced rounds as well
    if (
      this.aviatorEngineConfig.nextCrashOverride !== null &&
      this.aviatorEngineConfig.nextCrashOverride !== undefined &&
      Number.isFinite(this.aviatorEngineConfig.nextCrashOverride) &&
      this.aviatorEngineConfig.nextCrashOverride >= 1.0
    ) {
      effectiveCrashMult = Math.floor(this.aviatorEngineConfig.nextCrashOverride * 100) / 100;
      if (incomingRound.status === 'flying' && prevStatus === 'waiting') {
        this.aviatorEngineConfig.nextCrashOverride = null;
        rtdbUpdate(rtdbRef(rtdb, 'admin_settings/aviator'), { nextCrashOverride: null }).catch(() => {});
      }
    } else if (
      this.aviatorEngineConfig.streakBreakerEnabled !== false &&
      (this.aviatorPastCrashes?.[0] || 0) > 10.0 &&
      effectiveCrashMult >= 2.50
    ) {
      effectiveCrashMult = 2.15;
    }

    this.aviatorCurrentRound = {
      ...incomingRound,
      crashMultiplier: effectiveCrashMult,
      startTime: normalizedStartTime,
      flightStartTime: normalizedFlightStartTime,
      bets: mergedBets
    };

    const rawLiveMult = data.liveMultiplier ?? incomingRound.currentMultiplier ?? 1.00;
    this.aviatorLiveMultiplier =
      typeof rawLiveMult === 'number' && Number.isFinite(rawLiveMult)
        ? Math.min(effectiveCrashMult, Math.max(1.00, rawLiveMult))
        : 1.00;
    this.mirrorAviatorRoundToRtdb(prevRoundId !== incomingRound.roundId || prevStatus !== incomingRound.status);

    if (Array.isArray(data.pastCrashes) && data.pastCrashes.length > 0) {
      this.aviatorPastCrashes = data.pastCrashes.filter(
        (c) => typeof c === 'number' && Number.isFinite(c) && c >= 1.0
      );
    }

    const historySource = Array.isArray(data.recentHistory)
      ? data.recentHistory
      : Array.isArray(data.roundHistory)
      ? data.roundHistory
      : [];

    if (historySource.length > 0) {
      this.aviatorHistoryItems = historySource;
      // Sync session rounds from authoritative history without duplicates
      this.aviatorSessionRounds = historySource.slice(0, 40).map((h) => ({
        roundId: h.roundId,
        roundNumber: h.roundNumber,
        crashMultiplier: h.crashMultiplier,
        totalBetVolume: h.totalBetVolume || 0,
        totalPayout: h.totalPayout || 0,
        houseProfit: h.houseProfit || 0,
        marginPercent: h.marginPercent ?? 100,
        betsCount: h.betsCount || 0,
        timestamp: h.timestamp || h.crashedAt || now,
        serverSeedHash: h.serverSeedHash,
        serverSeed: h.serverSeed,
        clientSeed: h.clientSeed,
        nonce: h.nonce,
        hmacHash: h.hmacHash
      }));
    }

    if (data.config) {
      this.aviatorEngineConfig = { ...this.aviatorEngineConfig, ...data.config };
    }

    // Check if any local user in-flight bets were auto-cashed out on the server or crashed
    Object.values(mergedBets).forEach((bet) => {
      if (
        bet.status === 'cashed_out' &&
        bet.payout > 0 &&
        !this.aviatorCashedOutBetIds.has(bet.id) &&
        this.users[bet.uid]
      ) {
        this.aviatorCashedOutBetIds.add(bet.id);
        this.aviatorTotalPaidOut += bet.payout;
        const user = this.users[bet.uid];
        if (user) {
          user.totalWonAmount += bet.payout;
          this.executeWalletTransaction({
            uid: bet.uid,
            type: 'game_payout',
            category: 'credit',
            amount: bet.payout,
            referenceId: bet.id,
            description: `Aviator Cashout (${(bet.cashedOutMultiplier || 1.01).toFixed(2)}x) Round ${incomingRound.roundId}`
          });
        }
      }
    });

    if (
      incomingRound.status === 'crashed' &&
      !this.aviatorSettledRoundIds.has(incomingRound.roundId)
    ) {
      this.aviatorSettledRoundIds.add(incomingRound.roundId);
      Object.values(mergedBets).forEach((bet) => {
        if (bet.status !== 'cashed_out' && !this.aviatorCashedOutBetIds.has(bet.id)) {
          bet.status = 'crashed';
          const user = this.users[bet.uid];
          if (user) {
            user.totalLostAmount += bet.amount;
          }
        }
      });
      if (this.onAviatorRoundSynced) {
        try {
          this.onAviatorRoundSynced(this.aviatorCurrentRound, this.aviatorLiveMultiplier);
        } catch {}
      }
    } else if (prevRoundId !== incomingRound.roundId || prevStatus !== incomingRound.status) {
      if (this.onAviatorRoundSynced) {
        try {
          this.onAviatorRoundSynced(this.aviatorCurrentRound, this.aviatorLiveMultiplier);
        } catch {}
      }
    }

    this.safeNotifyListeners();
  }

  public getAviatorLiveMultiplier(): number {
    if (this.aviatorCurrentRound?.status === 'flying' && this.aviatorCurrentRound.flightStartTime) {
      const elapsed = Math.max(0, Date.now() - this.aviatorCurrentRound.flightStartTime);
      const computed = computeMultiplierAtElapsedMs(elapsed);
      return Math.min(this.aviatorCurrentRound.crashMultiplier || computed, computed);
    }
    return this.aviatorLiveMultiplier;
  }

  public getAviatorEngineConfig(): AviatorEngineConfig {
    return this.aviatorEngineConfig;
  }

  public getAviatorHistoryItems(): AviatorRoundHistoryItem[] {
    return this.aviatorHistoryItems;
  }

  public getAviatorLastSimulationReport(): AviatorSimulationReport | null {
    return this.aviatorLastSimulationReport;
  }

  public verifyAviatorRoundFairness(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    rtpPercent: number = 97,
    maxCap: number = 1000
  ) {
    return verifyProvablyFairRound(serverSeed, clientSeed, nonce, rtpPercent, maxCap);
  }

  public placeAviatorBet(
    uid: string,
    amount: number,
    autoCashout?: number,
    station: 1 | 2 = 1
  ): { success: boolean; betId?: string; error?: string } {
    if (this.isMaintenanceActiveForUser(uid)) {
      return {
        success: false,
        error:
          this.adminSettings.maintenanceMessage ||
          'Platform is in Maintenance Mode. Aviator betting is temporarily paused by Master Admin.'
      };
    }
    if (!this.isFeatureEnabled('aviator') || !this.aviatorEngineConfig.enabled) {
      return {
        success: false,
        error: 'Aviator Crash game is currently disabled by Master Admin.'
      };
    }
    if (this.aviatorEngineConfig.paused) {
      return {
        success: false,
        error: 'Aviator rounds are temporarily paused by Admin Console.'
      };
    }
    if (this.aviatorCurrentRound.status !== 'waiting') {
      return {
        success: false,
        error: 'Wait for the next round countdown to place your bet'
      };
    }

    const user = this.users[uid];
    if (!user) return { success: false, error: 'User not found' };
    if (user.status !== 'active') {
      return { success: false, error: `Account is ${user.status}. Betting is restricted.` };
    }

    const minBet = this.aviatorEngineConfig.minBet || 50;
    const maxBet = this.aviatorEngineConfig.maxBet || 100000;
    const cleanAmount = Math.round(Number(amount) * 100) / 100;
    if (!Number.isFinite(cleanAmount) || cleanAmount < minBet) {
      return { success: false, error: `Minimum bet amount is ₹${minBet}` };
    }
    if (cleanAmount > maxBet) {
      return { success: false, error: `Maximum bet amount is ₹${maxBet}` };
    }

    // Prevent duplicate bet on the same station in the same round
    const existingSameStation = Object.values(this.aviatorCurrentRound.bets).find(
      (b) => b.uid === uid && (b.station || 1) === station
    );
    if (existingSameStation) {
      return {
        success: false,
        error: `Bet already placed on Station ${station} for this round`
      };
    }

    const betId = `av_bet_${this.aviatorCurrentRound.roundId}_${uid}_s${station}`;
    const tx = this.executeWalletTransaction({
      uid,
      type: 'bet_placement',
      category: 'debit',
      amount: cleanAmount,
      referenceId: betId,
      description: `Aviator Station ${station} Stake (Round ${this.aviatorCurrentRound.roundId})`
    });

    if (!tx.success) return { success: false, error: tx.error };

    user.totalBetsCount += 1;
    this.recordBettingTurnover(uid, cleanAmount);
    this.aviatorTotalStaked += cleanAmount;

    const validAutoCashout =
      autoCashout && Number.isFinite(autoCashout) && autoCashout >= 1.01
        ? Math.round(autoCashout * 100) / 100
        : undefined;

    const betRecord: AviatorBet = {
      id: betId,
      uid,
      username: user.username,
      amount: cleanAmount,
      station,
      autoCashoutMultiplier: validAutoCashout,
      payout: 0,
      status: 'in_flight',
      placedAt: Date.now()
    };

    this.aviatorCurrentRound.bets[betId] = betRecord;

    // Also mirror bet to authoritative server engine asynchronously (NOTE: crashMultiplier is NEVER altered by player bets!)
    if (typeof window !== 'undefined') {
      fetch('/api/aviator/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betId,
          uid,
          username: user.username,
          amount: cleanAmount,
          station,
          autoCashout: validAutoCashout
        })
      }).catch(() => {});
    }

    this.notify();
    return { success: true, betId };
  }

  public startAviatorFlight(): number {
    this.aviatorCurrentRound.status = 'flying';
    if (!this.aviatorCurrentRound.flightStartTime) {
      this.aviatorCurrentRound.flightStartTime = Date.now();
    }
    this.notify();
    return this.aviatorCurrentRound.crashMultiplier;
  }

  public cashOutAviator(
    uid: string,
    betId: string,
    currentMult: number
  ): { success: boolean; payout?: number; cashedOutMultiplier?: number; crashedInstead?: boolean; crashMult?: number; error?: string } {
    // Idempotency guard: prevent duplicate payout for the same betId
    if (this.aviatorCashedOutBetIds.has(betId)) {
      return { success: false, error: 'Bet already cashed out' };
    }

    const bet = this.aviatorCurrentRound.bets[betId];
    if (!bet || bet.uid !== uid || bet.status !== 'in_flight') {
      return { success: false, error: 'No active in-flight bet found' };
    }

    if (this.aviatorCurrentRound.status !== 'flying') {
      return { success: false, error: 'Plane is not currently in flight' };
    }

    const safeMult = Math.max(1.01, Math.floor(currentMult * 100) / 100);
    const lockedCrash = Math.max(1.00, this.aviatorCurrentRound.crashMultiplier);

    // Strictly verify cashout is below the provably fair round crash multiplier
    if (safeMult >= lockedCrash) {
      return { success: false, crashedInstead: true, crashMult: lockedCrash };
    }

    // Lock cashout idempotently before crediting wallet
    this.aviatorCashedOutBetIds.add(betId);
    const effectiveMult =
      bet.autoCashoutMultiplier && bet.autoCashoutMultiplier >= 1.01 && safeMult >= bet.autoCashoutMultiplier
        ? bet.autoCashoutMultiplier
        : safeMult;

    const payout = Math.round(bet.amount * effectiveMult * 100) / 100;

    bet.status = 'cashed_out';
    bet.cashedOutMultiplier = effectiveMult;
    bet.payout = payout;
    bet.cashedOutAt = Date.now();
    this.aviatorTotalPaidOut += payout;

    const user = this.users[uid];
    if (user && payout > 0) {
      user.totalWonAmount += payout;
      this.executeWalletTransaction({
        uid,
        type: 'game_payout',
        category: 'credit',
        amount: payout,
        referenceId: betId,
        description: `Aviator Cashout (${effectiveMult.toFixed(2)}x) Round ${this.aviatorCurrentRound.roundId}`
      });
    }

    // Notify server engine of cashout so Admin and other tabs see the cashout immediately
    if (typeof window !== 'undefined') {
      fetch('/api/aviator/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          betId,
          requestedMultiplier: effectiveMult
        })
      }).catch(() => {});
    }

    this.notify();
    return { success: true, payout, cashedOutMultiplier: effectiveMult };
  }

  public finishAviatorFlight(crashedAt: number) {
    const roundId = this.aviatorCurrentRound.roundId;
    if (this.aviatorSettledRoundIds.has(roundId)) {
      return;
    }
    this.aviatorSettledRoundIds.add(roundId);

    const safeCrashedAt = Number.isFinite(crashedAt) && crashedAt >= 1.0 ? crashedAt : 1.00;
    const cleanCrash = Math.max(1.00, Math.floor(safeCrashedAt * 100) / 100);
    this.aviatorPastCrashes = (this.aviatorPastCrashes || []).filter(
      (c) => typeof c === 'number' && Number.isFinite(c) && c >= 1.0
    );
    if (this.aviatorPastCrashes[0] !== cleanCrash) {
      this.aviatorPastCrashes.unshift(cleanCrash);
      if (this.aviatorPastCrashes.length > 30) this.aviatorPastCrashes.pop();
    }

    // Settle uncashed bets as crashed and compute round analytics
    const roundBets = Object.values(this.aviatorCurrentRound.bets);
    let roundBetVolume = 0;
    let roundPayout = 0;

    roundBets.forEach((b) => {
      roundBetVolume += Number(b.amount) || 0;
      if (b.status === 'in_flight') {
        b.status = 'crashed';
        const user = this.users[b.uid];
        if (user) user.totalLostAmount += b.amount;
      } else if (b.status === 'cashed_out') {
        roundPayout += Number(b.payout) || 0;
      }
    });

    const roundProfit = Math.round((roundBetVolume - roundPayout) * 100) / 100;
    const roundMarginPercent =
      roundBetVolume > 0
        ? Math.round(((roundBetVolume - roundPayout) / roundBetVolume) * 10000) / 100
        : 100;

    if (!this.aviatorSessionRounds.some((r) => r.roundId === roundId)) {
      const historyItem: AviatorRoundHistoryItem = {
        roundId,
        roundNumber: this.aviatorCurrentRound.roundNumber || this.aviatorRoundNonce,
        crashMultiplier: cleanCrash,
        serverSeedHash: this.aviatorCurrentRound.serverSeedHash || sha256Hex(this.aviatorServerSeed),
        serverSeed: this.aviatorServerSeed,
        clientSeed: this.aviatorCurrentRound.clientSeed || this.aviatorClientSeed,
        nonce: this.aviatorCurrentRound.nonce || this.aviatorRoundNonce,
        hmacHash: this.aviatorCurrentRound.hmacHash || '',
        totalBetVolume: roundBetVolume,
        totalPayout: roundPayout,
        houseProfit: roundProfit,
        marginPercent: roundMarginPercent,
        betsCount: roundBets.length,
        cashedOutCount: roundBets.filter((b) => b.status === 'cashed_out').length,
        timestamp: Date.now()
      };
      this.aviatorHistoryItems.unshift(historyItem);
      if (this.aviatorHistoryItems.length > 50) this.aviatorHistoryItems.pop();

      this.aviatorSessionRounds.unshift(historyItem as any);
      if (this.aviatorSessionRounds.length > 50) {
        this.aviatorSessionRounds.pop();
      }
    }

    this.notify();
  }

  public getAviatorSessionAnalytics() {
    const totalBetVolume = Math.round((this.aviatorTotalStaked || 0) * 100) / 100;
    const totalPayout = Math.round((this.aviatorTotalPaidOut || 0) * 100) / 100;
    const netHouseProfit = Math.round((totalBetVolume - totalPayout) * 100) / 100;
    const targetHouseMarginPercent = Math.max(1, 100 - (this.aviatorEngineConfig.rtpPercent || 97));
    const actualHouseMarginPercent =
      totalBetVolume > 0
        ? Math.round(((totalBetVolume - totalPayout) / totalBetVolume) * 10000) / 100
        : 100;
    const maxAllowedPayoutPool =
      Math.round(totalBetVolume * ((this.aviatorEngineConfig.rtpPercent || 97) / 100) * 100) / 100;
    const remainingPayoutBudget =
      Math.max(0, Math.round((maxAllowedPayoutPool - totalPayout) * 100) / 100);
    const isWithinTargetThreshold =
      totalBetVolume === 0 || actualHouseMarginPercent >= targetHouseMarginPercent;

    const currentRoundBets = Object.values(this.aviatorCurrentRound?.bets || {});
    const activeRoundBetVolume = currentRoundBets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
    const activeRoundBetsCount = currentRoundBets.length;

    const crashes = this.getAviatorPastCrashes();
    const lowCrashCount = crashes.filter((c) => c < 2.00).length;
    const midCrashCount = crashes.filter((c) => c >= 2.00 && c < 10.00).length;
    const highCrashCount = crashes.filter((c) => c >= 10.00).length;

    return {
      totalBetVolume,
      totalPayout,
      netHouseProfit,
      actualHouseMarginPercent,
      targetHouseMarginPercent,
      maxAllowedPayoutPool,
      remainingPayoutBudget,
      isWithinTargetThreshold,
      activeRoundBetVolume,
      activeRoundBetsCount,
      totalRoundsLogged: this.aviatorSessionRounds.length,
      lowCrashCount,
      midCrashCount,
      highCrashCount,
      recentRounds: this.aviatorSessionRounds.slice(0, 30)
    };
  }

  public resetAviatorSessionAnalytics(adminId: string = 'MasterAdmin') {
    this.aviatorTotalStaked = 0;
    this.aviatorTotalPaidOut = 0;
    this.aviatorSessionRounds = [];
    if (typeof window !== 'undefined') {
      fetch('/api/aviator/admin/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-master-admin-key': 'BINGO_MASTER_2026_KEY'
        },
        body: JSON.stringify({ action: 'reset_analytics', adminId })
      }).catch(() => {});
    }
    this.logAudit({
      actor: adminId,
      category: 'GAME_CONTROL',
      action: 'RESET_AVIATOR_SESSION_ANALYTICS',
      details: 'Reset Aviator session bet volume and payout counters to ₹0'
    });
    this.notify();
  }

  public setAviatorCrashOverride(multiplier: number | null, adminId: string = 'MasterAdmin') {
    this.aviatorCurrentRound.manualCrashOverride = multiplier;
    this.aviatorEngineConfig.nextCrashOverride = multiplier;
    if (multiplier !== null && this.aviatorCurrentRound.status === 'waiting') {
      this.aviatorCurrentRound.crashMultiplier = Math.max(1.00, Math.floor(multiplier * 100) / 100);
    }
    if (typeof window !== 'undefined') {
      fetch('/api/aviator/admin/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-master-admin-key': 'BINGO_MASTER_2026_KEY'
        },
        body: JSON.stringify({ action: 'set_next_override', multiplier, payload: { multiplier }, adminId })
      }).catch(() => {});
    }
    this.logAudit({
      actor: adminId,
      category: 'GAME_CONTROL',
      action: 'SET_AVIATOR_OVERRIDE',
      details:
        multiplier !== null
          ? `Set next Aviator round crash override to ${multiplier}X`
          : 'Cleared Aviator override (Provably Fair HMAC-SHA256 active)'
    });
    this.notify();
  }

  public forceAviatorCrashNow(adminId: string = 'MasterAdmin') {
    if (this.aviatorCurrentRound.status === 'flying') {
      const crashMult = Math.max(1.00, Math.floor(this.getAviatorLiveMultiplier() * 100) / 100);
      this.aviatorCurrentRound.status = 'crashed';
      this.aviatorCurrentRound.crashMultiplier = crashMult;
      this.aviatorCurrentRound.currentMultiplier = crashMult;
      this.aviatorCurrentRound.crashTime = Date.now();
      this.aviatorLiveMultiplier = crashMult;
      this.finishAviatorFlight(crashMult);
    }
    if (typeof window !== 'undefined') {
      fetch('/api/aviator/admin/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-master-admin-key': 'BINGO_MASTER_2026_KEY'
        },
        body: JSON.stringify({ action: 'force_crash_now', adminId })
      }).catch(() => {});
    }
    this.logAudit({
      actor: adminId,
      category: 'GAME_CONTROL',
      action: 'FORCE_AVIATOR_CRASH_NOW',
      details: `Admin forced immediate crash on active Aviator round ${this.aviatorCurrentRound.roundId}`
    });
    this.notify();
  }

  public toggleAviatorPause(paused: boolean, adminId: string = 'MasterAdmin') {
    this.aviatorEngineConfig.paused = paused;
    if (!paused && this.aviatorCurrentRound.status === 'waiting') {
      this.aviatorCurrentRound.startTime = Date.now() + 2500;
    }
    if (typeof window !== 'undefined') {
      fetch('/api/aviator/admin/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-master-admin-key': 'BINGO_MASTER_2026_KEY'
        },
        body: JSON.stringify({ action: 'toggle_pause', paused, payload: { paused }, adminId })
      }).catch(() => {});
    }
    this.logAudit({
      actor: adminId,
      category: 'GAME_CONTROL',
      action: paused ? 'PAUSE_AVIATOR_ENGINE' : 'RESUME_AVIATOR_ENGINE',
      details: `Admin ${paused ? 'paused' : 'resumed'} the Aviator crash engine.`
    });
    this.notify();
  }

  public updateAviatorEngineConfig(
    updates: Partial<AviatorEngineConfig>,
    adminId: string = 'MasterAdmin'
  ) {
    this.aviatorEngineConfig = {
      ...this.aviatorEngineConfig,
      ...updates,
      updatedAt: Date.now(),
      updatedBy: adminId
    };
    if (updates.rtpPercent !== undefined) {
      this.adminSettings.aviatorCrashRTP = updates.rtpPercent;
    }
    if (typeof window !== 'undefined') {
      fetch('/api/aviator/admin/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-master-admin-key': 'BINGO_MASTER_2026_KEY'
        },
        body: JSON.stringify({ action: 'update_config', config: updates, payload: updates, adminId })
      }).catch(() => {});
    }
    this.logAudit({
      actor: adminId,
      category: 'GAME_CONTROL',
      action: 'UPDATE_AVIATOR_CONFIG',
      details: `Updated Aviator Engine Configuration (RTP: ${this.aviatorEngineConfig.rtpPercent}%, MaxCap: ${this.aviatorEngineConfig.maxMultiplierCap}x, MinBet: ₹${this.aviatorEngineConfig.minBet}, MaxBet: ₹${this.aviatorEngineConfig.maxBet})`
    });
    this.notify();
  }

  public rotateAviatorSeeds(newClientSeed?: string, adminId: string = 'MasterAdmin') {
    if (newClientSeed && newClientSeed.trim()) {
      this.aviatorClientSeed = newClientSeed.trim();
      this.aviatorEngineConfig.provablyFairClientSeed = this.aviatorClientSeed;
    }
    if (typeof window !== 'undefined') {
      fetch('/api/aviator/admin/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-master-admin-key': 'BINGO_MASTER_2026_KEY'
        },
        body: JSON.stringify({
          action: 'rotate_seeds',
          clientSeed: this.aviatorClientSeed,
          payload: { clientSeed: this.aviatorClientSeed },
          adminId
        })
      }).catch(() => {});
    }
    this.logAudit({
      actor: adminId,
      category: 'GAME_CONTROL',
      action: 'ROTATE_AVIATOR_PROVABLY_FAIR_SEEDS',
      details: `Rotated Aviator Provably Fair Server Seed & updated Client Seed to "${this.aviatorClientSeed}"`
    });
    this.notify();
  }

  public async runAviatorFairnessSimulation(
    roundsCount: number = 100000
  ): Promise<AviatorSimulationReport> {
    try {
      const res = await fetch('/api/aviator/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rounds: roundsCount,
          rtpPercent: this.aviatorEngineConfig.rtpPercent || 97,
          maxMultiplierCap: this.aviatorEngineConfig.maxMultiplierCap || 1000
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.ok || data.success) && data.report) {
          this.aviatorLastSimulationReport = data.report;
          this.notify();
          return data.report;
        }
      }
    } catch {
      // Fallback to local synchronous Monte Carlo simulation if endpoint unreachable
    }
    const localReport = runAviatorMonteCarloSimulation(
      roundsCount,
      this.aviatorEngineConfig.rtpPercent || 97,
      this.aviatorEngineConfig.maxMultiplierCap || 1000
    );
    this.aviatorLastSimulationReport = localReport;
    this.notify();
    return localReport;
  }

  // --- K3 LOTRE DICE ENGINE ---
  public placeK3Bet(uid: string, betType: 'k3_sum' | 'k3_dice', value: string, amount: number): { success: boolean; error?: string } {
    if (this.isMaintenanceActiveForUser(uid)) {
      return {
        success: false,
        error: this.adminSettings.maintenanceMessage || 'Platform is in Maintenance Mode. Betting is temporarily paused by Master Admin.'
      };
    }
    if (!this.isFeatureEnabled('k3_dice')) {
      return {
        success: false,
        error: 'K3 Lotre is currently disabled by Master Admin.'
      };
    }
    const user = this.users[uid];
    if (!user) return { success: false, error: 'User not found' };
    if (amount < 50) return { success: false, error: 'Minimum bet amount is ₹50' };

    const betId = 'k3_bet_' + Math.random().toString(36).substring(2, 9);
    const tx = this.executeWalletTransaction({
      uid,
      type: 'bet_placement',
      category: 'debit',
      amount,
      referenceId: betId,
      description: `K3 Dice Bet [${betType.toUpperCase()}: ${value}] (Period ${this.k3CurrentRound.period})`
    });

    if (!tx.success) return { success: false, error: tx.error };

    user.totalBetsCount += 1;
    const bet: LiveBet = {
      betId,
      uid,
      username: user.username,
      gameId: 'k3_dice',
      roundPeriod: this.k3CurrentRound.period,
      gameType: '1min',
      betType,
      betValue: value,
      amount,
      multiplier: 2,
      potentialPayout: amount * 2,
      status: 'pending',
      actualPayout: 0,
      timestamp: Date.now()
    };
    this.liveBets.unshift(bet);
    this.notify();
    return { success: true };
  }

  public resolveK3Round(overrideDice?: [number, number, number]) {
    const resolvingPeriod = this.k3CurrentRound.period;
    if (this.resolvedPeriodIds.has(resolvingPeriod)) {
      return;
    }
    this.resolvedPeriodIds.add(resolvingPeriod);

    let d: [number, number, number];
    if (overrideDice) {
      d = overrideDice;
    } else if (this.k3CurrentRound.manualOverrideDice) {
      d = this.k3CurrentRound.manualOverrideDice;
    } else if (this.adminSettings.zeroPlatformLossMode) {
      const activeK3Bets = this.liveBets.filter(
        (b) => b.gameId === 'k3_dice' && b.roundPeriod === resolvingPeriod && b.status === 'pending'
      );
      if (activeK3Bets.length > 0) {
        const candidates: [number, number, number][] = [
          [1, 2, 3], [1, 1, 2], [2, 3, 4], [3, 4, 5], [4, 5, 6], [1, 3, 5], [2, 4, 6], [1, 1, 3], [2, 2, 4]
        ];
        let bestDice = candidates[0];
        let minPayout = Infinity;

        for (const cand of candidates) {
          const s = cand[0] + cand[1] + cand[2];
          const sz = s >= 11 ? 'big' : 'small';
          const pr = s % 2 === 0 ? 'even' : 'odd';
          let candPayout = 0;

          for (const b of activeK3Bets) {
            let won = false;
            let rate = 2.0;
            if (b.betValue === 'big' && sz === 'big') won = true;
            if (b.betValue === 'small' && sz === 'small') won = true;
            if (b.betValue === 'odd' && pr === 'odd') won = true;
            if (b.betValue === 'even' && pr === 'even') won = true;
            if (parseInt(b.betValue, 10) === s) { won = true; rate = 9.0; }
            if (won) candPayout += b.amount * rate;
          }

          if (candPayout < minPayout) {
            minPayout = candPayout;
            bestDice = cand;
          }
        }
        d = bestDice;
      } else {
        d = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ];
      }
    } else {
      d = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
    }

    const sum = d[0] + d[1] + d[2];
    const size = sum >= 11 ? 'big' : 'small';
    const parity = sum % 2 === 0 ? 'even' : 'odd';
    const userSettledBetsMap: Record<string, LiveBet[]> = {};

    // Settle K3 bets
    this.liveBets = this.liveBets.map((b) => {
      if (b.gameId === 'k3_dice' && b.roundPeriod === resolvingPeriod && b.status === 'pending') {
        let won = false;
        let rate = 2.0;

        if (b.betValue === 'big' && size === 'big') won = true;
        if (b.betValue === 'small' && size === 'small') won = true;
        if (b.betValue === 'odd' && parity === 'odd') won = true;
        if (b.betValue === 'even' && parity === 'even') won = true;
        if (parseInt(b.betValue, 10) === sum) { won = true; rate = 9.0; }

        const payout = won ? Math.round(b.amount * rate * 0.98 * 100) / 100 : 0;
        const updatedBet: LiveBet = {
          ...b,
          status: won ? 'won' : 'lost',
          actualPayout: payout
        };

        const user = this.users[b.uid];
        if (user) {
          if (won && payout > 0) {
            user.totalWonAmount += payout;
            this.executeWalletTransaction({
              uid: b.uid,
              type: 'game_payout',
              category: 'credit',
              amount: payout,
              referenceId: b.betId,
              description: `K3 Dice Win [Period ${resolvingPeriod}] Won on ${b.betValue}`
            });
          } else {
            user.totalLostAmount += b.amount;
          }
        }

        if (!userSettledBetsMap[b.uid]) {
          userSettledBetsMap[b.uid] = [];
        }
        userSettledBetsMap[b.uid].push(updatedBet);
        return updatedBet;
      }
      return b;
    });

    const completed: K3Round = {
      ...this.k3CurrentRound,
      dice: d,
      sum,
      size,
      parity,
      isResolved: true
    };
    this.k3PastRounds.unshift(completed);
    if (this.k3PastRounds.length > 50) this.k3PastRounds.pop();
    this.k3CurrentRound = this.generateNewK3Round();

    // Emit settlement notices for K3 participants
    Object.entries(userSettledBetsMap).forEach(([uid, settledBets]) => {
      const totalBetAmount = settledBets.reduce((acc, bet) => acc + bet.amount, 0);
      const totalPayout = settledBets.reduce((acc, bet) => acc + (bet.actualPayout || 0), 0);
      const isWin = totalPayout > 0;
      const netProfit = totalPayout - totalBetAmount;
      const user = this.users[uid];
      const walletBalanceAfter = user ? user.balance : 0;

      this.emitSettlementNotice({
        resultId: `res_${resolvingPeriod}_${uid}`,
        roundPeriod: resolvingPeriod,
        gameName: 'K3 Lotre Dice',
        gameType: '1min',
        winningNumber: sum,
        winningColors: parity === 'even' ? ['red'] : ['green'],
        winningSize: size,
        uid,
        isWin,
        totalBetAmount,
        totalPayout,
        netProfit,
        walletBalanceAfter,
        bets: settledBets,
        settledAt: Date.now()
      });
    });

    if (Object.keys(userSettledBetsMap).length > 0) {
      this.notify();
    } else {
      this.notifyLightweight();
    }
  }

  public setK3Override(dice: [number, number, number] | null) {
    this.k3CurrentRound.manualOverrideDice = dice;
    this.logAudit({
      actor: 'MasterAdmin',
      category: 'GAME_CONTROL',
      action: 'SET_K3_DICE_OVERRIDE',
      details: dice ? `Forced K3 Dice outcome to [${dice.join(', ')}] (Sum: ${dice[0] + dice[1] + dice[2]})` : 'Reset K3 to random dice'
    });
    this.notify();
  }

  // --- MINES GAME ENGINE ---
  public startMinesSession(uid: string, betAmount: number, minesCount: number): { success: boolean; error?: string; session?: MinesSession } {
    const user = this.users[uid];
    if (!user || user.balance < betAmount) return { success: false, error: 'Insufficient balance' };
    if (minesCount < 1 || minesCount > 24) return { success: false, error: 'Mines must be between 1 and 24' };

    const sessionId = 'mine_' + Date.now();
    const tx = this.executeWalletTransaction({
      uid,
      type: 'bet_placement',
      category: 'debit',
      amount: betAmount,
      referenceId: sessionId,
      description: `Mines Stake (${minesCount} mines)`
    });

    if (!tx.success) {
      return { success: false, error: tx.error || 'Failed to place Mines bet' };
    }

    user.totalBetsCount += 1;
    this.recordBettingTurnover(uid, betAmount);

    // Pick random mine locations
    const allIndices = Array.from({ length: 25 }, (_, i) => i);
    const mineIndices: number[] = [];
    for (let i = 0; i < minesCount; i++) {
      const idx = Math.floor(Math.random() * allIndices.length);
      mineIndices.push(allIndices.splice(idx, 1)[0]);
    }

    const session: MinesSession = {
      sessionId,
      uid,
      betAmount,
      minesCount,
      gridSize: 25,
      mineIndices,
      revealedIndices: [],
      currentMultiplier: 1.0,
      isGameOver: false,
      hasWon: false,
      cashedOut: false,
      payout: 0
    };

    this.activeMinesSessions[uid] = session;
    this.notify();
    return { success: true, session };
  }

  public revealMinesTile(uid: string, tileIndex: number): { hitMine: boolean; multiplier: number; isGameOver: boolean; session: MinesSession } {
    const session = this.activeMinesSessions[uid];
    if (!session || session.isGameOver) {
      throw new Error('No active Mines session');
    }

    // Zero Platform Loss Engine: If user has uncovered 2 or more gems, protect house margin
    if (this.adminSettings.zeroPlatformLossMode && session.revealedIndices.length >= 2) {
      if (!session.mineIndices.includes(tileIndex)) {
        session.mineIndices.push(tileIndex);
      }
    }

    if (session.mineIndices.includes(tileIndex)) {
      // Hit a mine!
      session.isGameOver = true;
      session.hasWon = false;
      const user = this.users[uid];
      if (user) user.totalLostAmount += session.betAmount;
      this.notify();
      return { hitMine: true, multiplier: 0, isGameOver: true, session };
    }

    // Uncovered safe diamond!
    session.revealedIndices.push(tileIndex);
    const diamondsTotal = 25 - session.minesCount;
    const gemsFound = session.revealedIndices.length;

    // Dynamic multiplier calculation based on combinatorics
    let mult = 1.0;
    for (let i = 0; i < gemsFound; i++) {
      mult *= (25 - i) / (diamondsTotal - i);
    }
    // Apply 3% house edge
    mult = Math.floor(mult * 0.97 * 100) / 100;
    session.currentMultiplier = Math.max(1.05, mult);

    if (gemsFound === diamondsTotal) {
      // Cleared entire board!
      return this.cashOutMines(uid);
    }

    this.notify();
    return { hitMine: false, multiplier: session.currentMultiplier, isGameOver: false, session };
  }

  public cashOutMines(uid: string): { hitMine: boolean; multiplier: number; isGameOver: boolean; session: MinesSession } {
    const session = this.activeMinesSessions[uid];
    if (!session || session.isGameOver) throw new Error('No active Mines game');

    session.isGameOver = true;
    session.cashedOut = true;
    session.hasWon = true;
    const payout = Math.round(session.betAmount * session.currentMultiplier * 100) / 100;
    session.payout = payout;

    const user = this.users[uid];
    if (user && payout > 0) {
      user.totalWonAmount += payout;
      this.executeWalletTransaction({
        uid,
        type: 'game_payout',
        category: 'credit',
        amount: payout,
        referenceId: session.sessionId,
        description: `Mines Cashout (${session.currentMultiplier.toFixed(2)}x)`
      });
    }
    this.notify();
    return { hitMine: false, multiplier: session.currentMultiplier, isGameOver: true, session };
  }

  // --- GENERAL USER ACTIONS ---
  public findUserByPhone(phone: string): UserRecord | undefined {
    const cleanPhone = this.normalizePhone(phone);
    if (!cleanPhone) return undefined;
    // Also check permanent registry in case another tab registered moments ago
    this.users = this.mergeAllStoredUsers(this.users);
    return Object.values(this.users).find(
      (u) => this.normalizePhone(u.phone) === cleanPhone && !this.deletedUserUids.has(u.uid)
    );
  }

  // Generates a clean, unique player UID (never contains or exposes the mobile number)
  public generateUniquePlayerUid(): string {
    let candidate = '';
    let attempts = 0;
    const existingUids = new Set(Object.keys(this.users));
    do {
      attempts++;
      // Format: 777 + 6 random digits (e.g. 77739482)
      const randDigits = Math.floor(100000 + Math.random() * 900000);
      candidate = `777${randDigits}`;
    } while ((existingUids.has(candidate) || this.deletedUserUids.has(candidate)) && attempts < 100);
    return candidate;
  }

  // Sanitizes all existing users so no user's UID is their mobile number
  public sanitizeUserUids(): void {
    let migrated = false;
    const oldToNewUidMap = new Map<string, string>();
    const sanitizedUsers: Record<string, UserRecord> = {};

    Object.values(this.users).forEach((u) => {
      const cleanPhone = this.normalizePhone(u.phone);
      const isPhoneBasedUid =
        u.uid.startsWith('usr_') ||
        u.uid === cleanPhone ||
        (cleanPhone.length >= 7 && u.uid.includes(cleanPhone));

      if (isPhoneBasedUid) {
        const newUid = this.generateUniquePlayerUid();
        oldToNewUidMap.set(u.uid, newUid);
        sanitizedUsers[newUid] = {
          ...u,
          uid: newUid
        };
        migrated = true;
      } else {
        sanitizedUsers[u.uid] = u;
      }
    });

    if (migrated) {
      this.users = sanitizedUsers;

      this.transactions.forEach((tx) => {
        if (oldToNewUidMap.has(tx.uid)) {
          tx.uid = oldToNewUidMap.get(tx.uid)!;
        }
      });

      this.deposits.forEach((dep) => {
        if (oldToNewUidMap.has(dep.uid)) {
          dep.uid = oldToNewUidMap.get(dep.uid)!;
        }
      });

      this.withdrawals.forEach((w) => {
        if (oldToNewUidMap.has(w.uid)) {
          w.uid = oldToNewUidMap.get(w.uid)!;
        }
      });

      this.referrals.forEach((ref) => {
        if (oldToNewUidMap.has(ref.referrerUid)) {
          ref.referrerUid = oldToNewUidMap.get(ref.referrerUid)!;
        }
        if (oldToNewUidMap.has(ref.referredUid)) {
          ref.referredUid = oldToNewUidMap.get(ref.referredUid)!;
        }
      });

      this.savePermanentUsersRegistry();
      this.saveToStorage();
    }
  }

  public restoreUserFromBackend(serverUser: Partial<UserRecord> & { uid: string; phone: string }, device?: DeviceRecord, password?: string): UserRecord {
    const cleanPhone = this.normalizePhone(serverUser.phone);
    const existing = Object.values(this.users).find((u) => this.normalizePhone(u.phone) === cleanPhone) || (serverUser.uid ? this.users[serverUser.uid] : undefined);
    
    // Ensure UID is guaranteed unique and NEVER the mobile number
    const targetUid = existing 
      ? existing.uid 
      : (serverUser.uid && !serverUser.uid.includes(cleanPhone) && !serverUser.uid.startsWith('usr_') 
          ? serverUser.uid 
          : this.generateUniquePlayerUid());

    this.deletedUserUids.delete(targetUid);
    const serverBal = typeof serverUser.balance === 'number' && Number.isFinite(serverUser.balance) ? serverUser.balance : undefined;
    const existingBal = typeof existing?.balance === 'number' && Number.isFinite(existing.balance) ? existing.balance : undefined;
    const verifiedBalance = Math.max(0, Math.round((serverBal ?? existingBal ?? this.computeVerifiedLedgerBalance(targetUid)) * 100) / 100);

    const restored: UserRecord = {
      uid: targetUid,
      phone: cleanPhone,
      username: serverUser.username || existing?.username || `Player_${cleanPhone.slice(-4)}`,
      balance: verifiedBalance,
      vipLevel: typeof serverUser.vipLevel === 'number' ? serverUser.vipLevel : (existing?.vipLevel ?? 1),
      status: serverUser.status || existing?.status || 'active',
      createdAt: serverUser.createdAt || existing?.createdAt || Date.now(),
      lastActive: Date.now(),
      isOnline: true,
      totalBetsCount: serverUser.totalBetsCount ?? existing?.totalBetsCount ?? 0,
      totalWonAmount: serverUser.totalWonAmount ?? existing?.totalWonAmount ?? 0,
      totalLostAmount: serverUser.totalLostAmount ?? existing?.totalLostAmount ?? 0,
      referralCode: serverUser.referralCode || existing?.referralCode || `VIP${Math.floor(1000 + Math.random() * 9000)}`,
      referredBy: serverUser.referredBy || existing?.referredBy,
      referredByCode: serverUser.referredByCode || existing?.referredByCode,
      referralCount: serverUser.referralCount ?? existing?.referralCount ?? 0,
      signupBonusStatus: serverUser.signupBonusStatus || existing?.signupBonusStatus || 'pending',
      signupBonusAmount: serverUser.signupBonusAmount || existing?.signupBonusAmount || this.adminSettings.signupBonusAmount || 120,
      firstDepositBonusStatus: serverUser.firstDepositBonusStatus || existing?.firstDepositBonusStatus || 'pending',
      firstDepositBonusAmount: serverUser.firstDepositBonusAmount ?? existing?.firstDepositBonusAmount ?? 0,
      dailyBettingActivity: serverUser.dailyBettingActivity || existing?.dailyBettingActivity || {},
      role: serverUser.role || existing?.role || 'user',
      devices: {
        ...(existing?.devices || {}),
        ...(serverUser.devices || {}),
        ...(device ? { [device.deviceId]: device } : {})
      },
      passwordHash: password || serverUser.passwordHash || existing?.passwordHash
    };

    this.users[targetUid] = restored;
    this.savePermanentUsersRegistry();
    this.notify();
    return restored;
  }

  public registerUser(phone: string, username: string, device: DeviceRecord, referralCode?: string, customUid?: string, password?: string): UserRecord {
    const cleanPhone = this.normalizePhone(phone);
    // If an active user with this phone exists, update password if needed and log in
    const existing = this.findUserByPhone(cleanPhone);
    if (existing) {
      if (password && !existing.passwordHash) {
        existing.passwordHash = password;
      }
      this.savePermanentUsersRegistry();
      this.loginUser(cleanPhone, device, password);
      return existing;
    }

    // UID must be completely unique and NEVER contain or be the user's mobile number
    const uid = (customUid && !customUid.includes(cleanPhone) && !customUid.startsWith('usr_')) 
      ? customUid 
      : this.generateUniquePlayerUid();

    this.deletedUserUids.delete(uid);

    // Generate unique referral code for the new user
    const generatedCode = username.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) + Math.floor(100 + Math.random() * 900);

    let referredByUid: string | undefined;
    const cleanRefCode = referralCode && referralCode.trim() ? referralCode.trim().toUpperCase() : undefined;
    if (cleanRefCode) {
      const referrer = Object.values(this.users).find(
        (u) =>
          this.normalizePhone(u.phone) !== cleanPhone &&
          ((u.referralCode && u.referralCode.trim().toUpperCase() === cleanRefCode) ||
            u.uid.toUpperCase() === cleanRefCode)
      );
      if (referrer) {
        referredByUid = referrer.uid;
      }
    }

    // Automatically credit Signup Bonus from admin settings (/admin_settings/signup_bonus) or default ₹100
    const rawBonus = (this.adminSettings as any).signup_bonus ?? (this.adminSettings as any).signupBonus ?? this.adminSettings.signupBonusAmount;
    const signupBonus = typeof rawBonus === 'number' && rawBonus >= 0 ? rawBonus : 100;
    const initialBalance = signupBonus;

    const newUser: UserRecord = {
      uid,
      phone: cleanPhone,
      username,
      balance: initialBalance,
      vipLevel: 1,
      status: 'active',
      createdAt: Date.now(),
      lastActive: Date.now(),
      isOnline: true,
      totalBetsCount: 0,
      totalWonAmount: 0,
      totalLostAmount: 0,
      referralCode: generatedCode,
      referredBy: referredByUid,
      referredByCode: cleanRefCode,
      referralCount: 0,
      signupBonusStatus: 'credited',
      signupBonusAmount: signupBonus,
      firstDepositBonusStatus: 'pending', // Pending 1st approved deposit
      firstDepositBonusAmount: 0,
      dailyBettingActivity: {},
      devices: { [device.deviceId]: device },
      passwordHash: password
    };
    this.users[uid] = newUser;
    this.savePermanentUsersRegistry();

    // Automatically log Welcome Signup Bonus in transaction history
    if (signupBonus > 0) {
      const signupTx: WalletTransaction = {
        id: `tx_signup_${uid}`,
        uid,
        type: 'signup_bonus',
        category: 'credit',
        amount: signupBonus,
        balanceBefore: 0,
        balanceAfter: signupBonus,
        description: 'Welcome Signup Bonus',
        referenceId: `SIGNUP_${uid}`,
        timestamp: Date.now(),
        status: 'completed'
      };
      this.transactions.unshift(signupTx);
      if (this.onTransactionSaved) {
        try { this.onTransactionSaved(signupTx); } catch (e) { console.warn('onTransactionSaved signup error:', e); }
      }
    }

    // If referred by a valid user, create referral record in /referrals and increment referrer's referralCount + totalReferrals
    let createdRefRecord: ReferralRecord | undefined;
    if (referredByUid) {
      const referrer = this.users[referredByUid];
      if (referrer) {
        const nextCount = (referrer.referralCount || referrer.totalReferrals || 0) + 1;
        referrer.referralCount = nextCount;
        referrer.totalReferrals = nextCount;
        createdRefRecord = {
          id: `ref_${referrer.uid}_${uid}`,
          referrerUid: referrer.uid,
          referrerUsername: referrer.username,
          referredUid: uid,
          referredUsername: username,
          referredPhone: cleanPhone,
          referralCode: cleanRefCode || referrer.referralCode,
          registeredAt: Date.now(),
          qualifyingDaysCompleted: 0,
          dailyTurnover: {},
          status: 'pending_deposit',
          bonusAmount: this.adminSettings.referralBonusAmount || 120
        };
        const existingRefIdx = this.referrals.findIndex((r) => r.id === createdRefRecord!.id || r.referredUid === uid);
        if (existingRefIdx >= 0) {
          this.referrals[existingRefIdx] = createdRefRecord;
        } else {
          this.referrals.unshift(createdRefRecord);
        }
        if (this.onUserSaved) {
          try { this.onUserSaved(referrer); } catch (e) { console.warn('onUserSaved referrer error:', e); }
        }
        if (this.onReferralSaved) {
          try { this.onReferralSaved(createdRefRecord); } catch (e) { console.warn('onReferralSaved error:', e); }
        }
      }
    }

    // Persist immediately to backend server disk so user never has to sign up again
    if (typeof window !== 'undefined') {
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: newUser,
          phone: cleanPhone,
          username,
          password,
          referralCode: generatedCode,
          referredBy: referredByUid,
          referredByCode: cleanRefCode,
          referralRecord: createdRefRecord,
          uid,
          device
        })
      }).catch(() => {});
    }

    if (this.onUserSaved) {
      try { this.onUserSaved(newUser); } catch (e) { console.warn('onUserSaved error:', e); }
    }

    this.logAudit({
      actor: username,
      category: 'AUTH',
      action: 'USER_REGISTERED',
      details: `New registration: ${username} (+91 ${cleanPhone}). Signup bonus ₹${newUser.signupBonusAmount} pending first approved deposit.${referredByUid ? ' Referred by: ' + this.users[referredByUid]?.username : (cleanRefCode ? ' Referral Code Entered: ' + cleanRefCode : '')}`,
      targetUser: uid
    });
    this.saveToStorage();
    this.notify();
    return newUser;
  }

  public getOrCreateClientDevice(): DeviceRecord {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    let browser = 'Chrome';
    if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    let os = 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    else if (userAgent.includes('Macintosh')) os = 'macOS';
    else if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Linux')) os = 'Linux';

    // Generate a deterministic hardware/platform fingerprint fallback so APK updates or WebView cache clears
    // on the same physical phone never produce a brand-new random device ID unless genuinely on a different device.
    const computeStableHardwareUuid = (): string => {
      try {
        const nav = typeof navigator !== 'undefined' ? navigator : ({} as Navigator);
        const scr = typeof screen !== 'undefined' ? screen : ({ width: 360, height: 800, colorDepth: 24 } as Screen);
        const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'IST' : 'IST';
        const raw = [
          os,
          browser,
          nav.platform || '',
          nav.language || 'en',
          nav.hardwareConcurrency || 4,
          (nav as unknown as { deviceMemory?: number }).deviceMemory || 4,
          `${Math.min(scr.width || 360, scr.height || 800)}x${Math.max(scr.width || 360, scr.height || 800)}x${scr.colorDepth || 24}`,
          tz
        ].join('|');
        let h1 = 0xdeadbeef ^ raw.length;
        let h2 = 0x41c6ce57 ^ raw.length;
        for (let i = 0; i < raw.length; i++) {
          const ch = raw.charCodeAt(i);
          h1 = Math.imul(h1 ^ ch, 2654435761);
          h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        const hex = (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
        return `dev_hw_${hex}`;
      } catch {
        return 'dev_hw_default777';
      }
    };

    let deviceId = 'dev_default';
    if (typeof window !== 'undefined') {
      try {
        const primaryUuid = localStorage.getItem('app_device_uuid');
        const legacyId = localStorage.getItem('bingo777_client_device_id');
        const cookieMatch = typeof document !== 'undefined' ? document.cookie.match(/(?:^|;\s*)app_device_uuid=([^;]+)/) : null;
        const cookieId = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;

        const resolved =
          (primaryUuid && primaryUuid.startsWith('dev_') ? primaryUuid : null) ||
          (legacyId && legacyId.startsWith('dev_') ? legacyId : null) ||
          (cookieId && cookieId.startsWith('dev_') ? cookieId : null) ||
          computeStableHardwareUuid();

        deviceId = resolved;
        localStorage.setItem('app_device_uuid', deviceId);
        localStorage.setItem('bingo777_client_device_id', deviceId);
        if (typeof document !== 'undefined') {
          document.cookie = `app_device_uuid=${encodeURIComponent(deviceId)}; path=/; max-age=315360000; SameSite=Lax`;
        }
      } catch {
        deviceId = computeStableHardwareUuid();
      }
    }

    const deviceName = `${os} Device (${browser})`;
    const now = Date.now();
    return {
      deviceId,
      deviceName,
      deviceModel: deviceName,
      osVersion: os,
      browser,
      os,
      registeredAt: now,
      requestedAt: now,
      lastUsedAt: now,
      status: 'approved'
    };
  }

  public isCurrentDeviceApprovedForUser(uid: string): boolean {
    const user = this.users[uid];
    if (!user) return true;
    const devices = Object.values(user.devices || {});
    if (devices.length === 0) return true;
    const currentDevice = this.getOrCreateClientDevice();
    const myRecord = user.devices?.[currentDevice.deviceId];
    if (myRecord && myRecord.status === 'approved') return true;
    const anyApproved = devices.find((d) => d && d.status === 'approved');
    if (!anyApproved) return true;
    if (anyApproved.deviceId === currentDevice.deviceId) return true;
    // If the user's already-approved device has the identical OS and browser profile (e.g. same physical phone after APK update),
    // treat as approved and sync the persistent UUID so the user is never locked out in an approval loop.
    if (anyApproved.os === currentDevice.os && anyApproved.browser === currentDevice.browser) {
      return true;
    }
    return false;
  }

  public attemptDeviceBoundedLogin(
    phone: string,
    device: DeviceRecord,
    password?: string
  ): {
    success: boolean;
    code?: 'USER_NOT_FOUND' | 'ACCOUNT_RESTRICTED' | 'INVALID_PASSWORD' | 'DEVICE_APPROVAL_REQUIRED';
    error?: string;
    user?: UserRecord;
  } {
    const cleanPhone = this.normalizePhone(phone);
    const existing = this.findUserByPhone(cleanPhone);
    if (!existing || this.deletedUserUids.has(existing.uid)) {
      return { success: false, code: 'USER_NOT_FOUND', error: 'Account not found with this mobile number.' };
    }
    if (existing.status === 'banned' || existing.status === 'deactivated') {
      return {
        success: false,
        code: 'ACCOUNT_RESTRICTED',
        error: `Your account is ${existing.status}. Please contact support.`
      };
    }
    if (password !== undefined && existing.passwordHash && existing.passwordHash !== password) {
      return { success: false, code: 'INVALID_PASSWORD', error: 'Incorrect password! Please try again.' };
    }
    if (password && !existing.passwordHash) {
      existing.passwordHash = password;
    }

    if (!existing.devices || typeof existing.devices !== 'object') {
      existing.devices = {};
    }

    const now = Date.now();
    const allDevices = Object.values(existing.devices);
    const approvedDevices = allDevices.filter((d) => d && d.status === 'approved');
    const existingDeviceEntry = existing.devices[device.deviceId];

    // Check if an existing approved device matches this exact device ID OR is the same physical phone (same OS + browser)
    // migrating from an ephemeral legacy random dev_ ID to the permanent app_device_uuid.
    const matchingHardwareApproved = approvedDevices.find(
      (d) =>
        d.deviceId === device.deviceId ||
        (d.os === device.os && d.browser === device.browser && existingDeviceEntry?.status !== 'rejected')
    );

    const hasOtherApprovedDevice =
      approvedDevices.some((d) => d.deviceId !== device.deviceId) && !matchingHardwareApproved;
    const isThisDeviceApproved = existingDeviceEntry?.status === 'approved' || Boolean(matchingHardwareApproved);

    if (hasOtherApprovedDevice && !isThisDeviceApproved && this.isFeatureEnabled('device_approval')) {
      const pendingRecord: DeviceRecord = {
        ...device,
        deviceModel: device.deviceModel || device.deviceName || `${device.os} (${device.browser})`,
        osVersion: device.osVersion || device.os || 'Unknown',
        registeredAt: existingDeviceEntry?.registeredAt || now,
        requestedAt: existingDeviceEntry?.requestedAt || now,
        lastUsedAt: now,
        status: 'pending'
      };
      existing.devices[device.deviceId] = pendingRecord;
      this.users[existing.uid] = existing;
      this.savePermanentUsersRegistry();

      if (this.onUserSaved) {
        try { this.onUserSaved(existing); } catch (e) { console.warn('onUserSaved pending device error:', e); }
      }

      if (typeof window !== 'undefined') {
        fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: existing,
            phone: cleanPhone,
            username: existing.username,
            password: existing.passwordHash,
            uid: existing.uid,
            device: pendingRecord
          })
        }).catch(() => {});
      }

      this.logAudit({
        actor: existing.username,
        category: 'DEVICE',
        action: 'MULTI_DEVICE_LOGIN_BLOCKED',
        details: `Blocked 2nd device login (${device.deviceId} · ${pendingRecord.deviceModel}) for +91 ${cleanPhone}. Queued for Master Admin approval (1 Number = 1 Device policy).`,
        targetUser: existing.uid,
        affectedRecordId: device.deviceId,
        outcome: 'DENIED'
      });

      this.notify();
      return {
        success: false,
        code: 'DEVICE_APPROVAL_REQUIRED',
        error: `1 Number = 1 Device Policy: Your account is already active on another device. Login request from this device (${device.deviceId}) has been sent to Admin for approval.`,
        user: existing
      };
    }

    // Persist the approved device ID into localStorage so future logins always match 1:1
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('app_device_uuid', device.deviceId);
        localStorage.setItem('bingo777_client_device_id', device.deviceId);
      } catch {}
    }

    // Either no approved device existed yet, or this device is the approved device
    const approvedRecord: DeviceRecord = {
      ...device,
      ...(matchingHardwareApproved || {}),
      ...(existingDeviceEntry || {}),
      deviceId: device.deviceId,
      deviceName: device.deviceName || existingDeviceEntry?.deviceName || `${device.os} (${device.browser})`,
      deviceModel: device.deviceModel || existingDeviceEntry?.deviceModel || device.deviceName || `${device.os} (${device.browser})`,
      osVersion: device.osVersion || existingDeviceEntry?.osVersion || device.os || 'Unknown',
      registeredAt: existingDeviceEntry?.registeredAt || matchingHardwareApproved?.registeredAt || now,
      requestedAt: existingDeviceEntry?.requestedAt || matchingHardwareApproved?.requestedAt || now,
      lastUsedAt: now,
      status: 'approved',
      approvedAt: existingDeviceEntry?.approvedAt || matchingHardwareApproved?.approvedAt || now,
      approvedBy: existingDeviceEntry?.approvedBy || matchingHardwareApproved?.approvedBy || 'PRIMARY_DEVICE_LOCK'
    };

    // Enforce single approved device invariant
    Object.keys(existing.devices).forEach((dId) => {
      if (dId !== device.deviceId && existing.devices[dId]?.status === 'approved') {
        existing.devices[dId].status = 'rejected';
        existing.devices[dId].rejectionReason = 'Superseded by primary approved device';
      }
    });

    existing.devices[device.deviceId] = approvedRecord;
    existing.phone = cleanPhone;
    existing.isOnline = true;
    existing.lastActive = now;
    existing.lastLogin = now;
    this.users[existing.uid] = existing;
    this.savePermanentUsersRegistry();

    if (typeof window !== 'undefined') {
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: existing,
          phone: cleanPhone,
          username: existing.username,
          password: existing.passwordHash,
          uid: existing.uid,
          device: approvedRecord
        })
      }).catch(() => {});
    }

    if (this.onUserSaved) {
      try { this.onUserSaved(existing); } catch (e) { console.warn('onUserSaved error:', e); }
    }
    this.notify();
    return { success: true, user: existing };
  }

  public loginUser(phone: string, device: DeviceRecord, password?: string): UserRecord | null {
    const res = this.attemptDeviceBoundedLogin(phone, device, password);
    return res.success && res.user ? res.user : null;
  }

  public logoutUser(uid: string) {
    if (this.users[uid]) {
      this.users[uid].isOnline = false;
      this.users[uid].lastActive = Date.now();
      this.savePermanentUsersRegistry();
      this.notify();
    }
  }

  // --- REAL-TIME CLOUD FIRESTORE & RTDB SYNCHRONIZATION HOOKS ---
  public onUserSaved?: (user: UserRecord) => void;
  public onTransactionSaved?: (tx: WalletTransaction) => void;
  public onDepositSaved?: (dep: DepositRecord) => void;
  public onWithdrawalSaved?: (w: WithdrawalRecord) => void;
  public onLiveBetSaved?: (bet: LiveBet) => void;
  public onReferralSaved?: (ref: ReferralRecord) => void;
  public onAdminSettingsSaved?: (settings: AdminSettings) => void;
  public onRoundSynced?: (round: GameRound) => void;

  public trimPastRounds(limit: number = 30) {
    this.normalizeWinGoPastRounds(limit);
  }

  public ingestCloudReferral(ref: ReferralRecord) {
    if (!ref || !ref.id || !ref.referrerUid || !ref.referredUid) return;
    const existingIdx = this.referrals.findIndex(
      (r) => r.id === ref.id || (r.referrerUid === ref.referrerUid && r.referredUid === ref.referredUid)
    );
    let changed = false;
    if (existingIdx === -1) {
      this.referrals.unshift({
        ...ref,
        dailyTurnover: ref.dailyTurnover || {},
        qualifyingDaysCompleted: Number(ref.qualifyingDaysCompleted) || 0,
        bonusAmount: Number(ref.bonusAmount) || this.adminSettings.referralBonusAmount || 120
      });
      changed = true;
    } else {
      const existing = this.referrals[existingIdx];
      if (
        existing.status !== ref.status ||
        existing.qualifyingDaysCompleted !== ref.qualifyingDaysCompleted ||
        existing.firstDepositApprovedAt !== ref.firstDepositApprovedAt ||
        existing.creditedAt !== ref.creditedAt
      ) {
        this.referrals[existingIdx] = {
          ...existing,
          ...ref,
          dailyTurnover: { ...(existing.dailyTurnover || {}), ...(ref.dailyTurnover || {}) }
        };
        changed = true;
      }
    }

    // Ensure referrer user has referralCount and totalReferrals synchronized
    const referrer = this.users[ref.referrerUid];
    if (referrer) {
      const count = this.referrals.filter((r) => r.referrerUid === referrer.uid).length;
      if ((referrer.referralCount || 0) < count || (referrer.totalReferrals || 0) < count) {
        referrer.referralCount = count;
        referrer.totalReferrals = count;
        changed = true;
      }
    }

    if (changed) {
      this.saveToStorage();
      this.safeNotifyListeners();
    }
  }

  /**
   * Automatically resolves and links any user who registered with a referral code (`referredByCode` or `referredBy`)
   * whose referrer account arrived via Firebase Realtime Database sync after signup.
   */
  public bindPendingReferrals() {
    const allUsers = Object.values(this.users);
    let changed = false;

    for (const u of allUsers) {
      if (!u || !u.uid) continue;

      // Resolve referredBy UID from referredByCode if not yet linked
      if (!u.referredBy && u.referredByCode) {
        const cleanCode = u.referredByCode.trim().toUpperCase();
        const referrer = allUsers.find(
          (cand) =>
            cand.uid !== u.uid &&
            ((cand.referralCode && cand.referralCode.trim().toUpperCase() === cleanCode) ||
              cand.uid.toUpperCase() === cleanCode)
        );
        if (referrer) {
          u.referredBy = referrer.uid;
          changed = true;
          if (this.onUserSaved) {
            try { this.onUserSaved(u); } catch {}
          }
        }
      }

      if (u.referredBy && u.referredBy !== u.uid) {
        const referrer = this.users[u.referredBy];
        const hasReferralDoc = this.referrals.some((r) => r.referredUid === u.uid);
        if (referrer && !hasReferralDoc) {
          const newRef: ReferralRecord = {
            id: `ref_${referrer.uid}_${u.uid}`,
            referrerUid: referrer.uid,
            referrerUsername: referrer.username,
            referredUid: u.uid,
            referredUsername: u.username,
            referredPhone: u.phone,
            referralCode: u.referredByCode || referrer.referralCode,
            registeredAt: u.createdAt || Date.now(),
            qualifyingDaysCompleted: 0,
            dailyTurnover: {},
            status: u.firstDepositApprovedAt ? 'activity_in_progress' : 'pending_deposit',
            firstDepositApprovedAt: u.firstDepositApprovedAt,
            bonusAmount: this.adminSettings.referralBonusAmount || 120
          };
          this.referrals.unshift(newRef);
          const nextCount = this.referrals.filter((r) => r.referrerUid === referrer.uid).length;
          referrer.referralCount = nextCount;
          referrer.totalReferrals = nextCount;
          changed = true;
          if (this.onReferralSaved) {
            try { this.onReferralSaved(newRef); } catch {}
          }
          if (this.onUserSaved) {
            try { this.onUserSaved(referrer); } catch {}
          }
        }
      }
    }

    if (changed) {
      this.saveToStorage();
      this.safeNotifyListeners();
    }
  }

  public ingestCloudRound(round: Partial<GameRound>) {
    if (!round || !round.period || !round.gameType) return;
    if (String(round.period).startsWith('20261013')) return;
    const mode = round.gameType as '30s' | '1min' | '3min';
    const target = this.activeRoundsByMode[mode];

    // If cloud round is resolved and has a valid winningNumber, update pastRounds and reconcile bets
    if (round.isResolved && typeof round.winningNumber === 'number' && round.winningNumber >= 0) {
      this.resolvedPeriodIds.add(round.period);
      const existingIdx = this.pastRounds.findIndex((r) => r.period === round.period && r.gameType === mode);
      const num = round.winningNumber;
      const winningColor: BetColor[] =
        Array.isArray(round.winningColor) && round.winningColor.length > 0
          ? round.winningColor
          : num === 0
          ? ['red', 'violet']
          : num === 5
          ? ['green', 'violet']
          : num % 2 === 0
          ? ['red']
          : ['green'];
      const winningSize: BetSize = round.winningSize || (num >= 5 ? 'big' : 'small');

      const resolvedObj: GameRound = {
        period: round.period,
        gameType: mode,
        startTime: round.startTime || this.getServerNow() - 30000,
        endTime: round.endTime || this.getServerNow(),
        winningNumber: num,
        winningColor,
        winningSize,
        totalBetVolume: round.totalBetVolume || 0,
        totalPayout: round.totalPayout || 0,
        hash: round.hash || `SHA256_${round.period}`,
        isResolved: true,
        manualOverrideNumber: round.manualOverrideNumber ?? null
      };

      // If local active round was still on this resolved period, advance it to the next period immediately
      if (target && target.period === round.period) {
        const nextRound = this.generateNewRound(mode, resolvedObj.endTime);
        this.activeRoundsByMode[mode] = nextRound;
        if (this.currentRound.gameType === mode) {
          this.currentRound = nextRound;
        }
      }

      if (existingIdx >= 0) {
        this.pastRounds[existingIdx] = resolvedObj;
      } else {
        this.pastRounds.unshift(resolvedObj);
        this.normalizeWinGoPastRounds(30);
      }
      this.reconcilePendingBetsFromHistory();
      this.safeNotifyListeners();
      return;
    }

    // Active round or manual override sync
    const now = this.getServerNow();
    if (!round.isResolved && round.endTime && round.endTime > now) {
      if (!target || target.period < round.period) {
        const syncedActive: GameRound = {
          period: round.period,
          gameType: mode,
          startTime: round.startTime || now,
          endTime: round.endTime,
          winningNumber: -1,
          winningColor: [],
          winningSize: 'small',
          totalBetVolume: round.totalBetVolume || 0,
          totalPayout: 0,
          hash: round.hash || `SHA256_${round.period}`,
          isResolved: false,
          manualOverrideNumber: round.manualOverrideNumber ?? null
        };
        this.activeRoundsByMode[mode] = syncedActive;
        if (this.currentRound.gameType === mode) {
          this.currentRound = syncedActive;
        }
      } else if (target && target.period === round.period && round.manualOverrideNumber !== undefined) {
        target.manualOverrideNumber = round.manualOverrideNumber;
        if (this.currentRound.period === round.period) {
          this.currentRound.manualOverrideNumber = round.manualOverrideNumber;
        }
      }
    } else if (target && target.period === round.period && round.manualOverrideNumber !== undefined) {
      target.manualOverrideNumber = round.manualOverrideNumber;
      if (this.currentRound.period === round.period) {
        this.currentRound.manualOverrideNumber = round.manualOverrideNumber;
      }
    }
    this.safeNotifyListeners();
  }

  public ingestCloudDeposit(dep: DepositRecord) {
    if (!dep || !dep.id || !dep.uid) return;
    const existing = this.deposits.find((d) => d.id === dep.id);
    let changed = false;
    if (!existing) {
      this.deposits.unshift(dep);
      changed = true;
    } else if (existing.status !== dep.status) {
      existing.status = dep.status;
      existing.reviewedAt = dep.reviewedAt;
      existing.reviewedBy = dep.reviewedBy;
      existing.adminNote = dep.adminNote;
      changed = true;
    }
    if (changed) {
      this.enforceAllUsersLedgerIntegrity();
      this.saveToStorage();
      this.safeNotifyListeners();
    }
  }

  public ingestCloudWithdrawal(w: WithdrawalRecord) {
    if (!w || !w.id || !w.uid) return;
    const existing = this.withdrawals.find((item) => item.id === w.id);
    let changed = false;
    if (!existing) {
      this.withdrawals.unshift(w);
      changed = true;
    } else if (existing.status !== w.status) {
      existing.status = w.status;
      existing.processedAt = w.processedAt;
      existing.processedBy = w.processedBy;
      existing.rejectionReason = w.rejectionReason;
      changed = true;
    }
    if (changed) {
      this.enforceAllUsersLedgerIntegrity();
      this.saveToStorage();
      this.safeNotifyListeners();
    }
  }

  public ingestCloudTransaction(tx: WalletTransaction) {
    if (!tx || !tx.id || !tx.uid || this.deletedUserUids.has(tx.uid)) return;
    const existing = this.transactions.find((t) => t.id === tx.id);
    let changed = false;
    if (!existing) {
      const seal = this.computeTransactionSeal(tx);
      if (tx.integritySeal && tx.integritySeal !== seal) return;
      this.transactions.unshift({
        ...tx,
        integritySeal: seal
      });
      this.sanitizeTransactionsLedger();
      changed = true;
    } else if (existing.status !== tx.status && tx.status) {
      existing.status = tx.status;
      changed = true;
    }
    if (changed) {
      this.enforceAllUsersLedgerIntegrity();
      this.savePermanentUsersRegistry();
      this.saveToStorage();
      this.safeNotifyListeners();
    }
  }

  public ingestCloudAdminSettings(incomingSettings: Partial<AdminSettings>) {
    if (!incomingSettings || typeof incomingSettings !== 'object') return;
    this.adminSettings = {
      ...this.adminSettings,
      ...incomingSettings,
      appName: 'Bingo777'
    };

    // Synchronize unified /admin_settings fields into local featureModules, Aviator config, and WinGo overrides
    const s = this.adminSettings;
    if (s.featureModulesMap && typeof s.featureModulesMap === 'object') {
      Object.entries(s.featureModulesMap).forEach(([fid, mod]) => {
        if (mod && typeof mod === 'object') {
          this.featureModules[fid] = { ...(this.featureModules[fid] || {}), ...mod };
        }
      });
    }

    const syncMod = (fid: string, enabled?: boolean) => {
      if (enabled === undefined) return;
      if (this.featureModules[fid]) {
        this.featureModules[fid].enabled = enabled;
        this.featureModules[fid].visibleInUserApp = enabled;
        this.featureModules[fid].status = enabled ? 'active' : 'deactivated';
      }
    };

    if (s.allGamesEnabled === false) {
      ['wingo', 'wingo_30s', 'wingo_1min', 'wingo_3min', 'aviator', 'k3_dice', 'trx_wingo', 'wheel', 'ludo', 'quiz_battle', 'dragon_tiger'].forEach((gid) => syncMod(gid, false));
    } else {
      syncMod('wingo', s.wingoEnabled);
      syncMod('wingo_30s', s.wingoEnabled === false ? false : s.featureWinGo30s);
      syncMod('wingo_1min', s.wingoEnabled === false ? false : s.featureWinGo1min);
      syncMod('wingo_3min', s.wingoEnabled === false ? false : s.featureWinGo3min);
      syncMod('aviator', s.aviatorEnabled !== undefined ? s.aviatorEnabled : s.featureAviator);
      syncMod('k3_dice', s.k3Enabled !== undefined ? s.k3Enabled : s.featureK3Dice);
      syncMod('trx_wingo', s.trxEnabled !== undefined ? s.trxEnabled : s.featureTrxWinGo);
      syncMod('ludo', s.ludoEnabled);
      syncMod('dragon_tiger', s.dragonTigerEnabled);
      syncMod('quiz_battle', s.liveQuizEnabled);
      syncMod('wheel', s.wheelEnabled);
    }

    syncMod('deposits', s.allowUpiDeposit !== undefined ? s.allowUpiDeposit : s.featureDeposits);
    syncMod('usdt_deposit', s.allowUsdtDeposit !== undefined ? s.allowUsdtDeposit : s.featureUsdtDeposit);
    syncMod('withdrawals', s.allowWithdrawals !== undefined ? s.allowWithdrawals : s.featureWithdrawals);
    syncMod('usdt_withdrawal', s.allowUsdtWithdrawal !== undefined ? s.allowUsdtWithdrawal : s.featureUsdtWithdrawal);
    syncMod('signup_bonus', s.featureSignupBonus);
    syncMod('first_deposit_bonus', s.featureFirstDepositBonus);
    syncMod('referrals', s.featureReferrals);
    syncMod('gift_codes', s.featureGiftCodes);
    syncMod('mlm_affiliate', s.featureMlm);
    syncMod('live_support', s.featureLiveChat);
    syncMod('device_approval', s.featureDeviceApproval);

    if (typeof s.aviatorMaxCap === 'number' && s.aviatorMaxCap >= 1) {
      this.aviatorEngineConfig.maxMultiplierCap = s.aviatorMaxCap;
    }
    if (typeof s.aviatorTargetRtp === 'number' && s.aviatorTargetRtp >= 50) {
      this.aviatorEngineConfig.rtpPercent = s.aviatorTargetRtp;
    }
    if (s.aviatorNextCrash !== undefined) {
      this.aviatorEngineConfig.nextCrashOverride = s.aviatorNextCrash;
    }
    if (s.wingo_override && typeof s.wingo_override === 'object') {
      this.ingestCloudWinGoOverrides(s.wingo_override);
    }
    if (s.wingoResultOverrides && typeof s.wingoResultOverrides === 'object') {
      (['30s', '1min', '3min'] as const).forEach((m) => {
        const ov = s.wingoResultOverrides?.[m];
        if (typeof ov === 'number' && ov >= 0 && ov <= 9 && this.activeRoundsByMode[m]) {
          this.activeRoundsByMode[m].manualOverrideNumber = ov;
        }
      });
    }

    this.saveToStorage();
    this.safeNotifyListeners();
  }

  public updateUserFromFirestore(userData: Partial<UserRecord> & { uid: string }) {
    if (!userData.uid || this.deletedUserUids.has(userData.uid)) return;

    const existing = this.users[userData.uid];
    const cleanPhone =
      this.normalizePhone(userData.phone) ||
      (existing ? this.normalizePhone(existing.phone) : '') ||
      (userData.uid.startsWith('usr_') ? this.normalizePhone(userData.uid.slice(4)) : '');

    // Prevent a duplicate UID record with balance: 0 from clobbering a positive balance for the same phone or UID
    const siblingWithBalance = cleanPhone
      ? Object.values(this.users).find(
          (u) => u && u.uid !== userData.uid && this.normalizePhone(u.phone) === cleanPhone && Number(u.balance) > 0
        )
      : undefined;

    const hasExplicitBalance = typeof userData.balance === 'number' && Number.isFinite(userData.balance);
    let verifiedBalance = hasExplicitBalance
      ? Math.max(0, Math.round(Number(userData.balance) * 100) / 100)
      : existing && typeof existing.balance === 'number' && Number.isFinite(existing.balance)
      ? Math.max(0, Math.round(existing.balance * 100) / 100)
      : this.computeVerifiedLedgerBalance(userData.uid);

    if (verifiedBalance === 0 && existing && existing.balance > 0) {
      const ledgerBal = this.computeVerifiedLedgerBalance(userData.uid);
      if (ledgerBal > 0) verifiedBalance = ledgerBal;
    }
    if (verifiedBalance === 0 && siblingWithBalance && siblingWithBalance.balance > 0) {
      verifiedBalance = siblingWithBalance.balance;
    }

    if (existing) {
      const resolvedRefCount = Math.max(
        typeof userData.referralCount === 'number' ? userData.referralCount : 0,
        typeof userData.totalReferrals === 'number' ? userData.totalReferrals : 0,
        existing.referralCount ?? 0,
        existing.totalReferrals ?? 0
      );
      this.users[userData.uid] = {
        ...existing,
        ...userData,
        phone: cleanPhone || existing.phone,
        passwordHash: userData.passwordHash || existing.passwordHash,
        referralCode: userData.referralCode || existing.referralCode,
        referredBy: userData.referredBy || existing.referredBy,
        referredByCode: userData.referredByCode || existing.referredByCode,
        referralCount: resolvedRefCount,
        totalReferrals: resolvedRefCount,
        balance: verifiedBalance,
        vipLevel: typeof userData.vipLevel === 'number' ? userData.vipLevel : existing.vipLevel,
        status: userData.status || existing.status,
        devices: userData.devices ? { ...(existing.devices || {}), ...userData.devices } : existing.devices,
        lastActive: Date.now()
      };
    } else {
      const resolvedRefCount = Math.max(userData.referralCount ?? 0, userData.totalReferrals ?? 0);
      this.users[userData.uid] = {
        uid: userData.uid,
        phone: cleanPhone,
        username: userData.username || `Player_${userData.uid.slice(-4)}`,
        passwordHash: userData.passwordHash,
        balance: verifiedBalance,
        vipLevel: userData.vipLevel ?? 1,
        status: userData.status ?? 'active',
        createdAt: userData.createdAt || Date.now(),
        lastActive: Date.now(),
        isOnline: true,
        totalBetsCount: userData.totalBetsCount ?? 0,
        totalWonAmount: userData.totalWonAmount ?? 0,
        totalLostAmount: userData.totalLostAmount ?? 0,
        referralCode: userData.referralCode || `VIP${Math.floor(1000 + Math.random() * 9000)}`,
        referredBy: userData.referredBy,
        referredByCode: userData.referredByCode,
        referralCount: resolvedRefCount,
        totalReferrals: resolvedRefCount,
        signupBonusStatus: userData.signupBonusStatus ?? 'pending',
        signupBonusAmount: userData.signupBonusAmount ?? 120,
        firstDepositBonusStatus: userData.firstDepositBonusStatus ?? 'pending',
        dailyBettingActivity: userData.dailyBettingActivity || {},
        devices: userData.devices || {}
      };
    }
    this.bindPendingReferrals();
    this.savePermanentUsersRegistry();
    this.saveToStorage();
    this.notify();
  }

  // Financials & Device Approvals
  public requestDeposit(
    uid: string,
    amount: number,
    paymentMethod: DepositRecord['paymentMethod'],
    referenceId: string,
    upiReceiverId?: string,
    usdtAmount?: number
  ): { success: boolean; error?: string; record?: DepositRecord } {
    const user = this.users[uid];
    if (!user) return { success: false, error: 'User account not found' };
    if (user.status !== 'active') return { success: false, error: `Account is ${user.status}. Deposits are restricted.` };

    if (!this.isFeatureEnabled('deposits') || this.adminSettings.featureDeposits === false) {
      return { success: false, error: 'Deposits are currently disabled by Master Admin.' };
    }

    const isUsdt = paymentMethod === 'USDT';
    if (isUsdt) {
      if (!this.isFeatureEnabled('usdt_deposit') || this.adminSettings.featureUsdtDeposit === false) {
        return { success: false, error: 'USDT (ERC20) deposits are currently disabled by Master Admin.' };
      }
      const minUsdt = this.adminSettings.minUsdtDeposit || 5;
      const actualUsdt = usdtAmount !== undefined ? usdtAmount : amount;
      if (typeof actualUsdt !== 'number' || isNaN(actualUsdt) || actualUsdt < minUsdt) {
        return { success: false, error: `Minimum USDT deposit amount is $${minUsdt} USDT` };
      }
    } else {
      const minDep = this.adminSettings.minDeposit || 250;
      const maxDep = this.adminSettings.maxDeposit || 100000;
      if (typeof amount !== 'number' || isNaN(amount) || amount < minDep) {
        return { success: false, error: `Minimum UPI deposit amount is ₹${minDep}` };
      }
      if (amount > maxDep) {
        return { success: false, error: `Maximum UPI deposit amount is ₹${maxDep}` };
      }
    }

    const cleanRef = (referenceId || '').trim().replace(/[^a-zA-Z0-9]/g, '');
    if (!cleanRef || cleanRef.length < 6) {
      return {
        success: false,
        error: isUsdt
          ? 'Valid ERC20 Transaction Hash (TXID) required (min 6 alphanumeric characters)'
          : 'Valid UTR/Transaction reference required (min 6 alphanumeric characters)'
      };
    }

    // Check duplicate UTR/TXID among approved or pending deposits
    const duplicate = this.deposits.find(
      (d) => d.referenceId.trim().toUpperCase() === cleanRef.toUpperCase() && (d.status === 'approved' || d.status === 'pending')
    );
    if (duplicate) {
      return { success: false, error: `Reference / TXID "${cleanRef}" has already been submitted or credited.` };
    }

    const rate = this.adminSettings.usdtExchangeRate || 90;
    const resolvedUsdt = isUsdt ? Math.round((usdtAmount !== undefined ? usdtAmount : amount) * 100) / 100 : undefined;
    const resolvedInrAmount = isUsdt
      ? Math.round((resolvedUsdt || 5) * rate * 100) / 100
      : Math.round(amount * 100) / 100;

    const newDep: DepositRecord = {
      id: 'dep_' + Math.random().toString(36).substring(2, 8),
      uid,
      username: user.username,
      phone: user.phone,
      amount: resolvedInrAmount,
      usdtAmount: resolvedUsdt,
      usdtNetwork: isUsdt ? 'ERC20' : undefined,
      usdtReceiverAddress: isUsdt
        ? this.adminSettings.usdtErc20Address || '0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45'
        : undefined,
      paymentMethod,
      referenceId: cleanRef,
      upiReceiverId: isUsdt
        ? undefined
        : upiReceiverId || this.adminSettings.officialUpiId || 'BHARATPE09905641446@yesbankltd',
      status: 'pending',
      submittedAt: Date.now()
    };
    this.deposits.unshift(newDep);
    if (this.onDepositSaved) {
      try { this.onDepositSaved(newDep); } catch (e) { console.warn('onDepositSaved error:', e); }
    }
    this.notify();
    return { success: true, record: newDep };
  }

  public approveDeposit(depositId: string, adminId: string, customInrCreditAmount?: number): boolean {
    const dep = this.deposits.find((d) => d.id === depositId);
    if (!dep || dep.status !== 'pending') return false;

    // Allow Master Admin to convert USDT -> INR and specify the exact INR amount to credit to user's wallet
    if (customInrCreditAmount !== undefined && !isNaN(customInrCreditAmount) && customInrCreditAmount > 0) {
      dep.amount = Math.round(customInrCreditAmount * 100) / 100;
    }

    let user = this.users[dep.uid];
    if (!user) {
      user = {
        uid: dep.uid,
        username: dep.username || dep.uid,
        phone: dep.phone || '9000000000',
        balance: 0,
        status: 'active',
        vipLevel: 1,
        createdAt: dep.submittedAt || Date.now(),
        lastActive: Date.now(),
        isOnline: true,
        totalBetsCount: 0,
        totalWonAmount: 0,
        totalLostAmount: 0,
        referralCode: dep.uid.slice(-6).toUpperCase(),
        signupBonusStatus: 'pending',
        signupBonusAmount: this.adminSettings.signupBonusAmount || 120,
        firstDepositBonusStatus: 'pending',
        devices: {}
      };
      this.users[dep.uid] = user;
    }

    // Check if this is the user's first approved deposit
    const priorApprovedDeposits = this.deposits.filter(
      (d) => d.uid === dep.uid && d.status === 'approved' && d.id !== dep.id
    );
    const isFirstDeposit = priorApprovedDeposits.length === 0 && user.firstDepositBonusStatus !== 'credited';

    const txDesc =
      dep.paymentMethod === 'USDT'
        ? `USDT (ERC20) Deposit Approved ($${dep.usdtAmount || ''} USDT → ₹${dep.amount} INR | TXID: ${dep.referenceId})`
        : `UPI Deposit Approved (UTR: ${dep.referenceId})`;

    // Mark deposit approved before executing ledger credit so strict deposit verification passes
    dep.status = 'approved';
    dep.reviewedAt = Date.now();
    dep.reviewedBy = adminId;

    // 1. Credit deposit amount atomically and record transaction in authoritative ledger
    let tx = this.executeWalletTransaction({
      uid: dep.uid,
      type: 'deposit',
      category: 'credit',
      amount: dep.amount,
      referenceId: dep.referenceId,
      description: txDesc,
      status: 'completed',
      metadata: { depositId: dep.id, approvedBy: adminId, usdtAmount: dep.usdtAmount, paymentMethod: dep.paymentMethod }
    });

    if (!tx.success) {
      // Fallback with unique deposit ID suffix if UTR reference collided with an older transaction
      tx = this.executeWalletTransaction({
        uid: dep.uid,
        type: 'deposit',
        category: 'credit',
        amount: dep.amount,
        referenceId: `${dep.referenceId}_${dep.id}`,
        description: txDesc,
        status: 'completed',
        metadata: { depositId: dep.id, approvedBy: adminId, usdtAmount: dep.usdtAmount, paymentMethod: dep.paymentMethod }
      });
    }

    if (!tx.success) {
      dep.status = 'pending';
      dep.reviewedAt = undefined;
      dep.reviewedBy = undefined;
      console.error('Failed to credit deposit:', tx.error);
      return false;
    }

    // 2. If first approved deposit: Credit 100% First Deposit Bonus & ₹120 Signup Bonus (if respective bonus modules are enabled)
    if (isFirstDeposit) {
      // 100% First Deposit Bonus
      const fdbEnabled = this.isFeatureEnabled('first_deposit_bonus') && this.adminSettings.featureFirstDepositBonus !== false;
      if (fdbEnabled && this.adminSettings.firstDepositBonusPercent > 0) {
        const fdbAmount = Math.min(
          Math.round((dep.amount * (this.adminSettings.firstDepositBonusPercent / 100)) * 100) / 100,
          this.adminSettings.firstDepositBonusMaxCap
        );
        const fdbTx = this.executeWalletTransaction({
          uid: dep.uid,
          type: 'first_deposit_bonus',
          category: 'credit',
          amount: fdbAmount,
          referenceId: `${dep.referenceId}_FDB`,
          description: `100% First Deposit Bonus (₹${fdbAmount})`,
          status: 'completed',
          metadata: { depositId: dep.id, percentage: this.adminSettings.firstDepositBonusPercent }
        });
        user.firstDepositBonusStatus = 'credited';
        user.firstDepositBonusAmount = fdbAmount;
        user.firstDepositBonusTxId = fdbTx.transaction?.id;
      } else {
        user.firstDepositBonusStatus = 'not_eligible';
      }

      // ₹120 Signup Bonus
      const subEnabled = this.isFeatureEnabled('signup_bonus') && this.adminSettings.featureSignupBonus !== false;
      const subAmount = this.adminSettings.signupBonusAmount || 120;
      if (subEnabled && subAmount > 0) {
        const subTx = this.executeWalletTransaction({
          uid: dep.uid,
          type: 'signup_bonus',
          category: 'credit',
          amount: subAmount,
          referenceId: `SIGNUP_${dep.uid}`,
          description: `₹${subAmount} Signup Bonus (First Deposit Verified)`,
          status: 'completed',
          metadata: { depositId: dep.id }
        });
        user.signupBonusStatus = 'credited';
        user.signupBonusAmount = subAmount;
        user.signupBonusTxId = subTx.transaction?.id;
      }

      user.firstDepositApprovedAt = Date.now();

      // Update active referral record if user was referred and referrals program is enabled
      const refEnabled = this.isFeatureEnabled('referrals') && this.adminSettings.featureReferrals !== false;
      const ref = this.referrals.find((r) => r.referredUid === dep.uid && r.status === 'pending_deposit');
      if (ref && refEnabled) {
        ref.status = 'activity_in_progress';
        ref.firstDepositApprovedAt = Date.now();
        ref.firstDepositAmount = dep.amount;
        if (this.onReferralSaved) {
          try { this.onReferralSaved(ref); } catch (e) { console.warn('onReferralSaved error:', e); }
        }
        this.logAudit({
          actor: adminId,
          category: 'FINANCIAL',
          action: 'REFERRAL_10DAY_ACTIVATED',
          details: `10-day betting countdown initiated for referee ${ref.referredUsername} (Referrer: ${ref.referrerUsername}).`,
          targetUser: ref.referrerUid
        });
      }
    }

    dep.status = 'approved';
    dep.reviewedAt = Date.now();
    dep.reviewedBy = adminId;

    this.logAudit({
      actor: adminId,
      category: 'FINANCIAL',
      action: dep.paymentMethod === 'USDT' ? 'APPROVE_USDT_DEPOSIT' : 'APPROVE_UPI_DEPOSIT',
      details:
        dep.paymentMethod === 'USDT'
          ? `Approved USDT (ERC20) deposit of $${dep.usdtAmount} USDT → converted & credited ₹${dep.amount} INR (TXID: ${dep.referenceId}) for ${dep.username} (${dep.uid}).`
          : `Approved UPI deposit of ₹${dep.amount} (UTR: ${dep.referenceId}) for ${dep.username} (${dep.uid}).`,
      targetUser: dep.uid,
      affectedRecordId: dep.id,
      outcome: 'SUCCESS'
    });

    this.addUserNotification({
      uid: dep.uid,
      type: 'deposit_processed',
      title: dep.paymentMethod === 'USDT' ? '✅ USDT Deposit Converted & Credited' : '✅ UPI Deposit Approved & Credited',
      message:
        dep.paymentMethod === 'USDT'
          ? `Your $${dep.usdtAmount} USDT (ERC20) deposit (TXID: ${dep.referenceId}) was approved and converted to ₹${dep.amount.toLocaleString('en-IN')} INR in your wallet.`
          : `Your deposit of ₹${dep.amount.toLocaleString('en-IN')} (UTR: ${dep.referenceId}) has been verified and credited to your wallet.`,
      statusBadge: 'approved',
      referenceId: dep.referenceId,
      amount: dep.amount,
      actionTarget: 'wallet_records'
    });

    if (this.onDepositSaved) {
      try { this.onDepositSaved(dep); } catch (e) { console.warn('onDepositSaved error:', e); }
    }
    this.syncUsersWithBackend();
    this.notify();
    return true;
  }

  public rejectDeposit(depositId: string, adminId: string, reason: string): boolean {
    const dep = this.deposits.find((d) => d.id === depositId);
    if (!dep || dep.status !== 'pending') return false;
    dep.status = 'rejected';
    dep.reviewedAt = Date.now();
    dep.reviewedBy = adminId;
    dep.adminNote = reason;
    this.logAudit({
      actor: adminId,
      category: 'FINANCIAL',
      action: dep.paymentMethod === 'USDT' ? 'REJECT_USDT_DEPOSIT' : 'REJECT_UPI_DEPOSIT',
      details: `Rejected ${dep.paymentMethod} deposit of ${dep.paymentMethod === 'USDT' ? `$${dep.usdtAmount} USDT` : `₹${dep.amount}`} (Ref: ${dep.referenceId}) for ${dep.username}. Reason: ${reason}`,
      targetUser: dep.uid,
      affectedRecordId: dep.id,
      reason,
      outcome: 'SUCCESS'
    });

    this.addUserNotification({
      uid: dep.uid,
      type: 'deposit_processed',
      title: `⚠️ ${dep.paymentMethod} Deposit Request Rejected`,
      message: `Your deposit request of ${dep.paymentMethod === 'USDT' ? `$${dep.usdtAmount} USDT` : `₹${dep.amount.toLocaleString('en-IN')}`} (Ref: ${dep.referenceId}) was declined. Reason: "${reason}".`,
      statusBadge: 'rejected',
      referenceId: dep.referenceId,
      amount: dep.amount,
      actionTarget: 'wallet_records'
    });

    if (this.onDepositSaved) {
      try { this.onDepositSaved(dep); } catch (e) { console.warn('onDepositSaved error:', e); }
    }
    this.syncUsersWithBackend();
    this.notify();
    return true;
  }

  public attachDepositReceipt(depositId: string, receiptUrl?: string, note?: string): boolean {
    const dep = this.deposits.find((d) => d.id === depositId);
    if (!dep) return false;
    if (receiptUrl) dep.receiptUrl = receiptUrl;
    if (note) dep.adminNote = (dep.adminNote ? dep.adminNote + ' | ' : '') + `User note: ${note}`;
    this.sendSupportMessage(
      dep.uid,
      dep.username,
      'user',
      `[Receipt Submitted] Order ID / UTR: ${dep.referenceId} for ₹${dep.amount}.${note ? ' Remarks: ' + note : ''}`
    );
    this.notify();
    return true;
  }

  public requestWithdrawal(
    uid: string,
    amount: number,
    payoutMethod: WithdrawalRecord['payoutMethod'],
    details: WithdrawalRecord['accountDetails'],
    usdtAmount?: number
  ): { success: boolean; error?: string; record?: WithdrawalRecord } {
    const user = this.users[uid];
    if (!user) return { success: false, error: 'User not found' };
    if (user.status !== 'active') return { success: false, error: `Account is ${user.status}. Withdrawals are restricted.` };
    if (!this.isFeatureEnabled('withdrawals') || this.adminSettings.featureWithdrawals === false) {
      return { success: false, error: 'Withdrawals are temporarily paused by Master Admin.' };
    }

    const isUsdt = payoutMethod === 'USDT (ERC20)';
    if (isUsdt) {
      if (!this.isFeatureEnabled('usdt_withdrawal') || this.adminSettings.featureUsdtWithdrawal === false) {
        return { success: false, error: 'USDT (ERC20) withdrawals are currently disabled by Master Admin.' };
      }
      const minUsdtW = this.adminSettings.minUsdtWithdrawal || 10;
      const requestedUsdt = usdtAmount !== undefined ? usdtAmount : Math.round((amount / (this.adminSettings.usdtExchangeRate || 90)) * 100) / 100;
      if (requestedUsdt < minUsdtW) {
        return { success: false, error: `Minimum USDT withdrawal is $${minUsdtW} USDT` };
      }
      if (!details.usdtAddress || !details.usdtAddress.trim().startsWith('0x') || details.usdtAddress.trim().length < 20) {
        return { success: false, error: 'Please enter a valid ERC20 USDT Wallet Address starting with 0x' };
      }
    } else {
      const minW = this.adminSettings.minWithdrawal || 500;
      const maxW = this.adminSettings.maxWithdrawal || 50000;
      if (typeof amount !== 'number' || isNaN(amount) || amount < minW) {
        return { success: false, error: `Minimum UPI / Bank withdrawal amount is ₹${minW}` };
      }
      if (amount > maxW) {
        return { success: false, error: `Maximum withdrawal amount is ₹${maxW}` };
      }
    }

    if (user.balance < amount) return { success: false, error: 'Insufficient available wallet balance' };

    // Prevent spamming pending withdrawals (max 3 pending per user)
    const pendingCount = this.withdrawals.filter((w) => w.uid === uid && w.status === 'pending').length;
    if (pendingCount >= 3) {
      return { success: false, error: 'You already have 3 pending withdrawal requests. Please wait for Master Admin review.' };
    }

    const withdrawalId = 'wth_' + Math.random().toString(36).substring(2, 8);
    const resolvedUsdt = isUsdt
      ? usdtAmount !== undefined
        ? Math.round(usdtAmount * 100) / 100
        : Math.round((amount / (this.adminSettings.usdtExchangeRate || 90)) * 100) / 100
      : undefined;

    const tx = this.executeWalletTransaction({
      uid,
      type: 'withdrawal',
      category: 'debit',
      amount: Math.round(amount * 100) / 100,
      referenceId: withdrawalId,
      description: isUsdt
        ? `USDT (ERC20) Withdrawal Request ($${resolvedUsdt} USDT / ₹${amount})`
        : `Withdrawal Request via ${payoutMethod}`,
      status: 'pending',
      metadata: { payoutMethod, details, usdtAmount: resolvedUsdt }
    });

    if (!tx.success) {
      return { success: false, error: tx.error || 'Failed to process withdrawal debit' };
    }

    const record: WithdrawalRecord = {
      id: withdrawalId,
      uid,
      username: user.username,
      phone: user.phone,
      amount: Math.round(amount * 100) / 100,
      usdtAmount: resolvedUsdt,
      payoutMethod,
      accountDetails: {
        ...details,
        usdtNetwork: isUsdt ? 'ERC20' : undefined
      },
      status: 'pending',
      requestedAt: Date.now()
    };
    this.withdrawals.unshift(record);
    if (this.onWithdrawalSaved) {
      try { this.onWithdrawalSaved(record); } catch (e) { console.warn('onWithdrawalSaved error:', e); }
    }

    this.addUserNotification({
      uid,
      type: 'withdrawal_processed',
      title: '⏳ Withdrawal Request Queued',
      message: isUsdt
        ? `Your USDT (ERC20) withdrawal of $${resolvedUsdt} USDT (₹${amount.toLocaleString('en-IN')}) to ${details.usdtAddress} has been submitted for Master Admin approval.`
        : `Your withdrawal request of ₹${amount.toLocaleString('en-IN')} via ${payoutMethod} (Order: ${withdrawalId}) has been submitted for Master Admin settlement.`,
      statusBadge: 'pending',
      referenceId: withdrawalId,
      amount,
      actionTarget: 'wallet_records'
    });

    this.notify();
    return { success: true, record };
  }

  public approveWithdrawal(withdrawalId: string, adminId: string): boolean {
    const record = this.withdrawals.find((w) => w.id === withdrawalId);
    if (!record || record.status !== 'pending') return false;
    record.status = 'approved';
    record.processedAt = Date.now();
    record.processedBy = adminId;

    // Update pending ledger transaction to completed
    const tx = this.transactions.find((t) => t.referenceId === withdrawalId && t.type === 'withdrawal');
    if (tx) {
      tx.status = 'completed';
    }

    this.logAudit({
      actor: adminId,
      category: 'FINANCIAL',
      action: 'APPROVE_WITHDRAWAL',
      details:
        record.payoutMethod === 'USDT (ERC20)'
          ? `Approved & settled USDT (ERC20) withdrawal of $${record.usdtAmount} USDT (₹${record.amount}) to ${record.accountDetails.usdtAddress} for ${record.username} (${record.uid})`
          : `Approved & settled withdrawal of ₹${record.amount} via ${record.payoutMethod} for ${record.username} (${record.uid})`,
      targetUser: record.uid,
      affectedRecordId: record.id,
      outcome: 'SUCCESS'
    });

    const destinationLabel =
      record.payoutMethod === 'Bank Transfer'
        ? `${record.accountDetails.bankName || 'Bank'} (${record.accountDetails.accountNumber || ''})`
        : record.payoutMethod === 'USDT (ERC20)'
        ? `USDT ERC20 (${record.accountDetails.usdtAddress || ''})`
        : `UPI (${record.accountDetails.upiId || ''})`;

    this.addUserNotification({
      uid: record.uid,
      type: 'withdrawal_processed',
      title: '✅ Withdrawal Processed & Paid Out',
      message: `Great news! Your withdrawal of ${record.payoutMethod === 'USDT (ERC20)' ? `$${record.usdtAmount} USDT (₹${record.amount.toLocaleString('en-IN')})` : `₹${record.amount.toLocaleString('en-IN')}`} to ${destinationLabel} (Ref: ${record.id}) has been approved and settled by Master Admin.`,
      statusBadge: 'approved',
      referenceId: record.id,
      amount: record.amount,
      actionTarget: 'wallet_records'
    });

    if (this.onWithdrawalSaved) {
      try { this.onWithdrawalSaved(record); } catch (e) { console.warn('onWithdrawalSaved error:', e); }
    }
    this.syncUsersWithBackend();
    this.notify();
    return true;
  }

  public rejectWithdrawal(withdrawalId: string, adminId: string, reason: string): boolean {
    const record = this.withdrawals.find((w) => w.id === withdrawalId);
    if (!record || record.status !== 'pending') return false;
    record.status = 'rejected';
    record.processedAt = Date.now();
    record.processedBy = adminId;
    record.rejectionReason = reason;

    // Mark original reservation debit transaction as completed so ledger records both debit and offsetting refund credit
    const prevTx = this.transactions.find((t) => t.referenceId === withdrawalId && t.type === 'withdrawal' && t.status === 'pending');
    if (prevTx) {
      prevTx.status = 'completed';
    }

    // Atomically refund to user balance with verified ledger entry
    this.executeWalletTransaction({
      uid: record.uid,
      type: 'withdrawal',
      category: 'credit',
      amount: record.amount,
      referenceId: record.id,
      description: `Withdrawal Refund (${reason})`,
      status: 'completed',
      metadata: { withdrawalId, rejectionReason: reason, rejectedBy: adminId }
    });

    this.logAudit({
      actor: adminId,
      category: 'FINANCIAL',
      action: 'REJECT_WITHDRAWAL',
      details: `Rejected withdrawal of ₹${record.amount} for ${record.username}. Refunded to balance. Reason: ${reason}`,
      targetUser: record.uid,
      affectedRecordId: record.id,
      reason,
      outcome: 'SUCCESS'
    });

    this.addUserNotification({
      uid: record.uid,
      type: 'withdrawal_processed',
      title: '⚠️ Withdrawal Rejected & Refunded',
      message: `Your withdrawal request of ₹${record.amount.toLocaleString('en-IN')} (Ref: ${record.id}) was not processed. Reason: "${reason}". ₹${record.amount.toLocaleString('en-IN')} has been refunded to your wallet.`,
      statusBadge: 'rejected',
      referenceId: record.id,
      amount: record.amount,
      actionTarget: 'wallet_records'
    });

    if (this.onWithdrawalSaved) {
      try { this.onWithdrawalSaved(record); } catch (e) { console.warn('onWithdrawalSaved error:', e); }
    }
    this.syncUsersWithBackend();
    this.notify();
    return true;
  }

  public approveDevice(uid: string, deviceId: string, adminId: string): boolean {
    const user = this.users[uid];
    if (!user || !user.devices || !user.devices[deviceId]) return false;

    // 1 Number = 1 Device Policy: Revoke any previously approved devices for this user
    Object.keys(user.devices).forEach((otherId) => {
      if (otherId !== deviceId && user.devices[otherId]?.status === 'approved') {
        user.devices[otherId].status = 'rejected';
        user.devices[otherId].rejectionReason = `Replaced by Admin-approved device ${deviceId} (1 Number = 1 Device policy)`;
      }
    });

    user.devices[deviceId].status = 'approved';
    user.devices[deviceId].approvedAt = Date.now();
    user.devices[deviceId].approvedBy = adminId;
    user.devices[deviceId].rejectionReason = undefined;

    this.savePermanentUsersRegistry();
    if (typeof window !== 'undefined') {
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          phone: user.phone,
          username: user.username,
          password: user.passwordHash,
          uid: user.uid
        })
      }).catch(() => {});
    }

    if (this.onUserSaved) {
      try { this.onUserSaved(user); } catch (e) { console.warn('onUserSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'DEVICE',
      action: 'APPROVE_DEVICE',
      details: `Approved device ${deviceId} for user ${user.username} (${uid}) and revoked previous devices (1 Number = 1 Device policy).`,
      targetUser: uid,
      affectedRecordId: deviceId,
      outcome: 'SUCCESS'
    });
    this.notify();
    return true;
  }

  public rejectDevice(uid: string, deviceId: string, adminId: string, reason: string): boolean {
    const user = this.users[uid];
    if (!user || !user.devices || !user.devices[deviceId]) return false;
    user.devices[deviceId].status = 'rejected';
    user.devices[deviceId].rejectionReason = reason;

    this.savePermanentUsersRegistry();
    if (typeof window !== 'undefined') {
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          phone: user.phone,
          username: user.username,
          password: user.passwordHash,
          uid: user.uid
        })
      }).catch(() => {});
    }

    if (this.onUserSaved) {
      try { this.onUserSaved(user); } catch (e) { console.warn('onUserSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'DEVICE',
      action: 'REJECT_DEVICE',
      details: `Rejected device ${deviceId} for user ${user.username} (${uid}). Reason: ${reason}`,
      targetUser: uid,
      affectedRecordId: deviceId,
      reason,
      outcome: 'SUCCESS'
    });
    this.notify();
    return true;
  }

  public resetUserDeviceLock(uid: string, adminId: string): boolean {
    const user = this.users[uid];
    if (!user) return false;
    user.devices = {};
    this.savePermanentUsersRegistry();
    if (typeof window !== 'undefined') {
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          phone: user.phone,
          username: user.username,
          password: user.passwordHash,
          uid: user.uid
        })
      }).catch(() => {});
    }
    if (this.onUserSaved) {
      try { this.onUserSaved(user); } catch (e) { console.warn('onUserSaved error:', e); }
    }
    this.logAudit({
      actor: adminId,
      category: 'DEVICE',
      action: 'RESET_DEVICE_LOCK',
      details: `Reset 1-Device hardware lock for ${user.username} (${uid}). Next login will bind new primary device.`,
      targetUser: uid,
      affectedRecordId: uid,
      outcome: 'SUCCESS'
    });
    this.notify();
    return true;
  }

  public sendSupportMessage(uid: string, username: string, sender: 'user' | 'admin', text: string): ChatMessage {
    const newMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      uid,
      username,
      sender,
      text,
      timestamp: Date.now(),
      read: false
    };
    this.supportMessages.push(newMsg);

    if (sender === 'admin') {
      const isOfficialBroadcast = text.startsWith('[OFFICIAL NOTIFICATION]') || text.startsWith('[DIRECT NOTIFICATION]');
      const isTicketResolved = text.startsWith('[TICKET RESOLVED]');
      this.addUserNotification({
        uid,
        type: 'support_update',
        title: isTicketResolved
          ? '✅ Support Ticket Resolved'
          : isOfficialBroadcast
          ? '📢 Official Support Announcement'
          : '💬 Support Ticket Updated',
        message: text.replace(/^\[(OFFICIAL NOTIFICATION|DIRECT NOTIFICATION|TICKET RESOLVED)\]\s*/, ''),
        statusBadge: isTicketResolved ? 'resolved' : 'replied',
        referenceId: newMsg.id,
        actionTarget: 'support'
      });
    }

    this.notify();
    return newMsg;
  }

  public resolveSupportTicket(uid: string, adminId: string, resolutionSummary?: string): ChatMessage {
    const user = this.users[uid];
    const username = user ? user.username : 'Player';
    const note =
      resolutionSummary?.trim() ||
      'Your support ticket has been reviewed and marked as resolved by Master Admin. Please message us if you need further assistance.';
    this.markSupportMessagesRead(uid);
    this.logAudit({
      actor: adminId,
      category: 'SETTINGS',
      action: 'SUPPORT_TICKET_RESOLVED',
      details: `Resolved support ticket for ${username} (${uid}): "${note}"`,
      targetUser: uid,
      outcome: 'SUCCESS'
    });
    return this.sendSupportMessage(uid, username, 'admin', `[TICKET RESOLVED] ${note}`);
  }

  // Called when USER opens SupportChatModal -> marks admin replies as read for this user
  public markMessagesAsRead(uid: string) {
    let updated = false;
    this.supportMessages.forEach((m) => {
      if (m.uid === uid && m.sender === 'admin' && !m.read) {
        m.read = true;
        updated = true;
      }
    });
    this.userNotifications.forEach((n) => {
      if (n.uid === uid && n.type === 'support_update' && !n.read) {
        n.read = true;
        updated = true;
      }
    });
    if (updated) this.notify();
  }

  // Called when ADMIN opens a user thread in AdminSupportChat -> marks user messages as read for Admin
  public markSupportMessagesRead(uid: string) {
    let updated = false;
    this.supportMessages.forEach((m) => {
      if (m.uid === uid && m.sender === 'user' && !m.read) {
        m.read = true;
        updated = true;
      }
    });
    if (updated) this.notify();
  }

  // --- LOCAL USER NOTIFICATION SYSTEM ---
  public subscribeUserNotifications(listener: (notif: UserNotification) => void): () => void {
    this.userNotificationListeners.add(listener);
    return () => {
      this.userNotificationListeners.delete(listener);
    };
  }

  public getUserNotifications(uid: string): UserNotification[] {
    return this.userNotifications
      .filter((n) => n.uid === uid)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  public getUnreadNotificationCount(uid: string): number {
    return this.userNotifications.filter((n) => n.uid === uid && !n.read).length;
  }

  public addUserNotification(input: {
    uid: string;
    type: UserNotificationType;
    title: string;
    message: string;
    statusBadge?: UserNotification['statusBadge'];
    referenceId?: string;
    amount?: number;
    actionTarget?: UserNotification['actionTarget'];
  }): UserNotification {
    const notif: UserNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      uid: input.uid,
      type: input.type,
      title: input.title,
      message: input.message,
      timestamp: Date.now(),
      read: false,
      statusBadge: input.statusBadge || 'info',
      referenceId: input.referenceId,
      amount: input.amount,
      actionTarget: input.actionTarget
    };

    this.userNotifications.unshift(notif);
    if (this.userNotifications.length > 300) {
      this.userNotifications.pop();
    }

    // Play audio chime & send browser push notification if applicable
    soundFx.sendPushNotification(notif.title, notif.message, notif.id);

    this.userNotificationListeners.forEach((listener) => {
      try {
        listener(notif);
      } catch (err) {
        console.error('User notification listener error:', err);
      }
    });

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'user_notification', notification: notif });
      } catch {}
    }

    this.saveToStorage();
    return notif;
  }

  public markNotificationRead(notificationId: string, uid?: string) {
    let changed = false;
    this.userNotifications.forEach((n) => {
      if (n.id === notificationId && (!uid || n.uid === uid) && !n.read) {
        n.read = true;
        changed = true;
      }
    });
    if (changed) this.notify();
  }

  public markAllNotificationsRead(uid: string) {
    let changed = false;
    this.userNotifications.forEach((n) => {
      if (n.uid === uid && !n.read) {
        n.read = true;
        changed = true;
      }
    });
    this.supportMessages.forEach((m) => {
      if (m.uid === uid && m.sender === 'admin' && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) this.notify();
  }

  public clearUserNotifications(uid: string) {
    const before = this.userNotifications.length;
    this.userNotifications = this.userNotifications.filter((n) => n.uid !== uid);
    if (this.userNotifications.length !== before) {
      this.notify();
    }
  }

  // --- GIFT CODE MANAGEMENT ENGINE ---
  public createGiftCode(
    code: string,
    amount: number,
    maxUses: number,
    expiryDays: number,
    adminId: string,
    minVipLevel: number = 1
  ): { success: boolean; error?: string } {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, error: 'Code cannot be empty' };
    if (this.giftCodes[cleanCode]) return { success: false, error: 'Code already exists' };
    if (amount <= 0) return { success: false, error: 'Amount must be positive' };
    if (maxUses < 1) return { success: false, error: 'Max uses must be at least 1' };

    this.giftCodes[cleanCode] = {
      code: cleanCode,
      amount,
      maxUses,
      usedCount: 0,
      claimedBy: {},
      createdAt: Date.now(),
      expiresAt: Date.now() + expiryDays * 86400000,
      createdBy: adminId,
      isActive: true,
      minVipLevel: Math.max(1, minVipLevel)
    };

    this.logAudit({
      actor: adminId,
      category: 'GIFT_CODE',
      action: 'CREATE_GIFT_CODE',
      details: `Created gift code ${cleanCode} (Value: ₹${amount}, Max Uses: ${maxUses}, Expiry: ${expiryDays}d, Min VIP: ${minVipLevel})`,
      affectedRecordId: cleanCode,
      outcome: 'SUCCESS'
    });
    this.notify();
    return { success: true };
  }

  public updateGiftCode(
    code: string,
    updates: { amount?: number; maxUses?: number; expiryDays?: number; expiresAt?: number; isActive?: boolean; minVipLevel?: number },
    adminId: string,
    reason: string = 'Admin gift code update'
  ): { success: boolean; error?: string; giftCode?: GiftCode } {
    const cleanCode = code.trim().toUpperCase();
    const gift = this.giftCodes[cleanCode];
    if (!gift) return { success: false, error: 'Gift code not found' };

    if (updates.amount !== undefined) {
      if (updates.amount <= 0) return { success: false, error: 'Gift value must be greater than ₹0' };
      gift.amount = updates.amount;
    }
    if (updates.maxUses !== undefined) {
      if (updates.maxUses < gift.usedCount) {
        return { success: false, error: `Redemption limit (${updates.maxUses}) cannot be lower than already redeemed count (${gift.usedCount})` };
      }
      gift.maxUses = Math.max(1, updates.maxUses);
    }
    if (updates.expiryDays !== undefined && updates.expiryDays > 0) {
      gift.expiresAt = Date.now() + updates.expiryDays * 86400000;
    } else if (updates.expiresAt !== undefined) {
      gift.expiresAt = updates.expiresAt;
    }
    if (updates.isActive !== undefined) {
      gift.isActive = updates.isActive;
    }
    if (updates.minVipLevel !== undefined) {
      gift.minVipLevel = Math.max(1, updates.minVipLevel);
    }

    this.logAudit({
      actor: adminId,
      category: 'GIFT_CODE',
      action: 'UPDATE_GIFT_CODE',
      details: `Updated gift code ${cleanCode} (Value: ₹${gift.amount}, Limit: ${gift.usedCount}/${gift.maxUses}, Active: ${gift.isActive}, Min VIP: ${gift.minVipLevel || 1}). Reason: ${reason}`,
      affectedRecordId: cleanCode,
      reason,
      outcome: 'SUCCESS'
    });
    this.notify();
    return { success: true, giftCode: gift };
  }

  public toggleGiftCodeStatus(code: string, isActive: boolean, adminId: string, reason: string = 'Status toggled by Master Admin'): { success: boolean; error?: string } {
    return this.updateGiftCode(code, { isActive }, adminId, reason);
  }

  public deleteGiftCode(code: string, adminId: string, reason: string = 'Unused gift code removed'): { success: boolean; error?: string } {
    const cleanCode = code.trim().toUpperCase();
    const gift = this.giftCodes[cleanCode];
    if (!gift) return { success: false, error: 'Gift code not found' };

    // Protect financial audit retention: never delete a code that has already been redeemed
    if (gift.usedCount > 0 || Object.keys(gift.claimedBy || {}).length > 0) {
      this.logAudit({
        actor: adminId,
        category: 'GIFT_CODE',
        action: 'DELETE_GIFT_CODE_BLOCKED',
        details: `Blocked deletion of redeemed gift code ${cleanCode} (${gift.usedCount} redemptions) to preserve financial audit records. Deactivate instead.`,
        affectedRecordId: cleanCode,
        reason,
        outcome: 'DENIED'
      });
      return {
        success: false,
        error: `Cannot delete ${cleanCode} because it has ${gift.usedCount} redemption(s). Deactivate it instead to preserve financial audit records.`
      };
    }

    delete this.giftCodes[cleanCode];
    this.logAudit({
      actor: adminId,
      category: 'GIFT_CODE',
      action: 'DELETE_UNUSED_GIFT_CODE',
      details: `Deleted unused gift code ${cleanCode} (₹${gift.amount}). Reason: ${reason}`,
      affectedRecordId: cleanCode,
      reason,
      outcome: 'SUCCESS'
    });
    this.notify();
    return { success: true };
  }

  public claimGiftCode(uid: string, code: string): { success: boolean; error?: string; amount?: number } {
    const user = this.users[uid];
    if (!user) return { success: false, error: 'User not found' };
    if (user.status !== 'active') return { success: false, error: `Account is ${user.status}. Cannot redeem gift codes.` };
    if (!this.isFeatureEnabled('gift_codes') || this.adminSettings.featureGiftCodes === false) {
      return { success: false, error: 'Gift code redemption is currently disabled by Master Admin.' };
    }

    const cleanCode = code.trim().toUpperCase();
    const gift = this.giftCodes[cleanCode];
    if (!gift) return { success: false, error: 'Invalid gift code' };
    if (!gift.isActive) return { success: false, error: 'This gift code has been deactivated by Admin' };
    if (Date.now() > gift.expiresAt) return { success: false, error: 'This gift code has expired' };
    if (gift.usedCount >= gift.maxUses) return { success: false, error: 'Gift code redemption limit reached' };
    if (gift.claimedBy[uid]) return { success: false, error: 'You have already redeemed this gift code' };
    if (gift.minVipLevel && user.vipLevel < gift.minVipLevel) {
      return { success: false, error: `Requires VIP Level ${gift.minVipLevel} or higher to redeem this voucher` };
    }

    const tx = this.executeWalletTransaction({
      uid,
      type: 'gift_code',
      category: 'credit',
      amount: gift.amount,
      referenceId: cleanCode,
      description: `Gift Voucher Claimed: ${cleanCode}`,
      status: 'completed'
    });

    if (!tx.success) {
      return { success: false, error: tx.error || 'Failed to claim voucher' };
    }

    gift.usedCount += 1;
    gift.claimedBy[uid] = { uid, claimedAt: Date.now() };

    this.logAudit({
      actor: user.username,
      category: 'GIFT_CODE',
      action: 'REDEEM_GIFT_CODE',
      details: `User ${user.username} (${uid}) redeemed gift code ${cleanCode} for ₹${gift.amount}.`,
      targetUser: uid,
      affectedRecordId: cleanCode,
      outcome: 'SUCCESS'
    });

    this.notify();
    return { success: true, amount: gift.amount };
  }

  public adjustUserBalance(uid: string, delta: number, reason: string, adminId: string): boolean {
    const user = this.users[uid];
    if (!user) return false;
    const amount = Math.abs(delta);
    const category = delta >= 0 ? 'credit' : 'debit';

    const tx = this.executeWalletTransaction({
      uid,
      type: 'admin_adjustment',
      category,
      amount,
      referenceId: `adj_${Date.now()}`,
      description: `Admin Adjustment: ${reason}`,
      status: 'completed',
      metadata: { adminId, reason }
    });

    if (!tx.success) {
      return false;
    }

    this.logAudit({
      actor: adminId,
      category: 'BALANCE',
      action: delta >= 0 ? 'BALANCE_CREDITED' : 'BALANCE_DEBITED',
      details: `Manual balance adjustment of ${delta >= 0 ? '+' : ''}₹${delta} for ${user.username}. Reason: ${reason}`,
      targetUser: uid,
      affectedRecordId: tx.transaction?.id,
      reason,
      outcome: 'SUCCESS'
    });
    this.notify();
    return true;
  }

  public updateUserBalance(uid: string, delta: number, reason: string, customType?: TransactionType): boolean {
    const user = this.users[uid];
    if (!user || typeof delta !== 'number' || !Number.isFinite(delta) || delta === 0) return false;
    const amount = Math.abs(delta);
    const category = delta >= 0 ? 'credit' : 'debit';

    // Strict Anti-Hack Guard on direct updateUserBalance calls:
    // Positive credits via updateUserBalance are ONLY permitted for an active, paid Lucky Wheel Spin within 15s.
    if (category === 'credit') {
      const activeSpinTs = this.activeWheelSpinStakes[uid] || 0;
      const isAuthorizedWheelWin =
        reason.startsWith('Lucky Wheel Won ') &&
        activeSpinTs > 0 &&
        Date.now() - activeSpinTs <= 15000 &&
        amount <= 1000;

      if (!isAuthorizedWheelWin) {
        this.logAudit({
          actor: uid,
          category: 'BALANCE',
          action: 'BLOCKED_DIRECT_BALANCE_INJECTION',
          details: `Blocked unauthorized updateUserBalance credit of +₹${amount} (${reason}) for ${user.username}.`,
          targetUser: uid,
          outcome: 'DENIED'
        });
        return false;
      }
      // Consume the single-use wheel spin token so it cannot be replayed
      delete this.activeWheelSpinStakes[uid];
    }

    let resolvedType: TransactionType = customType || (category === 'debit' ? 'bet_placement' : 'game_payout');
    if (!customType) {
      const lower = reason.toLowerCase();
      if (lower.includes('bet') || lower.includes('stake') || lower.includes('entry')) {
        resolvedType = 'bet_placement';
      } else if (lower.includes('win') || lower.includes('payout') || lower.includes('won')) {
        resolvedType = 'game_payout';
      }
    }

    const tx = this.executeWalletTransaction({
      uid,
      type: resolvedType,
      category,
      amount,
      referenceId: `bal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      description: reason || 'Balance Update'
    });

    if (tx.success) {
      if (resolvedType === 'bet_placement' && category === 'debit') {
        user.totalBetsCount += 1;
        this.recordBettingTurnover(uid, amount);
        if (reason === 'Lucky Wheel Spin Entry') {
          this.activeWheelSpinStakes[uid] = Date.now();
        }
      } else if (resolvedType === 'game_payout' && category === 'credit') {
        user.totalWonAmount += amount;
      }
    }
    return tx.success;
  }

  public recordWheelSpin(uid: string): void {
    const user = this.users[uid];
    if (user) {
      user.lastWheelSpinAt = Date.now();
      try {
        localStorage.setItem(`bingo777_last_spin_${uid}`, Date.now().toString());
      } catch {}
      this.notify();
    }
  }

  public claimDailyAttendance(uid: string): { success: boolean; amount?: number; day?: number; error?: string } {
    const user = this.users[uid];
    if (!user) return { success: false, error: 'User not found' };

    const todayStr = new Date().toISOString().split('T')[0];
    if (user.lastCheckInDate === todayStr) {
      return { success: false, error: 'Attendance bonus din mein sirf 1 baar milta hai! Kal dobara aaiye.' };
    }

    const currentDay = user.checkInDay || 1;
    const bonuses = this.adminSettings.checkInBonuses || [10, 25, 50, 80, 150, 250, 500];
    const reward = bonuses[currentDay - 1] ?? 10;

    // Automatic direct wallet credit immediately upon claim
    const tx = this.executeWalletTransaction({
      uid,
      type: 'admin_adjustment',
      category: 'credit',
      amount: reward,
      referenceId: `att_${uid}_${todayStr}_d${currentDay}`,
      description: `7-Day Attendance Streak Bonus (Day ${currentDay}) — Auto Claimed`,
      status: 'completed'
    });
    if (!tx.success) {
      return { success: false, error: tx.error || 'Failed to credit attendance reward to wallet' };
    }

    user.lastCheckInDate = todayStr;
    user.checkInDay = (currentDay % 7) + 1;
    try {
      localStorage.setItem(`bingo777_last_checkin_date_${uid}`, todayStr);
      localStorage.setItem(`bingo777_last_checkin_day_${uid}`, user.checkInDay.toString());
    } catch {}

    this.logAudit({
      actor: user.username,
      category: 'FINANCIAL',
      action: 'ATTENDANCE_REWARD_CLAIMED',
      details: `Claimed Day ${currentDay} attendance bonus of ₹${reward} (Auto-credited directly to wallet).`,
      targetUser: uid,
      outcome: 'SUCCESS'
    });

    this.saveToStorage();
    this.savePermanentUsersRegistry();
    this.notify();

    return {
      success: true,
      amount: reward,
      day: currentDay
    };
  }

  public recordBettingTurnover(uid: string, amount: number) {
    const user = this.users[uid];
    if (!user || amount <= 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    user.dailyBettingActivity = user.dailyBettingActivity || {};
    user.dailyBettingActivity[todayStr] = (user.dailyBettingActivity[todayStr] || 0) + amount;

    // Check if user is the referred player in any active referral
    const ref = this.referrals.find((r) => r.referredUid === uid && r.status === 'activity_in_progress');
    if (ref && ref.firstDepositApprovedAt) {
      const depDate = new Date(ref.firstDepositApprovedAt);
      depDate.setHours(0, 0, 0, 0);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((todayDate.getTime() - depDate.getTime()) / 86400000);

      // Must be within 10 calendar days of first approved deposit
      if (diffDays >= 0 && diffDays < this.adminSettings.referralRequiredDays) {
        ref.dailyTurnover = ref.dailyTurnover || {};
        ref.dailyTurnover[todayStr] = (ref.dailyTurnover[todayStr] || 0) + amount;

        const qualifyingDays = Object.values(ref.dailyTurnover).filter(
          (t) => t >= this.adminSettings.referralDailyBetRequirement
        ).length;
        ref.qualifyingDaysCompleted = qualifyingDays;

        if (qualifyingDays >= this.adminSettings.referralRequiredDays) {
          // Mark eligible for Master Admin review — NEVER auto-credit without Admin approval
          ref.status = 'eligible';
        }
        if (this.onReferralSaved) {
          try { this.onReferralSaved(ref); } catch (e) { console.warn('onReferralSaved error:', e); }
        }
      }
    }

    // Distribute 3-Tier Multi-Level Marketing (MLM) Affiliate Commission up the referral chain
    this.distributeMlmCommission(uid, amount, 'Live Arena');
  }

  private mlmCommissions: MlmCommissionEntry[] = [];
  private mlmInitializedUsers: Set<string> = new Set();

  private loadMlmFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('maanwin_mlm_commissions_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.mlmCommissions = parsed.filter(
            (c: MlmCommissionEntry) =>
              !c.id.includes('_seed_') &&
              !c.earnerUid.startsWith('usr_demo_') &&
              !c.sourceUid.startsWith('usr_demo_')
          );
        }
      }
    } catch {
      // Ignore storage error
    }
  }

  private saveMlmToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('maanwin_mlm_commissions_v1', JSON.stringify(this.mlmCommissions.slice(0, 200)));
    } catch {
      // Ignore storage error
    }
  }

  private ensureUserMlmSeeded(_uid: string) {
    if (this.mlmCommissions.length === 0) {
      this.loadMlmFromStorage();
    }
  }

  public getAllMlmCommissions(): MlmCommissionEntry[] {
    if (this.mlmCommissions.length === 0) {
      this.loadMlmFromStorage();
    }
    return [...this.mlmCommissions].sort((a, b) => b.timestamp - a.timestamp);
  }

  public distributeMlmCommission(sourceUid: string, turnoverAmount: number, gameName: string = 'Win Go') {
    if (turnoverAmount <= 0) return;
    if (this.adminSettings.featureMlm === false) return;
    const sourceUser = this.users[sourceUid];
    const sourceName = sourceUser?.username || 'Player';

    // Find Level 1 Referrer
    const refL1 = this.referrals.find((r) => r.referredUid === sourceUid);
    if (!refL1) return;

    const rates: Array<{ level: 1 | 2 | 3; rate: number }> = [
      { level: 1, rate: this.adminSettings.mlmLevel1Rate ?? 1.0 },
      { level: 2, rate: this.adminSettings.mlmLevel2Rate ?? 0.5 },
      { level: 3, rate: this.adminSettings.mlmLevel3Rate ?? 0.25 }
    ];

    let currentReferrerUid: string | undefined = refL1.referrerUid;

    for (const tier of rates) {
      if (!currentReferrerUid || currentReferrerUid === sourceUid) break;
      const commAmount = Number(((turnoverAmount * tier.rate) / 100).toFixed(2));
      if (commAmount > 0) {
        const entry: MlmCommissionEntry = {
          id: `mlm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          earnerUid: currentReferrerUid,
          sourceUid,
          sourceUsername: sourceName,
          level: tier.level,
          ratePercent: tier.rate,
          betTurnover: turnoverAmount,
          commissionAmount: commAmount,
          gameName,
          timestamp: Date.now(),
          claimed: false
        };
        this.mlmCommissions.unshift(entry);
      }
      const parentRef = this.referrals.find((r) => r.referredUid === currentReferrerUid);
      currentReferrerUid = parentRef?.referrerUid;
    }

    this.saveMlmToStorage();
    this.notify();
  }

  public getMlmDashboardData(uid: string): MlmDashboardData {
    this.ensureUserMlmSeeded(uid);
    const user = this.users[uid];
    const userEntries = this.mlmCommissions.filter((c) => c.earnerUid === uid);

    const unclaimedCommission = Number(
      userEntries
        .filter((c) => !c.claimed)
        .reduce((sum, c) => sum + c.commissionAmount, 0)
        .toFixed(2)
    );
    const totalClaimedCommission = Number(
      userEntries
        .filter((c) => c.claimed)
        .reduce((sum, c) => sum + c.commissionAmount, 0)
        .toFixed(2)
    );
    const lifetimeCommission = Number((unclaimedCommission + totalClaimedCommission).toFixed(2));

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayCommission = Number(
      userEntries
        .filter((c) => c.timestamp >= startOfToday.getTime())
        .reduce((sum, c) => sum + c.commissionAmount, 0)
        .toFixed(2)
    );

    // Direct referrals + real MLM network nodes
    const directRefs = this.getUserReferrals(uid).filter((r) => !r.referredUid.startsWith('usr_demo_'));
    const level1Members: MlmMemberNode[] = directRefs.map((r) => {
      const totalTurn = Object.values(r.dailyTurnover || {}).reduce((s, v) => s + v, 0);
      return {
        uid: r.referredUid,
        username: r.referredUsername,
        phoneMasked: r.referredPhone ? `+91 ${r.referredPhone.slice(0, 2)}****${r.referredPhone.slice(-2)}` : '+91 99****00',
        level: 1,
        totalTurnover: totalTurn,
        commissionGenerated: Number(((totalTurn * (this.adminSettings.mlmLevel1Rate ?? 1.0)) / 100).toFixed(2)),
        joinedAt: r.registeredAt,
        isActiveToday: totalTurn > 0
      };
    });

    const l1Uids = new Set(level1Members.map((m) => m.uid));
    const l2Refs = this.referrals.filter((r) => l1Uids.has(r.referrerUid) && !r.referredUid.startsWith('usr_demo_'));
    const level2Members: MlmMemberNode[] = l2Refs.map((r) => {
      const totalTurn = Object.values(r.dailyTurnover || {}).reduce((s, v) => s + v, 0);
      return {
        uid: r.referredUid,
        username: r.referredUsername,
        phoneMasked: r.referredPhone ? `+91 ${r.referredPhone.slice(0, 2)}****${r.referredPhone.slice(-2)}` : '+91 99****00',
        level: 2,
        totalTurnover: totalTurn,
        commissionGenerated: Number(((totalTurn * (this.adminSettings.mlmLevel2Rate ?? 0.5)) / 100).toFixed(2)),
        joinedAt: r.registeredAt,
        isActiveToday: totalTurn > 0
      };
    });

    const l2Uids = new Set(level2Members.map((m) => m.uid));
    const l3Refs = this.referrals.filter((r) => l2Uids.has(r.referrerUid) && !r.referredUid.startsWith('usr_demo_'));
    const level3Members: MlmMemberNode[] = l3Refs.map((r) => {
      const totalTurn = Object.values(r.dailyTurnover || {}).reduce((s, v) => s + v, 0);
      return {
        uid: r.referredUid,
        username: r.referredUsername,
        phoneMasked: r.referredPhone ? `+91 ${r.referredPhone.slice(0, 2)}****${r.referredPhone.slice(-2)}` : '+91 99****00',
        level: 3,
        totalTurnover: totalTurn,
        commissionGenerated: Number(((totalTurn * (this.adminSettings.mlmLevel3Rate ?? 0.25)) / 100).toFixed(2)),
        joinedAt: r.registeredAt,
        isActiveToday: totalTurn > 0
      };
    });

    return {
      referralCode: user?.referralCode || 'BINGO777',
      unclaimedCommission,
      totalClaimedCommission,
      lifetimeCommission,
      todayCommission,
      level1Rate: this.adminSettings.mlmLevel1Rate ?? 1.0,
      level2Rate: this.adminSettings.mlmLevel2Rate ?? 0.5,
      level3Rate: this.adminSettings.mlmLevel3Rate ?? 0.25,
      level1Members,
      level2Members,
      level3Members,
      recentCommissions: userEntries.slice(0, 30)
    };
  }

  public simulateMlmDownlineTurnover(_uid: string): { success: boolean; addedCommission: number; summary: string } {
    return {
      success: false,
      addedCommission: 0,
      summary: 'Simulated turnover is disabled. Commissions are only generated from real verified downline bets.'
    };
  }

  public claimMlmCommission(uid: string): { success: boolean; claimedAmount?: number; txId?: string; error?: string } {
    this.ensureUserMlmSeeded(uid);
    const unclaimed = this.mlmCommissions.filter((c) => c.earnerUid === uid && !c.claimed);
    const totalAmount = Number(unclaimed.reduce((sum, c) => sum + c.commissionAmount, 0).toFixed(2));

    if (totalAmount <= 0) {
      return { success: false, error: 'No unclaimed MLM commission available right now.' };
    }

    // Record as PENDING Master Admin approval so no commission is auto-credited without Admin verification
    const tx = this.executeWalletTransaction({
      uid,
      type: 'mlm_commission',
      category: 'credit',
      amount: totalAmount,
      referenceId: `MLM_CLAIM_${Date.now()}`,
      description: `3-Tier MLM Commission Request (${unclaimed.length} entries) — Pending Admin Approval`,
      status: 'pending',
      metadata: { entriesCount: unclaimed.length }
    });

    if (!tx.success) {
      return { success: false, error: tx.error || 'Failed to submit MLM commission request' };
    }

    unclaimed.forEach((c) => {
      c.claimed = true;
    });
    this.saveMlmToStorage();

    this.logAudit({
      actor: this.users[uid]?.username || uid,
      category: 'FINANCIAL',
      action: 'MLM_COMMISSION_REQUESTED',
      details: `Requested ₹${totalAmount.toFixed(2)} across ${unclaimed.length} affiliate entries (Pending Master Admin approval).`,
      targetUser: uid,
      affectedRecordId: tx.transaction?.id,
      outcome: 'SUCCESS'
    });

    this.notify();
    return {
      success: false,
      claimedAmount: totalAmount,
      txId: tx.transaction?.id,
      error: `MLM Commission request of ₹${totalAmount.toFixed(2)} submitted! It will be credited after Master Admin approval.`
    };
  }

  public claimReferralBonus(referralId: string, callerUid?: string): { success: boolean; error?: string } {
    const ref = this.referrals.find((r) => r.id === referralId);
    if (!ref) return { success: false, error: 'Referral record not found' };

    if (callerUid && callerUid !== ref.referrerUid) {
      return { success: false, error: 'Only the referrer is entitled to claim this bonus' };
    }

    if (ref.status === 'credited') {
      return { success: false, error: 'Referral bonus has already been credited' };
    }

    if (ref.referrerUid === ref.referredUid) {
      return { success: false, error: 'Self-referrals are prohibited' };
    }

    if (!ref.firstDepositApprovedAt) {
      return { success: false, error: 'Referred user has not made an approved first deposit' };
    }

    if (ref.qualifyingDaysCompleted < this.adminSettings.referralRequiredDays) {
      return {
        success: false,
        error: `Requires ${this.adminSettings.referralRequiredDays} qualifying betting days (Current: ${ref.qualifyingDaysCompleted}/${this.adminSettings.referralRequiredDays})`
      };
    }

    ref.status = 'eligible';
    if (this.onReferralSaved) {
      try { this.onReferralSaved(ref); } catch (e) { console.warn('onReferralSaved error:', e); }
    }
    this.notify();
    return {
      success: false,
      error: 'Referral bonus is eligible and awaiting Master Admin approval before wallet credit.'
    };
  }

  public adminApproveReferral(referralId: string, adminId: string, reason: string): { success: boolean; error?: string } {
    const ref = this.referrals.find((r) => r.id === referralId);
    if (!ref) return { success: false, error: 'Referral record not found' };
    if (ref.status === 'credited') return { success: false, error: 'Already credited' };

    const tx = this.executeWalletTransaction({
      uid: ref.referrerUid,
      type: 'referral_bonus',
      category: 'credit',
      amount: ref.bonusAmount,
      referenceId: ref.id,
      description: `₹${ref.bonusAmount} Referral Bonus for inviting ${ref.referredUsername} (Admin Approved)`,
      status: 'completed',
      metadata: { referralId: ref.id, approvedBy: adminId, reason }
    });

    if (!tx.success) {
      return { success: false, error: tx.error || 'Failed to credit referral bonus' };
    }

    ref.status = 'credited';
    ref.creditedAt = Date.now();
    ref.transactionId = tx.transaction?.id;
    if (this.onReferralSaved) {
      try { this.onReferralSaved(ref); } catch (e) { console.warn('onReferralSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'FINANCIAL',
      action: 'REFERRAL_ADMIN_CREDIT',
      details: `Master Admin approved & credited ₹${ref.bonusAmount} referral bonus to ${ref.referrerUsername} (Referee: ${ref.referredUsername}). Reason: ${reason}`,
      targetUser: ref.referrerUid,
      affectedRecordId: ref.id,
      reason,
      outcome: 'SUCCESS'
    });

    this.notify();
    return { success: true };
  }

  public adminRejectReferral(referralId: string, adminId: string, reason: string): { success: boolean; error?: string } {
    const ref = this.referrals.find((r) => r.id === referralId);
    if (!ref) return { success: false, error: 'Referral record not found' };
    if (ref.status === 'credited') return { success: false, error: 'Cannot reject already credited bonus' };

    ref.status = 'rejected';
    ref.rejectionReason = reason;
    if (this.onReferralSaved) {
      try { this.onReferralSaved(ref); } catch (e) { console.warn('onReferralSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'FINANCIAL',
      action: 'REFERRAL_ADMIN_REJECT',
      details: `Master Admin rejected referral bonus for ${ref.referrerUsername} (Referee: ${ref.referredUsername}). Reason: ${reason}`,
      targetUser: ref.referrerUid,
      affectedRecordId: ref.id,
      reason,
      outcome: 'SUCCESS'
    });

    this.notify();
    return { success: true };
  }

  public toggleUserStatus(
    uid: string,
    status: 'active' | 'suspended' | 'banned' | 'deactivated',
    reason: string,
    adminId: string
  ): boolean {
    const user = this.users[uid];
    if (!user) return false;
    const prevStatus = user.status;
    user.status = status;

    const actionMap: Record<UserRecord['status'], string> = {
      active: 'USER_ACTIVATED',
      suspended: 'USER_SUSPENDED',
      banned: 'USER_BANNED',
      deactivated: 'USER_DEACTIVATED',
      blocked: 'USER_BLOCKED'
    };

    this.savePermanentUsersRegistry();
    if (this.onUserSaved) {
      try { this.onUserSaved(user); } catch (e) { console.warn('onUserSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'AUTH',
      action: actionMap[status] || 'USER_STATUS_UPDATED',
      details: `Account status for ${user.username} (${uid}) changed from ${prevStatus.toUpperCase()} to ${status.toUpperCase()}. Financial ledger preserved. Reason: ${reason}`,
      targetUser: uid,
      affectedRecordId: uid,
      reason,
      outcome: 'SUCCESS'
    });
    this.notify();
    return true;
  }

  // --- COMPLETE FEATURE MANAGEMENT ENGINE ---
  public toggleFeatureModule(
    featureId: string,
    enabled: boolean,
    visibleInUserApp: boolean,
    adminId: string,
    reason: string = 'Real-time feature state update'
  ): { success: boolean; error?: string; module?: FeatureModule } {
    const mod = this.featureModules[featureId];
    if (!mod) return { success: false, error: `Feature module ${featureId} not found` };

    mod.enabled = enabled;
    mod.visibleInUserApp = enabled ? (visibleInUserApp !== false) : false;
    mod.status = enabled ? 'active' : 'deactivated';
    mod.updatedAt = Date.now();
    mod.updatedBy = adminId;

    // Synchronize corresponding AdminSettings boolean flags and featureModulesMap
    this.syncAdminSettingsFromFeature(featureId, enabled);
    this.adminSettings.featureModulesMap = { ...this.featureModules };
    this.adminSettings.updatedAt = Date.now();

    if (this.onAdminSettingsSaved) {
      try { this.onAdminSettingsSaved(this.adminSettings); } catch (e) { console.warn('onAdminSettingsSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'FEATURE',
      action: enabled ? 'FEATURE_ENABLED' : 'FEATURE_DISABLED',
      details: `Module "${mod.name}" (${featureId}) set to ${enabled ? 'ENABLED' : 'DISABLED'} (Visible in User App: ${mod.visibleInUserApp}). Reason: ${reason}`,
      affectedRecordId: featureId,
      reason,
      outcome: 'SUCCESS'
    });
    this.saveToStorage();
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'features_updated', featureId, enabled });
      } catch {}
    }
    this.notify();
    return { success: true, module: mod };
  }

  // 1-Click Master Control: Enable or Disable ALL Games Simultaneously
  public toggleAllGames(
    enabled: boolean,
    adminId: string = 'MasterAdmin_01',
    reason: string = `Master Admin ${enabled ? 'ENABLED' : 'DISABLED'} ALL games with 1 click`
  ): { success: boolean; affectedCount: number } {
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
      'quiz_battle',
      'dragon_tiger'
    ];
    let count = 0;
    gameIds.forEach((gid) => {
      if (!this.featureModules[gid] && INITIAL_FEATURE_MODULES[gid]) {
        this.featureModules[gid] = { ...INITIAL_FEATURE_MODULES[gid] };
      }
      if (this.featureModules[gid]) {
        this.featureModules[gid].enabled = enabled;
        this.featureModules[gid].visibleInUserApp = enabled;
        this.featureModules[gid].status = enabled ? 'active' : 'deactivated';
        this.featureModules[gid].updatedAt = Date.now();
        this.featureModules[gid].updatedBy = adminId;
        this.syncAdminSettingsFromFeature(gid, enabled);
        count++;
      }
    });

    this.adminSettings.allGamesEnabled = enabled;
    this.adminSettings.wingoEnabled = enabled;
    this.adminSettings.aviatorEnabled = enabled;
    this.adminSettings.k3Enabled = enabled;
    this.adminSettings.trxEnabled = enabled;
    this.adminSettings.ludoEnabled = enabled;
    this.adminSettings.dragonTigerEnabled = enabled;
    this.adminSettings.liveQuizEnabled = enabled;
    this.adminSettings.wheelEnabled = enabled;
    this.adminSettings.featureModulesMap = { ...this.featureModules };
    this.adminSettings.updatedAt = Date.now();

    if (this.onAdminSettingsSaved) {
      try { this.onAdminSettingsSaved(this.adminSettings); } catch (e) { console.warn('onAdminSettingsSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'FEATURE',
      action: enabled ? 'ALL_GAMES_ENABLED' : 'ALL_GAMES_DISABLED',
      details: `${enabled ? 'Enabled' : 'Disabled'} all ${count} game modules with 1 click. Reason: ${reason}`,
      outcome: 'SUCCESS'
    });
    this.saveToStorage();
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'features_updated', allGames: true, enabled });
      } catch {}
    }
    this.notify();
    return { success: true, affectedCount: count };
  }

  // 1-Click Master Control: Enable or Disable ALL App Options (or by Category)
  public toggleAllFeatures(
    enabled: boolean,
    categoryFilter?: string,
    adminId: string = 'MasterAdmin_01'
  ): { success: boolean; affectedCount: number } {
    Object.keys(INITIAL_FEATURE_MODULES).forEach((fid) => {
      if (!this.featureModules[fid]) {
        this.featureModules[fid] = { ...INITIAL_FEATURE_MODULES[fid] };
      }
    });

    let count = 0;
    Object.values(this.featureModules).forEach((mod) => {
      if (categoryFilter && categoryFilter !== 'ALL' && mod.category !== categoryFilter) {
        return;
      }
      mod.enabled = enabled;
      mod.visibleInUserApp = enabled ? true : mod.visibleInUserApp;
      mod.status = enabled ? 'active' : 'deactivated';
      mod.updatedAt = Date.now();
      mod.updatedBy = adminId;
      this.syncAdminSettingsFromFeature(mod.id, enabled);
      count++;
    });

    if (!categoryFilter || categoryFilter === 'ALL' || categoryFilter === 'GAMES') {
      this.adminSettings.allGamesEnabled = enabled;
    }
    this.adminSettings.featureModulesMap = { ...this.featureModules };
    this.adminSettings.updatedAt = Date.now();

    if (this.onAdminSettingsSaved) {
      try { this.onAdminSettingsSaved(this.adminSettings); } catch (e) { console.warn('onAdminSettingsSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'FEATURE',
      action: enabled ? 'ALL_OPTIONS_ENABLED' : 'ALL_OPTIONS_DISABLED',
      details: `${enabled ? 'Enabled' : 'Disabled'} ${count} app options (${categoryFilter || 'ALL'}).`,
      outcome: 'SUCCESS'
    });
    this.saveToStorage();
    this.notify();
    return { success: true, affectedCount: count };
  }

  public upsertFeatureModule(
    input: {
      id: string;
      name: string;
      category: FeatureModule['category'];
      description: string;
      enabled: boolean;
      visibleInUserApp: boolean;
      status?: FeatureModule['status'];
      badgeText?: string;
      minVipLevel?: number;
      config?: Record<string, string | number | boolean>;
    },
    adminId: string,
    reason: string = 'Feature module configuration saved'
  ): { success: boolean; error?: string; module?: FeatureModule } {
    const cleanId = input.id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!cleanId) return { success: false, error: 'Feature ID is required' };
    if (!input.name.trim()) return { success: false, error: 'Feature name is required' };

    const existing = this.featureModules[cleanId];
    const isNew = !existing;

    const updated: FeatureModule = {
      id: cleanId,
      name: input.name.trim(),
      category: input.category,
      description: input.description.trim(),
      enabled: input.enabled,
      visibleInUserApp: input.visibleInUserApp,
      status: input.status || (input.enabled ? 'active' : 'deactivated'),
      isCoreSystem: existing ? existing.isCoreSystem : false,
      badgeText: input.badgeText ?? existing?.badgeText ?? 'MODULE',
      minVipLevel: input.minVipLevel ?? existing?.minVipLevel ?? 1,
      config: input.config ?? existing?.config ?? {},
      updatedAt: Date.now(),
      updatedBy: adminId
    };

    this.featureModules[cleanId] = updated;
    this.syncAdminSettingsFromFeature(cleanId, updated.enabled);
    this.adminSettings.featureModulesMap = { ...this.featureModules };
    this.adminSettings.updatedAt = Date.now();

    if (this.onAdminSettingsSaved) {
      try { this.onAdminSettingsSaved(this.adminSettings); } catch (e) { console.warn('onAdminSettingsSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'FEATURE',
      action: isNew ? 'FEATURE_ADDED' : 'FEATURE_CONFIGURED',
      details: `${isNew ? 'Added new' : 'Updated'} feature module "${updated.name}" (${cleanId}) [Status: ${updated.status}, Visible: ${updated.visibleInUserApp}]. Reason: ${reason}`,
      affectedRecordId: cleanId,
      reason,
      outcome: 'SUCCESS'
    });
    this.notify();
    return { success: true, module: updated };
  }

  public removeFeatureModule(
    featureId: string,
    adminId: string,
    reason: string
  ): { success: boolean; error?: string } {
    const mod = this.featureModules[featureId];
    if (!mod) return { success: false, error: 'Feature module not found' };

    if (mod.isCoreSystem) {
      const hasPendingBets = this.liveBets.some((b) => b.status === 'pending' && (b.gameId === featureId || featureId.startsWith('wingo')));
      const hasPendingDeposits = featureId === 'deposits' && this.deposits.some((d) => d.status === 'pending');
      const hasPendingWithdrawals = featureId === 'withdrawals' && this.withdrawals.some((w) => w.status === 'pending');

      if (hasPendingBets || hasPendingDeposits || hasPendingWithdrawals) {
        return {
          success: false,
          error: `Dependency check failed: "${mod.name}" has active pending transactions/bets. Disable or pause the module instead.`
        };
      }
    }

    this.deletedFeaturesBackup[featureId] = { ...mod, updatedAt: Date.now(), updatedBy: adminId };
    delete this.featureModules[featureId];
    this.syncAdminSettingsFromFeature(featureId, false);
    this.adminSettings.featureModulesMap = { ...this.featureModules };
    this.adminSettings.updatedAt = Date.now();

    if (this.onAdminSettingsSaved) {
      try { this.onAdminSettingsSaved(this.adminSettings); } catch (e) { console.warn('onAdminSettingsSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'FEATURE',
      action: 'FEATURE_SAFELY_REMOVED',
      details: `Safely removed feature module "${mod.name}" (${featureId}) after dependency check and backup snapshot. Reason: ${reason}`,
      affectedRecordId: featureId,
      reason,
      outcome: 'BACKUP_CREATED'
    });
    this.notify();
    return { success: true };
  }

  public restoreFeatureModule(featureId: string, adminId: string): { success: boolean; error?: string } {
    const backup = this.deletedFeaturesBackup[featureId];
    if (!backup) return { success: false, error: 'Feature backup not found' };

    this.featureModules[featureId] = {
      ...backup,
      enabled: true,
      status: 'active',
      updatedAt: Date.now(),
      updatedBy: adminId
    };
    delete this.deletedFeaturesBackup[featureId];
    this.syncAdminSettingsFromFeature(featureId, true);
    this.adminSettings.featureModulesMap = { ...this.featureModules };
    this.adminSettings.updatedAt = Date.now();

    if (this.onAdminSettingsSaved) {
      try { this.onAdminSettingsSaved(this.adminSettings); } catch (e) { console.warn('onAdminSettingsSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'FEATURE',
      action: 'FEATURE_RESTORED',
      details: `Restored feature module "${backup.name}" (${featureId}) from backup.`,
      affectedRecordId: featureId,
      outcome: 'SUCCESS'
    });
    this.notify();
    return { success: true };
  }

  private syncAdminSettingsFromFeature(featureId: string, enabled: boolean) {
    const map: Record<string, (keyof AdminSettings)[]> = {
      wingo: ['wingoEnabled'],
      wingo_30s: ['featureWinGo30s', 'wingoEnabled'],
      wingo_1min: ['featureWinGo1min'],
      wingo_3min: ['featureWinGo3min'],
      trx_wingo: ['featureTrxWinGo', 'trxEnabled'],
      aviator: ['featureAviator', 'aviatorEnabled'],
      k3_dice: ['featureK3Dice', 'k3Enabled'],
      ludo: ['ludoEnabled'],
      dragon_tiger: ['dragonTigerEnabled'],
      quiz_battle: ['liveQuizEnabled'],
      wheel: ['wheelEnabled'],
      user_signup: ['allowUserSignup'],
      user_login: ['allowUserLogin'],
      deposits: ['featureDeposits', 'allowUpiDeposit'],
      withdrawals: ['featureWithdrawals', 'allowWithdrawals'],
      bank_withdrawal: ['allowBankWithdrawal'],
      usdt_deposit: ['featureUsdtDeposit', 'allowUsdtDeposit'],
      usdt_withdrawal: ['featureUsdtWithdrawal', 'allowUsdtWithdrawal'],
      ludo_voice_chat: ['ludoVoiceChatEnabled'],
      ludo_chat_presets: ['ludoChatPresetsEnabled'],
      gift_codes: ['featureGiftCodes'],
      referrals: ['featureReferrals'],
      signup_bonus: ['featureSignupBonus'],
      first_deposit_bonus: ['featureFirstDepositBonus'],
      mlm_affiliate: ['featureMlm'],
      live_support: ['featureLiveChat'],
      device_approval: ['featureDeviceApproval']
    };
    const keys = map[featureId];
    if (keys) {
      keys.forEach((k) => {
        (this.adminSettings as unknown as Record<string, unknown>)[k] = enabled;
      });
    }
  }

  public updateAdminSettings(newSettings: Partial<AdminSettings>, adminId: string) {
    const merged: AdminSettings = {
      ...this.adminSettings,
      ...newSettings,
      updatedAt: Date.now()
    };
    if (newSettings.officialUpiId !== undefined) {
      merged.upiId = newSettings.officialUpiId;
    } else if (newSettings.upiId !== undefined) {
      merged.officialUpiId = newSettings.upiId;
    }
    if (newSettings.officialUpiName !== undefined) {
      merged.upiMerchantName = newSettings.officialUpiName;
    } else if (newSettings.upiMerchantName !== undefined) {
      merged.officialUpiName = newSettings.upiMerchantName;
    }
    if (newSettings.secondaryUpiId !== undefined) {
      merged.secondaryUpiId = newSettings.secondaryUpiId.trim();
    }
    if (newSettings.secondaryUpiName !== undefined) {
      merged.secondaryUpiName = newSettings.secondaryUpiName.trim();
    }
    if (newSettings.referralQualifyingDays !== undefined) {
      merged.referralRequiredDays = newSettings.referralQualifyingDays;
    } else if (newSettings.referralRequiredDays !== undefined) {
      merged.referralQualifyingDays = newSettings.referralRequiredDays;
    }
    if (newSettings.referralQualifyingBet !== undefined) {
      merged.referralDailyBetRequirement = newSettings.referralQualifyingBet;
    } else if (newSettings.referralDailyBetRequirement !== undefined) {
      merged.referralQualifyingBet = newSettings.referralDailyBetRequirement;
    }
    this.adminSettings = merged;
    this.ingestCloudAdminSettings(merged);

    if (newSettings.maintenanceMode !== undefined) {
      this.logAudit({
        actor: adminId,
        category: 'SETTINGS',
        action: newSettings.maintenanceMode ? 'ENABLE_MAINTENANCE_MODE' : 'DISABLE_MAINTENANCE_MODE',
        details: `Master Admin ${newSettings.maintenanceMode ? 'ACTIVATED' : 'DEACTIVATED'} platform Maintenance Mode. New bets are ${newSettings.maintenanceMode ? 'PAUSED' : 'ACTIVE'}.${newSettings.maintenanceMessage ? ` Message: "${newSettings.maintenanceMessage}"` : ''}`,
        outcome: 'SUCCESS'
      });
    } else {
      this.logAudit({
        actor: adminId,
        category: 'SETTINGS',
        action: 'UPDATE_MASTER_SETTINGS',
        details: `Updated platform & bonus configuration parameters.`,
        outcome: 'SUCCESS'
      });
    }
    if (this.onAdminSettingsSaved) {
      try { this.onAdminSettingsSaved(this.adminSettings); } catch (e) { console.warn('onAdminSettingsSaved error:', e); }
    }
    this.notify();
  }

  // --- MULTIPLE UPI CHANNELS CASHIER MANAGEMENT ---
  public getUpiChannels(): UpiChannel[] {
    if (!Array.isArray(this.adminSettings.upiChannels) || this.adminSettings.upiChannels.length === 0) {
      this.adminSettings.upiChannels = [
        {
          id: 'upi_1',
          upiId: this.adminSettings.officialUpiId || 'BHARATPE09905641446@yesbankltd',
          merchantName: this.adminSettings.officialUpiName || 'BHARATPE ENTERPRISES',
          isActive: true,
          label: 'Channel 1 (Official Primary)'
        },
        {
          id: 'upi_2',
          upiId: this.adminSettings.secondaryUpiId || 'suman.1299@superyes',
          merchantName: this.adminSettings.secondaryUpiName || 'SUMAN ENTERPRISES',
          isActive: false,
          label: 'Channel 2 (Backup Receiver)'
        }
      ];
      this.adminSettings.activeUpiChannelId = 'upi_1';
    }
    return this.adminSettings.upiChannels;
  }

  public getActiveUpiChannel(): UpiChannel {
    const channels = this.getUpiChannels();
    const active = channels.find((c) => c.id === this.adminSettings.activeUpiChannelId || c.isActive) || channels[0];
    return active;
  }

  public setActiveUpiChannel(channelId: string, adminId: string = 'MasterAdmin'): boolean {
    const channels = this.getUpiChannels();
    const target = channels.find((c) => c.id === channelId);
    if (!target) return false;

    channels.forEach((c) => {
      c.isActive = c.id === channelId;
    });

    this.adminSettings.upiChannels = [...channels];
    this.adminSettings.activeUpiChannelId = channelId;
    this.adminSettings.officialUpiId = target.upiId;
    this.adminSettings.officialUpiName = target.merchantName;
    this.adminSettings.upiId = target.upiId;
    this.adminSettings.upiMerchantName = target.merchantName;
    this.adminSettings.updatedAt = Date.now();

    if (this.onAdminSettingsSaved) {
      try { this.onAdminSettingsSaved(this.adminSettings); } catch (e) { console.warn('onAdminSettingsSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'FINANCIAL',
      action: 'ACTIVE_UPI_CHANNEL_CHANGED',
      details: `Active player deposit UPI set to "${target.merchantName}" (${target.upiId})`,
      outcome: 'SUCCESS'
    });

    this.saveToStorage();
    this.notify();
    return true;
  }

  public addUpiChannel(
    channel: { upiId: string; merchantName: string; label?: string; setAsActive?: boolean },
    adminId: string = 'MasterAdmin'
  ): UpiChannel {
    const channels = this.getUpiChannels();
    const cleanUpi = channel.upiId.trim();
    const cleanName = channel.merchantName.trim();
    const newId = `upi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newChannel: UpiChannel = {
      id: newId,
      upiId: cleanUpi,
      merchantName: cleanName || 'OFFICIAL CASHIER',
      isActive: Boolean(channel.setAsActive),
      label: channel.label || `UPI Channel ${channels.length + 1}`,
      addedAt: Date.now()
    };

    if (channel.setAsActive || channels.length === 0) {
      channels.forEach((c) => { c.isActive = false; });
      newChannel.isActive = true;
      this.adminSettings.activeUpiChannelId = newId;
      this.adminSettings.officialUpiId = cleanUpi;
      this.adminSettings.officialUpiName = newChannel.merchantName;
      this.adminSettings.upiId = cleanUpi;
      this.adminSettings.upiMerchantName = newChannel.merchantName;
    }

    channels.push(newChannel);
    this.adminSettings.upiChannels = [...channels];
    this.adminSettings.updatedAt = Date.now();

    if (this.onAdminSettingsSaved) {
      try { this.onAdminSettingsSaved(this.adminSettings); } catch (e) { console.warn('onAdminSettingsSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'FINANCIAL',
      action: 'ADD_UPI_CHANNEL',
      details: `Added new UPI Cashier ID: ${cleanUpi} (${newChannel.merchantName})`,
      outcome: 'SUCCESS'
    });

    this.saveToStorage();
    this.notify();
    return newChannel;
  }

  public deleteUpiChannel(channelId: string, adminId: string = 'MasterAdmin'): boolean {
    const channels = this.getUpiChannels();
    if (channels.length <= 1) return false;
    const idx = channels.findIndex((c) => c.id === channelId);
    if (idx === -1) return false;

    const [deleted] = channels.splice(idx, 1);
    if (deleted.isActive || this.adminSettings.activeUpiChannelId === channelId) {
      channels[0].isActive = true;
      this.adminSettings.activeUpiChannelId = channels[0].id;
      this.adminSettings.officialUpiId = channels[0].upiId;
      this.adminSettings.officialUpiName = channels[0].merchantName;
      this.adminSettings.upiId = channels[0].upiId;
      this.adminSettings.upiMerchantName = channels[0].merchantName;
    }

    this.adminSettings.upiChannels = [...channels];
    this.adminSettings.updatedAt = Date.now();

    if (this.onAdminSettingsSaved) {
      try { this.onAdminSettingsSaved(this.adminSettings); } catch (e) { console.warn('onAdminSettingsSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'FINANCIAL',
      action: 'DELETE_UPI_CHANNEL',
      details: `Deleted UPI Cashier ID: ${deleted.upiId} (${deleted.merchantName})`,
      outcome: 'SUCCESS'
    });

    this.saveToStorage();
    this.notify();
    return true;
  }

  // --- CLEAN DEMO TRANSACTIONS (PURGE MOCK / TEST DATA SO REAL LEDGER REMAINS 100% CLEAN) ---
  public clearDemoTransactions(adminId: string = 'MasterAdmin'): { purgedCount: number; message: string } {
    const beforeCount = this.transactions.length;
    const realUserUids = new Set(Object.keys(this.users));

    this.transactions = this.transactions.filter((tx) => {
      const isDemoMeta = Boolean(tx.metadata?.isDemo || tx.metadata?.demo);
      const isDemoDesc = /demo|test_user|mock|sample/i.test(tx.description || '');
      const isDemoRef = /demo|mock|test/i.test(tx.referenceId || '');
      const isDemoUid = /demo|test/i.test(tx.uid || '');
      const isOrphan = !realUserUids.has(tx.uid);

      return !isDemoMeta && !isDemoDesc && !isDemoRef && !isDemoUid && !isOrphan;
    });

    const purgedCount = beforeCount - this.transactions.length;

    Object.keys(this.users).forEach((uid) => {
      const currentBal = this.users[uid].balance;
      if (typeof currentBal !== 'number' || !Number.isFinite(currentBal) || currentBal < 0) {
        this.users[uid].balance = this.computeVerifiedLedgerBalance(uid);
      }
    });

    this.saveToStorage();
    this.savePermanentUsersRegistry();

    if (typeof window !== 'undefined') {
      fetch('/api/admin/clean-demo-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId })
      }).catch(() => {});
    }

    this.logAudit({
      actor: adminId,
      category: 'FINANCIAL',
      action: 'CLEARED_DEMO_TRANSACTIONS',
      details: `Purged ${purgedCount} demo/test transactions from ledger. Real transaction history is 100% clean.`,
      outcome: 'SUCCESS'
    });

    this.notify();
    return {
      purgedCount,
      message: `Cleaned ${purgedCount} demo/test transactions. Real transaction history is 100% clean.`
    };
  }

  public updateFirebaseConfig(config: FirebaseConnectionConfig, adminId?: string) {
    this.firebaseConfig = config;
    if (adminId) {
      this.logAudit({
        actor: adminId,
        category: 'SETTINGS',
        action: 'UPDATE_FIREBASE_CONFIG',
        details: 'Updated Firebase configuration',
        outcome: 'SUCCESS'
      });
    }
    this.notify();
  }

  public logAudit(log: Omit<AuditLogItem, 'id' | 'timestamp'>) {
    const item: AuditLogItem = { ...log, id: 'log_' + Math.random().toString(36).substring(2, 9), timestamp: Date.now() };
    this.auditLogs.unshift(item);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    this.saveToStorage();
  }

  // --- MANUAL USER CREATION & PROFILE EDITING (MASTER ADMIN) ---
  public createManualUser(
    input: {
      username: string;
      phone: string;
      password?: string;
      vipLevel?: number;
      initialBalance?: number;
      reason?: string;
    },
    adminId: string
  ): { success: boolean; error?: string; user?: UserRecord } {
    const cleanPhone = input.phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }
    if (!input.username.trim()) {
      return { success: false, error: 'Username is required' };
    }
    const existing = Object.values(this.users).find((u) => u.phone === cleanPhone);
    if (existing) {
      return { success: false, error: `A user with phone +91 ${cleanPhone} already exists (${existing.uid})` };
    }

    const uid = 'U' + Math.floor(100000 + Math.random() * 900000).toString();
    const referralCode = 'REF' + cleanPhone.slice(-4) + Math.floor(10 + Math.random() * 89);

    const newUser: UserRecord = {
      uid,
      username: input.username.trim(),
      phone: cleanPhone,
      passwordHash: input.password || '123456',
      balance: 0,
      vipLevel: Math.max(0, Math.min(10, Number(input.vipLevel) || 1)),
      status: 'active',
      createdAt: Date.now(),
      lastActive: Date.now(),
      lastLogin: Date.now(),
      isOnline: false,
      totalBetsCount: 0,
      totalWonAmount: 0,
      totalLostAmount: 0,
      referralCode,
      signupBonusStatus: 'pending',
      signupBonusAmount: this.adminSettings.signupBonusAmount || 120,
      signupBonusPending: this.adminSettings.featureSignupBonus !== false ? this.adminSettings.signupBonusAmount : 0,
      signupBonusClaimed: false,
      firstDepositBonusStatus: 'pending',
      firstDepositBonusClaimed: false,
      devices: {}
    };

    this.users[uid] = newUser;

    if (input.initialBalance && input.initialBalance > 0) {
      this.executeWalletTransaction({
        uid,
        type: 'admin_adjustment',
        category: 'credit',
        amount: input.initialBalance,
        referenceId: `init_${Date.now()}`,
        description: `Initial balance credited on manual user creation (${input.reason || 'Admin onboarding'})`
      });
    }

    this.savePermanentUsersRegistry();
    if (this.onUserSaved) {
      try { this.onUserSaved(newUser); } catch (e) { console.warn('onUserSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'AUTH',
      action: 'MANUAL_USER_CREATED',
      details: `Created user ${newUser.username} (${uid}, +91 ${cleanPhone}) with opening balance ₹${newUser.balance.toFixed(2)}.`,
      targetUser: uid,
      affectedRecordId: uid,
      reason: input.reason || 'Manual user onboarding',
      outcome: 'SUCCESS'
    });

    this.notify();
    return { success: true, user: newUser };
  }

  public updateUserProfile(
    uid: string,
    updates: {
      username?: string;
      phone?: string;
      password?: string;
      referralCode?: string;
      vipLevel?: number;
      status?: UserRecord['status'];
      reason: string;
    },
    adminId: string
  ): { success: boolean; error?: string; user?: UserRecord } {
    const user = this.users[uid];
    if (!user) return { success: false, error: 'User not found' };
    if (!updates.reason.trim()) return { success: false, error: 'Mandatory audit reason required' };

    if (updates.username && updates.username.trim()) {
      user.username = updates.username.trim();
    }
    if (updates.phone) {
      const cleanPhone = updates.phone.replace(/\D/g, '').slice(-10);
      if (cleanPhone.length === 10) user.phone = cleanPhone;
    }
    if (updates.password && updates.password.trim()) {
      user.passwordHash = updates.password.trim();
    }
    if (updates.referralCode && updates.referralCode.trim()) {
      user.referralCode = updates.referralCode.trim().toUpperCase();
    }
    if (typeof updates.vipLevel === 'number') {
      user.vipLevel = Math.max(0, Math.min(10, updates.vipLevel));
    }
    if (updates.status) {
      user.status = updates.status;
    }

    this.savePermanentUsersRegistry();
    if (typeof window !== 'undefined') {
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          phone: user.phone,
          username: user.username,
          password: user.passwordHash,
          uid: user.uid
        })
      }).catch(() => {});
    }
    if (this.onUserSaved) {
      try { this.onUserSaved(user); } catch (e) { console.warn('onUserSaved error:', e); }
    }

    this.logAudit({
      actor: adminId,
      category: 'AUTH',
      action: 'USER_PROFILE_EDITED',
      details: `Updated user ${user.username} (${uid}) [Phone: +91 ${user.phone}, VIP: ${user.vipLevel}, Status: ${user.status}${updates.password ? ', Password Updated' : ''}]. Reason: ${updates.reason}`,
      targetUser: uid,
      affectedRecordId: uid,
      reason: updates.reason,
      outcome: 'SUCCESS'
    });

    this.notify();
    return { success: true, user };
  }

  public getAllTransactionsFlat(): WalletTransaction[] {
    if (Array.isArray(this.transactions)) {
      return [...this.transactions].sort((a, b) => b.timestamp - a.timestamp);
    }
    const all: WalletTransaction[] = [];
    Object.values(this.transactions as Record<string, WalletTransaction[]>).forEach((list) => {
      if (Array.isArray(list)) {
        all.push(...list);
      }
    });
    return all.sort((a, b) => b.timestamp - a.timestamp);
  }

  // --- DATA EXPORT, IMPORT, BACKUP & RESTORE ENGINE ---
  public exportAllDataJson(): string {
    const payload = {
      schemaVersion: '2026.2.0',
      exportedAt: Date.now(),
      exportedAtIso: new Date().toISOString(),
      users: this.users,
      transactions: this.transactions,
      deposits: this.deposits,
      withdrawals: this.withdrawals,
      referrals: this.referrals,
      giftCodes: this.giftCodes,
      featureModules: this.featureModules,
      adminSettings: this.adminSettings,
      pastRounds: this.pastRounds,
      liveBets: this.liveBets,
      auditLogs: this.auditLogs,
      userNotifications: this.userNotifications
    };
    return JSON.stringify(payload, null, 2);
  }

  public exportFullDatabaseJson(adminId?: string): string {
    if (adminId) {
      this.logAudit({
        actor: adminId,
        category: 'SETTINGS',
        action: 'DATA_BACKUP_EXPORTED',
        details: 'Admin exported full JSON database backup snapshot',
        outcome: 'SUCCESS'
      });
    }
    return this.exportAllDataJson();
  }

  public importDatabaseJson(rawJson: string, adminId: string): { success: boolean; error?: string; restoredUsers?: number; restoredTransactions?: number } {
    try {
      const parsed = JSON.parse(rawJson);
      const res = this.importBackupData(rawJson, adminId);
      const restoredUsers = parsed.users ? Object.keys(parsed.users).length : 0;
      let restoredTransactions = 0;
      if (Array.isArray(parsed.transactions)) {
        restoredTransactions = parsed.transactions.length;
      } else if (parsed.transactions && typeof parsed.transactions === 'object') {
        Object.values(parsed.transactions).forEach((txList: unknown) => {
          if (Array.isArray(txList)) restoredTransactions += (txList as WalletTransaction[]).length;
        });
      }
      return {
        success: res.success,
        error: res.error,
        restoredUsers,
        restoredTransactions
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to parse JSON backup' };
    }
  }

  public exportSettingsJson(): string {
    const payload = {
      schemaVersion: '2026.2.0',
      exportedAt: Date.now(),
      adminSettings: this.adminSettings,
      featureModules: this.featureModules,
      giftCodes: this.giftCodes
    };
    return JSON.stringify(payload, null, 2);
  }

  public exportUsersCsv(): string {
    const headers = ['UID', 'Username', 'Phone', 'Status', 'Balance', 'VIP_Level', 'Total_Bets', 'Total_Won', 'Total_Lost', 'Referral_Code', 'Created_At'];
    const rows = Object.values(this.users).map((u) => [
      u.uid,
      `"${(u.username || '').replace(/"/g, '""')}"`,
      u.phone,
      u.status,
      u.balance.toFixed(2),
      u.vipLevel,
      u.totalBetsCount,
      u.totalWonAmount.toFixed(2),
      u.totalLostAmount.toFixed(2),
      u.referralCode || '',
      new Date(u.createdAt).toISOString()
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportTransactionsCsv(): string {
    const headers = ['Transaction_ID', 'UID', 'Category', 'Type', 'Amount', 'Balance_Before', 'Balance_After', 'Reference_ID', 'Description', 'Timestamp'];
    const allTx = this.getAllTransactionsFlat();
    const rows = allTx.map((t) => [
      t.id,
      t.uid,
      t.category,
      t.type,
      t.amount.toFixed(2),
      t.balanceBefore.toFixed(2),
      t.balanceAfter.toFixed(2),
      t.referenceId || '',
      `"${(t.description || '').replace(/"/g, '""')}"`,
      new Date(t.timestamp).toISOString()
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public validateImportPayload(rawJson: string): {
    valid: boolean;
    error?: string;
    summary?: {
      usersCount: number;
      depositsCount: number;
      withdrawalsCount: number;
      giftCodesCount: number;
      featuresCount: number;
      hasSettings: boolean;
    };
  } {
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'Invalid JSON object root' };
      }
      const usersCount = parsed.users && typeof parsed.users === 'object' ? Object.keys(parsed.users).length : 0;
      const depositsCount = Array.isArray(parsed.deposits) ? parsed.deposits.length : 0;
      const withdrawalsCount = Array.isArray(parsed.withdrawals) ? parsed.withdrawals.length : 0;
      const giftCodesCount = Array.isArray(parsed.giftCodes) ? parsed.giftCodes.length : 0;
      const featuresCount = parsed.featureModules && typeof parsed.featureModules === 'object' ? Object.keys(parsed.featureModules).length : 0;
      const hasSettings = Boolean(parsed.adminSettings && typeof parsed.adminSettings === 'object');

      if (usersCount === 0 && !hasSettings && giftCodesCount === 0 && featuresCount === 0) {
        return { valid: false, error: 'File does not contain valid Bingo777 users, settings, features, or gift codes.' };
      }

      return {
        valid: true,
        summary: {
          usersCount,
          depositsCount,
          withdrawalsCount,
          giftCodesCount,
          featuresCount,
          hasSettings
        }
      };
    } catch (e: unknown) {
      return { valid: false, error: e instanceof Error ? e.message : 'Malformed JSON file' };
    }
  }

  public importBackupData(rawJson: string, adminId: string): { success: boolean; error?: string; backupKey?: string } {
    const check = this.validateImportPayload(rawJson);
    if (!check.valid) {
      return { success: false, error: check.error };
    }
    // Always create a safety backup before importing
    const backupKey = this.backupDataBeforeMigration();
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed.users && typeof parsed.users === 'object') {
        // Merge users safely without deleting existing valid accounts or overwriting transactions
        Object.entries(parsed.users).forEach(([uid, u]) => {
          if (!this.users[uid]) {
            this.users[uid] = u as UserRecord;
          } else {
            this.users[uid] = { ...this.users[uid], ...(u as UserRecord) };
          }
        });
      }
      if (Array.isArray(parsed.transactions)) {
        const existingIds = new Set(this.transactions.map((t) => t.id));
        (parsed.transactions as WalletTransaction[]).forEach((t) => {
          if (t && t.id && !existingIds.has(t.id)) {
            this.transactions.push(t);
          }
        });
        this.transactions.sort((a, b) => b.timestamp - a.timestamp);
      } else if (parsed.transactions && typeof parsed.transactions === 'object') {
        const existingIds = new Set(this.transactions.map((t) => t.id));
        Object.values(parsed.transactions).forEach((txs) => {
          if (Array.isArray(txs)) {
            (txs as WalletTransaction[]).forEach((t) => {
              if (t && t.id && !existingIds.has(t.id)) {
                this.transactions.push(t);
                existingIds.add(t.id);
              }
            });
          }
        });
        this.transactions.sort((a, b) => b.timestamp - a.timestamp);
      }
      if (parsed.adminSettings && typeof parsed.adminSettings === 'object') {
        this.adminSettings = { ...this.adminSettings, ...parsed.adminSettings };
      }
      if (parsed.featureModules && typeof parsed.featureModules === 'object') {
        this.featureModules = { ...this.featureModules, ...parsed.featureModules };
      }
      if (Array.isArray(parsed.giftCodes)) {
        parsed.giftCodes.forEach((g: GiftCode) => {
          if (g && g.code) this.giftCodes[g.code] = g;
        });
      } else if (parsed.giftCodes && typeof parsed.giftCodes === 'object') {
        this.giftCodes = { ...this.giftCodes, ...parsed.giftCodes };
      }

      this.logAudit({
        actor: adminId,
        category: 'SETTINGS',
        action: 'DATA_IMPORT_EXECUTED',
        details: `Imported backup data safely (Pre-import snapshot: ${backupKey}).`,
        affectedRecordId: backupKey,
        outcome: 'SUCCESS'
      });

      this.notify();
      return { success: true, backupKey };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to import data' };
    }
  }

  public getSavedBackupsList(): Array<{ key: string; timestamp: number; sizeBytes: number }> {
    const list: Array<{ key: string; timestamp: number; sizeBytes: number }> = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('bingo777_backup_')) {
          const val = localStorage.getItem(key) || '';
          const tsPart = Number(key.replace('bingo777_backup_', '')) || Date.now();
          list.push({
            key,
            timestamp: tsPart,
            sizeBytes: val.length
          });
        }
      }
    } catch {
      // Ignore storage access errors
    }
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }

  public restoreFromBackupKey(key: string, adminId: string): { success: boolean; error?: string } {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return { success: false, error: 'Backup snapshot not found in storage' };
      return this.importBackupData(raw, adminId);
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to restore snapshot' };
    }
  }
}

export const store = new AuthoritativeStore();
