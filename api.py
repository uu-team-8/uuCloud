#!/usr/bin/env python3
# -*- coding: utf-8 -*-

###################################################
# REST-API
# Title: API to save measured data to influxdb
# Author: Vojtěch Petrásek
# Generated: 21/02/2023 15:18:21
###################################################

from datetime import datetime
import sys
import json

from flask import Flask, request
from flask_swagger_ui import get_swaggerui_blueprint
from flask_cors import CORS, cross_origin
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from pymongo import MongoClient

###
# flask setup
###

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

### swagger specific ###
SWAGGER_URL = '/swagger'
API_URL = '/static/swagger.json'
SWAGGERUI_BLUEPRINT = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "uuCloud API"
    }
)
app.register_blueprint(SWAGGERUI_BLUEPRINT, url_prefix=SWAGGER_URL)

###
# mongodb setup
###

CONNECTION_STRING = "mongodb://vpetras:fM3dgeN4MjHIf7qThF9m3kEg@136.244.82.171:27017/?authMechanism=DEFAULT"

###
# influxdb setup
###

token = ""
with open("test/secret_token.txt", "r") as t:
    token = t.readline().rstrip()
bucket = "test"
org = "uu team 8"
client = InfluxDBClient(
    url="https://influx.uu.vojtechpetrasek.com", token=token, org=org)
write_api = client.write_api(write_options=SYNCHRONOUS)


@app.route("/")
def home():
    return "Welcome to api"


@app.route("/v1/gateway", methods=["POST", "GET"])
def gateway():
    if request.method == 'GET':
        try:
            client = MongoClient(CONNECTION_STRING)
            iot_db = client["IoTCloud"]
            gtw_col = iot_db['Gateways']
            gtws = gtw_col.find()
            out = []
            for item in gtws:
               # This does not give a very readable output
                id = str(item["_id"])
                item["_id"] = id
                out.append(item)
                # out.append(json.load(item))
            return out
        except Exception as e:
            print(e)
            return {"status": "error"}
    else:
        return {"status": "post"}


@app.route("/v1/sensor", methods=["POST"])
def sensor():
    raw_data = request.json
    for i in raw_data:
        p = Point("my_measurement").tag("location", "Prague").field(
            i, float(raw_data[i]))
        write_api.write(bucket=bucket, record=p)
    # print(raw_data)
    return "ok"


@app.route("/v1/sensor/<sensor_id>", methods=["POST"])
def sensor2(sensor_id):
    raw_data = request.json
    for i in raw_data:
        p = Point(str(sensor_id)).tag("location", "Prague").field(
            i, float(raw_data[i]))
        write_api.write(bucket=bucket, record=p)
    # print(raw_data)
    return "ok"


@app.route("/v1/solar", methods=["POST"])
def solar():
    data = json.loads(request.json)
    for i in data:
        try:
            p = Point("fve_home").tag(
                "location", "Varnsdorf").field(i, float(data[i][0]))
            write_api.write(bucket="fve", record=p)
        except Exception as e:
            # print(e)
            pass
    return "ok"


if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=8000)
    except Exception as e:
        print(e)
        sys.exit()
