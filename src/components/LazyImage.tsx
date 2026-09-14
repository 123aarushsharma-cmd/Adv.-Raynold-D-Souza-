import React, { useState, useEffect } from "react";
import { useLazyLoad } from "../hooks/useLazyLoad";
import { assetPreloader } from "../lib/assetPreloader";

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  placeholderClassName?: string;
  rootMargin?: string;
  aspectRatio?: string;
  onLoaded?: () => void;
  priority?: boolean;
}

/**
 * High-performance IntersectionObserver-based lazy image component
 * with background pre-caching and zero-lag progressive reveal.
 */
export default function LazyImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  placeholderClassName = "",
  rootMargin = "250px 0px", // Loads 250px ahead of viewport for zero perceived lag
  aspectRatio,
  onLoaded,
  priority = false,
  ...restProps
}: LazyImageProps) {
  const isAlreadyCached = Boolean(src && assetPreloader.isCached(src));
  const [isLoaded, setIsLoaded] = useState(isAlreadyCached || priority);
  const [hasError, setHasError] = useState(false);

  const { elementRef, isVisible } = useLazyLoad({
    rootMargin,
    preloadUrl: src,
    freezeOnceVisible: true,
  });

  const shouldLoad = priority || isVisible || isAlreadyCached;

  useEffect(() => {
    if (shouldLoad && src) {
      // Warm the preloader
      assetPreloader.preload([src], priority ? "high" : "idle");
    }
  }, [shouldLoad, src, priority]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (src) {
      assetPreloader.preload([src], "high");
    }
    onLoaded?.();
  };

  const handleImageError = () => {
    setHasError(true);
  };

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Sleek skeleton placeholder while loading */}
      {!isLoaded && !hasError && (
        <div
          className={`absolute inset-0 bg-forest/5 animate-pulse flex items-center justify-center ${placeholderClassName}`}
          aria-hidden="true"
        >
          <div className="w-6 h-6 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
        </div>
      )}

      {/* Actual image rendered with IntersectionObserver activation */}
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          referrerPolicy="no-referrer"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`w-full h-full object-cover transition-opacity duration-500 gpu-layer ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...restProps}
        />
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-forest/10 flex items-center justify-center p-2 text-center text-xs text-forest/60">
          <span>Failed to load image</span>
        </div>
      )}
    </div>
  );
}
