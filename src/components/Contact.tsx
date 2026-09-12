import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, ExternalLink, Navigation, Landmark, Copy, Layers, Compass, Check, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { submitConsultation } from "../lib/firebase";
import { createConsultationMailtoUrl, sendDirectEmailCopy } from "../lib/email";
import { sanitizeInput, isValidSecureEmail, isValidSecurePhone, checkRateLimit, isHoneypotTriggered } from "../lib/security";
import { useFirmSettings } from "../hooks/useFirmSettings";
import SectionHeaderReveal from "./SectionHeaderReveal";

interface OfficeLocation {
  id: "bengaluru" | "dharwad" | "belagavi";
  category: "Firm Head Office" | "Distinct Satellite Location";
  name: string;
  shortName: string;
  badge: string;
  coordinates: string;
  addressLines: string[];
  fullAddressText: string;
  embedMapUrlRoadmap: string;
  embedMapUrlSatellite: string;
  embedMapUrlHybrid: string;
  directMapsUrl: string;
  landmarkInfo: string;
}

const FIRM_LOCATIONS: OfficeLocation[] = [
  {
    id: "bengaluru",
    category: "Firm Head Office",
    name: "Bengaluru Head Office",
    shortName: "Bengaluru (HQ)",
    badge: "Head Office",
    coordinates: "12.9237° N, 77.5513° E",
    addressLines: [
      "2nd Floor, #520, 10th Cross,",
      "12th Main, Padmanabhanagar,",
      "Bengaluru 560070, Karnataka, India"
    ],
    fullAddressText: "2nd Floor, #520, 10th Cross, 12th Main, Padmanabhanagar, Bengaluru 560070, Karnataka, India",
    embedMapUrlRoadmap: "https://maps.google.com/maps?q=12.923708,77.551322+(Olive+Law+Firm+Bengaluru)&t=m&z=17&output=embed",
    embedMapUrlSatellite: "https://maps.google.com/maps?q=12.923708,77.551322+(Olive+Law+Firm+Bengaluru)&t=k&z=18&output=embed",
    embedMapUrlHybrid: "https://maps.google.com/maps?q=12.923708,77.551322+(Olive+Law+Firm+Bengaluru)&t=h&z=18&output=embed",
    directMapsUrl: "https://www.google.com/maps/search/?api=1&query=12.923708,77.551322",
    landmarkInfo: "Padmanabhanagar • 10th Cross / 12th Main Rd"
  },
  {
    id: "dharwad",
    category: "Distinct Satellite Location",
    name: "Dharwad Satellite Location",
    shortName: "Dharwad",
    badge: "Satellite Location",
    coordinates: "15.4660° N, 75.0080° E",
    addressLines: [
      "#300, Olive Tree Apartment,",
      "1st Cross, Sadankeri,",
      "Dharwad, 560070"
    ],
    fullAddressText: "#300, Olive Tree Apartment, 1st Cross, Sadankeri, Dharwad, 560070",
    embedMapUrlRoadmap: "https://maps.google.com/maps?q=Olive+Tree+Apartment,+1st+Cross,+Sadankeri,+Dharwad+560070&t=m&z=17&output=embed",
    embedMapUrlSatellite: "https://maps.google.com/maps?q=Olive+Tree+Apartment,+1st+Cross,+Sadankeri,+Dharwad+560070&t=k&z=18&output=embed",
    embedMapUrlHybrid: "https://maps.google.com/maps?q=Olive+Tree+Apartment,+1st+Cross,+Sadankeri,+Dharwad+560070&t=h&z=18&output=embed",
    directMapsUrl: "https://www.google.com/maps/search/?api=1&query=Olive+Tree+Apartment,+1st+Cross,+Sadankeri,+Dharwad+560070",
    landmarkInfo: "Sadankeri • 1st Cross • Olive Tree Apartment"
  },
  {
    id: "belagavi",
    category: "Distinct Satellite Location",
    name: "Belagavi Satellite Location",
    shortName: "Belagavi",
    badge: "Satellite Location",
    coordinates: "15.8582° N, 74.5098° E",
    addressLines: [
      "Chamber Complex, Opp. Civil Court,",
      "Club Road, Belagavi - 590001, Karnataka, India"
    ],
    fullAddressText: "Chamber Complex, Opp. Civil Court, Club Road, Belagavi - 590001, Karnataka, India",
    embedMapUrlRoadmap: "https://maps.google.com/maps?q=15.858220,74.509810+(Chamber+Complex+Civil+Court+Belagavi)&t=m&z=17&output=embed",
    embedMapUrlSatellite: "https://maps.google.com/maps?q=15.858220,74.509810+(Chamber+Complex+Civil+Court+Belagavi)&t=k&z=18&output=embed",
    embedMapUrlHybrid: "https://maps.google.com/maps?q=15.858220,74.509810+(Chamber+Complex+Civil+Court+Belagavi)&t=h&z=18&output=embed",
    directMapsUrl: "https://www.google.com/maps/search/?api=1&query=15.858220,74.509810",
    landmarkInfo: "Club Road • Opp. Civil Court Complex"
  }
];

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

