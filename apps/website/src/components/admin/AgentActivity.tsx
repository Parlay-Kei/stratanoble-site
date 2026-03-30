'use client';

import { useEffect, useState } from 'react';

interface AgentExecution {
  id: string;
  agentName: string;
  trigger: string;
  status: 'running' | 'success' | 'failed';
  startTime: string;
  endTime?: string;
  duration?: number;
  actionsTaken: number;
  filesModified: number;
  errors: number;
}

export function AgentActivity() {
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutions();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchExecutions, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchExecutions() {
    try {
      const response = await fetch('/api/admin/agents/activity');
      const data = await response.json();
      setExecutions(data.executions);
    } catch (error) {
      console.error('Failed to fetch agent activity:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading agent activity...</div>;
  }

  const runningAgents = executions.filter(e => e.status === 'running');
  const recentExecutions = executions.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Active Agents */}
      {runningAgents.length > 0 && (
        <div className="p-6 border-blue-500 bg-blue-50 rounded-lg shadow border">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            🤖 Active Agents ({runningAgents.length})
          </h3>
          <div className="space-y-3">
            {runningAgents.map(agent => (
              <div key={agent.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="animate-spin">⚙️</div>
                  <div>
                    <div className="font-medium text-blue-900">{agent.agentName}</div>
                    <div className="text-sm text-blue-600">
                      Trigger: {agent.trigger} • Started {getRelativeTime(agent.startTime)}
                    </div>
                  </div>
                </div>
                <div className="text-blue-600 font-mono text-sm">
                  {Math.round((Date.now() - new Date(agent.startTime).getTime()) / 1000)}s
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Executions */}
      <div className="p-6 rounded-lg shadow border bg-white">
        <h3 className="text-lg font-bold mb-4">Recent Agent Executions</h3>
        <div className="space-y-2">
          {recentExecutions.length === 0 ? (
            <div className="text-slate-grey text-center py-8">
              No recent agent executions
            </div>
          ) : (
            recentExecutions.map(execution => (
              <div
                key={execution.id}
                className={`p-4 rounded-lg border ${
                  execution.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : execution.status === 'failed'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {execution.status === 'success' ? '✅' : 
                         execution.status === 'failed' ? '❌' : '⚙️'}
                      </span>
                      <span className="font-medium">{execution.agentName}</span>
                      <span className="text-sm text-slate-grey">•</span>
                      <span className="text-sm text-gray-600">{execution.trigger}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {getRelativeTime(execution.startTime)}
                      {execution.duration && ` • ${(execution.duration / 1000).toFixed(2)}s`}
                      {execution.actionsTaken > 0 && ` • ${execution.actionsTaken} actions`}
                      {execution.filesModified > 0 && ` • ${execution.filesModified} files modified`}
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`/admin/agents/logs/${execution.id}`, '_blank')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Logs →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg shadow border bg-white">
          <div className="text-2xl font-bold text-green-600">
            {executions.filter(e => e.status === 'success').length}
          </div>
          <div className="text-sm text-gray-600">Successful</div>
        </div>
        <div className="p-4 rounded-lg shadow border bg-white">
          <div className="text-2xl font-bold text-red-600">
            {executions.filter(e => e.status === 'failed').length}
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
        <div className="p-4 rounded-lg shadow border bg-white">
          <div className="text-2xl font-bold text-blue-600">
            {executions.reduce((sum, e) => sum + e.actionsTaken, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Actions</div>
        </div>
        <div className="p-4 rounded-lg shadow border bg-white">
          <div className="text-2xl font-bold text-purple-600">
            {executions.reduce((sum, e) => sum + e.filesModified, 0)}
          </div>
          <div className="text-sm text-gray-600">Files Modified</div>
        </div>
      </div>
    </div>
  );
}

function getRelativeTime(timestamp: string): string {
  const seconds = Math.round((Date.now() - new Date(timestamp).getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86400)}d ago`;
}
