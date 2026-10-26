import React, { useState } from 'react';
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  Download,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { store } from '../../services/store';
import { ReconciliationReport } from '../../types';
import { useToast } from '../common/Toast';

interface AdminTransactionsProps {
  adminId: string;
}

export const AdminTransactions: React.FC<AdminTransactionsProps> = ({ adminId }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit' | 'deposit' | 'withdrawal' | 'bet_placement' | 'game_payout'>('all');
  const [onlyRealUsers, setOnlyRealUsers] = useState<boolean>(true);
  const [auditReports, setAuditReports] = useState<ReconciliationReport[] | null>(null);

  const allTransactions = store.getAllTransactionsFlat();
  const usersMap = store.getUsers();

  const isDemoTx = (tx: typeof allTransactions[0]) => {
    const user = usersMap[tx.uid];
    return (
      Boolean(tx.metadata?.isDemo || tx.metadata?.demo) ||
      /demo|test_user|mock|sample/i.test(tx.description || '') ||
      /demo|mock|test/i.test(tx.referenceId || '') ||
      /demo|test/i.test(tx.uid || '') ||
      !user
    );
  };

  const demoTxCount = allTransactions.filter(isDemoTx).length;

  const filteredTx = allTransactions.filter((tx) => {
    const user = usersMap[tx.uid];

    // Filter demo transactions if onlyRealUsers is true
    if (onlyRealUsers && isDemoTx(tx)) {
      return false;
    }

    const matchSearch =
      searchTerm === '' ||
      tx.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.referenceId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user?.username || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;
    if (filterType === 'all') return true;
    if (filterType === 'credit' || filterType === 'debit') return tx.category === filterType;
    return tx.type === filterType;
  });

  const totalCredits = filteredTx
    .filter((t) => t.category === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = filteredTx
    .filter((t) => t.category === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleCleanDemoTransactions = () => {
    if (!window.confirm('Kya aap sure hain ki sabhi demo/mock/test transactions ko permanently delete karna hai? Real users ke transactions 100% safe rahenge.')) {
      return;
    }
    const res = store.clearDemoTransactions(adminId);
    showToast(res.message, 'success');
  };

  const handleRunReconciliation = () => {
    store.backupDataBeforeMigration();
    const reports = store.reconcileAllUsers();
    setAuditReports(reports);
    showToast(`Audited ${reports.length} user wallet ledgers`, 'info');
  };

  const handleReconcileSingle = (uid: string) => {
    const res = store.forceReconcileBalance(uid, adminId);
    if (res.success) {
      setAuditReports(store.reconcileAllUsers());
      showToast(`Reconciled wallet balance for ${uid}`, 'success');
    } else {
      showToast(res.error || 'Reconciliation failed', 'error');
    }
  };

  const handleExportCsv = () => {
    const csv = store.exportTransactionsCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bingo777_wallet_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Wallet ledger CSV downloaded', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Summary Header Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400 font-semibold block">Total Ledger Entries</span>
          <span className="font-mono font-black text-xl text-slate-100 tabular-nums mt-1 block">
            {filteredTx.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xl">
          <span className="text-xs text-slate-400 font-semibold block">Verified Credits (+)</span>
          <span className="font-mono font-black text-xl text-emerald-400 tabular-nums mt-1 block">
            ₹{totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-900/90 border border-rose-500/30 shadow-xl">
          <span className="text-xs text-slate-400 font-semibold block">Verified Debits (-)</span>
          <span className="font-mono font-black text-xl text-rose-400 tabular-nums mt-1 block">
            ₹{totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Search & Reconciliation Toolbar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by UID, username, transaction ID, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCleanDemoTransactions}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center space-x-1.5 transition whitespace-nowrap"
              title="Purge all demo/mock/test transactions so real ledger stays clean"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clean Demo Transactions {demoTxCount > 0 ? `(${demoTxCount})` : ''}</span>
            </button>
            <button
              type="button"
              onClick={handleRunReconciliation}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition whitespace-nowrap"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Audit Balances</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs flex items-center space-x-1.5 transition whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <div className="flex gap-1.5 shrink-0">
            {([
              { id: 'all', label: 'All Entries' },
              { id: 'credit', label: 'Credits (+)' },
              { id: 'debit', label: 'Debits (-)' },
              { id: 'deposit', label: 'Deposits' },
              { id: 'withdrawal', label: 'Withdrawals' },
              { id: 'bet_placement', label: 'Bets' },
              { id: 'game_payout', label: 'Winnings' }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  filterType === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOnlyRealUsers(!onlyRealUsers)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
              onlyRealUsers
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{onlyRealUsers ? 'Real Ledger Only ✓' : 'Showing All'}</span>
          </button>
        </div>
      </div>

      {/* Reconciliation Report Drawer if active */}
      {auditReports && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-slate-100 text-xs">
                Wallet vs. Ledger Reconciliation Report ({auditReports.filter((r) => r.isMatch).length}/{auditReports.length} Matched)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setAuditReports(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {auditReports.map((r) => (
              <div
                key={r.uid}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-100">{r.username}</span>{' '}
                  <span className="font-mono text-slate-400">({r.uid})</span>
                  <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                    Wallet: ₹{r.currentBalance.toFixed(2)} · Calculated Ledger: ₹{r.calculatedBalance.toFixed(2)}
                  </div>
                </div>
                {r.isMatch ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleReconcileSingle(r.uid)}
                    className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Fix Diff</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filteredTx.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-slate-400 text-xs">
            No wallet transactions match the current filter.
          </div>
        ) : (
          filteredTx.slice(0, 80).map((tx) => {
            const u = usersMap[tx.uid];
            const isCredit = tx.category === 'credit';
            return (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isCredit
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-100 text-xs sm:text-sm">
                        {u ? `${u.username} (${tx.uid})` : tx.uid}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                          isCredit
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {tx.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{tx.description}</p>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 tabular-nums">
                      {new Date(tx.timestamp).toLocaleString()} · ID: {tx.id}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 tabular-nums">
                  <div
                    className={`font-mono font-black text-sm sm:text-base ${
                      isCredit ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    ₹{tx.balanceBefore.toFixed(0)} &rarr; ₹{tx.balanceAfter.toFixed(0)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
