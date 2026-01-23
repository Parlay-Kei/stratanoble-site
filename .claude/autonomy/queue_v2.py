import sqlite3
import json
import datetime
import uuid
import time

DB_PATH = r"C:\Dev\.claude-anx\state\anx_state.db"

class QueueV2:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def _get_config(self, key, default=None):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM autonomy_config WHERE key = ?", (key,))
            row = cursor.fetchone()
            return row[0] if row else default

    def is_kill_switch_active(self):
        val = self._get_config("kill_switch", "false")
        return val.lower() == "true"

    def get_active_job_count(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM queue WHERE status = 'PROCESSING'")
            return cursor.fetchone()[0]

    def get_cap(self):
        val = self._get_config("max_concurrent_jobs", "5")
        return int(val)

    def heartbeat(self, runner_id, status="IDLE", meta=None):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            now = datetime.datetime.now().isoformat()
            cursor.execute("""
                INSERT INTO runner_heartbeats (runner_id, last_heartbeat, status, meta)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(runner_id) DO UPDATE SET
                    last_heartbeat=excluded.last_heartbeat,
                    status=excluded.status,
                    meta=excluded.meta
            """, (runner_id, now, status, json.dumps(meta) if meta else None))
            conn.commit()

    def enqueue(self, payload, priority=0, dedupe_hash=None):
        """
        dedupe_hash: If provided, used to prevent duplicates.
                     If duplicate exists and is PENDING/PROCESSING, insert might fail or be ignored.
        """
        if not dedupe_hash:
            # Generate a hash from payload if not provided? Or just allow dupes?
            # User requirement: "dedupe".
            # Simple hash of payload string
            dedupe_hash = str(hash(json.dumps(payload, sort_keys=True)))

        job_id = str(uuid.uuid4())
        created_at = datetime.datetime.now().isoformat()
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                # Insert if dedupe check passes (handled by UNIQUE index on dedupe_hash WHERE status in PENDING/PROCESSING)
                # Note: The index I created allows dupes if status is COMPLETED/FAILED (depending on how I defined it).
                # The migration script created: CREATE UNIQUE INDEX ... WHERE status IN ('PENDING', 'PROCESSING')
                
                cursor.execute("""
                    INSERT INTO queue (id, payload, priority, status, created_at, retry_count, dedupe_hash)
                    VALUES (?, ?, ?, 'PENDING', ?, 0, ?)
                """, (job_id, json.dumps(payload), priority, created_at, dedupe_hash))
                conn.commit()
                return job_id
        except sqlite3.IntegrityError:
            # Duplicate found
            return None

    def poll(self, runner_id):
        # 1. Check Kill Switch
        if self.is_kill_switch_active():
            return None, "KILL_SWITCH"

        # 2. Check Caps
        active = self.get_active_job_count()
        cap = self.get_cap()
        if active >= cap:
            return None, "CAP_REACHED"

        # 3. Lock and Pick
        with self.get_connection() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute("BEGIN IMMEDIATE") # Lock DB for writing
                
                # Find pending
                cursor.execute("""
                    SELECT id, payload, retry_count
                    FROM queue
                    WHERE status = 'PENDING'
                    ORDER BY priority DESC, created_at ASC
                    LIMIT 1
                """)
                row = cursor.fetchone()
                
                if row:
                    job_id, payload_json, retry_count = row
                    now = datetime.datetime.now().isoformat()
                    
                    cursor.execute("""
                        UPDATE queue
                        SET status = 'PROCESSING', locked_at = ?, locked_by = ?, runner_id = ?
                        WHERE id = ?
                    """, (now, runner_id, runner_id, job_id))
                    
                    conn.commit()
                    return {
                        "id": job_id,
                        "payload": json.loads(payload_json),
                        "retry_count": retry_count
                    }, "OK"
                else:
                    conn.commit()
                    return None, "EMPTY"
            except Exception as e:
                conn.rollback()
                print(f"Poll Error: {e}")
                return None, "ERROR"

    def complete_job(self, job_id, runner_id, outcome="PASS"):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE queue
                SET status = 'COMPLETED', locked_by = NULL, outcome = ?
                WHERE id = ? AND locked_by = ?
            """, (outcome, job_id, runner_id))
            conn.commit()

    def fail_job(self, job_id, runner_id, error, retry=True):
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Check max retries
            cursor.execute("SELECT retry_count, max_retries FROM queue WHERE id = ?", (job_id,))
            row = cursor.fetchone()
            if row:
                retry_count, max_retries = row
                if retry_count >= max_retries:
                    retry = False

            status = "PENDING" if retry else "FAILED"

            cursor.execute("""
                UPDATE queue
                SET status = ?, last_error = ?, locked_by = NULL, locked_at = NULL,
                    retry_count = retry_count + 1
                WHERE id = ? AND locked_by = ?
            """, (status, str(error), job_id, runner_id))
            conn.commit()

    def block_job(self, job_id, runner_id, reason):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE queue
                SET status = 'BLOCKED', locked_by = NULL, last_error = ?, outcome = 'BLOCKED'
                WHERE id = ? AND locked_by = ?
            """, (reason, job_id, runner_id))
            conn.commit()

    def log_event(self, event_type, payload):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            event_id = str(uuid.uuid4())
            timestamp = datetime.datetime.now().isoformat()
            cursor.execute("""
                INSERT INTO events (id, type, payload, timestamp)
                VALUES (?, ?, ?, ?)
            """, (event_id, event_type, json.dumps(payload), timestamp))
            conn.commit()
            return event_id

    def create_exception_ticket(self, job_id, error):
        """Create an exception ticket for failed jobs (not for EXPECTED_FAIL)"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            ticket_id = f"EXC-{job_id[:8]}"
            timestamp = datetime.datetime.now().isoformat()
            cursor.execute("""
                INSERT INTO tickets (id, title, status, created_at, owner)
                VALUES (?, ?, 'OPEN', ?, 'SYSTEM')
            """, (ticket_id, f"Exception: Job {job_id} failed - {str(error)[:50]}", timestamp))
            conn.commit()
            return ticket_id

    def get_job_stats(self, since_date=None):
        """Get job statistics for weekly digest"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            where_clause = ""
            params = []
            if since_date:
                where_clause = "WHERE created_at >= ?"
                params.append(since_date)

            # Get job counts by status
            cursor.execute(f"""
                SELECT status, COUNT(*) as count
                FROM queue {where_clause}
                GROUP BY status
            """, params)
            status_counts = {row[0]: row[1] for row in cursor.fetchall()}

            # Get job counts by outcome
            cursor.execute(f"""
                SELECT outcome, COUNT(*) as count
                FROM queue {where_clause}
                WHERE outcome IS NOT NULL
                GROUP BY outcome
            """, params)
            outcome_counts = {row[0]: row[1] for row in cursor.fetchall()}

            return {"status": status_counts, "outcome": outcome_counts}

    def get_kill_switch_events(self, since_date=None):
        """Get kill switch events for weekly digest"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            where_clause = "WHERE type IN ('KILL_SWITCH_ACTIVATED', 'KILL_SWITCH_DEACTIVATED')"
            params = []
            if since_date:
                where_clause += " AND timestamp >= ?"
                params.append(since_date)

            cursor.execute(f"""
                SELECT type, timestamp, payload
                FROM events {where_clause}
                ORDER BY timestamp DESC
            """, params)

            events = []
            for row in cursor.fetchall():
                events.append({
                    "type": row[0],
                    "timestamp": row[1],
                    "details": json.loads(row[2]) if row[2] else {}
                })
            return events
