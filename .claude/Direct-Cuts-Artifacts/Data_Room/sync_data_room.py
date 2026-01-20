#!/usr/bin/env python3
"""
Direct Cuts Data Room - Google Drive Sync Script
Syncs local data room folder to Google Drive with smart change detection.

Usage:
    python sync_data_room.py --dry-run    # Preview changes
    python sync_data_room.py              # Actually sync
    python sync_data_room.py --force      # Force re-upload all files
"""

import os
import sys
import json
import hashlib
import argparse
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List, Tuple

# Google Drive API imports
try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    GOOGLE_API_AVAILABLE = True
except ImportError:
    GOOGLE_API_AVAILABLE = False

# Configuration
# Note: Syncs the entire Data Room folder structure to Google Drive
# The drive_folder_id should be the root "Direct Cuts" folder in Drive
CONFIG = {
    "local_path": r"C:\Dev\Direct-Cuts\docs\Direct Cuts Data Room",
    "drive_folder_id": "1KFd2O3k-hq8QS6QBPtUB6vTU8zJYzuFK",  # Direct Cuts root folder
    "credentials_file": r"C:\Dev\Direct-Cuts\credentials.json",
    "token_file": r"C:\Dev\Direct-Cuts\token.json",
    "cache_file": r"C:\Dev\Direct-Cuts\.sync_cache.json",
    "scopes": ["https://www.googleapis.com/auth/drive.file"],
    "excluded_patterns": [
        ".git",
        "__pycache__",
        "*.pyc",
        ".DS_Store",
        "Thumbs.db",
        "*.tmp",
        "~$*"
    ]
}

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text: str):
    print(f"\n{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.HEADER}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.ENDC}\n")

def print_success(text: str):
    print(f"{Colors.GREEN}[SUCCESS]{Colors.ENDC} {text}")

def print_info(text: str):
    print(f"{Colors.CYAN}[INFO]{Colors.ENDC} {text}")

def print_warning(text: str):
    print(f"{Colors.YELLOW}[WARNING]{Colors.ENDC} {text}")

def print_error(text: str):
    print(f"{Colors.RED}[ERROR]{Colors.ENDC} {text}")

def print_upload(text: str):
    print(f"{Colors.BLUE}[UPLOAD]{Colors.ENDC} {text}")


class SyncCache:
    """Manages cache of uploaded files to detect changes."""

    def __init__(self, cache_file: str):
        self.cache_file = cache_file
        self.cache: Dict[str, dict] = {}
        self.load()

    def load(self):
        """Load cache from disk."""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r') as f:
                    self.cache = json.load(f)
            except Exception as e:
                print_warning(f"Could not load cache: {e}")
                self.cache = {}

    def save(self):
        """Save cache to disk."""
        try:
            with open(self.cache_file, 'w') as f:
                json.dump(self.cache, f, indent=2)
        except Exception as e:
            print_warning(f"Could not save cache: {e}")

    def get_file_hash(self, filepath: str) -> str:
        """Calculate MD5 hash of file."""
        hash_md5 = hashlib.md5()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()

    def needs_upload(self, filepath: str) -> Tuple[bool, str]:
        """Check if file needs to be uploaded."""
        rel_path = os.path.relpath(filepath, CONFIG["local_path"])
        current_hash = self.get_file_hash(filepath)
        current_mtime = os.path.getmtime(filepath)

        if rel_path not in self.cache:
            return True, "new"

        cached = self.cache[rel_path]
        if cached.get("hash") != current_hash:
            return True, "modified"

        return False, "unchanged"

    def mark_uploaded(self, filepath: str, drive_id: str):
        """Mark file as uploaded."""
        rel_path = os.path.relpath(filepath, CONFIG["local_path"])
        self.cache[rel_path] = {
            "hash": self.get_file_hash(filepath),
            "mtime": os.path.getmtime(filepath),
            "drive_id": drive_id,
            "uploaded_at": datetime.now().isoformat()
        }


