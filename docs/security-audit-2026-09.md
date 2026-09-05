# Security & Code-Quality Audit — vendor_connect (VendorsLK)

Full function-by-function review of the NestJS API, Next.js web app, shared packages, Prisma schema, and deployment config. No code was modified.

**Scope reviewed:** `apps/api` (all 11 modules, guards, filters, interceptors, config, Prisma layer, seed, scripts), `apps/web` (all pages, components, lib), `packages/gold-price`, `packages/shared`, Dockerfiles, `docker-compose*.yml`, `.github/workflows`, `.railway/railway.ts`, `docker/Caddyfile`.

---

## CRITICAL

### C-1 — Placeholder `JWT_SECRET` passes env validation → full auth bypass / ADMIN forgery

- **File:** apps/api/src/config/env.validation.ts:9, apps/api/.env.example:2, .env.example:5
- **Component:** `validationSchema` / `AuthService.buildAuthResponse` / `JwtStrategy`
- **Problem:** The JWT secret is only validated as `Joi.string().min(32)`. The shipped placeholder `"change-me-in-production-min-32-chars"` is 35 characters and **satisfies the schema**. `railway.ts` sets `JWT_SECRET: preserve()` (a value entered by hand in the dashboard) and nothing rejects the placeholder or a low-entropy value. The Docker/EC2 path reads it from an unmanaged host `.env`.
- **Why dangerous:** Tokens are `HS256` signed with this secret and carry `{ sub, email, role }`. `RolesGuard` trusts `req.user.role`. Anyone who knows/guesses the secret forges a token with `role: "ADMIN"` and gets unrestricted access to `/admin/*` (approve/reject/suspend every vendor, read all owner emails, platform stats) and every vendor/customer action.
- **Exploitation:** `jwt.sign({sub:'x',email:'x@x',role:'ADMIN'}, 'change-me-in-production-min-32-chars')` → send as `Authorization: Bearer …` or `wc_token` cookie → `PATCH /api/v1/admin/vendors/:id/status`.
- **Fix:** Fail closed on known-placeholder values and enforce entropy: reject secrets matching the example string; require ≥ 48 chars in `NODE_ENV=production`; generate per-environment secrets with a CSPRNG and store them only in the platform secret store. Add a boot assertion in `configuration.ts`. Consider rotating to asymmetric (RS256) so the signing key never sits on request-handling nodes.
- **Confidence:** High (validation gap is definite; whether a given deploy actually left it as placeholder is unverified).

### C-2 — No CSRF protection on cookie-authenticated, state-changing endpoints

- **File:** apps/api/src/modules/auth/auth.controller.ts:42 (`getCookieOptions`), apps/api/src/modules/auth/strategies/jwt.strategy.ts:16 (`cookieExtractor`), apps/api/src/main.ts:19
- **Component:** `AuthController.getCookieOptions` + `JwtStrategy.cookieExtractor` + global `enableCors`
- **Problem:** Auth is accepted from the `wc_token` cookie on **every** endpoint, including mutations. In production the cookie is set `sameSite: 'none'; secure: true`, which **removes the browser's default CSRF barrier**. There is no CSRF token, no `Origin`/`Referer` allow-list check, and no double-submit cookie. `cookie-parser` is loaded but no `csurf`-style protection.
- **Why dangerous:** A logged-in user (especially an **admin**) who visits a malicious page can be made to issue authenticated requests. CORS only blocks the attacker from *reading* the response and blocks *preflighted* JSON writes to a foreign origin — but requests that don't trigger preflight still execute:
  - `POST /api/v1/vendors/me/images` accepts `multipart/form-data` (a CORS "simple" request → no preflight → fires cross-site with cookie).
  - `POST /api/v1/auth/logout` (forced logout).
  - Any endpoint reachable with a `text/plain` body if a body parser accepts it.
- **Exploitation:** Attacker page auto-submits a hidden `multipart/form-data` form or `fetch(..., {credentials:'include', body: FormData})` to upload junk to the victim vendor's portfolio; a login-CSRF variant logs the victim into an attacker account.
- **Fix:** Prefer `SameSite=Lax` (use a shared parent domain for web+api instead of cross-site `None`). Add an `Origin`/`Referer` allow-list guard for all non-GET requests. Add a synchronized CSRF token (double-submit cookie readable by JS + `X-CSRF-Token` header) for browser clients, or require `Authorization: Bearer` (not cookie) for mutations.
- **Confidence:** High for the design flaw; Medium on which specific routes are exploitable end-to-end without preflight (image upload is the clearest).

