import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, onSnapshot, setDoc, Timestamp } from "firebase/firestore";
import { db, subscribeToFirmBroadcast, broadcastFirmSync } from "../lib/firebase";

export interface HeroContent {
  headlinePrefix: string;
  headlineHighlight: string;
  subheadline: string;
  badgeText: string;
  primaryCtaText: string;
  secondaryCtaText: string;
}

export interface FirmStatItem {
  id: string;
  value: string;
  label: string;
  subtext: string;
}

export interface PracticeAreaItem {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  mattersCovered: string[];
  successCaseTitle: string;
  successCaseResult: string;
  keyAttorney: string;
  badge?: string;
}

export interface TestimonialItem {
  id: number;
  quote: string;
  author: string;
  title: string;
  organization: string;
  practiceArea: string;
  rating: number;
  verifiedDate: string;
}

export interface FAQItemData {
  id: string;
  category: string;
  question: string;
  answer: string;
  highlights: string[];
}

export interface FirmContentState {
  hero: HeroContent;
  stats: FirmStatItem[];
  practiceAreas: PracticeAreaItem[];
  testimonials: TestimonialItem[];
  faqs: FAQItemData[];
}

export const DEFAULT_HERO_CONTENT: HeroContent = {
  headlinePrefix: "Justice, Rooted in",
  headlineHighlight: "Uncompromising Integrity",
  subheadline: "Advocate Reynold D'Souza stands as a dedicated guardian of rights and unyielding advocate for justice, litigating before high courts and tribunals with highly rigorous scholarship.",
  badgeText: "High Court of Karnataka & Supreme Court of India",
  primaryCtaText: "Initiate Case Consultation",
  secondaryCtaText: "Review Practice Areas"
};

export const DEFAULT_FIRM_STATS: FirmStatItem[] = [
  {
    id: "years",
    value: "24+",
    label: "Years of Practice",
    subtext: "Decades of trial and appellate advocacy"
  },
  {
    id: "matters",
    value: "2,800+",
    label: "Matters Litigated",
    subtext: "Civil, criminal & constitutional proceedings"
  },
  {
    id: "benches",
    value: "3 Benches",
    label: "Karnataka Jurisdiction",
    subtext: "Bengaluru, Dharwad & Kalaburagi High Court"
  },
  {
    id: "access",
    value: "100%",
    label: "Direct Senior Counsel",
    subtext: "Personal attention from Advocate Reynold D'Souza"
  }
];

