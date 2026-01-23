import React from 'react';
import './OpsControl.css';

const OpsControl = ({ status, onKillSwitch, onRefresh }) => {
  const { config, queue_stats, recent_exceptions, system_status } = status;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getBudgetUsagePercentage = () => {
    if (!config?.budget_caps?.daily_operations) return 0;
    const used = queue_stats?.total || 0;
    const cap = config.budget_caps.daily_operations;
    return Math.min(100, Math.round((used / cap) * 100));
  };

  return (
    <div className="ops-control">
      <div className="ops-header">
        <h2>Operations Control</h2>
        <button className="btn-refresh" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      <div className="kill-switch-section">
        <h3>System Control</h3>
        <div className="kill-switch-container">
          <div className="system-status">
            <span className="status-label">System Status:</span>
            <span className={`status-value ${system_status === 'RUNNING' ? 'running' : 'stopped'}`}>
              {system_status}
            </span>
          </div>
          <button
            className={`kill-switch ${config?.kill_switch ? 'active' : ''}`}
            onClick={() => onKillSwitch(!config?.kill_switch)}
          >
            {config?.kill_switch ? 'SYSTEM STOPPED - Click to Resume' : 'EMERGENCY STOP'}
          </button>
        </div>
      </div>

      <div className="budget-section">
        <h3>Budget Caps</h3>
        <div className="budget-grid">
          <div className="budget-item">
            <span className="budget-label">Daily Operations</span>
            <div className="budget-progress">
              <div className="progress-track">
                <div
                  className="progress-value"
                  style={{ width: `${getBudgetUsagePercentage()}%` }}
                />
              </div>
              <span className="budget-text">
                {queue_stats?.total || 0} / {config?.budget_caps?.daily_operations || 1000}
              </span>
            </div>
          </div>
          <div className="budget-item">
            <span className="budget-label">Max Job Retries</span>
            <span className="budget-value">{config?.budget_caps?.max_job_retries || 3}</span>
          </div>
          <div className="budget-item">
            <span className="budget-label">Max Concurrent Jobs</span>
            <span className="budget-value">{config?.budget_caps?.max_concurrent_jobs || 10}</span>
          </div>
        </div>
      </div>

      <div className="queue-section">
        <h3>Queue Statistics (Last 24h)</h3>
        <div className="queue-stats">
          <div className="stat-box">
            <span className="stat-label">Total</span>
            <span className="stat-value">{queue_stats?.total || 0}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Pending</span>
            <span className="stat-value pending">{queue_stats?.pending || 0}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Executing</span>
            <span className="stat-value executing">{queue_stats?.executing || 0}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Completed</span>
            <span className="stat-value success">{queue_stats?.completed || 0}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Failed</span>
            <span className="stat-value failed">{queue_stats?.failed || 0}</span>
          </div>
        </div>
      </div>

      <div className="exceptions-section">
        <h3>Recent Exceptions (Last Hour)</h3>
        {recent_exceptions && recent_exceptions.length > 0 ? (
          <div className="exceptions-list">
            {recent_exceptions.map((exception, index) => (
              <div key={exception.id || index} className="exception-item">
                <div className="exception-header">
                  <span className="exception-id">ID: {exception.id}</span>
                  <span className="exception-time">{formatDate(exception.created_at)}</span>
                </div>
                <div className="exception-error">
                  {exception.last_error || 'Unknown error'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-exceptions">
            <p>No recent exceptions</p>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>System Settings</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <span className="setting-label">Exceptions Enabled</span>
            <span className={`setting-value ${config?.exceptions_enabled ? 'enabled' : 'disabled'}`}>
              {config?.exceptions_enabled ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Auto Recovery</span>
            <span className={`setting-value ${config?.auto_recovery ? 'enabled' : 'disabled'}`}>
              {config?.auto_recovery ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpsControl;