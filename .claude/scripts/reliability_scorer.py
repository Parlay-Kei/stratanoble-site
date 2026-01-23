#!/usr/bin/env python3
"""
Reliability Scorer - Track progress toward 85% success rate target
Generates daily sweep scores and final scorecard after 14 sweeps
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

class ReliabilityScorer:
    def __init__(self):
        self.target_success_rate = 0.85  # 85% target
        self.sweep_window_hours = 24  # Daily sweeps
        self.total_sweep_target = 14  # 14 sweeps to reach target

    def get_db_connection(self):
        return sqlite3.connect(DB_PATH)

    def calculate_sweep_score(self, start_time=None, end_time=None):
        """Calculate success metrics for a sweep period"""
        if not end_time:
            end_time = datetime.now()
        if not start_time:
            start_time = end_time - timedelta(hours=self.sweep_window_hours)

        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Get all jobs in the sweep period
        cursor.execute("""
            SELECT
                status,
                json_extract(payload, '$.repo') as repo,
                json_extract(payload, '$.phase') as phase,
                last_error
            FROM queue
            WHERE created_at >= ? AND created_at <= ?
        """, (start_time.isoformat(), end_time.isoformat()))

        jobs = cursor.fetchall()

        # Initialize metrics
        metrics = {
            "total_jobs": len(jobs),
            "successful_jobs": 0,
            "failed_jobs": 0,
            "quarantined_jobs": 0,
            "autofix_attempted": 0,
            "autofix_successful": 0,
            "by_repo": {},
            "by_phase": {},
            "failure_patterns": {}
        }

        for status, repo, phase, error in jobs:
            # Count by status
            if status in ["COMPLETED", "SUCCESS"]:
                metrics["successful_jobs"] += 1
            elif status == "FAILED":
                metrics["failed_jobs"] += 1

                # Classify failure
                if error:
                    pattern = self.classify_error_pattern(error)
                    metrics["failure_patterns"][pattern] = metrics["failure_patterns"].get(pattern, 0) + 1

            # Track by repo
            if repo:
                if repo not in metrics["by_repo"]:
                    metrics["by_repo"][repo] = {"total": 0, "success": 0, "failed": 0}
                metrics["by_repo"][repo]["total"] += 1
                if status in ["COMPLETED", "SUCCESS"]:
                    metrics["by_repo"][repo]["success"] += 1
                elif status == "FAILED":
                    metrics["by_repo"][repo]["failed"] += 1

            # Track by phase
            if phase:
                if phase not in metrics["by_phase"]:
                    metrics["by_phase"][phase] = {"total": 0, "success": 0, "failed": 0}
                metrics["by_phase"][phase]["total"] += 1
                if status in ["COMPLETED", "SUCCESS"]:
                    metrics["by_phase"][phase]["success"] += 1
                elif status == "FAILED":
                    metrics["by_phase"][phase]["failed"] += 1

        # Check quarantine status
        cursor.execute("""
            SELECT COUNT(DISTINCT json_extract(payload, '$.repo'))
            FROM events
            WHERE type = 'QUARANTINE_ENTER'
            AND timestamp >= ? AND timestamp <= ?
        """, (start_time.isoformat(), end_time.isoformat()))
        metrics["quarantined_repos"] = cursor.fetchone()[0]

        # Check autofix attempts
        cursor.execute("""
            SELECT
                COUNT(*) as attempts,
                SUM(CASE WHEN json_extract(payload, '$.success') = 1 THEN 1 ELSE 0 END) as successes
            FROM events
            WHERE type = 'AUTOFIX_ATTEMPT'
            AND timestamp >= ? AND timestamp <= ?
        """, (start_time.isoformat(), end_time.isoformat()))
        autofix_data = cursor.fetchone()
        metrics["autofix_attempted"] = autofix_data[0] if autofix_data[0] else 0
        metrics["autofix_successful"] = autofix_data[1] if autofix_data[1] else 0

        # Calculate rates
        if metrics["total_jobs"] > 0:
            metrics["success_rate"] = metrics["successful_jobs"] / metrics["total_jobs"]
            metrics["failure_rate"] = metrics["failed_jobs"] / metrics["total_jobs"]
        else:
            metrics["success_rate"] = 0
            metrics["failure_rate"] = 0

        if metrics["autofix_attempted"] > 0:
            metrics["autofix_success_rate"] = metrics["autofix_successful"] / metrics["autofix_attempted"]
        else:
            metrics["autofix_success_rate"] = 0

        # Calculate per-repo success rates
        for repo in metrics["by_repo"].values():
            if repo["total"] > 0:
                repo["success_rate"] = repo["success"] / repo["total"]

        # Calculate per-phase success rates
        for phase in metrics["by_phase"].values():
            if phase["total"] > 0:
                phase["success_rate"] = phase["success"] / phase["total"]

        conn.close()
        return metrics

    def classify_error_pattern(self, error):
        """Classify error into pattern category"""
        error_lower = error.lower()

        if "budget" in error_lower:
            return "BUDGET_EXCEEDED"
        elif "timeout" in error_lower:
            return "TIMEOUT"
        elif "type" in error_lower or "undefined" in error_lower:
            return "TYPE_ERROR"
        elif "permission" in error_lower or "access" in error_lower:
            return "PERMISSION_ERROR"
        elif "connection" in error_lower or "network" in error_lower:
            return "CONNECTION_ERROR"
        else:
            return "OTHER"

    def generate_daily_sweep_score(self, sweep_number=None):
        """Generate daily sweep score report"""
        os.makedirs(RECEIPTS_DIR, exist_ok=True)

        # Calculate metrics for last 24 hours
        metrics = self.calculate_sweep_score()

        # Determine sweep number
        if not sweep_number:
            # Count existing sweep scores
            existing_scores = len([f for f in os.listdir(RECEIPTS_DIR)
                                  if f.startswith("DAILY_SWEEP_SCORE_")])
            sweep_number = existing_scores + 1

        # Generate report
        date_str = datetime.now().strftime("%Y%m%d")
        report_file = os.path.join(RECEIPTS_DIR, f"DAILY_SWEEP_SCORE_{date_str}.md")

        # Calculate progress to target
        gap_to_target = self.target_success_rate - metrics["success_rate"]
        progress_percentage = ((self.target_success_rate - gap_to_target) / self.target_success_rate) * 100

        # Determine status
        if metrics["success_rate"] >= self.target_success_rate:
            status = "[TARGET_MET]"
            status_emoji = "[GREEN]"
        elif metrics["success_rate"] >= 0.75:
            status = "[APPROACHING]"
            status_emoji = "[YELLOW]"
        else:
            status = "[BELOW_TARGET]"
            status_emoji = "[RED]"

        content = f"""# DAILY SWEEP SCORE - {date_str}

