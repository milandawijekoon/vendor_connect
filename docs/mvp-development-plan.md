# MVP Development Plan

## 1. Goal

Prove that couples will submit inquiries to vendors discovered through the platform,
and that vendors will maintain profiles and respond to leads — before building
payments, chat, or subscription billing.

## 2. MVP Scope (in)

- Vendor directory with categories, city, price range, portfolio images
- Vendor public profile pages (SSR, SEO-optimized, shareable URLs)
- Search & filter (Meilisearch: category, city, price, keyword, rating sort)
- Couple inquiry/lead form (guest-allowed) → stored + emailed to vendor +
  WhatsApp deep-link handoff
- Vendor self-registration + onboarding + dashboard (edit profile, manage
  portfolio images, view/respond-to-status leads)
- Basic reviews & ratings (one review per couple per vendor)
- Admin panel: approve/reject/suspend vendors
- Auth (JWT) for couples, vendors, admin

## 3. Explicitly Out of Scope (documented, not forgotten)

| Feature | Why deferred | Target phase |
|---|---|---|
| In-app payments/booking deposits | Needs PayHere integration + payment state machine; want inquiry-volume validation first | Phase 2 |
| In-app messaging/chat | WhatsApp handoff is a proven lower-effort substitute in this market | Phase 2/3 |
| Vendor paid subscription tiers | Manual/offline agreements at MVP; automate once pricing model is validated | Phase 2 |
| Sinhala/Tamil i18n | English-first for MVP audience (urban + diaspora); high-value near-term addition | Phase 2 |
| Wedding planning tools (checklist, budget, guest list) | Nice-to-have engagement features, not core to the marketplace loop | Phase 3 |

## 4. Assumptions

1. Three roles at MVP: `COUPLE`, `VENDOR`, `ADMIN` — no separate "planner" role yet.
2. A "booking" = confirmed inquiry, not a paid transaction, at this stage.
3. Vendors can belong to multiple categories.
4. Single currency (LKR), no multi-currency support needed yet.
5. Vendor listings are manually approved by an admin before appearing in search —
   prioritizes trust/quality over listing volume at launch.

## 5. Core User Journeys (what must work end-to-end)

1. **Vendor onboarding**: register → fill profile → upload portfolio → submit for
   approval → admin approves → profile is live and searchable
2. **Couple discovery**: browse/search/filter vendors → view profile → submit inquiry
3. **Lead handling**: vendor receives inquiry (email + dashboard) → updates status
4. **Trust signal**: couple leaves a review after using a vendor

## 6. Phased Build Order

### Phase A — Foundation
- Monorepo scaffold (`apps/web`, `apps/api`, `packages/shared`)
- Docker Compose (`web`, `api`, `mysql`, `meilisearch`)
- Prisma schema + first migration
- Env validation, ESLint/Prettier, TypeScript strict config

### Phase B — Auth
- Register/login/me endpoints
- JWT guard, roles guard, ownership checks
- Frontend auth pages + session handling

### Phase C — Vendor Core
- Categories CRUD (seeded, admin-editable later)
- Vendor profile CRUD + Cloudinary portfolio upload
- Vendor public profile page (SSR)
- Vendor dashboard (edit profile/images)

### Phase D — Discovery
- Vendor listing page with filters (MySQL-only search first)
- Meilisearch integration + index sync
- Swap listing page to Meilisearch-backed search with MySQL fallback

### Phase E — Inquiries & Reviews
- Inquiry submission form (guest-allowed) + email notification
- Vendor lead inbox (status updates)
- Review submission + display, denormalized rating recalculation

### Phase F — Admin
- Admin auth/role
- Vendor approval queue (approve/reject/suspend)
- Triggers search index add/remove on status change

### Phase G — Hardening
- Security pass (rate limiting, Helmet, CORS allowlist, input validation audit)
- Test coverage on critical flows (unit + integration + E2E)
- Performance pass (indexes, N+1 check, pagination everywhere)
- Documentation finalization, Docker Compose polish

## 7. Definition of "MVP Done"

All four core user journeys (Section 5) work end-to-end in a deployed environment,
with vendor approval, search, inquiries, and reviews functioning without manual
database intervention.
