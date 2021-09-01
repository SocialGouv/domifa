# FROM ghcr.io/socialgouv/docker/nginx4spa:6.47.2
FROM node:16.8.0 as builder

COPY ./packages/frontend /app

WORKDIR /app

RUN yarn --frozen-lockfile && yarn cache clean
RUN yarn build

FROM ghcr.io/socialgouv/docker/nginx4spa:6.47.2

COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/domifa /usr/share/nginx/html

# COPY ./packages/frontend/nginx.conf /etc/nginx/nginx.conf

# COPY ./packages/frontend/dist/domifa /usr/share/nginx/html
