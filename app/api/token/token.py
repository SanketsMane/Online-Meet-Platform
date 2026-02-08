# pip3 install requests
import requests
import json

API_KEY_SECRET = "kidokoolsfu_default_secret"
KIDOKOOL_URL = "https://sfu.kidokool.com/api/v1/token"
#KIDOKOOL_URL = "http://localhost:3010/api/v1/token"

headers = {
    "authorization": API_KEY_SECRET,
    "Content-Type": "application/json",
}

data = {
    "username": "username",
    "password": "password",
    "presenter": "true",
    "expire": "1h"
}

response = requests.post(
    KIDOKOOL_URL, 
    headers=headers, 
    json=data
)

print("Status code:", response.status_code)
data = json.loads(response.text)
print("token:", data["token"])
