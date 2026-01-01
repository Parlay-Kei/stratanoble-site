# ANX Project Setup Scripts

Automated scripts for managing Claude ANX junctions across all projects in `C:\Dev`.

## Scripts

### 1. Setup All Junctions (`setup-all-junctions.bat`)

**Purpose:** Create junctions for ALL existing projects in C:\Dev

**Usage:**
```batch
cd C:\Dev\.claude-anx\scripts\project-setup
setup-all-junctions.bat
```

**What it does:**
- Scans all directories in C:\Dev
- Backs up any existing `.claude` directories to `.claude.backup`
- Creates junction links to `.claude-anx` for each project
- Skips system directories (`.claude`, `.claude-anx`)

**Run this:** After initial setup or when adding multiple projects

---

### 2. Setup New Project (`setup-new-project.bat`)

**Purpose:** Create junction for a single new project

**Usage:**
```batch
cd C:\Dev\.claude-anx\scripts\project-setup
setup-new-project.bat MyNewProject
```

**What it does:**
- Validates project directory exists
- Backs up existing `.claude` if present
- Creates junction to `.claude-anx`
- Provides success/error feedback

**Run this:** When manually creating a new project

---

### 3. Auto Monitor (`auto-monitor.py`)

**Purpose:** Automatically detect and junction new projects as they're created

**Requirements:**
```bash
pip install watchdog
```

**Usage:**
```batch
cd C:\Dev\.claude-anx\scripts\project-setup
python auto-monitor.py
```

**What it does:**
- Monitors C:\Dev for new directories
- Automatically creates junctions when new projects appear
- Updates manifest.json with new project info
- Runs continuously in background

**Run this:** As a background service for automatic project detection

---

## Quick Start

### One-Time Setup (Add All Existing Projects)

```batch
# Run as Administrator
cd C:\Dev\.claude-anx\scripts\project-setup
setup-all-junctions.bat
```

### Manual New Project

```batch
# Create your project
mkdir C:\Dev\MyNewProject

# Setup junction
cd C:\Dev\.claude-anx\scripts\project-setup
setup-new-project.bat MyNewProject
```

### Automatic Detection (Optional)

```batch
# Terminal 1 - Start monitor (leave running)
cd C:\Dev\.claude-anx\scripts\project-setup
python auto-monitor.py

# Terminal 2 - Create projects as normal
mkdir C:\Dev\AnotherProject
# Junction automatically created!
```

---

## How Junctions Work

Each project gets a `.claude` directory that is actually a **junction point** (like a symlink) pointing to `C:\Dev\.claude-anx`:

```
C:\Dev\
├── .claude-anx/          ← Central repository
│   ├── agents/
│   ├── skills/
│   └── manifest.json
│
├── Direct-Cuts/
│   └── .claude/          ← Junction → .claude-anx
│
├── DSLV/
│   └── .claude/          ← Junction → .claude-anx
│
└── MyNewProject/
    └── .claude/          ← Junction → .claude-anx
```

**Benefits:**
- ✅ Single source of truth
- ✅ Update once, applies everywhere
- ✅ No duplication
- ✅ Projects stay lean
- ✅ Version control at ANX level

---

## Troubleshooting

### "Access denied" or junction creation fails
- Run Command Prompt or PowerShell as **Administrator**
- Junctions require elevated privileges on Windows

### Junction appears as directory but is empty
- Check: `fsutil reparsepoint query "C:\Dev\ProjectName\.claude"`
- If junction is broken, delete and recreate

### Auto-monitor not working
- Ensure `watchdog` is installed: `pip install watchdog`
- Check Python is in PATH
- Run from correct directory

### Backup directories accumulating
- Safe to delete `.claude.backup` directories after verifying junctions work
- Script automatically replaces old backups

---

## Configuration

Edit `auto-monitor.py` to customize:

```python
# Line 9-10: Change monitoring location
DEV_DIR = Path("C:/Dev")
CLAUDE_ANX = DEV_DIR / ".claude-anx"

# Line 11: Add directories to exclude
EXCLUDE_DIRS = {".claude", ".claude-anx", ".git", "node_modules", "tmp"}
```

---

## Best Practices

1. **Always run junction scripts as Administrator**
2. **Keep `.claude-anx` under version control** (your central source)
3. **Don't commit `.claude` junctions** (add to `.gitignore`)
4. **Run setup-all-junctions.bat** after cloning ANX to new machine
5. **Use auto-monitor** if you frequently create new projects

---

## Next Steps

After setup:
1. Verify junctions: `dir C:\Dev\ProjectName\.claude`
2. Check manifest: `C:\Dev\.claude-anx\manifest.json`
3. Test agent access from any project
4. Consider running auto-monitor as Windows service for permanent detection
