import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { submitConsultation } from "../lib/firebase";

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
  const [fields, setFields] = useState<FormFields>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMsg = "Please enter a valid email address (e.g. name@domain.com)";
      }
    } else if (name === "phone") {
      if (!value.trim()) {
        errorMsg = "Phone number is required";
      } else if (!/^\+?[0-9\s\-()]{7,15}$/.test(value.replace(/\s/g, ""))) {
        errorMsg = "Please enter a valid phone number (7-15 digits)";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setSubmitError(null);

    // Mark all fields as touched
    const allTouched = Object.keys(fields).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    if (validateAll()) {
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
    <section className="py-14 md:py-16 bg-ivory relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none motif-bg" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-gold" />
            <span className="font-sans text-xs sm:text-sm text-gold font-bold tracking-[0.2em] uppercase">
              Client Intake
            </span>
            <span className="w-8 h-px bg-gold" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-forest tracking-tight">
            Initiate a Case Consultation
          </h2>
          <div className="mt-6 h-[1px] w-12 bg-gold mx-auto" />
          <p className="font-sans text-sm sm:text-base text-charcoal/70 mt-4 font-light">
            Contact our dedicated admissions desk. We review every query with absolute confidentiality and respond within one statutory business day.
          </p>
        </div>

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
                    className="font-sans text-sm text-charcoal/80 leading-relaxed max-w-md mb-8 font-light"
                  >
                    Thank you for contacting Advocate Reynold D'Souza. Your submission is protected under attorney-client privilege. Our chambers will review your case file and contact you directly within 24 hours.
                  </motion.p>

                  {/* High-end Legal Audit Checklist */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.95, duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-sm bg-sage/10 border border-forest/10 rounded p-5 mb-8 text-left space-y-3 shadow-inner"
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
                        transition={{ delay: 1.15 + idx * 0.18 }}
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
                    transition={{ delay: 1.75, duration: 0.4 }}
                    id="reset-form-btn"
                    onClick={() => setIsSuccess(false)}
                    className="bg-gold hover:bg-gold-hover text-forest font-sans font-semibold text-xs tracking-wider uppercase px-6 py-3 rounded-sm transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer hover:scale-[1.02]"
                  >
                    Submit Another Inquiry
                  </motion.button>
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

                  {/* Submit button */}
                  <button
                    type="submit"
                    id="contact-submit-btn"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 btn-gold font-sans font-bold text-sm tracking-wider uppercase py-4 rounded-sm shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Map & Address Details */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-8">
            {/* Map Frame */}
            <div className="relative border border-forest/10 rounded-sm overflow-hidden h-[260px] shadow-sm bg-sage">
              <iframe
                title="Advocate Reynold D'Souza - Bengaluru Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.751239857976!2d77.551322!3d12.9237078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15894178a9c3%3A0xe54e2f89ca956488!2s12th%20Main%20Rd%2C%20Padmanabhanagar%2C%20Bengaluru%2C%20Karnataka%20560070!5e0!3m2!1sen!2sin!4v1689000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Direct Contact Details Grid */}
            <div className="bg-forest text-ivory p-8 rounded-sm shadow-md flex-grow flex flex-col justify-between border border-gold/15 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-6">
                <h3 className="font-serif text-2xl text-gold font-bold border-b border-gold/25 pb-3">
                  Law Firm
                </h3>

                <div className="space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <MapPin className="text-gold shrink-0 mt-1" size={18} />
                    <div>
                      <span className="font-sans text-[10px] tracking-widest text-gold uppercase font-bold">
                        Main Office
                      </span>
                      <p className="font-serif text-base text-ivory mt-0.5">
                        2nd Floor, #520, 10th Cross,
                      </p>
                      <p className="font-serif text-base text-ivory">
                        12th Main, Padmanabhanagar,
                      </p>
                      <p className="font-serif text-base text-ivory">
                        Bengaluru 560070, Karnataka, India
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <Phone className="text-gold shrink-0 mt-1" size={18} />
                    <div>
                      <span className="font-sans text-[10px] tracking-widest text-gold uppercase font-bold">
                        Direct Lines
                      </span>
                      <p className="font-sans text-sm font-medium mt-0.5">
                        Mobile:{" "}
                        <a href="tel:+919740577775" className="text-ivory hover:text-gold transition-colors">
                          +91 97405 77775
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <Mail className="text-gold shrink-0 mt-1" size={18} />
                    <div>
                      <span className="font-sans text-[10px] tracking-widest text-gold uppercase font-bold">
                        Digital Inquiries
                      </span>
                      <p className="font-sans text-sm font-medium mt-0.5">
                        <a href="mailto:advrdsouza181@gmail.com" className="text-ivory hover:text-gold transition-colors">
                          advrdsouza181@gmail.com
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="flex items-start gap-4">
                    <Clock className="text-gold shrink-0 mt-1" size={18} />
                    <div>
                      <span className="font-sans text-[10px] tracking-widest text-gold uppercase font-bold">
                        Consultation Availability
                      </span>
                      <p className="font-sans text-sm text-ivory/90 mt-0.5 font-medium">
                        Appointment Only (Open Now)
                      </p>
                      <p className="font-sans text-xs text-ivory/70 font-light">
                        Call or WhatsApp to schedule a consultation
                      </p>
                    </div>
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
