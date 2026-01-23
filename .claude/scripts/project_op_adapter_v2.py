#!/usr/bin/env python3
"""
Project Operations Adapter V2 - Enhanced with resolution receipts
Resolves repository operations using standardized adapter contracts
"""

import os
import sys
import json
import subprocess
import sqlite3
import uuid
from datetime import datetime
from pathlib import Path

ANX_ROOT = r"C:\Dev\.claude-anx"
ADAPTERS_DIR = os.path.join(ANX_ROOT, "services", "project_adapters")
DB_PATH = os.path.join(ANX_ROOT, "state", "anx_state.db")
RECEIPTS_DIR = os.path.join(ANX_ROOT, "receipts", "adapter")

class ProjectOpAdapter:
    def __init__(self):
        self.adapters_cache = {}
        self.resolution_history = []

    def load_adapter(self, repo_id):
        """Load adapter configuration for a repository"""
        # Try exact match first
        adapter_file = os.path.join(ADAPTERS_DIR, f"{repo_id}.json")

        if not os.path.exists(adapter_file):
            # Try alternative naming conventions
            alternatives = [
                f"{repo_id.replace('-', '')}.json",
                f"{repo_id.replace('_', '-')}.json",
                f"{repo_id.replace('-', '_')}.json"
            ]

            for alt_name in alternatives:
                alt_file = os.path.join(ADAPTERS_DIR, alt_name)
                if os.path.exists(alt_file):
                    adapter_file = alt_file
                    break

        if not os.path.exists(adapter_file):
            return None

        try:
            with open(adapter_file, 'r') as f:
                adapter = json.load(f)

            # Validate adapter schema
            if not self.validate_adapter_schema(adapter):
                return None

            # Cache for future use
            self.adapters_cache[repo_id] = adapter
            return adapter

        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"Error loading adapter for {repo_id}: {e}")
            return None

    def validate_adapter_schema(self, adapter):
        """Validate adapter conforms to standard schema"""
        required_fields = ["repo_id", "root", "ops"]
        for field in required_fields:
            if field not in adapter:
                return False

        # Validate ops structure
        if not isinstance(adapter["ops"], dict):
            return False

        # Check each operation has shell and cmd
        for op_name, op_config in adapter["ops"].items():
            if not isinstance(op_config, dict):
                return False
            if "shell" not in op_config or "cmd" not in op_config:
                return False

        return True

    def resolve_operation(self, repo_id, operation):
        """Resolve repository operation to executable command"""
        resolution_id = str(uuid.uuid4())
        resolution_time = datetime.now()

        resolution_result = {
            "resolution_id": resolution_id,
            "timestamp": resolution_time.isoformat(),
            "repo_id": repo_id,
            "requested_op": operation,
            "status": "PENDING"
        }

        try:
            # Load adapter
            adapter = self.load_adapter(repo_id)

            if not adapter:
                resolution_result.update({
                    "status": "FAILED",
                    "exception_code": "ADAPTER_RESOLUTION_FAIL",
                    "error": f"No adapter found for repo: {repo_id}",
                    "adapter_file_path": None,
                    "available_ops_keys": []
                })
                self.resolution_history.append(resolution_result)
                return resolution_result

            # Check if operation exists
            if operation not in adapter["ops"]:
                available_ops = list(adapter["ops"].keys())
                resolution_result.update({
                    "status": "FAILED",
                    "exception_code": "ADAPTER_RESOLUTION_FAIL",
                    "error": f"Operation '{operation}' not found in adapter",
                    "adapter_file_path": self.get_adapter_file_path(repo_id),
                    "available_ops_keys": available_ops,
                    "requested_op": operation
                })
                self.resolution_history.append(resolution_result)
                return resolution_result

            # Resolve command
            op_config = adapter["ops"][operation]
            resolved_command = op_config["cmd"]
            shell = op_config["shell"]
            working_directory = adapter["root"]

            resolution_result.update({
                "status": "SUCCESS",
                "adapter_file_path": self.get_adapter_file_path(repo_id),
                "resolved_command": resolved_command,
                "working_directory": working_directory,
                "shell": shell,
                "available_ops_keys": list(adapter["ops"].keys())
            })

            self.resolution_history.append(resolution_result)
            return resolution_result

        except Exception as e:
            resolution_result.update({
                "status": "ERROR",
                "exception_code": "ADAPTER_RESOLUTION_FAIL",
                "error": str(e),
                "adapter_file_path": self.get_adapter_file_path(repo_id),
                "available_ops_keys": []
            })
            self.resolution_history.append(resolution_result)
            return resolution_result

    def get_adapter_file_path(self, repo_id):
        """Get full path to adapter file for repo"""
        return os.path.join(ADAPTERS_DIR, f"{repo_id}.json")

    def execute_operation(self, repo_id, operation, intent="PROD"):
        """Execute repository operation with full resolution receipts"""
        print(f"Executing {operation} for {repo_id} (intent: {intent})")

        # Resolve operation
        resolution = self.resolve_operation(repo_id, operation)

        # Generate resolution receipt
        receipt_path = self.generate_resolution_receipt(resolution)

        if resolution["status"] != "SUCCESS":
            # Log failure to database
            self.log_job_result(repo_id, operation, "FAILED", resolution["error"], intent, resolution)
            return {
                "success": False,
                "resolution": resolution,
                "receipt_path": receipt_path,
                "error": resolution["error"]
            }

        # Execute the command
        try:
            working_dir = resolution["working_directory"]
            command = resolution["resolved_command"]
            shell_type = resolution["shell"]

            print(f"  Working directory: {working_dir}")
            print(f"  Command: {command}")
            print(f"  Shell: {shell_type}")

            # Prepare command for execution
            if shell_type == "powershell":
                full_cmd = ["powershell", "-File", command]
            elif shell_type == "cmd":
                full_cmd = command
            else:
                full_cmd = command

            # Execute command
            result = subprocess.run(
                full_cmd,
                cwd=working_dir,
                shell=(shell_type == "cmd"),
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )

            if result.returncode == 0:
                print(f"  [PASS] {operation} succeeded")
                status = "COMPLETED"
                error = None
            else:
                print(f"  [FAIL] {operation} failed: {result.stderr}")
                status = "FAILED"
                error = f"Command failed: {result.stderr[:500]}"

            # Log to database
            self.log_job_result(repo_id, operation, status, error, intent, resolution)

            return {
                "success": (result.returncode == 0),
                "resolution": resolution,
                "receipt_path": receipt_path,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "return_code": result.returncode
            }

        except subprocess.TimeoutExpired:
            error = f"Command timed out after 300 seconds"
            self.log_job_result(repo_id, operation, "TIMEOUT", error, intent, resolution)
            return {
                "success": False,
                "resolution": resolution,
                "receipt_path": receipt_path,
                "error": error
            }
        except Exception as e:
            error = f"Execution error: {str(e)}"
            self.log_job_result(repo_id, operation, "FAILED", error, intent, resolution)
            return {
                "success": False,
                "resolution": resolution,
                "receipt_path": receipt_path,
                "error": error
            }

    def log_job_result(self, repo_id, operation, status, error, intent, resolution):
        """Log job result to database for metrics"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        job_id = str(uuid.uuid4())
        payload = {
            "repo": repo_id,
            "phase": operation,
            "intent": intent,
            "service": "project_op",
            "resolution_id": resolution["resolution_id"],
            "adapter_file": resolution.get("adapter_file_path")
        }

        cursor.execute("""
            INSERT INTO queue (
                id, payload, status, created_at, last_error
            ) VALUES (?, ?, ?, ?, ?)
        """, (
            job_id,
            json.dumps(payload),
            status,
            datetime.now().isoformat(),
            error
        ))

        conn.commit()
        conn.close()

        print(f"  Logged job {job_id}: {status}")

    def generate_resolution_receipt(self, resolution):
        """Generate adapter resolution receipt"""
        os.makedirs(RECEIPTS_DIR, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        receipt_file = os.path.join(
            RECEIPTS_DIR,
            f"ADAPTER_RESOLUTION_{resolution['repo_id']}_{resolution['requested_op']}_{timestamp}.md"
        )

        content = f"""# ADAPTER RESOLUTION RECEIPT

