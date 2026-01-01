#!/usr/bin/env python3
"""
Auto-monitor C:\Dev for new projects and create junctions automatically
"""

import os
import time
import subprocess
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

DEV_DIR = Path("C:/Dev")
CLAUDE_ANX = DEV_DIR / ".claude-anx"
EXCLUDE_DIRS = {".claude", ".claude-anx", ".git", "node_modules"}

class ProjectCreationHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            project_path = Path(event.src_path)
            project_name = project_path.name
            
            # Skip excluded directories
            if project_name in EXCLUDE_DIRS:
                return
            
            # Check if it's a direct child of C:\Dev
            if project_path.parent != DEV_DIR:
                return
            
            print(f"\n🆕 New project detected: {project_name}")
            
            # Wait a moment for directory to stabilize
            time.sleep(2)
            
            # Create junction
            self.create_junction(project_path)
    
    def create_junction(self, project_path):
        claude_link = project_path / ".claude"
        
        # Check if junction already exists
        if claude_link.exists():
            if claude_link.is_symlink() or self.is_junction(claude_link):
                print(f"   ✓ Junction already exists for {project_path.name}")
                return
            else:
                print(f"   ⚠ Backing up existing .claude directory")
                backup = project_path / ".claude.backup"
                if backup.exists():
                    import shutil
                    shutil.rmtree(backup)
                claude_link.rename(backup)
        
        # Create junction using mklink
        cmd = f'mklink /J "{claude_link}" "{CLAUDE_ANX}"'
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                check=True
            )
            print(f"   ✅ Junction created: {project_path.name}/.claude -> .claude-anx")
            self.update_manifest(project_path.name)
        except subprocess.CalledProcessError as e:
            print(f"   ❌ Failed to create junction: {e.stderr}")
    
    def is_junction(self, path):
        """Check if path is a junction point on Windows"""
        try:
            result = subprocess.run(
                f'fsutil reparsepoint query "{path}"',
                shell=True,
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except:
            return False
    
    def update_manifest(self, project_name):
        """Add new project to manifest.json"""
        import json
        manifest_path = CLAUDE_ANX / "manifest.json"
        
        try:
            with open(manifest_path, 'r') as f:
                manifest = json.load(f)
            
            # Check if project already in manifest
            existing = [p for p in manifest.get('projects', []) if p['name'] == project_name]
            if existing:
                return
            
            # Add new project
            new_project = {
                "name": project_name,
                "path": str(DEV_DIR / project_name),
                "linkPath": str(DEV_DIR / project_name / ".claude"),
                "description": "Auto-detected project",
                "addedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            
            manifest.setdefault('projects', []).append(new_project)
            manifest['lastUpdated'] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            
            with open(manifest_path, 'w') as f:
                json.dump(manifest, f, indent=2)
            
            print(f"   📝 Updated manifest.json with {project_name}")
        except Exception as e:
            print(f"   ⚠ Could not update manifest: {e}")

def main():
    print("🔍 Starting ANX Project Monitor")
    print(f"📁 Monitoring: {DEV_DIR}")
    print(f"🎯 Target: {CLAUDE_ANX}")
    print("\nWatching for new project directories...")
    print("Press Ctrl+C to stop\n")
    
    event_handler = ProjectCreationHandler()
    observer = Observer()
    observer.schedule(event_handler, str(DEV_DIR), recursive=False)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping monitor...")
        observer.stop()
    
    observer.join()
    print("✅ Monitor stopped")

if __name__ == "__main__":
    main()
