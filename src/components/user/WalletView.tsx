import React, { useState, useEffect } from 'react';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Building2, 
  Smartphone, 
  Copy, 
  Clock, 
  ShieldCheck, 
  Lock,
  Wallet,
  Sparkles,
  Coins
} from 'lucide-react';
import { UserRecord } from '../../types';
import { store } from '../../services/store';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../common/Toast';
import { DepositHistorySection } from './DepositHistorySection';

interface WalletViewProps {
  user: UserRecord;
  onOpenSupport: () => void;
  initialTab?: 'deposit' | 'withdraw' | 'records';
}

export const WalletView: React.FC<WalletViewProps> = ({ 
  user, 
  onOpenSupport,
  initialTab = 'deposit' 
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'records'>(initialTab);

  // Deposit State - First Option is UPI, Second Option is USDT (ERC20)
  const [depositMethod, setDepositMethod] = useState<'UPI' | 'USDT'>('UPI');
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [usdtDepositAmount, setUsdtDepositAmount] = useState<number>(10);
  const [utrReference, setUtrReference] = useState<string>('');
  const [usdtTxHash, setUsdtTxHash] = useState<string>('');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  // Withdraw State - First Option is UPI (Min ₹500), Second is USDT (ERC20) (Min $10), Third is Bank Transfer
  const [withdrawMethod, setWithdrawMethod] = useState<'UPI' | 'USDT (ERC20)' | 'Bank Transfer'>('UPI');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [usdtWithdrawAmount, setUsdtWithdrawAmount] = useState<number>(10);
  const [usdtWithdrawAddress, setUsdtWithdrawAddress] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [upiHolderName, setUpiHolderName] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [holderName, setHolderName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const adminSettings = store.getAdminSettings();
  const deposits = store.getDeposits().filter((d) => d.uid === user.uid);
  const withdrawals = store.getWithdrawals().filter((w) => w.uid === user.uid);

  // Calculate real money wallet figures
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
  const totalLockedInWithdrawal = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const totalApprovedDeposits = deposits.filter((d) => d.status === 'approved').reduce((sum, d) => sum + d.amount, 0);
  const totalApprovedWithdrawals = withdrawals.filter((w) => w.status === 'approved').reduce((sum, w) => sum + w.amount, 0);

  const minDepositAmount = Math.max(250, adminSettings.minDeposit || 250);
  const minUpiWithdrawal = Math.max(500, adminSettings.minWithdrawal || 500);
  const minUsdtDeposit = adminSettings.minUsdtDeposit || 5;
  const minUsdtWithdrawal = adminSettings.minUsdtWithdrawal || 10;
  const usdtRate = adminSettings.usdtExchangeRate || 90;
  const usdtErc20Address = adminSettings.usdtErc20Address || '0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45';

  const depositPresets = [250, 500, 1000, 2000, 5000, 10000];
  const usdtDepositPresets = [5, 10, 25, 50, 100, 500];
  const usdtWithdrawPresets = [10, 25, 50, 100, 250, 500];

  const isDepositsEnabled = store.isFeatureEnabled('deposits');
  const isUsdtDepositEnabled = store.isFeatureEnabled('usdt_deposit') && adminSettings.featureUsdtDeposit !== false;
  const isUpiCh1Enabled = store.isFeatureEnabled('upi_channel_1');
  const isUpiCh2Enabled = store.isFeatureEnabled('upi_channel_2');
  const isWithdrawalsEnabled = store.isFeatureEnabled('withdrawals');
  const isUpiWithdrawEnabled = store.isFeatureEnabled('upi_withdrawal');
  const isUsdtWithdrawEnabled = store.isFeatureEnabled('usdt_withdrawal') && adminSettings.featureUsdtWithdrawal !== false;
  const isBankWithdrawEnabled = store.isFeatureEnabled('bank_withdrawal');
  const isFirstDepositBonusEnabled = store.isFeatureEnabled('first_deposit_bonus');
  const isSignupBonusEnabled = store.isFeatureEnabled('signup_bonus');

  const upiChannels = (adminSettings.upiChannels && adminSettings.upiChannels.length > 0)
    ? adminSettings.upiChannels
    : store.getUpiChannels();

  // Find the exact active UPI ID chosen from Admin
  const defaultActiveChannel = upiChannels.find(
    (c) => c.id === adminSettings.activeUpiChannelId || c.isActive
  ) || upiChannels[0];

  const [selectedChannelId, setSelectedChannelId] = useState<string>(defaultActiveChannel?.id || 'upi_1');

  // Keep in real-time sync with Admin active UPI selection
  useEffect(() => {
    if (adminSettings.activeUpiChannelId) {
      setSelectedChannelId(adminSettings.activeUpiChannelId);
    }
  }, [adminSettings.activeUpiChannelId]);

  const activeChannelObj = upiChannels.find((c) => c.id === selectedChannelId) || defaultActiveChannel;
  const activeUpi = activeChannelObj?.upiId || adminSettings.officialUpiId || 'BHARATPE09905641446@yesbankltd';
  const activeUpiName = activeChannelObj?.merchantName || adminSettings.officialUpiName || 'BHARATPE ENTERPRISES';
  const effectiveChannel = activeChannelObj?.label || 'Official Primary';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDepositsEnabled) {
      showToast('Deposits are currently paused by Master Admin.', 'error');
      return;
    }

    if (depositMethod === 'USDT') {
      if (!isUsdtDepositEnabled) {
        showToast('USDT (ERC20) Deposits are currently disabled by Master Admin.', 'error');
        return;
      }
      if (usdtDepositAmount < minUsdtDeposit) {
        showToast(`Minimum USDT deposit is $${minUsdtDeposit} USDT`, 'error');
        return;
      }
      const cleanTx = usdtTxHash.trim();
      if (!cleanTx || cleanTx.length < 6) {
        showToast('Please enter your ERC20 Transaction Hash (TXID)', 'error');
        return;
      }

      const estimatedInr = Math.round(usdtDepositAmount * usdtRate * 100) / 100;
      setIsSubmittingDeposit(true);
      const result = store.requestDeposit(user.uid, estimatedInr, 'USDT', cleanTx, undefined, usdtDepositAmount);
      if (!result.success) {
        setIsSubmittingDeposit(false);
        showToast(result.error || 'Failed to submit USDT deposit', 'error');
        return;
      }
      apiClient.requestDeposit(user.uid, estimatedInr, 'USDT', cleanTx, user.username, user.phone, usdtDepositAmount).catch(() => {});
      setIsSubmittingDeposit(false);
      setUsdtTxHash('');
      showToast(`USDT Deposit ($${usdtDepositAmount} USDT) submitted! Admin will verify & credit INR to your wallet.`, 'success');
      setActiveTab('records');
      return;
    }

    // UPI Deposit Flow
    if (!isUpiCh1Enabled && !isUpiCh2Enabled) {
      showToast('All UPI payment channels are currently under maintenance by Master Admin.', 'error');
      return;
    }
    const cleanUtr = utrReference.trim();
    if (!cleanUtr) {
      showToast('Please enter the 12-digit UTR reference ID', 'error');
      return;
    }
    if (cleanUtr.length < 10) {
      showToast('UTR reference must be at least 10-12 digits', 'error');
      return;
    }
    if (depositAmount < minDepositAmount) {
      showToast(`Minimum UPI deposit is ₹${minDepositAmount}`, 'error');
      return;
    }
    if (depositAmount > adminSettings.maxDeposit) {
      showToast(`Maximum UPI deposit is ₹${adminSettings.maxDeposit}`, 'error');
      return;
    }

    setIsSubmittingDeposit(true);
    const result = store.requestDeposit(user.uid, depositAmount, 'UPI', cleanUtr, activeUpi);
    if (!result.success) {
      setIsSubmittingDeposit(false);
      showToast(result.error || 'Failed to submit deposit', 'error');
      return;
    }
    apiClient.requestDeposit(user.uid, depositAmount, 'UPI', cleanUtr, user.username, user.phone).catch(() => {});
    setIsSubmittingDeposit(false);
    setUtrReference('');
    showToast(`UPI Deposit of ₹${depositAmount} requested via ${effectiveChannel === 'primary' ? 'Primary' : 'Backup'} UPI!`, 'success');
    setActiveTab('records');
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWithdrawalsEnabled) {
      showToast('Withdrawals are currently paused by Master Admin.', 'error');
      return;
    }

    if (withdrawMethod === 'USDT (ERC20)') {
      if (!isUsdtWithdrawEnabled) {
        showToast('USDT (ERC20) Withdrawals are currently disabled by Master Admin.', 'error');
        return;
      }
      if (usdtWithdrawAmount < minUsdtWithdrawal) {
        showToast(`Minimum USDT withdrawal is $${minUsdtWithdrawal} USDT`, 'error');
        return;
      }
      const cleanAddr = usdtWithdrawAddress.trim();
      if (!cleanAddr.startsWith('0x') || cleanAddr.length < 20) {
        showToast('Please enter a valid ERC20 USDT Wallet Address starting with 0x', 'error');
        return;
      }
      const inrDeduction = Math.round(usdtWithdrawAmount * usdtRate * 100) / 100;
      if (user.balance < inrDeduction) {
        showToast(`Insufficient wallet balance. Required: ₹${inrDeduction.toLocaleString('en-IN')} ($${usdtWithdrawAmount} USDT)`, 'error');
        return;
      }

      setIsSubmittingWithdraw(true);
      const details = {
        usdtAddress: cleanAddr,
        usdtNetwork: 'ERC20' as const
      };
      const result = store.requestWithdrawal(user.uid, inrDeduction, 'USDT (ERC20)', details, usdtWithdrawAmount);
      setIsSubmittingWithdraw(false);

      if (result.success) {
        apiClient.requestWithdrawal(user.uid, inrDeduction, 'USDT (ERC20)', details, user.username, user.phone, usdtWithdrawAmount).catch(() => {});
        showToast(`USDT Withdrawal of $${usdtWithdrawAmount} (₹${inrDeduction}) submitted! Pending Master Admin approval.`, 'success');
        setUsdtWithdrawAddress('');
        setActiveTab('records');
      } else {
        showToast(result.error || 'Failed to request USDT withdrawal', 'error');
      }
      return;
    }

    // UPI or Bank Transfer Withdrawal Flow
    if (withdrawMethod === 'UPI' && !isUpiWithdrawEnabled) {
      showToast('UPI Withdrawals are currently disabled by Master Admin.', 'error');
      return;
    }
    if (withdrawMethod === 'Bank Transfer' && !isBankWithdrawEnabled) {
      showToast('Bank Account Withdrawals are currently disabled by Master Admin.', 'error');
      return;
    }
    if (withdrawAmount < minUpiWithdrawal) {
      showToast(`Minimum UPI / Bank withdrawal is ₹${minUpiWithdrawal}`, 'error');
      return;
    }
    if (withdrawAmount > adminSettings.maxWithdrawal) {
      showToast(`Maximum withdrawal is ₹${adminSettings.maxWithdrawal}`, 'error');
      return;
    }
    if (user.balance < withdrawAmount) {
      showToast('Insufficient available wallet balance', 'error');
      return;
    }

    if (withdrawMethod === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        showToast('Please enter a valid UPI ID (e.g. mobile@paytm or name@oksbi)', 'error');
        return;
      }
      if (!upiHolderName.trim()) {
        showToast('Please enter UPI Account Holder Name', 'error');
        return;
      }
    } else {
      if (!bankName.trim() || !holderName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
        showToast('Please fill all Bank Account details', 'error');
        return;
      }
      if (accountNumber.trim() !== confirmAccountNumber.trim()) {
        showToast('Account numbers do not match! Please check carefully.', 'error');
        return;
      }
      if (ifscCode.trim().length !== 11) {
        showToast('IFSC Code must be exactly 11 characters (e.g. SBIN0001234)', 'error');
        return;
      }
    }

    setIsSubmittingWithdraw(true);
    const details = {
      upiId: withdrawMethod === 'UPI' ? upiId.trim() : undefined,
      holderName: withdrawMethod === 'UPI' ? upiHolderName.trim() : holderName.trim(),
      bankName: withdrawMethod === 'Bank Transfer' ? bankName.trim() : undefined,
      accountNumber: withdrawMethod === 'Bank Transfer' ? accountNumber.trim() : undefined,
      ifscCode: withdrawMethod === 'Bank Transfer' ? ifscCode.trim().toUpperCase() : undefined
    };
    const result = store.requestWithdrawal(user.uid, withdrawAmount, withdrawMethod, details);
    setIsSubmittingWithdraw(false);

    if (result.success) {
      apiClient.requestWithdrawal(user.uid, withdrawAmount, withdrawMethod, details, user.username, user.phone).catch(() => {});
      showToast(`Withdrawal of ₹${withdrawAmount} submitted! Pending Master Admin authorization.`, 'success');
      setActiveTab('records');
    } else {
      showToast(result.error || 'Failed to request withdrawal', 'error');
    }
  };

  const usdtEquivalentInrForWithdraw = Math.round(usdtWithdrawAmount * usdtRate * 100) / 100;

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* REAL MONEY AUTHORITATIVE WALLET DASHBOARD */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-950 border border-amber-500/30 p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Authoritative Real Money Wallet
                </span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin Controlled & Protected</span>
                </span>
              </div>
            </div>

            <div className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-[11px] font-mono font-bold text-amber-300">
              VIP {user.vipLevel}
            </div>
          </div>

          {/* Main Available Balance */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400">Available Playing Balance</span>
            <div className="font-mono font-black text-3xl sm:text-4xl text-amber-300 tracking-tight">
              ₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Financial Breakdown Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">In-Review Wth</span>
              <span className="font-mono font-bold text-amber-400">
                ₹{totalLockedInWithdrawal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Total Deposited</span>
              <span className="font-mono font-bold text-emerald-400">
                ₹{totalApprovedDeposits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Total Paid Out</span>
              <span className="font-mono font-bold text-sky-400">
                ₹{totalApprovedWithdrawals.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECURITY NOTICE BANNER */}
      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start space-x-2.5">
        <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300">100% Admin Protected Cashier: </span>
          <span>No UPI or USDT deposit/withdrawal is credited or released without explicit Master Admin approval.</span>
        </div>
      </div>

      {/* Navigation Switcher */}
      <div className="grid grid-cols-3 p-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'deposit'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" />
          <span>Deposit</span>
        </button>

        <button
          onClick={() => setActiveTab('withdraw')}
          className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'withdraw'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpCircle className="w-4 h-4" />
          <span>Withdraw</span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'records'
              ? 'bg-slate-800 text-slate-100 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Records</span>
        </button>
      </div>

      {/* TAB: DEPOSIT (OPTION 1: UPI, OPTION 2: USDT ERC20) */}
      {activeTab === 'deposit' && (
        <form onSubmit={handleDepositSubmit} className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          {/* DEPOSIT METHOD SELECTOR: 1ST OPTION UPI, 2ND OPTION USDT (ERC20) */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
              Select Deposit Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDepositMethod('UPI')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                  depositMethod === 'UPI'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg ring-1 ring-emerald-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>UPI Deposit (₹)</span>
              </button>

              {isUsdtDepositEnabled && (
                <button
                  type="button"
                  onClick={() => setDepositMethod('USDT')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                    depositMethod === 'USDT'
                      ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-lg ring-1 ring-teal-400/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Coins className="w-4 h-4 text-teal-400" />
                  <span>USDT (ERC20) ($)</span>
                </button>
              )}
            </div>
          </div>

          {depositMethod === 'UPI' ? (
            <>
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    Option 1 · Instant INR Deposit
                  </span>
                  <h3 className="font-brand font-black text-slate-100 text-base flex items-center space-x-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>UPI Fast Deposit (GPay, PhonePe, Paytm)</span>
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Min ₹{minDepositAmount}
                </span>
              </div>

              {/* First Deposit Bonus & Signup Bonus Entitlement Banner */}
              {(isFirstDepositBonusEnabled || isSignupBonusEnabled) && user.firstDepositBonusStatus !== 'credited' && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-emerald-500/20 border border-amber-500/40 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs font-black text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                    <span>FIRST DEPOSIT DOUBLE BONUS ACTIVATED</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Deposit now to unlock your <strong className="text-amber-300">₹120 Signup Bonus</strong> + <strong className="text-emerald-400">100% First Deposit Match (₹{depositAmount})</strong>. Total ₹{(depositAmount * 2 + 120).toLocaleString('en-IN')} wallet credit upon Master Admin approval!
                  </p>
                </div>
              )}

              {/* Amount Presets */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Select Deposit Amount (₹)</span>
                  <span>Min: ₹{minDepositAmount} · Max: ₹{adminSettings.maxDeposit}</span>
                </div>
                <input
                  type="number"
                  min={minDepositAmount}
                  max={adminSettings.maxDeposit}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 font-mono text-xl font-black text-amber-300 focus:outline-none focus:border-amber-500"
                  required
                />
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2">
                  {depositPresets.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setDepositAmount(preset)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition ${
                        depositAmount === preset
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      +₹{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* OFFICIAL RECEIVER UPI CHANNELS (PRIMARY & BACKUP CHANNEL 2) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Select Payment UPI Channel</span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Receivers</span>
                  </span>
                </div>

                {/* Channel Switcher Tabs */}
                {upiChannels.length > 1 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {upiChannels.map((channel, idx) => {
                      const isSelected = channel.id === selectedChannelId;
                      const isAdminActive = channel.id === adminSettings.activeUpiChannelId || channel.isActive;
                      return (
                        <button
                          key={channel.id}
                          type="button"
                          onClick={() => setSelectedChannelId(channel.id)}
                          className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/50'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] font-black uppercase tracking-wider truncate">
                              {channel.label || `Channel ${idx + 1}`}
                            </span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            )}
                          </div>
                          <span className="font-mono font-bold text-xs truncate block mt-1">
                            {channel.upiId}
                          </span>
                          <span className="text-[9px] text-slate-500 truncate block">
                            {isAdminActive ? '⚡ Active Admin Cashier' : channel.merchantName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Active Selected UPI Details Card */}
                <div className="p-3.5 rounded-xl border bg-slate-900 border-amber-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Official Cashier UPI ID</span>
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Active Receiver
                      </span>
                    </div>
                    <div className="font-mono font-black text-amber-300 text-sm sm:text-base select-all truncate mt-0.5">
                      {activeUpi}
                    </div>
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      Receiver Name: <strong className="text-slate-200 font-semibold">{activeUpiName}</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(activeUpi, 'UPI ID')}
                      className="px-3.5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 active:scale-95 transition bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy UPI ID</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* UTR Input Section */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>12-Digit UTR / Transaction Reference Number</span>
                  <span className="text-[10px] text-amber-400 font-bold">Mandatory</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 428192049182 (Found in UPI payment receipt)"
                  value={utrReference}
                  onChange={(e) => setUtrReference(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  required
                />
                <span className="text-[10px] text-slate-500 block">
                  ⚠️ Balance is credited only after Master Admin approves the UTR.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingDeposit}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-brand font-black text-sm shadow-xl shadow-emerald-950/40 active:scale-95 transition"
              >
                {isSubmittingDeposit ? 'Submitting...' : `Submit UPI Deposit Proof (₹${depositAmount})`}
              </button>
            </>
          ) : (
            /* CLEAN & SIMPLE USDT (ERC20) DEPOSIT PAGE */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
                    Crypto Deposit · Ethereum Network
                  </span>
                  <h3 className="font-brand font-black text-slate-100 text-base flex items-center space-x-1.5">
                    <Coins className="w-4 h-4 text-teal-400" />
                    <span>USDT (ERC20) Deposit</span>
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-[10px] font-bold">
                  Min ${minUsdtDeposit} USDT
                </span>
              </div>

              {/* Official ERC20 USDT Receiver Address Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                    Official USDT Receiver Address
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-mono font-bold text-[10px]">
                    Network: ERC20
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm font-bold text-amber-300 break-all select-all">
                  {usdtErc20Address}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(usdtErc20Address, 'ERC20 USDT Address')}
                  className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy ERC20 USDT Address</span>
                </button>
              </div>

              {/* USDT Deposit Amount Input */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Enter USDT Amount ($)</span>
                  <span className="text-teal-400 font-bold">Minimum: ${minUsdtDeposit} USDT</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-black text-xl text-teal-400">$</span>
                  <input
                    type="number"
                    min={minUsdtDeposit}
                    step="0.01"
                    value={usdtDepositAmount}
                    onChange={(e) => setUsdtDepositAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-3 font-mono text-xl font-black text-teal-300 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2">
                  {usdtDepositPresets.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setUsdtDepositAmount(preset)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition ${
                        usdtDepositAmount === preset
                          ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction Hash (TXID) Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Transaction Hash / TXID (ERC20)</span>
                  <span className="text-[10px] text-teal-400 font-bold">Required</span>
                </label>
                <input
                  type="text"
                  placeholder="Paste your 0x... transaction hash or reference ID"
                  value={usdtTxHash}
                  onChange={(e) => setUsdtTxHash(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 font-mono text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                  required
                />
                <span className="text-[10px] text-slate-400 block pt-0.5">
                  🛡️ Master Admin will verify your USDT transfer and convert & credit the INR balance into your wallet upon approval.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingDeposit}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 text-slate-950 font-brand font-black text-sm shadow-xl active:scale-95 transition"
              >
                {isSubmittingDeposit ? 'Submitting...' : `Submit USDT Deposit ($${usdtDepositAmount} USDT)`}
              </button>
            </div>
          )}
        </form>
      )}

      {/* TAB: WITHDRAW (1ST OPTION UPI MIN ₹500, 2ND USDT ERC20 MIN $10, 3RD BANK ACCOUNT) */}
      {activeTab === 'withdraw' && (
        <form onSubmit={handleWithdrawSubmit} className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          {/* Withdrawal Channel Selector: UPI First, then USDT (ERC20), then Bank Account */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
              Select Withdrawal Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setWithdrawMethod('UPI')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition ${
                  withdrawMethod === 'UPI'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-lg ring-1 ring-amber-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>UPI Transfer</span>
                <span className="text-[9px] font-mono text-slate-400">Min ₹{minUpiWithdrawal}</span>
              </button>

              {isUsdtWithdrawEnabled && (
                <button
                  type="button"
                  onClick={() => setWithdrawMethod('USDT (ERC20)')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition ${
                    withdrawMethod === 'USDT (ERC20)'
                      ? 'bg-teal-950/80 border-teal-400 text-teal-300 shadow-lg ring-1 ring-teal-400/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Coins className="w-4 h-4 text-teal-400" />
                  <span>USDT (ERC20)</span>
                  <span className="text-[9px] font-mono text-teal-400/80">Min ${minUsdtWithdrawal}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setWithdrawMethod('Bank Transfer')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition ${
                  withdrawMethod === 'Bank Transfer'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-lg ring-1 ring-amber-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>Bank Account</span>
                <span className="text-[9px] font-mono text-slate-400">Min ₹{minUpiWithdrawal}</span>
              </button>
            </div>
          </div>

          {withdrawMethod === 'USDT (ERC20)' ? (
            /* CLEAN & SIMPLE USDT (ERC20) WITHDRAWAL PAGE */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
                    Crypto Payout · Ethereum Network
                  </span>
                  <h3 className="font-brand font-black text-slate-100 text-base">
                    Withdraw to USDT (ERC20)
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs text-teal-300 font-bold block">Min: ${minUsdtWithdrawal} USDT</span>
                  <span className="text-[10px] text-slate-400">Rate: 1 USDT = ₹{usdtRate}</span>
                </div>
              </div>

              {/* USDT Withdrawal Amount Input */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Enter Withdrawal Amount ($ USDT)</span>
                  <span>Wallet Balance: ₹{user.balance.toFixed(2)}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-black text-xl text-teal-400">$</span>
                  <input
                    type="number"
                    min={minUsdtWithdrawal}
                    step="0.01"
                    value={usdtWithdrawAmount}
                    onChange={(e) => setUsdtWithdrawAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-3 font-mono text-xl font-black text-teal-300 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2">
                  {usdtWithdrawPresets.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setUsdtWithdrawAmount(preset)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition ${
                        usdtWithdrawAmount === preset
                          ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
                <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">INR Deduction from Wallet:</span>
                  <span className="font-mono font-black text-amber-300">
                    ₹{usdtEquivalentInrForWithdraw.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* User ERC20 Address Input */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Your USDT (ERC20) Wallet Address
                  </label>
                  <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono text-[10px] font-bold">
                    ERC20 Only
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="0x..."
                  value={usdtWithdrawAddress}
                  onChange={(e) => setUsdtWithdrawAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                  required
                />
                <span className="text-[10px] text-slate-400 block">
                  ⚠️ Please double-check your ERC20 address (starts with 0x). Withdrawal requires Master Admin approval.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingWithdraw || user.balance < usdtEquivalentInrForWithdraw}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 text-slate-950 font-brand font-black text-sm shadow-xl transition active:scale-95 disabled:opacity-50"
              >
                {isSubmittingWithdraw
                  ? 'Submitting Request...'
                  : `Submit USDT Withdrawal ($${usdtWithdrawAmount} USDT / ₹${usdtEquivalentInrForWithdraw})`}
              </button>
            </div>
          ) : (
            /* UPI & BANK TRANSFER WITHDRAWAL FLOW (MIN ₹500) */
            <>
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                    {withdrawMethod === 'UPI' ? 'Option 1 · UPI Payout' : 'Bank Account Payout'}
                  </span>
                  <h3 className="font-brand font-black text-slate-100 text-base">
                    Withdrawal to {withdrawMethod}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Fee: {adminSettings.payoutFeePercent}%</span>
                  <span className="font-mono text-xs text-amber-300 font-bold">Min: ₹{minUpiWithdrawal}</span>
                </div>
              </div>

              {/* Withdrawal Amount */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Withdrawal Amount (₹)</span>
                  <span>Available: ₹{user.balance.toFixed(2)}</span>
                </div>
                <input
                  type="number"
                  min={minUpiWithdrawal}
                  max={Math.min(adminSettings.maxWithdrawal, Math.max(minUpiWithdrawal, user.balance))}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 font-mono text-xl font-black text-amber-300 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Channel Form Fields */}
              {withdrawMethod === 'UPI' ? (
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="Full name as on bank / UPI account"
                      value={upiHolderName}
                      onChange={(e) => setUpiHolderName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Your UPI ID (VPA)</label>
                    <input
                      type="text"
                      placeholder="e.g. mobile@paytm or name@oksbi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. State Bank of India, HDFC Bank, ICICI Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="Exact Name on Passbook / Bank Statement"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="Enter Account Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Confirm Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="Re-enter Account Number"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">11-Digit IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SBIN0001234 or HDFC0001234"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-slate-100"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400">
                <span>🛡️ Master Admin manually approves each withdrawal before payout is released.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingWithdraw || user.balance < withdrawAmount}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-brand font-black text-sm shadow-xl transition active:scale-95 disabled:opacity-50"
              >
                {isSubmittingWithdraw ? 'Submitting Request...' : `Submit Withdrawal Request (₹${withdrawAmount})`}
              </button>
            </>
          )}
        </form>
      )}

      {/* TAB: AUDIT & TRANSACTION RECORDS */}
      {activeTab === 'records' && (
        <DepositHistorySection
          deposits={deposits}
          withdrawals={withdrawals}
          onOpenSupport={onOpenSupport}
        />
      )}
    </div>
  );
};

