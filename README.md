# Node App For DevOps Using Docker 

The purpose of this lab is to show you how to get a Node Express application into a Docker container. 
We will build a Docker image of a simple express web application, then we will deploy it as container from the created image on developement server.

## Prerequisites
- 01 server (ubuntu/centos)

## Install Docker Engine

Docker Engine is available on a variety of Linux platforms, macOS and Windows 10 through Docker Desktop, and as a static binary installation. Please follow the Docker [official document](https://docs.docker.com/engine/install/)  for Docker Installation.

## Building the Docker image

I have already developed the Dockerfile and the express app provided bellow,

### Node/Express app

## package.json

~~~sh

{
  "name": "basicexpressapp",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js"
  },
  "author": "Abderrahmane Boulahdour",
  "license": "ISC",
  "dependencies": {
    "body-parser": "^1.19.0",
    "express": "^4.17.1",
    "mongodb": "^3.3.3"
  }
}

~~~

## server.js

~~~sh
const express           = require('express');
const path              = require('path');
const MongoClient       = require('mongodb').MongoClient;
const bodyParser        = require('body-parser');
const app               = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
  });

// To use when you start the application locally
var mongoUrlLocal = "mongodb+srv://abderrahmane:ertyuiop@cluster0.urppt.mongodb.net/productApp?retryWrites=true&w=majority"

// To use when you start the application as docker container
var mongoUrlDocker = "mongodb://admin:password@mongodb";

// Pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
var mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// "offer-detail" database name used
var databaseName = "productApp";

app.post('/update-product', function (req, res) {
  var productObj = req.body;

  MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
    if (err) throw err;

    var db = client.db(databaseName);
    productObj['productid'] = 1;

    var myquery = { productid: 1 };
    var newdata = { $set: productObj };

    db.collection("products").updateOne(myquery, newdata, {upsert: true}, function(err, res) {
      if (err) throw err;
      client.close();
    });

  });
  // Send response
  res.send(productObj);
});

app.get('/get-product', function (req, res) {
  var response = {};
  // Connect to the db
  MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
    if (err) throw err;

    var db = client.db(databaseName);

    var myquery = { productid: 1 };

    db.collection("products").findOne(myquery, function (err, result) {
      if (err) throw err;
      response = result;
      client.close();

      // Send response
      res.send(response ? response : {});
    });
  });
});

app.listen(3000, function () {
  console.log("app listening on port 3000!");
});
~~~

## index.html

~~~sh
<html>
    <head>
      ...
    </head>
    <script>
    (async function init() {
        const response = await fetch('http://localhost:3000/get-product');
        console.log("response", response);
        const user = await response.json();
        console.log(JSON.stringify(user));

        document.getElementById('name').textContent = user.name ? user.name : 'Product 01';
        document.getElementById('category').textContent = user.category ? user.category : 'Tech';
        document.getElementById('price').textContent = user.price ? user.price : '10$';

        const cont = document.getElementById('container');
        cont.style.display = 'block';
    })();

    async function handleUpdateProductRequest() {
        const contEdit = document.getElementById('container-edit');
        const cont = document.getElementById('container');

        const payload = {
            name: document.getElementById('input-name').value, 
            category: document.getElementById('input-category').value, 
            price: document.getElementById('input-price').value
        };
        
        const response = await fetch('http://localhost:3000/update-product', {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const jsonResponse = await response.json();

        document.getElementById('name').textContent = jsonResponse.name;
        document.getElementById('category').textContent = jsonResponse.category;
        document.getElementById('price').textContent = jsonResponse.price;

        cont.style.display = 'block';
        contEdit.style.display = 'none';
    }

    function updateProduct() {
        const contEdit = document.getElementById('container-edit');
        const cont = document.getElementById('container');

        document.getElementById('input-name').value = document.getElementById('name').textContent;
        document.getElementById('input-category').value = document.getElementById('category').textContent;
        document.getElementById('input-price').value = document.getElementById('price').textContent;

        cont.style.display = 'none';
        contEdit.style.display = 'block';
    }
    </script>
    <body>
      ...
    </body>
</html>
~~~

### Dockerfile

~~~sh
FROM node:13-alpine

ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=password

RUN mkdir -p /var/cicdLab-node

COPY . /var/cicdLab-node

# set /home/app dir as default working directory
WORKDIR /var/cicdLab-node

# will execute npm install in WORKDIR
RUN npm install

# entrypoint command to start the app
CMD ["node", "server.js"]
~~~

Please perform the steps below to clone the github repository;

~~~sh
yum install git -y
git clone https://github.com/Arboulahdour/nodejs-devops.git
~~~ 

Go to the directory that has the Dockerfile and run the following command to build the Docker image. The -t flag lets you tag your image so it's easier to find later using the docker images command:
~~~sh
cd nodejs-devops/
docker build -t <your username>/nodejs-product:1.0> . 
~~~

Your image will now be listed by Docker by the command:
~~~sh
docker image ls
~~~

Before running the app we need to prepare a database server. In this case, mongodb will be used as container for the app:

~~~sh
docker container run --name mongodb -p 27017:27017 -d -e MONGO_INITDB_ROOT_USERNAME='admin' -e MONGO_INITDB_ROOT_PASSWORD='password' mongo
~~~

Now run the container from the Image created:
~~~sh
docker container run --name productApp -p 8889:3000 -d arboulahdour/nodejs-product:1.0
~~~

To test your app, get the port of your app that Docker mapped:
~~~sh
docker container ls
~~~

In the example above, Docker mapped the 3000 port inside of the container to the port 8889 on your machine.

Now you can test your app using curl or access the server IP through web browser
~~~sh
curl -I http://SERVER-IP:8889
curl -L http://SERVER-IP:8889
~~~

You can also push this image to Docker Hub repositories

[Docker Hub repositories](https://docs.docker.com/docker-hub/repos/) allow you to share container images with your team, customers, or the Docker community at large.

## Author
Created by @Arboulahdour

<a href="mailto:ar.boulahdour@outlook.com">E-mail me !</a>
