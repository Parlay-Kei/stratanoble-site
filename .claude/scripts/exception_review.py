#!/usr/bin/env python3
"""
Weekly Exception Review Pack Generator
Analyzes exception patterns and provides actionable insights
"""

import os
import json
import sqlite3
from datetime import datetime, timedelta
from collections import Counter

ANX_ROOT = r"C:\Dev\.claude-anx"
DB_PATH = os.path.join(ANX_ROOT, "state", "anx_state.db")
RECEIPTS_DIR = os.path.join(ANX_ROOT, "receipts")

class ExceptionReviewGenerator:
    def __init__(self):
        self.review_date = datetime.now()
        self.week_start = self.review_date - timedelta(days=7)
        self.exceptions_data = {
            "top_codes": {},
            "oldest_open": [],
            "recurring_patterns": {},
            "deployments": [],
            "rollbacks": [],
            "resolution_rate": 0,
            "mttr": None  # Mean Time To Resolution
        }

    def get_db_connection(self):
        return sqlite3.connect(DB_PATH)

    def analyze_exception_codes(self):
        """Analyze top exception codes from the past week"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Get exceptions from last week
        cursor.execute("""
            SELECT
                CASE
                    WHEN last_error LIKE '%timeout%' THEN 'TIMEOUT'
                    WHEN last_error LIKE '%budget%' THEN 'BUDGET_EXCEEDED'
                    WHEN last_error LIKE '%permission%' THEN 'PERMISSION_DENIED'
                    WHEN last_error LIKE '%connection%' THEN 'CONNECTION_ERROR'
                    WHEN last_error LIKE '%kill switch%' THEN 'KILL_SWITCH'
                    WHEN last_error LIKE '%memory%' THEN 'OUT_OF_MEMORY'
                    WHEN last_error LIKE '%disk%' THEN 'DISK_FULL'
                    WHEN last_error LIKE '%auth%' THEN 'AUTHENTICATION_ERROR'
                    WHEN last_error LIKE '%rate limit%' THEN 'RATE_LIMITED'
                    ELSE 'OTHER'
                END as error_code,
                COUNT(*) as count,
                AVG(retry_count) as avg_retries
            FROM queue
            WHERE status = 'FAILED'
            AND created_at >= ?
            GROUP BY error_code
            ORDER BY count DESC
        """, (self.week_start.isoformat(),))

        for row in cursor.fetchall():
            error_code, count, avg_retries = row
            self.exceptions_data["top_codes"][error_code] = {
                "count": count,
                "avg_retries": round(avg_retries, 2) if avg_retries else 0
            }

        # Get specific error messages for top failures
        cursor.execute("""
            SELECT last_error, COUNT(*) as count
            FROM queue
            WHERE status = 'FAILED'
            AND created_at >= ?
            GROUP BY last_error
            ORDER BY count DESC
            LIMIT 10
        """, (self.week_start.isoformat(),))

        self.exceptions_data["top_messages"] = []
        for row in cursor.fetchall():
            error_msg, count = row
            self.exceptions_data["top_messages"].append({
                "message": error_msg[:200] if error_msg else "Unknown",
                "count": count
            })

        conn.close()

    def find_oldest_open_exceptions(self):
        """Find the oldest unresolved exception tickets"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, title, created_at, owner
            FROM tickets
            WHERE status = 'OPEN'
            AND id LIKE 'EXC-%'
            ORDER BY created_at ASC
            LIMIT 10
        """)

        for row in cursor.fetchall():
            ticket_id, title, created_at, owner = row
            created_dt = datetime.fromisoformat(created_at)
            age_days = (self.review_date - created_dt).days

            self.exceptions_data["oldest_open"].append({
                "ticket_id": ticket_id,
                "title": title[:100] if title else "Unknown",
                "created_at": created_at,
                "age_days": age_days,
                "owner": owner
            })

        conn.close()

    def analyze_recurring_patterns(self):
        """Identify recurring exception patterns"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Find exceptions that occur at specific times
        cursor.execute("""
            SELECT
                strftime('%H', created_at) as hour,
                COUNT(*) as count
            FROM queue
            WHERE status = 'FAILED'
            AND created_at >= ?
            GROUP BY hour
            ORDER BY count DESC
            LIMIT 5
        """, (self.week_start.isoformat(),))

        peak_hours = []
        for row in cursor.fetchall():
            hour, count = row
            peak_hours.append({
                "hour": f"{hour}:00",
                "count": count
            })

        self.exceptions_data["recurring_patterns"]["peak_hours"] = peak_hours

        # Find jobs that fail repeatedly
        cursor.execute("""
            SELECT
                json_extract(payload, '$.ticket_id') as ticket_id,
                COUNT(*) as failure_count,
                MAX(retry_count) as max_retries
            FROM queue
            WHERE status = 'FAILED'
            AND created_at >= ?
            GROUP BY ticket_id
            HAVING failure_count > 3
            ORDER BY failure_count DESC
            LIMIT 10
        """, (self.week_start.isoformat(),))

        repeat_failures = []
        for row in cursor.fetchall():
            ticket_id, failure_count, max_retries = row
            repeat_failures.append({
                "ticket_id": ticket_id if ticket_id else "Unknown",
                "failure_count": failure_count,
                "max_retries": max_retries
            })

        self.exceptions_data["recurring_patterns"]["repeat_failures"] = repeat_failures

        conn.close()

    def analyze_deployments_and_rollbacks(self):
        """Analyze deployment and rollback events"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Find deployment events
        cursor.execute("""
            SELECT id, json_extract(payload, '$.command') as command, created_at
            FROM queue
            WHERE (payload LIKE '%deploy%' OR payload LIKE '%release%')
            AND status = 'COMPLETED'
            AND created_at >= ?
            ORDER BY created_at DESC
        """, (self.week_start.isoformat(),))

        for row in cursor.fetchall():
            job_id, command, created_at = row
            self.exceptions_data["deployments"].append({
                "job_id": job_id[:8],
                "command": command[:100] if command else "deployment",
                "timestamp": created_at
            })

        # Find rollback events
        cursor.execute("""
            SELECT id, json_extract(payload, '$.command') as command, created_at, last_error
            FROM queue
            WHERE payload LIKE '%rollback%'
            AND created_at >= ?
            ORDER BY created_at DESC
        """, (self.week_start.isoformat(),))

        for row in cursor.fetchall():
            job_id, command, created_at, error = row
            self.exceptions_data["rollbacks"].append({
                "job_id": job_id[:8],
                "command": command[:100] if command else "rollback",
                "timestamp": created_at,
                "reason": error[:100] if error else "Manual rollback"
            })

        conn.close()

    def calculate_resolution_metrics(self):
        """Calculate exception resolution metrics"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Count resolved vs new exceptions
        cursor.execute("""
            SELECT
                SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open
            FROM tickets
            WHERE id LIKE 'EXC-%'
            AND created_at >= ?
        """, (self.week_start.isoformat(),))

        row = cursor.fetchone()
        if row:
            resolved, open_count = row
            total = (resolved or 0) + (open_count or 0)
            if total > 0:
                self.exceptions_data["resolution_rate"] = round((resolved or 0) / total * 100, 1)

        # Calculate mean time to resolution (simplified)
        cursor.execute("""
            SELECT AVG(
                JULIANDAY(datetime('now')) - JULIANDAY(created_at)
            ) as avg_days
            FROM tickets
            WHERE id LIKE 'EXC-%'
            AND status = 'CLOSED'
            AND created_at >= ?
        """, ((self.review_date - timedelta(days=30)).isoformat(),))

        row = cursor.fetchone()
        if row and row[0]:
            self.exceptions_data["mttr"] = round(row[0], 1)

        conn.close()

    def generate_recommendations(self):
        """Generate actionable recommendations based on analysis"""
        recommendations = []

        # Check for high exception rate
        total_exceptions = sum(data["count"] for data in self.exceptions_data["top_codes"].values())
        if total_exceptions > 100:
            recommendations.append({
                "priority": "HIGH",
                "issue": f"High exception rate ({total_exceptions} failures this week)",
                "action": "Investigate root causes of top error codes"
            })

        # Check for old open tickets
        if len(self.exceptions_data["oldest_open"]) > 0:
            oldest = self.exceptions_data["oldest_open"][0]
            if oldest["age_days"] > 7:
                recommendations.append({
                    "priority": "MEDIUM",
                    "issue": f"Unresolved exceptions older than 7 days",
                    "action": f"Review and close ticket {oldest['ticket_id']} (age: {oldest['age_days']} days)"
                })

        # Check for timeout issues
        if "TIMEOUT" in self.exceptions_data["top_codes"]:
            timeout_count = self.exceptions_data["top_codes"]["TIMEOUT"]["count"]
            if timeout_count > 20:
                recommendations.append({
                    "priority": "HIGH",
                    "issue": f"Frequent timeout errors ({timeout_count} this week)",
                    "action": "Increase timeout limits or optimize slow operations"
                })

        # Check for budget exceeded
        if "BUDGET_EXCEEDED" in self.exceptions_data["top_codes"]:
            budget_count = self.exceptions_data["top_codes"]["BUDGET_EXCEEDED"]["count"]
            if budget_count > 10:
                recommendations.append({
                    "priority": "MEDIUM",
                    "issue": f"Budget limits hit {budget_count} times",
                    "action": "Review and adjust budget caps or optimize resource usage"
                })

        # Check for recent rollbacks
        if len(self.exceptions_data["rollbacks"]) > 0:
            recommendations.append({
                "priority": "HIGH",
                "issue": f"{len(self.exceptions_data['rollbacks'])} rollback(s) this week",
                "action": "Review deployment process and add additional validation"
            })

        return recommendations

    def generate_review_pack(self):
        """Generate the complete exception review pack"""
        # Collect all data
        self.analyze_exception_codes()
        self.find_oldest_open_exceptions()
        self.analyze_recurring_patterns()
        self.analyze_deployments_and_rollbacks()
        self.calculate_resolution_metrics()
        recommendations = self.generate_recommendations()

        # Generate report
        report_date = self.review_date.strftime("%Y%m%d")
        report_path = os.path.join(RECEIPTS_DIR, f"EXCEPTION_REVIEW_{report_date}.md")

        content = f"""# WEEKLY EXCEPTION REVIEW PACK

**Review Date:** {self.review_date.strftime("%Y-%m-%d")}
**Period:** {self.week_start.strftime("%Y-%m-%d")} to {self.review_date.strftime("%Y-%m-%d")}
**Resolution Rate:** {self.exceptions_data["resolution_rate"]}%
**MTTR:** {self.exceptions_data["mttr"] or "N/A"} days

## Top Exception Codes

| Error Code | Count | Avg Retries |
|------------|-------|-------------|
"""
        for code, data in sorted(self.exceptions_data["top_codes"].items(),
                                 key=lambda x: x[1]["count"], reverse=True)[:10]:
            content += f"| {code} | {data['count']} | {data['avg_retries']} |\n"

        content += f"""

## Oldest Open Exceptions

| Ticket ID | Title | Age (days) | Owner |
|-----------|-------|------------|-------|
"""
        for exc in self.exceptions_data["oldest_open"][:5]:
            content += f"| {exc['ticket_id']} | {exc['title'][:50]}... | {exc['age_days']} | {exc['owner']} |\n"

        content += f"""

## Recurring Patterns

### Peak Failure Hours
"""
        for hour_data in self.exceptions_data["recurring_patterns"].get("peak_hours", [])[:3]:
            content += f"- **{hour_data['hour']}**: {hour_data['count']} failures\n"

        content += f"""

### Repeatedly Failing Jobs
"""
        for failure in self.exceptions_data["recurring_patterns"].get("repeat_failures", [])[:5]:
            content += f"- **{failure['ticket_id']}**: {failure['failure_count']} failures (max retries: {failure['max_retries']})\n"

        content += f"""

## Deployment Summary

### Recent Deployments ({len(self.exceptions_data['deployments'])})
"""
        for deploy in self.exceptions_data["deployments"][:5]:
            content += f"- {deploy['timestamp']}: {deploy['command']}\n"

        if self.exceptions_data["rollbacks"]:
            content += f"""

### Rollbacks ({len(self.exceptions_data['rollbacks'])})
"""
            for rollback in self.exceptions_data["rollbacks"]:
                content += f"- {rollback['timestamp']}: {rollback['reason']}\n"

        content += f"""

## Top Error Messages

| Error Message | Count |
|---------------|-------|
"""
        for msg_data in self.exceptions_data["top_messages"][:5]:
            msg = msg_data["message"][:100]
            content += f"| {msg}... | {msg_data['count']} |\n"

        content += f"""

## Recommendations

"""
        for rec in recommendations:
            content += f"""### [{rec['priority']}] {rec['issue']}
**Action:** {rec['action']}

"""

        content += f"""
## Action Items

Based on this week's analysis:

1. **Immediate Actions (This Week)**
"""
        urgent_count = 0
        for rec in recommendations:
            if rec["priority"] == "HIGH":
                urgent_count += 1
                content += f"   - {rec['action']}\n"

        if urgent_count == 0:
            content += "   - No urgent actions required\n"

        content += f"""

2. **Follow-up Actions (Next Week)**
   - Review and close exception tickets older than 7 days
   - Monitor error patterns identified in peak hours
   - Update retry policies for frequently failing jobs

3. **Process Improvements**
   - Consider implementing automatic exception grouping
   - Add alerting for repeated failures
   - Create runbooks for common error codes

---
Generated by: Exception Review Generator
Type: Weekly Analysis Pack
"""

        os.makedirs(RECEIPTS_DIR, exist_ok=True)
        with open(report_path, 'w') as f:
            f.write(content)

        print(f"Exception review pack generated: {report_path}")
        return report_path

def main():
    """Generate weekly exception review"""
    generator = ExceptionReviewGenerator()
    report_path = generator.generate_review_pack()

    # Print summary
    total_exceptions = sum(data["count"] for data in generator.exceptions_data["top_codes"].values())
    print(f"\nWeekly Exception Summary:")
    print(f"  Total Exceptions: {total_exceptions}")
    print(f"  Resolution Rate: {generator.exceptions_data['resolution_rate']}%")
    print(f"  Open Tickets: {len(generator.exceptions_data['oldest_open'])}")
    print(f"  Rollbacks: {len(generator.exceptions_data['rollbacks'])}")

    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())