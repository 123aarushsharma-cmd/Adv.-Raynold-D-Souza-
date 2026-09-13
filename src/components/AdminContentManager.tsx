import React, { useState } from "react";
import { 
  useFirmContent, 
  HeroContent, 
  FirmStatItem, 
  PracticeAreaItem, 
  TestimonialItem, 
  FAQItemData,
  DEFAULT_HERO_CONTENT,
  DEFAULT_FIRM_STATS,
  DEFAULT_PRACTICE_AREAS,
  DEFAULT_TESTIMONIALS,
  DEFAULT_FAQS
} from "../hooks/useFirmContent";
import { 
  Sparkles, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  Eye, 
  Scale, 
  MessageSquareQuote, 
  HelpCircle, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  ChevronDown
} from "lucide-react";

export default function AdminContentManager() {
  const { 
    content, 
    isSaving, 
    syncStatus, 
    updateHero, 
    updatePracticeAreas, 
    updateTestimonials, 
    updateFaqs, 
    updateStats, 
    resetAllContentToDefaults 
  } = useFirmContent();

  const [activeSubTab, setActiveSubTab] = useState<"hero" | "stats" | "practice" | "testimonials" | "faqs">("hero");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Local editable draft states
  const [heroDraft, setHeroDraft] = useState<HeroContent>(content.hero);
  const [statsDraft, setStatsDraft] = useState<FirmStatItem[]>(content.stats);
  const [practiceDraft, setPracticeDraft] = useState<PracticeAreaItem[]>(content.practiceAreas);
  const [testimonialsDraft, setTestimonialsDraft] = useState<TestimonialItem[]>(content.testimonials);
  const [faqsDraft, setFaqsDraft] = useState<FAQItemData[]>(content.faqs);

  // Active editing item states
  const [editingPracticeId, setEditingPracticeId] = useState<string | null>(null);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editingTestimonialId, setEditingTestimonialId] = useState<number | null>(null);

  // Keep drafts updated when cloud syncs (unless currently typing)
  React.useEffect(() => {
    setHeroDraft(content.hero);
  }, [content.hero]);

  React.useEffect(() => {
    setStatsDraft(content.stats);
  }, [content.stats]);

  React.useEffect(() => {
    setPracticeDraft(content.practiceAreas);
  }, [content.practiceAreas]);

  React.useEffect(() => {
    setTestimonialsDraft(content.testimonials);
  }, [content.testimonials]);

  React.useEffect(() => {
    setFaqsDraft(content.faqs);
  }, [content.faqs]);

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  // 1. Save Hero
  const handleSaveHero = async () => {
    const success = await updateHero(heroDraft);
    if (success) {
      showNotification("Hero & Presentation headline strictly updated on the live website!");
    }
  };

  // 2. Save Stats
  const handleSaveStats = async () => {
    const success = await updateStats(statsDraft);
    if (success) {
      showNotification("Firm Statistics & Impact Metrics strictly updated on the live website!");
    }
  };

  // 3. Save Practice Areas
  const handleSavePractice = async () => {
    const success = await updatePracticeAreas(practiceDraft);
    if (success) {
      showNotification("Legal Practice Areas strictly updated on the live website!");
    }
  };

  // 4. Save Testimonials
  const handleSaveTestimonials = async () => {
    const success = await updateTestimonials(testimonialsDraft);
    if (success) {
      showNotification("Client Endorsements & Testimonials strictly updated on the live website!");
    }
  };

  // 5. Save FAQs
  const handleSaveFaqs = async () => {
    const success = await updateFaqs(faqsDraft);
    if (success) {
      showNotification("FAQ Dossier strictly updated on the live website!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-forest text-ivory p-6 rounded-sm border border-gold/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold">
              Strict Site-Wide Content Studio
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-ivory">
            Live Website Content &amp; Copy Management
          </h2>
          <p className="text-xs text-ivory/80 font-light mt-1 max-w-2xl">
            Any modification made here is <strong className="text-gold font-medium">strictly and instantly synchronized</strong> across the public website in real time.
          </p>
        </div>

        {/* Sync Indicator & Reset */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-ivory/10 border border-gold/20 px-3 py-1.5 rounded-sm flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${syncStatus === "connected" ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span className="text-ivory/90 text-[11px] font-mono">
              {syncStatus === "connected" ? "Cloud Real-Time Sync Active" : "Local Sync Active"}
            </span>
          </div>

          <button
            type="button"
            onClick={async () => {
              if (window.confirm("Are you sure you want to restore all website content (Hero, Practice Areas, Testimonials, FAQs, Stats) to official firm defaults?")) {
                await resetAllContentToDefaults();
                showNotification("All website content successfully reset to official defaults.");
              }
            }}
            disabled={isSaving}
            className="text-xs text-gold hover:text-white border border-gold/30 hover:border-gold px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset all content to defaults"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMsg && (
        <div className="bg-emerald-950/90 text-emerald-100 border border-emerald-500/50 p-3.5 rounded-sm flex items-center gap-3 text-xs shadow-md animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="font-sans font-medium flex-1">{saveSuccessMsg}</span>
          <span className="text-[10px] uppercase font-mono tracking-wider bg-emerald-800/60 px-2 py-0.5 rounded text-emerald-200">
            Strict Real-Time Applied
          </span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-forest/15 gap-2 overflow-x-auto pb-1">
        {[
          { id: "hero", label: "Hero & Presentation", icon: Sparkles },
          { id: "stats", label: "Firm Statistics", icon: TrendingUp },
          { id: "practice", label: "Practice Areas", icon: Scale },
          { id: "testimonials", label: "Client Testimonials", icon: MessageSquareQuote },
          { id: "faqs", label: "FAQ Dossier", icon: HelpCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-serif font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? "border-gold text-forest bg-sage/30 shadow-xs" 
                  : "border-transparent text-charcoal/60 hover:text-forest hover:bg-forest/5"
              }`}
            >
              <Icon size={14} className={isActive ? "text-gold" : "text-charcoal/40"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. HERO & PRESENTATION TAB */}
      {activeSubTab === "hero" && (
        <div className="bg-white border border-forest/10 p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
          <div className="border-b border-forest/10 pb-4">
            <h3 className="font-serif text-lg font-bold text-forest">
              Hero Section Headline &amp; Narrative
            </h3>
            <p className="text-xs text-charcoal/70 mt-0.5">
              Control the prominent greeting headline and firm narrative displayed at the top of the homepage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-forest">
                Headline Opening Line
              </label>
              <input
                type="text"
                value={heroDraft.headlinePrefix}
                onChange={(e) => setHeroDraft({ ...heroDraft, headlinePrefix: e.target.value })}
                className="w-full text-sm font-serif p-2.5 border border-forest/20 rounded-sm focus:border-gold focus:outline-none"
                placeholder="Justice, Rooted in"
              />
              <span className="text-[11px] text-charcoal/60 block">The primary bold text line of the hero title.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-forest">
                Headline Highlight (Gold Italics)
              </label>
              <input
                type="text"
                value={heroDraft.headlineHighlight}
                onChange={(e) => setHeroDraft({ ...heroDraft, headlineHighlight: e.target.value })}
                className="w-full text-sm font-serif italic text-forest p-2.5 border border-forest/20 rounded-sm focus:border-gold focus:outline-none"
                placeholder="Uncompromising Integrity"
              />
              <span className="text-[11px] text-charcoal/60 block">Renders in golden italic calligraphy typography.</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-forest">
              Narrative Subheadline &amp; Bio
            </label>
            <textarea
              rows={3}
              value={heroDraft.subheadline}
              onChange={(e) => setHeroDraft({ ...heroDraft, subheadline: e.target.value })}
              className="w-full text-sm p-3 border border-forest/20 rounded-sm focus:border-gold focus:outline-none leading-relaxed"
              placeholder="Advocate Reynold D'Souza stands as a dedicated guardian of rights..."
            />
            <span className="text-[11px] text-charcoal/60 block">The explanatory mission statement displayed under the main title.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-forest">
                Top Badge Text
              </label>
              <input
                type="text"
                value={heroDraft.badgeText}
                onChange={(e) => setHeroDraft({ ...heroDraft, badgeText: e.target.value })}
                className="w-full text-xs p-2.5 border border-forest/20 rounded-sm focus:border-gold focus:outline-none"
                placeholder="High Court of Karnataka & Supreme Court of India"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-forest">
                Primary Button Label
              </label>
              <input
                type="text"
                value={heroDraft.primaryCtaText}
                onChange={(e) => setHeroDraft({ ...heroDraft, primaryCtaText: e.target.value })}
                className="w-full text-xs p-2.5 border border-forest/20 rounded-sm focus:border-gold focus:outline-none"
                placeholder="Initiate Case Consultation"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-forest">
                Secondary Button Label
              </label>
              <input
                type="text"
                value={heroDraft.secondaryCtaText}
                onChange={(e) => setHeroDraft({ ...heroDraft, secondaryCtaText: e.target.value })}
                className="w-full text-xs p-2.5 border border-forest/20 rounded-sm focus:border-gold focus:outline-none"
                placeholder="Review Practice Areas"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-forest text-ivory p-6 rounded-sm border border-gold/20 space-y-3">
            <span className="text-[10px] uppercase font-mono tracking-widest text-gold block">
              Live Hero Preview Rendering
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-ivory font-bold leading-snug">
              {heroDraft.headlinePrefix} <br />
              <span className="text-gold italic font-normal">{heroDraft.headlineHighlight}</span>
            </h1>
            <p className="text-xs sm:text-sm text-ivory/80 max-w-xl font-light leading-relaxed">
              {heroDraft.subheadline}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveHero}
              disabled={isSaving}
              className="bg-forest text-gold hover:bg-forest-light border border-gold/30 hover:border-gold px-6 py-2.5 rounded-sm text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Save size={14} />
              <span>{isSaving ? "Synchronizing..." : "Strictly Save Hero & Publish"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. FIRM STATISTICS TAB */}
      {activeSubTab === "stats" && (
        <div className="bg-white border border-forest/10 p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
          <div className="border-b border-forest/10 pb-4">
            <h3 className="font-serif text-lg font-bold text-forest">
              Firm Statistics &amp; Milestones
            </h3>
            <p className="text-xs text-charcoal/70 mt-0.5">
              Control the quantitative impact metrics shown across the "Why Choose Us" and firm credentials sections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {statsDraft.map((stat, idx) => (
              <div key={stat.id || idx} className="p-4 bg-sage/20 border border-forest/15 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gold bg-forest px-2 py-0.5 rounded">
                    Metric #{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-forest font-serif">{stat.value}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-forest uppercase">Value Number</label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => {
                        const updated = [...statsDraft];
                        updated[idx] = { ...stat, value: e.target.value };
                        setStatsDraft(updated);
                      }}
                      className="w-full text-xs font-bold p-2 border border-forest/20 rounded-sm bg-white"
                      placeholder="e.g. 24+"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-forest uppercase">Metric Label</label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => {
                        const updated = [...statsDraft];
                        updated[idx] = { ...stat, label: e.target.value };
                        setStatsDraft(updated);
                      }}
                      className="w-full text-xs p-2 border border-forest/20 rounded-sm bg-white"
                      placeholder="e.g. Years of Practice"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-forest uppercase">Subtext Explanation</label>
                  <input
                    type="text"
                    value={stat.subtext}
                    onChange={(e) => {
                      const updated = [...statsDraft];
                      updated[idx] = { ...stat, subtext: e.target.value };
                      setStatsDraft(updated);
                    }}
                    className="w-full text-xs p-2 border border-forest/20 rounded-sm bg-white"
                    placeholder="e.g. Decades of trial and appellate advocacy"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveStats}
              disabled={isSaving}
              className="bg-forest text-gold hover:bg-forest-light border border-gold/30 hover:border-gold px-6 py-2.5 rounded-sm text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Save size={14} />
              <span>{isSaving ? "Synchronizing..." : "Strictly Save Statistics & Publish"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. PRACTICE AREAS TAB */}
      {activeSubTab === "practice" && (
        <div className="bg-white border border-forest/10 p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
          <div className="border-b border-forest/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-forest">
                Legal Practice Areas &amp; Specializations
              </h3>
              <p className="text-xs text-charcoal/70 mt-0.5">
                Manage all practice areas, statutory matters covered, lead counsel assignments, and success cases.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const newId = `practice-${Date.now()}`;
                const newItem: PracticeAreaItem = {
                  id: newId,
                  title: "New Legal Practice Area",
                  shortDesc: "Comprehensive advisory and high-stakes litigation before competent authorities and courts.",
                  longDesc: "Detailed legal description outlining statutory frameworks, appellate procedures, and courtroom strategies.",
                  mattersCovered: [
                    "Statutory legal drafting and representation",
                    "High Court appellate petitions",
                    "Dispute mediation and trial advocacy"
                  ],
                  successCaseTitle: "High Court Milestone Order",
                  successCaseResult: "Secured landmark relief protecting client interests with full costs awarded.",
                  keyAttorney: "Advocate Reynold D'Souza",
                  badge: "Litigation Practice"
                };
                setPracticeDraft([...practiceDraft, newItem]);
                setEditingPracticeId(newId);
              }}
              className="bg-forest text-gold hover:bg-forest-light px-3 py-1.5 rounded-sm text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New Practice Area</span>
            </button>
          </div>

          <div className="space-y-4">
            {practiceDraft.map((practice, idx) => {
              const isEditing = editingPracticeId === practice.id;
              return (
                <div 
                  key={practice.id || idx}
                  className="border border-forest/15 rounded-sm overflow-hidden bg-ivory/20 transition-all"
                >
                  {/* Card Bar */}
                  <div className="p-4 bg-sage/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-forest text-gold text-xs font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-forest">
                          {practice.title}
                        </h4>
                        <span className="text-[11px] text-charcoal/60">
                          Lead: {practice.keyAttorney} • {practice.mattersCovered?.length || 0} matters listed
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingPracticeId(isEditing ? null : practice.id)}
                        className="px-2.5 py-1 text-xs border border-forest/20 hover:border-gold hover:text-forest bg-white rounded flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Edit3 size={12} />
                        <span>{isEditing ? "Close Editor" : "Edit Details"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${practice.title}"?`)) {
                            setPracticeDraft(practiceDraft.filter(p => p.id !== practice.id));
                            if (editingPracticeId === practice.id) setEditingPracticeId(null);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer"
                        title="Delete practice area"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Editor */}
                  {isEditing && (
                    <div className="p-5 bg-white border-t border-forest/10 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-forest uppercase">Practice Area Title</label>
                          <input
                            type="text"
                            value={practice.title}
                            onChange={(e) => {
                              const updated = [...practiceDraft];
                              updated[idx] = { ...practice, title: e.target.value };
                              setPracticeDraft(updated);
                            }}
                            className="w-full text-xs font-serif font-bold p-2 border border-forest/20 rounded-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-forest uppercase">Key Lead Attorney</label>
                          <input
                            type="text"
                            value={practice.keyAttorney}
                            onChange={(e) => {
                              const updated = [...practiceDraft];
                              updated[idx] = { ...practice, keyAttorney: e.target.value };
                              setPracticeDraft(updated);
                            }}
                            className="w-full text-xs p-2 border border-forest/20 rounded-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-forest uppercase">Short Summary (Shown on Grid Card)</label>
                        <input
                          type="text"
                          value={practice.shortDesc}
                          onChange={(e) => {
                            const updated = [...practiceDraft];
                            updated[idx] = { ...practice, shortDesc: e.target.value };
                            setPracticeDraft(updated);
                          }}
                          className="w-full text-xs p-2 border border-forest/20 rounded-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-forest uppercase">In-Depth Description (Shown in Detail Drawer)</label>
                        <textarea
                          rows={3}
                          value={practice.longDesc}
                          onChange={(e) => {
                            const updated = [...practiceDraft];
                            updated[idx] = { ...practice, longDesc: e.target.value };
                            setPracticeDraft(updated);
                          }}
                          className="w-full text-xs p-2 border border-forest/20 rounded-sm leading-relaxed"
                        />
                      </div>

                      {/* Matters Covered Bullet Points */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-forest uppercase">
                          Matters Covered (One per line)
                        </label>
                        <textarea
                          rows={4}
                          value={practice.mattersCovered?.join("\n") || ""}
                          onChange={(e) => {
                            const lines = e.target.value.split("\n").map(l => l.trim()).filter(Boolean);
                            const updated = [...practiceDraft];
                            updated[idx] = { ...practice, mattersCovered: lines };
                            setPracticeDraft(updated);
                          }}
                          className="w-full text-xs p-2 border border-forest/20 rounded-sm font-mono text-[11px]"
                          placeholder="Line 1&#10;Line 2&#10;Line 3"
                        />
                      </div>

                      {/* Success Case Milestone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sage/10 p-3 rounded-sm border border-forest/10">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-forest uppercase">Success Case Title</label>
                          <input
                            type="text"
                            value={practice.successCaseTitle}
                            onChange={(e) => {
                              const updated = [...practiceDraft];
                              updated[idx] = { ...practice, successCaseTitle: e.target.value };
                              setPracticeDraft(updated);
                            }}
                            className="w-full text-xs p-2 border border-forest/20 rounded-sm bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-forest uppercase">Success Case Result Description</label>
                          <input
                            type="text"
                            value={practice.successCaseResult}
                            onChange={(e) => {
                              const updated = [...practiceDraft];
                              updated[idx] = { ...practice, successCaseResult: e.target.value };
                              setPracticeDraft(updated);
                            }}
                            className="w-full text-xs p-2 border border-forest/20 rounded-sm bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSavePractice}
              disabled={isSaving}
              className="bg-forest text-gold hover:bg-forest-light border border-gold/30 hover:border-gold px-6 py-2.5 rounded-sm text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Save size={14} />
              <span>{isSaving ? "Synchronizing..." : "Strictly Save Practice Areas & Publish"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. CLIENT TESTIMONIALS TAB */}
      {activeSubTab === "testimonials" && (
        <div className="bg-white border border-forest/10 p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
          <div className="border-b border-forest/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-forest">
                Client Testimonials &amp; Peer Endorsements
              </h3>
              <p className="text-xs text-charcoal/70 mt-0.5">
                Manage verified client reviews, institutional references, and case feedback.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const newId = Date.now();
                const newItem: TestimonialItem = {
                  id: newId,
                  author: "Client Name",
                  title: "Managing Director / Private Individual",
                  organization: "Bengaluru Enterprise",
                  practiceArea: "High Court Litigation",
                  rating: 5,
                  verifiedDate: "Current Term",
                  quote: "Advocate Reynold D'Souza and the legal team at Olive Law Firm provided exemplary counsel, navigating our complex dispute with consummate professionalism and unyielding rigor."
                };
                setTestimonialsDraft([...testimonialsDraft, newItem]);
                setEditingTestimonialId(newId);
              }}
              className="bg-forest text-gold hover:bg-forest-light px-3 py-1.5 rounded-sm text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New Testimonial</span>
            </button>
          </div>

          <div className="space-y-4">
            {testimonialsDraft.map((t, idx) => {
              const isEditing = editingTestimonialId === t.id;
              return (
                <div key={t.id || idx} className="border border-forest/15 rounded-sm overflow-hidden bg-ivory/20">
                  <div className="p-4 bg-sage/20 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-sm font-bold text-forest">{t.author}</span>
                        <span className="text-[10px] text-gold bg-forest px-1.5 py-0.2 rounded font-mono">
                          ★ {t.rating}/5
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal/70 mt-0.5 truncate max-w-lg">
                        {t.title}, {t.organization} • {t.practiceArea}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingTestimonialId(isEditing ? null : t.id)}
                        className="px-2.5 py-1 text-xs border border-forest/20 hover:border-gold hover:text-forest bg-white rounded flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Edit3 size={12} />
                        <span>{isEditing ? "Close" : "Edit"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete review from "${t.author}"?`)) {
                            setTestimonialsDraft(testimonialsDraft.filter(item => item.id !== t.id));
                            if (editingTestimonialId === t.id) setEditingTestimonialId(null);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="p-5 bg-white border-t border-forest/10 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-forest uppercase">Author Name</label>
                          <input
                            type="text"
                            value={t.author}
                            onChange={(e) => {
                              const updated = [...testimonialsDraft];
                              updated[idx] = { ...t, author: e.target.value };
                              setTestimonialsDraft(updated);
                            }}
                            className="w-full text-xs font-serif font-bold p-2 border border-forest/20 rounded-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-forest uppercase">Role / Title</label>
                          <input
                            type="text"
                            value={t.title}
                            onChange={(e) => {
                              const updated = [...testimonialsDraft];
                              updated[idx] = { ...t, title: e.target.value };
                              setTestimonialsDraft(updated);
                            }}
                            className="w-full text-xs p-2 border border-forest/20 rounded-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-forest uppercase">Organization / Trust</label>
                          <input
                            type="text"
                            value={t.organization}
                            onChange={(e) => {
                              const updated = [...testimonialsDraft];
                              updated[idx] = { ...t, organization: e.target.value };
                              setTestimonialsDraft(updated);
                            }}
                            className="w-full text-xs p-2 border border-forest/20 rounded-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[11px] font-semibold text-forest uppercase">Practice Area Tag</label>
                          <input
                            type="text"
                            value={t.practiceArea}
                            onChange={(e) => {
                              const updated = [...testimonialsDraft];
                              updated[idx] = { ...t, practiceArea: e.target.value };
                              setTestimonialsDraft(updated);
                            }}
                            className="w-full text-xs p-2 border border-forest/20 rounded-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-forest uppercase">Star Rating (1-5)</label>
                          <select
                            value={t.rating}
                            onChange={(e) => {
                              const updated = [...testimonialsDraft];
                              updated[idx] = { ...t, rating: Number(e.target.value) };
                              setTestimonialsDraft(updated);
                            }}
                            className="w-full text-xs p-2 border border-forest/20 rounded-sm"
                          >
                            <option value={5}>5 Stars ★★★★★</option>
                            <option value={4}>4 Stars ★★★★☆</option>
                            <option value={3}>3 Stars ★★★☆☆</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-forest uppercase">Testimonial Quote Content</label>
                        <textarea
                          rows={3}
                          value={t.quote}
                          onChange={(e) => {
                            const updated = [...testimonialsDraft];
                            updated[idx] = { ...t, quote: e.target.value };
                            setTestimonialsDraft(updated);
                          }}
                          className="w-full text-xs p-2.5 border border-forest/20 rounded-sm leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveTestimonials}
              disabled={isSaving}
              className="bg-forest text-gold hover:bg-forest-light border border-gold/30 hover:border-gold px-6 py-2.5 rounded-sm text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Save size={14} />
              <span>{isSaving ? "Synchronizing..." : "Strictly Save Testimonials & Publish"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. FAQ DOSSIER TAB */}
      {activeSubTab === "faqs" && (
        <div className="bg-white border border-forest/10 p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
          <div className="border-b border-forest/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-forest">
                FAQ &amp; Statutory Guidance Dossier
              </h3>
              <p className="text-xs text-charcoal/70 mt-0.5">
                Answer common prospective client questions regarding consultations, documents, and confidentiality.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const newId = `faq-${Date.now()}`;
                const newItem: FAQItemData = {
                  id: newId,
                  category: "General Inquiry",
                  question: "How are court filings and timelines communicated to the client?",
                  answer: "We provide weekly status briefs and immediate electronic updates upon registry stamp or order copy issuance.",
                  highlights: [
                    "Direct updates upon registry filing",
                    "Weekly status briefs from Advocate Reynold D'Souza",
                    "Transparent case diary access"
                  ]
                };
                setFaqsDraft([...faqsDraft, newItem]);
                setEditingFaqId(newId);
              }}
              className="bg-forest text-gold hover:bg-forest-light px-3 py-1.5 rounded-sm text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New FAQ</span>
            </button>
          </div>

          <div className="space-y-4">
            {faqsDraft.map((faq, idx) => {
              const isEditing = editingFaqId === faq.id;
              return (
                <div key={faq.id || idx} className="border border-forest/15 rounded-sm overflow-hidden bg-ivory/20">
                  <div className="p-4 bg-sage/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-forest text-gold text-xs font-mono font-bold flex items-center justify-center">
                        Q{idx + 1}
                      </span>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-forest">{faq.question}</h4>
                        <span className="text-[11px] text-charcoal/60">Category: {faq.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingFaqId(isEditing ? null : faq.id)}
                        className="px-2.5 py-1 text-xs border border-forest/20 hover:border-gold hover:text-forest bg-white rounded flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Edit3 size={12} />
                        <span>{isEditing ? "Close" : "Edit"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete question "${faq.question}"?`)) {
                            setFaqsDraft(faqsDraft.filter(item => item.id !== faq.id));
                            if (editingFaqId === faq.id) setEditingFaqId(null);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="p-5 bg-white border-t border-forest/10 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-forest uppercase">FAQ Question</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const updated = [...faqsDraft];
                              updated[idx] = { ...faq, question: e.target.value };
                              setFaqsDraft(updated);
                            }}
                            className="w-full text-xs font-serif font-bold p-2 border border-forest/20 rounded-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-forest uppercase">Category</label>
                          <input
                            type="text"
                            value={faq.category}
                            onChange={(e) => {
                              const updated = [...faqsDraft];
                              updated[idx] = { ...faq, category: e.target.value };
                              setFaqsDraft(updated);
                            }}
                            className="w-full text-xs p-2 border border-forest/20 rounded-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-forest uppercase">Detailed Answer</label>
                        <textarea
                          rows={3}
                          value={faq.answer}
                          onChange={(e) => {
                            const updated = [...faqsDraft];
                            updated[idx] = { ...faq, answer: e.target.value };
                            setFaqsDraft(updated);
                          }}
                          className="w-full text-xs p-2.5 border border-forest/20 rounded-sm leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-forest uppercase">
                          Key Takeaway Highlights (One per line)
                        </label>
                        <textarea
                          rows={3}
                          value={faq.highlights?.join("\n") || ""}
                          onChange={(e) => {
                            const lines = e.target.value.split("\n").map(l => l.trim()).filter(Boolean);
                            const updated = [...faqsDraft];
                            updated[idx] = { ...faq, highlights: lines };
                            setFaqsDraft(updated);
                          }}
                          className="w-full text-xs p-2 border border-forest/20 rounded-sm font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveFaqs}
              disabled={isSaving}
              className="bg-forest text-gold hover:bg-forest-light border border-gold/30 hover:border-gold px-6 py-2.5 rounded-sm text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Save size={14} />
              <span>{isSaving ? "Synchronizing..." : "Strictly Save FAQs & Publish"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
