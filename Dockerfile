FROM node:13-alpine

RUN mkdir -p /var/cicdLab-node

COPY . /var/cicdLab-node

# set /home/app dir as default working directory
WORKDIR /var/cicdLab-node

# will execute npm install in WORKDIR
RUN npm install

# entrypoint command to start the app
CMD ["node", "server.js"]