# Data Room → Google Drive Sync - Setup Guide

## ✅ Quick Start (5 minutes)

### Step 1: Install Python Dependencies
```bash
cd C:\Dev\Direct-Cuts
pip install -r requirements-sync.txt
```

### Step 2: Get Google Drive API Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a new project**:
   - Click "Select a project" (top bar)
   - Click "New Project"
   - Name: "DirectCuts-DataRoom-Sync"
   - Click "Create"

3. **Enable Google Drive API**:
   - In the search bar, type "Google Drive API"
   - Click "Google Drive API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to: APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure consent screen:
     - User Type: External
     - App name: "Direct Cuts Data Room Sync"
     - User support email: [your email]
     - Developer email: [your email]
     - Click "Save and Continue" (skip scopes)
     - Add test user: [your email]
     - Click "Save and Continue"
   - Application type: **Desktop app**
   - Name: "Data Room Sync Client"
   - Click "Create"

5. **Download credentials**:
   - Click the download icon (⬇️) next to your OAuth client
   - Save file as: `C:\Dev\Direct-Cuts\credentials.json`

### Step 3: Run Sync Script

**Preview (dry run):**
```bash
python sync_data_room.py --dry-run
```

**Actually sync files:**
```bash
python sync_data_room.py
```

**Force re-upload all:**
```bash
python sync_data_room.py --force
```

---

## 🎯 What Gets Synced

**From:**
```
C:\Dev\Direct-Cuts\docs\Direct Cuts Data Room\
```

**To:**
```
https://drive.google.com/drive/folders/1KFd2O3k-hq8QS6QBPtUB6vTU8zJYzuFK
```

**Includes:**
- 8. Investor Relations/Pre-Seed Data Room/
  - Executive Summary (7 files)
  - Financial Information (8 files)
  - Legal & Corporate (folders + files)
  - Market & Traction (5 files)
  - Pitch Deck (3 files)
  - Product & Technology (3 files)
  - Team & Advisors (1 file)
  - Templates (3 files)

**Total:** ~50+ files organized in folder structure

**Excludes:**
- Temp files (*.tmp, *.bak)
- System files (.DS_Store, Thumbs.db)
- Utility files (.file-order.txt)

---

## 📖 First-Time Authentication

When you run the sync script for the first time:

1. Script will open your browser automatically
2. Sign in with your Google account
3. Grant permission to "Direct Cuts Data Room Sync"
4. Browser will show "Authentication complete"
5. Token saved locally in `token.json` (for future runs)

---

## 🔐 Security Notes

- **credentials.json**: Never commit to git (add to .gitignore)
- **token.json**: Auto-generated, also keep private
- **Permissions**: Script only accesses files it creates
- **Revoke access**: Google Account → Security → Third-party apps

---

## 🚀 Usage Examples

### Preview changes before syncing:
```bash
python sync_data_room.py --dry-run
```

Output:
```
🔐 Authenticating with Google Drive...
✅ Authentication successful

🚀 Starting sync...

📂 Direct Cuts Data Room/
  [DRY RUN] Would create folder: 8. Investor Relations
  [DRY RUN] Would upload: README.md (0.05 MB)
  📂 8. Investor Relations/
    [DRY RUN] Would create folder: Pre-Seed Data Room
    📂 Pre-Seed Data Room/
      [DRY RUN] Would upload: 00_INDEX.md (0.02 MB)
      ...

============================================================
Sync Summary
============================================================

✅ Files uploaded:     47
🔄 Files updated:      0
📁 Folders created:    12
⏭️  Files skipped:      0

📦 Total size:         15.3 MB
⏱️  Duration:            2.5 seconds
============================================================
```

### Actually sync files:
```bash
python sync_data_room.py
```

### Force re-upload everything:
```bash
python sync_data_room.py --force
```

---

## 🔄 Ongoing Usage

After initial setup, syncing is simple:

```bash
cd C:\Dev\Direct-Cuts
python sync_data_room.py
```

**Smart sync features:**
- Only uploads new/changed files
- Skips identical files (same size)
- Preserves folder structure
- Creates missing folders automatically

**Run after:**
- Adding new investor documents
- Updating financial projections
- Creating new pitch deck versions
- Adding legal documents

---

## 📊 Sync Modes

| Mode | Command | Description |
|------|---------|-------------|
| **Preview** | `--dry-run` | Show what would be synced (no changes) |
| **Smart** | (default) | Upload new/changed files only |
| **Force** | `--force` | Re-upload all files (ignore existing) |

---

## ❌ Troubleshooting

### "credentials.json not found"
- Download from Google Cloud Console
- Save in: `C:\Dev\Direct-Cuts\credentials.json`

### "Authentication failed"
- Delete `token.json` and run again
- Browser will re-open for auth

### "File already exists" errors
- Use `--force` to overwrite
- Or manually delete from Google Drive

### "Permission denied" errors
- Check file/folder permissions on Windows
- Run Command Prompt as Administrator

### Script hangs on large files
- Google Drive API has upload size limits
- Files >5GB may timeout (split into parts)

---

## 🎉 Success!

After running the script, your Data Room will be in Google Drive:

**View here:**
https://drive.google.com/drive/folders/1KFd2O3k-hq8QS6QBPtUB6vTU8zJYzuFK

**Share with investors:**
1. Open the folder in Google Drive
2. Click "Share" (top right)
3. Add investor email addresses
4. Set permission: "Viewer"
5. Send link or invitation

---

## 📝 Notes

- **First sync**: May take 5-10 minutes (50+ files)
- **Subsequent syncs**: ~30 seconds (only changed files)
- **Bandwidth**: Uses your internet upload speed
- **Interruption**: Safe to interrupt (Ctrl+C), just run again
- **Re-run**: Idempotent - safe to run multiple times

---

**Ready? Run this:**

```bash
pip install -r requirements-sync.txt
python sync_data_room.py --dry-run
```

Then set up credentials following Step 2 above.
