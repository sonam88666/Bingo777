import {
  db,
  rtdb,
  auth,
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  rtdbRef,
  rtdbSet,
  rtdbGet,
  rtdbOnValue,
  rtdbUpdate
} from '../firebase';
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth';
import { getDocs } from 'firebase/firestore';
import {
  UserRecord,
  WalletTransaction,
  DepositRecord,
  WithdrawalRecord,
  LiveBet,
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

  constructor() {
    this.bindStoreHooks();
    this.initAuthListener();
  }

  /**
   * Ensures the client has a valid Firebase Auth session (Anonymous or Phone)
   * so Firestore security rules (`isSignedIn()`) always succeed on every device/APK.
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
   * Pushes all local entities (users, deposits, withdrawals, transactions, pending bets)
   * to Firestore on startup so any account or deposit created on any phone immediately reaches Admin.
   */
  private async pushLocalStateToCloud() {
    const authed = await this.ensureAuth();
    if (!authed) return;

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
    } catch (e) {
      console.warn('[FirebaseSync] Initial cloud push notice:', e);
    }
  }

  public async pushRoundToRtdb(round: GameRound): Promise<void> {
    if (!round || !round.period || !round.gameType) return;

    const payload = {
      period: round.period,
      gameType: round.gameType,
      startTime: round.startTime,
      endTime: round.endTime,
      winningNumber: round.winningNumber,
      winningColor: round.winningColor || [],
      winningSize: round.winningSize || 'small',
      totalBetVolume: round.totalBetVolume || 0,
      totalPayout: round.totalPayout || 0,
      hash: round.hash || '',
      isResolved: Boolean(round.isResolved),
      manualOverrideNumber: round.manualOverrideNumber ?? null,
      updatedAt: Date.now()
    };

    // 1. Primary Firestore real-time round sync
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
    } catch (e) {
      console.warn('Firestore pushRound error:', e);
    }

    // 2. Secondary RTDB fallback
    try {
      await rtdbSet(rtdbRef(rtdb, `wingo_rounds/${round.gameType}`), payload);
    } catch {
      // Non-blocking
    }
  }

  public async attachRealtimeGameRoundsSync() {
    if (typeof window === 'undefined') return;
    await this.ensureAuth();

    // 1. Primary Firestore real-time listener on wingo_rounds collection
    try {
      const unsub = onSnapshot(
        collection(db, 'wingo_rounds'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'removed' || change.type === 'modified') {
              const data = change.doc.data();
              if (data && data.period && data.gameType) {
                store.ingestCloudRound(data as Partial<GameRound>);
              }
            }
          });
        },
        (err) => {
          console.warn('Firestore wingo_rounds listener notice:', err?.message);
        }
      );
      this.globalUnsubscribes.push(unsub);
    } catch (err) {
      console.warn('attachRealtimeGameRoundsSync Firestore error:', err);
    }

    // 2. Secondary RTDB listener
    const modes: Array<'30s' | '1min' | '3min'> = ['30s', '1min', '3min'];
    modes.forEach((mode) => {
      try {
        rtdbOnValue(
          rtdbRef(rtdb, `wingo_rounds/${mode}`),
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              if (data && typeof data === 'object') {
                store.ingestCloudRound(data);
              }
            }
          },
          () => {}
        );
      } catch {}
    });
  }

  public async attachRealtimeGlobalEntitiesSync() {
    if (typeof window === 'undefined') return;
    await this.ensureAuth();

    // 1. Real-time Firestore listener for ALL Users (instant Admin & Multi-Device sync)
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
        (err) => {
          console.warn('Firestore users listener notice:', err?.message);
        }
      );
      this.globalUnsubscribes.push(unsubUsers);
    } catch (e) {
      console.warn('Firestore users listener init error:', e);
    }

    // 2. Real-time Firestore listener for ALL Deposits (instant Admin deposit notification & player approval sync)
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
        (err) => {
          console.warn('Firestore deposits listener notice:', err?.message);
        }
      );
      this.globalUnsubscribes.push(unsubDeps);
    } catch (e) {
      console.warn('Firestore deposits listener init error:', e);
    }

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
        (err) => {
          console.warn('Firestore withdrawals listener notice:', err?.message);
        }
      );
      this.globalUnsubscribes.push(unsubWithdrawals);
    } catch (e) {
      console.warn('Firestore withdrawals listener init error:', e);
    }

    // 4. Real-time Firestore listener for ALL Transactions (ledger synchronization across devices)
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
        (err) => {
          console.warn('Firestore transactions listener notice:', err?.message);
        }
      );
      this.globalUnsubscribes.push(unsubTxs);
    } catch (e) {
      console.warn('Firestore transactions listener init error:', e);
    }

    // 5. Real-time Firestore listener for ALL Live Bets (so Admin sees live bets from every device in 1 second)
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
                  roundPeriod: raw.roundPeriod,
                  gameType: raw.gameType || '30s',
                  betType: raw.betType,
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
                } else if (store.liveBets[existingIdx].status !== bet.status) {
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
        (err) => {
          console.warn('Firestore live_bets listener notice:', err?.message);
        }
      );
      this.globalUnsubscribes.push(unsubBets);
    } catch (e) {
      console.warn('Firestore live_bets listener init error:', e);
    }
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
    try {
      await this.ensureAuth();
      await setDoc(
        doc(db, 'aviator_rounds', 'latest'),
        {
          roundId: round.roundId,
          status: round.status,
          crashMultiplier: round.status === 'crashed' ? round.crashMultiplier : null,
          liveMultiplier: liveMult,
          serverSeedHash: round.serverSeedHash || '',
          clientSeed: round.clientSeed || '',
          nonce: round.nonce || 0,
          updatedAt: Date.now()
        },
        { merge: true }
      );
    } catch {
      // Non-blocking
    }
  }

  /**
   * Attaches real-time listener on admin_settings/config in Firestore (and fallback RTDB)
   */
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
    } catch {
      // Ignore init error
    }
  }

  public async pushAdminSettingsToRtdb(settings: AdminSettings): Promise<void> {
    if (!settings) return;
    try {
      await this.ensureAuth();
      await setDoc(
        doc(db, 'admin_settings', 'config'),
        {
          ...settings,
          updatedAt: Date.now()
        },
        { merge: true }
      );
    } catch {
      // Non-blocking
    }

    try {
      await rtdbSet(rtdbRef(rtdb, 'admin_settings'), {
        ...settings,
        updatedAt: Date.now()
      });
    } catch {
      // Non-blocking
    }
  }

  /**
   * Initializes automatic Firebase Auth state listener and starts global real-time listeners.
   */
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

  /**
   * Attaches real-time Firestore listener for a specific active user UID.
   */
  public async attachRealtimeUserSync(uid: string, fallbackPhone?: string) {
    if (!uid) return;
    if (this.currentSyncedUid === uid && this.activeUserUnsubscribe) {
      return;
    }

    this.detachRealtimeUserSync();
    this.currentSyncedUid = uid;
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
    } catch {
      // Non-blocking
    }
  }

  /**
   * Detaches active user listener on sign-out
   */
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
   * Uploads or updates player document in Firestore (/users/{uid})
   */
  public async pushUserToFirestore(user: UserRecord, phoneOverride?: string): Promise<boolean> {
    if (!user || !user.uid || user.uid.startsWith('usr_demo_')) return false;
    const cleanPhone = phoneOverride || user.phone || '';

    await this.ensureAuth();

    try {
      const userRef = doc(db, 'users', user.uid);
      const userPayload: Record<string, unknown> = {
        uid: user.uid,
        username: user.username || `Player_${user.uid.slice(-4)}`,
        phone: cleanPhone,
        balance: Math.max(0, Number(user.balance) || 0),
        vipLevel: Math.min(10, Math.max(0, Number(user.vipLevel) || 1)),
        status: user.status || 'active',
        role: user.role || 'user',
        referralCode: user.referralCode || '',
        totalBetsCount: user.totalBetsCount || 0,
        totalWonAmount: user.totalWonAmount || 0,
        totalLostAmount: user.totalLostAmount || 0,
        devices: user.devices || {},
        updatedAt: Date.now()
      };

      if (user.passwordHash) {
        userPayload.passwordHash = user.passwordHash;
      }
      if (user.referredBy) {
        userPayload.referredBy = user.referredBy;
      }

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
   * Syncs a wallet transaction to Firestore (/transactions/{txId})
   */
  public async pushTransactionToFirestore(tx: WalletTransaction): Promise<void> {
    if (!tx || !tx.id || !tx.uid) return;
    await this.ensureAuth();
    try {
      const txRef = doc(db, 'transactions', tx.id);
      await setDoc(
        txRef,
        {
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
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[FirebaseSync] pushTransactionToFirestore error:', err);
    }
  }

  /**
   * Syncs a player deposit request to Firestore (/deposits/{depositId})
   */
  public async pushDepositToFirestore(dep: DepositRecord): Promise<void> {
    if (!dep || !dep.id || !dep.uid) return;
    await this.ensureAuth();
    try {
      const depRef = doc(db, 'deposits', dep.id);
      await setDoc(
        depRef,
        {
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
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[FirebaseSync] pushDepositToFirestore error:', err);
    }
  }

  /**
   * Syncs a player withdrawal request to Firestore (/withdrawals/{withdrawalId})
   */
  public async pushWithdrawalToFirestore(w: WithdrawalRecord): Promise<void> {
    if (!w || !w.id || !w.uid) return;
    await this.ensureAuth();
    const destination =
      w.accountDetails?.upiId ||
      w.accountDetails?.accountNumber ||
      w.accountDetails?.usdtAddress ||
      w.phone ||
      'BANK_OR_UPI';

    try {
      const wRef = doc(db, 'withdrawals', w.id);
      await setDoc(
        wRef,
        {
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
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[FirebaseSync] pushWithdrawalToFirestore error:', err);
    }
  }

  /**
   * Syncs a live game bet to Firestore (/live_bets/{betId})
   */
  public async pushLiveBetToFirestore(bet: LiveBet): Promise<void> {
    if (!bet || !bet.betId || !bet.uid) return;
    await this.ensureAuth();
    try {
      const betRef = doc(db, 'live_bets', bet.betId);
      await setDoc(
        betRef,
        {
          betId: bet.betId,
          uid: bet.uid,
          username: bet.username,
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
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[FirebaseSync] pushLiveBetToFirestore error:', err);
    }
  }

  /**
   * Manually triggers an immediate force re-sync with Cloud Firestore,
   * pulling all users, deposits, withdrawals, transactions, active rounds, and settings.
   */
  public async forceSyncFromFirebase(): Promise<{ success: boolean; message: string; balance?: number; period?: string }> {
    await this.ensureAuth();
    await this.pushLocalStateToCloud();

    const activeUid = store.getActiveSessionUid();
    let newBalance = activeUid ? store.getUser(activeUid)?.balance : undefined;
    let latestPeriod = store.getCurrentRound()?.period;

    try {
      // 1. Pull all users from Firestore
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

      // 2. Pull all deposits from Firestore
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

      // 3. Pull all withdrawals from Firestore
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

      // 4. Pull all transactions from Firestore
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

      // 5. Pull WinGo rounds from Firestore
      const roundsSnap = await getDocs(collection(db, 'wingo_rounds'));
      roundsSnap.forEach((docSnap) => {
        const val = docSnap.data();
        if (val && val.period && val.gameType) {
          store.ingestCloudRound(val as Partial<GameRound>);
          if (val.period && !val.isResolved) latestPeriod = val.period;
        }
      });

      // 6. Pull Admin Settings from Firestore
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
        message: 'Live state synchronized successfully with Cloud Firestore!',
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
