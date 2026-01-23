import sqlite3
import json
import uuid
import datetime
import argparse
import sys
import os

DB_PATH = r"C:\Dev\.claude-anx\state\anx_state.db"
POLICY_PATH = r"C:\Dev\.claude-anx\policies\budget_policy.json"

def load_policy():
    with open(POLICY_PATH, 'r') as f:
        return json.load(f)

def check_and_spend(amount, category, run_id, role="autonomy_runner"):
    policy = load_policy()
    
    # 1. Check Transaction Cap
    role_policy = policy['limits']['roles'].get(role, {})
    tx_cap = role_policy.get('transaction_cap', policy['limits']['global']['transaction_cap'])
    
    if amount > tx_cap:
        return {
            "status": "BLOCKED",
            "reason": f"Transaction amount {amount} exceeds cap {tx_cap}",
            "amount": amount,
            "currency": policy['currency']
        }

    # 2. Check Daily Cap
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # We need to extract the date part from the timestamp for aggregation
    # SQLite 'date' function works on ISO8601 strings
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    cursor.execute("""
        SELECT SUM(amount) FROM budget_ledger 
        WHERE date(timestamp) = ?
    """, (today,))
    
    result = cursor.fetchone()[0]
    current_daily_spend = result if result else 0.0
    
    daily_cap = role_policy.get('daily_cap', policy['limits']['global']['daily_cap'])
    
    if current_daily_spend + amount > daily_cap:
        conn.close()
        return {
            "status": "BLOCKED",
            "reason": f"Daily spend {current_daily_spend + amount} exceeds cap {daily_cap}",
            "amount": amount,
            "currency": policy['currency'],
            "current_daily_spend": current_daily_spend
        }
    
    # 3. Record Spend
    tx_id = str(uuid.uuid4())
    timestamp = datetime.datetime.now().isoformat()
    cursor.execute("""
        INSERT INTO budget_ledger (id, run_id, amount, currency, category, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (tx_id, run_id, amount, policy['currency'], category, timestamp))
    
    conn.commit()
    conn.close()
    
    return {
        "status": "APPROVED",
        "tx_id": tx_id,
        "amount": amount,
        "currency": policy['currency'],
        "timestamp": timestamp,
        "category": category,
        "run_id": run_id
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--amount", type=float, required=True)
    parser.add_argument("--category", type=str, required=True)
    parser.add_argument("--run_id", type=str, default="test_run")
    parser.add_argument("--role", type=str, default="autonomy_runner")
    args = parser.parse_args()
    
    try:
        result = check_and_spend(args.amount, args.category, args.run_id, args.role)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"status": "ERROR", "message": str(e)}))
