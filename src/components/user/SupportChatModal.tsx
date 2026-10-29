import React, { useState, useEffect } from 'react';
import { ExternalLink, Copy, ShieldCheck, Clock, Sparkles, X } from 'lucide-react';
import { UserRecord, TelegramSupportConfig } from '../../types';
import { store } from '../../services/store';
import { rtdb, rtdbRef, rtdbOnValue } from '../../firebase';
import { useToast } from '../common/Toast';
import { resolveTelegramLink } from '../common/TelegramFloatingWidget';

interface SupportChatModalProps {
  user: UserRecord | null;
  onClose: () => void;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({ user, onClose }) => {
  const { showToast } = useToast();

  const [config, setConfig] = useState<TelegramSupportConfig>(() => {
    const adminSettings = store.getAdminSettings();
    return (
      adminSettings.telegram_support || {
        enabled: true,
        supportTitle: '24/7 Official Support',
        telegramUsernameOrLink: adminSettings.supportTelegram || 'https://t.me/colourWinAdmin',
        buttonText: 'Chat on Telegram'
      }
    );
  });

  useEffect(() => {
    if (user) {
      store.markMessagesAsRead(user.uid);
    }

    const unsubStore = store.subscribe(() => {
      const s = store.getAdminSettings();
      if (s.telegram_support) {
        setConfig(s.telegram_support);
      }
    });

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
                  val.telegramUsernameOrLink ||
                  store.getAdminSettings().supportTelegram ||
                  'https://t.me/colourWinAdmin',
                buttonText: val.buttonText || 'Chat on Telegram'
              });
            }
          }
        },
        () => {}
      );
    } catch {}

    return () => {
      unsubStore();
      if (unsubRtdb) unsubRtdb();
    };
  }, [user?.uid]);

  const telegramUrl = resolveTelegramLink(config.telegramUsernameOrLink);
  const displayHandle = config.telegramUsernameOrLink
    .replace(/^\[|\]\(.*\)$/g, '')
    .replace(/^https?:\/\/(www\.)?t\.me\//i, '@');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(telegramUrl);
    showToast('Official Telegram support link copied to clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-sky-500/30 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Top Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-sky-300 via-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-500/30 border border-sky-200/40">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white -translate-x-0.5">
                  <path
                    d="M21.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full" />
            </div>
            <div>
              <h3 className="font-brand font-black text-sm sm:text-base text-white">
                {config.supportTitle || '24/7 Official Support'}
              </h3>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Verified Official Telegram Desk</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            aria-label="Close Support Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Redirect Card Body */}
        <div className="p-6 text-center space-y-5 relative z-10">
          {/* 3D Glossy Telegram Badge Showcase */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-sky-500/30 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-sky-300 via-sky-500 to-blue-700 shadow-[0_12px_30px_-4px_rgba(14,165,233,0.7),inset_0_-4px_8px_rgba(3,105,161,0.9),inset_0_4px_8px_rgba(255,255,255,0.65)] border border-sky-200/50 flex items-center justify-center">
              <div className="absolute top-1.5 left-3 right-3 h-6 rounded-full bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-10 h-10 text-white drop-shadow-[0_2px_5px_rgba(3,105,161,0.85)] -translate-x-0.5 translate-y-0.5"
              >
                <path
                  d="M21.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-brand font-black text-lg text-white">
              {config.supportTitle || '24/7 Official Support'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              All player assistance, fast deposit verifications, withdrawal settlements, and VIP rewards are handled directly on our official Telegram channel.
            </p>
          </div>

          {/* Handle / Link Pill */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2">
            <div className="text-left min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Official Telegram Handle / Link
              </span>
              <span className="font-mono font-black text-xs sm:text-sm text-sky-400 truncate block">
                {displayHandle}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 text-xs font-bold flex items-center space-x-1.5 shrink-0 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>

          {/* Support Highlights */}
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center space-y-1">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-200">Instant Reply</span>
              <span className="text-[9px] text-slate-500">&lt; 2 Mins</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">Verified Desk</span>
              <span className="text-[9px] text-slate-500">100% Secure</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center space-y-1">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-slate-200">VIP Care</span>
              <span className="text-[9px] text-slate-500">24/7 Active</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-sky-500/30 flex items-center justify-center space-x-2 active:scale-95 transition"
          >
            <span>{config.buttonText || 'Chat on Telegram'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {user && (
            <p className="text-[10px] text-slate-500 font-mono">
              Your Player UID: <span className="text-slate-300 font-bold">{user.uid}</span> (Share with agent for faster help)
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
