ARG BASE_IMAGE=node:16.20-bookworm-slim@sha256:ffed502c80d7fdea4138e198f4ff5861bcf193796845b16a290a64d04d5473e7

FROM ${BASE_IMAGE} AS builder

ENV TZ Europe/Paris

RUN cp /usr/share/zoneinfo/Europe/Paris /etc/localtime

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn fetch workspaces focus @domifa/backend

RUN yarn build

RUN yarn workspaces focus @domifa/backend --production && yarn cache clean


FROM ${BASE_IMAGE}

ENV CORE_PACKAGES pdftk
# sudo bash wget vim git bash-completion xsel rubygems build-essential ruby-dev pdftk

RUN apt-get update && \
    apt-get install -q -y -o Acquire::Retries=10 $CORE_PACKAGES && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

USER 1000

WORKDIR /app

COPY  ./packages/backend/scripts/start /app/scripts/start
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/.env.preset /app/.env.preset

CMD ["scripts/start"]
