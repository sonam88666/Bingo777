import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  LogIn,
  ArrowDownCircle,
  ArrowUpCircle,
  Gift,
  Percent,
  Users,
  Ticket,
  Gamepad2,
  MessageSquare,
  Settings,
  Plus,
  RotateCcw,
  Trash2,
  Edit3,
  Mic,
  Trophy,
  Smartphone,
  Building2,
  Volume2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Coins
} from 'lucide-react';
import { FeatureModule } from '../../types';
import { store, INITIAL_FEATURE_MODULES } from '../../services/store';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../common/Toast';
import { AdminGameSwitchboard } from './AdminGameSwitchboard';

interface AdminFeaturesProps {
  adminId: string;
  masterToken?: string;
}

export const AdminFeatures: React.FC<AdminFeaturesProps> = ({ adminId, masterToken }) => {
  const { showToast } = useToast();
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(store.getAdminSettings().maintenanceMode);
  const [minDepositInput, setMinDepositInput] = useState<number>(store.getAdminSettings().minDeposit || 250);
  const [minWithdrawalInput, setMinWithdrawalInput] = useState<number>(store.getAdminSettings().minWithdrawal || 500);
  const [minUsdtDepositInput, setMinUsdtDepositInput] = useState<number>(store.getAdminSettings().minUsdtDeposit || 5);
  const [minUsdtWithdrawalInput, setMinUsdtWithdrawalInput] = useState<number>(store.getAdminSettings().minUsdtWithdrawal || 10);
  const [usdtAddressInput, setUsdtAddressInput] = useState<string>(
    store.getAdminSettings().usdtErc20Address || '0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45'
  );
  const [featureModulesMap, setFeatureModulesMap] = useState<Record<string, FeatureModule>>(() => ({
    ...INITIAL_FEATURE_MODULES,
    ...store.getFeatureModules()
  }));
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | FeatureModule['category']>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingModule, setEditingModule] = useState<FeatureModule | null>(null);
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<FeatureModule['category']>('GAME');
  const [formDesc, setFormDesc] = useState('');
  const [formReason, setFormReason] = useState('');

  useEffect(() => {
    return store.subscribe(() => {
      setFeatureModulesMap({
        ...INITIAL_FEATURE_MODULES,
        ...store.getFeatureModules()
      });
      const currentSettings = store.getAdminSettings();
      setMaintenanceMode(currentSettings.maintenanceMode);
      setMinDepositInput(currentSettings.minDeposit || 250);
      setMinWithdrawalInput(currentSettings.minWithdrawal || 500);
      setMinUsdtDepositInput(currentSettings.minUsdtDeposit || 5);
      setMinUsdtWithdrawalInput(currentSettings.minUsdtWithdrawal || 10);
      setUsdtAddressInput(currentSettings.usdtErc20Address || '0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45');
    });
  }, []);

  const deletedBackups = Object.values(store.getDeletedFeaturesBackup());
  const tokenToUse = masterToken || sessionStorage.getItem('bingo777_master_admin_token') || 'BINGO_MASTER_2026_KEY';

  const handleToggleModule = async (featureId: string, nextEnabled: boolean) => {
    const visible = nextEnabled;

    if (!store.getFeatureModules()[featureId] && INITIAL_FEATURE_MODULES[featureId]) {
      store.upsertFeatureModule(
        {
          id: featureId,
          name: INITIAL_FEATURE_MODULES[featureId].name,
          category: INITIAL_FEATURE_MODULES[featureId].category,
          description: INITIAL_FEATURE_MODULES[featureId].description,
          enabled: nextEnabled,
          visibleInUserApp: nextEnabled
        },
        adminId,
        `Master Admin initialized and toggled ${featureId}`
      );
    }

    const res = store.toggleFeatureModule(
      featureId,
      nextEnabled,
      visible,
      adminId,
      `Master Admin toggled ${featureId} to ${nextEnabled ? 'ON' : 'OFF'}`
    );

    if (res.success) {
      await apiClient.toggleFeature(featureId, nextEnabled, visible, 'Feature Control switch', adminId, tokenToUse).catch(() => {});
      showToast(`${res.module?.name || featureId} turned ${nextEnabled ? 'ON (Visible)' : 'OFF (Hidden from User App)'}`, nextEnabled ? 'success' : 'info');
    } else {
      showToast(res.error || 'Failed to update feature', 'error');
    }
  };

  const handleBulkToggle = (enableAll: boolean) => {
    const res = store.toggleAllFeatures(enableAll, selectedCategory, adminId);
    if (res.success) {
      showToast(
        `${enableAll ? 'Enabled' : 'Disabled'} ${res.affectedCount} ${selectedCategory === 'ALL' ? 'App' : selectedCategory} Options!`,
        enableAll ? 'success' : 'info'
      );
    }
  };

  const handleSaveMinDeposit = () => {
    const cleanMin = Math.max(1, Number(minDepositInput) || 250);
    store.updateAdminSettings({ minDeposit: cleanMin }, adminId);
    apiClient.updateSettings({ minDeposit: cleanMin }, adminId, tokenToUse).catch(() => {});
    showToast(`Minimum UPI Deposit updated to ₹${cleanMin}`, 'success');
  };

  const handleSaveGatewayLimits = () => {
    const cleanMinWithdraw = Math.max(1, Number(minWithdrawalInput) || 500);
    const cleanMinUsdtDep = Math.max(1, Number(minUsdtDepositInput) || 5);
    const cleanMinUsdtWth = Math.max(1, Number(minUsdtWithdrawalInput) || 10);
    const cleanUsdtAddr = usdtAddressInput.trim() || '0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45';

    const patch = {
      minWithdrawal: cleanMinWithdraw,
      minUsdtDeposit: cleanMinUsdtDep,
      minUsdtWithdrawal: cleanMinUsdtWth,
      usdtErc20Address: cleanUsdtAddr
    };
    store.updateAdminSettings(patch, adminId);
    apiClient.updateSettings(patch, adminId, tokenToUse).catch(() => {});
    showToast('UPI & USDT (ERC20) Limits & Receiver Address updated!', 'success');
  };

  const handleToggleMaintenanceMode = (nextState: boolean) => {
    setMaintenanceMode(nextState);
    store.updateAdminSettings({ maintenanceMode: nextState }, adminId);
    apiClient
      .toggleMaintenanceMode(
        nextState,
        store.getAdminSettings().maintenanceMessage,
        store.getAdminSettings().maintenanceEstimatedResumeTime,
        adminId,
        tokenToUse
      )
      .catch(() => {});
    showToast(
      nextState
        ? 'Maintenance Mode Enabled — Platform betting paused'
        : 'Maintenance Mode Disabled — All active modules live',
      nextState ? 'info' : 'success'
    );
  };

  const handleSaveCustomModule = (e: React.FormEvent) => {
    e.preventDefault();
    const res = store.upsertFeatureModule(
      {
        id: editingModule ? editingModule.id : formId,
        name: formName,
        category: formCategory,
        description: formDesc || 'Managed operational module',
        enabled: editingModule ? editingModule.enabled : true,
        visibleInUserApp: true
      },
      adminId,
      formReason || 'Configured from Feature Control'
    );
    if (res.success) {
      showToast(`Saved module "${res.module?.name}"`, 'success');
      setShowAddModal(false);
      setEditingModule(null);
      setFormId('');
      setFormName('');
      setFormDesc('');
      setFormReason('');
    } else {
      showToast(res.error || 'Failed to save module', 'error');
    }
  };

  const handleRemoveModule = (mod: FeatureModule) => {
    const res = store.removeFeatureModule(mod.id, adminId, 'Removed from Feature Control');
    if (res.success) {
      showToast(`Safely backed up and removed "${mod.name}"`, 'info');
    } else {
      showToast(res.error || 'Cannot remove active core module', 'error');
    }
  };

  const handleRestoreModule = (id: string) => {
    const res = store.restoreFeatureModule(id, adminId);
    if (res.success) {
      showToast('Module restored from backup!', 'success');
    }
  };

  // Complete Quick-Access Option Rows covering every feature in the app
  const primaryFeatureRows = [
    {
      id: 'user_registration',
      label: 'New User Sign Up / Registration',
      sub: 'Allow new users to create accounts with Mobile + Password + Captcha',
      icon: UserPlus,
      iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
    },
    {
      id: 'user_login',
      label: 'User Login (Mobile + Password)',
      sub: 'Allow existing users to log in to their account',
      icon: LogIn,
      iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
    },
    {
      id: 'deposits',
      label: 'UPI Deposits (1st Default Deposit Option)',
      sub: `Allow UPI deposits (Minimum Deposit: ₹${minDepositInput})`,
      icon: ArrowDownCircle,
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'usdt_deposit',
      label: 'USDT (ERC20) Deposit Option (2nd Option)',
      sub: `Allow USDT ERC20 deposits (Min: $${minUsdtDepositInput} USDT, Admin Approval Required)`,
      icon: Coins,
      iconBg: 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
    },
    {
      id: 'upi_channel_1',
      label: 'Primary UPI Channel 1 (BharatPe)',
      sub: 'Enable/Disable Primary UPI receiver ID in Deposit screen',
      icon: Smartphone,
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    },
    {
      id: 'upi_channel_2',
      label: 'Backup UPI Channel 2 (suman.1299@superyes)',
      sub: 'Enable/Disable Secondary Backup UPI receiver ID in Deposit screen',
      icon: Smartphone,
      iconBg: 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
    },
    {
      id: 'withdrawals',
      label: 'Withdrawals (Master Payout Desk)',
      sub: 'Allow players to submit withdrawal requests (Admin Approval Required)',
      icon: ArrowUpCircle,
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    },
    {
      id: 'upi_withdrawal',
      label: 'UPI Withdrawal Option (1st Default Option)',
      sub: `Allow players to withdraw to their UPI ID (Minimum: ₹${minWithdrawalInput})`,
      icon: Smartphone,
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'usdt_withdrawal',
      label: 'USDT (ERC20) Withdrawal Option (2nd Option)',
      sub: `Allow players to withdraw to ERC20 USDT address (Minimum: $${minUsdtWithdrawalInput} USDT)`,
      icon: Coins,
      iconBg: 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
    },
    {
      id: 'bank_withdrawal',
      label: 'Bank Account (IMPS) Withdrawal Option',
      sub: `Allow players to withdraw to their Bank Account + IFSC (Min: ₹${minWithdrawalInput})`,
      icon: Building2,
      iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
    },
    {
      id: 'ludo_voice_chat',
      label: 'Ludo Live Voice Chat & Microphone',
      sub: 'Enable/Disable live voice mic, speaker & spoken voice talk in Ludo',
      icon: Mic,
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'ludo_text_chat',
      label: 'Ludo Live Table Text & Emoji Chat',
      sub: 'Enable/Disable live table chat drawer and quick phrases in Ludo',
      icon: MessageSquare,
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    },
    {
      id: 'ludo_tournaments',
      label: 'Ludo Championship Tournaments',
      sub: 'Show/Hide tournament event cards in the Ludo lobby',
      icon: Trophy,
      iconBg: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    },
    {
      id: 'ludo_private_rooms',
      label: 'Ludo Private Rooms & Room Code Join',
      sub: 'Allow players to create private Ludo tables and join by code',
      icon: Users,
      iconBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
    },
    {
      id: 'signup_bonus',
      label: '₹120 Signup Bonus Program',
      sub: 'New user registration bonus unlocked on 1st approved deposit',
      icon: Gift,
      iconBg: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
    },
    {
      id: 'first_deposit_bonus',
      label: '100% First Deposit Match Bonus',
      sub: 'Double match bonus on player first approved UPI deposit',
      icon: Percent,
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    },
    {
      id: 'referrals',
      label: '₹120 Refer & Earn Program',
      sub: 'Referral invite link and ₹120 qualification rewards',
      icon: Users,
      iconBg: 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
    },
    {
      id: 'mlm_affiliate',
      label: '3-Tier MLM Affiliate Commission Tree',
      sub: 'Level 1 (1%), Level 2 (0.5%), Level 3 (0.25%) turnover commission',
      icon: Sparkles,
      iconBg: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    },
    {
      id: 'daily_checkin',
      label: '7-Day Daily Attendance Streak Bonus',
      sub: 'Daily check-in rewards in Activity & Bonus Center',
      icon: Gift,
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'gift_codes',
      label: 'Gift Vouchers & Promo Code Redemption',
      sub: 'Allow users to redeem secret promo codes for cash',
      icon: Ticket,
      iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
    },
    {
      id: 'hero_carousel',
      label: 'Lobby Hero Promotional Banner Carousel',
      sub: 'Show/Hide top sliding promotional banners in Game Lobby',
      icon: Sparkles,
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    },
    {
      id: 'jackpot_banner',
      label: 'Grand Progressive Jackpot Ticker',
      sub: 'Show/Hide live jackpot counter banner in Game Lobby',
      icon: Trophy,
      iconBg: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    },
    {
      id: 'live_winners_ticker',
      label: 'Live Recent Winners Marquee Feed',
      sub: 'Show/Hide live winners payout ticker in Game Lobby',
      icon: Gamepad2,
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'audio_settings',
      label: '3D Sound Effects & Background Music Panel',
      sub: 'Show/Hide audio settings panel in user Account view',
      icon: Volume2,
      iconBg: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    },
    {
      id: 'deposit_history',
      label: 'Deposit & Payout Audit History Tab',
      sub: 'Allow players to view their deposit & withdrawal history',
      icon: ArrowDownCircle,
      iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
    },
    {
      id: 'bet_history',
      label: 'Player Bet & Game Order History',
      sub: 'Allow players to inspect their betting history in Account view',
      icon: Gamepad2,
      iconBg: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
    },
    {
      id: 'app_update_modal',
      label: 'App Update & Version Check Option',
      sub: 'Show/Hide Update Apps button in user Account view',
      icon: Settings,
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    },
    {
      id: 'live_support',
      label: '24/7 Live Chat & Telegram Concierge',
      sub: 'Enable/Disable customer support chat & floating concierge button',
      icon: MessageSquare,
      iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
    },
    {
      id: 'device_approval',
      label: 'Device Security & Approval Gate',
      sub: 'Hardware fingerprint tracking and device security verification',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    }
  ];

  const allModulesList = Object.values(featureModulesMap).filter((mod) => {
    const matchesCat = selectedCategory === 'ALL' || mod.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const enabledCount = Object.values(featureModulesMap).filter((m) => m.enabled).length;
  const totalCount = Object.keys(featureModulesMap).length;

  return (
    <div className="space-y-6">
      {/* 1-Click All Games Control Switchboard */}
      <AdminGameSwitchboard adminId={adminId} masterToken={masterToken} />

      {/* Master Global Controls: Minimum Deposit (₹250) + UPI/USDT Limits + Bulk Enable/Disable All Options */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/40 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
              MASTER ADMIN COMPLETE APP CONTROL
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Enable / Disable Any Option in the App ({enabledCount}/{totalCount} Active)
            </h3>
            <p className="text-xs text-slate-400">
              Every single game, UPI/USDT payment channel, bonus, Ludo voice/chat option, and UI section can be toggled below in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkToggle(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Enable All</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkToggle(false)}
              className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-black text-xs flex items-center gap-1.5 transition"
            >
              <XCircle className="w-4 h-4" />
              <span>Disable All</span>
            </button>
          </div>
        </div>

        {/* Quick Minimum Deposit Configurator (Default ₹250) & Maintenance Mode Switch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Minimum UPI Deposit (₹)</div>
                <div className="text-[10px] text-slate-400">Enforced across UPI Deposit & Cashier</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                value={minDepositInput}
                onChange={(e) => setMinDepositInput(Number(e.target.value))}
                className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono font-black text-xs text-amber-300 text-center"
              />
              <button
                type="button"
                onClick={handleSaveMinDeposit}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
              >
                Save
              </button>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Platform Maintenance Mode</div>
                <div className="text-[10px] text-slate-400">Pause all betting while keeping wallets safe</div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={maintenanceMode}
              onClick={() => handleToggleMaintenanceMode(!maintenanceMode)}
              className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center shrink-0 ${
                maintenanceMode ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
            </button>
          </div>
        </div>

        {/* Quick USDT (ERC20) & UPI Withdrawal Minimums Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-black text-teal-300 uppercase tracking-wider text-[11px]">
              UPI & USDT (ERC20) Master Wallet Controls
            </span>
            <button
              type="button"
              onClick={handleSaveGatewayLimits}
              className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow"
            >
              Save USDT & Withdrawal Settings
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Min UPI Withdraw (₹)</label>
              <input
                type="number"
                min={1}
                value={minWithdrawalInput}
                onChange={(e) => setMinWithdrawalInput(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono font-black text-amber-300"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Min USDT Deposit ($)</label>
              <input
                type="number"
                min={1}
                value={minUsdtDepositInput}
                onChange={(e) => setMinUsdtDepositInput(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono font-black text-teal-300"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Min USDT Withdraw ($)</label>
              <input
                type="number"
                min={1}
                value={minUsdtWithdrawalInput}
                onChange={(e) => setMinUsdtWithdrawalInput(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono font-black text-teal-300"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">ERC20 USDT Address</label>
              <input
                type="text"
                value={usdtAddressInput}
                onChange={(e) => setUsdtAddressInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono font-bold text-teal-300 text-[11px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primary All-Options Switchboard */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-black text-amber-300 text-xs uppercase tracking-wider">
            All App Features & Options ({primaryFeatureRows.length} Core Controls)
          </h4>
          <span className="text-[11px] text-slate-400">Instant Real-Time Sync</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {primaryFeatureRows.map((row) => {
            const Icon = row.icon;
            const isEnabled = featureModulesMap[row.id]?.enabled !== false;
            return (
              <div
                key={row.id}
                className={`p-3.5 rounded-2xl border shadow-lg flex items-center justify-between gap-3 transition ${
                  isEnabled
                    ? 'bg-slate-900/90 border-slate-800'
                    : 'bg-rose-950/20 border-rose-500/30 opacity-80'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${row.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-100 text-xs sm:text-sm truncate">{row.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                          isEnabled
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {isEnabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{row.sub}</p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  onClick={() => handleToggleModule(row.id, !isEnabled)}
                  className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center shrink-0 cursor-pointer ${
                    isEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Filter & Searchable Full Modules Registry */}
      <div className="pt-2 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">
            Complete Module Registry ({allModulesList.length})
          </h4>
          <button
            type="button"
            onClick={() => {
              setEditingModule(null);
              setFormId('');
              setFormName('');
              setFormDesc('');
              setShowAddModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Option</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any game, UPI channel, bonus, or app option..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {(['ALL', 'GAME', 'FINANCIAL', 'BONUS', 'ENGAGEMENT', 'SECURITY'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap border transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {allModulesList.map((mod) => (
            <div
              key={mod.id}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-100 text-sm truncate">{mod.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono text-[10px] font-bold">
                    {mod.category}
                  </span>
                </div>
                <div className="text-xs text-slate-400 truncate mt-0.5">{mod.description}</div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingModule(mod);
                    setFormId(mod.id);
                    setFormName(mod.name);
                    setFormCategory(mod.category);
                    setFormDesc(mod.description);
                    setShowAddModal(true);
                  }}
                  className="p-2 rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-700"
                  title="Edit Option"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {!mod.isCoreSystem && (
                  <button
                    type="button"
                    onClick={() => handleRemoveModule(mod)}
                    className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                    title="Remove Option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  role="switch"
                  aria-checked={mod.enabled}
                  onClick={() => handleToggleModule(mod.id, !mod.enabled)}
                  className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center shrink-0 cursor-pointer ${
                    mod.enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deleted Module Backups */}
      {deletedBackups.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2.5">
          <div className="text-xs font-bold text-amber-400">
            Removed Feature Backups ({deletedBackups.length})
          </div>
          {deletedBackups.map((b) => (
            <div key={b.id} className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="font-semibold text-slate-200">{b.name}</span>
              <button
                type="button"
                onClick={() => handleRestoreModule(b.id)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Custom Module Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCustomModule}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 text-slate-100"
          >
            <h4 className="font-bold text-slate-100 text-base">
              {editingModule ? `Configure ${editingModule.name}` : 'Add Feature Module'}
            </h4>
            <div className="space-y-3 text-xs">
              {!editingModule && (
                <div>
                  <label className="font-semibold text-slate-300 mb-1 block">Feature Key ID</label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="e.g. tournament_arena"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-slate-100"
                    required
                  />
                </div>
              )}
              <div>
                <label className="font-semibold text-slate-300 mb-1 block">Display Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. VIP Tournament Arena"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 mb-1 block">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as FeatureModule['category'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-bold text-slate-100"
                >
                  <option value="GAME">GAME</option>
                  <option value="FINANCIAL">FINANCIAL</option>
                  <option value="BONUS">BONUS</option>
                  <option value="SECURITY">SECURITY</option>
                  <option value="ENGAGEMENT">ENGAGEMENT</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-300 mb-1 block">Description</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs"
              >
                Save Module
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

