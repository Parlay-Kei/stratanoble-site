import sys
import os
import time
import json
import uuid
import subprocess

ANX_ROOT = r"C:\Dev\.claude-anx"
sys.path.append(os.path.join(ANX_ROOT, 'autonomy'))
sys.path.append(os.path.join(ANX_ROOT, 'scripts'))

import queue_v2

# 1. Enable Kill Switch
print("Enabling Kill Switch...")
POLICY_FILE = os.path.join(ANX_ROOT, "policies", "autonomy_policy.json")
with open(POLICY_FILE, 'r') as f:
    data = json.load(f)
data['kill_switch'] = True
with open(POLICY_FILE, 'w') as f:
    json.dump(data, f, indent=2)

# 2. Enqueue Job
print("Enqueueing STOP Test Job...")
qm = queue_v2.QueueV2()
job_id = qm.enqueue({
    "type": "project_op",
    "ticket_id": "ACC-004-STOP",
    "adapter": "SN",
    "command": "validate",
    "cost_usd": 0
}, priority=20, dedupe_hash=str(uuid.uuid4()))

# 3. Run Runner (Subprocess)
print("Starting Runner (5s)...")
runner_script = os.path.join(ANX_ROOT, "autonomy", "autonomy_v3.py")
p = subprocess.Popen(["python", runner_script], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

time.sleep(10)
print("Stopping Runner...")
p.terminate()
try:
    outs, errs = p.communicate(timeout=5)
except:
    p.kill()
    outs, errs = p.communicate()

# 4. Verify Logs
print("Verifying Logs...")
if "Kill Switch Detected" in outs:
    print("PASS: Runner detected Kill Switch.")
else:
    print("FAIL: Runner did not log expected Kill Switch message.")
    print("Output Snippet:", outs[:500])

# 5. Verify Job Status (Should be PENDING)
print("Verifying Job Status...")
conn = qm.get_connection()
c = conn.cursor()
c.execute("SELECT status FROM queue WHERE id=?", (job_id,))
row = c.fetchone()
if row and row[0] == 'PENDING':
    print("PASS: Job remained PENDING.")
else:
    print(f"FAIL: Job status is {row[0] if row else 'None'}")

# 6. Restore Kill Switch
print("Restoring Kill Switch...")
data['kill_switch'] = False
with open(POLICY_FILE, 'w') as f:
    json.dump(data, f, indent=2)
