# Data Room Classification Rules

**Mission:** Data Room Ingestion **Date:** 2026-01-19 **Owner:** Docs Admin Ops

## 1. Classification & Routing Strategy

We map local repository files to Google Drive folders based on content type and
`anx_drive_config.json` write permissions.

| Content Type             | Source Pattern                                 | Target Drive Folder                                      | Writing Role   |
| ------------------------ | ---------------------------------------------- | -------------------------------------------------------- | -------------- |
| **Financials**           | `*Financial*`, `Cap_Table`, `Use_of_Proceeds`  | `/2. Financial`                                          | CFO            |
| **Legal/Contracts**      | `*Agreement*`, `*NDA*`, `*SAFE*`, `*Contract*` | `/7. Legal & Compliance`                                 | Legal Ops      |
| **Evidence/Audits**      | `*Audit_Report*`, `*Proof*`, `*Receipt*`       | `/9. Evidence`                                           | QA Gatekeeper  |
| **Infrastructure**       | `*Architecture*`, `*Security*`, `*Runbook*`    | `/10. Infrastructure`                                    | Platform Ops   |
| **Corporate/Governance** | `*Inc*`, `*Formation*`, `*Board*`              | `/1. Corporate & Legal` (or `/7` if mapped to Legal Ops) | Legal Ops / GM |

## 2. Handling of Pre-Seed Data Room (Folder 8)

The repository contains a pre-staged `8. Investor Relations` folder. Since `OCS`
and other agents do not have write access to `/8` in Drive, we re-home these
documents to their functional source of truth folders. Use of Drive "Shortcuts"
in `/8` to point to these files is the long-term Strategy, but initial ingestion
places them in functional homes.

- `8. .../Financial Information/*` -> `/2. Financial`
- `8. .../Legal & Corporate/*` -> `/7. Legal & Compliance`
- `8. .../Executive Overview/PLATFORM_DIAGNOSTIC_AUDIT_REPORT` -> `/9. Evidence`

## 3. Exclusion Rules

- **Secrets**: `.env`, `*.key`, `*.pem`, `credentials.json` are NEVER uploaded.
- **Node Modules**: `node_modules/` ignored.
- **Temporary Builds**: `dist/`, `build/` ignored.
- **Drafts**: Items in `artifacts/temp` are uploaded to
  `/7. Legal & Compliance/Drafts` or similar for review.

## 4. Naming Conventions

- Preserves original filenames.
- Optimizes for searchability (e.g. `Inc_Docs_Operating_Agreement.md`).
