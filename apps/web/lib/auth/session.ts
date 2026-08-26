const TOKEN_KEY = 'wc_token';
const COOKIE_MAX_AGE = 30 * 60; // 30 min, matches JWT_EXPIRES_IN

export function setSession(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  // Non-httpOnly cookie so Next.js middleware can read it for SSR route protection
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}