export const DEFAULT_PRACTICE_AREAS: PracticeAreaItem[] = [
  {
    id: "constitutional",
    title: "Constitutional & Human Rights Law",
    shortDesc: "Scholarly representation before the Supreme Court of India, High Court of Karnataka, and Human Rights Commissions.",
    longDesc: "We provide high-stakes advocacy in cases involving fundamental constitutional liberties, judicial reviews, and human rights violations. Our firm regularly represents individuals, associations, and corporate entities in writ petitions, special leave petitions, and constitutional appeals before the Hon'ble Supreme Court of India and High Court of Karnataka.",
    mattersCovered: [
      "Writ Petitions & Constitutional challenges under Article 226 & 32",
      "Special Leave Petitions (SLPs) before the Supreme Court of India",
      "Appellate practice before the High Court of Karnataka",
      "Human Rights litigation before NHRC and KSHRC",
      "Administrative Law and Service matters before state tribunals"
    ],
    successCaseTitle: "Constitutional Writ Petition",
    successCaseResult: "Successfully challenged and overturned an unlawful executive decree infringing upon public service rights before the High Court of Karnataka.",
    keyAttorney: "Advocate Reynold D'Souza",
    badge: "Appellate & Constitutional"
  },
  {
    id: "criminal",
    title: "Criminal Defense & Trial Advocacy",
    shortDesc: "Vigorous trial court defense and High Court appellate advocacy for complex economic, white-collar, and statutory offenses.",
    longDesc: "From the initial police investigation through trial court proceedings and high court appeals, we provide uncompromising criminal defense. Our team specializes in anticipatory bail petitions, regular bail hearings, trial defense, and criminal appeals.",
    mattersCovered: [
      "Anticipatory & Regular Bail before Sessions and High Court",
      "Quashing of FIRs & Chargesheets under Section 482 CrPC / BNSS",
      "White Collar Crime, PMLA & Financial Fraud Defense",
      "Trial Defense in Sessions Court & Magistrate Courts",
      "Criminal Revision Petitions & High Court Appeals"
    ],
    successCaseTitle: "High Court Quashing Petition",
    successCaseResult: "Secured complete quashing of malicious criminal proceedings under Section 482, preserving client's career and liberty.",
    keyAttorney: "Advocate Reynold D'Souza",
    badge: "Trial & Criminal Defense"
  },
  {
    id: "property",
    title: "Property, Real Estate & RERA Law",
    shortDesc: "Exhaustive title verifications, builder dispute resolution, RERA appellate advocacy, and partition suits across Karnataka.",
    longDesc: "We advise developers, property owners, and prospective buyers on intricate land ownership rights, title scrutiny, RERA compliance, partition suits, and commercial lease contracts.",
    mattersCovered: [
      "Title verification & comprehensive 30-year search reports",
      "RERA complaints & representation before Karnataka RERA Authority",
      "Ancestral property partition suits & declaration of ownership",
      "Specific performance of contract & builder-buyer disputes",
      "Land acquisition challenges & revenue appeals"
    ],
    successCaseTitle: "RERA Appellate Tribunal Settlement",
    successCaseResult: "Recovered full principal investment with maximum statutory interest for homebuyer consortium against a defaulting builder.",
    keyAttorney: "Advocate Reynold D'Souza & Associates",
    badge: "Real Estate & RERA"
  },
  {
    id: "consumer",
    title: "Consumer Rights Protection",
    shortDesc: "Strategic litigation before District Consumer Forums, State Commissions, and NCDRC for unfair trade practices.",
    longDesc: "We champion the rights of consumers against corporate malpractices, banking deficiencies, insurance claim rejections, and medical negligence disputes.",
    mattersCovered: [
      "Claims before District Consumer Disputes Redressal Commissions",
      "State Consumer Commission & NCDRC litigation",
      "Insurance claim rejection dispute resolution",
      "Banking & financial service deficiency claims",
      "Product liability & deceptive trade practice prosecution"
    ],
    successCaseTitle: "Insurance Claim Recovery",
    successCaseResult: "Secured complete payout of arbitrarily repudiated insurance claim with substantial damages for consumer distress.",
    keyAttorney: "Advocate Reynold D'Souza",
    badge: "Consumer Advocacy"
  },
  {
    id: "labour",
    title: "Labour & Admin Tribunals",
    shortDesc: "Representation before Labour Courts, Industrial Tribunals, CAT, and KSAT for employment and administrative rights.",
    longDesc: "Our practice encompasses industrial disputes, unlawful termination, public sector service appointments, promotions, disciplinary inquiries, and pensions before CAT and KSAT.",
    mattersCovered: [
      "Central Administrative Tribunal (CAT) service petitions",
      "Karnataka State Administrative Tribunal (KSAT) matters",
      "Industrial Tribunal & Labour Court dispute adjudications",
      "Wrongful termination & employment contract disputes",
      "Workplace compliance & statutory dispute mediation"
    ],
    successCaseTitle: "Administrative Tribunal Reinstatement",
    successCaseResult: "Successfully secured reinstatement with full consequential seniority benefits for a public servant after arbitrary dismissal.",
    keyAttorney: "Associate Advocates Desk",
    badge: "Tribunal & Administrative"
  },
  {
    id: "arbitration",
    title: "Arbitration & Family Law",
    shortDesc: "Domestic arbitration proceedings and compassionate representation in matrimonial disputes and succession matters.",
    longDesc: "We provide strategic dispute resolution in commercial contracts, joint venture disagreements, partnership dissolution, and compassionate advocacy in family settlements and probate.",
    mattersCovered: [
      "Section 9, 11 & 34 Arbitration & Conciliation Act filings",
      "Commercial contract breach & partnership dissolution",
      "Matrimonial settlements, divorce & child custody mediation",
      "Probate of Wills, Letters of Administration & Succession",
      "Enforcement of domestic & international arbitral awards"
    ],
    successCaseTitle: "Commercial Arbitration Award",
    successCaseResult: "Achieved a multi-crore arbitral award in commercial contract breach proceedings with complete legal costs reimbursed.",
    keyAttorney: "Advocate Reynold D'Souza",
    badge: "Arbitration & ADR"
  }
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 1,
    quote: "Advocate Reynold D'Souza represents the peak of legal scholarship in the High Court of Karnataka. In our writ petition challenging an arbitrary municipal acquisition, his command of administrative law and masterfully drafted petition secured an interim stay, and ultimately a favorable final order.",
    author: "Srinivasa Reddy",
    title: "Managing Trustee",
    organization: "Reddy Educational Trust",
    practiceArea: "Writ Petitions & Constitutional Law",
    rating: 5,
    verifiedDate: "October 2025"
  },
  {
    id: 2,
    quote: "We were embroiled in a highly complex RERA dispute and partition suit spanning multiple generations. Advocate Reynold D'Souza meticulously traced the property's title deeds from the 1970s and presented an airtight argument before the Appellate Tribunal. His deep understanding of Karnataka Land Revenue and RERA laws saved our family property.",
    author: "Latha Ramakrishnan",
    title: "Retired Bank Officer",
    organization: "Indiranagar Residents Association",
    practiceArea: "RERA & Real Estate Law",
    rating: 5,
    verifiedDate: "February 2026"
  },
  {
    id: 3,
    quote: "When a multi-crore infrastructure agreement stalled due to contract breaches and jurisdiction conflicts, Advocate Reynold structured our entire domestic arbitration strategy. His cross-examination during the arbitration sessions was exceptionally precise, securing a comprehensive award in our favor.",
    author: "Dr. K. Raghavan",
    title: "Managing Director",
    organization: "Deccan Infra Developers Pvt. Ltd.",
    practiceArea: "Commercial Disputes & Arbitration",
    rating: 5,
    verifiedDate: "December 2025"
  },
  {
    id: 4,
    quote: "Facing a completely frivolous criminal complaint designed to harass our executives, we approached Olive Law Firm®. Advocate Reynold D'Souza represented us before the High Court of Karnataka under Section 482 of CrPC. The Hon'ble Court was fully convinced by his brilliant legal arguments and quashed the entire proceedings.",
    author: "Sanjay Deshpande",
    title: "Director of Operations",
    organization: "Kalyani Tech Ventures",
    practiceArea: "Criminal Defense & High Court Appeals",
    rating: 5,
    verifiedDate: "May 2026"
  }
];

