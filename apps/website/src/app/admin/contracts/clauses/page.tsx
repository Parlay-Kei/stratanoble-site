import { Metadata } from 'next';
import { ClauseLibrary } from '@/components/admin/contracts/ClauseLibrary';
import { AdminGuard } from '@/components/auth/AdminGuard';

export const metadata: Metadata = {
  title: 'Clause Library | Strata Noble Admin',
  description: 'Manage reusable contract clauses'
};

export const dynamic = 'force-dynamic';

export default function ClausesPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Clause Library</h1>
          <p className="mt-2 text-gray-600">
            Manage reusable contract clauses organized by topic
          </p>
        </div>

        <ClauseLibrary />
      </div>
    </AdminGuard>
  );
}
