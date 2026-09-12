import React from "react";
import { motion } from "motion/react";

interface SectionHeaderRevealProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  alignment?: "center" | "left" | "right";
  theme?: "light" | "dark";
  className?: string;
  showDivider?: boolean;
  maxWidth?: string;
  delay?: number;
  children?: React.ReactNode;
}

export default function SectionHeaderReveal({
  eyebrow,
  title,
  subtitle,
  alignment = "center",
  theme = "light",
  className = "",
  showDivider = true,
  maxWidth = "max-w-3xl",
  delay = 0,
  children
}: SectionHeaderRevealProps) {
  const isDark = theme === "dark";
  const alignClasses = {
    center: "text-center items-center mx-auto",
    left: "text-left items-start mr-auto",
    right: "text-right items-end ml-auto"
  }[alignment];

  const flexAlign = {
    center: "justify-center",
    left: "justify-start",
    right: "justify-end"
  }[alignment];

  const lineOrigin = {
    center: "origin-center",
    left: "origin-left",
    right: "origin-right"
  }[alignment];

  // Cinematic container variants with orchestrated stagger
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: delay / 1000,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const lineVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -40px 0px" }}
      variants={containerVariants}
      className={`flex flex-col ${alignClasses} ${maxWidth} ${className} relative z-10`}
    >
      {/* 1. Cinematic Eyebrow / Category Tag */}
      {eyebrow && (
        <motion.div
          variants={itemVariants}
          className={`flex items-center gap-2 mb-3.5 ${flexAlign}`}
        >
          <motion.span
            variants={lineVariants}
            className={`w-8 h-px ${isDark ? "bg-gold/60" : "bg-gold"} ${lineOrigin}`}
          />
          <span
            className={`font-sans text-xs sm:text-sm font-bold tracking-[0.22em] uppercase ${
              isDark ? "text-gold" : "text-gold"
            }`}
          >
            {eyebrow}
          </span>
          {alignment === "center" && (
            <motion.span
              variants={lineVariants}
              className={`w-8 h-px ${isDark ? "bg-gold/60" : "bg-gold"} origin-center`}
            />
          )}
        </motion.div>
      )}

      {/* 2. Main High-Contrast Serif Headline */}
      <motion.h2
        variants={itemVariants}
        className={`text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight leading-[1.18] ${
          isDark ? "text-ivory" : "text-forest"
        }`}
      >
        {title}
      </motion.h2>

      {/* 3. Expanding Gold Accent Divider */}
      {showDivider && (
        <motion.div
          variants={lineVariants}
          className={`mt-5 mb-1 h-[1.5px] w-14 bg-gradient-to-r ${
            isDark
              ? "from-gold/40 via-gold to-gold/40"
              : "from-gold/50 via-gold to-gold/50"
          } ${alignment === "center" ? "mx-auto origin-center" : alignment === "left" ? "mr-auto origin-left" : "ml-auto origin-right"}`}
        />
      )}

      {/* 4. Smooth Cinematic Subtitle */}
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className={`font-sans text-sm sm:text-base leading-relaxed font-light mt-4 ${
            isDark ? "text-ivory/80" : "text-charcoal/75"
          }`}
        >
          {subtitle}
        </motion.p>
      )}

      {/* Optional custom children */}
      {children && (
        <motion.div variants={itemVariants} className="w-full mt-4">
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
