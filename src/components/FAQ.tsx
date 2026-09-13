import React, { useState } from "react";
import { ChevronDown, MessageSquare, PhoneCall, HelpCircle, ShieldCheck, Clock, FileText, MapPin, Scale } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SectionHeaderReveal from "./SectionHeaderReveal";
import { useFirmContent } from "../hooks/useFirmContent";

interface FAQItem {
  id: string;
  question: string;
  category: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  answer: string;
  highlights?: string[];
}

const getIconForCategory = (category: string) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("document") || cat.includes("preparation")) return FileText;
  if (cat.includes("privacy") || cat.includes("confidential")) return ShieldCheck;
  if (cat.includes("urgent") || cat.includes("timeline")) return Clock;
  if (cat.includes("location") || cat.includes("office") || cat.includes("meeting")) return MapPin;
  if (cat.includes("consultation")) return Scale;
  return HelpCircle;
};

const defaultFaqs: FAQItem[] = [
  {
    id: "consultation-expectations",
    category: "First Consultation",
    icon: Scale,
    question: "What should I expect when meeting an advocate for the first time?",
    answer: "You will receive an honest, attentive listening ear and a straightforward assessment of where you stand. We believe in being completely transparent from day one—no false promises, no confusing legal jargon, and no hidden charges. We will walk you through your real chances of success, discuss fees clearly upfront, and give you a calm, sensible step-by-step plan for what to do next.",
    highlights: ["Honest case appraisal with zero false hopes", "Transparent fee breakdown before any commitment", "Actionable roadmap tailored to your situation"]
  },
  {
    id: "documents-to-carry",
    category: "Preparation",
    icon: FileText,
    question: "What documents should I prepare and bring to my consultation?",
    answer: "Bring whatever papers you currently have on hand. For property matters, bring sale deeds, parent deeds, or khata copies; for criminal matters, bring the FIR copy, notices, or remand papers; for employment or tribunal disputes, bring your appointment letter or show-cause notice. Even if your records are incomplete or disorganized, do not worry—our advocates will personally sit with you and help sort through everything.",
    highlights: ["Bring whatever documents you have—even if incomplete", "FIR, deeds, notices, contracts, or court summons", "We will help piece the facts together with you"]
  },
  {
    id: "confidentiality-guarantee",
    category: "Client Privacy",
    icon: ShieldCheck,
    question: "How does Olive Law Firm protect my personal privacy and case information?",
    answer: "Your privacy is our utmost responsibility. Under Section 126 of the Indian Evidence Act, 1872, every word spoken, every document shared, and every strategy discussed is protected under strict attorney-client privilege. We store all files on an encrypted internal server, and we never share your identity, personal details, or legal papers with any third party.",
    highlights: ["Protected under statutory attorney-client privilege", "Strict internal confidentiality protocols", "Zero third-party disclosure under any circumstances"]
  },
  {
    id: "urgent-matter-timelines",
    category: "Urgent Relief",
    icon: Clock,
    question: "How fast can you step in for urgent matters like anticipatory bail or stay orders?",
    answer: "When someone's personal liberty or property is at imminent risk, our legal team moves immediately. We fast-track emergency anticipatory bail petitions and urgent High Court stay petitions, preparing and filing them within hours. For general civil suits, property clearances, and tribunal petitions, we typically take 3 to 5 business days to build a thorough, watertight draft.",
    highlights: ["Emergency bail & stay petitions drafted within hours", "Immediate court intervention for imminent threats", "3 to 5 business days for standard civil and tribunal filings"]
  },
  {
    id: "satellite-offices",
    category: "Locations & Meetings",
    icon: MapPin,
    question: "Can I schedule a consultation at your Dharwad or Belagavi satellite locations?",
    answer: "Yes, absolutely. While Advocate Reynold D'Souza's primary office is in Bengaluru, our associate advocates actively manage satellite offices in Dharwad and Belagavi for in-person meetings. If traveling is difficult, we also offer confidential phone calls or secure video consultations from the comfort of your home.",
    highlights: ["In-person consultations in Bengaluru, Dharwad & Belagavi", "Secure video-conferencing available across India & abroad", "Flexible scheduling to accommodate your convenience"]
  }
];

