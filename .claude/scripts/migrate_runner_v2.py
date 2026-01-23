import sqlite3
import os
import datetime

DB_PATH = r"C:\Dev\.claude-anx\state\anx_state.db"

def migrate():
    print(f"Migrating {DB_PATH} to V2...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Update QUEUE table
    # Check existing columns
    cursor.execute("PRAGMA table_info(queue)")
    columns = [info[1] for info in cursor.fetchall()]
    
    print("Existing queue columns:", columns)

    # Add new columns if missing
    new_columns = {
        "dedupe_hash": "TEXT",
        "locked_at": "TEXT",
        "locked_by": "TEXT",
        "retry_count": "INTEGER DEFAULT 0",
        "max_retries": "INTEGER DEFAULT 3",
        "last_error": "TEXT",
        "runner_id": "TEXT",
        "outcome": "TEXT"  # PASS | FAIL | EXPECTED_FAIL | BLOCKED | STOPPED
    }

    for col, dtype in new_columns.items():
        if col not in columns:
            print(f"Adding column {col}...")
            # SQLite doesn't support adding columns with UNIQUE constraint easily in ALTER TABLE, handled separately for indices
            cursor.execute(f"ALTER TABLE queue ADD COLUMN {col} {dtype}")

    # Add Index for Dedupe
    try:
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_queue_dedupe_hash ON queue(dedupe_hash) WHERE status IN ('PENDING', 'PROCESSING')")
        print("Created dedupe index.")
    except Exception as e:
        print(f"Index creation warning: {e}")

    # 2. Create AUTONOMY_CONFIG table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS autonomy_config (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT
    )
    """)
    print("Created autonomy_config table.")

    # Seed Default Config if empty
    default_config = {
        "kill_switch": "false",
        "max_concurrent_jobs": "5",
        "global_retry_limit": "3"
    }

    for k, v in default_config.items():
        cursor.execute("INSERT OR IGNORE INTO autonomy_config (key, value, updated_at) VALUES (?, ?, ?)", 
                       (k, v, datetime.datetime.now().isoformat()))

    # 3. Create RUNNER_HEARTBEATS table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS runner_heartbeats (
        runner_id TEXT PRIMARY KEY,
        last_heartbeat TEXT,
        status TEXT,
        meta TEXT
    )
    """)
    print("Created runner_heartbeats table.")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
