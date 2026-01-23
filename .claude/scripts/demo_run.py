import subprocess
import sys
import os

SCRIPT_DIR = r"C:\Dev\.claude-anx\scripts"
PROOF_UTILS = os.path.join(SCRIPT_DIR, "proof_utils.py")
VALIDATOR = os.path.join(SCRIPT_DIR, "validate_proof.py")

TICKET = "DEMO-001"
RUN = "run-demo-alpha"

def run_cmd(cmd):
    print(f"Running: {cmd}")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error: {res.stderr}")
    else:
        print(f"Output: {res.stdout}")
    return res.returncode

def main():
    print("Starting Demo Run...")
    
    # 1. Init Run
    cmd = f'python "{PROOF_UTILS}" init --ticket {TICKET} --run {RUN}'
    if run_cmd(cmd) != 0: return

    # 2. Simulate Tool Execution (emit receipt)
    details = '{"message": "Hello World", "cpu_load": 12}'
    # Escape quotes for shell if needed, but simple JSON is fine. 
    # Windows shell quoting can be tricky for JSON. I'll pass a simple string.
    # Python's subprocess should handle basic args if list is passed, but I'm using string cmd.
    # I'll be careful.
    
    cmd = f'python "{PROOF_UTILS}" receipt --ticket {TICKET} --run {RUN} --tool system_check --status SUCCESS --details "{details.replace('"', '\\"')}"'
    if run_cmd(cmd) != 0: return

    # 3. Validate
    cmd = f'python "{VALIDATOR}" --ticket {TICKET} --run {RUN}'
    if run_cmd(cmd) != 0:
        print("Validation FAILED")
    else:
        print("Validation PASSED. Demo Complete.")

if __name__ == "__main__":
    main()
