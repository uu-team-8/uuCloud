const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

const db = require("./db");
const mongo_uri = process.env.MONGO_URI;
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const jwtExpireTime = process.env.JWT_EXPIRE_TIME || "1h";

// LOGIN route

router.post("/login", (req, res) => {
  //console.log("req.body", req.body);
  if (req.body.email && req.body.password) {
    db.getUser(req.body.email).then((user) => {
      if (user.length > 0) {
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            console.log(err);
          }
          if (result) {
            // Send JWT
            const token = jwt.sign(user[0], jwtSecretKey, {
              expiresIn: jwtExpireTime,
            });
            console.log("login successful");
            res.send({ success: true, token: token });
          } else {
            // response is OutgoingMessage object that server response http request
            res.status(401).json({ success: false, message: "Wrong password" });
          }
        });
      } else {
        // No Content
        res.status(400).json({ success: false, message: "User not exist" });
      }
    });
  } else {
    // No Content
    res.sendStatus(204);
  }
});

// REGISTER route

router.post("/register", (req, res) => {
  console.log("register");
  if (
    req.body.name &&
    req.body.lastname &&
    req.body.nickname &&
    req.body.email &&
    req.body.password
  ) {
    db.checkNicknameEMail(req.body.nickname, req.body.email).then((check) => {
      console.log("check", check);
      if (check.nickname || check.email) {
        res.send(check);
      } else {
        bcrypt.hash(req.body.password, 10).then((hash) => {
          const timeElapsed = Date.now();
          const timeNow = new Date(timeElapsed);
          var user = {
            name: req.body.name,
            lastname: req.body.lastname,
            nickname: req.body.nickname,
            email: req.body.email,
            password: hash,
            registered: timeNow.toISOString(),
            role: ["member"],
          };
          db.registerUser(user).then((ret) =>
            res.send({ status: "registered" })
          );
        });
      }
    });
  } else {
    // No Content
    res.sendStatus(204);
  }
});

// USER route (requires JWT token) returns user object

router.get("/user", (req, res) => {
  console.log("user");
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, jwtSecretKey, (err, decoded) => {
      if (err) {
        console.log("error 401");
        res
          .status(401)
          .json({ success: false, message: "Failed to authenticate token." });
      } else {
        // if everything is good, save to request for use in other routes
        res.send(decoded);
      }
    });
  } else {
    res.status(401).json({ success: false, message: "No token provided." });
  }
});

module.exports = router;
