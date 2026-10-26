import React, { useState, useEffect } from 'react';
import {
  Search,
  Building2,
  Smartphone,
  Wallet,
  Copy,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';
import { DepositRecord, WithdrawalRecord } from '../../types';
import { store } from '../../services/store';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../common/Toast';

interface AdminFinancialsProps {
  adminId: string;
  masterToken?: string;
  initialMode?: 'deposits' | 'withdrawals';
}

export const AdminFinancials: React.FC<AdminFinancialsProps> = ({
  adminId,
  masterToken,
  initialMode = 'deposits'
}) => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<'deposits' | 'withdrawals'>(initialMode);
  const [filterTab, setFilterTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Detail & Action Modals
  const [inspectingDeposit, setInspectingDeposit] = useState<DepositRecord | null>(null);
  const [customInrCredit, setCustomInrCredit] = useState<string>('');
  const [inspectingWithdrawal, setInspectingWithdrawal] = useState<WithdrawalRecord | null>(null);
  const [rejectingDeposit, setRejectingDeposit] = useState<DepositRecord | null>(null);
  const [rejectingWithdrawal, setRejectingWithdrawal] = useState<WithdrawalRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deposits = store.getDeposits();
  const withdrawals = store.getWithdrawals();
  const tokenToUse =
    masterToken ||
    sessionStorage.getItem('bingo777_master_admin_token') ||
    localStorage.getItem('bingo777_master_admin_token') ||
    'BINGO_MASTER_2026_KEY';

  const pendingDepositsCount = deposits.filter((d) => d.status === 'pending').length;
  const approvedDepositsCount = deposits.filter((d) => d.status === 'approved').length;
  const rejectedDepositsCount = deposits.filter((d) => d.status === 'rejected').length;

  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length;
  const approvedWithdrawalsCount = withdrawals.filter((w) => w.status === 'approved').length;
  const rejectedWithdrawalsCount = withdrawals.filter((w) => w.status === 'rejected').length;

  const formatTimeAgo = (ts: number) => {
    const diffMin = Math.max(1, Math.floor((Date.now() - ts) / 60000));
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  };

  const filteredDeposits = deposits.filter((d) => {
    if (d.status !== filterTab) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.uid.toLowerCase().includes(q) ||
      d.username.toLowerCase().includes(q) ||
      d.referenceId.toLowerCase().includes(q) ||
      d.paymentMethod.toLowerCase().includes(q) ||
      String(d.amount).includes(q) ||
      (d.usdtAmount ? String(d.usdtAmount).includes(q) : false)
    );
  });

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (w.status !== filterTab) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      w.uid.toLowerCase().includes(q) ||
      w.username.toLowerCase().includes(q) ||
      w.payoutMethod.toLowerCase().includes(q) ||
      String(w.amount).includes(q) ||
      (w.accountDetails?.usdtAddress || '').toLowerCase().includes(q)
    );
  });

  const handleOpenInspectDeposit = (dep: DepositRecord) => {
    setInspectingDeposit(dep);
    setCustomInrCredit(String(dep.amount));
  };

  const handleApproveDeposit = async (dep: DepositRecord, overrideInrAmount?: number) => {
    if (isSubmitting) return;
    if (dep.status !== 'pending') {
      showToast(`Deposit ${dep.id} is already ${dep.status}`, 'info');
      return;
    }

    const finalInrToCredit =
      overrideInrAmount && overrideInrAmount > 0 ? Math.round(overrideInrAmount) : dep.amount;

    setIsSubmitting(true);
    try {
      // Execute authoritative store approval immediately so user balance & bonuses credit reliably
      const approved = store.approveDeposit(dep.id, adminId, finalInrToCredit);
      if (!approved) {
        showToast('Could not approve deposit — please check deposit status', 'error');
        setIsSubmitting(false);
        return;
      }

      // Synchronize with backend API server
      await apiClient.approveDeposit(dep.id, adminId, tokenToUse, dep, finalInrToCredit).catch(() => {});

      const updatedUser = store.getUser(dep.uid);
      showToast(
        dep.paymentMethod === 'USDT'
          ? `Approved $${dep.usdtAmount || ''} USDT deposit & credited ₹${finalInrToCredit.toLocaleString('en-IN')} INR to ${dep.username} (${dep.uid})!`
          : `Approved ₹${finalInrToCredit.toLocaleString('en-IN')} deposit for ${dep.username} (${dep.uid})! New Wallet Balance: ₹${(updatedUser?.balance || 0).toLocaleString('en-IN')}`,
        'success'
      );
      setInspectingDeposit(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRejectDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingDeposit) return;
    const reason = rejectReason.trim() || 'Invalid UTR / Payment not received';
    setIsSubmitting(true);
    try {
      const ok = store.rejectDeposit(rejectingDeposit.id, adminId, reason);
      await apiClient.rejectDeposit(rejectingDeposit.id, adminId, reason, tokenToUse, rejectingDeposit).catch(() => {});
      if (ok) {
        showToast(`Rejected deposit request for ${rejectingDeposit.uid}`, 'info');
      }
      setRejectingDeposit(null);
      setRejectReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveWithdrawal = async (wth: WithdrawalRecord) => {
    if (isSubmitting) return;
    if (wth.status !== 'pending') {
      showToast(`Withdrawal ${wth.id} is already ${wth.status}`, 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = store.approveWithdrawal(wth.id, adminId);
      await apiClient.approveWithdrawal(wth.id, adminId, tokenToUse, wth).catch(() => {});
      if (ok) {
        showToast(
          wth.payoutMethod === 'USDT (ERC20)'
            ? `Approved $${wth.usdtAmount || ''} USDT (₹${wth.amount.toLocaleString('en-IN')}) withdrawal for ${wth.username} (${wth.uid})`
            : `Approved ₹${wth.amount.toLocaleString('en-IN')} withdrawal for ${wth.username} (${wth.uid})`,
          'success'
        );
      } else {
        showToast('Could not approve withdrawal', 'error');
      }
      setInspectingWithdrawal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRejectWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingWithdrawal) return;
    const reason = rejectReason.trim() || 'Invalid payout details — amount refunded to wallet';
    setIsSubmitting(true);
    try {
      const ok = store.rejectWithdrawal(rejectingWithdrawal.id, adminId, reason);
      await apiClient
        .rejectWithdrawal(rejectingWithdrawal.id, adminId, reason, tokenToUse, rejectingWithdrawal)
        .catch(() => {});
      if (ok) {
        showToast(
          `Rejected withdrawal & refunded ₹${rejectingWithdrawal.amount.toLocaleString('en-IN')} to ${rejectingWithdrawal.uid}`,
          'info'
        );
      }
      setRejectingWithdrawal(null);
      setRejectReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'info');
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher (Deposits vs Withdrawals) */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
        <button
          type="button"
          onClick={() => setMode('deposits')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            mode === 'deposits'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          <span>Deposit Requests (UPI & USDT)</span>
          {pendingDepositsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
              {pendingDepositsCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setMode('withdrawals')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            mode === 'withdrawals'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          <span>Withdrawal Requests (UPI & USDT)</span>
          {pendingWithdrawalsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
              {pendingWithdrawalsCount}
            </span>
          )}
        </button>
      </div>

      {/* Segmented Status Tabs (Pending / Approved / Rejected) */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl grid grid-cols-3 gap-1">
        <button
          type="button"
          onClick={() => setFilterTab('pending')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterTab === 'pending'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          Pending ({mode === 'deposits' ? pendingDepositsCount : pendingWithdrawalsCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('approved')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterTab === 'approved'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          Approved ({mode === 'deposits' ? approvedDepositsCount : approvedWithdrawalsCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('rejected')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filterTab === 'rejected'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          Rejected ({mode === 'deposits' ? rejectedDepositsCount : rejectedWithdrawalsCount})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder={
            mode === 'deposits'
              ? 'Search by UID, username, UTR / ERC20 TXID, UPI / USDT...'
              : 'Search by UID, username, UPI / USDT ERC20 address, amount...'
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 shadow-inner focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* DEPOSITS LIST VIEW */}
      {mode === 'deposits' && (
        <div className="space-y-3">
          {filteredDeposits.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-slate-400 text-xs">
              No {filterTab} deposit requests found.
            </div>
          ) : (
            filteredDeposits.map((dep) => {
              const isUsdt = dep.paymentMethod === 'USDT';
              return (
                <div
                  key={dep.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-12 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                          isUsdt
                            ? 'bg-teal-500/15 border-teal-500/30 text-teal-300'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        <Smartphone className="w-5 h-5" />
                        <span className="text-[9px] font-black uppercase mt-0.5">{dep.paymentMethod}</span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-slate-100 text-sm sm:text-base">
                            {dep.username} ({dep.uid})
                          </span>
                          {isUsdt && dep.usdtAmount ? (
                            <span className="px-2 py-0.5 rounded-lg bg-teal-500/20 border border-teal-500/40 font-mono font-black text-teal-300 text-xs sm:text-sm">
                              ${dep.usdtAmount} USDT (ERC20)
                            </span>
                          ) : null}
                          <span className="font-mono font-black text-amber-400 text-sm sm:text-base tabular-nums">
                            ₹{dep.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span>{formatTimeAgo(dep.submittedAt)}</span>
                          <span>·</span>
                          <span className={`font-bold ${isUsdt ? 'text-teal-400' : 'text-emerald-400'}`}>
                            {isUsdt ? 'USDT (ERC20)' : dep.paymentMethod}
                          </span>
                          <span>·</span>
                          <span className="font-mono text-[11px] text-amber-300 break-all">
                            {isUsdt ? 'TXID: ' : 'UTR: '}
                            {dep.referenceId}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                        dep.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : dep.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {dep.status === 'pending' ? 'Pending' : dep.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  </div>

                  {/* If Pending USDT Deposit: Quick Note that Admin can convert & set custom INR in View/Approve */}
                  {dep.status === 'pending' && isUsdt && (
                    <div className="p-2.5 rounded-xl bg-teal-950/30 border border-teal-500/30 flex items-center justify-between text-xs">
                      <span className="text-teal-200">
                        User sent <strong>${dep.usdtAmount || 0} USDT (ERC20)</strong>. Click <strong>View / Convert INR</strong> to enter custom INR amount or approve directly.
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {dep.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            isUsdt ? handleOpenInspectDeposit(dep) : handleApproveDeposit(dep)
                          }
                          className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isUsdt ? 'Convert & Approve' : 'Approve'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            setRejectingDeposit(dep);
                            setRejectReason('');
                          }}
                          className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenInspectDeposit(dep)}
                          className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs transition active:scale-95 flex items-center justify-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenInspectDeposit(dep)}
                        className="col-span-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs transition"
                      >
                        View Verification Details
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* WITHDRAWALS LIST VIEW */}
      {mode === 'withdrawals' && (
        <div className="space-y-3">
          {filteredWithdrawals.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-slate-400 text-xs">
              No {filterTab} withdrawal requests found.
            </div>
          ) : (
            filteredWithdrawals.map((wth) => {
              const isBank = wth.payoutMethod === 'Bank Transfer';
              const isUsdt = wth.payoutMethod === 'USDT (ERC20)';
              return (
                <div
                  key={wth.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3.5">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                          isUsdt
                            ? 'bg-teal-500/15 border-teal-500/30 text-teal-300'
                            : isBank
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {isBank ? <Building2 className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-slate-100 text-sm sm:text-base">
                            {wth.username} ({wth.uid})
                          </span>
                          {isUsdt && wth.usdtAmount ? (
                            <span className="px-2 py-0.5 rounded-lg bg-teal-500/20 border border-teal-500/40 font-mono font-black text-teal-300 text-xs sm:text-sm">
                              ${wth.usdtAmount} USDT (ERC20)
                            </span>
                          ) : null}
                          <span className="font-mono font-black text-amber-400 text-sm sm:text-base tabular-nums">
                            ₹{wth.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-300 mt-0.5 break-all">
                          {isUsdt
                            ? `ERC20 Address: ${wth.accountDetails.usdtAddress || '—'}`
                            : isBank
                            ? `Bank: ${wth.accountDetails.bankName || 'Bank'} (${wth.accountDetails.accountNumber || '—'})`
                            : `UPI: ${wth.accountDetails.upiId || '—'}`}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {formatTimeAgo(wth.requestedAt)}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                        wth.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : wth.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {wth.status === 'pending' ? 'Pending' : wth.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {wth.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleApproveWithdrawal(wth)}
                          className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            setRejectingWithdrawal(wth);
                            setRejectReason('');
                          }}
                          className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectingWithdrawal(wth)}
                          className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs transition active:scale-95 flex items-center justify-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setInspectingWithdrawal(wth)}
                        className="col-span-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs transition"
                      >
                        View Payout Details
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW DEPOSIT DETAILS & USDT-TO-INR CONVERSION MODAL */}
      {inspectingDeposit && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-slate-100 text-base">Deposit Verification & INR Credit</h4>
              <span className="font-mono text-xs text-slate-400">{inspectingDeposit.id}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">User UID:</span>
                <span className="font-mono font-bold text-slate-100">{inspectingDeposit.uid}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Username / Phone:</span>
                <span className="font-bold text-slate-100">
                  {inspectingDeposit.username} (+91 {inspectingDeposit.phone})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Payment Method:</span>
                <span className="font-bold text-amber-300">
                  {inspectingDeposit.paymentMethod === 'USDT' ? 'USDT (ERC20)' : inspectingDeposit.paymentMethod}
                </span>
              </div>
              {inspectingDeposit.paymentMethod === 'USDT' && (
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Submitted USDT Amount:</span>
                  <span className="font-mono font-black text-base text-teal-300">
                    ${inspectingDeposit.usdtAmount || 0} USDT (ERC20)
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">INR Wallet Credit Amount:</span>
                <span className="font-mono font-black text-base text-emerald-400">
                  ₹{inspectingDeposit.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800 gap-2">
                <span className="text-slate-400 shrink-0">
                  {inspectingDeposit.paymentMethod === 'USDT' ? 'ERC20 TXID Hash:' : '12-Digit UTR Reference:'}
                </span>
                <button
                  type="button"
                  onClick={() => copyText(inspectingDeposit.referenceId)}
                  className="font-mono font-bold text-amber-400 flex items-center space-x-1 hover:underline break-all text-right"
                >
                  <span>{inspectingDeposit.referenceId}</span>
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Submitted At:</span>
                <span className="text-slate-300">{new Date(inspectingDeposit.submittedAt).toLocaleString()}</span>
              </div>

              {/* Master Admin INR Conversion Box (Allows Admin to set exact INR amount to credit to user's wallet) */}
              {inspectingDeposit.status === 'pending' && (
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2 mt-2">
                  <label className="text-[11px] font-bold text-emerald-400 block">
                    {inspectingDeposit.paymentMethod === 'USDT'
                      ? `Convert $${inspectingDeposit.usdtAmount || 0} USDT to INR (₹) for User Wallet:`
                      : 'INR (₹) Amount to Credit to User Wallet:'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={customInrCredit}
                    onChange={(e) => setCustomInrCredit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono font-black text-base text-amber-300 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    This exact ₹ INR amount will be added to {inspectingDeposit.username}&apos;s wallet upon clicking Approve.
                  </span>
                </div>
              )}

              {inspectingDeposit.adminNote && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                  <strong>Note:</strong> {inspectingDeposit.adminNote}
                </div>
              )}
            </div>

            {inspectingDeposit.status === 'pending' ? (
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleApproveDeposit(inspectingDeposit, Number(customInrCredit))}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Approve ₹{Number(customInrCredit) || inspectingDeposit.amount}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectingDeposit(inspectingDeposit);
                    setInspectingDeposit(null);
                  }}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingDeposit(null)}
                  className="py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setInspectingDeposit(null)}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW WITHDRAWAL DETAILS MODAL */}
      {inspectingWithdrawal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-slate-100 text-base">Withdrawal Payout Details</h4>
              <span className="font-mono text-xs text-slate-400">{inspectingWithdrawal.id}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">User UID:</span>
                <span className="font-mono font-bold text-slate-100">{inspectingWithdrawal.uid}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Username / Phone:</span>
                <span className="font-bold text-slate-100">
                  {inspectingWithdrawal.username} (+91 {inspectingWithdrawal.phone})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Payout Amount (INR Deducted):</span>
                <span className="font-mono font-black text-base text-amber-400">
                  ₹{inspectingWithdrawal.amount.toLocaleString('en-IN')}
                </span>
              </div>
              {inspectingWithdrawal.usdtAmount && (
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">USDT (ERC20) Payout Amount:</span>
                  <span className="font-mono font-black text-base text-teal-300">
                    ${inspectingWithdrawal.usdtAmount} USDT
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Method:</span>
                <span className="font-bold text-slate-100">{inspectingWithdrawal.payoutMethod}</span>
              </div>
              {inspectingWithdrawal.accountDetails.usdtAddress && (
                <div className="py-1.5 border-b border-slate-800 space-y-1">
                  <span className="text-slate-400 block">Receiving USDT (ERC20) Address:</span>
                  <button
                    type="button"
                    onClick={() => copyText(inspectingWithdrawal.accountDetails.usdtAddress || '')}
                    className="font-mono font-bold text-teal-300 flex items-center justify-between w-full p-2 rounded-lg bg-slate-950 border border-teal-500/30 break-all text-left"
                  >
                    <span>{inspectingWithdrawal.accountDetails.usdtAddress}</span>
                    <Copy className="w-3.5 h-3.5 shrink-0 ml-2" />
                  </button>
                </div>
              )}
              {inspectingWithdrawal.accountDetails.upiId && (
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Receiving UPI ID:</span>
                  <button
                    type="button"
                    onClick={() => copyText(inspectingWithdrawal.accountDetails.upiId || '')}
                    className="font-mono font-bold text-amber-400 flex items-center space-x-1"
                  >
                    <span>{inspectingWithdrawal.accountDetails.upiId}</span>
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {(inspectingWithdrawal.accountDetails.accountNumber || inspectingWithdrawal.accountDetails.bankName) && (
                <>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Holder / Bank:</span>
                    <span className="font-bold text-slate-100">
                      {inspectingWithdrawal.accountDetails.holderName || inspectingWithdrawal.accountDetails.bankName || 'Bank'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Account Number:</span>
                    <span className="font-mono font-bold text-slate-100">
                      {inspectingWithdrawal.accountDetails.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">IFSC Code:</span>
                    <span className="font-mono font-bold text-slate-100">{inspectingWithdrawal.accountDetails.ifscCode}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Requested At:</span>
                <span className="text-slate-300">{new Date(inspectingWithdrawal.requestedAt).toLocaleString()}</span>
              </div>
            </div>

            {inspectingWithdrawal.status === 'pending' ? (
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleApproveWithdrawal(inspectingWithdrawal)}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectingWithdrawal(inspectingWithdrawal);
                    setInspectingWithdrawal(null);
                  }}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingWithdrawal(null)}
                  className="py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setInspectingWithdrawal(null)}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* REJECT DEPOSIT REASON MODAL */}
      {rejectingDeposit && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmRejectDeposit}
            className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 text-slate-100"
          >
            <h4 className="font-bold text-slate-100 text-base">Reject Deposit Request</h4>
            <p className="text-xs text-slate-400">
              Rejecting ₹{rejectingDeposit.amount.toLocaleString('en-IN')} from{' '}
              <strong className="text-slate-100">{rejectingDeposit.uid}</strong>
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Rejection Reason</label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. UTR mismatch / Payment not received"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectingDeposit(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Reject
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REJECT WITHDRAWAL REASON MODAL */}
      {rejectingWithdrawal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmRejectWithdrawal}
            className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 text-slate-100"
          >
            <h4 className="font-bold text-slate-100 text-base">Reject Withdrawal & Refund</h4>
            <p className="text-xs text-slate-400">
              ₹{rejectingWithdrawal.amount.toLocaleString('en-IN')} will be atomically refunded to{' '}
              <strong className="text-slate-100">{rejectingWithdrawal.uid}</strong> wallet.
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Reason for Rejection</label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Invalid IFSC / UPI ID"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectingWithdrawal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Reject & Refund
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
