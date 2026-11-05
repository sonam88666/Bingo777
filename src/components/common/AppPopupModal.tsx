import React, { useState, useEffect } from 'react';
import { Sparkles, X, ArrowRight, Gift, Flame, ChevronLeft, ChevronRight, Percent, ShieldAlert, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { rtdb, rtdbRef, rtdbOnValue } from '../../firebase';
import { AppPopupConfig, AdSlideItem } from '../../types';

interface AppPopupModalProps {
  onOpenDeposit?: () => void;
  onOpenReferral?: () => void;
  onOpenGift?: () => void;
}

export const AppPopupModal: React.FC<AppPopupModalProps> = ({
  onOpenDeposit,
  onOpenReferral,
  onOpenGift
}) => {
  const [popupConfig, setPopupConfig] = useState<AppPopupConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

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
        setActiveSlideIdx(0);

        const lastDismissedTs = Number(sessionStorage.getItem('bingo777_dismissed_popup_ts') || 0);
        const lastDismissedForceId = Number(sessionStorage.getItem('bingo777_dismissed_force_id') || 0);
        const currentUpdatedTs = Number(val.updatedAt || 0);
        const currentForceId = Number(val.forceShowId || 0);

        if (
          val.showEveryTime ||
          !lastDismissedTs ||
          currentUpdatedTs > lastDismissedTs ||
          (currentForceId > 0 && currentForceId !== lastDismissedForceId)
        ) {
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

  const activeSlides: AdSlideItem[] = React.useMemo(() => {
    if (!popupConfig?.slides || !Array.isArray(popupConfig.slides)) return [];
    return popupConfig.slides.filter((s) => s && s.enabled !== false);
  }, [popupConfig?.slides]);

  // Auto-advance popup slides if multiple slides are configured
  useEffect(() => {
    if (!isVisible || activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlideIdx((prev) => (prev + 1) % activeSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isVisible, activeSlides.length]);

  if (!isVisible || !popupConfig || !popupConfig.enabled) {
    return null;
  }

  const currentSlide = activeSlides.length > 0 ? activeSlides[activeSlideIdx % activeSlides.length] : null;
  const displayTitle = currentSlide?.title || popupConfig.title || 'Special Offer';
  const displayMessage = currentSlide?.subtitle || popupConfig.message || 'Check out our latest offers and exclusive rewards!';
  const displayImage = currentSlide?.imageUrl || popupConfig.imageUrl || '';
  const displayBadge = currentSlide?.badge || popupConfig.badgeText || 'Official Offer';
  const displayDiscount = currentSlide?.tag || popupConfig.discountTag || '';
  const displayButton = currentSlide?.buttonText || popupConfig.buttonText || 'Claim Offer Now';
  const displayAction = currentSlide?.actionUrl || popupConfig.actionUrl || 'deposit';

  const handleDismiss = () => {
    setIsVisible(false);
    const nowTs = String(popupConfig.updatedAt || Date.now());
    sessionStorage.setItem('bingo777_dismissed_popup_ts', nowTs);
    if (popupConfig.forceShowId) {
      sessionStorage.setItem('bingo777_dismissed_force_id', String(popupConfig.forceShowId));
    }
  };

  const handleAction = () => {
    const url = displayAction.trim();
    const lower = url.toLowerCase();
    if (!url || url === '#' || lower === 'deposit' || lower === 'recharge') {
      if (onOpenDeposit) onOpenDeposit();
    } else if (lower === 'referral' || lower === 'refer') {
      if (onOpenReferral) onOpenReferral();
    } else if (lower === 'gift' || lower === 'bonus') {
      if (onOpenGift) onOpenGift();
      else if (onOpenDeposit) onOpenDeposit();
    } else {
      try {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        if (lower.endsWith('.apk')) {
          link.setAttribute('download', 'Bingo777_Update.apk');
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        window.location.href = url;
      }
    }
    handleDismiss();
  };

  const renderBadgeIcon = () => {
    switch (popupConfig.popupType) {
      case 'signup_bonus':
        return <Gift className="w-3.5 h-3.5 text-amber-400" />;
      case 'deposit_offer':
        return <Percent className="w-3.5 h-3.5 text-emerald-400" />;
      case 'important_notice':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'vip_referral':
        return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', stiffness: 350, damping: 27 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400/80 shadow-[0_0_55px_rgba(245,158,11,0.38)] overflow-hidden"
        >
          {/* Glowing Top Accent Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600 animate-pulse" />

          {/* Close Button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-slate-950/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Optional Offer / Banner Image (Recommended 800x450 16:9 or 800x800 1:1) */}
          {displayImage && displayImage.trim().length > 0 && (
            <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-950 border-b border-amber-500/20">
              <img
                src={displayImage}
                alt={displayTitle}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              {displayDiscount && (
                <div className="absolute bottom-2.5 left-3 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-lg">
                  {displayDiscount}
                </div>
              )}
            </div>
          )}

          {/* Slide Navigation Arrows if Multiple Slides exist */}
          {activeSlides.length > 1 && (
            <div className="flex items-center justify-between px-4 pt-3">
              <button
                type="button"
                onClick={() =>
                  setActiveSlideIdx((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)
                }
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {activeSlides.map((s, idx) => (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => setActiveSlideIdx(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeSlideIdx % activeSlides.length
                        ? 'w-5 bg-amber-400'
                        : 'w-1.5 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActiveSlideIdx((prev) => (prev + 1) % activeSlides.length)}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="p-5 space-y-3.5 text-center">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                {renderBadgeIcon()}
                <span>{displayBadge}</span>
              </div>
              {!displayImage && displayDiscount && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black uppercase">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{displayDiscount}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight drop-shadow leading-snug">
              {displayTitle}
            </h3>

            {/* Message Body */}
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto px-1">
              {displayMessage}
            </p>

            {/* Action CTA Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleAction}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-[0.98] text-slate-950 font-black text-sm tracking-wide shadow-[0_4px_16px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition"
              >
                <span>{displayButton}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Close Notice
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
