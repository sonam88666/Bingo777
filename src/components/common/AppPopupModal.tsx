import React, { useState, useEffect } from 'react';
import { Sparkles, X, ExternalLink, ArrowRight, Bell, Gift, Flame } from 'lucide-react';
import { rtdb, rtdbRef, rtdbOnValue } from '../../firebase';
import { AppPopupConfig } from '../../types';

interface AppPopupModalProps {
  onOpenDeposit?: () => void;
}

export const AppPopupModal: React.FC<AppPopupModalProps> = ({ onOpenDeposit }) => {
  const [popupConfig, setPopupConfig] = useState<AppPopupConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      const popupRef = rtdbRef(rtdb, 'admin_settings/app_popup');
      unsub = rtdbOnValue(popupRef, (snap) => {
        if (!snap.exists()) {
          setPopupConfig(null);
          setIsVisible(false);
          return;
        }
        const val = snap.val() as AppPopupConfig;
        if (!val || !val.enabled) {
          setPopupConfig(null);
          setIsVisible(false);
          return;
        }

        setPopupConfig(val);

        // Check if user has already dismissed this exact update/broadcast
        const lastDismissedTs = Number(sessionStorage.getItem('bingo777_dismissed_popup_ts') || 0);
        const currentUpdatedTs = Number(val.updatedAt || 0);

        if (!lastDismissedTs || currentUpdatedTs > lastDismissedTs) {
          setIsVisible(true);
        }
      });
    } catch (e) {
      console.warn('AppPopupModal listener error:', e);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  if (!isVisible || !popupConfig || !popupConfig.enabled) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    if (popupConfig.updatedAt) {
      sessionStorage.setItem('bingo777_dismissed_popup_ts', String(popupConfig.updatedAt));
    } else {
      sessionStorage.setItem('bingo777_dismissed_popup_ts', String(Date.now()));
    }
  };

  const handleAction = () => {
    const url = popupConfig.actionUrl?.trim();
    if (!url || url === '#' || url.toLowerCase() === 'deposit') {
      if (onOpenDeposit) onOpenDeposit();
    } else {
      try {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        if (url.toLowerCase().endsWith('.apk')) {
          link.setAttribute('download', 'Bingo777_Update.apk');
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        window.location.href = url;
      }
    }
    handleDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.35)] overflow-hidden">
        {/* Glowing Top Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600 animate-pulse" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Optional Offer / Banner Image */}
        {popupConfig.imageUrl && popupConfig.imageUrl.trim().length > 0 && (
          <div className="relative w-full max-h-48 overflow-hidden bg-slate-950 border-b border-amber-500/20">
            <img
              src={popupConfig.imageUrl}
              alt={popupConfig.title || 'Special Announcement'}
              className="w-full h-full object-cover object-center max-h-48"
              onError={(e) => {
                // Hide broken images gracefully
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
          </div>
        )}

        <div className="p-5 space-y-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Official Announcement</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-black text-white tracking-tight drop-shadow">
            {popupConfig.title || 'Special Notice'}
          </h3>

          {/* Message Body */}
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto px-1">
            {popupConfig.message || 'Check out our latest offers and exclusive rewards!'}
          </p>

          {/* Action CTA Button */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleAction}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-[0.98] text-slate-950 font-black text-sm tracking-wide shadow-[0_4px_16px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition"
            >
              <span>{popupConfig.buttonText || 'Claim Now'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
