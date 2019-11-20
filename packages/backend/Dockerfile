ARG BASE_IMAGE=socialgouv/domifa:master

FROM ${BASE_IMAGE} as domifa

FROM node:12

ENV TZ Europe/Paris
RUN cp /usr/share/zoneinfo/Europe/Paris /etc/localtime

RUN apt-get update && apt-get install -y pdftk

WORKDIR /app

COPY --from=domifa /app/node_modules /node_modules
COPY --from=domifa /app/packages/backend/node_modules /app/node_modules
COPY --from=domifa /app/packages/backend/dist /app/dist

COPY /app/packages/backend/src/ressources/attestation.pdf /app/dist/ressources/attestation.pdf
COPY /app/packages/backend/src/ressources/demande.pdf /app/dist/ressources/demande.pdf

COPY ./package.json /app/package.json


ENTRYPOINT [ "yarn", "start:prod"]
