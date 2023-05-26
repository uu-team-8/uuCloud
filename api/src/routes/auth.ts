import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";

import bcrypt from "bcrypt";
import crypto from "crypto";
import { mysqlDB } from "../databases";

// REGISTRACE

interface RegisterReq {
    name: string
    email: string
    password: string
}

export async function register(req: Request, res: Response) {
    const data: RegisterReq = req.body;

    if (data.name == "" || data.password == "" || data.email == "") {
        console.error("Nejsou vyplněna některá pole");
        return res.json({ success: false, message: "Registrace se nezdařila" });
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const emailValid = emailRegex.test(data.email);

    if (!emailValid) {
        console.error("Email není validní");
        return res.json({ success: false, message: "Resigtrace se nezdařila" });
    }

    let user: RowDataPacket;
    try {
        [user] = await mysqlDB.execute("SELECT (id) FROM user WHERE email = ?", [data.email]) as RowDataPacket[];
    } catch (e) {
        console.error(e);
        return res.json({ succes: false });
    }

    if (user.length) {
        console.error("Účet s tímto emailem již existuje");
        return res.json({ success: false, message: "Účet s tímto emailem již existuje" });
    }

    let hashedPassword: string;

    try {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(data.password, salt);
    } catch (e) {
        console.error(e);
        return res.json({ success: false });
    }

    try {
        await mysqlDB.execute(`INSERT INTO user (name, email, password) VALUES (?, ?, ?)`, [data.name, data.email, hashedPassword]);
    } catch (e) {
        console.error(e);
        return res.json({ success: false });
    }

    console.log("Uživatel byl úspěšně zaregistrován");
    return res.json({ success: true, message: "Registrace proběhla úspěšně" });
}

// PŘIHLÁŠENÍ

function generateSecureToken() {
    const buffer = crypto.randomBytes(64);
    return buffer.toString("hex");
}

interface LoginReq {
    email: string
    password: string
}

export async function login(req: Request, res: Response) {
    const data: LoginReq = req.body;
    if (data.password == "" || data.email == "") {
        console.error("Nejsou vyplněna některá pole");
        return res.json({ success: false, message: "Špatně zadaný email nebo heslo" });
    }

    let rows: RowDataPacket;
    try {
        [rows] = await mysqlDB.execute("SELECT password, id, name, surname FROM user WHERE email = ?", [data.email]) as RowDataPacket[];
    } catch (e) {
        console.error(e);
        return res.json({ succes: false });
    }

    if (!rows) {
        console.error("Uživatel nenalezen");
        return res.json({ success: false, message: "Špatně zadaný email nebo heslo" });
    }

    const user = rows[0];
    let validPassword = false;
    try {
        validPassword = await bcrypt.compare(data.password, user.password);
    } catch (e) {
        console.error(e);
    }

    if (!validPassword) {
        console.error("Chybné heslo");        
        return res.json({ success: false, message: "Špatně zadaný email nebo heslo" });
    }

    const token = generateSecureToken();

    try {
        await mysqlDB.execute("INSERT INTO session (token, ip, user) VALUES (?, ?, ?)", [token, req.ip, user.id]);
    } catch (e) {
        console.error(e);
        return res.json({ success: false });
    }

    console.log("Uživatel přihlášen");
    return res.json({ success: true, user: { id: user.id, token: token, name: user.name, surname: user.surname } });
}

// ODHLÁŠENÍ

export async function logout(req: Request, res: Response) {
    const session = await getLoggedUserSession(req);
    if (!session) {
        console.error("");
        res.json({ success: false });
    }

    try {
        await mysqlDB.execute("DELETE FROM session WHERE token = ?", [session.token]);
    } catch (e) {
        console.error(e);
        res.json({ success: false });
    }

    res.json({ success: true, message: "Odhlášení proběhlo úspěšně" });
}

// ZÍSKANÍ SESSION

async function getLoggedUserSession(req: Request) {
    const token = req.header("Authorization");
    if (!token) {
        return null;
    }

    const splittedToken = token.split(" ");
    if (splittedToken[0] != "token") {
        return null;
    }

    let session: RowDataPacket;
    try {
        [session] = await mysqlDB.execute("SELECT * FROM session WHERE token = ?", [splittedToken[1]]) as RowDataPacket[];
    } catch (e) {
        console.error(e);
        return null;
    }

    return session[0];
}