export const DEFAULT_FAQS: FAQItemData[] = [
  {
    id: "consultation-expectations",
    category: "First Consultation",
    question: "What should I expect when meeting an advocate for the first time?",
    answer: "You will receive an honest, attentive listening ear and a straightforward assessment of where you stand. We believe in being completely transparent from day one—no false promises, no confusing legal jargon, and no hidden charges. We will walk you through your real chances of success, discuss fees clearly upfront, and give you a calm, sensible step-by-step plan for what to do next.",
    highlights: ["Honest case appraisal with zero false hopes", "Transparent fee breakdown before any commitment", "Actionable roadmap tailored to your situation"]
  },
  {
    id: "documents-to-carry",
    category: "Preparation",
    question: "What documents should I prepare and bring to my consultation?",
    answer: "Bring whatever papers you currently have on hand. For property matters, bring sale deeds, parent deeds, or khata copies; for criminal matters, bring the FIR copy, notices, or remand papers; for employment or tribunal disputes, bring your appointment letter or show-cause notice. Even if your records are incomplete or disorganized, do not worry—our advocates will personally sit with you and help sort through everything.",
    highlights: ["Bring whatever documents you have—even if incomplete", "FIR, deeds, notices, contracts, or court summons", "We will help piece the facts together with you"]
  },
  {
    id: "confidentiality-guarantee",
    category: "Client Privacy",
    question: "How does Olive Law Firm protect my personal privacy and case information?",
    answer: "Your privacy is our utmost responsibility. Under Section 126 of the Indian Evidence Act, 1872, every word spoken, every document shared, and every strategy discussed is protected under strict attorney-client privilege. We store all files on an encrypted internal server, and we never share your identity, personal details, or legal papers with any third party.",
    highlights: ["Protected under statutory attorney-client privilege", "Strict internal confidentiality protocols", "Zero third-party disclosure under any circumstances"]
  },
  {
    id: "urgent-matter-timelines",
    category: "Urgent Relief",
    question: "How fast can you step in for urgent matters like anticipatory bail or stay orders?",
    answer: "When someone's personal liberty or property is at imminent risk, our legal team moves immediately. We fast-track emergency anticipatory bail petitions and urgent High Court stay petitions, preparing and filing them within hours. For general civil suits, property clearances, and tribunal petitions, we typically take 3 to 5 business days to build a thorough, watertight draft.",
    highlights: ["Emergency bail & stay petitions drafted within hours", "Immediate court intervention for imminent threats", "3 to 5 business days for standard civil and tribunal filings"]
  },
  {
    id: "satellite-offices",
    category: "Locations & Meetings",
    question: "Can I schedule a consultation at your Dharwad or Belagavi satellite locations?",
    answer: "Yes, absolutely. While Advocate Reynold D'Souza's primary office is in Bengaluru, our associate advocates actively manage satellite offices in Dharwad and Belagavi for in-person meetings. If traveling is difficult, we also offer confidential phone calls or secure video consultations from the comfort of your home.",
    highlights: ["In-person consultations in Bengaluru, Dharwad & Belagavi", "Secure video-conferencing available across India & abroad", "Flexible scheduling to accommodate your convenience"]
  }
];

