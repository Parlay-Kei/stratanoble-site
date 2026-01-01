import { Metadata } from 'next';
import { PlaybookRules } from '@/components/admin/contracts/PlaybookRules';
import { AdminGuard } from '@/components/auth/AdminGuard';

export const metadata: Metadata = {
  title: 'Negotiation Playbook | Strata Noble Admin',
  description: 'Manage negotiation rules and policies'
};

export const dynamic = 'force-dynamic';

export default function PlaybookPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Negotiation Playbook</h1>
          <p className="mt-2 text-gray-600">
            Configure negotiation rules, acceptable alternatives, and deal-breakers
          </p>
        </div>

        <PlaybookRules />
      </div>
    </AdminGuard>
  );
}
