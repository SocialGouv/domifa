FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN yarn install

COPY . /usr/src/app

RUN ["chmod", "+x", "./scripts/startDb.sh"]
ENTRYPOINT ["./scripts/startDb.sh"]

EXPOSE 3000
CMD ["yarn", "workspace @domifa/frontend", "build --prod"]
