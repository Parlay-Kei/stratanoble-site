# Drive Integration Implementation Plan

**Mission**: Connect ANX Agents to Google Drive with Least Privilege Access.
**Status**: COMPLETE

## 1. Architecture

We have implemented a native Python toolchain for Drive interaction.

- **`scripts/anx/drive/drive_client.py`**: Low-level wrapper for Google Drive
  API V3. Handles Authentication (OAuth2) and path-to-ID resolution. Uses
  in-memory streaming for reliability.
- **`scripts/anx/drive/drive_agent_tool.py`**: The "Gatekeeper" CLI. Agents
  invoke this tool. It verifies their Role against the Permission Matrix before
  attempting any Drive API call.
- **Audit Logging**: All actions are logged to
  `artifacts/audit/drive_access.log`.

## 2. Permission Matrix (Least Privilege)

Defined in `config/anx_drive_config.json`.

| Role              | Write Access             | Read Access  | Notes                         |
| ----------------- | ------------------------ | ------------ | ----------------------------- |
| **Legal Ops**     | `/7. Legal & Compliance` | Global (`*`) | Contract management           |
| **CFO**           | `/2. Financial`          | Global (`*`) | Budget/Expense tracking       |
| **QA Gatekeeper** | `/9. Evidence`           | Global (`*`) | Upload test proofs            |
| **OCS**           | _None_                   | Global (`*`) | Orchestration only. No write. |
| **Platform Ops**  | `/10. Infrastructure`    | Global (`*`) | Setup & Maintenance           |

## 3. Configuration & Secrets

- **Credentials**: `c:\Dev\Direct-Cuts\Credentials.json`
- **Token**: `c:\Dev\Direct-Cuts\token.json` (Refreshed and Valid)
- **Root Folder**: `1KFd2O3k-hq8QS6QBPtUB6vTU8zJYzuFK`

## 4. Usage for Agents

Agents should use the CLI tool:

```bash
# List files
python scripts/anx/drive/drive_agent_tool.py --role "Legal Ops" --action list --path "/"

# Read file
python scripts/anx/drive/drive_agent_tool.py --role "Legal Ops" --action read --path "/7. Legal & Compliance/contract.txt"

# Write file
python scripts/anx/drive/drive_agent_tool.py --role "Legal Ops" --action write --path "/7. Legal & Compliance/new_contract.txt" --content "Draft 1"
```

## 5. Verification (Proof Pack)

Run the automated validation suite:

```powershell
python scripts/anx/drive/test_proof_pack.py
```

This generates `artifacts/proofs/drive_integration_proof.md`. **Current
Status**: ALL TESTS PASSED.
