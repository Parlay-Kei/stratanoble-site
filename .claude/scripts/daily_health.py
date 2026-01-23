#!/usr/bin/env python3
"""
Daily Health Report Generator for ANX Autonomy V3
Generates comprehensive health metrics every 24 hours
"""

import os
import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
ANX_ROOT = r"C:\Dev\.claude-anx"
DB_PATH = os.path.join(ANX_ROOT, "state", "anx_state.db")
RECEIPTS_DIR = os.path.join(ANX_ROOT, "receipts")
POLICIES_DIR = os.path.join(ANX_ROOT, "policies")

class DailyHealthMonitor:
    def __init__(self):
        self.report_date = datetime.now()
        self.metrics = {
            "runner_health": {},
            "queue_metrics": {},
            "job_outcomes": {},
            "exceptions": {},
            "kill_switch": {},
            "degraded_mode": {}
        }
        self.health_status = "HEALTHY"
        self.warnings = []
        self.degraded_triggers = []

    def get_db_connection(self):
        return sqlite3.connect(DB_PATH)

    def collect_runner_health(self):
        """Collect runner heartbeat data"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Get all runner heartbeats from last 24 hours
        cutoff = (datetime.now() - timedelta(hours=24)).isoformat()
        cursor.execute("""
            SELECT runner_id, MAX(last_heartbeat) as last_seen,
                   COUNT(*) as heartbeat_count, status
            FROM runner_heartbeats
            WHERE last_heartbeat >= ?
            GROUP BY runner_id
            ORDER BY last_seen DESC
        """, (cutoff,))

        runners = []
        for row in cursor.fetchall():
            runner_id, last_seen, count, status = row
            last_seen_dt = datetime.fromisoformat(last_seen)
            gap_minutes = (datetime.now() - last_seen_dt).total_seconds() / 60

            runner_info = {
                "runner_id": runner_id[:8],
                "last_heartbeat": last_seen,
                "heartbeat_count": count,
                "status": status,
                "gap_minutes": round(gap_minutes, 1)
            }
            runners.append(runner_info)

            # Check for heartbeat gap > 30 minutes
            if gap_minutes > 30:
                self.warnings.append(f"Runner {runner_id[:8]} heartbeat gap: {gap_minutes:.1f} minutes")
                self.degraded_triggers.append("HEARTBEAT_GAP")

        # Get any dead runners (no heartbeat in 1 hour)
        dead_cutoff = (datetime.now() - timedelta(hours=1)).isoformat()
        cursor.execute("""
            SELECT COUNT(DISTINCT runner_id)
            FROM runner_heartbeats
            WHERE last_heartbeat < ?
        """, (dead_cutoff,))
        dead_runners = cursor.fetchone()[0]

        conn.close()

        self.metrics["runner_health"] = {
            "active_runners": len(runners),
            "dead_runners": dead_runners,
            "runners": runners,
            "oldest_heartbeat_gap": max([r["gap_minutes"] for r in runners]) if runners else 0
        }

    def collect_queue_metrics(self):
        """Collect queue depth and processing metrics"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Current queue depth by status
        cursor.execute("""
            SELECT status, COUNT(*) as count
            FROM queue
            GROUP BY status
        """)
        queue_by_status = {row[0]: row[1] for row in cursor.fetchall()}

        # Jobs processed in last 24 hours
        cutoff = (datetime.now() - timedelta(hours=24)).isoformat()
        cursor.execute("""
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
                   SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
                   SUM(CASE WHEN status = 'BLOCKED' THEN 1 ELSE 0 END) as blocked
            FROM queue
            WHERE created_at >= ?
        """, (cutoff,))

        row = cursor.fetchone()
        jobs_24h = {
            "total": row[0] or 0,
            "completed": row[1] or 0,
            "failed": row[2] or 0,
            "blocked": row[3] or 0
        }

        conn.close()

        self.metrics["queue_metrics"] = {
            "current_depth": queue_by_status,
            "pending_count": queue_by_status.get("PENDING", 0),
            "processing_count": queue_by_status.get("PROCESSING", 0),
            "jobs_24h": jobs_24h
        }

    def collect_job_outcomes(self):
        """Collect job outcomes for last 24 hours"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cutoff = (datetime.now() - timedelta(hours=24)).isoformat()

        # Jobs by outcome
        cursor.execute("""
            SELECT outcome, COUNT(*) as count
            FROM queue
            WHERE created_at >= ? AND outcome IS NOT NULL
            GROUP BY outcome
            ORDER BY count DESC
        """, (cutoff,))

        outcomes = {}
        for row in cursor.fetchall():
            outcomes[row[0]] = row[1]

        # Calculate success rate
        total_with_outcome = sum(outcomes.values())
        success_count = outcomes.get("PASS", 0)
        success_rate = (success_count / total_with_outcome * 100) if total_with_outcome > 0 else 0

        conn.close()

        self.metrics["job_outcomes"] = {
            "by_outcome": outcomes,
            "total": total_with_outcome,
            "success_rate": round(success_rate, 1)
        }

    def collect_exceptions(self):
        """Collect exception metrics for last 24 hours"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cutoff = (datetime.now() - timedelta(hours=24)).isoformat()

        # Exceptions by error category
        cursor.execute("""
            SELECT
                CASE
                    WHEN last_error LIKE '%timeout%' THEN 'TIMEOUT'
                    WHEN last_error LIKE '%budget%' THEN 'BUDGET_EXCEEDED'
                    WHEN last_error LIKE '%permission%' THEN 'PERMISSION_DENIED'
                    WHEN last_error LIKE '%connection%' THEN 'CONNECTION_ERROR'
                    WHEN last_error LIKE '%kill switch%' THEN 'KILL_SWITCH'
                    ELSE 'OTHER'
                END as error_code,
                COUNT(*) as count
            FROM queue
            WHERE status = 'FAILED' AND created_at >= ?
            GROUP BY error_code
            ORDER BY count DESC
        """, (cutoff,))

        exceptions_by_code = {}
        total_exceptions = 0
        for row in cursor.fetchall():
            exceptions_by_code[row[0]] = row[1]
            total_exceptions += row[1]

        # Check for repeated exceptions (same error >= 5 times)
        cursor.execute("""
            SELECT last_error, COUNT(*) as count
            FROM queue
            WHERE status = 'FAILED' AND created_at >= ?
            GROUP BY last_error
            HAVING count >= 5
            ORDER BY count DESC
        """, (cutoff,))

        repeated_exceptions = []
        for row in cursor.fetchall():
            repeated_exceptions.append({
                "error": row[0][:100] if row[0] else "Unknown",
                "count": row[1]
            })
            self.degraded_triggers.append("REPEATED_EXCEPTION")

        # Open exception tickets
        cursor.execute("""
            SELECT COUNT(*) as open_count
            FROM tickets
            WHERE status = 'OPEN' AND id LIKE 'EXC-%'
        """)
        open_exceptions = cursor.fetchone()[0]

        if open_exceptions > 20:
            self.degraded_triggers.append("OPEN_EXCEPTIONS_HIGH")

        conn.close()

        self.metrics["exceptions"] = {
            "total_24h": total_exceptions,
            "by_code": exceptions_by_code,
            "repeated": repeated_exceptions,
            "open_tickets": open_exceptions
        }

    def collect_kill_switch_status(self):
        """Collect kill switch status and transitions"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Current kill switch status
        cursor.execute("SELECT value FROM autonomy_config WHERE key = 'kill_switch'")
        row = cursor.fetchone()
        current_status = row[0] if row else "false"

        # Last transition
        cursor.execute("""
            SELECT type, timestamp, payload
            FROM events
            WHERE type IN ('KILL_SWITCH_ACTIVATED', 'KILL_SWITCH_DEACTIVATED')
            ORDER BY timestamp DESC
            LIMIT 1
        """)

        last_transition = None
        row = cursor.fetchone()
        if row:
            last_transition = {
                "type": row[0],
                "timestamp": row[1],
                "payload": json.loads(row[2]) if row[2] else {}
            }

        # Transitions in last 24 hours
        cutoff = (datetime.now() - timedelta(hours=24)).isoformat()
        cursor.execute("""
            SELECT COUNT(*)
            FROM events
            WHERE type IN ('KILL_SWITCH_ACTIVATED', 'KILL_SWITCH_DEACTIVATED')
            AND timestamp >= ?
        """, (cutoff,))
        transitions_24h = cursor.fetchone()[0]

        conn.close()

        self.metrics["kill_switch"] = {
            "current_status": "ACTIVE" if current_status == "true" else "INACTIVE",
            "last_transition": last_transition,
            "transitions_24h": transitions_24h
        }

    def check_degraded_mode_triggers(self):
        """Check if degraded mode should be activated"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Check proof failures in last 24 hours
        cutoff = (datetime.now() - timedelta(hours=24)).isoformat()
        cursor.execute("""
            SELECT COUNT(*)
            FROM runs
            WHERE status = 'FAILED' AND started_at >= ?
        """, (cutoff,))
        proof_fails = cursor.fetchone()[0]

        if proof_fails > 3:
            self.degraded_triggers.append("PROOF_FAILURES_HIGH")

        conn.close()

        # Determine if we should enter degraded mode
        should_degrade = len(self.degraded_triggers) > 0

        self.metrics["degraded_mode"] = {
            "should_activate": should_degrade,
            "triggers": self.degraded_triggers,
            "active_warnings": self.warnings
        }

        # Update health status
        if should_degrade:
            self.health_status = "DEGRADED"
        elif self.warnings:
            self.health_status = "WARNING"
        else:
            self.health_status = "HEALTHY"

        return should_degrade

    def write_degraded_mode_policy(self, activate):
        """Write degraded mode policy file"""
        policy_file = os.path.join(POLICIES_DIR, "degraded_mode_policy.json")
        os.makedirs(POLICIES_DIR, exist_ok=True)

        policy = {
            "degraded_mode": activate,
            "timestamp": datetime.now().isoformat(),
            "triggers": self.degraded_triggers if activate else [],
            "restrictions": {
                "prod_jobs_blocked": activate,
                "only_safe_services": activate,
                "outbound_rate_cap": 10 if activate else 100,
                "max_concurrent_jobs": 2 if activate else 5
            },
            "reason": "Automated trigger detection" if activate else "System healthy"
        }

        with open(policy_file, 'w') as f:
            json.dump(policy, f, indent=2)

        return policy

    def generate_health_report(self):
        """Generate the daily health report"""
        report_date = self.report_date.strftime("%Y%m%d")
        report_path = os.path.join(RECEIPTS_DIR, f"DAILY_HEALTH_{report_date}.md")

        # Collect all metrics
        self.collect_runner_health()
        self.collect_queue_metrics()
        self.collect_job_outcomes()
        self.collect_exceptions()
        self.collect_kill_switch_status()
        should_degrade = self.check_degraded_mode_triggers()

        # Write degraded mode policy
        degraded_policy = self.write_degraded_mode_policy(should_degrade)

        # Generate report content
        content = f"""# DAILY HEALTH REPORT

**Date:** {self.report_date.isoformat()}
**Status:** {self.health_status}
**Degraded Mode:** {"ACTIVE" if should_degrade else "INACTIVE"}

## Runner Health

- **Active Runners:** {self.metrics["runner_health"]["active_runners"]}
- **Dead Runners:** {self.metrics["runner_health"]["dead_runners"]}
- **Oldest Heartbeat Gap:** {self.metrics["runner_health"]["oldest_heartbeat_gap"]:.1f} minutes

### Last Heartbeats
"""
        for runner in self.metrics["runner_health"]["runners"][:5]:
            content += f"- Runner {runner['runner_id']}: {runner['last_heartbeat']} (gap: {runner['gap_minutes']:.1f}m)\n"

        content += f"""
## Queue Metrics

### Current Depth
- **Pending:** {self.metrics["queue_metrics"]["pending_count"]}
- **Processing:** {self.metrics["queue_metrics"]["processing_count"]}
- **Total Queue:** {sum(self.metrics["queue_metrics"]["current_depth"].values())}

### Jobs Processed (24h)
- **Total:** {self.metrics["queue_metrics"]["jobs_24h"]["total"]}
- **Completed:** {self.metrics["queue_metrics"]["jobs_24h"]["completed"]}
- **Failed:** {self.metrics["queue_metrics"]["jobs_24h"]["failed"]}
- **Blocked:** {self.metrics["queue_metrics"]["jobs_24h"]["blocked"]}

## Job Outcomes (24h)

- **Total with Outcome:** {self.metrics["job_outcomes"]["total"]}
- **Success Rate:** {self.metrics["job_outcomes"]["success_rate"]}%

### By Outcome
"""
        for outcome, count in self.metrics["job_outcomes"]["by_outcome"].items():
            content += f"- **{outcome}:** {count}\n"

        content += f"""
## Exceptions (24h)

- **Total Exceptions:** {self.metrics["exceptions"]["total_24h"]}
- **Open Exception Tickets:** {self.metrics["exceptions"]["open_tickets"]}

### By Error Code
"""
        for code, count in self.metrics["exceptions"]["by_code"].items():
            content += f"- **{code}:** {count}\n"

        if self.metrics["exceptions"]["repeated"]:
            content += "\n### Repeated Exceptions (>=5)\n"
            for exc in self.metrics["exceptions"]["repeated"]:
                content += f"- {exc['error']}: {exc['count']} occurrences\n"

        content += f"""
## Kill Switch Status

- **Current Status:** {self.metrics["kill_switch"]["current_status"]}
- **Transitions (24h):** {self.metrics["kill_switch"]["transitions_24h"]}
"""
        if self.metrics["kill_switch"]["last_transition"]:
            trans = self.metrics["kill_switch"]["last_transition"]
            content += f"- **Last Transition:** {trans['type']} at {trans['timestamp']}\n"

        content += f"""
## Degraded Mode Assessment

- **Status:** {"TRIGGERED" if should_degrade else "NORMAL"}
- **Active Triggers:** {len(self.degraded_triggers)}
"""
        if self.degraded_triggers:
            content += "\n### Triggers Detected\n"
            for trigger in self.degraded_triggers:
                content += f"- {trigger}\n"

        if self.warnings:
            content += "\n### Active Warnings\n"
            for warning in self.warnings:
                content += f"- {warning}\n"

        content += f"""
## Policy Configuration

```json
{json.dumps(degraded_policy, indent=2)}
```

## Health Score

**Overall Health:** {self.health_status}

### Scoring Breakdown
- Runner Health: {"OK" if self.metrics["runner_health"]["oldest_heartbeat_gap"] < 30 else "WARNING"}
- Queue Health: {"OK" if self.metrics["queue_metrics"]["pending_count"] < 50 else "WARNING"}
- Exception Rate: {"OK" if self.metrics["exceptions"]["total_24h"] < 10 else "WARNING"}
- Open Exceptions: {"CRITICAL" if self.metrics["exceptions"]["open_tickets"] > 20 else "OK"}

---
Generated by: ANX Daily Health Monitor
Type: Automated Daily Report
"""

        # Write report
        os.makedirs(RECEIPTS_DIR, exist_ok=True)
        with open(report_path, 'w') as f:
            f.write(content)

        print(f"Daily health report generated: {report_path}")
        return report_path

def main():
    """Generate daily health report"""
    monitor = DailyHealthMonitor()
    report_path = monitor.generate_health_report()

    print(f"\nHealth Status: {monitor.health_status}")
    if monitor.degraded_triggers:
        print(f"Degraded Mode ACTIVATED - Triggers: {', '.join(monitor.degraded_triggers)}")

    return 0 if monitor.health_status != "CRITICAL" else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())