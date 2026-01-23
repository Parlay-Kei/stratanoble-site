#!/usr/bin/env python3
"""
Quarantine Manager - Automatic repo isolation for persistent failures
After 2 consecutive failures of same step in same repo → quarantine
Quarantine behavior: validate only until 2 consecutive passes → restore
"""

import os
import sys
import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

ANX_ROOT = r"C:\Dev\.claude-anx"
DB_PATH = os.path.join(ANX_ROOT, "state", "anx_state.db")
POLICIES_DIR = os.path.join(ANX_ROOT, "policies")
RECEIPTS_DIR = os.path.join(ANX_ROOT, "receipts", "quarantine")

class QuarantineManager:
    def __init__(self):
        self.policy_file = os.path.join(POLICIES_DIR, "quarantine_policy.json")
        self.policy = self.load_policy()
        self.repo_status = {}

    def load_policy(self):
        """Load or create quarantine policy"""
        if os.path.exists(self.policy_file):
            with open(self.policy_file, 'r') as f:
                return json.load(f)

        # Default policy
        default_policy = {
            "version": "1.0",
            "thresholds": {
                "consecutive_failures_to_quarantine": 2,
                "consecutive_passes_to_restore": 2
            },
            "quarantined_repos": {},
            "history": [],
            "updated_at": datetime.now().isoformat()
        }

        os.makedirs(POLICIES_DIR, exist_ok=True)
        self.save_policy(default_policy)
        return default_policy

    def save_policy(self, policy=None):
        """Save quarantine policy to file"""
        if policy:
            self.policy = policy

        self.policy["updated_at"] = datetime.now().isoformat()

        with open(self.policy_file, 'w') as f:
            json.dump(self.policy, f, indent=2)

    def get_db_connection(self):
        return sqlite3.connect(DB_PATH)

    def analyze_repo_failures(self, repo_name):
        """Analyze recent failures for a specific repo"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Get last 10 jobs for this repo
        cursor.execute("""
            SELECT
                id,
                status,
                json_extract(payload, '$.phase') as phase,
                created_at,
                last_error
            FROM queue
            WHERE json_extract(payload, '$.repo') = ?
               OR payload LIKE ?
            ORDER BY created_at DESC
            LIMIT 10
        """, (repo_name, f'%{repo_name}%'))

        jobs = []
        for row in cursor.fetchall():
            jobs.append({
                "id": row[0],
                "status": row[1],
                "phase": row[2],
                "timestamp": row[3],
                "error": row[4]
            })

        conn.close()

        # Check for consecutive failures
        if len(jobs) >= 2:
            # Check last 2 jobs
            if (jobs[0]["status"] == "FAILED" and
                jobs[1]["status"] == "FAILED" and
                jobs[0]["phase"] == jobs[1]["phase"]):
                return {
                    "should_quarantine": True,
                    "failed_phase": jobs[0]["phase"],
                    "failure_count": 2,
                    "last_errors": [jobs[0]["error"], jobs[1]["error"]]
                }

        # Check for recovery (2 consecutive passes)
        if len(jobs) >= 2:
            if (jobs[0]["status"] == "COMPLETED" and
                jobs[1]["status"] == "COMPLETED"):
                return {
                    "should_restore": True,
                    "pass_count": 2
                }

        return {
            "should_quarantine": False,
            "should_restore": False
        }

    def quarantine_repo(self, repo_name, reason):
        """Put a repository into quarantine"""
        print(f"Quarantining {repo_name}: {reason}")

        # Update policy
        self.policy["quarantined_repos"][repo_name] = {
            "quarantined_at": datetime.now().isoformat(),
            "reason": reason,
            "failed_phase": reason.get("failed_phase", "unknown"),
            "failure_count": reason.get("failure_count", 2),
            "status": "QUARANTINED"
        }

        # Add to history
        self.policy["history"].append({
            "action": "QUARANTINE_ENTER",
            "repo": repo_name,
            "timestamp": datetime.now().isoformat(),
            "reason": reason
        })

        self.save_policy()

        # Log to database
        self.log_event("QUARANTINE_ENTER", {
            "repo": repo_name,
            "reason": reason
        })

        # Generate receipt
        receipt_path = self.generate_quarantine_receipt(repo_name, "ENTER", reason)

        print(f"Quarantine receipt: {receipt_path}")
        return receipt_path

    def restore_repo(self, repo_name):
        """Restore a repository from quarantine"""
        print(f"Restoring {repo_name} from quarantine")

        if repo_name not in self.policy["quarantined_repos"]:
            print(f"{repo_name} is not quarantined")
            return None

        # Calculate quarantine duration
        quarantine_data = self.policy["quarantined_repos"][repo_name]
        quarantined_at = datetime.fromisoformat(quarantine_data["quarantined_at"])
        duration_hours = (datetime.now() - quarantined_at).total_seconds() / 3600

        # Remove from quarantine
        del self.policy["quarantined_repos"][repo_name]

        # Add to history
        self.policy["history"].append({
            "action": "QUARANTINE_EXIT",
            "repo": repo_name,
            "timestamp": datetime.now().isoformat(),
            "duration_hours": round(duration_hours, 2)
        })

        self.save_policy()

        # Log to database
        self.log_event("QUARANTINE_EXIT", {
            "repo": repo_name,
            "duration_hours": round(duration_hours, 2)
        })

        # Generate receipt
        receipt_path = self.generate_quarantine_receipt(
            repo_name, "EXIT",
            {"duration_hours": round(duration_hours, 2)}
        )

        print(f"Restore receipt: {receipt_path}")
        return receipt_path

    def generate_quarantine_receipt(self, repo_name, action, details):
        """Generate quarantine action receipt"""
        os.makedirs(RECEIPTS_DIR, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        receipt_file = os.path.join(RECEIPTS_DIR, f"QUARANTINE_{action}_{repo_name}_{timestamp}.md")

        if action == "ENTER":
            content = f"""# QUARANTINE ENTER RECEIPT

