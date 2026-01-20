
import os
import sys
import argparse
import datetime
import json
from drive_client import DriveClient

CONFIG_FILE = r"C:\Dev\Direct-Cuts\config\anx_drive_config.json"

def load_config():
    with open(CONFIG_FILE, 'r') as f:
        return json.load(f)

CONFIG = load_config()
ROOT_FOLDER_ID = CONFIG["drive_root_id"]
CREDENTIALS_FILE = CONFIG["credentials_path"]
TOKEN_FILE = CONFIG["token_path"]
AUDIT_LOG_FILE = CONFIG["audit_log_path"]
PERMISSIONS = CONFIG["permissions"]

def log_audit(role, action, path, status, details=""):
    timestamp = datetime.datetime.now().isoformat()
    log_entry = f"[{timestamp}] [{role}] [{action}] [{path}] [{status}] {details}\n"
    
    os.makedirs(os.path.dirname(AUDIT_LOG_FILE), exist_ok=True)
    with open(AUDIT_LOG_FILE, "a") as f:
        f.write(log_entry)

def check_permission(role, action, path):
    if role not in PERMISSIONS:
        return False, "Unknown Role"
    
    # Map actions to permission types
    perm_type = "read"
    if action == "write":
        perm_type = "write"
    # list, search, read -> read permission

    rules = PERMISSIONS[role]
    allowed_scopes = rules.get(perm_type, [])
    
    path = path.replace("\\", "/")
    if not path.startswith("/"):
        path = "/" + path
        
    for scope in allowed_scopes:
        if scope == "*":
            return True, "Allowed by wildcard"
        if path.startswith(scope):
            return True, f"Allowed by scope {scope}"
            
    return False, f"Denied. {role} cannot {action} to {path}"

def main():
    parser = argparse.ArgumentParser(description="ANX Agent Drive Tool")
    parser.add_argument("--role", required=True, help="Agent Role Name")
    parser.add_argument("--action", required=True, choices=["read", "write", "list", "search"], help="Action to perform")
    parser.add_argument("--path", required=True, help="Virtual path in Drive (e.g. /Legal/Contracts)")
    parser.add_argument("--content", help="Content to write (for write action)")
    parser.add_argument("--content-file", help="File to read content from (for write action)")
    parser.add_argument("--mime-type", help="MIME type for the content (default: text/plain)")
    
    args = parser.parse_args()
    
    # 1. Permission Check
    allowed, reason = check_permission(args.role, args.action if args.action != "search" else "read", args.path)
    if not allowed:
        print(f"PERMISSION DENIED: {reason}")
        log_audit(args.role, args.action, args.path, "DENIED", reason)
        sys.exit(1)

    # 2. Init Client
    try:
        client = DriveClient(ROOT_FOLDER_ID, CREDENTIALS_FILE, TOKEN_FILE)
    except Exception as e:
        print(f"ERROR: Failed to initialize Drive client: {e}")
        sys.exit(1)

    # 3. Execute
    try:
        if args.action == "list":
            # Resolve path to ID
            folder_id = client.resolve_path(args.path)
            if not folder_id:
                print(f"ERROR: Path not found {args.path}")
                log_audit(args.role, args.action, args.path, "ERROR", "Path not found")
                sys.exit(1)
            
            files = client.list_files(folder_id)
            print(json.dumps(files, indent=2))
            log_audit(args.role, args.action, args.path, "SUCCESS", f"Listed {len(files)} items")

        elif args.action == "read":
            file_id = client.resolve_path(args.path)
            if not file_id:
                print(f"ERROR: File not found {args.path}")
                log_audit(args.role, args.action, args.path, "ERROR", "Path not found")
                sys.exit(1)
                
            content = client.read_file(file_id)
            print(content)
            log_audit(args.role, args.action, args.path, "SUCCESS", "Read content")

        elif args.action == "write":
            # Resolve parent path manually to ensure forward slashes
            clean_path = args.path.replace("\\", "/")
            if "/" in clean_path:
                dir_path, filename = clean_path.rsplit("/", 1)
            else:
                dir_path = ""
                filename = clean_path
            
            parent_id = client.resolve_path(dir_path)
            if not parent_id:
                 # Auto-create directories? Sync script does. Let's do it if we can.
                 # Actually client.resolve_path doesn't create.
                 # For now, strict: Parent must exist. 
                 # IMPROVEMENT: Add recursive creation later or use sync script logic if needed.
                 print(f"ERROR: Parent directory not found {dir_path}")
                 log_audit(args.role, args.action, args.path, "ERROR", "Parent path not found")
                 sys.exit(1)

            content = args.content or ""
            if args.content_file:
                # Read as binary to support all file types
                with open(args.content_file, 'rb') as f:
                    content = f.read()
            
            mime_type = args.mime_type or "text/plain"
            file_id = client.upload_file(parent_id, filename, content, mime_type=mime_type)
            print(f"SUCCESS: Written to {file_id}")
            log_audit(args.role, args.action, args.path, "SUCCESS", f"Written {file_id}")
            
    except Exception as e:
        print(f"ERROR: {e}")
        log_audit(args.role, args.action, args.path, "ERROR", str(e))
        sys.exit(1)

if __name__ == "__main__":
    main()
