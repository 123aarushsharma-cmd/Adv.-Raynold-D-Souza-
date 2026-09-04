import React, { useState, useRef } from "react";
import { 
  FounderProfile, 
  AdvocateProfile 
} from "../lib/firebase";
import { 
  LEGAL_PORTRAIT_PRESETS, 
  compressAndResizeImage, 
  validateImageUrl 
} from "../lib/imageUtils";
import { 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  Check, 
  Trash2, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink, 
  RotateCcw, 
  Sparkles, 
  Shield, 
  User, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Award,
  AlertCircle,
  Eye
} from "lucide-react";

interface AdminTeamManagerProps {
  founder: FounderProfile;
  advocates: AdvocateProfile[];
  onSaveFounder: (founder: FounderProfile) => Promise<void>;
  onSaveAdvocate: (advocate: AdvocateProfile) => Promise<void>;
  onAddNewAdvocate: (advocate: Omit<AdvocateProfile, "id">) => Promise<AdvocateProfile>;
  onDeleteAdvocate: (id: string) => Promise<void>;
  onReorderAdvocates: (advocates: AdvocateProfile[]) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  onClosePortal?: () => void;
  initialTarget?: "founder" | string;
}

export default function AdminTeamManager({
  founder,
  advocates,
  onSaveFounder,
  onSaveAdvocate,
  onAddNewAdvocate,
  onDeleteAdvocate,
  onReorderAdvocates,
  onResetDefaults,
  onClosePortal,
  initialTarget = "founder"
}: AdminTeamManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"founder" | "advocates">(
    initialTarget === "founder" ? "founder" : "advocates"
  );
  const [selectedAdvocateId, setSelectedAdvocateId] = useState<string>(
    initialTarget !== "founder" && initialTarget
      ? initialTarget
      : advocates[0]?.id || ""
  );

  // Founder local editing state
  const [founderForm, setFounderForm] = useState<FounderProfile>({ ...founder });
  const [founderUrlInput, setFounderUrlInput] = useState("");
  const [founderSaving, setFounderSaving] = useState(false);
  const [founderSuccess, setFounderSuccess] = useState(false);
  const [founderError, setFounderError] = useState<string | null>(null);

  // Selected Advocate local editing state
  const currentAdvocate = advocates.find((a) => a.id === selectedAdvocateId) || advocates[0];
  const [advocateForm, setAdvocateForm] = useState<AdvocateProfile | null>(
    currentAdvocate ? { ...currentAdvocate } : null
  );
  const [advocateUrlInput, setAdvocateUrlInput] = useState("");
  const [advocateSaving, setAdvocateSaving] = useState(false);
  const [advocateSuccess, setAdvocateSuccess] = useState(false);
  const [advocateError, setAdvocateError] = useState<string | null>(null);

  // Add new advocate modal/drawer state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAdvocateForm, setNewAdvocateForm] = useState<Omit<AdvocateProfile, "id">>({
    name: "Advocate ",
    role: "Associate Advocate",
    location: "Bengaluru (Head Office)",
    education: "LL.B., Law College",
    experience: "5+ Years Litigation Practice",
    specialization: "Civil & Commercial Litigation",
    admissionNo: "KAR/0000/2024",
    bio: "Dedicated legal advisor providing rigorous litigation defense and client advisory.",
    photoUrl: ""
  });
  const [newAdvocateSaving, setNewAdvocateSaving] = useState(false);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // File input refs
  const founderFileRef = useRef<HTMLInputElement>(null);
  const advocateFileRef = useRef<HTMLInputElement>(null);
  const newAdvocateFileRef = useRef<HTMLInputElement>(null);

  // Sync state when selected advocate changes
  const handleSelectAdvocate = (adv: AdvocateProfile) => {
    setSelectedAdvocateId(adv.id);
    setAdvocateForm({ ...adv });
    setAdvocateUrlInput(adv.photoUrl || "");
    setAdvocateSuccess(false);
    setAdvocateError(null);
  };

  // --------------------------------------------------------------------------
  // Image Upload Handlers
  // --------------------------------------------------------------------------
  const handleFounderFileUpload = async (file: File) => {
    try {
      setFounderError(null);
      const compressed = await compressAndResizeImage(file);
      setFounderForm((prev) => ({ ...prev, photoUrl: compressed }));
    } catch (err: any) {
      setFounderError(err.message || "Failed to process photo upload");
    }
  };

  const handleAdvocateFileUpload = async (file: File) => {
    try {
      setAdvocateError(null);
      const compressed = await compressAndResizeImage(file);
      if (advocateForm) {
        setAdvocateForm((prev) => prev ? { ...prev, photoUrl: compressed } : null);
      }
    } catch (err: any) {
      setAdvocateError(err.message || "Failed to process photo upload");
    }
  };

  const handleNewAdvocateFileUpload = async (file: File) => {
    try {
      const compressed = await compressAndResizeImage(file);
      setNewAdvocateForm((prev) => ({ ...prev, photoUrl: compressed }));
    } catch (err: any) {
      alert("Failed to process image: " + err.message);
    }
  };

  // URL apply
  const handleApplyFounderUrl = async () => {
    if (!founderUrlInput.trim()) return;
    const valid = await validateImageUrl(founderUrlInput.trim());
    if (!valid) {
      setFounderError("Could not load image from the provided URL. Please verify the link.");
      return;
    }
    setFounderForm((prev) => ({ ...prev, photoUrl: founderUrlInput.trim() }));
    setFounderError(null);
  };

  const handleApplyAdvocateUrl = async () => {
    if (!advocateUrlInput.trim() || !advocateForm) return;
    const valid = await validateImageUrl(advocateUrlInput.trim());
    if (!valid) {
      setAdvocateError("Could not load image from the provided URL. Please verify the link.");
      return;
    }
    setAdvocateForm((prev) => prev ? { ...prev, photoUrl: advocateUrlInput.trim() } : null);
    setAdvocateError(null);
  };

  // Save Founder
  const handleSaveFounder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFounderSaving(true);
    setFounderError(null);
    setFounderSuccess(false);
    try {
      await onSaveFounder(founderForm);
      setFounderSuccess(true);
      setTimeout(() => setFounderSuccess(false), 4000);
    } catch (err: any) {
      setFounderError(err.message || "Failed to save founder profile changes");
    } finally {
      setFounderSaving(false);
    }
  };

  // Save Advocate
  const handleSaveAdvocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advocateForm) return;
    setAdvocateSaving(true);
    setAdvocateError(null);
    setAdvocateSuccess(false);
    try {
      await onSaveAdvocate(advocateForm);
      setAdvocateSuccess(true);
      setTimeout(() => setAdvocateSuccess(false), 4000);
    } catch (err: any) {
      setAdvocateError(err.message || "Failed to save legal advisor changes");
    } finally {
      setAdvocateSaving(false);
    }
  };

  // Add New Advocate Submit
  const handleCreateAdvocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewAdvocateSaving(true);
    try {
      const created = await onAddNewAdvocate(newAdvocateForm);
      setIsAddingNew(false);
      handleSelectAdvocate(created);
      setActiveSubTab("advocates");
    } catch (err: any) {
      alert("Failed to add advisor: " + err.message);
    } finally {
      setNewAdvocateSaving(false);
    }
  };

  // Delete Advocate
  const handleDeleteAdvocate = async (id: string, name: string) => {
    if (advocates.length <= 1) {
      alert("At least one legal advisor profile must remain active on the firm website.");
      return;
    }
    if (!confirm(`Are you sure you want to remove ${name} from the firm website?`)) {
      return;
    }
    await onDeleteAdvocate(id);
    const remaining = advocates.filter((a) => a.id !== id);
    if (remaining.length > 0) {
      handleSelectAdvocate(remaining[0]);
    }
  };

  // Reordering
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= advocates.length) return;
    const reordered = [...advocates];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    await onReorderAdvocates(reordered);
  };

  // Scroll to section on website
  const handleViewLive = (sectionId: string) => {
    if (onClosePortal) {
      onClosePortal();
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Bar Header & Section Navigation */}
      <div className="bg-white p-5 rounded-sm border border-forest/10 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">
              Firm Presentation Studio
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest mt-0.5">
            Legal Team &amp; Photo Management
          </h2>
          <p className="text-xs text-charcoal/70 mt-1">
            Easily update portrait pictures, credentials, and biographies displayed directly on the public website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleViewLive(activeSubTab === "founder" ? "about" : "advocates")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest bg-sage-light hover:bg-forest hover:text-gold px-3 py-2 rounded-sm border border-forest/20 transition-all cursor-pointer shadow-sm"
            title="Inspect how this section looks on the public website"
          >
            <Eye size={14} />
            View Live on Website
            <ExternalLink size={12} className="opacity-70" />
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-red-700 bg-white hover:bg-red-50 px-3 py-2 rounded-sm border border-gray-200 transition-colors cursor-pointer"
            title="Reset to default legal team information"
          >
            <RotateCcw size={13} />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Reset Confirmation Banner */}
      {showResetConfirm && (
        <div className="bg-amber-50 border border-amber-300 rounded-sm p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-xs font-bold text-amber-900">
                Reset all photos and profiles to default firm values?
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                This will restore the original portrait photos and biographies for Advocate Reynold D'Souza and all 3 senior associates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setShowResetConfirm(false);
                await onResetDefaults();
                setFounderForm(founder);
                if (advocates[0]) handleSelectAdvocate(advocates[0]);
              }}
              className="text-xs px-3 py-1 bg-amber-600 text-white font-bold rounded-sm hover:bg-amber-700 cursor-pointer"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      )}

      {/* Tab Switcher: Founder (Themself) vs Additional Legal Advisers */}
      <div className="flex border-b border-forest/15 bg-white px-4 pt-3 rounded-t-sm shadow-sm gap-4">
        <button
          type="button"
          onClick={() => setActiveSubTab("founder")}
          className={`pb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeSubTab === "founder"
              ? "border-gold text-forest"
              : "border-transparent text-charcoal/60 hover:text-forest"
          }`}
        >
          <User size={16} className={activeSubTab === "founder" ? "text-gold" : ""} />
          <span>Principal Advocate (Themself)</span>
          <span className="bg-gold/15 text-gold text-[10px] px-1.5 py-0.5 rounded font-bold">
            Founder
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("advocates")}
          className={`pb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeSubTab === "advocates"
              ? "border-gold text-forest"
              : "border-transparent text-charcoal/60 hover:text-forest"
          }`}
        >
          <Briefcase size={16} className={activeSubTab === "advocates" ? "text-gold" : ""} />
          <span>Additional Legal Advisors</span>
          <span className="bg-forest/10 text-forest text-[10px] px-1.5 py-0.5 rounded font-bold">
            {advocates.length} Active
          </span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* SUB-TAB 1: PRINCIPAL ADVOCATE & FOUNDER (THEMSELF)                   */}
      {/* ==================================================================== */}
      {activeSubTab === "founder" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Picture Card Preview & Instant Photo Uploader (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-sm border border-forest/10 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-forest/10">
                <span className="text-xs font-bold text-forest uppercase tracking-wider">
                  Live Portrait Preview
                </span>
                <span className="text-[10px] text-charcoal/50 uppercase tracking-widest font-mono">
                  Aspect 3:4 High Court Frame
                </span>
              </div>

              {/* Exact Frame as shown on public website's About section */}
              <div className="relative group bg-white border border-forest/15 p-4 rounded-sm shadow-sm">
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-gold/30 p-1 bg-ivory">
                  <div className="w-full h-full relative overflow-hidden rounded-sm bg-forest/5 flex items-center justify-center">
                    {founderForm.photoUrl ? (
                      <img
                        src={founderForm.photoUrl}
                        alt={founderForm.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-charcoal/40 p-4 text-center">
                        <User size={48} className="text-forest/30 mb-2" />
                        <span className="text-xs font-serif font-bold text-forest">No Portrait Selected</span>
                        <span className="text-[10px] text-charcoal/60 mt-1">Upload a photo below</span>
                      </div>
                    )}

                    {/* Gold Corner accents matching the public About portrait */}
                    <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-gold pointer-events-none" />
                    <span className="absolute top-2 right-2 w-3 h-3 border-t border-r border-gold pointer-events-none" />
                    <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-gold pointer-events-none" />
                    <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-gold pointer-events-none" />
                  </div>
                </div>

                {/* Portrait Caption Overlay */}
                <div className="mt-3 text-center">
                  <span className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] block">
                    {founderForm.role}
                  </span>
                  <h4 className="font-serif text-lg font-bold text-forest leading-tight">
                    {founderForm.name}
                  </h4>
                  <p className="text-[11px] text-charcoal/70 font-medium">
                    {founderForm.title}
                  </p>
                </div>
              </div>

              {/* Photo Changing Controls: File Upload & Drag & Drop */}
              <div className="mt-4 pt-4 border-t border-forest/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                    <Camera size={14} className="text-gold" />
                    Change Portrait Picture
                  </span>
                  <span className="text-[10px] text-charcoal/50">PNG, JPG, WebP</span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={founderFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFounderFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {/* Drag-and-Drop Zone / Browse button */}
                <div
                  onClick={() => founderFileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFounderFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className="border-2 border-dashed border-forest/20 hover:border-gold hover:bg-gold/5 p-4 rounded-sm text-center transition-all cursor-pointer group"
                >
                  <Upload className="mx-auto text-forest/40 group-hover:text-gold group-hover:scale-110 transition-transform mb-1.5" size={24} />
                  <p className="text-xs font-semibold text-forest">
                    Click to browse or drag &amp; drop photo here
                  </p>
                  <p className="text-[10px] text-charcoal/60 mt-0.5">
                    Auto-optimized &amp; compressed for instant website rendering
                  </p>
                </div>

                {/* Option 2: Paste Image URL */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-charcoal/70">
                    Or paste direct image URL
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <LinkIcon size={13} className="text-charcoal/40 absolute left-2.5 top-2.5" />
                      <input
                        type="url"
                        value={founderUrlInput}
                        onChange={(e) => setFounderUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/... or cloud image"
                        className="w-full text-xs bg-sage-light border border-forest/15 rounded-sm pl-8 pr-3 py-1.5 focus:outline-gold font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyFounderUrl}
                      className="text-xs bg-forest hover:bg-forest/90 text-gold px-3 py-1.5 rounded-sm font-semibold cursor-pointer shrink-0 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Option 3: Pick from Curated Headshot Presets */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-charcoal/70 flex items-center gap-1">
                      <Sparkles size={12} className="text-gold" />
                      Select from Professional Headshot Presets
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {LEGAL_PORTRAIT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setFounderForm((prev) => ({ ...prev, photoUrl: preset.url }));
                          setFounderUrlInput(preset.url);
                        }}
                        title={`${preset.name} - ${preset.role}`}
                        className={`relative aspect-square rounded overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 ${
                          founderForm.photoUrl === preset.url
                            ? "border-gold ring-2 ring-gold/40 shadow"
                            : "border-gray-200 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {founderForm.photoUrl === preset.url && (
                          <span className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                            <Check size={14} className="text-white drop-shadow bg-forest/80 rounded-full p-0.5" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {founderError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-sm border border-red-200 flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    {founderError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Founder Profile Details & Bio Editor (7 Cols) */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSaveFounder} className="bg-white p-6 rounded-sm border border-forest/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-forest/10">
                <div>
                  <h3 className="font-serif text-lg font-bold text-forest">
                    Founder's Biography &amp; Public Details
                  </h3>
                  <p className="text-xs text-charcoal/60">
                    These credentials appear prominently in the About story on the main website.
                  </p>
                </div>
                {founderSuccess && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-sm animate-fade-in">
                    <Check size={14} />
                    Live on Website!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={founderForm.name}
                    onChange={(e) => setFounderForm({ ...founderForm, name: e.target.value })}
                    required
                    className="w-full text-sm bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold font-medium"
                    placeholder="Advocate Reynold D'Souza"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1">
                    Designation Role
                  </label>
                  <input
                    type="text"
                    value={founderForm.role}
                    onChange={(e) => setFounderForm({ ...founderForm, role: e.target.value })}
                    required
                    className="w-full text-sm bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold font-medium"
                    placeholder="Founder & Principal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1">
                  Court Title &amp; Bar Jurisdiction
                </label>
                <input
                  type="text"
                  value={founderForm.title}
                  onChange={(e) => setFounderForm({ ...founderForm, title: e.target.value })}
                  required
                  className="w-full text-sm bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold font-medium"
                  placeholder="Advocate, High Court of Karnataka"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1">
                  Summary &amp; Litigation Scope
                </label>
                <textarea
                  rows={3}
                  value={founderForm.bio}
                  onChange={(e) => setFounderForm({ ...founderForm, bio: e.target.value })}
                  required
                  className="w-full text-sm bg-sage-light border border-forest/20 p-3 rounded-sm focus:outline-gold font-normal leading-relaxed"
                  placeholder="Enrolled under the Bar Council, representing clients in Civil, Criminal, Constitutional, and Commercial litigation..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1">
                  Founder's Guiding Note / Quote
                </label>
                <textarea
                  rows={2}
                  value={founderForm.quote}
                  onChange={(e) => setFounderForm({ ...founderForm, quote: e.target.value })}
                  required
                  className="w-full text-sm bg-sage-light border border-forest/20 p-3 rounded-sm focus:outline-gold italic font-normal"
                  placeholder="Justice is not just a destination, but the path we walk with every client we serve..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1">
                  Quote Author Attribution
                </label>
                <input
                  type="text"
                  value={founderForm.quoteAuthor}
                  onChange={(e) => setFounderForm({ ...founderForm, quoteAuthor: e.target.value })}
                  className="w-full text-sm bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold font-medium"
                  placeholder="— Founder's Note"
                />
              </div>

              {/* Action Submit Button */}
              <div className="pt-4 border-t border-forest/10 flex items-center justify-between">
                <p className="text-[11px] text-charcoal/60">
                  Updates sync directly with Firestore and reflect instantly on the public website.
                </p>

                <button
                  type="submit"
                  disabled={founderSaving}
                  className="inline-flex items-center gap-2 bg-forest hover:bg-forest/95 text-gold font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-sm border border-gold/40 shadow cursor-pointer transition-all disabled:opacity-50"
                >
                  {founderSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check size={16} />
                      Save Founder Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 2: ADDITIONAL LEGAL ADVISORS                                  */}
      {/* ==================================================================== */}
      {activeSubTab === "advocates" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: List of Legal Advisors & Reordering (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-4 rounded-sm border border-forest/10 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-forest/10">
                <span className="text-xs font-bold text-forest uppercase tracking-wider">
                  Active Advisors ({advocates.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-forest bg-gold hover:bg-gold-hover px-2.5 py-1 rounded-sm cursor-pointer transition-colors shadow-sm"
                >
                  <Plus size={13} />
                  Add Advisor
                </button>
              </div>

              {/* Advisor List Cards */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {advocates.map((adv, idx) => {
                  const isSelected = adv.id === selectedAdvocateId;
                  return (
                    <div
                      key={adv.id}
                      onClick={() => handleSelectAdvocate(adv)}
                      className={`p-3 rounded-sm border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-sage-light border-gold shadow-sm ring-1 ring-gold/50"
                          : "bg-white border-forest/10 hover:border-gold/40 hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Thumbnail photo or initials monogram */}
                        <div className="w-10 h-10 rounded-sm overflow-hidden bg-forest text-gold shrink-0 border border-forest/20 flex items-center justify-center font-serif text-xs font-bold">
                          {adv.photoUrl ? (
                            <img
                              src={adv.photoUrl}
                              alt={adv.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {adv.name.split(" ").slice(-2)[0]?.[0] || "A"}
                              {adv.name.split(" ").slice(-1)[0]?.[0] || "L"}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-forest truncate font-serif">
                            {adv.name}
                          </h4>
                          <p className="text-[10px] text-gold font-semibold uppercase tracking-wider truncate">
                            {adv.role}
                          </p>
                          <p className="text-[9px] text-charcoal/60 truncate">
                            {adv.location}
                          </p>
                        </div>
                      </div>

                      {/* Reordering Up/Down controls */}
                      <div className="flex flex-col gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, "up")}
                          className="p-1 hover:bg-gray-200 rounded text-charcoal/50 hover:text-forest disabled:opacity-20 cursor-pointer"
                          title="Move up in order"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === advocates.length - 1}
                          onClick={() => handleMove(idx, "down")}
                          className="p-1 hover:bg-gray-200 rounded text-charcoal/50 hover:text-forest disabled:opacity-20 cursor-pointer"
                          title="Move down in order"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Selected Advocate Editor & Live Card Preview (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {advocateForm ? (
              <div className="space-y-4">
                {/* Advisor Photo Studio & Live Card Box */}
                <div className="bg-white p-5 rounded-sm border border-forest/10 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-forest/10">
                    <div>
                      <span className="text-[10px] font-bold text-gold uppercase tracking-wider block">
                        Advisor Photo &amp; Avatar Studio
                      </span>
                      <h3 className="font-serif text-lg font-bold text-forest">
                        {advocateForm.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAdvocate(advocateForm.id, advocateForm.name)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded border border-red-200 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      Remove Advisor
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mt-4 items-start">
                    {/* Live Card Mini-Preview (5 cols) */}
                    <div className="sm:col-span-5 bg-sage-light/40 p-4 rounded-sm border border-forest/10 flex flex-col items-center text-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-charcoal/50 mb-3">
                        Appearance in Advocates Grid
                      </span>

                      <div className="w-24 h-28 rounded-sm overflow-hidden border-2 border-forest/20 shadow-sm bg-white relative group flex items-center justify-center mb-3">
                        {advocateForm.photoUrl ? (
                          <img
                            src={advocateForm.photoUrl}
                            alt={advocateForm.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-forest text-gold flex flex-col items-center justify-center">
                            <span className="font-serif text-xl font-bold">
                              {advocateForm.name.split(" ").slice(-2)[0]?.[0] || "A"}
                              {advocateForm.name.split(" ").slice(-1)[0]?.[0] || "L"}
                            </span>
                            <span className="text-[9px] uppercase tracking-widest opacity-80 mt-1 font-mono">
                              Monogram
                            </span>
                          </div>
                        )}

                        {/* Remove photo button if photo set */}
                        {advocateForm.photoUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setAdvocateForm({ ...advocateForm, photoUrl: "" });
                              setAdvocateUrlInput("");
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 cursor-pointer"
                            title="Switch to Monogram Initials Badge"
                          >
                            <Trash2 size={16} />
                            Use Initials
                          </button>
                        )}
                      </div>

                      <span className="text-[9px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold mb-1">
                        {advocateForm.admissionNo || "KAR/XXXX/YEAR"}
                      </span>
                      <h4 className="font-serif text-sm font-bold text-forest leading-tight">
                        {advocateForm.name}
                      </h4>
                      <p className="text-[10px] text-gold font-bold uppercase tracking-wider mt-0.5">
                        {advocateForm.role}
                      </p>
                    </div>

                    {/* Photo Change Controls (7 cols) */}
                    <div className="sm:col-span-7 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                          <Camera size={14} className="text-gold" />
                          Change Picture
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAdvocateForm({ ...advocateForm, photoUrl: "" });
                            setAdvocateUrlInput("");
                          }}
                          className="text-[10px] text-forest underline hover:text-gold cursor-pointer"
                        >
                          Use Monogram Badge
                        </button>
                      </div>

                      {/* Hidden file input */}
                      <input
                        ref={advocateFileRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleAdvocateFileUpload(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />

                      {/* Upload Box */}
                      <div
                        onClick={() => advocateFileRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleAdvocateFileUpload(e.dataTransfer.files[0]);
                          }
                        }}
                        className="border-2 border-dashed border-forest/20 hover:border-gold hover:bg-gold/5 p-3 rounded-sm text-center transition-all cursor-pointer group"
                      >
                        <Upload className="mx-auto text-forest/40 group-hover:text-gold group-hover:scale-110 transition-transform mb-1" size={20} />
                        <p className="text-xs font-semibold text-forest">
                          Upload Headshot Photo
                        </p>
                        <p className="text-[10px] text-charcoal/60">
                          Click to browse or drop file here
                        </p>
                      </div>

                      {/* Paste URL */}
                      <div className="flex gap-2 pt-1">
                        <div className="relative flex-grow">
                          <LinkIcon size={12} className="text-charcoal/40 absolute left-2.5 top-2.5" />
                          <input
                            type="url"
                            value={advocateUrlInput}
                            onChange={(e) => setAdvocateUrlInput(e.target.value)}
                            placeholder="Paste image URL..."
                            className="w-full text-xs bg-sage-light border border-forest/15 rounded-sm pl-7 pr-2 py-1.5 focus:outline-gold font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyAdvocateUrl}
                          className="text-xs bg-forest hover:bg-forest/90 text-gold px-2.5 py-1.5 rounded-sm font-semibold cursor-pointer shrink-0 transition-colors"
                        >
                          Apply
                        </button>
                      </div>

                      {/* Presets */}
                      <div className="pt-1">
                        <span className="text-[10px] font-bold text-charcoal/60 block mb-1.5">
                          Or select headshot preset:
                        </span>
                        <div className="grid grid-cols-6 gap-1.5">
                          {LEGAL_PORTRAIT_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                setAdvocateForm({ ...advocateForm, photoUrl: preset.url });
                                setAdvocateUrlInput(preset.url);
                              }}
                              title={preset.name}
                              className={`relative aspect-square rounded overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 ${
                                advocateForm.photoUrl === preset.url
                                  ? "border-gold ring-1 ring-gold"
                                  : "border-gray-200 opacity-75 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={preset.url}
                                alt={preset.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {advocateError && (
                        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-sm border border-red-200">
                          {advocateError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Advisor Details Form */}
                <form onSubmit={handleSaveAdvocate} className="bg-white p-5 rounded-sm border border-forest/10 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-forest/10">
                    <h3 className="font-serif text-base font-bold text-forest">
                      Legal Credentials &amp; Bio Information
                    </h3>
                    {advocateSuccess && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-sm">
                        <Check size={14} />
                        Saved &amp; Live!
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1">
                        Advocate Full Name
                      </label>
                      <input
                        type="text"
                        value={advocateForm.name}
                        onChange={(e) => setAdvocateForm({ ...advocateForm, name: e.target.value })}
                        required
                        className="w-full text-xs bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1">
                        Firm Role / Title
                      </label>
                      <input
                        type="text"
                        value={advocateForm.role}
                        onChange={(e) => setAdvocateForm({ ...advocateForm, role: e.target.value })}
                        required
                        className="w-full text-xs bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1">
                        Bar Enrolment No.
                      </label>
                      <input
                        type="text"
                        value={advocateForm.admissionNo}
                        onChange={(e) => setAdvocateForm({ ...advocateForm, admissionNo: e.target.value })}
                        required
                        className="w-full text-xs bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold font-mono"
                        placeholder="KAR/1420/2014"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1">
                        Chambers / Location Presence
                      </label>
                      <input
                        type="text"
                        value={advocateForm.location}
                        onChange={(e) => setAdvocateForm({ ...advocateForm, location: e.target.value })}
                        required
                        className="w-full text-xs bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold font-medium"
                        placeholder="Bengaluru (Head Office)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1">
                        Education &amp; Qualifications
                      </label>
                      <input
                        type="text"
                        value={advocateForm.education}
                        onChange={(e) => setAdvocateForm({ ...advocateForm, education: e.target.value })}
                        required
                        className="w-full text-xs bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold font-medium"
                        placeholder="LL.M. (Constitutional Law), NLSIU"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="text"
                        value={advocateForm.experience}
                        onChange={(e) => setAdvocateForm({ ...advocateForm, experience: e.target.value })}
                        required
                        className="w-full text-xs bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold font-medium"
                        placeholder="10+ Years Practice"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1">
                      Practice Focus &amp; Specialization
                    </label>
                    <input
                      type="text"
                      value={advocateForm.specialization}
                      onChange={(e) => setAdvocateForm({ ...advocateForm, specialization: e.target.value })}
                      required
                      className="w-full text-xs bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold font-medium"
                      placeholder="Constitutional Writs, Commercial Arbitration..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-forest uppercase tracking-wider mb-1">
                      Professional Bio &amp; Case Summary
                    </label>
                    <textarea
                      rows={3}
                      value={advocateForm.bio}
                      onChange={(e) => setAdvocateForm({ ...advocateForm, bio: e.target.value })}
                      required
                      className="w-full text-xs bg-sage-light border border-forest/20 p-3 rounded-sm focus:outline-gold font-normal leading-relaxed"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="pt-3 border-t border-forest/10 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={advocateSaving}
                      className="inline-flex items-center gap-2 bg-forest hover:bg-forest/95 text-gold font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-sm border border-gold/40 shadow cursor-pointer transition-all disabled:opacity-50"
                    >
                      {advocateSaving ? "Saving..." : (
                        <>
                          <Check size={15} />
                          Save Advisor Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-sm border border-forest/10 text-center">
                <User size={36} className="mx-auto text-charcoal/30 mb-2" />
                <p className="text-sm font-semibold text-forest">Select an advisor from the list</p>
                <p className="text-xs text-charcoal/60 mt-1">Or click "+ Add Advisor" to create a new profile.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD NEW LEGAL ADVISOR                                         */}
      {/* ==================================================================== */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-gold/30 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 font-sans animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-forest/10">
              <div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-wider">
                  Firm Roster Expansion
                </span>
                <h3 className="font-serif text-xl font-bold text-forest">
                  Add Additional Legal Advisor
                </h3>
              </div>
              <button
                onClick={() => setIsAddingNew(false)}
                className="text-charcoal/50 hover:text-forest text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdvocate} className="space-y-4">
              {/* Photo preview and quick selector */}
              <div className="bg-sage-light/50 p-4 rounded-sm border border-forest/10 flex items-center gap-4">
                <div className="w-16 h-16 rounded-sm bg-forest text-gold overflow-hidden shrink-0 flex items-center justify-center font-serif font-bold text-lg border border-gold/30">
                  {newAdvocateForm.photoUrl ? (
                    <img
                      src={newAdvocateForm.photoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>ADV</span>
                  )}
                </div>

                <div className="space-y-1.5 flex-grow">
                  <span className="text-xs font-bold text-forest block">
                    Advisor Headshot Photo (Optional)
                  </span>
                  <input
                    ref={newAdvocateFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleNewAdvocateFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => newAdvocateFileRef.current?.click()}
                      className="text-xs bg-white hover:bg-gray-50 border border-forest/20 text-forest font-semibold px-3 py-1.5 rounded-sm cursor-pointer"
                    >
                      Upload Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAdvocateForm({ ...newAdvocateForm, photoUrl: LEGAL_PORTRAIT_PRESETS[1].url })}
                      className="text-xs bg-gold/20 hover:bg-gold/30 text-forest font-semibold px-3 py-1.5 rounded-sm cursor-pointer"
                    >
                      Use Headshot Preset
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-forest mb-1">Advocate Full Name</label>
                  <input
                    type="text"
                    value={newAdvocateForm.name}
                    onChange={(e) => setNewAdvocateForm({ ...newAdvocateForm, name: e.target.value })}
                    required
                    className="w-full text-xs bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={newAdvocateForm.role}
                    onChange={(e) => setNewAdvocateForm({ ...newAdvocateForm, role: e.target.value })}
                    required
                    className="w-full text-xs bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest mb-1">Bar Enrolment No.</label>
                  <input
                    type="text"
                    value={newAdvocateForm.admissionNo}
                    onChange={(e) => setNewAdvocateForm({ ...newAdvocateForm, admissionNo: e.target.value })}
                    required
                    className="w-full text-xs bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold font-mono"
                    placeholder="KAR/2000/2022"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest mb-1">Chamber Location</label>
                  <input
                    type="text"
                    value={newAdvocateForm.location}
                    onChange={(e) => setNewAdvocateForm({ ...newAdvocateForm, location: e.target.value })}
                    required
                    className="w-full text-xs bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold"
                    placeholder="Bengaluru (Head Office)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest mb-1">Education</label>
                  <input
                    type="text"
                    value={newAdvocateForm.education}
                    onChange={(e) => setNewAdvocateForm({ ...newAdvocateForm, education: e.target.value })}
                    required
                    className="w-full text-xs bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest mb-1">Experience</label>
                  <input
                    type="text"
                    value={newAdvocateForm.experience}
                    onChange={(e) => setNewAdvocateForm({ ...newAdvocateForm, experience: e.target.value })}
                    required
                    className="w-full text-xs bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest mb-1">Practice Specialization</label>
                <input
                  type="text"
                  value={newAdvocateForm.specialization}
                  onChange={(e) => setNewAdvocateForm({ ...newAdvocateForm, specialization: e.target.value })}
                  required
                  className="w-full text-xs bg-sage-light border border-forest/20 px-3 py-2 rounded-sm focus:outline-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest mb-1">Professional Bio</label>
                <textarea
                  rows={3}
                  value={newAdvocateForm.bio}
                  onChange={(e) => setNewAdvocateForm({ ...newAdvocateForm, bio: e.target.value })}
                  required
                  className="w-full text-xs bg-sage-light border border-forest/20 p-3 rounded-sm focus:outline-gold"
                />
              </div>

              <div className="pt-3 border-t border-forest/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 text-charcoal rounded-sm cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newAdvocateSaving}
                  className="text-xs px-5 py-2 bg-forest hover:bg-forest/90 text-gold font-bold uppercase tracking-wider rounded-sm border border-gold/30 cursor-pointer shadow"
                >
                  {newAdvocateSaving ? "Adding..." : "Add to Firm Roster"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
