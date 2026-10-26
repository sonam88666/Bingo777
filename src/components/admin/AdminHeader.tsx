import React from 'react';
import { Shield, LogOut, Bell } from 'lucide-react';
import { store } from '../../services/store';
import { Bingo777Logo } from '../common/Bingo777Logo';

interface AdminHeaderProps {
  adminId: string;
  onLogout: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminId,
  onLogout,
  onNavigateTab
}) => {
  const deposits = store.getDeposits();
  const withdrawals = store.getWithdrawals();
  const pendingCount =
    deposits.filter((d) => d.status === 'pending').length +
    withdrawals.filter((w) => w.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/30 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bingo777Logo size="sm" variant="badge" />
          <div>
            <span className="font-black text-sm tracking-tight text-slate-100">Bingo777 Master Console</span>
            <span className="block text-[10px] text-amber-400 font-bold">{adminId}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('deposits')}
              className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center space-x-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
