import {
  db,
  rtdb,
  auth,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  rtdbRef,
  rtdbSet,
  rtdbGet,
  rtdbOnValue,
  rtdbUpdate,
  rtdbRemove,
  rtdbRunTransaction
} from '../firebase';
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth';
import { getDocs } from 'firebase/firestore';
import {
  UserRecord,
  WalletTransaction,
  DepositRecord,
  WithdrawalRecord,
  LiveBet,
  ReferralRecord,
  AdminSettings,
  GameRound
} from '../types';
import { store } from './store';

class FirebaseSyncService {
  private activeUserUnsubscribe: (() => void) | null = null;
  private activeRtdbUserUnsubscribe: (() => void) | null = null;
  private activeRtdbSettingsUnsubscribe: (() => void) | null = null;
  private globalUnsubscribes: Array<() => void> = [];
  private currentSyncedUid: string | null = null;
  private authPromise: Promise<boolean> | null = null;
  private listenersAttached = false;
  private rtdbListenersAttached = false;
  private hourlyCleanupTimer: ReturnType<typeof setInterval> | null = null;
  private isCleanupRunning = false;

  constructor() {
    this.bindStoreHooks();
    this.attachRealtimeDatabaseListeners();
    this.initAuthListener();
    this.startAutomatedHourlyCleanupRoutine();
  }

  /**
   * Ensures the client has a valid Firebase Auth session (Anonymous or Phone)
   * so Firestore & RTDB security rules always succeed on every device/APK.
   */
  private async ensureAuth(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (auth.currentUser) return true;
    if (this.authPromise) return this.authPromise;

    this.authPromise = (async () => {
      try {
        await signInAnonymously(auth);
        return true;
      } catch (err) {
        console.warn('[FirebaseSync] Anonymous auth notice:', err);
        return Boolean(auth.currentUser);
      } finally {
        this.authPromise = null;
      }
    })();

    return this.authPromise;
  }

  private bindStoreHooks() {
    store.onUserSaved = (user) => {
      this.pushUserToFirestore(user);
    };
    store.onTransactionSaved = (tx) => {
      this.pushTransactionToFirestore(tx);
    };
    store.onDepositSaved = (dep) => {
      this.pushDepositToFirestore(dep);
    };
    store.onWithdrawalSaved = (w) => {
      this.pushWithdrawalToFirestore(w);
    };
    store.onLiveBetSaved = (bet) => {
      this.pushLiveBetToFirestore(bet);
    };
    store.onReferralSaved = (ref) => {
      this.pushReferralToFirestore(ref);
    };
    store.onAdminSettingsSaved = (settings) => {
      this.pushAdminSettingsToRtdb(settings);
    };
    store.onRoundSynced = (round) => {
      this.pushRoundToRtdb(round);
    };
    store.onAviatorRoundSynced = (round, liveMult) => {
      this.pushAviatorRoundToFirestore(round, liveMult);
    };
  }

