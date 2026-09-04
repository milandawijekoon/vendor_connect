/**
 * Railway Infrastructure as Code — the whole project in one file.
 * Docs: https://docs.railway.com/infrastructure-as-code
 *
 * Config as Code (railway.json) is deprecated for existing services from
 * 2026-12-01; this file is the replacement. The railway.json files are kept
 * for now as a fallback and can be deleted once `railway apply` succeeds.
 *
 * Apply with the Railway CLI (v4+):
 *   npx --yes @railway/cli login
 *   npx --yes @railway/cli link          # select this project + environment
 *   npx --yes @railway/cli config pull   # import the CURRENT live services so
 *                                        # this file matches, then reconcile
 *   npx --yes @railway/cli plan          # preview the diff
 *   npx --yes @railway/cli apply         # apply after confirmation
 *
 * NOTE: the exact option name for a non-root Dockerfile in service() is not in
 * the public docs yet. Run `config pull` first and copy whatever key Railway
 * emits for the existing `vendor-connect` service (it currently builds
 * apps/api/Dockerfile via railway.json). Adjust the `build`/`dockerfile`
 * fields below to match before applying.
 */
import { defineRailway, github, image, mysql, project, service, volume, preserve } from "railway/iac";

export default defineRailway((ctx) => {
  const REPO = "milandawijekoon/vendor_connect";

  // ── Database ──────────────────────────────────────────────────────────────
  const db = mysql("MySQL");

  // ── Search ───────────────────────────────────────────────────────────────
  const meiliData = volume("meili-data", { sizeMB: 1024 });

  const meilisearch = service("meilisearch", {
    source: image("getmeili/meilisearch:v1.9"),
    volumeMounts: { "/meili_data": meiliData },
    env: {
      MEILI_ENV: "production",
      MEILI_NO_ANALYTICS: "true",
      MEILI_MASTER_KEY: preserve(), // set once in the dashboard, kept across applies
    },
  });

  // ── API (NestJS) ─────────────────────────────────────────────────────────
  // Build context must stay at the repo root (Dockerfile copies pnpm-workspace
  // + packages/*), so do NOT set rootDirectory. dockerfilePath -> apps/api/Dockerfile.
  const api = service("vendor-connect", {
    source: github(REPO, { branch: "main" }),
    // TODO: confirm the Dockerfile-path key from `railway config pull`.
    build: { dockerfilePath: "apps/api/Dockerfile" } as never,
    preDeploy: "pnpm exec prisma migrate deploy",
    healthcheck: "/api/v1/health",
    healthcheckTimeout: 120,
    env: {
      NODE_ENV: "production",
      API_PORT: "${{ PORT }}",
      DATABASE_URL: db.env.MYSQL_URL,
      JWT_SECRET: preserve(),
      JWT_EXPIRES_IN: "30m",
      FRONTEND_URL: `https://${"${{ web.RAILWAY_PUBLIC_DOMAIN }}"}`,
      MEILISEARCH_HOST: `http://${meilisearch.env.RAILWAY_PRIVATE_DOMAIN}:7700`,
      MEILISEARCH_API_KEY: preserve(),
      CLOUDINARY_CLOUD_NAME: preserve(),
      CLOUDINARY_API_KEY: preserve(),
      CLOUDINARY_API_SECRET: preserve(),
      GOOGLE_CLIENT_ID: preserve(),
      SMTP_HOST: preserve(),
      SMTP_PORT: "587",
      SMTP_USER: preserve(),
      SMTP_PASS: preserve(),
      SMTP_FROM: "noreply@vendorconnect.lk",
      GOLD_PRICE_CRON: "15 16 * * 1-5",
      GOLD_PRICE_TZ: "Europe/London",
      GOLD_PRICE_RETAIL_PREMIUM_PCT: "0",
      GOLD_PRICE_REFRESH_ON_BOOT: "true",
    },
  });

  // ── Web (Next.js standalone) ─────────────────────────────────────────────
  const web = service("web", {
    source: github(REPO, { branch: "main" }),
    // TODO: confirm the Dockerfile-path key from `railway config pull`.
    build: { dockerfilePath: "apps/web/Dockerfile" } as never,
    healthcheck: "/",
    healthcheckTimeout: 120,
    env: {
      NODE_ENV: "production",
      // NEXT_PUBLIC_* is inlined at build time (forwarded as a Docker build arg).
      NEXT_PUBLIC_API_URL: `https://${api.env.RAILWAY_PUBLIC_DOMAIN}/api/v1`,
    },
  });

  return project("vendor-connect", {
    resources: [db, meiliData, meilisearch, api, web],
  });
});
