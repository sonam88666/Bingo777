import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Key,
  X,
  Gift,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastProvider, useToast } from './components/common/Toast';
import { UserHeader } from './components/user/UserHeader';
import { GameLobby } from './components/user/GameLobby';
import { ColorPredictionGame } from './components/user/ColorPredictionGame';
import { AviatorGame } from './components/user/AviatorGame';
import { K3DiceGame } from './components/user/K3DiceGame';
import { TrxWinGoGame } from './components/user/TrxWinGoGame';
import { FortuneWheelGame } from './components/user/FortuneWheelGame';
import { LudoBattleGame } from './components/user/LudoBattleGame';
import { QuizBattleGame } from './components/user/QuizBattleGame';
import { DragonTigerGame } from './components/user/DragonTigerGame';
import { ActivityView } from './components/user/ActivityView';
import { WalletView } from './components/user/WalletView';
import { AccountView } from './components/user/AccountView';
import { GameBetHistorySection } from './components/user/GameBetHistorySection';
import { GiftCodeModal } from './components/user/GiftCodeModal';
import { SupportChatModal } from './components/user/SupportChatModal';
import { ReferralDashboardModal } from './components/user/ReferralDashboardModal';
import { UserAuthModal } from './components/user/UserAuthModal';
import { GameResultModal } from './components/user/GameResultModal';
import { BottomNav, TabId } from './components/navigation/BottomNav';
import { MasterAdminSuite } from './components/admin/MasterAdminSuite';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { MaintenanceOverlay } from './components/common/MaintenanceOverlay';
import { AppPopupModal } from './components/common/AppPopupModal';
import { TelegramFloatingWidget } from './components/common/TelegramFloatingWidget';
import { GameErrorBoundary } from './components/common/ErrorBoundary';
import { store } from './services/store';
import { firebaseSync } from './services/firebaseSync';
import { auth, rtdb, rtdbRef, rtdbGet, rtdbOnValue, rtdbUpdate, onAuthStateChanged, getPersistentDeviceId } from './firebase';
import { UserRecord, DeviceRecord, GameId, RoundSettlementNotice } from './types';
import { AdminSettingsProvider, useAdminSettings } from './context/AdminSettingsContext';
import { captureAndPersistReferralCode } from './services/referralAttribution';