class GoogleDriveSync:
    """Handles Google Drive synchronization."""

    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.service = None
        self.folder_cache: Dict[str, str] = {}  # path -> drive_id
        self.stats = {
            "uploaded": 0,
            "skipped": 0,
            "folders_created": 0,
            "errors": 0,
            "bytes_uploaded": 0
        }

    def authenticate(self) -> bool:
        """Authenticate with Google Drive API."""
        if not GOOGLE_API_AVAILABLE:
            print_error("Google API libraries not installed.")
            print_info("Run: pip install -r requirements-sync.txt")
            return False

        creds = None

        # Load existing token
        if os.path.exists(CONFIG["token_file"]):
            try:
                creds = Credentials.from_authorized_user_file(
                    CONFIG["token_file"],
                    CONFIG["scopes"]
                )
            except Exception as e:
                print_warning(f"Could not load token: {e}")

        # Refresh or get new credentials
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception:
                    creds = None

            if not creds:
                if not os.path.exists(CONFIG["credentials_file"]):
                    print_error(f"Credentials file not found: {CONFIG['credentials_file']}")
                    print_info("Download OAuth credentials from Google Cloud Console")
                    print_info("See SYNC_SETUP_GUIDE.md for instructions")
                    return False

                flow = InstalledAppFlow.from_client_secrets_file(
                    CONFIG["credentials_file"],
                    CONFIG["scopes"]
                )
                creds = flow.run_local_server(port=0)

            # Save token
            with open(CONFIG["token_file"], 'w') as token:
                token.write(creds.to_json())

        self.service = build('drive', 'v3', credentials=creds)
        return True

    def get_or_create_folder(self, folder_name: str, parent_id: str, full_path: str = "") -> str:
        """Get existing folder or create new one.

        Args:
            folder_name: Name of the folder to find/create
            parent_id: Google Drive ID of the parent folder
            full_path: Full relative path for logging purposes
        """
        cache_key = f"{parent_id}/{folder_name}"

        if cache_key in self.folder_cache:
            return self.folder_cache[cache_key]

        # Search for existing folder - ONLY direct children of parent
        query = (
            f"name='{folder_name}' and "
            f"'{parent_id}' in parents and "
            f"mimeType='application/vnd.google-apps.folder' and "
            f"trashed=false"
        )

        results = self.service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name)'
        ).execute()

        files = results.get('files', [])

        if files:
            folder_id = files[0]['id']
            self.folder_cache[cache_key] = folder_id
            if full_path:
                print_info(f"Found existing folder: {full_path}")
            return folder_id

        # Create folder
        if self.dry_run:
            path_display = full_path if full_path else folder_name
            print_info(f"Would create folder: {path_display}")
            return f"dry-run-{folder_name}"

        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [parent_id]
        }

        folder = self.service.files().create(
            body=file_metadata,
            fields='id'
        ).execute()

        folder_id = folder.get('id')
        self.folder_cache[cache_key] = folder_id
        self.stats["folders_created"] += 1
        path_display = full_path if full_path else folder_name
        print_success(f"Created folder: {path_display}")

        return folder_id

    def ensure_folder_path(self, rel_folder_path: str) -> str:
        """Ensure entire folder path exists, return final folder ID."""
        if not rel_folder_path or rel_folder_path == ".":
            return CONFIG["drive_folder_id"]

        parts = Path(rel_folder_path).parts
        current_parent = CONFIG["drive_folder_id"]
        current_path_parts = []

        for part in parts:
            current_path_parts.append(part)
            full_path = "/".join(current_path_parts)
            current_parent = self.get_or_create_folder(part, current_parent, full_path)

        return current_parent

    def upload_file(self, local_path: str, parent_id: str, filename: str) -> Optional[str]:
        """Upload a file to Google Drive."""
        if self.dry_run:
            size = os.path.getsize(local_path)
            print_upload(f"Would upload: {filename} ({self.format_size(size)})")
            return "dry-run-id"

        try:
            # Check if file already exists
            query = (
                f"name='{filename}' and "
                f"'{parent_id}' in parents and "
                f"trashed=false"
            )

            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name)'
            ).execute()

            files = results.get('files', [])

            file_metadata = {'name': filename}
            media = MediaFileUpload(local_path, resumable=True)

            if files:
                # Update existing file
                file_id = files[0]['id']
                updated = self.service.files().update(
                    fileId=file_id,
                    media_body=media
                ).execute()
                drive_id = updated.get('id')
                action = "Updated"
            else:
                # Create new file
                file_metadata['parents'] = [parent_id]
                created = self.service.files().create(
                    body=file_metadata,
                    media_body=media,
                    fields='id'
                ).execute()
                drive_id = created.get('id')
                action = "Uploaded"

            size = os.path.getsize(local_path)
            self.stats["bytes_uploaded"] += size
            print_upload(f"{action}: {filename} ({self.format_size(size)})")

            return drive_id

        except Exception as e:
            print_error(f"Failed to upload {filename}: {e}")
            self.stats["errors"] += 1
            return None

    @staticmethod
    def format_size(size: int) -> str:
        """Format file size for display."""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"

    def should_exclude(self, path: str) -> bool:
        """Check if path should be excluded from sync."""
        name = os.path.basename(path)

        for pattern in CONFIG["excluded_patterns"]:
            if pattern.startswith("*"):
                if name.endswith(pattern[1:]):
                    return True
            elif pattern in path:
                return True
            elif name == pattern:
                return True

        return False