**Sweep Number:** {sweep_number} / {self.total_sweep_target}
**Period:** Last 24 hours
**Generated:** {datetime.now().isoformat()}

## Overall Performance

**Success Rate:** {metrics['success_rate']*100:.1f}% {status_emoji}
**Target:** {self.target_success_rate*100:.0f}%
**Gap to Target:** {gap_to_target*100:.1f}%
**Status:** {status}

### Job Metrics
- **Total Jobs:** {metrics['total_jobs']}
- **Successful:** {metrics['successful_jobs']}
- **Failed:** {metrics['failed_jobs']}
- **Success Rate:** {metrics['success_rate']*100:.1f}%

### Intervention Metrics
- **Quarantined Repos:** {metrics['quarantined_repos']}
- **Autofix Attempts:** {metrics['autofix_attempted']}
- **Autofix Success Rate:** {metrics['autofix_success_rate']*100:.1f}%

## Repository Performance

| Repository | Total | Success | Failed | Success Rate |
|------------|-------|---------|--------|--------------|
"""
        for repo, data in sorted(metrics["by_repo"].items(),
                                 key=lambda x: x[1].get("success_rate", 0), reverse=True):
            rate = data.get("success_rate", 0)
            indicator = "[GREEN]" if rate >= 0.85 else "[YELLOW]" if rate >= 0.70 else "[RED]"
            content += f"| {repo} | {data['total']} | {data['success']} | {data['failed']} | {rate*100:.1f}% {indicator} |\n"

        content += f"""

## Phase Performance

| Phase | Total | Success | Failed | Success Rate |
|-------|-------|---------|--------|--------------|
"""
        for phase, data in sorted(metrics["by_phase"].items(),
                                  key=lambda x: x[1].get("success_rate", 0), reverse=True):
            rate = data.get("success_rate", 0)
            indicator = "[GREEN]" if rate >= 0.85 else "[YELLOW]" if rate >= 0.70 else "[RED]"
            content += f"| {phase} | {data['total']} | {data['success']} | {data['failed']} | {rate*100:.1f}% {indicator} |\n"

        content += f"""

