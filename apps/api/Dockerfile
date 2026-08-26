FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# ── Development ────────────────────────────────────────────────────────────────
FROM base AS development
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @vendorconnect/shared run build
RUN pnpm --filter @wedding/api run prisma:generate
WORKDIR /app/apps/api
EXPOSE 4000

# ── Builder ────────────────────────────────────────────────────────────────────
FROM base AS builder
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN pnpm install --frozen-lockfile --prod=false
COPY . .
RUN pnpm --filter @vendorconnect/shared run build
RUN pnpm --filter @wedding/api run prisma:generate
RUN pnpm --filter @wedding/api run build

# ── Production ─────────────────────────────────────────────────────────────────
FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app ./
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["node", "dist/main.js"]
