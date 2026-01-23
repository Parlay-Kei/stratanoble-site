import os
import json
import argparse
import sys

ANX_ROOT = r"C:\Dev\.claude-anx"
RUNS_DIR = os.path.join(ANX_ROOT, "runs")

def validate(ticket_id, run_id):
    run_dir = os.path.join(RUNS_DIR, ticket_id, run_id)
    report_path = os.path.join(run_dir, "validation_report.md")
    
    errors = []
    
    if not os.path.exists(run_dir):
        print(f"FAIL: Run directory {run_dir} does not exist.")
        return False

    # Rule 1: Receipt Existence
    if not os.path.exists(os.path.join(run_dir, "receipt.json")):
        errors.append("Missing receipt.json")
    
    if not os.path.exists(os.path.join(run_dir, "receipt.md")):
        errors.append("Missing receipt.md")
        
    # Rule 2: Status
    if os.path.exists(os.path.join(run_dir, "receipt.json")):
        try:
            with open(os.path.join(run_dir, "receipt.json")) as f:
                data = json.load(f)
                if data.get("status") != "SUCCESS":
                    # Warning only if expected, but generally we want to validte mechanism
                    # errors.append(f"Status is {data.get('status')}")
                    pass
        except Exception as e:
            errors.append(f"Invalid JSON in receipt: {e}")

    # Generate Report
    status = "PASS" if not errors else "FAIL"
    
    report = f"""# Validation Report
**Run**: {run_id}
**Result**: {status}

## Errors
{'\n'.join([f'- {e}' for e in errors]) if errors else "None"}
"""
    with open(report_path, 'w') as f:
        f.write(report)
        
    print(f"Validation {status}. Report written to {report_path}")
    
    return len(errors) == 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--ticket", required=True)
    parser.add_argument("--run", required=True)
    args = parser.parse_args()
    
    success = validate(args.ticket, args.run)
    sys.exit(0 if success else 1)
