ARG NODE_VERSION=16.20-bookworm-slim@sha256:89061680359f5d9103d24f0066e2c96a8018c24d5c4fe8eb8d59d16dd4ab64ba

FROM node:${NODE_VERSION} AS deps

ENV TZ Europe/Paris

RUN cp /usr/share/zoneinfo/Europe/Paris /etc/localtime

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn fetch workspaces focus @domifa/backend

FROM deps AS builder-common
COPY ./packages/common ./packages/common
RUN yarn workspace @domifa/common build

FROM deps AS builder
COPY --from=builder-common /app/packages/common ./packages/common

COPY ./packages/backend /app/packages/backend

RUN yarn workspace @domifa/backend build

RUN yarn workspaces focus @domifa/backend --production && yarn cache clean
RUN mkdir -p packages/backend/node_modules && mkdir -p packages/common/node_modules

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
COPY --from=builder --chown=1000:1000 /app/node_modules /app/node_modules
COPY --from=builder --chown=1000:1000 /app/packages/common/node_modules /app/packages/common/node_modules
COPY --from=builder --chown=1000:1000 /app/packages/common/dist /app/packages/common/dist
COPY --from=builder --chown=1000:1000 /app/packages/common/package.json /app/packages/common/
COPY --from=builder --chown=1000:1000 /app/packages/backend/node_modules /app/packages/backend/node_modules
COPY --from=builder --chown=1000:1000 /app/packages/backend/dist /app/packages/backend/dist
COPY --from=builder --chown=1000:1000 /app/packages/backend/.env.preset /app/packages/backend/.env.preset
COPY --from=builder --chown=1000:1000 /app/packages/backend/package.json /app/packages/backend/
COPY --from=builder --chown=1000:1000 /app/packages/backend/src/excel/_templates /app/packages/backend/dist/excel/_templates/
COPY --from=builder --chown=1000:1000 /app/packages/backend/src/_static /app/packages/backend/dist/_static/

CMD ["packages/backend/scripts/start"]
