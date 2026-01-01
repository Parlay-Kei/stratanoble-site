'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface PlaybookRule {
  id: string;
  topic: string;
  rule_key: string;
  jurisdiction: string;
  default_position: string;
  acceptable_alternatives: { position: string; conditions: string; notes: string }[];
  unacceptable_positions: { position: string; reason: string; hard_stop: boolean }[];
  escalation_required: boolean;
  escalation_reason: string;
  notes_for_ai: string;
  priority: number;
  is_active: boolean;
}

const priorityColors: Record<number, string> = {
  100: 'bg-red-100 text-red-800',
  75: 'bg-orange-100 text-orange-800',
  50: 'bg-yellow-100 text-yellow-800',
  25: 'bg-green-100 text-green-800',
};

export function PlaybookRules() {
  const [rules, setRules] = useState<PlaybookRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await (supabase as any)
      .from('playbook_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching playbook rules:', error);
    } else {
      setRules(data || []);
    }

    setLoading(false);
  }

  function getPriorityColor(priority: number): string {
    if (priority >= 90) return priorityColors[100];
    if (priority >= 70) return priorityColors[75];
    if (priority >= 40) return priorityColors[50];
    return priorityColors[25];
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/admin/contracts"
            className="border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            All Contracts
          </Link>
          <Link
            href="/admin/contracts/deals"
            className="border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            Deals
          </Link>
          <Link
            href="/admin/contracts/templates"
            className="border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            Templates
          </Link>
          <Link
            href="/admin/contracts/clauses"
            className="border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            Clause Library
          </Link>
          <Link
            href="/admin/contracts/playbook"
            className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600"
          >
            Playbook
          </Link>
        </nav>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Negotiation Playbook</h2>
        <p className="text-indigo-100">
          These rules define StrataNoble default positions, acceptable alternatives,
          and deal-breakers for contract negotiations. The AI agent uses these rules
          to generate contracts and flag items requiring human review.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          + Add Rule
        </button>
      </div>

      {/* Rules List */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading playbook rules...</div>
      ) : rules.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No playbook rules found</p>
          <p className="text-sm text-gray-400">
            Run the database seed script to populate playbook rules
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div
                className="px-6 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(rule.priority)}`}>
                      Priority: {rule.priority}
                    </span>
                    <h3 className="text-lg font-medium text-gray-900">
                      {rule.topic.replace(/_/g, ' ')}
                    </h3>
                    {rule.escalation_required && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Requires Escalation
                      </span>
                    )}
                  </div>
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform ${expandedRule === rule.id ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Default:</span> {rule.default_position}
                </p>
              </div>

              {expandedRule === rule.id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-4">
                  {/* Acceptable Alternatives */}
                  {rule.acceptable_alternatives && rule.acceptable_alternatives.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-2">Acceptable Alternatives</h4>
                      <ul className="space-y-2">
                        {rule.acceptable_alternatives.map((alt, idx) => (
                          <li key={idx} className="text-sm bg-green-50 p-3 rounded-md">
                            <div className="font-medium text-green-800">{alt.position}</div>
                            {alt.conditions && (
                              <div className="text-green-600 mt-1">Conditions: {alt.conditions}</div>
                            )}
                            {alt.notes && (
                              <div className="text-green-500 mt-1 text-xs">{alt.notes}</div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Unacceptable Positions */}
                  {rule.unacceptable_positions && rule.unacceptable_positions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2">Unacceptable (Deal Breakers)</h4>
                      <ul className="space-y-2">
                        {rule.unacceptable_positions.map((pos, idx) => (
                          <li key={idx} className="text-sm bg-red-50 p-3 rounded-md">
                            <div className="flex items-center">
                              <span className="font-medium text-red-800">{pos.position}</span>
                              {pos.hard_stop && (
                                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-200 text-red-900">
                                  HARD STOP
                                </span>
                              )}
                            </div>
                            <div className="text-red-600 mt-1">{pos.reason}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI Notes */}
                  {rule.notes_for_ai && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">AI Agent Instructions</h4>
                      <div className="text-sm bg-blue-50 p-3 rounded-md text-blue-800">
                        {rule.notes_for_ai}
                      </div>
                    </div>
                  )}

                  {/* Escalation */}
                  {rule.escalation_required && rule.escalation_reason && (
                    <div>
                      <h4 className="text-sm font-medium text-orange-700 mb-2">Escalation Reason</h4>
                      <div className="text-sm bg-orange-50 p-3 rounded-md text-orange-800">
                        {rule.escalation_reason}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 flex justify-end">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Edit Rule
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
