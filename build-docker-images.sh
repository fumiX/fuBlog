#!/bin/bash
SCRIPT_RELATIVE_DIR=$(dirname "${BASH_SOURCE[0]}")
cd $SCRIPT_RELATIVE_DIR


npm install
rm -r server/dist/
npm run build
cp "docker/app/Dockerfile" "server/dist/"
cp "server/package.json" "server/dist/"
mkdir -p "server/dist/node_modules/@fumix/"
cp -r -T "common/" "server/dist/node_modules/@fumix/fu-blog-common/"
cd "server/dist/"
docker build .
