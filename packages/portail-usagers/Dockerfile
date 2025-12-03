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

COPY ./packages/portail-usagers ./packages/portail-usagers

# these variables are needed at build time because we produce a *static* app
ARG DOMIFA_BACKEND_URL
ARG DOMIFA_ENV_ID
ARG DOMIFA_SENTRY_DSN_PORTAIL

ENV DOMIFA_BACKEND_URL=$DOMIFA_BACKEND_URL
ENV DOMIFA_ENV_ID=$DOMIFA_ENV_ID
ENV DOMIFA_SENTRY_DSN_PORTAIL=$DOMIFA_SENTRY_DSN_PORTAIL

# replace environment variables
RUN envsubst < ./packages/portail-usagers/src/environments/environment.prod.ts > ./packages/portail-usagers/src/environments/environment.prod-env.ts \
  && mv ./packages/portail-usagers/src/environments/environment.prod-env.ts ./packages/portail-usagers/src/environments/environment.prod.ts

RUN corepack enable \
  && corepack prepare pnpm@10.24.0 --activate \
  && pnpm install --filter @domifa/portail-usagers... --frozen-lockfile --offline \
  && pnpm --filter @domifa/portail-usagers build

FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.4

COPY --from=builder --chown=101:101 /app/packages/portail-usagers/dist/domifa-portail-usagers /usr/share/nginx/html
