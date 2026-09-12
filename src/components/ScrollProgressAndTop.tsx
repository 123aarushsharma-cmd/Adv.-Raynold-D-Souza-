import React from "react";
import { motion, useScroll, useSpring } from "motion/react";

export default function ScrollProgressAndTop() {
  const { scrollYProgress } = useScroll();

  // Smooth spring physics for 60-120fps progress bar rendering
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    /* Ultra-Smooth 60-120 FPS GPU-Accelerated Scroll Progress Indicator */
    <motion.div
      id="site-scroll-progress-bar"
      className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-gold/60 via-gold to-[#f0d36b] origin-left z-[100] shadow-[0_0_8px_rgba(201,162,39,0.5)] pointer-events-none"
      style={{ scaleX, willChange: "transform" }}
      aria-hidden="true"
    />
  );
}
