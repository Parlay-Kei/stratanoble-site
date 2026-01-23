#!/usr/bin/env python3
"""
Failure Analysis V2 - Deterministic failure classification with no OTHER category
Implements 6 specific categories: ENV_TOOLING, CODE_TEST, POLICY_BLOCK, RUNTIME, PROOF, UNCLASSIFIED
"""

import os
import json
import sqlite3
from datetime import datetime, timedelta
from collections import Counter, defaultdict

ANX_ROOT = r"C:\Dev\.claude-anx"
DB_PATH = os.path.join(ANX_ROOT, "state", "anx_state.db")
RECEIPTS_DIR = os.path.join(ANX_ROOT, "receipts")

class FailureAnalyzerV2:
    def __init__(self):
        self.analysis_date = datetime.now()
        self.failures = {
            "exception_codes": Counter(),
            "failing_repos": Counter(),
            "failing_services": Counter(),
            "failure_classes": {
                "ENV_TOOLING": [],
                "CODE_TEST": [],
                "POLICY_BLOCK": [],
                "RUNTIME": [],
                "PROOF": [],
                "UNCLASSIFIED": []
            },
            "unclassified_details": [],  # Store raw signatures
            "mttp_by_repo": {},
            "total_failures": 0,
            "total_jobs": 0
        }

        # Define keyword sets for classification
        self.classification_keywords = {
            "ENV_TOOLING": [
                "timeout", "connection", "network", "permission", "access",
                "file not found", "enoent", "eacces", "module not found",
                "cannot find module", "npm", "pip", "yarn", "dependency",
                "econnrefused", "econnreset", "etimedout", "dns",
                "is not recognized as an internal or external command",
                "not recognized as", "command not found", "executable not found"
            ],
            "CODE_TEST": [
                "test", "assertion", "expect", "jest", "vitest", "playwright",
                "syntax error", "type error", "undefined", "null", "cannot read",
                "failed", "spec", "describe", "it(", "test(", "lint", "eslint",
                "typescript", "tsc", "compilation", "build error"
            ],
            "POLICY_BLOCK": [
                "policy", "blocked", "quarantine", "degraded", "budget",
                "limit", "threshold", "cap", "exceeded", "rate limit",
                "quota", "restricted", "forbidden", "unauthorized"
            ],
            "RUNTIME": [
                "memory", "heap", "stack", "segfault", "oom", "cpu",
                "disk full", "no space", "enospc", "out of memory",
                "maximum call stack", "stack overflow", "killed", "sigkill"
            ],
            "PROOF": [
                "proof", "validation", "receipt", "verification", "witness",
                "artifact", "attestation", "evidence", "manifest", "checksum",
                "signature", "hash mismatch", "integrity"
            ]
        }

    def get_db_connection(self):
        return sqlite3.connect(DB_PATH)

    def classify_failure_deterministic(self, error_message, stderr=None, service_id=None, repo_id=None):
        """Deterministically classify failure into one of 6 categories"""
        if not error_message:
            error_message = ""

        error_lower = error_message.lower()

        # Check each category in order of specificity
        for category, keywords in self.classification_keywords.items():
            if any(keyword in error_lower for keyword in keywords):
                return category

        # If no match, it's UNCLASSIFIED - store raw data
        unclassified_data = {
            "category": "UNCLASSIFIED",
            "raw_signature": error_message[:500],
            "stderr_excerpt": stderr[-1000:] if stderr else "",
            "service_id": service_id or "unknown",
            "repo_id": repo_id or "unknown",
            "timestamp": datetime.now().isoformat(),
            "full_error": error_message  # Store full error for analysis
        }

        # Store for later analysis
        self.failures["unclassified_details"].append(unclassified_data)

        return "UNCLASSIFIED"

    def analyze_failures(self):
        """Analyze all failures with new classification system"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Get all failures from last 30 days
        cutoff = (self.analysis_date - timedelta(days=30)).isoformat()

        cursor.execute("""
            SELECT
                id,
                last_error,
                payload,
                created_at,
                status
            FROM queue
            WHERE status IN ('FAILED', 'TIMEOUT', 'CRASH')
            AND created_at >= ?
        """, (cutoff,))

        for row in cursor.fetchall():
            job_id, error, payload_json, created, status = row

            # Parse payload for context
            try:
                payload = json.loads(payload_json) if payload_json else {}
            except:
                payload = {}

            service_id = payload.get("service") or self.extract_service(payload)
            repo_id = payload.get("repo") or self.extract_repo_from_path(payload)

            # Get stderr if available (would need to be stored in DB)
            stderr = None  # Placeholder - would retrieve from logs

            if error:
                # Classify with new system
                category = self.classify_failure_deterministic(error, stderr, service_id, repo_id)

                # Track by category
                self.failures["failure_classes"][category].append({
                    "job_id": job_id,
                    "error": error[:200],
                    "timestamp": created,
                    "service": service_id,
                    "repo": repo_id
                })

                # Track failure code (more specific than category)
                error_code = self.extract_error_code(error)
                self.failures["exception_codes"][error_code] += 1

                self.failures["total_failures"] += 1

            # Track by service
            if service_id:
                self.failures["failing_services"][service_id] += 1

            # Track by repo
            if repo_id:
                self.failures["failing_repos"][repo_id] += 1

        # Count total jobs
        cursor.execute("""
            SELECT COUNT(*) FROM queue
            WHERE created_at >= ?
        """, (cutoff,))
        self.failures["total_jobs"] = cursor.fetchone()[0]

        conn.close()

    def extract_error_code(self, error):
        """Extract specific error code from error message"""
        error_lower = error.lower()

        # Specific error codes
        if "enoent" in error_lower:
            return "ENOENT"
        elif "eacces" in error_lower:
            return "EACCES"
        elif "econnrefused" in error_lower:
            return "ECONNREFUSED"
        elif "etimedout" in error_lower:
            return "ETIMEDOUT"
        elif "oom" in error_lower or "out of memory" in error_lower:
            return "OUT_OF_MEMORY"
        elif "budget" in error_lower and "exceeded" in error_lower:
            return "BUDGET_EXCEEDED"
        elif "timeout" in error_lower:
            return "TIMEOUT"
        elif "type error" in error_lower:
            return "TYPE_ERROR"
        elif "syntax error" in error_lower:
            return "SYNTAX_ERROR"
        elif "test failed" in error_lower or "assertion" in error_lower:
            return "TEST_FAILURE"
        elif "build" in error_lower and "fail" in error_lower:
            return "BUILD_ERROR"
        elif "permission" in error_lower:
            return "PERMISSION_DENIED"
        elif "rate limit" in error_lower:
            return "RATE_LIMITED"
        elif "disk" in error_lower and "full" in error_lower:
            return "DISK_FULL"
        elif "network" in error_lower:
            return "NETWORK_ERROR"
        else:
            # Extract first error-like pattern
            import re
            error_pattern = re.search(r'[A-Z][A-Z_]+(?:ERROR|FAIL|EXCEPTION)', error)
            if error_pattern:
                return error_pattern.group(0)
            else:
                return "GENERIC_ERROR"

    def extract_service(self, payload):
        """Extract service type from payload"""
        command = payload.get("command", "").lower()
        type_field = payload.get("type", "").lower()
        phase = payload.get("phase", "").lower()

        if phase:
            if "test" in phase:
                return "testing"
            elif "build" in phase:
                return "build"
            elif "validate" in phase or "lint" in phase:
                return "validation"
            elif "deploy" in phase:
                return "deployment"

        if "test" in command:
            return "testing"
        elif "build" in command:
            return "build"
        elif "lint" in command or "validate" in command:
            return "validation"
        elif "deploy" in command:
            return "deployment"
        elif type_field:
            return type_field
        else:
            return "unknown"

    def extract_repo_from_path(self, payload):
        """Extract repo name from command or path"""
        command = payload.get("command", "")
        path = payload.get("path", "")

        repos = ["DirectCuts", "DirectCuts-iOS", "DSLV", "msaudreys-house", "StrataNoble"]
        for repo in repos:
            if repo in command or repo in path:
                return repo

        # Check shortcuts
        if "DC_IOS" in command or "DC_IOS" in path:
            return "DirectCuts-iOS"
        elif "DC" in command or "DC" in path:
            return "DirectCuts"
        elif "MAH" in command or "MAH" in path:
            return "msaudreys-house"
        elif "SN" in command or "SN" in path:
            return "StrataNoble"

        return None

    def calculate_mttp(self):
        """Calculate Mean Time To PASS per repo"""
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                json_extract(payload, '$.repo') as repo,
                created_at,
                status
            FROM queue
            WHERE status IN ('FAILED', 'COMPLETED', 'PASS')
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
                if prev_status[repo] == "FAILED" and status in ["COMPLETED", "PASS"]:
                    # Recovery detected
                    failure_time = repo_failures[repo][-1] if repo_failures[repo] else timestamp
                    recovery_time = datetime.fromisoformat(timestamp)
                    failure_dt = datetime.fromisoformat(failure_time)
                    time_to_pass = (recovery_time - failure_dt).total_seconds() / 3600
                    repo_recoveries[repo].append(time_to_pass)

            if status == "FAILED":
                repo_failures[repo].append(timestamp)

            prev_status[repo] = status

        for repo, recovery_times in repo_recoveries.items():
            if recovery_times:
                self.failures["mttp_by_repo"][repo] = {
                    "mean_hours": round(sum(recovery_times) / len(recovery_times), 2),
                    "recovery_count": len(recovery_times)
                }

        conn.close()

    def generate_taxonomy_report_v2(self):
        """Generate updated failure taxonomy with no OTHER category"""
        # Run all analyses
        self.analyze_failures()
        self.calculate_mttp()

        # Calculate class distribution
        class_counts = {}
        for class_name, failures in self.failures["failure_classes"].items():
            class_counts[class_name] = len(failures)

        total_classified = sum(class_counts.values())

        # Generate report
        report_path = os.path.join(RECEIPTS_DIR, "FAILURE_TAXONOMY_V2.md")

        content = f"""# FAILURE TAXONOMY V2

