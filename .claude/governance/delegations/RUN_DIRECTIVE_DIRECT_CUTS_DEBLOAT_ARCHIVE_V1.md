# RUN_DIRECTIVE_DIRECT_CUTS_DEBLOAT_ARCHIVE_V1.md

## Scope

- **Repo**: C:\Dev\Direct-Cuts
- **Branch**: main (direct-to-main allowed)
- **Archive target**: F:\ANX_ARCHIVE\Direct-Cuts\archive\2026-01-19\

## Non-negotiables

- **Create restore anchor before any destructive action**:
  - External mirror snapshot of the repo (including .git) to:
    `F:\ANX_ARCHIVE\Direct-Cuts\restore-anchors\2026-01-19\repo-mirror\`
  - Create a git tag: `pre-debloat-2026-01-19`
  - Export a patch bundle and commit log to the restore anchor folder.
- **Copy-then-verify-then-remove**. No move-first behavior.
- No removal of runtime-required assets (anything in public/, app icons, etc.)
  unless explicitly proven unused.
- Deliver receipts and manifests.

## Owners

- **OCS**: orchestration, sequencing, main-branch guardrails
- **Platform Ops**: classification, external archive packaging, manifests,
  ignore rules
- **Engineering Delivery**: safety scan, build verification, link/reference
  fixes
- **QA Gatekeeper**: minimal regression check, compliance receipt

## Definition of Done

- Repo is smaller and cleaner (non-product docs/artifacts removed)
- External archive contains all archived material with checksums and manifest
- .gitignore blocks the removed classes going forward
- Build/typecheck passes
- Receipts written and committed on main

## Department missions

### 1) Platform Ops Mission (archive + policy + ignore enforcement)

**Prompt**: “Platform Ops: Execute De-Bloat Archive v1 for Direct Cuts.

**Inputs**:

- Repo root: C:\Dev\Direct-Cuts
- External archive root: F:\ANX_ARCHIVE\Direct-Cuts\archive\2026-01-19\
- Restore anchor root: F:\ANX_ARCHIVE\Direct-Cuts\restore-anchors\2026-01-19\

**Step A: Restore Anchor (must complete first)**

- Create full repo mirror including .git into restore anchor folder.
- Create tag pre-debloat-2026-01-19.
- Export:
  - commit log (last 200 commits)
  - diff status at start
  - patch bundle for the tag state
- Write receipt: `RESTORE_ANCHOR_RECEIPT.md` into `docs/archive-policy/`.

**Step B: Inventory + Classification**

- Inventory repo-wide candidates:
  - proofs/, receipts/, artifacts/, PROOF_PACK*/, screenshots, audit docs
  - root-level operational markdowns and logs
  - temp exports and analysis outputs
  - legacy moved ANX artifacts or stray scripts not used by build
- Classify:
  - A) KEEP-IN-REPO: README/LICENSE/SECURITY + small dev docs needed for
    contributors/runtime
  - B) ARCHIVE-EXTERNAL: proofs/receipts/screenshots/PM packages/internal
    runbooks/audits
  - C) DELETE: true temp files, duplicates, junk logs

**Step C: Archive Packaging**

- Copy ARCHIVE-EXTERNAL files into external archive structure:
  - proofs\ receipts\ pm-packages\ internal-runbooks\ screenshots\ exports\
    logs\ legacy-artifacts\ manifests\
- Generate `ARCHIVE_MANIFEST.json` with:
  - old_path, new_path, size_bytes, last_modified, sha256
- Verify checksums after copy.

**Step D: Repo Cleanup**

- Remove archived files from repo (git-aware removal).
- Delete files classified DELETE (git-aware).
- Create in-repo policy and pointers only:
  - `docs/archive-policy/ARCHIVE_POLICY.md`
  - `docs/archive-policy/ARCHIVE_INDEX.md` (external path + how to locate
    manifest/zip)
  - `docs/archive-policy/ARCHIVE_RUN_RECEIPT.md` (counts moved/deleted/kept,
    plus rationale)
  - `docs/archive-policy/MANIFEST_POINTER.txt` (exact external manifest path +
    zip hash)
  - `docs/archive-policy/REVERT_PLAN.md` (restore instructions using restore
    anchor)

**Step E: Anti-bloat enforcement**

- Update `.gitignore` to block recurrence. Include patterns that match what
  actually exists, aiming for:
  - proofs/, receipts/, artifacts/, PROOF_PACK*/
  - **/PROOF.png, **/RECEIPT.png, **/BEFORE.png, **/AFTER.png
  - **/*.log, test-results/
  - gate outputs and preflight outputs if they are currently generated into the
    repo
- Write receipt: .gitignore changes explained in `ARCHIVE_RUN_RECEIPT.md`.

**Output requirements**:

- Create
  `F:\ANX_ARCHIVE\Direct-Cuts\archive\2026-01-19\Direct-Cuts-archive-2026-01-19.zip`
- Create checksum file for the zip in the manifests folder.

### 2) Engineering Delivery Mission (safety scan + build verification)

**Prompt**: “Engineering Delivery: Validate repo integrity post-debloat on main.

**Tasks**:

- Scan for broken references:
  - markdown links to moved proofs/receipts
  - CI workflows expecting removed folders
  - imports referencing moved assets
- Fix links by pointing to `docs/archive-policy/ARCHIVE_INDEX.md`
- Run required project validations (build + typecheck + any standard tests
  configured)

**Deliver**:

- `docs/archive-policy/BUILD_VERIFICATION_RECEIPT.md` with results and commit
  SHA.

### 3) QA Gatekeeper Mission (minimal regression + compliance receipt)

**Prompt**: “QA Gatekeeper: Run De-Bloat QA Gate after Engineering Delivery
passes build/typecheck.

**Verify**:

- app boots
- home loads
- auth screen loads
- one barber profile route loads
- no missing static assets errors

**Deliver**:

- `docs/archive-policy/DEBLOAT_QA_RECEIPT.md`
- Include final commit SHA and confirm archive policy compliance.

## Direct-to-main execution protocol

OCS must enforce this sequence:

1. Restore anchor created and receipted
2. Archive copy + checksum verification
3. Repo removals + .gitignore enforcement
4. Build/typecheck verification
5. QA sanity
6. Commit to main with a single clean message:
   `chore: de-bloat repo and externalize non-product artifacts (archive v1)`
