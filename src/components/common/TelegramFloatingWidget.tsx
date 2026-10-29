import React, { useState, useEffect } from 'react';
import { rtdb, rtdbRef, rtdbOnValue } from '../../firebase';
import { store } from '../../services/store';
import { TelegramSupportConfig } from '../../types';

/**
 * Normalizes a Telegram username (@handle or handle) or full URL into a clean https://t.me/... link
 */
export const resolveTelegramLink = (rawInput: string | undefined): string => {
  if (!rawInput || !rawInput.trim()) return 'https://t.me/colourWinAdmin';
  let cleaned = rawInput.trim();
  // Strip markdown link syntax if pasted e.g. [https://t.me/...](https://t.me/...)
  const mdMatch = cleaned.match(/\((https?:\/\/[^\s)]+)\)/);
  if (mdMatch && mdMatch[1]) {
    cleaned = mdMatch[1];
  }
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }
  if (cleaned.startsWith('t.me/')) {
    return `https://${cleaned}`;
  }
  const handle = cleaned.replace(/^@/, '');
  return `https://t.me/${handle}`;
};

export const TelegramFloatingWidget: React.FC = () => {
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
  }, []);

  if (!config.enabled) {
    return null;
  }

  const targetUrl = resolveTelegramLink(config.telegramUsernameOrLink);

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end pointer-events-none select-none">
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`${config.supportTitle} — ${config.buttonText}`}
        aria-label={config.supportTitle}
        className="pointer-events-auto group relative flex items-center justify-center focus:outline-none"
      >
        {/* Outer Subtle Pulse Halo */}
        <span className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-sky-400 via-cyan-300 to-blue-600 opacity-55 blur-md group-hover:opacity-90 animate-pulse transition duration-300" />

        {/* Expanding Ripple Ring */}
        <span className="absolute inset-0 rounded-full border-2 border-sky-400/60 animate-ping opacity-30" />

        {/* Hover Label Pill */}
        <span className="mr-2.5 hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-950/90 border border-sky-400/40 text-white text-[11px] font-black tracking-wide shadow-xl backdrop-blur-md opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{config.buttonText || 'Chat on Telegram'}</span>
        </span>

        {/* 3D Glossy Telegram Sphere Button */}
        <div
          className="relative w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-active:scale-95 animate-bounce"
          style={{ animationDuration: '3s' }}
        >
          {/* 3D Sphere Base with Multi-Stop Radial & Linear Gradients */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-sky-300 via-sky-500 to-blue-700 shadow-[0_10px_25px_-4px_rgba(14,165,233,0.75),inset_0_-4px_8px_rgba(3,105,161,0.9),inset_0_4px_8px_rgba(255,255,255,0.65)] border border-sky-200/50" />

          {/* Top Glossy Specular Highlight (3D Glass Dome Reflection) */}
          <div className="absolute top-1 left-2 right-2 h-5 rounded-full bg-gradient-to-b from-white/70 via-white/25 to-transparent pointer-events-none" />

          {/* 3D Telegram Paper Plane Vector with Drop Shadow */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="relative z-10 w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(3,105,161,0.85)] -translate-x-0.5 translate-y-0.5 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105"
          >
            <path
              d="M21.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"
              fill="currentColor"
            />
          </svg>

          {/* Live Online Status Dot */}
          <span className="absolute -top-0.5 -right-0.5 z-20 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950 shadow-sm" />
          </span>

          {/* Bottom 24/7 Micro Badge */}
          <span className="absolute -bottom-1.5 px-1.5 py-0.2 rounded-full bg-slate-950 border border-sky-400/60 text-[8px] font-black text-sky-300 tracking-wider shadow-md uppercase">
            24/7
          </span>
        </div>
      </a>
    </div>
  );
};
