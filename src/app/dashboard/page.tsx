'use client';

import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import SubscriptionManager from '@/components/SubscriptionManager';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#0066CC]">
      <Container className="py-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-[#C0C0C0]">
            Welcome to your social media analytics hub
          </p>
        </div>

        {/* Data Not Connected Banner */}
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-yellow-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-1">
                Data not connected yet
              </h3>
              <p className="text-yellow-200">
                Connect your social media accounts to start seeing analytics data.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">
                Performance Overview
              </h2>
              
              {/* Placeholder Chart */}
              <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-[#50C878] mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-[#C0C0C0]">
                    Charts will appear here once data is connected
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[#C0C0C0]">Total Views</span>
                  <span className="text-white font-semibold">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#C0C0C0]">Engagement Rate</span>
                  <span className="text-white font-semibold">--%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#C0C0C0]">Followers</span>
                  <span className="text-white font-semibold">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#C0C0C0]">Revenue</span>
                  <span className="text-white font-semibold">$--</span>
                </div>
              </div>
            </div>

            {/* Connect Accounts */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Connect Accounts
              </h3>
              <div className="space-y-3">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Connect YouTube
                </Button>
                <Button className="w-full bg-black hover:bg-gray-800 text-white">
                  Connect TikTok
                </Button>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  Connect Instagram
                </Button>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  Connect Twitter
                </Button>
              </div>
            </div>

            {/* Subscription Management */}
            <SubscriptionManager 
              customerId="cus_test123" // This would come from auth/database in production
              currentPlan="lite" // This would come from database in production
              subscriptionStatus="active" // This would come from database in production
            />

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="text-[#C0C0C0] text-sm">
                  No recent activity to display
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {/* Weekly Digest */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Weekly Digest
            </h2>
            <p className="text-[#C0C0C0] mb-6">
              Get your weekly performance summary delivered to your inbox every Monday.
            </p>
            <Button className="bg-[#50C878] hover:bg-[#3DB067] text-white">
              Configure Digest
            </Button>
          </div>

          {/* Automation Tools */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Automation Tools
            </h2>
            <p className="text-[#C0C0C0] mb-6">
              Set up automated workflows for content scheduling, affiliate tracking, and more.
            </p>
            <Button className="bg-[#50C878] hover:bg-[#3DB067] text-white">
              Setup Automation
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
