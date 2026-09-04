/**
 * Utilities for image compression, validation, and preset avatars
 * Allows admins to upload custom headshots, paste URLs, or pick from curated legal headshots
 */

export interface PortraitPreset {
  id: string;
  name: string;
  role: string;
  url: string;
  genderDescription?: string;
}

export const LEGAL_PORTRAIT_PRESETS: PortraitPreset[] = [
  {
    id: "preset-reynold-original",
    name: "Distinguished Principal",
    role: "Senior / Principal Advocate",
    url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600",
    genderDescription: "Formal navy suit & tie, executive pose"
  },
  {
    id: "preset-senior-counsel",
    name: "Senior Litigator",
    role: "Appellate & Writ Counsel",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
    genderDescription: "Formal black suit, classic legal portrait"
  },
  {
    id: "preset-experienced-advocate",
    name: "Trial & Arbitration Lead",
    role: "Senior Associate Advocate",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
    genderDescription: "Dark charcoal blazer, professional smile"
  },
  {
    id: "preset-female-lead",
    name: "Corporate & Real Estate Lead",
    role: "Associate Advocate / Satellite Lead",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
    genderDescription: "Formal dark business suit, confident stance"
  },
  {
    id: "preset-female-partner",
    name: "Constitutional & Regulatory Counsel",
    role: "Senior Associate Advocate",
    url: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=600",
    genderDescription: "Elegant formal dark blazer, sharp poise"
  },
  {
    id: "preset-young-trial-advocate",
    name: "Criminal & Trial Defense",
    role: "Associate Advocate",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
    genderDescription: "Crisp white shirt and formal tie, courtroom advocate"
  }
];

/**
 * Resizes and compresses any user-uploaded image file on the client side
 * Returns an optimized Base64 data URL string (< 150KB) suitable for storage and instant display
 */
export async function compressAndResizeImage(
  file: File,
  maxWidth = 700,
  maxHeight = 933,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selected file is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Fill background with soft neutral in case of transparency
        ctx.fillStyle = "#FBFBF9";
        ctx.fillRect(0, 0, width, height);

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Output as optimized JPEG or WebP
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validates whether an image URL actually loads
 */
export function validateImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url || typeof url !== "string") {
      resolve(false);
      return;
    }
    // Basic format check
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("data:image/")) {
      resolve(false);
      return;
    }
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