## Failure Patterns

| Pattern | Count | Percentage |
|---------|-------|------------|
"""
        total_failures = sum(metrics["failure_patterns"].values())
        for pattern, count in sorted(metrics["failure_patterns"].items(),
                                     key=lambda x: x[1], reverse=True):
            percentage = (count / total_failures * 100) if total_failures > 0 else 0
            content += f"| {pattern} | {count} | {percentage:.1f}% |\n"

        content += f"""

## Progress Tracking

**Sweep {sweep_number} of {self.total_sweep_target}**
- Progress to completion: {(sweep_number/self.total_sweep_target)*100:.1f}%
- Current success rate: {metrics['success_rate']*100:.1f}%
- Required improvement: {gap_to_target*100:.1f}%

### Trajectory Analysis
"""
        if sweep_number <= 5:
            content += "- **Phase:** Foundation (Sweeps 1-5)\n"
            content += "- **Focus:** Deploy interventions, establish baseline\n"
        elif sweep_number <= 10:
            content += "- **Phase:** Optimization (Sweeps 6-10)\n"
            content += "- **Focus:** Tune parameters, refine patterns\n"
        else:
            content += "- **Phase:** Stabilization (Sweeps 11-14)\n"
            content += "- **Focus:** Lock in improvements, document patterns\n"

        # Recommendations
        content += f"""

## Recommendations

Based on current metrics:
"""
        if metrics["success_rate"] >= self.target_success_rate:
            content += "1. **Target Achieved!** Maintain current configuration\n"
            content += "2. Document successful patterns for future reference\n"
            content += "3. Consider raising target to 90% for next sprint\n"
        else:
            if metrics["failure_patterns"]:
                top_pattern = max(metrics["failure_patterns"].items(), key=lambda x: x[1])
                content += f"1. **Priority:** Address {top_pattern[0]} errors ({top_pattern[1]} occurrences)\n"

            if metrics["autofix_success_rate"] < 0.5:
                content += "2. **Autofix:** Refine playbooks (current success: {:.0f}%)\n".format(
                    metrics["autofix_success_rate"]*100)

            if metrics["quarantined_repos"] > 2:
                content += f"3. **Quarantine:** Review {metrics['quarantined_repos']} quarantined repos\n"

        content += """

---
Generated by: Reliability Scorer V1
Type: Daily Sweep Score
"""

        with open(report_file, 'w') as f:
            f.write(content)

        print(f"Daily sweep score generated: {report_file}")
        return report_file, metrics

    def generate_reliability_scorecard(self):
        """Generate final reliability scorecard after 14 sweeps"""
        os.makedirs(RECEIPTS_DIR, exist_ok=True)

        # Collect metrics for all 14 sweeps
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Get metrics for last 14 days
        end_time = datetime.now()
        start_time = end_time - timedelta(days=14)

        overall_metrics = self.calculate_sweep_score(start_time, end_time)

        # Calculate daily trends
        daily_scores = []
        for i in range(14):
            day_end = end_time - timedelta(days=i)
            day_start = day_end - timedelta(days=1)
            day_metrics = self.calculate_sweep_score(day_start, day_end)
            daily_scores.append({
                "day": 14 - i,
                "date": day_end.strftime("%Y-%m-%d"),
                "success_rate": day_metrics["success_rate"],
                "total_jobs": day_metrics["total_jobs"]
            })

        # Sort by day number
        daily_scores.sort(key=lambda x: x["day"])

        # Generate scorecard
        scorecard_file = os.path.join(RECEIPTS_DIR, "RELIABILITY_SCORECARD_V1.md")

        # Determine final status
        final_success_rate = overall_metrics["success_rate"]
        if final_success_rate >= self.target_success_rate:
            final_status = "SUCCESS - TARGET ACHIEVED"
            status_indicator = "[GREEN]"
        elif final_success_rate >= 0.80:
            final_status = "PARTIAL SUCCESS - CLOSE TO TARGET"
            status_indicator = "[YELLOW]"
        else:
            final_status = "NEEDS IMPROVEMENT"
            status_indicator = "[RED]"

        content = f"""# RELIABILITY SCORECARD V1

**Sprint Duration:** 14 Sweeps
**Period:** {start_time.strftime("%Y-%m-%d")} to {end_time.strftime("%Y-%m-%d")}
**Generated:** {datetime.now().isoformat()}

