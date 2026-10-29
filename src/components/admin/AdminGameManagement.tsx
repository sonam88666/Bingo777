import React, { useState } from 'react';
import {
  Gamepad2,
  Sliders,
  Plane
} from 'lucide-react';
import { AdminGameSwitchboard } from './AdminGameSwitchboard';
import { AdminLiveBets } from './AdminLiveBets';
import { AdminAviatorControl } from './AdminAviatorControl';

interface AdminGameManagementProps {
  adminId?: string;
  masterToken?: string;
}

export const AdminGameManagement: React.FC<AdminGameManagementProps> = ({
  adminId = 'MasterAdmin_01',
  masterToken
}) => {
  const [subTab, setSubTab] = useState<'switchboard' | 'wingo_engine' | 'aviator_analytics'>('aviator_analytics');

  return (
    <div className="space-y-4">
      {/* Sub-navigation bar */}
      <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-1.5 shadow-xl">
        <button
          type="button"
          onClick={() => setSubTab('switchboard')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            subTab === 'switchboard'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>All Games Switchboard</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('wingo_engine')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            subTab === 'wingo_engine'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Win Go Period Engine</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('aviator_analytics')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            subTab === 'aviator_analytics'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>Aviator Master Control Console</span>
        </button>
      </div>

      {/* Content based on selected subTab */}
      {subTab === 'switchboard' && (
        <AdminGameSwitchboard adminId={adminId} masterToken={masterToken} showTitle={false} />
      )}

      {subTab === 'wingo_engine' && (
        <AdminLiveBets adminId={adminId} initialView="management" />
      )}

      {subTab === 'aviator_analytics' && (
        <div className="space-y-4">
          {/* Single Unified Firebase Real-Time Aviator Crash Engine Control (/admin_settings/aviator) */}
          <AdminAviatorControl adminId={adminId} />
        </div>
      )}
    </div>
  );
};
