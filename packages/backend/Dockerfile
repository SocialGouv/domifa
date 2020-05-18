FROM node:14

ENV TZ Europe/Paris

RUN cp /usr/share/zoneinfo/Europe/Paris /etc/localtime
RUN apt-get update && apt-get install -y pdftk

COPY ./packages/backend/package.json ./yarn.lock /app/

WORKDIR /app

RUN yarn --production --frozen-lockfile --cache-folder /dev/shm/yarn

COPY ./packages/backend/dist /app/dist


ENTRYPOINT [ "yarn", "start:prod"]
