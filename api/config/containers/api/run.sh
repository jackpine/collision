#!/bin/sh
set -x
docker run --name collision-api \
           --link collision-db:collision-db \
           -p 4000:80 \
           -d michaelkirk/collision-api

