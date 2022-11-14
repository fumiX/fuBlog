#!/bin/bash

# in fututre maybe just kill the processes on port 5000 & 5010, to not stop all running node servers.
killall node

# Start DB
docker-compose up &

# Start both frontend and backend dev server at once !
 cd server && npm run dev && cd .. & cd client && npm run dev


