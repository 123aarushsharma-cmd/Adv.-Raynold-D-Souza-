import React, { useState, useRef } from "react";
import { useBrandLogo } from "../hooks/useBrandLogo";
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
  FileCheck
} from "lucide-react";

interface AdminLogoManagerProps {
  onClose?: () => void;
}

export default function AdminLogoManager({ onClose }: AdminLogoManagerProps) {
  const { logoSrc, isCustom, updateLogo, resetLogo, isLoading } = useBrandLogo();
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsProcessing(true);

    // Validate image format
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file (PNG, JPG, JPEG, SVG, or WEBP).");
      setIsProcessing(false);
      return;
    }

    try {
      // Read file and optimize if needed via canvas to ensure safe document payload size
      const reader = new FileReader();
      reader.onerror = () => {
        setErrorMessage("Failed to read image file.");
        setIsProcessing(false);
      };
      reader.onload = async (e) => {
        const rawResult = e.target?.result as string;
        if (!rawResult) {
          setErrorMessage("Failed to process image.");
          setIsProcessing(false);
          return;
        }

        // Image optimization via offscreen canvas
        const img = new Image();
        img.onerror = () => {
          setErrorMessage("Failed to decode image.");
          setIsProcessing(false);
        };
        img.onload = async () => {
          let targetDataUrl = rawResult;
          const maxDim = 800;
          if (img.width > maxDim || img.height > maxDim || rawResult.length > 500000) {
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              targetDataUrl = canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.92);
            }
          }

          setPreviewUrl(targetDataUrl);
          const success = await updateLogo(targetDataUrl);
          setIsProcessing(false);
          if (success) {
            setSuccessMessage("Brand logo successfully updated and synchronized across all devices and hosting platforms!");
          } else {
            setErrorMessage("Failed to save logo to cloud database. Saved locally as fallback.");
          }
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error processing logo file:", err);
      setErrorMessage("An unexpected error occurred while processing the logo file.");
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
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsProcessing(true);

    try {
      const trimmedUrl = urlInput.trim();
      const success = await updateLogo(trimmedUrl);
      setIsProcessing(false);
      if (success) {
        setSuccessMessage("Brand logo URL successfully updated and synced across all pages and devices!");
        setUrlInput("");
      } else {
        setErrorMessage("Failed to apply image URL to cloud database.");
      }
    } catch {
      setIsProcessing(false);
      setErrorMessage("Invalid image URL.");
    }
  };

  const handleDeleteLogo = async () => {
    if (window.confirm("Are you sure you want to DELETE the custom logo and reset to the official default master emblem?")) {
      setIsProcessing(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      await resetLogo();
      setIsProcessing(false);
      setPreviewUrl(null);
      setSuccessMessage("Custom logo successfully deleted. Master emblem restored site-wide.");
    }
  };

  return (
    <div className="bg-forest-light/60 border border-gold/20 rounded-xl p-6 shadow-xl space-y-6 text-ivory">
      {/* Header with Direct Add & Delete Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/15 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-gold/15 text-gold border border-gold/30">
              <ImageIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display text-xl text-ivory font-medium tracking-wide">
                Firm Logo &amp; Brand Emblem Manager
              </h3>
              <p className="text-xs text-ivory/60 font-sans mt-0.5">
                Add, replace, or delete the firm logo across all devices and pages in real time.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Add Logo & Delete Logo */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            type="button"
            disabled={isProcessing || isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gold text-forest hover:bg-gold-light text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add / Upload Logo
          </button>

          <button
            onClick={handleDeleteLogo}
            type="button"
            disabled={isProcessing || isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-500/40 bg-red-500/15 text-red-200 hover:bg-red-500/25 text-xs font-semibold transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Delete custom logo and reset to default"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            Delete Logo
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {successMessage && (
        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-sm">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Upload Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drag & Drop Dropzone */}
        <div className="lg:col-span-7 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
          />

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${
              dragActive
                ? "border-gold bg-gold/10 scale-[1.01]"
                : "border-gold/30 hover:border-gold/60 bg-forest/40 hover:bg-forest/60"
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4 text-gold group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>

            <h4 className="text-base font-medium text-ivory mb-1">
              Click to Upload or Drag &amp; Drop Logo Image
            </h4>
            <p className="text-xs text-ivory/60 max-w-sm mb-3">
              Supports high-resolution PNG, JPG, JPEG, SVG, or WebP. The exact uploaded image file will be directly rendered with zero distortion across all devices.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isProcessing || isLoading}
                className="px-4 py-2 bg-gold text-forest font-semibold text-xs tracking-wider uppercase rounded-lg hover:bg-gold-light transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-60"
              >
                {(isProcessing || isLoading) ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Processing &amp; Syncing...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Select Image File
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Or Paste Image URL */}
          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <input
              type="url"
              placeholder="Or paste direct image URL (https://...)"
              value={urlInput}
              disabled={isProcessing || isLoading}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-forest/80 border border-gold/20 rounded-lg px-3.5 py-2 text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!urlInput.trim() || isProcessing || isLoading}
              className="px-3.5 py-2 bg-forest-light border border-gold/30 text-gold hover:bg-gold hover:text-forest disabled:opacity-50 disabled:pointer-events-none text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              {(isProcessing || isLoading) ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : null}
              Apply URL
            </button>
          </form>
        </div>

        {/* Right Column: Live Multi-Theme Preview & Delete Option */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5" />
              Live Logo Previews
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
              isCustom ? "bg-gold/20 text-gold border border-gold/30" : "bg-white/10 text-ivory/70 border border-white/10"
            }`}>
              {isCustom ? "Custom Logo Active" : "Default Master Emblem"}
            </span>
          </div>

          {/* Preview on Dark Background (Navbar & Footer) */}
          <div className="bg-forest border border-gold/30 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden">
            <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest text-ivory/50 font-sans">
              Navbar &amp; Header Preview
            </span>
            <div className="py-3 flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={logoSrc}
                  alt="Brand Emblem Preview"
                  className="max-h-full max-w-full object-contain drop-shadow-[0_2px_10px_rgba(201,162,39,0.35)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base tracking-[0.18em] font-medium uppercase leading-none text-ivory">
                  Olive®
                </span>
                <span className="font-sans text-[8px] tracking-[0.25em] uppercase font-semibold leading-none mt-1 text-gold">
                  Law Firm®
                </span>
              </div>
            </div>
          </div>

          {/* Preview on Light Background (Documents & Forms) */}
          <div className="bg-[#FAF8F5] border border-stone-300 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden">
            <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest text-stone-500 font-sans">
              Light Theme Preview
            </span>
            <div className="py-3 flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={logoSrc}
                  alt="Brand Emblem Light Preview"
                  className="max-h-full max-w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base tracking-[0.18em] font-medium uppercase leading-none text-[#122820]">
                  Olive®
                </span>
                <span className="font-sans text-[8px] tracking-[0.25em] uppercase font-semibold leading-none mt-1 text-[#8C6B14]">
                  Law Firm®
                </span>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-2.5 rounded-lg bg-gold/10 border border-gold/20 flex items-start gap-2 text-[11px] text-ivory/80 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <span>
              Logo updates and deletions sync instantly across all devices, the public site header, footer, hero section, preloader, and consultation forms.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
