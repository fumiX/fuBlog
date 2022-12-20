#!/bin/sh
SCRIPT_RELATIVE_DIR=$(dirname "${BASH_SOURCE[0]}") 
cd $SCRIPT_RELATIVE_DIR


npm install
rm -r server/dist/
npm run build
cp "docker/app/Dockerfile" "server/dist/"
cp "server/package.json" "server/dist/"
cp -r "node_modules/@fumix/" "server/dist/node_modules/@fumix/"
cd "server/dist/"
docker build .