function MainApp() {
  const { showToast } = useToast();
  const { settings: liveAdminSettings, isGameEnabled } = useAdminSettings();

  // Mode: Player App vs Master Admin
  const [viewMode, setViewMode] = useState<'user_app' | 'master_admin'>('user_app');

  // Active Bottom Navigation Tab
  const [activeNavTab, setActiveNavTab] = useState<TabId>('home');

  // In Lobby: Active selected game (null means showing lobby cards)
  const [selectedSubGame, setSelectedSubGame] = useState<GameId | null>(null);

  // Instant session hydration from localStorage so app opens immediately without auto-logout
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(() => {
    try {
      const activeUid = localStorage.getItem('bingo777_active_uid');
      if (activeUid && !activeUid.startsWith('usr_demo_')) {
        const fromStore = store.getUser(activeUid);
        if (fromStore) return fromStore;
      }
      const cachedSession = localStorage.getItem('bingo777_session_user');
      if (cachedSession) {
        const parsed = JSON.parse(cachedSession) as UserRecord;
        if (parsed && parsed.uid && !parsed.uid.startsWith('usr_demo_')) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });
  const [masterAdminId, setMasterAdminId] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Modals
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBetHistoryModal, setShowBetHistoryModal] = useState(false);
  const [walletInitialTab, setWalletInitialTab] = useState<'deposit' | 'withdraw' | 'records'>('deposit');
  const [settlementQueue, setSettlementQueue] = useState<RoundSettlementNotice[]>([]);
  const [welcomeBonusPopup, setWelcomeBonusPopup] = useState<{ uid: string; amount: number; username: string } | null>(null);

  // Listen for new user Sign-Up ₹200 Welcome Bonus award and show celebratory popup on screen
  useEffect(() => {
    const checkStoredWelcomePopup = () => {
      try {
        const raw = localStorage.getItem('bingo777_welcome_bonus_popup');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.uid && !localStorage.getItem(`bingo777_welcome_popup_shown_${parsed.uid}`)) {
          setWelcomeBonusPopup({
            uid: parsed.uid,
            amount: Number(parsed.amount) || 200,
            username: parsed.username || 'Player'
          });
        }
      } catch {}
    };

    const handleWelcomeAwarded = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail && detail.uid && !localStorage.getItem(`bingo777_welcome_popup_shown_${detail.uid}`)) {
        setWelcomeBonusPopup({
          uid: detail.uid,
          amount: Number(detail.amount) || 200,
          username: detail.username || 'Player'
        });
      } else {
        checkStoredWelcomePopup();
      }
    };

    checkStoredWelcomePopup();
    window.addEventListener('bingo777_welcome_bonus_awarded', handleWelcomeAwarded);
    return () => window.removeEventListener('bingo777_welcome_bonus_awarded', handleWelcomeAwarded);
  }, [currentUser?.uid]);

  const handleCloseWelcomeBonusPopup = () => {
    if (welcomeBonusPopup?.uid) {
      localStorage.setItem(`bingo777_welcome_popup_shown_${welcomeBonusPopup.uid}`, 'true');
    }
    localStorage.removeItem('bingo777_welcome_bonus_popup');
    setWelcomeBonusPopup(null);
  };

  // Store Sync & User Session Persistence
  const [storeTick, setStoreTick] = useState(0);

  // If currently opened sub-game or tab is disabled by Master Admin via live /admin_settings stream, safely return user to lobby within 200ms
  useEffect(() => {
    if (selectedSubGame && (!isGameEnabled(selectedSubGame) || !store.isFeatureEnabled(selectedSubGame) || !store.isFeatureVisible(selectedSubGame))) {
      setSelectedSubGame(null);
      showToast('This game was disabled by Master Admin. Returning to Lobby.', 'info');
    }
    if (activeNavTab === 'wingo' && (!isGameEnabled('wingo') || !store.isFeatureEnabled('wingo') || !store.isFeatureVisible('wingo'))) {
      setActiveNavTab('home');
    }
    if (activeNavTab === 'aviator' && (!isGameEnabled('aviator') || !store.isFeatureEnabled('aviator') || !store.isFeatureVisible('aviator'))) {
      setActiveNavTab('home');
    }
  }, [selectedSubGame, activeNavTab, storeTick, liveAdminSettings, isGameEnabled]);

  // Master Admin Session Timeout (auto-lock after 30 minutes of inactivity)
  useEffect(() => {
    if (viewMode !== 'master_admin' || !masterAdminId) return;
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
    let timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
      handleAdminLogout();
    }, SESSION_TIMEOUT_MS);

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleAdminLogout();
      }, SESSION_TIMEOUT_MS);
    };

    window.addEventListener('mousemove', resetTimer, { passive: true });
    window.addEventListener('keydown', resetTimer, { passive: true });
    window.addEventListener('touchstart', resetTimer, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [viewMode, masterAdminId]);

  const syncUnacknowledgedSettlements = (uid: string | null) => {
    if (!uid) {
      setSettlementQueue([]);
      return;
    }
    const unacked = store.getUnacknowledgedSettlements(uid);
    setSettlementQueue((prev) => {
      const mergedMap = new Map<string, RoundSettlementNotice>();
      prev.forEach((n) => {
        if (!store.isResultAcknowledged(n.resultId)) {
          mergedMap.set(n.resultId, n);
        }
      });
      unacked.forEach((n) => {
        if (!store.isResultAcknowledged(n.resultId)) {
          mergedMap.set(n.resultId, n);
        }
      });
      return Array.from(mergedMap.values()).sort((a, b) => a.settledAt - b.settledAt);
    });
  };

  // Firebase Auth state persistence listener with authLoading guard (Never clears session while authLoading or offline)
  useEffect(() => {
    // Immediately capture and persist ?ref= referral code from URL if present
    captureAndPersistReferralCode().catch(() => {});

    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      const storedUid = localStorage.getItem('bingo777_active_uid');
      if (fbUser && !fbUser.isAnonymous) {
        const targetUid = storedUid || fbUser.uid;
        if (!storedUid) {
          localStorage.setItem('bingo777_active_uid', targetUid);
        }
        firebaseSync.attachRealtimeUserSync(targetUid, fbUser.phoneNumber || undefined);
      } else if (storedUid) {
        // Keep persisted localStorage session active even during network drops or virtual-email restore
        firebaseSync.attachRealtimeUserSync(storedUid);
      }
      setAuthLoading(false);
    });
    return () => unsubAuth();
  }, []);

  // Real-time Firebase RTDB listener on current user profile (`users/{uid}`) so wallet, role, and admin status update live
  useEffect(() => {
    const activeUid = currentUser?.uid || localStorage.getItem('bingo777_active_uid');
    if (!activeUid || activeUid.startsWith('usr_demo_')) return;

    // Sync actual hardware/browser device entry to users/{uid}/devices/{deviceId}
    store.syncActiveUserDeviceToCloud(activeUid).catch(() => {});

    const userRef = rtdbRef(rtdb, `users/${activeUid}`);
    const unsubRtdbUser = rtdbOnValue(
      userRef,
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.val();
        if (data && typeof data === 'object') {
          const updated = store.updateUserFromFirestore({ ...data, uid: activeUid });
          if (updated) {
            setCurrentUser({ ...updated });
            localStorage.setItem('bingo777_session_user', JSON.stringify(updated));
          }
        }
      },
      () => {}
    );

    return () => unsubRtdbUser();
  }, [currentUser?.uid]);

  useEffect(() => {
    // 1. Initial Session Hydration from authoritative unique UID or saved session
    const storedUid = localStorage.getItem('bingo777_active_uid');
    const lastPhone = localStorage.getItem('bingo777_last_phone') || '';
    const deletedUids = store.getDeletedUserUids();
    const allUsers = store.getUsers();

    if (storedUid) {
      if (storedUid.startsWith('usr_demo_') || deletedUids.includes(storedUid)) {
        localStorage.removeItem('bingo777_active_uid');
        localStorage.removeItem('bingo777_session_user');
        setCurrentUser(null);
      } else {
        const activeU = allUsers[storedUid] || (lastPhone ? store.findUserByPhone(lastPhone) : undefined);
        if (activeU) {
          if (activeU.uid !== storedUid) {
            localStorage.setItem('bingo777_active_uid', activeU.uid);
          }
          setCurrentUser(activeU);
          localStorage.setItem('bingo777_session_user', JSON.stringify(activeU));
          firebaseSync.attachRealtimeUserSync(activeU.uid, activeU.phone);
        } else {
          // Restore from mirrored session user if store is still syncing from Firebase
          try {
            const cachedSession = localStorage.getItem('bingo777_session_user');
            if (cachedSession) {
              const parsed = JSON.parse(cachedSession) as UserRecord;
              if (parsed && parsed.uid) {
                const restored = store.updateUserFromFirestore(parsed);
                if (restored) setCurrentUser(restored);
              }
            }
          } catch {}
          store.syncUsersWithBackend();
          firebaseSync.pullUsersFromRtdb().catch(() => {});
        }
      }
    }

    // 2. Authoritative Store Subscription (Never logs out during authLoading or network drop)
    const unsubscribe = store.subscribe(() => {
      setStoreTick((t) => t + 1);
      const activeUid = localStorage.getItem('bingo777_active_uid');
      const savedPhone = localStorage.getItem('bingo777_last_phone') || '';
      if (activeUid) {
        const isDeleted = store.getDeletedUserUids().includes(activeUid);
        if (isDeleted) {
          localStorage.removeItem('bingo777_active_uid');
          localStorage.removeItem('bingo777_session_user');
          setCurrentUser(null);
          setSettlementQueue([]);
          showToast('Account has been safely deactivated or removed.', 'info');
          return;
        }
        const refreshed = store.getUser(activeUid) || (savedPhone ? store.findUserByPhone(savedPhone) : undefined);
        if (refreshed) {
          if (refreshed.isBanned === true || refreshed.status === 'banned' || refreshed.status === 'deactivated' || refreshed.status === 'blocked') {
            localStorage.removeItem('bingo777_active_uid');
            localStorage.removeItem('bingo777_session_user');
            setCurrentUser(null);
            setSettlementQueue([]);
            showToast('Your account has been suspended or deactivated by Admin.', 'info');
            return;
          }
          setCurrentUser({ ...refreshed });
          localStorage.setItem('bingo777_session_user', JSON.stringify(refreshed));
          syncUnacknowledgedSettlements(refreshed.uid);
        }
      } else if (!authLoading) {
        setCurrentUser(null);
        setSettlementQueue([]);
      }
    });

    // 3. Authoritative Settlement Event Subscription (WIN / LOSS Popups)
    const unsubSettlement = store.subscribeSettlement((notice) => {
      const activeUid = localStorage.getItem('bingo777_active_uid');
      if (activeUid && notice.uid === activeUid && !store.isResultAcknowledged(notice.resultId)) {
        setSettlementQueue((prev) => {
          if (prev.some((item) => item.resultId === notice.resultId)) {
            return prev;
          }
          return [...prev, notice].sort((a, b) => a.settledAt - b.settledAt);
        });
      }
    });

    // 4. Authoritative Local Notification Subscription
    const unsubNotifications = store.subscribeUserNotifications((notif) => {
      const activeUid = localStorage.getItem('bingo777_active_uid');
      if (activeUid && notif.uid === activeUid) {
        const toastType =
          notif.statusBadge === 'rejected'
            ? 'error'
            : notif.statusBadge === 'approved' || notif.statusBadge === 'resolved'
            ? 'success'
            : 'info';
        showToast(`${notif.title}: ${notif.message}`, toastType);
      }
    });

    // 5. Hydrate any unacknowledged settlement results on app launch / refresh / resume
    const initialUid = storedUid || localStorage.getItem('bingo777_active_uid');
    if (initialUid) {
      store.checkAndResolveExpiredRounds();
      syncUnacknowledgedSettlements(initialUid);
    }

    return () => {
      unsubscribe();
      unsubSettlement();
      unsubNotifications();
    };
  }, [showToast, authLoading]);

  const activeSettlement = settlementQueue.length > 0 ? settlementQueue[0] : null;

  const handleDismissSettlement = (notice: RoundSettlementNotice) => {
    store.acknowledgeSettlement(notice.resultId, notice.uid);
    setSettlementQueue((prev) => prev.filter((item) => item.resultId !== notice.resultId));
  };

  // Current Device
  const currentDevice: DeviceRecord | null = currentUser && currentUser.devices
    ? Object.values(currentUser.devices)[0] || null
    : null;

  // Legacy live chat disabled; official support handled via Telegram
  const unreadSupportCount = 0;

  const handleAdminLoginSuccess = (adminId: string, token?: string) => {
    setMasterAdminId(adminId);
    if (token) {
      sessionStorage.setItem('bingo777_master_admin_token', token);
    }
    setShowAdminLogin(false);
    setViewMode('master_admin');
  };

  const handleOpenAdminPortal = async () => {
    // STRICT REQUIREMENT: Must be logged in first. Tapping before login does nothing.
    if (!currentUser || !currentUser.uid) {
      return;
    }

    const persistentDeviceId = getPersistentDeviceId();
    const liveUser = store.getUser(currentUser.uid) || currentUser;
    const cleanPhone = (liveUser?.phone || '').replace(/\D/g, '');
    const isMasterAdmin = store.isMasterAdminPhone(cleanPhone);

    // Fetch live record from Firebase RTDB to verify Admin status & device lock in real time
    let rtdbUser: Record<string, any> | null = null;
    try {
      const snap = await rtdbGet(rtdbRef(rtdb, `users/${liveUser.uid}`));
      if (snap.exists()) {
        rtdbUser = snap.val();
      }
    } catch {}

    const rtdbPhone = (rtdbUser?.phone || cleanPhone).replace(/\D/g, '');
    const isMasterByCloud = store.isMasterAdminPhone(rtdbPhone);
    const isMaster = isMasterAdmin || isMasterByCloud;

    const isSelectedAdmin = Boolean(
      isMaster ||
        (rtdbUser
          ? rtdbUser.isAdmin === true || rtdbUser.role === 'admin' || rtdbUser.role === 'master_admin'
          : liveUser.isAdmin === true || liveUser.role === 'admin' || liveUser.role === 'master_admin')
    );

    // STRICT SECURITY GUARD: Only Main Admins (7088961883, 9012634797) or users explicitly promoted by them can open Admin Console.
    // All other users get zero response no matter how many times they tap!
    if (!isSelectedAdmin || !liveUser || liveUser.isBanned || liveUser.status === 'banned' || rtdbUser?.isBanned) {
      return;
    }

    const activeBoundDevice = rtdbUser?.boundDeviceId ?? liveUser.boundDeviceId ?? null;

    // STRICT DEVICE LOCK SECURITY: An Admin account cannot be opened on unauthorized devices!
    if (activeBoundDevice && activeBoundDevice !== persistentDeviceId) {
      showToast(
        `Device Security Lock: Admin Console is bound to another authorized device (${activeBoundDevice}). Unauthorized device access is blocked.`,
        'error'
      );
      return;
    }

    // Auto-bind device on first login after promotion or after Super Admin clicks "Reset Device Lock"
    if (!activeBoundDevice || isMaster) {
      await rtdbUpdate(rtdbRef(rtdb, `users/${liveUser.uid}`), {
        boundDeviceId: activeBoundDevice || persistentDeviceId,
        lastUsedDeviceId: persistentDeviceId,
        isAdmin: true,
        role: isMaster ? 'master_admin' : 'admin',
        lastLogin: Date.now(),
        isOnline: true
      }).catch(() => {});

      store.updateUserFromFirestore({
        uid: liveUser.uid,
        boundDeviceId: activeBoundDevice || persistentDeviceId,
        lastUsedDeviceId: persistentDeviceId,
        isAdmin: true,
        role: isMaster ? 'master_admin' : 'admin'
      });
      liveUser.boundDeviceId = activeBoundDevice || persistentDeviceId;
    }

    const token = 'BINGO_MASTER_2026_KEY';
    sessionStorage.setItem('bingo777_master_admin_token', token);
    localStorage.setItem('bingo777_master_admin_token', token);
    setMasterAdminId(liveUser.name || liveUser.username || liveUser.phone || liveUser.uid);
    setViewMode('master_admin');
    showToast(`Welcome Admin ${liveUser.username || liveUser.phone || 'Authorized'}!`, 'success');
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('bingo777_master_admin_token');
    localStorage.removeItem('bingo777_master_admin_token');
    setMasterAdminId(null);
    setViewMode('user_app');
    showToast('Master Admin session locked & token cleared', 'info');
  };

  // Bottom Nav switcher handler
  const handleTabChange = (tab: TabId) => {
    setActiveNavTab(tab);
    if (tab === 'home') {
      setSelectedSubGame(null);
    } else if (tab === 'wingo') {
      setSelectedSubGame('wingo');
    } else if (tab === 'aviator') {
      setSelectedSubGame('aviator');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* VIEW 1: MASTER ADMIN COMMAND CENTER */}
      {viewMode === 'master_admin' && currentUser && store.isUserAdmin(currentUser.uid) ? (
        <div>
          {/* Quick return button banner in admin mode */}
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs">
            <span className="text-amber-300 font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Master Admin Command Center Active</span>
            </span>
            <button
              onClick={() => setViewMode('user_app')}
              className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-bold text-[11px] transition"
            >
              Switch to Player View &rarr;
            </button>
          </div>
          <GameErrorBoundary gameName="Master Admin Console" onResetToLobby={() => setViewMode('user_app')}>
            <MasterAdminSuite
              adminId={masterAdminId || 'MasterAdmin_01'}
              masterToken={sessionStorage.getItem('bingo777_master_admin_token') || undefined}
              onLogout={handleAdminLogout}
            />
          </GameErrorBoundary>
        </div>
      ) : !currentUser ? (
        /* VIEW 2A: FIRST SCREEN IS SIGNUP / LOGIN PAGE WHEN NOT LOGGED IN */
        <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
          <UserAuthModal
            canClose={false}
            onSuccess={(u) => {
              localStorage.setItem('bingo777_active_uid', u.uid);
              setCurrentUser(u);
              setShowAuthModal(false);
            }}
            onClose={() => {}}
          />
        </div>
      ) : (
        /* VIEW 2B: PLAYER APPLICATION (NATIVE APP EXPERIENCE AFTER LOGIN/SIGNUP) */
        <div className="flex-1 flex flex-col pb-20">
          {/* Maintenance Mode Overlay Message & Persistent Warning Bar */}
          <MaintenanceOverlay onOpenSupport={() => setShowSupportModal(true)} />

          {/* Top User App Header */}
          <UserHeader
            user={currentUser}
            unreadSupportCount={unreadSupportCount}
            onOpenDeposit={() => setActiveNavTab('wallet')}
            onOpenSupport={() => setShowSupportModal(true)}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenAdmin={handleOpenAdminPortal}
          />

          {/* Main Content Area Based on Active Bottom Nav Tab */}
          <main className="flex-1">
            {/* TAB: HOME / LOBBY */}
            {activeNavTab === 'home' && !selectedSubGame && (
              <GameLobby
                user={currentUser}
                onSelectGame={(gid) => {
                  if (gid === 'wingo') {
                    setActiveNavTab('wingo');
                  } else if (gid === 'aviator') {
                    setActiveNavTab('aviator');
                  } else {
                    setSelectedSubGame(gid);
                  }
                }}
                onOpenDeposit={() => setActiveNavTab('wallet')}
                onOpenAuth={() => setShowAuthModal(true)}
                onOpenGiftCode={() => setShowGiftModal(true)}
                onOpenReferral={() => currentUser ? setShowReferralModal(true) : setShowAuthModal(true)}
              />
            )}

            {/* DIRECT PROVABLY-FAIR SUBGAMES: K3 LOTRE, TRX WIN GO, FORTUNE WHEEL, MINES */}

            {activeNavTab === 'home' && selectedSubGame && !store.isFeatureEnabled(selectedSubGame) && (
              <div className="max-w-md mx-auto mt-12 px-4 text-center space-y-4">
                <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="font-brand font-black text-lg text-slate-100">
                    Game Temporarily Disabled
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This game module has been temporarily disabled by the Master Admin. Your wallet funds remain 100% secure.
                  </p>
                  <button
                    onClick={() => setSelectedSubGame(null)}
                    className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
                  >
                    Return to Game Lobby
                  </button>
                </div>
              </div>
            )}

            {activeNavTab === 'home' && selectedSubGame === 'k3_dice' && store.isFeatureEnabled('k3_dice') && (
              <GameErrorBoundary gameName="K3 Lotre Dice" onResetToLobby={() => setSelectedSubGame(null)}>
                <K3DiceGame
                  user={currentUser}
                  onBackToLobby={() => setSelectedSubGame(null)}
                  onOpenDeposit={() => setActiveNavTab('wallet')}
                  onOpenAuth={() => setShowAuthModal(true)}
                />
              </GameErrorBoundary>
            )}

            {activeNavTab === 'home' && selectedSubGame === 'trx_wingo' && store.isFeatureEnabled('trx_wingo') && (
              <GameErrorBoundary gameName="TRX Win Go" onResetToLobby={() => setSelectedSubGame(null)}>
                <TrxWinGoGame
                  user={currentUser}
                  onBackToLobby={() => setSelectedSubGame(null)}
                  onOpenDeposit={() => setActiveNavTab('wallet')}
                  onOpenAuth={() => setShowAuthModal(true)}
                />
              </GameErrorBoundary>
            )}

            {activeNavTab === 'home' && selectedSubGame === 'wheel' && store.isFeatureEnabled('wheel') && (
              <GameErrorBoundary gameName="Fortune Wheel" onResetToLobby={() => setSelectedSubGame(null)}>
                <FortuneWheelGame
                  user={currentUser}
                  onBackToLobby={() => setSelectedSubGame(null)}
                  onOpenDeposit={() => {
                    setWalletInitialTab('deposit');
                    setActiveNavTab('wallet');
                  }}
                  onOpenAuth={() => setShowAuthModal(true)}
                />
              </GameErrorBoundary>
            )}

            {activeNavTab === 'home' && selectedSubGame === 'ludo' && store.isFeatureEnabled('ludo') && (
              <GameErrorBoundary gameName="Ludo Royale" onResetToLobby={() => setSelectedSubGame(null)}>
                <LudoBattleGame
                  user={currentUser}
                  onBack={() => setSelectedSubGame(null)}
                  onOpenDeposit={() => {
                    setWalletInitialTab('deposit');
                    setActiveNavTab('wallet');
                  }}
                />
              </GameErrorBoundary>
            )}

            {activeNavTab === 'home' && selectedSubGame === 'quiz_battle' && store.isFeatureEnabled('quiz_battle') && (
              <GameErrorBoundary gameName="Live News Poll" onResetToLobby={() => setSelectedSubGame(null)}>
                <QuizBattleGame
                  user={currentUser}
                  onBack={() => setSelectedSubGame(null)}
                  onOpenDeposit={() => {
                    setWalletInitialTab('deposit');
                    setActiveNavTab('wallet');
                  }}
                />
              </GameErrorBoundary>
            )}

            {activeNavTab === 'home' && selectedSubGame === 'dragon_tiger' && store.isFeatureEnabled('dragon_tiger') && (
              <GameErrorBoundary gameName="Dragon vs Tiger 3D" onResetToLobby={() => setSelectedSubGame(null)}>
                <DragonTigerGame
                  user={currentUser}
                  onBackToLobby={() => setSelectedSubGame(null)}
                  onOpenDeposit={() => {
                    setWalletInitialTab('deposit');
                    setActiveNavTab('wallet');
                  }}
                  onOpenAuth={() => setShowAuthModal(true)}
                />
              </GameErrorBoundary>
            )}

            {/* TAB: WIN GO COLOR PREDICTION */}
            {activeNavTab === 'wingo' && (
              store.isFeatureEnabled('wingo') ? (
                <GameErrorBoundary gameName="Win Go" onResetToLobby={() => setActiveNavTab('home')}>
                  <ColorPredictionGame
                    user={currentUser}
                    onOpenDeposit={() => setActiveNavTab('wallet')}
                    onOpenAuth={() => setShowAuthModal(true)}
                  />
                </GameErrorBoundary>
              ) : (
                <div className="max-w-md mx-auto mt-12 px-4 text-center space-y-4">
                  <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h3 className="font-brand font-black text-lg text-slate-100">
                      Win Go Temporarily Disabled
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Win Go is currently disabled by Master Admin. Please try our other active games in the Lobby.
                    </p>
                    <button
                      onClick={() => setActiveNavTab('home')}
                      className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
                    >
                      Go to Game Lobby
                    </button>
                  </div>
                </div>
              )
            )}

            {/* TAB: AVIATOR CRASH */}
            {activeNavTab === 'aviator' && (
              store.isFeatureEnabled('aviator') ? (
                <GameErrorBoundary gameName="Aviator Crash" onResetToLobby={() => setActiveNavTab('home')}>
                  <AviatorGame
                    user={currentUser}
                    onBackToLobby={() => setActiveNavTab('home')}
                    onOpenDeposit={() => setActiveNavTab('wallet')}
                    onOpenAuth={() => setShowAuthModal(true)}
                  />
                </GameErrorBoundary>
              ) : (
                <div className="max-w-md mx-auto mt-12 px-4 text-center space-y-4">
                  <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h3 className="font-brand font-black text-lg text-slate-100">
                      Aviator Temporarily Disabled
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Aviator Crash is currently disabled by Master Admin. Please try our other active games in the Lobby.
                    </p>
                    <button
                      onClick={() => setActiveNavTab('home')}
                      className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
                    >
                      Go to Game Lobby
                    </button>
                  </div>
                </div>
              )
            )}

            {/* TAB: ACTIVITY & PROMOTIONS */}
            {activeNavTab === 'activity' && (
              <GameErrorBoundary gameName="Activity & Promotions" onResetToLobby={() => setActiveNavTab('home')}>
                <ActivityView
                  user={currentUser}
                  onOpenDeposit={() => setActiveNavTab('wallet')}
                  onOpenGiftCode={() => setShowGiftModal(true)}
                  onSelectGame={(gid) => {
                    setActiveNavTab('home');
                    setSelectedSubGame(gid);
                  }}
                  onOpenAuth={() => setShowAuthModal(true)}
                  onOpenReferral={() => currentUser ? setShowReferralModal(true) : setShowAuthModal(true)}
                />
              </GameErrorBoundary>
            )}

            {/* TAB: WALLET (DEPOSIT & WITHDRAW) */}
            {activeNavTab === 'wallet' && (
              <GameErrorBoundary gameName="Wallet & Banking" onResetToLobby={() => setActiveNavTab('home')}>
                <WalletView
                  user={currentUser}
                  initialTab={walletInitialTab}
                  onOpenSupport={() => setShowSupportModal(true)}
                />
              </GameErrorBoundary>
            )}

            {/* TAB: ACCOUNT / PROFILE */}
            {activeNavTab === 'account' && (
              <AccountView
                user={currentUser}
                currentDevice={currentDevice}
                unreadSupportCount={unreadSupportCount}
                onOpenGiftCode={() => setShowGiftModal(true)}
                onOpenSupport={() => setShowSupportModal(true)}
                onOpenReferral={() => setShowReferralModal(true)}
                onOpenDepositHistory={() => {
                  setWalletInitialTab('records');
                  setActiveNavTab('wallet');
                }}
                onOpenGameHistory={() => setShowBetHistoryModal(true)}
                onLogout={() => {
                  localStorage.removeItem('bingo777_active_uid');
                  localStorage.removeItem('maanwin_active_uid');
                  localStorage.removeItem('bingo777_session_user');
                  store.logoutUser(currentUser.uid);
                  firebaseSync.detachRealtimeUserSync();
                  try { auth.signOut(); } catch {}
                  setCurrentUser(null);
                  setActiveNavTab('home');
                }}
              />
            )}
          </main>

          {/* 3D Floating Official Telegram Support Widget (Above Bottom Navigation) */}
          <TelegramFloatingWidget />

          {/* Native Bottom Navigation Bar */}
          <BottomNav
            activeTab={activeNavTab}
            onChangeTab={handleTabChange}
            unreadSupportCount={unreadSupportCount}
            onSecretAdminTrigger={handleOpenAdminPortal}
          />
        </div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {showGiftModal && currentUser && (
          <GiftCodeModal
            user={currentUser}
            onClose={() => setShowGiftModal(false)}
          />
        )}

        {showSupportModal && (
          <SupportChatModal
            user={currentUser}
            onClose={() => setShowSupportModal(false)}
          />
        )}

        {showReferralModal && currentUser && (
          <ReferralDashboardModal
            user={currentUser}
            onClose={() => setShowReferralModal(false)}
            onOpenDeposit={() => {
              setShowReferralModal(false);
              setWalletInitialTab('deposit');
              setActiveNavTab('wallet');
            }}
          />
        )}

        {showAuthModal && currentUser && (
          <UserAuthModal
            onSuccess={(u) => {
              localStorage.setItem('bingo777_active_uid', u.uid);
              setCurrentUser(u);
              setShowAuthModal(false);
            }}
            onClose={() => setShowAuthModal(false)}
          />
        )}

        {/* High-Security Hidden Admin Login Modal — strictly guarded for logged-in authorized Admins only */}
        {showAdminLogin && currentUser && store.isUserAdmin(currentUser.uid) && (
          <AdminLoginModal
            currentUser={currentUser}
            onSuccess={handleAdminLoginSuccess}
            onCancel={() => setShowAdminLogin(false)}
            onUserBlocked={() => {
              setCurrentUser(null);
              setShowAdminLogin(false);
            }}
          />
        )}

        {/* Celebratory ₹200 Welcome Bonus Credited Popup Modal on Sign Up */}
        {welcomeBonusPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              transition={{ type: 'spring', stiffness: 360, damping: 25 }}
              className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.35)] p-6 text-center overflow-hidden space-y-4"
            >
              {/* Ambient Gold Glow */}
              <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-amber-500/20 blur-3xl" />

              <button
                type="button"
                onClick={handleCloseWelcomeBonusPopup}
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* 3D Gift Emblem */}
              <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-xl shadow-amber-500/30">
                <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center relative">
                  <Gift className="w-10 h-10 text-amber-400 animate-bounce" />
                  <Sparkles className="w-4 h-4 text-amber-200 absolute top-2 right-2 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Welcome Bonus Credited!</span>
                </div>
                <h3 className="font-brand font-black text-xl text-white pt-1">
                  Congratulations, {welcomeBonusPopup.username}! 🎉
                </h3>
                <p className="text-xs text-slate-300">
                  Your new account is ready and your instant Welcome Bonus has been added to your wallet!
                </p>
              </div>

              {/* ₹200 Bonus Display Box */}
              <div className="py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15 border border-amber-400/50 shadow-inner space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                  Instant Sign-Up Reward
                </span>
                <div className="font-mono font-black text-4xl bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow">
                  +₹{welcomeBonusPopup.amount}
                </div>
                <span className="text-[11px] text-emerald-300 font-bold block">
                  ✓ Added to Main Wallet Balance
                </span>
              </div>

              <button
                type="button"
                onClick={handleCloseWelcomeBonusPopup}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 active:scale-95 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 transition"
              >
                Claim &amp; Start Playing 🚀
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Bet & Game History Modal */}
        {showBetHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 18 }}
              transition={{ type: 'spring', stiffness: 350, damping: 27 }}
              className="w-full sm:max-w-2xl bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-brand font-black text-slate-100 text-base">Game & Bet Order Records</h3>
                    <span className="text-[11px] text-slate-400">Review results, payout charts & past bets</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBetHistoryModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <GameBetHistorySection
                pastRounds={store.getPastRounds()}
                userBets={currentUser ? store.getLiveBets().filter((b) => b.uid === currentUser.uid) : []}
                user={currentUser}
                defaultTab="mybets"
                onOpenDeposit={() => {
                  setShowBetHistoryModal(false);
                  setWalletInitialTab('deposit');
                  setActiveNavTab('wallet');
                }}
                onOpenAuth={() => {
                  setShowBetHistoryModal(false);
                  setShowAuthModal(true);
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* 3D WIN / LOSS Result Dialog */}
        {activeSettlement && (
          <GameResultModal
            key={activeSettlement.resultId}
            settlement={activeSettlement}
            queuedCount={settlementQueue.length}
            onClose={() => handleDismissSettlement(activeSettlement)}
            onContinue={() => {
              handleDismissSettlement(activeSettlement);
            }}
          />
        )}
      </AnimatePresence>

      {/* Live Admin Ads & App Update Popup Banner (Only when logged in) */}
      {currentUser && (
        <AppPopupModal
          onOpenDeposit={() => {
            setWalletInitialTab('deposit');
            setActiveNavTab('wallet');
          }}
          onOpenReferral={() => setShowReferralModal(true)}
          onOpenGift={() => setShowGiftModal(true)}
        />
      )}
    </div>
  );
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Recovered from UI error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-sm w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-brand font-black text-base text-slate-100">
              Session Refreshed
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your wallet and account data are safe. Click below to resume immediately.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
            >
              Resume Game
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <ToastProvider>
        <AdminSettingsProvider>
          <MainApp />
        </AdminSettingsProvider>
      </ToastProvider>
    </AppErrorBoundary>
  );
}

