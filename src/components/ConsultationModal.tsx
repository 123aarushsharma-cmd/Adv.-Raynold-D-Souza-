import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, Mail, Phone, Send, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { submitConsultation, auth } from "../lib/firebase";
import { createConsultationMailtoUrl, sendDirectEmailCopy } from "../lib/email";
import { sanitizeInput, isValidSecureEmail, isValidSecurePhone, checkRateLimit, isHoneypotTriggered } from "../lib/security";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormFields {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export default function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  const [fields, setFields] = useState<FormFields>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;

      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
          return;
        }

        if (e.key === "Tab" && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("keydown", handleKeyDown);
        triggerElementRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      setFields((prev) => ({
        ...prev,
        name: auth.currentUser?.displayName || prev.name,
        email: auth.currentUser?.email || prev.email,
      }));
    }
  }, [isOpen]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [botTrap, setBotTrap] = useState(""); // Invisible bot trap

  const validate = (): boolean => {
    const tempErrors: FormErrors = {};
    let isValid = true;

    if (!fields.name.trim()) {
      tempErrors.name = "Full name is required";
      isValid = false;
    } else if (fields.name.trim().length < 3) {
      tempErrors.name = "Full name must be at least 3 characters";
      isValid = false;
    }

    if (!fields.email.trim()) {
      tempErrors.email = "Email address is required";
      isValid = false;
    } else if (!isValidSecureEmail(fields.email)) {
      tempErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!fields.phone.trim()) {
      tempErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!isValidSecurePhone(fields.phone)) {
      tempErrors.phone = "Please enter a valid telephone number (7-15 digits)";
      isValid = false;
    }

    if (!fields.subject) {
      tempErrors.subject = "Please select an enquiry subject";
      isValid = false;
    }

    if (!fields.message.trim()) {
      tempErrors.message = "Message content cannot be blank";
      isValid = false;
    } else if (fields.message.trim().length < 15) {
      tempErrors.message = "Please describe your case in more detail (min 15 chars)";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const [lastMailtoUrl, setLastMailtoUrl] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // 1. Silent Honeypot Detection (Bot Trap)
    if (isHoneypotTriggered(botTrap)) {
      setIsSuccess(true);
      return;
    }

    // 2. Token Bucket Rate Limiting
    const rateCheck = checkRateLimit("modal_consultation", 4000);
    if (!rateCheck.allowed) {
      setSubmitError(`Rate Limiter Active: Please wait ${rateCheck.remainingSec}s before submitting again.`);
      return;
    }

    if (validate()) {
      setIsSubmitting(true);

      // 3. Defense-in-Depth Sanitization
      const cleanName = sanitizeInput(fields.name, 200);
      const cleanEmail = sanitizeInput(fields.email, 200);
      const cleanPhone = sanitizeInput(fields.phone, 50);
      const cleanSubject = sanitizeInput(fields.subject, 100);
      const cleanMessage = sanitizeInput(fields.message, 5000);

      const mailUrl = createConsultationMailtoUrl({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        message: cleanMessage
      });
      setLastMailtoUrl(mailUrl);

      try {
        await submitConsultation({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          practiceArea: cleanSubject,
          message: cleanMessage
        });
        setIsSubmitting(false);
        setIsSuccess(true);
        sendDirectEmailCopy(mailUrl);
        setFields({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } catch (error) {
        console.error("Failed to submit consultation:", error);
        setIsSubmitting(false);
        setSubmitError("We encountered a secure database communication error. Please try again or contact Advocate Reynold D'Souza directly via phone.");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          {/* Overlay Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
            className="absolute inset-0 bg-forest/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="consultation-modal-title"
            aria-describedby="consultation-modal-desc"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative bg-ivory border border-gold/40 shadow-2xl rounded-sm max-w-xl w-full max-h-[90vh] overflow-y-auto z-10 focus:outline-none"
          >
            {/* Header */}
            <div className="bg-forest text-ivory px-6 py-5 flex items-center justify-between border-b border-gold/30">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="text-gold shrink-0" size={24} aria-hidden="true" />
                <div>
                  <h2 id="consultation-modal-title" className="font-serif text-lg sm:text-xl font-bold tracking-wide">
                    Privilege-Secured Consultation
                  </h2>
                  <p id="consultation-modal-desc" className="font-sans text-[10px] text-gold uppercase tracking-wider font-semibold">
                    Attorney-Client Privilege Intake
                  </p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                id="close-consultation-modal"
                onClick={onClose}
                className="text-ivory/80 hover:text-gold p-1.5 rounded-full hover:bg-ivory/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                aria-label="Close consultation modal dialog"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 overflow-hidden min-h-[480px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="modal-success"
                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -15 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    id="modal-success-screen"
                    className="text-center py-6 flex flex-col items-center"
                  >
                    {/* Subtle, High-end Icon Animation */}
                    <div className="relative mb-6">
                      {/* Pulsing glow aura */}
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="absolute -inset-4 rounded-full bg-gold/20 blur-md pointer-events-none"
                      />
                      
                      {/* Circle Container with Spring Scale */}
                      <motion.div
                        initial={{ scale: 0.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 180, damping: 15, delay: 0.15 }}
                        className="w-18 h-18 rounded-full border-2 border-gold flex items-center justify-center bg-forest text-gold shadow-xl relative z-10"
                      >
                        {/* Drawing Path Checkmark SVG */}
                        <svg className="w-9 h-9 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.65, ease: "easeInOut", delay: 0.45 }}
                            d="M20 6L9 17l-5-5"
                          />
                        </svg>
                      </motion.div>
                    </div>

                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55, duration: 0.4 }}
                      className="font-sans text-[10px] text-gold uppercase tracking-[0.25em] font-bold mb-2 block"
                    >
                      Security Level: Secured &amp; Sealed
                    </motion.span>

                    <h4 className="font-serif text-2xl font-bold text-forest mb-3">
                      Intake File Secured
                    </h4>

                    <p className="font-sans text-sm text-charcoal/80 leading-relaxed max-w-sm mb-6 font-light">
                      Your details are protected under attorney-client privilege, logged in our firm database, and routed directly to Advocate Reynold D'Souza (<strong className="text-forest font-semibold">advrdsouza181@gmail.com</strong>).
                    </p>

                    <div className="flex flex-col gap-2 w-full max-w-sm mb-8">
                      <a
                        href={lastMailtoUrl || "mailto:advrdsouza181@gmail.com?subject=Privilege-Secured%20Consultation%20Inquiry"}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 bg-forest hover:bg-forest/95 text-gold border border-gold/30 font-sans font-semibold text-xs tracking-wider uppercase px-4 py-3 rounded-sm transition-all shadow-sm cursor-pointer"
                      >
                        <Send size={14} />
                        Send Copy Direct to advrdsouza181@gmail.com
                      </a>

                      <button
                        id="modal-success-close-btn"
                        onClick={() => {
                          setIsSuccess(false);
                          onClose();
                        }}
                        className="w-full bg-gold hover:bg-gold-hover text-forest font-sans font-semibold text-xs tracking-wider uppercase px-4 py-3 rounded-sm transition-all shadow-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-forest focus-visible:outline-none"
                      >
                        Close Intake Form
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="modal-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    id="modal-intake-form"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    noValidate
                  >
                    {submitError && (
                      <div 
                        role="alert" 
                        className="bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-sm p-4 flex items-start gap-3 transition-all duration-300"
                      >
                        <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} aria-hidden="true" />
                        <div>
                          <span className="font-semibold font-sans text-red-950 block">Submission Error</span>
                          <p className="mt-1 font-light">{submitError}</p>
                        </div>
                      </div>
                    )}

                    {/* Invisible Honeypot Anti-Bot Field */}
                    <div className="hidden" aria-hidden="true">
                      <label htmlFor="modal_bot_fax_trap">Leave empty</label>
                      <input
                        type="text"
                        id="modal_bot_fax_trap"
                        name="modal_bot_fax_trap"
                        value={botTrap}
                        onChange={(e) => setBotTrap(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    {/* Name Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-name" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Full Name <span aria-hidden="true">*</span>
                      </label>
                      <input
                        type="text"
                        id="modal-name"
                        name="name"
                        value={fields.name}
                        onChange={handleInputChange}
                        required
                        aria-required="true"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "modal-name-error" : undefined}
                        className={`font-sans text-sm bg-sage-light border ${
                          errors.name ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus-visible:ring-1 focus-visible:ring-gold"
                        } px-4 py-3 rounded-sm text-charcoal transition-all`}
                        placeholder="Jane Doe"
                      />
                      {errors.name && (
                        <span id="modal-name-error" role="alert" className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                          <AlertCircle size={12} aria-hidden="true" />
                          {errors.name}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Email Input */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="modal-email" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                          Email Address <span aria-hidden="true">*</span>
                        </label>
                        <input
                          type="email"
                          id="modal-email"
                          name="email"
                          value={fields.email}
                          onChange={handleInputChange}
                          required
                          aria-required="true"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "modal-email-error" : undefined}
                          className={`font-sans text-sm bg-sage-light border ${
                            errors.email ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus-visible:ring-1 focus-visible:ring-gold"
                          } px-4 py-3 rounded-sm text-charcoal transition-all`}
                          placeholder="jane@example.com"
                        />
                        {errors.email && (
                          <span id="modal-email-error" role="alert" className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                            <AlertCircle size={12} aria-hidden="true" />
                            {errors.email}
                          </span>
                        )}
                      </div>

                      {/* Phone Input */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="modal-phone" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                          Phone Number <span aria-hidden="true">*</span>
                        </label>
                        <input
                          type="tel"
                          id="modal-phone"
                          name="phone"
                          value={fields.phone}
                          onChange={handleInputChange}
                          required
                          aria-required="true"
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? "modal-phone-error" : undefined}
                          className={`font-sans text-sm bg-sage-light border ${
                            errors.phone ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus-visible:ring-1 focus-visible:ring-gold"
                          } px-4 py-3 rounded-sm text-charcoal transition-all`}
                          placeholder="+91 97405 77775"
                        />
                        {errors.phone && (
                          <span id="modal-phone-error" role="alert" className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                            <AlertCircle size={12} aria-hidden="true" />
                            {errors.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-subject" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Legal Practice Area <span aria-hidden="true">*</span>
                      </label>
                      <select
                        id="modal-subject"
                        name="subject"
                        value={fields.subject}
                        onChange={handleInputChange}
                        required
                        aria-required="true"
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? "modal-subject-error" : undefined}
                        className={`font-sans text-sm bg-sage-light border ${
                          errors.subject ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus-visible:ring-1 focus-visible:ring-gold"
                        } px-4 py-3 rounded-sm text-charcoal transition-all`}
                      >
                        <option value="">Select a practice category...</option>
                        <option value="civil">Civil Litigation</option>
                        <option value="criminal">Criminal Defense</option>
                        <option value="family">Family Law &amp; Mediation</option>
                        <option value="corporate">Corporate Governance</option>
                        <option value="property">Real Estate &amp; Zoning</option>
                        <option value="consumer">Consumer Protection</option>
                        <option value="other">General Consultation</option>
                      </select>
                      {errors.subject && (
                        <span id="modal-subject-error" role="alert" className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                          <AlertCircle size={12} aria-hidden="true" />
                          {errors.subject}
                        </span>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-message" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Brief Case Summary <span aria-hidden="true">*</span>
                      </label>
                      <textarea
                        id="modal-message"
                        name="message"
                        value={fields.message}
                        onChange={handleInputChange}
                        rows={3}
                        required
                        aria-required="true"
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "modal-message-error" : undefined}
                        className={`font-sans text-sm bg-sage-light border ${
                          errors.message ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus-visible:ring-1 focus-visible:ring-gold"
                        } px-4 py-3 rounded-sm text-charcoal resize-y transition-all`}
                        placeholder="Outline key timelines, dispute factors, or required statutory deadlines..."
                      />
                      {errors.message && (
                        <span id="modal-message-error" role="alert" className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                          <AlertCircle size={12} aria-hidden="true" />
                          {errors.message}
                        </span>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      id="modal-submit-btn"
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 btn-gold font-sans font-bold text-sm tracking-wider uppercase py-4 rounded-sm shadow-md hover-lift-gpu shimmer-wrapper active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-forest focus-visible:outline-none transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-forest border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                          Encrypting Dossier...
                        </>
                      ) : (
                        <>
                          <Send size={16} aria-hidden="true" />
                          Transmit Intake File
                        </>
                      )}
                    </button>

                    {/* Privilege & Security Statement */}
                    <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-forest/70 pt-2 font-sans">
                      <Shield size={12} className="text-gold shrink-0" aria-hidden="true" />
                      <span>Privileged Intake • Protected by Section 126 IEA</span>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
