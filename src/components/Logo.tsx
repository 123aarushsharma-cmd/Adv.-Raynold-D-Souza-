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
          alt="Olive Law Firm® 3D Emblem"
          width={size}
          height={size}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-contain pointer-events-none select-none emblem-3d-shadow transition-transform duration-700 hover:scale-[1.03] ${imgClassName}`}
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
          alt="Olive Law Firm® Watermark"
          width={size}
          height={size}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-none"
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
        {/* Subtle ambient gold aura */}
        <div className="absolute -inset-1.5 bg-gold/25 rounded-full blur-md group-hover:bg-gold/40 transition-all duration-500 pointer-events-none" />
        
        {/* Outer concentric metallic gold frame */}
        <div className="relative w-full h-full p-1 rounded-full bg-gradient-to-br from-gold/30 via-gold/10 to-transparent border border-gold/70 shadow-[0_4px_18px_rgba(201,162,39,0.35)] flex items-center justify-center">
          {/* Inner medallion with transparent 3D logo */}
          <div className="w-full h-full rounded-full flex items-center justify-center p-1 overflow-hidden">
            <img
              src={logoSrc}
              alt="Olive Law Firm® Insignia"
              width={size}
              height={size}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain transform scale-105 emblem-3d-shadow transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        </div>
      </div>
    );
  }

  const logoImage = (
    <div
      className={`relative flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 ${
        !showText ? className : ""
      } ${imgClassName}`}
      style={{ width: size, height: size }}
    >
      <img
        src={logoSrc}
        alt="Olive Law Firm® Insignia"
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
      />
    </div>
  );

  if (!showText) {
    return logoImage;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoImage}
      <div className="flex flex-col">
        <span
          className={`font-display text-base sm:text-xl tracking-[0.18em] font-medium uppercase leading-none ${
            inverse ? "text-ivory" : "text-forest"
          }`}
        >
          Olive®
        </span>
        <span
          className="font-sans text-[8px] sm:text-[10px] tracking-[0.25em] uppercase font-semibold leading-none mt-1 sm:mt-1.5 text-gold"
        >
          Law Firm®
        </span>
        {showLocations && (
          <span
            className={`font-sans text-[8px] tracking-wider uppercase font-medium mt-0.5 ${
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

