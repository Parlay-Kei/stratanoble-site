# Data Room Ingestion Manifest

**Mission:** Data Room Ingestion **Date:** 2026-01-19 **Status:** In Progress
**Execution:** Docs Admin Ops

## 1. Financials (Owner: CFO)

| Source File                                                                                                           | Target Path                                                       | MIME Type         | Status  |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------- | ------- |
| `docs/Direct Cuts Data Room/8. Investor Relations/Pre-Seed Data Room/Financial Information/Cap_Table.pdf`             | `/2. Financial/Capitalization/Cap_Table.pdf`                      | `application/pdf` | SUCCESS |
| `docs/Direct Cuts Data Room/8. Investor Relations/Pre-Seed Data Room/Financial Information/Financial_Projections.pdf` | `/2. Financial/Forecasts & Projections/Financial_Projections.pdf` | `application/pdf` | SUCCESS |
| `docs/Direct Cuts Data Room/8. Investor Relations/Pre-Seed Data Room/Financial Information/Financial_Definitions.pdf` | `/2. Financial/Financial_Definitions.pdf`                         | `application/pdf` | SUCCESS |
| `docs/Direct Cuts Data Room/8. Investor Relations/Pre-Seed Data Room/Financial Information/Use_of_Proceeds.pdf`       | `/2. Financial/Use_of_Proceeds.pdf`                               | `application/pdf` | SUCCESS |

## 2. Legal & Corporate (Owner: Legal Ops)

| Source File                                                                                                                       | Target Path                                                                                     | MIME Type         | Status  |
| --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------- | ------- |
| `docs/Direct Cuts Data Room/8. Investor Relations/Pre-Seed Data Room/Legal & Corporate/Investor_NDA.pdf`                          | `/7. Legal & Compliance/Contracts & Service Agreements/Investor_NDA.pdf`                        | `application/pdf` | SUCCESS |
| `docs/Direct Cuts Data Room/8. Investor Relations/Pre-Seed Data Room/Legal & Corporate/Incorporation_Docs/Operating_Agreement.md` | `/7. Legal & Compliance/Operating_Agreement.md`                                                 | `text/markdown`   | SUCCESS |
| `docs/Direct Cuts Data Room/8. Investor Relations/Pre-Seed Data Room/Legal & Corporate/SAFE/SAFE_Terms.pdf`                       | `/7. Legal & Compliance/SAFE_Terms.pdf`                                                         | `application/pdf` | SUCCESS |
| `artifacts/temp/DC_BarberAmbassador_AgreementPack_v2_2026-01-18.md`                                                               | `/7. Legal & Compliance/Contracts & Service Agreements/DC_BarberAmbassador_AgreementPack_v2.md` | `text/markdown`   | SUCCESS |
| `artifacts/temp/DC_SeniorDev_AgreementPack_v2_2026-01-18.md`                                                                      | `/7. Legal & Compliance/Contracts & Service Agreements/DC_SeniorDev_AgreementPack_v2.md`        | `text/markdown`   | SUCCESS |

## 3. Governance (Owner: Direct Cuts GM)

| Source File                           | Target Path                           | MIME Type       | Status  |
| ------------------------------------- | ------------------------------------- | --------------- | ------- |
| `.agent/anx/governance/ROSTER.md`     | `/1. Corporate & Legal/ROSTER.md`     | `text/markdown` | SUCCESS |
| `.agent/anx/governance/INTAKE.md`     | `/1. Corporate & Legal/INTAKE.md`     | `text/markdown` | SUCCESS |
| `.agent/anx/governance/APPROVALS.md`  | `/1. Corporate & Legal/APPROVALS.md`  | `text/markdown` | SUCCESS |
| `.agent/anx/governance/WORK_MODEL.md` | `/1. Corporate & Legal/WORK_MODEL.md` | `text/markdown` | SUCCESS |

## 4. Infrastructure (Owner: Platform Ops)

| Source File                                                  | Target Path                                        | MIME Type       | Status  |
| ------------------------------------------------------------ | -------------------------------------------------- | --------------- | ------- |
| `docs/ARCHITECTURE.md`                                       | `/10. Infrastructure/ARCHITECTURE.md`              | `text/markdown` | SUCCESS |
| `docs/product/DC_DEMO_DAY_RUNBOOK.md`                        | `/10. Infrastructure/DC_DEMO_DAY_RUNBOOK.md`       | `text/markdown` | SUCCESS |
| `docs/audits/proofs/2026-01-03/PRODUCTION_DEPLOY_RUNBOOK.md` | `/10. Infrastructure/PRODUCTION_DEPLOY_RUNBOOK.md` | `text/markdown` | SUCCESS |
| `DEMO_RUNBOOK_2026-01-17.md`                                 | `/10. Infrastructure/DEMO_RUNBOOK_2026-01-17.md`   | `text/markdown` | SUCCESS |

## 5. Pitch Material (Owner: CFO)

| Source File                                                                                      | Target Path                     | MIME Type                                                                   | Status  |
| ------------------------------------------------------------------------------------------------ | ------------------------------- | --------------------------------------------------------------------------- | ------- |
| `docs/Direct Cuts Data Room/8. Investor Relations/Pre-Seed Data Room/Pitch Deck/Pitch_Deck.pptx` | `/2. Financial/Pitch_Deck.pptx` | `application/vnd.openxmlformats-officedocument.presentationml.presentation` | SUCCESS |

## 6. Evidence / Audits (Owner: QA Gatekeeper)

| Source File                                                                                               | Target Path                                        | MIME Type       | Status  |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | --------------- | ------- |
| `docs/Direct Cuts Data Room/8. Investor Relations/Executive Overview/PLATFORM_DIAGNOSTIC_AUDIT_REPORT.md` | `/9. Evidence/PLATFORM_DIAGNOSTIC_AUDIT_REPORT.md` | `text/markdown` | SUCCESS |

## 4. Notes

- PDF versions selected over DOCX/MD where available for immutability.
- Files re-homed from `/8` to functional folders `/2` and `/7` to comply with
  RBAC write permissions.
