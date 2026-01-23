import sys
import os
import time
import json
import uuid
import subprocess
import traceback
from datetime import datetime

# Path Setup
ANX_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(ANX_ROOT, 'scripts'))

# Import Scripts
try:
    import proof_utils
except ImportError:
    # Fallback or dummy if not found during dev
    print("Warning: proof_utils not found.")
    proof_utils = None

from queue_v2 import QueueV2

class Dispatcher:
    def dispatch(self, job_payload):
        """
        Executes the job based on payload type.
        Payload schema:
        {
            "type": "script" | "command",
            "command": "str", # for command
            "script": "str", # relative path in scripts/
            "args": [],
            "cwd": "str"
        }
        """
        job_type = job_payload.get('type', 'unknown')
        
        if job_type == 'script':
            return self.run_script(job_payload)
        elif job_type == 'command':
            return self.run_command(job_payload)
        else:
            # Default to command if not specified but command key exists
            if 'command' in job_payload:
                return self.run_command(job_payload)
            raise ValueError(f"Unknown job type: {job_type}")

    def run_script(self, payload):
        script = payload.get('script')
        args = payload.get('args', [])
        script_path = os.path.join(ANX_ROOT, 'scripts', script)
        
        if not os.path.exists(script_path):
             # Try absolute?
             if os.path.exists(script):
                 script_path = script
             else:
                 raise FileNotFoundError(f"Script not found: {script_path}")

        cmd = ["python" if script.endswith(".py") else "node", script_path] + args
        return self._exec(cmd, payload.get('cwd'))

    def run_command(self, payload):
        cmd = payload.get('command')
        # If cmd is string, split? Or use shell=True (dangerous but flexible).
        # Let's assume list or string.
        shell = isinstance(cmd, str)
        return self._exec(cmd, payload.get('cwd'), shell=shell)

    def _exec(self, cmd, cwd=None, shell=False):
        # Resolve CWD relative to ANX_ROOT if not absolute
        if cwd and not os.path.isabs(cwd):
            cwd = os.path.join(ANX_ROOT, cwd)
            
        print(f"Executing: {cmd} in {cwd}")
        p = subprocess.run(cmd, cwd=cwd, shell=shell, capture_output=True, text=True)
        return {
            "exit_code": p.returncode,
            "stdout": p.stdout,
            "stderr": p.stderr
        }

