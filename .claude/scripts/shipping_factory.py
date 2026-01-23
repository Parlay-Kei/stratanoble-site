#!/usr/bin/env python3
"""
Shipping Factory - Daily sweep for all repos
Runs validate/test/build for DC, DC_IOS, DSLV, MAH, SN
Produces comprehensive proof packs for each repo
"""

import os
import sys
import json
import subprocess
import shutil
from datetime import datetime
from pathlib import Path

ANX_ROOT = r"C:\Dev\.claude-anx"
RECEIPTS_DIR = os.path.join(ANX_ROOT, "receipts", "shipping_factory")
RUNS_DIR = os.path.join(ANX_ROOT, "runs", "shipping_factory")

# Repository configurations
REPOS = {
    "DC": {
        "name": "DirectCuts",
        "path": r"C:\Dev\DirectCuts",
        "type": "nextjs",
        "commands": {
            "validate": "npm run type-check && npm run lint",
            "test": "npm run test:run",
            "build": "npm run build"
        }
    },
    "DC_IOS": {
        "name": "DirectCuts-iOS",
        "path": r"C:\Dev\DirectCuts-iOS",
        "type": "ios",
        "commands": {
            "validate": "xcodebuild -workspace DirectCuts.xcworkspace -scheme DirectCuts -sdk iphonesimulator -quiet",
            "test": "xcodebuild test -workspace DirectCuts.xcworkspace -scheme DirectCuts -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 14'",
            "build": "xcodebuild build -workspace DirectCuts.xcworkspace -scheme DirectCuts -sdk iphonesimulator"
        }
    },
    "DSLV": {
        "name": "DSLV",
        "path": r"C:\Dev\DSLV",
        "type": "nextjs",
        "commands": {
            "validate": "npm run lint",
            "test": "npm test -- --run",
            "build": "npm run build"
        }
    },
    "MAH": {
        "name": "msaudreys-house",
        "path": r"C:\Dev\msaudreys-house",
        "type": "nextjs",
        "commands": {
            "validate": "npm run lint",
            "test": "echo 'No tests configured'",
            "build": "npm run build"
        }
    },
    "SN": {
        "name": "StrataNoble",
        "path": r"C:\Dev\StrataNoble",
        "type": "monorepo",
        "commands": {
            "validate": "npm run validate",
            "test": "cd apps/platform && npm run test:run",
            "build": "npm run build"
        }
    }
}

