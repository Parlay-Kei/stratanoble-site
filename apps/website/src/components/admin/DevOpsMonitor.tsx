'use client';

import { useEffect, useState } from 'react';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: string;
  uptime: number;
}

interface EnvironmentVar {
  name: string;
  configured: boolean;
  category: string;
}

interface AgentMetrics {
  autonomyLevel: number;
  tasksCompleted: number;
  tasksAutoResolved: number;
  averageResolutionTime: number;
}

interface HealthData {
  services: ServiceHealth[];
  environment: EnvironmentVar[];
  agent: AgentMetrics;
  timestamp: string;
}

export function DevOpsMonitor() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/admin/devops/health');
      if (!response.ok) throw new Error('Health check failed');

      const healthData = await response.json();
      setData(healthData);
      setLastUpdate(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-command-navy">
        <div className="text-white text-xl">Loading DevOps Monitor...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-command-navy">
        <div className="text-red-400 text-xl">Error: {error || 'No data available'}</div>
      </div>
    );
  }

  const healthyServices = data.services.filter(s => s.status === 'healthy').length;
  const systemHealth = Math.round((healthyServices / data.services.length) * 100);

  const configuredVars = data.environment.filter(e => e.configured).length;
  const envConfigPercent = Math.round((configuredVars / data.environment.length) * 100);

  const avgResponseTime = Math.round(
    data.services.reduce((sum, s) => sum + s.responseTime, 0) / data.services.length
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-field-sage';
      case 'degraded': return 'text-yellow-400';
      case 'down': return 'text-red-400';
      default: return 'text-slate-grey';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-forest-green/20 border-forest-green/30';
      case 'degraded': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'down': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-void/300/20 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-command-navy p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">DevOps Monitor</h1>
          <p className="text-slate-grey">
            Real-time infrastructure and service health monitoring
          </p>
          <p className="text-slate-grey text-sm mt-2">
            Last updated: {lastUpdate} • Auto-refresh: 30s
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* System Health */}
          <div className="bg-command-navy/50 backdrop-blur-sm border border-slate-grey/30 rounded-lg p-6">
            <div className="text-slate-grey text-sm font-medium mb-2">System Health</div>
            <div className="text-4xl font-bold text-white mb-1">{systemHealth}%</div>
            <div className="text-sm text-slate-grey">
              {healthyServices}/{data.services.length} services healthy
            </div>
          </div>

          {/* Environment Config */}
          <div className="bg-command-navy/50 backdrop-blur-sm border border-slate-grey/30 rounded-lg p-6">
            <div className="text-slate-grey text-sm font-medium mb-2">Environment Config</div>
            <div className="text-4xl font-bold text-white mb-1">{envConfigPercent}%</div>
            <div className="text-sm text-slate-grey">
              {configuredVars}/{data.environment.length} variables configured
            </div>
          </div>

          {/* Agent Autonomy */}
          <div className="bg-command-navy/50 backdrop-blur-sm border border-slate-grey/30 rounded-lg p-6">
            <div className="text-slate-grey text-sm font-medium mb-2">Agent Autonomy</div>
            <div className="text-4xl font-bold text-field-sage mb-1">{data.agent.autonomyLevel}%</div>
            <div className="text-sm text-slate-grey">
              {data.agent.tasksAutoResolved}/{data.agent.tasksCompleted} auto-resolved
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-command-navy/50 backdrop-blur-sm border border-slate-grey/30 rounded-lg p-6">
            <div className="text-slate-grey text-sm font-medium mb-2">Avg Response Time</div>
            <div className="text-4xl font-bold text-white mb-1">{avgResponseTime}ms</div>
            <div className="text-sm text-slate-grey">
              Across all services
            </div>
          </div>
        </div>

        {/* Service Health Table */}
        <div className="bg-command-navy/50 backdrop-blur-sm border border-slate-grey/30 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Service Health</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-700">
                  <th className="text-left py-3 px-4 text-slate-grey font-medium">Service</th>
                  <th className="text-left py-3 px-4 text-slate-grey font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-slate-grey font-medium">Response Time</th>
                  <th className="text-right py-3 px-4 text-slate-grey font-medium">Uptime</th>
                  <th className="text-left py-3 px-4 text-slate-grey font-medium">Last Check</th>
                </tr>
              </thead>
              <tbody>
                {data.services.map((service, index) => (
                  <tr key={index} className="border-b border-navy-800/50 hover:bg-command-navy/30">
                    <td className="py-3 px-4 text-white font-medium">{service.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBg(service.status)}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${service.status === 'healthy' ? 'bg-emerald-400' : service.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
                        <span className={getStatusColor(service.status)}>
                          {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-grey">{service.responseTime}ms</td>
                    <td className="py-3 px-4 text-right text-slate-grey">{service.uptime}%</td>
                    <td className="py-3 px-4 text-slate-grey text-sm">
                      {new Date(service.lastCheck).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-command-navy/50 backdrop-blur-sm border border-slate-grey/30 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Environment Variables</h2>
          {['Database', 'Payments', 'AI', 'Voice', 'Auth'].map((category) => {
            const categoryVars = data.environment.filter(e => e.category === category);
            if (categoryVars.length === 0) return null;

            return (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-lg font-semibold text-field-sage mb-3">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryVars.map((envVar, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        envVar.configured
                          ? 'bg-forest-green/10 border-forest-green/30'
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <span className="text-slate-grey text-sm font-mono">{envVar.name}</span>
                      {envVar.configured ? (
                        <svg className="w-5 h-5 text-field-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Agent Performance */}
        <div className="bg-command-navy/50 backdrop-blur-sm border border-slate-grey/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Agent Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-slate-grey text-sm mb-1">Autonomy Level</div>
              <div className="text-3xl font-bold text-field-sage">{data.agent.autonomyLevel}%</div>
            </div>
            <div>
              <div className="text-slate-grey text-sm mb-1">Tasks Completed</div>
              <div className="text-3xl font-bold text-white">{data.agent.tasksCompleted}</div>
            </div>
            <div>
              <div className="text-slate-grey text-sm mb-1">Auto-Resolved</div>
              <div className="text-3xl font-bold text-white">{data.agent.tasksAutoResolved}</div>
            </div>
            <div>
              <div className="text-slate-grey text-sm mb-1">Avg Resolution Time</div>
              <div className="text-3xl font-bold text-white">{data.agent.averageResolutionTime}h</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
