import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Shield, Scale, FileText, CheckCircle2 } from "lucide-react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: LegalModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-forest/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-3xl max-h-[85vh] bg-ivory rounded-sm shadow-2xl border border-gold/35 flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-forest px-6 py-5 border-b border-gold/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-gold/15 flex items-center justify-center text-gold border border-gold/20">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-ivory">Global Privacy Policy & Data Protection Charter</h2>
                  <p className="text-[10px] uppercase tracking-widest text-gold/80 font-bold font-sans">
                    DPDPA 2023 • GDPR (EU/UK) • CCPA/CPRA (US) • PIPEDA • APPs COMPLIANT
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-sm bg-gold/10 hover:bg-gold/20 text-gold flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 font-sans text-sm text-charcoal/85 space-y-6 leading-relaxed select-text scrollbar-thin scrollbar-thumb-gold/30">
              <div className="bg-sage/10 border-l-4 border-gold p-4 rounded-sm">
                <p className="font-serif font-semibold text-forest text-sm">
                  Last Updated: September 2026 • Multi-Jurisdictional Privacy Standard
                </p>
                <p className="text-xs text-charcoal/70 mt-1 font-light">
                  This comprehensive Global Privacy Policy governs all data collection, custody, retention, and processing activities undertaken by <strong>Olive Law Firm</strong>, established at Bengaluru, Karnataka, India. We enforce the highest combined global standards of privacy, attorney-client privilege, and cybersecurity.
                </p>
              </div>

              {/* Section 1 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gold shrink-0" />
                  1. Comprehensive Global Legislative Harmonization
                </h3>
                <p className="font-light text-xs sm:text-sm">
                  Olive Law Firm strictly complies with and harmonizes its data protection practices under all prevailing international privacy statutes:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm font-light space-y-1">
                  <li><strong>India:</strong> Digital Personal Data Protection Act (DPDPA), 2023 & Section 43A of the Information Technology Act, 2000.</li>
                  <li><strong>European Union & United Kingdom:</strong> General Data Protection Regulation (EU GDPR Regulation 2016/679 & UK Data Protection Act 2018).</li>
                  <li><strong>United States:</strong> California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA), Virginia CDPA, Colorado CPA, and federal privacy guidelines.</li>
                  <li><strong>Canada:</strong> Personal Information Protection and Electronic Documents Act (PIPEDA).</li>
                  <li><strong>Australia & International:</strong> Privacy Act 1988 (Australian Privacy Principles - APPs), Singapore PDPA, UAE Data Protection Law, and Brazil LGPD.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gold shrink-0" />
                  2. Lawful Grounds for Processing & Explicit Consent
                </h3>
                <p className="font-light text-xs sm:text-sm">
                  We process data under strict lawful bases: (a) explicit user consent (Art. 6(1)(a) GDPR, Sec. 6 DPDPA), (b) performance of prospective or actual legal representation contracts (Art. 6(1)(b) GDPR), and (c) compliance with mandatory statutory legal obligations and Bar Council regulatory mandates.
                </p>
                <p className="font-light text-xs sm:text-sm">
                  Categories of personal data collected voluntarily:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm font-light space-y-1">
                  <li><strong>Identity & Contact:</strong> Full Legal Name, verified Mobile Number, Email Address, and Corporate Affiliation.</li>
                  <li><strong>Legal Case Metadata:</strong> Matter summary, court jurisdictions, case numbers, and dispute narratives provided voluntarily for consultation scheduling.</li>
                  <li><strong>Technical & Essential Session Data:</strong> Cryptographically anonymized device telemetry, secure session tokens, and essential security headers.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gold shrink-0" />
                  3. Inviolable Legal Professional Privilege & Confidentiality
                </h3>
                <p className="font-light text-xs sm:text-sm bg-gold/5 border border-gold/20 p-3 rounded-sm">
                  All consultations, intake submissions, narrative briefs, and documents submitted to this portal are strictly shielded under <strong>Section 126 of the Indian Evidence Act, 1872</strong>, Rule 17 of the Bar Council of India Rules, and internationally recognized doctrines of <strong>Legal Professional Privilege / Attorney-Client Privilege / Work-Product Doctrine</strong>. No legal inquiry data is ever rented, sold, monetized, or shared with commercial data brokers or advertisers.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gold shrink-0" />
                  4. International Data Transfers & Enterprise Security Architecture
                </h3>
                <p className="font-light text-xs sm:text-sm">
                  All databases are protected with end-to-end TLS 1.3 encryption in transit and AES-256 GCM encryption at rest on SOC 2 Type II, ISO 27001, and HIPAA-compliant Google Cloud Platform infrastructure with automated role-based authentication rules. Where cross-border data transfers occur, we implement Standard Contractual Clauses (SCCs) and rigorous supplementary technical safeguards.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gold shrink-0" />
                  5. Universal Global User Rights (Data Subject & Data Principal Rights)
                </h3>
                <p className="font-light text-xs sm:text-sm">
                  Regardless of your geographic location, Olive Law Firm affords every user the full suite of modern privacy rights without discrimination:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm font-light space-y-1">
                  <li><strong>Right of Access & Portability:</strong> Obtain a transparent, machine-readable record of your personal data held in our systems.</li>
                  <li><strong>Right to Rectification & Erasure ("Right to be Forgotten"):</strong> Request immediate correction of inaccurate data or permanent cryptographic erasure of your consultation intake records.</li>
                  <li><strong>Right to Restriction & Consent Withdrawal:</strong> Revoke processing consent at any time without punitive consequences.</li>
                  <li><strong>Non-Sale / "Do Not Sell or Share My Personal Information":</strong> We unconditionally do not sell, trade, or monetize personal data under CCPA/CPRA.</li>
                  <li><strong>Right to Grievance Redressal & Supervisory Lodging:</strong> File inquiries directly with our Data Protection Officer or your local supervisory data protection authority.</li>
                </ul>
                <div className="bg-sage/10 p-3 rounded-sm border border-forest/10 mt-3 text-xs space-y-1">
                  <p className="font-semibold text-forest">Data Protection Officer & Privacy Compliance Desk:</p>
                  <p><strong>Olive Law Firm</strong> • Bengaluru, Karnataka, India</p>
                  <p>Official Statutory Privacy Inquiries: <a href="mailto:admin@olivelawfirm.in" className="text-gold font-bold underline hover:text-gold/80">admin@olivelawfirm.in</a></p>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="bg-sage px-6 py-4 border-t border-forest/10 flex justify-end">
              <button
                onClick={onClose}
                className="btn-gold px-6 py-2 rounded-sm font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all duration-200"
              >
                Acknowledge
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function TermsOfServiceModal({ isOpen, onClose }: LegalModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-forest/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-3xl max-h-[85vh] bg-ivory rounded-sm shadow-2xl border border-gold/35 flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-forest px-6 py-5 border-b border-gold/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-gold/15 flex items-center justify-center text-gold border border-gold/20">
                  <Scale size={20} />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-ivory">Terms of Service</h2>
                  <p className="text-[10px] uppercase tracking-widest text-gold/80 font-bold font-sans">
                    BAR COUNCIL OF INDIA COMPLIANT DISCLAIMER
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-sm bg-gold/10 hover:bg-gold/20 text-gold flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 font-sans text-sm text-charcoal/85 space-y-6 leading-relaxed select-text scrollbar-thin scrollbar-thumb-gold/30">
              <div className="bg-gold/5 border-l-4 border-gold p-4 rounded-sm">
                <h4 className="font-serif font-bold text-forest text-sm">
                  CRITICAL MANDATORY ACKNOWLEDGMENT
                </h4>
                <p className="text-xs text-charcoal/80 mt-1.5 font-light">
                  Rule 36 of Chapter II, Part VI of the **Bar Council of India Rules** restricts advocates from advertising or soliciting clients. Please review this declaration carefully to proceed.
                </p>
              </div>

              {/* Section 1 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest">
                  1. Voluntary Information Seeking & No Solicitation
                </h3>
                <div className="font-light text-xs sm:text-sm space-y-2 bg-sage/10 p-4 border border-forest/10 rounded-sm">
                  <p>By entering this portal, accessing administrative features, or requesting a callback, the user explicitly confirms and declares that:</p>
                  <ul className="list-decimal pl-5 space-y-1 text-xs">
                    <li>The user is seeking information about Olive Law Firm, its practice areas, and Advocate Reynold D'Souza solely of their own voluntary motion, initiative, and discretion.</li>
                    <li>There has been no advertisement, personal solicitation, invite, or inducement of any form from Olive Law Firm, Advocate Reynold D'Souza, or any associate of the firm to solicit work.</li>
                    <li>The contents of this platform are purely for academic, informative, and educational purposes and are provided at the user's specific request.</li>
                    <li>No legal material on this platform constitutes a binding legal opinion, advisory service, or direct advocacy solicitation.</li>
                  </ul>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest">
                  2. No Attorney-Client Relationship Created
                </h3>
                <p className="font-light text-xs sm:text-sm">
                  Your transmission of data via our case scheduler, callbacks, or e-mail inboxes does **not** institute a formal attorney-client relationship or represent legal retainer contract initiation. Olive Law Firm is under no statutory obligation to assume case representation until a formal professional engagement agreement is signed by Advocate Reynold D'Souza and appropriate retainer deposits are filed.
                </p>
              </section>

              {/* Section 3 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest">
                  3. Use of Content & Intellectual Property
                </h3>
                <p className="font-light text-xs sm:text-sm">
                  All scholarly digests, practice descriptions, vector logos, interface structures, and analytical notes displayed on this website are the absolute intellectual property of Olive Law Firm. Any copying, commercial exploitation, or distribution of these assets without written statutory consent is strictly prohibited.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest">
                  4. Absolute Limitation of Liability & Statutory Disclaimers
                </h3>
                <p className="font-light text-xs sm:text-sm">
                  Olive Law Firm conducts meticulous judicial research; however, the legal landscape is constantly evolving. The firm shall not be held liable, directly or consequentially, for any action taken, financial losses sustained, or strategic choices made by the user based solely on the contents displayed on this website. Users must consult competent high court counsel before acting on any statutory interpretations.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest">
                  5. Jurisdiction & Choice of Law
                </h3>
                <p className="font-light text-xs sm:text-sm">
                  These Terms of Service shall be interpreted and governed exclusively in accordance with the Laws of the Republic of India. Any legal actions, proceedings, or arbitration arising from the use of this website, information processing, or consultations must be instituted solely in courts holding competent territory jurisdiction in **Bengaluru, Karnataka, India**.
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="bg-sage px-6 py-4 border-t border-forest/10 flex justify-end">
              <button
                onClick={onClose}
                className="btn-gold px-6 py-2 rounded-sm font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all duration-200"
              >
                I Agree & Accept
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