**Resolution ID:** {resolution['resolution_id']}
**Timestamp:** {resolution['timestamp']}
**Repository:** {resolution['repo_id']}
**Requested Operation:** {resolution['requested_op']}
**Status:** {resolution['status']}

## Resolution Details

"""

        if resolution['status'] == 'SUCCESS':
            content += f"""### [PASS] RESOLUTION SUCCESSFUL

**Adapter File:** {resolution['adapter_file_path']}
**Resolved Command:** `{resolution['resolved_command']}`
**Working Directory:** {resolution['working_directory']}
**Shell:** {resolution['shell']}

### Available Operations
{chr(10).join(f'- {op}' for op in resolution['available_ops_keys'])}
"""
        else:
            content += f"""### [FAIL] RESOLUTION FAILED

**Exception Code:** {resolution.get('exception_code', 'UNKNOWN')}
**Error:** {resolution.get('error', 'Unknown error')}
**Adapter File:** {resolution.get('adapter_file_path', 'Not found')}

### Available Operations
{chr(10).join(f'- {op}' for op in resolution.get('available_ops_keys', []))}

### Troubleshooting
1. Verify adapter file exists: `{resolution.get('adapter_file_path', 'N/A')}`
2. Check operation name matches exactly: `{resolution['requested_op']}`
3. Validate adapter schema conforms to standard
"""

        content += """

