import sys
import os
import time
import json
import uuid
import subprocess
import traceback
import queue_v2
from policy_engine import PolicyEngine
from datetime import datetime

# Setup Paths
ANX_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(ANX_ROOT, 'scripts'))

# Try import proof_utils
try:
    import proof_utils
except ImportError:
    print("Warning: proof_utils not found.")
    proof_utils = None

class AutonomyRunnerV3:
    def __init__(self):
        self.runner_id = str(uuid.uuid4())
        self.queue = queue_v2.QueueV2()
        self.policy = PolicyEngine()
        self.running = True
        self.poll_interval = 5

    def log(self, msg):
        print(f"[{datetime.now().isoformat()}] [RUNNER:{self.runner_id[:8]}] {msg}")

    def run(self):
        self.log("Starting Autonomy V3 Loop...")
        while self.running:
            try:
                # 1. Heartbeat
                self.queue.heartbeat(self.runner_id, "IDLE")

                # 2. Check Global Kill Switch (Policy Engine + Queue Config)
                # PolicyEngine checks policy.json, QueueV2 checks DB config.
                # We prioritize PolicyEngine as "Governing Body" but check both.
                # Note: QueueV2.poll() checks DB kill switch internaly.
                
                killed, reason = self.policy.check_kill_switch()
                if killed:
                    self.log(f"Kill Switch Detected (Policy): {reason}")
                    time.sleep(10)
                    continue

                # 3. Poll
                job, status = self.queue.poll(self.runner_id)

                if status == "KILL_SWITCH":
                     self.log("Kill Switch Detected (DB). Pausing...")
                     time.sleep(10)
                     continue
                
                if status == "CAP_REACHED":
                    self.log("Cap reached. Waiting...")
                    time.sleep(self.poll_interval)
                    continue
                
                if not job:
                    time.sleep(self.poll_interval)
                    continue

                # 4. Processing
                self.queue.heartbeat(self.runner_id, "PROCESSING", {"job_id": job['id']})
                self.process_job(job)

            except KeyboardInterrupt:
                self.log("Stopping...")
                self.running = False
            except Exception as e:
                self.log(f"Loop Error: {e}")
                traceback.print_exc()
                time.sleep(5)

    def process_job(self, job):
        job_id = job['id']
        payload = job['payload']
        self.log(f"Processing Job {job_id} | Type: {payload.get('type')}")

        ticket_id = payload.get('ticket_id', 'NO_TICKET')
        
        try:
            # Init Receipt
            if proof_utils:
                proof_utils.init_run(ticket_id, job_id)

            # Policy Check: Budget
            cost_usd = payload.get('cost_usd', 0)
            if cost_usd > 0:
                 # TODO: Get actual daily spend from a ledger service. passing 0 for now.
                 allowed, reason = self.policy.check_money_cap(cost_usd, 0)
                 if not allowed:
                     raise Exception(f"Budget Cap Block: {reason}")
            
            # Dispatch
            result = self.dispatch(payload)
            
            # Complete
            if result['exit_code'] == 0:
                self.queue.complete_job(job_id, self.runner_id)
                self.log(f"Job {job_id} COMPLETED")
                if proof_utils:
                    proof_utils.write_receipt(ticket_id, job_id, payload.get('type', 'task'), "SUCCESS", result)
            else:
                self.queue.fail_job(job_id, self.runner_id, result['stderr'], retry=False) # Fail immediately if command failed
                self.log(f"Job {job_id} FAILED")
                if proof_utils:
                    proof_utils.write_receipt(ticket_id, job_id, payload.get('type', 'task'), "FAILED", result)

        except Exception as e:
            self.log(f"Job Execution Error: {e}")
            self.queue.fail_job(job_id, self.runner_id, str(e), retry=False)
            if proof_utils:
                proof_utils.write_receipt(ticket_id, job_id, "error", "BLOCKED" if "Cap Block" in str(e) else "CRASHED", {"error": str(e)})

    def dispatch(self, payload):
        job_type = payload.get('type')
        
        if job_type == 'project_op':
            return self.run_project_op(payload)
        elif job_type == 'command':
            return self.run_custom_command(payload)
        else:
             raise ValueError(f"Unknown job type: {job_type}")

    def run_project_op(self, payload):
        """
        Payload: {
            "type": "project_op",
            "adapter": "DC",
            "command": "test" | "validate" | "deploy" ...,
            "dry_run": bool
        }
        """
        adapter = payload.get('adapter')
        command = payload.get('command')
        dry_run = payload.get('dry_run', False)
        
        script_path = os.path.join(ANX_ROOT, 'scripts', 'project_ops.py')
        
        cmd = ["python", script_path, adapter, command]
        if dry_run:
            cmd.append("--dry-run")
            
        self.log(f"Invoking Project Op: {adapter} -> {command}")
        p = subprocess.run(cmd, capture_output=True, text=True)
        
        return {
            "exit_code": p.returncode,
            "stdout": p.stdout,
            "stderr": p.stderr,
            "command": str(cmd)
        }

    def run_custom_command(self, payload):
        cmd = payload.get('command')
        cwd = payload.get('cwd', ANX_ROOT)
        
        if isinstance(cmd, str):
            shell = True
        else:
            shell = False
            
        self.log(f"Invoking Command: {cmd}")
        p = subprocess.run(cmd, cwd=cwd, shell=shell, capture_output=True, text=True)
        return {
             "exit_code": p.returncode,
            "stdout": p.stdout,
            "stderr": p.stderr
        }

if __name__ == "__main__":
    AutonomyRunnerV3().run()
