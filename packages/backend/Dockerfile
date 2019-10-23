FROM node:12

RUN apt-get update && apt-get install -y pdftk
RUN mongorestore --gzip --archive=./dump_test.gzip
