import { InfluxDB, Point } from "@influxdata/influxdb-client";

/** Environment variables **/
const url = "https://influx.uu.vojtechpetrasek.com";
const token =
  "_cuBhBHPyCc9QxXIhu1jsXMJDIIWkANV_wNKl00ajFjqrrBorqDndMaYaUPnjQDgUT8y33Ut5__-wY948jVLUw==";
const org = "uu team 8";

/**
 * Instantiate the InfluxDB client
 * with a configuration object.
 *
 * Get a query client configured for your org.
 **/
const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

/** To avoid SQL injection, use a string literal for the query. */
const fluxQuery =
  'from(bucket:"test") |> range(start: 0) |> filter(fn: (r) => r._measurement == "my_measurement") |> filter(fn: (r) => r._field == "temperature") |> last()ls
  ';

const myQuery = async () => {
  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values);
    console.log(
      `${o._time} ${o._measurement} in '${o.location}' (${o.sensor_id}): ${o._field}=${o._value}`
    );
  }
};

/** Execute a query and receive line table metadata and rows. */
myQuery();