def list_drive_structure(service, folder_id: str, prefix: str = "", max_depth: int = 2, current_depth: int = 0):
    """List the structure of a Google Drive folder."""
    if current_depth >= max_depth:
        return

    query = f"'{folder_id}' in parents and trashed=false"
    results = service.files().list(
        q=query,
        spaces='drive',
        fields='files(id, name, mimeType, createdTime)',
        orderBy='name'
    ).execute()

    items = results.get('files', [])

    for item in items:
        is_folder = item['mimeType'] == 'application/vnd.google-apps.folder'
        icon = "[DIR]" if is_folder else "[FILE]"
        created = item.get('createdTime', '')[:10]
        print(f"{prefix}{icon} {item['name']} ({created})")

        if is_folder and current_depth < max_depth - 1:
            list_drive_structure(service, item['id'], prefix + "  ", max_depth, current_depth + 1)


def scan_local_files(root_path: str) -> List[Tuple[str, str]]:
    """Scan local directory for files to sync."""
    files = []

    for dirpath, dirnames, filenames in os.walk(root_path):
        # Filter excluded directories
        dirnames[:] = [d for d in dirnames if not d.startswith('.') and d not in CONFIG["excluded_patterns"]]

        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(filepath, root_path)

            # Skip excluded files
            syncer = GoogleDriveSync()
            if syncer.should_exclude(filepath):
                continue

            files.append((filepath, rel_path))

    return files


def scan_local_folders(root_path: str) -> List[str]:
    """Scan local directory for all folders (including empty ones)."""
    folders = []

    for dirpath, dirnames, _ in os.walk(root_path):
        # Filter excluded directories
        dirnames[:] = [d for d in dirnames if not d.startswith('.') and d not in CONFIG["excluded_patterns"]]

        for dirname in dirnames:
            folderpath = os.path.join(dirpath, dirname)
            rel_path = os.path.relpath(folderpath, root_path)
            folders.append(rel_path)

    return sorted(folders)


