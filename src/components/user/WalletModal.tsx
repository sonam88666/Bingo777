import React, { useState } from 'react';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Clock, 
  Copy, 
  Building2, 
  Smartphone,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { UserRecord, DepositRecord, WithdrawalRecord } from '../../types';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';

interface WalletModalProps {
  user: UserRecord;
  initialTab?: 'deposit' | 'withdraw' | 'history';
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  user,
  initialTab = 'deposit',
  onClose
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>(initialTab);

  // Deposit Form (First option is UPI by default, second option is USDT ERC20)
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [usdtDepositAmount, setUsdtDepositAmount] = useState<number>(10);
  const [depositMethod, setDepositMethod] = useState<DepositRecord['paymentMethod']>('UPI');
  const [utrReference, setUtrReference] = useState<string>('');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  // Withdraw Form (First option is UPI by default, second option is USDT ERC20)
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [usdtWithdrawAmount, setUsdtWithdrawAmount] = useState<number>(10);
  const [withdrawMethod, setWithdrawMethod] = useState<WithdrawalRecord['payoutMethod']>('UPI');
  const [upiId, setUpiId] = useState<string>('');
  const [usdtAddress, setUsdtAddress] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [holderName, setHolderName] = useState<string>('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const adminSettings = store.getAdminSettings();
  const deposits = store.getDeposits().filter((d) => d.uid === user.uid);
  const withdrawals = store.getWithdrawals().filter((w) => w.uid === user.uid);

  // Quick Deposit Amount Presets
  const minDepositAmount = Math.max(250, adminSettings.minDeposit || 250);
  const minUsdtDeposit = Math.max(5, adminSettings.minUsdtDeposit || 5);
  const minUpiWithdrawal = Math.max(500, adminSettings.minWithdrawal || 500);
  const minUsdtWithdrawal = Math.max(10, adminSettings.minUsdtWithdrawal || 10);
  const usdtRate = adminSettings.usdtExchangeRate || 90;
  const officialUsdtAddress = adminSettings.usdtErc20Address || '0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45';

  const depositPresets = [250, 500, 1000, 2000, 5000, 10000];
  const usdtDepositPresets = [5, 10, 25, 50, 100, 500];

  const isDepositsEnabled = store.isFeatureEnabled('deposits');
  const isUsdtDepositEnabled = store.isFeatureEnabled('usdt_deposit');
  const isUpiCh1Enabled = store.isFeatureEnabled('upi_channel_1');
  const isUpiCh2Enabled = store.isFeatureEnabled('upi_channel_2');
  const isWithdrawalsEnabled = store.isFeatureEnabled('withdrawals');
  const isUpiWithdrawalEnabled = store.isFeatureEnabled('upi_withdrawal');
  const isUsdtWithdrawalEnabled = store.isFeatureEnabled('usdt_withdrawal');
  const isBankWithdrawalEnabled = store.isFeatureEnabled('bank_withdrawal');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'info');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDepositsEnabled) {
      showToast('Deposits are currently paused by Master Admin.', 'error');
      return;
    }

    if (depositMethod === 'USDT') {
      if (!isUsdtDepositEnabled) {
        showToast('USDT (ERC20) deposits are currently disabled by Master Admin.', 'error');
        return;
      }
      if (usdtDepositAmount < minUsdtDeposit) {
        showToast(`Minimum USDT deposit is $${minUsdtDeposit} USDT`, 'error');
        return;
      }
      if (!utrReference.trim() || utrReference.trim().length < 6) {
        showToast('Please enter a valid USDT (ERC20) Transaction Hash (TXID)', 'error');
        return;
      }

      setIsSubmittingDeposit(true);
      const estimatedInr = Math.round(usdtDepositAmount * usdtRate);
      const result = store.requestDeposit(
        user.uid,
        estimatedInr,
        'USDT',
        utrReference.trim(),
        undefined,
        usdtDepositAmount
      );
      setIsSubmittingDeposit(false);
      if (!result.success) {
        showToast(result.error || 'Failed to submit USDT deposit', 'error');
        return;
      }
      setUtrReference('');
      showToast(
        `USDT Deposit ($${usdtDepositAmount}) submitted! Master Admin will verify & credit INR to your wallet.`,
        'success'
      );
      setActiveTab('history');
      return;
    }

    if (!utrReference.trim()) {
      showToast('Please enter the 12-digit UTR or Transaction Reference ID', 'error');
      return;
    }
    if (depositAmount < minDepositAmount) {
      showToast(`Minimum UPI deposit is ₹${minDepositAmount}`, 'error');
      return;
    }

    setIsSubmittingDeposit(true);
    const result = store.requestDeposit(user.uid, depositAmount, 'UPI', utrReference.trim());
    if (!result.success) {
      setIsSubmittingDeposit(false);
      showToast(result.error || 'Failed to submit deposit', 'error');
      return;
    }
    setIsSubmittingDeposit(false);
    setUtrReference('');
    showToast('Deposit request submitted! Master Admin is verifying your payment.', 'success');
    setActiveTab('history');
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWithdrawalsEnabled) {
      showToast('Withdrawals are currently paused by Master Admin.', 'error');
      return;
    }

    if (withdrawMethod === 'USDT (ERC20)') {
      if (!isUsdtWithdrawalEnabled) {
        showToast('USDT (ERC20) withdrawals are currently disabled by Master Admin.', 'error');
        return;
      }
      if (usdtWithdrawAmount < minUsdtWithdrawal) {
        showToast(`Minimum USDT withdrawal is $${minUsdtWithdrawal} USDT`, 'error');
        return;
      }
      const cleanAddr = usdtAddress.trim();
      if (!cleanAddr.startsWith('0x') || cleanAddr.length < 20) {
        showToast('Please enter a valid ERC20 USDT Wallet Address starting with 0x', 'error');
        return;
      }
      const inrNeeded = Math.round(usdtWithdrawAmount * usdtRate);
      if (user.balance < inrNeeded) {
        showToast(`Insufficient wallet balance. $${usdtWithdrawAmount} USDT requires ₹${inrNeeded}`, 'error');
        return;
      }

      setIsSubmittingWithdraw(true);
      const result = store.requestWithdrawal(
        user.uid,
        inrNeeded,
        'USDT (ERC20)',
        {
          usdtAddress: cleanAddr,
          usdtNetwork: 'ERC20'
        },
        usdtWithdrawAmount
      );
      setIsSubmittingWithdraw(false);

      if (result.success) {
        setUsdtAddress('');
        showToast(
          `USDT Withdrawal ($${usdtWithdrawAmount} / ₹${inrNeeded}) submitted for Master Admin approval!`,
          'success'
        );
        setActiveTab('history');
      } else {
        showToast(result.error || 'Failed to request USDT withdrawal', 'error');
      }
      return;
    }

    if (withdrawAmount < minUpiWithdrawal) {
      showToast(`Minimum withdrawal is ₹${minUpiWithdrawal}`, 'error');
      return;
    }
    if (withdrawAmount > adminSettings.maxWithdrawal) {
      showToast(`Maximum withdrawal is ₹${adminSettings.maxWithdrawal}`, 'error');
      return;
    }
    if (user.balance < withdrawAmount) {
      showToast('Insufficient wallet balance', 'error');
      return;
    }

    if (withdrawMethod === 'UPI' && !upiId.trim()) {
      showToast('Please enter your valid UPI ID (e.g. name@okhdfcbank)', 'error');
      return;
    }
    if (withdrawMethod === 'Bank Transfer' && (!accountNumber.trim() || !ifscCode.trim() || !holderName.trim())) {
      showToast('Please provide full Bank Account number, IFSC, and Holder Name', 'error');
      return;
    }

    setIsSubmittingWithdraw(true);
    const result = store.requestWithdrawal(user.uid, withdrawAmount, withdrawMethod, {
      upiId: withdrawMethod === 'UPI' ? upiId.trim() : undefined,
      accountNumber: withdrawMethod === 'Bank Transfer' ? accountNumber.trim() : undefined,
      ifscCode: withdrawMethod === 'Bank Transfer' ? ifscCode.trim().toUpperCase() : undefined,
      holderName: withdrawMethod === 'Bank Transfer' ? holderName.trim() : undefined
    });
    setIsSubmittingWithdraw(false);

    if (result.success) {
      showToast(`Withdrawal of ₹${withdrawAmount} requested for Master Admin approval!`, 'success');
      setActiveTab('history');
    } else {
      showToast(result.error || 'Failed to request withdrawal', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Financial Management
            </span>
            <div className="font-brand font-black text-xl text-amber-300">
              Wallet & Cashier
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 border-b-2 transition ${
              activeTab === 'deposit'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Deposit</span>
          </button>

          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 border-b-2 transition ${
              activeTab === 'withdraw'
                ? 'border-amber-500 text-amber-400 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>Withdraw</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 border-b-2 transition ${
              activeTab === 'history'
                ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Transactions</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* TAB 1: DEPOSIT */}
          {activeTab === 'deposit' && (
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              {/* Payment Method Selector: 1st Option UPI, 2nd Option USDT (ERC20) */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                  Select Deposit Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositMethod('UPI')}
                    className={`p-3 rounded-2xl border text-left transition flex items-center space-x-2.5 ${
                      depositMethod === 'UPI'
                        ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black block">1. UPI Deposit</span>
                      <span className="text-[10px] opacity-80 block">Min ₹{minDepositAmount}</span>
                    </div>
                  </button>

                  {isUsdtDepositEnabled && (
                    <button
                      type="button"
                      onClick={() => setDepositMethod('USDT')}
                      className={`p-3 rounded-2xl border text-left transition flex items-center space-x-2.5 ${
                        depositMethod === 'USDT'
                          ? 'bg-teal-950/50 border-teal-400 text-teal-300 shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black block">2. USDT (ERC20)</span>
                        <span className="text-[10px] opacity-80 block">Min ${minUsdtDeposit} USDT</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {depositMethod === 'UPI' ? (
                <>
                  {/* UPI Amount Input & Presets */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 flex justify-between">
                      <span>Deposit Amount (₹)</span>
                      <span className="text-emerald-400 font-bold text-[11px]">Min: ₹{minDepositAmount}</span>
                    </label>
                    <input
                      type="number"
                      min={minDepositAmount}
                      max={adminSettings.maxDeposit}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-lg font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                      required
                    />
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2">
                      {depositPresets.map((preset) => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setDepositAmount(preset)}
                          className={`py-1.5 rounded-lg text-xs font-mono font-bold border ${
                            depositAmount === preset
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          +₹{preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Authorized UPI Channels */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800">
                      <span className="font-semibold">Official Admin UPI Channels</span>
                      <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Admin Approval Required</span>
                      </span>
                    </div>

                    <div className="space-y-2">
                      {isUpiCh1Enabled && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="min-w-0 pr-2">
                            <span className="text-[9px] text-amber-400 block font-bold uppercase">Channel 1 (Primary UPI)</span>
                            <span className="font-mono font-bold text-slate-200 text-xs truncate block">
                              {adminSettings.officialUpiId || adminSettings.upiId || 'BHARATPE09905641446@yesbankltd'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(adminSettings.officialUpiId || adminSettings.upiId || 'BHARATPE09905641446@yesbankltd')}
                            className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center space-x-1 shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        </div>
                      )}

                      {isUpiCh2Enabled && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-emerald-500/30">
                          <div className="min-w-0 pr-2">
                            <span className="text-[9px] text-emerald-400 block font-bold uppercase">Channel 2 (Backup UPI - If Ch 1 Fails)</span>
                            <span className="font-mono font-bold text-emerald-300 text-xs truncate block">
                              {adminSettings.secondaryUpiId || 'suman.1299@superyes'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(adminSettings.secondaryUpiId || 'suman.1299@superyes')}
                            className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold flex items-center space-x-1 shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* UTR Reference Input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                      12-Digit UTR / Transaction Reference ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 428192049182"
                      value={utrReference}
                      onChange={(e) => setUtrReference(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingDeposit}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-950/40 active:scale-95 transition"
                  >
                    {isSubmittingDeposit ? 'Submitting...' : `Submit UPI Deposit (₹${depositAmount})`}
                  </button>
                </>
              ) : (
                <>
                  {/* USDT (ERC20) Clean Deposit Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-teal-500/40 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-300 uppercase tracking-wider text-[11px]">
                        Official USDT Receiver Address
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-black text-[10px]">
                        Network: ERC20
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-slate-100 text-[11px] break-all select-all">
                        {officialUsdtAddress}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(officialUsdtAddress)}
                        className="px-2.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-[10px] flex items-center space-x-1 shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Send only <strong className="text-teal-300">USDT (ERC20)</strong>. After Master Admin approval, Admin will convert & credit INR directly to your wallet.
                    </p>
                  </div>

                  {/* USDT Amount Input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 flex justify-between">
                      <span>USDT Amount ($)</span>
                      <span className="text-teal-400 font-bold text-[11px]">Min: ${minUsdtDeposit} USDT</span>
                    </label>
                    <input
                      type="number"
                      min={minUsdtDeposit}
                      step="any"
                      value={usdtDepositAmount}
                      onChange={(e) => setUsdtDepositAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-lg font-bold text-teal-300 focus:outline-none focus:border-teal-500"
                      required
                    />
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2">
                      {usdtDepositPresets.map((preset) => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setUsdtDepositAmount(preset)}
                          className={`py-1.5 rounded-lg text-xs font-mono font-bold border ${
                            usdtDepositAmount === preset
                              ? 'bg-teal-500 text-slate-950 border-teal-400'
                              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TXID / Hash Input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                      Transaction Hash (TXID) / Reference
                    </label>
                    <input
                      type="text"
                      placeholder="Paste 0x... ERC20 transaction hash"
                      value={utrReference}
                      onChange={(e) => setUtrReference(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingDeposit}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition"
                  >
                    {isSubmittingDeposit ? 'Submitting...' : `Submit USDT Deposit ($${usdtDepositAmount} USDT)`}
                  </button>
                </>
              )}
            </form>
          )}

          {/* TAB 2: WITHDRAW */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {/* Balance Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400">Withdrawable Balance</span>
                  <div className="font-mono font-black text-xl text-amber-300">
                    ₹{user.balance.toFixed(2)}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span className="block text-emerald-400 font-bold">Admin Verified Payout</span>
                  <span>Min UPI: ₹{minUpiWithdrawal} | Min USDT: ${minUsdtWithdrawal}</span>
                </div>
              </div>

              {/* Withdrawal Method: 1st UPI, 2nd USDT (ERC20), 3rd Bank */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                  Select Payout Channel (1st UPI · 2nd USDT ERC20)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {isUpiWithdrawalEnabled && (
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('UPI')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition ${
                        withdrawMethod === 'UPI'
                          ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>1. UPI</span>
                      <span className="text-[9px] opacity-80">Min ₹{minUpiWithdrawal}</span>
                    </button>
                  )}

                  {isUsdtWithdrawalEnabled && (
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('USDT (ERC20)')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition ${
                        withdrawMethod === 'USDT (ERC20)'
                          ? 'bg-teal-950/60 border-teal-400 text-teal-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Coins className="w-4 h-4" />
                      <span>2. USDT</span>
                      <span className="text-[9px] opacity-80">Min ${minUsdtWithdrawal}</span>
                    </button>
                  )}

                  {isBankWithdrawalEnabled && (
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('Bank Transfer')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition ${
                        withdrawMethod === 'Bank Transfer'
                          ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>3. Bank</span>
                      <span className="text-[9px] opacity-80">Min ₹{minUpiWithdrawal}</span>
                    </button>
                  )}
                </div>
              </div>

              {withdrawMethod === 'USDT (ERC20)' ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 flex justify-between">
                      <span>Withdrawal Amount ($ USDT)</span>
                      <span className="text-teal-400 font-bold text-[11px]">
                        Min: ${minUsdtWithdrawal} USDT
                      </span>
                    </label>
                    <input
                      type="number"
                      min={minUsdtWithdrawal}
                      step="any"
                      value={usdtWithdrawAmount}
                      onChange={(e) => setUsdtWithdrawAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-lg font-bold text-teal-300 focus:outline-none focus:border-teal-500"
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Wallet Deduction: <strong className="text-amber-300 font-mono">₹{Math.round(usdtWithdrawAmount * usdtRate)}</strong> (Rate: ₹{usdtRate}/USDT)
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                      Your USDT (ERC20) Wallet Address
                    </label>
                    <input
                      type="text"
                      placeholder="0x... (ERC20 Wallet Address)"
                      value={usdtAddress}
                      onChange={(e) => setUsdtAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingWithdraw}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition"
                  >
                    {isSubmittingWithdraw ? 'Processing...' : `Request USDT Payout ($${usdtWithdrawAmount} USDT)`}
                  </button>
                </>
              ) : (
                <>
                  {/* INR Amount */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 flex justify-between">
                      <span>Withdrawal Amount (₹)</span>
                      <span className="text-amber-400 font-bold text-[11px]">
                        Min: ₹{minUpiWithdrawal} | Max: ₹{adminSettings.maxWithdrawal}
                      </span>
                    </label>
                    <input
                      type="number"
                      min={minUpiWithdrawal}
                      max={adminSettings.maxWithdrawal}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-lg font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  {/* Channel-Specific Fields */}
                  {withdrawMethod === 'UPI' ? (
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                        Your UPI ID / VPA
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. mobile@paytm or name@oksbi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1 block">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          placeholder="As per bank passbook"
                          value={holderName}
                          onChange={(e) => setHolderName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1 block">
                          Bank Account Number
                        </label>
                        <input
                          type="text"
                          placeholder="Enter account number"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1 block">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. SBIN0001234"
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 uppercase placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingWithdraw}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-950/40 active:scale-95 transition"
                  >
                    {isSubmittingWithdraw ? 'Processing...' : `Request Payout (₹${withdrawAmount})`}
                  </button>
                </>
              )}
            </form>
          )}

          {/* TAB 3: TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Deposits Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Deposit History ({deposits.length})</span>
                </h4>
                {deposits.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-950/60 rounded-xl">No deposits yet.</p>
                ) : (
                  <div className="space-y-2">
                    {deposits.map((dep) => (
                      <div key={dep.id} className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-mono font-bold text-emerald-400 text-sm">
                            +₹{dep.amount} {dep.usdtAmount ? `($${dep.usdtAmount} USDT ERC20)` : `(${dep.paymentMethod})`}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Ref: {dep.referenceId} • {new Date(dep.submittedAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dep.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : dep.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}>
                          {dep.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Withdrawals Section */}
              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <ArrowUpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Withdrawal History ({withdrawals.length})</span>
                </h4>
                {withdrawals.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-950/60 rounded-xl">No withdrawals yet.</p>
                ) : (
                  <div className="space-y-2">
                    {withdrawals.map((w) => (
                      <div key={w.id} className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-mono font-bold text-amber-400 text-sm">
                            -₹{w.amount} {w.usdtAmount ? `($${w.usdtAmount} USDT ERC20)` : `(${w.payoutMethod})`}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Dest: {w.accountDetails.usdtAddress || w.accountDetails.upiId || w.accountDetails.accountNumber} • {new Date(w.requestedAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          w.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : w.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}>
                          {w.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

