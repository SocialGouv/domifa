mongo domifa --eval "db.dropDatabase()"
mongorestore --gzip --archive=dump_test.gzip
sleep 15
mongo domifa --eval "db.createUser({user:'travis', pwd:'test', roles:[{role:'readWrite', db:'domifa'}] });"
touch ../src/config/config.env
echo "DB_USER=travis" >> ../src/config/config.env
echo "DB_PASS=test" >> ../src/config/config.env
