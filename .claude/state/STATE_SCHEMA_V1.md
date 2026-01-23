# ANX State Schema V1

## Tables

### `tickets`

- `id` (TEXT, PK): Ticket ID (e.g., TKT-123)
- `title` (TEXT)
- `status` (TEXT): OPEN, IN_PROGRESS, BLOCKED, DONE
- `created_at` (TEXT)
- `owner` (TEXT)

### `runs`

- `id` (TEXT, PK): Run ID (UUID)
- `ticket_id` (TEXT, FK)
- `agent` (TEXT)
- `status` (TEXT): RUNNING, COMPLETED, FAILED
- `started_at` (TEXT)
- `completed_at` (TEXT)

### `tool_invocations`

- `id` (TEXT, PK)
- `run_id` (TEXT, FK)
- `tool_name` (TEXT)
- `inputs` (JSON)
- `outputs` (JSON)
- `status` (TEXT)

### `artifacts`

- `id` (TEXT, PK)
- `run_id` (TEXT, FK)
- `path` (TEXT)
- `type` (TEXT)

### `budget_ledger`

- `id` (TEXT, PK)
- `run_id` (TEXT, FK)
- `amount` (REAL)
- `currency` (TEXT)
- `category` (TEXT)
- `timestamp` (TEXT)

### `queue`

- `id` (TEXT, PK)
- `payload` (JSON)
- `priority` (INTEGER)
- `status` (TEXT): PENDING, PROCESSING, COMPLETED, FAILED
- `created_at` (TEXT)

### `events`

- `id` (TEXT, PK)
- `type` (TEXT)
- `payload` (JSON)
- `timestamp` (TEXT)
