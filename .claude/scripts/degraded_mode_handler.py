#!/usr/bin/env python3
"""
Degraded Mode Handler for ANX Autonomy V3
Implements safety behaviors when system health degrades
"""

import os
import sys
import json
import sqlite3
from datetime import datetime
from pathlib import Path

# Add parent to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from autonomy.queue_v2 import QueueV2

ANX_ROOT = r"C:\Dev\.claude-anx"
POLICIES_DIR = os.path.join(ANX_ROOT, "policies")
RUNS_DIR = os.path.join(ANX_ROOT, "runs")
RECEIPTS_DIR = os.path.join(ANX_ROOT, "receipts")

# Safe services that can run in degraded mode
SAFE_SERVICES = [
    "health_check",
    "status_report",
    "read_only_query",
    "diagnostic",
    "monitoring",
    "receipt_generation"
]

class DegradedModeHandler:
    def __init__(self):
        self.queue = QueueV2()
        self.policy = self.load_degraded_policy()
        self.blocked_jobs = []
        self.safe_jobs = []

    def load_degraded_policy(self):
        """Load the current degraded mode policy"""
        policy_file = os.path.join(POLICIES_DIR, "degraded_mode_policy.json")

        if os.path.exists(policy_file):
            with open(policy_file, 'r') as f:
                return json.load(f)

        # Default policy if file doesn't exist
        return {
            "degraded_mode": False,
            "timestamp": datetime.now().isoformat(),
            "triggers": [],
            "restrictions": {
                "prod_jobs_blocked": False,
                "only_safe_services": False,
                "outbound_rate_cap": 100,
                "max_concurrent_jobs": 5
            }
        }

    def is_safe_job(self, job_payload):
        """Determine if a job is safe to run in degraded mode"""
        job_type = job_payload.get("type", "")
        command = job_payload.get("command", "")
        service = job_payload.get("service", "")
        run_intent = job_payload.get("run_intent", "PROD")

        # Test jobs are always safe
        if run_intent in ["TEST_POSITIVE", "TEST_NEGATIVE"]:
            return True

        # Check if it's a safe service
        for safe in SAFE_SERVICES:
            if safe in service.lower() or safe in command.lower():
                return True

        # Read-only operations are safe
        read_only_keywords = ["read", "get", "list", "status", "check", "verify"]
        if any(keyword in command.lower() for keyword in read_only_keywords):
            return True

        # Everything else is unsafe in degraded mode
        return False

    def process_queue_in_degraded_mode(self):
        """Process queue with degraded mode restrictions"""
        if not self.policy["degraded_mode"]:
            print("System not in degraded mode")
            return

        print("Processing queue in DEGRADED MODE")
        print(f"Restrictions: {json.dumps(self.policy['restrictions'], indent=2)}")

        # Get all pending jobs
        conn = self.queue.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, payload, priority
            FROM queue
            WHERE status = 'PENDING'
            ORDER BY priority DESC, created_at ASC
        """)

        jobs = []
        for row in cursor.fetchall():
            jobs.append({
                "id": row[0],
                "payload": json.loads(row[1]),
                "priority": row[2]
            })

        conn.close()

        # Process each job
        for job in jobs:
            job_id = job["id"]
            payload = job["payload"]

            if self.is_safe_job(payload):
                self.safe_jobs.append(job_id)
                print(f"Job {job_id[:8]}... marked as SAFE")
            else:
                # Block PROD jobs
                if payload.get("run_intent", "PROD") == "PROD":
                    self.block_prod_job(job_id, payload)

    def block_prod_job(self, job_id, payload):
        """Block a PROD job and generate receipt"""
        print(f"Blocking PROD job {job_id[:8]}...")

        # Update job status to BLOCKED
        conn = self.queue.get_connection()
        cursor = conn.cursor()

        blocked_reason = f"Degraded mode active: {', '.join(self.policy['triggers'])}"

        cursor.execute("""
            UPDATE queue
            SET status = 'BLOCKED',
                outcome = 'DEGRADED_BLOCKED',
                last_error = ?
            WHERE id = ?
        """, (blocked_reason, job_id))

        conn.commit()
        conn.close()

        # Generate blocked receipt
        self.generate_blocked_receipt(job_id, payload, blocked_reason)
        self.blocked_jobs.append(job_id)

    def generate_blocked_receipt(self, job_id, payload, reason):
        """Generate receipt for blocked PROD job"""
        ticket_id = payload.get("ticket_id", "DEGRADED")
        run_path = os.path.join(RUNS_DIR, ticket_id, f"blocked-{job_id[:8]}")
        os.makedirs(run_path, exist_ok=True)

        receipt_path = os.path.join(run_path, "blocked_receipt.md")

        content = f"""# DEGRADED MODE BLOCKED JOB RECEIPT

**Job ID:** {job_id}
**Ticket:** {ticket_id}
**Timestamp:** {datetime.now().isoformat()}
**Status:** BLOCKED

## Reason
{reason}

## Degraded Mode Policy
```json
{json.dumps(self.policy, indent=2)}
```

## Job Details
```json
{json.dumps(payload, indent=2)}
```

## Impact
This PROD job was blocked due to system degradation. It will be automatically
retried when the system exits degraded mode.