---

## HIGH

### H-1 — No brute-force / credential-stuffing protection on authentication

- **File:** apps/api/src/app.module.ts:34, apps/api/src/modules/auth/auth.controller.ts:77
- **Problem:** Only a single global throttler (`ttl 60s, limit 100`). `POST /auth/login`, `/auth/register`, `/auth/google` get no stricter budget, no per-account lockout, no exponential backoff, no CAPTCHA. 100 password attempts/minute/IP, trivially parallelised across IPs.
- **Why dangerous:** Seeded/known accounts (`admin@vendorslk.com`, `vendor1@vendorslk.com`) plus weak policy (`8 chars, 1 letter + 1 digit`) make online guessing feasible. `login` `LoginDto` allows `@MinLength(1)` passwords, so weak legacy creds pass.
- **Fix:** Dedicated `@Throttle` on auth routes (e.g. 5/min/IP + 10/hour/account), account lockout with jitter, generic error timing, optional CAPTCHA after N failures. Raise password policy (length ≥ 12, breach-list check).
- **Confidence:** High.

### H-2 — Unauthenticated inquiry endpoint enables vendor email-bombing and spam persistence

- **File:** apps/api/src/modules/inquiries/inquiries.controller.ts:42, apps/api/src/modules/inquiries/inquiries.service.ts:34, apps/api/src/modules/mail/mail.service.ts:44
- **Problem:** `POST /vendors/:slug/inquiries` is `@Public()`, no CAPTCHA, no per-vendor/per-IP rate limit beyond the shared 100/min. Each call writes an `Inquiry` row and fires an email to the vendor with attacker-controlled `name`/`message`/`phone`/`email`.
- **Why dangerous:** An attacker sends thousands of inquiries → floods the vendor's inbox (email-bomb), pollutes the lead DB, and can spoof `email`/`phone` (no verification) to make a competitor look like the sender. Attacker-controlled `eventDate` is passed to `new Date(...)` and `toLocaleDateString()` — malformed values render "Invalid Date" in the email (cosmetic).
- **Mitigation already present:** `escapeHtml()` and header `\r\n` stripping prevent HTML/JS injection and SMTP header injection in the notification — good.
- **Fix:** Rate-limit per IP and per vendor; add CAPTCHA/hCaptcha for anonymous submissions; verify submitter email (magic link) before persisting/notifying; dedupe identical messages.
- **Confidence:** High.

### H-3 — Frontend ships with no security headers (CSP, X-Frame-Options, HSTS, Referrer-Policy)

- **File:** apps/web/next.config.mjs:1, docker/Caddyfile:1
- **Problem:** No `headers()` in Next config and the Caddyfile adds none. `helmet()` protects the API responses only, not the HTML app.
- **Why dangerous:** No `frame-ancestors`/`X-Frame-Options` → clickjacking of the dashboard (e.g. tricking an admin into clicking "Approve"/"Suspend"). No CSP → any future DOM-XSS is unmitigated. No HSTS → SSL-strip.
- **Fix:** Add a strict `Content-Security-Policy` (allow `accounts.google.com`/`res.cloudinary.com` as needed), `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff` via `next.config.mjs` `headers()` and/or Caddy.
- **Confidence:** High.

### H-4 — Production reverse proxy terminates plain HTTP; `secure` cookies incompatible

- **File:** docker/Caddyfile:1, docker-compose.prod.yml:52
- **Problem:** Caddy is configured `{ auto_https off }` and listens on `:80` only, with no site address/domain and no TLS block, while compose publishes `443:443` (unused). In this path the app is served over cleartext HTTP. Meanwhile production cookies are `secure: true` (`auth.controller.ts:46`), so the browser will **refuse to send `wc_token` over HTTP** → either auth silently breaks or, if something downgrades, the JWT travels in cleartext.
- **Why dangerous:** Session token / credentials exposed to network attackers; or a broken deploy that gets "fixed" by dropping `secure`.
- **Fix:** If a TLS-terminating load balancer sits in front, document it and set Caddy to trust `X-Forwarded-Proto`; otherwise give Caddy a real domain and let it manage certs. Ensure `secure`/`SameSite` cookie assumptions match the actual edge.
- **Confidence:** Medium (an external ALB may exist but is not in the repo).

