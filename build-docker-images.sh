#!/bin/bash
SCRIPT_RELATIVE_DIR=$(dirname "${BASH_SOURCE[0]}")
cd "$SCRIPT_RELATIVE_DIR" || exit


npm install || exit
rm -r server/dist/
rm -r server/public/
npm run build || exit
cp -r "server/public" "server/dist/public"
rm -r server/public/
cp "docker/app/Dockerfile" "server/dist/"
cp "server/package.json" "server/dist/"
mkdir -p "server/dist/node_modules/@fumix/"
cp -r -T "common/" "server/dist/node_modules/@fumix/fu-blog-common/"
cd "server/dist/" || exit
docker build -t fu-blog_app:latest .
