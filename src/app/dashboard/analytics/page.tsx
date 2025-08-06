'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Mail, ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';

interface AnalyticsData {
  timeframe: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    orders: {
      total: number;
      paid: number;
      pending: number;
      failed: number;
    };
    revenue: {
      total: number;
      average_order_value: number;
      daily_trend: { date: string; amount: number }[];
    };
    contacts: {
      total: number;
      by_source: Record<string, number>;
      by_status: {
        total: number;
        contacted: number;
        qualified: number;
        closed: number;
      };
    };
    emails: {
      total: number;
      sent: number;
      failed: number;
      success_rate: number;
      by_template: Record<string, number>;
    };
    packages: Record<string, number>;
    conversion_funnel: {
      contacts: number;
      contacted: number;
      qualified: number;
      closed: number;
      contact_rate: number;
      qualification_rate: number;
      close_rate: number;
    };
  };
  recent_activity: Array<{
    id: string;
    type: string;
    customer: string;
    email: string;
    amount: number;
    package: string;
    status: string;
    created_at: string;
  }>;
}

interface PerformanceData {
  timeframe: string;
  kpis: {
    revenue: {
      current: number;
      previous: number;
      growth: number;
      trend: 'up' | 'down' | 'flat';
    };
    orders: {
      current: number;
      previous: number;
      growth: number;
      trend: 'up' | 'down' | 'flat';
    };
    conversion_rate: {
      current: number;
      previous: number;
      change: number;
    };
    email_success_rate: {
      current: number;
      previous: number;
      change: number;
    };
  };
  system_health: {
    webhook_success_rate: number;
    avg_processing_time_ms: number;
    recent_errors: Array<{
      id: string;
      error: string;
      created_at: string;
    }>;
  };
  trends: {
    daily_orders: Array<{ date: string; orders: number; revenue: number }>;
    daily_contacts: Array<{ date: string; contacts: number }>;
  };
  package_performance: Array<{
    package: string;
    orders: number;
    revenue: number;
    conversion_rate: number;
    avg_order_value: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [overviewResponse, performanceResponse] = await Promise.all([
        fetch(`/api/analytics/overview?timeframe=${timeframe}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}` // You'd need to implement auth token storage
          }
        }),
        fetch(`/api/analytics/performance?timeframe=${timeframe}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
      ]);

      if (!overviewResponse.ok || !performanceResponse.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [overview, performance] = await Promise.all([
        overviewResponse.json(),
        performanceResponse.json()
      ]);

      setAnalyticsData(overview);
      setPerformanceData(performance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'flat') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Error loading analytics: {error}</span>
            </div>
            <Button onClick={fetchAnalyticsData} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analyticsData || !performanceData) {
    return null;
  }

  // Prepare chart data
  const revenueChartData = analyticsData.metrics.revenue.daily_trend.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    revenue: item.amount / 100
  }));

  const packageChartData = Object.entries(analyticsData.metrics.packages).map(([pkg, count]) => ({
    name: pkg,
    value: count
  }));

  const funnelData = [
    { stage: 'Contacts', count: analyticsData.metrics.conversion_funnel.contacts },
    { stage: 'Contacted', count: analyticsData.metrics.conversion_funnel.contacted },
    { stage: 'Qualified', count: analyticsData.metrics.conversion_funnel.qualified },
    { stage: 'Closed', count: analyticsData.metrics.conversion_funnel.closed }
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Business Analytics</h1>
          <p className="text-muted-foreground">
            Track your business performance and growth metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalyticsData}>Refresh</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analyticsData.metrics.revenue.total)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getTrendIcon(performanceData.kpis.revenue.trend)}
                  <span>{formatPercentage(performanceData.kpis.revenue.growth)} vs previous period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.metrics.orders.total}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getTrendIcon(performanceData.kpis.orders.trend)}
                  <span>{formatPercentage(performanceData.kpis.orders.growth)} vs previous period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contacts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.metrics.contacts.total}</div>
                <div className="text-xs text-muted-foreground">
                  {formatPercentage(analyticsData.metrics.conversion_funnel.contact_rate)} contact rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Success</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(analyticsData.metrics.emails.success_rate)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {analyticsData.metrics.emails.sent} / {analyticsData.metrics.emails.total} sent
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Revenue",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Package Distribution</CardTitle>
                <CardDescription>Orders by package type</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    packages: {
                      label: "Packages",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={packageChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {packageChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Track prospects through the sales process</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Count",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(performanceData.kpis.conversion_rate.current)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {performanceData.kpis.conversion_rate.change > 0 ? '+' : ''}
                  {formatPercentage(performanceData.kpis.conversion_rate.change)} change
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avg Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analyticsData.metrics.revenue.average_order_value)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Email Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(performanceData.kpis.email_success_rate.current)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {performanceData.kpis.email_success_rate.change > 0 ? '+' : ''}
                  {formatPercentage(performanceData.kpis.email_success_rate.change)} change
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(performanceData.system_health.webhook_success_rate)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Webhook success rate
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Package Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Package Performance</CardTitle>
              <CardDescription>Revenue and conversion by package type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.package_performance.map((pkg) => (
                  <div key={pkg.package} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium capitalize">{pkg.package} Package</h4>
                      <p className="text-sm text-muted-foreground">
                        {pkg.orders} orders • {formatPercentage(pkg.conversion_rate)} conversion
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(pkg.revenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(pkg.avg_order_value)} avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest customer orders and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recent_activity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{activity.customer}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.email} • {activity.package} package
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(activity.amount)}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant={activity.status === 'paid' ? 'default' : 'secondary'}>
                          {activity.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Monitor system performance and errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Webhook Processing</h4>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>{formatPercentage(performanceData.system_health.webhook_success_rate)} success rate</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Avg processing time: {performanceData.system_health.avg_processing_time_ms.toFixed(0)}ms
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Recent Errors</h4>
                  {performanceData.system_health.recent_errors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent errors</p>
                  ) : (
                    <div className="space-y-2">
                      {performanceData.system_health.recent_errors.map((error) => (
                        <div key={error.id} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                          <div className="font-medium text-red-700">{error.error}</div>
                          <div className="text-red-600">{new Date(error.created_at).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}