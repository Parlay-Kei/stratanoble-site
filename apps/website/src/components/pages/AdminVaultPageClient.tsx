'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Shield, Key, AlertTriangle, CheckCircle, Clock, Plus, Search, Eye, RefreshCw } from "lucide-react";
interface Credential { id: string; service_name: string; environment: string; credential_type: string; credential_name: string; description: string | null; last_rotated: string; next_rotation_due: string; is_active: boolean; owner_email: string | null; }
interface RotationSummary { total: number; overdue: number; urgent: number; upcoming: number; }
export function AdminVaultPageClient() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [summary, setSummary] = useState<RotationSummary>({ total: 0, overdue: 0, urgent: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);
  useEffect(() => { fetchCredentials(); }, [selectedEnvironment, showInactive]);
    async function fetchCredentials() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedEnvironment !== 'all') params.append('environment', selectedEnvironment);
      if (showInactive) params.append('includeInactive', 'true');

      // Get Supabase session token and include in Authorization header
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/vault/list-public?${params.toString()}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      const data = await response.json();
      if (response.ok) { setCredentials(data.credentials); setSummary(data.summary); } else { console.error('Failed to fetch credentials:', data.error); }
    } catch (e) { console.error('Error fetching credentials:', e); } finally { setLoading(false); }
  }
  const filteredCredentials = credentials.filter((cred) => cred.service_name.toLowerCase().includes(searchTerm.toLowerCase()) || cred.credential_name.toLowerCase().includes(searchTerm.toLowerCase()));
  function getRotationStatus(nextDue: string) {
    const daysUntil = Math.floor((new Date(nextDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return { status: 'overdue', color: 'red', text: 'Overdue' };
    if (daysUntil < 7) return { status: 'urgent', color: 'orange', text: `${daysUntil} days` };
    if (daysUntil < 30) return { status: 'upcoming', color: 'yellow', text: `${daysUntil} days` };
    return { status: 'current', color: 'green', text: `${daysUntil} days` };
  }
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2"><Shield className="w-8 h-8 text-blue-600" /><h1 className="text-3xl font-bold text-gray-900">Credentials Vault</h1></div>
        <p className="text-gray-600">Secure encrypted storage for all API keys and service credentials</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6"><div className="flex items-center justify-between mb-2"><span className="text-gray-600 text-sm">Total Credentials</span><Key className="w-5 h-5 text-blue-500" /></div><p className="text-3xl font-bold text-gray-900">{summary.total}</p></div>
        <div className="bg-white rounded-lg shadow p-6"><div className="flex items-center justify-between mb-2"><span className="text-gray-600 text-sm">Overdue</span><AlertTriangle className="w-5 h-5 text-red-500" /></div><p className="text-3xl font-bold text-red-600">{summary.overdue}</p></div>
        <div className="bg-white rounded-lg shadow p-6"><div className="flex items-center justify-between mb-2"><span className="text-gray-600 text-sm">Urgent (7 days)</span><Clock className="w-5 h-5 text-orange-500" /></div><p className="text-3xl font-bold text-orange-600">{summary.urgent}</p></div>
        <div className="bg-white rounded-lg shadow p-6"><div className="flex items-center justify-between mb-2"><span className="text-gray-600 text-sm">Upcoming (30 days)</span><CheckCircle className="w-5 h-5 text-yellow-500" /></div><p className="text-3xl font-bold text-yellow-600">{summary.upcoming}</p></div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Search services or credentials..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
          <select value={selectedEnvironment} onChange={(e) => setSelectedEnvironment(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="all">All Environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" /><span className="text-sm text-gray-700">Show Inactive</span></label>
          <button onClick={() => router.push('/admin/vault/create')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Plus className="w-5 h-5" /><span>Add Credential</span></button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credential</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Environment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rotation Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Rotated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading credentials...</td></tr>
              ) : filteredCredentials.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No credentials found</td></tr>
              ) : (
                filteredCredentials.map((cred) => {
                  const rotationStatus = getRotationStatus(cred.next_rotation_due);
                  return (
                    <tr key={cred.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{cred.service_name}</div></td>
                      <td className="px-6 py-4"><div className="text-sm text-gray-900">{cred.credential_name}</div>{cred.description && (<div className="text-xs text-gray-500 mt-1">{cred.description}</div>)}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs font-medium rounded-full ${cred.environment === 'production' ? 'bg-red-100 text-red-800' : cred.environment === 'staging' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{cred.environment}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cred.credential_type.replace('_', ' ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs font-medium rounded-full ${rotationStatus.color === 'red' ? 'bg-red-100 text-red-800' : rotationStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' : rotationStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{rotationStatus.text}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(cred.last_rotated).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => router.push(`/admin/vault/${cred.id}`)} className="text-blue-600 hover:text-blue-900 mr-3"><Eye className="w-5 h-5" /></button>
                        <button onClick={() => router.push(`/admin/vault/${cred.id}/rotate`)} className="text-green-600 hover:text-green-900"><RefreshCw className="w-5 h-5" /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
