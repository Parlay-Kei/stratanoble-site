import { Metadata } from 'next';
import { ContractDetail } from '@/components/admin/contracts/ContractDetail';
import { AdminGuard } from '@/components/auth/AdminGuard';

export const metadata: Metadata = {
  title: 'Contract Detail | Strata Noble Admin',
  description: 'View and edit contract details'
};

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <ContractDetail contractId={id} />
      </div>
    </AdminGuard>
  );
}
