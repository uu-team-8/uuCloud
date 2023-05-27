import type { Request, Response } from "express";
import { mysqlDB } from "../databases";

export async function getGateway(req: Request, res: Response) {

}

interface EditGatewayReq {
    id: number
    name: string
    secret: string
    ip: string
    owner: number
}

export async function editGateway(req: Request, res: Response) {
    const data: EditGatewayReq = req.body;

    try {
        await mysqlDB.execute("UPDATE gateway SET name = ? WHERE id = ?", [data.name, data.id]);
    } catch (e) {
        console.error(e);
        res.json({ success: false });
    }

    res.json({ success: true, message: "Změna dat proběhla úspěšně" });
}

export async function deleteGateway(req: Request, res: Response) {
    const id = req.params.id;

    try {
        await mysqlDB.execute("DELETE FROM gateway WHERE id = ?", [id]);
    } catch (e) {
        console.error(e);
        res.json({ success: false });
    }

    res.json({ success: true });
}
