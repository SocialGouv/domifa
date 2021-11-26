FROM node:16.13.0 as builder

WORKDIR /app

COPY ./packages/portail-usagers .
COPY ./yarn.lock .

RUN yarn --frozen-lockfile && yarn cache clean
RUN yarn build

FROM ghcr.io/socialgouv/docker/nginx4spa:6.58.3

COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/domifa-portail-usagers /usr/share/nginx/html
