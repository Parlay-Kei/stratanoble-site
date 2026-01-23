import React, { useState } from 'react';
import './PlanView.css';

const PlanView = ({ plan, directive, onExecute }) => {
  const [expandedJobs, setExpandedJobs] = useState({});

  const toggleJobExpanded = (jobId) => {
    setExpandedJobs(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const getJobStatusClass = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'job-success';
      case 'FAILED':
        return 'job-failed';
      case 'EXECUTING':
        return 'job-executing';
      case 'PENDING':
        return 'job-pending';
      default:
        return 'job-default';
    }
  };

  const renderJobDependencies = (deps) => {
    if (!deps || deps.length === 0) return 'None';
    return deps.join(', ');
  };

  const renderJobPayload = (payload) => {
    if (!payload) return null;
    return (
      <pre className="job-payload">
        {JSON.stringify(payload, null, 2)}
      </pre>
    );
  };

  // Handle both formats - plan might be nested or direct
  const actualPlan = plan?.plan || plan;
  const jobGraph = actualPlan?.job_graph || [];

  return (
    <div className="plan-view">
      <div className="plan-header">
        <h2>Execution Plan</h2>
        {directive && (
          <div className="directive-info">
            <h3>{directive.title}</h3>
            <p className="directive-intent">Intent: {directive.intent} | Scope: {directive.scope}</p>
          </div>
        )}
      </div>

      <div className="plan-metadata">
        <div className="metadata-item">
          <span className="label">Plan ID:</span>
          <span className="value">{actualPlan?.id || actualPlan?.plan_id || 'N/A'}</span>
        </div>
        <div className="metadata-item">
          <span className="label">Signature:</span>
          <span className="value signature">{actualPlan?.signature || 'Unsigned'}</span>
        </div>
        <div className="metadata-item">
          <span className="label">Total Jobs:</span>
          <span className="value">{jobGraph.length}</span>
        </div>
      </div>

      <div className="job-graph">
        <h3>Job Graph</h3>
        {jobGraph.length === 0 ? (
          <div className="empty-jobs">
            <p>No jobs in this plan</p>
          </div>
        ) : (
          <div className="job-list">
            {jobGraph.map((job) => (
              <div
                key={job.id}
                className={`job-item ${getJobStatusClass(job.status)} ${expandedJobs[job.id] ? 'expanded' : ''}`}
              >
                <div
                  className="job-header"
                  onClick={() => toggleJobExpanded(job.id)}
                >
                  <div className="job-title">
                    <span className="job-id">{job.id}</span>
                    <span className="job-name">{job.name}</span>
                  </div>
                  <div className="job-meta">
                    <span className="job-type">{job.type}</span>
                    {job.retries !== undefined && (
                      <span className="job-retries">Retries: {job.retries}</span>
                    )}
                    <span className="expand-icon">{expandedJobs[job.id] ? '▼' : '▶'}</span>
                  </div>
                </div>

                {expandedJobs[job.id] && (
                  <div className="job-details">
                    <div className="detail-row">
                      <span className="detail-label">Dependencies:</span>
                      <span className="detail-value">{renderJobDependencies(job.dependencies)}</span>
                    </div>
                    {job.output && (
                      <div className="detail-row">
                        <span className="detail-label">Output:</span>
                        <span className="detail-value">{job.output}</span>
                      </div>
                    )}
                    {job.payload && (
                      <div className="detail-row">
                        <span className="detail-label">Payload:</span>
                        <div className="detail-value">
                          {renderJobPayload(job.payload)}
                        </div>
                      </div>
                    )}
                    {job.error && (
                      <div className="detail-row error">
                        <span className="detail-label">Error:</span>
                        <span className="detail-value">{job.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="plan-actions">
        <button
          className="btn btn-primary"
          onClick={onExecute}
          disabled={jobGraph.length === 0}
        >
          Execute Plan
        </button>
      </div>
    </div>
  );
};

export default PlanView;