## Adapter Schema Standard

Expected format:
```json
{
  "repo_id": "string",
  "root": "C:\\\\path\\\\to\\\\repo",
  "ops": {
    "validate": { "shell": "cmd|powershell", "cmd": "command" },
    "test": { "shell": "cmd|powershell", "cmd": "command" },
    "build": { "shell": "cmd|powershell", "cmd": "command" },
    "deploy": { "shell": "cmd|powershell", "cmd": "command" },
    "rollback": { "shell": "cmd|powershell", "cmd": "command" },
    "smoke": { "shell": "cmd|powershell", "cmd": "command" }
  }
}
```

---
Generated by: Project Op Adapter V2
Type: Adapter Resolution Receipt
"""

        with open(receipt_file, 'w') as f:
            f.write(content)

        return receipt_file

    def inject_daily_prod_jobs(self):
        """Inject daily PROD validate jobs for all 5 repos"""
        repos = ["DirectCuts", "DirectCuts-iOS", "DSLV", "msaudreys-house", "StrataNoble"]

        print("Injecting daily PROD validate jobs...")
        results = []

        for repo in repos:
            print(f"\n--- Processing {repo} ---")
            result = self.execute_operation(repo, "validate", intent="PROD")
            results.append({
                "repo": repo,
                "operation": "validate",
                "success": result["success"],
                "resolution_id": result["resolution"]["resolution_id"],
                "receipt_path": result["receipt_path"]
            })

        return results

def main():
    """Main execution"""
    import argparse

    parser = argparse.ArgumentParser(description="Project Op Adapter V2")
    parser.add_argument("--repo", help="Repository ID")
    parser.add_argument("--op", help="Operation to execute")
    parser.add_argument("--intent", default="PROD", help="Job intent (PROD/TEST)")
    parser.add_argument("--inject-daily", action="store_true",
                       help="Inject daily PROD validate jobs for all repos")
    parser.add_argument("--test-resolution", action="store_true",
                       help="Test resolution for all repos and ops")

    args = parser.parse_args()

    adapter = ProjectOpAdapter()

    if args.inject_daily:
        results = adapter.inject_daily_prod_jobs()
        print(f"\nDaily injection complete:")
        for result in results:
            status = "[PASS]" if result["success"] else "[FAIL]"
            print(f"  {status} {result['repo']}: {result['resolution_id']}")

    elif args.test_resolution:
        repos = ["DirectCuts", "DirectCuts-iOS", "DSLV", "msaudreys-house", "StrataNoble"]
        operations = ["validate", "test", "build"]

        print("Testing adapter resolution for all repos...")
        for repo in repos:
            print(f"\n--- {repo} ---")
            for op in operations:
                resolution = adapter.resolve_operation(repo, op)
                status = "[PASS]" if resolution["status"] == "SUCCESS" else "[FAIL]"
                print(f"  {status} {op}: {resolution.get('resolved_command', resolution.get('error', 'Unknown'))[:50]}...")

    elif args.repo and args.op:
        result = adapter.execute_operation(args.repo, args.op, args.intent)
        if result["success"]:
            print(f"[PASS] Operation completed successfully")
        else:
            print(f"[FAIL] Operation failed: {result['error']}")

    else:
        parser.print_help()

    return 0

if __name__ == "__main__":
    sys.exit(main())