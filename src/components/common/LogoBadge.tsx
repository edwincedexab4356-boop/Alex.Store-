import React from 'react';

interface LogoBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge-only' | 'horizontal' | 'vertical-stacked';
  className?: string;
  onClick?: () => void;
}

export const LogoBadge: React.FC<LogoBadgeProps> = ({
  size = 'md',
  variant = 'badge-only',
  className = '',
  onClick,
}) => {
  const sizeMap = {
    xs: { dim: 36, textMain: 'text-sm', textSub: 'text-[9px]' },
    sm: { dim: 48, textMain: 'text-base', textSub: 'text-[10px]' },
    md: { dim: 72, textMain: 'text-xl', textSub: 'text-xs' },
    lg: { dim: 110, textMain: 'text-2xl', textSub: 'text-sm' },
    xl: { dim: 180, textMain: 'text-3xl', textSub: 'text-base' },
  };

  const current = sizeMap[size] || sizeMap.md;

  const renderBadgeSvg = () => (
    <svg
      width={current.dim}
      height={current.dim}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(212,175,55,0.35)]"
    >
      <defs>
        {/* Outer Bevel Gold Gradient */}
        <linearGradient id="goldRing" x1="0" y1="0" x2="240" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF2A1" />
          <stop offset="25%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#997A15" />
          <stop offset="75%" stopColor="#F5D061" />
          <stop offset="100%" stopColor="#7A5E0B" />
        </linearGradient>

        <linearGradient id="goldInnerRing" x1="240" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E5C158" />
          <stop offset="35%" stopColor="#9B7C16" />
          <stop offset="70%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#8C6C0A" />
        </linearGradient>

        {/* Text and Monogram Gold Gradient */}
        <linearGradient id="goldMetallic" x1="0" y1="50" x2="200" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="20%" stopColor="#FDE68A" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#B38F1E" />
          <stop offset="90%" stopColor="#F5D061" />
          <stop offset="100%" stopColor="#AA820D" />
        </linearGradient>

        <radialGradient id="stadiumDark" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e1b18" />
          <stop offset="45%" stopColor="#121113" />
          <stop offset="85%" stopColor="#08080a" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>

        {/* Stadium Light Beam Gradient */}
        <linearGradient id="lightBeam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>

        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Thick Gold Bezel */}
      <circle cx="120" cy="120" r="116" stroke="url(#goldRing)" strokeWidth="6" fill="#0c0b0a" />
      <circle cx="120" cy="120" r="111" stroke="url(#goldInnerRing)" strokeWidth="2.5" fill="none" />
      
      {/* Inner Stadium Canvas */}
      <circle cx="120" cy="120" r="108" fill="url(#stadiumDark)" />

      {/* Stadium Floodlight Arrays Background */}
      <g opacity="0.4">
        {/* Left floodlights */}
        <polygon points="20,70 50,75 45,95 15,90" fill="#2d2922" stroke="#D4AF37" strokeWidth="0.5" />
        <circle cx="25" cy="80" r="2.5" fill="#FFE898" />
        <circle cx="35" cy="82" r="2.5" fill="#FFE898" />
        <circle cx="45" cy="84" r="2.5" fill="#FFE898" />
        <circle cx="23" cy="88" r="2.5" fill="#FFE898" />
        <circle cx="33" cy="90" r="2.5" fill="#FFE898" />
        <circle cx="43" cy="92" r="2.5" fill="#FFE898" />
        
        {/* Right floodlights */}
        <polygon points="220,70 190,75 195,95 225,90" fill="#2d2922" stroke="#D4AF37" strokeWidth="0.5" />
        <circle cx="215" cy="80" r="2.5" fill="#FFE898" />
        <circle cx="205" cy="82" r="2.5" fill="#FFE898" />
        <circle cx="195" cy="84" r="2.5" fill="#FFE898" />
        <circle cx="217" cy="88" r="2.5" fill="#FFE898" />
        <circle cx="207" cy="90" r="2.5" fill="#FFE898" />
        <circle cx="197" cy="92" r="2.5" fill="#FFE898" />

        {/* Stadium light beams */}
        <polygon points="35,85 110,130 90,140 25,95" fill="url(#lightBeam)" opacity="0.3" />
        <polygon points="205,85 130,130 150,140 215,95" fill="url(#lightBeam)" opacity="0.3" />
      </g>

      {/* Stadium Tribune Silhouette Curves */}
      <path d="M 25 125 Q 120 150 215 125" stroke="#443925" strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d="M 20 135 Q 120 162 220 135" stroke="#332c1e" strokeWidth="1" fill="none" opacity="0.2" />

      {/* Golden Crown */}
      <g filter="url(#goldGlow)" transform="translate(120, 52) scale(0.95)">
        <path
          d="M -32 6 L -38 -14 L -18 -4 L 0 -22 L 18 -4 L 38 -14 L 32 6 Z"
          fill="url(#goldMetallic)"
          stroke="#7A5E0B"
          strokeWidth="1"
        />
        {/* Crown Jewels / Pearls */}
        <circle cx="-38" cy="-14" r="2.5" fill="#FFFFFF" />
        <circle cx="-18" cy="-4" r="2.5" fill="#FFFFFF" />
        <circle cx="0" cy="-22" r="3.5" fill="#FFFFFF" />
        <circle cx="18" cy="-4" r="2.5" fill="#FFFFFF" />
        <circle cx="38" cy="-14" r="2.5" fill="#FFFFFF" />
        <rect x="-30" y="3" width="60" height="3" rx="1.5" fill="#7A5E0B" opacity="0.6" />
      </g>

      {/* Soccer Ball with Gold Accents behind S */}
      <g transform="translate(155, 108) scale(0.58)">
        <circle cx="0" cy="0" r="34" fill="#E5C158" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="34" fill="url(#goldRing)" opacity="0.8" />
        {/* Pentagons */}
        <polygon points="0,-12 11,-4 7,9 -7,9 -11,-4" fill="#18181b" stroke="#FDE68A" strokeWidth="1.5" />
        <polygon points="0,-34 9,-28 4,-19 -4,-19 -9,-28" fill="#18181b" stroke="#FDE68A" strokeWidth="1.5" />
        <polygon points="32,-10 32,2 22,2 17,-6 24,-13" fill="#18181b" stroke="#FDE68A" strokeWidth="1.5" />
        <polygon points="20,26 28,16 23,8 12,13 11,24" fill="#18181b" stroke="#FDE68A" strokeWidth="1.5" />
        <polygon points="-20,26 -28,16 -23,8 -12,13 -11,24" fill="#18181b" stroke="#FDE68A" strokeWidth="1.5" />
        <polygon points="-32,-10 -32,2 -22,2 -17,-6 -24,-13" fill="#18181b" stroke="#FDE68A" strokeWidth="1.5" />
      </g>

      {/* Main AS Monogram */}
      <g filter="url(#goldGlow)">
        {/* Drop shadow of monogram */}
        <text
          x="88"
          y="126"
          fontFamily="'Cinzel', 'Times New Roman', serif"
          fontSize="72"
          fontWeight="900"
          textAnchor="middle"
          fill="#000000"
          opacity="0.8"
        >
          A
        </text>
        <text
          x="138"
          y="126"
          fontFamily="'Cinzel', 'Times New Roman', serif"
          fontSize="72"
          fontWeight="900"
          textAnchor="middle"
          fill="#000000"
          opacity="0.8"
        >
          S
        </text>

        {/* Foreground metallic gold letters */}
        <text
          x="86"
          y="124"
          fontFamily="'Cinzel', 'Times New Roman', serif"
          fontSize="72"
          fontWeight="900"
          textAnchor="middle"
          fill="url(#goldMetallic)"
          stroke="#7A5E0B"
          strokeWidth="1.5"
          letterSpacing="-2"
        >
          A
        </text>
        <text
          x="136"
          y="124"
          fontFamily="'Cinzel', 'Times New Roman', serif"
          fontSize="72"
          fontWeight="900"
          textAnchor="middle"
          fill="url(#goldMetallic)"
          stroke="#7A5E0B"
          strokeWidth="1.5"
          letterSpacing="-2"
        >
          S
        </text>
      </g>

      {/* Lower Banner Plaque with Brand Name and Slogan */}
      <g transform="translate(120, 160)">
        {/* Divider lines */}
        <line x1="-80" y1="-8" x2="80" y2="-8" stroke="url(#goldRing)" strokeWidth="1.5" />
        
        {/* ALEX.STOREPTY Main Title */}
        <text
          x="0"
          y="6"
          fontFamily="'Cinzel', serif"
          fontSize="17"
          fontWeight="900"
          letterSpacing="1.8"
          textAnchor="middle"
          fill="url(#goldMetallic)"
          stroke="#684E06"
          strokeWidth="0.5"
        >
          ALEX.STOREPTY
        </text>

        {/* Separator with small line */}
        <line x1="-65" y1="12" x2="-25" y2="12" stroke="#D4AF37" strokeWidth="0.75" />
        <text
          x="0"
          y="15"
          fontFamily="'Montserrat', sans-serif"
          fontSize="8.5"
          fontWeight="700"
          letterSpacing="2.2"
          textAnchor="middle"
          fill="#FDE68A"
        >
          JERSEYS Y MÁS
        </text>
        <line x1="25" y1="12" x2="65" y2="12" stroke="#D4AF37" strokeWidth="0.75" />

        {/* Secondary phrase: Tu pasión, nuestra tienda */}
        <text
          x="0"
          y="26"
          fontFamily="'Montserrat', sans-serif"
          fontSize="6"
          fontWeight="600"
          letterSpacing="1.5"
          textAnchor="middle"
          fill="#FFFFFF"
          opacity="0.9"
        >
          TU PASIÓN, NUESTRA TIENDA
        </text>

        {/* Bottom Star and Wings */}
        <g transform="translate(0, 36)">
          <line x1="-35" y1="0" x2="-10" y2="0" stroke="url(#goldRing)" strokeWidth="1" />
          <polygon points="0,-4 1.5,-1 4,0 1.5,1 0,4 -1.5,1 -4,0 -1.5,-1" fill="#FFE898" />
          <line x1="10" y1="0" x2="35" y2="0" stroke="url(#goldRing)" strokeWidth="1" />
        </g>
      </g>
    </svg>
  );

  if (variant === 'badge-only') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center select-none group cursor-pointer ${className}`}
        title="ALEX.STOREPTY - Jerseys y más"
      >
        {renderBadgeSvg()}
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-3 select-none group cursor-pointer ${className}`}
        title="ALEX.STOREPTY - Jerseys y más"
      >
        {renderBadgeSvg()}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-['Cinzel'] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-500 ${current.textMain}`}
            >
              ALEX.STOREPTY
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]"></span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-['Montserrat'] font-semibold tracking-widest text-[#ECC86A] uppercase ${current.textSub}`}>
              Jerseys y más
            </span>
            <span className="text-neutral-600 text-[10px]">|</span>
            <span className={`hidden sm:inline font-['Montserrat'] text-neutral-400 font-medium tracking-wider ${current.textSub}`}>
              Tu pasión, nuestra tienda
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center text-center gap-2 select-none group cursor-pointer ${className}`}
    >
      {renderBadgeSvg()}
      <span
        className={`font-['Cinzel'] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-500 ${current.textMain}`}
      >
        ALEX.STOREPTY
      </span>
      <span className={`font-['Montserrat'] font-bold tracking-widest text-[#ECC86A] uppercase ${current.textSub}`}>
        Jerseys y más
      </span>
      <span className="font-['Montserrat'] text-neutral-400 text-xs font-medium tracking-wide">
        Tu pasión, nuestra tienda
      </span>
    </div>
  );
};
