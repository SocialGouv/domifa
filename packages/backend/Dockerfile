FROM node:16.8.0

ENV TZ Europe/Paris

RUN cp /usr/share/zoneinfo/Europe/Paris /etc/localtime
RUN apt-get update && apt-get install -y pdftk

COPY ./packages/backend /app

WORKDIR /app

# TODO: Sort dependencies and add "--production" install flag
RUN yarn --frozen-lockfile && yarn cache clean
RUN yarn build

ENTRYPOINT ["yarn", "start:prod"]
