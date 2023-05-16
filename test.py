#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from pymongo import MongoClient

CONNECTION_STRING = "mongodb://vpetras:fM3dgeN4MjHIf7qThF9m3kEg@136.244.82.171:27017/?authMechanism=DEFAULT"

client = MongoClient(CONNECTION_STRING)
iot_db = client["IoTCloud"]
gtw_col = iot_db['Gateways']

item = {
    "name": "FVE",
    "location": "Varnsdorf",
    "owner": "Sonic",
    "visibility": "public",
    "sensors": ["FVE Power 1", "FVE Power 2", "Grid Power L1", "Grid Power L2", "Grid Power L2"]
}
print(gtw_col.insert_one(item))
