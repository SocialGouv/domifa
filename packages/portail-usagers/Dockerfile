FROM node:18.16.1 AS deps

RUN apt-get update -y && apt-get install gettext-base && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn fetch workspaces focus @domifa/portail-usagers

FROM deps AS builder-common
COPY ./packages/common ./packages/common
RUN yarn workspace @domifa/common build

FROM deps AS builder
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
RUN envsubst < ./packages/portail-usagers/src/environments/environment.prod.ts > ./packages/portail-usagers/src/environments/environment.prod-env.ts
RUN mv ./packages/portail-usagers/src/environments/environment.prod-env.ts ./packages/portail-usagers/src/environments/environment.prod.ts

RUN yarn workspace @domifa/portail-usagers build

RUN yarn workspaces focus @domifa/portail-usagers --production && yarn cache clean

FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.2

COPY --from=builder --chown=101:101 /app/packages/portail-usagers/dist/domifa-portail-usagers /usr/share/nginx/html



