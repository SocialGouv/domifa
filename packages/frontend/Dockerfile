FROM node:16.12.0 as builder

WORKDIR /app

COPY ./packages/frontend .
COPY ./yarn.lock .

# TODO: Sort dependencies and add "--production" install flag
RUN yarn --frozen-lockfile && yarn cache clean
RUN yarn build

FROM ghcr.io/socialgouv/docker/nginx4spa:6.64.2

ARG DOMIFA_FRONTEND_META_ROBOTS
ENV DOMIFA_FRONTEND_META_ROBOTS=$DOMIFA_FRONTEND_META_ROBOTS

COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/domifa /usr/share/nginx/html
