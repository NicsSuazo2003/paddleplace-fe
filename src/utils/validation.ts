// src/utils/validation.ts

/**
 * Suspicious name/email patterns.
 * MUST stay in sync with Services/BookingService.cs
 *   - SuspiciousNamePatterns
 *   - SuspiciousEmailLocalParts
 *   - DisposableEmailDomains
 */
const SUSPICIOUS_NAMES = [
  'test', 'testing', 'sample', 'johndoe', 'john doe',
  'asdf', 'qwerty', 'dummy', 'fake',
];

const SUSPICIOUS_EMAIL_LOCAL_PARTS = [
  'test', 'testing', 'sample', 'johndoe',
  'asdf', 'qwerty', 'dummy', 'fake',
];

const DISPOSABLE_EMAIL_DOMAINS = [
  '@mailinator.com',
  '@tempmail.com',
  '@guerrillamail.com',
  '@10minutemail.com',
  '@throwaway.email',
];

/**
 * Does this name look like an obvious test/placeholder?
 * - exact match (e.g. "test")
 * - any single token matches (e.g. "JohnDoe Test")
 */
export function looksLikeTestName(name: string): boolean {
  const n = name.trim().toLowerCase();
  if (!n) return false;
  if (SUSPICIOUS_NAMES.includes(n)) return true;
  const tokens = n.split(/\s+/);
  return tokens.some((t) => SUSPICIOUS_NAMES.includes(t));
}

/**
 * Does this email look like an obvious test/placeholder?
 * - local-part exact match (e.g. "sample@gmail.com")
 * - disposable domain (e.g. "*@mailinator.com")
 */
export function looksLikeTestEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  if (!e) return false;
  const local = e.split('@')[0];
  if (SUSPICIOUS_EMAIL_LOCAL_PARTS.includes(local)) return true;
  return DISPOSABLE_EMAIL_DOMAINS.some((d) => e.endsWith(d));
}

/**
 * Combined check — used by the booking form's zod schema.
 * Mirrors BookingService.LooksLikeTest.
 */
export function looksLikeTestBooking(name: string, email: string): boolean {
  return looksLikeTestName(name) || looksLikeTestEmail(email);
}