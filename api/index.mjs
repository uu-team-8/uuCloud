import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import crypto from "crypto";

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "uuMeteoStation"
});

app.post("/register", async (req, res) => {

  const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const EmailValid = regex.test(req.body.email);
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.password, salt);

  const [rows] = await db.execute("SELECT (id) FROM user WHERE email = ?", [req.body.email]);

  if (rows != "") {
    console.log("Účet již existuje")
    return res.json(false);
  }

  if (!EmailValid) {
    console.log("Email není validní")
    return 
  }

  if (req.body.name == "" || req.body.password == "" || req.body.email == "") {
    console.log("Nejsou vyplněna některá pole")
    return 
  }

  await db.execute(`INSERT INTO user (name, email, password) VALUES (?, ?, ?)`, [req.body.name, req.body.email, hash]);
  console.log("Uživatel byl úspěšně zaregistrován");
  return res.json(true);
});



function generateSecureToken() {
  const buffer = crypto.randomBytes(120);
  return buffer.toString("hex");
}

app.post("/login", async (req, res) => {
  if (req.body.password == "" || req.body.email == "") {
    console.log("Nejsou vyplněna některá pole");
    return res.json(false);
  }

  const [rows] = await db.execute("SELECT password, id, name, FROM user WHERE email = ?", [req.body.email]);
  if (!rows || rows.length == 0) {
    console.log("Uživatel nenalezen");
    return res.json(false);
  }

  const user = rows[0];
  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) {
    console.log("Chybné heslo")
    return res.json(false);
  }

  const token = generateSecureToken();

  await db.execute("INSERT INTO session (token, ip, user) VALUES (?, ?, ?)", [token, req.ip, user.id]);

  console.log("Uživatel přihlášen");
  return res.json({ token: token, name: user.name, id: user.id });
});




























app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });