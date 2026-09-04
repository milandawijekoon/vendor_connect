/**
 * Railway Infrastructure as Code — the whole vendor_connect project in one file.
 * Docs: https://docs.railway.com/infrastructure-as-code
 *
 * This is the single source of truth for the Railway project. There are no
 * railway.json / railway.toml files; do not re-add them.
 *
 * Requires the `railway` package at the workspace root and Railway CLI >= 5.42.1.
 *   railway login
 *   railway link                 # select project + environment (production, then staging)
 *   railway config plan          # preview the diff
 *   railway config apply         # create/update every resource in the linked environment
 *
 * Secrets wrapped in preserve() are set once in the Railway dashboard (per
 * environment) and kept untouched across applies — see docs/railway-deploy.md.
 */
import {
  defineRailway,
  github,
  image,
  mysql,
  preserve,
  project,
  service,
  volume,
} from "railway/iac";

const REPO = "milandawijekoon/vendor_connect";

export default defineRailway((ctx) => {
  // production builds from main; every other environment (staging) builds from develop.
  const branch = ctx.environment === "production" ? "main" : "develop";

  // ── Data ──────────────────────────────────────────────────────────────────
  const db = mysql("MySQL");

  const meiliData = volume("meili-data", { sizeMB: 1024 });

  const meilisearch = service("meilisearch", {
    source: image("getmeili/meilisearch:v1.9"),
    volumeMounts: { "/meili_data": meiliData },
    // Private-only: no public domain. api reaches it over the private network.
    env: {
      MEILI_ENV: "production",
      MEILI_NO_ANALYTICS: "true",
      MEILI_MASTER_KEY: preserve(), // must equal api's MEILISEARCH_API_KEY
    },
  });

  // ── API — NestJS 10 + Prisma 5 (MySQL) ───────────────────────────────────
  // The Docker build context is the repo root (the Dockerfile copies
  // pnpm-workspace.yaml + packages/*), so no rootDirectory. The Dockerfile's own
  // `production` stage is the final image.
  const api = service("api", {
    source: github(REPO, { branch }),
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "apps/api/Dockerfile",
      watchPatterns: [
        "apps/api/**",
        "packages/**",
        "pnpm-lock.yaml",
        "pnpm-workspace.yaml",
      ],
    },
    deploy: {
      preDeployCommand: ["pnpm exec prisma migrate deploy"], // image WORKDIR is /app/apps/api
      healthcheckPath: "/api/v1/health",
      healthcheckTimeout: 120,
      restartPolicyType: "ON_FAILURE",
      restartPolicyMaxRetries: 3,
    },
    env: {
      NODE_ENV: "production",
      // Railway injects PORT; configuration.ts already reads it.
      DATABASE_URL: db.env.MYSQL_URL,
      // Composed value → must use Railway's ${{ }} reference syntax; a typed ref
      // interpolated into a JS template string stringifies to "[object Object]".
      MEILISEARCH_HOST: "http://${{ meilisearch.RAILWAY_PRIVATE_DOMAIN }}:7700",
      MEILISEARCH_API_KEY: preserve(),
      // Railway reference-variable string, resolved at deploy time. Used here
      // (rather than a typed ref) to break the api <-> web dependency cycle:
      // `web` is declared after this block.
      FRONTEND_URL: "https://${{ web.RAILWAY_PUBLIC_DOMAIN }}",
      JWT_SECRET: preserve(),
      JWT_EXPIRES_IN: "30m",
      GOOGLE_CLIENT_ID: preserve(),
      CLOUDINARY_CLOUD_NAME: preserve(),
      CLOUDINARY_API_KEY: preserve(),
      CLOUDINARY_API_SECRET: preserve(),
      SMTP_HOST: preserve(),
      SMTP_PORT: "587",
      SMTP_USER: preserve(),
      SMTP_PASS: preserve(),
      SMTP_FROM: "noreply@vendorconnect.lk",
      // Gold-price cron runs in-process (@nestjs/schedule); no worker service.
      GOLD_PRICE_CRON: "15 16 * * 1-5",
      GOLD_PRICE_TZ: "Europe/London",
      GOLD_PRICE_RETAIL_PREMIUM_PCT: "0",
      GOLD_PRICE_REFRESH_ON_BOOT: "true",
    },
  });

  // ── Web — Next.js 14 (standalone output) ─────────────────────────────────
  const web = service("web", {
    source: github(REPO, { branch }),
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "apps/web/Dockerfile",
      watchPatterns: [
        "apps/web/**",
        "packages/shared/**",
        "pnpm-lock.yaml",
        "pnpm-workspace.yaml",
      ],
    },
    deploy: {
      healthcheckPath: "/",
      healthcheckTimeout: 120,
      restartPolicyType: "ON_FAILURE",
      restartPolicyMaxRetries: 3,
    },
    env: {
      NODE_ENV: "production",
      // NEXT_PUBLIC_* is inlined at BUILD time. Railway forwards service
      // variables as Docker build args, and apps/web/Dockerfile declares
      // `ARG NEXT_PUBLIC_API_URL`, so changing this requires a rebuild.
      NEXT_PUBLIC_API_URL: "https://${{ api.RAILWAY_PUBLIC_DOMAIN }}/api/v1",
    },
  });

  return project("vendor_connect", {
    resources: [db, meiliData, meilisearch, api, web],
  });
});
