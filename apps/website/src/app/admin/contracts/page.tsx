import { Metadata } from 'next';
import { ContractsDashboard } from '@/components/admin/contracts/ContractsDashboard';
import { AdminGuard } from '@/components/auth/AdminGuard';

export const metadata: Metadata = {
  title: 'Contracts | Strata Noble Admin',
  description: 'Manage contracts, templates, and clause library'
};

export const dynamic = 'force-dynamic';

export default function ContractsPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
          <p className="mt-2 text-gray-600">
            Generate, manage, and track client contracts
          </p>
        </div>

        <ContractsDashboard />
      </div>
    </AdminGuard>
  );
}
