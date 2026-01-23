#!/usr/bin/env python3
"""
Autonomy V3 Acceptance Gate V2 - Test Execution Script
Queues ACC-001 through ACC-004 test jobs for validation
"""

import sys
import os
import json
import time
import sqlite3
from datetime import datetime

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from autonomy.queue_v2 import QueueV2

def queue_acceptance_tests():
    """Queue all acceptance test jobs"""
    queue = QueueV2()
    results = []

    print("=" * 60)
    print("ANX AUTONOMY V3 ACCEPTANCE GATE V2")
    print("=" * 60)
    print(f"Execution Time: {datetime.now().isoformat()}")
    print()

    # ACC-001: Standard Success Flow
    print("[ACC-001] Queueing standard success test...")
    job1 = {
        "ticket_id": "ACC-001",
        "type": "command",
        "command": "echo Success test complete",
        "run_intent": "TEST_POSITIVE"
    }
    job1_id = queue.enqueue(job1, priority=10)
    results.append(("ACC-001", job1_id))
    print(f"  Queued: {job1_id}")

    # ACC-002: Expected Failure Test
    print("[ACC-002] Queueing expected failure test...")
    job2 = {
        "ticket_id": "ACC-002",
        "type": "command",
        "command": "python -c \"import sys; print('ERROR: pattern_not_found'); sys.exit(1)\"",
        "run_intent": "TEST_NEGATIVE",
        "expected_failure": "pattern_not_found"
    }
    job2_id = queue.enqueue(job2, priority=10)
    results.append(("ACC-002", job2_id))
    print(f"  Queued: {job2_id}")

    # ACC-003: Budget Block Simulation
    print("[ACC-003] Queueing budget block test...")
    job3 = {
        "ticket_id": "ACC-003",
        "type": "command",
        "command": "echo This should be blocked",
        "run_intent": "TEST_POSITIVE",
        "simulate_budget_block": True
    }
    job3_id = queue.enqueue(job3, priority=10)
    results.append(("ACC-003", job3_id))
    print(f"  Queued: {job3_id}")

    # ACC-004: Kill Switch Test (Manual)
    print("[ACC-004] Kill switch test requires manual execution:")
    print("  1. Run: python queue_kill_switch_test.py")
    print("  2. Activate kill switch in another terminal")
    print("  3. Wait for STOPPED receipt")
    print("  4. Deactivate kill switch")
    print("  5. Verify RESUMED receipt")

    print()
    print("=" * 60)
    print("TEST JOBS QUEUED")
    print("=" * 60)

    for test_id, job_id in results:
        if job_id:
            print(f"{test_id}: {job_id}")
        else:
            print(f"{test_id}: FAILED TO QUEUE")

    print()
    print("Next Steps:")
    print("1. Start runner: python C:\\Dev\\.claude-anx\\autonomy\\runner.py")
    print("2. Monitor execution and check receipts")
    print("3. Run kill switch test manually for ACC-004")
    print("4. Generate digest: python C:\\Dev\\.claude-anx\\scripts\\weekly_digest.py")

    return results

def queue_kill_switch_test():
    """Queue a long-running job for kill switch testing"""
    queue = QueueV2()

    print("[ACC-004] Queueing kill switch test job...")
    job = {
        "ticket_id": "ACC-004",
        "type": "command",
        "command": "python -c \"import time; print('Long running job...'); time.sleep(30); print('Completed')\"",
        "run_intent": "TEST_POSITIVE"
    }
    job_id = queue.enqueue(job, priority=5)
    print(f"  Queued long-running job: {job_id}")
    print()
    print("Instructions:")
    print("1. Job will run for 30 seconds")
    print("2. Activate kill switch while running:")
    print("   python -c \"import sqlite3; conn = sqlite3.connect(r'C:\\Dev\\.claude-anx\\state\\anx_state.db'); conn.execute(\\\"UPDATE autonomy_config SET value='true' WHERE key='kill_switch'\\\"); conn.commit()\"")
    print("3. Verify SYSTEM receipt created")
    print("4. Deactivate kill switch:")
    print("   python -c \"import sqlite3; conn = sqlite3.connect(r'C:\\Dev\\.claude-anx\\state\\anx_state.db'); conn.execute(\\\"UPDATE autonomy_config SET value='false' WHERE key='kill_switch'\\\"); conn.commit()\"")
    print("5. Verify RESUMED receipt created")

    return job_id

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Queue Autonomy V3 Acceptance Tests")
    parser.add_argument("--kill-switch", action="store_true",
                        help="Queue only the kill switch test job")

    args = parser.parse_args()

    if args.kill_switch:
        queue_kill_switch_test()
    else:
        queue_acceptance_tests()