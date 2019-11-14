ARG BASE_IMAGE=socialgouv/domifa:master

FROM ${BASE_IMAGE} as domifa

FROM registry.gitlab.factory.social.gouv.fr/socialgouv/docker/nginx4spa:0.12.0

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY  --from=domifa /app/packages/frontend/dist/domifa /usr/share/nginx/html
