const express           = require('express');
const path              = require('path');
const fs                = require('fs');
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
// var mongoUrlLocal = ""

// To use when you start the application as docker container
var mongoUrlDocker = "mongodb://admin:password@mongodb";

// Pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
var mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// "productApp" database name used
var databaseName = "productApp";

app.post('/update-product', function (req, res) {
  var productObj = req.body;

  MongoClient.connect(mongoUrlDocker, mongoClientOptions, function (err, client) {
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
  MongoClient.connect(mongoUrlDocker, mongoClientOptions, function (err, client) {
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
