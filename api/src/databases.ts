import type { Pool } from "mysql2/promise";
import type { QueryApi } from "@influxdata/influxdb-client";

import mysql from "mysql2/promise";
import { InfluxDB } from "@influxdata/influxdb-client";

export let mysqlDB: Pool;
export let influxDB: QueryApi;

function initDatabases() {
    mysqlDB = mysql.createPool({
        host: "127.0.0.1",
        user: "root",
        password: "",
        database: "uuMeteoStation"
    });

    const url = process.env.INFLUX_DB_URL;
    const token = process.env.INFLUX_DB_TOKEN;
    const org = process.env.INFLUX_DB_ORG;

    if (url && org) {
        influxDB = new InfluxDB({ url, token }).getQueryApi(org);
    }
}

export default initDatabases;