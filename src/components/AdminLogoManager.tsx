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
  Sparkles,
  ShieldCheck,
  FileCheck
} from "lucide-react";

interface AdminLogoManagerProps {
  onClose?: () => void;
}

export default function AdminLogoManager({ onClose }: AdminLogoManagerProps) {
  const { logoSrc, isCustom, updateLogo, resetLogo } = useBrandLogo();
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate image format
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file (PNG, JPG, JPEG, SVG, or WEBP).");
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File size is too large. Please upload an image under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPreviewUrl(result);
        const success = updateLogo(result);
        if (success) {
          setSuccessMessage("Exact brand logo successfully uploaded and applied across the entire firm platform!");
        } else {
          setErrorMessage("Failed to save logo to local storage. File might be too large.");
        }
      }
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read the image file.");
    };
    reader.readAsDataURL(file);
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

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const success = updateLogo(urlInput.trim());
      if (success) {
        setSuccessMessage("Brand logo URL successfully updated and synced across all pages!");
        setUrlInput("");
      } else {
        setErrorMessage("Failed to apply image URL.");
      }
    } catch {
      setErrorMessage("Invalid image URL.");
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the firm logo to the default master emblem?")) {
      resetLogo();
      setPreviewUrl(null);
      setSuccessMessage("Firm logo restored to master default.");
    }
  };

  return (
    <div className="bg-forest-light/60 border border-gold/20 rounded-xl p-6 shadow-xl space-y-6 text-ivory">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/15 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-gold/15 text-gold border border-gold/30">
              <ImageIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display text-xl text-ivory font-medium tracking-wide">
                Firm Logo & Brand Emblem Editor
              </h3>
              <p className="text-xs text-ivory/60 font-sans mt-0.5">
                Upload or paste your exact copyrighted logo image to display it site-wide.
              </p>
            </div>
          </div>
        </div>

        {isCustom && (
          <button
            onClick={handleReset}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs font-medium transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset to Default Logo
          </button>
        )}
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
              Click to Upload or Drag & Drop Exact Logo Image
            </h4>
            <p className="text-xs text-ivory/60 max-w-sm mb-3">
              Supports high-resolution PNG, JPG, JPEG, SVG, or WebP. The exact uploaded image file will be directly rendered with zero distortion.
            </p>

            <button
              type="button"
              className="px-4 py-2 bg-gold text-forest font-semibold text-xs tracking-wider uppercase rounded-lg hover:bg-gold-light transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              Select Image File
            </button>
          </div>

          {/* Or Paste Image URL */}
          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <input
              type="url"
              placeholder="Or paste direct image URL (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-forest/80 border border-gold/20 rounded-lg px-3.5 py-2 text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={!urlInput.trim()}
              className="px-3.5 py-2 bg-forest-light border border-gold/30 text-gold hover:bg-gold hover:text-forest disabled:opacity-50 disabled:pointer-events-none text-xs font-medium rounded-lg transition-colors"
            >
              Apply URL
            </button>
          </form>
        </div>

        {/* Right Column: Live Multi-Theme Preview */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" />
            Live Logo Previews
          </div>

          {/* Preview on Dark Background (Navbar & Footer) */}
          <div className="bg-forest border border-gold/30 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden">
            <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest text-ivory/50 font-sans">
              Navbar & Header Preview
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
              Changes are immediately applied to the Header, Footer, Splash Screen, Admin Portal, Client Portal, and Consultation Receipts.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
