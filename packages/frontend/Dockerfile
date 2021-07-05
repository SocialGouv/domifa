FROM ghcr.io/socialgouv/docker/nginx4spa:6.26.3

COPY ./packages/frontend/nginx.conf /etc/nginx/nginx.conf

COPY ./packages/frontend/dist/domifa /usr/share/nginx/html
