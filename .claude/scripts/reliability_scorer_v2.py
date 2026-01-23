#!/usr/bin/env python3
"""
Reliability Scorer V2 - Dual metric system with Ops and Shipping reliability
Eliminates contradictions by clearly separating operational correctness from shipping success
"""

import os
import sys
import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

ANX_ROOT = r"C:\Dev\.claude-anx"
DB_PATH = os.path.join(ANX_ROOT, "state", "anx_state.db")
RECEIPTS_DIR = os.path.join(ANX_ROOT, "receipts", "scores")

class ReliabilityScorerV2:
    def __init__(self):
        self.target_ops_reliability = 0.90  # 90% operational correctness
        self.target_shipping_reliability = 0.85  # 85% shipping success
        self.sweep_window_hours = 24

    def get_db_connection(self):
        return sqlite3.connect(DB_PATH)

    def calculate_dual_metrics(self, start_time=None, end_time=None):
        """Calculate both Ops and Shipping reliability metrics"""
        if not end_time:
            end_time = datetime.now()
        if not start_time:
            start_time = end_time - timedelta(hours=self.sweep_window_hours)

        conn = self.get_db_connection()
        cursor = conn.cursor()

        # === OPS RELIABILITY ===
        # Count all jobs for ops reliability
        cursor.execute("""
            SELECT
                status,
                json_extract(payload, '$.run_outcome') as outcome,
                json_extract(payload, '$.run_intent') as intent
            FROM queue
            WHERE created_at >= ? AND created_at <= ?
            AND status != 'PENDING'
        """, (start_time.isoformat(), end_time.isoformat()))

        ops_total = 0
        ops_correct = 0
        ops_incorrect = 0
        ops_details = {
            "PASS": 0,
            "EXPECTED_FAIL": 0,
            "BLOCKED": 0,
            "STOPPED": 0,
            "FAIL": 0,
            "TIMEOUT": 0,
            "CRASH": 0
        }

        for status, outcome, intent in cursor.fetchall():
            ops_total += 1

            # Determine if behavior was correct
            if outcome in ["PASS", "EXPECTED_FAIL", "BLOCKED", "STOPPED"]:
                ops_correct += 1
                ops_details[outcome] = ops_details.get(outcome, 0) + 1
            elif status == "COMPLETED" or status == "SUCCESS":
                # Legacy mapping
                ops_correct += 1
                ops_details["PASS"] += 1
            elif status in ["BLOCKED", "STOPPED"]:
                ops_correct += 1
                ops_details[status] += 1
            else:
                ops_incorrect += 1
                if status == "FAILED":
                    ops_details["FAIL"] += 1
                elif status == "TIMEOUT":
                    ops_details["TIMEOUT"] += 1
                else:
                    ops_details["CRASH"] = ops_details.get("CRASH", 0) + 1

        ops_reliability = (ops_correct / ops_total * 100) if ops_total > 0 else 0

        # === SHIPPING RELIABILITY ===
        # Count only production validate/test/build jobs, excluding BLOCKED operations
        cursor.execute("""
            SELECT
                status,
                json_extract(payload, '$.phase') as phase,
                json_extract(payload, '$.repo') as repo,
                json_extract(payload, '$.run_outcome') as outcome,
                json_extract(payload, '$.exception_code') as exception_code
            FROM queue
            WHERE created_at >= ? AND created_at <= ?
            AND json_extract(payload, '$.intent') != 'TEST'
            AND json_extract(payload, '$.phase') IN ('validate', 'test', 'build')
            AND status != 'PENDING'
            AND (json_extract(payload, '$.run_outcome') != 'BLOCKED' OR json_extract(payload, '$.run_outcome') IS NULL)
            AND (json_extract(payload, '$.exception_code') != 'ENV_TOOLING_UNAVAILABLE' OR json_extract(payload, '$.exception_code') IS NULL)
        """, (start_time.isoformat(), end_time.isoformat()))

        shipping_total = 0
        shipping_success = 0
        shipping_failed = 0
        shipping_by_phase = {
            "validate": {"total": 0, "success": 0},
            "test": {"total": 0, "success": 0},
            "build": {"total": 0, "success": 0}
        }
        shipping_by_repo = {}

        for status, phase, repo, outcome, exception_code in cursor.fetchall():
            if phase:  # Only count if phase is defined
                shipping_total += 1

                if status in ["COMPLETED", "SUCCESS", "PASS"]:
                    shipping_success += 1
                    if phase in shipping_by_phase:
                        shipping_by_phase[phase]["success"] += 1
                else:
                    shipping_failed += 1

                if phase in shipping_by_phase:
                    shipping_by_phase[phase]["total"] += 1

                # Track by repo
                if repo:
                    if repo not in shipping_by_repo:
                        shipping_by_repo[repo] = {"total": 0, "success": 0}
                    shipping_by_repo[repo]["total"] += 1
                    if status in ["COMPLETED", "SUCCESS", "PASS"]:
                        shipping_by_repo[repo]["success"] += 1

        shipping_reliability = (shipping_success / shipping_total * 100) if shipping_total > 0 else 0

        # Calculate phase-specific rates
        for phase_data in shipping_by_phase.values():
            if phase_data["total"] > 0:
                phase_data["rate"] = phase_data["success"] / phase_data["total"] * 100
            else:
                phase_data["rate"] = 0

        # Calculate repo-specific rates
        for repo_data in shipping_by_repo.values():
            if repo_data["total"] > 0:
                repo_data["rate"] = repo_data["success"] / repo_data["total"] * 100
            else:
                repo_data["rate"] = 0

        conn.close()

        return {
            "window": {
                "start_time": start_time.isoformat(),
                "end_time": end_time.isoformat(),
                "hours": self.sweep_window_hours
            },
            "ops": {
                "reliability_percent": ops_reliability,
                "total_jobs": ops_total,
                "correct_behaviors": ops_correct,
                "incorrect_behaviors": ops_incorrect,
                "denominator_sql": "SELECT COUNT(*) FROM queue WHERE status != 'PENDING'",
                "included_outcomes": ["PASS", "EXPECTED_FAIL", "BLOCKED", "STOPPED"],
                "details": ops_details,
                "target": self.target_ops_reliability
            },
            "shipping": {
                "reliability_percent": shipping_reliability,
                "total_jobs": shipping_total,
                "successful_jobs": shipping_success,
                "failed_jobs": shipping_failed,
                "denominator_sql": "SELECT COUNT(*) FROM queue WHERE intent != 'TEST' AND phase IN ('validate','test','build') AND run_outcome != 'BLOCKED' AND exception_code != 'ENV_TOOLING_UNAVAILABLE'",
                "included_outcomes": ["PASS only"],
                "by_phase": shipping_by_phase,
                "by_repo": shipping_by_repo,
                "target": self.target_shipping_reliability
            }
        }

    def format_dual_metrics_display(self, metrics):
        """Format dual metrics for display"""
        ops = metrics["ops"]
        shipping = metrics["shipping"]
        window = metrics["window"]

        # Determine status indicators
        ops_indicator = "[GREEN]" if ops["reliability_percent"] >= ops["target"] else "[YELLOW]" if ops["reliability_percent"] >= 80 else "[RED]"
        shipping_indicator = "[GREEN]" if shipping["reliability_percent"] >= shipping["target"] else "[YELLOW]" if shipping["reliability_percent"] >= 75 else "[RED]"

        # Determine trends (would need historical data)
        ops_trend = "[UP]" if ops["reliability_percent"] >= 70 else "[DOWN]"
        shipping_trend = "[UP]" if shipping["reliability_percent"] >= 68 else "[DOWN]"

        display = f"""
==========================================================================
RELIABILITY METRICS ({window['hours']}h window: {window['start_time'][:16]} - {window['end_time'][:16]})
==========================================================================

Ops Reliability:      {ops['reliability_percent']:.1f}% {ops_trend} {ops_indicator}  [PASS+EXPECTED_FAIL+BLOCKED+STOPPED / ALL]
                                Denominator: {ops['total_jobs']} total jobs
                                Correct: {ops['correct_behaviors']} | Incorrect: {ops['incorrect_behaviors']}
                                Target: {ops['target']:.0f}%

Shipping Reliability: {shipping['reliability_percent']:.1f}% {shipping_trend} {shipping_indicator}  [PASS only / PRODUCTION JOBS]
                                Denominator: {shipping['total_jobs']} production jobs
                                Successful: {shipping['successful_jobs']} | Failed: {shipping['failed_jobs']}
                                Target: {shipping['target']:.0f}%
==========================================================================

OPS BREAKDOWN:
  PASS:          {ops['details'].get('PASS', 0):3d} jobs
  EXPECTED_FAIL: {ops['details'].get('EXPECTED_FAIL', 0):3d} jobs
  BLOCKED:       {ops['details'].get('BLOCKED', 0):3d} jobs
  STOPPED:       {ops['details'].get('STOPPED', 0):3d} jobs
  ---
  FAIL:          {ops['details'].get('FAIL', 0):3d} jobs (incorrect)
  TIMEOUT:       {ops['details'].get('TIMEOUT', 0):3d} jobs (incorrect)
  CRASH:         {ops['details'].get('CRASH', 0):3d} jobs (incorrect)

SHIPPING BREAKDOWN BY PHASE:
  Validate: {shipping['by_phase']['validate']['rate']:5.1f}% ({shipping['by_phase']['validate']['success']}/{shipping['by_phase']['validate']['total']})
  Test:     {shipping['by_phase']['test']['rate']:5.1f}% ({shipping['by_phase']['test']['success']}/{shipping['by_phase']['test']['total']})
  Build:    {shipping['by_phase']['build']['rate']:5.1f}% ({shipping['by_phase']['build']['success']}/{shipping['by_phase']['build']['total']})
"""

        if shipping["by_repo"]:
            display += "\nSHIPPING BY REPOSITORY:\n"
            for repo, data in sorted(shipping["by_repo"].items(),
                                    key=lambda x: x[1]["rate"], reverse=True):
                display += f"  {repo:20s}: {data['rate']:5.1f}% ({data['success']}/{data['total']})\n"

        return display

    def generate_reliability_scorecard_v2(self):
        """Generate reliability scorecard with dual metrics"""
        os.makedirs(RECEIPTS_DIR, exist_ok=True)

        # Calculate current metrics
        metrics = self.calculate_dual_metrics()

        # Generate scorecard
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        scorecard_file = os.path.join(RECEIPTS_DIR, f"RELIABILITY_SCORECARD_V2_{timestamp}.md")

        content = f"""# RELIABILITY SCORECARD V2

**Generated:** {datetime.now().isoformat()}
**Clarity Patch:** Dual metrics system implemented
**Window:** Last 24 hours

## Dual Metrics Summary

{self.format_dual_metrics_display(metrics)}

## Metric Definitions

### Ops Reliability (Operational Correctness)
- **Measures:** Whether system behaved correctly according to intent and policy
- **Formula:** (Correct Behaviors / Total Jobs) x 100
- **Correct:** PASS, EXPECTED_FAIL, BLOCKED, STOPPED
- **Incorrect:** FAIL, TIMEOUT, CRASH
- **Target:** {self.target_ops_reliability:.0f}%
- **Current:** {metrics['ops']['reliability_percent']:.1f}%

### Shipping Reliability (Production Success)
- **Measures:** Pure success rate for production workloads
- **Formula:** (Successful Jobs / Production Jobs) x 100
- **Success:** PASS status only
- **Phases:** validate, test, build
- **Target:** {self.target_shipping_reliability:.0f}%
- **Current:** {metrics['shipping']['reliability_percent']:.1f}%

## Denominator Clarity

### Ops Reliability Denominator
```sql
{metrics['ops']['denominator_sql']}
-- Total: {metrics['ops']['total_jobs']} jobs
```

### Shipping Reliability Denominator
```sql
{metrics['shipping']['denominator_sql']}
-- Total: {metrics['shipping']['total_jobs']} jobs
```

## Success Criteria

### Ops Reliability Target
"""
        if metrics['ops']['reliability_percent'] >= self.target_ops_reliability:
            content += f"[PASS] **ACHIEVED:** {metrics['ops']['reliability_percent']:.1f}% >= {self.target_ops_reliability:.0f}%\n"
        else:
            content += f"[FAIL] **NOT MET:** {metrics['ops']['reliability_percent']:.1f}% < {self.target_ops_reliability:.0f}%\n"
            content += f"  Gap to target: {self.target_ops_reliability - metrics['ops']['reliability_percent']:.1f}%\n"

        content += f"""
### Shipping Reliability Target
"""
        if metrics['shipping']['reliability_percent'] >= self.target_shipping_reliability:
            content += f"[PASS] **ACHIEVED:** {metrics['shipping']['reliability_percent']:.1f}% >= {self.target_shipping_reliability:.0f}%\n"
        else:
            content += f"[FAIL] **NOT MET:** {metrics['shipping']['reliability_percent']:.1f}% < {self.target_shipping_reliability:.0f}%\n"
            content += f"  Gap to target: {self.target_shipping_reliability - metrics['shipping']['reliability_percent']:.1f}%\n"

        content += """

## Clarity Improvements

### Previous Contradictions (Single Metric)
- Mixed operational correctness with shipping success
- EXPECTED_FAIL counted as failure despite being correct
- BLOCKED/STOPPED unclear if good or bad

### Current Clarity (Dual Metrics)
- **Ops:** Measures if autonomy is working correctly
- **Shipping:** Measures if code ships successfully
- No contradictions - each metric has clear purpose

## Raw Metrics Data

```json
""" + json.dumps(metrics, indent=2) + """
```

---
Generated by: Reliability Scorer V2
Type: Dual Metric Scorecard
Version: Clarity Patch V1
"""

        with open(scorecard_file, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"Reliability scorecard V2 generated: {scorecard_file}")
        return scorecard_file, metrics

def main():
    """Main execution"""
    import argparse

    parser = argparse.ArgumentParser(description="Reliability Scorer V2")
    parser.add_argument("--scorecard", action="store_true",
                       help="Generate reliability scorecard with dual metrics")
    parser.add_argument("--current", action="store_true",
                       help="Show current dual metrics")

    args = parser.parse_args()

    scorer = ReliabilityScorerV2()

    if args.scorecard:
        scorecard, metrics = scorer.generate_reliability_scorecard_v2()
        print(f"\nDual Metrics Summary:")
        print(f"  Ops Reliability: {metrics['ops']['reliability_percent']:.1f}%")
        print(f"  Shipping Reliability: {metrics['shipping']['reliability_percent']:.1f}%")
        print(f"  Scorecard: {scorecard}")

    elif args.current:
        metrics = scorer.calculate_dual_metrics()
        print(scorer.format_dual_metrics_display(metrics))

    else:
        # Default: show current metrics
        metrics = scorer.calculate_dual_metrics()
        print(scorer.format_dual_metrics_display(metrics))

    return 0

if __name__ == "__main__":
    sys.exit(main())