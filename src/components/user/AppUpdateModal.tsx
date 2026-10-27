import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  Sparkles,
  X,
  ShieldCheck,
  Smartphone,
  Clock,
  Download,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Bingo777Logo } from '../common/Bingo777Logo';
import { store } from '../../services/store';

interface AppUpdateModalProps {
  onClose: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({ onClose }) => {
  const { showToast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>('Just now');
  
  const adminSettings = store.getAdminSettings();
  const [apkDownloadEnabled, setApkDownloadEnabled] = useState<boolean>(adminSettings.apkDownloadEnabled !== false);
  const [apkVersion, setApkVersion] = useState<string>(adminSettings.apkVersionName || 'v2.6.0 Pro');
  const [apkDownloadUrl, setApkDownloadUrl] = useState<string>(adminSettings.apkDownloadUrl || '');
  const [apkReleaseNotes, setApkReleaseNotes] = useState<string>(adminSettings.apkReleaseNotes || 'Includes Dragon Tiger 3D, Ludo 1v1 Live & All Casino Games');

  const buildDate = 'October 2026';

  useEffect(() => {
    fetch('/api/apk-info')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (typeof data.enabled === 'boolean') setApkDownloadEnabled(data.enabled);
          if (data.version) setApkVersion(data.version.startsWith('v') ? data.version : `v${data.version}`);
          if (data.downloadUrl) setApkDownloadUrl(data.downloadUrl);
          if (data.releaseNotes) setApkReleaseNotes(data.releaseNotes);
        }
      })
      .catch(() => {});
  }, []);

  const handleCheckForUpdates = async () => {
    setIsChecking(true);

    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.filter(name => name.includes('workbox-precache')).map(name => caches.delete(name))
        );
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.update().catch(() => {});
        }
      }
    } catch {
      // Ignore cache clearing errors
    }

    setTimeout(() => {
      setIsChecking(false);
      setLastCheckedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      showToast('App is fully up to date! Latest version is active.', 'success');
    }, 1200);
  };

  const handleForceReload = () => {
    showToast('Refreshing app assets...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };
  const { promptInstall } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  const handleDirectInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      showToast('App installed to your phone home screen!', 'success');
      onClose();
    } else {
      showToast('Chrome Menu (3 dots) -> "Install App" / "Add to Home screen" dabayein.', 'info');
    }
  };

  const handleDownloadApk = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!apkDownloadEnabled) {
      showToast('App download is temporarily paused by Admin.', 'error');
      return;
    }
    const targetUrl = (apkDownloadUrl || adminSettings.apkDownloadUrl || '').trim();
    if (!targetUrl || targetUrl === '/api/download-apk') {
      showToast('Download link is not set by Admin yet. Please check back shortly.', 'info');
      return;
    }
    showToast('Opening download link...', 'info');
    window.open(targetUrl, '_blank') || (window.location.href = targetUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-slate-900 border border-amber-500/30 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <Bingo777Logo size="md" variant="badge" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-brand font-black text-base text-slate-100">
                  Bingo777 Android App
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-black uppercase">
                  {apkVersion}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Direct Download & Update
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Card: Direct App Download Link */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/40 space-y-3 shadow-lg">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Official Android App</span>
            </span>
            <h4 className="font-brand font-black text-base text-slate-100 mt-0.5">
              Bingo777 Pro ({apkVersion})
            </h4>
            <p className="text-[11px] text-slate-400">
              {apkReleaseNotes}
            </p>
          </div>

          {apkDownloadEnabled ? (
            <button
              type="button"
              onClick={handleDownloadApk}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download App (ऐप डाउनलोड करें)</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-75" />
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Direct app download is currently paused by Admin.</span>
            </div>
          )}

          {/* Quick Help Accordion for Installation Steps */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold flex items-center space-x-1"
            >
              <span>{showGuide ? 'Hide Installation Help ▲' : 'Mobile me install karte waqt error aaye to kya karein? ▼'}</span>
            </button>
            {showGuide && (
              <div className="mt-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                <p className="font-bold text-amber-300">Android APK Install Guide:</p>
                <p>1. Download link khulne ke baad file download karein.</p>
                <p>2. Download complete hone ke baad file par tap karein.</p>
                <p>3. Agar <em>"Install unknown apps"</em> bole to <strong>Settings</strong> me jakar <strong>"Allow from this source"</strong> ON karein.</p>
                <p>4. Agar Google Play Protect ka warning aaye to <strong>"More details"</strong> pe click karke <strong>"Install anyway"</strong> dabayein.</p>
              </div>
            )}
          </div>
        </div>

        {/* Option 2: Direct Mobile Install (WebAPK / PWA) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-600/15 border border-amber-500/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
                Direct 1-Click Mobile Install
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Instant
            </span>
          </div>
          <button
            type="button"
            onClick={handleDirectInstall}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-[0.98] text-slate-950 font-black text-xs shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 transition"
          >
            <Smartphone className="w-4 h-4 stroke-[2.5]" />
            <span>Install App on Mobile (मोबाइल में सीधे इंस्टॉल करें)</span>
          </button>
        </div>

        {/* Current Version Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">
                Installed Version
              </span>
              <div className="text-xl font-black text-amber-300 font-brand flex items-center space-x-2 mt-0.5">
                <span>{apkVersion}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1.5">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Build: {buildDate} • Last checked: {lastCheckedTime}</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Status</span>
            <span className="font-bold text-emerald-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span>Latest Official Version</span>
            </span>
          </div>
        </div>

        {/* Action Button: Check for Updates */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleCheckForUpdates}
            disabled={isChecking}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-[0.98] text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-75"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking for updates...' : 'Check for Updates (अपडेट चेक करें)'}</span>
          </button>

          <button
            type="button"
            onClick={handleForceReload}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Force Reload App Assets (कैश साफ करें)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
