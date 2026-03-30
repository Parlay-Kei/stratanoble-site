'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Contract {
  id: string;
  document_type: string;
  title: string;
  status: string;
  version: number;
  content: {
    sections?: { id: string; title: string; content: string }[];
    variables?: Record<string, string>;
  };
  rendered_text: string;
  risk_profile: string;
  jurisdiction: string;
  effective_date: string;
  expiration_date: string;
  parties: { role: string; name: string; legal_name: string }[];
  review_notes: string;
  created_at: string;
  updated_at: string;
  deal?: {
    id: string;
    client_name: string;
    client_legal_name: string;
  };
}

interface ContractVersion {
  id: string;
  version: number;
  change_type: string;
  changes_summary: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-void/40 text-gray-800',
  review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  signed: 'bg-green-100 text-green-800',
  active: 'bg-field-sage/15 text-forest-green',
  terminated: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
};

export function ContractDetail({ contractId }: { contractId: string }) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [versions, setVersions] = useState<ContractVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'sections' | 'versions'>('preview');

  useEffect(() => {
    fetchContract();
    fetchVersions();
  }, [contractId]);

  async function fetchContract() {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await (supabase as any)
      .from('contracts')
      .select(`
        *,
        deal:deals(id, client_name, client_legal_name)
      `)
      .eq('id', contractId)
      .single();

    if (error) {
      console.error('Error fetching contract:', error);
    } else {
      setContract(data);
    }

    setLoading(false);
  }

  async function fetchVersions() {
    const supabase = createClient();

    const { data, error } = await (supabase as any)
      .from('contract_versions')
      .select('id, version, change_type, changes_summary, created_at')
      .eq('contract_id', contractId)
      .order('version', { ascending: false });

    if (error) {
      console.error('Error fetching versions:', error);
    } else {
      setVersions(data || []);
    }
  }

  async function updateStatus(newStatus: string) {
    const supabase = createClient();

    const { error } = await (supabase as any)
      .from('contracts')
      .update({ status: newStatus })
      .eq('id', contractId);

    if (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } else {
      fetchContract();
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-grey">Loading contract...</div>;
  }

  if (!contract) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-grey mb-4">Contract not found</p>
        <Link href="/admin/contracts" className="text-blue-600 hover:text-blue-800">
          Back to Contracts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4">
            <Link href="/admin/contracts" className="text-slate-grey hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {contract.title || `${contract.document_type} Contract`}
            </h1>
          </div>
          {contract.deal && (
            <p className="mt-1 text-sm text-slate-grey">
              Client: {contract.deal.client_name}
              {contract.deal.client_legal_name && ` (${contract.deal.client_legal_name})`}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[contract.status]}`}>
            {contract.status}
          </span>
          <span className="text-sm text-slate-grey">v{contract.version}</span>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <dt className="text-sm font-medium text-slate-grey">Document Type</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900">{contract.document_type}</dd>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <dt className="text-sm font-medium text-slate-grey">Risk Profile</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900 capitalize">{contract.risk_profile.replace('_', ' ')}</dd>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <dt className="text-sm font-medium text-slate-grey">Jurisdiction</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900">{contract.jurisdiction}</dd>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <dt className="text-sm font-medium text-slate-grey">Created</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900">
            {new Date(contract.created_at).toLocaleDateString()}
          </dd>
        </div>
      </div>

      {/* Status Actions */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Status Actions</h3>
        <div className="flex space-x-3">
          {contract.status === 'draft' && (
            <button
              onClick={() => updateStatus('review')}
              className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
            >
              Send for Review
            </button>
          )}
          {contract.status === 'review' && (
            <>
              <button
                onClick={() => updateStatus('approved')}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus('draft')}
                className="px-4 py-2 bg-void/40 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Return to Draft
              </button>
            </>
          )}
          {contract.status === 'approved' && (
            <button
              onClick={() => updateStatus('signed')}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
            >
              Mark as Signed
            </button>
          )}
          {contract.status === 'signed' && (
            <button
              onClick={() => updateStatus('active')}
              className="px-4 py-2 bg-field-sage/15 text-forest-green rounded-md hover:bg-emerald-200"
            >
              Activate Contract
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-slate-grey/25">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'preview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-grey hover:text-gray-700'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'sections'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-grey hover:text-gray-700'
              }`}
            >
              Sections
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'versions'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-grey hover:text-gray-700'
              }`}
            >
              Version History ({versions.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'preview' && (
            <div className="prose max-w-none">
              {contract.rendered_text ? (
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                  {contract.rendered_text}
                </pre>
              ) : (
                <p className="text-slate-grey">No rendered text available</p>
              )}
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-4">
              {contract.content?.sections?.map((section) => (
                <div key={section.id} className="border border-slate-grey/25 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{section.title}</h4>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
              )) || <p className="text-slate-grey">No sections available</p>}
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-4">
              {versions.length === 0 ? (
                <p className="text-slate-grey">No version history available</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-grey uppercase">Version</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-grey uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-grey uppercase">Summary</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-grey uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {versions.map((version) => (
                      <tr key={version.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">v{version.version}</td>
                        <td className="px-4 py-3 text-sm text-slate-grey capitalize">{version.change_type}</td>
                        <td className="px-4 py-3 text-sm text-slate-grey">{version.changes_summary || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-grey">
                          {new Date(version.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Notes */}
      {contract.review_notes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Review Notes</h3>
          <p className="text-sm text-yellow-700">{contract.review_notes}</p>
        </div>
      )}
    </div>
  );
}
