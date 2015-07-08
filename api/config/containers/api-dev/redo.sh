#!/usr/bin/env bash

BIN_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $BIN_DIR

(cd ../../../ && config/containers/api/build.sh)

echo "stopping and removing old container"
docker rm -f collision-api-dev

./run.sh

