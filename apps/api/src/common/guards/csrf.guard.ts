import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * The `wc_token` cookie authenticates every route, and in production it is issued
 * `SameSite=None`, so the browser offers no CSRF protection of its own. This guard
 * verifies the `Origin` (falling back to `Referer`) of state-changing requests and
 * rejects any that originate from a foreign site.
 *
 * Requests that are not a browser-driven CSRF vector are left untouched:
 *  - safe methods (GET / HEAD / OPTIONS);
 *  - requests carrying an `Authorization: Bearer` header — a cross-site page cannot
 *    attach the victim's token to that header;
 *  - non-browser clients that send no `Origin`, `Referer` or `Cookie` at all.
 *
 * Only enforced in production, matching where the cross-site `SameSite=None` cookie
 * (and the `enableCors` allow-list) are active.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);
  private readonly enforce: boolean;
  private readonly allowedOrigins: Set<string>;

  constructor(config: ConfigService) {
    this.enforce = config.get<string>('nodeEnv') === 'production';
    const origin = this.toOrigin(config.get<string>('frontendUrl') ?? '');
    this.allowedOrigins = new Set(origin ? [origin] : []);
  }

  canActivate(context: ExecutionContext): boolean {
    if (!this.enforce) return true;

    const req = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(req.method.toUpperCase())) return true;

    const authHeader = req.headers.authorization ?? '';
    if (authHeader.startsWith('Bearer ')) return true;

    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
    const referer = typeof req.headers.referer === 'string' ? req.headers.referer : undefined;
    const hasCookie = Boolean(req.headers.cookie);

    // Pure API client (curl, mobile app, server-to-server): no CSRF surface.
    if (!origin && !referer && !hasCookie) return true;

    const sourceOrigin = origin ?? this.toOrigin(referer);
    if (sourceOrigin && this.allowedOrigins.has(sourceOrigin)) return true;

    this.logger.warn(
      `Blocked cross-origin ${req.method} ${req.url} (origin=${origin ?? referer ?? 'none'})`,
    );
    throw new ForbiddenException('Cross-origin request blocked');
  }

  private toOrigin(value: string | undefined): string | undefined {
    if (!value) return undefined;
    try {
      return new URL(value).origin;
    } catch {
      return undefined;
    }
  }
}
