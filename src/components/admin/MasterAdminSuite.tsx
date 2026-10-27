import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  FileSpreadsheet,
  Dice5,
  Gift,
  Ticket,
  Gamepad2,
  ToggleRight,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
  Database,
  Smartphone,
  LogOut,
  Menu,
  X,
  UserCheck,
  Lock,
  Newspaper,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { AdminOverview } from './AdminOverview';
import { AdminFeatures } from './AdminFeatures';
import { AdminUsers } from './AdminUsers';
import { AdminLiveBets } from './AdminLiveBets';
import { AdminGameManagement } from './AdminGameManagement';
import { AdminDeviceApproval } from './AdminDeviceApproval';
import { AdminFinancials } from './AdminFinancials';
import { AdminTransactions } from './AdminTransactions';
import { AdminBonusesReferral } from './AdminBonusesReferral';
import { AdminGiftCodes } from './AdminGiftCodes';
import { AdminReportsAnalytics } from './AdminReportsAnalytics';
import { AdminSupportChat } from './AdminSupportChat';
import { AdminSettingsPanel } from './AdminSettings';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminDataBackup } from './AdminDataBackup';
import { AdminFirebaseRules } from './AdminFirebaseRules';
import { AdminNewsPollApproval } from './AdminNewsPollApproval';
import { AdminMlmManager } from './AdminMlmManager';
import { store } from '../../services/store';
import { firebaseSync } from '../../services/firebaseSync';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../common/Toast';

interface MasterAdminSuiteProps {
  adminId: string;
  masterToken?: string;
  onLogout: () => void;
}

