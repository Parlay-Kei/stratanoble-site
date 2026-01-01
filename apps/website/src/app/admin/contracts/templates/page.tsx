import { Metadata } from 'next';
import { TemplateLibrary } from '@/components/admin/contracts/TemplateLibrary';
import { AdminGuard } from '@/components/auth/AdminGuard';

export const metadata: Metadata = {
  title: 'Contract Templates | Strata Noble Admin',
  description: 'Manage contract templates'
};

export const dynamic = 'force-dynamic';

export default function TemplatesPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contract Templates</h1>
          <p className="mt-2 text-gray-600">
            Manage base contract templates for document generation
          </p>
        </div>

        <TemplateLibrary />
      </div>
    </AdminGuard>
  );
}