---
Generated by: Degraded Mode Handler
Type: Safety Block Receipt
"""

        with open(receipt_path, 'w') as f:
            f.write(content)

        print(f"Blocked receipt written: {receipt_path}")
        return receipt_path

    def enforce_rate_limits(self):
        """Enforce outbound rate limits in degraded mode"""
        if not self.policy["degraded_mode"]:
            return

        rate_cap = self.policy["restrictions"]["outbound_rate_cap"]
        max_concurrent = self.policy["restrictions"]["max_concurrent_jobs"]

        # Update autonomy config
        conn = self.queue.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE autonomy_config
            SET value = ?, updated_at = ?
            WHERE key = 'max_concurrent_jobs'
        """, (str(max_concurrent), datetime.now().isoformat()))

        cursor.execute("""
            INSERT OR REPLACE INTO autonomy_config (key, value, updated_at)
            VALUES ('outbound_rate_cap', ?, ?)
        """, (str(rate_cap), datetime.now().isoformat()))

        conn.commit()
        conn.close()

        print(f"Rate limits enforced: max_concurrent={max_concurrent}, rate_cap={rate_cap}")

    def generate_degraded_mode_report(self):
        """Generate report of degraded mode actions"""
        report_path = os.path.join(RECEIPTS_DIR, f"DEGRADED_MODE_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md")

        content = f"""# DEGRADED MODE REPORT

**Timestamp:** {datetime.now().isoformat()}
**Mode:** {"ACTIVE" if self.policy["degraded_mode"] else "INACTIVE"}

## Triggers
"""
        for trigger in self.policy.get("triggers", []):
            content += f"- {trigger}\n"

        content += f"""
## Restrictions Applied
- **PROD Jobs Blocked:** {self.policy["restrictions"]["prod_jobs_blocked"]}
- **Only Safe Services:** {self.policy["restrictions"]["only_safe_services"]}
- **Outbound Rate Cap:** {self.policy["restrictions"]["outbound_rate_cap"]}
- **Max Concurrent Jobs:** {self.policy["restrictions"]["max_concurrent_jobs"]}

## Jobs Processed
- **Blocked PROD Jobs:** {len(self.blocked_jobs)}
- **Safe Jobs Allowed:** {len(self.safe_jobs)}

### Blocked Jobs
"""
        for job_id in self.blocked_jobs[:10]:
            content += f"- {job_id}\n"

        if len(self.blocked_jobs) > 10:
            content += f"... and {len(self.blocked_jobs) - 10} more\n"

        content += """
## Recovery Instructions

To exit degraded mode:
1. Resolve the underlying triggers
2. Run: `python scripts/exit_degraded_mode.py`
3. Verify system health with daily health report

---
Generated by: Degraded Mode Handler
"""

        with open(report_path, 'w') as f:
            f.write(content)

        print(f"Degraded mode report: {report_path}")
        return report_path

def simulate_degraded_mode():
    """Simulate degraded mode for testing"""
    print("Simulating degraded mode activation...")

    # Create test policy with triggers
    policy = {
        "degraded_mode": True,
        "timestamp": datetime.now().isoformat(),
        "triggers": ["OPEN_EXCEPTIONS_HIGH", "REPEATED_EXCEPTION"],
        "restrictions": {
            "prod_jobs_blocked": True,
            "only_safe_services": True,
            "outbound_rate_cap": 10,
            "max_concurrent_jobs": 2
        },
        "reason": "Simulated for testing"
    }

    # Write policy
    os.makedirs(POLICIES_DIR, exist_ok=True)
    policy_file = os.path.join(POLICIES_DIR, "degraded_mode_policy.json")
    with open(policy_file, 'w') as f:
        json.dump(policy, f, indent=2)

    # Create test jobs
    queue = QueueV2()

    # PROD job (should be blocked)
    prod_job = {
        "ticket_id": "TEST-PROD",
        "type": "command",
        "command": "deploy production",
        "run_intent": "PROD"
    }
    prod_job_id = queue.enqueue(prod_job)
    print(f"Enqueued PROD job: {prod_job_id}")

    # Safe job (should be allowed)
    safe_job = {
        "ticket_id": "TEST-SAFE",
        "type": "command",
        "command": "health_check status",
        "run_intent": "TEST_POSITIVE",
        "service": "health_check"
    }
    safe_job_id = queue.enqueue(safe_job)
    print(f"Enqueued SAFE job: {safe_job_id}")

    # Process with degraded mode
    handler = DegradedModeHandler()
    handler.process_queue_in_degraded_mode()
    handler.enforce_rate_limits()
    report = handler.generate_degraded_mode_report()

    print(f"\nDegraded mode simulation complete")
    print(f"Blocked jobs: {len(handler.blocked_jobs)}")
    print(f"Safe jobs: {len(handler.safe_jobs)}")
    print(f"Report: {report}")

def main():
    """Main execution"""
    import argparse

    parser = argparse.ArgumentParser(description="Degraded Mode Handler")
    parser.add_argument("--simulate", action="store_true", help="Simulate degraded mode")
    parser.add_argument("--process", action="store_true", help="Process queue in degraded mode")
    parser.add_argument("--enforce", action="store_true", help="Enforce rate limits")

    args = parser.parse_args()

    if args.simulate:
        simulate_degraded_mode()
    else:
        handler = DegradedModeHandler()

        if args.process:
            handler.process_queue_in_degraded_mode()

        if args.enforce:
            handler.enforce_rate_limits()

        if handler.policy["degraded_mode"]:
            handler.generate_degraded_mode_report()
            print("System is in DEGRADED MODE")
        else:
            print("System is operating normally")

    return 0

if __name__ == "__main__":
    sys.exit(main())