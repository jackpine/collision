#!/usr/bin/env bash

echo "running new container"
docker run --name collision-api \
           --link collision-db:collision-db \
           -p 4000:80 \
           -d michaelkirk/collision-api

