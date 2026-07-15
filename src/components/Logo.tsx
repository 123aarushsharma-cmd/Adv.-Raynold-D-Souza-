import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  inverse?: boolean;
}

export default function Logo({
  className = "",
  size = 40,
  showText = true,
  inverse = false,
}: LogoProps) {
  const primaryColor = inverse ? "#FAF9F6" : "#1B3A2F";
  const accentColor = "#C9A227";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Olive Law Firm Logo"
        className="transition-transform duration-300 hover:scale-105"
      >
        {/* Subtle Background Circle */}
        <circle cx="50" cy="50" r="46" stroke={primaryColor} strokeWidth="1" strokeOpacity="0.08" />

        {/* --- Top Olive Leaves Fan (Forest Green) --- */}
        <g fill={primaryColor}>
          {/* Central top leaf */}
          <path d="M50 25 C48.5 17 51.5 10 50 5 C48.5 10 51.5 17 50 25 Z" />
          {/* Upper left leaf */}
          <path d="M48 26 C41 21 37.5 15 42 12 C46.5 15 47 21 48 26 Z" />
          {/* Upper right leaf */}
          <path d="M52 26 C59 21 62.5 15 58 12 C53.5 15 53 21 52 26 Z" />
          {/* Middle left leaf */}
          <path d="M47 29 C38 27 34 22 37.5 18 C41 22 44.5 25 47 29 Z" />
          {/* Middle right leaf */}
          <path d="M53 29 C62 27 66 22 62.5 18 C59 22 55.5 25 53 29 Z" />
          {/* Lower left leaf */}
          <path d="M47 31 C36 32 31.5 29.5 33 25 C37.5 27 43 29 47 31 Z" />
          {/* Lower right leaf */}
          <path d="M53 31 C64 32 68.5 29.5 67 25 C62.5 27 57 29 53 31 Z" />
        </g>

        {/* --- Golden Balance Beam / Raised Arms (Swooping curves) --- */}
        <g fill={accentColor}>
          {/* Left sweeping arm */}
          <path d="M50 42 C40 38 28 34 18 38 C16 38.5 16 39.5 18 40 C28 42 40 44 50 42 Z" />
          {/* Right sweeping arm */}
          <path d="M50 42 C60 38 72 34 82 38 C84 38.5 84 39.5 82 40 C72 42 60 44 50 42 Z" />
          {/* Small center decorative node */}
          <circle cx="50" cy="41" r="2.5" />
        </g>

        {/* --- Hanging Scales (Left and Right) --- */}
        {/* Left strings and plate */}
        <g stroke={accentColor} strokeWidth="0.75" fill="none">
          <line x1="18" y1="38" x2="10" y2="58" />
          <line x1="18" y1="38" x2="26" y2="58" />
        </g>
        <path d="M9 58 C9 65 27 65 27 58 Z" fill={accentColor} />

        {/* Right strings and plate */}
        <g stroke={accentColor} strokeWidth="0.75" fill="none">
          <line x1="82" y1="38" x2="74" y2="58" />
          <line x1="82" y1="38" x2="90" y2="58" />
        </g>
        <path d="M73 58 C73 65 91 65 91 58 Z" fill={accentColor} />

        {/* --- Central Trunk / Sword Stem (Forest Green) --- */}
        <path
          d="M48 42 L48 82 C48 85 50 87 50 87 C50 87 52 85 52 82 L52 42 Z"
          fill={primaryColor}
        />

        {/* --- Golden Helix Wrap Around Trunk --- */}
        <path
          d="M48 45 C 53 48, 53 52, 48 55 C 53 58, 53 62, 48 65 C 53 68, 53 72, 48 75 C 53 78, 53 82, 50 85"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-display text-base sm:text-xl tracking-[0.18em] font-medium uppercase leading-none ${
              inverse ? "text-ivory" : "text-forest"
            }`}
          >
            Olive
          </span>
          <span
            className={`font-sans text-[8px] sm:text-[10px] tracking-[0.25em] uppercase font-semibold leading-none mt-1 sm:mt-1.5 ${
              inverse ? "text-gold" : "text-gold"
            }`}
          >
            Law Firm
          </span>
        </div>
      )}
    </div>
  );
}
