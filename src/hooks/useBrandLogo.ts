import { useState, useEffect, useCallback } from "react";
import defaultLogo from "../assets/logo.png";
import { doc, onSnapshot } from "firebase/firestore";
import { 
  db, 
  getLocalBrandLogo, 
  saveLocalBrandLogo, 
  fetchBrandLogo, 
  saveBrandLogo, 
  resetBrandLogo 
} from "../lib/firebase";

const EVENT_NAME = "olive_brand_logo_updated";

export function getStoredBrandLogo(): string {
  const local = getLocalBrandLogo();
  if (local && local.trim().length > 0) {
    return local;
  }
  return defaultLogo;
}

export function useBrandLogo() {
  const [logoSrc, setLogoSrc] = useState<string>(() => getStoredBrandLogo());
  const [isCustom, setIsCustom] = useState<boolean>(() => {
    const local = getLocalBrandLogo();
    return Boolean(local && local.trim().length > 0);
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // 1. Initial Cloud Fetch
    fetchBrandLogo().then((cloudLogo) => {
      if (cloudLogo && cloudLogo.trim().length > 0) {
        setLogoSrc(cloudLogo);
        setIsCustom(true);
      } else {
        const local = getLocalBrandLogo();
        if (!local) {
          setLogoSrc(defaultLogo);
          setIsCustom(false);
        }
      }
    }).catch((err) => {
      console.warn("Brand logo cloud fetch warning:", err);
    });

    // 2. Real-time Firestore Cloud listener
    const docRef = doc(db, "firm_settings", "logo");
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && typeof data.logoUrl === "string" && data.logoUrl.trim().length > 0) {
          setLogoSrc(data.logoUrl);
          setIsCustom(true);
          saveLocalBrandLogo(data.logoUrl);
          return;
        }
      }
      // If doc does not have custom logoUrl or doc is empty/reset
      const local = getLocalBrandLogo();
      if (local && local.trim().length > 0) {
        setLogoSrc(local);
        setIsCustom(true);
      } else {
        setLogoSrc(defaultLogo);
        setIsCustom(false);
      }
    }, (err) => {
      console.warn("Real-time brand logo listener disconnected, using local cache:", err);
    });

    // 3. Local custom event listener across tabs/windows
    const handleLocalUpdate = () => {
      const current = getStoredBrandLogo();
      setLogoSrc(current);
      const local = getLocalBrandLogo();
      setIsCustom(Boolean(local && local.trim().length > 0));
    };

    window.addEventListener(EVENT_NAME, handleLocalUpdate);
    window.addEventListener("storage", handleLocalUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener(EVENT_NAME, handleLocalUpdate);
      window.removeEventListener("storage", handleLocalUpdate);
    };
  }, []);

  const updateLogo = useCallback(async (newLogoDataUrl: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      setLogoSrc(newLogoDataUrl);
      setIsCustom(true);
      saveLocalBrandLogo(newLogoDataUrl);
      await saveBrandLogo(newLogoDataUrl);
      return true;
    } catch (err) {
      console.error("Failed to save brand logo:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetLogo = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      setLogoSrc(defaultLogo);
      setIsCustom(false);
      saveLocalBrandLogo("");
      await resetBrandLogo();
    } catch (err) {
      console.error("Failed to reset brand logo:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    logoSrc,
    isCustom,
    isLoading,
    updateLogo,
    resetLogo,
  };
}

