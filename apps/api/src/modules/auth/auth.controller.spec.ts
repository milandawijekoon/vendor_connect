/* eslint-disable @typescript-eslint/unbound-method -- we inspect handler metadata, never invoke the methods */
import 'reflect-metadata';
import { AuthController } from './auth.controller';

/**
 * `@Throttle({ global: { limit, ttl } })` records its options as reflection
 * metadata on the route handler under `THROTTLER:LIMIT<name>` / `THROTTLER:TTL<name>`.
 * These assertions prove the strict per-IP budget is wired onto the
 * credential-testing routes (H-1) and that the polling `me` route is left alone.
 */
const LIMIT_KEY = 'THROTTLER:LIMITglobal';
const TTL_KEY = 'THROTTLER:TTLglobal';

describe('AuthController rate limiting', () => {
  it.each(['register', 'login', 'googleLogin'] as const)(
    'throttles %s to 5 requests / 60s per IP',
    (handler) => {
      const fn = AuthController.prototype[handler];
      expect(Reflect.getMetadata(LIMIT_KEY, fn)).toBe(5);
      expect(Reflect.getMetadata(TTL_KEY, fn)).toBe(60_000);
    },
  );

  it('does not apply the strict throttle to the authenticated `me` route', () => {
    expect(Reflect.getMetadata(LIMIT_KEY, AuthController.prototype.me)).toBeUndefined();
  });
});
