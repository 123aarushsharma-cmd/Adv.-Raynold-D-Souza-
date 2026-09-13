import React from "react";
import { motion } from "motion/react";
import Logo from "./Logo";
import { useFirmContent } from "../hooks/useFirmContent";

export default function Hero() {
  const { content } = useFirmContent();
  const hero = content.hero;

  return (
    <section
      id="home"
      className="relative bg-forest min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-20"
    >
      {/* 1. Underground Atmospheric Backlight & Warm Golden Aura to the Side */}
      <div 
        className="absolute top-1/2 right-0 md:right-[5%] lg:right-[8%] -translate-y-1/2 w-[340px] sm:w-[540px] md:w-[700px] lg:w-[860px] h-[340px] sm:h-[540px] md:h-[700px] lg:h-[860px] bg-gradient-to-br from-gold/25 via-forest-light/35 to-transparent rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" 
      />

      {/* 2. Majestic Underground Watermark Logo Positioned to the Side in the Background */}
      <div 
        className="absolute top-1/2 right-[-10%] sm:right-[-4%] md:right-[3%] lg:right-[6%] -translate-y-1/2 w-[320px] sm:w-[480px] md:w-[620px] lg:w-[760px] xl:w-[860px] h-[320px] sm:h-[480px] md:h-[620px] lg:h-[760px] xl:h-[860px] opacity-[0.22] mix-blend-screen pointer-events-none select-none flex items-center justify-center z-0 transition-opacity duration-1000"
        style={{
          filter: "drop-shadow(0 0 50px rgba(201,162,39,0.4))",
          maskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 85%)",
          WebkitMaskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 85%)"
        }}
        aria-hidden="true"
      >
        <Logo size={860} showText={false} variant="hero-3d" imgClassName="scale-110" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto py-8 sm:py-12 md:py-16">
        <div className="max-w-3xl text-center md:text-left mx-auto md:mx-0">
          {/* Powerful Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-ivory font-bold tracking-tight leading-[1.12] mb-6 sm:mb-8"
          >
            {hero.headlinePrefix} <br />
            <span className="text-gold font-serif italic font-normal">{hero.headlineHighlight}</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-ivory/90 font-sans leading-relaxed max-w-2xl font-light mx-auto md:mx-0"
          >
            {hero.subheadline}
          </motion.p>
        </div>
      </div>
    </section>
  );
}