const LOCAL_CONTENT_KEY = "olive_firm_content_v1";
const EVENT_CONTENT_UPDATE = "olive_content_updated";

function getLocalContent(): FirmContentState {
  try {
    const raw = localStorage.getItem(LOCAL_CONTENT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          hero: { ...DEFAULT_HERO_CONTENT, ...(parsed.hero || {}) },
          stats: Array.isArray(parsed.stats) && parsed.stats.length > 0 ? parsed.stats : DEFAULT_FIRM_STATS,
          practiceAreas: Array.isArray(parsed.practiceAreas) && parsed.practiceAreas.length > 0 ? parsed.practiceAreas : DEFAULT_PRACTICE_AREAS,
          testimonials: Array.isArray(parsed.testimonials) && parsed.testimonials.length > 0 ? parsed.testimonials : DEFAULT_TESTIMONIALS,
          faqs: Array.isArray(parsed.faqs) && parsed.faqs.length > 0 ? parsed.faqs : DEFAULT_FAQS
        };
      }
    }
  } catch (e) {
    console.warn("Could not read local content state:", e);
  }
  return {
    hero: DEFAULT_HERO_CONTENT,
    stats: DEFAULT_FIRM_STATS,
    practiceAreas: DEFAULT_PRACTICE_AREAS,
    testimonials: DEFAULT_TESTIMONIALS,
    faqs: DEFAULT_FAQS
  };
}

function saveLocalContent(content: FirmContentState) {
  try {
    localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(content));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(EVENT_CONTENT_UPDATE));
      broadcastFirmSync("content");
    }
  } catch (e) {
    console.error("Local storage error saving firm content:", e);
  }
}

