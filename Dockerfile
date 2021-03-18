FROM node:15

ENV TZ Europe/Paris
RUN cp /usr/share/zoneinfo/Europe/Paris /etc/localtime

COPY ./lerna.json /app/lerna.json
COPY ./package.json /app/package.json
COPY ./packages/backend/package.json /app/packages/backend/package.json
COPY ./packages/frontend/package.json /app/packages/frontend/package.json
COPY ./yarn.lock /app/yarn.lock

WORKDIR /app

RUN yarn --frozen-lockfile --cache-folder /dev/shm/yarn

COPY ./packages/backend/nest-cli.json /app/packages/backend/nest-cli.json
COPY ./packages/backend/tsconfig.build.json /app/packages/backend/tsconfig.build.json
COPY ./packages/backend/tsconfig.json /app/packages/backend/tsconfig.json
COPY ./packages/frontend/angular.json /app/packages/frontend/angular.json
COPY ./packages/frontend/tsconfig.json /app/packages/frontend/tsconfig.json

COPY ./packages/backend/src /app/packages/backend/src
COPY ./packages/frontend/src /app/packages/frontend/src

COPY /app/packages/backend/src/ressources /app/packages/backend/dist/ressources


RUN touch /app/packages/backend/src/config/config.env

COPY ./packages/backend/jest.config.js /app/packages/backend/jest.config.js
COPY ./packages/backend/tslint.json /app/packages/backend/tslint.json
COPY ./packages/frontend/jest.config.js /app/packages/frontend/jest.config.js
COPY ./packages/frontend/tslint.json /app/packages/frontend/tslint.json

RUN yarn build --stream


COPY ./dump_test.gzip /app/dump_test.gzip
