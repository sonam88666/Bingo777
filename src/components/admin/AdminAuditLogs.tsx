import React, { useState } from 'react';
import {
  ShieldCheck,
  Search
} from 'lucide-react';
import { store } from '../../services/store';

export const AdminAuditLogs: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const logs = store.getAuditLogs();

  const categories = ['ALL', 'AUTH', 'DEVICE', 'BALANCE', 'GAME', 'FINANCIAL', 'FEATURE', 'GIFT', 'SYSTEM'];

  const filtered = logs.filter((l) => {
    const matchCat = filterCategory === 'ALL' || l.category === filterCategory;
    const matchSearch =
      searchTerm === '' ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.targetUser && l.targetUser.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.reason && l.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Search & Category Filter Card */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Immutable Security & Financial Audit Trail</h3>
              <p className="text-xs text-slate-400">
                Records admin identity, action, affected record, reason, timestamp & outcome ({filtered.length} logs)
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search actor, UID, action..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterCategory === c
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Cards List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-slate-400 text-xs">
            No audit records found matching your filter.
          </div>
        ) : (
          filtered.slice(0, 80).map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">
                    {log.category}
                  </span>
                  <span className="font-mono font-black text-slate-100">{log.action}</span>
                  {log.outcome && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                      {log.outcome}
                    </span>
                  )}
                </div>
                <p className="text-slate-300">{log.details}</p>
                {log.reason && (
                  <p className="text-[11px] text-slate-400">
                    Reason: <span className="font-semibold text-amber-300">{log.reason}</span>
                  </p>
                )}
              </div>

              <div className="sm:text-right shrink-0 space-y-0.5 text-[11px] text-slate-400 font-mono tabular-nums">
                <div>Actor: <strong className="text-amber-400">{log.actor}</strong></div>
                {log.targetUser && <div>Target: {log.targetUser}</div>}
                <div>{new Date(log.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
