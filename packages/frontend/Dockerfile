FROM ghcr.io/socialgouv/docker/nginx4spa:6.26.6

COPY ./packages/frontend/nginx.conf /etc/nginx/nginx.conf

COPY ./packages/frontend/dist/domifa /usr/share/nginx/html