**Repository:** {repo_name}
**Action:** QUARANTINE_ENTER
**Timestamp:** {datetime.now().isoformat()}
**Status:** QUARANTINED

## Reason
- **Failed Phase:** {details.get("failed_phase", "unknown")}
- **Consecutive Failures:** {details.get("failure_count", 2)}

## Last Errors
"""
            for i, error in enumerate(details.get("last_errors", [])[:2], 1):
                content += f"{i}. {error[:200] if error else 'Unknown error'}...\n"

            content += f"""

## Quarantine Behavior
- Repository will only run validation phase
- All other phases (test, build) are blocked
- Will exit quarantine after 2 consecutive successful validations

## Policy
```json
{json.dumps(self.policy["thresholds"], indent=2)}
```
"""

        else:  # EXIT
            content = f"""# QUARANTINE EXIT RECEIPT

**Repository:** {repo_name}
**Action:** QUARANTINE_EXIT
**Timestamp:** {datetime.now().isoformat()}
**Status:** RESTORED

## Recovery
- **Quarantine Duration:** {details.get("duration_hours", 0):.2f} hours
- **Recovery Method:** 2 consecutive successful validations

## Restoration
Repository has been restored to full operations:
- ✓ Validation phase
- ✓ Test phase
- ✓ Build phase

## Next Steps
Repository will be monitored for stability. If failures recur, quarantine threshold will be applied again.
"""

        content += """
---
Generated by: Quarantine Manager
Type: Automated Repository Health Management
"""

        with open(receipt_file, 'w') as f:
            f.write(content)

        return receipt_file

    def log_event(self, event_type, data):
        """Log quarantine event to database"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        import uuid
        event_id = str(uuid.uuid4())

        cursor.execute("""
            INSERT INTO events (id, type, payload, timestamp)
            VALUES (?, ?, ?, ?)
        """, (event_id, event_type, json.dumps(data), datetime.now().isoformat()))

        conn.commit()
        conn.close()

    def check_repo_status(self, repo_name):
        """Check if repo should be quarantined or restored"""
        # Check if already quarantined
        is_quarantined = repo_name in self.policy["quarantined_repos"]

        # Analyze recent failures
        analysis = self.analyze_repo_failures(repo_name)

        if not is_quarantined and analysis["should_quarantine"]:
            # Quarantine the repo
            return self.quarantine_repo(repo_name, analysis)

        elif is_quarantined and analysis["should_restore"]:
            # Restore the repo
            return self.restore_repo(repo_name)

        return None

    def process_all_repos(self):
        """Check all known repos for quarantine status"""
        repos = ["DirectCuts", "DirectCuts-iOS", "DSLV", "msaudreys-house", "StrataNoble"]

        actions_taken = []
        for repo in repos:
            result = self.check_repo_status(repo)
            if result:
                actions_taken.append({
                    "repo": repo,
                    "receipt": result
                })

        return actions_taken

    def get_quarantine_status(self):
        """Get current quarantine status for all repos"""
        status = {
            "quarantined_count": len(self.policy["quarantined_repos"]),
            "quarantined_repos": list(self.policy["quarantined_repos"].keys()),
            "details": self.policy["quarantined_repos"],
            "recent_actions": self.policy["history"][-5:] if self.policy["history"] else []
        }
        return status

    def should_run_phase(self, repo_name, phase):
        """Check if a phase should run for a repo"""
        if repo_name not in self.policy["quarantined_repos"]:
            # Not quarantined, all phases allowed
            return True

        # Quarantined - only validation allowed
        return phase.lower() in ["validate", "validation", "lint"]

