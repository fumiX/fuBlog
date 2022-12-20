## Build FRONTEND and COMMON and BACKEND Node Server
FROM node:18.12.1-alpine AS build
WORKDIR /app
COPY . .
RUN npm install

# start node server
CMD [ "node", "server.js"]
EXPOSE 5010
