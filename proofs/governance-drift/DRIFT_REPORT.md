# Governance Drift Report
Generated: 2026-01-30T21:48:28.048Z
Version: 1.0.0

## Summary
- **Total Repositories**: 17
- **✅ Passed**: 10
- **❌ Failed**: 7
- **🔧 Remediated**: 0

## Canonical Root
`C:\Dev\.claude-anx`

## Repository Status

| Repository | Status | Method | Issues |
|------------|--------|--------|--------|
| anx-audit-control | ✅ PASS | pointer | None |
| anx-audit-test | ✅ PASS | pointer | None |
| anx-audit-test2 | ✅ PASS | pointer | None |
| anx-audit-test3 | ✅ PASS | pointer | None |
| anx-audit-test4 | ✅ PASS | pointer | None |
| anx-audit-test5 | ✅ PASS | pointer | None |
| anx-test-install | ✅ PASS | pointer | None |
| CREA | ✅ PASS | pointer | None |
| DC-2 | ❌ FAIL | local-governance | Repository has local governance files instead of using canonical |
| Direct-Cuts | ✅ PASS | pointer | None |
| DSLV | ✅ PASS | pointer | None |
| flutter | ❌ FAIL | local-governance | Repository has local governance files instead of using canonical |
| Household_Ticket | ❌ FAIL | local-governance | Repository has local governance files instead of using canonical |
| Konjode | ❌ FAIL | local-governance | Repository has local governance files instead of using canonical |
| MPL | ❌ FAIL | pointer-incorrect | Pointer resolves to C:\Dev\MPL\# ANX_ROOT.pointer — Canonical Root and Resolver Behavior

**Version:** 1

---

## canonical_root

The canonical repository root for ANX resolution in this repo is:

```
c:\Dev\MPL
```

(Or the path returned by resolving the workspace root at session start. Prefer workspace root when in doubt.)

---

## resolver_behavior

- **If ANX_ROOT.pointer exists:** Use the `canonical_root` value above (or resolve relative to this file's directory as repo root).
- **If missing:** Use the current workspace root as canonical root.
- **Paths:** All ANX artifacts (ANX.md, MISSION_RULES.md, proofs, governance, research) are relative to canonical root.
- **No overrides:** Do not override canonical root with env vars unless explicitly documented in this file.

---

*Referenced by ANX.md boot sequence.* instead of canonical C:\Dev\.claude-anx |
| msaudreys-house | ❌ FAIL | pointer | Has correct pointer but also has local governance overrides |
| StrataNoble | ❌ FAIL | pointer | Has correct pointer but also has local governance overrides |

## Failed Repositories - Remediation Plans

### DC-2
**Status**: FAIL
**Path**: `C:\Dev\DC-2`

**Issues**:
- Repository has local governance files instead of using canonical

**Remediation**:
1. Remove local governance and add pointer to canonical
   ```bash
   rmdir /s /q "C:\Dev\DC-2\.claude\governance" && echo "../.claude-anx" > "C:\Dev\DC-2\ANX_ROOT.pointer"
   ```

### flutter
**Status**: FAIL
**Path**: `C:\Dev\flutter`

**Issues**:
- Repository has local governance files instead of using canonical

**Remediation**:
1. Remove local governance and add pointer to canonical
   ```bash
   rmdir /s /q "C:\Dev\flutter\.claude\governance" && echo "../.claude-anx" > "C:\Dev\flutter\ANX_ROOT.pointer"
   ```

### Household_Ticket
**Status**: FAIL
**Path**: `C:\Dev\Household_Ticket`

**Issues**:
- Repository has local governance files instead of using canonical

**Remediation**:
1. Remove local governance and add pointer to canonical
   ```bash
   rmdir /s /q "C:\Dev\Household_Ticket\.claude\governance" && echo "../.claude-anx" > "C:\Dev\Household_Ticket\ANX_ROOT.pointer"
   ```

### Konjode
**Status**: FAIL
**Path**: `C:\Dev\Konjode`

**Issues**:
- Repository has local governance files instead of using canonical

**Remediation**:
1. Remove local governance and add pointer to canonical
   ```bash
   rmdir /s /q "C:\Dev\Konjode\.claude\governance" && echo "../.claude-anx" > "C:\Dev\Konjode\ANX_ROOT.pointer"
   ```

### MPL
**Status**: FAIL
**Path**: `C:\Dev\MPL`

**Issues**:
- Pointer resolves to C:\Dev\MPL\# ANX_ROOT.pointer — Canonical Root and Resolver Behavior

**Version:** 1

---

## canonical_root

The canonical repository root for ANX resolution in this repo is:

```
c:\Dev\MPL
```

(Or the path returned by resolving the workspace root at session start. Prefer workspace root when in doubt.)

---

## resolver_behavior

- **If ANX_ROOT.pointer exists:** Use the `canonical_root` value above (or resolve relative to this file's directory as repo root).
- **If missing:** Use the current workspace root as canonical root.
- **Paths:** All ANX artifacts (ANX.md, MISSION_RULES.md, proofs, governance, research) are relative to canonical root.
- **No overrides:** Do not override canonical root with env vars unless explicitly documented in this file.

---

*Referenced by ANX.md boot sequence.* instead of canonical C:\Dev\.claude-anx

**Remediation**:
1. Update pointer to canonical root
   ```bash
   echo "../.claude-anx" > "C:\Dev\MPL\ANX_ROOT.pointer"
   ```

### msaudreys-house
**Status**: FAIL
**Path**: `C:\Dev\msaudreys-house`

**Issues**:
- Has correct pointer but also has local governance overrides

**Remediation**:
1. Remove local governance overrides
   ```bash
   rmdir /s /q "C:\Dev\msaudreys-house\.claude\governance"
   ```

### StrataNoble
**Status**: FAIL
**Path**: `C:\Dev\StrataNoble`

**Issues**:
- Has correct pointer but also has local governance overrides

**Remediation**:
1. Remove local governance overrides
   ```bash
   rmdir /s /q "C:\Dev\StrataNoble\.claude\governance"
   ```

## Remediation Receipts

### DC-2
- **Before**: FAIL
- **After**: FAIL
- **Success**: ❌
- **Timestamp**: 2026-01-30T21:48:28.059Z