class AutonomyRunnerV2:
    def __init__(self):
        self.runner_id = str(uuid.uuid4())
        self.queue = QueueV2()
        self.dispatcher = Dispatcher()
        self.running = True
        self.poll_interval = 5
        self.kill_switch_active = False

    def log(self, msg):
        print(f"[{datetime.now().isoformat()}] [RUNNER:{self.runner_id[:8]}] {msg}")

    def run(self):
        self.log("Starting V2 Loop...")
        while self.running:
            try:
                # Heartbeat
                self.queue.heartbeat(self.runner_id, "IDLE")

                # Poll
                job, status = self.queue.poll(self.runner_id)

                if status == "KILL_SWITCH":
                    if not self.kill_switch_active:
                        self.log("Kill Switch ACTIVATED. Halting operations...")
                        self.kill_switch_active = True
                        # Log kill switch event to DB
                        self.queue.log_event("KILL_SWITCH_ACTIVATED", {
                            "runner_id": self.runner_id,
                            "timestamp": datetime.now().isoformat()
                        })
                        # Emit SYSTEM receipt
                        if proof_utils:
                            proof_utils.write_system_receipt(
                                "SYSTEM",
                                f"kill-switch-{self.runner_id[:8]}",
                                "KILL_SWITCH",
                                "STOPPED",
                                {"reason": "Kill switch engaged", "runner_id": self.runner_id}
                            )
                    time.sleep(10)
                    continue
                elif self.kill_switch_active:
                    # Kill switch was just turned off
                    self.log("Kill Switch DEACTIVATED. Resuming operations...")
                    self.kill_switch_active = False
                    # Log resume event to DB
                    self.queue.log_event("KILL_SWITCH_DEACTIVATED", {
                        "runner_id": self.runner_id,
                        "timestamp": datetime.now().isoformat()
                    })
                    # Emit RESUMED receipt
                    if proof_utils:
                        proof_utils.write_system_receipt(
                            "SYSTEM",
                            f"resumed-{self.runner_id[:8]}",
                            "KILL_SWITCH",
                            "RESUMED",
                            {"reason": "Kill switch disengaged", "runner_id": self.runner_id}
                        )
                
                if status == "CAP_REACHED":
                    self.log("Cap reached. Waiting...")
                    time.sleep(self.poll_interval)
                    continue
                
                if not job:
                    # self.log("No jobs.")
                    time.sleep(self.poll_interval)
                    continue

                # Execute
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
        self.log(f"Processing Job {job_id}")

        # Extract run intent and expected failure patterns
        run_intent = payload.get('run_intent', 'PROD')  # PROD | TEST_POSITIVE | TEST_NEGATIVE
        expected_failure = payload.get('expected_failure', None)  # For TEST_NEGATIVE: pattern to match

        try:
            # Init Receipt
            ticket_id = payload.get('ticket_id', 'NO_TICKET')
            if proof_utils:
                proof_utils.init_run(ticket_id, job_id)

            # Check for budget block
            if payload.get('simulate_budget_block', False):
                run_outcome = "BLOCKED"
                self.log(f"Job {job_id} BUDGET BLOCKED (simulated)")
                self.queue.block_job(job_id, self.runner_id, "Budget limit exceeded")
                if proof_utils:
                    proof_utils.write_receipt(ticket_id, job_id, payload.get('type', 'task'), run_outcome, {
                        "run_intent": run_intent,
                        "run_outcome": run_outcome,
                        "reason": "Budget limit exceeded"
                    })
                return

            # Dispatch
            result = self.dispatcher.dispatch(payload)

            # Determine run outcome based on intent and result
            if result['exit_code'] == 0:
                run_outcome = "PASS"
            else:
                # Check if this is an expected failure for TEST_NEGATIVE
                if run_intent == "TEST_NEGATIVE" and expected_failure:
                    # Check if the error matches expected pattern
                    error_output = result.get('stderr', '') + result.get('stdout', '')
                    if expected_failure in error_output:
                        run_outcome = "EXPECTED_FAIL"
                        self.log(f"Job {job_id} EXPECTED_FAIL - matched pattern: {expected_failure}")
                    else:
                        run_outcome = "FAIL"
                        self.log(f"Job {job_id} UNEXPECTED FAIL - did not match expected pattern")
                else:
                    run_outcome = "FAIL"

            # Write receipt with enhanced metadata
            if proof_utils:
                receipt_data = {
                    **result,
                    "run_intent": run_intent,
                    "run_outcome": run_outcome
                }
                if expected_failure:
                    receipt_data["expected_failure"] = expected_failure
                proof_utils.write_receipt(ticket_id, job_id, payload.get('type', 'task'), run_outcome, receipt_data)

            # Handle job completion based on outcome
            if run_outcome in ["PASS", "EXPECTED_FAIL"]:
                self.queue.complete_job(job_id, self.runner_id, run_outcome)
                self.log(f"Job {job_id} COMPLETED ({run_outcome})")
                # EXPECTED_FAIL does not create exception ticket
                if run_outcome == "EXPECTED_FAIL":
                    self.queue.log_event("EXPECTED_FAILURE", {
                        "job_id": job_id,
                        "pattern": expected_failure,
                        "timestamp": datetime.now().isoformat()
                    })
            else:
                # FAIL - create exception ticket
                self.queue.fail_job(job_id, self.runner_id, result['stderr'])
                self.queue.create_exception_ticket(job_id, result['stderr'])
                self.log(f"Job {job_id} FAILED: {result['stderr'][:100]}...")

        except Exception as e:
            run_outcome = "CRASHED"
            self.log(f"Job Execution Error: {e}")
            self.queue.fail_job(job_id, self.runner_id, str(e))
            self.queue.create_exception_ticket(job_id, str(e))
            if proof_utils:
                proof_utils.write_receipt(payload.get('ticket_id', 'NO_TICKET'), job_id, "error", run_outcome, {
                    "error": str(e),
                    "run_intent": run_intent,
                    "run_outcome": run_outcome
                })

if __name__ == "__main__":
    AutonomyRunnerV2().run()
