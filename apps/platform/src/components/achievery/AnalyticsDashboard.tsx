/**
 * ACHIEVERY Analytics Dashboard
 * Real-time metrics and success tracking for the ACHIEVERY platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@strata-noble/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, Smartphone, Target, DollarSign } from 'lucide-react';

interface AnalyticsData {
  week1Metrics: {
    mobileDownloads: number;
    crossPlatformUsage: number;
    notificationEngagement: number;
    appStoreRating: number;
  };
  month1Metrics: {
    totalDownloads: number;
    dailyActiveRetention: number;
    coachConsultations: number;
    revenueIncrease: number;
  };
  recentActivity: any[];
  performanceMetrics: any[];
  conversionFunnel: any[];
}

const GOALS = {
  week1: {
    mobileDownloads: 100,
    crossPlatformUsage: 25, // 25%
    notificationEngagement: 40, // 40%
    appStoreRating: 4.5
  },
  month1: {
    totalDownloads: 500,
    dailyActiveRetention: 60, // 60%
    coachConsultations: 10,
    revenueIncrease: 5000 // $5K ARR
  }
};

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/dashboard?range=${selectedTimeRange}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-emerald-600';
    if (progress >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const MetricCard = ({ title, current, goal, icon: Icon, suffix = '', isPercentage = false }: any) => {
    const progress = calculateProgress(current, goal);
    const isOnTrack = progress >= 75;

    return (
      <Card className={`border-l-4 ${isOnTrack ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${isOnTrack ? 'text-emerald-600' : 'text-red-600'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isPercentage ? `${current}%` : `${current}${suffix}`}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Goal: {isPercentage ? `${goal}%` : `${goal}${suffix}`}
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${isOnTrack ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ACHIEVERY Analytics</h1>
          <p className="text-gray-600">Track progress toward launch success metrics</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedTimeRange === range
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {analyticsData && (
        <>
          {/* Week 1 Success Metrics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Week 1 Success Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Mobile Downloads"
                current={analyticsData.week1Metrics.mobileDownloads}
                goal={GOALS.week1.mobileDownloads}
                icon={Smartphone}
              />
              <MetricCard
                title="Cross-Platform Usage"
                current={analyticsData.week1Metrics.crossPlatformUsage}
                goal={GOALS.week1.crossPlatformUsage}
                icon={Users}
                isPercentage={true}
              />
              <MetricCard
                title="Notification Engagement"
                current={analyticsData.week1Metrics.notificationEngagement}
                goal={GOALS.week1.notificationEngagement}
                icon={Target}
                isPercentage={true}
              />
              <MetricCard
                title="App Store Rating"
                current={analyticsData.week1Metrics.appStoreRating}
                goal={GOALS.week1.appStoreRating}
                icon={TrendingUp}
                suffix="★"
              />
            </div>
          </div>

          {/* Month 1 Success Metrics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Month 1 Success Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Downloads"
                current={analyticsData.month1Metrics.totalDownloads}
                goal={GOALS.month1.totalDownloads}
                icon={Smartphone}
              />
              <MetricCard
                title="Daily Active Retention"
                current={analyticsData.month1Metrics.dailyActiveRetention}
                goal={GOALS.month1.dailyActiveRetention}
                icon={Users}
                isPercentage={true}
              />
              <MetricCard
                title="Coach Consultations"
                current={analyticsData.month1Metrics.coachConsultations}
                goal={GOALS.month1.coachConsultations}
                icon={Target}
              />
              <MetricCard
                title="Revenue Increase"
                current={analyticsData.month1Metrics.revenueIncrease}
                goal={GOALS.month1.revenueIncrease}
                icon={DollarSign}
                suffix="K"
              />
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.recentActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="webUsers" stroke="#50C878" strokeWidth={2} />
                    <Line type="monotone" dataKey="mobileUsers" stroke="#001122" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#50C878" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>User Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.conversionFunnel.map((step, index) => {
                  const conversionRate = index > 0
                    ? ((step.users / analyticsData.conversionFunnel[index - 1].users) * 100).toFixed(1)
                    : '100.0';

                  return (
                    <div key={step.step} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium">{step.step}</h3>
                          <p className="text-sm text-gray-600">{step.users} users</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{conversionRate}%</div>
                        <div className="text-sm text-gray-500">conversion</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Success Summary */}
          <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">Launch Readiness Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    {analyticsData.week1Metrics.mobileDownloads + analyticsData.month1Metrics.totalDownloads}
                  </div>
                  <div className="text-sm text-gray-600">Total App Downloads</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    {analyticsData.week1Metrics.crossPlatformUsage}%
                  </div>
                  <div className="text-sm text-gray-600">Cross-Platform Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    ${analyticsData.month1Metrics.revenueIncrease}K
                  </div>
                  <div className="text-sm text-gray-600">ARR Increase</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}