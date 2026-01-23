import os
import json
import glob
import sqlite3
from datetime import datetime, timedelta

ANX_ROOT = r"C:\Dev\.claude-anx"
RUNS_DIR = os.path.join(ANX_ROOT, "runs")
OUTPUT_DIR = os.path.join(ANX_ROOT, "receipts")
DB_PATH = r"C:\Dev\.claude-anx\state\anx_state.db"

def load_runs():
    runs = []
    # Search recursively for receipt.json
    pattern = os.path.join(RUNS_DIR, "**", "receipt.json")
    files = glob.glob(pattern, recursive=True)
    
    for f in files:
        try:
            with open(f, 'r') as fp:
                data = json.load(fp)
                runs.append(data)
        except Exception as e:
            print(f"Error loading {f}: {e}")
    return runs

def get_runner_uptime():
    """Calculate runner uptime from heartbeats"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get heartbeat data from last 7 days
    week_ago = (datetime.now() - timedelta(days=7)).isoformat()
    cursor.execute("""
        SELECT runner_id, MIN(last_heartbeat) as first_seen, MAX(last_heartbeat) as last_seen,
               COUNT(*) as heartbeat_count
        FROM runner_heartbeats
        WHERE last_heartbeat >= ?
        GROUP BY runner_id
    """, (week_ago,))

    runners = []
    total_uptime = 0
    for row in cursor.fetchall():
        runner_id, first, last, count = row
        if first and last:
            uptime = (datetime.fromisoformat(last) - datetime.fromisoformat(first)).total_seconds() / 3600
            total_uptime += uptime
            runners.append({
                "runner_id": runner_id[:8],
                "uptime_hours": uptime,
                "heartbeat_count": count
            })

    conn.close()
    return runners, total_uptime

def get_job_stats_from_db():
    """Get enhanced job statistics from database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    week_ago = (datetime.now() - timedelta(days=7)).isoformat()

    # Get job counts by status
    cursor.execute("""
        SELECT status, COUNT(*) as count
        FROM queue
        WHERE created_at >= ?
        GROUP BY status
    """, (week_ago,))
    status_counts = {row[0]: row[1] for row in cursor.fetchall()}

    # Get job counts by outcome
    cursor.execute("""
        SELECT outcome, COUNT(*) as count
        FROM queue
        WHERE created_at >= ? AND outcome IS NOT NULL
        GROUP BY outcome
    """, (week_ago,))
    outcome_counts = {row[0]: row[1] for row in cursor.fetchall()}

    # Get exception counts by error code/pattern
    cursor.execute("""
        SELECT
            CASE
                WHEN last_error LIKE '%timeout%' THEN 'TIMEOUT'
                WHEN last_error LIKE '%budget%' THEN 'BUDGET_EXCEEDED'
                WHEN last_error LIKE '%permission%' THEN 'PERMISSION_DENIED'
                WHEN last_error LIKE '%connection%' THEN 'CONNECTION_ERROR'
                ELSE 'OTHER'
            END as error_category,
            COUNT(*) as count
        FROM queue
        WHERE status = 'FAILED' AND created_at >= ?
        GROUP BY error_category
    """, (week_ago,))
    exception_counts = {row[0]: row[1] for row in cursor.fetchall()}

    conn.close()
    return {
        "status": status_counts,
        "outcome": outcome_counts,
        "exceptions": exception_counts
    }

