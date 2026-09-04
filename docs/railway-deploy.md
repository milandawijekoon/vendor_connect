# Deploying to Railway

This monorepo deploys as **three Railway services** inside one project:

| Service | Source | Build | Notes |
|---|---|---|---|
| `api` | this repo | `apps/api/Dockerfile` (via root `railway.json`) | NestJS + Prisma |
| `web` | this repo | `apps/web/Dockerfile` (via `apps/web/railway.json`) | Next.js standalone |
| `meilisearch` | Docker image `getmeili/meilisearch:v1.9` | — | search index, needs a volume |

Plus a database: either the **Railway MySQL** plugin or an external one (AWS RDS).

Railpack (Railway's autodetector) **cannot** build this repo directly — the root is a
pnpm workspace with no `start` script.

Railway auto-reads only **one** config file, from the service's root directory (`/`).
So:

- The **root `railway.json`** configures the **api** service (no dashboard setting needed).
- The **web** service must have its **Build → Config file path** set to
  `apps/web/railway.json` (see step 1). Without that it re-runs Railpack and fails with
  *"No start command detected"*.

---

## 1. Create the project

1. Railway → **New Project → Deploy from GitHub repo** → pick `milandawijekoon/vendor_connect`.
2. This first service becomes **api**. It picks up the root `railway.json` automatically.
   In its **Settings** just confirm:
   - **Source → Root Directory**: empty (`/`) — the Docker build context must be the repo root.
   - **Build → Config file path**: empty (defaults to root `railway.json`).
3. **+ New → GitHub Repo → same repo** to add the **web** service. In its Settings:
   - **Root Directory**: empty (`/`)
   - **Build → Config file path**: `apps/web/railway.json` ← **required**, or it runs Railpack and fails.
4. **+ New → Docker Image** → `getmeili/meilisearch:v1.9` for the **meilisearch** service.
   - Add a **Volume** mounted at `/meili_data`.
   - It only needs to be reachable on the private network — no public domain.
5. Add the database: **+ New → Database → MySQL** (or skip and use your RDS URL).

---

## 2. Environment variables

Set these per service (Railway → service → **Variables**). `${{ ... }}` are
[reference variables](https://docs.railway.com/guides/variables#reference-variables).

### `api`

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `API_PORT` | `${{ PORT }}` *(or omit — code already falls back to `PORT`)* |
| `DATABASE_URL` | `${{ MySQL.MYSQL_URL }}` (Railway plugin) or your RDS URL |
| `JWT_SECRET` | 32+ random chars |
| `JWT_EXPIRES_IN` | `30m` |
| `MEILISEARCH_HOST` | `http://${{ meilisearch.RAILWAY_PRIVATE_DOMAIN }}:7700` |
| `MEILISEARCH_API_KEY` | same master key you set on the meilisearch service |
| `FRONTEND_URL` | `https://${{ web.RAILWAY_PUBLIC_DOMAIN }}` (CORS allow-list) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | from Cloudinary |
| `GOOGLE_CLIENT_ID` | OAuth client id, or leave unset |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | mail provider |
| `GOLD_PRICE_CRON` / `GOLD_PRICE_TZ` / `GOLD_PRICE_RETAIL_PREMIUM_PCT` / `GOLD_PRICE_REFRESH_ON_BOOT` | optional, have defaults |

### `web`

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `https://${{ api.RAILWAY_PUBLIC_DOMAIN }}/api/v1` |

`NEXT_PUBLIC_API_URL` is baked in at **build** time. The web Dockerfile declares it as
`ARG`, and Railway forwards service variables as build args automatically, so a rebuild
is required whenever it changes. `HOSTNAME`/`PORT` are already set in the Dockerfile.

### `meilisearch`

| Variable | Value |
|---|---|
| `MEILI_MASTER_KEY` | same value as `api`'s `MEILISEARCH_API_KEY` |
| `MEILI_ENV` | `production` |
| `MEILI_NO_ANALYTICS` | `true` |

---

## 3. Networking

- Generate a **public domain** for `api` and `web` (service → Settings → Networking → Generate Domain).
- `meilisearch` and the DB stay private — referenced only via `RAILWAY_PRIVATE_DOMAIN`.

---

## 4. Migrations & seeding

- `apps/api/railway.json` runs `pnpm exec prisma migrate deploy` as a **preDeployCommand**
  on every `api` deploy, so schema changes apply automatically before traffic shifts.
- One-time seed: open a shell on the `api` service and run
  `pnpm --filter @wedding/api run prisma:seed`.

---

## 5. Health checks

- `api`: `/api/v1/health`
- `web`: `/`

Both configured in the respective `railway.json`.

---

## 6. Deploy

Push to `main`. Railway rebuilds any service whose watched paths changed. To force a
rebuild: service → Deployments → **Redeploy**.
