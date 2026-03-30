'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Clause {
  id: string;
  topic: string;
  clause_key: string;
  clause_name: string;
  risk_profile: string;
  jurisdiction: string;
  when_to_use: string;
  text: string;
  is_active: boolean;
}

const topicColors: Record<string, string> = {
  IP_OWNERSHIP: 'bg-purple-100 text-purple-800',
  LICENSE_GRANT: 'bg-indigo-100 text-indigo-800',
  CONFIDENTIALITY: 'bg-blue-100 text-blue-800',
  LIMITATION_OF_LIABILITY: 'bg-red-100 text-red-800',
  INDEMNITY: 'bg-orange-100 text-orange-800',
  PAYMENT_TERMS: 'bg-green-100 text-green-800',
  TERMINATION: 'bg-yellow-100 text-yellow-800',
  DISPUTE_RESOLUTION: 'bg-void/40 text-gray-800',
  WARRANTY: 'bg-teal-100 text-teal-800',
  FORCE_MAJEURE: 'bg-pink-100 text-pink-800',
};

const topics = [
  'IP_OWNERSHIP', 'LICENSE_GRANT', 'CONFIDENTIALITY', 'LIMITATION_OF_LIABILITY',
  'INDEMNITY', 'PAYMENT_TERMS', 'TERMINATION', 'DISPUTE_RESOLUTION', 'WARRANTY', 'FORCE_MAJEURE'
];

export function ClauseLibrary() {
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [expandedClause, setExpandedClause] = useState<string | null>(null);

  useEffect(() => {
    fetchClauses();
  }, [selectedTopic]);

  async function fetchClauses() {
    setLoading(true);
    const supabase = createClient();

    let query = (supabase as any)
      .from('clause_library')
      .select('*')
      .eq('is_active', true)
      .order('topic');

    if (selectedTopic !== 'all') {
      query = query.eq('topic', selectedTopic);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching clauses:', error);
    } else {
      setClauses(data || []);
    }

    setLoading(false);
  }

  // Group clauses by topic
  const groupedClauses = clauses.reduce((acc, clause) => {
    if (!acc[clause.topic]) {
      acc[clause.topic] = [];
    }
    acc[clause.topic].push(clause);
    return acc;
  }, {} as Record<string, Clause[]>);

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="border-b border-slate-grey/25">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/admin/contracts"
            className="border-transparent py-2 px-1 text-sm font-medium text-slate-grey hover:border-slate-grey/30 hover:text-gray-700"
          >
            All Contracts
          </Link>
          <Link
            href="/admin/contracts/deals"
            className="border-transparent py-2 px-1 text-sm font-medium text-slate-grey hover:border-slate-grey/30 hover:text-gray-700"
          >
            Deals
          </Link>
          <Link
            href="/admin/contracts/templates"
            className="border-transparent py-2 px-1 text-sm font-medium text-slate-grey hover:border-slate-grey/30 hover:text-gray-700"
          >
            Templates
          </Link>
          <Link
            href="/admin/contracts/clauses"
            className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600"
          >
            Clause Library
          </Link>
          <Link
            href="/admin/contracts/playbook"
            className="border-transparent py-2 px-1 text-sm font-medium text-slate-grey hover:border-slate-grey/30 hover:text-gray-700"
          >
            Playbook
          </Link>
        </nav>
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center">
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="rounded-md border-slate-grey/30 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Topics</option>
          {topics.map(topic => (
            <option key={topic} value={topic}>{topic.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          + Add Clause
        </button>
      </div>

      {/* Clauses */}
      {loading ? (
        <div className="p-8 text-center text-slate-grey">Loading clauses...</div>
      ) : clauses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-slate-grey mb-4">No clauses found</p>
          <p className="text-sm text-slate-grey">
            Run the database seed script to populate the clause library
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedClauses).map(([topic, topicClauses]) => (
            <div key={topic} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-void/30 border-b border-slate-grey/25">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {topic.replace(/_/g, ' ')}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${topicColors[topic] || 'bg-void/40 text-gray-800'}`}>
                    {topicClauses.length} clause{topicClauses.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {topicClauses.map((clause) => (
                  <div key={clause.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-md font-medium text-gray-900">
                            {clause.clause_name}
                          </h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-void/40 text-gray-600">
                            {clause.risk_profile.replace('_', ' ')}
                          </span>
                        </div>

                        <p className="text-sm text-slate-grey mb-2">
                          {clause.when_to_use}
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-slate-grey">
                          <span>{clause.clause_key}</span>
                          <span>{clause.jurisdiction}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedClause(expandedClause === clause.id ? null : clause.id)}
                        className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                      >
                        {expandedClause === clause.id ? 'Hide' : 'View'} Text
                      </button>
                    </div>

                    {expandedClause === clause.id && (
                      <div className="mt-4 p-4 bg-void/30 rounded-md">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                          {clause.text}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
