'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Deal {
  id: string;
  client_name: string;
  client_legal_name: string;
  governing_law: string;
  pricing_model: string;
  ip_model: string;
  start_date: string;
  end_date: string;
  created_at: string;
  template_version?: string;
  playbook_version?: string;
  locked_at?: string;
  contracts?: { id: string; document_type: string; status: string }[];
}

const pricingModelLabels: Record<string, string> = {
  fixed_fee: 'Fixed Fee',
  time_materials: 'Time & Materials',
  retainer: 'Retainer',
  equity_partnership: 'Equity Partnership',
  blended: 'Blended',
};

const ipModelLabels: Record<string, string> = {
  client_owns: 'Client Owns All',
  provider_retains: 'Provider Retains',
  shared: 'Shared IP',
};

export function DealsList() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDealModal, setShowNewDealModal] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await (supabase as any)
      .from('deals')
      .select(`
        *,
        contracts(id, document_type, status)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deals:', error);
    } else {
      setDeals(data || []);
    }

    setLoading(false);
  }

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
            className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600"
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
            className="border-transparent py-2 px-1 text-sm font-medium text-slate-grey hover:border-slate-grey/30 hover:text-gray-700"
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

      {/* Actions */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowNewDealModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          + New Deal
        </button>
      </div>

      {/* Deals List */}
      {loading ? (
        <div className="p-8 text-center text-slate-grey">Loading deals...</div>
      ) : deals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-slate-grey" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deals yet</h3>
          <p className="text-slate-grey mb-4">
            Create a deal to start generating contracts for a client engagement.
          </p>
          <button
            onClick={() => setShowNewDealModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Your First Deal
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-void/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-grey uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-grey uppercase tracking-wider">
                  Pricing Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-grey uppercase tracking-wider">
                  IP Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-grey uppercase tracking-wider">
                  Contracts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-grey uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-grey uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-void/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{deal.client_name}</div>
                      {deal.client_legal_name && (
                        <div className="text-sm text-slate-grey">{deal.client_legal_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {pricingModelLabels[deal.pricing_model] || deal.pricing_model}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {ipModelLabels[deal.ip_model] || deal.ip_model}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {deal.contracts && deal.contracts.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {deal.contracts.map((contract) => (
                          <Link
                            key={contract.id}
                            href={`/admin/contracts/${contract.id}`}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-void/40 text-gray-600 hover:bg-gray-200"
                          >
                            {contract.document_type}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-grey">No contracts</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-grey">
                    {deal.start_date && deal.end_date ? (
                      <span>
                        {new Date(deal.start_date).toLocaleDateString()} - {new Date(deal.end_date).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-slate-grey">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      Generate Contract
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Deal Modal */}
      {showNewDealModal && (
        <NewDealModal onClose={() => setShowNewDealModal(false)} onCreated={fetchDeals} />
      )}
    </div>
  );
}

function NewDealModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_legal_name: '',
    governing_law: 'US-NV',
    pricing_model: 'fixed_fee',
    ip_model: 'provider_retains',
    services_description: '',
    start_date: '',
    end_date: '',
  });

  /**
   * Get current template version for MSA (most common starting point)
   * This locks the template version at deal creation time
   */
  async function getCurrentTemplateVersion(supabase: any, documentType: string, jurisdiction: string) {
    try {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('version')
        .eq('document_type', documentType)
        .eq('risk_profile', 'standard')
        .eq('jurisdiction', jurisdiction)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        // Fallback to hardcoded version if not in DB
        return 'MSA_v1.0.0';
      }

      return data.version;
    } catch {
      return 'MSA_v1.0.0';
    }
  }

  /**
   * Get current playbook version
   * Returns the latest playbook version identifier
   */
  async function getCurrentPlaybookVersion() {
    // For now, return a static version
    // In the future, this could query a playbook_versions table
    return '1.0.0';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    // Capture current versions at deal creation time
    const templateVersion = await getCurrentTemplateVersion(
      supabase,
      'MSA',
      formData.governing_law
    );
    const playbookVersion = await getCurrentPlaybookVersion();

    const dealData = {
      ...formData,
      template_version: templateVersion,
      playbook_version: playbookVersion,
      locked_at: new Date().toISOString(),
    };

    const { error } = await (supabase as any)
      .from('deals')
      .insert([dealData]);

    if (error) {
      console.error('Error creating deal:', error);
      alert('Failed to create deal: ' + error.message);
    } else {
      onCreated();
      onClose();
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-void/300 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-grey/25">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">New Deal</h3>
            <button onClick={onClose} className="text-slate-grey hover:text-gray-600">
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Name *</label>
              <input
                type="text"
                required
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-grey/30 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Legal Entity Name</label>
              <input
                type="text"
                value={formData.client_legal_name}
                onChange={(e) => setFormData({ ...formData, client_legal_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-grey/30 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Governing Law</label>
              <select
                value={formData.governing_law}
                onChange={(e) => setFormData({ ...formData, governing_law: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-grey/30 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="US-NV">Nevada (US-NV)</option>
                <option value="US-CA">California (US-CA)</option>
                <option value="US-DE">Delaware (US-DE)</option>
                <option value="US-NY">New York (US-NY)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pricing Model</label>
              <select
                value={formData.pricing_model}
                onChange={(e) => setFormData({ ...formData, pricing_model: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-grey/30 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="fixed_fee">Fixed Fee</option>
                <option value="time_materials">Time & Materials</option>
                <option value="retainer">Retainer</option>
                <option value="equity_partnership">Equity Partnership</option>
                <option value="blended">Blended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">IP Model</label>
              <select
                value={formData.ip_model}
                onChange={(e) => setFormData({ ...formData, ip_model: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-grey/30 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="provider_retains">Provider Retains</option>
                <option value="client_owns">Client Owns All</option>
                <option value="shared">Shared IP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Services Description</label>
            <textarea
              rows={3}
              value={formData.services_description}
              onChange={(e) => setFormData({ ...formData, services_description: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-grey/30 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe the services to be provided..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-grey/30 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-grey/30 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-grey/25 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-grey/30 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-void/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
