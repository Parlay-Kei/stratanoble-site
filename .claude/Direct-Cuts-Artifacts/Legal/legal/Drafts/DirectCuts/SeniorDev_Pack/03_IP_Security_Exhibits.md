# EXHIBIT A: INVENTIONS ASSIGNMENT & IP DISCLOSURE

## 1. DEFINITIONS

"Inventions" means all discoveries, developments, concepts, designs, ideas, know how, improvements, trade secrets, software, and original works of authorship, whether or not patentable or registrable under copyright or similar laws, which: (a) Contractor creates, conceives, or reduces to practice, solely or jointly with others, in the course of performance of Services; (b) relate to the Company’s business or actual or demonstrably anticipated products or research; (c) result from use of Company Confidential Information; or (d) are developed using Company equipment, systems, or resources.

## 2. ASSIGNMENT

2.1 **Assignment.** Contractor hereby irrevocably assigns to Company all right, title, and interest in and to the Inventions and all associated intellectual property rights.
2.2 **Further Assurances.** Contractor will execute and deliver any documents and take any actions reasonably requested by Company to confirm, perfect, evidence, or enforce Company’s rights in the Inventions and Work Product, including filings and assignments with governmental authorities. If Contractor fails to do so promptly, Contractor hereby appoints Company as Contractor’s attorney-in-fact solely for such purpose to execute and deliver such documents on Contractor’s behalf. This power of attorney is irrevocable, coupled with an interest, and will survive termination of this Agreement to the extent permitted by law.
2.3 **Moral Rights.** To the maximum extent permitted by law, Contractor waives and agrees not to assert any moral rights or similar rights in the Work Product.
2.4 **Records.** Contractor agrees to keep and maintain adequate and current records (including notes, sketches, drawings, and electronic files) of all Inventions. Records relating to the Services or Work Product will be promptly provided to Company upon request and upon termination.

## 3. PRE-EXISTING IP DISCLOSURE

Contractor represents and warrants that the following is a complete list of all
inventions, original works of authorship, developments, improvements, and trade
secrets which were made by Contractor prior to commencement of this engagement
(collectively, "Prior Inventions"), which belong to Contractor, and which relate
to the Company's proposed business, products, or research and development:

[ ] No Prior Inventions [ ] See list below:

1. ---
2. ---
3. ---

If Contractor incorporates any Prior Inventions into a Company product or service, Contractor grants Company a non-exclusive, royalty-free, fully paid-up, irrevocable, perpetual, worldwide, transferable, and sublicensable license to make, have made, modify, use, reproduce, distribute, perform, display, sell, offer to sell, import, and otherwise exploit such Prior Inventions as part of or in connection with such product or service.

Contractor represents that Contractor will not incorporate any third-party materials into Work Product unless Contractor has the right to do so and has provided Company advance written notice identifying the materials and applicable license terms.

## 4. OPEN SOURCE SOFTWARE POLICY

Contractor shall not incorporate any third-party code or "open source" software into the Work Product unless:
(a) The license is a permissive license (e.g., MIT, Apache 2.0, BSD); AND
(b) The license does not require the Company to disclose its source code or license its proprietary software under "copyleft" terms (e.g., GPL, AGPL, LGPL unless dynamically linked, SSPL).

Contractor shall maintain a current log/inventory of all open source libraries used or modified.

---

# EXHIBIT B: SECURITY & ACCESS ADDENDUM

## 1. ACCESS CONTROLS

- **Least Privilege:** Contractor shall only request and use access levels
  necessary for the current task.
- **MFA:** Multi-Factor Authentication (MFA) must be enabled on all Company
  accounts (GitHub, AWS, Vercel, Google Workspace, etc.).
- **Password Manager:** Contractor must use a secure password manager and
  generate unique, complex passwords for all Company accounts.
- **Shared Accounts:** Account sharing is strictly prohibited.

## 2. DATA PROTECTION

- **No Production Data on Local Machines:** Contractor shall not download
  production database dumps or PII (Personally Identifiable Information) to
  local devices. Staging data should be anonymized.
- **Secrets Management:** tailored secrets (API keys, DB credentials) must not
  be hardcoded in source control. Use environment variables and approved secrets
  management tools.

## 3. INCIDENT REPORTING

Contractor must notify Company via [EMERGENCY CONTACT] within **24 hours** of
becoming aware of any actual or suspected unauthorized access, data breach, or
compromise of Contractor's devices used for Company work.

## 4. TERMINATION HANDOFF

Upon termination of engagement, Contractor shall within 48 hours:

1. Commit and push all final code changes.
2. Transfer all documentation and credentials.
3. Delete any local copies of Company source code and data.
4. Assist in the rotation of any shared secrets known to Contractor.
