import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, X, ChevronRight, Settings, Check, HelpCircle } from "lucide-react";

interface CookieConsentProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export default function CookieConsent({ onOpenPrivacy, onOpenTerms }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Custom states for realistic regulatory consent categories
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [draftVaultEnabled, setDraftVaultEnabled] = useState(true);

  useEffect(() => {
    // Verify if user has already declared cookie preferences
    const hasConsented = localStorage.getItem("olive_law_cookies_consent");
    if (!hasConsented) {
      // 2-second delay after mounting (which is triggered when splash screen ends)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("olive_law_cookies_consent", "accepted_all");
    localStorage.setItem("olive_law_analytics_enabled", "true");
    localStorage.setItem("olive_law_draft_vault_enabled", "true");
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("olive_law_cookies_consent", "accepted_custom");
    localStorage.setItem("olive_law_analytics_enabled", analyticsEnabled.toString());
    localStorage.setItem("olive_law_draft_vault_enabled", draftVaultEnabled.toString());
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem("olive_law_cookies_consent", "accepted_necessary");
    localStorage.setItem("olive_law_analytics_enabled", "false");
    localStorage.setItem("olive_law_draft_vault_enabled", "false");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 120, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 120, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="fixed bottom-6 right-6 z-40 w-[92%] max-w-[450px] bg-forest/98 backdrop-blur-xl border border-gold/30 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-5 sm:p-6 text-ivory flex flex-col gap-4 select-none left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0"
          id="cookie-consent-container"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-gold/15 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-gold/15 flex items-center justify-center text-gold border border-gold/25 shrink-0">
                <ShieldCheck size={18} className="animate-pulse" />
              </div>
              <div>
                <span className="font-display text-xs tracking-[0.15em] text-gold uppercase block font-medium">
                  Regulatory Mandate
                </span>
                <span className="font-serif text-sm font-semibold tracking-wide text-ivory block -mt-0.5">
                  DPDPA Compliance Directive
                </span>
              </div>
            </div>
            <button
              onClick={handleAcceptNecessary}
              className="text-ivory/45 hover:text-gold transition-colors p-1 rounded-sm hover:bg-white/5 cursor-pointer"
              aria-label="Close consent banner"
            >
              <X size={15} />
            </button>
          </div>

          {/* Core Legal Declaration */}
          <div className="space-y-3">
            <p className="font-sans text-xs text-ivory/80 leading-relaxed font-light">
              Pursuant to India's **Digital Personal Data Protection Act (DPDPA), 2023** and **IT Rules, 2011**, this portal utilizes security certificates, critical session tokens, and telemetry logs. We guarantee absolute confidentiality under professional attorney-client privilege.
            </p>
            <p className="font-sans text-[11px] text-gold/80 font-light">
              Review our verified{" "}
              <button
                onClick={onOpenPrivacy}
                className="text-gold font-bold underline hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>{" "}
              and{" "}
              <button
                onClick={onOpenTerms}
                className="text-gold font-bold underline hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              .
            </p>
          </div>

          {/* Interactive Preferences Panel */}
          <AnimatePresence>
            {showPreferences && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden border-t border-gold/10 pt-3 flex flex-col gap-3"
              >
                <span className="text-[10px] tracking-wider uppercase font-bold text-gold/70 block">
                  Granular Consent Matrix
                </span>

                {/* Preference Row 1: Strictly Necessary */}
                <div className="flex items-start justify-between gap-3 bg-white/5 p-2.5 rounded-sm border border-white/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-ivory">Necessary Security Tokens</span>
                      <span className="text-[8px] bg-gold/15 text-gold border border-gold/20 px-1 rounded-sm uppercase font-bold scale-90">Required</span>
                    </div>
                    <p className="text-[10px] text-ivory/60 font-light mt-0.5 leading-normal">
                      Maintains intake security sessions, prevents CSRF forgery, and stores your privacy options.
                    </p>
                  </div>
                  <div className="w-8 h-4 bg-gold/25 rounded-full flex items-center justify-end px-0.5 opacity-80 mt-1 cursor-not-allowed">
                    <div className="w-3 h-3 bg-gold rounded-full" />
                  </div>
                </div>

                {/* Preference Row 2: Analytics & Telemetry */}
                <div className="flex items-start justify-between gap-3 bg-white/5 p-2.5 rounded-sm border border-white/5">
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-ivory">Inbound Traffic & Diagnostic Logs</span>
                    <p className="text-[10px] text-ivory/60 font-light mt-0.5 leading-normal">
                      Monitors request latency, helps evaluate layout engagement, and records system debugging metrics.
                    </p>
                  </div>
                  <button
                    onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                    className={`w-8 h-4 rounded-full flex items-center transition-colors duration-200 mt-1 cursor-pointer p-0.5 ${
                      analyticsEnabled ? "bg-gold" : "bg-white/20"
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-3 h-3 bg-forest rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{ marginLeft: analyticsEnabled ? "auto" : "0" }}
                    />
                  </button>
                </div>

                {/* Preference Row 3: Form Draft Vault */}
                <div className="flex items-start justify-between gap-3 bg-white/5 p-2.5 rounded-sm border border-white/5">
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-ivory">Case-Intake Auto-Save Drafts</span>
                    <p className="text-[10px] text-ivory/60 font-light mt-0.5 leading-normal">
                      Safeguards form-fields locally so you do not lose your brief description in case of a connection reset.
                    </p>
                  </div>
                  <button
                    onClick={() => setDraftVaultEnabled(!draftVaultEnabled)}
                    className={`w-8 h-4 rounded-full flex items-center transition-colors duration-200 mt-1 cursor-pointer p-0.5 ${
                      draftVaultEnabled ? "bg-gold" : "bg-white/20"
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-3 h-3 bg-forest rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{ marginLeft: draftVaultEnabled ? "auto" : "0" }}
                    />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Row */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between gap-2.5">
              {/* Show/Hide Toggles */}
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="text-[11px] font-semibold text-gold hover:text-ivory uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-0 py-2 px-1"
              >
                <Settings size={12} className={showPreferences ? "rotate-90 transition-transform duration-300" : "transition-transform duration-300"} />
                <span>{showPreferences ? "Hide Toggles" : "Customize Protocols"}</span>
              </button>

              {/* Accept Necessary button */}
              {!showPreferences && (
                <button
                  onClick={handleAcceptNecessary}
                  className="text-[10px] text-ivory/70 hover:text-white uppercase tracking-wider transition-colors cursor-pointer py-2 px-3 border border-white/10 hover:border-white/30 rounded-sm hover:bg-white/5 font-medium"
                >
                  Essential Only
                </button>
              )}
            </div>

            {/* Main Action Call to Action buttons */}
            {showPreferences ? (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={handleAcceptNecessary}
                  className="border border-gold/20 hover:border-gold/40 text-ivory font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-sm bg-forest-light/20 transition-all duration-200 active:scale-95 hover:bg-gold/5 cursor-pointer"
                >
                  Essential Only
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="btn-gold font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-sm shadow-md transition-all duration-200 active:scale-95 hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check size={11} className="text-forest" />
                  <span>Save Settings</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleAcceptAll}
                className="btn-gold font-bold text-[10px] uppercase tracking-wider py-3 rounded-sm shadow-md transition-all duration-200 active:scale-[0.98] hover:brightness-110 flex items-center justify-center gap-1.5 w-full cursor-pointer"
              >
                <span>Accept & Acknowledge All</span>
                <ChevronRight size={12} className="text-forest stroke-[3]" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
