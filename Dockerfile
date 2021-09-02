FROM node:13-alpine

ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=password

RUN mkdir -p /home/app

COPY . /home/app

# set /home/app dir as default working directory
WORKDIR /home/app

# will execute npm install in WORKDIR
RUN npm install

# entrypoint command to start the app
CMD ["node", "server.js"]
