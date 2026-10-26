import {
  db,
  rtdb,
  auth,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  rtdbRef,
  rtdbSet,
  rtdbOnValue,
  rtdbUpdate
} from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { UserRecord, WalletTransaction, DepositRecord, WithdrawalRecord, LiveBet, AdminSettings, GameRound } from '../types';
import { store } from './store';

class FirebaseSyncService {
  private activeUserUnsubscribe: (() => void) | null = null;
  private activeRtdbUserUnsubscribe: (() => void) | null = null;
  private activeRtdbSettingsUnsubscribe: (() => void) | null = null;
  private currentSyncedUid: string | null = null;

  constructor() {
    this.initAuthListener();
    this.bindStoreHooks();
    this.attachRealtimeAdminSettingsSync();
    this.attachRealtimeGameRoundsSync();
    this.attachRealtimeGlobalEntitiesSync();
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

  public async pushRoundToRtdb(round: GameRound): Promise<void> {
    if (!round || !round.period || !round.gameType) return;
    try {
      await rtdbSet(rtdbRef(rtdb, `wingo_rounds/${round.gameType}`), {
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
      });
    } catch (e) {
      console.warn('pushRoundToRtdb error:', e);
    }
  }

  public attachRealtimeGameRoundsSync() {
    if (typeof window === 'undefined') return;
    const modes: Array<'30s' | '1min' | '3min'> = ['30s', '1min', '3min'];
    modes.forEach((mode) => {
      try {
        rtdbOnValue(rtdbRef(rtdb, `wingo_rounds/${mode}`), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data && typeof data === 'object') {
              store.ingestCloudRound(data);
            }
          }
        });
      } catch (err) {
        console.warn('attachRealtimeGameRoundsSync error:', err);
      }
    });
  }

  public attachRealtimeGlobalEntitiesSync() {
    if (typeof window === 'undefined') return;
    try {
      rtdbOnValue(rtdbRef(rtdb, 'deposits'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            Object.values(val).forEach((d: unknown) => {
              const dep = d as DepositRecord;
              if (dep && dep.id) store.ingestCloudDeposit(dep);
            });
          }
        }
      });
    } catch (e) {
      console.warn('deposits listener error:', e);
    }

    try {
      rtdbOnValue(rtdbRef(rtdb, 'withdrawals'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            Object.values(val).forEach((w: unknown) => {
              const item = w as WithdrawalRecord;
              if (item && item.id) store.ingestCloudWithdrawal(item);
            });
          }
        }
      });
    } catch (e) {
      console.warn('withdrawals listener error:', e);
    }

    try {
      rtdbOnValue(rtdbRef(rtdb, 'live_bets'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            Object.values(val).forEach((b: unknown) => {
              const bet = b as LiveBet;
              if (bet && bet.betId) {
                const existing = store.liveBets.find((item) => item.betId === bet.betId);
                if (!existing) {
                  store.liveBets.unshift(bet);
                  store.notifyLightweight();
                }
              }
            });
          }
        }
      });
    } catch (e) {
      console.warn('live_bets listener error:', e);
    }

    try {
      rtdbOnValue(rtdbRef(rtdb, 'users'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            Object.values(val).forEach((u: unknown) => {
              const cloudUser = u as Partial<UserRecord>;
              if (cloudUser && cloudUser.uid) {
                store.updateUserFromFirestore(cloudUser as Partial<UserRecord> & { uid: string });
              }
            });
          }
        }
      });
    } catch (e) {
      console.warn('users listener error:', e);
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
      await rtdbSet(rtdbRef(rtdb, `aviator_rounds/${round.roundId}`), {
        roundId: round.roundId,
        status: round.status,
        crashMultiplier: round.status === 'crashed' ? round.crashMultiplier : null,
        liveMultiplier: liveMult,
        serverSeedHash: round.serverSeedHash || '',
        clientSeed: round.clientSeed || '',
        nonce: round.nonce || 0,
        updatedAt: Date.now()
      });
    } catch {
      // Non-blocking if RTDB rules restrict anonymous writes
    }
  }

  /**
   * Attaches real-time listener on /admin_settings in Firebase Realtime Database
   */
  public attachRealtimeAdminSettingsSync() {
    if (typeof window === 'undefined' || this.activeRtdbSettingsUnsubscribe) return;
    try {
      const settingsRef = rtdbRef(rtdb, 'admin_settings');
      this.activeRtdbSettingsUnsubscribe = rtdbOnValue(
        settingsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            if (val && typeof val === 'object') {
              store.ingestCloudAdminSettings(val as Partial<AdminSettings>);
            }
          }
        },
        () => {
          // Non-blocking if RTDB rules restrict read
        }
      );
    } catch {
      // Ignore RTDB init error
    }
  }

  public async pushAdminSettingsToRtdb(settings: AdminSettings): Promise<void> {
    if (!settings) return;
    try {
      await rtdbSet(rtdbRef(rtdb, 'admin_settings'), {
        ...settings,
        updatedAt: Date.now()
      });
    } catch {
      // Non-blocking if RTDB rules require Master Admin auth token
    }
  }

  /**
   * Initializes automatic Firebase Auth state listener.
   * Ensures users never have to repeatedly sign up - their cloud session stays alive.
   */
  private initAuthListener() {
    if (typeof window === 'undefined') return;

    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        localStorage.setItem('bingo777_active_uid', firebaseUser.uid);
        localStorage.setItem('maanwin_active_uid', firebaseUser.uid);

        this.attachRealtimeUserSync(firebaseUser.uid, firebaseUser.phoneNumber || undefined);
      } else {
        const storedUid = localStorage.getItem('bingo777_active_uid');
        if (storedUid) {
          this.attachRealtimeUserSync(storedUid);
        } else {
          this.detachRealtimeUserSync();
        }
      }
    });
  }

  /**
   * Attaches real-time Firebase Realtime Database (rtdb) + Firestore listener for the active user.
   * Any change made in RTDB/Firestore or Admin immediately reflects in the local app state in real time.
   */
  public attachRealtimeUserSync(uid: string, fallbackPhone?: string) {
    if (!uid) return;
    if (this.currentSyncedUid === uid && (this.activeRtdbUserUnsubscribe || this.activeUserUnsubscribe)) {
      return; // already attached
    }

    this.detachRealtimeUserSync();
    this.currentSyncedUid = uid;

    // 1. Primary Real-Time Sync via Firebase Realtime Database (gen-lang-client-0859410588-default-rtdb)
    try {
      const userRtdbRef = rtdbRef(rtdb, `users/${uid}`);
      this.activeRtdbUserUnsubscribe = rtdbOnValue(
        userRtdbRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data && typeof data === 'object') {
              store.updateUserFromFirestore({
                uid,
                phone: data.phone || fallbackPhone || undefined,
                username: data.username || undefined,
                balance: typeof data.balance === 'number' ? data.balance : undefined,
                vipLevel: typeof data.vipLevel === 'number' ? data.vipLevel : undefined,
                status: data.status || 'active',
                totalBetsCount: data.totalBetsCount,
                totalWonAmount: data.totalWonAmount,
                totalLostAmount: data.totalLostAmount,
                referralCode: data.referralCode || undefined,
                devices: data.devices || undefined
              });
            }
          } else {
            const localUser = store.getUser(uid);
            if (localUser) {
              this.pushUserToFirestore(localUser, fallbackPhone);
            }
          }
        },
        () => {
          // Non-blocking if RTDB rules require Firebase Auth session
        }
      );
    } catch {
      // Ignore RTDB listener error
    }

    // 2. Secondary Firestore Listener ONLY if authenticated with Firebase Auth
    if (auth.currentUser && auth.currentUser.uid === uid) {
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
                balance: typeof data.balance === 'number' ? data.balance : undefined,
                vipLevel: typeof data.vipLevel === 'number' ? data.vipLevel : undefined,
                status: data.status || 'active',
                totalBetsCount: data.totalBetsCount,
                totalWonAmount: data.totalWonAmount,
                totalLostAmount: data.totalLostAmount,
                referralCode: data.referralCode || undefined
              });
            }
          },
          () => {
            // Non-blocking if offline
          }
        );
      } catch {
        // Ignore Firestore listener error
      }
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
   * Uploads or updates player document in RTDB (/users/{uid}) and Firestore (/users/{uid})
   */
  public async pushUserToFirestore(user: UserRecord, phoneOverride?: string): Promise<boolean> {
    if (!user || !user.uid) return false;
    const cleanPhone = phoneOverride || user.phone || '';

    // 1. Push to Firebase Realtime Database
    try {
      const rtdbPayload: Record<string, unknown> = {
        uid: user.uid,
        username: user.username || `Player_${user.uid.slice(-4)}`,
        phone: cleanPhone,
        balance: Math.max(0, user.balance || 0),
        vipLevel: Math.min(10, Math.max(0, user.vipLevel || 0)),
        status: user.status || 'active',
        referralCode: user.referralCode || '',
        totalBetsCount: user.totalBetsCount || 0,
        totalWonAmount: user.totalWonAmount || 0,
        totalLostAmount: user.totalLostAmount || 0,
        updatedAt: Date.now()
      };
      await rtdbUpdate(rtdbRef(rtdb, `users/${user.uid}`), rtdbPayload);
    } catch {
      // Non-blocking if RTDB rules restrict write
    }

    // 2. Push to Firestore only when authenticated with Firebase Auth
    if (!auth.currentUser) return true;

    try {
      const userRef = doc(db, 'users', user.uid);
      const privateInfoRef = doc(db, 'users', user.uid, 'private', 'info');

      const userPayload: Record<string, unknown> = {
        uid: user.uid,
        username: user.username || `Player_${user.uid.slice(-4)}`,
        balance: Math.max(0, user.balance || 0),
        vipLevel: Math.min(10, Math.max(0, user.vipLevel || 0)),
        status: user.status || 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (user.referralCode) userPayload.referralCode = user.referralCode;
      if (typeof user.totalBetsCount === 'number') userPayload.totalBetsCount = user.totalBetsCount;
      if (typeof user.totalWonAmount === 'number') userPayload.totalWonAmount = user.totalWonAmount;
      if (typeof user.totalLostAmount === 'number') userPayload.totalLostAmount = user.totalLostAmount;

      await setDoc(userRef, userPayload, { merge: true });

      if (cleanPhone) {
        await setDoc(
          privateInfoRef,
          {
            uid: user.uid,
            phone: cleanPhone,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Syncs a wallet transaction to RTDB (/transactions/{txId}) and Firestore
   */
  public async pushTransactionToFirestore(tx: WalletTransaction): Promise<void> {
    if (!tx || !tx.id || !tx.uid) return;
    try {
      await rtdbSet(rtdbRef(rtdb, `transactions/${tx.id}`), {
        id: tx.id,
        uid: tx.uid,
        type: tx.type,
        category: tx.category,
        amount: tx.amount,
        balanceBefore: tx.balanceBefore,
        balanceAfter: tx.balanceAfter,
        referenceId: tx.referenceId || '',
        description: tx.description,
        timestamp: tx.timestamp || Date.now(),
        status: tx.status,
        integritySeal: tx.integritySeal || ''
      });
    } catch {
      // Non-blocking
    }

    if (!auth.currentUser) return;
    try {
      const txRef = doc(db, 'transactions', tx.id);
      await setDoc(txRef, {
        id: tx.id,
        uid: tx.uid,
        type: tx.type,
        category: tx.category,
        amount: tx.amount,
        balanceBefore: tx.balanceBefore,
        balanceAfter: tx.balanceAfter,
        description: tx.description,
        status: tx.status,
        createdAt: serverTimestamp()
      });
    } catch {
      // Non-blocking
    }
  }

  /**
   * Syncs a player deposit request to RTDB (/deposits/{depositId}) and Firestore
   */
  public async pushDepositToFirestore(dep: DepositRecord): Promise<void> {
    if (!dep || !dep.id || !dep.uid) return;
    try {
      await rtdbSet(rtdbRef(rtdb, `deposits/${dep.id}`), {
        id: dep.id,
        uid: dep.uid,
        username: dep.username,
        phone: dep.phone || '',
        amount: dep.amount,
        paymentMethod: dep.paymentMethod || 'UPI',
        referenceId: dep.referenceId,
        upiReceiverId: dep.upiReceiverId || '',
        status: dep.status,
        submittedAt: dep.submittedAt || Date.now(),
        reviewedAt: dep.reviewedAt || null,
        reviewedBy: dep.reviewedBy || null
      });
    } catch {
      // Non-blocking
    }

    if (!auth.currentUser) return;
    try {
      const depRef = doc(db, 'deposits', dep.id);
      await setDoc(depRef, {
        id: dep.id,
        uid: dep.uid,
        username: dep.username,
        amount: dep.amount,
        method: dep.paymentMethod === 'USDT' ? 'USDT' : 'UPI',
        utrOrRef: dep.referenceId,
        status: dep.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch {
      // Non-blocking
    }
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

    try {
      await rtdbSet(rtdbRef(rtdb, `withdrawals/${w.id}`), {
        id: w.id,
        uid: w.uid,
        username: w.username,
        phone: w.phone || '',
        amount: w.amount,
        payoutMethod: w.payoutMethod,
        destination,
        status: w.status,
        requestedAt: w.requestedAt || Date.now(),
        processedAt: w.processedAt || null,
        processedBy: w.processedBy || null
      });
    } catch {
      // Non-blocking
    }

    if (!auth.currentUser) return;
    try {
      const wRef = doc(db, 'withdrawals', w.id);
      await setDoc(wRef, {
        id: w.id,
        uid: w.uid,
        username: w.username,
        amount: w.amount,
        method: w.payoutMethod === 'Bank Transfer' ? 'BANK' : 'UPI',
        destination,
        status: w.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch {
      // Non-blocking
    }
  }

  /**
   * Syncs a live game bet to RTDB (/live_bets/{betId}) and Firestore
   */
  public async pushLiveBetToFirestore(bet: LiveBet): Promise<void> {
    if (!bet || !bet.betId || !bet.uid) return;
    try {
      await rtdbSet(rtdbRef(rtdb, `live_bets/${bet.betId}`), {
        betId: bet.betId,
        uid: bet.uid,
        username: bet.username,
        roundPeriod: bet.roundPeriod,
        gameType: bet.gameType,
        betType: bet.betType,
        betValue: bet.betValue,
        amount: bet.amount,
        multiplier: bet.multiplier,
        potentialPayout: bet.potentialPayout,
        status: bet.status,
        actualPayout: bet.actualPayout || 0,
        updatedAt: Date.now()
      });
    } catch {
      // Non-blocking
    }

    if (!auth.currentUser) return;
    try {
      const betRef = doc(db, 'live_bets', bet.betId);
      await setDoc(betRef, {
        betId: bet.betId,
        uid: bet.uid,
        username: bet.username,
        roundPeriod: bet.roundPeriod,
        gameType: bet.gameType,
        betType: bet.betType,
        betValue: bet.betValue,
        amount: bet.amount,
        multiplier: bet.multiplier,
        potentialPayout: bet.potentialPayout,
        status: bet.status,
        actualPayout: bet.actualPayout || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch {
      // Non-blocking
    }
  }

  /**
   * Manually triggers an immediate force re-sync with Firebase Realtime Database
   * and Firestore, bypassing cached states and updating balance, game results, and transactions.
   */
  public async forceSyncFromFirebase(): Promise<{ success: boolean; message: string; balance?: number; period?: string }> {
    const currentUser = store.currentUser;
    let newBalance = currentUser?.balance;
    let latestPeriod = store.currentRound?.period;

    try {
      // 1. Force sync active user balance & profile from RTDB
      if (currentUser?.uid) {
        try {
          const userSnapshot = await rtdbGet(rtdbRef(rtdb, `users/${currentUser.uid}`));
          if (userSnapshot.exists()) {
            const data = userSnapshot.val();
            if (data && typeof data === 'object') {
              store.updateUserFromFirestore({
                uid: currentUser.uid,
                phone: data.phone || currentUser.phone,
                username: data.username || currentUser.username,
                balance: typeof data.balance === 'number' ? data.balance : undefined,
                vipLevel: typeof data.vipLevel === 'number' ? data.vipLevel : undefined,
                status: data.status || 'active',
                totalBetsCount: data.totalBetsCount,
                totalWonAmount: data.totalWonAmount,
                totalLostAmount: data.totalLostAmount
              });
              if (typeof data.balance === 'number') {
                newBalance = data.balance;
              }
            }
          }
        } catch (e) {
          console.warn('Force sync user error:', e);
        }
      }

      // 2. Force sync latest WinGo active rounds for all modes
      const modes: Array<'30s' | '1min' | '3min'> = ['30s', '1min', '3min'];
      await Promise.all(
        modes.map(async (mode) => {
          try {
            const roundSnap = await rtdbGet(rtdbRef(rtdb, `wingo_rounds/${mode}`));
            if (roundSnap.exists()) {
              const val = roundSnap.val();
              if (val && typeof val === 'object') {
                store.ingestCloudRound(val);
                if (val.period) latestPeriod = val.period;
              }
            }
          } catch (e) {
            console.warn(`Force sync round ${mode} error:`, e);
          }
        })
      );

      // 3. Force sync latest Admin Settings
      try {
        const settingsSnap = await rtdbGet(rtdbRef(rtdb, 'admin_settings'));
        if (settingsSnap.exists()) {
          const settingsVal = settingsSnap.val();
          if (settingsVal && typeof settingsVal === 'object') {
            store.ingestCloudAdminSettings(settingsVal);
          }
        }
      } catch (e) {
        console.warn('Force sync settings error:', e);
      }

      // 4. Force sync deposits & withdrawals
      try {
        const depSnap = await rtdbGet(rtdbRef(rtdb, 'deposits'));
        if (depSnap.exists()) {
          const deps = depSnap.val();
          if (deps && typeof deps === 'object') {
            Object.values(deps).forEach((d: unknown) => {
              const dep = d as DepositRecord;
              if (dep && dep.id) store.ingestCloudDeposit(dep);
            });
          }
        }
      } catch {}

      try {
        const wSnap = await rtdbGet(rtdbRef(rtdb, 'withdrawals'));
        if (wSnap.exists()) {
          const wData = wSnap.val();
          if (wData && typeof wData === 'object') {
            Object.values(wData).forEach((w: unknown) => {
              const item = w as WithdrawalRecord;
              if (item && item.id) store.ingestCloudWithdrawal(item);
            });
          }
        }
      } catch {}

      // 5. Force sync all registered players from /users
      try {
        const usersSnap = await rtdbGet(rtdbRef(rtdb, 'users'));
        if (usersSnap.exists()) {
          const allUsers = usersSnap.val();
          if (allUsers && typeof allUsers === 'object') {
            Object.values(allUsers).forEach((u: unknown) => {
              const cloudUser = u as Partial<UserRecord>;
              if (cloudUser && cloudUser.uid) {
                store.updateUserFromFirestore(cloudUser as Partial<UserRecord> & { uid: string });
              }
            });
          }
        }
      } catch (e) {
        console.warn('Force sync users error:', e);
      }

      // Refresh store notification
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

