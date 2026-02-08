#!/bin/bash

API_KEY_SECRET="kidokoolsfu_default_secret"
KIDOKOOL_URL="https://sfu.kidokool.com/api/v1/stats"
#KIDOKOOL_URL="http://localhost:3010/api/v1/stats"

curl $KIDOKOOL_URL \
    --header "authorization: $API_KEY_SECRET" \
    --header "Content-Type: application/json" \
    --request GET
