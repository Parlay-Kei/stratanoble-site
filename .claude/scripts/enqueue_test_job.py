import sys
import os
import time
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from autonomy.queue_manager import QueueManager

def main():
    qm = QueueManager()
    
    # Enqueue a test job
    job_id = qm.enqueue_job({
        "ticket_id": "TEST-AUTO-001",
        "tool": "list_dir",
        "params": {"path": "C:\\Dev"}
    }, priority=10)
    
    print(f"Enqueued Job: {job_id}")

if __name__ == "__main__":
    main()
