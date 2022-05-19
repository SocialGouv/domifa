FROM node:18.2.0 as builder

# these variables are needed at build time because we produce a *static* app
ARG PRODUCTION
ARG DOMIFA_BACKEND_URL
ARG DOMIFA_PORTAIL_ADMINS_URL
ARG DOMIFA_PORTAIL_USAGERS_URL
ARG DOMIFA_ENV_ID
ARG DOMIFA_FRONTEND_META_ROBOTS

ENV DOMIFA_BACKEND_URL=$DOMIFA_BACKEND_URL
ENV DOMIFA_PORTAIL_ADMINS_URL=$DOMIFA_PORTAIL_ADMINS_URL
ENV DOMIFA_PORTAIL_USAGERS_URL=$DOMIFA_PORTAIL_USAGERS_URL
ENV DOMIFA_ENV_ID=$DOMIFA_ENV_ID
ENV DOMIFA_FRONTEND_META_ROBOTS=$DOMIFA_FRONTEND_META_ROBOTS

WORKDIR /app

COPY ./packages/frontend .
COPY ./yarn.lock .

# replace environment variables
RUN apt-get update -y && apt-get install gettext-base && rm -rf /var/lib/apt/lists/*
# index.html for robots
RUN envsubst < ./src/index.html > ./src/index-env.html
RUN mv ./src/index-env.html ./src/index.html
# environment.prod.ts
RUN envsubst < ./src/environments/environment.prod.ts > ./src/environments/environment.prod-env.ts
RUN mv ./src/environments/environment.prod-env.ts ./src/environments/environment.prod.ts

RUN yarn --frozen-lockfile && yarn cache clean
RUN yarn build

FROM ghcr.io/socialgouv/docker/nginx4spa:7.0.0

COPY --from=builder /app/dist/domifa /usr/share/nginx/html
