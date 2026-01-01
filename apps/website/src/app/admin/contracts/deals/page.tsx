import { Metadata } from 'next';
import { DealsList } from '@/components/admin/contracts/DealsList';
import { AdminGuard } from '@/components/auth/AdminGuard';

export const metadata: Metadata = {
  title: 'Deals | Strata Noble Admin',
  description: 'Manage client deals and engagement intake'
};

export const dynamic = 'force-dynamic';

export default function DealsPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="mt-2 text-gray-600">
            Manage client engagement intake data for contract generation
          </p>
        </div>

        <DealsList />
      </div>
    </AdminGuard>
  );
}
