# pip3 install requests
import requests
import json

API_KEY_SECRET = "kidokoolsfu_default_secret"
KIDOKOOL_URL = "https://sfu.kidokool.com/api/v1/join"
# KIDOKOOL_URL = "http://localhost:3010/api/v1/join"

headers = {
    "authorization": API_KEY_SECRET,
    "Content-Type": "application/json",
}

data = {
    "room": "test",
    "roomPassword": "false",
    "name": "kidokoolsfu",
    "avatar": "false",
    "audio": "false",
    "video": "false",
    "screen": "false",
    "chat": "false",
    "hide": "false",
    "notify": "true",
    "duration": "unlimited",
    "token": {
        "username": "username",
        "password": "password",
        "presenter": "true",
        "expire": "1h",
    }
}

response = requests.post(
    KIDOKOOL_URL,
    headers=headers,
    json=data,
)

print("Status code:", response.status_code)
data = json.loads(response.text)
print("join:", data["join"])
