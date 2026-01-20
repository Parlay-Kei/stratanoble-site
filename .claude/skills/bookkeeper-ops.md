---
name: bookkeeper-ops
description: Enterprise-grade bookkeeping operations skill for the Bookkeeper Agent. Provides autonomous financial data sync, categorization, reconciliation, and reporting capabilities across Stripe, Plaid, and Supabase.
version: 1.0.0
level: 3
triggers:
  - sync transactions
  - sync stripe
  - sync banks
  - categorize transactions
  - reconcile accounts
  - bank reconciliation
  - financial report
  - monthly close
  - flagged transactions
  - transaction status
  - bookkeeper status
  - learn patterns
---

# bookkeeper-ops Skill

Elite financial operations for autonomous bookkeeping. This skill enables the Bookkeeper Agent to maintain accurate, real-time books across all ANX Holdings ventures.

## Quick Commands

| Command | Action |
|---------|--------|
| `status` | Show current transaction status and pending items |
| `sync` | Full sync from all sources (Stripe + Banks) |
| `sync stripe` | Sync Stripe transactions only |
| `sync banks` | Sync bank transactions via Plaid |
| `categorize` | Auto-categorize pending transactions |
| `review` | Show flagged items needing CFO review |
| `reconcile` | Run auto-reconciliation |
| `report` | Generate reconciliation report |
| `close` | Run month-end close workflow |
| `learn` | Update patterns from CFO corrections |

---

## Level 1: Status & Monitoring

### getTransactionStatus()
```python
"""
Get current transaction status across all sources.
"""
def get_transaction_status(supabase, entity=None):
    query = supabase.table('transactions').select('status', count='exact')
    if entity:
        query = query.eq('entity', entity)

    pending = query.eq('status', 'pending').execute()
    categorized = query.eq('status', 'categorized').execute()
    reconciled = query.eq('status', 'reconciled').execute()
    flagged = query.eq('status', 'flagged').execute()

    return {
        'pending': pending.count,
        'categorized': categorized.count,
        'reconciled': reconciled.count,
        'flagged': flagged.count,
        'total': sum([pending.count, categorized.count, reconciled.count, flagged.count])
    }
```

### getErrorSummary()
```python
"""
Get recent errors and their resolution status.
"""
def get_error_summary(supabase, days=7):
    from datetime import datetime, timedelta
    since = (datetime.now() - timedelta(days=days)).isoformat()

    errors = supabase.table('bookkeeper_errors').select('*') \
        .gte('timestamp', since) \
        .order('timestamp', desc=True) \
        .execute()

    by_severity = {}
    for e in errors.data:
        sev = e['severity']
        by_severity[sev] = by_severity.get(sev, 0) + 1

    return {
        'total': len(errors.data),
        'unresolved': len([e for e in errors.data if not e['resolved']]),
        'by_severity': by_severity
    }
```

---

## Level 2: Data Synchronization

### syncStripe()
```python
"""
Sync transactions from Stripe.
Uses the sync_stripe.py script.
"""
import subprocess

def sync_stripe(days=7, entity=None):
    cmd = ['python', 'scripts/sync_stripe.py', '--days', str(days)]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return {
        'success': result.returncode == 0,
        'output': result.stdout,
        'errors': result.stderr
    }
```

### syncBanks()
```python
"""
Sync transactions from bank accounts via Plaid.
"""
def sync_banks(entity=None, update_balances=True):
    cmd = ['python', 'scripts/sync_banks.py']
    if entity:
        cmd.extend(['--account', entity])
    if update_balances:
        cmd.append('--update-balances')

    result = subprocess.run(cmd, capture_output=True, text=True)
    return {
        'success': result.returncode == 0,
        'output': result.stdout,
        'errors': result.stderr
    }
```

---

## Level 3: Categorization & Reconciliation

### categorizeTransactions()
```python
"""
Auto-categorize pending transactions.
"""
def categorize_transactions(entity=None):
    cmd = ['python', 'scripts/categorize.py']
    if entity:
        cmd.extend(['--entity', entity])

    result = subprocess.run(cmd, capture_output=True, text=True)
    return parse_categorization_output(result.stdout)

def parse_categorization_output(output):
    # Parse summary from script output
    lines = output.split('\n')
    stats = {}
    for line in lines:
        if 'Processed:' in line:
            stats['processed'] = int(line.split(':')[1].strip())
        elif 'Auto-categorized:' in line:
            stats['auto_categorized'] = int(line.split(':')[1].strip())
        elif 'Flagged:' in line:
            stats['flagged'] = int(line.split(':')[1].strip())
    return stats
```

### reconcileAccounts()
```python
"""
Run auto-reconciliation to match Stripe payouts to bank deposits.
"""
def reconcile_accounts(entity=None, month=None):
    cmd = ['python', 'scripts/reconcile.py', '--auto']
    if entity:
        cmd.extend(['--entity', entity])
    if month:
        cmd.extend(['--month', month])

    result = subprocess.run(cmd, capture_output=True, text=True)
    return {
        'success': result.returncode == 0,
        'output': result.stdout
    }
```

