import { useState, useEffect, useCallback } from "react";
import defaultLogo from "../assets/logo.png";
import { doc, onSnapshot } from "firebase/firestore";
import { 
  db, 
  getLocalBrandLogo, 
  saveLocalBrandLogo, 
  fetchBrandLogo, 
  saveBrandLogo, 
  resetBrandLogo,
  getLocalFavicon, 
  saveLocalFavicon, 
  fetchFavicon, 
  saveFavicon, 
  resetFavicon,
  getLocalOgImage, 
  saveLocalOgImage, 
  fetchOgImage, 
  saveOgImage, 
  resetOgImage,
  subscribeToFirmBroadcast
} from "../lib/firebase";

/**
 * Dynamically updates or creates a meta/link tag in document.head
 */
function updateHeadTag(selector: string, createTag: () => HTMLElement, updateFn: (el: HTMLElement) => void) {
  if (typeof document === "undefined") return;
  let el = document.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = createTag();
    document.head.appendChild(el);
  }
  updateFn(el);
}

/**
 * Applies active favicon dynamically across all active browser windows
 */
export function applyFaviconToDocument(faviconUrl: string | null) {
  if (typeof document === "undefined") return;
  const targetUrl = faviconUrl && faviconUrl.trim().length > 0 ? faviconUrl : "/favicon.png";

  // 1. Standard rel="icon"
  updateHeadTag(
    'link[rel="icon"][type="image/png"]',
    () => {
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      return link;
    },
    (el) => el.setAttribute("href", targetUrl)
  );

  // 2. Shortcut icon
  updateHeadTag(
    'link[rel="shortcut icon"]',
    () => {
      const link = document.createElement("link");
      link.rel = "shortcut icon";
      return link;
    },
    (el) => el.setAttribute("href", targetUrl)
  );

  // 3. Apple touch icon
  updateHeadTag(
    'link[rel="apple-touch-icon"]',
    () => {
      const link = document.createElement("link");
      link.rel = "apple-touch-icon";
      return link;
    },
    (el) => el.setAttribute("href", targetUrl)
  );
}

/**
 * Applies active Social OG Image dynamically to document meta tags
 */
export function applyOgImageToDocument(ogImageUrl: string | null) {
  if (typeof document === "undefined") return;
  const targetUrl = ogImageUrl && ogImageUrl.trim().length > 0 ? ogImageUrl : "/og-image.png";

  // og:image
  updateHeadTag(
    'meta[property="og:image"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:image");
      return meta;
    },
    (el) => el.setAttribute("content", targetUrl)
  );

  // og:image:url
  updateHeadTag(
    'meta[property="og:image:url"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:image:url");
      return meta;
    },
    (el) => el.setAttribute("content", targetUrl)
  );

  // twitter:image
  updateHeadTag(
    'meta[name="twitter:image"]',
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "twitter:image");
      return meta;
    },
    (el) => el.setAttribute("content", targetUrl)
  );

  // image_src
  updateHeadTag(
    'link[rel="image_src"]',
    () => {
      const link = document.createElement("link");
      link.rel = "image_src";
      return link;
    },
    (el) => el.setAttribute("href", targetUrl)
  );
}