---

## MEDIUM

### M-1 — Review integrity: any CUSTOMER can review any approved vendor, unlimited Sybil accounts

- **File:** apps/api/src/modules/reviews/reviews.service.ts:29, apps/api/src/modules/auth/auth.service.ts:31
- **Problem:** `ReviewsService.create` only checks role = CUSTOMER and "one review per (vendor,user)". There is no inquiry/booking relationship required. Registration is open, self-service, `role` selectable, and there is **no email verification** (`register` returns a JWT immediately — see controller doc "no email verification at MVP").
- **Why dangerous:** Review inflation for your own listing and review-bombing a competitor at scale (script: register N customers → 1×5★ or 1×1★ each). `avgRating` drives search ranking (`orderBy: avgRating desc`) and category counts, so this directly manipulates marketplace visibility.
- **Fix:** Require a prior `Inquiry` (or a confirmed booking) between the user and vendor before allowing a review; verify email on registration; add anomaly detection / manual moderation for rating spikes; consider rate-limiting review creation per account.
- **Confidence:** High (behaviour), Medium (business impact depends on go-live moderation).

### M-2 — Open registration + no verification → mass account creation

- **File:** apps/api/src/modules/auth/auth.controller.ts:58, apps/api/src/modules/auth/dto/register.dto.ts:1
- **Problem:** No email confirmation, no rate limit dedicated to `register`, `phone` accepted as free string with no format/length cap. Feeds M-1 and H-2.
- **Fix:** Email verification before the account is usable for reviews/inquiries; throttle registration; validate `phone` (`@IsMobilePhone`/regex, max length).
- **Confidence:** High.

### M-3 — Weak Google `email_verified` check

- **File:** apps/api/src/modules/auth/auth.service.ts:80
- **Problem:** `if (payload.email_verified === false)` — passes when the claim is `undefined`/absent. Auto-links a Google identity to an existing local account by email (`auth.service.ts:92-98`).
- **Why dangerous:** If a token ever lacks the claim, an unverified address could link to / create an account and, via the email-match branch, take over a pre-existing local account.
- **Fix:** Require `payload.email_verified === true` explicitly; only link to an existing account after an additional confirmation step.
- **Confidence:** Medium (Google normally sends the claim; defensive gap).

### M-4 — Public vendor profile exposes owner PII (name, phone, full address)

