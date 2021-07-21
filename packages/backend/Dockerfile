FROM node:16.5.0

ENV TZ Europe/Paris

RUN cp /usr/share/zoneinfo/Europe/Paris /etc/localtime
RUN apt-get update && apt-get install -y pdftk

COPY ./packages/backend/package.json ./yarn.lock /app/

WORKDIR /app

RUN yarn --production --frozen-lockfile && yarn cache clean

COPY ./packages/backend/dist /app/dist
COPY ./packages/backend/.env.preset /app/.env.preset

ENTRYPOINT [ "yarn", "start:prod"]
