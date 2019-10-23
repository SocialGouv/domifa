ARG BASE_IMAGE=socialgouv/domifa:master

FROM ${BASE_IMAGE} as domifa

FROM nginx:latest

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY  --from=domifa /app/packages/frontend/dist/domifa /usr/share/nginx/html
