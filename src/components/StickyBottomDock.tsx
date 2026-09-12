import React, { useState, useRef, useEffect } from "react";
import { 
  PhoneCall, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  X,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StickyBottomDockProps {
  onOpenConsultationModal: () => void;
}

export default function StickyBottomDock({ 
  onOpenConsultationModal 
}: StickyBottomDockProps) {
  const [activeCard, setActiveCard] = useState<"call" | "intake" | null>(null);
  const callBtnRef = useRef<HTMLAnchorElement>(null);
  const intakeBtnRef = useRef<HTMLButtonElement>(null);
  const callCardCloseRef = useRef<HTMLButtonElement>(null);
  const intakeCardCloseRef = useRef<HTMLButtonElement>(null);

  // Close floating cards on Escape key globally or when focus leaves
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeCard) {
        if (activeCard === "call") {
          callBtnRef.current?.focus();
        } else if (activeCard === "intake") {
          intakeBtnRef.current?.focus();
        }
        setActiveCard(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCard]);

  return (
    <aside 
      id="sticky-bottom-action-dock" 
      aria-label="Quick Action Floating Toolbar"
      className="fixed bottom-20 sm:bottom-8 right-3 sm:right-6 z-40 flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-auto"
    >
      {/* 1. TOP BUTTON: CALL (LOGO ONLY, UPER) */}
      <div 
        className="relative" 
        id="sticky-dock-call-wrapper"
        onMouseEnter={() => setActiveCard("call")}
        onMouseLeave={() => setActiveCard(null)}
      >
        {/* Floating Detail Card Emerging from Left on Desktop / Above on Mobile */}
        <AnimatePresence>
          {activeCard === "call" && (
            <motion.div 
              key="call-card"
              id="sticky-dock-call-card"
              role="region"
              aria-label="Direct Phone Helpline Details"
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 bottom-full mb-3 sm:mb-0 sm:bottom-0 sm:right-full sm:mr-3.5 z-50 pointer-events-auto"
            >
              <div className="w-[calc(100vw-2rem)] max-w-[310px] sm:w-80 bg-forest/98 backdrop-blur-2xl border border-gold/40 rounded-xl p-4 shadow-[0_20px_45px_rgba(0,0,0,0.6)] text-ivory relative overflow-hidden ring-1 ring-gold/25">
                {/* Top golden glowing ambient line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
                
                <div className="flex items-start justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gold/15 text-gold flex items-center justify-center shrink-0 border border-gold/30 shadow-inner" aria-hidden="true">
                      <PhoneCall size={16} />
                    </div>
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-widest text-gold font-bold block leading-none mb-1">
                        Direct Helpline
                      </span>
                      <h3 className="font-serif text-sm sm:text-base font-bold text-ivory leading-tight">
                        Adv. Reynold D'Souza
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-sans font-semibold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                      Available
                    </span>
                    <button
                      ref={callCardCloseRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCard(null);
                        callBtnRef.current?.focus();
                      }}
                      className="w-6 h-6 rounded hover:bg-gold/20 text-ivory/70 hover:text-gold flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                      title="Close helpline details"
                      aria-label="Close helpline details"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <p className="font-sans text-[11px] sm:text-xs text-ivory/80 leading-relaxed font-light mb-3">
                  Direct line for urgent criminal bail, High Court stay petitions, and immediate confidential counsel.
                </p>

                <a 
                  href="tel:+919740577775" 
                  className="w-full py-2.5 px-3 mb-2 rounded-lg bg-gold hover:bg-gold-hover text-forest text-center font-sans font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 group/call focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  id="sticky-bottom-direct-call"
                  aria-label="Call Advocate Reynold D'Souza directly at +91 97405 77775"
                >
                  <PhoneCall size={15} className="shrink-0 transition-transform group-hover/call:scale-110" aria-hidden="true" />
                  <span>+91 97405 77775</span>
                </a>

                <div className="pt-2 border-t border-gold/15 flex items-center justify-between text-[10px] font-sans text-ivory/60">
                  <span className="flex items-center gap-1">
                    <Clock size={11} className="text-gold" aria-hidden="true" />
                    <span>Immediate response</span>
                  </span>
                  <span>Bengaluru · Dharwad</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circular Call Button (Top, Uper) with Continuous Radar Glow Animation */}
        <motion.a
          ref={callBtnRef}
          href="tel:+919740577775"
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-forest text-gold border-2 border-gold/45 hover:border-gold shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_0_22px_rgba(201,162,39,0.5)] flex items-center justify-center cursor-pointer transition-colors duration-200 group focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-forest focus-visible:outline-none"
          title="Direct Call Helpline: +91 97405 77775 (Press Alt+Down or hover to view details)"
          id="sticky-call-btn"
          aria-label="Call Advocate Reynold D'Souza at +91 97405 77775"
          aria-haspopup="dialog"
          aria-expanded={activeCard === "call"}
          aria-controls="sticky-dock-call-card"
          onFocus={() => setActiveCard("call")}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || (e.altKey && e.key === "ArrowDown")) {
              e.preventDefault();
              setActiveCard("call");
            }
          }}
        >
          {/* Animated radar rings expanding outward */}
          <motion.span 
            className="absolute inset-0 rounded-full border border-gold/40 pointer-events-none" 
            animate={{ scale: [1, 1.35, 1.55], opacity: [0.6, 0.2, 0] }} 
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }} 
            aria-hidden="true"
          />

          <PhoneCall size={19} className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" aria-hidden="true" />
          
          {/* Live availability indicator badge */}
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-forest shadow-sm" aria-hidden="true" />
        </motion.a>
      </div>

      {/* 2. BOTTOM BUTTON: CLIENT INTAKE (LOGO ONLY, NICHE) */}
      <div 
        className="relative" 
        id="sticky-dock-intake-wrapper"
        onMouseEnter={() => setActiveCard("intake")}
        onMouseLeave={() => setActiveCard(null)}
      >
        {/* Floating Detail Card Emerging from Left on Desktop / Above on Mobile */}
        <AnimatePresence>
          {activeCard === "intake" && (
            <motion.div 
              key="intake-card"
              id="sticky-dock-intake-card"
              role="region"
              aria-label="Client Intake and Consultation Summary"
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 bottom-full mb-3 sm:mb-0 sm:bottom-0 sm:right-full sm:mr-3.5 z-50 pointer-events-auto"
            >
              <div className="w-[calc(100vw-2rem)] max-w-[310px] sm:w-80 bg-forest/98 backdrop-blur-2xl border border-gold/40 rounded-xl p-4 shadow-[0_20px_45px_rgba(0,0,0,0.6)] text-ivory relative overflow-hidden ring-1 ring-gold/25">
                {/* Top golden glowing ambient line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
                
                <div className="flex items-start justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gold text-forest flex items-center justify-center shrink-0 shadow-sm" aria-hidden="true">
                      <FileText size={16} />
                    </div>
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-widest text-gold font-bold block leading-none mb-1">
                        Admissions Desk
                      </span>
                      <h3 className="font-serif text-sm sm:text-base font-bold text-ivory leading-tight">
                        Case Intake Consultation
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-sans font-semibold tracking-wider uppercase bg-gold/15 text-gold border border-gold/30 rounded-full">
                      <ShieldCheck size={10} aria-hidden="true" />
                      Privileged
                    </span>
                    <button
                      ref={intakeCardCloseRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCard(null);
                        intakeBtnRef.current?.focus();
                      }}
                      className="w-6 h-6 rounded hover:bg-gold/20 text-ivory/70 hover:text-gold flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                      title="Close intake details"
                      aria-label="Close intake details"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <p className="font-sans text-[11px] sm:text-xs text-ivory/80 leading-relaxed font-light mb-3">
                  Submit your case brief for strategic evaluation by Advocate Reynold D'Souza. Protected under Section 126 of the Evidence Act.
                </p>

                <div className="space-y-1.5 mb-3 border-y border-gold/15 py-2.5 text-[11px] font-sans text-ivory/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-gold shrink-0" aria-hidden="true" />
                    <span>High Court, Trial Courts &amp; Tribunals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-gold shrink-0" aria-hidden="true" />
                    <span>Statutory legal opinion &amp; merit review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-gold shrink-0" aria-hidden="true" />
                    <span>Turnaround within 1 business day</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveCard(null);
                    onOpenConsultationModal();
                  }}
                  className="w-full py-2.5 px-3 rounded-lg bg-gold hover:bg-gold-hover text-forest font-sans font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg active:scale-95 group/btn focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  id="sticky-bottom-intake-submit"
                  aria-label="Open full Case Intake Form"
                >
                  <Sparkles size={14} className="text-forest transition-transform group-hover/btn:rotate-12" aria-hidden="true" />
                  <span>Initiate Case Intake</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circular Intake Button (Bottom, Niche) with Radiant Burnished Gold Animation */}
        <motion.button
          ref={intakeBtnRef}
          onClick={onOpenConsultationModal}
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-gold via-gold-hover to-[#9B7A18] text-forest border-2 border-gold-hover shadow-[0_8px_24px_rgba(201,162,39,0.35)] hover:shadow-[0_0_24px_rgba(201,162,39,0.6)] flex items-center justify-center cursor-pointer transition-colors duration-200 group focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-gold focus-visible:outline-none"
          title="Client Intake & Case Consultation"
          id="sticky-intake-btn"
          aria-label="Open Client Intake Consultation Form"
          aria-haspopup="dialog"
          aria-expanded={activeCard === "intake"}
          aria-controls="sticky-dock-intake-card"
          onFocus={() => setActiveCard("intake")}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || (e.altKey && e.key === "ArrowDown")) {
              e.preventDefault();
              setActiveCard("intake");
            }
          }}
        >
          {/* Animated radar rings expanding outward with delay */}
          <motion.span 
            className="absolute inset-0 rounded-full border border-gold/50 pointer-events-none" 
            animate={{ scale: [1, 1.35, 1.55], opacity: [0.5, 0.15, 0] }} 
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 1.1 }} 
            aria-hidden="true"
          />

          <FileText size={19} className="transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
          
          {/* Subtle gold badge dot */}
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-forest border-2 border-gold flex items-center justify-center shadow-sm" aria-hidden="true">
            <span className="w-1 h-1 rounded-full bg-gold animate-ping" />
          </span>
        </motion.button>
      </div>
    </aside>
  );
}