- **File:** apps/api/src/modules/vendors/vendors.service.ts:95 (`toDto` → `owner: { name, phone }`), apps/api/src/modules/vendors/vendors.repository.ts:9
- **Problem:** `GET /vendors/:slug` (unauthenticated) returns `owner.name`, `owner.phone`, and `address` for every approved vendor.
- **Why dangerous:** Bulk scraping of personal phone numbers (the pagination cap is 48/page but the endpoint is unauthenticated and enumerable by slug). May be intended for a marketplace, but should be a deliberate choice.
- **Fix:** Gate phone/exact address behind an authenticated action (e.g. after an inquiry), or show a masked contact; add anti-scraping rate limiting.
- **Confidence:** High (exposure), Medium (whether it's "by design").

### M-5 — Non-atomic portfolio reorder

- **File:** apps/api/src/modules/vendors/vendors.service.ts:224
- **Problem:** `await Promise.all(dto.items.map(item => repo.updateImageOrder(...)))` — N independent updates. A mid-batch failure leaves images with inconsistent/duplicate `order` values.
- **Fix:** Wrap in `prisma.$transaction`.
- **Confidence:** High.

### M-6 — Slug-collision race → unhandled 500

- **File:** apps/api/src/modules/vendors/vendors.service.ts:295 (`resolveUniqueSlug`)
- **Problem:** Check-then-create with no locking. Two concurrent creates with the same business name resolve the same slug; the second `create` violates the `slug` unique constraint and surfaces as a generic `500 Internal server error` via `AllExceptionsFilter`.
- **Fix:** Catch Prisma `P2002` and retry with a suffix, or append a short random token unconditionally.
- **Confidence:** Medium.

### M-7 — Error envelope deviates from documented contract

- **File:** apps/api/src/common/filters/http-exception.filter.ts:40
- **Problem:** `error: HttpStatus[statusCode] ?? 'Error'` yields `"BAD_REQUEST"`, `"NOT_FOUND"`, etc., not the `"Bad Request"` shape shown in Swagger examples and consumed by the frontend's `ApiClientError`. Also `timestamp`/`path` included but `error` label inconsistent.
- **Fix:** Map to the standard reason phrase (or pass through NestJS's own `error` field from `exception.getResponse()`), and add a test asserting the shape.
- **Confidence:** High.

### M-8 — `enableImplicitConversion: true` globally

- **File:** apps/api/src/main.ts:31
- **Problem:** Implicit type coercion in the global `ValidationPipe` can mask malformed input and has historically produced surprising coercions (arrays, booleans, `NaN` from `@Type(() => Number)` combined with implicit conversion). Query DTOs already use explicit `@Type(() => Number)`, so implicit conversion is redundant and adds risk.
- **Fix:** Turn it off and keep explicit `@Type`/`@Transform` where needed.
- **Confidence:** Medium.

### M-9 — Committed dev secrets & usable example secret

- **File:** docker-compose.yml:6 (`MYSQL_ROOT_PASSWORD: rootsecret`, `MYSQL_PASSWORD: secret`), .env.example:5 / apps/api/.env.example:2 (`JWT_SECRET="change-me-in-production-min-32-chars"`), local untracked apps/api/.env contains a **real Cloudinary API secret** and a real Google client ID.
- **Problem:** Hard-coded DB credentials in a committed compose file; the example JWT secret is a valid-length string a careless deploy can keep (ties to C-1). The developer's local `.env` holds a live `CLOUDINARY_API_SECRET` — it is `.gitignore`d and not in git history (verified), but it is a real credential sitting in plaintext dev files.
- **Fix:** Rotate the Cloudinary API secret now. Make `.env.example` secrets obviously invalid (`"REPLACE_ME"` — too short to pass validation, forcing a real value). Use compose `env_file`/secrets for MySQL creds even in dev.
- **Confidence:** High.

### M-10 — `LIKE` fallback search allows wildcard abuse & full-table scans

- **File:** apps/api/src/modules/vendors/vendors.service.ts:264
- **Problem:** When Meilisearch is down, `q` is used raw in Prisma `contains` (`LIKE %q%`) across `businessName`, `city`, `description` (a `TEXT` column), `category.name`. No SQL injection (parameterised), but user-supplied `%`/`_` become wildcards and `%a%` over `description TEXT` with no full-text index is a table scan — a cheap DoS vector, and the fallback is the *default* until a reindex runs.
- **Fix:** Escape `%`/`_` in the term; cap `q` length; add a MySQL `FULLTEXT` index for the fallback path or return a "search temporarily unavailable" state instead of scanning.
- **Confidence:** Medium.

### M-11 — `FRONTEND_URL` not validated; CORS silently misconfigures

- **File:** apps/api/src/main.ts:20, apps/api/src/config/env.validation.ts:1
- **Problem:** `origin: nodeEnv === 'production' ? [process.env['FRONTEND_URL'] ?? ''] : true`. `FRONTEND_URL` is absent from the Joi schema. A typo yields `['']` (all credentialed cross-origin blocked — fails closed, but breaks the app confusingly) and it's read straight from `process.env` bypassing `ConfigService`.
- **Fix:** Add `FRONTEND_URL: Joi.string().uri().required()` (when `NODE_ENV=production`), read via `ConfigService`, and log the resolved allow-list at boot.
- **Confidence:** High.

### M-12 — Global `JwtAuthGuard` + `@Public()` drops authenticated identity on public routes that want it

- **File:** apps/api/src/common/guards/jwt-auth.guard.ts:17, apps/api/src/modules/inquiries/inquiries.controller.ts:52
- **Problem:** `create()` inquiry expects `@CurrentUser() user: AuthUser | undefined` to link a logged-in submitter, but `@Public()` short-circuits the guard before Passport runs, so `req.user` is always `undefined` and inquiries are never associated with the account. Not a vulnerability, but a silent correctness bug in an auth-adjacent path.
- **Fix:** Use an "optional auth" guard that still populates `req.user` when a valid token is present.
- **Confidence:** High.

---

## LOW

- **L-1 Logout doesn't invalidate the token.** auth.controller.ts:112 only clears the cookie; a copied JWT stays valid for up to 30 min. Acceptable for short TTL, but there's no revocation list.
- **L-2 No `issuer`/`audience` on app JWTs.** jwt.strategy.ts:28 / `JwtModule.register({})`. Add `issuer`/`audience` claims + verification.
- **L-3 `RolesGuard` returns `false` (→403) when `user` missing instead of 401.** roles.guard.ts:20. Minor semantics.
- **L-4 Cloudinary delete / DB delete not transactional.** vendors.service.ts:203 — Cloudinary object can be destroyed then DB delete fails (or vice-versa) → orphan.
- **L-5 `logout` is `@Public()` and unauthenticated** — anyone can call it; harmless but should be a no-op guard.
- **L-6 `parseDurationMs` fallback silently returns 30 min** for unrecognised `JWT_EXPIRES_IN` while the JWT itself uses the raw string — cookie `maxAge` and token expiry can diverge. auth.constants.ts:8.
- **L-7 `LoggingInterceptor` logs every request URL at `log` level** logging.interceptor.ts:18 — fine now (no PII in query strings) but a future `?email=` route would leak into logs. Add a redaction allow-list.
- **L-8 `todayIso()` uses UTC for an LBMA London date staleness check** gold-price.service.ts:18 — comment acknowledges it; can cause a redundant fetch near midnight.
- **L-9 `Math.random()`-based helpers in seed** are fine for seed data but `pravatar`/`picsum` remote hosts are whitelisted in prod `next.config.mjs`.
- **L-10 `google-auth-library` `OAuth2Client` constructed with no clientId** auth.service.ts:23; audience passed per-call (correct), but a single shared client with no timeout config — add request timeout.
- **L-11 `helmet()` defaults only.** Consider explicit `crossOriginResourcePolicy`, and disable `x-powered-by` on the Next side.

---

## 1. Top 10 issues to fix first

1. **C-1** Reject placeholder/low-entropy `JWT_SECRET`; enforce strong per-env secrets (auth-bypass / ADMIN forgery).
2. **C-2** Add CSRF defense (Origin allow-list guard for non-GET + `SameSite=Lax` or CSRF token); stop accepting the cookie for mutations without it.
3. **H-1** Dedicated rate-limiting + lockout on `/auth/login`, `/auth/register`, `/auth/google`; stronger password policy.
4. **H-2** Rate-limit + CAPTCHA + submitter-email verification on the public inquiry endpoint.
5. **H-3** Security headers on the web app (CSP, X-Frame-Options, HSTS, nosniff, Referrer-Policy).
6. **H-4** Fix the prod TLS story (Caddy domain/cert or trusted `X-Forwarded-Proto`); reconcile `secure` cookie assumptions.
7. **M-1 / M-2** Require a real customer↔vendor interaction before reviews; verify email on registration (kills review-bombing / Sybil).
8. **M-9** Rotate the Cloudinary API secret; make example secrets non-usable.
9. **M-11** Validate `FRONTEND_URL` (and all runtime env) through Joi + `ConfigService`.
10. **M-5 / M-6** Wrap reorder in a transaction; handle slug-collision `P2002` instead of 500.

## 2. Complete unused / dead-code list

| Item | Location | Notes |
|---|---|---|
| `PrismaService.withSoftDelete()` | prisma.service.ts:15 | Never called anywhere; repos filter `deletedAt: null` manually. Remove or adopt project-wide. |
| `VendorsRepository.softDelete()` | vendors.repository.ts:49 | No vendor-deletion endpoint exists; unreferenced. |
| `SearchService.removeVendor()` | search.service.ts:96 | Never invoked (suspend/reject re-index with `status` instead). Dead unless you wire soft-delete → de-index. |
| `CategoriesService.findManyByIds()` / `CategoriesRepository.findManyByIds()` | categories.service.ts:12, categories.repository.ts:33 | Only referenced by its own `.spec`. No production caller. |
| `CategoriesRepository.findById()` | categories.repository.ts:29 | Unreferenced. |
| `UserEntity` | users/entities/user.entity.ts | Never imported; DTOs come from `@vendorconnect/shared`. |
| `vendorsApi.reorderImages()` | apps/web/lib/api/vendors.ts:48 | API method defined but no component calls it (`PortfolioUploader` has no reorder UI). Either build the UI or drop the method + the `PATCH /vendors/me/images/reorder` route + `ReorderImagesDto`. |
| `CloudinaryService.deleteImage` early-return when unconfigured | cloudinary.service.ts:52 | Silently succeeds — not dead, but hides misconfig. |
| `apps/web/tsconfig.tsbuildinfo`, `apps/web/.next/` | repo tree | Build artifacts present under review root; ensure ignored/cleaned (they are `.gitignore`d). |
| `docker-compose.override.yml` | root | Only re-sets `NODE_ENV=development` which the base compose already implies; near-redundant. |
| `packages/gold-price` `PURITY.k21` / `k14` | constants.ts:8 | Exported, never consumed (`rates.ts` uses only k22/k18). Harmless. |

## 3. Complete unnecessary-comment list

Most comments explain *why* and are useful. Items worth trimming:

- prisma.service.ts:14 — "Convenience helper used in repositories to apply soft-delete filter" is **misleading**: no repository uses it.
- inquiries.service.ts:52 — `// Fire-and-forget email` restates the obvious `void` on the next line.
- prisma/seed.ts:14-17 — long paragraph about why `picsum.photos` replaced `loremflickr` is historical trivia; shorten to one line.
- apps/web/app/vendors/[slug]/page.tsx:151,174 — repeated `{/* eslint-disable-next-line @next/next/no-img-element */}`; suppressing the lint rule 3× signals the component should use `next/image`.
- docker-compose.override.yml:1-2 — comment promises "bind-mounts, secrets" that aren't there.
- configuration.ts:20-22 — the `CLOUDINARY_FOLDER` example comment duplicates `.env.example`.
- No commented-out code blocks or stray `TODO/FIXME/HACK` markers were found — good.

## 4. Dependency / supply-chain concerns

- **Cannot verify installed versions** — `pnpm-lock.yaml` present but `pnpm audit` was not run. Add `pnpm audit --prod` and `pnpm outdated` to CI. `ci.yml` currently does lint/typecheck/build/test only — no dependency audit, no SAST/CodeQL. Add one.
- **Framework majors are a release behind:** NestJS `^10` (11 is current), Next.js `14`, `multer ^2.2` (pin exact, keep patched), `nodemailer ^9`, `meilisearch ^0.41`. Schedule an upgrade pass; NestJS 11 / Next 15 carry security fixes.
- **`bcrypt` (native)** — fine (cost 12), but native build in Alpine is fragile; consider `argon2id`.
- **`cron` pinned exactly (`3.2.1`)** — good; do the same for `multer`, `google-auth-library`.
- **Runtime external calls** in `packages/gold-price` to `prices.lbma.org.uk` and `open.er-api.com` (no API key, `AbortSignal.timeout(10s)`). No retry/circuit-breaker beyond the service's `inFlight` de-dupe, and a hijacked `open.er-api.com` response directly sets stored `usdToLkr`. Add sanity bounds (e.g. reject `usdToLkr` outside 100–1000).
- **Two Railway CLIs** — `railway` (`^3.11`) as root devDependency plus `@railway/cli` installed globally in CI. Consolidate.
- **No SBOM / provenance** on the Docker images. Consider `docker buildx` with attestations.

## 5. Architecture concerns

**Strengths:** clean modular NestJS (controller → service → repository), DTO validation at the edge with `whitelist + forbidNonWhitelisted`, Prisma everywhere (no raw SQL → no SQLi), httpOnly cookie + "no token in JS" (strong XSS-exfil posture), global guards, Swagger disabled in prod, stack traces not leaked to clients, sensible search fallback, unit specs present for every service.

**Issues:**

1. **Security boundary between web and API is cookie-cross-site (`SameSite=None`).** Root of C-2. Co-locating both under one registrable domain (`app.vendorslk.com` / `api.vendorslk.com`) allows `SameSite=Lax` and removes a whole vulnerability class.
2. **Two divergent deployment paths** — EC2 + `docker-compose.prod.yml` + `deploy.yml` (SSH, `git reset --hard`, Caddy `:80`) and Railway IaC (`railway.ts` + `railway-deploy.yml`). They disagree on TLS, on `MEILISEARCH_HOST`, on where secrets live. Pick one; delete the other.
3. **No server-side auth on the web tier.** `DashboardShell` gates purely client-side; there's no `middleware.ts`. Data is safe (API enforces) but there's no defense-in-depth. Add Next middleware that checks the cookie and redirects.
4. **`InquiriesController`, `VendorsController`, and `ReviewsController` all mount on `@Controller('vendors')`** with mixed `@Public()`/`@Roles()` per method — the auth posture of `/vendors/*` is hard to audit at a glance.
5. **`avgRating` is denormalised onto `VendorProfile`** and recomputed only in the review-create transaction. No path recomputes on review edit/delete; `SearchService.indexVendor` can push a stale rating. Add reconciliation or compute on read.
6. **Fire-and-forget side effects** (`void this.mail…`, `void this.indexVendor…`) swallow failures with only a log → silent MySQL/Meili divergence until the next full reindex. An outbox/queue would make this reliable.
7. **`ScheduleModule` + in-process `CronJob`** for gold price means every API replica runs the fetch. Not harmful (`upsert` by date, `inFlight` de-dupe) but wasteful and racy. Move to a single scheduled worker or a leader-lock.
8. **No structured logging / request IDs / audit log.** Admin approve/reject/suspend actions are not audited — add an append-only `AdminAction` log with actor, target, before/after.
9. **`packages/shared` enums duplicated against Prisma enums** (`Role`, `VendorStatus`, `InquiryStatus`) — kept in sync by hand with `as` casts. One source of truth (generate from Prisma, or assert equality in a test).

## 6. Overall security score: 4 / 10

Query layer, authorization checks (IDOR guards on images/inquiries/reviews), password hashing, input validation, and XSS posture are solid. But a cookie-auth design with `SameSite=None` and **no CSRF protection**, a JWT-secret validation gap that permits a publicly-known signing key, no brute-force controls, an abusable unauthenticated write endpoint, and missing transport/security headers are serious for an internet-facing app.

## 7. Overall code-quality score: 7 / 10

Consistent structure, TypeScript strict, good naming, per-service tests, helpful "why" comments, no SQLi, no obvious N+1. Loses points for dead code, non-atomic multi-write operations, fire-and-forget consistency gaps, duplicated enum/DTO truth, two conflicting deploy pipelines, and the error-envelope inconsistency.

## 8. Recommended remediation plan

**Sprint 1 — stop the bleeding (Critical/High)**

- Enforce strong `JWT_SECRET` (reject placeholder; boot assertion) — C-1.
- Add an `Origin`/`Referer` allow-list guard for all non-GET requests; move browser mutations to `Authorization: Bearer` or add a CSRF token; switch to `SameSite=Lax` by unifying domains — C-2 / arch #1.
- Per-route throttling + lockout on all `/auth/*`; raise password policy — H-1.
- Rate-limit + CAPTCHA + email verification on inquiries and registration — H-2 / M-2.
- Add web security headers (CSP/XFO/HSTS/nosniff) — H-3.
- Decide on one deploy path; fix TLS; validate all env via Joi+`ConfigService` — H-4 / M-11.
- Rotate the Cloudinary secret; scrub example secrets — M-9.

**Sprint 2 — integrity & correctness (Medium)**

- Require customer↔vendor interaction before reviews; email-verify accounts — M-1.
- Explicit `email_verified === true` for Google; confirmation step before account linking — M-3.
- Transaction for reorder; handle `P2002` on slug — M-5 / M-6.
- Standardise the error envelope + add a contract test — M-7.
- Escape `LIKE` metacharacters, cap `q`, add FULLTEXT index — M-10.
- Turn off `enableImplicitConversion` — M-8.
- Gate/mask owner phone & address — M-4.
- Add `pnpm audit` + a SAST step (CodeQL) to `ci.yml`; upgrade NestJS 11 / Next 15.

**Sprint 3 — hardening & hygiene (Low/Cleanup/Arch)**

- JWT `issuer`/`audience`; token revocation on logout (short deny-list or rotating refresh tokens).
- Admin audit log (arch #8); move gold-price cron to a single worker (arch #7).
- Outbox pattern for mail + search indexing (arch #6); reconcile `avgRating` job (arch #5).
- Next `middleware.ts` for defense-in-depth route gating (arch #3).
- Delete all dead code in §2; trim comments in §3; single source of truth for enums (arch #9).
- Replace `<img>` with `next/image` on the vendor profile page.
