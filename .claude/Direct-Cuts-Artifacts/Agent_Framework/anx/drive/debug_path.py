
from drive_client import DriveClient
import sys

CONFIG_FILE = r"C:\Dev\Direct-Cuts\config\anx_drive_config.json"
import json

def load_config():
    with open(CONFIG_FILE, 'r') as f:
        return json.load(f)

CONFIG = load_config()
ROOT_FOLDER_ID = CONFIG["drive_root_id"]
CREDENTIALS_FILE = CONFIG["credentials_path"]
TOKEN_FILE = CONFIG["token_path"]

client = DriveClient(ROOT_FOLDER_ID, CREDENTIALS_FILE, TOKEN_FILE)

paths = [
    "7. Legal & Compliance",
    "/7. Legal & Compliance",
    "2. Financial",
    "9. Evidence"
]

print(f"Root ID: {ROOT_FOLDER_ID}")
print("Files in root:")
for f in client.list_files(ROOT_FOLDER_ID):
    if f['mimeType'] == 'application/vnd.google-apps.folder':
        print(f"  [{f['id']}] '{f['name']}'")

print("\nResolving paths:")
for p in paths:
    id = client.resolve_path(p)
    print(f"Path '{p}' -> {id}")
