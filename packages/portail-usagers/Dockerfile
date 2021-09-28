FROM node:16.8.0 as builder

COPY ./packages/portail-usagers /app

WORKDIR /app

RUN yarn --frozen-lockfile && yarn cache clean
RUN yarn build

FROM ghcr.io/socialgouv/docker/nginx4spa:6.47.9

COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/domifa-portail-usagers /usr/share/nginx/html
