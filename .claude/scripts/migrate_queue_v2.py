import sqlite3
import os

DB_PATH = r"C:\Dev\.claude-anx\state\anx_state.db"

def migrate():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check current columns to avoid error
        cursor.execute("PRAGMA table_info(queue)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'locked_at' not in columns:
            print("Adding locked_at column...")
            cursor.execute("ALTER TABLE queue ADD COLUMN locked_at TEXT")
            
        if 'retry_count' not in columns:
            print("Adding retry_count column...")
            cursor.execute("ALTER TABLE queue ADD COLUMN retry_count INTEGER DEFAULT 0")

        if 'last_error' not in columns:
            print("Adding last_error column...")
            cursor.execute("ALTER TABLE queue ADD COLUMN last_error TEXT")

        conn.commit()
        conn.close()
        print("Migration V1->V2 (Queue) completed.")
        
    except Exception as e:
        print(f"Migration Failed: {e}")

if __name__ == "__main__":
    migrate()
