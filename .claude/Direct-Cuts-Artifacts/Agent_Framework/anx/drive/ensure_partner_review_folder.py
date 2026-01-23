
import json
import sys
import os
from drive_client import DriveClient

# Load Config
CONFIG_PATH = r"C:\Dev\Direct-Cuts\config\anx_drive_config.json"
with open(CONFIG_PATH, 'r') as f:
    config = json.load(f)

ROOT_ID = config["drive_root_id"]
CREDS = config["credentials_path"]
TOKEN = config["token_path"]

TARGET_PATH = "7. Legal & Compliance/Partner Review"

def main():
    print(f"Platform Ops: Ensuring '{TARGET_PATH}' exists...")
    try:
        client = DriveClient(ROOT_ID, CREDS, TOKEN)
        
        # We need to resolve locally based on names, since resolve_path works on full paths.
        # But we want to create if missing.
        # Let's verify "7. Legal & Compliance" exists first.
        
        parts = TARGET_PATH.split('/')
        current_id = ROOT_ID
        
        path_so_far = ""
        for part in parts:
            path_so_far += "/" + part
            found = client._find_child(current_id, part)
            if found:
                current_id = found['id']
                print(f"Found: {part} ({current_id})")
            else:
                print(f"Missing: {part}. Creating...")
                # Note: This is an ADMIN action bypassing RBAC logic for creation transparency
                current_id = client.create_folder(current_id, part)
                print(f"Created: {part} ({current_id})")
                
        print(f"FINAL FOLDER ID: {current_id}")
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