  /**
   * Attaches direct Firebase Realtime Database (`firebase/database`) onValue listeners
   * immediately on startup so multi-device timers, users, bets, deposits, and maintenance mode
   * synchronize within <1 second across all phones and Admin Console.
   */
  private attachRealtimeDatabaseListeners() {
    if (typeof window === 'undefined' || this.rtdbListenersAttached) return;
    this.rtdbListenersAttached = true;

    // 1. Server Time Offset synchronization for identical countdowns across all devices
    try {
      const offsetUnsub = rtdbOnValue(
        rtdbRef(rtdb, '.info/serverTimeOffset'),
        (snap) => {
          const offset = Number(snap.val()) || 0;
          store.setServerTimeOffset(offset);
        },
        () => {}
      );
      this.globalUnsubscribes.push(offsetUnsub);
    } catch {}

    // 2. Real-time RTDB listener on /admin_settings & /admin_settings/maintenanceMode
    try {
      const settingsUnsub = rtdbOnValue(
        rtdbRef(rtdb, 'admin_settings'),
        (snap) => {
          if (snap.exists()) {
            const val = snap.val();
            if (val && typeof val === 'object') {
              store.ingestCloudAdminSettings(val as Partial<AdminSettings>);
            }
          }
        },
        () => {}
      );
      this.globalUnsubscribes.push(settingsUnsub);
    } catch {}

    // 3. Real-time RTDB listener on /current_round & /wingo_rounds
    try {
      const currentRoundUnsub = rtdbOnValue(
        rtdbRef(rtdb, 'current_round'),
        (snap) => {
          if (!snap.exists()) return;
          const val = snap.val();
          if (!val || typeof val !== 'object') return;
          if (val.period && val.gameType) {
            store.ingestCloudRound(val as Partial<GameRound>);
          }
          const modes: Array<'30s' | '1min' | '3min'> = ['30s', '1min', '3min'];
          modes.forEach((m) => {
            if (val[m] && typeof val[m] === 'object' && val[m].period) {
              store.ingestCloudRound(val[m] as Partial<GameRound>);
            }
          });
        },
        () => {}
      );
      this.globalUnsubscribes.push(currentRoundUnsub);
    } catch {}

    const modes: Array<'30s' | '1min' | '3min'> = ['30s', '1min', '3min'];
    modes.forEach((mode) => {
      try {
        const modeUnsub = rtdbOnValue(
          rtdbRef(rtdb, `wingo_rounds/${mode}`),
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              if (data && typeof data === 'object' && data.period) {
                store.ingestCloudRound(data);
              }
            }
          },
          () => {}
        );
        this.globalUnsubscribes.push(modeUnsub);

        const resolvedUnsub = rtdbOnValue(
          rtdbRef(rtdb, `wingo_rounds/resolved_${mode}`),
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              if (data && typeof data === 'object' && data.period) {
                store.ingestCloudRound(data);
              }
            }
          },
          () => {}
        );
        this.globalUnsubscribes.push(resolvedUnsub);
      } catch {}
    });

    // Listen to /admin_settings/wingo_override in RTDB for instant (<200ms) Color, Size, and Number outcome locks
    try {
      const wingoOverrideUnsub = rtdbOnValue(
        rtdbRef(rtdb, 'admin_settings/wingo_override'),
        (snap) => {
          const val = snap.exists() ? snap.val() : {};
          store.ingestCloudWinGoOverrides(val || {});
        },
        () => {}
      );
      this.globalUnsubscribes.push(wingoOverrideUnsub);
    } catch {}

    // Listen to /past_rounds in RTDB for instant completed round history updates (supports both /past_rounds/{period} and /past_rounds/{gameType}/{period})
    try {
      const pastRoundsUnsub = rtdbOnValue(
        rtdbRef(rtdb, 'past_rounds'),
        (snap) => {
          if (!snap.exists()) return;
          const val = snap.val();
          if (!val || typeof val !== 'object') return;
          Object.values(val).forEach((item: any) => {
            if (item && typeof item === 'object') {
              if (item.period && item.isResolved) {
                store.ingestCloudRound(item as Partial<GameRound>);
              } else {
                // Nested /past_rounds/{gameType}/{period}
                Object.values(item).forEach((subItem: any) => {
                  if (subItem && typeof subItem === 'object' && subItem.period && subItem.isResolved) {
                    store.ingestCloudRound(subItem as Partial<GameRound>);
                  }
                });
              }
            }
          });
        },
        () => {}
      );
      this.globalUnsubscribes.push(pastRoundsUnsub);
    } catch {}

    // 4. Real-time RTDB listener on /users
    try {
      const usersUnsub = rtdbOnValue(
        rtdbRef(rtdb, 'users'),
        (snap) => {
          if (!snap.exists()) return;
          const val = snap.val();
          if (!val || typeof val !== 'object') return;
          Object.entries(val).forEach(([key, raw]: [string, any]) => {
            if (raw && typeof raw === 'object') {
              const uid = raw.uid || key;
              if (uid && !String(uid).startsWith('usr_demo_')) {
                store.updateUserFromFirestore({
                  ...raw,
                  uid
                });
              }
            }
          });
        },
        () => {}
      );
      this.globalUnsubscribes.push(usersUnsub);
    } catch {}

    // 5. Real-time RTDB listener on /deposits
    try {
      const depsUnsub = rtdbOnValue(
        rtdbRef(rtdb, 'deposits'),
        (snap) => {
          if (!snap.exists()) return;
          const val = snap.val();
          if (!val || typeof val !== 'object') return;
          Object.entries(val).forEach(([key, raw]: [string, any]) => {
            if (raw && typeof raw === 'object' && (raw.id || key)) {
              const dep: DepositRecord = {
                id: raw.id || key,
                uid: raw.uid,
                username: raw.username || `Player_${String(raw.uid || '').slice(-4)}`,
                phone: raw.phone || '',
                amount: Number(raw.amount) || 0,
                usdtAmount: raw.usdtAmount ? Number(raw.usdtAmount) : undefined,
                paymentMethod: raw.paymentMethod || raw.method || 'UPI',
                referenceId: raw.referenceId || raw.utrOrRef || '',
                upiReceiverId: raw.upiReceiverId || '',
                status: raw.status || 'pending',
                submittedAt: typeof raw.submittedAt === 'number' ? raw.submittedAt : Date.now(),
                reviewedAt: raw.reviewedAt || undefined,
                reviewedBy: raw.reviewedBy || undefined,
                adminNote: raw.adminNote || undefined
              };
              store.ingestCloudDeposit(dep);
            }
          });
        },
        () => {}
      );
      this.globalUnsubscribes.push(depsUnsub);
    } catch {}

    // 6. Real-time RTDB listener on /withdrawals
    try {
      const wUnsub = rtdbOnValue(
        rtdbRef(rtdb, 'withdrawals'),
        (snap) => {
          if (!snap.exists()) return;
          const val = snap.val();
          if (!val || typeof val !== 'object') return;
          Object.entries(val).forEach(([key, raw]: [string, any]) => {
            if (raw && typeof raw === 'object' && (raw.id || key)) {
              const item: WithdrawalRecord = {
                id: raw.id || key,
                uid: raw.uid,
                username: raw.username || `Player_${String(raw.uid || '').slice(-4)}`,
                phone: raw.phone || '',
                amount: Number(raw.amount) || 0,
                usdtAmount: raw.usdtAmount ? Number(raw.usdtAmount) : undefined,
                payoutMethod: raw.payoutMethod || (raw.method === 'BANK' ? 'Bank Transfer' : 'UPI'),
                accountDetails: raw.accountDetails || { upiId: raw.destination || '' },
                status: raw.status || 'pending',
                requestedAt: typeof raw.requestedAt === 'number' ? raw.requestedAt : Date.now(),
                processedAt: raw.processedAt || undefined,
                processedBy: raw.processedBy || undefined,
                rejectionReason: raw.rejectionReason || undefined
              };
              store.ingestCloudWithdrawal(item);
            }
          });
        },
        () => {}
      );
      this.globalUnsubscribes.push(wUnsub);
    } catch {}

    // 7. Real-time RTDB listener on /transactions
    try {
      const txUnsub = rtdbOnValue(
        rtdbRef(rtdb, 'transactions'),
        (snap) => {
          if (!snap.exists()) return;
          const val = snap.val();
          if (!val || typeof val !== 'object') return;
          Object.entries(val).forEach(([key, raw]: [string, any]) => {
            if (raw && typeof raw === 'object' && (raw.id || key) && raw.uid) {
              const tx: WalletTransaction = {
                id: raw.id || key,
                uid: raw.uid,
                type: raw.type,
                category: raw.category,
                amount: Number(raw.amount) || 0,
                balanceBefore: Number(raw.balanceBefore) || 0,
                balanceAfter: Number(raw.balanceAfter) || 0,
                referenceId: raw.referenceId || '',
                description: raw.description || '',
                timestamp: typeof raw.timestamp === 'number' ? raw.timestamp : Date.now(),
                status: raw.status || 'completed',
                metadata: raw.metadata || undefined,
                integritySeal: raw.integritySeal || undefined
              };
              store.ingestCloudTransaction(tx);
            }
          });
        },
        () => {}
      );
      this.globalUnsubscribes.push(txUnsub);
    } catch {}

    // 8. Real-time RTDB listener on /live_bets
    try {
      const betsUnsub = rtdbOnValue(
        rtdbRef(rtdb, 'live_bets'),
        (snap) => {
          if (!snap.exists()) return;
          const val = snap.val();
          if (!val || typeof val !== 'object') return;
          let changed = false;
          Object.entries(val).forEach(([key, raw]: [string, any]) => {
            if (raw && typeof raw === 'object' && (raw.betId || key)) {
              const bet: LiveBet = {
                betId: raw.betId || key,
                uid: raw.uid,
                username: raw.username || `Player_${String(raw.uid || '').slice(-4)}`,
                gameId: raw.gameId || (raw.gameType === 'dragon_tiger' ? 'dragon_tiger' : undefined),
                roundPeriod: raw.roundPeriod,
                gameType: raw.gameType || '30s',
                betType: raw.betType || (raw.gameType === 'dragon_tiger' ? 'dragon_tiger' : 'color'),
                betValue: String(raw.betValue),
                amount: Number(raw.amount) || 0,
                multiplier: Number(raw.multiplier) || 2,
                potentialPayout: Number(raw.potentialPayout) || 0,
                status: raw.status || 'pending',
                actualPayout: Number(raw.actualPayout) || 0,
                timestamp: typeof raw.timestamp === 'number' ? raw.timestamp : Date.now()
              };
              const existingIdx = store.liveBets.findIndex((item) => item.betId === bet.betId);
              if (existingIdx === -1) {
                store.liveBets.unshift(bet);
                changed = true;
              } else if (
                store.liveBets[existingIdx].status !== bet.status ||
                store.liveBets[existingIdx].actualPayout !== bet.actualPayout
              ) {
                store.liveBets[existingIdx] = { ...store.liveBets[existingIdx], ...bet };
                changed = true;
              }
            }
          });
          if (changed) {
            store.safeNotifyListeners();
          }
        },
        () => {}
      );
      this.globalUnsubscribes.push(betsUnsub);
    } catch {}

    // 9. Real-time RTDB listener on /referrals
    try {
      const refsUnsub = rtdbOnValue(
        rtdbRef(rtdb, 'referrals'),
        (snap) => {
          if (!snap.exists()) return;
          const val = snap.val();
          if (!val || typeof val !== 'object') return;
          Object.entries(val).forEach(([key, raw]: [string, any]) => {
            if (raw && typeof raw === 'object' && raw.referrerUid && raw.referredUid) {
              const refRec: ReferralRecord = {
                id: raw.id || key,
                referrerUid: raw.referrerUid,
                referrerUsername: raw.referrerUsername || `Player_${String(raw.referrerUid).slice(-4)}`,
                referredUid: raw.referredUid,
                referredUsername: raw.referredUsername || `Player_${String(raw.referredUid).slice(-4)}`,
                referredPhone: raw.referredPhone || '',
                referralCode: raw.referralCode || undefined,
                registeredAt: typeof raw.registeredAt === 'number' ? raw.registeredAt : Date.now(),
                firstDepositApprovedAt: raw.firstDepositApprovedAt || undefined,
                firstDepositAmount: raw.firstDepositAmount ? Number(raw.firstDepositAmount) : undefined,
                qualifyingDaysCompleted: Number(raw.qualifyingDaysCompleted) || 0,
                dailyTurnover: raw.dailyTurnover && typeof raw.dailyTurnover === 'object' ? raw.dailyTurnover : {},
                status: raw.status || 'pending_deposit',
                bonusAmount: Number(raw.bonusAmount) || 120,
                creditedAt: raw.creditedAt || undefined,
                transactionId: raw.transactionId || undefined,
                rejectionReason: raw.rejectionReason || undefined
              };
              store.ingestCloudReferral(refRec);
            }
          });
        },
        () => {}
      );
      this.globalUnsubscribes.push(refsUnsub);
    } catch {}
  }

  /**
   * Pushes all active in-memory entities (users, deposits, withdrawals, transactions, pending bets)
   * to Firebase RTDB & Firestore on startup so any account or deposit created on any phone immediately reaches Admin.
   */
  private async pushLocalStateToCloud() {
    await this.ensureAuth();

    try {
      const localUsers = Object.values(store.getUsers());
      for (const u of localUsers) {
        if (u && u.uid && !u.uid.startsWith('usr_demo_')) {
          await this.pushUserToFirestore(u);
        }
      }

      const localDeposits = store.getDeposits();
      for (const d of localDeposits.slice(0, 50)) {
        if (d && d.id) {
          await this.pushDepositToFirestore(d);
        }
      }

      const localWithdrawals = store.getWithdrawals();
      for (const w of localWithdrawals.slice(0, 50)) {
        if (w && w.id) {
          await this.pushWithdrawalToFirestore(w);
        }
      }

      const localTxs = store.getAllTransactionsFlat();
      for (const tx of localTxs.slice(0, 80)) {
        if (tx && tx.id) {
          await this.pushTransactionToFirestore(tx);
        }
      }

      const localBets = store.getLiveBets();
      for (const b of localBets.slice(0, 40)) {
        if (b && b.betId) {
          await this.pushLiveBetToFirestore(b);
        }
      }

      const localReferrals = store.getAllReferrals();
      for (const r of localReferrals.slice(0, 80)) {
        if (r && r.id) {
          await this.pushReferralToFirestore(r);
        }
      }
    } catch (e) {
      console.warn('[FirebaseSync] Initial cloud push notice:', e);
    }
  }

  public async pushRoundToRtdb(round: GameRound): Promise<void> {
    if (!round || !round.period || !round.gameType) return;
    if (String(round.period).startsWith('20261013')) return;

    const payload = {
      period: round.period,
      gameType: round.gameType,
      startTime: round.startTime,
      endTime: round.endTime,
      winningNumber: round.winningNumber ?? null,
      winningColor: round.winningColor || [],
      winningSize: round.winningSize || 'small',
      totalBetVolume: round.totalBetVolume || 0,
      totalPayout: round.totalPayout || 0,
      hash: round.hash || '',
      isResolved: Boolean(round.isResolved),
      manualOverrideNumber: round.manualOverrideNumber ?? null,
      updatedAt: Date.now()
    };

    // 1. Primary RTDB real-time round sync (/wingo_rounds & /current_round & /past_rounds/{gameType})
    try {
      const nodeKey = round.isResolved ? `wingo_rounds/resolved_${round.gameType}` : `wingo_rounds/${round.gameType}`;
      await rtdbSet(rtdbRef(rtdb, nodeKey), payload);
      if (!round.isResolved) {
        await rtdbSet(rtdbRef(rtdb, `current_round/${round.gameType}`), payload);
      } else {
        await rtdbSet(rtdbRef(rtdb, `past_rounds/${round.period}`), payload);
        await rtdbSet(rtdbRef(rtdb, `past_rounds/${round.gameType}/${round.period}`), payload);
      }
    } catch {}

    // 2. Firestore real-time round sync
    try {
      await this.ensureAuth();
      const docId = round.isResolved ? `resolved_${round.gameType}` : round.gameType;
      await setDoc(doc(db, 'wingo_rounds', docId), payload, { merge: true });
      if (!round.isResolved && round.manualOverrideNumber !== null && round.manualOverrideNumber !== undefined) {
        await setDoc(doc(db, 'wingo_rounds', `override_${round.period}`), {
          period: round.period,
          gameType: round.gameType,
          manualOverrideNumber: round.manualOverrideNumber,
          updatedAt: Date.now()
        });
      }
    } catch {}
  }

  public async attachRealtimeGameRoundsSync() {
    if (typeof window === 'undefined') return;
    await this.ensureAuth();

    try {
      const unsub = onSnapshot(
        collection(db, 'wingo_rounds'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'removed' || change.type === 'modified') {
              const data = change.doc.data();
              if (data && data.period && data.gameType && !String(data.period).startsWith('20261013')) {
                store.ingestCloudRound(data as Partial<GameRound>);
              }
            }
          });
        },
        () => {}
      );
      this.globalUnsubscribes.push(unsub);
    } catch {}
  }

  public async attachRealtimeGlobalEntitiesSync() {
    if (typeof window === 'undefined') return;
    await this.ensureAuth();

    // 1. Real-time Firestore listener for ALL Users
    try {
      const unsubUsers = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const data = change.doc.data() as Partial<UserRecord>;
              const uid = data.uid || change.doc.id;
              if (uid && !uid.startsWith('usr_demo_')) {
                store.updateUserFromFirestore({
                  ...data,
                  uid
                });
              }
            }
          });
        },
        () => {}
      );
      this.globalUnsubscribes.push(unsubUsers);
    } catch {}

    // 2. Real-time Firestore listener for ALL Deposits
    try {
      const unsubDeps = onSnapshot(
        collection(db, 'deposits'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const raw = change.doc.data();
              if (raw && (raw.id || change.doc.id)) {
                const dep: DepositRecord = {
                  id: raw.id || change.doc.id,
                  uid: raw.uid,
                  username: raw.username || `Player_${String(raw.uid || '').slice(-4)}`,
                  phone: raw.phone || '',
                  amount: Number(raw.amount) || 0,
                  usdtAmount: raw.usdtAmount ? Number(raw.usdtAmount) : undefined,
                  paymentMethod: raw.paymentMethod || raw.method || 'UPI',
                  referenceId: raw.referenceId || raw.utrOrRef || '',
                  upiReceiverId: raw.upiReceiverId || '',
                  status: raw.status || 'pending',
                  submittedAt: typeof raw.submittedAt === 'number' ? raw.submittedAt : Date.now(),
                  reviewedAt: raw.reviewedAt || undefined,
                  reviewedBy: raw.reviewedBy || undefined,
                  adminNote: raw.adminNote || undefined
                };
                store.ingestCloudDeposit(dep);
              }
            }
          });
        },
        () => {}
      );
      this.globalUnsubscribes.push(unsubDeps);
    } catch {}

    // 3. Real-time Firestore listener for ALL Withdrawals
    try {
      const unsubWithdrawals = onSnapshot(
        collection(db, 'withdrawals'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const raw = change.doc.data();
              if (raw && (raw.id || change.doc.id)) {
                const item: WithdrawalRecord = {
                  id: raw.id || change.doc.id,
                  uid: raw.uid,
                  username: raw.username || `Player_${String(raw.uid || '').slice(-4)}`,
                  phone: raw.phone || '',
                  amount: Number(raw.amount) || 0,
                  usdtAmount: raw.usdtAmount ? Number(raw.usdtAmount) : undefined,
                  payoutMethod: raw.payoutMethod || (raw.method === 'BANK' ? 'Bank Transfer' : 'UPI'),
                  accountDetails: raw.accountDetails || { upiId: raw.destination || '' },
                  status: raw.status || 'pending',
                  requestedAt: typeof raw.requestedAt === 'number' ? raw.requestedAt : Date.now(),
                  processedAt: raw.processedAt || undefined,
                  processedBy: raw.processedBy || undefined,
                  rejectionReason: raw.rejectionReason || undefined
                };
                store.ingestCloudWithdrawal(item);
              }
            }
          });
        },
        () => {}
      );
      this.globalUnsubscribes.push(unsubWithdrawals);
    } catch {}

    // 4. Real-time Firestore listener for ALL Transactions
    try {
      const unsubTxs = onSnapshot(
        collection(db, 'transactions'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const raw = change.doc.data();
              if (raw && (raw.id || change.doc.id) && raw.uid) {
                const tx: WalletTransaction = {
                  id: raw.id || change.doc.id,
                  uid: raw.uid,
                  type: raw.type,
                  category: raw.category,
                  amount: Number(raw.amount) || 0,
                  balanceBefore: Number(raw.balanceBefore) || 0,
                  balanceAfter: Number(raw.balanceAfter) || 0,
                  referenceId: raw.referenceId || '',
                  description: raw.description || '',
                  timestamp: typeof raw.timestamp === 'number' ? raw.timestamp : Date.now(),
                  status: raw.status || 'completed',
                  metadata: raw.metadata || undefined,
                  integritySeal: raw.integritySeal || undefined
                };
                store.ingestCloudTransaction(tx);
              }
            }
          });
        },
        () => {}
      );
      this.globalUnsubscribes.push(unsubTxs);
    } catch {}

    // 5. Real-time Firestore listener for ALL Live Bets
    try {
      const unsubBets = onSnapshot(
        collection(db, 'live_bets'),
        (snapshot) => {
          let changed = false;
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const raw = change.doc.data();
              if (raw && (raw.betId || change.doc.id)) {
                const bet: LiveBet = {
                  betId: raw.betId || change.doc.id,
                  uid: raw.uid,
                  username: raw.username || `Player_${String(raw.uid || '').slice(-4)}`,
                  gameId: raw.gameId || (raw.gameType === 'dragon_tiger' ? 'dragon_tiger' : undefined),
                  roundPeriod: raw.roundPeriod,
                  gameType: raw.gameType || '30s',
                  betType: raw.betType || (raw.gameType === 'dragon_tiger' ? 'dragon_tiger' : 'color'),
                  betValue: String(raw.betValue),
                  amount: Number(raw.amount) || 0,
                  multiplier: Number(raw.multiplier) || 2,
                  potentialPayout: Number(raw.potentialPayout) || 0,
                  status: raw.status || 'pending',
                  actualPayout: Number(raw.actualPayout) || 0,
                  timestamp: typeof raw.timestamp === 'number' ? raw.timestamp : Date.now()
                };
                const existingIdx = store.liveBets.findIndex((item) => item.betId === bet.betId);
                if (existingIdx === -1) {
                  store.liveBets.unshift(bet);
                  changed = true;
                } else if (
                  store.liveBets[existingIdx].status !== bet.status ||
                  store.liveBets[existingIdx].actualPayout !== bet.actualPayout
                ) {
                  store.liveBets[existingIdx] = { ...store.liveBets[existingIdx], ...bet };
                  changed = true;
                }
              }
            }
          });
          if (changed) {
            store.safeNotifyListeners();
          }
        },
        () => {}
      );
      this.globalUnsubscribes.push(unsubBets);
    } catch {}

    // 6. Real-time Firestore listener for ALL Referrals
    try {
      const unsubRefs = onSnapshot(
        collection(db, 'referrals'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const raw = change.doc.data();
              if (raw && raw.referrerUid && raw.referredUid) {
                store.ingestCloudReferral({
                  id: raw.id || change.doc.id,
                  referrerUid: raw.referrerUid,
                  referrerUsername: raw.referrerUsername || `Player_${String(raw.referrerUid).slice(-4)}`,
                  referredUid: raw.referredUid,
                  referredUsername: raw.referredUsername || `Player_${String(raw.referredUid).slice(-4)}`,
                  referredPhone: raw.referredPhone || '',
                  referralCode: raw.referralCode || undefined,
                  registeredAt: typeof raw.registeredAt === 'number' ? raw.registeredAt : Date.now(),
                  firstDepositApprovedAt: raw.firstDepositApprovedAt || undefined,
                  firstDepositAmount: raw.firstDepositAmount ? Number(raw.firstDepositAmount) : undefined,
                  qualifyingDaysCompleted: Number(raw.qualifyingDaysCompleted) || 0,
                  dailyTurnover: raw.dailyTurnover && typeof raw.dailyTurnover === 'object' ? raw.dailyTurnover : {},
                  status: raw.status || 'pending_deposit',
                  bonusAmount: Number(raw.bonusAmount) || 120,
                  creditedAt: raw.creditedAt || undefined,
                  transactionId: raw.transactionId || undefined,
                  rejectionReason: raw.rejectionReason || undefined
                });
              }
            }
          });
        },
        () => {}
      );
      this.globalUnsubscribes.push(unsubRefs);
    } catch {}
  }

  private lastSyncedAviatorRoundKey: string = '';

  public async pushAviatorRoundToFirestore(
    round: { roundId: string; status: string; crashMultiplier: number; serverSeedHash?: string; clientSeed?: string; nonce?: number },
    liveMult: number
  ): Promise<void> {
    if (!round || !round.roundId) return;
    const dedupKey = `${round.roundId}_${round.status}`;
    if (this.lastSyncedAviatorRoundKey === dedupKey) return;
    this.lastSyncedAviatorRoundKey = dedupKey;

    const payload = {
      roundId: round.roundId,
      status: round.status,
      crashMultiplier: round.status === 'crashed' ? round.crashMultiplier : null,
      liveMultiplier: liveMult,
      serverSeedHash: round.serverSeedHash || '',
      clientSeed: round.clientSeed || '',
      nonce: round.nonce || 0,
      updatedAt: Date.now()
    };

    try {
      await rtdbSet(rtdbRef(rtdb, 'current_round/aviator'), payload);
      if (round.status === 'crashed' && typeof round.crashMultiplier === 'number') {
        await rtdbSet(rtdbRef(rtdb, `aviator_rounds/${round.roundId}`), {
          roundId: round.roundId,
          status: 'crashed',
          crashMultiplier: round.crashMultiplier,
          crashedAt: Date.now(),
          updatedAt: Date.now()
        });
      }
    } catch {}

    try {
      await this.ensureAuth();
      await setDoc(doc(db, 'aviator_rounds', 'latest'), payload, { merge: true });
    } catch {}
  }

  /**
   * Automated 1-hour (60-minute) background cleanup routine to keep Firebase Realtime Database
   * lightweight and prevent latency during high-frequency rounds.
   *
   * CRITICAL RULE — NEVER DELETES:
   * - /users (master accounts, balances, credentials)
   * - /deposits or /withdrawals (financial payment records)
   * - /transactions (audit ledger)
   * - /admin_settings
   */
  public startAutomatedHourlyCleanupRoutine(): void {
    if (typeof window === 'undefined') return;
    if (this.hourlyCleanupTimer) return;

    const ONE_HOUR_MS = 60 * 60 * 1000;

    // Run initial cleanup pass after auth warmup, then every 60 minutes
    setTimeout(() => {
      this.runHourlyDatabaseCleanup().catch(() => {});
    }, 5000);

    this.hourlyCleanupTimer = setInterval(() => {
      this.runHourlyDatabaseCleanup().catch(() => {});
    }, ONE_HOUR_MS);
  }

  public async runHourlyDatabaseCleanup(): Promise<{
    purgedLiveBets: number;
    purgedRounds: number;
    purgedAviatorRounds: number;
    purgedLogs: number;
    purgedPolls: number;
  }> {
    if (this.isCleanupRunning) {
      return {
        purgedLiveBets: 0,
        purgedRounds: 0,
        purgedAviatorRounds: 0,
        purgedLogs: 0,
        purgedPolls: 0
      };
    }
    this.isCleanupRunning = true;

    const now = store.getServerNow();
    const ONE_HOUR_MS = 60 * 60 * 1000;
    let purgedLiveBets = 0;
    let purgedRounds = 0;
    let purgedAviatorRounds = 0;
    let purgedLogs = 0;
    let purgedPolls = 0;

    try {
      await this.ensureAuth();

      // 1. Settled Live Bets (/live_bets):
      // Purge all bets where status !== 'pending' that were settled more than 1 hour ago. Keep pending bets intact.
      try {
        const betsSnap = await rtdbGet(rtdbRef(rtdb, 'live_bets'));
        if (betsSnap.exists()) {
          const val = betsSnap.val();
          if (val && typeof val === 'object') {
            for (const [betKey, rawBet] of Object.entries(val) as [string, any][]) {
              if (!rawBet || typeof rawBet !== 'object') continue;
              const status = String(rawBet.status || 'pending');
              const settledOrUpdatedAt = Number(rawBet.settledAt || rawBet.updatedAt || rawBet.timestamp || 0);
              if (status !== 'pending' && settledOrUpdatedAt > 0 && now - settledOrUpdatedAt > ONE_HOUR_MS) {
                await rtdbRemove(rtdbRef(rtdb, `live_bets/${betKey}`)).catch(() => {});
                await deleteDoc(doc(db, 'live_bets', betKey)).catch(() => {});
                purgedLiveBets++;
              }
            }
          }
        }
      } catch {}

      // Also clean in-memory store.liveBets using the same 1-hour rule for non-pending bets
      if (Array.isArray(store.liveBets) && store.liveBets.length > 0) {
        store.liveBets = store.liveBets.filter((b) => {
          if (b.status === 'pending') return true;
          return now - (b.timestamp || 0) <= ONE_HOUR_MS;
        });
      }

      // 2. Expired Game Rounds (/wingo_rounds, /past_rounds):
      // Retain only the most recent 30 completed periods for the UI history list and delete older round records.
      try {
        const pastSnap = await rtdbGet(rtdbRef(rtdb, 'past_rounds'));
        if (pastSnap.exists()) {
          const val = pastSnap.val();
          if (val && typeof val === 'object') {
            const modeKeys = new Set(['30s', '1min', '3min', '5min']);
            const flatEntries = Object.entries(val).filter(([k]) => !modeKeys.has(k)) as [string, any][];
            flatEntries.sort((a, b) => {
              const timeB = Number(b[1]?.endTime || b[1]?.updatedAt || 0);
              const timeA = Number(a[1]?.endTime || a[1]?.updatedAt || 0);
              if (timeB !== timeA) return timeB - timeA;
              return String(b[1]?.period || b[0]).localeCompare(String(a[1]?.period || a[0]));
            });

            if (flatEntries.length > 30) {
              const toDelete = flatEntries.slice(30);
              for (const [roundKey] of toDelete) {
                await rtdbRemove(rtdbRef(rtdb, `past_rounds/${roundKey}`)).catch(() => {});
                purgedRounds++;
              }
            }

            for (const mk of modeKeys) {
              if (val[mk] && typeof val[mk] === 'object') {
                const subEntries = Object.entries(val[mk]) as [string, any][];
                subEntries.sort((a, b) => {
                  const timeB = Number(b[1]?.endTime || b[1]?.updatedAt || 0);
                  const timeA = Number(a[1]?.endTime || a[1]?.updatedAt || 0);
                  if (timeB !== timeA) return timeB - timeA;
                  return String(b[1]?.period || b[0]).localeCompare(String(a[1]?.period || a[0]));
                });
                if (subEntries.length > 30) {
                  for (const [subKey] of subEntries.slice(30)) {
                    await rtdbRemove(rtdbRef(rtdb, `past_rounds/${mk}/${subKey}`)).catch(() => {});
                    purgedRounds++;
                  }
                }
              }
            }
          }
        }
      } catch {}

      try {
        const wingoSnap = await rtdbGet(rtdbRef(rtdb, 'wingo_rounds'));
        if (wingoSnap.exists()) {
          const val = wingoSnap.val();
          if (val && typeof val === 'object') {
            const activeReservedKeys = new Set([
              '30s',
              '1min',
              '3min',
              'resolved_30s',
              'resolved_1min',
              'resolved_3min'
            ]);
            const historicalEntries = (Object.entries(val) as [string, any][]).filter(
              ([k]) => !activeReservedKeys.has(k)
            );
            historicalEntries.sort((a, b) => {
              const timeB = Number(b[1]?.endTime || b[1]?.updatedAt || 0);
              const timeA = Number(a[1]?.endTime || a[1]?.updatedAt || 0);
              if (timeB !== timeA) return timeB - timeA;
              return String(b[1]?.period || b[0]).localeCompare(String(a[1]?.period || a[0]));
            });
            if (historicalEntries.length > 30) {
              for (const [oldKey] of historicalEntries.slice(30)) {
                await rtdbRemove(rtdbRef(rtdb, `wingo_rounds/${oldKey}`)).catch(() => {});
                purgedRounds++;
              }
            }
          }
        }
      } catch {}

      // Retain only the 30 most recent completed periods in local UI state per mode
      store.trimPastRounds(30);

      // 3. Flight Trajectory & Multiplier Ticks (/aviator_rounds):
      // Clear raw flight ticks from finished flights, keeping only the final crash multiplier for the last 20 rounds.
      try {
        const avSnap = await rtdbGet(rtdbRef(rtdb, 'aviator_rounds'));
        if (avSnap.exists()) {
          const val = avSnap.val();
          if (val && typeof val === 'object') {
            const entries = (Object.entries(val) as [string, any][]).filter(([k]) => k !== 'latest');
            entries.sort((a, b) => {
              const timeB = Number(b[1]?.crashedAt || b[1]?.updatedAt || b[1]?.roundNumber || 0);
              const timeA = Number(a[1]?.crashedAt || a[1]?.updatedAt || a[1]?.roundNumber || 0);
              return timeB - timeA;
            });

            // Keep top 20 finished rounds with raw flight ticks stripped; delete older ones
            for (let i = 0; i < entries.length; i++) {
              const [roundKey, rawRound] = entries[i];
              if (i >= 20) {
                await rtdbRemove(rtdbRef(rtdb, `aviator_rounds/${roundKey}`)).catch(() => {});
                purgedAviatorRounds++;
              } else if (
                rawRound &&
                typeof rawRound === 'object' &&
                (rawRound.ticks || rawRound.trajectory || rawRound.flightTicks || rawRound.liveTicks || rawRound.bets)
              ) {
                await rtdbSet(rtdbRef(rtdb, `aviator_rounds/${roundKey}`), {
                  roundId: rawRound.roundId || roundKey,
                  roundNumber: rawRound.roundNumber || null,
                  status: 'crashed',
                  crashMultiplier: Number(rawRound.crashMultiplier) || 1.0,
                  crashedAt: rawRound.crashedAt || rawRound.updatedAt || now,
                  updatedAt: now
                }).catch(() => {});
                purgedAviatorRounds++;
              }
            }
          }
        }
      } catch {}

      // 4. Routine Diagnostic & Server Logs (/systemLogs, /audit_logs):
      // Delete routine system, RSS discovery, and settlement logs older than 60 minutes (SERVER_CLEANUP, AUTO_PUBLISHED).
      const isRoutineDiagnosticLog = (item: any): boolean => {
        const typeStr = String(item?.type || item?.action || item?.category || '').toUpperCase();
        const msgStr = String(item?.message || item?.details || '').toUpperCase();
        return (
          typeStr.includes('SERVER_CLEANUP') ||
          typeStr.includes('AUTO_PUBLISHED') ||
          typeStr.includes('RSS') ||
          typeStr.includes('SETTLEMENT') ||
          typeStr.includes('DIAGNOSTIC') ||
          typeStr.includes('ROUTINE') ||
          msgStr.includes('SERVER_CLEANUP') ||
          msgStr.includes('AUTO_PUBLISHED') ||
          msgStr.includes('RSS') ||
          msgStr.includes('ROUND SETTLED')
        );
      };

      for (const logPath of ['systemLogs', 'audit_logs']) {
        try {
          const logsSnap = await rtdbGet(rtdbRef(rtdb, logPath));
          if (logsSnap.exists()) {
            const val = logsSnap.val();
            if (val && typeof val === 'object') {
              for (const [logKey, rawLog] of Object.entries(val) as [string, any][]) {
                if (!rawLog || typeof rawLog !== 'object') continue;
                const ts = Number(rawLog.timestamp || rawLog.createdAt || rawLog.updatedAt || 0);
                if (ts > 0 && now - ts > ONE_HOUR_MS && (logPath === 'systemLogs' || isRoutineDiagnosticLog(rawLog))) {
                  await rtdbRemove(rtdbRef(rtdb, `${logPath}/${logKey}`)).catch(() => {});
                  purgedLogs++;
                }
              }
            }
          }
        } catch {}
      }

      // 5. Expired Polls (/activePolls):
      // Purge archived polls where status === 'ARCHIVED' and verification window has passed.
      try {
        const pollsSnap = await rtdbGet(rtdbRef(rtdb, 'activePolls'));
        if (pollsSnap.exists()) {
          const val = pollsSnap.val();
          if (val && typeof val === 'object') {
            for (const [pollKey, rawPoll] of Object.entries(val) as [string, any][]) {
              if (!rawPoll || typeof rawPoll !== 'object') continue;
              const status = String(rawPoll.status || '').toUpperCase();
              const verificationEnd = Number(
                rawPoll.verificationWindowEndsAt ||
                  rawPoll.autoDeleteAt ||
                  rawPoll.closesAt ||
                  rawPoll.archivedAt ||
                  0
              );
              if (status === 'ARCHIVED' && (verificationEnd === 0 || now > verificationEnd)) {
                await rtdbRemove(rtdbRef(rtdb, `activePolls/${pollKey}`)).catch(() => {});
                purgedPolls++;
              }
            }
          }
        }
      } catch {}

      // Also trigger server-side cleanup endpoint if backend is reachable
      try {
        await fetch('/api/admin/cleanup/run-hourly-purge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }).catch(() => {});
      } catch {}
    } finally {
      this.isCleanupRunning = false;
    }

    return {
      purgedLiveBets,
      purgedRounds,
      purgedAviatorRounds,
      purgedLogs,
      purgedPolls
    };
  }

  public async attachRealtimeAdminSettingsSync() {
    if (typeof window === 'undefined' || this.activeRtdbSettingsUnsubscribe) return;
    await this.ensureAuth();

    try {
      const settingsDocRef = doc(db, 'admin_settings', 'config');
      this.activeRtdbSettingsUnsubscribe = onSnapshot(
        settingsDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.data();
            if (val && typeof val === 'object') {
              store.ingestCloudAdminSettings(val as Partial<AdminSettings>);
            }
          }
        },
        () => {}
      );
    } catch {}
  }

  public async pushAdminSettingsToRtdb(settings: AdminSettings): Promise<void> {
    if (!settings) return;
    const rawPayload: Record<string, any> = {
      ...settings,
      maintenanceMode: Boolean(settings.maintenanceMode),
      updatedAt: Date.now()
    };
    const cleanPayload: Record<string, any> = {};
    Object.entries(rawPayload).forEach(([k, v]) => {
      if (v !== undefined) {
        cleanPayload[k] = v;
      }
    });

    try {
      await rtdbUpdate(rtdbRef(rtdb, 'admin_settings'), cleanPayload);
    } catch {}

    try {
      await this.ensureAuth();
      await setDoc(doc(db, 'admin_settings', 'config'), cleanPayload, { merge: true });
    } catch {}
  }

  public async updateAdminSettingsAtomically(changedData: Partial<AdminSettings>): Promise<void> {
    if (!changedData || typeof changedData !== 'object') return;
    store.updateAdminSettings(changedData, 'MasterAdmin');
    const cleanChanges: Record<string, any> = { updatedAt: Date.now() };
    Object.entries(changedData).forEach(([k, v]) => {
      if (v !== undefined) {
        cleanChanges[k] = v;
      }
    });
    try {
      await rtdbUpdate(rtdbRef(rtdb, 'admin_settings'), cleanChanges);
    } catch {}
  }

  public async verifyAndSyncBetDeductionAtomically(
    uid: string,
    betAmount: number,
    fallbackBalanceBefore: number
  ): Promise<{ committed: boolean; balanceAfter: number }> {
    const cleanBet = Math.max(0, Math.round(Number(betAmount) * 100) / 100);
    if (!uid || cleanBet <= 0) {
      return { committed: false, balanceAfter: fallbackBalanceBefore };
    }
    try {
      const balanceRef = rtdbRef(rtdb, `users/${uid}/balance`);
      let finalBal = Math.max(0, Math.round((fallbackBalanceBefore - cleanBet) * 100) / 100);
      const txResult = await rtdbRunTransaction(balanceRef, (currentVal) => {
        const currentNum =
          typeof currentVal === 'number' && Number.isFinite(currentVal) && currentVal > 0
            ? currentVal
            : fallbackBalanceBefore;
        if (currentNum < cleanBet) {
          return; // Abort if insufficient
        }
        finalBal = Math.max(0, Math.round((currentNum - cleanBet) * 100) / 100);
        return finalBal;
      });
      return {
        committed: txResult.committed,
        balanceAfter: typeof txResult.snapshot.val() === 'number' ? txResult.snapshot.val() : finalBal
      };
    } catch {
      return {
        committed: true,
        balanceAfter: Math.max(0, Math.round((fallbackBalanceBefore - cleanBet) * 100) / 100)
      };
    }
  }

  private initAuthListener() {
    if (typeof window === 'undefined') return;

    this.ensureAuth().then(() => {
      if (!this.listenersAttached) {
        this.listenersAttached = true;
        this.attachRealtimeAdminSettingsSync();
        this.attachRealtimeGameRoundsSync();
        this.attachRealtimeGlobalEntitiesSync();
        this.pushLocalStateToCloud();
      }
    });

    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        if (!this.listenersAttached) {
          this.listenersAttached = true;
          this.attachRealtimeAdminSettingsSync();
          this.attachRealtimeGameRoundsSync();
          this.attachRealtimeGlobalEntitiesSync();
          this.pushLocalStateToCloud();
        }
        const storedUid = localStorage.getItem('bingo777_active_uid');
        if (storedUid) {
          this.attachRealtimeUserSync(storedUid, firebaseUser.phoneNumber || undefined);
        }
      } else {
        await this.ensureAuth();
      }
    });
  }

  public async attachRealtimeUserSync(uid: string, fallbackPhone?: string) {
    if (!uid) return;
    if (this.currentSyncedUid === uid && this.activeUserUnsubscribe) {
      return;
    }

    this.detachRealtimeUserSync();
    this.currentSyncedUid = uid;

    // 1. RTDB live listener on /users/{uid}
    try {
      this.activeRtdbUserUnsubscribe = rtdbOnValue(
        rtdbRef(rtdb, `users/${uid}`),
        (snap) => {
          if (snap.exists()) {
            const data = snap.val();
            if (data && typeof data === 'object') {
              store.updateUserFromFirestore({
                ...data,
                uid
              });
            }
          }
        },
        () => {}
      );
    } catch {}

    // 2. Firestore live listener on /users/{uid}
    await this.ensureAuth();
    try {
      const userDocRef = doc(db, 'users', uid);
      this.activeUserUnsubscribe = onSnapshot(
        userDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            store.updateUserFromFirestore({
              uid,
              phone: data.phone || fallbackPhone || undefined,
              username: data.username || undefined,
              passwordHash: data.passwordHash || undefined,
              balance: typeof data.balance === 'number' ? data.balance : undefined,
              vipLevel: typeof data.vipLevel === 'number' ? data.vipLevel : undefined,
              status: data.status || 'active',
              role: data.role || undefined,
              totalBetsCount: data.totalBetsCount,
              totalWonAmount: data.totalWonAmount,
              totalLostAmount: data.totalLostAmount,
              referralCode: data.referralCode || undefined,
              devices: data.devices || undefined
            });
          } else {
            const localUser = store.getUser(uid);
            if (localUser) {
              this.pushUserToFirestore(localUser, fallbackPhone);
            }
          }
        },
        () => {}
      );
    } catch {}
  }

  public detachRealtimeUserSync() {
    if (this.activeRtdbUserUnsubscribe) {
      this.activeRtdbUserUnsubscribe();
      this.activeRtdbUserUnsubscribe = null;
    }
    if (this.activeUserUnsubscribe) {
      this.activeUserUnsubscribe();
      this.activeUserUnsubscribe = null;
    }
    this.currentSyncedUid = null;
  }

  /**
   * Writes player document directly to RTDB (/users/{uid}) and Firestore (/users/{uid})
   */
  public async pushUserToFirestore(user: UserRecord, phoneOverride?: string): Promise<boolean> {
    if (!user || !user.uid || user.uid.startsWith('usr_demo_')) return false;
    const cleanPhone = phoneOverride || user.phone || '';

    const userPayload: Record<string, any> = {
      uid: user.uid,
      username: user.username || `Player_${user.uid.slice(-4)}`,
      phone: cleanPhone,
      balance: Math.max(0, Number(user.balance) || 0),
      vipLevel: Math.min(10, Math.max(0, Number(user.vipLevel) || 1)),
      status: user.status || 'active',
      role: user.role || 'user',
      referralCode: user.referralCode || '',
      referralCount: Number(user.referralCount || user.totalReferrals || 0),
      totalReferrals: Number(user.totalReferrals || user.referralCount || 0),
      totalBetsCount: user.totalBetsCount || 0,
      totalWonAmount: user.totalWonAmount || 0,
      totalLostAmount: user.totalLostAmount || 0,
      createdAt: user.createdAt || Date.now(),
      lastLogin: user.lastLogin || Date.now(),
      devices: user.devices || {},
      updatedAt: Date.now()
    };

    if (user.passwordHash) {
      userPayload.passwordHash = user.passwordHash;
    }
    if (user.referredBy) {
      userPayload.referredBy = user.referredBy;
    }
    if (user.referredByCode) {
      userPayload.referredByCode = user.referredByCode;
    }

    // 1. Write immediately to Firebase Realtime Database (/users/{uid})
    try {
      await rtdbSet(rtdbRef(rtdb, `users/${user.uid}`), userPayload);
    } catch (e) {
      console.warn('[FirebaseSync] RTDB pushUser notice:', e);
    }

    // 2. Write to Firestore (/users/{uid})
    await this.ensureAuth();
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userPayload, { merge: true });

      if (cleanPhone) {
        const privateInfoRef = doc(db, 'users', user.uid, 'private', 'info');
        await setDoc(
          privateInfoRef,
          {
            uid: user.uid,
            phone: cleanPhone,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      }

      return true;
    } catch (err) {
      console.warn('[FirebaseSync] pushUserToFirestore error:', err);
      return false;
    }
  }

  /**
   * Syncs a wallet transaction to RTDB (/transactions/{txId}) and Firestore
   */
  public async pushTransactionToFirestore(tx: WalletTransaction): Promise<void> {
    if (!tx || !tx.id || !tx.uid) return;
    const payload = {
      id: tx.id,
      uid: tx.uid,
      type: tx.type,
      category: tx.category,
      amount: tx.amount,
      balanceBefore: tx.balanceBefore,
      balanceAfter: tx.balanceAfter,
      referenceId: tx.referenceId || '',
      description: tx.description || '',
      timestamp: tx.timestamp || Date.now(),
      status: tx.status || 'completed',
      metadata: tx.metadata || {},
      integritySeal: tx.integritySeal || '',
      updatedAt: Date.now()
    };

    try {
      await rtdbSet(rtdbRef(rtdb, `transactions/${tx.id}`), payload);
    } catch {}

    await this.ensureAuth();
    try {
      await setDoc(doc(db, 'transactions', tx.id), payload, { merge: true });
    } catch {}
  }

  /**
   * Syncs a player deposit request to RTDB (/deposits/{depositId}) and Firestore
   */
  public async pushDepositToFirestore(dep: DepositRecord): Promise<void> {
    if (!dep || !dep.id || !dep.uid) return;
    const payload = {
      id: dep.id,
      uid: dep.uid,
      username: dep.username,
      phone: dep.phone || '',
      amount: dep.amount,
      usdtAmount: dep.usdtAmount || null,
      paymentMethod: dep.paymentMethod || 'UPI',
      method: dep.paymentMethod === 'USDT' ? 'USDT' : 'UPI',
      referenceId: dep.referenceId,
      utrOrRef: dep.referenceId,
      upiReceiverId: dep.upiReceiverId || '',
      status: dep.status,
      submittedAt: dep.submittedAt || Date.now(),
      reviewedAt: dep.reviewedAt || null,
      reviewedBy: dep.reviewedBy || null,
      adminNote: dep.adminNote || null,
      updatedAt: Date.now()
    };

    try {
      await rtdbSet(rtdbRef(rtdb, `deposits/${dep.id}`), payload);
    } catch {}

    await this.ensureAuth();
    try {
      await setDoc(doc(db, 'deposits', dep.id), payload, { merge: true });
    } catch {}
  }

  /**
   * Syncs a player withdrawal request to RTDB (/withdrawals/{withdrawalId}) and Firestore
   */
  public async pushWithdrawalToFirestore(w: WithdrawalRecord): Promise<void> {
    if (!w || !w.id || !w.uid) return;
    const destination =
      w.accountDetails?.upiId ||
      w.accountDetails?.accountNumber ||
      w.accountDetails?.usdtAddress ||
      w.phone ||
      'BANK_OR_UPI';

    const payload = {
      id: w.id,
      uid: w.uid,
      username: w.username,
      phone: w.phone || '',
      amount: w.amount,
      usdtAmount: w.usdtAmount || null,
      payoutMethod: w.payoutMethod,
      method: w.payoutMethod === 'Bank Transfer' ? 'BANK' : 'UPI',
      accountDetails: w.accountDetails || {},
      destination,
      status: w.status,
      requestedAt: w.requestedAt || Date.now(),
      processedAt: w.processedAt || null,
      processedBy: w.processedBy || null,
      rejectionReason: w.rejectionReason || null,
      updatedAt: Date.now()
    };

    try {
      await rtdbSet(rtdbRef(rtdb, `withdrawals/${w.id}`), payload);
    } catch {}

    await this.ensureAuth();
    try {
      await setDoc(doc(db, 'withdrawals', w.id), payload, { merge: true });
    } catch {}
  }

  /**
   * Syncs a live game bet to RTDB (/live_bets/{betId}) and Firestore
   */
  public async pushLiveBetToFirestore(bet: LiveBet): Promise<void> {
    if (!bet || !bet.betId || !bet.uid) return;
    const payload = {
      betId: bet.betId,
      uid: bet.uid,
      username: bet.username,
      gameId: bet.gameId || (bet.gameType === 'dragon_tiger' ? 'dragon_tiger' : 'wingo'),
      roundPeriod: bet.roundPeriod,
      gameType: bet.gameType,
      betType: bet.betType,
      betValue: String(bet.betValue),
      amount: bet.amount,
      multiplier: bet.multiplier,
      potentialPayout: bet.potentialPayout,
      status: bet.status,
      actualPayout: bet.actualPayout || 0,
      timestamp: bet.timestamp || Date.now(),
      updatedAt: Date.now()
    };

    try {
      await rtdbSet(rtdbRef(rtdb, `live_bets/${bet.betId}`), payload);
    } catch {}

    await this.ensureAuth();
    try {
      await setDoc(doc(db, 'live_bets', bet.betId), payload, { merge: true });
    } catch {}
  }

  /**
   * Syncs a referral linkage record to RTDB (/referrals/{referralId}) and Firestore (/referrals/{referralId})
   */
  public async pushReferralToFirestore(ref: ReferralRecord): Promise<void> {
    if (!ref || !ref.id || !ref.referrerUid || !ref.referredUid) return;
    const payload = {
      id: ref.id,
      referrerUid: ref.referrerUid,
      referrerUsername: ref.referrerUsername || '',
      referredUid: ref.referredUid,
      referredUsername: ref.referredUsername || '',
      referredPhone: ref.referredPhone || '',
      referralCode: ref.referralCode || '',
      registeredAt: ref.registeredAt || Date.now(),
      firstDepositApprovedAt: ref.firstDepositApprovedAt || null,
      firstDepositAmount: ref.firstDepositAmount || null,
      qualifyingDaysCompleted: ref.qualifyingDaysCompleted || 0,
      dailyTurnover: ref.dailyTurnover || {},
      status: ref.status || 'pending_deposit',
      bonusAmount: ref.bonusAmount || 120,
      creditedAt: ref.creditedAt || null,
      transactionId: ref.transactionId || null,
      rejectionReason: ref.rejectionReason || null,
      updatedAt: Date.now()
    };

    try {
      await rtdbSet(rtdbRef(rtdb, `referrals/${ref.id}`), payload);
    } catch {}

    await this.ensureAuth();
    try {
      await setDoc(doc(db, 'referrals', ref.id), payload, { merge: true });
    } catch {}
  }

  /**
   * Pulls all users and referrals from Firebase Realtime Database on demand
   * (used before login/signup so referral codes from other devices are immediately matched).
   */
  public async pullUsersFromRtdb(): Promise<void> {
    try {
      const snap = await rtdbGet(rtdbRef(rtdb, 'users'));
      if (snap.exists()) {
        const val = snap.val();
        if (val && typeof val === 'object') {
          Object.entries(val).forEach(([key, raw]: [string, any]) => {
            if (raw && typeof raw === 'object') {
              const uid = raw.uid || key;
              if (uid && !String(uid).startsWith('usr_demo_')) {
                store.updateUserFromFirestore({
                  ...raw,
                  uid
                });
              }
            }
          });
        }
      }
    } catch {}

    try {
      const refSnap = await rtdbGet(rtdbRef(rtdb, 'referrals'));
      if (refSnap.exists()) {
        const val = refSnap.val();
        if (val && typeof val === 'object') {
          Object.entries(val).forEach(([key, raw]: [string, any]) => {
            if (raw && typeof raw === 'object' && raw.referrerUid && raw.referredUid) {
              store.ingestCloudReferral({
                ...raw,
                id: raw.id || key
              } as ReferralRecord);
            }
          });
        }
      }
    } catch {}
  }

  /**
   * Manually triggers an immediate force re-sync with Firebase RTDB & Cloud Firestore
   */
  public async forceSyncFromFirebase(): Promise<{ success: boolean; message: string; balance?: number; period?: string }> {
    await this.ensureAuth();
    await this.pushLocalStateToCloud();

    const activeUid = store.getActiveSessionUid();
    let newBalance = activeUid ? store.getUser(activeUid)?.balance : undefined;
    let latestPeriod = store.getCurrentRound()?.period;

    try {
      // Pull from RTDB first
      try {
        const rtdbUsersSnap = await rtdbGet(rtdbRef(rtdb, 'users'));
        if (rtdbUsersSnap.exists()) {
          const val = rtdbUsersSnap.val();
          if (val && typeof val === 'object') {
            Object.entries(val).forEach(([key, raw]: [string, any]) => {
              const uid = raw?.uid || key;
              if (uid && !String(uid).startsWith('usr_demo_')) {
                store.updateUserFromFirestore({ ...raw, uid });
              }
            });
          }
        }
      } catch {}

      // Pull from Firestore
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data() as Partial<UserRecord>;
        const uid = data.uid || docSnap.id;
        if (uid && !uid.startsWith('usr_demo_')) {
          store.updateUserFromFirestore({ ...data, uid });
          if (uid === activeUid && typeof data.balance === 'number') {
            newBalance = data.balance;
          }
        }
      });

      const depSnap = await getDocs(collection(db, 'deposits'));
      depSnap.forEach((docSnap) => {
        const raw = docSnap.data();
        if (raw && (raw.id || docSnap.id)) {
          store.ingestCloudDeposit({
            id: raw.id || docSnap.id,
            uid: raw.uid,
            username: raw.username || `Player_${String(raw.uid || '').slice(-4)}`,
            phone: raw.phone || '',
            amount: Number(raw.amount) || 0,
            usdtAmount: raw.usdtAmount ? Number(raw.usdtAmount) : undefined,
            paymentMethod: raw.paymentMethod || raw.method || 'UPI',
            referenceId: raw.referenceId || raw.utrOrRef || '',
            upiReceiverId: raw.upiReceiverId || '',
            status: raw.status || 'pending',
            submittedAt: typeof raw.submittedAt === 'number' ? raw.submittedAt : Date.now(),
            reviewedAt: raw.reviewedAt || undefined,
            reviewedBy: raw.reviewedBy || undefined,
            adminNote: raw.adminNote || undefined
          });
        }
      });

      const wSnap = await getDocs(collection(db, 'withdrawals'));
      wSnap.forEach((docSnap) => {
        const raw = docSnap.data();
        if (raw && (raw.id || docSnap.id)) {
          store.ingestCloudWithdrawal({
            id: raw.id || docSnap.id,
            uid: raw.uid,
            username: raw.username || `Player_${String(raw.uid || '').slice(-4)}`,
            phone: raw.phone || '',
            amount: Number(raw.amount) || 0,
            usdtAmount: raw.usdtAmount ? Number(raw.usdtAmount) : undefined,
            payoutMethod: raw.payoutMethod || (raw.method === 'BANK' ? 'Bank Transfer' : 'UPI'),
            accountDetails: raw.accountDetails || { upiId: raw.destination || '' },
            status: raw.status || 'pending',
            requestedAt: typeof raw.requestedAt === 'number' ? raw.requestedAt : Date.now(),
            processedAt: raw.processedAt || undefined,
            processedBy: raw.processedBy || undefined,
            rejectionReason: raw.rejectionReason || undefined
          });
        }
      });

      const txSnap = await getDocs(collection(db, 'transactions'));
      txSnap.forEach((docSnap) => {
        const raw = docSnap.data();
        if (raw && (raw.id || docSnap.id) && raw.uid) {
          store.ingestCloudTransaction({
            id: raw.id || docSnap.id,
            uid: raw.uid,
            type: raw.type,
            category: raw.category,
            amount: Number(raw.amount) || 0,
            balanceBefore: Number(raw.balanceBefore) || 0,
            balanceAfter: Number(raw.balanceAfter) || 0,
            referenceId: raw.referenceId || '',
            description: raw.description || '',
            timestamp: typeof raw.timestamp === 'number' ? raw.timestamp : Date.now(),
            status: raw.status || 'completed',
            metadata: raw.metadata || undefined,
            integritySeal: raw.integritySeal || undefined
          });
        }
      });

      const roundsSnap = await getDocs(collection(db, 'wingo_rounds'));
      roundsSnap.forEach((docSnap) => {
        const val = docSnap.data();
        if (val && val.period && val.gameType && !String(val.period).startsWith('20261013')) {
          store.ingestCloudRound(val as Partial<GameRound>);
          if (val.period && !val.isResolved) latestPeriod = val.period;
        }
      });

      const settingsSnap = await getDoc(doc(db, 'admin_settings', 'config'));
      if (settingsSnap.exists()) {
        store.ingestCloudAdminSettings(settingsSnap.data() as Partial<AdminSettings>);
      }

      if (activeUid) {
        newBalance = store.getUser(activeUid)?.balance;
      }

      store.safeNotifyListeners();

      return {
        success: true,
        message: 'Live state synchronized successfully with Firebase!',
        balance: newBalance,
        period: latestPeriod
      };
    } catch (err) {
      console.error('Force sync error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Sync failed'
      };
    }
  }
}

export const firebaseSync = new FirebaseSyncService();
