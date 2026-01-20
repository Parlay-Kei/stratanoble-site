# ANX Skills Server v2.0 - Deployment Checklist

## Pre-Deployment Verification

### ✅ System Requirements
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Claude Desktop installed
- [ ] Skills directory exists at `C:\Dev\.claude-anx\skills\`
- [ ] Manifest file exists at `C:\Dev\.claude-anx\skills\manifest.json`
- [ ] All 14 skill directories have SKILL.md files

### ✅ File Verification
- [ ] `index.js` exists (750 lines)
- [ ] `validate.js` exists (150 lines)
- [ ] `analyze.js` exists (180 lines)
- [ ] `setup.bat` exists
- [ ] `package.json` exists
- [ ] All 6 documentation files exist

### ✅ Directory Structure
```
C:\Dev\.claude-anx\
├── skills\
│   ├── manifest.json ✓
│   └── [14 skill directories] ✓
└── mcp-servers\
    └── skills-server\
        ├── index.js ✓
        ├── validate.js ✓
        ├── analyze.js ✓
        ├── setup.bat ✓
        ├── package.json ✓
        └── [6 docs] ✓
```

---

## Deployment Steps

### Step 1: Pre-Installation Validation
```batch
cd C:\Dev\.claude-anx\mcp-servers\skills-server
node validate.js
```
**Expected:** "✅ All validations passed"  
**If Failed:** Fix reported errors before continuing

### Step 2: Run Installation
```batch
setup.bat
```
**Expected:**
- Dependencies install successfully
- Config copied to `%APPDATA%\Claude\`
- Backup created (if config exists)
- "Setup Complete!" message

**If Failed:** Check error messages in console

### Step 3: Restart Claude Desktop
1. Close Claude Desktop completely
2. Reopen Claude Desktop
3. Wait for initialization (~5 seconds)

### Step 4: Test Connection
In Claude Desktop, run:
```javascript
list_skills()
```
**Expected:** List of 14 skills with descriptions  
**If Failed:** Check troubleshooting section

### Step 5: Test Progressive Disclosure
```javascript
get_skill("frontend-dev-ops", level: 1)
```
**Expected:** Truncated content with level indicator  
**If Failed:** Check server.log

### Step 6: Test Recommendations
```javascript
recommend_skills(context: "build api")
```
**Expected:** 3 relevant skill recommendations  
**If Failed:** Check manifest.json problem mappings

### Step 7: Test Analytics
```javascript
get_analytics()
```
**Expected:** JSON with server stats  
**If Failed:** Check analytics.json creation

---

## Post-Deployment Verification

### ✅ File System Checks
- [ ] `server.log` created and contains startup messages
- [ ] `analytics.json` created (may be empty initially)
- [ ] `cache\` directory created
- [ ] `node_modules\` directory populated

### ✅ Functional Tests
- [ ] Can list all skills
- [ ] Can load skill with level 1
- [ ] Can load skill with level 2
- [ ] Can load skill with level 3
- [ ] Can get recommendations
- [ ] Can view analytics
- [ ] Can filter skills

### ✅ Performance Tests
- [ ] First skill load < 100ms
- [ ] Cached skill load < 10ms
- [ ] Recommendations < 20ms
- [ ] Memory usage < 50MB

### ✅ Configuration Verification
```batch
type %APPDATA%\Claude\claude_desktop_config.json
```
**Expected:**
```json
{
  "mcpServers": {
    "anx-skills": {
      "command": "node",
      "args": ["C:\\Dev\\.claude-anx\\mcp-servers\\skills-server\\index.js"]
    }
  }
}
```

---

## Troubleshooting Guide

### Issue: "Could not attach to MCP server"

**Diagnosis Steps:**
1. Check Node.js: `node --version`
2. Check file exists: `dir C:\Dev\.claude-anx\mcp-servers\skills-server\index.js`
3. Check config: `type %APPDATA%\Claude\claude_desktop_config.json`
4. Check logs: `type C:\Dev\.claude-anx\mcp-servers\skills-server\server.log`

**Common Fixes:**
- Re-run `setup.bat`
- Restart Claude Desktop as administrator
- Verify path has no typos in config
- Check file permissions

### Issue: "Skill not found"

**Diagnosis:**
```javascript
list_skills()  // Check available skills
```

**Fix:** Use exact skill ID from list

### Issue: "Failed to load manifest"

**Diagnosis:**
```batch
node validate.js
```

**Fix:** Correct JSON syntax errors in manifest.json

### Issue: Poor Performance

**Diagnosis:**
```batch
type analytics.json
type server.log
```

**Fix:**
- Restart Claude Desktop
- Clear cache directory
- Check for errors in logs

### Issue: Validation Fails

**Diagnosis:**
```batch
node validate.js
```

**Fix:** Address each reported issue:
- Missing skill files
- Invalid JSON in manifest
- Missing required fields

---

## Rollback Procedure

If deployment fails and you need to revert:

### Step 1: Restore Backup Config
```batch
copy %APPDATA%\Claude\claude_desktop_config.json.backup %APPDATA%\Claude\claude_desktop_config.json
```

### Step 2: Remove Server Directory (Optional)
```batch
rmdir /s /q C:\Dev\.claude-anx\mcp-servers\skills-server
```

### Step 3: Restart Claude Desktop

---

## Success Criteria

Deployment is successful when all of these are true:

✅ `list_skills()` returns 14 skills  
✅ `get_skill("frontend-dev-ops", level: 1)` returns content  
✅ `recommend_skills(context: "test")` returns recommendations  
✅ `get_analytics()` returns stats  
✅ No errors in server.log  
✅ Performance within targets  
✅ All functional tests pass  

---

## Monitoring Plan

### Daily (Automatic)
- Server auto-starts with Claude Desktop
- Logs append to server.log
- Analytics persist every 10 uses

### Weekly (Manual)
```batch
# Check analytics
npm run analyze

# Validate integrity
npm run validate

# Review logs
type server.log | findstr ERROR
```

### Monthly (Manual)
```batch
# Update dependencies
npm update

# Archive logs
move server.log server.log.old

# Review coverage
npm run analyze
```

---

## Deployment Sign-Off

**Deployed By:** _________________  
**Date:** _________________  
**Version:** 2.0.0  

**Verification Checklist:**
- [ ] All pre-deployment checks passed
- [ ] Installation completed successfully
- [ ] All tests passed
- [ ] Performance within targets
- [ ] Documentation complete
- [ ] Backup created

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

**Status:** ⬜ Ready for Production  |  ⬜ Issues Found  

---

## Quick Reference

**Install:** `setup.bat`  
**Validate:** `node validate.js`  
**Analyze:** `node analyze.js`  
**Logs:** `type server.log`  
**Config:** `%APPDATA%\Claude\claude_desktop_config.json`  

**Support:** See `SETUP_GUIDE.md` for complete documentation

---

**Deployment Complete!** 🚀
