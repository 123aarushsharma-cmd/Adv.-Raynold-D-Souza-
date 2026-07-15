import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Gavel,
  ShieldAlert,
  HeartHandshake,
  Building2,
  Landmark,
  ShieldCheck,
  X,
  FileText,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Search
} from "lucide-react";

interface PracticeArea {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  icon: React.ReactNode;
  iconName: string;
  mattersCovered: string[];
  successCase: {
    title: string;
    result: string;
  };
  keyAttorney: string;
}

const practiceData: PracticeArea[] = [
  {
    id: "constitutional",
    title: "Constitutional & Human Rights Law",
    shortDesc: "Aggressive and scholarly representation for fundamental rights and violations before KSHRC and NHRC.",
    longDesc: "We provide high-stakes advocacy in cases involving fundamental constitutional liberties. Our firm regularly represents individuals and organizations before the High Court and administrative commissions, ensuring that executive actions and statutory applications strictly align with constitutional mandates.",
    icon: <Landmark size={24} />,
    iconName: "Landmark",
    mattersCovered: [
      "Constitutional Law matters",
      "Human Rights NHRC/KSHRC disputes",
      "Fundamental Rights (Writ Petitions)",
      "Administrative law challenges",
      "Karnataka Administrative Tribunal matters"
    ],
    successCase: {
      title: "Constitutional Writ Petition",
      result: "Successfully challenged and overturned an unlawful executive decree infringing upon public service rights before the High Court of Karnataka.",
    },
    keyAttorney: "Advocate Reynold D'Souza",
  },
  {
    id: "criminal",
    title: "Criminal Defense & Trial Advocacy",
    shortDesc: "Unyielding defense litigation representing clients before Sessions Courts, District Courts, and the High Court.",
    longDesc: "When your freedom, livelihood, and reputation are on the line, we provide rigorous and uncompromised criminal defense. We handle complex trial advocacy, bail applications, and statutory appeals, ensuring that procedural standards and constitutional defenses are fully mobilized.",
    icon: <ShieldAlert size={24} />,
    iconName: "ShieldAlert",
    mattersCovered: [
      "Criminal Law trials and appeals",
      "Sessions Court defense litigations",
      "High Court of Karnataka criminal revision petitions",
      "Bail and Anticipatory Bail matters",
      "IPC / CrPC statutory compliance defense"
    ],
    successCase: {
      title: "Sessions Trial Defense Appeal",
      result: "Obtained clean acquittal in a complex, multi-party criminal charge before the Sessions Court through intensive cross-examination.",
    },
    keyAttorney: "Advocate Reynold D'Souza",
  },
  {
    id: "property",
    title: "Property, Apartment & RERA Law",
    shortDesc: "Full-scale property advocacy including K-RERA compliance, Apartment Association Laws, and land-use registration.",
    longDesc: "Serving property developers, owners, apartment associations, and individual buyers across Karnataka. We handle RERA registrations and disputes, apartment society formations, complex land title clearances, and real estate litigation across tribunals.",
    icon: <Building2 size={24} />,
    iconName: "Building2",
    mattersCovered: [
      "RERA (Regulatory Authority) K-RERA disputes",
      "Apartment Association Laws & bylaws",
      "Property acquisition & registration title clearances",
      "Co-Operative Society Law matters",
      "Quiet Title and Land-use litigation"
    ],
    successCase: {
      title: "K-RERA Regulatory Settlement",
      result: "Resolved a major builder delay dispute, securing full interest and refund compensation for 15 apartment buyers.",
    },
    keyAttorney: "Advocate Reynold D'Souza",
  },
  {
    id: "consumer",
    title: "Consumer Rights Protection",
    shortDesc: "Aggressive consumer advocacy before NCDRC/KSDRC and company disputes under NCLT.",
    longDesc: "Protecting consumer and business interests under national and state consumer acts. We prosecute fraudulent trade practices, service deficiencies, and corporate negligence, representing clients before District and State commissions with exceptional success.",
    icon: <ShieldCheck size={24} />,
    iconName: "ShieldCheck",
    mattersCovered: [
      "Consumer Disputes NCDRC/KSDRC",
      "Company Law NCLT disputes",
      "Service negligence and product liability claims",
      "Unfair or Deceptive Trade practices prosecution",
      "Corporate contractual liability & compliance"
    ],
    successCase: {
      title: "State Commission Consumer Appeal",
      result: "Secured complete punitive damage compensation and interest against a multi-national financial vendor for severe service neglect.",
    },
    keyAttorney: "Advocate Reynold D'Souza",
  },
  {
    id: "labour",
    title: "Labour & Administrative Tribunals",
    shortDesc: "Dedicated dispute resolution and litigation before Karnataka Appellate and Administrative Tribunals.",
    longDesc: "Representing public employees, workers, and organizations before specialised tribunals. We master the intricacies of public employment rules, service conditions, and industrial labor disputes to deliver strategic administrative victories.",
    icon: <Briefcase size={24} />,
    iconName: "Briefcase",
    mattersCovered: [
      "Labour laws and Industrial Disputes",
      "Karnataka Appellate Tribunal representation",
      "Karnataka Administrative Tribunal (KAT) petitions",
      "Service conditions & wrongful termination claims",
      "Collective bargaining & settlements"
    ],
    successCase: {
      title: "KAT Service Reinstatement",
      result: "Reversed a wrongful administrative suspension, restoring full seniority and back wages for a long-serving state official.",
    },
    keyAttorney: "Advocate Reynold D'Souza",
  },
  {
    id: "arbitration",
    title: "Arbitration, Mediation & Family Law",
    shortDesc: "Expert conciliation, family dispute settlements, and professional dispute resolution.",
    longDesc: "We approach family, inheritance, and business restructuring with extreme discretion and high emotional intelligence. When dispute resolution demands absolute confidentiality, we orchestrate legally-binding arbitration and mediation to secure optimal settlements.",
    icon: <HeartHandshake size={24} />,
    iconName: "HeartHandshake",
    mattersCovered: [
      "Arbitration, Mediation, Conciliation & Settlements",
      "Family and Matrimonial disputes",
      "Equitable partition & inheritance planning",
      "Child custody & matrimonial mediation",
      "Socio-economic amicable settlements"
    ],
    successCase: {
      title: "Amicable Partition Dispute Settlement",
      result: "Concluded a long-running family property division out-of-court, saving valuable time and protecting family relations.",
    },
    keyAttorney: "Advocate Reynold D'Souza",
  },
];

