const { InfluxDB, Point } = require("@influxdata/influxdb-client");

const influx_url = process.env.INFLUXDB_URI;
const influx_token = process.env.INFLUXDB_TOKEN;
const influx_org = process.env.INFLUXDB_ORG;
const influx_bucket = process.env.INFLUXDB_BUCKET;

async function getGatewayData(gtw_id, gtw_query) {
  const fluxQuery = `from(bucket:"${influx_bucket}") |> range(start: ${
    gtw_query.start
  } ${
    gtw_query.stop ? ",stop: " + gtw_query.stop : ""
  }) |> filter(fn: (r) => r._measurement == "${gtw_id}")`;
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

async function writeData(gtw_id, sensor_data) {
  const writeApi = new InfluxDB({
    url: influx_url,
    token: influx_token,
  }).getWriteApi(influx_org, influx_bucket);
  const point = new Point(gtw_id).floatField(
    sensor_data.name,
    sensor_data.value
  );
  writeApi.writePoint(point);
  writeApi
    .close()
    .then(() => {
      console.log("FINISHED");
    })
    .catch((e) => {
      console.error(e);
      console.log("\nFinished ERROR");
    });
}

module.exports = { getGatewayData, writeData };
