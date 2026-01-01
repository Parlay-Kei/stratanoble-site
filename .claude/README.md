# 🎯 ANX Claude Management System - Complete Setup

## ✅ System Status

**Version:** 2.1.0  
**Last Updated:** December 30, 2025  
**Total Projects:** 12  
**Total Agents:** 37  
**Total Skills:** 20  

---

## 📁 Project Coverage

All projects in `C:\Dev` now have junction links to `.claude-anx`:

| Project | Status | Link Path |
|---------|--------|-----------|
| Auth | ✅ | `C:\Dev\Auth\.claude` |
| DC-2 | ✅ | `C:\Dev\DC-2\.claude` |
| Direct-Cuts | ✅ | `C:\Dev\Direct-Cuts\.claude` |
| DSLV | ✅ | `C:\Dev\DSLV\.claude` |
| flutter | ✅ | `C:\Dev\flutter\.claude` |
| flutter-dc2-skill | ✅ | `C:\Dev\flutter-dc2-skill\.claude` |
| Household_Ticket | ✅ | `C:\Dev\Household_Ticket\.claude` |
| Konjode | ✅ | `C:\Dev\Konjode\.claude` |
| msaudreys-house | ✅ | `C:\Dev\msaudreys-house\.claude` |
| N8N-Data | ✅ | `C:\Dev\N8N-Data\.claude` |
| StrataNoble | ✅ | `C:\Dev\StrataNoble\.claude` |
| Trust-Spine-Sprint | ✅ | `C:\Dev\Trust-Spine-Sprint\.claude` |

---

## 🚀 Quick Start for New Projects

### Option 1: Manual Setup (Immediate)

```batch
# Create your new project
mkdir C:\Dev\MyNewProject

# Setup junction
cd C:\Dev\.claude-anx\scripts\project-setup
setup-new-project.bat MyNewProject
```

### Option 2: Automatic Detection (Background Service)

```batch
# Start the monitor (leave running)
cd C:\Dev\.claude-anx\scripts\project-setup
python auto-monitor.py

# In another terminal, create projects as normal
mkdir C:\Dev\AnotherProject
# Junction automatically created!
```

### Option 3: Bulk Setup (Multiple Projects)

```batch
# Run as Administrator
cd C:\Dev\.claude-anx\scripts\project-setup
setup-all-junctions.bat
```

Or use PowerShell:

```powershell
# Run as Administrator
cd C:\Dev\.claude-anx\scripts\project-setup
.\setup-all-junctions.ps1
```

---

## 📂 Directory Structure

```
C:\Dev\
├── .claude-anx/                    ← Central repository (single source of truth)
│   ├── agents/                     ← 37 agent configurations
│   ├── skills/                     ← 20 skill modules
│   ├── commands/                   ← Custom commands
│   ├── scripts/                    ← Utility scripts
│   │   └── project-setup/          ← Auto-setup scripts
│   ├── settings/                   ← Shared settings
│   ├── mcp-configs/                ← MCP configurations
│   ├── specs/                      ← Technical specifications
│   ├── manifest.json               ← Central registry
│   └── README.md                   ← This file
│
├── Direct-Cuts/
│   └── .claude/                    ← Junction → .claude-anx
│
├── DSLV/
│   └── .claude/                    ← Junction → .claude-anx
│
└── [Any Project]/
    └── .claude/                    ← Junction → .claude-anx
```

---

## 🎯 How It Works

1. **Single Source**: All agents/skills live in `C:\Dev\.claude-anx`
2. **Junction Links**: Each project has `.claude` pointing to `.claude-anx`
3. **Automatic Access**: Any project can use any agent/skill
4. **Update Once**: Changes to `.claude-anx` apply everywhere instantly

---

## 🛠️ Available Tools

### Setup Scripts

Located in `C:\Dev\.claude-anx\scripts\project-setup\`

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup-all-junctions.bat` | Setup all existing projects | Run once after fresh clone |
| `setup-all-junctions.ps1` | PowerShell version | Same as above |
| `setup-new-project.bat` | Setup single project | Manual new project |
| `auto-monitor.py` | Auto-detect new projects | Background service |

### Documentation

- **Full README**: `/scripts/project-setup/README.md` - Detailed documentation
- **Setup Guide**: `/SETUP_GUIDE.md` - Original setup instructions
- **Migration Report**: `/MIGRATION_REPORT.md` - Migration details

---

## 🔍 Verification

Check if junction is working:

```batch
# Windows Command Prompt
dir C:\Dev\Direct-Cuts\.claude

# PowerShell
Get-Item C:\Dev\Direct-Cuts\.claude | Select-Object *

# Check junction target
fsutil reparsepoint query "C:\Dev\Direct-Cuts\.claude"
```

