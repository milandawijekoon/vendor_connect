# Local Development Guide

*(This describes the setup that will exist once Phase 2/Foundation scaffolding is built —
kept here now so the environment contract is defined before code is written.)*

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or pnpm

## Environment Variables

There is **one** env file for the whole monorepo, at the repo root. Copy it and
fill in values:

```bash
cp .env.example .env
```

`.env.example` is the authoritative list of every variable and its default.
Nothing lives in a per-app `.env` — the pieces wire up to the root file like so:

| Consumer | How it reads the root `.env` |
|---|---|
| `docker compose` (dev + prod) | `env_file: .env` in the compose files |
| API (`nest` / scripts on the host) | `ConfigModule` loads `../../.env` |
| Prisma CLI (`prisma:*` npm scripts) | wrapped with `dotenv -e ../../.env` |
| Dev servers via `pnpm dev` (root) | wrapped with `dotenv -e .env` |

`JWT_SECRET` must be a real high-entropy value — generate one with
`openssl rand -base64 48`. All required variables are validated at API startup;
the app refuses to boot with missing/invalid config rather than running broken.

## First-Time Setup

```bash
docker compose up -d mysql meilisearch                 # start infra
pnpm --filter @wedding/api run prisma:migrate:dev       # run migrations
pnpm --filter @wedding/api run prisma:seed              # seed categories + demo data
docker compose up                                       # start web + api
```

> Run Prisma through the `pnpm` scripts (not bare `npx prisma …`) so the root
> `.env` is loaded.

- Web: http://localhost:3000
- API: http://localhost:4000/api/v1
- API docs (Swagger): http://localhost:4000/api/docs
- Meilisearch dashboard: http://localhost:7700

## Running Tests

```bash
cd apps/api
npm run test           # unit tests
npm run test:e2e       # integration/E2E tests
```

## Database Migrations

```bash
pnpm --filter @wedding/api run prisma:migrate:dev -- --name <description>   # create + apply (dev)
pnpm --filter @wedding/api run prisma:migrate:deploy                        # apply pending (CI/prod)
```

`prisma db push` is never used outside of quick local experiments — all real schema
changes go through a tracked migration file.

## Search Reindexing

```bash
npm run reindex        # rebuild the Meilisearch "vendors" index from MySQL
```

## Common Issues

| Symptom | Likely Cause |
|---|---|
| API fails to start | Missing/invalid env var — check startup validation error message |
| Search returns stale results | Reindex job hasn't run, or index sync event failed — check API logs |
| Image upload fails | Missing/invalid Cloudinary credentials |
