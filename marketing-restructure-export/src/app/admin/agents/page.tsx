import { Metadata } from 'next';
import { AgentActivity } from '../../../components/admin/AgentActivity';

export const metadata: Metadata = {
  title: 'Agent Activity | Strata Noble Admin',
  description: 'Monitor autonomous agent executions'
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function AgentActivityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🤖 Agent Activity</h1>
        <p className="mt-2 text-gray-600">
          Monitor autonomous agent executions and performance
        </p>
      </div>

      <AgentActivity />
    </div>
  );
}
