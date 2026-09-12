import React from "react";
import { useBrandLogo } from "../hooks/useBrandLogo";

interface LogoProps {
  className?: string;
  imgClassName?: string;
  size?: number;
  showText?: boolean;
  inverse?: boolean;
}

export default function Logo({
  className = "",
  imgClassName = "",
  size = 40,
  showText = true,
  inverse = false,
}: LogoProps) {
  const { logoSrc } = useBrandLogo();

  const logoImage = (
    <div
      className={`relative flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 ${
        !showText ? className : ""
      } ${imgClassName}`}
      style={{ width: size, height: size }}
    >
      <img
        src={logoSrc}
        alt="Olive Law Firm® Logo"
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-contain ${
          inverse
            ? "drop-shadow-[0_2px_12px_rgba(201,162,39,0.35)] brightness-105"
            : "drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
        }`}
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
      </div>
    </div>
  );
}

