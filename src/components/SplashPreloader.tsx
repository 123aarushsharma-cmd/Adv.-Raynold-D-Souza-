import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SplashPreloaderProps {
  onComplete: () => void;
  key?: string;
}

export default function SplashPreloader({ onComplete }: SplashPreloaderProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Lock scroll on mount
    document.body.style.overflow = "hidden";
    
    // Stage 1: Reveal scale and leaves
    const t1 = setTimeout(() => setStep(1), 800);
    // Stage 2: Reveal Title and Subtitle
    const t2 = setTimeout(() => setStep(2), 1600);
    // Stage 3: Complete & Trigger Exit
    const t3 = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      // Re-enable scroll on unmount
      document.body.style.overflow = "unset";
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-forest overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle at center, #1e4235 0%, #0c1a15 100%)"
      }}
    >
      {/* Absolute Decorative Luxury Borders */}
      <div className="absolute inset-6 border border-gold/10 pointer-events-none rounded-sm" />
      <div className="absolute inset-8 border border-gold/5 pointer-events-none rounded-sm" />

      {/* Main Logo & Typography Container */}
      <div className="flex flex-col items-center text-center max-w-md px-6 select-none">
        
        {/* Animated Brand Scale Icon */}
        <div className="relative mb-6">
          {/* Subtle Outer Glow */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.15, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 bg-gold/40 rounded-full blur-3xl filter -m-10"
          />

          <svg
            width="120"
            height="120"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10"
          >
            {/* 1. Outer Frame Path */}
            <motion.circle
              cx="50"
              cy="50"
              r="46"
              stroke="#C9A227"
              strokeWidth="0.75"
              strokeOpacity="0.25"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* 2. Top Olive Leaves (Forest Green / Ivory) */}
            <g fill="#FAF9F6">
              {/* Central top leaf */}
              <motion.path 
                d="M50 25 C48.5 17 51.5 10 50 5 C48.5 10 51.5 17 50 25 Z" 
                initial={{ opacity: 0, y: -10 }}
                animate={step >= 1 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
              {/* Upper left leaf */}
              <motion.path 
                d="M48 26 C41 21 37.5 15 42 12 C46.5 15 47 21 48 26 Z" 
                initial={{ opacity: 0, x: -10, y: -5 }}
                animate={step >= 1 ? { opacity: 1, x: 0, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
              {/* Upper right leaf */}
              <motion.path 
                d="M52 26 C59 21 62.5 15 58 12 C53.5 15 53 21 52 26 Z" 
                initial={{ opacity: 0, x: 10, y: -5 }}
                animate={step >= 1 ? { opacity: 1, x: 0, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
              {/* Middle left leaf */}
              <motion.path 
                d="M47 29 C38 27 34 22 37.5 18 C41 22 44.5 25 47 29 Z" 
                initial={{ opacity: 0, x: -10 }}
                animate={step >= 1 ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
              {/* Middle right leaf */}
              <motion.path 
                d="M53 29 C62 27 66 22 62.5 18 C59 22 55.5 25 53 29 Z" 
                initial={{ opacity: 0, x: 10 }}
                animate={step >= 1 ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
              {/* Lower left leaf */}
              <motion.path 
                d="M47 31 C36 32 31.5 29.5 33 25 C37.5 27 43 29 47 31 Z" 
                initial={{ opacity: 0, x: -5, y: 5 }}
                animate={step >= 1 ? { opacity: 1, x: 0, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
              {/* Lower right leaf */}
              <motion.path 
                d="M53 31 C64 32 68.5 29.5 67 25 C62.5 27 57 29 53 31 Z" 
                initial={{ opacity: 0, x: 5, y: 5 }}
                animate={step >= 1 ? { opacity: 1, x: 0, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
            </g>

            {/* 3. Golden Balance Beam */}
            <motion.g 
              fill="#C9A227"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={step >= 1 ? { opacity: 1, scaleY: 1 } : {}}
              transition={{ duration: 0.6, type: "spring" }}
            >
              {/* Left sweeping arm */}
              <path d="M50 42 C40 38 28 34 18 38 C16 38.5 16 39.5 18 40 C28 42 40 44 50 42 Z" />
              {/* Right sweeping arm */}
              <path d="M50 42 C60 38 72 34 82 38 C84 38.5 84 39.5 82 40 C72 42 60 44 50 42 Z" />
              {/* Small center decorative node */}
              <circle cx="50" cy="41" r="2.5" />
            </motion.g>

            {/* 4. Hanging Scales (Left and Right strings and plates) */}
            <motion.g 
              stroke="#C9A227" 
              strokeWidth="0.75" 
              fill="none"
              initial={{ opacity: 0, y: -20 }}
              animate={step >= 1 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, type: "spring", delay: 0.3 }}
            >
              <line x1="18" y1="38" x2="10" y2="58" />
              <line x1="18" y1="38" x2="26" y2="58" />
              <path d="M9 58 C9 65 27 65 27 58 Z" fill="#C9A227" stroke="none" />

              <line x1="82" y1="38" x2="74" y2="58" />
              <line x1="82" y1="38" x2="90" y2="58" />
              <path d="M73 58 C73 65 91 65 91 58 Z" fill="#C9A227" stroke="none" />
            </motion.g>

            {/* 5. Central Sword Trunk (Ivory) */}
            <motion.path
              d="M48 42 L48 82 C48 85 50 87 50 87 C50 87 52 85 52 82 L52 42 Z"
              fill="#FAF9F6"
              initial={{ scaleY: 0 }}
              animate={step >= 1 ? { scaleY: 1 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ originY: 0 }}
            />

            {/* 6. Golden Helix Wrap around trunk */}
            <motion.path
              d="M48 45 C 53 48, 53 52, 48 55 C 53 58, 53 62, 48 65 C 53 68, 53 72, 48 75 C 53 78, 53 82, 50 85"
              stroke="#C9A227"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={step >= 1 ? { pathLength: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.4 }}
            />
          </svg>
        </div>

        {/* Brand Text Reveal */}
        <div className="overflow-hidden py-1 h-14">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={step >= 1 ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-3xl sm:text-4xl text-ivory tracking-[0.25em] uppercase font-medium"
          >
            OLIVE
          </motion.h1>
        </div>

        <div className="overflow-hidden py-0.5 h-6">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={step >= 1 ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-[10px] sm:text-xs text-gold tracking-[0.3em] uppercase font-semibold"
          >
            LAW FIRM
          </motion.p>
        </div>

        {/* Professional Latin Creed / Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={step >= 2 ? { opacity: 0.8 } : {}}
          transition={{ duration: 1 }}
          className="mt-6 flex items-center justify-center gap-2.5 text-[8.5px] tracking-[0.2em] font-medium text-ivory/60 uppercase font-sans border-t border-gold/10 pt-4 w-64"
        >
          <span>Integrity</span>
          <span className="w-1 h-1 bg-gold rounded-full" />
          <span>Advocacy</span>
          <span className="w-1 h-1 bg-gold rounded-full" />
          <span>Justice</span>
        </motion.div>

        {/* Center Progress/Loading bar */}
        <div className="relative mt-8 w-48 h-[1px] bg-gold/10 overflow-hidden mx-auto">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 2.2, ease: "easeInOut", repeat: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-gold to-transparent"
          />
        </div>

      </div>
    </motion.div>
  );
}
