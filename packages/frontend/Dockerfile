FROM node:18.16.1 AS deps

RUN apt-get update -y && apt-get install gettext-base && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn fetch workspaces focus @domifa/frontend

FROM deps AS builder-common
COPY ./packages/common ./packages/common
RUN yarn workspace @domifa/common build

FROM deps AS builder
COPY --from=builder-common /app/packages/common ./packages/common

COPY ./packages/frontend ./packages/frontend

# these variables are needed at build time because we produce a *static* app
ARG PRODUCTION

ARG DOMIFA_BACKEND_URL
ARG DOMIFA_PORTAIL_ADMINS_URL
ARG DOMIFA_PORTAIL_USAGERS_URL
ARG DOMIFA_ENV_ID
ARG DOMIFA_SENTRY_DSN_FRONTEND
ARG DOMIFA_FRONTEND_META_ROBOTS

ENV DOMIFA_BACKEND_URL=$DOMIFA_BACKEND_URL
ENV DOMIFA_PORTAIL_ADMINS_URL=$DOMIFA_PORTAIL_ADMINS_URL
ENV DOMIFA_PORTAIL_USAGERS_URL=$DOMIFA_PORTAIL_USAGERS_URL
ENV DOMIFA_ENV_ID=$DOMIFA_ENV_ID
ENV DOMIFA_SENTRY_DSN_FRONTEND=$DOMIFA_SENTRY_DSN_FRONTEND
ENV DOMIFA_FRONTEND_META_ROBOTS=$DOMIFA_FRONTEND_META_ROBOTS

# index.html for robots
# replace environment variables
RUN envsubst < ./packages/frontend/src/index.html > ./packages/frontend/src/index-env.html
RUN mv ./packages/frontend/src/index-env.html ./packages/frontend/src/index.html
# environment.prod.ts
RUN envsubst < ./packages/frontend/src/environments/environment.prod.ts > ./packages/frontend/src/environments/environment.prod-env.ts
RUN mv ./packages/frontend/src/environments/environment.prod-env.ts ./packages/frontend/src/environments/environment.prod.ts

RUN yarn workspace @domifa/frontend build

FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.3

COPY --from=builder --chown=101:101 /app/packages/frontend/dist/domifa /usr/share/nginx/html