def simulate_quarantine():
    """Simulate quarantine scenario for testing"""
    manager = QuarantineManager()

    print("=== Quarantine Simulation ===\n")

    # Simulate repo with failures
    test_repo = "TestRepo"

    # Create fake failure data
    conn = manager.get_db_connection()
    cursor = conn.cursor()

    # Insert test failures
    import uuid
    for i in range(2):
        job_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO queue (id, payload, status, created_at, last_error)
            VALUES (?, ?, 'FAILED', ?, ?)
        """, (
            job_id,
            json.dumps({"repo": test_repo, "phase": "build"}),
            (datetime.now() - timedelta(minutes=30-i*10)).isoformat(),
            "Build failed: dependency error"
        ))

    conn.commit()
    conn.close()

    # Check status - should trigger quarantine
    print(f"Checking {test_repo} status...")
    enter_receipt = manager.check_repo_status(test_repo)
    if enter_receipt:
        print(f"✓ Quarantine ENTER receipt: {enter_receipt}\n")

    # Simulate recovery - add successful jobs
    conn = manager.get_db_connection()
    cursor = conn.cursor()

    for i in range(2):
        job_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO queue (id, payload, status, created_at)
            VALUES (?, ?, 'COMPLETED', ?)
        """, (
            job_id,
            json.dumps({"repo": test_repo, "phase": "validate"}),
            (datetime.now() - timedelta(minutes=10-i*5)).isoformat()
        ))

    conn.commit()
    conn.close()

    # Check again - should trigger restore
    print(f"Checking {test_repo} status after recovery...")
    exit_receipt = manager.check_repo_status(test_repo)
    if exit_receipt:
        print(f"✓ Quarantine EXIT receipt: {exit_receipt}\n")

    # Show final status
    status = manager.get_quarantine_status()
    print("Final Quarantine Status:")
    print(f"  Quarantined repos: {status['quarantined_count']}")
    print(f"  Recent actions: {len(status['recent_actions'])}")

    return enter_receipt, exit_receipt

def main():
    """Main execution"""
    import argparse

    parser = argparse.ArgumentParser(description="Quarantine Manager")
    parser.add_argument("--check", help="Check specific repo status")
    parser.add_argument("--check-all", action="store_true", help="Check all repos")
    parser.add_argument("--status", action="store_true", help="Show quarantine status")
    parser.add_argument("--simulate", action="store_true", help="Run simulation")
    parser.add_argument("--restore", help="Manually restore a repo")

    args = parser.parse_args()

    manager = QuarantineManager()

    if args.simulate:
        enter_receipt, exit_receipt = simulate_quarantine()
        print(f"\nSimulation complete")
        print(f"  Enter receipt: {enter_receipt}")
        print(f"  Exit receipt: {exit_receipt}")

    elif args.check:
        result = manager.check_repo_status(args.check)
        if result:
            print(f"Action taken: {result}")
        else:
            print(f"No action needed for {args.check}")

    elif args.check_all:
        actions = manager.process_all_repos()
        if actions:
            print(f"Actions taken: {len(actions)}")
            for action in actions:
                print(f"  - {action['repo']}: {action['receipt']}")
        else:
            print("No actions needed")

    elif args.restore:
        result = manager.restore_repo(args.restore)
        if result:
            print(f"Restored: {result}")

    elif args.status:
        status = manager.get_quarantine_status()
        print(f"\nQuarantine Status:")
        print(f"  Quarantined: {status['quarantined_count']} repos")
        for repo in status['quarantined_repos']:
            details = status['details'][repo]
            print(f"  - {repo}: Since {details['quarantined_at']}")

    else:
        parser.print_help()

    return 0

if __name__ == "__main__":
    sys.exit(main())