import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";

import bcrypt from "bcrypt";
import db from "../database";

// REGISTRACE

interface RegisterReq {
    name: string
    surname: string
    email: string
    password: string
}

export async function register(req: Request, res: Response) {
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
}

// TODO dodělat všechny typy na frontendu a backendu
// TODO crypto je depreacted, místo toho použít crypto-js

// PŘIHLÁŠENÍ

function generateSecureToken() {
    return "123";
    //const buffer = crypto.randomBytes(120);
    //return buffer.toString("hex");
}

interface LoginReq {
    email: string
    password: string
}

export async function login(req: Request, res: Response) {
    const data: LoginReq = req.body;
    if (data.password == "" || data.email == "") {
        console.log("Nejsou vyplněna některá pole");
        return res.json({ success: false, message: "Špatně zadaný email nebo heslo" });
    }

    const [rows] = await db.execute("SELECT password, id, name, surname FROM user WHERE email = ?", [data.email]) as RowDataPacket[];
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
}

// ODHLÁŠENÍ

interface LogoutReq {
    token: string
}

export async function logout(req: Request, res: Response) {
    const data: LogoutReq = req.body;
    await db.execute("DELETE FROM session WHERE token = ?", [data.token]);
    res.json(true);
}
