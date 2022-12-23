## Build FRONTEND and COMMON and BACKEND Node Server
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install

# start node server
CMD [ "node", "server.js"]
