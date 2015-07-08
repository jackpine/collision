#!/usr/bin/env bash

echo "running new container"
docker run --name collision-api \
           --link collision-db:collision-db \
           -p 80:80 \
           -d jackpine/collision-api

