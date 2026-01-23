#!/usr/bin/env python3
"""
Runtime Monitor for Command Center
Monitors and reports on job execution
"""

import sqlite3
import time
from pathlib import Path
from datetime import datetime, timedelta

ANX_ROOT = Path("C:/Dev/.claude-anx")
STATE_DB = ANX_ROOT / "state" / "anx_state.db"

class RuntimeMonitor:
    def __init__(self):
        self.conn = sqlite3.connect(STATE_DB)
        self.conn.row_factory = sqlite3.Row

    def get_stats(self):
        """Get runtime statistics"""
        cursor = self.conn.cursor()

        # Get job counts by status
        cursor.execute("""
            SELECT
                status,
                COUNT(*) as count
            FROM runtime_jobs
            WHERE created_at >= datetime('now', '-24 hours')
            GROUP BY status
        """)

        stats = {}
        for row in cursor.fetchall():
            stats[row['status'].lower()] = row['count']

        # Get average execution time
        cursor.execute("""
            SELECT
                AVG(CAST((julianday(completed_at) - julianday(started_at)) * 86400 AS REAL)) as avg_duration
            FROM runtime_jobs
            WHERE status = 'COMPLETED'
            AND completed_at IS NOT NULL
            AND started_at IS NOT NULL
            AND created_at >= datetime('now', '-24 hours')
        """)

        result = cursor.fetchone()
        stats['avg_duration'] = result['avg_duration'] if result else 0

        return stats

    def check_stuck_jobs(self):
        """Check for stuck jobs"""
        cursor = self.conn.cursor()

        # Find jobs executing for too long
        cursor.execute("""
            SELECT * FROM runtime_jobs
            WHERE status = 'EXECUTING'
            AND started_at < datetime('now', '-10 minutes')
        """)

        stuck_jobs = cursor.fetchall()

        for job in stuck_jobs:
            print(f"[WARN] Job {job['id']} stuck in EXECUTING state")

            # Reset to PENDING for retry
            cursor.execute("""
                UPDATE runtime_jobs
                SET status = 'PENDING',
                    attempts = attempts + 1,
                    last_error = 'Job timeout - reset for retry'
                WHERE id = ?
            """, (job['id'],))

        self.conn.commit()
        return len(stuck_jobs)

    def monitor_loop(self):
        """Main monitoring loop"""
        print("[START] Runtime Monitor started")

        while True:
            stats = self.get_stats()

            print(f"[STATS] Jobs: {stats}")

            stuck = self.check_stuck_jobs()
            if stuck > 0:
                print(f"[ACTION] Reset {stuck} stuck jobs")

            time.sleep(30)  # Check every 30 seconds

if __name__ == "__main__":
    monitor = RuntimeMonitor()
    monitor.monitor_loop()
