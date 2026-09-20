/**
 * High-performance background asset pre-cacher and memory cache manager.
 * Ensures zero-lag image rendering by warming browser disk and memory caches during idle cycles.
 */

class AssetPreloader {
  private cache = new Set<string>();
  private pendingQueue: string[] = [];
  private isProcessing = false;

  /**
   * Pre-caches a list of image URLs immediately or during browser idle time.
   */
  public preload(urls: (string | undefined | null)[], priority: "high" | "idle" = "idle") {
    const validUrls = urls.filter((url): url is string => Boolean(url && typeof url === "string" && url.trim().length > 0));
    
    if (priority === "high") {
      validUrls.forEach(url => this.fetchImage(url));
    } else {
      this.pendingQueue.push(...validUrls);
      this.scheduleIdleProcessing();
    }
  }

  /**
   * Checks if an image is already warmed in memory
   */
  public isCached(url: string): boolean {
    return this.cache.has(url);
  }

  private scheduleIdleProcessing() {
    if (this.isProcessing || this.pendingQueue.length === 0) return;

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(() => this.processQueue(), { timeout: 2000 });
    } else {
      setTimeout(() => this.processQueue(), 200);
    }
  }

  private processQueue() {
    this.isProcessing = true;
    const batch = this.pendingQueue.splice(0, 4);

    Promise.all(batch.map(url => this.fetchImage(url))).finally(() => {
      this.isProcessing = false;
      if (this.pendingQueue.length > 0) {
        this.scheduleIdleProcessing();
      }
    });
  }

  private fetchImage(url: string): Promise<void> {
    if (this.cache.has(url)) return Promise.resolve();

    return new Promise((resolve) => {
      const img = new Image();
      img.referrerPolicy = "no-referrer";
      img.onload = () => {
        this.cache.add(url);
        resolve();
      };
      img.onerror = () => {
        // Resolve anyway so queue continues
        resolve();
      };
      img.src = url;
    });
  }
}

export const assetPreloader = new AssetPreloader();

/**
 * Common firm static assets to warm immediately upon app initialization
 */
export const CRITICAL_FIRM_ASSETS = [
  "/logo.png",
  "/apple-touch-icon.png",
  "/favicon.png"
];
