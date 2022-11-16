#!/bin/bash

# in fututre maybe just kill the processes on port 5000 & 5010, to not stop all running node servers.
killall node

# Start DB
docker-compose up &

# Start both frontend and backend dev server at once !
npm run dev --workspace server & npm run dev --workspace client
