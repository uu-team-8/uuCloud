const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

router.get("/sensor", (req, res) => {
  res.send("sensor");
});

module.exports = router;
