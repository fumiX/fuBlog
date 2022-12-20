## TODO configurable locale
FROM postgres:15.1
RUN localedef -i de_DE -c -f UTF-8 -A /usr/share/locale/locale.alias de_DE.UTF-8
ENV LC_ALL de_DE.utf8


## Build FRONTEND and COMMON and BACKEND Node Server
# FROM node:18.12.1-alpine AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# start node server
# CMD [ "node", "server/dist/server.js"]
# EXPOSE 5010

## Create nginx server
# FROM nginx:1.19.8-alpine as prod-stage
# COPY --from=build /app/dist/