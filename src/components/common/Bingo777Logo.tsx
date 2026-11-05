import React from 'react';

interface Bingo777LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'badge' | 'full' | 'icon';
}

/**
 * Stealth Luxury 3D Royal Crown & Tri-Jewel Crest Emblem (Name Hidden)
 */
export const Bingo777Logo: React.FC<Bingo777LogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    xs: { px: 30 },
    sm: { px: 38 },
    md: { px: 46 },
    lg: { px: 58 },
    xl: { px: 86 }
  };

  const { px } = sizeMap[size];

  return (
    <div className={`inline-flex items-center select-none group ${className}`}>
      <div
        className="relative shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: px, height: px }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_8px_18px_rgba(245,158,11,0.42)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 24K Metallic Gold Outer Bevel */}
            <linearGradient id="crest_gold_rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="22%" stopColor="#FDE047" />
              <stop offset="48%" stopColor="#F59E0B" />
              <stop offset="76%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            {/* Inner Gold Filigree */}
            <linearGradient id="crest_gold_inner" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#FFFBEB" />
            </linearGradient>

            {/* Obsidian & Royal Indigo Velvet Core */}
            <radialGradient id="crest_obsidian_bg" cx="50%" cy="38%" r="68%">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="52%" stopColor="#0F172A" />
              <stop offset="88%" stopColor="#020617" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>

            {/* Imperial Crown 3D Gold Face */}
            <linearGradient id="crown_gold_face" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="20%" stopColor="#FEF08A" />
              <stop offset="55%" stopColor="#FBBF24" />
              <stop offset="85%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            {/* Ruby Center Gem */}
            <radialGradient id="gem_ruby" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFE4E6" />
              <stop offset="30%" stopColor="#FB7185" />
              <stop offset="70%" stopColor="#E11D48" />
              <stop offset="100%" stopColor="#881337" />
            </radialGradient>

            {/* Emerald Left Gem */}
            <radialGradient id="gem_emerald" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#D1FAE5" />
              <stop offset="30%" stopColor="#34D399" />
              <stop offset="70%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064E3B" />
            </radialGradient>

            {/* Violet Right Gem */}
            <radialGradient id="gem_violet" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#F3E8FF" />
              <stop offset="30%" stopColor="#C084FC" />
              <stop offset="70%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#3B0764" />
            </radialGradient>

            {/* Solitaire Diamond Facets */}
            <linearGradient id="diamond_top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            <linearGradient id="diamond_shade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>

            {/* Top Glass Specular Sheen */}
            <linearGradient id="crest_gloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.38" />
              <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 1. Ambient Drop Shadow */}
          <ellipse cx="100" cy="184" rx="68" ry="12" fill="#000000" opacity="0.65" />

          {/* 2. Outer Royal Octagonal Shield Frame */}
          <path
            d="M100 6 L176 34 C182 98 156 154 100 188 C44 154 18 98 24 34 L100 6 Z"
            fill="url(#crest_gold_rim)"
            stroke="#FEF08A"
            strokeWidth="1.5"
          />

          {/* 3. Dark Recessed Armor Channel */}
          <path
            d="M100 13 L169 39 C174 96 150 148 100 179 C50 148 26 96 31 39 L100 13 Z"
            fill="#020617"
          />

          {/* 4. Inner 24K Gold Bevel Ring */}
          <path
            d="M100 18 L163 42 C167 94 145 143 100 172 C55 143 33 94 37 42 L100 18 Z"
            fill="url(#crest_gold_inner)"
          />

          {/* 5. Deep Obsidian Velvet Shield Face */}
          <path
            d="M100 23 L158 45 C161 92 140 138 100 165 C60 138 39 92 42 45 L100 23 Z"
            fill="url(#crest_obsidian_bg)"
          />

          {/* 6. Subtle Royal Sunburst Rays Inside Shield */}
          <g opacity="0.16" stroke="#FBBF24" strokeWidth="1.2">
            <line x1="100" y1="95" x2="100" y2="28" />
            <line x1="100" y1="95" x2="148" y2="48" />
            <line x1="100" y1="95" x2="52" y2="48" />
            <line x1="100" y1="95" x2="154" y2="95" />
            <line x1="100" y1="95" x2="46" y2="95" />
            <line x1="100" y1="95" x2="136" y2="142" />
            <line x1="100" y1="95" x2="64" y2="142" />
          </g>

          {/* 7. Glossy Curved Top Highlight */}
          <path
            d="M100 24 L156 46 C152 75 128 90 100 90 C72 90 48 75 44 46 L100 24 Z"
            fill="url(#crest_gloss)"
          />

          {/* 8. 3D Sculpted Golden Wings (Left & Right) */}
          <path
            d="M46 84 C44 64 56 50 70 54 C60 64 58 76 68 88 C56 88 50 96 56 106 C48 102 45 94 46 84 Z"
            fill="url(#crown_gold_face)"
            opacity="0.92"
          />
          <path
            d="M154 84 C156 64 144 50 130 54 C140 64 142 76 132 88 C144 88 150 96 144 106 C152 102 155 94 154 84 Z"
            fill="url(#crown_gold_face)"
            opacity="0.92"
          />

          {/* 9. Majestic 5-Point Imperial 3D Golden Crown */}
          <g transform="translate(0, 2)">
            {/* Crown Base Shadow */}
            <path
              d="M62 88 L54 54 L80 70 L100 42 L120 70 L146 54 L138 88 Z"
              fill="#451A03"
              transform="translate(0, 3)"
            />
            {/* Crown Main Body */}
            <path
              d="M62 88 L54 54 L80 70 L100 42 L120 70 L146 54 L138 88 Z"
              fill="url(#crown_gold_face)"
              stroke="#FFFBEB"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Crown Jewelled Band */}
            <rect
              x="62"
              y="88"
              width="76"
              height="11"
              rx="4"
              fill="url(#crest_gold_rim)"
              stroke="#FEF08A"
              strokeWidth="1"
            />
            {/* Crown Tip Pearls */}
            <circle cx="54" cy="51" r="3.5" fill="#FFFBEB" />
            <circle cx="80" cy="66" r="3" fill="#FDE047" />
            <circle cx="100" cy="38" r="4.5" fill="#FFFFFF" />
            <circle cx="120" cy="66" r="3" fill="#FDE047" />
            <circle cx="146" cy="51" r="3.5" fill="#FFFBEB" />

            {/* 3 Signature Tri-Color Jewels Set Into the Crown (Green, Red, Violet) */}
            <circle cx="76" cy="79" r="5" fill="url(#gem_emerald)" stroke="#FFFBEB" strokeWidth="0.8" />
            <polygon
              points="100,66 107,76 100,85 93,76"
              fill="url(#gem_ruby)"
              stroke="#FFFFFF"
              strokeWidth="1"
            />
            <circle cx="124" cy="79" r="5" fill="url(#gem_violet)" stroke="#FFFBEB" strokeWidth="0.8" />
          </g>

          {/* 10. Lower 3D Faceted Royal Diamond & Tri-Star Crest (No Text) */}
          <g transform="translate(0, 4)">
            {/* Outer Diamond Shadow */}
            <polygon points="100,104 126,124 100,152 74,124" fill="#000000" opacity="0.45" />
            {/* Faceted Diamond Base */}
            <polygon
              points="100,101 124,121 100,148 76,121"
              fill="url(#diamond_top)"
              stroke="#FFFBEB"
              strokeWidth="1.2"
            />
            {/* Diamond Inner Facet Lines */}
            <polygon points="100,101 124,121 100,125" fill="#FFFFFF" opacity="0.45" />
            <polygon points="100,125 124,121 100,148" fill="url(#diamond_shade)" opacity="0.85" />
            <polygon points="100,125 76,121 100,148" fill="#B45309" opacity="0.55" />
            <polygon points="100,109 113,121 100,137 87,121" fill="url(#gem_ruby)" stroke="#FEF08A" strokeWidth="0.9" />
          </g>

          {/* 11. Crisp Diamond Specular Sparkles */}
          <g transform="translate(100, 38)">
            <path d="M0 -8 Q0 0 8 0 Q0 0 0 8 Q0 0 -8 0 Q0 0 0 -8 Z" fill="#FFFFFF" />
          </g>
          <g transform="translate(46, 46)">
            <path d="M0 -5 Q0 0 5 0 Q0 0 0 5 Q0 0 -5 0 Q0 0 0 -5 Z" fill="#FEF08A" />
          </g>
          <g transform="translate(154, 46)">
            <path d="M0 -5 Q0 0 5 0 Q0 0 0 5 Q0 0 -5 0 Q0 0 0 -5 Z" fill="#FEF08A" />
          </g>
        </svg>

        {/* Ambient Golden Glow */}
        <div className="absolute inset-0 rounded-full bg-amber-500/15 filter blur-md -z-10 pointer-events-none" />
      </div>
    </div>
  );
};
