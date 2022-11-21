FROM node:18.12.1 as builder

# these variables are needed at build time because we produce a *static* app
ARG DOMIFA_BACKEND_URL
ARG DOMIFA_ENV_ID

ENV DOMIFA_BACKEND_URL=$DOMIFA_BACKEND_URL
ENV DOMIFA_ENV_ID=$DOMIFA_ENV_ID

WORKDIR /app

COPY ./packages/portail-admins .
COPY ./yarn.lock .

# replace environment variables at build time
RUN apt-get update -y && apt-get install gettext-base && rm -rf /var/lib/apt/lists/*
RUN envsubst < ./src/environments/environment.prod.ts > ./src/environments/environment.prod-env.ts
RUN mv ./src/environments/environment.prod-env.ts ./src/environments/environment.prod.ts

RUN yarn --frozen-lockfile && yarn cache clean
RUN yarn build

FROM ghcr.io/socialgouv/docker/nginx4spa:7.1.0

COPY --from=builder /app/dist/domifa-portail-admins /usr/share/nginx/html