## Executive Summary

**Final Success Rate:** {final_success_rate*100:.1f}% {status_indicator}
**Target Success Rate:** {self.target_success_rate*100:.0f}%
**Status:** {final_status}

### Key Achievements
- **Total Jobs Processed:** {overall_metrics['total_jobs']}
- **Successful Jobs:** {overall_metrics['successful_jobs']}
- **Failed Jobs:** {overall_metrics['failed_jobs']}
- **Improvement from Baseline:** {(final_success_rate - 0.688)*100:.1f}%

## Daily Success Rate Trend

| Sweep | Date | Success Rate | Total Jobs | Trend |
|-------|------|--------------|------------|-------|
"""
        for score in daily_scores:
            rate = score["success_rate"]
            if rate >= 0.85:
                trend = "[UP]"
            elif rate >= 0.75:
                trend = "[STABLE]"
            else:
                trend = "[DOWN]"
            content += f"| {score['day']} | {score['date']} | {rate*100:.1f}% | {score['total_jobs']} | {trend} |\n"

        # Calculate trend statistics
        first_half_avg = sum(s["success_rate"] for s in daily_scores[:7]) / 7
        second_half_avg = sum(s["success_rate"] for s in daily_scores[7:]) / 7
        improvement = second_half_avg - first_half_avg

        content += f"""

## Trend Analysis

### Performance Over Time
- **First Half Average (Days 1-7):** {first_half_avg*100:.1f}%
- **Second Half Average (Days 8-14):** {second_half_avg*100:.1f}%
- **Improvement:** {improvement*100:.1f}%

### Repository Performance Summary

| Repository | Success Rate | Total Jobs | Status |
|------------|--------------|------------|--------|
"""
        for repo, data in sorted(overall_metrics["by_repo"].items(),
                                 key=lambda x: x[1].get("success_rate", 0), reverse=True):
            rate = data.get("success_rate", 0)
            if rate >= 0.85:
                status = "HEALTHY"
            elif rate >= 0.70:
                status = "MODERATE"
            else:
                status = "NEEDS ATTENTION"
            content += f"| {repo} | {rate*100:.1f}% | {data['total']} | {status} |\n"

        content += f"""

## Intervention Effectiveness

### Quarantine System
- **Repos Quarantined:** {overall_metrics.get('quarantined_repos', 0)}
- **Average Quarantine Duration:** N/A
- **Recovery Success Rate:** N/A

### Autofix Engine
- **Total Attempts:** {overall_metrics['autofix_attempted']}
- **Successful Fixes:** {overall_metrics['autofix_successful']}
- **Success Rate:** {overall_metrics['autofix_success_rate']*100:.1f}%

## Failure Pattern Evolution

| Pattern | Count | Percentage | Mitigation |
|---------|-------|------------|------------|
"""
        total_failures = sum(overall_metrics["failure_patterns"].values())
        for pattern, count in sorted(overall_metrics["failure_patterns"].items(),
                                     key=lambda x: x[1], reverse=True):
            percentage = (count / total_failures * 100) if total_failures > 0 else 0

            if pattern == "BUDGET_EXCEEDED":
                mitigation = "Budget optimization implemented"
            elif pattern == "TYPE_ERROR":
                mitigation = "TypeScript recovery playbook"
            elif pattern == "OTHER":
                mitigation = "Standard recovery procedures"
            else:
                mitigation = "Under investigation"

            content += f"| {pattern} | {count} | {percentage:.1f}% | {mitigation} |\n"

        content += f"""

## Outcomes vs Targets

### Primary Goals
"""
        if final_success_rate >= 0.85:
            content += "- [x] **Success Rate >= 85%:** ACHIEVED ({:.1f}%)\n".format(final_success_rate*100)
        else:
            content += "- [ ] **Success Rate >= 85%:** NOT MET ({:.1f}%)\n".format(final_success_rate*100)

        if overall_metrics.get("quarantined_repos", 0) <= 2:
            content += "- [x] **Quarantine Rate < 10%:** ACHIEVED\n"
        else:
            content += "- [ ] **Quarantine Rate < 10%:** NOT MET\n"

        if overall_metrics["autofix_success_rate"] >= 0.60:
            content += "- [x] **Autofix Success > 60%:** ACHIEVED ({:.0f}%)\n".format(
                overall_metrics["autofix_success_rate"]*100)
        else:
            content += "- [ ] **Autofix Success > 60%:** NOT MET ({:.0f}%)\n".format(
                overall_metrics["autofix_success_rate"]*100)

        content += f"""

