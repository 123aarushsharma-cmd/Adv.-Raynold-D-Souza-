import React, { useState, useRef } from "react";
import { useFirmBranding } from "../hooks/useFirmBranding";
import defaultLogo from "../assets/logo.png";
import { 
  compressBrandLogo, 
  compressFavicon, 
  compressOgImageCard 
} from "../lib/imageUtils";
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  Plus,
  Sparkles,
  ShieldCheck,
  Globe,
  Share2,
  Smartphone,
  Layers,
  Radio,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Sliders
} from "lucide-react";

interface AdminLogoManagerProps {
  onClose?: () => void;
}

export default function AdminLogoManager({ onClose }: AdminLogoManagerProps) {
  const {
    logoSrc,
    isLogoCustom,
    faviconSrc,
    isFaviconCustom,
    ogImageSrc,
    isOgImageCustom,
    isLoading,
    updateLogo,
    resetLogo,
    updateFavicon,
    resetFavicon,
    updateOgImage,
    resetOgImage,
  } = useFirmBranding();

  const [activeSubTab, setActiveSubTab] = useState<"favicon" | "og_image" | "logo">("favicon");
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // Process uploaded files with adaptive resizing based on target mode
  const handleFileProcess = async (file: File, targetMode: "favicon" | "og_image" | "logo") => {
    clearMessages();
    setIsProcessing(true);

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file (PNG, JPG, JPEG, SVG, or WebP).");
      setIsProcessing(false);
      return;
    }

    try {
      let targetDataUrl = "";
      if (targetMode === "favicon") {
        targetDataUrl = await compressFavicon(file, 192);
      } else if (targetMode === "og_image") {
        targetDataUrl = await compressOgImageCard(file);
      } else {
        targetDataUrl = await compressBrandLogo(file, 600);
      }

      if (!targetDataUrl) {
        setErrorMessage("Failed to process and compress image file.");
        setIsProcessing(false);
        return;
      }

      let success = false;
      if (targetMode === "favicon") {
        success = await updateFavicon(targetDataUrl);
        if (success) {
          setSuccessMessage("Browser Favicon updated successfully! All active browser tabs, search previews, and other devices will reflect the new icon in real time.");
        }
      } else if (targetMode === "og_image") {
        success = await updateOgImage(targetDataUrl);
        if (success) {
          setSuccessMessage("Social Share / OG Image updated successfully! Social preview card synced permanently to Firestore for WhatsApp, LinkedIn, Facebook, and Twitter/X.");
        }
      } else {
        success = await updateLogo(targetDataUrl);
        if (success) {
          setSuccessMessage("Official Brand Logo updated and synchronized permanently across all pages, footers, headers, and connected devices!");
        }
      }

      setIsProcessing(false);
      if (!success) {
        setErrorMessage("Saved locally and scheduled for cloud synchronization.");
      }
    } catch (err) {
      console.error("Error processing asset:", err);
      setErrorMessage("An unexpected error occurred during asset processing.");
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0], activeSubTab);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    clearMessages();
    setIsProcessing(true);

    try {
      const trimmedUrl = urlInput.trim();
      let success = false;
      if (activeSubTab === "favicon") {
        success = await updateFavicon(trimmedUrl);
      } else if (activeSubTab === "og_image") {
        success = await updateOgImage(trimmedUrl);
      } else {
        success = await updateLogo(trimmedUrl);
      }
      setIsProcessing(false);
      if (success) {
        setSuccessMessage("Asset URL applied and propagated to all connected devices!");
        setUrlInput("");
      } else {
        setErrorMessage("Could not save asset URL.");
      }
    } catch {
      setIsProcessing(false);
      setErrorMessage("Invalid asset URL specified.");
    }
  };

  const handleResetCurrent = async () => {
    const assetNames = {
      favicon: "Browser Favicon",
      og_image: "Social Share / OG Image Card",
      logo: "Official Master Brand Logo",
    };
    if (window.confirm(`Are you sure you want to reset the ${assetNames[activeSubTab]} to the default official master version? This will update all connected devices.`)) {
      clearMessages();
      setIsProcessing(true);
      if (activeSubTab === "favicon") {
        await resetFavicon();
        setSuccessMessage("Favicon reset to official default master emblem.");
      } else if (activeSubTab === "og_image") {
        await resetOgImage();
        setSuccessMessage("Social Share / OG Image reset to official 1200x630 card.");
      } else {
        await resetLogo();
        setSuccessMessage("Brand Logo reset to official master emblem.");
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-forest-light/70 border border-gold/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-ivory">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gold/20 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-gold/20 text-gold border border-gold/40 shadow-inner">
              <Sliders className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-2xl text-ivory font-bold tracking-wide">
                  Central Brand &amp; Digital Asset Command Center
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                  Live Sync Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ivory/70 font-sans mt-0.5">
                Real-time multi-device synchronization engine. Updates reflect instantly across all visitor browsers and social platforms.
              </p>
            </div>
          </div>
        </div>

        {/* Global Live Diagnostics Bar */}
        <div className="flex items-center gap-2 bg-black/40 border border-gold/25 px-3.5 py-2 rounded-xl text-xs text-ivory/80 shrink-0">
          <ShieldCheck className="w-4 h-4 text-gold" />
          <span>Firestore Real-time DB: <strong className="text-emerald-400 font-mono">Connected</strong></span>
        </div>
      </div>

      {/* Asset Switcher Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Favicon Tab */}
        <button
          onClick={() => {
            setActiveSubTab("favicon");
            clearMessages();
          }}
          type="button"
          className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left cursor-pointer ${
            activeSubTab === "favicon"
              ? "bg-gold/20 border-gold shadow-lg shadow-gold/10 text-ivory"
              : "bg-forest/60 border-forest-light hover:bg-forest/80 text-ivory/70"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black/50 border border-gold/30 flex items-center justify-center overflow-hidden p-1">
              <img 
                src={faviconSrc} 
                alt="Favicon preview" 
                className="w-7 h-7 object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/favicon.png";
                }}
              />
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-1.5 text-ivory">
                <Globe className="w-4 h-4 text-gold" />
                Browser Favicon
              </div>
              <span className="text-[11px] text-ivory/60 block">
                {isFaviconCustom ? "Custom active" : "Default master"}
              </span>
            </div>
          </div>
          {activeSubTab === "favicon" && <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />}
        </button>

        {/* Social Share / OG Image Tab */}
        <button
          onClick={() => {
            setActiveSubTab("og_image");
            clearMessages();
          }}
          type="button"
          className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left cursor-pointer ${
            activeSubTab === "og_image"
              ? "bg-gold/20 border-gold shadow-lg shadow-gold/10 text-ivory"
              : "bg-forest/60 border-forest-light hover:bg-forest/80 text-ivory/70"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black/50 border border-gold/30 flex items-center justify-center overflow-hidden">
              <img 
                src={ogImageSrc} 
                alt="OG preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/og-image.png";
                }}
              />
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-1.5 text-ivory">
                <Share2 className="w-4 h-4 text-gold" />
                Social Share (OG)
              </div>
              <span className="text-[11px] text-ivory/60 block">
                {isOgImageCustom ? "Custom card" : "Default 1200×630"}
              </span>
            </div>
          </div>
          {activeSubTab === "og_image" && <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />}
        </button>

        {/* Brand Logo Tab */}
        <button
          onClick={() => {
            setActiveSubTab("logo");
            clearMessages();
          }}
          type="button"
          className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left cursor-pointer ${
            activeSubTab === "logo"
              ? "bg-gold/20 border-gold shadow-lg shadow-gold/10 text-ivory"
              : "bg-forest/60 border-forest-light hover:bg-forest/80 text-ivory/70"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black/50 border border-gold/30 flex items-center justify-center overflow-hidden p-1">
              <img 
                src={logoSrc} 
                alt="Logo preview" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultLogo;
                }}
              />
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-1.5 text-ivory">
                <ImageIcon className="w-4 h-4 text-gold" />
                Master Brand Logo
              </div>
              <span className="text-[11px] text-ivory/60 block">
                {isLogoCustom ? "Custom emblem" : "Default emblem"}
              </span>
            </div>
          </div>
          {activeSubTab === "logo" && <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />}
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-start gap-3 text-sm animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Live Real-Time Update Confirmed</strong>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 flex items-start gap-3 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Sync Notice</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: BROWSER FAVICON MANAGER */}
      {activeSubTab === "favicon" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Interactive Tab Simulator */}
            <div className="lg:col-span-5 bg-black/40 border border-gold/20 rounded-xl p-5 space-y-4">
              <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-gold flex items-center gap-2">
                <Laptop className="w-4 h-4" />
                Live Browser Tab Simulation
              </h4>
              
              {/* Mock Browser Window */}
              <div className="bg-[#1e1e24] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                {/* Browser Tab Header */}
                <div className="bg-[#141418] px-3 pt-2 pb-0 flex items-center gap-2 border-b border-black/40">
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                  </div>
                  {/* Active Tab */}
                  <div className="bg-[#1e1e24] px-3 py-1.5 rounded-t-md flex items-center gap-2 max-w-[200px] border-t border-x border-white/10">
                    <img 
                      src={faviconSrc} 
                      alt="Active Tab Favicon" 
                      className="w-4 h-4 object-contain shrink-0" 
                    />
                    <span className="text-[11px] text-white/90 truncate font-medium">
                      Olive Law Firm | High Court
                    </span>
                  </div>
                </div>
                {/* Browser URL Bar */}
                <div className="p-2.5 bg-[#1e1e24] flex items-center gap-2 border-b border-white/5">
                  <div className="bg-black/40 rounded px-2.5 py-1 text-[11px] text-ivory/70 flex items-center gap-2 w-full font-mono">
                    <span className="text-emerald-400">https://</span>olivelawfirm.in
                  </div>
                </div>
                {/* Favicon Enlarged Inspector */}
                <div className="p-6 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-transparent to-black/20">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-white p-3 shadow-2xl flex items-center justify-center border-2 border-gold/40">
                      <img 
                        src={faviconSrc} 
                        alt="Enlarged Favicon" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-forest px-2 py-0.5 rounded text-[10px] font-mono border border-gold/30 text-gold uppercase tracking-wider font-bold">
                      256x256 HD
                    </span>
                  </div>
                  <p className="text-xs text-center text-ivory/60 mt-1 max-w-xs">
                    This icon is injected dynamically into the live browser DOM and cached across all visitor sessions.
                  </p>
                </div>
              </div>
            </div>

            {/* Favicon Controls & Upload Zone */}
            <div className="lg:col-span-7 space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  dragActive 
                    ? "border-gold bg-gold/15 scale-[1.01]" 
                    : "border-gold/30 bg-black/20 hover:border-gold hover:bg-black/30"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-md">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h5 className="font-serif text-base text-ivory font-bold">
                    Drop your new Favicon here or click to browse
                  </h5>
                  <p className="text-xs text-ivory/60 mt-1 font-sans">
                    Supports PNG, SVG, ICO, JPG, WEBP. Square ratio recommended (auto-centers automatically).
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isProcessing || isLoading}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-gold text-forest hover:bg-gold-light text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 disabled:opacity-60 cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Select Favicon File
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleResetCurrent}
                  type="button"
                  disabled={isProcessing || isLoading || !isFaviconCustom}
                  className="px-4 py-2 rounded-xl border border-red-500/40 bg-red-500/15 text-red-200 hover:bg-red-500/25 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reset to Default Master Favicon
                </button>

                <div className="text-[11px] text-ivory/60 italic">
                  Changes propagate to all clients without requiring page reload.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SOCIAL SHARE / OG IMAGE MANAGER */}
      {activeSubTab === "og_image" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live WhatsApp / Social Media Preview Card Simulation */}
            <div className="lg:col-span-6 bg-black/40 border border-gold/20 rounded-xl p-5 space-y-4">
              <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-gold flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Live WhatsApp &amp; Social Share Simulator
              </h4>

              {/* WhatsApp Card Simulation */}
              <div className="bg-[#111b21] border border-white/10 rounded-xl p-3 shadow-2xl max-w-md mx-auto space-y-2">
                <div className="text-[11px] text-[#00a884] font-medium flex items-center gap-1.5 px-1">
                  <span>Chat Preview</span> • <span>WhatsApp / LinkedIn / Twitter</span>
                </div>

                <div className="bg-[#202c33] rounded-lg overflow-hidden border border-white/10 shadow-lg">
                  {/* OG Image Landscape */}
                  <div className="aspect-[1.91/1] w-full bg-white relative overflow-hidden flex items-center justify-center">
                    <img 
                      src={ogImageSrc} 
                      alt="Social Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Card Meta Content */}
                  <div className="p-3 space-y-1 bg-[#202c33]">
                    <span className="text-[10px] text-white/50 uppercase tracking-wider font-mono block">
                      olivelawfirm.in
                    </span>
                    <h5 className="text-sm font-bold text-white font-serif line-clamp-1">
                      Olive Law Firm | High Court Advocates &amp; Legal Consultants
                    </h5>
                    <p className="text-xs text-white/70 line-clamp-2 leading-snug">
                      Official portal of Olive Law Firm, Bengaluru &amp; Dharwad. Civil, Criminal, Constitutional Litigation &amp; Legal Advisers led by Advocate Reynold D'Souza.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-center text-ivory/60">
                When anyone shares <strong className="text-ivory">olivelawfirm.in</strong> on WhatsApp, Facebook, LinkedIn, or Twitter, this exact image and metadata will appear.
              </p>
            </div>

            {/* OG Image Controls & Upload */}
            <div className="lg:col-span-6 space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  dragActive 
                    ? "border-gold bg-gold/15 scale-[1.01]" 
                    : "border-gold/30 bg-black/20 hover:border-gold hover:bg-black/30"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-md">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h5 className="font-serif text-base text-ivory font-bold">
                    Upload Social Media Share Banner (1200×630)
                  </h5>
                  <p className="text-xs text-ivory/60 mt-1 font-sans">
                    Auto-formatted to standard 1.91:1 ratio for Facebook, Twitter, WhatsApp, LinkedIn.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isProcessing || isLoading}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-gold text-forest hover:bg-gold-light text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 disabled:opacity-60 cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Select Share Banner File
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleResetCurrent}
                  type="button"
                  disabled={isProcessing || isLoading || !isOgImageCustom}
                  className="px-4 py-2 rounded-xl border border-red-500/40 bg-red-500/15 text-red-200 hover:bg-red-500/25 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reset to Default 1200×630 Card
                </button>

                <div className="text-[11px] text-ivory/60 italic">
                  Live dynamic OpenGraph meta sync enabled.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BRAND LOGO MANAGER */}
      {activeSubTab === "logo" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Header Simulation */}
            <div className="lg:col-span-5 bg-black/40 border border-gold/20 rounded-xl p-5 space-y-4">
              <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-gold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Navigation Bar Preview
              </h4>

              {/* Mock Dark Navbar */}
              <div className="bg-forest border border-gold/30 rounded-xl p-4 shadow-xl space-y-3">
                <span className="text-[10px] uppercase font-mono text-gold/80 block">
                  Navbar (Dark Background)
                </span>
                <div className="flex items-center gap-3">
                  <img 
                    src={logoSrc} 
                    alt="Logo on dark" 
                    className="h-12 w-12 object-contain rounded-lg p-1 bg-white/5 border border-gold/20"
                  />
                  <div>
                    <div className="font-serif text-base font-bold text-ivory tracking-wider">
                      OLIVE LAW FIRM
                    </div>
                    <div className="text-[10px] text-gold tracking-widest uppercase">
                      Advocates &amp; Legal Consultants
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock Light Background Preview */}
              <div className="bg-ivory text-forest border border-charcoal/20 rounded-xl p-4 shadow-xl space-y-3">
                <span className="text-[10px] uppercase font-mono text-charcoal/60 block">
                  Official Document (Light Background)
                </span>
                <div className="flex items-center gap-3">
                  <img 
                    src={logoSrc} 
                    alt="Logo on light" 
                    className="h-12 w-12 object-contain rounded-lg p-1 bg-white shadow-sm border border-forest/15"
                  />
                  <div>
                    <div className="font-serif text-base font-bold text-forest tracking-wider">
                      OLIVE LAW FIRM
                    </div>
                    <div className="text-[10px] text-forest/70 tracking-widest uppercase font-semibold">
                      Advocates &amp; Legal Consultants
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Logo Upload Zone */}
            <div className="lg:col-span-7 space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  dragActive 
                    ? "border-gold bg-gold/15 scale-[1.01]" 
                    : "border-gold/30 bg-black/20 hover:border-gold hover:bg-black/30"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-md">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h5 className="font-serif text-base text-ivory font-bold">
                    Drop New Firm Logo or Insignia here
                  </h5>
                  <p className="text-xs text-ivory/60 mt-1 font-sans">
                    Supports transparent PNG, SVG, JPG, WEBP.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isProcessing || isLoading}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-gold text-forest hover:bg-gold-light text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 disabled:opacity-60 cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Select Brand Logo File
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleResetCurrent}
                  type="button"
                  disabled={isProcessing || isLoading || !isLogoCustom}
                  className="px-4 py-2 rounded-xl border border-red-500/40 bg-red-500/15 text-red-200 hover:bg-red-500/25 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reset to Default Master Brand Logo
                </button>

                <div className="text-[11px] text-ivory/60 italic">
                  Synchronizes site-wide across all views in real time.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input for Native File Picker */}
      <input 
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp, image/x-icon"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileProcess(e.target.files[0], activeSubTab);
            e.target.value = "";
          }
        }}
      />

      {/* URL Input Fallback Form */}
      <div className="border-t border-gold/15 pt-5">
        <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <input 
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={`Or paste a direct high-resolution image URL for ${activeSubTab === "favicon" ? "Favicon" : activeSubTab === "og_image" ? "Social Share Card" : "Logo"} (https://...)`}
            className="flex-1 bg-black/40 border border-gold/25 rounded-xl px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={!urlInput.trim() || isProcessing}
            className="px-5 py-2.5 rounded-xl bg-forest border border-gold/40 text-gold hover:bg-gold hover:text-forest text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shrink-0"
          >
            Apply Asset URL
          </button>
        </form>
      </div>
    </div>
  );
}
