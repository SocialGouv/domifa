FROM node:17.7.2 as builder

WORKDIR /app

COPY ./packages/portail-admins .
COPY ./yarn.lock .

RUN yarn --frozen-lockfile && yarn cache clean
RUN yarn build

FROM ghcr.io/socialgouv/docker/nginx4spa:7.0.0

COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/domifa-portail-admins /usr/share/nginx/html
