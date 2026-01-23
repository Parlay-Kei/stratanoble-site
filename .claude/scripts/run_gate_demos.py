import sys
import os
import time
import json
import sqlite3
import threading

# Setup Paths
ANX_ROOT = r"C:\Dev\.claude-anx"
sys.path.append(os.path.join(ANX_ROOT, "autonomy"))
sys.path.append(os.path.join(ANX_ROOT, "scripts"))

from autonomy_runner import AutonomyRunner
from queue_manager import QueueManager

POLICY_FILE = os.path.join(ANX_ROOT, "policies", "autonomy_policy.json")

def set_kill_switch(enabled):
    with open(POLICY_FILE, 'r') as f:
        data = json.load(f)
    data['kill_switch'] = enabled
    with open(POLICY_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Policy Updated: Kill Switch = {enabled}")

def get_job_status(job_id):
    qm = QueueManager()
    conn = qm.get_connection()
    c = conn.cursor()
    c.execute("SELECT status, last_error FROM queue WHERE id=?", (job_id,))
    row = c.fetchone()
    conn.close()
    return row

def worker_thread(runner, stop_event):
    print("Runner Thread Started")
    while not stop_event.is_set():
        # Check Kill Switch
        killed, reason = runner.policy.check_kill_switch()
        if killed:
            print(f"Runner HALTED: {reason}")
            time.sleep(1)
            continue

        job = runner.queue.poll_job()
        if job:
            print(f"Processing {job['id']}...")
            runner.execute_job(job)
        else:
            time.sleep(1)

def main():
    print("=== STARTING GATE DEMOS ===")
    
    # Ensure Kill Switch is OFF initially
    set_kill_switch(False)
    
    qm = QueueManager()
    runner = AutonomyRunner()
    
    # Start Runner in background thread
    stop_event = threading.Event()
    t = threading.Thread(target=worker_thread, args=(runner, stop_event))
    t.start()
    
    try:
        # DEMO-002: Happy Path
        print("\n--- DEMO-002: Happy Path ---")
        job_id_2 = qm.enqueue_job({
            "ticket_id": "DEMO-002",
            "tool": "read_file",
            "cost_usd": 0
        })
        print(f"Enqueued DEMO-002: {job_id_2}")
        time.sleep(4) # Wait for process
        status, error = get_job_status(job_id_2)
        print(f"DEMO-002 Status: {status}")
        if status == "COMPLETED":
            print("PASS: DEMO-002")
        else:
            print(f"FAIL: DEMO-002 ({error})")

        # DEMO-003: Policy Fail (Tool)
        print("\n--- DEMO-003: Policy Fail (Tool) ---")
        job_id_3 = qm.enqueue_job({
            "ticket_id": "DEMO-003",
            "tool": "delete_file", # Not in safe list
            "cost_usd": 0
        })
        print(f"Enqueued DEMO-003: {job_id_3}")
        time.sleep(4)
        status, error = get_job_status(job_id_3)
        print(f"DEMO-003 Status: {status}")
        if status == "FAILED" and "not allowed" in str(error):
            print(f"PASS: DEMO-003 (Error: {error})")
        else:
            print(f"FAIL: DEMO-003 (Status: {status}, Error: {error})")

        # DEMO-004: Budget Fail
        print("\n--- DEMO-004: Budget Fail ---")
        job_id_4 = qm.enqueue_job({
            "ticket_id": "DEMO-004",
            "tool": "read_file",
            "cost_usd": 25.0
        })
        print(f"Enqueued DEMO-004: {job_id_4}")
        time.sleep(4)
        status, error = get_job_status(job_id_4)
        print(f"DEMO-004 Status: {status}")
        if status == "FAILED" and "Budget Cap Exceeded" in str(error):
             print(f"PASS: DEMO-004 (Error: {error})")
        else:
             print(f"FAIL: DEMO-004 (Status: {status}, Error: {error})")

        # DEMO-005: Kill Switch
        print("\n--- DEMO-005: Kill Switch ---")
        set_kill_switch(True)
        # Give runner a moment to pick up policy change
        time.sleep(2)
        
        job_id_5 = qm.enqueue_job({
            "ticket_id": "DEMO-005",
            "tool": "read_file",
            "cost_usd": 0
        })
        print(f"Enqueued DEMO-005: {job_id_5}")
        time.sleep(5) # Wait to ensure it is NOT picked up
        status, error = get_job_status(job_id_5)
        print(f"DEMO-005 Status: {status}")
        if status == "PENDING":
            print("PASS: DEMO-005 (Job stayed PENDING)")
        else:
            print(f"FAIL: DEMO-005 (Status: {status})")

    finally:
        stop_event.set()
        t.join()
        # Restore Kill Switch default (optional, but good practice)
        set_kill_switch(True) # Plan says kill switch default is TRUE usually? Or keep it false for next tasks. 
                              # Plan doesn't specify default, but policy file had it true. I'll restore true.

if __name__ == "__main__":
    main()
