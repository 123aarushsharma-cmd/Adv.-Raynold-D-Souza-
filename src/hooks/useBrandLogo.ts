import { useState, useEffect, useCallback } from "react";
import defaultLogo from "../assets/logo.png";

const STORAGE_KEY = "olive_custom_brand_logo";
const EVENT_NAME = "olive_brand_logo_updated";

export function getStoredBrandLogo(): string {
  if (typeof window === "undefined") return defaultLogo;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim().length > 0) {
      return saved;
    }
  } catch (err) {
    console.warn("Could not read custom logo from localStorage:", err);
  }
  return defaultLogo;
}

export function useBrandLogo() {
  const [logoSrc, setLogoSrc] = useState<string>(() => getStoredBrandLogo());
  const [isCustom, setIsCustom] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return Boolean(saved && saved.trim().length > 0);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      const current = getStoredBrandLogo();
      setLogoSrc(current);
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        setIsCustom(Boolean(saved && saved.trim().length > 0));
      } catch {
        setIsCustom(false);
      }
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const updateLogo = useCallback((newLogoDataUrl: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, newLogoDataUrl);
      setLogoSrc(newLogoDataUrl);
      setIsCustom(true);
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
      return true;
    } catch (err) {
      console.error("Failed to save brand logo:", err);
      return false;
    }
  }, []);

  const resetLogo = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setLogoSrc(defaultLogo);
      setIsCustom(false);
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    } catch (err) {
      console.error("Failed to reset brand logo:", err);
    }
  }, []);

  return {
    logoSrc,
    isCustom,
    updateLogo,
    resetLogo,
  };
}
