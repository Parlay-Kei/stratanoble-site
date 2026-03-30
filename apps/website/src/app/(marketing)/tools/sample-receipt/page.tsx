import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sample ProofLoop Receipt | Strata Noble',
  description: 'See what a ProofLoop verification receipt pack looks like. Build receipts, runtime health, smoke tests, and handoff documentation.',
};

/**
 * Sample ProofLoop Receipt Page
 *
 * Shows a redacted example of what clients receive after a Lead Rescue or Pipeline Buildout.
 * This is the trust weapon - proof that we deliver with receipts.
 */

export default function SampleReceiptPage() {
  return (
    <main className="min-h-screen bg-void/30">
      {/* Header */}
      <section className="bg-command-navy text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/tools" className="text-sm text-slate-grey hover:text-white mb-4 inline-block">
            ← Back to Tools
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Sample ProofLoop Receipt Pack</h1>
          <p className="text-gray-300">
            This is what you receive after every Lead Rescue or Pipeline Buildout. Redacted for privacy.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* ProofLoop Status */}
        <ReceiptCard title="PROOFLOOP_STATUS.md">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
{`# ProofLoop Verification Status
Project: [REDACTED] Lead Rescue
Date: 2026-01-03
Verdict: ✅ PASS

## Summary
- Build: PASS
- TypeScript: PASS (0 errors)
- ESLint: PASS (warnings only)
- Runtime Health: PASS (5/5 endpoints)
- Smoke Tests: PASS (3/3 flows)
- DNS Resolution: PASS

## Handoff Ready: YES
All verification gates passed. Client handoff approved.`}
          </pre>
        </ReceiptCard>

        {/* Runtime Health */}
        <ReceiptCard title="runtime_health_receipt.txt">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
{`Runtime Health Check - 2026-01-03 14:32:00 UTC

Endpoints Tested:
  ✅ GET  /api/health           200 OK    (42ms)
  ✅ GET  /api/intake/status    200 OK    (38ms)
  ✅ POST /api/intake/lead      201 OK    (156ms)
  ✅ GET  /api/crm/leads        200 OK    (89ms)
  ✅ POST /api/notify/email     200 OK    (234ms)

All endpoints responding within acceptable latency.
No 4xx or 5xx errors detected.`}
          </pre>
        </ReceiptCard>

        {/* Smoke Test */}
        <ReceiptCard title="smoke_test_receipts.md">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
{`# Smoke Test Results

## Flow 1: Lead Submission
- Form renders correctly: ✅
- Validation works: ✅
- Submission succeeds: ✅
- Lead appears in CRM: ✅
- Confirmation email sent: ✅

## Flow 2: Follow-up Sequence
- Sequence triggered on new lead: ✅
- Email 1 delivered: ✅
- Email 2 scheduled: ✅
- Email 3 scheduled: ✅

## Flow 3: Dashboard Access
- Dashboard loads: ✅
- Lead data displays: ✅
- Status updates work: ✅`}
          </pre>
        </ReceiptCard>

        {/* DNS Resolution */}
        <ReceiptCard title="dns_resolution_check.txt">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
{`DNS Resolution Verification

Domain: [REDACTED].com
  ✅ A record resolves
  ✅ CNAME configured correctly
  ✅ SSL certificate valid (expires 2027-01-15)

Email Domain: [REDACTED].com
  ✅ MX records configured
  ✅ SPF record present
  ✅ DKIM configured
  ✅ No NXDOMAIN errors

All DNS configurations verified.`}
          </pre>
        </ReceiptCard>

        {/* Folder Structure */}
        <ReceiptCard title="ANX Vault Folder Structure">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
{`📁 [CLIENT]_Lead_Rescue_2026-01-03/
├── 📁 receipts/
│   ├── PROOFLOOP_STATUS.md
│   ├── build_receipt.txt
│   ├── runtime_health_receipt.txt
│   ├── smoke_test_receipts.md
│   └── dns_resolution_check.txt
├── 📁 documentation/
│   ├── HANDOFF_CHECKLIST.md
│   ├── system_overview.md
│   └── troubleshooting_guide.md
├── 📁 recordings/
│   ├── loom_walkthrough.url
│   └── handoff_call_notes.md
└── 📁 credentials/
    └── CREDENTIALS.md (encrypted)`}
          </pre>
        </ReceiptCard>

        {/* CTA */}
        <div className="bg-command-navy text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to get your own receipt pack?</h2>
          <p className="text-gray-300 mb-6">
            Every Lead Rescue includes a ProofLoop verification pack stored in your ANX Vault.
          </p>
          <Link
            href="/lead-rescue"
            className="inline-block bg-forest-green text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Start the 48-Hour Lead Rescue
          </Link>
        </div>
      </div>
    </main>
  );
}

function ReceiptCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <div className="bg-void/40 border-b px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <span className="text-sm font-mono text-gray-600 ml-2">{title}</span>
      </div>
      <div className="p-4 bg-void/30">{children}</div>
    </div>
  );
}
