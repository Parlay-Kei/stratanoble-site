'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Template {
  id: string;
  document_type: string;
  template_key: string;
  template_name: string;
  description: string;
  version: string;
  risk_profile: string;
  jurisdiction: string;
  is_active: boolean;
  created_at: string;
}

const riskProfileColors: Record<string, string> = {
  standard: 'bg-gray-100 text-gray-800',
  customer_friendly: 'bg-blue-100 text-blue-800',
  vendor_friendly: 'bg-green-100 text-green-800',
};

export function TemplateLibrary() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchTemplates();
  }, [selectedType]);

  async function fetchTemplates() {
    setLoading(true);
    const supabase = createClient();

    let query = (supabase as any)
      .from('contract_templates')
      .select('*')
      .eq('is_active', true)
      .order('document_type');

    if (selectedType !== 'all') {
      query = query.eq('document_type', selectedType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
    } else {
      setTemplates(data || []);
    }

    setLoading(false);
  }

  const documentTypes = [
    'MSA', 'SOW', 'CHANGE_ORDER', 'NDA', 'IP_ADDENDUM', 'PAYMENT_POLICY'
  ];

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
            className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600"
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
            className="border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            Playbook
          </Link>
        </nav>
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          {documentTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          + Add Template
        </button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No templates found</p>
          <p className="text-sm text-gray-400">
            Run the database seed script to populate templates
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div key={template.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {template.document_type}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskProfileColors[template.risk_profile]}`}>
                    {template.risk_profile.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {template.template_name}
                </h3>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {template.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">v{template.version}</span>
                  <span className="text-gray-400">{template.jurisdiction}</span>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3">
                <div className="flex justify-between">
                  <button className="text-sm text-gray-600 hover:text-gray-900">
                    Preview
                  </button>
                  <button className="text-sm text-blue-600 hover:text-blue-900">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
