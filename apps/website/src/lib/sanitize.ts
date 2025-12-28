/**
 * Sanitizes text input to prevent XSS and injection attacks
 *
 * - Removes HTML angle brackets
 * - Removes javascript: protocol
 * - Removes event handlers (on*)
 * - Trims whitespace
 * - Enforces maximum length
 */
export function sanitizeText(input: string | null | undefined, maxLength = 5000): string {
  if (!input) return '';

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove JS protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=, onload=, etc.
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizes an email to ensure it's safe to store
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return '';

  return email
    .toLowerCase()
    .trim()
    .slice(0, 255); // Standard email max length
}

/**
 * Sanitizes a name field
 */
export function sanitizeName(name: string | null | undefined): string {
  if (!name) return '';

  return name
    .replace(/[<>]/g, '')
    .replace(/\d{4,}/g, '') // Remove long number sequences
    .trim()
    .slice(0, 100);
}

/**
 * Sanitizes an entire object's string fields
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeText(sanitized[key] as string) as any;
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = (sanitized[key] as any[]).map(item =>
        typeof item === 'string' ? sanitizeText(item) : item
      ) as any;
    }
  }

  return sanitized;
}
