import sqlite3
import os

DB_PATH = r"C:\Dev\.claude-anx\state\anx_state.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    title TEXT,
    status TEXT,
    created_at TEXT,
    owner TEXT
);

CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    ticket_id TEXT,
    agent TEXT,
    status TEXT,
    started_at TEXT,
    completed_at TEXT,
    FOREIGN KEY(ticket_id) REFERENCES tickets(id)
);

CREATE TABLE IF NOT EXISTS tool_invocations (
    id TEXT PRIMARY KEY,
    run_id TEXT,
    tool_name TEXT,
    inputs TEXT, -- JSON
    outputs TEXT, -- JSON
    status TEXT,
    FOREIGN KEY(run_id) REFERENCES runs(id)
);

CREATE TABLE IF NOT EXISTS artifacts (
    id TEXT PRIMARY KEY,
    run_id TEXT,
    path TEXT,
    type TEXT,
    FOREIGN KEY(run_id) REFERENCES runs(id)
);

CREATE TABLE IF NOT EXISTS budget_ledger (
    id TEXT PRIMARY KEY,
    run_id TEXT,
    amount REAL,
    currency TEXT,
    category TEXT,
    timestamp TEXT,
    FOREIGN KEY(run_id) REFERENCES runs(id)
);

CREATE TABLE IF NOT EXISTS queue (
    id TEXT PRIMARY KEY,
    payload TEXT, -- JSON
    priority INTEGER,
    status TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    type TEXT,
    payload TEXT, -- JSON
    timestamp TEXT
);
"""

def init_db():
    print(f"Initializing database at {DB_PATH}...")
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.executescript(SCHEMA)
        conn.commit()
        conn.close()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    init_db()