**Generated:** {self.analysis_date.isoformat()}
**Analysis Period:** Last 30 days
**Total Jobs:** {self.failures["total_jobs"]}
**Total Failures:** {self.failures["total_failures"]}
**Failure Rate:** {(self.failures["total_failures"] / self.failures["total_jobs"] * 100) if self.failures["total_jobs"] > 0 else 0:.1f}%

## Deterministic Classification (NO OTHER)

| Category | Count | Percentage | Description |
|----------|-------|------------|-------------|
"""
        for category in ["ENV_TOOLING", "CODE_TEST", "POLICY_BLOCK", "RUNTIME", "PROOF", "UNCLASSIFIED"]:
            count = class_counts.get(category, 0)
            percentage = (count / total_classified * 100) if total_classified > 0 else 0

            if category == "ENV_TOOLING":
                desc = "Infrastructure, dependencies, network"
            elif category == "CODE_TEST":
                desc = "Test failures, build errors, linting"
            elif category == "POLICY_BLOCK":
                desc = "Budget, rate limits, quarantine"
            elif category == "RUNTIME":
                desc = "Memory, CPU, disk resources"
            elif category == "PROOF":
                desc = "Validation, receipts, attestation"
            else:  # UNCLASSIFIED
                desc = "Requires manual classification"

            content += f"| {category} | {count} | {percentage:.1f}% | {desc} |\n"

        content += f"""

