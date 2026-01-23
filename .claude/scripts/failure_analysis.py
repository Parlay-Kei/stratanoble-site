#!/usr/bin/env python3
"""
Failure Analysis - Generate comprehensive failure taxonomy
Analyzes anx_state.db to identify patterns and classify failures
"""

import os
import json
import sqlite3
from datetime import datetime, timedelta
from collections import Counter, defaultdict

ANX_ROOT = r"C:\Dev\.claude-anx"
DB_PATH = os.path.join(ANX_ROOT, "state", "anx_state.db")
RECEIPTS_DIR = os.path.join(ANX_ROOT, "receipts")

class FailureAnalyzer:
    def __init__(self):
        self.analysis_date = datetime.now()
        self.failures = {
            "exception_codes": Counter(),
            "failing_repos": Counter(),
            "failing_services": Counter(),
            "failure_classes": {
                "ENV_TOOLING": [],
                "CODE_TEST": [],
                "POLICY": []
            },
            "mttp_by_repo": {},  # Mean Time To PASS
            "total_failures": 0,
            "total_jobs": 0
        }

    def get_db_connection(self):
        return sqlite3.connect(DB_PATH)

    def analyze_exception_codes(self):
        """Analyze top exception codes and patterns"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Get all failures from last 30 days for comprehensive analysis
        cutoff = (self.analysis_date - timedelta(days=30)).isoformat()

        cursor.execute("""
            SELECT last_error, payload, created_at
            FROM queue
            WHERE status = 'FAILED'
            AND created_at >= ?
        """, (cutoff,))

        for row in cursor.fetchall():
            error, payload_json, created = row
            if error:
                # Classify error
                error_code = self.classify_error(error)
                self.failures["exception_codes"][error_code] += 1

                # Classify failure class
                failure_class = self.classify_failure_class(error, payload_json)
                self.failures["failure_classes"][failure_class].append({
                    "error": error[:200],
                    "timestamp": created
                })

                self.failures["total_failures"] += 1

        # Count total jobs
        cursor.execute("""
            SELECT COUNT(*) FROM queue
            WHERE created_at >= ?
        """, (cutoff,))
        self.failures["total_jobs"] = cursor.fetchone()[0]

        conn.close()

    def classify_error(self, error):
        """Classify error into standard categories"""
        error_lower = error.lower()

        if "timeout" in error_lower:
            return "TIMEOUT"
        elif "budget" in error_lower:
            return "BUDGET_EXCEEDED"
        elif "permission" in error_lower or "access" in error_lower:
            return "PERMISSION_DENIED"
        elif "connection" in error_lower or "network" in error_lower:
            return "CONNECTION_ERROR"
        elif "not found" in error_lower or "enoent" in error_lower:
            return "FILE_NOT_FOUND"
        elif "memory" in error_lower or "heap" in error_lower:
            return "OUT_OF_MEMORY"
        elif "disk" in error_lower or "space" in error_lower:
            return "DISK_FULL"
        elif "auth" in error_lower or "credential" in error_lower:
            return "AUTHENTICATION_ERROR"
        elif "rate limit" in error_lower:
            return "RATE_LIMITED"
        elif "syntax" in error_lower or "parse" in error_lower:
            return "SYNTAX_ERROR"
        elif "test" in error_lower or "assertion" in error_lower:
            return "TEST_FAILURE"
        elif "build" in error_lower or "compile" in error_lower:
            return "BUILD_ERROR"
        elif "type" in error_lower or "undefined" in error_lower:
            return "TYPE_ERROR"
        elif "module" in error_lower or "import" in error_lower:
            return "MODULE_ERROR"
        else:
            return "OTHER"

    def classify_failure_class(self, error, payload_json):
        """Classify into ENV/TOOLING vs CODE/TEST vs POLICY"""
        error_lower = error.lower()

        # Parse payload if possible
        try:
            payload = json.loads(payload_json) if payload_json else {}
        except:
            payload = {}

        # ENV/TOOLING failures
        env_keywords = ["timeout", "connection", "network", "permission", "access",
                       "file not found", "enoent", "memory", "disk", "auth",
                       "credential", "rate limit", "module not found"]
        if any(keyword in error_lower for keyword in env_keywords):
            return "ENV_TOOLING"

        # CODE/TEST failures
        code_keywords = ["test", "assertion", "expect", "failed", "syntax", "parse",
                        "type error", "undefined", "null", "build error", "compile"]
        if any(keyword in error_lower for keyword in code_keywords):
            return "CODE_TEST"

        # POLICY failures
        policy_keywords = ["policy", "blocked", "quarantine", "degraded", "budget",
                          "limit", "threshold", "cap"]
        if any(keyword in error_lower for keyword in policy_keywords):
            return "POLICY"

        # Default to CODE_TEST if unclear
        return "CODE_TEST"

    def analyze_failing_repos(self):
        """Identify which repos fail most often"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Look for repo indicators in payload
        cursor.execute("""
            SELECT payload, COUNT(*) as fail_count
            FROM queue
            WHERE status = 'FAILED'
            GROUP BY json_extract(payload, '$.repo')
        """)

        for row in cursor.fetchall():
            payload_json, count = row
            if payload_json:
                try:
                    payload = json.loads(payload_json)
                    repo = payload.get("repo") or self.extract_repo_from_path(payload)
                    if repo:
                        self.failures["failing_repos"][repo] = count
                except:
                    pass

        conn.close()

    def extract_repo_from_path(self, payload):
        """Extract repo name from command or path"""
        command = payload.get("command", "")
        path = payload.get("path", "")

        # Check for known repo patterns
        repos = ["DirectCuts", "DirectCuts-iOS", "DSLV", "msaudreys-house", "StrataNoble"]
        for repo in repos:
            if repo in command or repo in path:
                return repo

        # Try to extract from paths
        if "DC_IOS" in command or "DC_IOS" in path:
            return "DirectCuts-iOS"
        elif "DC" in command or "DC" in path:
            return "DirectCuts"
        elif "MAH" in command or "MAH" in path:
            return "msaudreys-house"
        elif "SN" in command or "SN" in path:
            return "StrataNoble"

        return None

    def analyze_failing_services(self):
        """Identify which services fail most often"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Extract service from payload
        cursor.execute("""
            SELECT payload
            FROM queue
            WHERE status = 'FAILED'
        """)

        for row in cursor.fetchall():
            payload_json = row[0]
            if payload_json:
                try:
                    payload = json.loads(payload_json)
                    service = payload.get("service") or self.extract_service(payload)
                    if service:
                        self.failures["failing_services"][service] += 1
                except:
                    pass

        conn.close()

    def extract_service(self, payload):
        """Extract service type from payload"""
        command = payload.get("command", "").lower()
        type_field = payload.get("type", "").lower()

        if "test" in command:
            return "testing"
        elif "build" in command:
            return "build"
        elif "lint" in command or "validate" in command:
            return "validation"
        elif "deploy" in command:
            return "deployment"
        elif "health" in command:
            return "health_check"
        elif "receipt" in command or "report" in command:
            return "reporting"
        elif type_field:
            return type_field
        else:
            return "unknown"

    def calculate_mttp(self):
        """Calculate Mean Time To PASS per repo"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Get failure to success transitions
        cursor.execute("""
            SELECT
                json_extract(payload, '$.repo') as repo,
                created_at,
                status
            FROM queue
            WHERE status IN ('FAILED', 'COMPLETED')
            ORDER BY created_at
        """)

        repo_failures = defaultdict(list)
        repo_recoveries = defaultdict(list)

        prev_status = {}
        for row in cursor.fetchall():
            repo, timestamp, status = row
            if not repo:
                continue

            if repo in prev_status:
                if prev_status[repo] == "FAILED" and status == "COMPLETED":
                    # Recovery detected
                    failure_time = repo_failures[repo][-1] if repo_failures[repo] else timestamp
                    recovery_time = datetime.fromisoformat(timestamp)
                    failure_dt = datetime.fromisoformat(failure_time)
                    time_to_pass = (recovery_time - failure_dt).total_seconds() / 3600
                    repo_recoveries[repo].append(time_to_pass)

            if status == "FAILED":
                repo_failures[repo].append(timestamp)

            prev_status[repo] = status

        # Calculate mean
        for repo, recovery_times in repo_recoveries.items():
            if recovery_times:
                self.failures["mttp_by_repo"][repo] = {
                    "mean_hours": round(sum(recovery_times) / len(recovery_times), 2),
                    "recovery_count": len(recovery_times)
                }

        conn.close()

    def generate_taxonomy_report(self):
        """Generate the failure taxonomy report"""
        # Run all analyses
        self.analyze_exception_codes()
        self.analyze_failing_repos()
        self.analyze_failing_services()
        self.calculate_mttp()

        # Calculate class distribution
        class_counts = {
            "ENV_TOOLING": len(self.failures["failure_classes"]["ENV_TOOLING"]),
            "CODE_TEST": len(self.failures["failure_classes"]["CODE_TEST"]),
            "POLICY": len(self.failures["failure_classes"]["POLICY"])
        }
        total_classified = sum(class_counts.values())

        # Generate report
        report_path = os.path.join(RECEIPTS_DIR, "FAILURE_TAXONOMY_V1.md")

        content = f"""# FAILURE TAXONOMY V1

**Generated:** {self.analysis_date.isoformat()}
**Analysis Period:** Last 30 days
**Total Jobs:** {self.failures["total_jobs"]}
**Total Failures:** {self.failures["total_failures"]}
**Failure Rate:** {(self.failures["total_failures"] / self.failures["total_jobs"] * 100) if self.failures["total_jobs"] > 0 else 0:.1f}%

## Top Exception Codes (Count)

| Exception Code | Count | Percentage |
|----------------|-------|------------|
"""
        total_exceptions = sum(self.failures["exception_codes"].values())
        for code, count in self.failures["exception_codes"].most_common(10):
            percentage = (count / total_exceptions * 100) if total_exceptions > 0 else 0
            content += f"| {code} | {count} | {percentage:.1f}% |\n"

        content += f"""

## Top Failing Repos (Count)

| Repository | Failures | MTTP (hours) |
|------------|----------|--------------|
"""
        for repo, count in self.failures["failing_repos"].most_common(5):
            mttp_data = self.failures["mttp_by_repo"].get(repo, {})
            mttp = mttp_data.get("mean_hours", "N/A")
            content += f"| {repo} | {count} | {mttp} |\n"

        content += f"""

## Top Failing Services (Count)

| Service | Failures |
|---------|----------|
"""
        for service, count in self.failures["failing_services"].most_common(5):
            content += f"| {service} | {count} |\n"

        content += f"""

## Failure Class Distribution

| Class | Count | Percentage |
|-------|-------|------------|
"""
        for class_name, count in class_counts.items():
            percentage = (count / total_classified * 100) if total_classified > 0 else 0
            content += f"| {class_name} | {count} | {percentage:.1f}% |\n"

        content += f"""

### ENV/TOOLING Failures
Common patterns: timeout, connection errors, permission issues, missing files
- **Count:** {class_counts["ENV_TOOLING"]}
- **Primary causes:** Infrastructure issues, environment configuration, external dependencies

### CODE/TEST Failures
Common patterns: test failures, build errors, type errors, syntax issues
- **Count:** {class_counts["CODE_TEST"]}
- **Primary causes:** Code bugs, test flakiness, breaking changes

### POLICY Failures
Common patterns: budget exceeded, rate limits, quarantine blocks
- **Count:** {class_counts["POLICY"]}
- **Primary causes:** Resource constraints, safety mechanisms, policy violations

## Mean Time To PASS (MTTP) by Repo

| Repository | MTTP (hours) | Recovery Count |
|------------|--------------|----------------|
"""
        for repo, data in sorted(self.failures["mttp_by_repo"].items(),
                                 key=lambda x: x[1]["mean_hours"]):
            content += f"| {repo} | {data['mean_hours']} | {data['recovery_count']} |\n"

        content += f"""

## Key Insights

### Failure Patterns
1. **Most common failure:** {self.failures["exception_codes"].most_common(1)[0][0] if self.failures["exception_codes"] else "None"}
2. **Most problematic repo:** {self.failures["failing_repos"].most_common(1)[0][0] if self.failures["failing_repos"] else "None"}
3. **Most failing service:** {self.failures["failing_services"].most_common(1)[0][0] if self.failures["failing_services"] else "None"}

### Reliability Metrics
- **Current Success Rate:** {100 - (self.failures["total_failures"] / self.failures["total_jobs"] * 100) if self.failures["total_jobs"] > 0 else 0:.1f}%
- **Target Success Rate:** 85%
- **Gap to Target:** {85 - (100 - (self.failures["total_failures"] / self.failures["total_jobs"] * 100)) if self.failures["total_jobs"] > 0 else 85:.1f}%

### Recommended Focus Areas
1. Address {self.failures["exception_codes"].most_common(1)[0][0] if self.failures["exception_codes"] else "unknown"} errors (highest volume)
2. Fix environment/tooling issues ({class_counts["ENV_TOOLING"]} failures)
3. Implement autofix for recurring patterns

---
Generated by: Failure Analysis Engine
Type: Reliability Sprint V1
"""

        os.makedirs(RECEIPTS_DIR, exist_ok=True)
        with open(report_path, 'w') as f:
            f.write(content)

        print(f"Failure taxonomy report generated: {report_path}")
        return report_path, self.failures

def main():
    """Generate failure taxonomy"""
    analyzer = FailureAnalyzer()
    report_path, failures = analyzer.generate_taxonomy_report()

    # Print summary
    print("\nFailure Analysis Summary:")
    print(f"  Total Failures: {failures['total_failures']}")
    print(f"  Total Jobs: {failures['total_jobs']}")

    if failures['exception_codes']:
        top_code = failures['exception_codes'].most_common(1)[0]
        print(f"  Top Exception: {top_code[0]} ({top_code[1]} occurrences)")

    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())