export default function Contact() {
  const { contact } = useFirmSettings();
  const [activeLocationId, setActiveLocationId] = useState<"bengaluru" | "dharwad" | "belagavi">("bengaluru");
  const [mapMode, setMapMode] = useState<"roadmap" | "satellite" | "hybrid">("roadmap");
  const [copiedLocationId, setCopiedLocationId] = useState<string | null>(null);
  const [fields, setFields] = useState<FormFields>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleCopyAddress = (locId: string, text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLocationId(locId);
      setTimeout(() => {
        setCopiedLocationId(null);
      }, 2500);
    }
  };

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [botTrap, setBotTrap] = useState(""); // Invisible bot honeypot field

  const validateField = (name: string, value: string): string | undefined => {
    let errorMsg: string | undefined = undefined;

    if (name === "name") {
      if (!value.trim()) {
        errorMsg = "Full name is required";
      } else if (value.trim().length < 3) {
        errorMsg = "Name must be at least 3 characters";
      }
    } else if (name === "email") {
      if (!value.trim()) {
        errorMsg = "Email address is required";
      } else if (!isValidSecureEmail(value)) {
        errorMsg = "Please enter a valid email address (e.g. name@domain.com)";
      }
    } else if (name === "phone") {
      if (!value.trim()) {
        errorMsg = "Phone number is required";
      } else if (!isValidSecurePhone(value)) {
        errorMsg = "Please enter a valid telephone number (7-15 digits)";
      }
    } else if (name === "subject") {
      if (!value) {
        errorMsg = "Please select a practice area subject";
      }
    } else if (name === "message") {
      if (!value.trim()) {
        errorMsg = "Description content cannot be blank";
      } else if (value.trim().length < 15) {
        errorMsg = `Please provide more details (min 15 chars, currently ${value.trim().length})`;
      }
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    
    // Validate live if either touched or form was submitted
    if (touched[name] || submitAttempted) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateAll = (): boolean => {
    const tempErrors: FormErrors = {};
    let isValid = true;

    // Name
    if (!fields.name.trim()) {
      tempErrors.name = "Full name is required";
      isValid = false;
    } else if (fields.name.trim().length < 3) {
      tempErrors.name = "Name must be at least 3 characters";
      isValid = false;
    }

    // Email
    if (!fields.email.trim()) {
      tempErrors.email = "Email address is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      tempErrors.email = "Please enter a valid email address (e.g. name@domain.com)";
      isValid = false;
    }

    // Phone
    if (!fields.phone.trim()) {
      tempErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\+?[0-9\s\-()]{7,15}$/.test(fields.phone.replace(/\s/g, ""))) {
      tempErrors.phone = "Please enter a valid phone number (7-15 digits)";
      isValid = false;
    }

    // Subject
    if (!fields.subject) {
      tempErrors.subject = "Please select a practice area subject";
      isValid = false;
    }

    // Message
    if (!fields.message.trim()) {
      tempErrors.message = "Description content cannot be blank";
      isValid = false;
    } else if (fields.message.trim().length < 15) {
      tempErrors.message = `Please provide more details (min 15 chars, currently ${fields.message.trim().length})`;
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const [lastMailtoUrl, setLastMailtoUrl] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setSubmitError(null);

    // 1. Silent Honeypot Detection (Bot Trap)
    if (isHoneypotTriggered(botTrap)) {
      // Deceive automated crawlers by showing instant success without storing payload
      setIsSuccess(true);
      return;
    }

    // 2. Token Bucket Rate Limiting (Prevents flood attacks / wallet exhaustion)
    const rateCheck = checkRateLimit("contact_form", 4000);
    if (!rateCheck.allowed) {
      setSubmitError(`Security Rate Limiter: Submission received too quickly. Please wait ${rateCheck.remainingSec}s before trying again.`);
      return;
    }

    // Mark all fields as touched
    const allTouched = Object.keys(fields).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    if (validateAll()) {
      setIsSubmitting(true);

      // 3. Defense-in-Depth Sanitization (XSS, Injection, Length Guardrails)
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
        setSubmitAttempted(false);
        setTouched({});
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
    <section id="contact" className="py-14 md:py-16 bg-ivory relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none motif-bg" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Reveal-on-Scroll Section Title */}
        <SectionHeaderReveal
          eyebrow="Client Intake"
          title="Initiate a Case Consultation"
          subtitle="Contact our dedicated admissions desk. We review every query with absolute confidentiality and respond within one statutory business day."
          alignment="center"
          maxWidth="max-w-2xl"
          className="mb-10"
        />

        {/* Content Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Side: Intake Form */}
          <div className="lg:col-span-7 bg-sage-light border border-forest/10 p-6 sm:p-10 rounded-sm shadow-md flex flex-col justify-center overflow-hidden min-h-[500px]">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.98, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -15 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  id="contact-success-panel"
                  className="text-center py-8 px-4 flex flex-col items-center"
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
                      className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center bg-forest text-gold shadow-xl relative z-10"
                    >
                      {/* Drawing Path Checkmark SVG */}
                      <svg className="w-10 h-10 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                    Dossier ID: Secured &amp; Registered
                  </motion.span>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65, duration: 0.5 }}
                    className="font-serif text-2xl sm:text-3xl font-bold text-forest mb-4"
                  >
                    Intake Request Confirmed
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="font-sans text-sm text-charcoal/80 leading-relaxed max-w-md mb-6 font-light"
                  >
                    Thank you for contacting Advocate Reynold D'Souza. Your submission is protected under attorney-client privilege, logged in our firm database, and routed directly to <strong className="text-forest font-semibold">advrdsouza181@gmail.com</strong>.
                  </motion.p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 w-full max-w-md">
                    <a
                      href={lastMailtoUrl || "mailto:advrdsouza181@gmail.com?subject=Legal%20Inquiry%20Submission%20-%20Olive%20Law%20Firm"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-forest hover:bg-forest/90 text-gold border border-gold/30 font-sans font-semibold text-xs tracking-wider uppercase px-5 py-3 rounded-sm transition-all shadow-sm cursor-pointer"
                    >
                      <Send size={14} />
                      Send Copy Direct to advrdsouza181@gmail.com
                    </a>

                    <button
                      id="reset-form-btn"
                      onClick={() => setIsSuccess(false)}
                      className="bg-gold hover:bg-gold-hover text-forest font-sans font-semibold text-xs tracking-wider uppercase px-5 py-3 rounded-sm transition-all shadow-sm cursor-pointer"
                    >
                      Another Inquiry
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  id="contact-intake-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="border-b border-forest/10 pb-4 mb-4">
                    <h3 className="font-serif text-xl sm:text-2xl text-forest font-bold">Inquiry Dossier</h3>
                    <p className="font-sans text-xs text-charcoal/60 mt-1 uppercase tracking-widest font-medium">
                      All submitted fields are protected by attorney-client privilege
                    </p>
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-sm p-4 flex items-start gap-3 transition-all duration-300">
                      <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
                      <div>
                        <span className="font-semibold font-sans text-red-950 block">Submission Error</span>
                        <p className="mt-1 font-light">{submitError}</p>
                      </div>
                    </div>
                  )}

                  {submitAttempted && Object.values(errors).some(Boolean) && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-sm p-4 flex items-start gap-3 transition-all duration-300">
                      <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
                      <div>
                        <span className="font-semibold font-sans text-red-950 block">Please correct the following:</span>
                        <ul className="list-disc list-inside mt-1 font-light space-y-0.5">
                          {errors.name && <li>Name: {errors.name}</li>}
                          {errors.email && <li>Email: {errors.email}</li>}
                          {errors.phone && <li>Phone: {errors.phone}</li>}
                          {errors.subject && <li>Subject: {errors.subject}</li>}
                          {errors.message && <li>Message: {errors.message}</li>}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Invisible Honeypot Anti-Bot Field */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website_fax_trap">Leave this blank</label>
                    <input
                      type="text"
                      id="website_fax_trap"
                      name="website_fax_trap"
                      value={botTrap}
                      onChange={(e) => setBotTrap(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="name" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={fields.name}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`font-sans text-sm bg-ivory border ${
                          errors.name ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus:ring-1 focus:ring-gold/30"
                        } px-4 py-3 rounded-sm text-charcoal transition-all duration-200`}
                        placeholder="Jane Doe"
                      />
                      {errors.name && (
                        <span className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                          <AlertCircle size={12} />
                          {errors.name}
                        </span>
                      )}
                    </div>

                    {/* Email Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="email" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={fields.email}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`font-sans text-sm bg-ivory border ${
                          errors.email ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus:ring-1 focus:ring-gold/30"
                        } px-4 py-3 rounded-sm text-charcoal transition-all duration-200`}
                        placeholder="jane@example.com"
                      />
                      {errors.email && (
                        <span className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                          <AlertCircle size={12} />
                          {errors.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Phone Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="phone" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Telephone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={fields.phone}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`font-sans text-sm bg-ivory border ${
                          errors.phone ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus:ring-1 focus:ring-gold/30"
                        } px-4 py-3 rounded-sm text-charcoal transition-all duration-200`}
                        placeholder="+91 97405 77775"
                      />
                      {errors.phone && (
                        <span className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                          <AlertCircle size={12} />
                          {errors.phone}
                        </span>
                      )}
                    </div>

                    {/* Subject Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="subject" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Practice Area Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={fields.subject}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`font-sans text-sm bg-ivory border ${
                          errors.subject ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus:ring-1 focus:ring-gold/30"
                        } px-4 py-3 rounded-sm text-charcoal transition-all duration-200`}
                      >
                        <option value="">Select an option...</option>
                        <option value="constitutional">Constitutional &amp; Human Rights</option>
                        <option value="criminal">Criminal Defense &amp; Trials</option>
                        <option value="property">Property, Apartment &amp; RERA</option>
                        <option value="consumer">Consumer Protection</option>
                        <option value="labour">Labour &amp; Tribunals</option>
                        <option value="arbitration">Arbitration, Mediation &amp; Family</option>
                        <option value="other">General Consultation</option>
                      </select>
                      {errors.subject && (
                        <span className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                          <AlertCircle size={12} />
                          {errors.subject}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="message" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                      Detailed Description of Your Legal Situation *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={fields.message}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      rows={4}
                      className={`font-sans text-sm bg-ivory border ${
                        errors.message ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus:ring-1 focus:ring-gold/30"
                      } px-4 py-3 rounded-sm text-charcoal resize-y transition-all duration-200`}
                      placeholder="Describe the timelines, facts, and relevant legal documents..."
                    />
                    {errors.message && (
                      <span className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                        <AlertCircle size={12} />
                        {errors.message}
                      </span>
                    )}
                  </div>

                  {/* Submit button with GPU accelerated lift and shimmer */}
                  <button
                    type="submit"
                    id="contact-submit-btn"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 btn-gold font-sans font-bold text-sm tracking-wider uppercase py-4 rounded-sm shadow-md hover-lift-gpu shimmer-wrapper active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-forest border-t-transparent rounded-full animate-spin" />
                        Securing Intake File...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Request Intake Call
                      </>
                    )}
                  </button>

                  {/* Cyber Security & Legal Privilege Indicator */}
                  <div className="flex items-center justify-center gap-2 text-center text-[11px] text-forest/70 pt-2 font-sans">
                    <Shield size={13} className="text-gold shrink-0" />
                    <span>256-Bit Encrypted &amp; Privileged • Section 126 Indian Evidence Act Protected</span>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Map & Address Details */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Interactive Location Switcher & Map Frame */}
            <div className="flex flex-col border border-gold/30 rounded-sm overflow-hidden shadow-lg bg-sage/20">
              {/* Location Tabs */}
              <div className="bg-forest p-2.5 border-b border-gold/20 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-gold animate-pulse" />
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-gold">
                    Office Locator:
                  </span>
                </div>
                
                {/* Roadmap vs Satellite vs Hybrid Toggle */}
                <div className="flex items-center bg-forest-light/90 border border-gold/30 rounded p-0.5">
                  <button
                    type="button"
                    onClick={() => setMapMode("roadmap")}
                    className={`px-2 py-0.5 text-[10px] font-sans font-medium rounded transition-all cursor-pointer ${
                      mapMode === "roadmap"
                        ? "bg-gold text-forest font-bold"
                        : "text-ivory/70 hover:text-ivory"
                    }`}
                  >
                    Roadmap
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMode("satellite")}
                    className={`px-2 py-0.5 text-[10px] font-sans font-medium rounded transition-all cursor-pointer flex items-center gap-1 ${
                      mapMode === "satellite"
                        ? "bg-gold text-forest font-bold"
                        : "text-ivory/70 hover:text-ivory"
                    }`}
                  >
                    <Layers size={10} />
                    Satellite
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMode("hybrid")}
                    className={`px-2 py-0.5 text-[10px] font-sans font-medium rounded transition-all cursor-pointer flex items-center gap-1 ${
                      mapMode === "hybrid"
                        ? "bg-gold text-forest font-bold"
                        : "text-ivory/70 hover:text-ivory"
                    }`}
                  >
                    <Compass size={10} />
                    Hybrid
                  </button>
                </div>
              </div>

              {/* City Selection Buttons */}
              <div className="bg-forest/95 px-2.5 py-2 border-b border-gold/15 flex flex-wrap gap-1.5">
                {FIRM_LOCATIONS.map((loc) => {
                  const isSelected = activeLocationId === loc.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setActiveLocationId(loc.id)}
                      className={`px-3 py-1.5 text-xs rounded-sm font-sans transition-all cursor-pointer flex items-center gap-1.5 border ${
                        isSelected
                          ? "bg-gold text-forest font-bold border-gold shadow-sm scale-[1.02]"
                          : "bg-forest-light/60 text-ivory/80 border-gold/10 hover:border-gold/30 hover:text-ivory hover:bg-forest-light"
                      }`}
                    >
                      <span>{loc.id === "bengaluru" ? "🏛️" : "⚖️"}</span>
                      <span>{loc.shortName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Map Info Banner */}
              {(() => {
                const currentLoc = FIRM_LOCATIONS.find((l) => l.id === activeLocationId) || FIRM_LOCATIONS[0];
                return (
                  <div className="bg-ivory px-3.5 py-2.5 border-b border-forest/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                        <span className="font-bold text-forest truncate">{currentLoc.name}</span>
                        <span className="text-[10px] bg-gold/15 text-forest font-bold px-1.5 py-0.2 rounded border border-gold/30 shrink-0">
                          {currentLoc.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal/70 truncate">
                        GPS: {currentLoc.coordinates} • {currentLoc.landmarkInfo}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyAddress(currentLoc.id, currentLoc.fullAddressText)}
                        className="text-forest hover:text-gold text-[11px] font-medium flex items-center gap-1 px-2 py-1 bg-sage/30 hover:bg-sage/50 border border-forest/10 rounded transition-colors cursor-pointer"
                        title="Copy complete address"
                      >
                        {copiedLocationId === currentLoc.id ? (
                          <>
                            <Check size={12} className="text-forest font-bold" />
                            <span className="text-forest font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} className="text-charcoal/70" />
                            <span>Copy Address</span>
                          </>
                        )}
                      </button>

                      <a
                        href={currentLoc.directMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-forest text-gold hover:bg-forest-light text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded transition-colors"
                        title="Open exact pin in Google Maps app or browser"
                      >
                        <Navigation size={12} className="text-gold" />
                        <span>Get Directions</span>
                        <ExternalLink size={10} className="text-gold/70" />
                      </a>
                    </div>
                  </div>
                );
              })()}

              {/* Map Frame */}
              <div className="relative h-[290px] w-full bg-sage">
                {(() => {
                  const currentLoc = FIRM_LOCATIONS.find((l) => l.id === activeLocationId) || FIRM_LOCATIONS[0];
                  const mapEmbedSrc = mapMode === "satellite" 
                    ? currentLoc.embedMapUrlSatellite 
                    : mapMode === "hybrid" 
                    ? currentLoc.embedMapUrlHybrid 
                    : currentLoc.embedMapUrlRoadmap;
                  return (
                    <iframe
                      key={`${currentLoc.id}-${mapMode}`}
                      title={`Olive Law Firm - ${currentLoc.name}`}
                      src={mapEmbedSrc}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  );
                })()}
              </div>
            </div>

            {/* Direct Contact Details Grid */}
            <div className="bg-forest text-ivory p-6 sm:p-8 rounded-sm shadow-md flex-grow flex flex-col justify-between border border-gold/15 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gold/25 pb-3">
                  <h3 className="font-serif text-2xl text-gold font-bold">
                    Firm Presence &amp; Offices
                  </h3>
                  <span className="text-[10px] uppercase font-sans tracking-widest text-gold/70 font-semibold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                    3 Strategic Locations
                  </span>
                </div>

                {/* Head Office Segment */}
                <div className="space-y-4">
                  <div 
                    onClick={() => setActiveLocationId("bengaluru")}
                    className={`cursor-pointer transition-all rounded-sm p-3.5 border ${
                      activeLocationId === "bengaluru"
                        ? "bg-gold/15 border-gold shadow-md ring-1 ring-gold/40"
                        : "bg-ivory/5 border-gold/15 hover:bg-ivory/10 hover:border-gold/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="text-gold shrink-0 mt-1" size={18} />
                        <div>
                          <span className="font-sans text-[10px] tracking-widest text-gold uppercase font-bold block mb-1">
                            Firm Head Office
                          </span>
                          <p className="font-serif text-base text-ivory font-bold">
                            Bengaluru Head Office
                          </p>
                          <p className="font-sans text-xs text-ivory/90 mt-1">
                            2nd Floor, #520, 10th Cross,
                          </p>
                          <p className="font-sans text-xs text-ivory/90">
                            12th Main, Padmanabhanagar,
                          </p>
                          <p className="font-sans text-xs text-ivory/90">
                            Bengaluru 560070, Karnataka, India
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase font-sans font-semibold tracking-wider px-2 py-1 rounded shrink-0 ${
                        activeLocationId === "bengaluru"
                          ? "bg-gold text-forest font-bold shadow-sm"
                          : "bg-forest-light text-gold border border-gold/30"
                      }`}>
                        {activeLocationId === "bengaluru" ? "Active on Map" : "Show on Map"}
                      </span>
                    </div>
                  </div>

                  {/* Satellite Offices Segment */}
                  <div>
                    <span className="font-sans text-[10px] tracking-widest text-gold uppercase font-bold block mb-2.5">
                      Distinct Satellite Locations
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {/* Dharwad */}
                      <div 
                        onClick={() => setActiveLocationId("dharwad")}
                        className={`cursor-pointer transition-all rounded-sm p-3 border ${
                          activeLocationId === "dharwad"
                            ? "bg-gold/15 border-gold shadow-md ring-1 ring-gold/40"
                            : "bg-ivory/5 border-gold/15 hover:bg-ivory/10 hover:border-gold/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-serif text-sm font-semibold text-gold">Dharwad Satellite Location</p>
                            <p className="font-sans text-xs text-ivory/80 mt-1">
                              #300, Olive Tree Apartment, 1st Cross, Sadankeri, Dharwad, 560070
                            </p>
                          </div>
                          <span className={`text-[9px] uppercase font-sans font-semibold px-2 py-0.5 rounded shrink-0 ${
                            activeLocationId === "dharwad"
                              ? "bg-gold text-forest font-bold"
                              : "text-gold/70 bg-forest-light/60"
                          }`}>
                            {activeLocationId === "dharwad" ? "Active" : "View"}
                          </span>
                        </div>
                      </div>

                      {/* Belagavi */}
                      <div 
                        onClick={() => setActiveLocationId("belagavi")}
                        className={`cursor-pointer transition-all rounded-sm p-3 border ${
                          activeLocationId === "belagavi"
                            ? "bg-gold/15 border-gold shadow-md ring-1 ring-gold/40"
                            : "bg-ivory/5 border-gold/15 hover:bg-ivory/10 hover:border-gold/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-serif text-sm font-semibold text-gold">Belagavi Satellite Location</p>
                            <p className="font-sans text-xs text-ivory/80 mt-1">
                              Chamber Complex, Opp. Civil Court, Club Road, Belagavi - 590001
                            </p>
                          </div>
                          <span className={`text-[9px] uppercase font-sans font-semibold px-2 py-0.5 rounded shrink-0 ${
                            activeLocationId === "belagavi"
                              ? "bg-gold text-forest font-bold"
                              : "text-gold/70 bg-forest-light/60"
                          }`}>
                            {activeLocationId === "belagavi" ? "Active" : "View"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gold/15">
                    <div className="flex items-start gap-3">
                      <Phone className="text-gold shrink-0 mt-0.5" size={16} />
                      <div>
                        <span className="font-sans text-[9px] tracking-wider text-gold uppercase font-bold block">
                          Admissions Desk
                        </span>
                        <a href={`tel:${contact.primaryPhone.replace(/\s+/g, "")}`} className="font-sans text-xs text-ivory hover:text-gold transition-colors block mt-0.5">
                          {contact.primaryPhone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="text-gold shrink-0 mt-0.5" size={16} />
                      <div>
                        <span className="font-sans text-[9px] tracking-wider text-gold uppercase font-bold block">
                          Electronic Mail
                        </span>
                        <a href={`mailto:${contact.primaryEmail}`} className="font-sans text-xs text-ivory hover:text-gold transition-colors block mt-0.5 truncate">
                          {contact.primaryEmail}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Booking Indicator */}
                  <div className="flex items-center gap-2.5 bg-gold/10 border border-gold/20 p-2.5 rounded-sm text-xs mt-2">
                    <Clock className="text-gold shrink-0" size={14} />
                    <span className="font-sans text-[11px] text-ivory/90">
                      Office Timings: {contact.officeHours}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
