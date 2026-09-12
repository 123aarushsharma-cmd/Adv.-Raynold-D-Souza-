import React from "react";
import { motion } from "motion/react";
import { Shield } from "lucide-react";
import Logo from "./Logo";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen bg-forest flex items-center justify-center overflow-hidden pt-24 md:pt-28"
    >
      {/* Background Motifs */}
      <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FAF9F6" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Subtle Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Giant Custom Logo Background Watermark */}
      <div className="absolute right-[-80px] bottom-[-40px] md:right-[-20px] md:bottom-[-10px] w-[350px] md:w-[580px] h-auto opacity-[0.08] pointer-events-none select-none">
        <Logo size={580} showText={false} variant="watermark" />
      </div>

      {/* Floating Leaf Particles */}
      <div className="absolute top-1/4 left-10 opacity-35 pointer-events-none select-none animate-bounce" style={{ animationDuration: "5s" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gold">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 12 22 12 22C12 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18Z" fill="currentColor" fillOpacity="0.4"/>
        </svg>
      </div>
      <div className="absolute bottom-1/4 right-1/4 opacity-25 pointer-events-none select-none animate-pulse" style={{ animationDuration: "3s" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gold">
          <path d="M21 3C11.61 3 4 10.61 4 20H6C6 11.73 12.73 5 21 5V3Z" fill="currentColor" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12 md:py-20">
        <div className="max-w-4xl flex flex-col justify-center text-left">
          {/* Powerful Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-ivory font-bold tracking-tight leading-[1.15] mb-6"
          >
            Justice, Rooted in <br />
            <span className="text-gold font-serif italic font-normal">Uncompromising Integrity</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-ivory/85 font-sans leading-relaxed max-w-2xl font-light"
          >
            Advocate Reynold D'Souza stands as a dedicated guardian of rights and unyielding advocate for justice, litigating before high courts and tribunals with highly rigorous scholarship.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
