const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
var cors = require("cors");
const multer = require("multer");
const upload = multer();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/swagger.json");

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/v4/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors());

dotenv.config();

//router

const auth = require("./auth.js");
const gateways = require("./gateways.js");
const sensors = require("./sensors.js");

app.use("/v4/", auth);
app.use("/v4/", gateways);
app.use("/v4/", sensors);

// Express setings
const hostname = "0.0.0.0";
const port = process.env.PORT || 5001;

var server = app.listen(port, hostname, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});
