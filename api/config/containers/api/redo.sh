#!/usr/bin/env bash

BIN_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $BIN_DIR

echo "stopping and removing old container"
docker rm -f collision-api

(cd ../../../ && config/containers/api/build.sh)
./run.sh

