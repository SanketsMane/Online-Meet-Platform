#!/bin/bash

API_KEY_SECRET="kidokoolsfu_default_secret"
KIDOKOOL_URL="https://sfu.kidokool.com/api/v1/token"
#KIDOKOOL_URL="http://localhost:3010/api/v1/token"

curl $KIDOKOOL_URL \
    --header "authorization: $API_KEY_SECRET" \
    --header "Content-Type: application/json" \
    --data '{"username":"username","password":"password","presenter":"true", "expire":"1h"}' \
    --request POST