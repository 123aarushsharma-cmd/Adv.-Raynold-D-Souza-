import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

interface DisclaimerModalProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export default function DisclaimerModal({ onOpenPrivacy, onOpenTerms }: DisclaimerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("olive_law_disclaimer_accepted");
    if (!accepted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 400); // Trigger shortly after initial render
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAgree = () => {
    const nowIso = new Date().toISOString();
    localStorage.setItem("olive_law_disclaimer_accepted", "true");
    localStorage.setItem("olive_law_disclaimer_timestamp", nowIso);
    
    // Store compliance audit record directly in database without UI clutter
    try {
      addDoc(collection(db, "compliance_audit_logs"), {
        consentType: "BAR_COUNCIL_OF_INDIA_RULE_36",
        status: "ACKNOWLEDGED",
        timestamp: Timestamp.now(),
        isoDate: nowIso,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        statutoryBasis: "Advocates Act 1961 & DPDPA 2023",
        firm: "Olive Law Firm"
      }).catch(() => {});
    } catch (e) {
      // Non-blocking fallback
    }

    setIsOpen(false);
  };

  const handleDisagree = () => {
    setIsDeclined(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-forest/90 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-title"
          id="bar-council-disclaimer-modal"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 220, damping: 25 }}
            className="w-full max-w-2xl bg-white text-neutral-900 rounded-lg shadow-2xl border border-gold/30 overflow-hidden my-8"
          >
            {/* Top Header Bar */}
            <div className="bg-forest text-ivory px-6 py-4 flex items-center justify-between border-b border-gold/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gold/20 text-gold flex items-center justify-center border border-gold/40">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h2 id="disclaimer-title" className="font-serif text-lg sm:text-xl font-bold tracking-wide text-ivory">
                    DISCLAIMER & CONFIRMATION
                  </h2>
                  <span className="text-[10px] font-sans text-gold tracking-widest uppercase font-semibold">
                    Bar Council of India Regulations
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto text-xs sm:text-sm font-sans text-neutral-700 leading-relaxed bg-white">
              <p className="font-medium text-neutral-900">
                Under the rules of the Bar Council of India, OLIVE LAW FIRM is prohibited from soliciting work or advertising. By clicking, "I Agree" below, the user acknowledges that:
              </p>

              <ul className="space-y-3 pl-4 list-disc text-neutral-700">
                <li className="leading-relaxed">
                  There has been no advertisement, personal communication, solicitation, invitation or inducement of any sort whatsoever from Olive Law Firm or any of its members to solicit any work or advertise through this website.
                </li>
                <li className="leading-relaxed">
                  The purpose of this website is to provide the user with information about Olive Law Firm, its practice areas, its advocates and solicitors. This website is not intended to be a source of advertising or solicitation and the contents hereof should not be construed as legal advice in any manner whatsoever. In cases where the user requires any assistance, he/she must seek independent legal advice.
                </li>
                <li className="leading-relaxed">
                  The information about Olive Law Firm is provided to the user only on his/her specific request and any information obtained or materials downloaded from this website are completely at the user's volition and any transmission, receipt or use of this website would not create any lawyer-client relationship.
                </li>
                <li className="leading-relaxed font-medium text-neutral-900">
                  The content of this website is Intellectual Property of Olive Law Firm.
                </li>
              </ul>

              <div className="pt-3 border-t border-neutral-200 text-center text-xs text-neutral-600">
                Please read and accept our website's{" "}
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="text-forest font-bold underline hover:text-gold transition-colors cursor-pointer"
                >
                  Terms of Use
                </button>{" "}
                and our{" "}
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="text-forest font-bold underline hover:text-gold transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
                .
              </div>

              {isDeclined && (
                <div className="mt-4 p-4 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                  <AlertTriangle size={20} className="shrink-0 text-rose-600" />
                  <div>
                    <span className="font-bold block">Access Declined</span>
                    As per Bar Council of India regulations, you cannot access this professional website without acknowledging the disclaimer. You may close this browser tab.
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="bg-neutral-100 px-6 py-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleAgree}
                className="w-full sm:w-auto px-8 py-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold tracking-widest uppercase transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                id="disclaimer-agree-btn"
              >
                <CheckCircle2 size={16} />
                <span>AGREE</span>
              </button>

              <button
                type="button"
                onClick={handleDisagree}
                className="w-full sm:w-auto px-8 py-2.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-sans text-xs font-bold tracking-widest uppercase transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                id="disclaimer-disagree-btn"
              >
                <XCircle size={16} />
                <span>DISAGREE</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
