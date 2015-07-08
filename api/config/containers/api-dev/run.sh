#!/usr/bin/env bash

echo "running new container"

BIN_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
APP_ROOT=$BIN_DIR/../../../

docker run --name collision-api-dev \
           --link collision-db:collision-db \
           -v $APP_ROOT:/home/app/collision/api \
           -p 4000:80 \
           -d jackpine/collision-api

