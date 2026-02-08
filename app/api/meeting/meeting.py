# pip3 install requests
import requests
import json

API_KEY_SECRET = "kidokoolsfu_default_secret"
KIDOKOOL_URL = "https://sfu.kidokool.com/api/v1/meeting"
# KIDOKOOL_URL = "http://localhost:3010/api/v1/meeting"

headers = {
    "authorization": API_KEY_SECRET,
    "Content-Type": "application/json",
}

response = requests.post(
    KIDOKOOL_URL,
    headers=headers
)

print("Status code:", response.status_code)
data = json.loads(response.text)
print("meeting:", data["meeting"])
