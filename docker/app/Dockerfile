## Build FRONTEND and COMMON and BACKEND Node Server
FROM node:22-slim
RUN apt-get update && apt-get upgrade -y && apt-get install fonts-roboto build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev -y
EXPOSE 5000
WORKDIR /app
COPY . .
RUN npm install

# start node server
CMD [ "node", "server.js"]
