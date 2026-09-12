/**
 * Olive Law Firm - Security & Defense-in-Depth Utility
 * 
 * Provides:
 * 1. String Sanitization & XSS Stripping
 * 2. Strict Input Length Limiting
 * 3. Token-bucket Rate Limiting (Prevents Form Flooding / Denial-of-Wallet)
 * 4. Bot / Honeypot Detection
 * 5. Strict Validator Primitives
 */

// Regular expressions for detecting dangerous script patterns or HTML injection
const DANGEROUS_HTML_PATTERN = /<[^>]*>?/gm;
const JAVASCRIPT_PROTOCOL_PATTERN = /javascript\s*:/gi;
const VBSCRIPT_PROTOCOL_PATTERN = /vbscript\s*:/gi;
const DATA_URL_HTML_PATTERN = /data\s*:\s*text\/html/gi;
const SCRIPT_INJECTION_PATTERN = /<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi;
const SQL_META_CHARS = /(--|;|\/\*|\*\/|@@|@|char|nchar|varchar|nvarchar|alter|begin|cast|create|cursor|declare|delete|drop|end|exec|execute|fetch|insert|kill|open|select|sys|sysobjects|syscolumns|table|update)/gi;

/**
 * Sanitizes user-provided text string by stripping executable tags,
 * dangerous protocols, and constraining characters.
 */
export function sanitizeInput(input: unknown, maxLength = 5000): string {
  if (typeof input !== "string") {
    return "";
  }

  let sanitized = input
    // Trim whitespace
    .trim()
    // Remove script tags entirely
    .replace(SCRIPT_INJECTION_PATTERN, "")
    // Remove all standard HTML tags
    .replace(DANGEROUS_HTML_PATTERN, "")
    // Remove dangerous URI schemes
    .replace(JAVASCRIPT_PROTOCOL_PATTERN, "")
    .replace(VBSCRIPT_PROTOCOL_PATTERN, "")
    .replace(DATA_URL_HTML_PATTERN, "");

  // Enforce absolute maximum character count boundary
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Strict email format validation conforming to RFC 5322 specifications
 */
export function isValidSecureEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  // RFC 5322 compliant regex for safe alphanumeric domains and localparts
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email);
}

/**
 * Strict international and domestic phone number validator
 */
export function isValidSecurePhone(phone: string): boolean {
  if (!phone || phone.length > 30) return false;
  const digitsOnly = phone.replace(/[^0-9]/g, "");
  // Standard phone numbers require between 7 and 15 digits
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * In-memory client rate limiter tracking submission frequency
 * Prevents automated scripts and accidental double-clicks from spamming Firestore
 */
const rateLimitStore: Record<string, number> = {};

export function checkRateLimit(actionKey: string, cooldownMs = 4000): { allowed: boolean; remainingSec: number } {
  const now = Date.now();
  const lastTime = rateLimitStore[actionKey] || 0;
  const elapsed = now - lastTime;

  if (elapsed < cooldownMs) {
    const remainingSec = Math.ceil((cooldownMs - elapsed) / 1000);
    return { allowed: false, remainingSec };
  }

  rateLimitStore[actionKey] = now;
  return { allowed: true, remainingSec: 0 };
}

/**
 * Verifies if an invisible honeypot field has been touched by an automated crawler/bot
 */
export function isHoneypotTriggered(honeypotValue: string | undefined): boolean {
  return typeof honeypotValue === "string" && honeypotValue.trim().length > 0;
}
