FROM node:18.16.1 AS builder

RUN apt-get update -y && apt-get install gettext-base && rm -rf /var/lib/apt/lists/*

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

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/common ./packages/common
COPY packages/frontend ./packages/frontend

RUN yarn --frozen-lockfile --prefer-offline --non-interactive && yarn cache clean
RUN yarn --cwd=packages/common build

# index.html for robots
# replace environment variables
WORKDIR /app/packages/frontend

RUN envsubst < ./src/index.html > ./src/index-env.html
RUN mv ./src/index-env.html ./src/index.html
# environment.prod.ts
RUN envsubst < ./src/environments/environment.prod.ts > ./src/environments/environment.prod-env.ts
RUN mv ./src/environments/environment.prod-env.ts ./src/environments/environment.prod.ts

RUN yarn build --verbose --configuration=production

FROM ghcr.io/socialgouv/docker/nginx4spa:8.1.0

COPY --from=builder --chown=101:101 /app/packages/frontend/dist/domifa /usr/share/nginx/html
