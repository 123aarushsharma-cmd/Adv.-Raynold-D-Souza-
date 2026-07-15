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
                  <h2 className="font-serif text-xl font-bold text-ivory">Privacy Policy</h2>
                  <p className="text-[10px] uppercase tracking-widest text-gold/80 font-bold font-sans">
                    DPDPA, 2023 & IT ACT, 2000 COMPLIANT
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
                  Last Updated: July 2026
                </p>
                <p className="text-xs text-charcoal/70 mt-1 font-light">
                  This privacy policy governs data collection and processing activities of **Olive Law Firm**, headed by Advocate Reynold D'Souza, Bengaluru, India. It explains how we secure personal credentials in absolute confidentiality.
                </p>
              </div>

              {/* Section 1 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gold shrink-0" />
                  1. Legislative Compliance & Data Custodian
                </h3>
                <p className="font-light text-xs sm:text-sm">
                  This Privacy Policy is compiled and maintained in strict compliance with the **Digital Personal Data Protection Act (DPDPA), 2023**, Section 43A of the **Information Technology Act, 2000**, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 of India. Olive Law Firm acts as the Sole Data Custodian and Data Fiduciary for all personal datasets registered on this platform.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gold shrink-0" />
                  2. Datasets Collected & Processing Consent
                </h3>
                <p className="font-light text-xs sm:text-sm">
                  We collect personal datasets only when you proactively transmit them via our Case Intake Desk or scheduling inquiries. This includes:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm font-light space-y-1">
                  <li><strong>Identity Particulars:</strong> Full Name and email address.</li>
                  <li><strong>Contact Records:</strong> Mobile Number (actively verified).</li>
                  <li><strong>Brief Case Particulars:</strong> Legal dispute categories, court names, or narrative details provided voluntarily.</li>
                  <li><strong>Device Metrics:</strong> Technical logs, cookie files, and anonymized access analytics.</li>
                </ul>
                <p className="font-light text-xs sm:text-sm">
                  By clicking "Submit Inquiry" or scheduling a consultation, you provide your explicit, unambiguous consent under the DPDPA, 2023, allowing Advocate Reynold D'Souza and authorized firm associates to evaluate your case details.
                </p>
              </section>

              {/* Section 3 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gold shrink-0" />
                  3. Privileged Communication & Attorney-Client Privilege
                </h3>
                <p className="font-light text-xs sm:text-sm bg-gold/5 border border-gold/20 p-3 rounded-sm">
                  All personal datasets, case drafts, and dispute files uploaded to this platform are protected under **Section 126 of the Indian Evidence Act, 1872** (Professional communications/Attorney-Client Privilege). Transmission of this metadata, while not creating an immediate formal attorney-client contract, is handled with absolute professional secrecy and is shielded from unauthorized third-party disclosures.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gold shrink-0" />
                  4. Data Security & Storage Protocol
                </h3>
                <p className="font-light text-xs sm:text-sm">
                  We employ enterprise-grade structural security measures (AES-256 SSL encryption during transit, secure cloud databases hosted via Firebase Firestore, and restricted database access control). Access to consumer datasets is strictly limited to Advocate Reynold D'Souza and authorized litigation teams. No details are shared with external marketing networks.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-2">
                <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gold shrink-0" />
                  5. Your Legal Rights (Data Principal Rights)
                </h3>
                <p className="font-light text-xs sm:text-sm">
                  As a Data Principal under Indian Law, you possess the following rights:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm font-light space-y-1">
                  <li><strong>Right to Summary:</strong> Request a complete summary of all personal datasets stored in our databases.</li>
                  <li><strong>Right to Correction & Erasure:</strong> Instruct us to rectify inaccuracies or permanently erase your details from our active intake files.</li>
                  <li><strong>Right to Grievance Redressal:</strong> Register questions or raise disputes regarding data handling procedures.</li>
                </ul>
                <p className="font-light text-xs sm:text-sm">
                  To exercise any of these rights, transmit a formal request directly to our secure administrative desk: <a href="mailto:admin@olivelawfirm.com" className="text-gold font-bold underline hover:text-gold/80">admin@olivelawfirm.com</a>.
                </p>
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
