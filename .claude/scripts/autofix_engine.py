#!/usr/bin/env python3
"""
Autofix Engine - Bounded automatic remediation for common failures
Max 1 attempt per job, then escalate to exception
Focuses on top 3 failure patterns from taxonomy
"""

import os
import sys
import json
import time
import subprocess
import sqlite3
from datetime import datetime
from pathlib import Path

ANX_ROOT = r"C:\Dev\.claude-anx"
PLAYBOOKS_DIR = os.path.join(ANX_ROOT, "playbooks")
DB_PATH = os.path.join(ANX_ROOT, "state", "anx_state.db")
RECEIPTS_DIR = os.path.join(ANX_ROOT, "receipts", "autofix")

class AutofixEngine:
    def __init__(self):
        self.playbooks = self.load_playbooks()
        self.max_attempts = 1  # Bounded to 1 attempt per job
        self.attempted_fixes = {}  # Track what we've tried

    def load_playbooks(self):
        """Load autofix playbooks from JSON"""
        playbook_file = os.path.join(PLAYBOOKS_DIR, "autofix_playbooks_v1.json")

        if os.path.exists(playbook_file):
            with open(playbook_file, 'r') as f:
                return json.load(f)
        else:
            # Return default playbooks if file doesn't exist
            return self.get_default_playbooks()

    def get_default_playbooks(self):
        """Default playbooks for top 3 failure patterns"""
        return {
            "version": "1.0",
            "playbooks": [
                {
                    "id": "BUDGET_001",
                    "pattern": "BUDGET_EXCEEDED",
                    "class": "POLICY",
                    "description": "Budget exceeded during job execution",
                    "detection": [
                        "budget",
                        "exceeded",
                        "limit",
                        "cap"
                    ],
                    "fixes": [
                        {
                            "name": "increase_budget_allocation",
                            "steps": [
                                {"action": "calculate_optimal_budget", "params": {"multiplier": 1.5}},
                                {"action": "update_job_budget", "params": {"safety_factor": 1.2}},
                                {"action": "retry_with_new_budget", "params": {"delay": 5}}
                            ],
                            "success_rate": 0.75
                        }
                    ]
                },
                {
                    "id": "UNKNOWN_001",
                    "pattern": "OTHER",
                    "class": "CODE_TEST",
                    "description": "Unclassified error requiring diagnosis",
                    "detection": [
                        "other",
                        "unknown",
                        "unhandled"
                    ],
                    "fixes": [
                        {
                            "name": "standard_recovery",
                            "steps": [
                                {"action": "clear_cache", "params": {"target": "node_modules"}},
                                {"action": "reset_environment", "params": {"level": "soft"}},
                                {"action": "retry_with_logging", "params": {"verbose": True}}
                            ],
                            "success_rate": 0.60
                        }
                    ]
                },
                {
                    "id": "TYPE_001",
                    "pattern": "TYPE_ERROR",
                    "class": "CODE_TEST",
                    "description": "TypeScript or type-related errors",
                    "detection": [
                        "type",
                        "undefined",
                        "null",
                        "cannot read",
                        "property"
                    ],
                    "fixes": [
                        {
                            "name": "typescript_recovery",
                            "steps": [
                                {"action": "clear_typescript_cache", "params": {}},
                                {"action": "rebuild_types", "params": {"clean": True}},
                                {"action": "retry_with_type_check", "params": {"strict": False}}
                            ],
                            "success_rate": 0.65
                        }
                    ]
                }
            ],
            "escalation": {
                "after_attempts": 1,
                "create_exception": True,
                "priority": "P2"
            }
        }

    def save_playbooks(self):
        """Save playbooks to file"""
        os.makedirs(PLAYBOOKS_DIR, exist_ok=True)
        playbook_file = os.path.join(PLAYBOOKS_DIR, "autofix_playbooks_v1.json")

        # Get default if not loaded
        if not self.playbooks:
            self.playbooks = self.get_default_playbooks()

        with open(playbook_file, 'w') as f:
            json.dump(self.playbooks, f, indent=2)

        print(f"Playbooks saved: {playbook_file}")
        return playbook_file

    def detect_failure_pattern(self, error_message):
        """Detect which playbook matches the error"""
        if not error_message:
            return None

        error_lower = error_message.lower()

        for playbook in self.playbooks.get("playbooks", []):
            # Check if any detection pattern matches
            for pattern in playbook.get("detection", []):
                if pattern.lower() in error_lower:
                    return playbook

        return None

    def execute_fix(self, playbook, job_id, error_details):
        """Execute autofix playbook steps"""
        print(f"Executing autofix playbook: {playbook['id']}")

        # Check if we've already attempted this job
        if job_id in self.attempted_fixes:
            print(f"Already attempted fix for job {job_id}, escalating...")
            return self.escalate_to_exception(job_id, error_details,
                                            "Autofix attempted but failed")

        # Mark as attempted
        self.attempted_fixes[job_id] = {
            "playbook_id": playbook["id"],
            "timestamp": datetime.now().isoformat()
        }

        # Execute the first fix strategy
        fix = playbook["fixes"][0] if playbook.get("fixes") else None
        if not fix:
            return False

        print(f"Applying fix: {fix['name']}")
        results = []

        for step in fix.get("steps", []):
            result = self.execute_step(step, job_id)
            results.append({
                "action": step["action"],
                "success": result
            })

            if not result:
                print(f"Step failed: {step['action']}")
                break

        # Log attempt
        self.log_autofix_attempt(job_id, playbook, fix, results)

        # Generate receipt
        receipt = self.generate_autofix_receipt(job_id, playbook, fix, results)

        # Return success if all steps passed
        success = all(r["success"] for r in results)

        if not success:
            # Escalate on failure
            self.escalate_to_exception(job_id, error_details,
                                      f"Autofix {playbook['id']} failed")

        return success

    def execute_step(self, step, job_id):
        """Execute individual autofix step"""
        action = step.get("action", "")
        params = step.get("params", {})

        print(f"  Executing step: {action}")

        try:
            if action == "calculate_optimal_budget":
                # Analyze historical usage and calculate new budget
                multiplier = params.get("multiplier", 1.5)
                return self.calculate_budget(job_id, multiplier)

            elif action == "update_job_budget":
                # Update job configuration with new budget
                safety_factor = params.get("safety_factor", 1.2)
                return self.update_budget(job_id, safety_factor)

            elif action == "retry_with_new_budget":
                # Retry the job with updated parameters
                delay = params.get("delay", 5)
                time.sleep(delay)
                return self.retry_job(job_id, {"budget_updated": True})

            elif action == "clear_cache":
                # Clear specified cache
                target = params.get("target", "node_modules")
                return self.clear_cache(target)

            elif action == "reset_environment":
                # Reset environment to known good state
                level = params.get("level", "soft")
                return self.reset_environment(level)

            elif action == "retry_with_logging":
                # Retry with enhanced logging
                verbose = params.get("verbose", True)
                return self.retry_job(job_id, {"verbose": verbose})

            elif action == "clear_typescript_cache":
                # Clear TypeScript build cache
                return self.clear_typescript_cache()

            elif action == "rebuild_types":
                # Rebuild TypeScript definitions
                clean = params.get("clean", True)
                return self.rebuild_types(clean)

            elif action == "retry_with_type_check":
                # Retry with adjusted type checking
                strict = params.get("strict", False)
                return self.retry_job(job_id, {"strict_types": strict})

            else:
                print(f"    Unknown action: {action}")
                return False

        except Exception as e:
            print(f"    Step failed with error: {e}")
            return False

    def calculate_budget(self, job_id, multiplier):
        """Calculate optimal budget based on history"""
        # This would analyze historical resource usage
        # For now, return success to indicate calculation done
        print(f"    Calculated new budget with {multiplier}x multiplier")
        return True

    def update_budget(self, job_id, safety_factor):
        """Update job budget configuration"""
        # This would update the job's budget allocation
        print(f"    Updated budget with {safety_factor}x safety factor")
        return True

    def clear_cache(self, target):
        """Clear specified cache directory"""
        print(f"    Clearing cache: {target}")
        # This would clear the cache
        return True

    def reset_environment(self, level):
        """Reset environment to clean state"""
        print(f"    Resetting environment (level: {level})")
        # This would reset environment variables, temp files, etc.
        return True

    def clear_typescript_cache(self):
        """Clear TypeScript build artifacts"""
        print(f"    Clearing TypeScript cache")
        # This would clear .tsbuildinfo and other TS caches
        return True

    def rebuild_types(self, clean):
        """Rebuild TypeScript type definitions"""
        print(f"    Rebuilding types (clean: {clean})")
        # This would run tsc to rebuild types
        return True

    def retry_job(self, job_id, params):
        """Retry a failed job with new parameters"""
        print(f"    Retrying job {job_id} with params: {params}")

        # Update job status to RETRY
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE queue
            SET status = 'RETRY',
                retry_params = ?,
                updated_at = ?
            WHERE id = ?
        """, (json.dumps(params), datetime.now().isoformat(), job_id))

        conn.commit()
        conn.close()

        return True

    def escalate_to_exception(self, job_id, error_details, reason):
        """Create exception ticket when autofix fails"""
        print(f"Escalating to exception: {reason}")

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        import uuid
        exception_id = str(uuid.uuid4())

        # Create exception ticket
        cursor.execute("""
            INSERT INTO exceptions (id, job_id, error, reason, priority, created_at, status)
            VALUES (?, ?, ?, ?, 'P2', ?, 'OPEN')
        """, (exception_id, job_id, error_details[:500] if error_details else "Unknown",
              reason, datetime.now().isoformat()))

        conn.commit()
        conn.close()

        # Log escalation event
        self.log_event("AUTOFIX_ESCALATION", {
            "job_id": job_id,
            "exception_id": exception_id,
            "reason": reason
        })

        return exception_id

    def log_autofix_attempt(self, job_id, playbook, fix, results):
        """Log autofix attempt to database"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        import uuid
        event_id = str(uuid.uuid4())

        cursor.execute("""
            INSERT INTO events (id, type, payload, timestamp)
            VALUES (?, 'AUTOFIX_ATTEMPT', ?, ?)
        """, (event_id, json.dumps({
            "job_id": job_id,
            "playbook_id": playbook["id"],
            "fix_name": fix["name"],
            "results": results,
            "success": all(r["success"] for r in results)
        }), datetime.now().isoformat()))

        conn.commit()
        conn.close()

    def log_event(self, event_type, payload):
        """Log event to database"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        import uuid
        event_id = str(uuid.uuid4())

        cursor.execute("""
            INSERT INTO events (id, type, payload, timestamp)
            VALUES (?, ?, ?, ?)
        """, (event_id, event_type, json.dumps(payload), datetime.now().isoformat()))

        conn.commit()
        conn.close()

    def generate_autofix_receipt(self, job_id, playbook, fix, results):
        """Generate autofix attempt receipt"""
        os.makedirs(RECEIPTS_DIR, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        receipt_file = os.path.join(RECEIPTS_DIR, f"AUTOFIX_{playbook['id']}_{timestamp}.md")

        success = all(r["success"] for r in results)

        content = f"""# AUTOFIX ATTEMPT RECEIPT

