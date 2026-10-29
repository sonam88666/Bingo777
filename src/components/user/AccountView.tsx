import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Gift, 
  MessageSquare, 
  Smartphone, 
  Award, 
  TrendingUp, 
  LogOut, 
  Copy, 
  Key, 
  ChevronRight,
  ShieldAlert,
  Flame,
  Wallet,
  Receipt,
  History,
  Users,
  Volume2,
  VolumeX,
  Volume1,
  Music,
  Sliders,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { UserRecord, DeviceRecord } from '../../types';
import { store } from '../../services/store';
import { firebaseSync } from '../../services/firebaseSync';
import { useToast } from '../common/Toast';
import { soundFx, AudioSettingsState } from '../../services/soundFx';
import { AppUpdateModal } from './AppUpdateModal';

interface AccountViewProps {
  user: UserRecord;
  currentDevice: DeviceRecord | null;
  unreadSupportCount: number;
  onOpenGiftCode: () => void;
  onOpenSupport: () => void;
  onOpenDepositHistory: () => void;
  onOpenGameHistory: () => void;
  onOpenReferral?: () => void;
  onLogout: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  user,
  currentDevice,
  unreadSupportCount,
  onOpenGiftCode,
  onOpenSupport,
  onOpenDepositHistory,
  onOpenGameHistory,
  onOpenReferral,
  onLogout
}) => {
  const { showToast } = useToast();
  const [isForceSyncing, setIsForceSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Live');

  const handleForceRefresh = async () => {
    setIsForceSyncing(true);
    try {
      const res = await firebaseSync.forceSyncFromFirebase();
      if (res.success) {
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        showToast(`Cloud Re-Sync Complete! Balance: ₹${(res.balance ?? user.balance).toFixed(2)}`, 'success');
      } else {
        showToast('Firebase Re-Sync completed.', 'info');
      }
    } catch {
      showToast('Firebase sync failed. Please check network.', 'error');
    } finally {
      setIsForceSyncing(false);
    }
  };

  // Persistent Audio Settings State from browser localStorage
  const [audioSettings, setAudioSettings] = useState<AudioSettingsState>(() => soundFx.getAudioSettings());
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const isAudioSettingsEnabled = store.isFeatureEnabled('audio_settings');
  const isDepositHistoryEnabled = store.isFeatureEnabled('deposit_history');
  const isBetHistoryEnabled = store.isFeatureEnabled('bet_history');
  const isMlmAffiliateEnabled = store.isFeatureEnabled('mlm_affiliate') || store.isFeatureEnabled('referrals');
  const isGiftCodesEnabled = store.isFeatureEnabled('gift_codes');
  const isLiveSupportEnabled = store.isFeatureEnabled('live_support');
  const isAppUpdateModalEnabled = store.isFeatureEnabled('app_update_modal');

  useEffect(() => {
    return soundFx.subscribe(() => {
      setAudioSettings(soundFx.getAudioSettings());
    });
  }, []);

  const handleToggleSfx = () => {
    const next = !audioSettings.sfxEnabled;
    soundFx.setSfxEnabled(next);
    showToast(next ? 'Game sound effects enabled' : 'Game sound effects disabled', 'info');
  };

  const handleToggleBgm = () => {
    const next = !audioSettings.bgmEnabled;
    soundFx.setBgmEnabled(next);
    showToast(next ? 'Background music started' : 'Background music paused', 'info');
  };

  const handleToggleMasterMute = () => {
    const muted = soundFx.toggleMute();
    showToast(muted ? 'All game audio muted' : 'Game audio unmuted', 'info');
  };

  const handleSfxVolumeChange = (vol: number) => {
    soundFx.setSfxVolume(vol);
  };

  const handleBgmVolumeChange = (vol: number) => {
    soundFx.setBgmVolume(vol);
  };



  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied UID to clipboard', 'info');
  };

  const deviceStatus = currentDevice ? currentDevice.status : 'approved';
  const winRate = user.totalBetsCount > 0
    ? Math.round((user.totalWonAmount / (user.totalWonAmount + user.totalLostAmount || 1)) * 100)
    : 0;

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Profile Card Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-3.5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center font-brand font-black text-slate-950 text-xl shadow-lg border border-amber-300">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-brand font-black text-lg text-slate-100 truncate">
                {user.username}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                VIP {user.vipLevel}
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 mt-0.5">
              <span className="font-mono">UID: {user.uid}</span>
              <button onClick={() => handleCopy(user.uid)} className="hover:text-amber-300">
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              +91 {user.phone}
            </div>
          </div>
        </div>

        {/* Device Status Bar if not approved */}
        {deviceStatus !== 'approved' && (
          <div className={`mt-3 p-2.5 rounded-xl border text-xs flex items-center justify-between ${
            deviceStatus === 'pending'
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>Hardware approval: {deviceStatus.toUpperCase()}</span>
            </div>
            <button onClick={onOpenSupport} className="text-[10px] underline font-bold">
              Inquire Support
            </button>
          </div>
        )}
      </div>

      {/* Stats Breakdown Grid */}
      <div className="grid grid-cols-3 gap-2 p-3.5 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl text-center">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Wallet</span>
          <span className="font-mono font-bold text-sm text-amber-300">₹{user.balance.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Won</span>
          <span className="font-mono font-bold text-sm text-emerald-400">₹{user.totalWonAmount}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Est. Return</span>
          <span className="font-mono font-bold text-sm text-sky-400">{winRate}%</span>
        </div>
      </div>

      {/* Persistent Audio Settings Panel */}
      {isAudioSettingsEnabled && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-4 sm:p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-brand font-bold text-slate-100 text-sm">
                    Audio & Sound Settings
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 border border-slate-700 text-slate-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Saved Locally</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Controls game sound effects and background music stored in your browser
                </p>
              </div>
            </div>

            {/* Master Silence Toggle */}
            <button
              type="button"
              onClick={handleToggleMasterMute}
              title={audioSettings.isMuted ? 'Unmute Master Audio' : 'Mute Master Audio'}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 ${
                audioSettings.isMuted
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
              }`}
            >
              {audioSettings.isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sound ON</span>
                </>
              )}
            </button>
          </div>

          {/* Global Mute Alert if Muted */}
          {audioSettings.isMuted && (
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <VolumeX className="w-4 h-4 text-amber-400 shrink-0" />
                <span>All game sounds and music are currently silenced.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.setMasterMuted(false);
                  showToast('Audio unmuted', 'info');
                }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
              >
                Unmute
              </button>
            </div>
          )}

          <div className="space-y-3">
            {/* 1. Game Sound Effects (SFX) Toggle & Slider */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                    audioSettings.sfxEnabled && !audioSettings.isMuted
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200 text-xs">
                        Game Sound Effects (SFX)
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        audioSettings.sfxEnabled
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {audioSettings.sfxEnabled ? 'ACTIVE' : 'MUTED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Countdown ticks, win fanfare, bet chips, dice & card flips
                    </p>
                  </div>
                </div>

                {/* Interactive Toggle Switch */}
                <button
                  type="button"
                  onClick={handleToggleSfx}
                  role="switch"
                  aria-checked={audioSettings.sfxEnabled}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    audioSettings.sfxEnabled ? 'bg-amber-500 shadow-md shadow-amber-500/30' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                      audioSettings.sfxEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* SFX Volume Slider & Test Sound */}
              <div className="flex items-center space-x-3 pt-2 border-t border-slate-800/60">
                <Volume1 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={audioSettings.sfxVolume}
                    onChange={(e) => handleSfxVolumeChange(parseFloat(e.target.value))}
                    disabled={!audioSettings.sfxEnabled}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                  />
                  <span className="text-[10px] font-mono text-slate-400 w-8 text-right font-bold">
                    {Math.round(audioSettings.sfxVolume * 100)}%
                  </span>
                </div>

              </div>
            </div>

            {/* 2. Background Music (BGM) Toggle & Slider */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                    audioSettings.bgmEnabled && !audioSettings.isMuted
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200 text-xs">
                        Background Lounge Music (BGM)
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center space-x-1 ${
                        audioSettings.bgmEnabled && !audioSettings.isMuted
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {audioSettings.bgmEnabled && !audioSettings.isMuted && (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping inline-block" />
                        )}
                        <span>{audioSettings.bgmEnabled ? 'PLAYING' : 'OFF'}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Ambient casino lounge synthesizer chords in real-time
                    </p>
                  </div>
                </div>

                {/* Interactive Toggle Switch */}
                <button
                  type="button"
                  onClick={handleToggleBgm}
                  role="switch"
                  aria-checked={audioSettings.bgmEnabled}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    audioSettings.bgmEnabled ? 'bg-purple-600 shadow-md shadow-purple-600/30' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                      audioSettings.bgmEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* BGM Volume Slider */}
              <div className="flex items-center space-x-3 pt-2 border-t border-slate-800/60">
                <Volume1 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={audioSettings.bgmVolume}
                    onChange={(e) => handleBgmVolumeChange(parseFloat(e.target.value))}
                    disabled={!audioSettings.bgmEnabled}
                    className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                  />
                  <span className="text-[10px] font-mono text-slate-400 w-8 text-right font-bold">
                    {Math.round(audioSettings.bgmVolume * 100)}%
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Local Storage Indicator Footer */}
          <div className="pt-2 text-center">
            <span className="text-[10px] text-slate-500 font-medium">
              Preferences are saved to this device (browser state) and apply across all games.
            </span>
          </div>
        </div>
      )}

      {/* Navigation Options List */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-800/80 text-xs">
        {/* Deposit & Payout History */}
        {isDepositHistoryEnabled && (
          <button
            onClick={onOpenDepositHistory}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-200 group-hover:text-amber-300 block">
                  Deposit & Payout History
                </span>
                <span className="text-[11px] text-slate-500">View AR Pay, UPI-QRpay, and audit records</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition" />
          </button>
        )}

        {/* Bet & Game History */}
        {isBetHistoryEnabled && (
          <button
            onClick={onOpenGameHistory}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-200 group-hover:text-amber-300 block">
                  Bet & Game Order History
                </span>
                <span className="text-[11px] text-slate-500">View Big/Small choices, charts & profit/loss</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition" />
          </button>
        )}

        {/* Refer & Earn + 3-Level MLM Affiliate Commission Program */}
        {isMlmAffiliateEnabled && (
          <button
            onClick={onOpenReferral}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition group bg-indigo-950/20"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-200 group-hover:text-amber-300 block">
                    MLM Affiliate & Refer (₹120 + 3-Tier Commission)
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase">
                    L1 · L2 · L3
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">Earn 1% / 0.5% / 0.25% downline turnover commission & ₹120 bonuses</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition" />
          </button>
        )}

        {/* Redeem Gift Code */}
        {isGiftCodesEnabled && (
          <button
            onClick={onOpenGiftCode}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-200 group-hover:text-amber-300 block">
                  Redeem Gift Code Vouchers
                </span>
                <span className="text-[11px] text-slate-500">Claim promotional coupon bonuses</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition" />
          </button>
        )}

        {/* 24/7 Official Telegram Support */}
        {isLiveSupportEnabled && (
          <button
            onClick={onOpenSupport}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-200 group-hover:text-amber-300">
                    {store.getAdminSettings().telegram_support?.supportTitle || '24/7 Official Telegram Support'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-black text-[9px] uppercase">
                    Telegram
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {store.getAdminSettings().telegram_support?.buttonText || 'Chat on Telegram for instant assistance'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition" />
          </button>
        )}

        {/* Download Android APK & Update Apps Option */}
        {isAppUpdateModalEnabled && (
          <button
            onClick={() => setShowUpdateModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-emerald-950/30 transition group bg-emerald-950/15"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-200 group-hover:text-emerald-300 transition block">
                    Download App & Updates (ऐप डाउनलोड व अपडेट)
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase">
                    Direct Link
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Download official Android application via direct link</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition" />
          </button>
        )}


      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3.5 rounded-2xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/40 text-rose-300 font-bold text-xs flex items-center justify-center space-x-2 transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of Account</span>
      </button>

      {/* App Update Modal */}
      {showUpdateModal && (
        <AppUpdateModal onClose={() => setShowUpdateModal(false)} />
      )}
    </div>
  );
};
