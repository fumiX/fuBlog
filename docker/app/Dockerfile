## Build FRONTEND and COMMON and BACKEND Node Server
FROM node:18-slim
WORKDIR /app
COPY . .
RUN npm install

# start node server
CMD [ "node", "server.js"]
