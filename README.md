# VendorsLK (working name) — Event Vendor Marketplace

A two-sided marketplace connecting customers with vendors for **any occasion** — weddings,
corporate events, birthdays, parties and more (photographers, decorators, venues, caterers,
makeup artists, sound & lighting, event planners, etc.) in Sri Lanka. Customers discover
and inquire; vendors manage profiles and respond to leads.

## Documentation Index

| Doc | Purpose |
|---|---|
| [docs/architecture.md](docs/architecture.md) | System architecture, tech stack, project structure, module boundaries |
| [docs/database.md](docs/database.md) | Entity relationships, MySQL schema, Prisma models |
| [docs/api.md](docs/api.md) | REST API endpoint reference |
| [docs/authentication.md](docs/authentication.md) | Auth/authorization strategy |
| [docs/search.md](docs/search.md) | Meilisearch architecture & sync strategy |
| [docs/mvp-development-plan.md](docs/mvp-development-plan.md) | MVP scope, assumptions, phased build plan |
| [docs/full-development-roadmap.md](docs/full-development-roadmap.md) | Post-MVP roadmap (payments, chat, i18n, subscriptions) |
| [docs/development.md](docs/development.md) | Local dev setup, Docker, environment variables |

## Tech Stack

- **Frontend:** Next.js (App Router) + React + TypeScript
- **Backend:** NestJS + TypeScript
- **Database:** MySQL + Prisma ORM
- **Search:** Meilisearch (MySQL remains source of truth)
- **Auth:** JWT + bcrypt
- **File Storage:** Cloudinary
- **Containerization:** Docker / Docker Compose
- **Testing:** Jest (unit, integration, E2E)

## Quick Start (once code is scaffolded)

```bash
git clone <repo>
cd wedding
cp .env.example .env       # fill in secrets
docker compose up
```

See [docs/development.md](docs/development.md) for full setup instructions.

## Project Status

**Phase A (Foundation) — complete.**
Monorepo scaffold, Docker Compose, Prisma schema, env validation, ESLint/Prettier, TypeScript strict mode.

Next: **Phase B (Auth)** — register/login/me endpoints, JWT guard, role guard, frontend auth pages.
