import React, { useId, useState } from 'react';
import emblemAsset from '../../assets/images/bingo777_app_icon_1794710106237.jpg';

interface Bingo777LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'badge' | 'full' | 'icon';
}

/**
 * Luxury 3D Royal Crown & Triple-7 Shield Crest for Bingo777
 */
export const Bingo777Logo: React.FC<Bingo777LogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  variant = 'badge'
}) => {
  const rawId = useId().replace(/:/g, '');
  const uid = `b777_${rawId}`;
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    xs: { px: 32, textClass: 'text-sm', radiusClass: 'rounded-lg' },
    sm: { px: 40, textClass: 'text-base', radiusClass: 'rounded-xl' },
    md: { px: 46, textClass: 'text-lg', radiusClass: 'rounded-xl' },
    lg: { px: 58, textClass: 'text-xl', radiusClass: 'rounded-2xl' },
    xl: { px: 88, textClass: 'text-2xl', radiusClass: 'rounded-3xl' }
  };

  const { px, textClass, radiusClass } = sizeMap[size];
  const renderWordmark = showText || variant === 'full';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none group ${className}`}>
      <div
        className={`relative shrink-0 overflow-hidden border border-amber-400/50 bg-slate-950 shadow-[0_6px_18px_rgba(245,158,11,0.35)] transition-transform duration-300 group-hover:scale-105 ${radiusClass}`}
        style={{ width: px, height: px }}
      >
        {!imgError ? (
          <img
            src={emblemAsset}
            alt="Bingo777 Royal Crest"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover scale-105"
          />
        ) : (
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Bingo777 Logo"
          >
            <defs>
              <linearGradient id={`${uid}_gold_rim`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
              <radialGradient id={`${uid}_obsidian_bg`} cx="50%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#311042" />
                <stop offset="55%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
            </defs>
            <rect width="200" height="200" fill={`url(#${uid}_obsidian_bg)`} />
            <path
              d="M100 12 L174 36 C178 102 152 154 100 186 C48 154 22 102 26 36 L100 12 Z"
              fill={`url(#${uid}_gold_rim)`}
              stroke="#FEF08A"
              strokeWidth="2"
            />
            <path
              d="M100 24 L160 45 C163 96 140 142 100 168 C60 142 37 96 40 45 L100 24 Z"
              fill={`url(#${uid}_obsidian_bg)`}
            />
            <path
              d="M51 88 H81 L78 97 L65 136 H55 L68 97 H49 Z"
              fill="#FBBF24"
              stroke="#FFFBEB"
              strokeWidth="1.1"
            />
            <path
              d="M119 88 H149 L146 97 L133 136 H123 L136 97 H117 Z"
              fill="#FBBF24"
              stroke="#FFFBEB"
              strokeWidth="1.1"
            />
            <path
              d="M81 79 H120 L116 90 L99 143 H87 L104 90 H78 Z"
              fill="#FEF08A"
              stroke="#FFFFFF"
              strokeWidth="1.4"
            />
          </svg>
        )}

        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-amber-200/30 rounded-[inherit]" />
      </div>

      {renderWordmark && (
        <div className="flex flex-col leading-none">
          <span className={`font-brand font-black tracking-wide whitespace-nowrap ${textClass}`}>
            <span className="text-slate-100">Bingo</span>
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_1px_6px_rgba(245,158,11,0.35)]">
              777
            </span>
          </span>
        </div>
      )}
    </div>
  );
};
