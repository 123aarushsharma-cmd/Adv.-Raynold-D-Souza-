import React from "react";
import { motion } from "motion/react";

interface ScrollAnimateProps {
  children: React.ReactNode;
  delay?: number; // Delay in milliseconds
  className?: string;
  variant?: "fade-up" | "fade-in" | "fade-right" | "fade-left" | "zoom-in";
  duration?: number;
  id?: string;
}

export default function ScrollAnimate({
  children,
  delay = 0,
  className = "",
  variant = "fade-up",
  duration = 0.9,
  id,
}: ScrollAnimateProps) {
  const variants = {
    "fade-up": {
      hidden: { opacity: 0, y: 35 },
      visible: { opacity: 1, y: 0 },
    },
    "fade-in": {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    "fade-right": {
      hidden: { opacity: 0, x: -35 },
      visible: { opacity: 1, x: 0 },
    },
    "fade-left": {
      hidden: { opacity: 0, x: 35 },
      visible: { opacity: 1, x: 0 },
    },
    "zoom-in": {
      hidden: { opacity: 0, scale: 0.94 },
      visible: { opacity: 1, scale: 1 },
    },
  };

  return (
    <motion.div
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={variants[variant]}
      transition={{
        duration: duration,
        delay: delay / 1000,
        ease: [0.16, 1, 0.3, 1], // Sophisticated modern spring-ease cubic-bezier curve
      }}
      style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
