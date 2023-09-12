FROM node:18.16.1  AS builder

RUN apt-get update -y && apt-get install gettext-base && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn fetch workspaces focus @domifa/portail-usagers

COPY ./packages/portail-usagers .

# these variables are needed at build time because we produce a *static* app
ARG DOMIFA_BACKEND_URL
ARG DOMIFA_ENV_ID
ARG DOMIFA_SENTRY_DSN_PORTAIL

ENV DOMIFA_BACKEND_URL=$DOMIFA_BACKEND_URL
ENV DOMIFA_ENV_ID=$DOMIFA_ENV_ID
ENV DOMIFA_SENTRY_DSN_PORTAIL=$DOMIFA_SENTRY_DSN_PORTAIL

# replace environment variables
RUN envsubst < ./src/environments/environment.prod.ts > ./src/environments/environment.prod-env.ts
RUN mv ./src/environments/environment.prod-env.ts ./src/environments/environment.prod.ts

RUN yarn build

RUN yarn workspaces focus @domifa/portail-usagers --production && yarn cache clean

FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.0

COPY --from=builder --chown=101:101 /app/dist/domifa-portail-usagers /usr/share/nginx/html



