# System Architecture

## 1. Overview

A modular monolith, split into two deployable apps (`web`, `api`) that share types via
a `packages/shared` package. Clean Architecture principles apply within the NestJS backend:
controllers stay thin, business logic lives in services, and Prisma is never accessed
directly from controllers.

```
┌─────────────┐        ┌──────────────┐        ┌───────────┐
│  Next.js     │  REST  │   NestJS     │ Prisma │  MySQL    │
│  (web)       │ ─────▶ │   (api)      │ ─────▶ │           │
└─────────────┘        └──────┬───────┘        └───────────┘
                               │
                               ▼
                        ┌───────────┐
                        │Meilisearch│
                        └───────────┘
                               │
                        ┌───────────┐
                        │ Cloudinary│ (external)
                        └───────────┘
```

## 2. Guiding Principles

- Clean Architecture, SOLID, DRY, separation of concerns
- No business logic in controllers or React components
- No direct Prisma access from controllers — always go through a service/repository
- Configuration via environment variables only — no hardcoded secrets/config
- Explicit error handling everywhere; no leaking internal errors to clients
- Avoid premature microservices, unnecessary abstractions, and over-engineering
- Build a clean modular monolith first, with clear boundaries that allow future scaling

## 3. Project Structure

```
project/
├── apps/
│   ├── web/                    # Next.js app
│   │   ├── app/                 # App Router pages
│   │   ├── components/
│   │   │   ├── ui/               # Generic/reusable UI components
│   │   │   └── features/         # Feature-specific components (vendor card, inquiry form...)
│   │   ├── lib/
│   │   │   ├── api/               # API client / data-fetching layer
│   │   │   └── validation/        # Zod schemas shared with forms
│   │   └── types/
│   │
│   └── api/                    # NestJS app
│       └── src/
│           ├── modules/
│           │   ├── auth/
│           │   ├── users/
│           │   ├── vendors/
│           │   ├── categories/
│           │   ├── inquiries/
│           │   ├── reviews/
│           │   ├── search/
│           │   └── admin/
│           ├── common/
│           │   ├── guards/
│           │   ├── decorators/
│           │   ├── filters/
│           │   ├── interceptors/
│           │   └── exceptions/
│           ├── config/            # env validation & typed config
│           ├── database/          # Prisma module/service
│           └── main.ts
│
├── packages/
│   └── shared/                 # Shared TS types/DTOs between web and api
│
├── docker/
├── docs/
├── .env.example
├── docker-compose.yml
└── README.md
```

## 4. Backend Module Pattern

Each NestJS feature module follows this internal layering:

```
Controller  → thin, HTTP concerns only (routing, status codes, DTO binding)
   ↓
Service     → business/use-case logic, orchestrates repository + other services
   ↓
Repository  → Prisma queries live here only (isolates ORM from business logic)
   ↓
Prisma      → MySQL
```

Example (`vendors` module):

```
vendors/
├── vendors.controller.ts
├── vendors.service.ts
├── vendors.repository.ts
├── dto/
│   ├── create-vendor.dto.ts
│   ├── update-vendor.dto.ts
│   └── vendor-query.dto.ts
├── entities/
│   └── vendor.entity.ts
└── vendors.module.ts
```

## 5. Frontend Data Flow

```
Page (Server Component, SSR)
  ↓
Feature Component
  ↓
lib/api (typed fetch layer)
  ↓
NestJS REST API
```

- Server Components fetch data by default (better SEO, less client JS)
- Client Components used only where interactivity requires it (forms, filters, favorites)
- Use Next.js caching/revalidation (`revalidate`, `fetch` cache options) instead of
  ad-hoc client-side polling

## 6. Cross-Cutting Concerns

- **Validation:** DTOs with `class-validator` on the backend; matching Zod schemas on
  the frontend for form validation (not duplicating business rules, just input shape)
- **Error handling:** Global exception filter → consistent JSON error shape
  `{ statusCode, message, error }`
- **Logging:** Request logging interceptor (method, path, status, duration) — never logs
  secrets or PII
- **Security:** Helmet, CORS allowlist, rate limiting (e.g. `@nestjs/throttler`), input
  validation everywhere, Prisma parameterized queries (SQL-injection safe by default)

## 7. Deployment Shape (MVP)

- `web` → Vercel (or any Node host)
- `api` → containerized (Docker), deployable to Railway/Render/EC2
- `mysql` → managed MySQL (PlanetScale, RDS, or self-hosted via Docker for dev)
- `meilisearch` → managed Meilisearch Cloud or self-hosted container
- `Cloudinary` → external managed service, no infra to run

This keeps the MVP deployable as 3–4 simple services with no orchestration complexity
(no Kubernetes needed at this stage).
