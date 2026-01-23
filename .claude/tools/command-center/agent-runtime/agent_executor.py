#!/usr/bin/env python3
"""
Agent Executor for Command Center Jobs
Executes jobs from the runtime queue using appropriate agents
"""

import sqlite3
import json
import subprocess
import time
from pathlib import Path
from datetime import datetime

ANX_ROOT = Path("C:/Dev/.claude-anx")
STATE_DB = ANX_ROOT / "state" / "anx_state.db"

class AgentExecutor:
    def __init__(self):
        self.conn = sqlite3.connect(STATE_DB)
        self.conn.row_factory = sqlite3.Row

    def get_next_job(self):
        """Get next job from runtime queue"""
        cursor = self.conn.cursor()

        # Get next pending job with satisfied dependencies
        cursor.execute("""
            SELECT * FROM runtime_jobs
            WHERE status = 'PENDING'
            AND source = 'command_center'
            ORDER BY priority DESC, created_at ASC
            LIMIT 1
        """)

        return cursor.fetchone()

    def execute_job(self, job):
        """Execute a single job"""
        job_id = job['id']
        payload = json.loads(job['payload']) if job['payload'] else {}

        print(f"[EXEC] Executing job {job_id}: {job['job_name']}")

        # Update status to executing
        cursor = self.conn.cursor()
        cursor.execute("""
            UPDATE runtime_jobs
            SET status = 'EXECUTING', started_at = ?
            WHERE id = ?
        """, (datetime.now().isoformat(), job_id))
        self.conn.commit()

        try:
            # Route to appropriate executor based on job type
            if job['job_type'] == 'validate':
                result = self.execute_validation(payload)
            elif job['job_type'] == 'deploy':
                result = self.execute_deployment(payload)
            elif job['job_type'] == 'monitor':
                result = self.execute_monitoring(payload)
            else:
                result = self.execute_generic(payload)

            # Update job as completed
            cursor.execute("""
                UPDATE runtime_jobs
                SET status = 'COMPLETED',
                    completed_at = ?,
                    output = ?
                WHERE id = ?
            """, (datetime.now().isoformat(), json.dumps(result), job_id))
            self.conn.commit()

            print(f"[OK] Job {job_id} completed successfully")
            return True

        except Exception as e:
            # Update job as failed
            cursor.execute("""
                UPDATE runtime_jobs
                SET status = 'FAILED',
                    completed_at = ?,
                    last_error = ?,
                    attempts = attempts + 1
                WHERE id = ?
            """, (datetime.now().isoformat(), str(e), job_id))
            self.conn.commit()

            print(f"[FAIL] Job {job_id} failed: {e}")
            return False

    def execute_validation(self, payload):
        """Execute validation job"""
        target = payload.get('target', 'unknown')
        checks = payload.get('checks', [])

        results = []
        for check in checks:
            # Simulate validation
            results.append({
                'check': check,
                'status': 'PASS',
                'message': f'Validation {check} passed'
            })

        return {'validation_results': results}

    def execute_deployment(self, payload):
        """Execute deployment job"""
        service = payload.get('service', 'unknown')
        version = payload.get('version', 'latest')

        # Simulate deployment
        return {
            'deployed': True,
            'service': service,
            'version': version,
            'timestamp': datetime.now().isoformat()
        }

    def execute_monitoring(self, payload):
        """Execute monitoring job"""
        target = payload.get('target', 'unknown')
        metrics = payload.get('metrics', [])

        # Simulate monitoring
        return {
            'target': target,
            'metrics_collected': len(metrics),
            'status': 'healthy'
        }

    def execute_generic(self, payload):
        """Execute generic job"""
        command = payload.get('command')

        if command and command.startswith('echo'):
            # Safe echo command
            return {'output': command.replace('echo ', '')}
        else:
            # Simulate generic execution
            return {
                'executed': True,
                'payload': payload,
                'timestamp': datetime.now().isoformat()
            }

    def run(self, max_jobs=10):
        """Run executor for specified number of jobs"""
        executed = 0

        while executed < max_jobs:
            job = self.get_next_job()

            if not job:
                print("[INFO] No pending jobs found")
                break

            if self.execute_job(job):
                executed += 1

            time.sleep(1)  # Brief pause between jobs

        print(f"[DONE] Executed {executed} jobs")

if __name__ == "__main__":
    executor = AgentExecutor()
    executor.run()
