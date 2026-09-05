import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { CsrfGuard } from './csrf.guard';

const FRONTEND = 'https://app.vendorslk.com';

const makeConfig = (nodeEnv: string, frontendUrl = FRONTEND) => ({
  get: (key: string) => (key === 'nodeEnv' ? nodeEnv : key === 'frontendUrl' ? frontendUrl : undefined),
});

const ctx = (req: Record<string, unknown>): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => req }),
  }) as unknown as ExecutionContext;

const request = (method: string, headers: Record<string, string> = {}) => ({
  method,
  url: '/api/v1/vendors/me/images',
  headers,
});

describe('CsrfGuard', () => {
  describe('in production', () => {
    const guard = new CsrfGuard(makeConfig('production') as never);

    it('allows safe methods regardless of origin', () => {
      expect(guard.canActivate(ctx(request('GET', { origin: 'https://evil.example' })))).toBe(true);
    });

    it('allows same-origin state-changing requests from the configured frontend', () => {
      expect(
        guard.canActivate(ctx(request('POST', { origin: FRONTEND, cookie: 'wc_token=abc' }))),
      ).toBe(true);
    });

    it('blocks cross-origin cookie-authenticated mutations', () => {
      expect(() =>
        guard.canActivate(ctx(request('POST', { origin: 'https://evil.example', cookie: 'wc_token=abc' }))),
      ).toThrow(ForbiddenException);
    });

    it('blocks a forged form post that only carries a foreign Referer', () => {
      expect(() =>
        guard.canActivate(
          ctx(request('POST', { referer: 'https://evil.example/attack.html', cookie: 'wc_token=abc' })),
        ),
      ).toThrow(ForbiddenException);
    });

    it('allows Bearer-token clients (not a CSRF vector)', () => {
      expect(
        guard.canActivate(ctx(request('POST', { authorization: 'Bearer some.jwt.token', origin: 'https://evil.example' }))),
      ).toBe(true);
    });

    it('allows non-browser clients that send no origin, referer or cookie', () => {
      expect(guard.canActivate(ctx(request('POST')))).toBe(true);
    });

    it('blocks a cookie-bearing request with no origin or referer (fails closed)', () => {
      expect(() => guard.canActivate(ctx(request('POST', { cookie: 'wc_token=abc' })))).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('outside production', () => {
    const guard = new CsrfGuard(makeConfig('development', '') as never);

    it('does not enforce the origin check', () => {
      expect(
        guard.canActivate(ctx(request('POST', { origin: 'http://localhost:3000', cookie: 'wc_token=abc' }))),
      ).toBe(true);
    });
  });
});
