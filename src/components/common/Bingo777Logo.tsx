import React from 'react';

interface Bingo777LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'badge' | 'full' | 'icon';
}

export const Bingo777Logo: React.FC<Bingo777LogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  variant = 'badge'
}) => {
  // Dimension mapping
  const sizeMap = {
    xs: { px: 28, text: 'text-xs', sub: 'text-[8px]' },
    sm: { px: 36, text: 'text-sm', sub: 'text-[9px]' },
    md: { px: 44, text: 'text-base', sub: 'text-[10px]' },
    lg: { px: 56, text: 'text-xl', sub: 'text-xs' },
    xl: { px: 84, text: 'text-2xl', sub: 'text-sm' }
  };

  const { px } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none group ${className}`}>
      {/* 3D Emblems / Badge Container */}
      <div 
        className="relative shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: px, height: px }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_8px_16px_rgba(245,158,11,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Outer Rim 3D Gold Gradient */}
            <linearGradient id="b777_gold_rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="25%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="75%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            {/* Inner Shield Bevel 3D Gradient */}
            <linearGradient id="b777_gold_inner" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>

            {/* Deep Casino Ruby & Obsidian Shield Surface */}
            <radialGradient id="b777_shield_bg" cx="50%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#991B1B" />
              <stop offset="45%" stopColor="#450A0A" />
              <stop offset="85%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* 3D Extrusion Gold for 777 */}
            <linearGradient id="b777_num_front" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="20%" stopColor="#FEF08A" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            {/* 3D Side Shadows */}
            <linearGradient id="b777_side_shadow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350F" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>

            {/* Specular Glow Filter */}
            <filter id="b777_gold_glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Glossy Top Reflection */}
            <linearGradient id="b777_gloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 1. Deep 3D Shadow Cast */}
          <ellipse cx="100" cy="180" rx="72" ry="14" fill="#000000" opacity="0.6" filter="blur(6px)" />

          {/* 2. Outer Shield 3D Metallic Gold Chamfered Base */}
          <path
            d="M100 8 L180 34 C180 115 148 162 100 186 C52 162 20 115 20 34 L100 8 Z"
            fill="url(#b777_gold_rim)"
            stroke="#92400E"
            strokeWidth="2"
          />

          {/* 3. Outer Shield 3D Inset Lip */}
          <path
            d="M100 14 L174 38 C174 112 144 156 100 179 C56 156 26 112 26 38 L100 14 Z"
            fill="#1E1B4B"
          />

          {/* 4. Golden Inner Filigree Ring */}
          <path
            d="M100 18 L168 42 C168 110 140 151 100 173 C60 151 32 110 32 42 L100 18 Z"
            fill="url(#b777_gold_inner)"
          />

          {/* 5. Deep Ruby Enamel Shield Face */}
          <path
            d="M100 24 L162 46 C162 108 136 145 100 166 C64 145 38 108 38 46 L100 24 Z"
            fill="url(#b777_shield_bg)"
          />

          {/* 6. Glossy Curved Glass Reflection on Top Shield Half */}
          <path
            d="M100 25 L160 47 C155 76 130 92 100 92 C70 92 45 76 40 47 L100 25 Z"
            fill="url(#b777_gloss)"
          />

          {/* 7. Arc Ribbon Badge: 'B I N G O' */}
          <g transform="translate(0, -2)">
            {/* Ribbon Background Plate */}
            <path
              d="M48 64 Q100 48 152 64 L148 80 Q100 66 52 80 Z"
              fill="url(#b777_gold_rim)"
              stroke="#78350F"
              strokeWidth="1.5"
            />
            {/* Top Ribbon Highlight */}
            <path
              d="M50 65 Q100 49 150 65"
              stroke="#FFFBEB"
              strokeWidth="1"
              strokeLinecap="round"
            />
            {/* 'BINGO' Embossed 3D Text along curve */}
            <text
              x="100"
              y="74"
              textAnchor="middle"
              fill="#0F172A"
              fontSize="14"
              fontWeight="900"
              fontFamily="sans-serif"
              letterSpacing="3"
              style={{ textShadow: '0 1px 0 #FEF08A' }}
            >
              B I N G O
            </text>
          </g>

          {/* 8. 3D Bold '7 7 7' Casino Triple Crown Numbers */}
          <g filter="url(#b777_gold_glow)">
            {/* Left '7' 3D Shadow Depth */}
            <path
              d="M56 94 H84 L69 146 H54 L69 98 H56 Z"
              fill="url(#b777_side_shadow)"
            />
            {/* Left '7' 3D Front Face */}
            <path
              d="M54 92 H82 L66 144 H52 L67 96 H54 Z"
              fill="url(#b777_num_front)"
              stroke="#FEF08A"
              strokeWidth="0.8"
            />

            {/* Center Dominant '7' 3D Shadow Depth */}
            <path
              d="M87 88 H123 L104 150 H87 L104 93 H87 Z"
              fill="url(#b777_side_shadow)"
            />
            {/* Center Dominant '7' 3D Front Face (Taller & Majestic) */}
            <path
              d="M85 85 H121 L101 148 H84 L101 90 H85 Z"
              fill="url(#b777_num_front)"
              stroke="#FFFBEB"
              strokeWidth="1.2"
            />

            {/* Right '7' 3D Shadow Depth */}
            <path
              d="M124 94 H152 L137 146 H122 L137 98 H124 Z"
              fill="url(#b777_side_shadow)"
            />
            {/* Right '7' 3D Front Face */}
            <path
              d="M122 92 H150 L134 144 H120 L135 96 H122 Z"
              fill="url(#b777_num_front)"
              stroke="#FEF08A"
              strokeWidth="0.8"
            />
          </g>

          {/* 9. Sparkling 3D Diamond Sparks / Lens Flares */}
          {/* Top Left Sparkle */}
          <g transform="translate(42, 38)">
            <path d="M0 -7 Q0 0 7 0 Q0 0 0 7 Q0 0 -7 0 Q0 0 0 -7 Z" fill="#FFFBEB" />
            <circle cx="0" cy="0" r="2" fill="#FBBF24" />
          </g>
          {/* Center Crown Sparkle */}
          <g transform="translate(100, 15)">
            <path d="M0 -9 Q0 0 9 0 Q0 0 0 9 Q0 0 -9 0 Q0 0 0 -9 Z" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="2.5" fill="#FEF08A" />
          </g>
          {/* Right Sparkle */}
          <g transform="translate(158, 40)">
            <path d="M0 -7 Q0 0 7 0 Q0 0 0 7 Q0 0 -7 0 Q0 0 0 -7 Z" fill="#FFFBEB" />
            <circle cx="0" cy="0" r="2" fill="#FBBF24" />
          </g>
          {/* Center 777 Specular Spark */}
          <g transform="translate(102, 88)">
            <path d="M0 -5 Q0 0 5 0 Q0 0 0 5 Q0 0 -5 0 Q0 0 0 -5 Z" fill="#FFFFFF" />
          </g>
        </svg>

        {/* Ambient Pulsing Halo Light */}
        <div className="absolute inset-0 rounded-full bg-amber-500/15 filter blur-md -z-10 animate-pulse pointer-events-none" />
      </div>

      {/* Optional Wordmark text for Full variant */}
      {(showText || variant === 'full') && (
        <div className="flex flex-col justify-center leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-brand font-black tracking-wider bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent ${sizeMap[size].text}`}>
              Bingo777
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-600/30 border border-amber-400/50 text-[8px] font-black text-amber-300 tracking-wider">
              PRO 3D
            </span>
          </div>
          <span className={`text-amber-400/80 font-bold tracking-wider flex items-center gap-1 ${sizeMap[size].sub}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span>VIP Gaming Suite</span>
          </span>
        </div>
      )}
    </div>
  );
};
