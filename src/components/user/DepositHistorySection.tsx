import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ExternalLink, 
  Filter, 
  Calendar, 
  ArrowDownLeft, 
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Receipt,
  FileQuestion,
  Search,
  Sparkles,
  Upload,
  X,
  MessageSquare
} from 'lucide-react';
import { DepositRecord, WithdrawalRecord } from '../../types';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';

interface DepositHistorySectionProps {
  deposits: DepositRecord[];
  withdrawals: WithdrawalRecord[];
  onOpenSupport: () => void;
  defaultSubTab?: 'deposits' | 'withdrawals';
}

type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';
type DateFilter = 'all' | 'today' | 'yesterday' | 'week';

export const DepositHistorySection: React.FC<DepositHistorySectionProps> = ({
  deposits,
  withdrawals,
  onOpenSupport,
  defaultSubTab = 'deposits'
}) => {
  const { showToast } = useToast();
  const adminSettings = store.getAdminSettings();
  const officialUpiId = adminSettings.officialUpiId || adminSettings.upiId || 'BHARATPE09905641446@yesbankltd';
  const officialUpiName = adminSettings.officialUpiName || adminSettings.upiMerchantName || 'BHARATPE ENTERPRISES';
  const secondaryUpiId = adminSettings.secondaryUpiId || 'suman.1299@superyes';
  const secondaryUpiName = adminSettings.secondaryUpiName || 'SUMAN ENTERPRISES';
  const officialUsdtAddress = adminSettings.usdtErc20Address || '0xF600F72A9d4b9B0D6F6972a9037767ca7A9f3d45';
  
  // Section view toggle: Deposits vs Withdrawals
  const [activeCategory, setActiveCategory] = useState<'deposits' | 'withdrawals'>(defaultSubTab);
  
  // Payment Method Filter: All vs UPI vs USDT
  const [methodTab, setMethodTab] = useState<'All' | 'UPI' | 'USDT'>('All');
  
  // Deposit Filters (Status, Date, Search)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Receipt Modal State
  const [receiptModalDeposit, setReceiptModalDeposit] = useState<DepositRecord | null>(null);
  const [receiptUtr, setReceiptUtr] = useState('');
  const [receiptNote, setReceiptNote] = useState('');
  const [receiptBankName, setReceiptBankName] = useState('');
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  const handleOpenReceiptModal = (d: DepositRecord) => {
    setReceiptModalDeposit(d);
    setReceiptUtr(d.referenceId || '');
    setReceiptNote('');
    setReceiptBankName('');
  };

  const handleConfirmSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptModalDeposit) return;
    if (!receiptUtr.trim() || receiptUtr.trim().length < 6) {
      showToast('Please enter a valid bank UTR / Reference ID', 'error');
      return;
    }

    setIsSubmittingReceipt(true);
    store.attachDepositReceipt(
      receiptModalDeposit.id,
      undefined,
      `UTR: ${receiptUtr.trim()}${receiptBankName ? ' | Bank: ' + receiptBankName.trim() : ''}${receiptNote ? ' | Note: ' + receiptNote.trim() : ''}`
    );
    setIsSubmittingReceipt(false);
    showToast('Payment receipt submitted! Master Admin has been notified for verification.', 'success');
    setReceiptModalDeposit(null);
  };

  // Filtered deposits
  const filteredDeposits = useMemo(() => {
    return deposits.filter((d) => {
      // Payment method filter (Only Admin Added UPI is supported, never random UPI)
      if (methodTab !== 'All' && d.paymentMethod !== methodTab) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && d.status !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const itemDate = new Date(d.submittedAt);
        const today = new Date();
        if (dateFilter === 'today') {
          if (itemDate.toDateString() !== today.toDateString()) return false;
        } else if (dateFilter === 'yesterday') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (itemDate.toDateString() !== yesterday.toDateString()) return false;
        } else if (dateFilter === 'week') {
          const sevenDaysAgo = Date.now() - 7 * 86400000;
          if (d.submittedAt < sevenDaysAgo) return false;
        }
      }

      // Search Query (Order ID / Reference / UTR)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = d.referenceId.toLowerCase().includes(q);
        const matchesId = d.id.toLowerCase().includes(q);
        const matchesAmt = d.amount.toString().includes(q);
        if (!matchesRef && !matchesId && !matchesAmt) return false;
      }

      return true;
    });
  }, [deposits, methodTab, statusFilter, dateFilter, searchQuery]);

  // Filtered withdrawals
  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => {
      if (statusFilter !== 'all' && w.status !== statusFilter) {
        return false;
      }
      if (dateFilter !== 'all') {
        const itemDate = new Date(w.requestedAt);
        const today = new Date();
        if (dateFilter === 'today') {
          if (itemDate.toDateString() !== today.toDateString()) return false;
        } else if (dateFilter === 'yesterday') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (itemDate.toDateString() !== yesterday.toDateString()) return false;
        } else if (dateFilter === 'week') {
          const sevenDaysAgo = Date.now() - 7 * 86400000;
          if (w.requestedAt < sevenDaysAgo) return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = w.id.toLowerCase().includes(q);
        const matchesAmt = w.amount.toString().includes(q);
        const matchesAcc = (w.accountDetails?.upiId || w.accountDetails?.accountNumber || '').toLowerCase().includes(q);
        if (!matchesId && !matchesAmt && !matchesAcc) return false;
      }
      return true;
    });
  }, [withdrawals, statusFilter, dateFilter, searchQuery]);

  // Current list based on category
  const activeListLength = activeCategory === 'deposits' ? filteredDeposits.length : filteredWithdrawals.length;
  const totalPages = Math.max(1, Math.ceil(activeListLength / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  
  const paginatedDeposits = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredDeposits.slice(start, start + itemsPerPage);
  }, [filteredDeposits, safePage, itemsPerPage]);

  const paginatedWithdrawals = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredWithdrawals.slice(start, start + itemsPerPage);
  }, [filteredWithdrawals, safePage, itemsPerPage]);

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-4">
      {/* Category Toggle: Deposit Records vs Withdrawal Records */}
      <div className="flex rounded-2xl bg-slate-900/90 p-1.5 border border-slate-800 shadow-xl">
        <button
          type="button"
          onClick={() => { setActiveCategory('deposits'); setCurrentPage(1); }}
          className={`flex-1 py-2.5 rounded-xl font-brand font-black text-xs flex items-center justify-center space-x-2 transition ${
            activeCategory === 'deposits'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Deposit History ({deposits.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveCategory('withdrawals'); setCurrentPage(1); }}
          className={`flex-1 py-2.5 rounded-xl font-brand font-black text-xs flex items-center justify-center space-x-2 transition ${
            activeCategory === 'withdrawals'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Withdrawal History ({withdrawals.length})</span>
        </button>
      </div>

      {/* Main Container Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800/90 p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Header Title with Status Counts */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-800/80">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                Financial Audit Log
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] text-emerald-400 font-mono">Secured</span>
            </div>
            <h3 className="font-brand font-black text-slate-100 text-lg">
              {activeCategory === 'deposits' ? 'Deposit History' : 'Withdrawal History'}
            </h3>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span>Total:</span>
            <strong className="text-amber-300 font-bold">{activeListLength} records</strong>
          </div>
        </div>

        {/* Official Admin Verified UPI Cashier Channels (Primary & Backup) */}
        {activeCategory === 'deposits' && (
          <div className="space-y-2">
            {/* Primary Channel */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs shadow-inner">
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-brand font-black text-xs shrink-0">
                  UPI 1
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                      Channel 1 · Primary UPI
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Default
                    </span>
                  </div>
                  <div className="font-mono font-black text-slate-200 text-xs sm:text-sm truncate select-all">
                    {officialUpiId}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Merchant Name: <strong className="text-slate-400 font-semibold">{officialUpiName}</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(officialUpiId, 'Primary Admin UPI')}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-brand font-black text-[11px] flex items-center space-x-1 shrink-0 transition active:scale-95 shadow-md"
                title="Copy Primary UPI"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>

            {/* Secondary Backup Channel */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs shadow-inner">
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-brand font-black text-xs shrink-0">
                  UPI 2
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                      Channel 2 · Backup UPI (If UPI 1 Fails)
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active Backup
                    </span>
                  </div>
                  <div className="font-mono font-black text-emerald-300 text-xs sm:text-sm truncate select-all">
                    {secondaryUpiId}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Merchant Name: <strong className="text-slate-400 font-semibold">{secondaryUpiName}</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(secondaryUpiId, 'Backup Admin UPI')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-brand font-black text-[11px] flex items-center space-x-1 shrink-0 transition active:scale-95 shadow-md"
                title="Copy Backup UPI"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>

            {/* Official USDT (ERC20) Channel */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-teal-500/30 flex items-center justify-between text-xs shadow-inner">
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 flex items-center justify-center font-brand font-black text-[10px] shrink-0">
                  USDT
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-teal-300 uppercase font-bold tracking-wider">
                      Channel 3 · USDT (ERC20) Address
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Min $5
                    </span>
                  </div>
                  <div className="font-mono font-black text-teal-300 text-xs truncate select-all">
                    {officialUsdtAddress}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(officialUsdtAddress, 'USDT (ERC20) Address')}
                className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-brand font-black text-[11px] flex items-center space-x-1 shrink-0 transition active:scale-95 shadow-md"
                title="Copy USDT ERC20 Address"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        )}

        {/* Working Payment Channel, Status & Date Filters */}
        <div className="space-y-2.5 pt-1">
          {/* Payment Channel Tabs for Deposits */}
          {activeCategory === 'deposits' && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs pb-1 border-b border-slate-800/60">
              <span className="text-slate-400 text-[11px] font-semibold mr-1 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Channel:</span>
              </span>
              <button
                type="button"
                onClick={() => { setMethodTab('All'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                  methodTab === 'All'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                All Deposits
              </button>
              <button
                type="button"
                onClick={() => { setMethodTab('UPI'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center space-x-1.5 ${
                  methodTab === 'UPI'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>1. UPI Deposits</span>
              </button>
              <button
                type="button"
                onClick={() => { setMethodTab('USDT'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center space-x-1.5 ${
                  methodTab === 'USDT'
                    ? 'bg-teal-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                <span>2. USDT (ERC20)</span>
              </button>
            </div>
          )}

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold mr-1 flex items-center space-x-1">
              <Filter className="w-3 h-3 text-amber-400" />
              <span>Status:</span>
            </span>

            {[
              { id: 'all', label: 'All' },
              { id: 'approved', label: 'Completed', color: 'text-emerald-400' },
              { id: 'pending', label: 'Pending', color: 'text-amber-400' },
              { id: 'rejected', label: 'Failed', color: 'text-rose-400' }
            ].map((st) => {
              const isSelected = statusFilter === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => { setStatusFilter(st.id as StatusFilter); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-slate-800 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border border-slate-800/70 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {st.id === 'approved' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                  {st.id === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>}
                  {st.id === 'rejected' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>}
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>

          {/* Date Filters & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 text-[11px] font-semibold mr-1 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>Date:</span>
              </span>

              {[
                { id: 'all', label: 'All' },
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'week', label: 'Last 7 Days' }
              ].map((dt) => {
                const isSelected = dateFilter === dt.id;
                return (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => { setDateFilter(dt.id as DateFilter); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {dt.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Filter Search Input */}
            <div className="relative min-w-[160px] flex-1 sm:flex-initial">
              <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search Order ID / UTR..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </div>

        {/* TRANSACTION CARDS LIST */}
        <div className="space-y-3 pt-2">
          {activeCategory === 'deposits' ? (
            paginatedDeposits.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                <FileQuestion className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-bold text-xs">No Deposit Transactions Found</p>
                <p className="text-slate-500 text-[11px]">
                  No deposits match the selected gateway, status, or date filter.
                </p>
              </div>
            ) : (
              paginatedDeposits.map((d) => {
                const isCompleted = d.status === 'approved';
                const isPending = d.status === 'pending';
                const isFailed = d.status === 'rejected';

                return (
                  <div
                    key={d.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-slate-700/80 transition shadow-lg space-y-3"
                  >
                    {/* Top Row: Amount, Method Badge, Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <ArrowDownLeft className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-black text-emerald-400 text-lg tracking-tight">
                              +₹{d.amount.toFixed(2)}
                            </span>
                            {d.usdtAmount ? (
                              <span className="px-2 py-0.5 rounded-md bg-teal-500/20 border border-teal-500/40 text-[10px] font-mono font-bold text-teal-300">
                                ${d.usdtAmount} USDT (ERC20)
                              </span>
                            ) : null}
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-amber-300">
                              {d.paymentMethod === 'USDT' ? 'USDT (ERC20)' : d.paymentMethod || 'UPI'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {formatDateTime(d.submittedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge: Green for Completed, Amber for Pending, Red for Failed */}
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black flex items-center space-x-1.5 shadow-sm ${
                        isCompleted 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                          : isPending 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {isPending && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                        {isFailed && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                        <span>{isCompleted ? 'Completed' : isPending ? 'Pending' : 'Failed'}</span>
                      </span>
                    </div>

                    {/* Order ID / UTR with Copy Button */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <span className="text-slate-400 text-[11px] shrink-0 font-sans">
                          {d.paymentMethod === 'USDT' ? 'TXID Hash:' : 'Order ID / UTR:'}
                        </span>
                        <span className="font-bold text-slate-200 truncate select-all">
                          {d.referenceId}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(d.referenceId, 'Reference / TXID')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center space-x-1 shrink-0 transition"
                        title="Copy Order ID"
                      >
                        <Copy className="w-3 h-3" />
                        <span className="text-[10px] font-bold font-sans">Copy</span>
                      </button>
                    </div>

                    {/* Admin Note if Rejected */}
                    {d.adminNote && (
                      <div className="text-[11px] text-rose-300 bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/50 flex items-start space-x-2">
                        <XCircle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                        <div>
                          <strong className="text-rose-200">Note:</strong> {d.adminNote}
                        </div>
                      </div>
                    )}

                    {/* Submit Receipt Action (Only for Pending or Failed Transactions) */}
                    {(isPending || isFailed) && (
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 italic">
                          {isPending ? 'Awaiting Master Admin verification' : 'Receipt proof required for manual credit'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenReceiptModal(d)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center space-x-1.5 transition active:scale-95"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Submit Receipt</span>
                          <ExternalLink className="w-3 h-3 text-amber-400/80" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )
          ) : (
            /* WITHDRAWALS LIST */
            paginatedWithdrawals.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                <FileQuestion className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-bold text-xs">No Withdrawal Transactions Found</p>
                <p className="text-slate-500 text-[11px]">
                  No withdrawal records match your current filter criteria.
                </p>
              </div>
            ) : (
              paginatedWithdrawals.map((w) => {
                const isCompleted = w.status === 'approved';
                const isPending = w.status === 'pending';
                const isFailed = w.status === 'rejected';

                const targetAccount =
                  w.payoutMethod === 'USDT (ERC20)'
                    ? w.accountDetails?.usdtAddress
                    : w.payoutMethod === 'UPI'
                    ? w.accountDetails?.upiId
                    : `${w.accountDetails?.bankName || 'Bank'} (${w.accountDetails?.accountNumber || ''})`;

                return (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-slate-700/80 transition shadow-lg space-y-3"
                  >
                    {/* Top Row: Amount, Method Badge, Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-black text-amber-300 text-lg tracking-tight">
                              -₹{w.amount.toFixed(2)}
                            </span>
                            {w.usdtAmount ? (
                              <span className="px-2 py-0.5 rounded-md bg-teal-500/20 border border-teal-500/40 text-[10px] font-mono font-bold text-teal-300">
                                ${w.usdtAmount} USDT (ERC20)
                              </span>
                            ) : null}
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                              {w.payoutMethod}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {formatDateTime(w.requestedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black flex items-center space-x-1.5 shadow-sm ${
                        isCompleted 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                          : isPending 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {isPending && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                        {isFailed && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                        <span>{isCompleted ? 'Completed' : isPending ? 'Pending' : 'Failed'}</span>
                      </span>
                    </div>

                    {/* Payout Account Details with Copy Button */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <span className="text-slate-400 text-[11px] shrink-0 font-sans">Payout To:</span>
                        <span className="font-bold text-slate-200 truncate select-all">
                          {targetAccount || 'N/A'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(targetAccount || '', 'Account Details')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center space-x-1 shrink-0 transition"
                        title="Copy Details"
                      >
                        <Copy className="w-3 h-3" />
                        <span className="text-[10px] font-bold font-sans">Copy</span>
                      </button>
                    </div>

                    {/* Rejection Note */}
                    {w.rejectionReason && (
                      <div className="text-[11px] text-rose-300 bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/50">
                        <strong className="text-rose-200">Rejection Reason:</strong> {w.rejectionReason} (Amount refunded to wallet)
                      </div>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="font-mono text-[11px]">
              Page <strong className="text-amber-300">{safePage}</strong> of <strong>{totalPages}</strong> ({activeListLength} items)
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none flex items-center space-x-1 transition font-bold"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none flex items-center space-x-1 transition font-bold"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT RECEIPT PROOF MODAL */}
      {receiptModalDeposit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-brand font-black text-slate-100 text-sm">Submit Payment Receipt</h3>
                  <span className="text-[10px] text-slate-400">Order Ref: {receiptModalDeposit.referenceId}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModalDeposit(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Deposit Info Summary Card */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Deposit Amount</span>
                <span className="font-mono font-black text-emerald-400 text-base">
                  ₹{receiptModalDeposit.amount.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Gateway</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-amber-300">
                  {receiptModalDeposit.paymentMethod || 'UPI'}
                </span>
              </div>
            </div>

            {/* Receipt Form */}
            <form onSubmit={handleConfirmSubmitReceipt} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Bank Reference Number / 12-Digit UTR
                </label>
                <input
                  type="text"
                  required
                  value={receiptUtr}
                  onChange={(e) => setReceiptUtr(e.target.value)}
                  placeholder="e.g. 492819204918"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-sm text-slate-200 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Payment App / Bank Used (Optional)
                </label>
                <input
                  type="text"
                  value={receiptBankName}
                  onChange={(e) => setReceiptBankName(e.target.value)}
                  placeholder="e.g. PhonePe / Google Pay / Paytm / SBI"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Note to Billing Team (Optional)
                </label>
                <textarea
                  rows={2}
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                  placeholder="e.g. Debited from account, please verify ledger credit"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60 resize-none"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmittingReceipt}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-brand font-black text-xs shadow-xl transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingReceipt ? 'Submitting...' : 'Submit Receipt for Verification'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReceiptModalDeposit(null);
                    onOpenSupport();
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-[11px] flex items-center justify-center space-x-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span>Talk with 24/7 Live Support Chat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