---

## 📊 Resource Registry

All resources are tracked in `manifest.json`:

- **37 Agents** - Development, operations, business
- **20 Skills** - Core competencies and operations
- **1 Command** - YouTube transcript extraction
- **4 Configurations** - MCP, KFC framework
- **30+ Problem Mappings** - Problem type → skill routing

---

## ⚙️ Auto-Monitor Setup (Optional)

For automatic project detection:

### Install Dependencies

```bash
pip install watchdog
```

### Run as Background Service

```batch
# Terminal 1 - Start monitor
cd C:\Dev\.claude-anx\scripts\project-setup
python auto-monitor.py

# Terminal 2 - Create projects
mkdir C:\Dev\NewProject
# Junction created automatically!
```

### Windows Service (Advanced)

To run permanently:

1. Install NSSM (Non-Sucking Service Manager)
2. Create service:
   ```batch
   nssm install ANX-Project-Monitor "C:\Python\python.exe" "C:\Dev\.claude-anx\scripts\project-setup\auto-monitor.py"
   ```
3. Start service:
   ```batch
   nssm start ANX-Project-Monitor
   ```

---

## 🎓 Usage Examples

### From Any Project

```bash
cd C:\Dev\Direct-Cuts

# Access agents
cat .claude/agents/backend-dev.md

# Access skills
cat .claude/skills/backend-dev-ops/SKILL.md

# View manifest
cat .claude/manifest.json
```

### Claude Integration

Claude automatically reads from `.claude/` in your project:

```
User: "Use the backend-dev agent"
Claude: [Reads from C:\Dev\ProjectName\.claude\agents\backend-dev.md]
```

---

## 🔧 Troubleshooting

### Junction Creation Failed

**Problem:** "Access denied" or "requires elevation"  
**Solution:** Run Command Prompt or PowerShell as **Administrator**

### Junction Appears Empty

**Problem:** Directory shows as junction but appears empty  
**Solution:** 
```batch
# Check junction target
fsutil reparsepoint query "C:\Dev\ProjectName\.claude"

# Delete and recreate
rmdir "C:\Dev\ProjectName\.claude"
mklink /J "C:\Dev\ProjectName\.claude" "C:\Dev\.claude-anx"
```

### Auto-Monitor Not Working

**Problem:** Python script not detecting projects  
**Solution:**
1. Check `watchdog` is installed: `pip list | findstr watchdog`
2. Run script with full path: `python C:\Dev\.claude-anx\scripts\project-setup\auto-monitor.py`
3. Check permissions on C:\Dev directory

### Backup Directories Accumulating

**Problem:** Multiple `.claude.backup` folders  
**Solution:** Safe to delete after verifying junctions work
```batch
# Verify junction works first
dir C:\Dev\ProjectName\.claude

# Delete backup
rmdir /s /q "C:\Dev\ProjectName\.claude.backup"
```

---

## 📝 Best Practices

1. **Version Control**
   - Keep `.claude-anx` under git control
   - Add `.claude` to `.gitignore` (it's just a junction)
   - Commit changes to agents/skills at ANX level

2. **Updates**
   - Modify files in `.claude-anx` only
   - Never modify files through junction paths
   - Changes propagate automatically to all projects

3. **New Machines**
   - Clone `.claude-anx` first
   - Run `setup-all-junctions.bat` once
   - All projects immediately have access

4. **Security**
   - Don't commit sensitive credentials to `.claude-anx`
   - Use `.env` files per project
   - Keep API keys in project-specific locations

---

## 🎯 Next Steps

### Immediate Actions

1. ✅ Verify junctions are working
2. ✅ Test agent access from any project
3. ✅ Optionally setup auto-monitor

### Future Enhancements

- [ ] Create agent "presets" for common workflows
- [ ] Build CLI tool to list available agents/skills
- [ ] Add skill version management
- [ ] Create agent capability search
- [ ] Build skill dependency tracking

---

## 📚 Additional Resources

- **Project Setup**: `/scripts/project-setup/README.md`
- **Agent Registry**: `/manifest.json`
- **Gap Analysis**: `/AGENT_GAP_ANALYSIS.md`
- **Setup Guide**: `/SETUP_GUIDE.md`

---

## 🎉 Success Metrics

- ✅ 12 projects connected
- ✅ 37 agents available everywhere
- ✅ 20 skills accessible
- ✅ Single source of truth established
- ✅ Zero duplication
- ✅ Automatic propagation enabled

---

**System Owner:** ANX IT Department  
**Maintained By:** Steve @ StrataNoble  
**Last Updated:** December 30, 2025

For questions or issues, reference the troubleshooting section or check project-specific documentation.
