import { Request, Response } from "express";
import { influxDB } from "../databases";

export async function getTemperature(req: Request, res: Response) {
    const fluxQuery =
        'from(bucket:"test") |> range(start: 0) |> filter(fn: (r) => r._measurement == "my_measurement") |> filter(fn: (r) => r._field == "temperature") |> last()'

    const myQuery = async () => {
        for await (const { values, tableMeta } of influxDB.iterateRows(fluxQuery)) {
            const o = tableMeta.toObject(values);
            console.log(
                `${o._time} ${o._measurement} in '${o.location}'(${o.sensor_id}): ${o._field} = ${o._value}`
            );
        }
    };

    const data = await myQuery();
    console.log(data);
}