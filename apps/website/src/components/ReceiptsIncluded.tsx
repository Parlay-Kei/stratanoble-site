import React from 'react';

/**
 * ReceiptsIncluded - ProofLoop verification section
 *
 * Shows what verification receipts are included with each offer.
 * This is data they trust because it's about their system.
 *
 * Variant: 'lead-rescue' | 'pipeline' determines which receipts to show.
 */

interface ReceiptsIncludedProps {
  variant: 'lead-rescue' | 'pipeline';
}

const leadRescueReceipts = [
  { label: 'Response-time setup verified', icon: 'clock' },
  { label: 'Lead routing tested', icon: 'route' },
  { label: 'Follow-up sequence verified', icon: 'mail' },
  { label: 'Tracking dashboard verified', icon: 'chart' },
];

const pipelineReceipts = [
  { label: 'Response-time setup verified', icon: 'clock' },
  { label: 'CRM configuration tested', icon: 'database' },
  { label: 'Automation workflows verified', icon: 'zap' },
  { label: 'Email sequences tested', icon: 'mail' },
  { label: 'Dashboard data flow verified', icon: 'chart' },
  { label: 'Full handoff documentation', icon: 'file' },
];

const iconMap: Record<string, JSX.Element> = {
  clock: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  route: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  mail: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  chart: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  database: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  zap: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  file: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

export function ReceiptsIncluded({ variant }: ReceiptsIncludedProps) {
  const receipts = variant === 'lead-rescue' ? leadRescueReceipts : pipelineReceipts;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-emerald-900">Receipts Included</h3>
      </div>

      <p className="text-sm text-emerald-800 mb-4">
        Every install includes ProofLoop verification receipts. You see exactly what was built, tested, and delivered.
      </p>

      <ul className="space-y-2">
        {receipts.map((receipt, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-emerald-900">
            <span className="text-emerald-600 flex-shrink-0">
              {iconMap[receipt.icon]}
            </span>
            <span>{receipt.label}</span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-emerald-700 mt-4 pt-4 border-t border-emerald-200">
        No "trust me bro" delivery. Your receipts prove the work.
      </p>
    </div>
  );
}
