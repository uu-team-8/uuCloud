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

@app.route("/")
def home():
    return "Welcome to api"

@app.route("/v1/sensor", methods=["POST"])
def sensor():
    raw_data = request.data.decode('utf-8').rstrip()
    print(raw_data)
    return "ok"

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=8000)
    except Exception as e:
        print(e)
        sys.exit()