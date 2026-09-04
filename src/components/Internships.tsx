import React, { useState } from "react";
import { Send, FileText, CheckCircle2, AlertCircle, Award, GraduationCap, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { submitInternship } from "../lib/firebase";

interface InternshipFields {
  name: string;
  email: string;
  phone: string;
  college: string;
  yearOfStudy: string;
  areaOfInterest: string;
  resumeUrl: string;
  coverLetter: string;
}

interface InternshipErrors {
  name?: string;
  email?: string;
  phone?: string;
  college?: string;
  yearOfStudy?: string;
  areaOfInterest?: string;
  resumeUrl?: string;
  coverLetter?: string;
}

export default function Internships() {
  const [fields, setFields] = useState<InternshipFields>({
    name: "",
    email: "",
    phone: "",
    college: "",
    yearOfStudy: "",
    areaOfInterest: "",
    resumeUrl: "",
    coverLetter: "",
  });

  const [errors, setErrors] = useState<InternshipErrors>({});
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
        errorMsg = "Please enter a valid email address";
      }
    } else if (name === "phone") {
      if (!value.trim()) {
        errorMsg = "Phone number is required";
      } else if (!/^\+?[0-9\s\-()]{7,15}$/.test(value.replace(/\s/g, ""))) {
        errorMsg = "Please enter a valid phone number (7-15 digits)";
      }
    } else if (name === "college") {
      if (!value.trim()) {
        errorMsg = "Law College/University name is required";
      } else if (value.trim().length < 5) {
        errorMsg = "Please enter full institutional name";
      }
    } else if (name === "yearOfStudy") {
      if (!value) {
        errorMsg = "Please select your current year of study";
      }
    } else if (name === "areaOfInterest") {
      if (!value) {
        errorMsg = "Please select your primary area of interest";
      }
    } else if (name === "resumeUrl") {
      if (!value.trim()) {
        errorMsg = "Resume document link is required";
      } else if (!/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(value.trim())) {
        errorMsg = "Please enter a valid URL (Google Drive, Dropbox, OneDrive, etc.)";
      }
    } else if (name === "coverLetter") {
      if (!value.trim()) {
        errorMsg = "Cover letter / statement of purpose is required";
      } else if (value.trim().length < 50) {
        errorMsg = `Please provide more details (min 50 chars, currently ${value.trim().length})`;
      }
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    
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
    const tempErrors: InternshipErrors = {};
    let isValid = true;

    Object.keys(fields).forEach((key) => {
      const err = validateField(key, fields[key as keyof InternshipFields]);
      if (err) {
        tempErrors[key as keyof InternshipErrors] = err;
        isValid = false;
      }
    });

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setSubmitError(null);

    const allTouched = Object.keys(fields).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    if (validateAll()) {
      setIsSubmitting(true);
      try {
        await submitInternship({
          name: fields.name,
          email: fields.email,
          phone: fields.phone,
          college: fields.college,
          yearOfStudy: fields.yearOfStudy,
          areaOfInterest: fields.areaOfInterest,
          resumeUrl: fields.resumeUrl,
          coverLetter: fields.coverLetter,
        });
        setIsSubmitting(false);
        setIsSuccess(true);
        setSubmitAttempted(false);
        setTouched({});
        setFields({
          name: "",
          email: "",
          phone: "",
          college: "",
          yearOfStudy: "",
          areaOfInterest: "",
          resumeUrl: "",
          coverLetter: "",
        });
      } catch (error) {
        console.error("Failed to submit internship application:", error);
        setIsSubmitting(false);
        setSubmitError("We encountered a database error during the transmission of your dossier. Please try again or email your application to our admissions desk directly.");
      }
    }
  };

  return (
    <section id="internships" className="py-14 md:py-16 bg-sage-light/10 border-t border-b border-gold/15 relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none motif-bg" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-gold" />
            <span className="font-sans text-xs sm:text-sm text-gold font-bold tracking-[0.2em] uppercase">
              Chambers Internship
            </span>
            <span className="w-8 h-px bg-gold" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-forest tracking-tight">
            Internship Applications
          </h2>
          <div className="mt-4 h-[1px] w-12 bg-gold mx-auto" />
          <p className="font-sans text-sm sm:text-base text-charcoal/70 mt-3 font-light">
            Olive Law Chambers® provides rigorous legal training, case research modeling, and trial court observations for meritorious law students across our Bengaluru Head Office and our distinct satellite locations.
          </p>
        </div>

        {/* Form Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left: General Requirements & Vetting */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-forest text-ivory p-6 sm:p-8 rounded-sm shadow-md border border-gold/15 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-6">
              <h3 className="font-serif text-xl sm:text-2xl text-gold font-bold border-b border-gold/25 pb-3">
                Admissions Protocol
              </h3>

              <div className="space-y-5">
                <div className="flex gap-3">
                  <GraduationCap className="text-gold shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-sans text-xs font-bold uppercase text-gold tracking-wider">Candidate Eligibility</h4>
                    <p className="font-sans text-xs text-ivory/80 mt-1 font-light">
                      Applications are open to students in their 3rd to 5th year of the 5-Year Integrated LL.B. course, or 2nd to 3rd year of the 3-Year LL.B. course, and postgraduate LL.M scholars.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Award className="text-gold shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-sans text-xs font-bold uppercase text-gold tracking-wider">Evaluation Timelines</h4>
                    <p className="font-sans text-xs text-ivory/80 mt-1 font-light">
                      Applications are vetted by our senior counsel twice monthly. Selected candidates will be invited for a virtual assessment and telephone interview.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <FileText className="text-gold shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-sans text-xs font-bold uppercase text-gold tracking-wider">Document Vetting</h4>
                    <p className="font-sans text-xs text-ivory/80 mt-1 font-light">
                      Applicants must provide a valid cloud storage link containing their consolidated curriculum vitae (CV) and research paper samples. Ensure file permissions are set to public view.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gold/15 mt-6 text-[11px] font-sans font-light text-ivory/70 leading-relaxed">
              * Note: Olive Law Chambers® is an equal opportunity workplace. All meritorious applications are analyzed based purely on academic research competency, scholastic consistency, and professional writing standards.
            </div>
          </div>

          {/* Right: Submission Form / Success Panel */}
          <div className="lg:col-span-8 bg-sage-light border border-forest/10 p-6 sm:p-10 rounded-sm shadow-md flex flex-col justify-center min-h-[500px]">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.98, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -15 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center py-8 px-4 flex flex-col items-center"
                >
                  <div className="relative mb-6">
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="absolute -inset-4 rounded-full bg-gold/20 blur-md pointer-events-none"
                    />
                    
                    <motion.div
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 180, damping: 15, delay: 0.15 }}
                      className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center bg-forest text-gold shadow-xl relative z-10"
                    >
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

                  <span className="font-sans text-[10px] text-gold uppercase tracking-[0.25em] font-bold mb-2 block animate-pulse">
                    Transmission Registered &amp; Encrypted
                  </span>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-forest mb-4">
                    Application Docket Open
                  </h3>

                  <p className="font-sans text-sm text-charcoal/80 leading-relaxed max-w-md mb-8 font-light">
                    Thank you for applying to Olive Law Chambers®. Your internship registration has been successfully logged on our chambers database. Our academic review board will analyze your dossier and resume link, and respond within 14 working days.
                  </p>

                  <button
                    onClick={() => setIsSuccess(false)}
                    className="bg-gold hover:bg-gold-hover text-forest font-sans font-semibold text-xs tracking-wider uppercase px-6 py-3 rounded-sm transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                  >
                    Apply for another Term
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="border-b border-forest/10 pb-3 mb-3">
                    <h3 className="font-serif text-xl sm:text-2xl text-forest font-bold">Meritorious Registration Portal</h3>
                    <p className="font-sans text-xs text-charcoal/60 mt-1 uppercase tracking-widest font-medium">
                      Fill in all academic fields with verified credentials
                    </p>
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-sm p-4 flex items-start gap-3">
                      <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
                      <p className="font-light">{submitError}</p>
                    </div>
                  )}

                  {submitAttempted && Object.values(errors).some(Boolean) && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-sm p-4 flex items-start gap-3">
                      <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
                      <div>
                        <span className="font-semibold font-sans text-red-950 block">Registration form contains errors:</span>
                        <ul className="list-disc list-inside mt-1 font-light text-xs space-y-0.5">
                          {errors.name && <li>Full Name: {errors.name}</li>}
                          {errors.email && <li>Email Address: {errors.email}</li>}
                          {errors.phone && <li>Phone Number: {errors.phone}</li>}
                          {errors.college && <li>Law School: {errors.college}</li>}
                          {errors.yearOfStudy && <li>Year of Study: {errors.yearOfStudy}</li>}
                          {errors.areaOfInterest && <li>Practice Interest: {errors.areaOfInterest}</li>}
                          {errors.resumeUrl && <li>Resume Link: {errors.resumeUrl}</li>}
                          {errors.coverLetter && <li>Cover Letter: {errors.coverLetter}</li>}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="int-name" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        id="int-name"
                        name="name"
                        value={fields.name}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`font-sans text-sm bg-ivory border ${
                          errors.name ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus:ring-1 focus:ring-gold/30"
                        } px-4 py-3 rounded-sm text-charcoal transition-all`}
                        placeholder="Jane Doe"
                      />
                      {errors.name && <span className="text-xs text-red-600 font-medium mt-1">{errors.name}</span>}
                    </div>

                    {/* Email Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="int-email" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Personal Email *
                      </label>
                      <input
                        type="email"
                        id="int-email"
                        name="email"
                        value={fields.email}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`font-sans text-sm bg-ivory border ${
                          errors.email ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus:ring-1 focus:ring-gold/30"
                        } px-4 py-3 rounded-sm text-charcoal transition-all`}
                        placeholder="jane@university.edu"
                      />
                      {errors.email && <span className="text-xs text-red-600 font-medium mt-1">{errors.email}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Phone Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="int-phone" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        WhatsApp/Mobile Number *
                      </label>
                      <input
                        type="tel"
                        id="int-phone"
                        name="phone"
                        value={fields.phone}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`font-sans text-sm bg-ivory border ${
                          errors.phone ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus:ring-1 focus:ring-gold/30"
                        } px-4 py-3 rounded-sm text-charcoal transition-all`}
                        placeholder="+91 XXXXX XXXXX"
                      />
                      {errors.phone && <span className="text-xs text-red-600 font-medium mt-1">{errors.phone}</span>}
                    </div>

                    {/* Law College */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="int-college" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Law College / University *
                      </label>
                      <input
                        type="text"
                        id="int-college"
                        name="college"
                        value={fields.college}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`font-sans text-sm bg-ivory border ${
                          errors.college ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus:ring-1 focus:ring-gold/30"
                        } px-4 py-3 rounded-sm text-charcoal transition-all`}
                        placeholder="National Law School, Bengaluru"
                      />
                      {errors.college && <span className="text-xs text-red-600 font-medium mt-1">{errors.college}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Year of Study */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="int-yearOfStudy" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Current Year of Study *
                      </label>
                      <select
                        id="int-yearOfStudy"
                        name="yearOfStudy"
                        value={fields.yearOfStudy}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`font-sans text-sm bg-ivory border ${
                          errors.yearOfStudy ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus:ring-1 focus:ring-gold/30"
                        } px-4 py-3 rounded-sm text-charcoal transition-all`}
                      >
                        <option value="">Select your academic tier...</option>
                        <option value="3rd Year (5-Year Integrated)">3rd Year (5-Year LL.B.)</option>
                        <option value="4th Year (5-Year Integrated)">4th Year (5-Year LL.B.)</option>
                        <option value="5th Year (5-Year Integrated)">5th Year (5-Year LL.B.)</option>
                        <option value="2nd Year (3-Year Course)">2nd Year (3-Year LL.B.)</option>
                        <option value="3rd Year (3-Year Course)">3rd Year (3-Year LL.B.)</option>
                        <option value="Postgraduate LL.M.">Postgraduate LL.M. Scholar</option>
                        <option value="Graduate Lawyer">Graduate Advocate Associate</option>
                      </select>
                      {errors.yearOfStudy && <span className="text-xs text-red-600 font-medium mt-1">{errors.yearOfStudy}</span>}
                    </div>

                    {/* Area of Interest */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="int-areaOfInterest" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                        Practice Specialization Focus *
                      </label>
                      <select
                        id="int-areaOfInterest"
                        name="areaOfInterest"
                        value={fields.areaOfInterest}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`font-sans text-sm bg-ivory border ${
                          errors.areaOfInterest ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus:ring-1 focus:ring-gold/30"
                        } px-4 py-3 rounded-sm text-charcoal transition-all`}
                      >
                        <option value="">Select clinical focus...</option>
                        <option value="Constitutional Law & Writs">Constitutional Law &amp; Writs</option>
                        <option value="Criminal Defense Trial Court Practice">Criminal Defense Trial Practice</option>
                        <option value="Property & K-RERA Title Verification">Property &amp; K-RERA Verification</option>
                        <option value="KAT / CGIT Service Litigation">KAT / CGIT Service Litigation</option>
                        <option value="Commercial Arbitration & Mediation">Commercial Arbitration &amp; Mediation</option>
                        <option value="Consumer Disputes & Consumer Court">Consumer Disputes &amp; Forums</option>
                      </select>
                      {errors.areaOfInterest && <span className="text-xs text-red-600 font-medium mt-1">{errors.areaOfInterest}</span>}
                    </div>
                  </div>

                  {/* Resume Document Link */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="int-resumeUrl" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                      Resume/CV Document Drive URL *
                    </label>
                    <input
                      type="url"
                      id="int-resumeUrl"
                      name="resumeUrl"
                      value={fields.resumeUrl}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`font-sans text-sm bg-ivory border ${
                        errors.resumeUrl ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus:ring-1 focus:ring-gold/30"
                      } px-4 py-3 rounded-sm text-charcoal transition-all`}
                      placeholder="https://drive.google.com/file/d/your-cv-id/view?usp=sharing"
                    />
                    <p className="font-sans text-[10px] text-charcoal/50">
                      Submit a direct link from Google Drive, Dropbox, or OneDrive. Ensure share permissions are set to "Anyone with link can view".
                    </p>
                    {errors.resumeUrl && <span className="text-xs text-red-600 font-medium mt-1">{errors.resumeUrl}</span>}
                  </div>

                  {/* Cover Letter */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="int-coverLetter" className="font-sans text-xs font-semibold uppercase text-forest tracking-wider">
                      Statement of Purpose / Cover Letter *
                    </label>
                    <textarea
                      id="int-coverLetter"
                      name="coverLetter"
                      value={fields.coverLetter}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      rows={4}
                      className={`font-sans text-sm bg-ivory border ${
                        errors.coverLetter ? "border-red-500 focus:outline-red-500 ring-1 ring-red-500/20" : "border-forest/20 focus:outline-gold focus:ring-1 focus:ring-gold/30"
                      } px-4 py-3 rounded-sm text-charcoal resize-y transition-all`}
                      placeholder="Explain your academic background, legal drafting experience, research achievements, and why you are keen on interning with Olive Law Chambers®..."
                    />
                    {errors.coverLetter && <span className="text-xs text-red-600 font-medium mt-1">{errors.coverLetter}</span>}
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 btn-gold font-sans font-bold text-sm tracking-wider uppercase py-4 rounded-sm shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-forest border-t-transparent rounded-full animate-spin" />
                        Encrypting Registration File...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Internship Application
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </div>
    </section>
  );
}
