import React, { useEffect, useState } from 'react';
import './JobsView.css';

const JobsView = ({ run, onRerunFailed }) => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    executing: 0,
    pending: 0
  });

  useEffect(() => {
    // Extract jobs from run data
    const runJobs = run?.jobs || run?.run?.jobs || [];
    setJobs(runJobs);

    // Calculate stats
    const newStats = {
      total: runJobs.length,
      completed: runJobs.filter(j => j.status === 'COMPLETED' || j.status === 'SUCCESS').length,
      failed: runJobs.filter(j => j.status === 'FAILED' || j.status === 'ERROR').length,
      executing: runJobs.filter(j => j.status === 'EXECUTING').length,
      pending: runJobs.filter(j => j.status === 'PENDING').length
    };
    setStats(newStats);
  }, [run]);

  const formatDuration = (start, end) => {
    if (!start) return '-';
    if (!end) return 'Running...';

    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = endTime - startTime;

    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}m`;
  };

  const getJobStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'SUCCESS':
        return '[OK]';
      case 'FAILED':
      case 'ERROR':
        return '[X]';
      case 'EXECUTING':
        return '[>]';
      case 'PENDING':
        return '[.]';
      default:
        return '[?]';
    }
  };

  const getProgressPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const runId = run?.run_id || run?.run?.id || 'Unknown';
  const runStatus = run?.status || run?.run?.status || 'UNKNOWN';

  return (
    <div className="jobs-view">
      <div className="jobs-header">
        <h2>Job Execution</h2>
        <div className="run-info">
          <span className="run-id">Run ID: {runId}</span>
          <span className={`run-status status-${runStatus.toLowerCase()}`}>
            {runStatus}
          </span>
        </div>
      </div>

      <div className="execution-stats">
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card success">
          <span className="stat-label">Completed</span>
          <span className="stat-value">{stats.completed}</span>
        </div>
        <div className="stat-card executing">
          <span className="stat-label">Executing</span>
          <span className="stat-value">{stats.executing}</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{stats.pending}</span>
        </div>
        <div className="stat-card failed">
          <span className="stat-label">Failed</span>
          <span className="stat-value">{stats.failed}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${getProgressPercentage()}%` }}
        >
          {getProgressPercentage()}%
        </div>
      </div>

      <div className="job-timeline">
        <h3>Execution Timeline</h3>
        {jobs.length === 0 ? (
          <div className="no-jobs">
            <p>No jobs to display</p>
          </div>
        ) : (
          <div className="timeline-list">
            {jobs.map((job, index) => (
              <div
                key={job.id || index}
                className={`timeline-item status-${(job.status || 'pending').toLowerCase()}`}
              >
                <div className="timeline-marker">
                  {getJobStatusIcon(job.status)}
                </div>
                <div className="timeline-content">
                  <div className="job-info">
                    <span className="job-name">{job.name || job.job_name}</span>
                    <span className="job-type">{job.type || job.job_type}</span>
                  </div>
                  <div className="job-timing">
                    <span className="duration">
                      Duration: {formatDuration(job.started_at, job.completed_at)}
                    </span>
                    {job.attempts > 1 && (
                      <span className="attempts">Attempts: {job.attempts}</span>
                    )}
                  </div>
                  {job.error && (
                    <div className="job-error">
                      <span className="error-label">Error:</span>
                      <span className="error-message">{job.error}</span>
                    </div>
                  )}
                  {job.output && (
                    <div className="job-output">
                      <span className="output-label">Output:</span>
                      <pre className="output-content">{job.output}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {stats.failed > 0 && (
        <div className="jobs-actions">
          <button
            className="btn btn-warning"
            onClick={onRerunFailed}
          >
            Rerun Failed Jobs ({stats.failed})
          </button>
        </div>
      )}
    </div>
  );
};

export default JobsView;