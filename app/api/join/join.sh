#!/bin/bash

# Configuration
API_KEY_SECRET="kidokoolsfu_default_secret"
KIDOKOOL_URL="https://sfu.kidokool.com/api/v1/join"
# Alternative URL for local testing:
# KIDOKOOL_URL="http://localhost:3010/api/v1/join"

# Request data with proper JSON formatting
REQUEST_DATA='{
    "room": "test",
    "roomPassword": false,
    "name": "kidokoolsfu",
    "avatar": false,
    "audio": false,
    "video": false,
    "screen": false,
    "chat": false,
    "hide": false,
    "notify": true,
    "duration": "unlimited",
    "token": {
        "username": "username",
        "password": "password",
        "presenter": true,
        "expire": "1h"
    }
}'

# Make the API request
curl -X POST "$KIDOKOOL_URL" \
    -H "Authorization: $API_KEY_SECRET" \
    -H "Content-Type: application/json" \
    -d "$REQUEST_DATA"