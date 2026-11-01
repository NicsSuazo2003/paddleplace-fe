// src/services/api.ts
import { APP_CONFIG } from '@/utils/constants';

export class ApiError extends Error {
  status: number;
  body?: unknown;
  retryAfterSeconds?: number;
  /** Best-effort user-facing message. Falls back to `message`. */
  userMessage: string;

  constructor(
    message: string,
    status: number,
    body?: unknown,
    userMessage?: string,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.userMessage = userMessage ?? message;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const BASE_URL = APP_CONFIG.apiUrl;
const CLIENT_SUBDOMAIN = import.meta.env.VITE_CLIENT_SUBDOMAIN ?? 'paddleplace';

/**
 * Paths whose 401 should trigger a login redirect.
 * Any other 401 is surfaced as an inline error.
 *
 * Note: 409 is NOT in this list. A 409 from an admin endpoint means
 * "valid JWT but no client_id claim" — typically a stale token from
 * before Phase 3. Treating it as a login redirect caused an infinite
 * loop (admin → 409 → login → admin → 409 → …). Show it inline instead.
 */
const AUTH_REDIRECT_PATTERNS: RegExp[] = [
  /^\/api\/admin(\/|$)/,
  /^\/api\/auth\/profile(\/|$)/,
  /^\/api\/auth\/change-password(\/|$)/,
];

function isAuthRedirectPath(fullPath: string): boolean {
  return AUTH_REDIRECT_PATTERNS.some((re) => re.test(fullPath));
}

function extractUserMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const anyBody = body as Record<string, unknown>;
    if (typeof anyBody.message === 'string' && anyBody.message.trim() !== '') {
      return anyBody.message;
    }
    if (typeof anyBody.title === 'string' && anyBody.title.trim() !== '') {
      return anyBody.title;
    }
  }
  if (typeof body === 'string' && body.trim() !== '') {
    return body;
  }
  return fallback;
}

function parseRetryAfter(headers: Headers): number | undefined {
  const raw = headers.get('Retry-After');
  if (!raw) return undefined;
  const asNum = Number(raw);
  if (Number.isFinite(asNum) && asNum >= 0) return Math.floor(asNum);
  const asDate = Date.parse(raw);
  if (!Number.isNaN(asDate)) {
    const seconds = Math.max(0, Math.floor((asDate - Date.now()) / 1000));
    return seconds;
  }
  return undefined;
}

/**
 * After a 401 on an admin path, redirect the user to /login.
 * Keeps a `next` param so they land back where they were.
 */
function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  const current = window.location.pathname + window.location.search;
  if (current.startsWith('/login')) return;              // already there
  const next = encodeURIComponent(current || '/admin');
  window.location.href = `/login?next=${next}`;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const fullPath = path.startsWith('/api') ? path : `/api${path}`;
  const url = `${BASE_URL}${fullPath}`;

  const token = localStorage.getItem('admin_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Client-Subdomain': CLIENT_SUBDOMAIN,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        try {
          body = await res.text();
        } catch {
          body = undefined;
        }
      }

      // 429 — include Retry-After for callers that want to display it
      if (res.status === 429) {
        const retryAfter = parseRetryAfter(res.headers);
        const msg = extractUserMessage(
          body,
          'Too many requests. Please slow down and try again shortly.'
        );
        throw new ApiError(msg, 429, body, msg, retryAfter);
      }

      // 401 on an auth-required path → redirect to /login.
      // 409 is NOT redirected — it surfaces as an inline error so a stale
      // token (missing client_id claim) doesn't cause an infinite loop.
      if (res.status === 401 && isAuthRedirectPath(fullPath)) {
        localStorage.removeItem('admin_token');
        redirectToLogin();
      }

      const fallback =
        res.status === 401
          ? 'Your session has expired. Please sign in again.'
          : res.status === 409
          ? 'Client identification required. Please sign in again to refresh your session.'
          : res.status === 404
          ? 'Not found.'
          : `Request failed (${res.status}).`;
      const msg = extractUserMessage(body, fallback);
      throw new ApiError(msg, res.status, body, msg);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(
        'Request timed out — the server may be waking up, please try again',
        0,
        undefined,
        'Request timed out. The server may be waking up — please try again.'
      );
    }
    throw err;
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}