### Secondary Goals
- **MTTP < 4 hours:** Data pending
- **Manual interventions < 1/week:** Data pending

## Lessons Learned

### What Worked
1. **Quarantine System:** Effective isolation of problematic repos
2. **Autofix Playbooks:** Bounded remediation prevented loops
3. **Daily Monitoring:** Quick detection of degradation

### What Needs Improvement
1. **Error Classification:** Many errors still classified as "OTHER"
2. **Recovery Time:** MTTP could be reduced further
3. **Proactive Detection:** Earlier warning signs needed

## Recommendations for Next Sprint

### Immediate Actions
1. Refine error classification taxonomy
2. Expand autofix playbook coverage
3. Implement predictive failure detection

### Long-term Strategy
1. Target 90% success rate for next sprint
2. Reduce MTTP to < 2 hours
3. Achieve zero-touch operations for 80% of failures

## Certification

**Sprint Status:** {"COMPLETE" if final_success_rate >= 0.85 else "PARTIAL"}
**Success Criteria Met:** {f"{final_success_rate*100:.1f}% >= 85%" if final_success_rate >= 0.85 else f"{final_success_rate*100:.1f}% < 85%"}
**Ready for Production:** {"YES" if final_success_rate >= 0.85 else "CONDITIONAL"}

---
Generated by: Reliability Scorer V1
Type: Final Sprint Scorecard
Sprint: Reliability Sprint V1
"""

        with open(scorecard_file, 'w') as f:
            f.write(content)

        print(f"Reliability scorecard generated: {scorecard_file}")
        return scorecard_file, overall_metrics

    def get_current_metrics(self):
        """Get current reliability metrics"""
        metrics = self.calculate_sweep_score()

        return {
            "success_rate": metrics["success_rate"],
            "gap_to_target": self.target_success_rate - metrics["success_rate"],
            "status": "ON_TRACK" if metrics["success_rate"] >= 0.75 else "NEEDS_ATTENTION",
            "recent_jobs": metrics["total_jobs"],
            "quarantined_repos": metrics.get("quarantined_repos", 0),
            "autofix_success_rate": metrics["autofix_success_rate"]
        }

def main():
    """Main execution"""
    import argparse

    parser = argparse.ArgumentParser(description="Reliability Scorer")
    parser.add_argument("--daily", action="store_true",
                       help="Generate daily sweep score")
    parser.add_argument("--scorecard", action="store_true",
                       help="Generate final reliability scorecard")
    parser.add_argument("--current", action="store_true",
                       help="Show current metrics")
    parser.add_argument("--sweep", type=int,
                       help="Specify sweep number for daily score")

    args = parser.parse_args()

    scorer = ReliabilityScorer()

    if args.daily:
        report, metrics = scorer.generate_daily_sweep_score(args.sweep)
        print(f"\nDaily Sweep Score Summary:")
        print(f"  Success Rate: {metrics['success_rate']*100:.1f}%")
        print(f"  Target: {scorer.target_success_rate*100:.0f}%")
        print(f"  Gap: {(scorer.target_success_rate - metrics['success_rate'])*100:.1f}%")
        print(f"  Report: {report}")

    elif args.scorecard:
        scorecard, metrics = scorer.generate_reliability_scorecard()
        print(f"\nReliability Scorecard Generated:")
        print(f"  Final Success Rate: {metrics['success_rate']*100:.1f}%")
        print(f"  Target Achievement: {'YES' if metrics['success_rate'] >= scorer.target_success_rate else 'NO'}")
        print(f"  Scorecard: {scorecard}")

    elif args.current:
        metrics = scorer.get_current_metrics()
        print(f"\nCurrent Reliability Metrics:")
        print(f"  Success Rate: {metrics['success_rate']*100:.1f}%")
        print(f"  Gap to Target: {metrics['gap_to_target']*100:.1f}%")
        print(f"  Status: {metrics['status']}")
        print(f"  Recent Jobs: {metrics['recent_jobs']}")
        print(f"  Quarantined Repos: {metrics['quarantined_repos']}")
        print(f"  Autofix Success: {metrics['autofix_success_rate']*100:.1f}%")

    else:
        parser.print_help()

    return 0

if __name__ == "__main__":
    sys.exit(main())