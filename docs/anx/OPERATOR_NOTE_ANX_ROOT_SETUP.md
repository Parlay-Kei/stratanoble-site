# Operator Note: Adding .anx-root to a New Repository

**Document ID**: OP-NOTE-ANXROOT-001
**Version**: 1.0.0
**Author**: OCS
**Date**: 2026-02-06

---

## Purpose

This one-page guide explains how to add the `.anx-root` pointer file to a new repository to integrate it with ANX governance.

---

## Quick Setup (30 seconds)

### Step 1: Navigate to Repository Root
```powershell
cd C:\Dev\10_products\YourNewRepo
```

### Step 2: Create the Pointer File
```powershell
echo "C:\Dev\.claude-anx" > .anx-root
```

### Step 3: Verify
```powershell
cat .anx-root
# Should output: C:\Dev\.claude-anx
```

### Step 4: Commit
```powershell
git add .anx-root
git commit -m "feat: Add ANX governance pointer"
```

**Done.** The repository is now ANX-integrated.

---

## What This Does

When Claude Code starts a session in your repo:

1. Bootstrap sequence runs
2. Finds `.anx-root` in your repo root
3. Reads `C:\Dev\.claude-anx` from the file
4. Loads all governance from that canonical location
5. Your repo gets consistent ANX behavior

---

## File Format Rules

| Rule | Correct | Incorrect |
|------|---------|-----------|
| Content | `C:\Dev\.claude-anx` | `ANX_ROOT=C:\Dev\.claude-anx` |
| Path type | Absolute | `..\..\..\.claude-anx` |
| Lines | Single line | Multiple lines |
| Comments | None | `# This is the ANX root` |

---

## Template

Copy from the template:
```powershell
copy C:\Dev\10_products\StrataNoble\templates\.anx-root .\.anx-root
```

Or create manually with exact content:
```
C:\Dev\.claude-anx
```

---

## Verification Checklist

After adding `.anx-root`:

- [ ] File exists at repo root (same level as `.git`)
- [ ] Contains exactly one line
- [ ] Path is absolute (starts with `C:\` on Windows)
- [ ] Path points to existing directory
- [ ] That directory contains `bootstrap/ANX.md`

---

## Troubleshooting

### "ANX_ROOT resolution failed"
- Check the path in `.anx-root` exists
- Ensure no extra whitespace or newlines

### "Bootstrap file not found"
- Verify `C:\Dev\.claude-anx\bootstrap\ANX.md` exists
- Check file permissions

### "Local override detected"
- Remove any `agents/ROSTER.md` from your repo
- Remove any `gates/` files that shadow global gates

---

## Do NOT

- Put `.anx-root` in `.gitignore` (it should be committed)
- Use relative paths in the file
- Add comments or metadata to the file
- Create local `ROSTER.md` or gate overrides

---

## Contact

Questions about ANX integration: Route to OCS

---

*This document is a single-page operator reference. For full specification, see [ANX_BOOTSTRAP_CONTRACT.md](./ANX_BOOTSTRAP_CONTRACT.md).*
