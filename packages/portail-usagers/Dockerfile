FROM node:18.17.1  AS builder

RUN apt-get update -y && apt-get install gettext-base && rm -rf /var/lib/apt/lists/*

# these variables are needed at build time because we produce a *static* app
ARG DOMIFA_BACKEND_URL
ARG DOMIFA_ENV_ID
ARG DOMIFA_SENTRY_DSN_PORTAIL

ENV DOMIFA_BACKEND_URL=$DOMIFA_BACKEND_URL
ENV DOMIFA_ENV_ID=$DOMIFA_ENV_ID
ENV DOMIFA_SENTRY_DSN_PORTAIL=$DOMIFA_SENTRY_DSN_PORTAIL

WORKDIR /app

COPY ./packages/portail-usagers .
COPY ./yarn.lock .

# replace environment variables
RUN envsubst < ./src/environments/environment.prod.ts > ./src/environments/environment.prod-env.ts
RUN mv ./src/environments/environment.prod-env.ts ./src/environments/environment.prod.ts

RUN yarn --frozen-lockfile && yarn cache clean
RUN yarn build

FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.0

COPY --from=builder --chown=101:101 /app/dist/domifa-portail-usagers /usr/share/nginx/html



