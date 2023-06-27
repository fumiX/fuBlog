## Build FRONTEND and COMMON and BACKEND Node Server
FROM node:18-slim
RUN apt-get update && apt-get upgrade -y && apt-get install fonts-roboto -y
EXPOSE 5000
WORKDIR /app
COPY . .
RUN npm install

# start node server
CMD [ "node", "server.js"]
