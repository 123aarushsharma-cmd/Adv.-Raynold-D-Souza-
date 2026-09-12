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
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  serviceType: string;
  schemaCategory: string;
}

const practiceData: PracticeArea[] = [
  {
    id: "constitutional",
    title: "Constitutional & Human Rights Law",
    shortDesc: "Scholarly representation before the Supreme Court of India, High Court of Karnataka, and National/State Human Rights Commissions.",
    longDesc: "We provide high-stakes advocacy in cases involving fundamental constitutional liberties, judicial reviews, and human rights violations. Our firm regularly represents individuals, associations, and corporate entities in writ petitions, special leave petitions, and constitutional appeals before the Hon'ble Supreme Court of India, the High Court of Karnataka (Bengaluru, Dharwad, and Kalaburagi Benches), and other High Courts across India.",
    icon: <Landmark size={24} />,
    iconName: "Landmark",
    mattersCovered: [
      "Writ Petitions & Constitutional challenges under Article 226 & 32",
      "Special Leave Petitions (SLPs) before the Supreme Court of India",
      "Appellate practice before the High Court of Karnataka",
      "Human Rights litigation before NHRC and KSHRC",
      "Administrative Law and Service matters before state tribunals"
    ],
    successCase: {
      title: "Constitutional Writ Petition",
      result: "Successfully challenged and overturned an unlawful executive decree infringing upon public service rights before the High Court of Karnataka.",
    },
    keyAttorney: "Advocate Reynold D'Souza",
    seoTitle: "Constitutional & Writ Petition Advocate | High Court Dharwad & Bengaluru | Olive Law Firm®",
    seoDescription: "Specialized Writ Petitions under Article 226 & 32, Special Leave Petitions (SLPs) before Supreme Court of India, and High Court litigation across Bengaluru, Dharwad, and Belagavi by Advocate Reynold D'Souza.",
    seoKeywords: "Writ petition advocate Dharwad High Court, Constitutional lawyer Bengaluru, Supreme Court SLP advocate Karnataka, Article 226 advocate Dharwad, Human rights lawyer Belagavi, High Court litigation Karnataka",
    serviceType: "Constitutional & Writ Petition Litigation",
    schemaCategory: "Constitutional & Human Rights Law"
  },
  {
    id: "criminal",
    title: "Criminal Defense & Trial Advocacy",
    shortDesc: "Rigorous trial defense and appellate representation before Sessions Courts, High Court, and the Supreme Court.",
    longDesc: "When liberty, reputation, and livelihood are on the line, we deploy relentless and masterfully researched defense strategies. We handle complex trials, criminal appeals, revision petitions, and bail applications before Sessions Courts and District Courts in Bengaluru, Dharwad, Belagavi, the High Court of Karnataka, and the Supreme Court of India.",
    icon: <ShieldAlert size={24} />,
    iconName: "ShieldAlert",
    mattersCovered: [
      "Rigorous criminal trials and district-level defense representation",
      "Criminal appeals and revision petitions before High Courts",
      "Appeals and special petitions before the Supreme Court of India",
      "Bail and Anticipatory Bail applications (Section 438 CrPC / 482 BNSS)",
      "White-collar defense, compliance audits, and commercial trials"
    ],
    successCase: {
      title: "Sessions Trial Defense Appeal",
      result: "Obtained clean acquittal in a complex, multi-party criminal charge before the Sessions Court through intensive cross-examination.",
    },
    keyAttorney: "Advocate Reynold D'Souza",
    seoTitle: "Criminal Defense & Trial Advocate | Sessions & High Court Karnataka | Olive Law Firm®",
    seoDescription: "Relentless criminal trial defense, Sessions Court litigation, anticipatory bail applications (BNSS / CrPC), and appellate defense before High Court of Karnataka and Supreme Court across Bengaluru, Dharwad, and Belagavi.",
    seoKeywords: "Criminal defense lawyer Dharwad, Anticipatory bail advocate Belagavi, Sessions Court trial advocate Dharwad, Criminal appeal lawyer High Court Bengaluru, White collar defense lawyer Karnataka, Section 482 BNSS bail lawyer",
    serviceType: "Criminal Defense & Appellate Advocacy",
    schemaCategory: "Criminal Law"
  },
  {
    id: "property",
    title: "Property, Apartment & RERA Law",
    shortDesc: "Comprehensive property clearances, K-RERA litigation, and apartment association disputes.",
    longDesc: "We advise developers, landowners, apartment associations, and individual buyers across Karnataka. We handle RERA registrations and disputes, title verification clearances, property acquisitions, and property litigation before Civil Courts, Revenue Courts, and the K-RERA Appellate Tribunal in our Bengaluru Head Office and distinct satellite locations.",
    icon: <Building2 size={24} />,
    iconName: "Building2",
    mattersCovered: [
      "K-RERA regulatory filing and compliance representation",
      "Apartment Association bylaws, registrations, and dispute resolutions",
      "Title investigation reports and due diligence checks",
      "Partition suits, declarations, and property title litigation",
      "Revenue court disputes, land conversion, and tenancy matters"
    ],
    successCase: {
      title: "K-RERA Regulatory Settlement",
      result: "Resolved a major builder delay dispute, securing full interest and refund compensation for 15 apartment buyers.",
    },
    keyAttorney: "Advocate Reynold D'Souza",
    seoTitle: "Property Dispute & K-RERA Lawyer | Title Clearance Karnataka | Olive Law Firm®",
    seoDescription: "Comprehensive property title verification, partition suits, K-RERA developer dispute settlement, and apartment association litigation in Bengaluru, Dharwad, and Belagavi.",
    seoKeywords: "Property dispute advocate Dharwad, K-RERA lawyer Bengaluru, Title verification lawyer Dharwad, Apartment association legal counsel Belagavi, Land partition suit advocate Karnataka, Revenue court lawyer",
    serviceType: "Property & Real Estate Legal Services",
    schemaCategory: "Property & RERA Law"
  },
  {
    id: "consumer",
    title: "Consumer Rights Protection",
    shortDesc: "Consumer disputes advocacy before District Commissions, KSDRC, NCDRC, and NCLT company trials.",
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
    seoTitle: "Consumer Protection & NCLT Advocate | KSDRC Appeals | Olive Law Firm®",
    seoDescription: "Strategic prosecution of corporate negligence, service deficiency claims before District Forums, KSDRC State Commission, NCDRC, and NCLT corporate dispute advocacy in Karnataka.",
    seoKeywords: "Consumer court lawyer Bengaluru, KSDRC advocate Karnataka, Service deficiency advocate Dharwad, NCLT corporate litigation Dharwad, Product liability lawyer Belagavi, NCDRC consumer rights lawyer",
    serviceType: "Consumer Rights & NCLT Litigation",
    schemaCategory: "Consumer & Corporate Law"
  },
  {
    id: "labour",
    title: "Labour & Administrative Tribunals",
    shortDesc: "Dedicated service law and administrative litigation before KAT, CGIT, and Labour Courts.",
    longDesc: "Representing public employees, industrial workers, and employers before specialized tribunals. We regularly practice before the Karnataka Administrative Tribunal (KAT), Central Administrative Tribunal (CAT), Central Government Industrial Tribunal (CGIT), and various Central and State Labour Courts in our Bengaluru Head Office and distinct satellite locations.",
    icon: <Briefcase size={24} />,
    iconName: "Briefcase",
    mattersCovered: [
      "KAT (Karnataka Administrative Tribunal) service law petitions",
      "Central Administrative Tribunal (CAT) central government service cases",
      "Labour court industrial disputes, wages, and terminations",
      "Central Government Industrial Tribunal (CGIT) representations",
      "Public employment rules, promotion challenges, and reinstatements"
    ],
    successCase: {
      title: "KAT Service Reinstatement",
      result: "Reversed a wrongful administrative suspension, restoring full seniority and back wages for a long-serving state official.",
    },
    keyAttorney: "Advocate Reynold D'Souza",
    seoTitle: "Service Law & KAT Advocate | Labour Court & Tribunal Lawyer | Olive Law Firm®",
    seoDescription: "Dedicated service petitions before Karnataka Administrative Tribunal (KAT), CAT, CGIT, and industrial disputes before Labour Courts in Bengaluru, Dharwad, and Belagavi.",
    seoKeywords: "KAT advocate Bengaluru, Karnataka Administrative Tribunal lawyer, Service law petition advocate Dharwad, Labour court lawyer Belagavi, CGIT advocate Dharwad, CAT service petition lawyer",
    serviceType: "Administrative & Service Law Services",
    schemaCategory: "Labour & Administrative Law"
  },
  {
    id: "arbitration",
    title: "Arbitration, Mediation & Conciliation",
    shortDesc: "Alternative Dispute Resolution (ADR) services covering international/domestic arbitration, mediation, and conciliation.",
    longDesc: "When dispute resolution demands confidentiality, velocity, and specialized commercial expertise, our firm orchestrates state-of-the-art Alternative Dispute Resolution (ADR). We offer comprehensive advocacy and neutral services in Domestic and International Arbitrations, judicial mediations, and family conciliation across Bengaluru, Dharwad, and Belagavi.",
    icon: <HeartHandshake size={24} />,
    iconName: "HeartHandshake",
    mattersCovered: [
      "Commercial Arbitrations (Domestic and International)",
      "Court-referred and private Meditations",
      "Conciliation and settlement drafting of corporate/family disputes",
      "Amicable partition, family dispute settlements, and family counselling",
      "Section 11, 9, 34, and 37 applications under the Arbitration Act"
    ],
    successCase: {
      title: "Amicable Partition Dispute Settlement",
      result: "Concluded a long-running family property division out-of-court, saving valuable time and protecting family relations.",
    },
    keyAttorney: "Advocate Reynold D'Souza",
    seoTitle: "Commercial Arbitration & Mediation Advocate | Domestic & International ADR | Olive Law Firm®",
    seoDescription: "Expert Alternative Dispute Resolution (ADR), Section 11/9/34/37 arbitration petitions, court-referred mediations, and family conciliation in Bengaluru, Dharwad, and Belagavi.",
    seoKeywords: "Arbitration lawyer Bengaluru, Commercial dispute arbitrator Karnataka, Court mediation lawyer Dharwad, Family conciliation advocate Dharwad, ADR legal counsel Belagavi, Arbitration Act section 11 lawyer",
    serviceType: "Alternative Dispute Resolution & Arbitration Services",
    schemaCategory: "Arbitration & Dispute Resolution"
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

  // Dynamically update document title, OpenGraph tags, Twitter card, and canonical links for local legal service SEO
  useEffect(() => {
    const setMetaTag = (selector: string, attribute: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        const match = selector.match(/\[(name|property)=["']?([^"']+)["']?\]/);
        if (match) {
          el.setAttribute(match[1], match[2]);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attribute, value);
    };

    const origin = typeof window !== "undefined" ? window.location.origin : "https://olivelawfirm.com";

    if (selectedArea) {
      document.title = selectedArea.seoTitle;
      const practiceUrl = `${origin}/#practice-${selectedArea.id}`;

      setMetaTag('meta[property="og:title"]', "content", selectedArea.seoTitle);
      setMetaTag('meta[property="og:description"]', "content", selectedArea.seoDescription);
      setMetaTag('meta[property="og:url"]', "content", practiceUrl);
      setMetaTag('meta[property="og:type"]', "content", "article");
      setMetaTag('meta[name="twitter:title"]', "content", selectedArea.seoTitle);
      setMetaTag('meta[name="twitter:description"]', "content", selectedArea.seoDescription);
      setMetaTag('meta[name="keywords"]', "content", selectedArea.seoKeywords);

      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute("href", practiceUrl);
      }
    } else {
      document.title = "Olive Law Firm® | Supreme Court & High Court Litigation | Dharwad, Belagavi & Bengaluru";

      setMetaTag('meta[property="og:title"]', "content", "Olive Law Firm® | Supreme Court & High Court Litigation | Dharwad, Belagavi & Bengaluru");
      setMetaTag('meta[property="og:description"]', "content", "Olive Law Firm®, led by Advocate Reynold D'Souza, specializes in Supreme Court and High Court litigation across Karnataka, with branch locations in Dharwad, Belagavi, and Bengaluru.");
      setMetaTag('meta[property="og:url"]', "content", origin);
      setMetaTag('meta[property="og:type"]', "content", "website");
      setMetaTag('meta[name="twitter:title"]', "content", "Olive Law Firm® | Supreme Court & High Court Litigation | Dharwad, Belagavi & Bengaluru");
      setMetaTag('meta[name="twitter:description"]', "content", "Specializing in Supreme Court and High Court litigation with branch locations across Dharwad, Belagavi, and Bengaluru.");
      setMetaTag('meta[name="keywords"]', "content", "Olive Law Firm, Advocate Reynold D'Souza, Supreme Court litigation advocate, High Court litigation lawyer Karnataka, top advocate Dharwad, High Court Dharwad bench lawyer, legal counsel Belagavi, best law firm Bengaluru");

      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute("href", origin);
      }
    }
  }, [selectedArea]);

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

        {/* Dynamic SEO JSON-LD Structured Data for Local Legal Services */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "LegalService",
                  "@id": `${typeof window !== "undefined" ? window.location.origin : "https://olivelawfirm.com"}/#organization`,
                  "name": "Olive Law Firm®",
                  "description": "Premier law firm specializing in Supreme Court of India and High Court of Karnataka litigation, with branch locations in Dharwad, Belagavi, and Head Office in Bengaluru.",
                  "url": typeof window !== "undefined" ? window.location.origin : "https://olivelawfirm.com",
                  "logo": `${typeof window !== "undefined" ? window.location.origin : "https://olivelawfirm.com"}/logo.png`,
                  "founder": {
                    "@type": "Person",
                    "name": "Advocate Reynold D'Souza",
                    "jobTitle": "Lead Advocate & Counsel"
                  },
                  "areaServed": [
                    { "@type": "City", "name": "Dharwad" },
                    { "@type": "City", "name": "Belagavi" },
                    { "@type": "City", "name": "Bengaluru" },
                    { "@type": "State", "name": "Karnataka" }
                  ],
                  "knowsAbout": practiceData.map(area => area.title)
                },
                ...practiceData.map((area, idx) => ({
                  "@type": "Service",
                  "@id": `${typeof window !== "undefined" ? window.location.origin : "https://olivelawfirm.com"}/#practice-${area.id}`,
                  "position": idx + 1,
                  "name": area.title,
                  "serviceType": area.serviceType,
                  "category": area.schemaCategory,
                  "description": area.longDesc,
                  "provider": {
                    "@type": "LegalService",
                    "name": "Olive Law Firm®",
                    "url": typeof window !== "undefined" ? window.location.origin : "https://olivelawfirm.com"
                  },
                  "areaServed": [
                    { "@type": "City", "name": "Dharwad", "sameAs": "https://en.wikipedia.org/wiki/Dharwad" },
                    { "@type": "City", "name": "Belagavi", "sameAs": "https://en.wikipedia.org/wiki/Belgaum" },
                    { "@type": "City", "name": "Bengaluru", "sameAs": "https://en.wikipedia.org/wiki/Bangalore" },
                    { "@type": "State", "name": "Karnataka" }
                  ],
                  "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": `${area.title} Competencies`,
                    "itemListElement": area.mattersCovered.map((matter, mIdx) => ({
                      "@type": "Offer",
                      "position": mIdx + 1,
                      "itemOffered": {
                        "@type": "Service",
                        "name": matter
                      }
                    }))
                  }
                })),
                {
                  "@type": "BreadcrumbList",
                  "@id": `${typeof window !== "undefined" ? window.location.origin : "https://olivelawfirm.com"}/#breadcrumbs`,
                  "itemListElement": [
                    {
                      "@type": "ListItem",
                      "position": 1,
                      "name": "Home",
                      "item": typeof window !== "undefined" ? window.location.origin : "https://olivelawfirm.com"
                    },
                    {
                      "@type": "ListItem",
                      "position": 2,
                      "name": "Practice Areas",
                      "item": `${typeof window !== "undefined" ? window.location.origin : "https://olivelawfirm.com"}/#practice-areas`
                    },
                    ...(selectedArea ? [{
                      "@type": "ListItem",
                      "position": 3,
                      "name": selectedArea.title,
                      "item": `${typeof window !== "undefined" ? window.location.origin : "https://olivelawfirm.com"}/#practice-${selectedArea.id}`
                    }] : [])
                  ]
                }
              ]
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
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  opacity: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                  y: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                  scale: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                  layout: { type: "spring", stiffness: 350, damping: 28 }
                }}
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