export function useFirmBranding() {
  const [logoSrc, setLogoSrc] = useState<string>(() => {
    const local = getLocalBrandLogo();
    return local && local.trim().length > 0 ? local : defaultLogo;
  });
  const [isLogoCustom, setIsLogoCustom] = useState<boolean>(() => {
    const local = getLocalBrandLogo();
    return Boolean(local && local.trim().length > 0);
  });

  const [faviconSrc, setFaviconSrc] = useState<string>(() => {
    const local = getLocalFavicon();
    return local && local.trim().length > 0 ? local : "/favicon.png";
  });
  const [isFaviconCustom, setIsFaviconCustom] = useState<boolean>(() => {
    const local = getLocalFavicon();
    return Boolean(local && local.trim().length > 0);
  });

  const [ogImageSrc, setOgImageSrc] = useState<string>(() => {
    const local = getLocalOgImage();
    return local && local.trim().length > 0 ? local : "/og-image.png";
  });
  const [isOgImageCustom, setIsOgImageCustom] = useState<boolean>(() => {
    const local = getLocalOgImage();
    return Boolean(local && local.trim().length > 0);
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Apply on mount and sync to DOM
  useEffect(() => {
    applyFaviconToDocument(faviconSrc);
    applyOgImageToDocument(ogImageSrc);
  }, [faviconSrc, ogImageSrc]);

  useEffect(() => {
    // 1. Initial Cloud Pre-fetch
    Promise.all([
      fetchBrandLogo(),
      fetchFavicon(),
      fetchOgImage()
    ]).then(([cloudLogo, cloudFavicon, cloudOg]) => {
      if (cloudLogo && cloudLogo.trim().length > 0) {
        setLogoSrc(cloudLogo);
        setIsLogoCustom(true);
      }
      if (cloudFavicon && cloudFavicon.trim().length > 0) {
        setFaviconSrc(cloudFavicon);
        setIsFaviconCustom(true);
        applyFaviconToDocument(cloudFavicon);
      }
      if (cloudOg && cloudOg.trim().length > 0) {
        setOgImageSrc(cloudOg);
        setIsOgImageCustom(true);
        applyOgImageToDocument(cloudOg);
      }
    }).catch(err => {
      console.warn("Initial branding pre-fetch error:", err);
    });

    // 2. Real-time Firestore Cloud listener for LOGO
    const unsubLogo = onSnapshot(doc(db, "firm_settings", "logo"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && typeof data.logoUrl === "string" && data.logoUrl.trim().length > 0) {
          setLogoSrc(data.logoUrl);
          setIsLogoCustom(true);
          saveLocalBrandLogo(data.logoUrl);
          return;
        }
      }
      const local = getLocalBrandLogo();
      if (local && local.trim().length > 0) {
        setLogoSrc(local);
        setIsLogoCustom(true);
      } else {
        setLogoSrc(defaultLogo);
        setIsLogoCustom(false);
      }
    });

    // 3. Real-time Firestore Cloud listener for FAVICON
    const unsubFavicon = onSnapshot(doc(db, "firm_settings", "favicon"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && typeof data.faviconUrl === "string" && data.faviconUrl.trim().length > 0) {
          setFaviconSrc(data.faviconUrl);
          setIsFaviconCustom(true);
          saveLocalFavicon(data.faviconUrl);
          applyFaviconToDocument(data.faviconUrl);
          return;
        }
      }
      const local = getLocalFavicon();
      if (local && local.trim().length > 0) {
        setFaviconSrc(local);
        setIsFaviconCustom(true);
        applyFaviconToDocument(local);
      } else {
        setFaviconSrc("/favicon.png");
        setIsFaviconCustom(false);
        applyFaviconToDocument("/favicon.png");
      }
    });

    // 4. Real-time Firestore Cloud listener for OG IMAGE
    const unsubOg = onSnapshot(doc(db, "firm_settings", "og_image"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && typeof data.ogImageUrl === "string" && data.ogImageUrl.trim().length > 0) {
          setOgImageSrc(data.ogImageUrl);
          setIsOgImageCustom(true);
          saveLocalOgImage(data.ogImageUrl);
          applyOgImageToDocument(data.ogImageUrl);
          return;
        }
      }
      const local = getLocalOgImage();
      if (local && local.trim().length > 0) {
        setOgImageSrc(local);
        setIsOgImageCustom(true);
        applyOgImageToDocument(local);
      } else {
        setOgImageSrc("/og-image.png");
        setIsOgImageCustom(false);
        applyOgImageToDocument("/og-image.png");
      }
    });

    // 5. Local event listener across active tabs
    const handleBrandingUpdate = () => {
      const localL = getLocalBrandLogo();
      setLogoSrc(localL && localL.trim().length > 0 ? localL : defaultLogo);
      setIsLogoCustom(Boolean(localL && localL.trim().length > 0));

      const localF = getLocalFavicon();
      const targetF = localF && localF.trim().length > 0 ? localF : "/favicon.png";
      setFaviconSrc(targetF);
      setIsFaviconCustom(Boolean(localF && localF.trim().length > 0));
      applyFaviconToDocument(targetF);

      const localO = getLocalOgImage();
      const targetO = localO && localO.trim().length > 0 ? localO : "/og-image.png";
      setOgImageSrc(targetO);
      setIsOgImageCustom(Boolean(localO && localO.trim().length > 0));
      applyOgImageToDocument(targetO);
    };

    window.addEventListener("olive_brand_logo_updated", handleBrandingUpdate);
    window.addEventListener("olive_favicon_updated", handleBrandingUpdate);
    window.addEventListener("olive_og_image_updated", handleBrandingUpdate);
    window.addEventListener("storage", handleBrandingUpdate);
    window.addEventListener("focus", handleBrandingUpdate);

    const unsubBroadcast = subscribeToFirmBroadcast((msg) => {
      if (msg.type === "branding") {
        handleBrandingUpdate();
      }
    });

    return () => {
      unsubLogo();
      unsubFavicon();
      unsubOg();
      unsubBroadcast();
      window.removeEventListener("olive_brand_logo_updated", handleBrandingUpdate);
      window.removeEventListener("olive_favicon_updated", handleBrandingUpdate);
      window.removeEventListener("olive_og_image_updated", handleBrandingUpdate);
      window.removeEventListener("storage", handleBrandingUpdate);
      window.removeEventListener("focus", handleBrandingUpdate);
    };
  }, []);

  // Update actions
  const updateLogoAction = useCallback(async (newLogoDataUrl: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      setLogoSrc(newLogoDataUrl);
      setIsLogoCustom(true);
      await saveBrandLogo(newLogoDataUrl);
      return true;
    } catch (err) {
      console.error("Failed to save logo:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetLogoAction = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      setLogoSrc(defaultLogo);
      setIsLogoCustom(false);
      await resetBrandLogo();
    } catch (err) {
      console.error("Failed to reset logo:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFaviconAction = useCallback(async (newFaviconDataUrl: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      setFaviconSrc(newFaviconDataUrl);
      setIsFaviconCustom(true);
      applyFaviconToDocument(newFaviconDataUrl);
      await saveFavicon(newFaviconDataUrl);
      return true;
    } catch (err) {
      console.error("Failed to save favicon:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetFaviconAction = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      setFaviconSrc("/favicon.png");
      setIsFaviconCustom(false);
      applyFaviconToDocument("/favicon.png");
      await resetFavicon();
    } catch (err) {
      console.error("Failed to reset favicon:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateOgImageAction = useCallback(async (newOgDataUrl: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      setOgImageSrc(newOgDataUrl);
      setIsOgImageCustom(true);
      applyOgImageToDocument(newOgDataUrl);
      await saveOgImage(newOgDataUrl);
      return true;
    } catch (err) {
      console.error("Failed to save OG image:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetOgImageAction = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      setOgImageSrc("/og-image.png");
      setIsOgImageCustom(false);
      applyOgImageToDocument("/og-image.png");
      await resetOgImage();
    } catch (err) {
      console.error("Failed to reset OG image:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    logoSrc,
    isLogoCustom,
    faviconSrc,
    isFaviconCustom,
    ogImageSrc,
    isOgImageCustom,
    isLoading,
    updateLogo: updateLogoAction,
    resetLogo: resetLogoAction,
    updateFavicon: updateFaviconAction,
    resetFavicon: resetFaviconAction,
    updateOgImage: updateOgImageAction,
    resetOgImage: resetOgImageAction,
  };
}