export default function PracticeAreas() {
  const [selectedArea, setSelectedArea] = useState<PracticeArea | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filterCategories = [
    { id: "all", label: "All Specializations" },
    { id: "constitutional", label: "Constitutional" },
    { id: "criminal", label: "Criminal" },
    { id: "property", label: "Property & RERA" },
    { id: "consumer", label: "Consumer Protection" },
    { id: "tribunals", label: "Tribunals & ADR" },
  ];

  const filteredAreas = practiceData.filter((area) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      area.title.toLowerCase().includes(query) ||
      area.shortDesc.toLowerCase().includes(query) ||
      area.longDesc.toLowerCase().includes(query) ||
      area.mattersCovered.some((m) => m.toLowerCase().includes(query));

    const matchesCategory =
      activeFilter === "all" ||
      (activeFilter === "tribunals" && (area.id === "labour" || area.id === "arbitration")) ||
      area.id === activeFilter;

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const handleOpenArea = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      const areaId = customEvent.detail?.id;
      if (areaId) {
        const matched = practiceData.find(a => a.id === areaId);
        if (matched) {
          setSelectedArea(matched);
          
          // Scroll to the practice areas section
          const element = document.getElementById("practice-areas");
          if (element) {
            const offset = 85;
            const rect = element.getBoundingClientRect();
            const elementPosition = rect.top + window.scrollY;
            window.scrollTo({
              top: elementPosition - offset,
              behavior: "smooth"
            });
          }
        }
      }
    };

    window.addEventListener("open-practice-area", handleOpenArea);
    
    // Also support direct hash on initial page load
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#practice-")) {
        const areaId = hash.replace("#practice-", "");
        const matched = practiceData.find(a => a.id === areaId);
        if (matched) {
          setSelectedArea(matched);
          const element = document.getElementById("practice-areas");
          if (element) {
            setTimeout(() => {
              const offset = 85;
              const rect = element.getBoundingClientRect();
              const elementPosition = rect.top + window.scrollY;
              window.scrollTo({
                top: elementPosition - offset,
                behavior: "smooth"
              });
            }, 300);
          }
        }
      }
    };
    handleHash();

    return () => {
      window.removeEventListener("open-practice-area", handleOpenArea);
    };
  }, []);

  return (
    <section className="py-14 md:py-16 bg-ivory relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none motif-bg" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-gold" />
            <span className="font-sans text-xs sm:text-sm text-gold font-bold tracking-[0.2em] uppercase">
              Areas of Practice
            </span>
            <span className="w-8 h-px bg-gold" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-forest tracking-tight">
            Comprehensive Legal Protection, Crafted for Exceptional Outcomes
          </h2>
          <div className="mt-6 h-[1px] w-12 bg-gold mx-auto" />
          <p className="font-sans text-sm sm:text-base text-charcoal/70 mt-4 font-light">
            We operate across major legal disciplines to deliver strategic, precise advocacy. 
            Select an area to explore detailed competencies and case results.
          </p>
        </div>

        {/* Dynamic SEO JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LegalService",
              "@id": `${typeof window !== "undefined" ? window.location.origin : "https://olivelawfirm.com"}/#practice-areas`,
              "name": "Olive Law Chambers",
              "description": "Expert and scholarly legal services and trial advocacy led by Advocate Reynold D'Souza, covering Constitutional Law, Criminal Defense, Property Law, RERA, and Administrative Tribunals in Bengaluru.",
              "url": typeof window !== "undefined" ? window.location.origin : "https://olivelawfirm.com",
              "telephone": "+91-80-XXXX-XXXX",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "addressCountry": "IN"
              },
              "knowsAbout": practiceData.map(area => area.title),
              "provider": {
                "@type": "Person",
                "name": "Advocate Reynold D'Souza",
                "jobTitle": "Advocate"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Legal Practice Fields",
                "itemListElement": practiceData.map((area, idx) => ({
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": area.title,
                    "description": area.shortDesc
                  },
                  "position": idx + 1
                }))
              }
            })
          }}
        />

        {/* Refined Search & Filter Controls */}
        <div className="mb-10">
          {/* Search Box */}
          <form onSubmit={(e) => e.preventDefault()} role="search" className="mb-8 max-w-md mx-auto relative">
            <label htmlFor="practice-search" className="sr-only">Search our practice areas and legal services</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/60 w-4 h-4 pointer-events-none" />
              <input
                id="practice-search"
                type="search"
                placeholder="Search legal services by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-sage-light/35 border border-forest/15 rounded-sm pl-11 pr-10 py-3 text-sm text-forest placeholder-forest/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold focus:bg-white transition-all duration-300 shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-forest/40 hover:text-gold transition-colors p-1 cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto" aria-label="Filter practice areas">
            {filterCategories.map((cat) => {
              const isActive = activeFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-sans font-semibold tracking-wider uppercase transition-all duration-300 border cursor-pointer ${
                    isActive
                      ? "bg-forest border-forest text-gold shadow-md"
                      : "bg-sage-light/25 border-forest/10 text-forest/70 hover:bg-forest/10 hover:border-forest/25 hover:text-forest"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Practice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[300px]">
          <AnimatePresence mode="popLayout">
            {filteredAreas.map((area) => (
              <motion.article
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                key={area.id}
                className="practice-card bg-sage-light/50 border border-forest/5 p-8 rounded-sm flex flex-col justify-between group relative overflow-hidden shadow-sm hover:shadow-md"
                whileHover={{ 
                  y: -6,
                  borderColor: "rgba(201, 162, 39, 0.35)",
                }}
                style={{ willChange: "transform, border-color, box-shadow" }}
              >
                {/* Subtle luxury glow effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-gold/0 via-gold/[0.005] to-gold/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative z-10">
                  {/* Icon Circle */}
                  <div className="w-14 h-14 rounded-sm bg-forest text-gold flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-105 group-hover:bg-gold group-hover:text-forest">
                    {area.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-serif text-xl font-bold text-forest mb-3 tracking-tight group-hover:text-gold transition-colors duration-200">
                    {area.title}
                  </h3>
                  
                  {/* Short Description */}
                  <p className="font-sans text-sm text-charcoal/80 leading-relaxed font-light mb-6">
                    {area.shortDesc}
                  </p>
                </div>

                {/* Action Button */}
                <motion.button
                  id={`btn-learn-more-${area.id}`}
                  onClick={() => setSelectedArea(area)}
                  whileTap={{ scale: 0.97 }}
                  className="relative z-10 font-sans text-xs sm:text-sm text-gold group-hover:text-forest font-semibold tracking-wider uppercase inline-flex items-center gap-2 group-hover:bg-gold/10 px-3 py-1.5 rounded-sm transition-all duration-300 w-fit cursor-pointer"
                >
                  Learn More
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </motion.button>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* No Results Fallback */}
        {filteredAreas.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 max-w-md mx-auto"
          >
            <div className="w-12 h-12 bg-sage-light/30 text-gold/60 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-forest">No practices found</h3>
            <p className="font-sans text-sm text-charcoal/60 mt-2 font-light">
              No legal services match your keyword "{searchQuery}". Try selecting another category or resetting filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
              className="mt-6 text-xs font-sans font-bold tracking-wider uppercase text-gold hover:text-gold/80 transition-colors underline cursor-pointer"
            >
              Reset Search & Filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Slide-In Legal Dossier Modal/Drawer */}
      <AnimatePresence>
        {selectedArea && (
          <div
            id="practice-area-modal-overlay"
            className="fixed inset-0 bg-forest/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedArea(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-ivory border border-gold/40 shadow-2xl rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-forest text-ivory px-6 py-5 sm:px-8 flex items-center justify-between border-b border-gold/30">
                <div className="flex items-center gap-3">
                  <div className="text-gold">
                    {selectedArea.icon}
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wide">
                    {selectedArea.title}
                  </h3>
                </div>
                <button
                  id="close-practice-modal"
                  onClick={() => setSelectedArea(null)}
                  className="text-ivory/80 hover:text-gold p-1.5 rounded-full hover:bg-ivory/10 transition-colors"
                  aria-label="Close details"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h4 className="font-serif text-lg font-semibold text-forest mb-2">Practice Overview</h4>
                  <p className="font-sans text-sm sm:text-base text-charcoal/80 leading-relaxed font-light">
                    {selectedArea.longDesc}
                  </p>
                </div>

                {/* Scope list */}
                <div>
                  <h4 className="font-serif text-lg font-semibold text-forest mb-3">Key Legal Competencies</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedArea.mattersCovered.map((matter, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-charcoal/90 font-light">
                        <CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5" />
                        <span>{matter}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Representative case outcome */}
                <div className="border border-gold/30 bg-sage-light p-5 rounded-sm">
                  <div className="flex items-center gap-2 text-forest mb-2">
                    <TrendingUp size={18} />
                    <h4 className="font-serif text-base font-bold">Representative Settlement Outcome</h4>
                  </div>
                  <p className="font-sans text-xs uppercase tracking-widest text-gold font-bold">
                    {selectedArea.successCase.title}
                  </p>
                  <p className="font-sans text-sm text-charcoal leading-relaxed font-medium mt-1">
                    {selectedArea.successCase.result}
                  </p>
                </div>

                {/* Senior Contact */}
                <div className="flex items-center justify-between pt-4 border-t border-forest/10 text-xs sm:text-sm">
                  <div>
                    <span className="font-sans text-charcoal/60">Practice Area Director:</span>
                    <p className="font-serif text-base font-bold text-forest">{selectedArea.keyAttorney}</p>
                  </div>
                  <a
                    href="#contact"
                    onClick={() => {
                      setSelectedArea(null);
                      const contactSection = document.getElementById("contact");
                      if (contactSection) {
                        setTimeout(() => {
                          contactSection.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      }
                    }}
                    className="bg-forest hover:bg-forest/95 text-gold font-sans font-semibold text-xs tracking-wider uppercase px-4 py-2.5 rounded-sm transition-colors border border-gold/30 shadow-sm"
                  >
                    Enquire on this Area
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
