/** Name of the HttpOnly cookie carrying the JWT access token. */
export const ACCESS_TOKEN_COOKIE = 'wc_token';

/**
 * Parses a `ms`-style duration string (`"30m"`, `"12h"`, `"7d"`, `"45s"`) into
 * milliseconds. Falls back to 30 minutes if the format isn't recognized.
 */
export function parseDurationMs(value: string): number {
  const match = /^(\d+)\s*(ms|s|m|h|d)?$/.exec(value.trim());
  if (!match) return 30 * 60 * 1000;

  const amount = Number(match[1]);
  const unit = match[2] ?? 'ms';
  const unitMs: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * unitMs[unit];
}
