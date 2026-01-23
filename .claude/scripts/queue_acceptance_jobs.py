import sys
import os
import json
import uuid

# Setup Paths
ANX_ROOT = r"C:\Dev\.claude-anx"
sys.path.append(os.path.join(ANX_ROOT, 'autonomy'))
sys.path.append(os.path.join(ANX_ROOT, 'scripts'))

import queue_v2
from policy_engine import PolicyEngine

POLICY_FILE = os.path.join(ANX_ROOT, "policies", "autonomy_policy.json")

def set_kill_switch(enabled):
    with open(POLICY_FILE, 'r') as f:
        data = json.load(f)
    data['kill_switch'] = enabled
    with open(POLICY_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Policy Updated: Kill Switch = {enabled}")

def main():
    qm = queue_v2.QueueV2() 
    
    print("=== ENQUEUEING ACCEPTANCE JOBS ===")

    # 1. PASS Run (ACC-001)
    job_1 = qm.enqueue({
        "type": "project_op",
        "ticket_id": "ACC-001",
        "adapter": "SN",
        "command": "validate",
        "dry_run": True,
        "cost_usd": 0
    }, priority=10, dedupe_hash=str(uuid.uuid4()))
    print(f"Enqueued ACC-001 (PASS): {job_1}")

    # 2. FAIL Run (ACC-002)
    job_2 = qm.enqueue({
        "type": "project_op",
        "ticket_id": "ACC-002",
        "adapter": "SN",
        "command": "flight_to_mars", 
        "cost_usd": 0
    }, priority=10, dedupe_hash=str(uuid.uuid4()))
    print(f"Enqueued ACC-002 (FAIL): {job_2}")

    # 3. BLOCK Run (ACC-003)
    job_3 = qm.enqueue({
        "type": "project_op",
        "ticket_id": "ACC-003",
        "adapter": "DC",
        "command": "deploy", 
        "cost_usd": 9999
    }, priority=10, dedupe_hash=str(uuid.uuid4()))
    print(f"Enqueued ACC-003 (BLOCK): {job_3}")

    # 4. STOP Run (ACC-004)
    job_4 = qm.enqueue({
        "type": "project_op",
        "ticket_id": "ACC-004",
        "adapter": "MAH",
        "command": "smoke",
        "cost_usd": 0
    }, priority=5, dedupe_hash=str(uuid.uuid4()))
    print(f"Enqueued ACC-004 (STOP/PENDING): {job_4}")

    print("\nJobs Enqueued. Please run 'python autonomy/autonomy_v3.py' to process.")

if __name__ == "__main__":
    set_kill_switch(False)
    main()
