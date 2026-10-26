import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Key,
  X
} from 'lucide-react';
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
import { GameErrorBoundary } from './components/common/ErrorBoundary';
import { store } from './services/store';
import { firebaseSync } from './services/firebaseSync';
import { auth } from './firebase';
import { UserRecord, DeviceRecord, GameId, RoundSettlementNotice } from './types';

function MainApp() {
  const { showToast } = useToast();

  // Mode: Player App vs Master Admin
  const [viewMode, setViewMode] = useState<'user_app' | 'master_admin'>('user_app');

  // Active Bottom Navigation Tab
  const [activeNavTab, setActiveNavTab] = useState<TabId>('home');

  // In Lobby: Active selected game (null means showing lobby cards)
  const [selectedSubGame, setSelectedSubGame] = useState<GameId | null>(null);

  // Authenticated State
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);
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

  // Store Sync & User Session Persistence
  const [storeTick, setStoreTick] = useState(0);

  // If currently opened sub-game or tab is disabled by Master Admin, safely return user to lobby
  useEffect(() => {
    if (selectedSubGame && (!store.isFeatureEnabled(selectedSubGame) || !store.isFeatureVisible(selectedSubGame))) {
      setSelectedSubGame(null);
      showToast('This game was disabled by Master Admin. Returning to Lobby.', 'info');
    }
    if (activeNavTab === 'wingo' && (!store.isFeatureEnabled('wingo') || !store.isFeatureVisible('wingo'))) {
      setActiveNavTab('home');
    }
    if (activeNavTab === 'aviator' && (!store.isFeatureEnabled('aviator') || !store.isFeatureVisible('aviator'))) {
      setActiveNavTab('home');
    }
  }, [selectedSubGame, activeNavTab, storeTick]);

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

  useEffect(() => {
    // 1. Initial Session Hydration from authoritative unique UID or saved phone
    const storedUid = localStorage.getItem('bingo777_active_uid');
    const lastPhone = localStorage.getItem('bingo777_last_phone') || '';
    const deletedUids = store.getDeletedUserUids();
    const allUsers = store.getUsers();

    if (storedUid) {
      if (storedUid.startsWith('usr_demo_') || deletedUids.includes(storedUid)) {
        localStorage.removeItem('bingo777_active_uid');
        setCurrentUser(null);
      } else {
        const activeU = allUsers[storedUid] || (lastPhone ? store.findUserByPhone(lastPhone) : undefined);
        if (activeU) {
          if (activeU.uid !== storedUid) {
            localStorage.setItem('bingo777_active_uid', activeU.uid);
          }
          setCurrentUser(activeU);
          firebaseSync.attachRealtimeUserSync(activeU.uid, activeU.phone);
        } else {
          // Trigger backend sync to restore session if browser storage was partially cleared
          store.syncUsersWithBackend();
        }
      }
    } else {
      setCurrentUser(null);
    }

    // 2. Authoritative Store Subscription
    const unsubscribe = store.subscribe(() => {
      setStoreTick((t) => t + 1);
      const activeUid = localStorage.getItem('bingo777_active_uid');
      const savedPhone = localStorage.getItem('bingo777_last_phone') || '';
      if (activeUid) {
        const isDeleted = store.getDeletedUserUids().includes(activeUid);
        if (isDeleted) {
          localStorage.removeItem('bingo777_active_uid');
          setCurrentUser(null);
          setSettlementQueue([]);
          showToast('Account has been safely deactivated or removed.', 'info');
          return;
        }
        const refreshed = store.getUser(activeUid) || (savedPhone ? store.findUserByPhone(savedPhone) : undefined);
        if (refreshed) {
          if (refreshed.status === 'banned' || refreshed.status === 'deactivated') {
            localStorage.removeItem('bingo777_active_uid');
            setCurrentUser(null);
            setSettlementQueue([]);
            showToast('Account has been safely deactivated or removed.', 'info');
            return;
          }
          if (!store.isCurrentDeviceApprovedForUser(refreshed.uid)) {
            localStorage.removeItem('bingo777_active_uid');
            localStorage.removeItem('maanwin_active_uid');
            setCurrentUser(null);
            setSettlementQueue([]);
            showToast('Logged out: Your mobile number is now active on another Admin-approved device (1 Number = 1 Device).', 'info');
            return;
          }
          setCurrentUser(refreshed);
          syncUnacknowledgedSettlements(refreshed.uid);
        }
      } else {
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

    // 4. Authoritative Local Notification Subscription (Support Ticket Updates & Withdrawal Settlements)
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
  }, [showToast]);

  const activeSettlement = settlementQueue.length > 0 ? settlementQueue[0] : null;

  const handleDismissSettlement = (notice: RoundSettlementNotice) => {
    store.acknowledgeSettlement(notice.resultId, notice.uid);
    setSettlementQueue((prev) => prev.filter((item) => item.resultId !== notice.resultId));
  };

  // Current Device
  const currentDevice: DeviceRecord | null = currentUser && currentUser.devices
    ? Object.values(currentUser.devices)[0] || null
    : null;

  // Unread support messages & local notifications
  const unreadSupportCount = currentUser
    ? store.getSupportMessages().filter((m) => m.uid === currentUser.uid && m.sender === 'admin' && !m.read).length
    : 0;

  const handleAdminLoginSuccess = (adminId: string, token?: string) => {
    setMasterAdminId(adminId);
    if (token) {
      sessionStorage.setItem('bingo777_master_admin_token', token);
    }
    setShowAdminLogin(false);
    setViewMode('master_admin');
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
      {viewMode === 'master_admin' ? (
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
      ) : (
        /* VIEW 2: PLAYER APPLICATION (NATIVE APP EXPERIENCE) */
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
            {activeNavTab === 'wallet' && currentUser && (
              <GameErrorBoundary gameName="Wallet & Banking" onResetToLobby={() => setActiveNavTab('home')}>
                <WalletView
                  user={currentUser}
                  initialTab={walletInitialTab}
                  onOpenSupport={() => setShowSupportModal(true)}
                />
              </GameErrorBoundary>
            )}
            {activeNavTab === 'wallet' && !currentUser && (
              <div className="max-w-md mx-auto p-8 text-center space-y-4">
                <p className="text-sm text-slate-400">Please log in to manage your wallet and balance.</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Log In Now
                </button>
              </div>
            )}

            {/* TAB: ACCOUNT / PROFILE */}
            {activeNavTab === 'account' && currentUser && (
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
                  store.logoutUser(currentUser.uid);
                  firebaseSync.detachRealtimeUserSync();
                  try { auth.signOut(); } catch {}
                  setCurrentUser(null);
                  setActiveNavTab('home');
                }}
              />
            )}
            {activeNavTab === 'account' && !currentUser && (
              <div className="max-w-md mx-auto p-8 text-center space-y-4">
                <p className="text-sm text-slate-400">Please log in to view your profile and VIP status.</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Log In / Sign Up
                </button>
              </div>
            )}
          </main>

          {/* Native Bottom Navigation Bar */}
          <BottomNav
            activeTab={activeNavTab}
            onChangeTab={handleTabChange}
            unreadSupportCount={unreadSupportCount}
            onSecretAdminTrigger={() => {
              if (masterAdminId) setViewMode('master_admin');
              else setShowAdminLogin(true);
            }}
          />
        </div>
      )}

      {/* MODALS */}
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

      {showAuthModal && (
        <UserAuthModal
          onSuccess={(u) => {
            localStorage.setItem('bingo777_active_uid', u.uid);
            setCurrentUser(u);
            setShowAuthModal(false);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLoginModal
          onSuccess={handleAdminLoginSuccess}
          onCancel={() => setShowAdminLogin(false)}
        />
      )}

      {/* Bet & Game History Modal */}
      {showBetHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full sm:max-w-2xl bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
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
          </div>
        </div>
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
        <MainApp />
      </ToastProvider>
    </AppErrorBoundary>
  );
}

