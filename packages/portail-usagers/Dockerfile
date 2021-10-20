FROM node:16.11.1 as builder

COPY ./packages/portail-usagers /app

WORKDIR /app

RUN yarn --frozen-lockfile && yarn cache clean
RUN yarn build

FROM ghcr.io/socialgouv/docker/nginx4spa:6.58.2

COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/domifa-portail-usagers /usr/share/nginx/html