def main():
    parser = argparse.ArgumentParser(
        description="Sync Direct Cuts Data Room to Google Drive"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without uploading"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force re-upload all files"
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List current Google Drive folder structure"
    )
    parser.add_argument(
        "--depth",
        type=int,
        default=3,
        help="Depth for --list (default: 3)"
    )
    parser.add_argument(
        "--sync-folders",
        action="store_true",
        help="Create all folder structures including empty folders"
    )

    args = parser.parse_args()

    print_header("Direct Cuts Data Room Sync")

    # Handle --list mode
    if args.list:
        print_info(f"Drive folder: {CONFIG['drive_folder_id']}")
        print_info(f"Listing Google Drive structure (depth: {args.depth})...")
        print()

        syncer = GoogleDriveSync(dry_run=False)
        print_info("Authenticating with Google Drive...")
        if not syncer.authenticate():
            sys.exit(1)
        print_success("Authentication successful")
        print()

        print_header("Google Drive Structure")
        list_drive_structure(syncer.service, CONFIG["drive_folder_id"], "", args.depth)
        print()
        print_info(f"View in browser: https://drive.google.com/drive/folders/{CONFIG['drive_folder_id']}")
        return

    # Check local path exists
    if not os.path.exists(CONFIG["local_path"]):
        print_error(f"Local path not found: {CONFIG['local_path']}")
        sys.exit(1)

    print_info(f"Local path: {CONFIG['local_path']}")
    print_info(f"Drive folder: {CONFIG['drive_folder_id']}")
    print_info(f"Mode: {'DRY RUN (preview only)' if args.dry_run else 'LIVE SYNC'}")
    print()

    # Initialize sync
    syncer = GoogleDriveSync(dry_run=args.dry_run)
    cache = SyncCache(CONFIG["cache_file"])

    # Authenticate
    if not args.dry_run:
        print_info("Authenticating with Google Drive...")
        if not syncer.authenticate():
            sys.exit(1)
        print_success("Authentication successful")
        print()

    # Sync folder structure first (if requested)
    if args.sync_folders:
        print_info("Scanning folder structure...")
        folders = scan_local_folders(CONFIG["local_path"])
        print_info(f"Found {len(folders)} folders")
        print()

        print_header("Creating Folder Structure")
        for folder_path in folders:
            if not args.dry_run:
                syncer.ensure_folder_path(folder_path)
            else:
                print_info(f"Would create folder: {folder_path}")
        print()

    # Scan local files
    print_info("Scanning local files...")
    files = scan_local_files(CONFIG["local_path"])
    print_info(f"Found {len(files)} files")
    print()

    # Process files
    print_header("Processing Files")

    for filepath, rel_path in files:
        needs_upload, reason = cache.needs_upload(filepath)

        if not needs_upload and not args.force:
            syncer.stats["skipped"] += 1
            continue

        # Get folder path and filename
        rel_dir = os.path.dirname(rel_path)
        filename = os.path.basename(rel_path)

        # Ensure folder exists
        if not args.dry_run:
            parent_id = syncer.ensure_folder_path(rel_dir)
        else:
            parent_id = "dry-run-parent"
            if rel_dir:
                print_info(f"Would ensure folder: {rel_dir}")

        # Upload file
        status_text = f"[{reason.upper()}]" if reason != "unchanged" else ""
        drive_id = syncer.upload_file(filepath, parent_id, filename)

        if drive_id and not args.dry_run:
            cache.mark_uploaded(filepath, drive_id)
            syncer.stats["uploaded"] += 1
        elif args.dry_run:
            syncer.stats["uploaded"] += 1

    # Save cache
    if not args.dry_run:
        cache.save()

    # Print summary
    print_header("Sync Summary")

    print(f"  Files uploaded:    {Colors.GREEN}{syncer.stats['uploaded']}{Colors.ENDC}")
    print(f"  Files skipped:     {Colors.CYAN}{syncer.stats['skipped']}{Colors.ENDC}")
    print(f"  Folders created:   {Colors.BLUE}{syncer.stats['folders_created']}{Colors.ENDC}")
    print(f"  Errors:            {Colors.RED if syncer.stats['errors'] > 0 else ''}{syncer.stats['errors']}{Colors.ENDC}")
    print(f"  Data transferred:  {syncer.format_size(syncer.stats['bytes_uploaded'])}")
    print()

    if args.dry_run:
        print_warning("This was a DRY RUN - no files were actually uploaded")
        print_info("Run without --dry-run to perform actual sync")
    else:
        print_success("Sync complete!")
        print_info(f"View in Google Drive: https://drive.google.com/drive/folders/{CONFIG['drive_folder_id']}")


if __name__ == "__main__":
    main()
