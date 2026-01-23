import sqlite3
import os
import json
import datetime
import uuid

DB_PATH = r"C:\Dev\.claude-anx\state\anx_state.db"

class QueueManager:
    def __init__(self):
        self.db_path = DB_PATH

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def enqueue_job(self, payload, priority=0):
        """
        payload: dict
        priority: int
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        job_id = str(uuid.uuid4())
        created_at = datetime.datetime.now().isoformat()
        
        cursor.execute(
            "INSERT INTO queue (id, payload, priority, status, created_at, retry_count) VALUES (?, ?, ?, ?, ?, ?)",
            (job_id, json.dumps(payload), priority, "PENDING", created_at, 0)
        )
        conn.commit()
        conn.close()
        return job_id

    def poll_job(self):
        """
        Atomically locks and returns a pending job.
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Simple strategy: Find first PENDING order by priority, created_at
        # TODO: Better concurrency safely
        
        try:
            cursor.execute("BEGIN TRANSACTION")
            
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
                    SET status = 'PROCESSING', locked_at = ?
                    WHERE id = ?
                """, (now, job_id))
                
                conn.commit()
                return {
                    "id": job_id,
                    "payload": json.loads(payload_json),
                    "retry_count": retry_count
                }
            else:
                conn.commit()
                return None
                
        except Exception as e:
            conn.rollback()
            print(f"Queue Error: {e}")
            return None
        finally:
            conn.close()

    def complete_job(self, job_id):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE queue SET status = 'COMPLETED' WHERE id = ?", (job_id,))
        conn.commit()
        conn.close()

    def fail_job(self, job_id, error_message, can_retry=False):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        status = "FAILED"
        if can_retry:
            status = "PENDING" # Put back in queue? Or specific RETRY state. For now, let's say PENDING but increment retry.
        
        cursor.execute("""
            UPDATE queue
            SET status = ?, last_error = ?, retry_count = retry_count + 1, locked_at = NULL
            WHERE id = ?
        """, (status, error_message, job_id))
        
        conn.commit()
        conn.close()
