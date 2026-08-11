FROM node:24-bookworm-slim AS deps

RUN apt-get update -y && apt-get install -y gettext-base && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Lockfile-only layer for dependency fetch, independent of package.json changes
COPY pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./

RUN corepack enable \
  && corepack prepare pnpm@10.24.0 --activate \
  && pnpm fetch

FROM deps AS builder-common

WORKDIR /app

COPY ./packages/common ./packages/common

RUN corepack enable \
  && corepack prepare pnpm@10.24.0 --activate \
  && pnpm install --filter @domifa/common... --frozen-lockfile --offline \
  && pnpm --filter @domifa/common build

FROM deps AS builder

WORKDIR /app

COPY --from=builder-common /app/packages/common ./packages/common

COPY ./packages/portail-stats ./packages/portail-stats

# these variables are needed at build time because we produce a *static* app
ARG DOMIFA_BACKEND_URL
ARG DOMIFA_ENV_ID
ARG DOMIFA_SENTRY_DSN_PORTAIL_STATS
ARG DOMIFA_FRONTEND_URL
ARG DOMIFA_PORTAIL_ADMINS_URL

ENV DOMIFA_BACKEND_URL=$DOMIFA_BACKEND_URL
ENV DOMIFA_FRONTEND_URL=$DOMIFA_FRONTEND_URL
ENV DOMIFA_PORTAIL_ADMINS_URL=$DOMIFA_PORTAIL_ADMINS_URL
ENV DOMIFA_ENV_ID=$DOMIFA_ENV_ID
ENV DOMIFA_SENTRY_DSN_PORTAIL_STATS=$DOMIFA_SENTRY_DSN_PORTAIL_STATS

# replace environment variables at build time
RUN envsubst < ./packages/portail-stats/src/environments/environment.prod.ts > ./packages/portail-stats/src/environments/environment.prod-env.ts \
  && mv ./packages/portail-stats/src/environments/environment.prod-env.ts ./packages/portail-stats/src/environments/environment.prod.ts

RUN corepack enable \
  && corepack prepare pnpm@10.24.0 --activate \
  && pnpm install --filter @domifa/portail-stats... --frozen-lockfile --offline \
  && pnpm --filter @domifa/portail-stats build

FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.4

COPY ./packages/nginx.conf /etc/nginx/nginx.conf
COPY ./packages/portail-stats/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=builder --chown=101:101 /app/packages/portail-stats/dist/domifa-portail-stats/browser /usr/share/nginx/html
