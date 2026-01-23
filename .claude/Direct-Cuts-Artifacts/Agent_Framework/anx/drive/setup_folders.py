
import os
import sys
from drive_client import DriveClient

# CONFIG
ROOT_FOLDER_ID = "1KFd2O3k-hq8QS6QBPtUB6vTU8zJYzuFK"
CREDENTIALS_FILE = r"C:\Dev\Direct-Cuts\credentials.json"
TOKEN_FILE = r"C:\Dev\Direct-Cuts\token.json"

REQUIRED_FOLDERS = [
    "9. Evidence",
    "10. Infrastructure"
]

def main():
    print("Setting up required folders...")
    try:
        client = DriveClient(ROOT_FOLDER_ID, CREDENTIALS_FILE, TOKEN_FILE)
    except Exception as e:
        print(f"Failed to init client: {e}")
        return

    # Get existing folders
    root_files = client.list_files(ROOT_FOLDER_ID)
    existing_names = {f['name']: f['id'] for f in root_files if f['mimeType'] == 'application/vnd.google-apps.folder'}

    for folder in REQUIRED_FOLDERS:
        if folder in existing_names:
            print(f"Folder '{folder}' exists. ID: {existing_names[folder]}")
        else:
            print(f"Creating folder '{folder}'...")
            new_id = client.create_folder(ROOT_FOLDER_ID, folder)
            print(f"Created '{folder}'. ID: {new_id}")

if __name__ == "__main__":
    main()
