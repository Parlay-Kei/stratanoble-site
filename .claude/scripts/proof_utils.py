import os
import json
import argparse
import datetime
import shutil

ANX_ROOT = r"C:\Dev\.claude-anx"
RUNS_DIR = os.path.join(ANX_ROOT, "runs")
POLICY_FILE = os.path.join(ANX_ROOT, "policies", "autonomy_policy.json")

def check_kill_switch():
    try:
        if os.path.exists(POLICY_FILE):
            with open(POLICY_FILE, 'r') as f:
                policy = json.load(f)
                if policy.get('kill_switch', False):
                    print("KILL SWITCH ENGAGED. ABORTING.")
                    return True
    except Exception as e:
        print(f"Error checking policy: {e}")
    return False

def init_run(ticket_id, run_id):
    if check_kill_switch():
        return False
    
    run_path = os.path.join(RUNS_DIR, ticket_id, run_id)
    artifacts_path = os.path.join(run_path, "artifacts")
    
    os.makedirs(artifacts_path, exist_ok=True)
    
    print(f"Run directory initialized: {run_path}")
    return run_path

def write_receipt(ticket_id, run_id, tool_name, status, details):
    run_path = os.path.join(RUNS_DIR, ticket_id, run_id)
    receipt_json = os.path.join(run_path, "receipt.json")
    receipt_md = os.path.join(run_path, "receipt.md")

    data = {
        "ticket_id": ticket_id,
        "run_id": run_id,
        "tool": tool_name,
        "status": status,
        "timestamp": datetime.datetime.now().isoformat(),
        "details": details
    }

    with open(receipt_json, 'w') as f:
        json.dump(data, f, indent=2)

    md_content = f"""# Run Receipt: {run_id}
**Ticket**: {ticket_id}
**Tool**: {tool_name}
**Status**: {status}
**Time**: {data['timestamp']}

## Details
```json
{json.dumps(details, indent=2)}
```
"""
    with open(receipt_md, 'w') as f:
        f.write(md_content)

    print(f"Receipt written to {receipt_json}")

def write_system_receipt(ticket_id, run_id, event_type, status, details):
    """Write a SYSTEM receipt for kill switch and other system events"""
    run_path = os.path.join(RUNS_DIR, ticket_id, run_id)
    os.makedirs(run_path, exist_ok=True)

    receipt_json = os.path.join(run_path, "system_receipt.json")
    receipt_md = os.path.join(run_path, "system_receipt.md")

    data = {
        "ticket_id": ticket_id,
        "run_id": run_id,
        "event_type": event_type,
        "status": status,
        "timestamp": datetime.datetime.now().isoformat(),
        "details": details,
        "receipt_type": "SYSTEM"
    }

    with open(receipt_json, 'w') as f:
        json.dump(data, f, indent=2)

    md_content = f"""# System Receipt: {run_id}
**Type**: SYSTEM
**Event**: {event_type}
**Status**: {status}
**Time**: {data['timestamp']}

## Details
```json
{json.dumps(details, indent=2)}
```

This is a SYSTEM-generated receipt for autonomous operations.
"""
    with open(receipt_md, 'w') as f:
        f.write(md_content)

    print(f"SYSTEM receipt written to {receipt_json}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command")
    
    init_parser = subparsers.add_parser("init")
    init_parser.add_argument("--ticket", required=True)
    init_parser.add_argument("--run", required=True)
    
    receipt_parser = subparsers.add_parser("receipt")
    receipt_parser.add_argument("--ticket", required=True)
    receipt_parser.add_argument("--run", required=True)
    receipt_parser.add_argument("--tool", required=True)
    receipt_parser.add_argument("--status", required=True)
    receipt_parser.add_argument("--details", required=True) # JSON string
    
    args = parser.parse_args()
    
    if args.command == "init":
        init_run(args.ticket, args.run)
    elif args.command == "receipt":
        try:
            details = json.loads(args.details)
        except:
            details = {"raw": args.details}
        write_receipt(args.ticket, args.run, args.tool, args.status, details)