### getFlaggedItems()
```python
"""
Get transactions flagged for CFO review.
"""
def get_flagged_items(supabase, entity=None, limit=50):
    query = supabase.table('transactions').select('*') \
        .eq('status', 'flagged') \
        .order('transaction_date', desc=True) \
        .limit(limit)

    if entity:
        query = query.eq('entity', entity)

    return query.execute().data
```

---

## Level 4: Reporting & Analysis

### generateReconciliationReport()
```python
"""
Generate a reconciliation report for a given period.
"""
def generate_reconciliation_report(supabase, entity, year, month):
    cmd = [
        'python', 'scripts/reconcile.py',
        '--report',
        '--entity', entity,
        '--month', f'{year}-{month:02d}'
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout)
```

### getMonthlyCloseStatus()
```python
"""
Get status of month-end close process.
"""
def get_monthly_close_status(supabase, year, month):
    result = supabase.table('monthly_close_status').select('*') \
        .eq('period_year', year) \
        .eq('period_month', month) \
        .execute()

    return result.data
```

### getCashPosition()
```python
"""
Get current cash position across all bank accounts.
"""
def get_cash_position(supabase):
    accounts = supabase.table('bank_accounts').select('*') \
        .eq('is_active', True) \
        .execute()

    total = sum(acc.get('current_balance', 0) or 0 for acc in accounts.data)

    return {
        'total_cash': total,
        'accounts': [{
            'name': acc['account_name'],
            'entity': acc['entity'],
            'balance': acc.get('current_balance', 0),
            'updated': acc.get('balance_updated_at')
        } for acc in accounts.data]
    }
```

---

## Level 5: Month-End Close Workflow

### monthEndClose()
```python
"""
Execute month-end close workflow.
MCP Chain: RECONCILE -> CATEGORIZE -> VERIFY -> CLOSE -> REPORT
"""
def month_end_close(supabase, year, month, entity='consolidated'):
    from datetime import datetime

    # Create close record
    close_record = {
        'period_year': year,
        'period_month': month,
        'entity': entity,
        'status': 'in_progress',
        'close_started_at': datetime.now().isoformat()
    }

    result = supabase.table('monthly_close_status').upsert(
        close_record,
        on_conflict='period_year,period_month,entity'
    ).execute()

    close_id = result.data[0]['id']

    # Step 1: Final sync
    sync_stripe(days=45)  # Ensure we have all month's data
    sync_banks()

    # Step 2: Categorize remaining
    categorize_transactions()
    update_close_step(supabase, close_id, 'transactions_categorized', True)

    # Step 3: Reconcile
    reconcile_accounts(month=f'{year}-{month:02d}')
    update_close_step(supabase, close_id, 'bank_reconciled', True)
    update_close_step(supabase, close_id, 'stripe_reconciled', True)

    # Step 4: Generate reports
    report = generate_reconciliation_report(supabase, entity, year, month)
    update_close_step(supabase, close_id, 'reports_generated', True)

    # Step 5: Mark complete (pending CFO review)
    supabase.table('monthly_close_status').update({
        'status': 'pending_review',
        'close_completed_at': datetime.now().isoformat()
    }).eq('id', close_id).execute()

    return {
        'close_id': close_id,
        'status': 'pending_review',
        'report': report
    }

def update_close_step(supabase, close_id, step, value):
    supabase.table('monthly_close_status').update({
        step: value
    }).eq('id', close_id).execute()
```

---

## Integration Points

### CFO Agent
- Escalate flagged transactions >$1,000
- Submit close package for approval
- Report variance analysis

### Payments Audit Agent
- Share Stripe transaction data
- Coordinate on payout verification

### Earnings Payouts Agent
- Verify barber earnings before payout
- Reconcile payout records

---

## Error Handling

### Severity Levels
| Level | Action | Example |
|-------|--------|---------|
| INFO | Log only | Successful sync |
| WARNING | Flag for review | Low confidence categorization |
| ERROR | Retry + alert | API failure |
| CRITICAL | Escalate to CFO | Data corruption |

### Retry Logic
```python
import time

def with_retry(func, max_retries=3, base_delay=1):
    """Execute function with exponential backoff retry."""
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2 ** attempt)
            time.sleep(delay)
```

---

## Configuration

### Environment Variables
```
STRIPE_SECRET_KEY      # Stripe API key
SUPABASE_URL           # Supabase project URL
SUPABASE_SERVICE_KEY   # Supabase service role key
PLAID_CLIENT_ID        # Plaid client ID
PLAID_SECRET           # Plaid secret key
PLAID_ENV              # Plaid environment (production/sandbox)
```

### Thresholds
```
AUTO_CATEGORIZE_THRESHOLD = 95  # Confidence to auto-approve
FLAG_THRESHOLD = 70             # Below this = flagged
CFO_APPROVAL_AMOUNT = 1000      # Amount requiring CFO approval
```

---

## Usage Examples

### Daily Operations
```
/bookkeeper status           # Check current status
/bookkeeper sync             # Sync all sources
/bookkeeper categorize       # Categorize pending
/bookkeeper review           # Show flagged items
```

### Month-End
```
/bookkeeper reconcile --month 2026-01
/bookkeeper close --month 2026-01
/bookkeeper report --entity direct_cuts --month 2026-01
```

### Troubleshooting
```
/bookkeeper errors           # Show recent errors
/bookkeeper learn            # Update patterns from corrections
```
