import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import firmLogo from "../assets/logo.png";

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
            animate={{ opacity: [0, 0.25, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 bg-gold/40 rounded-full blur-3xl filter -m-10"
          />

          {/* Animated Logo Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75, rotate: -5 }}
            animate={step >= 1 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.75, rotate: -5 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-32 h-32 flex items-center justify-center p-3 rounded-full border border-gold/40 bg-forest/80 backdrop-blur-md shadow-[0_8px_32px_rgba(201,162,39,0.3)]"
          >
            <img
              src={firmLogo}
              alt="Olive Law Chambers® Official Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain drop-shadow-[0_2px_14px_rgba(201,162,39,0.4)] brightness-105"
            />
          </motion.div>
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
