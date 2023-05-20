import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import crypto from "crypto-js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "uuMeteoStation"
});
// TODO dodělat všechny typy na frontendu a backendu

interface RegisterReq {
    name: string
    surname: string
    email: string
    password: string
}

app.post("/register", async (req, res) => {
    const data: RegisterReq = req.body;

    if (data.name == "" || data.password == "" || data.email == "" || data.surname == "") {
        console.log("Nejsou vyplněna některá pole");
        return res.json({ success: false, message: "Registrace se nezdařila" });
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const emailValid = emailRegex.test(data.email);

    if (!emailValid) {
        console.log("Email není validní");
        return res.json({ success: false, message: "Resigtrace se nezdařila" });
    }

    const [user] = await db.execute("SELECT (id) FROM user WHERE email = ?", [data.email]);

    if (!user) {
        console.log("Účet s tímto emailem již existuje");
        return res.json({ success: false, message: "Účet s tímto emailem již existuje" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data.password, salt);

    await db.execute(`INSERT INTO user (name, surname, email, password) VALUES (?, ?, ?, ?)`, [data.name, data.surname, data.email, hash]);
    console.log("Uživatel byl úspěšně zaregistrován");
    return res.json({ success: true, message: "Registrace proběhla úspěšně" });
});

// TODO crypto je depreacted, místo toho použít crypto-js
function generateSecureToken() {
    return "";
    //const buffer = crypto.randomBytes(120);
    //return buffer.toString("hex");
}

interface LoginReq {
    email: string
    password: string
}

app.post("/login", async (req, res) => {
    const data: LoginReq = req.body;
    if (data.password == "" || data.email == "") {
        console.log("Nejsou vyplněna některá pole");
        return res.json({ success: false, message: "Špatně zadaný email nebo heslo" });
    }

    const [rows] = await db.execute("SELECT password, id, name, surname FROM user WHERE email = ?", [data.email]) as mysql.RowDataPacket[];
    if (!rows) {
        console.log("Uživatel nenalezen");
        return res.json({ success: false, message: "Špatně zadaný email nebo heslo" });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(data.password, user.password);

    if (!validPassword) {
        console.log("Chybné heslo");
        return res.json({ success: false, message: "Špatně zadaný email nebo heslo" });
    }

    const token = generateSecureToken();

    await db.execute("INSERT INTO session (token, ip, user) VALUES (?, ?, ?)", [token, req.ip, user.id]);

    console.log("Uživatel přihlášen");
    return res.json({ token: token, name: user.name, surname: user.surname, id: user.id });
});

app.post("/logout", async (req, res) => {
    await db.execute("DELETE FROM session WHERE token = ?", [req.body.token]);
    res.json(true)
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});