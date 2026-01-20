ARG NODE_VERSION=22-bookworm-slim

FROM node:${NODE_VERSION} AS deps

ENV TZ Europe/Paris
RUN cp /usr/share/zoneinfo/Europe/Paris /etc/localtime || true

WORKDIR /app

# Use pnpm with a lockfile-only layer for maximal cache reuse
COPY pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./

RUN corepack enable \
  && corepack prepare pnpm@10.24.0 --activate \
  && pnpm fetch

FROM deps AS builder-common

WORKDIR /app

# Build shared common library
COPY ./packages/common ./packages/common

RUN corepack enable \
  && corepack prepare pnpm@10.24.0 --activate \
  && pnpm install --filter @domifa/common... --frozen-lockfile --offline \
  && pnpm --filter @domifa/common build

FROM deps AS builder

WORKDIR /app

# Reuse built common package
COPY --from=builder-common /app/packages/common ./packages/common

# Copy backend sources
COPY ./packages/backend /app/packages/backend

RUN corepack enable \
  && corepack prepare pnpm@10.24.0 --activate \
  && pnpm install --filter @domifa/backend... --frozen-lockfile --offline \
  && pnpm --filter @domifa/backend build

FROM node:${NODE_VERSION}

ENV CORE_PACKAGES pdftk
# sudo bash wget vim git bash-completion xsel rubygems build-essential ruby-dev pdftk

RUN apt-get update && \
  apt-get install -q -y -o Acquire::Retries=10 $CORE_PACKAGES && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

USER 1000

WORKDIR /app

COPY  ./packages/backend/scripts/start /app/packages/backend/scripts/start

# Copy pnpm root store so workspace symlinks in package node_modules resolve correctly
COPY --from=builder --chown=1000:1000 /app/node_modules /app/node_modules

COPY --from=builder --chown=1000:1000 /app/packages/common/node_modules /app/packages/common/node_modules
COPY --from=builder --chown=1000:1000 /app/packages/common/dist /app/packages/common/dist
COPY --from=builder --chown=1000:1000 /app/packages/common/package.json /app/packages/common/

# Copy backend package.json so start script can read DOMIFA_VERSION
COPY --from=builder --chown=1000:1000 /app/packages/backend/package.json /app/packages/backend/package.json

COPY --from=builder --chown=1000:1000 /app/packages/backend/node_modules /app/packages/backend/node_modules
COPY --from=builder --chown=1000:1000 /app/packages/backend/dist /app/packages/backend/dist
COPY --from=builder --chown=1000:1000 /app/packages/backend/.env.preset /app/packages/backend/.env.preset
COPY --from=builder --chown=1000:1000 /app/packages/backend/src/excel/_templates /app/packages/backend/dist/excel/_templates/
COPY --from=builder --chown=1000:1000 /app/packages/backend/src/_static /app/packages/backend/dist/_static/
COPY --from=builder --chown=1000:1000 /app/packages/backend/src/_migrations/_init-db/domifa_test_schema.sql /app/packages/backend/dist/_migrations/_init-db/domifa_test_schema.sql

ENV NODE_OPTIONS="--max-old-space-size=8192"

CMD ["packages/backend/scripts/start"]