## Exception Codes (Specific Errors)

| Error Code | Count | Percentage |
|------------|-------|------------|
"""
        total_exceptions = sum(self.failures["exception_codes"].values())
        for code, count in self.failures["exception_codes"].most_common(10):
            percentage = (count / total_exceptions * 100) if total_exceptions > 0 else 0
            content += f"| {code} | {count} | {percentage:.1f}% |\n"

        content += f"""

## UNCLASSIFIED Details

Total UNCLASSIFIED: {len(self.failures["unclassified_details"])}
"""

        if self.failures["unclassified_details"]:
            content += "\n### Sample UNCLASSIFIED Failures (Requires Manual Review)\n\n"
            for i, details in enumerate(self.failures["unclassified_details"][:3], 1):
                content += f"""
#### UNCLASSIFIED #{i}
- **Service:** {details['service_id']}
- **Repository:** {details['repo_id']}
- **Timestamp:** {details['timestamp']}
- **Raw Signature:** `{details['raw_signature']}`
- **Stderr Excerpt:** {details['stderr_excerpt'][:200] if details['stderr_excerpt'] else 'N/A'}
"""

        content += f"""

## Failing Repositories

| Repository | Failures | MTTP (hours) |
|------------|----------|--------------|
"""
        for repo, count in self.failures["failing_repos"].most_common(5):
            mttp_data = self.failures["mttp_by_repo"].get(repo, {})
            mttp = mttp_data.get("mean_hours", "N/A")
            content += f"| {repo} | {count} | {mttp} |\n"

        content += f"""

