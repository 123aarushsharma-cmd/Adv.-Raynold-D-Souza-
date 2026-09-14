import { useState, useEffect, useRef } from "react";
import { assetPreloader } from "../lib/assetPreloader";

interface UseLazyLoadOptions {
  rootMargin?: string;
  threshold?: number | number[];
  preloadUrl?: string | null;
  freezeOnceVisible?: boolean;
}

/**
 * Custom React hook utilizing IntersectionObserver to trigger lazy-loading
 * when an element approaches the viewport.
 */
export function useLazyLoad({
  rootMargin = "250px 0px", // Pre-loads 250px before entering viewport for zero perceived lag
  threshold = 0.01,
  preloadUrl = null,
  freezeOnceVisible = true,
}: UseLazyLoadOptions = {}) {
  const [isVisible, setIsVisible] = useState(() => {
    // If the image is already cached in memory, mark visible immediately
    if (preloadUrl && assetPreloader.isCached(preloadUrl)) {
      return true;
    }
    return false;
  });

  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (isVisible && freezeOnceVisible) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (preloadUrl) {
              assetPreloader.preload([preloadUrl], "high");
            }
            if (freezeOnceVisible) {
              observer.unobserve(element);
            }
          } else if (!freezeOnceVisible) {
            setIsVisible(false);
          }
        });
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, preloadUrl, freezeOnceVisible, isVisible]);

  return { elementRef, isVisible };
}
