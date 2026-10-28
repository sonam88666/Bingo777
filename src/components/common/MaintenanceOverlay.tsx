import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Clock,
  MessageSquare,
  X,
  ChevronDown,
  Info,
  Lock
} from 'lucide-react';
import { store } from '../../services/store';
import { useAdminSettings } from '../../context/AdminSettingsContext';

interface MaintenanceOverlayProps {
  onOpenSupport?: () => void;
}

export const MaintenanceOverlay: React.FC<MaintenanceOverlayProps> = ({ onOpenSupport }) => {
  const { settings, isMaintenanceActiveForUser } = useAdminSettings();
  const [isBypassedForAdmin, setIsBypassedForAdmin] = useState<boolean>(() => !isMaintenanceActiveForUser(store.getActiveSessionUid()));
  const [isModalDismissed, setIsModalDismissed] = useState<boolean>(false);

  useEffect(() => {
    const activeUid = store.getActiveSessionUid();
    setIsBypassedForAdmin(!isMaintenanceActiveForUser(activeUid));
    if (!settings.maintenanceMode) {
      setIsModalDismissed(false);
    }
  }, [settings, isMaintenanceActiveForUser]);

  useEffect(() => {
    return store.subscribe(() => {
      const activeUid = store.getActiveSessionUid();
      setIsBypassedForAdmin(!isMaintenanceActiveForUser(activeUid));
    });
  }, [isMaintenanceActiveForUser]);

  // Selected Admin users (up to 5 Admins or maintenanceBypassUids) bypass Maintenance Mode and use the app normally
  if (!settings.maintenanceMode || isBypassedForAdmin) {
    return null;
  }

  const defaultMsg =
    'Our platform is currently undergoing scheduled maintenance to upgrade system infrastructure. Placing new bets is temporarily paused. All existing wallet balances and transaction histories are 100% secure.';
  const displayMsg = settings.maintenanceMessage || defaultMsg;
  const resumeTime = settings.maintenanceResumeTime || settings.maintenanceEstimatedResumeTime;

  return (
    <>
      {/* 1. PERSISTENT TOP BANNER (Always visible when maintenance is active) */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-white shadow-lg border-b border-amber-400/30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-200" />
            </span>
            <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-200" />
            <span className="truncate">
              <strong>Maintenance Mode:</strong> New bets are paused by Master Admin. Balances are 100% safe.
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsModalDismissed(false)}
              className="px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-white text-[11px] font-bold border border-white/20 transition flex items-center space-x-1"
            >
              <Info className="w-3 h-3" />
              <span className="hidden xs:inline">Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. INFORMATIVE OVERLAY MODAL (Shown on initial load or when Details is clicked) */}
      {!isModalDismissed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-500/50 p-6 shadow-2xl shadow-amber-500/10 text-slate-100 space-y-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="maintenance-title"
          >
            {/* Top Close Button (minimizes to top banner) */}
            <button
              type="button"
              onClick={() => setIsModalDismissed(true)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              aria-label="Minimize"
              title="Minimize to banner"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Icon & Title */}
            <div className="text-center space-y-2 pt-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 shadow-inner">
                <AlertTriangle className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase tracking-wider mb-1">
                  Betting Temporarily Paused
                </span>
                <h2 id="maintenance-title" className="text-xl font-black text-white tracking-tight">
                  System Maintenance in Progress
                </h2>
              </div>
            </div>

            {/* Custom Admin Announcement Message */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-300 leading-relaxed text-center">
              {displayMsg}
            </div>

            {/* Estimated Resumption Time if configured */}
            {resumeTime && (
              <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl py-2 px-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Expected Resumption: <strong>{resumeTime}</strong></span>
              </div>
            )}

            {/* Reassurance Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300 font-medium">Funds 100% Safe</span>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-300 font-medium">Master Admin Active</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setIsModalDismissed(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg transition active:scale-[0.99]"
              >
                Understood, Browse App
              </button>

              {onOpenSupport && (
                <button
                  type="button"
                  onClick={() => {
                    setIsModalDismissed(true);
                    onOpenSupport();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center space-x-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Contact Master Admin / Support</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
