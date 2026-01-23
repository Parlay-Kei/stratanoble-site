import sqlite3
import os
import datetime
import json

DB_PATH = r"C:\Dev\.claude-anx\state\anx_state.db"
REPORT_DIR = r"C:\Dev\.claude-anx\artifacts\reports"

def generate_daily_digest():
    os.makedirs(REPORT_DIR, exist_ok=True)
    today = datetime.date.today().isoformat()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Jobs Summary
    cursor.execute("""
        SELECT status, COUNT(*) 
        FROM queue 
        WHERE date(created_at) = date('now', 'localtime')
        GROUP BY status
    """)
    job_stats = dict(cursor.fetchall())
    
    # Exceptions (Failed jobs)
    cursor.execute("""
        SELECT id, last_error 
        FROM queue 
        WHERE status = 'FAILED' AND date(created_at) = date('now', 'localtime')
    """)
    failures = cursor.fetchall()

    # Spend (Simulated table usage)
    cursor.execute("""
        SELECT SUM(amount), currency
        FROM budget_ledger
        WHERE date(timestamp) = date('now', 'localtime')
        GROUP BY currency
    """)
    spend = cursor.fetchall()
    
    conn.close()
    
    # Generate MD
    report_path = os.path.join(REPORT_DIR, f"DAILY_DIGEST_{today}.md")
    
    md = f"""# ANX Autonomy Daily Digest: {today}

## Job Statistics
- **Completed**: {job_stats.get('COMPLETED', 0)}
- **Failed**: {job_stats.get('FAILED', 0)}
- **Pending**: {job_stats.get('PENDING', 0)}
- **Processing**: {job_stats.get('PROCESSING', 0)}

## Exceptions
{'- None' if not failures else ''}
"""
    for jid, error in failures:
        md += f"- **{jid}**: {error}\n"

    md += """
## Spend
"""
    if not spend:
        md += "- No spend recorded.\n"
    for amount, currency in spend:
        md += f"- {currency} {amount:.2f}\n"

    with open(report_path, 'w') as f:
        f.write(md)
        
    print(f"Daily digest generated: {report_path}")

if __name__ == "__main__":
    generate_daily_digest()
