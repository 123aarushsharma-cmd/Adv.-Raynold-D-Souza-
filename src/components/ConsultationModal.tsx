import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, Mail, Phone, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { submitConsultation, auth } from "../lib/firebase";

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

  const validate = (): boolean => {
    const tempErrors: FormErrors = {};
    let isValid = true;

    if (!fields.name.trim()) {
      tempErrors.name = "Full name is required";
      isValid = false;
    }

    if (!fields.email.trim()) {
      tempErrors.email = "Email address is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      tempErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!fields.phone.trim()) {
      tempErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\+?[0-9\s\-()]{7,15}$/.test(fields.phone)) {
      tempErrors.phone = "Please enter a valid telephone number";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (validate()) {
      setIsSubmitting(true);
      try {
        await submitConsultation({
          name: fields.name,
          email: fields.email,
          phone: fields.phone,
          practiceArea: fields.subject,
          message: fields.message
        });
        setIsSubmitting(false);
        setIsSuccess(true);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-forest/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative bg-ivory border border-gold/40 shadow-2xl rounded-sm max-w-xl w-full max-h-[90vh] overflow-y-auto z-10"
          >
            {/* Header */}
            <div className="bg-forest text-ivory px-6 py-5 flex items-center justify-between border-b border-gold/30">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="text-gold" size={24} />
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide">
                    Privilege-Secured Consultation
                  </h3>
                  <p className="font-sans text-[10px] text-gold uppercase tracking-wider font-semibold">
                    Attorney-Client Privilege Intake
                  </p>
                </div>
              </div>
              <button
                id="close-consultation-modal"
                onClick={onClose}
                className="text-ivory/80 hover:text-gold p-1.5 rounded-full hover:bg-ivory/10 transition-colors"
                aria-label="Close form"
              >
                <X size={20} />
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

                    <p className="font-sans text-sm text-charcoal/80 leading-relaxed max-w-sm mb-8 font-light">
                      Your details are protected under attorney-client privilege. An advisor from Olive Law Firm will contact you within one business day.
                    </p>

                    {/* High-end Legal Audit Checklist */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.85, duration: 0.6, ease: "easeOut" }}
                      className="w-full max-w-sm bg-sage/10 border border-forest/10 rounded p-4 mb-8 text-left space-y-2.5 shadow-inner"
                    >
                      {[
                        { text: "Attorney-client privilege active", label: "Protected" },
                        { text: "Transmission logged to chambers database", label: "Completed" },
                        { text: "Case advisor assigned for next steps", label: "Scheduled" }
                      ].map((step, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.05 + idx * 0.15 }}
                          className="flex items-center justify-between text-xs font-sans"
                        >
                          <div className="flex items-center gap-2 text-charcoal/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                            <span>{step.text}</span>
                          </div>
                          <span className={`text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                            idx === 2 
                              ? "bg-gold/15 text-gold border border-gold/25" 
                              : "bg-forest/15 text-forest"
                          }`}>
                            {step.label}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.6, duration: 0.4 }}
                      id="modal-success-close-btn"
                      onClick={() => {
                        setIsSuccess(false);
                        onClose();
                      }}
                      className="bg-forest hover:bg-forest/95 text-gold border border-gold/30 font-sans font-semibold text-xs tracking-wider uppercase px-6 py-3 rounded-sm transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer hover:scale-[1.02]"
                    >
                      Close Intake Form
                    </motion.button>
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
                  >
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-sm p-4 flex items-start gap-3 transition-all duration-300">
                        <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
                        <div>
                          <span className="font-semibold font-sans text-red-950 block">Submission Error</span>
                          <p className="mt-1 font-light">{submitError}</p>
                        </div>
                      </div>
                    )}

                    {/* Name Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-name" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="modal-name"
                        name="name"
                        value={fields.name}
                        onChange={handleInputChange}
                        className={`font-sans text-sm bg-sage-light border ${
                          errors.name ? "border-red-500 focus:outline-red-500" : "border-forest/20 focus:outline-gold"
                        } px-4 py-3 rounded-sm text-charcoal`}
                        placeholder="Jane Doe"
                      />
                      {errors.name && (
                        <span className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                          <AlertCircle size={12} />
                          {errors.name}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Email Input */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="modal-email" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="modal-email"
                          name="email"
                          value={fields.email}
                          onChange={handleInputChange}
                          className={`font-sans text-sm bg-sage-light border ${
                            errors.email ? "border-red-500 focus:outline-red-500" : "border-forest/20 focus:outline-gold"
                          } px-4 py-3 rounded-sm text-charcoal`}
                          placeholder="jane@example.com"
                        />
                        {errors.email && (
                          <span className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                            <AlertCircle size={12} />
                            {errors.email}
                          </span>
                        )}
                      </div>

                      {/* Phone Input */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="modal-phone" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="modal-phone"
                          name="phone"
                          value={fields.phone}
                          onChange={handleInputChange}
                          className={`font-sans text-sm bg-sage-light border ${
                            errors.phone ? "border-red-500 focus:outline-red-500" : "border-forest/20 focus:outline-gold"
                          } px-4 py-3 rounded-sm text-charcoal`}
                          placeholder="(555) 019-2834"
                        />
                        {errors.phone && (
                          <span className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                            <AlertCircle size={12} />
                            {errors.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-subject" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Legal Practice Area *
                      </label>
                      <select
                        id="modal-subject"
                        name="subject"
                        value={fields.subject}
                        onChange={handleInputChange}
                        className={`font-sans text-sm bg-sage-light border ${
                          errors.subject ? "border-red-500 focus:outline-red-500" : "border-forest/20 focus:outline-gold"
                        } px-4 py-3 rounded-sm text-charcoal`}
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
                        <span className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                          <AlertCircle size={12} />
                          {errors.subject}
                        </span>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-message" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Brief Case Summary *
                      </label>
                      <textarea
                        id="modal-message"
                        name="message"
                        value={fields.message}
                        onChange={handleInputChange}
                        rows={3}
                        className={`font-sans text-sm bg-sage-light border ${
                          errors.message ? "border-red-500 focus:outline-red-500" : "border-forest/20 focus:outline-gold"
                        } px-4 py-3 rounded-sm text-charcoal resize-y`}
                        placeholder="Outline key timelines, dispute factors, or required statutory deadlines..."
                      />
                      {errors.message && (
                        <span className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                          <AlertCircle size={12} />
                          {errors.message}
                        </span>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      id="modal-submit-btn"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 btn-gold font-sans font-bold text-sm tracking-wider uppercase py-4 rounded-sm shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-forest border-t-transparent rounded-full animate-spin" />
                          Encrypting Dossier...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Transmit Intake File
                        </>
                      )}
                    </button>
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