export const MasterAdminSuite: React.FC<MasterAdminSuiteProps> = ({
  adminId,
  masterToken,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [, setTick] = React.useState(0);
  const { showToast } = useToast();

  React.useEffect(() => {
    // Initialize automated 60-minute background cleanup routine on Admin Console startup
    firebaseSync.startAutomatedHourlyCleanupRoutine();
    firebaseSync.runHourlyDatabaseCleanup().catch(() => {});

    return store.subscribe(() => setTick((t) => t + 1));
  }, []);

  const adminSettings = store.getAdminSettings();

  const [confirmMaintTap, setConfirmMaintTap] = useState(false);

  const handleToggleMaintenance = async () => {
    const nextState = !adminSettings.maintenanceMode;
    if (nextState && !confirmMaintTap) {
      setConfirmMaintTap(true);
      showToast('Tap Maintenance button once more within 4s to confirm turning ON Maintenance Mode.', 'info');
      setTimeout(() => setConfirmMaintTap(false), 4000);
      return;
    }
    setConfirmMaintTap(false);
    store.updateAdminSettings({ maintenanceMode: nextState }, adminId);
    await apiClient
      .toggleMaintenanceMode(
        nextState,
        adminSettings.maintenanceMessage,
        adminSettings.maintenanceEstimatedResumeTime,
        adminId,
        masterToken
      )
      .catch(() => {});
    showToast(
      nextState
        ? '⚠️ Maintenance Mode Activated! Betting is paused across the entire platform.'
        : '✅ Maintenance Mode Deactivated! Normal betting resumed.',
      nextState ? 'info' : 'success'
    );
  };

  const users = Object.values(store.getUsers());
  const deposits = store.getDeposits();
  const withdrawals = store.getWithdrawals();
  const supportMessages = store.getSupportMessages();

  const pendingDepositsCount = deposits.filter((d) => d.status === 'pending').length;
  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length;

  let pendingDevicesCount = 0;
  users.forEach((u) => {
    Object.values(u.devices || {}).forEach((d) => {
      if (d.status === 'pending') pendingDevicesCount++;
    });
  });

  const unreadMessagesCount = supportMessages.filter((m) => m.sender === 'user' && !m.read).length;
  const totalAlerts = pendingDepositsCount + pendingWithdrawalsCount + unreadMessagesCount + pendingDevicesCount;

  // Navigation items matching the organized Admin Console sidebar in the app's native dark & gold palette
  const navItems = [
    { id: 'overview', label: 'Dashboard', title: 'Admin Console', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', title: 'User Management', icon: Users, badge: users.length },
    {
      id: 'deposits',
      label: 'Deposits',
      title: 'Deposit Management',
      icon: ArrowDownCircle,
      badge: pendingDepositsCount,
      alert: pendingDepositsCount > 0
    },
    {
      id: 'withdrawals',
      label: 'Withdrawals',
      title: 'Withdrawal Management',
      icon: ArrowUpCircle,
      badge: pendingWithdrawalsCount,
      alert: pendingWithdrawalsCount > 0
    },
    { id: 'transactions', label: 'Transactions', title: 'Transactions & Wallet Ledger', icon: FileSpreadsheet },
    { id: 'bets_logs', label: 'Bets & Game Logs', title: 'Bets & Game Logs', icon: Dice5 },
    { id: 'bonuses_referral', label: 'Bonuses & Referral', title: 'Bonus & Referral', icon: Gift },
    { id: 'mlm_management', label: 'MLM System', title: '3-Tier MLM & Affiliate Management', icon: Layers },
    { id: 'gift_codes', label: 'Gift Codes', title: 'Gift Code Management', icon: Ticket },
    { id: 'game_management', label: 'Game Management', title: 'Game Management', icon: Gamepad2 },
    { id: 'news_polls', label: 'Top News Poll Approval', title: 'Top News Poll Approval', icon: Newspaper },
    { id: 'features', label: 'Feature Control', title: 'Feature Control', icon: ToggleRight },
    { id: 'reports', label: 'Reports & Analytics', title: 'Reports & Analytics', icon: BarChart3 },
    {
      id: 'support',
      label: 'Notifications & Support',
      title: 'Support & Notifications',
      icon: Bell,
      badge: unreadMessagesCount,
      alert: unreadMessagesCount > 0
    },
    { id: 'settings', label: 'Admin Settings', title: 'Admin Settings', icon: Settings },
    { id: 'audit', label: 'Audit Logs', title: 'Audit Logs', icon: ShieldCheck },
    { id: 'data_backup', label: 'Data Export / Import', title: 'Data Export / Import', icon: Database },
    {
      id: 'devices',
      label: 'Device Approvals',
      title: 'Device Approvals',
      icon: Smartphone,
      badge: pendingDevicesCount,
      alert: pendingDevicesCount > 0
    },
    { id: 'firebase', label: 'Firebase Security Rules', title: 'Firebase Security Rules', icon: Lock }
  ];

  const currentNav = navItems.find((item) => item.id === activeTab) || navItems[0];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileDrawerOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900/95 text-slate-100 select-none">
      {/* Top Sidebar Brand Header */}
      <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/40">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="font-brand font-black text-base bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent leading-tight">
              Admin Console
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-amber-300/80 mt-0.5 font-semibold">
              <span>Master Admin</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-400/80'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    isActive
                      ? 'bg-slate-950 text-amber-300'
                      : item.alert
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Logout Button */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          type="button"
          onClick={onLogout}
          className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 flex items-center space-x-3 transition"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Desktop Permanent Dark Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-amber-500/20 sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Slide-Over Dark Sidebar Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[82vw] h-full shadow-2xl border-r border-amber-500/20 z-10">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Bar matching App Theme */}
        <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xl border-b border-amber-500/20 text-slate-100 shadow-lg shadow-black/40 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-1.5 -ml-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-amber-400" />
            </button>
            <h1 className="font-brand font-black text-base sm:text-lg tracking-wide bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent truncate">
              {currentNav.title}
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
            {/* Quick Maintenance Mode Status & Toggle Pill */}
            <button
              type="button"
              onClick={handleToggleMaintenance}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition ${
                adminSettings.maintenanceMode
                  ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
              title={
                adminSettings.maintenanceMode
                  ? 'Maintenance Mode ACTIVE (New bets paused). Click to turn OFF.'
                  : 'Maintenance Mode OFF. Click to activate maintenance mode.'
              }
            >
              <AlertTriangle
                className={`w-3.5 h-3.5 ${adminSettings.maintenanceMode ? 'animate-pulse text-rose-400' : 'text-slate-500'}`}
              />
              <span className="hidden sm:inline">
                {adminSettings.maintenanceMode ? 'Maintenance ON' : 'Maintenance OFF'}
              </span>
            </button>

            {/* Notification Bell with Red Counter Badge */}
            <button
              type="button"
              onClick={() => handleSelectTab(pendingDepositsCount > 0 ? 'deposits' : 'support')}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition"
              title="Pending Requests & Alerts"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Admin Profile Pill */}
            <button
              type="button"
              onClick={() => handleSelectTab('settings')}
              className="flex items-center space-x-2 bg-slate-900 border border-amber-500/30 hover:border-amber-400 pl-2 pr-3 py-1 rounded-full transition"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-amber-300 hidden sm:inline">{adminId}</span>
            </button>
          </div>
        </header>

        {/* Quick Mobile Horizontal Module Pill Strip */}
        <div className="lg:hidden bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 transition ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dedicated Module Screen Container */}
        <main className="flex-1 w-full max-w-4xl mx-auto p-3.5 sm:p-6">
          {activeTab === 'overview' && <AdminOverview onNavigateTab={(tab) => handleSelectTab(tab)} />}
          {activeTab === 'users' && <AdminUsers adminId={adminId} masterToken={masterToken} />}
          {activeTab === 'deposits' && (
            <AdminFinancials adminId={adminId} masterToken={masterToken} initialMode="deposits" />
          )}
          {activeTab === 'withdrawals' && (
            <AdminFinancials adminId={adminId} masterToken={masterToken} initialMode="withdrawals" />
          )}
          {activeTab === 'transactions' && <AdminTransactions adminId={adminId} />}
          {activeTab === 'bets_logs' && <AdminLiveBets adminId={adminId} initialView="logs" />}
          {activeTab === 'bonuses_referral' && (
            <AdminBonusesReferral adminId={adminId} masterToken={masterToken} />
          )}
          {activeTab === 'mlm_management' && (
            <AdminMlmManager adminId={adminId} masterToken={masterToken} />
          )}
          {activeTab === 'gift_codes' && <AdminGiftCodes adminId={adminId} masterToken={masterToken} />}
          {activeTab === 'game_management' && (
            <AdminGameManagement adminId={adminId} masterToken={masterToken} />
          )}
          {activeTab === 'news_polls' && (
            <AdminNewsPollApproval adminId={adminId} masterToken={masterToken} />
          )}
          {activeTab === 'features' && <AdminFeatures adminId={adminId} masterToken={masterToken} />}
          {activeTab === 'reports' && <AdminReportsAnalytics />}
          {activeTab === 'support' && <AdminSupportChat adminId={adminId} />}
          {activeTab === 'settings' && <AdminSettingsPanel adminId={adminId} />}
          {activeTab === 'audit' && <AdminAuditLogs />}
          {activeTab === 'data_backup' && <AdminDataBackup adminId={adminId} />}
          {activeTab === 'devices' && <AdminDeviceApproval adminId={adminId} />}
          {activeTab === 'firebase' && <AdminFirebaseRules />}
        </main>
      </div>
    </div>
  );
};
