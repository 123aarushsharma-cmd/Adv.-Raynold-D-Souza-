import React, { useState } from "react";
import { ChevronDown, FileText, CheckCircle2, Award, ClipboardCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const faqs: FAQItem[] = [
  {
    question: "What must a client expect and receive while meeting an advocate for a consultation?",
    answer: (
      <div className="space-y-3 font-sans text-sm text-charcoal/80 leading-relaxed font-light">
        <p>
          At Olive Law Chambers®, we believe in complete transparency and institutional standards of professional legal advisory. During your initial consultation, every client is entitled to, and must receive:
        </p>
        <ul className="space-y-2 pt-1.5">
          <li className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-gold shrink-0 mt-0.5" />
            <span><strong>Candid Case Assessment:</strong> A objective, realistic legal opinion regarding the strengths, weaknesses, and potential liabilities of your case. No false promises.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-gold shrink-0 mt-0.5" />
            <span><strong>Transparent Fee Structure:</strong> A detailed breakdown of our fee schedule (drafting fees, appearance charges, and miscellaneous clerkages) without any hidden disbursements.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-gold shrink-0 mt-0.5" />
            <span><strong>Strategic Next Steps Docket:</strong> A clear, actionable timeline of the judicial steps (pre-litigation notice, petition drafting, filing, and trial representations) recommended for your matter.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-gold shrink-0 mt-0.5" />
            <span><strong>Confidentiality Assurance:</strong> Written and verbal assurance that all disclosures are bound under absolute attorney-client privilege (Section 126, Indian Evidence Act).</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: "What is the comprehensive list of documents I should prepare and carry for my meeting?",
    answer: (
      <div className="space-y-3 font-sans text-sm text-charcoal/80 leading-relaxed font-light">
        <p>
          To enable us to conduct a comprehensive legal audit during our meeting, please organize and prepare the following documents relevant to your specific practice area:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {/* Property / RERA */}
          <div className="bg-sage-light/30 border border-forest/5 p-3.5 rounded-sm">
            <p className="font-serif text-sm font-semibold text-forest flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-gold inline-block" />
              Property &amp; K-RERA Matters
            </p>
            <ul className="space-y-1 text-xs">
              <li>• Registered Sale Deeds / Parent Deeds</li>
              <li>• Khata Certificate &amp; Latest Khata Extract</li>
              <li>• Encumbrance Certificate (EC) for past 30 years</li>
              <li>• Sanctioned Building Plan &amp; Occupancy Certificate</li>
              <li>• Joint Development Agreements (if any)</li>
            </ul>
          </div>

          {/* Criminal Defense */}
          <div className="bg-sage-light/30 border border-forest/5 p-3.5 rounded-sm">
            <p className="font-serif text-sm font-semibold text-forest flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-gold inline-block" />
              Criminal Defense &amp; Bail
            </p>
            <ul className="space-y-1 text-xs">
              <li>• Copy of FIR (First Information Report)</li>
              <li>• Copy of Complaint &amp; Charge Sheet (if filed)</li>
              <li>• Remand Application / Show Cause Notices</li>
              <li>• Anticipatory Bail notices / summon copy</li>
              <li>• Character certificates and identity dossiers</li>
            </ul>
          </div>

          {/* Service & Administrative KAT */}
          <div className="bg-sage-light/30 border border-forest/5 p-3.5 rounded-sm">
            <p className="font-serif text-sm font-semibold text-forest flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-gold inline-block" />
              Labour &amp; KAT Tribunals
            </p>
            <ul className="space-y-1 text-xs">
              <li>• Employment Agreement / Appointment Letter</li>
              <li>• Show Cause Notices &amp; Explanation Letters</li>
              <li>• Inquiry Reports / Termination Orders</li>
              <li>• Seniority lists / Gazette notification extracts</li>
              <li>• Relevant service record representations</li>
            </ul>
          </div>

          {/* Consumer & Corporate ADR */}
          <div className="bg-sage-light/30 border border-forest/5 p-3.5 rounded-sm">
            <p className="font-serif text-sm font-semibold text-forest flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-gold inline-block" />
              Consumer Disputes &amp; ADR
            </p>
            <ul className="space-y-1 text-xs">
              <li>• Invoices, Receipts &amp; Purchase Orders</li>
              <li>• Written Communications (Emails / Notices)</li>
              <li>• Service Warranties / Legal Contracts</li>
              <li>• Arbitration Clause agreements</li>
              <li>• Proof of financial damages / bank statements</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    question: "How does the firm guarantee attorney-client privilege?",
    answer: (
      <p className="font-sans text-sm text-charcoal/80 leading-relaxed font-light">
        Under Section 126 of the Indian Evidence Act, 1872, any communication made to us by a client, any advice given in the course of employment, and any documents shared in confidence are protected under absolute legal privilege. We maintain a secure internal case server and never disclose client identities, case files, or strategic notes to any third-party or state authorities without express written mandate from the client.
      </p>
    ),
  },
  {
    question: "How long does it take for the chambers to draft a writ petition or bail application?",
    answer: (
      <p className="font-sans text-sm text-charcoal/80 leading-relaxed font-light">
        Emergency matters (such as anticipatory bail applications or urgent stay petitions under Article 226/227) are fast-tracked and can be prepared, reviewed, and finalized for filing within 12 to 24 hours. General civil suits, K-RERA complaints, and KAT petitions require thorough research and title vetting, typically taking between 3 to 7 working days to ensure unassailable judicial quality.
      </p>
    ),
  },
  {
    question: "Can I schedule a consultation at your Hubballi, Dharwad, or Belagavi satellite locations?",
    answer: (
      <p className="font-sans text-sm text-charcoal/80 leading-relaxed font-light">
        Yes. While Advocate Reynold D'Souza's primary chamber remains our clearly designated Bengaluru Head Office, our associate advocates actively manage fully staffed distinct satellite locations in Hubballi, Dharwad, and Belagavi. Clients can schedule local in-person meetings at these satellite chambers or opt for highly secure video-conferencing sessions coordinated directly by our senior team in Bengaluru.
      </p>
    ),
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFAQ = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-14 md:py-16 bg-ivory border-t border-forest/5 relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none motif-bg" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-gold" />
            <span className="font-sans text-xs sm:text-sm text-gold font-bold tracking-[0.2em] uppercase">
              FAQ Dossier
            </span>
            <span className="w-8 h-px bg-gold" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-forest tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 h-[1px] w-12 bg-gold mx-auto" />
          <p className="font-sans text-sm text-charcoal/70 mt-3 font-light">
            Essential guidelines for prospective clients preparing for administrative or trial court defense advisory with our team.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4" id="faq-accordion-group">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-forest/10 rounded-sm overflow-hidden shadow-sm transition-all duration-300"
              >
                <button
                  id={`faq-btn-${idx}`}
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-serif text-base sm:text-lg font-bold text-forest hover:text-gold transition-colors bg-white focus:outline-none cursor-pointer"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`text-gold shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false} mode="wait">
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden border-t border-forest/5"
                    >
                      <div className="p-5 sm:p-6 bg-sage-light/10">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Help banner */}
        <div className="bg-forest text-ivory rounded-sm p-6 sm:p-8 border border-gold/25 shadow-md mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4 shrink-0 sm:shrink">
            <div className="w-12 h-12 rounded-sm bg-gold/15 border border-gold/30 text-gold flex items-center justify-center shrink-0">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-gold">Ready to Schedule?</h4>
              <p className="font-sans text-xs text-ivory/80 mt-1 font-light max-w-md">
                Ensure all available documents from the checklists above are ready. Our team will perform an initial audit on your papers during the intake call.
              </p>
            </div>
          </div>
          <a
            href="#contact"
            className="w-full sm:w-auto bg-gold hover:bg-gold-hover text-forest font-sans font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-sm transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-95 text-center shrink-0"
          >
            Schedule Free Advisory
          </a>
        </div>

      </div>
    </section>
  );
}
