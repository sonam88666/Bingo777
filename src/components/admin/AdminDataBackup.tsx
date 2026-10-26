import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  ShieldCheck,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';

interface AdminDataBackupProps {
  adminId: string;
}

export const AdminDataBackup: React.FC<AdminDataBackupProps> = ({ adminId }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [lastBackupTimestamp, setLastBackupTimestamp] = useState<string | null>(
    localStorage.getItem('bingo777_backup_snapshot') ? 'Saved in Local & Firebase Storage' : null
  );

  const usersCount = Object.keys(store.getUsers()).length;
  const txCount = store.getAllTransactionsFlat().length;
  const depositsCount = store.getDeposits().length;
  const withdrawalsCount = store.getWithdrawals().length;
  const deletedUsers = Object.values(store.getDeletedUsersBackup());
  const deletedFeatures = Object.values(store.getDeletedFeaturesBackup());

  const handleCreateInstantSnapshot = () => {
    store.backupDataBeforeMigration();
    setLastBackupTimestamp(new Date().toLocaleString());
    showToast('Full non-destructive database snapshot created!', 'success');
  };

  const handleExportFullJson = () => {
    const json = store.exportFullDatabaseJson(adminId);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bingo777_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Full JSON database backup downloaded', 'success');
  };

  const handleExportLedgerCsv = () => {
    const csv = store.exportTransactionsCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bingo777_ledger_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Transactions CSV exported', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content === 'string') {
        setImportJsonText(content);
        showToast(`Loaded backup file "${file.name}" — click Restore / Merge to apply`, 'info');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) {
      showToast('Please upload or paste a valid JSON backup first', 'error');
      return;
    }
    const res = store.importDatabaseJson(importJsonText, adminId);
    if (res.success) {
      showToast(
        `Safely merged ${res.restoredUsers} users and ${res.restoredTransactions} ledger transactions!`,
        'success'
      );
      setImportJsonText('');
    } else {
      showToast(res.error || 'Import failed', 'error');
    }
  };

  const handleRestoreUser = (uid: string) => {
    const res = store.restoreDeletedUser(uid, adminId);
    if (res.success) {
      showToast(`Restored user ${uid} with intact wallet & ledger!`, 'success');
    } else {
      showToast(res.error || 'Could not restore user', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Database Health Overview */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Database Export, Import & Safe Restore</h3>
              <p className="text-xs text-slate-400">
                Non-destructive backups preserve all user wallets, transactions & audit trails
              </p>
            </div>
          </div>
          {lastBackupTimestamp && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Snapshot Ready</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-mono font-black text-base text-slate-100">{usersCount}</div>
            <div className="text-[11px] text-slate-400 font-semibold">User Profiles</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-mono font-black text-base text-amber-400">{txCount}</div>
            <div className="text-[11px] text-slate-400 font-semibold">Ledger Records</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-mono font-black text-base text-emerald-400">{depositsCount}</div>
            <div className="text-[11px] text-slate-400 font-semibold">Deposits</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-mono font-black text-base text-purple-400">{withdrawalsCount}</div>
            <div className="text-[11px] text-slate-400 font-semibold">Withdrawals</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleExportFullJson}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Full JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={handleExportLedgerCsv}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Ledger CSV</span>
          </button>

          <button
            type="button"
            onClick={handleCreateInstantSnapshot}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center space-x-2 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Create Local Snapshot</span>
          </button>
        </div>
      </div>

      {/* Non-Destructive Import / Restore Card */}
      <form
        onSubmit={handleExecuteImport}
        className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-100 text-sm">Import & Merge Backup JSON</h4>
            <p className="text-xs text-slate-400">
              Merges missing users, transactions, gift codes, and settings without deleting active accounts
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs flex items-center space-x-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Choose JSON File</span>
          </button>
        </div>

        <textarea
          rows={5}
          value={importJsonText}
          onChange={(e) => setImportJsonText(e.target.value)}
          placeholder='Paste exported JSON backup payload here or click "Choose JSON File"...'
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-amber-500"
        />

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition"
        >
          Safe Merge & Restore Backup Data
        </button>
      </form>

      {/* Deleted Users & Modules Vault */}
      {(deletedUsers.length > 0 || deletedFeatures.length > 0) && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-3">
          <h4 className="font-bold text-amber-400 text-sm">
            Recovery Vault ({deletedUsers.length} Archived Users · {deletedFeatures.length} Archived Modules)
          </h4>
          <div className="space-y-2">
            {deletedUsers.map((u) => (
              <div
                key={u.uid}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-100">{u.username}</span>{' '}
                  <span className="font-mono text-slate-400">({u.uid})</span>
                  <div className="text-[11px] text-slate-400">
                    Preserved Balance: ₹{u.balance.toFixed(2)} · Phone: {u.phone}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestoreUser(u.uid)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore User</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
