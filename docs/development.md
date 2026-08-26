# Local Development Guide

*(This describes the setup that will exist once Phase 2/Foundation scaffolding is built —
kept here now so the environment contract is defined before code is written.)*

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or pnpm

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/wedding_db"

# Auth
JWT_SECRET="change-me"
JWT_EXPIRES_IN="30m"

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Search
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY=""

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
```

All required environment variables are validated at API startup (the app refuses to
boot with missing/invalid config rather than running in a broken state).

## First-Time Setup

```bash
docker compose up -d mysql meilisearch     # start infra
cd apps/api
npx prisma migrate dev                      # run migrations
npx prisma db seed                          # seed categories + demo data
cd ../..
docker compose up                           # start web + api
```

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
npx prisma migrate dev --name <description>   # create + apply a new migration (dev)
npx prisma migrate deploy                      # apply pending migrations (CI/prod)
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
