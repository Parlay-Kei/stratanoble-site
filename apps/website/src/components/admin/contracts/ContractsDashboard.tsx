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
  jurisdiction: string;
  created_at: string;
  deal?: {
    client_name: string;
  };
}

interface Stats {
  total: number;
  draft: number;
  review: number;
  approved: number;
  signed: number;
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

const documentTypeIcons: Record<string, string> = {
  MSA: 'file-contract',
  SOW: 'clipboard-list',
  CHANGE_ORDER: 'file-edit',
  NDA: 'file-lock',
  IP_ADDENDUM: 'file-code',
  PAYMENT_POLICY: 'file-invoice-dollar',
};

export function ContractsDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, draft: 0, review: 0, approved: 0, signed: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchContracts();
  }, [filter]);

  async function fetchContracts() {
    setLoading(true);
    const supabase = createClient();

    let query = (supabase as any)
      .from('contracts')
      .select(`
        id,
        document_type,
        title,
        status,
        version,
        jurisdiction,
        created_at,
        deal:deals(client_name)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contracts:', error);
    } else {
      setContracts(data || []);
    }

    // Fetch stats
    const { data: allContracts } = await (supabase as any)
      .from('contracts')
      .select('status');

    if (allContracts) {
      const newStats: Stats = {
        total: allContracts.length,
        draft: allContracts.filter((c: { status: string }) => c.status === 'draft').length,
        review: allContracts.filter((c: { status: string }) => c.status === 'review').length,
        approved: allContracts.filter((c: { status: string }) => c.status === 'approved').length,
        signed: allContracts.filter((c: { status: string }) => c.status === 'signed').length,
      };
      setStats(newStats);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-slate-grey/25">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/admin/contracts"
            className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Contracts" value={stats.total} color="bg-void/300" />
        <StatCard label="Draft" value={stats.draft} color="bg-gray-400" />
        <StatCard label="In Review" value={stats.review} color="bg-yellow-500" />
        <StatCard label="Approved" value={stats.approved} color="bg-blue-500" />
        <StatCard label="Signed" value={stats.signed} color="bg-green-500" />
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-slate-grey/30 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="approved">Approved</option>
            <option value="signed">Signed</option>
            <option value="active">Active</option>
          </select>
        </div>

        <Link
          href="/admin/contracts/deals"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          + New Contract
        </Link>
      </div>

      {/* Contracts Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {loading ? (
          <div className="p-8 text-center text-slate-grey">Loading contracts...</div>
        ) : contracts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-grey mb-4">No contracts found</p>
            <Link
              href="/admin/contracts/deals"
              className="text-blue-600 hover:text-blue-800"
            >
              Create your first contract
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-void/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-grey uppercase tracking-wider">
                  Contract
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-grey uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-grey uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-grey uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-grey uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-grey uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-grey uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-void/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/admin/contracts/${contract.id}`} className="text-blue-600 hover:text-blue-800">
                      {contract.title || `${contract.document_type} Contract`}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-grey">
                    {contract.deal?.client_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-void/40 text-gray-800">
                      {contract.document_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[contract.status] || 'bg-void/40 text-gray-800'}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-grey">
                    v{contract.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-grey">
                    {new Date(contract.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/contracts/${contract.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${color} rounded-md p-3`}>
            <span className="text-white text-xl font-bold">{value}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-grey truncate">{label}</dt>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
