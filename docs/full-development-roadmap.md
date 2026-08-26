# Full Development Roadmap (Post-MVP)

This document tracks everything intentionally deferred out of the MVP (see
`mvp-development-plan.md` §3), sequenced by expected value and dependency order.
Nothing here should be built until the MVP's core loop (discovery → inquiry → response)
is validated with real vendors and couples.

## Phase 2 — Monetization & Trust Infrastructure

**Goal: prove the business model, not just the product loop.**

- **Payments (PayHere integration)**
  - `Booking` entity with payment status state machine (pending → deposit_paid →
    confirmed → completed / cancelled)
  - Deposit collection flow between couple and vendor
  - Webhook handling for payment confirmation, idempotency handling
- **Vendor subscription tiers**
  - `VendorSubscription` entity (free / featured / premium)
  - Featured placement in search results and category pages
  - Billing cycle + PayHere recurring payment or manual invoicing initially
- **In-app messaging**
  - `Conversation` / `Message` entities, replacing/supplementing WhatsApp handoff
  - Real-time via WebSockets (NestJS Gateway) or polling to start
- **Sinhala & Tamil i18n**
  - `next-intl` or similar on the frontend
  - Locale-aware vendor content fields if vendors want localized descriptions

## Phase 3 — Engagement & Retention

- Wedding planning tools: budget tracker, checklist, guest list (drives repeat visits
  even outside active vendor search)
- Saved/favorited vendors + comparison view
- Real wedding stories/inspiration content (blog/gallery — strong SEO driver, proven
  in WedMeGood's model)
- Push/email lifecycle notifications (new matching vendors, inquiry follow-ups)

## Phase 4 — Marketplace Depth

- Vendor availability calendar (avoid double-booking conflicts)
- Verified reviews (tied to confirmed bookings, not just any account)
- Vendor analytics dashboard (profile views, inquiry conversion rate)
- Geo-search with precise vendor coordinates (map view of vendors)

## Phase 5 — Scale & Platform Maturity

- Multi-currency support if expanding beyond Sri Lanka / targeting broader diaspora
- Mobile app (React Native — reuses `packages/shared` types and the existing REST API)
- Admin analytics/reporting (marketplace health: supply/demand by category & city)
- A/B testing infrastructure for conversion optimization
- Consider read-replica or caching layer (Redis) only if traffic actually justifies it —
  not before

## Non-Negotiable Ongoing Work (every phase)

- Security review with each new feature (especially payments — PCI-adjacent concerns
  even when PayHere hosts the actual card data)
- Test coverage maintained on critical flows as they're added
- Documentation kept current in `docs/`

## Explicit Non-Goals (for now)

- Building a custom payment processor (use PayHere, don't reinvent this)
- Microservices split — stay a modular monolith until there's a concrete scaling reason
  (team size, deployment independence need, or a specific bottleneck) to justify the
  operational cost