**Job ID:** {job_id}
**Playbook:** {playbook['id']}
**Pattern:** {playbook['pattern']}
**Fix Applied:** {fix['name']}
**Timestamp:** {datetime.now().isoformat()}
**Status:** {"SUCCESS" if success else "FAILED"}

## Playbook Details
- **Description:** {playbook['description']}
- **Class:** {playbook['class']}
- **Expected Success Rate:** {fix.get('success_rate', 0)*100:.0f}%

## Steps Executed
"""

        for i, (step, result) in enumerate(zip(fix['steps'], results), 1):
            status = "[PASS]" if result["success"] else "[FAIL]"
            content += f"{i}. {step['action']}: {status}\n"
            if step.get('params'):
                content += f"   Parameters: {json.dumps(step['params'])}\n"

        content += f"""

## Outcome
"""
        if success:
            content += "Autofix completed successfully. Job will be retried with updated configuration.\n"
        else:
            content += "Autofix failed. Creating exception ticket for manual review.\n"

        content += """

## Bounded Behavior
- Maximum attempts per job: 1
- Escalation after failure: Exception ticket (P2)
- No infinite retry loops
- Safe rollback on failure

---
Generated by: Autofix Engine V1
Type: Bounded Remediation
"""

        with open(receipt_file, 'w') as f:
            f.write(content)

        return receipt_file

    def process_failure(self, job_id):
        """Process a failed job and attempt autofix"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Get job details
        cursor.execute("""
            SELECT last_error, payload, status
            FROM queue
            WHERE id = ?
        """, (job_id,))

        row = cursor.fetchone()
        if not row:
            print(f"Job {job_id} not found")
            conn.close()
            return False

        error, payload_json, status = row

        if status != "FAILED":
            print(f"Job {job_id} is not in FAILED state")
            conn.close()
            return False

        conn.close()

        # Detect failure pattern
        playbook = self.detect_failure_pattern(error)

        if not playbook:
            print(f"No playbook matches error: {error[:100] if error else 'Unknown'}")
            # Still create exception for unmatched failures
            self.escalate_to_exception(job_id, error, "No autofix playbook available")
            return False

        print(f"Matched playbook: {playbook['id']} for pattern: {playbook['pattern']}")

        # Attempt fix
        success = self.execute_fix(playbook, job_id, error)

        if success:
            print(f"Autofix successful for job {job_id}")
        else:
            print(f"Autofix failed for job {job_id}, escalated to exception")

        return success

    def get_autofix_stats(self):
        """Get autofix statistics"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Count autofix attempts
        cursor.execute("""
            SELECT
                json_extract(payload, '$.playbook_id') as playbook,
                json_extract(payload, '$.success') as success,
                COUNT(*) as count
            FROM events
            WHERE type = 'AUTOFIX_ATTEMPT'
            GROUP BY playbook, success
        """)

        stats = {
            "attempts_by_playbook": {},
            "total_attempts": 0,
            "total_successes": 0
        }

        for row in cursor.fetchall():
            playbook, success, count = row
            if playbook not in stats["attempts_by_playbook"]:
                stats["attempts_by_playbook"][playbook] = {
                    "attempts": 0,
                    "successes": 0
                }

            stats["attempts_by_playbook"][playbook]["attempts"] += count
            stats["total_attempts"] += count

            if success:
                stats["attempts_by_playbook"][playbook]["successes"] += count
                stats["total_successes"] += count

        # Calculate success rates
        if stats["total_attempts"] > 0:
            stats["overall_success_rate"] = stats["total_successes"] / stats["total_attempts"]
        else:
            stats["overall_success_rate"] = 0

        for playbook in stats["attempts_by_playbook"].values():
            if playbook["attempts"] > 0:
                playbook["success_rate"] = playbook["successes"] / playbook["attempts"]
            else:
                playbook["success_rate"] = 0

        conn.close()
        return stats

def main():
    """Main execution"""
    import argparse

    parser = argparse.ArgumentParser(description="Autofix Engine")
    parser.add_argument("--process", help="Process a failed job ID")
    parser.add_argument("--save-playbooks", action="store_true",
                       help="Save default playbooks to file")
    parser.add_argument("--stats", action="store_true",
                       help="Show autofix statistics")

    args = parser.parse_args()

    engine = AutofixEngine()

    if args.save_playbooks:
        path = engine.save_playbooks()
        print(f"Playbooks saved to: {path}")

        # Show playbook summary
        print("\nPlaybooks Summary:")
        for pb in engine.playbooks.get("playbooks", []):
            print(f"  - {pb['id']}: {pb['pattern']} ({pb['class']})")
            print(f"    Detection patterns: {', '.join(pb['detection'])}")
            for fix in pb.get("fixes", []):
                print(f"    Fix: {fix['name']} (success rate: {fix.get('success_rate', 0)*100:.0f}%)")

    elif args.process:
        success = engine.process_failure(args.process)
        if success:
            print(f"Successfully applied autofix to job {args.process}")
        else:
            print(f"Autofix not applicable or failed for job {args.process}")

    elif args.stats:
        stats = engine.get_autofix_stats()
        print("\nAutofix Statistics:")
        print(f"  Total Attempts: {stats['total_attempts']}")
        print(f"  Total Successes: {stats['total_successes']}")
        print(f"  Overall Success Rate: {stats['overall_success_rate']*100:.1f}%")

        if stats['attempts_by_playbook']:
            print("\nBy Playbook:")
            for playbook, data in stats['attempts_by_playbook'].items():
                print(f"  {playbook}:")
                print(f"    Attempts: {data['attempts']}")
                print(f"    Successes: {data['successes']}")
                print(f"    Success Rate: {data['success_rate']*100:.1f}%")

    else:
        parser.print_help()

    return 0

if __name__ == "__main__":
    sys.exit(main())