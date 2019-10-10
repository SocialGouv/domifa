FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY tsconfig.json /usr/src/app/
COPY tsconfig.build.json /usr/src/app/

RUN yarn install

EXPOSE 3000
CMD ["yarn", "start:prod"]