def get_kill_switch_events():
    """Get kill switch events from database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    week_ago = (datetime.now() - timedelta(days=7)).isoformat()

    cursor.execute("""
        SELECT type, timestamp, payload
        FROM events
        WHERE type IN ('KILL_SWITCH_ACTIVATED', 'KILL_SWITCH_DEACTIVATED')
        AND timestamp >= ?
        ORDER BY timestamp DESC
    """, (week_ago,))

    events = []
    for row in cursor.fetchall():
        events.append({
            "type": row[0],
            "timestamp": row[1],
            "details": json.loads(row[2]) if row[2] else {}
        })

    # Get current kill switch status
    cursor.execute("SELECT value FROM autonomy_config WHERE key = 'kill_switch'")
    row = cursor.fetchone()
    current_status = row[0] if row else "false"

    conn.close()
    return events, current_status

def generate_watchtower_section():
    """Generate the Watchtower health monitoring section"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    week_ago = (datetime.now() - timedelta(days=7)).isoformat()

    # Check degraded mode activations
    cursor.execute("""
        SELECT COUNT(*)
        FROM events
        WHERE type = 'DEGRADED_MODE_ACTIVATED'
        AND timestamp >= ?
    """, (week_ago,))
    degraded_activations = cursor.fetchone()[0]

    # Check proof failures
    cursor.execute("""
        SELECT COUNT(*)
        FROM runs
        WHERE status = 'FAILED'
        AND started_at >= ?
    """, (week_ago,))
    proof_failures = cursor.fetchone()[0]

    # Check system health trends
    cursor.execute("""
        SELECT
            AVG(CASE WHEN status = 'COMPLETED' THEN 1.0 ELSE 0 END) * 100 as success_rate,
            COUNT(*) as total_jobs
        FROM queue
        WHERE created_at >= ?
    """, (week_ago,))
    row = cursor.fetchone()
    weekly_success_rate = round(row[0], 1) if row[0] else 0
    total_jobs = row[1]

    # Check for critical errors
    cursor.execute("""
        SELECT COUNT(*)
        FROM queue
        WHERE status = 'FAILED'
        AND (last_error LIKE '%CRITICAL%' OR last_error LIKE '%FATAL%')
        AND created_at >= ?
    """, (week_ago,))
    critical_errors = cursor.fetchone()[0]

    # Get last daily health status
    cursor.execute("""
        SELECT value FROM autonomy_config
        WHERE key = 'last_health_status'
    """)
    row = cursor.fetchone()
    last_health_status = row[0] if row else "UNKNOWN"

    conn.close()

    # Determine overall watchtower status
    if critical_errors > 0 or degraded_activations > 0:
        watchtower_status = "ALERT"
        watchtower_indicator = "[RED]"
    elif proof_failures > 5 or weekly_success_rate < 80:
        watchtower_status = "WARNING"
        watchtower_indicator = "[YELLOW]"
    else:
        watchtower_status = "HEALTHY"
        watchtower_indicator = "[GREEN]"

    section = f"""
## Watchtower Health Monitoring

**Status:** {watchtower_indicator} {watchtower_status}
**Last Health Check:** {last_health_status}

### System Health Metrics (7 Days)
- **Success Rate:** {weekly_success_rate}%
- **Total Jobs Processed:** {total_jobs}
- **Proof Failures:** {proof_failures}
- **Critical Errors:** {critical_errors}
- **Degraded Mode Activations:** {degraded_activations}

### Health Indicators
| Metric | Status | Threshold |
|--------|--------|-----------|
| Success Rate | {"PASS" if weekly_success_rate >= 80 else "FAIL"} | >80% |
| Proof Failures | {"PASS" if proof_failures <= 5 else "FAIL"} | <5/week |
| Critical Errors | {"PASS" if critical_errors == 0 else "FAIL"} | 0 |
| Degraded Activations | {"PASS" if degraded_activations == 0 else "FAIL"} | 0 |

"""

    if watchtower_status == "ALERT":
        section += """### [!] Action Required
- Review critical errors immediately
- Check degraded mode triggers
- Verify system resources

"""
    elif watchtower_status == "WARNING":
        section += """### [!] Attention Needed
- Monitor proof failure rate
- Review job success metrics
- Consider preventive maintenance

"""

    return section

