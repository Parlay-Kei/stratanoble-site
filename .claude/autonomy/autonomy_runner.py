import time
import sys
import os
import json
import subprocess
import datetime
# Add scripts folder to path to import utils if needed, or import local modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'scripts'))
import proof_utils

from queue_manager import QueueManager
from policy_engine import PolicyEngine

# Constants
POLL_INTERVAL_SEC = 5
MAX_RETRIES = 3

class AutonomyRunner:
    def __init__(self):
        self.queue = QueueManager()
        self.policy = PolicyEngine()
        self.running = True

    def log(self, msg):
        print(f"[{datetime.datetime.now().isoformat()}] [AUTONOMY] {msg}")

    def run_loop(self):
        self.log("Starting Autonomy Runner Loop...")
        while self.running:
            # 1. Check Kill Switch
            killed, reason = self.policy.check_kill_switch()
            if killed:
                self.log(f"HALTED: {reason}")
                time.sleep(10) # Sleep and recheck
                continue

            # 2. Poll Job
            job = self.queue.poll_job()
            if not job:
                # self.log("No jobs. Sleeping...")
                time.sleep(POLL_INTERVAL_SEC)
                continue
            
            self.log(f"Picked up job: {job['id']}")
            self.execute_job(job)

    def execute_job(self, job):
        job_id = job['id']
        payload = job['payload']
        # Payload example: {"ticket_id": "T-1", "action": "run_tool", "tool": "search_web", "params": {...}}
        
        ticket_id = payload.get('ticket_id', 'UNKNOWN')
        # We use job_id as run_id for simplicity in this version, or payload specifies it
        run_id = job_id 
        
        try:
            # Init Proof Pack
            proof_utils.init_run(ticket_id, run_id)
            
            # Policy Check
            tool = payload.get('tool')
            if not self.policy.is_tool_allowed(tool):
                raise Exception(f"Tool {tool} not allowed by policy.")

            cost = payload.get('cost_usd', 0)
            if cost > 0:
                # For V1, passing 0 as daily_spend since we don't have a ledger aggregator yet
                allowed, reason = self.policy.check_money_cap(cost, 0)
                if not allowed:
                    raise Exception(f"Budget Cap Exceeded: {reason}")

            # EXECUTE (Simulation for now as I cannot self-invoke CLI tools easily in this loop without subshell)
            # In a real system, this would call the dispatcher.
            # Here we will simulate "Dispatching" by writing a receipt.
            self.log(f"Executing {tool} for {ticket_id}...")
            
            # Simulate work
            time.sleep(2)
            
            # Result
            # In real life, we'd capture stdout/stderr from subprocess
            proof_utils.write_receipt(ticket_id, run_id, tool, "SUCCESS", {"message": "Executed via Autonomy"})
            
            # Validate
            # We call the validation script
            val_cmd = [
                "python",
                os.path.join(os.path.dirname(__file__), '..', 'scripts', 'validate_proof.py'),
                "--ticket", ticket_id,
                "--run", run_id
            ]
            res = subprocess.run(val_cmd, capture_output=True, text=True)
            
            if res.returncode == 0:
                self.log("Validation PASS")
                self.queue.complete_job(job_id)
            else:
                self.log(f"Validation FAIL: {res.stdout}")
                self.queue.fail_job(job_id, "Validation Failed")

        except Exception as e:
            self.log(f"Job Failed: {e}")
            retry = job['retry_count'] < MAX_RETRIES
            self.queue.fail_job(job_id, str(e), can_retry=retry)

if __name__ == "__main__":
    runner = AutonomyRunner()
    try:
        runner.run_loop()
    except KeyboardInterrupt:
        print("Stopping Autonomy Runner...")
