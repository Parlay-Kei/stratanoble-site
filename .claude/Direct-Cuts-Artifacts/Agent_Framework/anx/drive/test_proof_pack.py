
import subprocess
import os
import sys

TOOL_PATH = "scripts/anx/drive/drive_agent_tool.py"
PYTHON_EXE = sys.executable

# Updates to reflect real folder structure
TEST_CASES = [
    {
        "role": "Legal Ops",
        "action": "list",
        "path": "/",
        "expect_success": True,
        "desc": "Legal Ops lists root"
    },
    {
        "role": "Legal Ops",
        "action": "write",
        "path": "/7. Legal & Compliance/compliance_check.txt",
        "content": "Compliance verified.",
        "expect_success": True,
        "desc": "Legal Ops writes to /7. Legal & Compliance"
    },
    {
        "role": "Legal Ops",
        "action": "write",
        "path": "/2. Financial/audit_attempt.txt",
        "content": "Intrusion.",
        "expect_success": False,
        "desc": "Legal Ops tries write to /2. Financial (Should Fail)"
    },
    {
        "role": "CFO",
        "action": "write",
        "path": "/2. Financial/budget_q1.txt",
        "content": "Budget approved.",
        "expect_success": True,
        "desc": "CFO writes to /2. Financial"
    },
    {
        "role": "OCS",
        "action": "read",
        "path": "/7. Legal & Compliance/compliance_check.txt",
        "expect_success": True,
        "desc": "OCS reads /7. Legal & Compliance file"
    },
    {
        "role": "OCS",
        "action": "write",
        "path": "/7. Legal & Compliance/ocs_override.txt",
        "content": "Override",
        "expect_success": False,
        "desc": "OCS tries write to /7. Legal & Compliance (Should Fail)"
    }
]

def run_test():
    results = []
    print(f"Running {len(TEST_CASES)} tests...")
    
    for test in TEST_CASES:
        cmd = [PYTHON_EXE, TOOL_PATH, "--role", test["role"], "--action", test["action"], "--path", test["path"]]
        if "content" in test:
            cmd.extend(["--content", test["content"]])
            
        print(f"Running: {test['desc']}...", end=" ", flush=True)
        
        try:
            # Capture output
            result = subprocess.run(cmd, capture_output=True, text=True)
            success = result.returncode == 0
            
            # Check expectation
            passed = success == test["expect_success"]
            
            status = "PASS" if passed else "FAIL"
            print(status)
            
            results.append({
                "test": test,
                "passed": passed,
                "output": result.stdout,
                "error": result.stderr,
                "returncode": result.returncode
            })
            
        except Exception as e:
            print(f"ERROR: {e}")
            results.append({"test": test, "passed": False, "error": str(e)})

    # Generate Report
    report_path = "artifacts/proofs/drive_integration_proof.md"
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    with open(report_path, "w") as f:
        f.write("# Drive Integration Proof Pack\n\n")
        f.write(f"**Date**: {os.popen('date /t').read().strip()}\n")
        f.write("**Status**: " + ("ALL PASSED" if all(r["passed"] for r in results) else "FAILURES DETECTED") + "\n\n")
        
        f.write("| Role | Action | Path | Expected | Result | Output |\n")
        f.write("|------|--------|------|----------|--------|--------|\n")
        
        for r in results:
            role = r["test"]["role"]
            action = r["test"]["action"]
            path = r["test"]["path"]
            expect = "Success" if r["test"]["expect_success"] else "Fail"
            result = "PASS" if r["passed"] else "FAIL"
            # Truncate output
            out_sample = (r.get('output', '') + r.get('error', '')).replace('\n', ' ')[:50]
            
            f.write(f"| {role} | {action} | {path} | {expect} | {result} | `{out_sample}` |\n")

    print(f"\nProof pack generated at {report_path}")

if __name__ == "__main__":
    run_test()
