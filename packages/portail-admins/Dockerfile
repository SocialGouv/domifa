FROM node:16.12.0 as builder

WORKDIR /app

COPY ./packages/portail-admins .
COPY ./yarn.lock .

RUN yarn --frozen-lockfile && yarn cache clean
RUN yarn build

FROM ghcr.io/socialgouv/docker/nginx4spa:6.58.3

COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/domifa-portail-admins /usr/share/nginx/html
