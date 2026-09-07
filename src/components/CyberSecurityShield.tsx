import React, { useEffect, useState } from "react";
import { ShieldAlert, Lock, X } from "lucide-react";

export default function CyberSecurityShield() {
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  useEffect(() => {
    const triggerWarning = (msg: string) => {
      setWarningMessage(msg);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 4000);
    };

    // 1. Prevent Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerWarning("Right-click context menu disabled under Olive Law Chambers CyberSecurity Protocol.");
    };

    // 2. Prevent Developer Tools / Inspect Element Hotkeys
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key or Shift+F10
      if (e.key === "F12" || e.keyCode === 123 || (e.shiftKey && e.key === "F10")) {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning("Developer Tools inspection locked under Chambers Privacy Protocol.");
        return false;
      }

      // Cmd/Ctrl + Shift + I/J/C/K/E or Cmd/Ctrl + Option + I/J/C/U
      const keyUpper = e.key ? e.key.toUpperCase() : "";
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const isOptionOrAlt = e.altKey;

      if (
        isCmdOrCtrl && (
          (e.shiftKey && ["I", "J", "C", "K", "E", "M"].includes(keyUpper)) ||
          (isOptionOrAlt && ["I", "J", "C", "U"].includes(keyUpper)) ||
          ["U", "S", "P"].includes(keyUpper)
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning("Source code inspection and dev key combinations are locked for privacy.");
        return false;
      }
    };

    // 3. Prevent Dragging Assets or Code Text
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("dragstart", handleDragStart);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm bg-forest text-ivory border border-gold/50 shadow-2xl rounded-sm p-4 animate-in fade-in slide-in-from-top duration-300 font-sans">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
          <ShieldAlert size={18} className="text-gold animate-bounce" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-serif text-xs font-bold text-gold uppercase tracking-wider">
              Cybersecurity Shield Active
            </span>
            <button
              type="button"
              onClick={() => setShowWarning(false)}
              className="text-ivory/60 hover:text-ivory cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-xs text-ivory/90 mt-1 leading-relaxed">
            {warningMessage}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-gold/70 mt-2 pt-1 border-t border-gold/15">
            <Lock size={10} />
            <span>Olive Law Chambers Security Protocol • Section 66 IT Act & IP Laws</span>
          </div>
        </div>
      </div>
    </div>
  );
}
