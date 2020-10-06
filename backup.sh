#!/bin/bash

today=$(date "+%Y-%m-%d-%H-%M")
sudo docker exec master_mongo_1 sh -c 'mongodump --archive --gzip' > /mnt/database/dump_${today}.gzip
