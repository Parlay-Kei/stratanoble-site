import { Metadata } from 'next';
import { DevOpsMonitor } from '@/components/admin/DevOpsMonitor';

export const metadata: Metadata = {
  title: 'DevOps Monitor | Strata Noble',
  description: 'Real-time infrastructure and service health monitoring'
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function DevOpsPage() {
  return <DevOpsMonitor />;
}
