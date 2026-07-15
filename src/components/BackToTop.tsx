import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const shouldShow = window.scrollY > 300;
      setIsVisible((prev) => (prev === shouldShow ? prev : shouldShow));
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="back-to-top"
          id="back-to-top-btn"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-24 right-6 z-40 bg-forest text-gold p-3.5 rounded-full border border-gold/30 shadow-2xl hover:bg-gold hover:text-forest transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
          aria-label="Scroll back to top"
        >
          <ArrowUp size={20} className="animate-pulse" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
