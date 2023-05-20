import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import crypto from "crypto";

const app = express();
const PORT = 3000;

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
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const emailValid = emailRegex.test(req.body.email);

  const [user] = await db.execute("SELECT (id) FROM user WHERE email = ?", [req.body.email]);
  console.log(user);

  if (user.length) {
    console.log("Účet s tímto emailem již existuje");
    return res.json({ success: false, message: "Účet s tímto emailem již existuje" });
  }

  if (!emailValid) {
    console.log("Email není validní");
    return res.json({ success: false, message: "Resigtrace se nezdařila" });
  }

  if (req.body.name == "" || req.body.password == "" || req.body.email == "" || req.body.surname == "") {
    console.log("Nejsou vyplněna některá pole");
    return res.json({ success: false, message: "Registrace se nezdařila" });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.password, salt);

  await db.execute(`INSERT INTO user (name, surname, email, password) VALUES (?, ?, ?, ?)`, [req.body.name, req.body.surname, req.body.email, hash]);
  console.log("Uživatel byl úspěšně zaregistrován");
  return res.json({ success: true, message: "Registrace proběhla úspěšně" });
});

function generateSecureToken() {
  const buffer = crypto.randomBytes(120);
  return buffer.toString("hex");
}

app.post("/login", async (req, res) => {
  if (req.body.password == "" || req.body.email == "") {
    console.log("Nejsou vyplněna některá pole");
    return res.json({ success: false, message: "Špatně zadaný email nebo heslo" });
  }

  const [rows] = await db.execute("SELECT password, id, name, surname FROM user WHERE email = ?", [req.body.email]);
  if (!rows || rows.length == 0) {
    console.log("Uživatel nenalezen");
    return res.json({ success: false, message: "Špatně zadaný email nebo heslo" });
  }

  const user = rows[0];
  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) {
    console.log("Chybné heslo");
    return res.json({ success: false, message: "Špatně zadaný email nebo heslo" });
  }

  const token = generateSecureToken();

  await db.execute("INSERT INTO session (token, ip, user) VALUES (?, ?, ?)", [token, req.ip, user.id]);

  console.log("Uživatel přihlášen");
  return res.json({ token: token, name: user.name, surname: user.surname, id: user.id });
});

<<<<<<< Updated upstream
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
=======
app.post("/logout", async (req, res) => {

  await db.execute("DELETE FROM session WHERE token = ?", [req.body.token]);
  res.json(true)
});


























app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
>>>>>>> Stashed changes
});