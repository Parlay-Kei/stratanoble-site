# Autonomy V3 Acceptance Gate: Portfolio Attach (Phase 2)

## Objective

Verify that the `AutonomyRunner` can successfully execute project-specific
commands across the portfolio using the standard Adapter interface, and respect
global governance policies (Budget Cap, Kill Switch).

## Acceptance Criteria

### 1. Adapter Registry Check

- [x] DC Adapter present (`services/project_adapters/DC.json`)
- [x] DC iOS Adapter present (`services/project_adapters/DC_IOS.json`)
- [x] DSLV Adapter present (`services/project_adapters/DSLV.json`)
- [x] MAH Adapter present (`services/project_adapters/MAH.json`)
- [x] SN Adapter present (`services/project_adapters/SN.json`)

### 2. Service Catalog Check

- [x] DC Release Service (`services/release/DC.json`)
- [x] DSLV Release Service (`services/release/DSLV.json`)
- [x] MAH Release Service (`services/release/MAH.json`)
- [x] SN Release Service (`services/release/SN.json`)

### 3. Execution Scenarios

Every scenario must emit a Proof Pack receipt.

| ID          | Scenario      | Job Payload                                  | Expected Result                                                                  |
| ----------- | ------------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| **ACC-001** | **PASS Run**  | `project_ops.py SN validate --dry-run`       | **SUCCESS**. Runner loads adapter, executes command, exits 0.                    |
| **ACC-002** | **FAIL Run**  | `project_ops.py SN bad_command`              | **FAILED**. Script exits with error code. Receipt shows failure.                 |
| **ACC-003** | **BLOCK Run** | `project_ops.py DC deploy` (Cost: $9999)     | **BLOCKED**. Budget Cap policy prevents execution. Status stays PENDING/BLOCKED. |
| **ACC-004** | **STOP Run**  | `project_ops.py MAH smoke` (Kill Switch: ON) | **STOPPED**. Kill switch enabled prevents execution.                             |

## Outputs

- **Receipts**: Stored in `.claude-anx/receipts/`
- **Proof Packs**: Stored in `.claude-anx/runs/`
