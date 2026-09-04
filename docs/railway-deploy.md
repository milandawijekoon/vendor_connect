# Deploying to Railway

The entire Railway project is described as **Infrastructure as Code** in
[`.railway/railway.ts`](../.railway/railway.ts) and applied with the Railway CLI
(`railway config plan` / `apply`). That file is the single source of truth — there
are no `railway.json` / `railway.toml` files, and none should be added back
(Config-as-Code loses support for existing services on 2026-12-01).

## Architecture

One Railway **project** `vendor-connect` with two environments:

| Environment | Git branch |
|---|---|
| `production` | `main` |
| `staging` | `develop` |

Each environment contains the same four resources:

| Resource | Type | Build | Networking | Notes |
|---|---|---|---|---|
| `MySQL` | Railway MySQL database | plugin | private | Prisma datasource (`provider = "mysql"`) |
| `meilisearch` | Docker image `getmeili/meilisearch:v1.9` | — | **private only** | volume mounted at `/meili_data` (1 GB) |
| `api` | service (this repo) | `apps/api/Dockerfile`, context = repo root | **public domain** | NestJS + Prisma; healthcheck `/api/v1/health`; runs `prisma migrate deploy` as a pre-deploy step |
| `web` | service (this repo) | `apps/web/Dockerfile` | **public domain** | Next.js standalone; healthcheck `/` |

- The gold-price job runs **in-process** inside `api` (`@nestjs/schedule`) — there
  is no separate worker service. No Redis / S3 / queue.
- `api` reads Railway's injected `PORT` (see `apps/api/src/config/configuration.ts`).
- `meilisearch` and `MySQL` have no public domain; `api` reaches Meilisearch at
  `http://meilisearch.railway.internal:7700` (resolved from
  `${{ meilisearch.RAILWAY_PRIVATE_DOMAIN }}`).
- `web`'s `NEXT_PUBLIC_API_URL` is inlined at **build** time. The Dockerfile
  declares `ARG NEXT_PUBLIC_API_URL`; Railway forwards service variables as build
  args, so changing it requires a `web` rebuild.

## First-time setup

```bash
railway login
railway init                 # create the "vendor-connect" project (once)
```

Then, for each environment (`production` first, then `staging`):

```bash
railway environment production   # or: staging
railway config plan              # review the diff — expect the 4 resources as creates
railway config apply             # create/update everything in the linked environment
```

## Secrets — set once per environment (Railway dashboard → service → Variables)

Everything wrapped in `preserve()` in `.railway/railway.ts` is left untouched by
`apply` and must be set manually in each environment:

| Service | Variable | Value |
|---|---|---|
| `meilisearch` | `MEILI_MASTER_KEY` | a long random key |
| `api` | `MEILISEARCH_API_KEY` | **same value** as `meilisearch` `MEILI_MASTER_KEY` |
| `api` | `JWT_SECRET` | 32+ random chars — `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `api` | `GOOGLE_CLIENT_ID` | OAuth client id (leave blank to disable Google sign-in) |
| `api` | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | from Cloudinary |
| `api` | `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | from the mail provider (optional; `SMTP_PORT` / `SMTP_FROM` have defaults in the IaC file) |

All other `api` / `web` variables (`DATABASE_URL`, `MEILISEARCH_HOST`,
`FRONTEND_URL`, `NEXT_PUBLIC_API_URL`, `NODE_ENV`, `JWT_EXPIRES_IN`,
`GOLD_PRICE_*`) are managed by `.railway/railway.ts` — do not set them by hand.

## Networking

After the first `apply`, generate a public domain for `api` and `web` only
(service → Settings → Networking → Generate Domain). Leave `meilisearch` and
`MySQL` private.

## Migrations & seeding

- `prisma migrate deploy` runs automatically as the `api` pre-deploy command on
  every deploy.
- One-time seed: open a shell on the `api` service and run
  `pnpm --filter @wedding/api run prisma:seed`.
- Rebuild the search index: `pnpm --filter @wedding/api run reindex` from an
  `api` shell.

## Deploy

Deploys are driven by [`.github/workflows/railway-deploy.yml`](../.github/workflows/railway-deploy.yml),
a pipeline separate from the EC2 one in `deploy.yml`:

- Push to `main` → production, push to `develop` → staging. Only the services
  whose paths changed (same globs as the IaC `watchPatterns`) are deployed.
- `workflow_dispatch` deploys both `api` and `web` to a chosen environment.
- It runs `ci.yml` first, then `railway up --service <svc> --ci` using a
  per-environment `RAILWAY_TOKEN` (GitHub Environments `production` / `staging`).

Because this workflow drives deploys, turn **off** "Deploy on push" for the
`api` and `web` services in the Railway dashboard, or every push deploys twice.
To force a deploy: re-run the workflow, or use the Railway dashboard
(service → Deployments → **Redeploy**).

## Changing infrastructure

Edit `.railway/railway.ts`, then `railway config plan` / `railway config apply`
against each environment. Never edit build/deploy settings or IaC-managed
variables directly in the dashboard — `apply` will revert them.
