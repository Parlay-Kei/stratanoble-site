import sys
import os
import json
import subprocess

ANX_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ADAPTERS_DIR = os.path.join(ANX_ROOT, 'services', 'project_adapters')

def load_adapter(name):
    path = os.path.join(ADAPTERS_DIR, f"{name}.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Adapter not found: {name}")
    with open(path, 'r') as f:
        return json.load(f)

def run_op(adapter_name, command_name, dry_run=False):
    try:
        adapter = load_adapter(adapter_name)
        repo_path = adapter.get('repo_path')
        cmd_str = adapter['commands'].get(command_name)
        
        if not cmd_str:
            print(f"Command '{command_name}' not defined for {adapter_name}")
            sys.exit(1)
            
        print(f"--- Executing {adapter_name}:{command_name} ---")
        print(f"CWD: {repo_path}")
        print(f"CMD: {cmd_str}")
        
        if dry_run:
            print("[DRY RUN] Command skipped.")
            return
            
        # Execute
        # Use shell=True to handle complex commands like "cd ... && ..."
        result = subprocess.run(cmd_str, cwd=repo_path, shell=True, capture_output=True, text=True)
        
        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)
        
        if result.returncode != 0:
            print(f"Command failed with exit code {result.returncode}")
            sys.exit(result.returncode)
            
        print("Command Success.")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python project_ops.py <ADAPTER_NAME> <COMMAND> [--dry-run]")
        sys.exit(1)
        
    adapter = sys.argv[1]
    cmd = sys.argv[2]
    dry = "--dry-run" in sys.argv
    
    run_op(adapter, cmd, dry_run=dry)
