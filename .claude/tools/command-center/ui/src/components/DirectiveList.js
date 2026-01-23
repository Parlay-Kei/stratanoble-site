import React from 'react';
import './DirectiveList.css';

const DirectiveList = ({ directives, onSelect }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PLANNED':
        return 'status-planned';
      case 'EXECUTING':
        return 'status-executing';
      case 'COMPLETED':
        return 'status-completed';
      case 'FAILED':
        return 'status-failed';
      default:
        return 'status-pending';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'critical':
        return 'priority-critical';
      case 'high':
        return 'priority-high';
      case 'normal':
        return 'priority-normal';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-normal';
    }
  };

  return (
    <div className="directive-list">
      <h2>Directives</h2>
      {directives.length === 0 ? (
        <div className="empty-state">
          <p>No directives found. Create your first directive to get started.</p>
        </div>
      ) : (
        <div className="directive-grid">
          {directives.map((directive) => (
            <div
              key={directive.id}
              className="directive-card"
              onClick={() => onSelect(directive)}
            >
              <div className="directive-header">
                <h3>{directive.title}</h3>
                <span className={`priority-badge ${getPriorityClass(directive.priority)}`}>
                  {directive.priority || 'normal'}
                </span>
              </div>

              <div className="directive-meta">
                <span className="scope">Scope: {directive.scope}</span>
                <span className="intent">Intent: {directive.intent}</span>
                <span className={`status ${getStatusClass(directive.status)}`}>
                  {directive.status || 'PENDING'}
                </span>
              </div>

              <div className="directive-body">
                <p>{directive.body.substring(0, 200)}...</p>
              </div>

              <div className="directive-footer">
                <span className="owner">Owner: {directive.owner}</span>
                <span className="created">{formatDate(directive.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DirectiveList;