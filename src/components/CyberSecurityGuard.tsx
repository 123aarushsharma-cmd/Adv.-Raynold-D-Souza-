import React, { useEffect, useState } from "react";
import { Shield, AlertTriangle, Lock } from "lucide-react";

export default function CyberSecurityGuard() {
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState("");

  useEffect(() => {
    // 1. Console Cyber Security & Intellectual Property Notice
    console.log(
      "%c 🛡️ OLIVE LAW CHAMBERS CYBER SECURITY & IP PROTECTION %c\nUnauthorized source inspection, code scraping, or reverse engineering is strictly monitored under Sections 43 & 66 of the Information Technology Act, 2000 and Indian Copyright Law.",
      "background: #0B1D0F; color: #C9A227; font-size: 14px; font-weight: bold; padding: 8px 12px; border-radius: 4px; border: 1px solid #C9A227;",
      "color: #1c2b20; font-size: 11px; font-weight: normal;"
    );

    // 2. Prevent Right Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setWarningText("🔒 Olive Law Chambers IP Guard: Context menu and element inspection are restricted.");
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    };

    // 3. Block Developer Tools & View Source Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
        ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u")) ||
        ((e.ctrlKey || e.metaKey) && (e.key === "S" || e.key === "s"))
      ) {
        e.preventDefault();
        setWarningText("🛡️ Cyber Security Shield Active: DevTools and source extraction shortcuts are restricted.");
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] bg-forest border border-gold/60 text-ivory px-4 py-3 rounded-md shadow-2xl flex items-center gap-3 font-sans animate-fade-in max-w-sm">
      <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
        <Lock className="w-4 h-4 text-gold" />
      </div>
      <div className="text-xs">
        <p className="font-bold text-gold uppercase tracking-wider text-[10px]">Cyber Security Active</p>
        <p className="text-ivory/90 font-light mt-0.5">{warningText}</p>
      </div>
    </div>
  );
}
