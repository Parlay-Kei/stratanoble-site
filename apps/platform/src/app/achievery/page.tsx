import { Suspense } from 'react';
import { CrossPlatformIntegration } from '../../components/achievery/CrossPlatformIntegration';
import { MobileAppPrompt } from '../../components/achievery/MobileAppPrompt';
import { RequireAuth } from '../../lib/auth';
import { AchieveryDashboard } from './components/AchieveryDashboard';

export default function AchieveryPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Mobile App Prompt Banner */}
        <MobileAppPrompt variant="banner" />

        {/* Authenticated Dashboard Component */}
        <AchieveryDashboard />
      </div>
    </RequireAuth>
  );
}
