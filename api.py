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

from flask import Flask, request
from flask_swagger_ui import get_swaggerui_blueprint
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

###
# flask setup
###

app = Flask(__name__)

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
# influxdb setup
###

token = ""
with open("test/secret_token.txt", "r") as t:
    token = t.readline().rstrip()
bucket = "test"
org = "uu team 8"
client = InfluxDBClient(url="https://influx.uu.vojtechpetrasek.com", token=token, org=org)
write_api = client.write_api(write_options=SYNCHRONOUS)

@app.route("/")
def home():
    return "Welcome to api"

@app.route("/v1/sensor", methods=["POST"])
def sensor():
    raw_data = request.data.decode('utf-8').rstrip().split(' ')
    p = Point("my_measurement").tag("location", "Prague").field(raw_data[0], float(raw_data[2]))
    write_api.write(bucket=bucket, record=p)
    print(raw_data)
    return "ok"

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=8000)
    except Exception as e:
        print(e)
        sys.exit()