def generate_digest():
    runs = load_runs()

    # Get enhanced stats from database
    job_stats = get_job_stats_from_db()
    runners, total_uptime = get_runner_uptime()
    kill_events, kill_status = get_kill_switch_events()

    total_runs = len(runs)
    failed = [r for r in runs if r.get('status') == 'FAILED']
    blocked = [r for r in runs if r.get('status') == 'BLOCKED']
    success = [r for r in runs if r.get('status') == 'SUCCESS']
    expected_fails = [r for r in runs if r.get('details', {}).get('run_outcome') == 'EXPECTED_FAIL']

    # Exceptions (Failures + Blocks - Expected Failures)
    exceptions = [r for r in (failed + blocked) if r not in expected_fails]

    # Spend (Mocked for now as we don't have cost in all receipts perfectly yet)
    total_spend = sum([r.get('details', {}).get('cost_usd', 0) for r in runs])

    # Deploys check (Look for 'deploy' in payload/command)
    deploys = [r for r in runs if 'deploy' in str(r.get('details', {}))]

    now = datetime.now().isoformat()

    report = f"""# Autonomy Weekly Digest

**Generated:** {now}

## Executive Summary
- **Total Jobs Processed:** {total_runs}
- **Success Rate:** {len(success)/total_runs*100 if total_runs else 0:.1f}%
- **Expected Failures:** {len(expected_fails)}
- **Total Spend:** ${total_spend:.2f}
- **Kill Switch Status:** {"ACTIVE" if kill_status == "true" else "INACTIVE"}

## Runner Uptime
- **Total Uptime:** {total_uptime:.1f} hours across {len(runners)} runners
- **Active Runners:**
"""
    for runner in runners:
        report += f"  - Runner {runner['runner_id']}: {runner['uptime_hours']:.1f}h ({runner['heartbeat_count']} heartbeats)\n"

    report += f"""
## Job Statistics by Outcome
"""
    for outcome, count in job_stats.get('outcome', {}).items():
        report += f"- **{outcome}:** {count}\n"

    report += f"""
## Job Statistics by Status
"""
    for status, count in job_stats.get('status', {}).items():
        report += f"- **{status}:** {count}\n"

    report += f"""
## Exception Categories ({sum(job_stats.get('exceptions', {}).values())})
"""
    for category, count in job_stats.get('exceptions', {}).items():
        report += f"- **{category}:** {count}\n"

    report += f"""
## Kill Switch Events ({len(kill_events)})
"""
    if kill_events:
        for event in kill_events:
            report += f"- **{event['type']}** at {event['timestamp']}\n"
        # Show last transition
        if kill_events:
            last_event = kill_events[0]
            report += f"\n*Last transition: {last_event['type']} at {last_event['timestamp']}*\n"
    else:
        report += "No kill switch events this week.\n"

    report += f"""
## Exceptions Detail ({len(exceptions)})
"""
    for ex in exceptions[:10]:  # Limit to top 10
        ticket = ex.get('ticket_id', 'N/A')
        run_id = ex.get('run_id', 'N/A')
        err = ex.get('details', {}).get('stderr') or ex.get('details', {}).get('error') or "Unknown Error"
        report += f"- **{ticket}** ({run_id}): {str(err)[:200]}...\n"

    if len(exceptions) > 10:
        report += f"\n*... and {len(exceptions) - 10} more exceptions*\n"

    report += f"""
## Deploys ({len(deploys)})
"""
    for d in deploys:
        ticket = d.get('ticket_id')
        report += f"- {ticket}: {d.get('details', {}).get('command', 'N/A')}\n"

    # Add Watchtower Section
    report += generate_watchtower_section()

    report += "\n## End of Report"

    outfile = os.path.join(OUTPUT_DIR, f"WEEKLY_DIGEST_{datetime.now().strftime('%Y%m%d')}.md")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(outfile, 'w') as f:
        f.write(report)

    print(f"Digest written to: {outfile}")

if __name__ == "__main__":
    generate_digest()
