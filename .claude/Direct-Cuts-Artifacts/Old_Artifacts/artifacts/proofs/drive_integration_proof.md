# Drive Integration Proof Pack

**Date**: Sun 01/18/2026
**Status**: ALL PASSED

| Role | Action | Path | Expected | Result | Output |
|------|--------|------|----------|--------|--------|
| Legal Ops | list | / | Success | PASS | `[   {     "id": "1OkxmaruKLaEgyV8lxhd36oBa__vOZNj9` |
| Legal Ops | write | /7. Legal & Compliance/compliance_check.txt | Success | PASS | `SUCCESS: Written to 1baUctbYylB1l-MUPE1fruN2M6Jd_X` |
| Legal Ops | write | /2. Financial/audit_attempt.txt | Fail | PASS | `PERMISSION DENIED: Denied. Legal Ops cannot write ` |
| CFO | write | /2. Financial/budget_q1.txt | Success | PASS | `SUCCESS: Written to 1mrId5NkUqOkyWBqy67ehZUPokLYg-` |
| OCS | read | /7. Legal & Compliance/compliance_check.txt | Success | PASS | `Compliance verified. ` |
| OCS | write | /7. Legal & Compliance/ocs_override.txt | Fail | PASS | `PERMISSION DENIED: Denied. OCS cannot write to /7.` |
