FROM node:22-bookworm-slim AS deps

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

COPY ./packages/frontend ./packages/frontend

# these variables are needed at build time because we produce a *static* app
ARG PRODUCTION

ARG DOMIFA_BACKEND_URL
ARG DOMIFA_PORTAIL_ADMINS_URL
ARG DOMIFA_PORTAIL_USAGERS_URL
ARG DOMIFA_FRONTEND_URL
ARG DOMIFA_ENV_ID
ARG DOMIFA_SENTRY_DSN_FRONTEND
ARG DOMIFA_FRONTEND_META_ROBOTS

ENV DOMIFA_BACKEND_URL=$DOMIFA_BACKEND_URL
ENV DOMIFA_PORTAIL_ADMINS_URL=$DOMIFA_PORTAIL_ADMINS_URL
ENV DOMIFA_PORTAIL_USAGERS_URL=$DOMIFA_PORTAIL_USAGERS_URL
ENV DOMIFA_FRONTEND_URL=$DOMIFA_FRONTEND_URL
ENV DOMIFA_ENV_ID=$DOMIFA_ENV_ID
ENV DOMIFA_SENTRY_DSN_FRONTEND=$DOMIFA_SENTRY_DSN_FRONTEND
ENV DOMIFA_FRONTEND_META_ROBOTS=$DOMIFA_FRONTEND_META_ROBOTS

# replace environment variables in static assets
RUN envsubst < ./packages/frontend/src/index.html > ./packages/frontend/src/index-env.html \
  && mv ./packages/frontend/src/index-env.html ./packages/frontend/src/index.html

RUN envsubst < ./packages/frontend/src/environments/environment.prod.ts > ./packages/frontend/src/environments/environment.prod-env.ts \
  && mv ./packages/frontend/src/environments/environment.prod-env.ts ./packages/frontend/src/environments/environment.prod.ts

RUN corepack enable \
  && corepack prepare pnpm@10.24.0 --activate \
  && pnpm install --filter @domifa/frontend... --frozen-lockfile --offline \
  && pnpm --filter @domifa/frontend build

FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.4

COPY --from=builder --chown=101:101 /app/packages/frontend/dist/domifa /usr/share/nginx/html
