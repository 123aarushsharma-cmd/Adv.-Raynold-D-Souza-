import React from "react";
import { useBrandLogo } from "../hooks/useBrandLogo";

interface LogoProps {
  className?: string;
  imgClassName?: string;
  size?: number;
  showText?: boolean;
  showLocations?: boolean;
  inverse?: boolean;
  variant?: "standard" | "seal" | "watermark" | "transparent" | "hero-3d";
}

export default function Logo({
  className = "",
  imgClassName = "",
  size = 40,
  showText = true,
  showLocations = false,
  inverse = false,
  variant = "standard"
}: LogoProps) {
  const { logoSrc } = useBrandLogo();

  if (variant === "hero-3d") {
    return (
      <div 
        className={`relative flex items-center justify-center shrink-0 group ${className}`}
        style={{ width: "100%", height: "100%", maxWidth: size, maxHeight: size }}
      >
        <img
          src={logoSrc}
          alt="Olive Law Firm® Emblem"
          width={size}
          height={size}
          decoding="async"
          loading="eager"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-contain pointer-events-none select-none transition-transform duration-700 hover:scale-[1.03] gpu-layer ${imgClassName}`}
        />
      </div>
    );
  }

  if (variant === "watermark" || variant === "transparent") {
    return (
      <div 
        className={`relative flex items-center justify-center shrink-0 ${className} ${imgClassName}`}
        style={{ width: size, height: size }}
      >
        <img
          src={logoSrc}
          alt="Olive Law Firm®"
          width={size}
          height={size}
          decoding="async"
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    );
  }

  if (variant === "seal") {
    return (
      <div 
        className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden bg-white border-2 border-gold/80 shadow-[0_4px_18px_rgba(201,162,39,0.35)] flex items-center justify-center p-1.5">
          <img
            src={logoSrc}
            alt="Olive Law Firm® Insignia"
            width={size}
            height={size}
            decoding="async"
            loading="eager"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  const cardWidth = Math.round(size * 1.4);
  const cardHeight = size;

  const logoImage = (
    <div
      className={`relative flex items-center justify-center shrink-0 overflow-hidden rounded bg-white shadow-sm border border-gold/30 transition-transform duration-300 group-hover:scale-105 p-1 ${
        !showText ? className : ""
      } ${imgClassName}`}
      style={{ width: cardWidth, height: cardHeight }}
    >
      <img
        src={logoSrc}
        alt="Olive Law Firm® Insignia"
        width={cardWidth}
        height={cardHeight}
        decoding="async"
        loading="eager"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain pointer-events-none select-none"
      />
    </div>
  );

  if (!showText) {
    return logoImage;
  }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3.5 ${className}`}>
      {logoImage}
      <div className="flex flex-col justify-center">
        <span
          className={`font-serif text-[17px] sm:text-[20px] md:text-[22px] tracking-[0.16em] font-medium uppercase leading-tight ${
            inverse ? "text-ivory" : "text-forest"
          }`}
        >
          Olive®
        </span>
        <span
          className="font-sans text-[8.5px] sm:text-[9.5px] md:text-[10px] tracking-[0.24em] uppercase font-semibold leading-tight mt-0.5 text-gold"
        >
          Law Firm®
        </span>
        {showLocations && (
          <span
            className={`font-sans text-[8px] sm:text-[9px] tracking-wider uppercase font-medium mt-0.5 ${
              inverse ? "text-ivory/70" : "text-forest/70"
            }`}
          >
            Bengaluru • Dharwad • Belagavi
          </span>
        )}
      </div>
    </div>
  );
}

