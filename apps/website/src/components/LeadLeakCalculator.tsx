'use client';

import { useState } from 'react';

/**
 * LeadLeakCalculator - Simple ROI visualization
 *
 * Shows estimated monthly revenue leakage based on:
 * - Leads per week
 * - % missed/unanswered
 * - Average job value
 *
 * The point is clarity, not precision.
 */
export function LeadLeakCalculator() {
  const [leadsPerWeek, setLeadsPerWeek] = useState<number>(10);
  const [missedPercent, setMissedPercent] = useState<number>(40);
  const [avgJobValue, setAvgJobValue] = useState<number>(500);

  // Calculate estimated monthly leakage (range)
  const weeklyMissed = Math.round(leadsPerWeek * (missedPercent / 100));
  const monthlyMissed = weeklyMissed * 4;

  // Assume 20-40% of missed leads would have converted
  const lowConversion = 0.2;
  const highConversion = 0.4;

  const lowLeakage = Math.round(monthlyMissed * lowConversion * avgJobValue);
  const highLeakage = Math.round(monthlyMissed * highConversion * avgJobValue);

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-1">Lead Leak Calculator</h3>
      <p className="text-sm text-muted-foreground mb-6">
        See what missed follow-ups might be costing you.
      </p>

      <div className="space-y-5">
        {/* Leads per week */}
        <div>
          <label className="text-sm font-medium flex justify-between">
            <span>Leads per week</span>
            <span className="text-primary font-bold">{leadsPerWeek}</span>
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={leadsPerWeek}
            onChange={(e) => setLeadsPerWeek(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
          />
        </div>

        {/* Missed percent */}
        <div>
          <label className="text-sm font-medium flex justify-between">
            <span>% missed or slow response</span>
            <span className="text-primary font-bold">{missedPercent}%</span>
          </label>
          <input
            type="range"
            min="10"
            max="80"
            step="5"
            value={missedPercent}
            onChange={(e) => setMissedPercent(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
          />
        </div>

        {/* Avg job value */}
        <div>
          <label className="text-sm font-medium flex justify-between">
            <span>Average job value</span>
            <span className="text-primary font-bold">${avgJobValue.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={avgJobValue}
            onChange={(e) => setAvgJobValue(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
          />
        </div>
      </div>

      {/* Result */}
      <div className="mt-6 pt-6 border-t border-red-200">
        <p className="text-sm text-muted-foreground mb-2">Estimated monthly leakage:</p>
        <p className="text-2xl md:text-3xl font-bold text-red-600">
          ${lowLeakage.toLocaleString()} – ${highLeakage.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Based on {monthlyMissed} missed leads/mo × 20-40% conversion rate
        </p>

        {/* ROI anchor - operator language */}
        {lowLeakage > 0 && (
          <p className="text-sm text-forest-green font-medium mt-3 bg-field-sage/10 rounded px-3 py-2">
            Recover {Math.ceil(997 / avgJobValue)} job{Math.ceil(997 / avgJobValue) > 1 ? 's' : ''} and Lead Rescue pays for itself.
          </p>
        )}

        <p className="text-[10px] text-muted-foreground mt-2 italic">
          Estimate. ProofLoop finds the real leak.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-4">
        <a
          href="#form"
          className="block w-full text-center bg-red-600 text-white py-3 px-4 rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors"
        >
          Run ProofLoop on my site
        </a>
      </div>
    </div>
  );
}
