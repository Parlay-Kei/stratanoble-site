import React, { useState } from 'react';
import './DirectiveForm.css';

const DirectiveForm = ({ onSubmit, systemContext }) => {
  const [directive, setDirective] = useState({
    title: '',
    body: '',
    scope: 'project',
    intent: 'execute',
    owner: 'OCS',
    priority: 'normal'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!directive.title || !directive.body) {
      alert('Title and body are required');
      return;
    }

    // Validate project context if scope is project
    if (directive.scope === 'project' && !systemContext?.active_project_root) {
      alert('Project scope selected but no project root is set. Please select a project first using the context switcher.');
      return;
    }

    onSubmit(directive);
    setDirective({
      title: '',
      body: '',
      scope: 'project',
      intent: 'execute',
      owner: 'OCS',
      priority: 'normal'
    });
  };

  // Check if form should be disabled
  const isProjectScopeInvalid = directive.scope === 'project' && !systemContext?.active_project_root;

  return (
    <div className="directive-form">
      <h2>Create New Directive</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={directive.title}
            onChange={(e) => setDirective({ ...directive, title: e.target.value })}
            placeholder="e.g., Deploy Feature X to Production"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="body">Body</label>
          <textarea
            id="body"
            value={directive.body}
            onChange={(e) => setDirective({ ...directive, body: e.target.value })}
            placeholder="Describe the directive in detail..."
            rows="10"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="scope">Scope</label>
            <select
              id="scope"
              value={directive.scope}
              onChange={(e) => setDirective({ ...directive, scope: e.target.value })}
            >
              <option value="project">Project</option>
              <option value="global">Global</option>
              <option value="local">Local</option>
              <option value="infrastructure">Infrastructure</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="intent">Intent</label>
            <select
              id="intent"
              value={directive.intent}
              onChange={(e) => setDirective({ ...directive, intent: e.target.value })}
            >
              <option value="execute">Execute</option>
              <option value="validate">Validate</option>
              <option value="deploy">Deploy</option>
              <option value="rollback">Rollback</option>
              <option value="monitor">Monitor</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={directive.priority}
              onChange={(e) => setDirective({ ...directive, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Warning message for project scope without project root */}
        {isProjectScopeInvalid && (
          <div className="validation-warning">
            ⚠️ Project scope selected but no project root is set.
            Click the PROJECT button in the header to select a project first.
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isProjectScopeInvalid}
            title={isProjectScopeInvalid ? 'Select a project root first' : ''}
          >
            Create Directive
          </button>
        </div>
      </form>
    </div>
  );
};

export default DirectiveForm;