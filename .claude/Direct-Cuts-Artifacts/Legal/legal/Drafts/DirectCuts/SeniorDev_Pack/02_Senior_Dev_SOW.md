# STATEMENT OF WORK (SOW) #1: SENIOR DEVELOPER

**Is attached to and governed by the Independent Contractor Services Agreement
dated [DATE].**

**Project Name:** Direct Cuts Mobile Marketplace Development **Start Date:**
[DATE] **End Date:** [DATE]

## 1. SCOPE OF SERVICES

Contractor serves as Senior Developer responsible for core backend and frontend
implementation of the Direct Cuts platform.

## 2. MILESTONE SCHEDULE

| Milestone                   | Deliverables                                                                | Acceptance Criteria                                                                             | Due Date | Payment   |
| --------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------- | --------- |
| **M1: Core Auth & Profile** | - Auth flows (Supabase)<br>- Barber Profile CRUD<br>- User Profile CRUD     | - User/Barber can sign up/login<br>- Profiles persist to DB<br>- Unit tests pass (80% coverage) | [DATE]   | $[AMOUNT] |
| **M2: Booking Engine**      | - Slot generation logic<br>- Booking API<br>- Calendar UI                   | - Timezones handled correctly<br>- No double bookings allowed<br>- Integration tests pass       | [DATE]   | $[AMOUNT] |
| **M3: Payments Foundation** | - Stripe Connect integration<br>- Payment intent creation<br>- Payout logic | - Connect onboarding works<br>- Successful test payment flow<br>- Webhooks processed correctly  | [DATE]   | $[AMOUNT] |
| **M4: MVP Launch Release**  | - Production deployment<br>- Monitoring setup<br>- Bug fix stability        | - Production URL live<br>- Sentry reporting active<br>- Critical bugs closed                    | [DATE]   | $[AMOUNT] |

## 3. PROOF PACK REQUIREMENTS (ACCEPTANCE)

Payment for each milestone is conditional upon Company approval of the following
"Proof Pack" artifacts:

1. **Deployed Link:** Staging or Production URL demonstrating functionality.
2. **Commit Reference:** GitHub PR links/Commit hashes for the completed work.
3. **Test Evidence:** Screenshot or CI log showing passing tests.
4. **Release Notes:** Brief summary of changes and configuration updates.

## 4. DELIVERY CADENCE & REPORTING

- **Weekly Status:** Contractor shall provide a text-based status update every
  Friday, including progress, blocked items, and risk log.
- **Sprint Cycle:** Work is organized in 2-week sprints with Monday planning and
  Friday demos.

## 5. CHANGE CONTROL

Any modification to scope, timeline, or cost requires a written Change Order
signed by both parties. Informal requests (Slack, Email) do not constitute a
binding change until documented.

## 6. TOOLING & ACCESS

Company will provide access to:

- **Source Control:** GitHub (Direct-Cuts org)
- **Database/Auth:** Supabase (Production & Staging)
- **Hosting:** Vercel
- **Project Mgmt:** Notion / Jira
- **Communication:** Slack

**AGREED AND ACCEPTED:**

**Company:** ___________________ **Contractor:** ___________________ **Date:**
______________________ **Date:** ______________________