## Failing Services

| Service | Failures |
|---------|----------|
"""
        for service, count in self.failures["failing_services"].most_common(5):
            content += f"| {service} | {count} |\n"

        content += f"""

## Mean Time To PASS (MTTP)

| Repository | MTTP (hours) | Recovery Count |
|------------|--------------|----------------|
"""
        for repo, data in sorted(self.failures["mttp_by_repo"].items(),
                                 key=lambda x: x[1]["mean_hours"]):
            content += f"| {repo} | {data['mean_hours']} | {data['recovery_count']} |\n"

        content += f"""

## Classification Improvements

### Previous Issues (V1)
- **OTHER category:** 40% of failures were unclassified
- **Ambiguous:** No raw data captured for analysis

### Current State (V2)
- **Deterministic:** 6 specific categories, no OTHER
- **UNCLASSIFIED:** Captures raw signatures for manual review
- **Traceable:** Service and repo IDs preserved

## Key Insights

1. **Most Common Category:** {max(class_counts.items(), key=lambda x: x[1])[0] if class_counts else "None"}
2. **Most Common Error Code:** {self.failures["exception_codes"].most_common(1)[0][0] if self.failures["exception_codes"] else "None"}
3. **Most Problematic Repo:** {self.failures["failing_repos"].most_common(1)[0][0] if self.failures["failing_repos"] else "None"}
4. **UNCLASSIFIED Rate:** {(class_counts.get("UNCLASSIFIED", 0) / total_classified * 100) if total_classified > 0 else 0:.1f}%

---
Generated by: Failure Analysis Engine V2
Type: Deterministic Classification
"""

        os.makedirs(RECEIPTS_DIR, exist_ok=True)
        with open(report_path, 'w') as f:
            f.write(content)

        print(f"Failure taxonomy V2 generated: {report_path}")
        return report_path, self.failures

def main():
    """Generate failure taxonomy V2"""
    analyzer = FailureAnalyzerV2()
    report_path, failures = analyzer.generate_taxonomy_report_v2()

    # Print summary
    print("\nFailure Analysis V2 Summary:")
    print(f"  Total Failures: {failures['total_failures']}")
    print(f"  Total Jobs: {failures['total_jobs']}")
    print(f"  UNCLASSIFIED: {len(failures['unclassified_details'])}")

    if failures['exception_codes']:
        top_code = failures['exception_codes'].most_common(1)[0]
        print(f"  Top Error Code: {top_code[0]} ({top_code[1]} occurrences)")

    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())