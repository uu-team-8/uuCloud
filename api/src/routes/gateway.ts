import type { Request, Response } from "express";
import { InfluxDB } from "@influxdata/influxdb-client";

const influx_url = process.env.INFLUXDB_URI;
const influx_token = process.env.INFLUXDB_TOKEN;
const influx_org = process.env.INFLUXDB_ORG;
const influx_bucket = process.env.INFLUXDB_BUCKET;

interface GatewayQuery {
    id: string
    start: string
    stop: string
}

interface GetGatewayDataReq {
    id: number
    query: GatewayQuery
}

export async function getGatewayData(req: Request, res: Response) {
    const data: GetGatewayDataReq = req.body;

    const fluxQuery = `from(bucket:"${influx_bucket}") |> range(start: ${data.query.start
        } ${data.query.stop ? ",stop: " + data.query.stop : ""
        }) |> filter(fn: (r) => r._measurement == "${data.id}")`;
    if (influx_url && influx_org) {
        const queryApi = new InfluxDB({
            url: influx_url,
            token: influx_token,
        }).getQueryApi(influx_org);
        const result = [];
        for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
            const o = tableMeta.toObject(values);
            result.push(o);
        }
        return result;
    }
}