export function useFirmContent() {
  const [content, setContent] = useState<FirmContentState>(() => getLocalContent());
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"connected" | "syncing" | "offline">("connected");

  useEffect(() => {
    // 1. Listen for local storage updates & custom events across tabs
    const handleLocalUpdate = () => {
      setContent(getLocalContent());
    };
    window.addEventListener(EVENT_CONTENT_UPDATE, handleLocalUpdate);
    window.addEventListener("storage", handleLocalUpdate);
    window.addEventListener("focus", handleLocalUpdate);

    const unsubBroadcast = subscribeToFirmBroadcast((msg) => {
      if (msg.type === "content") {
        handleLocalUpdate();
      }
    });

    // 2. Initial Eager Cloud Fetch
    Promise.all([
      getDoc(doc(db, "firm_settings", "content_hero")),
      getDoc(doc(db, "firm_settings", "content_practice")),
      getDoc(doc(db, "firm_settings", "content_testimonials")),
      getDoc(doc(db, "firm_settings", "content_faqs")),
      getDoc(doc(db, "firm_settings", "content_stats"))
    ]).then(([heroSnap, practiceSnap, testSnap, faqsSnap, statsSnap]) => {
      setContent(prev => {
        let changed = false;
        let updated = { ...prev };

        if (heroSnap.exists()) {
          updated.hero = { ...DEFAULT_HERO_CONTENT, ...(heroSnap.data() as HeroContent) };
          changed = true;
        }
        if (practiceSnap.exists()) {
          const d = practiceSnap.data();
          if (Array.isArray(d?.items) && d.items.length > 0) {
            updated.practiceAreas = d.items;
            changed = true;
          }
        }
        if (testSnap.exists()) {
          const d = testSnap.data();
          if (Array.isArray(d?.items) && d.items.length > 0) {
            updated.testimonials = d.items;
            changed = true;
          }
        }
        if (faqsSnap.exists()) {
          const d = faqsSnap.data();
          if (Array.isArray(d?.items) && d.items.length > 0) {
            updated.faqs = d.items;
            changed = true;
          }
        }
        if (statsSnap.exists()) {
          const d = statsSnap.data();
          if (Array.isArray(d?.items) && d.items.length > 0) {
            updated.stats = d.items;
            changed = true;
          }
        }

        if (changed) {
          saveLocalContent(updated);
          return updated;
        }
        return prev;
      });
    }).catch(err => {
      console.warn("Initial content eager fetch note:", err);
    });

    // 3. Real-time Firestore Cloud listener for Hero & Stats
    const heroDocRef = doc(db, "firm_settings", "content_hero");
    const unsubscribeHero = onSnapshot(heroDocRef, (snap) => {
      if (snap.exists()) {
        const liveHero = snap.data() as HeroContent;
        setContent(prev => {
          const updated = { ...prev, hero: { ...DEFAULT_HERO_CONTENT, ...liveHero } };
          saveLocalContent(updated);
          return updated;
        });
      }
      setSyncStatus("connected");
    }, (err) => {
      console.warn("Hero content firestore listener note:", err);
      setSyncStatus("offline");
    });

    // 4. Real-time Firestore Cloud listener for Practice Areas
    const practiceDocRef = doc(db, "firm_settings", "content_practice");
    const unsubscribePractice = onSnapshot(practiceDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.items) && data.items.length > 0) {
          setContent(prev => {
            const updated = { ...prev, practiceAreas: data.items };
            saveLocalContent(updated);
            return updated;
          });
        }
      }
    }, (err) => {
      console.warn("Practice areas firestore listener note:", err);
    });

    // 5. Real-time Firestore Cloud listener for Testimonials
    const testimonialsDocRef = doc(db, "firm_settings", "content_testimonials");
    const unsubscribeTestimonials = onSnapshot(testimonialsDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.items) && data.items.length > 0) {
          setContent(prev => {
            const updated = { ...prev, testimonials: data.items };
            saveLocalContent(updated);
            return updated;
          });
        }
      }
    }, (err) => {
      console.warn("Testimonials firestore listener note:", err);
    });

    // 6. Real-time Firestore Cloud listener for FAQs
    const faqsDocRef = doc(db, "firm_settings", "content_faqs");
    const unsubscribeFaqs = onSnapshot(faqsDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.items) && data.items.length > 0) {
          setContent(prev => {
            const updated = { ...prev, faqs: data.items };
            saveLocalContent(updated);
            return updated;
          });
        }
      }
    }, (err) => {
      console.warn("FAQs firestore listener note:", err);
    });

    // 7. Real-time Firestore Cloud listener for Stats
    const statsDocRef = doc(db, "firm_settings", "content_stats");
    const unsubscribeStats = onSnapshot(statsDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.items) && data.items.length > 0) {
          setContent(prev => {
            const updated = { ...prev, stats: data.items };
            saveLocalContent(updated);
            return updated;
          });
        }
      }
    }, (err) => {
      console.warn("Stats firestore listener note:", err);
    });

    return () => {
      window.removeEventListener(EVENT_CONTENT_UPDATE, handleLocalUpdate);
      window.removeEventListener("storage", handleLocalUpdate);
      window.removeEventListener("focus", handleLocalUpdate);
      unsubBroadcast();
      unsubscribeHero();
      unsubscribePractice();
      unsubscribeTestimonials();
      unsubscribeFaqs();
      unsubscribeStats();
    };
  }, []);

  // Update Hero Content
  const updateHero = useCallback(async (hero: HeroContent): Promise<boolean> => {
    setIsSaving(true);
    setSyncStatus("syncing");
    setContent(prev => {
      const updated = { ...prev, hero };
      saveLocalContent(updated);
      return updated;
    });

    try {
      await setDoc(doc(db, "firm_settings", "content_hero"), {
        ...hero,
        updatedAt: Timestamp.now()
      });
      setSyncStatus("connected");
      return true;
    } catch (err) {
      console.warn("Cloud save hero warning:", err);
      setSyncStatus("offline");
      return true;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Update Practice Areas
  const updatePracticeAreas = useCallback(async (practiceAreas: PracticeAreaItem[]): Promise<boolean> => {
    setIsSaving(true);
    setSyncStatus("syncing");
    setContent(prev => {
      const updated = { ...prev, practiceAreas };
      saveLocalContent(updated);
      return updated;
    });

    try {
      await setDoc(doc(db, "firm_settings", "content_practice"), {
        items: practiceAreas,
        updatedAt: Timestamp.now()
      });
      setSyncStatus("connected");
      return true;
    } catch (err) {
      console.warn("Cloud save practice areas warning:", err);
      setSyncStatus("offline");
      return true;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Update Testimonials
  const updateTestimonials = useCallback(async (testimonials: TestimonialItem[]): Promise<boolean> => {
    setIsSaving(true);
    setSyncStatus("syncing");
    setContent(prev => {
      const updated = { ...prev, testimonials };
      saveLocalContent(updated);
      return updated;
    });

    try {
      await setDoc(doc(db, "firm_settings", "content_testimonials"), {
        items: testimonials,
        updatedAt: Timestamp.now()
      });
      setSyncStatus("connected");
      return true;
    } catch (err) {
      console.warn("Cloud save testimonials warning:", err);
      setSyncStatus("offline");
      return true;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Update FAQs
  const updateFaqs = useCallback(async (faqs: FAQItemData[]): Promise<boolean> => {
    setIsSaving(true);
    setSyncStatus("syncing");
    setContent(prev => {
      const updated = { ...prev, faqs };
      saveLocalContent(updated);
      return updated;
    });

    try {
      await setDoc(doc(db, "firm_settings", "content_faqs"), {
        items: faqs,
        updatedAt: Timestamp.now()
      });
      setSyncStatus("connected");
      return true;
    } catch (err) {
      console.warn("Cloud save FAQs warning:", err);
      setSyncStatus("offline");
      return true;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Update Stats
  const updateStats = useCallback(async (stats: FirmStatItem[]): Promise<boolean> => {
    setIsSaving(true);
    setSyncStatus("syncing");
    setContent(prev => {
      const updated = { ...prev, stats };
      saveLocalContent(updated);
      return updated;
    });

    try {
      await setDoc(doc(db, "firm_settings", "content_stats"), {
        items: stats,
        updatedAt: Timestamp.now()
      });
      setSyncStatus("connected");
      return true;
    } catch (err) {
      console.warn("Cloud save stats warning:", err);
      setSyncStatus("offline");
      return true;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Reset entire website content to default
  const resetAllContentToDefaults = useCallback(async (): Promise<void> => {
    setIsSaving(true);
    const defaults: FirmContentState = {
      hero: DEFAULT_HERO_CONTENT,
      stats: DEFAULT_FIRM_STATS,
      practiceAreas: DEFAULT_PRACTICE_AREAS,
      testimonials: DEFAULT_TESTIMONIALS,
      faqs: DEFAULT_FAQS
    };
    setContent(defaults);
    saveLocalContent(defaults);

    try {
      await Promise.all([
        setDoc(doc(db, "firm_settings", "content_hero"), { ...DEFAULT_HERO_CONTENT, updatedAt: Timestamp.now() }),
        setDoc(doc(db, "firm_settings", "content_stats"), { items: DEFAULT_FIRM_STATS, updatedAt: Timestamp.now() }),
        setDoc(doc(db, "firm_settings", "content_practice"), { items: DEFAULT_PRACTICE_AREAS, updatedAt: Timestamp.now() }),
        setDoc(doc(db, "firm_settings", "content_testimonials"), { items: DEFAULT_TESTIMONIALS, updatedAt: Timestamp.now() }),
        setDoc(doc(db, "firm_settings", "content_faqs"), { items: DEFAULT_FAQS, updatedAt: Timestamp.now() })
      ]);
    } catch (err) {
      console.warn("Reset to default cloud sync note:", err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    content,
    isSaving,
    syncStatus,
    updateHero,
    updatePracticeAreas,
    updateTestimonials,
    updateFaqs,
    updateStats,
    resetAllContentToDefaults
  };
}
