FROM node:18.16.1 AS deps

RUN apt-get update -y && apt-get install gettext-base && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn fetch workspaces focus @domifa/portail-admins

FROM deps AS builder-common
COPY ./packages/common ./packages/common
RUN yarn workspace @domifa/common build

FROM deps AS builder
COPY --from=builder-common /app/packages/common ./packages/common

COPY ./packages/portail-admins ./packages/portail-admins

# these variables are needed at build time because we produce a *static* app
ARG DOMIFA_BACKEND_URL
ARG DOMIFA_ENV_ID
ARG DOMIFA_SENTRY_DSN_PORTAIL_ADMIN
ARG DOMIFA_FRONTEND_URL

ENV DOMIFA_BACKEND_URL=$DOMIFA_BACKEND_URL
ENV DOMIFA_FRONTEND_URL=$DOMIFA_FRONTEND_URL
ENV DOMIFA_ENV_ID=$DOMIFA_ENV_ID
ENV DOMIFA_SENTRY_DSN_PORTAIL_ADMIN=$DOMIFA_SENTRY_DSN_PORTAIL_ADMIN

# replace environment variables at build time
RUN envsubst < ./packages/portail-admins/src/environments/environment.prod.ts > ./packages/portail-admins/src/environments/environment.prod-env.ts
RUN mv ./packages/portail-admins/src/environments/environment.prod-env.ts ./packages/portail-admins/src/environments/environment.prod.ts

RUN yarn workspace @domifa/portail-admins build

RUN yarn workspaces focus @domifa/portail-admins --production && yarn cache clean

FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.3

COPY --from=builder --chown=101:101 /app/packages/portail-admins/dist/domifa-portail-admins /usr/share/nginx/html