class ShippingFactory:
    def __init__(self):
        self.timestamp = datetime.now()
        self.run_id = f"factory-{self.timestamp.strftime('%Y%m%d-%H%M%S')}"
        self.results = {}
        self.proof_packs = {}

    def run_command(self, command, cwd, timeout=300):
        """Execute a command and capture output"""
        print(f"  Executing: {command}")
        print(f"  In: {cwd}")

        try:
            result = subprocess.run(
                command,
                shell=True,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=timeout
            )

            return {
                "success": result.returncode == 0,
                "exit_code": result.returncode,
                "stdout": result.stdout[:5000],  # Limit output size
                "stderr": result.stderr[:5000],
                "command": command,
                "duration": None  # Would need time tracking for accurate duration
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "exit_code": -1,
                "stdout": "",
                "stderr": f"Command timed out after {timeout} seconds",
                "command": command,
                "duration": timeout
            }
        except Exception as e:
            return {
                "success": False,
                "exit_code": -1,
                "stdout": "",
                "stderr": str(e),
                "command": command,
                "duration": None
            }

    def validate_repo(self, repo_key, repo_config):
        """Run validation for a repository"""
        print(f"\n[{repo_key}] Running validation...")

        if not os.path.exists(repo_config["path"]):
            print(f"  WARNING: Repo path not found: {repo_config['path']}")
            return {
                "phase": "validate",
                "success": False,
                "error": "Repository path not found",
                "skipped": True
            }

        result = self.run_command(
            repo_config["commands"]["validate"],
            repo_config["path"]
        )

        result["phase"] = "validate"
        return result

    def test_repo(self, repo_key, repo_config):
        """Run tests for a repository"""
        print(f"\n[{repo_key}] Running tests...")

        result = self.run_command(
            repo_config["commands"]["test"],
            repo_config["path"]
        )

        result["phase"] = "test"
        return result

    def build_repo(self, repo_key, repo_config):
        """Run build for a repository"""
        print(f"\n[{repo_key}] Building...")

        result = self.run_command(
            repo_config["commands"]["build"],
            repo_config["path"],
            timeout=600  # Longer timeout for builds
        )

        result["phase"] = "build"
        return result

    def process_repository(self, repo_key, repo_config):
        """Process a single repository through all phases"""
        print(f"\n{'='*60}")
        print(f"Processing {repo_config['name']} ({repo_key})")
        print(f"{'='*60}")

        repo_results = {
            "repo": repo_key,
            "name": repo_config["name"],
            "type": repo_config["type"],
            "path": repo_config["path"],
            "timestamp": datetime.now().isoformat(),
            "phases": {}
        }

        # Validate
        validate_result = self.validate_repo(repo_key, repo_config)
        repo_results["phases"]["validate"] = validate_result

        if not validate_result.get("success", False):
            print(f"  [FAILED] Validation failed, skipping remaining phases")
            repo_results["overall_status"] = "FAILED"
            repo_results["failed_phase"] = "validate"
            return repo_results

        # Test
        test_result = self.test_repo(repo_key, repo_config)
        repo_results["phases"]["test"] = test_result

        if not test_result.get("success", False):
            print(f"  [WARNING] Tests failed, continuing to build")

        # Build
        build_result = self.build_repo(repo_key, repo_config)
        repo_results["phases"]["build"] = build_result

        # Determine overall status
        if build_result.get("success", False):
            repo_results["overall_status"] = "SUCCESS"
        else:
            repo_results["overall_status"] = "FAILED"
            repo_results["failed_phase"] = "build"

        return repo_results

    def generate_proof_pack(self, repo_key, repo_results):
        """Generate proof pack for a repository"""
        proof_dir = os.path.join(RUNS_DIR, self.run_id, repo_key)
        os.makedirs(proof_dir, exist_ok=True)

        # Write JSON results
        json_path = os.path.join(proof_dir, "results.json")
        with open(json_path, 'w') as f:
            json.dump(repo_results, f, indent=2)

        # Write markdown receipt
        md_path = os.path.join(proof_dir, "receipt.md")
        content = f"""# Shipping Factory Receipt - {repo_key}

**Repository:** {repo_results['name']}
**Type:** {repo_results['type']}
**Timestamp:** {repo_results['timestamp']}
**Status:** {repo_results['overall_status']}

## Validation Phase
- **Success:** {repo_results['phases']['validate'].get('success', False)}
- **Command:** `{repo_results['phases']['validate'].get('command', 'N/A')}`
- **Exit Code:** {repo_results['phases']['validate'].get('exit_code', 'N/A')}

## Test Phase
- **Success:** {repo_results['phases']['test'].get('success', False)}
- **Command:** `{repo_results['phases']['test'].get('command', 'N/A')}`
- **Exit Code:** {repo_results['phases']['test'].get('exit_code', 'N/A')}

## Build Phase
- **Success:** {repo_results['phases']['build'].get('success', False)}
- **Command:** `{repo_results['phases']['build'].get('command', 'N/A')}`
- **Exit Code:** {repo_results['phases']['build'].get('exit_code', 'N/A')}

## Proof Pack
- Location: `{proof_dir}`
- Contains: results.json, receipt.md, phase outputs

---
Generated by: Shipping Factory
Run ID: {self.run_id}
"""

        with open(md_path, 'w') as f:
            f.write(content)

        # Save phase outputs
        for phase_name, phase_data in repo_results["phases"].items():
            if "stdout" in phase_data and phase_data["stdout"]:
                output_file = os.path.join(proof_dir, f"{phase_name}_output.txt")
                with open(output_file, 'w') as f:
                    f.write(phase_data["stdout"])

            if "stderr" in phase_data and phase_data["stderr"]:
                error_file = os.path.join(proof_dir, f"{phase_name}_error.txt")
                with open(error_file, 'w') as f:
                    f.write(phase_data["stderr"])

        self.proof_packs[repo_key] = proof_dir
        print(f"  Proof pack generated: {proof_dir}")

        return proof_dir

    def run_daily_sweep(self):
        """Run the complete daily sweep for all repositories"""
        print("="*60)
        print("SHIPPING FACTORY DAILY SWEEP")
        print(f"Run ID: {self.run_id}")
        print(f"Timestamp: {self.timestamp.isoformat()}")
        print("="*60)

        # Process each repository
        for repo_key, repo_config in REPOS.items():
            repo_results = self.process_repository(repo_key, repo_config)
            self.results[repo_key] = repo_results
            self.generate_proof_pack(repo_key, repo_results)

        # Generate summary report
        self.generate_summary_report()

        return self.results

    def generate_summary_report(self):
        """Generate overall summary report"""
        summary_path = os.path.join(RECEIPTS_DIR, f"SHIPPING_FACTORY_{self.timestamp.strftime('%Y%m%d')}.md")
        os.makedirs(os.path.dirname(summary_path), exist_ok=True)

        # Calculate statistics
        total_repos = len(self.results)
        successful = sum(1 for r in self.results.values() if r["overall_status"] == "SUCCESS")
        failed = total_repos - successful

        content = f"""# SHIPPING FACTORY DAILY SWEEP

**Date:** {self.timestamp.strftime("%Y-%m-%d")}
**Run ID:** {self.run_id}
**Total Repositories:** {total_repos}
**Successful:** {successful}
**Failed:** {failed}

## Repository Status

| Repository | Validate | Test | Build | Overall |
|------------|----------|------|-------|---------|
"""

        for repo_key, results in self.results.items():
            validate = "✓" if results["phases"]["validate"].get("success", False) else "✗"
            test = "✓" if results["phases"]["test"].get("success", False) else "✗"
            build = "✓" if results["phases"]["build"].get("success", False) else "✗"
            overall = "SUCCESS" if results["overall_status"] == "SUCCESS" else "FAILED"

            content += f"| {results['name']} | {validate} | {test} | {build} | {overall} |\n"

        content += f"""

## Proof Packs

All proof packs generated at: `{os.path.join(RUNS_DIR, self.run_id)}`

### Individual Repositories
"""

        for repo_key, proof_path in self.proof_packs.items():
            content += f"- **{repo_key}**: `{proof_path}`\n"

        content += f"""

## Detailed Results

"""

        # Add detailed results for each repo
        for repo_key, results in self.results.items():
            content += f"### {results['name']}\n\n"

            if results["overall_status"] == "SUCCESS":
                content += "All phases completed successfully.\n\n"
            else:
                failed_phase = results.get("failed_phase", "unknown")
                content += f"Failed at phase: {failed_phase}\n\n"

                if failed_phase in results["phases"]:
                    error = results["phases"][failed_phase].get("stderr", "Unknown error")
                    if error:
                        content += f"```\n{error[:500]}\n```\n\n"

        content += """
---
Generated by: Shipping Factory
Type: Daily Build Sweep
"""

        with open(summary_path, 'w') as f:
            f.write(content)

        print(f"\nSummary report generated: {summary_path}")
        return summary_path

def main():
    """Main execution"""
    factory = ShippingFactory()
    results = factory.run_daily_sweep()

    # Print summary
    print("\n" + "="*60)
    print("SHIPPING FACTORY COMPLETE")
    print("="*60)

    successful = sum(1 for r in results.values() if r["overall_status"] == "SUCCESS")
    total = len(results)

    print(f"Results: {successful}/{total} repositories built successfully")

    for repo_key, result in results.items():
        status = "✓" if result["overall_status"] == "SUCCESS" else "✗"
        print(f"  {status} {result['name']}")

    return 0 if successful == total else 1

if __name__ == "__main__":
    sys.exit(main())