FROM node:16.8.0 as builder

COPY ./packages/frontend /portail-usagers

WORKDIR /portail-usagers

RUN yarn --frozen-lockfile && yarn cache clean
RUN yarn build

FROM ghcr.io/socialgouv/docker/nginx4spa:6.47.2

COPY --from=builder /portail-usagers/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /portail-usagers/dist/domifa /usr/share/nginx/html
