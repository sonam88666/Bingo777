import React, { useState, useEffect } from 'react';
import {
  Send,
  ExternalLink,
  CheckCircle2,
  Megaphone,
  Bell,
  Copy,
  Save,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { TelegramSupportConfig } from '../../types';
import { store } from '../../services/store';
import { apiClient } from '../../services/apiClient';
import { rtdb, rtdbRef, rtdbSet, rtdbOnValue } from '../../firebase';
import { useToast } from '../common/Toast';
import { resolveTelegramLink } from '../common/TelegramFloatingWidget';

interface AdminTelegramSupportProps {
  adminId: string;
}

export const AdminTelegramSupport: React.FC<AdminTelegramSupportProps> = ({ adminId }) => {
  const { showToast } = useToast();

  const [config, setConfig] = useState<TelegramSupportConfig>(() => {
    const s = store.getAdminSettings();
    return (
      s.telegram_support || {
        enabled: true,
        supportTitle: '24/7 Official Support',
        telegramUsernameOrLink: s.supportTelegram
          ? resolveTelegramLink(s.supportTelegram)
          : 'https://t.me/colourWinAdmin',
        buttonText: 'Chat on Telegram'
      }
    );
  });

  const [isSaving, setIsSaving] = useState(false);

  // Marquee & Broadcast Notification state
  const currentSettings = store.getAdminSettings();
  const [announcementBanner, setAnnouncementBanner] = useState<string>(
    currentSettings.announcementText || currentSettings.announcement || ''
  );
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | string>('all');

  const usersMap = store.getUsers();
  const usersList = Object.values(usersMap);

  useEffect(() => {
    let unsubRtdb: (() => void) | null = null;
    try {
      const tgRef = rtdbRef(rtdb, 'admin_settings/telegram_support');
      unsubRtdb = rtdbOnValue(
        tgRef,
        (snap) => {
          if (snap.exists()) {
            const val = snap.val();
            if (val && typeof val === 'object') {
              setConfig({
                enabled: val.enabled !== undefined ? Boolean(val.enabled) : true,
                supportTitle: val.supportTitle || '24/7 Official Support',
                telegramUsernameOrLink:
                  val.telegramUsernameOrLink || 'https://t.me/colourWinAdmin',
                buttonText: val.buttonText || 'Chat on Telegram'
              });
            }
          }
        },
        () => {}
      );
    } catch {}

    return () => {
      if (unsubRtdb) unsubRtdb();
    };
  }, []);

  const handleSaveTelegramConfig = async (
    override?: Partial<TelegramSupportConfig>,
    e?: React.FormEvent
  ) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const nextConfig: TelegramSupportConfig = {
        ...config,
        ...(override || {}),
        updatedAt: Date.now(),
        updatedBy: adminId
      };

      setConfig(nextConfig);

      // Write directly to /admin_settings/telegram_support in Firebase RTDB
      await rtdbSet(rtdbRef(rtdb, 'admin_settings/telegram_support'), nextConfig);

      // Also sync supportTelegram string and store adminSettings
      store.updateAdminSettings(
        {
          telegram_support: nextConfig,
          supportTelegram: nextConfig.telegramUsernameOrLink
        },
        adminId
      );

      await apiClient
        .updateSettings(
          {
            telegram_support: nextConfig,
            supportTelegram: nextConfig.telegramUsernameOrLink
          },
          adminId
        )
        .catch(() => {});

      store.logAudit({
        actor: adminId,
        category: 'SETTINGS',
        action: 'TELEGRAM_SUPPORT_UPDATED',
        details: `Updated /admin_settings/telegram_support — Enabled: ${nextConfig.enabled}, Title: "${nextConfig.supportTitle}", Link: "${nextConfig.telegramUsernameOrLink}", Button: "${nextConfig.buttonText}"`,
        outcome: 'SUCCESS'
      });

      showToast(
        'Telegram Support configuration saved & pushed live to all user screens!',
        'success'
      );
    } catch (err) {
      console.error('Failed to save Telegram support config:', err);
      showToast('Failed to save Telegram Support configuration.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    store.updateAdminSettings(
      { announcementText: announcementBanner, announcement: announcementBanner },
      adminId
    );
    await apiClient
      .updateSettings({ announcementText: announcementBanner, announcement: announcementBanner }, adminId)
      .catch(() => {});
    showToast('App marquee announcement updated in real time!', 'success');
  };

  const handleSendPushNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      showToast('Please enter a notification message', 'error');
      return;
    }

    if (broadcastTarget === 'all') {
      usersList.forEach((u) => {
        store.addUserNotification({
          uid: u.uid,
          type: 'system_alert',
          title: 'Official Platform Notice',
          message: broadcastMessage.trim(),
          statusBadge: 'info'
        });
      });
      store.logAudit({
        actor: adminId,
        category: 'SETTINGS',
        action: 'BROADCAST_NOTIFICATION_SENT',
        details: `Sent push notification to all ${usersList.length} users: "${broadcastMessage.trim()}"`,
        outcome: 'SUCCESS'
      });
      showToast(`Broadcast notification delivered to all ${usersList.length} players!`, 'success');
    } else {
      const targetUser = usersMap[broadcastTarget];
      if (targetUser) {
        store.addUserNotification({
          uid: targetUser.uid,
          type: 'system_alert',
          title: 'Direct Admin Alert',
          message: broadcastMessage.trim(),
          statusBadge: 'info'
        });
        showToast(`Notification sent to ${targetUser.username} (${targetUser.uid})`, 'success');
      }
    }
    setBroadcastMessage('');
  };

  const resolvedPreviewUrl = resolveTelegramLink(config.telegramUsernameOrLink);

  return (
    <div className="space-y-5">
      {/* 1. OFFICIAL TELEGRAM SUPPORT MANAGER (/admin_settings/telegram_support) */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-sky-500/40 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-sky-300 via-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-500/30 border border-sky-200/40">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-brand font-black text-sm sm:text-base text-white">
                  3D Telegram Support & Floating Widget Manager
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-sky-500/30">
                  /admin_settings/telegram_support
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Controls the 3D floating Telegram icon and official support redirect card across all player screens
              </p>
            </div>
          </div>

          {/* Live Enable/Disable Toggle */}
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                config.enabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}
            >
              {config.enabled ? '● WIDGET ACTIVE' : '● WIDGET HIDDEN'}
            </span>

            <button
              type="button"
              onClick={() => handleSaveTelegramConfig({ enabled: !config.enabled })}
              disabled={isSaving}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.enabled ? 'bg-sky-500' : 'bg-slate-700'
              }`}
              title={config.enabled ? 'Disable 3D Telegram Widget' : 'Enable 3D Telegram Widget'}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                  config.enabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Form & Live 3D Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Form Inputs */}
          <form
            onSubmit={(e) => handleSaveTelegramConfig(undefined, e)}
            className="lg:col-span-7 space-y-4 text-xs"
          >
            <div>
              <label className="text-slate-300 font-bold block mb-1.5">
                Support Title (<code className="text-sky-400">supportTitle</code>) *
              </label>
              <input
                type="text"
                value={config.supportTitle}
                onChange={(e) => setConfig({ ...config, supportTitle: e.target.value })}
                placeholder="24/7 Official Support"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1.5">
                Telegram Username or Link (<code className="text-sky-400">telegramUsernameOrLink</code>) *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.telegramUsernameOrLink}
                  onChange={(e) =>
                    setConfig({ ...config, telegramUsernameOrLink: e.target.value.trim() })
                  }
                  placeholder="https://t.me/your_support_username or @username"
                  required
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-sky-300 font-mono focus:outline-none focus:border-sky-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(resolvedPreviewUrl);
                    showToast('Copied resolved Telegram link!', 'info');
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 shrink-0 transition"
                  title="Copy Link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Resolves to:{' '}
                <a
                  href={resolvedPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 underline font-mono"
                >
                  {resolvedPreviewUrl}
                </a>
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1.5">
                Action Button Text (<code className="text-sky-400">buttonText</code>) *
              </label>
              <input
                type="text"
                value={config.buttonText}
                onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
                placeholder="Chat on Telegram"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-sky-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 active:scale-95 transition"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Syncing to Firebase RTDB...' : 'Save Telegram Support Settings'}</span>
            </button>
          </form>

          {/* Right: Live 3D Widget & Redirect Card Preview */}
          <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live User App Preview</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Real-Time Sync</span>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 py-2">
              {/* 3D Icon Preview */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <span className="absolute -inset-1 rounded-full bg-sky-400/40 blur-md animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-sky-300 via-sky-500 to-blue-700 shadow-[0_10px_25px_-4px_rgba(14,165,233,0.75),inset_0_-4px_8px_rgba(3,105,161,0.9),inset_0_4px_8px_rgba(255,255,255,0.65)] border border-sky-200/50 flex items-center justify-center">
                  <div className="absolute top-1 left-2.5 right-2.5 h-5 rounded-full bg-gradient-to-b from-white/70 via-white/25 to-transparent pointer-events-none" />
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(3,105,161,0.85)] -translate-x-0.5 translate-y-0.5"
                  >
                    <path
                      d="M21.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <div className="font-brand font-black text-sm text-white">
                  {config.supportTitle || '24/7 Official Support'}
                </div>
                <div className="text-[11px] text-sky-400 font-mono truncate max-w-[220px] mt-0.5">
                  {resolvedPreviewUrl}
                </div>
              </div>

              <a
                href={resolvedPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 text-white font-black text-xs shadow-md flex items-center space-x-1.5 hover:opacity-95 transition"
              >
                <span>{config.buttonText || 'Chat on Telegram'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] text-slate-400 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Old in-app live chat boxes are disabled. Players are directed straight to your official Telegram.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. APP MARQUEE & BROADCAST NOTIFICATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* App Marquee Banner Configuration */}
        <form
          onSubmit={handleSaveAnnouncement}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-slate-100 text-sm">User App Live Marquee Announcement</h4>
            </div>
            <textarea
              rows={3}
              value={announcementBanner}
              onChange={(e) => setAnnouncementBanner(e.target.value)}
              placeholder="Enter live scrolling announcement banner text..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-sm transition"
          >
            Update Live App Banner
          </button>
        </form>

        {/* Broadcast Notification Dispatcher */}
        <form
          onSubmit={handleSendPushNotification}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
        >
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-slate-100 text-sm">Send In-App Toast Alert</h4>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Recipient Target</label>
            <select
              value={broadcastTarget}
              onChange={(e) => setBroadcastTarget(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Registered Users ({usersList.length} Players)</option>
              {usersList.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.username} ({u.uid}) — {u.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Alert Message</label>
            <input
              type="text"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Type official alert or bonus announcement..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Alert</span>
          </button>
        </form>
      </div>
    </div>
  );
};
