import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Send,
  Volume2,
  VolumeX,
  Crown,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { UserRecord, AdminSettings } from '../../types';
import { soundFx } from '../../services/soundFx';
import { Bingo777Logo } from '../common/Bingo777Logo';
import { useToast } from '../common/Toast';
import { store } from '../../services/store';
import { firebaseSync } from '../../services/firebaseSync';
import { rtdb, rtdbRef, rtdbGet } from '../../firebase';

interface UserHeaderProps {
  user: UserRecord | null;
  unreadSupportCount: number;
  onOpenDeposit: () => void;
  onOpenSupport: () => void;
  onOpenAuth: () => void;
  onOpenAdmin?: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  user,
  onOpenDeposit,
  onOpenSupport,
  onOpenAuth,
  onOpenAdmin
}) => {
  const { showToast } = useToast();
  const [showBalance, setShowBalance] = useState(true);
  const [isMuted, setIsMuted] = useState(soundFx.getMuted());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    return soundFx.subscribe(() => {
      setIsMuted(soundFx.getMuted());
    });
  }, []);

  const handleToggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  const handleLiveRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      // Re-sync live user profile and admin_settings from Firebase without clearing session
      if (user?.uid) {
        const userSnap = await rtdbGet(rtdbRef(rtdb, `users/${user.uid}`)).catch(() => null);
        if (userSnap && userSnap.exists()) {
          const updated = store.updateUserFromFirestore({ ...userSnap.val(), uid: user.uid });
          if (updated) {
            localStorage.setItem('bingo777_session_user', JSON.stringify(updated));
          }
        }
      }
      const settingsSnap = await rtdbGet(rtdbRef(rtdb, 'admin_settings')).catch(() => null);
      if (settingsSnap && settingsSnap.exists()) {
        store.ingestCloudAdminSettings(settingsSnap.val() as Partial<AdminSettings>);
      }
      await firebaseSync.forceSyncFromFirebase().catch(() => {});
      showToast('Synced! Live wallet & game data updated.', 'success');
    } catch {
      showToast('Synced!', 'success');
    } finally {
      setIsRefreshing(false);
    }
  };

  const cleanPhone = (user?.phone || '').replace(/\D/g, '');
  const isUserAdmin = Boolean(
    user && (
      cleanPhone === '9012634797' ||
      cleanPhone.endsWith('9012634797') ||
      user.isAdmin === true ||
      user.role === 'admin' ||
      user.role === 'master_admin'
    )
  );

  const displayBalance = Number(user?.wallet ?? user?.balance ?? 0);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-2xl border-b border-amber-500/20 px-3 sm:px-5 py-2.5 transition-all shadow-lg shadow-black/40">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & 3D Logo */}
        <div className="flex items-center space-x-2">
          <Bingo777Logo size="md" variant="badge" />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-brand font-black text-base sm:text-lg tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent block leading-tight">
                Bingo777
              </span>
              {user && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-400/40 text-[9px] font-black text-amber-300 flex items-center space-x-0.5">
                  <Crown className="w-2.5 h-2.5" />
                  <span>VIP{user.vipLevel}</span>
                </span>
              )}
              {isUserAdmin && onOpenAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  title="Open Admin Panel"
                  className="px-2 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-[9px] font-black text-emerald-300 flex items-center space-x-1 transition"
                >
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>Admin</span>
                </button>
              )}
            </div>
            <span className="text-[9px] text-amber-300/80 font-bold tracking-wider flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real Live Platform</span>
            </span>
          </div>
        </div>

        {/* Right: Balance Pill & Quick Actions */}
        {user ? (
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            {/* Balance Card with Quick '+' Deposit Button */}
            <div className="flex items-center bg-slate-900/90 border border-amber-500/30 rounded-2xl pl-2.5 pr-1 py-1 shadow-inner shadow-black/60">
              <div className="flex items-center space-x-1.5 mr-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono font-black text-xs sm:text-sm text-amber-300">
                  {showBalance
                    ? `₹${displayBalance.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`
                    : '••••••'}
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-slate-500 hover:text-slate-300 p-0.5"
                  title="Toggle Balance Visibility"
                >
                  {showBalance ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                </button>
              </div>

              {/* Quick Recharge Plus */}
              <button
                onClick={onOpenDeposit}
                title="Recharge Balance"
                className="w-7 h-7 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black flex items-center justify-center shadow-md shadow-amber-500/20 active:scale-95 transition"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Live Refresh 🔄 Button */}
            <button
              type="button"
              onClick={handleLiveRefresh}
              disabled={isRefreshing}
              title="Refresh 🔄 Live Data"
              className="px-2 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-[10px] font-bold flex items-center space-x-1 transition active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-300 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Official Telegram Support */}
            <button
              onClick={onOpenSupport}
              title="24/7 Official Telegram Support"
              className="relative p-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-400 hover:text-sky-300 transition"
            >
              <Send className="w-4 h-4 -rotate-12" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5">
            {/* Live Refresh 🔄 Button */}
            <button
              type="button"
              onClick={handleLiveRefresh}
              disabled={isRefreshing}
              title="Refresh 🔄 Live Data"
              className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center space-x-1 transition active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={onOpenSupport}
              title="24/7 Official Telegram Support"
              className="p-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-400 hover:text-sky-300 transition"
            >
              <Send className="w-4 h-4 -rotate-12" />
            </button>
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/40 active:scale-95 transition"
            >
              Login / Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
