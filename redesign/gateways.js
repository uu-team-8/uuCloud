const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

const jwtSecretKey = process.env.JWT_SECRET_KEY;
const mongo_uri = process.env.MONGO_URI;

router.post("/gateway/register", (req, res) => {
  console.log("register gateway");
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, jwtSecretKey, (err, decoded) => {
      if (err) {
        console.log(err);
        res.sendStatus(401);
      } else {
        console.log("decoded", decoded);
        //check if body has all required fields
        if (
          req.body.name &&
          req.body.location &&
          req.body.apikey &&
          req.body.visibility
        ) {
          //create gateway
          const timeElapsed = Date.now();
          const timeNow = new Date(timeElapsed);
          var gateway = {
            name: req.body.name,
            location: req.body.location,
            apikey: req.body.apikey,
            visibility: req.body.visibility,
            registered: timeNow.toISOString(),
            owner: decoded.nickname,
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

module.exports = router;