export default function FAQ() {
  const { content } = useFirmContent();
  const faqs = content.faqs && content.faqs.length > 0 ? content.faqs : defaultFaqs;
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFAQ = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-10 sm:py-12 bg-[#FBF9F5] border-t border-forest/10 relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none motif-bg" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Reveal-on-Scroll Section Header - Compact & Elegant */}
        <SectionHeaderReveal
          eyebrow="FAQ Dossier"
          title="Frequently Asked Questions"
          subtitle="Straightforward, human answers on consultations, required documents, and what to expect when working with Olive Law Firm."
          alignment="center"
          maxWidth="max-w-2xl"
          className="mb-7"
        />

        {/* Compact Accordion Group */}
        <div className="space-y-2.5" id="faq-accordion-group" role="region" aria-label="Frequently Asked Questions list">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            const Icon = (faq as any).icon || getIconForCategory(faq.category);

            return (
              <div
                key={faq.id}
                className={`border rounded-sm transition-all duration-200 overflow-hidden ${
                  isOpen 
                    ? "bg-white border-gold/40 shadow-sm ring-1 ring-gold/20" 
                    : "bg-white/80 border-forest/10 hover:border-gold/30 hover:bg-white"
                }`}
              >
                <button
                  id={`faq-btn-${idx}`}
                  onClick={() => toggleFAQ(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      const nextBtn = document.getElementById(`faq-btn-${(idx + 1) % faqs.length}`);
                      nextBtn?.focus();
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      const prevBtn = document.getElementById(`faq-btn-${(idx - 1 + faqs.length) % faqs.length}`);
                      prevBtn?.focus();
                    } else if (e.key === "Home") {
                      e.preventDefault();
                      document.getElementById("faq-btn-0")?.focus();
                    } else if (e.key === "End") {
                      e.preventDefault();
                      document.getElementById(`faq-btn-${faqs.length - 1}`)?.focus();
                    }
                  }}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left transition-colors cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                >
                  <div className="flex items-center gap-3 pr-2 min-w-0">
                    <div className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? "bg-gold text-forest" : "bg-forest/5 text-forest/70 group-hover:bg-gold/20 group-hover:text-gold"
                    }`} aria-hidden="true">
                      <Icon size={15} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-gold block leading-none mb-1">
                        {faq.category}
                      </span>
                      <h3 className={`font-serif text-sm sm:text-base font-semibold leading-snug transition-colors ${
                        isOpen ? "text-forest" : "text-forest/90 group-hover:text-gold"
                      }`}>
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isOpen ? "bg-forest text-gold rotate-180" : "text-charcoal/40 group-hover:text-forest"
                  }`} aria-hidden="true">
                    <ChevronDown size={14} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${idx}`}
                      role="region"
                      aria-labelledby={`faq-btn-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5 border-t border-forest/5 bg-sage-light/10">
                        <p className="font-sans text-xs sm:text-sm text-charcoal/80 leading-relaxed font-normal">
                          {faq.answer}
                        </p>

                        {faq.highlights && faq.highlights.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-forest/5 flex flex-wrap gap-2">
                            {faq.highlights.map((item, hIdx) => (
                              <span 
                                key={hIdx}
                                className="inline-flex items-center text-[11px] font-sans font-medium text-forest/85 bg-white border border-gold/20 rounded px-2 py-0.5"
                              >
                                <span className="w-1 h-1 rounded-full bg-gold mr-1.5 shrink-0" aria-hidden="true" />
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Compact 1-line Help Note (Short, clean, doesn't inflate page height) */}
        <div className="mt-5 p-3 rounded-sm bg-forest/5 border border-forest/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <HelpCircle size={15} className="text-gold shrink-0 hidden sm:block" aria-hidden="true" />
            <p className="font-sans text-xs text-charcoal/80">
              Have a specific question about your matter? Reach our team directly at{" "}
              <a href="tel:+919740577775" className="text-forest font-semibold underline decoration-gold hover:text-gold transition-colors focus-visible:ring-1 focus-visible:ring-gold rounded">
                +91 97405 77775
              </a>
              {" "}or schedule an intake review.
            </p>
          </div>
          <a
            href="#contact"
            className="text-[11px] font-sans font-bold tracking-wider uppercase bg-forest text-gold hover:bg-forest-light px-3.5 py-1.5 rounded-sm transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            Initiate Consultation
          </a>
        </div>

      </div>
    </section>
  );
}
