#!/usr/bin/env python3
# -*- coding: utf-8 -*-

###################################################
# Conector to db
# Title: Connector which sends data to influxdb
# Author: Vojtěch Petrásek
# Generated: 21/02/2023 22:22:22
###################################################

###
# imports
###

import sys
import time
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

###
# main
###

def main():
    token = ""
    with open("secret_token.txt", "r") as t:
        token = t.readline().rstrip()
        
    bucket = "d70c4c066310c72e"
    org = "uu team 8"
    
    client = InfluxDBClient(url="https://influx.uu.vojtechpetrasek.com", token=token, org=org)
    print(client)
    write_api = client.write_api(write_options=SYNCHRONOUS)
    query_api = client.query_api()
    p = Point("my_measurement").tag("location", "Prague").field("temperature", 25.3)
    write_api.write(bucket=bucket, record=p)
    query = ' from(bucket:"test")\
            |> range(start: -10m)\
            |> filter(fn:(r) => r._measurement == "my_measurement")'
    #        |> filter(fn: (r) => r.location == "coyote_creek")\
    #        |> filter(fn:(r) => r._field == "water_level" )
    tables = query_api.query(query)

    for table in tables:
        print(table)
        for row in table.records:
            print (row.values)
    

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(e)
        sys.exit()