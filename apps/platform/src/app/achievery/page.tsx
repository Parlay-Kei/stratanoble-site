"use client";
import { Suspense } from 'react';
import { CrossPlatformIntegration } from '../../components/achievery/CrossPlatformIntegration';
import { MobileAppPrompt } from '../../components/achievery/MobileAppPrompt';
import { AchieveryDashboard } from './components/AchieveryDashboard';
import { useAuth } from '../providers';

export default function AchieveryPage() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in to continue</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile App Prompt Banner */}
      <MobileAppPrompt variant="banner" />

      {/* Authenticated Dashboard Component */}
      <AchieveryDashboard />
    </div>
  );
}
