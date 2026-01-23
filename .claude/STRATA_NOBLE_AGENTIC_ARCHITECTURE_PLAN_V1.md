# The Complete Plan: Fully Agentic, Fully Autonomous (Autonomy v1 → v3)

## Definitions

**Agentic**: OCS can route work to agents that can actually invoke tools, write
state, and produce receipts.

**Autonomous**: The system can run end-to-end without you touching it, under
explicit constraints:

- **Budget caps**
- **Environment caps**
- **Rate caps**
- **Kill switch**
- **Proof packs**
- **Automatic rollback where possible**

> If you want “completely autonomous” with no constraints, you get a weaponized
> Roomba.

---

## Architecture Blueprint

### Core Substrate (the five pillars)

1. **Single Registry of Truth**
   - Compiled registry that maps agents → skills → services → tools →
     constraints → proof requirements.

2. **Execution Bus**
   - One gateway that runs everything (your dispatcher + MCP).
   - Dry-run option exists, but autonomy runs in execute mode within
     constraints.

3. **State Store**
   - Local-first SQLite work ledger: tickets, steps, tool runs, artifacts,
     events, budgets.

4. **Proof Pack Automation**
   - Every tool run emits receipts and artifacts into a standard run folder.
   - QA validates proof completeness automatically.

5. **Autonomy Controller**
   - A loop runner that:
     - Pulls tasks from queue
     - Routes to agents
     - Executes tools
     - Monitors outcomes
     - Applies rollback or raises exceptions
     - Closes tickets with receipts

### Safety Boundaries

These do not feel like approvals; they are automated checks.

- **Money cap**: Max spend/day and max per transaction.
- **Prod cap**: Restrict autonomous deploys to specific repos/branches or only
  after gates pass.
- **Outbound cap**: Rate limits and dedupe only. No approval.
- **Kill switch**: One flag that stops all execution immediately.
- **Rollback hooks**: Defined per service where possible.

---

## Roadmap (3 phases)

### Phase 1: Make it real (Agentic L2 substrate)

**Goal**: Your agents stop being definitions and start being callable operators.

**Deliverables**:

- `registry\anx_registry.compiled.json`
- `state\anx_state.db`
- `runs\{ticketId}\{runId}\...` proof pack structure
- Dispatcher enforces allowlists and emits receipts
- QA proof validator produces PASS/FAIL automatically

**Acceptance tests**:

- Create ticket → route → execute a safe tool → proof pack PASS.
- Missing skill reference causes registry compile FAIL.
- Tool run without required proof triggers QA FAIL.

### Phase 2: Autonomous execution with constraints (Autonomy v1)

**Goal**: System can run end-to-end for safe categories, 24/7.

**Deliverables**:

- `autonomy\autonomy_runner` (service loop)
- `policies\autonomy_policy.json` (caps, allowlists, kill switch)
- Queue model in SQLite (scheduled jobs + backlog ingestion)
- Exception handling workflow (auto-escalate to “Needs Steve” only on hard
  failures)

**Acceptance tests**:

- System pulls 10 queued tasks, completes 9, escalates 1 with full receipts.
- Outbound sends run without approval, but dedupe and caps enforced.
- Budget cap blocks a payment attempt and logs receipt.

### Phase 3: Full autonomy expansion (Autonomy v3)

**Goal**: Autonomous across most operations including releases, billing ops, and
routine legal drafts. Not court filings without your explicit go-ahead.

**Deliverables**:

- Repo adapters in each project (validate/test/build/deploy/rollback)
- Money ops adapters (Stripe, invoicing, subscriptions) with caps
- Legal ops adapters (drafting, clause selection, redline workflows)
- Continuous monitoring and weekly audit digests

**Acceptance tests**:

- Autonomous release to staging after gates pass, rollback on failure.
- Monthly invoicing run completes with receipts and reconciliation report.
- Legal draft run generates agreement plus clause diff report and stores in data
  room.

---

## The Execution Plan as Agent Missions

### Mission P0-1: Platform Ops Lead

**Title**: `REGISTRY_COMPILER_AND_TRUTH_V1` **Objective**: Compile roster +
manifest + disk scan into one runtime registry. **Deliverables**:

- `registry\anx_registry.compiled.json`
- `registry\REGISTRY_DIFF_REPORT_V1.md`

### Mission P0-2: Platform Ops Lead

**Title**: `SQLITE_STATE_STORE_V1` **Objective**: Create `state\anx_state.db`
with ticketing, run ledger, queue, budgets, and event log. **Deliverables**:

- `state\anx_state.db`
- `state\STATE_SCHEMA_V1.md`

### Mission P0-3: Platform Ops Lead

**Title**: `DISPATCHER_RECEIPTS_AND_GUARDS_V1` **Objective**: Dispatcher emits
proof packs for every run and enforces allowlists, kill switch, caps.
**Deliverables**:

- Proof pack writer
- Kill switch check
- Caps enforcement hooks
- Run directory standardization

### Mission P0-4: QA Gatekeeper

**Title**: `PROOF_POLICY_AND_VALIDATOR_V1` **Objective**: Convert proof
requirements into enforceable checks and gate outputs. **Deliverables**:

- `policies\proof_policy.json`
- `qa\PROOF_VALIDATOR_V1.md`
- Gate output receipts (PASS/FAIL)
