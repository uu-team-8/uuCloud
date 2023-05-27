const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

const db = require("./db");
const influx = require("./influx_db");
const jwtSecretKey = process.env.JWT_SECRET_KEY;

router.post("/gateway/register", (req, res) => {
  console.log("register gateway");
  console.log(req.body);
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, jwtSecretKey, (err, decoded) => {
      if (err) {
        console.log(err);
        res.sendStatus(401);
      } else {
        console.log("decoded", decoded);
        //check if body has all required fields
        if (req.body.name && req.body.location && req.body.apikey) {
          console.log("all fields present");
          //create gateway
          const timeElapsed = Date.now();
          const timeNow = new Date(timeElapsed);
          var gateway = {
            name: req.body.name,
            location: req.body.location,
            apikey: req.body.apikey,
            visibility: req.body.visibility ? "Public" : "Private",
            registered: timeNow.toISOString(),
            owner: decoded.nickname,
            owner_id: decoded._id,
            status: "active",
            sensors: [],
          };
          db.registerGateway(gateway).then((ret) =>
            res.send({ status: "gateway registered" })
          );
        }
      }
    });
  } else {
    // No Content
    res.sendStatus(204);
  }
});

router.get("/gateways", (req, res) => {
  console.log("get gateways");
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, jwtSecretKey, (err, decoded) => {
      if (err) {
        console.log(err);
        res.sendStatus(401);
      } else {
        console.log("decoded", decoded);
        var admin = false;
        if (decoded.role.includes("admin")) {
          admin = true;
          console.log("admin");
        }
        db.getGateways(decoded._id, admin).then((gateways) => {
          res.send(gateways);
        });
      }
    });
  } else {
    // No Authorization
    res.sendStatus(401);
  }
});

router.put("/gateway/update", (req, res) => {
  console.log("update gateway");
  console.log(req.body);
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, jwtSecretKey, (err, decoded) => {
      if (err) {
        console.log(err);
        res.sendStatus(401);
      } else {
        console.log("decoded", decoded);

        if (jwt.decoded.nickname == req.body.owner) {
          console.log("all fields present");
          //update gateway
          var gateway = {
            name: req.body.name,
            location: req.body.location,
            apikey: req.body.apikey,
            visibility: req.body.visibility ? "Public" : "Private",
            registered: timeNow.toISOString(),
            owner: decoded.nickname,
            status: "active",
            sensors: [],
          };
          var admin = false;
          if (decoded.role.includes("admin")) {
            admin = true;
          }
          db.updateGateway(gateway, req.body.id, decoded_id, admin).then(
            (ret) => res.send({ status: "gateway updated" })
          );
        } else {
          res.sendStatus(401);
        }
      }
    });
  } else {
    // No Content
    res.sendStatus(204);
  }
});

// POST gateway data to influxdb
router.post("/gateway", (req, res) => {
  if (req.headers.apikey) {
    const apikey = req.headers.apikey;
    db.getGatewayByApikey(apikey).then((gateway) => {
      if (gateway.length != 0) {
        const gtw_id = String(gateway[0]._id);
        const sensor_data = req.body;
        console.log(sensor_data);
        influx
          .writeData(gtw_id, sensor_data)
          .then((ret) => res.send({ status: "data written" }));
      } else {
        console.log("gateway not found");
        res.sendStatus(404);
      }
    });
  } else {
    // No Apikey
    res.sendStatus(401);
  }
});

// GET gateway data from influxdb
router.post("/gateway/data", (req, res) => {
  console.log("get gateway");
  console.log(req.body);
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, jwtSecretKey, (err, decoded) => {
      if (err) {
        console.log(err);
        res.sendStatus(401);
      } else {
        var gtw_id = req.body.gtw_id;
        console.log("decoded", decoded);
        var admin = false;
        if (decoded.role.includes("admin")) {
          admin = true;
        }
        db.getGatewayByOwner(decoded._id, gtw_id, admin).then((gateway) => {
          if (gateway.length == 0) {
            res.sendStatus(404);
          } else {
            if (gateway == "forbidden") {
              res.sendStatus(403);
            } else {
              if (gtw_id === "646cb40fad57ce242a491b6d") {
                gtw_id = "arduino";
              }
              influx.getGatewayData(gtw_id, req.body).then((data) => {
                res.send(data);
              });
            }
          }
        });
      }
    });
  } else {
    // No Authorization
    res.sendStatus(401);
  }
});

router.post("/gateway/delete/:id", (req, res) => {
  console.log("delete gateway");
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, jwtSecretKey, (err, decoded) => {
      if (err) {
        console.log(err);
        res.sendStatus(401);
      } else {
        console.log("decoded", decoded);
        var gtw_id = req.params.id;
        var admin = false;
        if (decoded.role.includes("admin")) {
          admin = true;
        }
        db.deleteGateway(gtw_id, decoded._id, admin).then((gateway) => {
          console.log("gateway", gateway);
          if (gateway.length == 0) {
            console.log("gateway not found");
            res.sendStatus(404);
          } else {
            if (gateway == "forbidden") {
              res.sendStatus(403);
            } else if (gateway == "not found") {
              res.sendStatus(404);
            } else {
              res.send({ status: "gateway deleted" });
            }
          }
        });
      }
    });
  } else {
    // No Authorization
    res.sendStatus(401);
  }
});

module.exports = router;
