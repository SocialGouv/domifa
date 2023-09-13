ARG NODE_VERSION=16.20-bookworm-slim@sha256:ffed502c80d7fdea4138e198f4ff5861bcf193796845b16a290a64d04d5473e7

FROM node:${NODE_VERSION} AS builder

ENV TZ Europe/Paris

RUN cp /usr/share/zoneinfo/Europe/Paris /etc/localtime

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn fetch workspaces focus @domifa/common
RUN yarn workspace @domifa/common build
RUN yarn fetch workspaces focus @domifa/backend

COPY ./packages/backend /app/packages/backend

RUN yarn workspace @domifa/backend build

RUN yarn workspaces focus @domifa/backend --production && yarn cache clean
RUN mkdir -p packages/backend/node_modules

FROM node:${NODE_VERSION}

ENV CORE_PACKAGES pdftk
# sudo bash wget vim git bash-completion xsel rubygems build-essential ruby-dev pdftk

RUN apt-get update && \
    apt-get install -q -y -o Acquire::Retries=10 $CORE_PACKAGES && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

USER 1000

WORKDIR /app/packages/backend

COPY  ./packages/backend/scripts/start /app/packages/backend/scripts/start
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/backend/node_modules /app/packages/backend/node_modules
COPY --from=builder /app/packages/backend/dist /app/packages/backend/dist
COPY --from=builder /app/packages/backend/.env.preset /app/packages/backend/.env.preset
COPY --from=builder /app/packages/backend/package.json /app/packages/backend/

CMD ["scripts/start"]
