import React, { useState, useEffect } from 'react';
import './App.css';
import DirectiveForm from './components/DirectiveForm';
import DirectiveList from './components/DirectiveList';
import PlanView from './components/PlanView';
import JobsView from './components/JobsView';
import OpsControl from './components/OpsControl';
import Cockpit from './components/Cockpit';
import axios from 'axios';
import { buildApiUrl } from './lib/apiBase';

// Use dynamic API base resolution
const API_BASE = buildApiUrl('');

function App() {
  const [activeTab, setActiveTab] = useState('cockpit');
  const [directives, setDirectives] = useState([]);
  const [selectedDirective, setSelectedDirective] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentRun, setCurrentRun] = useState(null);
  const [opsStatus, setOpsStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [lastStatusUpdate, setLastStatusUpdate] = useState(null);
  const [lastKnownStatus, setLastKnownStatus] = useState(null);
  const [backendStatus, setBackendStatus] = useState('STARTING');
  const [lastCrashReason, setLastCrashReason] = useState(null);
  const [systemContext, setSystemContext] = useState(null);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [knownProjects, setKnownProjects] = useState([]);
  const [manualPath, setManualPath] = useState('');

  // Fetch directives
  const fetchDirectives = async () => {
    try {
      const response = await axios.get(`${API_BASE}/directives`);
      setDirectives(response.data.directives);
    } catch (error) {
      console.error('Error fetching directives:', error);
    }
  };

  // Fetch ops status
  const fetchOpsStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/ops/status`);
      setOpsStatus(response.data);
    } catch (error) {
      console.error('Error fetching ops status:', error);
    }
  };

  // Fetch unified system status
  const fetchSystemStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/system/status`, { timeout: 3000 });
      const status = response.data;
      setSystemStatus(status);
      setLastStatusUpdate(new Date());
      setLastKnownStatus(status);

      // Update legacy states for compatibility
      setBackendStatus(status.api.status === 'online' ? 'ONLINE' : 'OFFLINE');
      setSystemContext(status.context);
      setLastCrashReason(null);
    } catch (error) {
      console.error('System status check failed:', error);

      // Use last known status if available
      if (lastKnownStatus) {
        setSystemStatus({
          ...lastKnownStatus,
          api: { ...lastKnownStatus.api, status: 'offline' },
          health: { ...lastKnownStatus.health, api: 'offline', overall: 'degraded' }
        });
      }

      setBackendStatus('OFFLINE');

      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setLastCrashReason('Connection refused - API server may have crashed');
      } else if (error.code === 'ECONNRESET') {
        setLastCrashReason('Connection reset - API server restarting');
      } else {
        setLastCrashReason(`Status check failed: ${error.message}`);
      }
    }
  };

  // Legacy context fetch - now included in system status
  const fetchSystemContext = async () => {
    // Context is now fetched as part of system status
    await fetchSystemStatus();
  };

  // Fetch known projects
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE}/projects`, { timeout: 3000 });
      setKnownProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  // Set project context
  const handleSetProject = async (projectRoot) => {
    try {
      const response = await axios.post(`${API_BASE}/context/project`, {
        project_root: projectRoot
      });
      if (response.data.ok) {
        await fetchSystemContext();
        setShowContextPanel(false);
        setManualPath('');
      }
    } catch (error) {
      console.error('Failed to set project context:', error);
      alert('Failed to set project: ' + (error.response?.data?.error || error.message));
    }
  };

  // Clear project context
  const handleClearContext = async () => {
    try {
      const response = await axios.post(`${API_BASE}/context/clear`);
      if (response.data.ok) {
        await fetchSystemContext();
        setShowContextPanel(false);
      }
    } catch (error) {
      console.error('Failed to clear context:', error);
      alert('Failed to clear context: ' + (error.response?.data?.error || error.message));
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    fetchDirectives();
    fetchOpsStatus();
    fetchProjects();

    // Refresh every 5 seconds
    const interval = setInterval(() => {
      if (currentRun) {
        fetchCurrentRun();
      }
      fetchOpsStatus();
      fetchSystemStatus();
      fetchSystemContext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentRun]);

  const fetchCurrentRun = async () => {
    if (!currentRun) return;
    try {
      const response = await axios.get(`${API_BASE}/runs/${currentRun.run_id}`);
      setCurrentRun(response.data);
    } catch (error) {
      console.error('Error fetching run:', error);
    }
  };

  const handleCreateDirective = async (directive) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/directives`, directive);
      setSelectedDirective(response.data.directive);
      setSelectedPlan(response.data.plan);
      fetchDirectives();
      setActiveTab('plan');
    } catch (error) {
      console.error('Error creating directive:', error);
      alert('Failed to create directive: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExecutePlan = async (planId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/plans/${planId}/execute`);
      setCurrentRun(response.data);
      setActiveTab('jobs');
    } catch (error) {
      console.error('Error executing plan:', error);
      alert('Failed to execute plan: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRerunFailed = async (planId, runId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/plans/${planId}/rerun-failed`, {
        run_id: runId
      });
      setCurrentRun(response.data);
      setActiveTab('jobs');
    } catch (error) {
      console.error('Error rerunning failed jobs:', error);
      alert('Failed to rerun jobs: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleKillSwitch = async (enabled) => {
    try {
      await axios.post(`${API_BASE}/ops/kill-switch`, { enabled });
      fetchOpsStatus();
    } catch (error) {
      console.error('Error toggling kill switch:', error);
      alert('Failed to toggle kill switch: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ANX Command Center</h1>
        <div className="context-strip">
          <button
            className={`context-button ${systemContext?.context_source === 'implicit' ? 'implicit-warning' : ''}`}
            onClick={() => setShowContextPanel(!showContextPanel)}
          >
            <span className="context-label">Project:</span>
            <span className="context-value">{systemContext?.active_project_name || 'Loading...'}</span>
            {systemContext?.context_source === 'implicit' && (
              <span className="implicit-badge">IMPLICIT</span>
            )}
          </button>
          <span className="context-mode">Mode: {systemContext?.project_mode || '...'}</span>
          <span className="context-source">Source: {systemContext?.context_source || '...'}</span>
        </div>
        <div className="status-bar">
          <span className={`status-indicator backend-${(systemStatus?.api?.status || 'offline').toLowerCase()}`}>
            Backend: {systemStatus?.api?.status?.toUpperCase() || backendStatus}
            {systemStatus?.api?.status === 'offline' && lastKnownStatus && (
              <span className="last-known"> (last seen: {new Date(lastKnownStatus.api.last_seen).toLocaleTimeString()})</span>
            )}
          </span>
          <span className={`status-indicator ${systemStatus?.supervisor?.status === 'running' ? 'running' : 'stopped'}`}>
            Supervisor: {systemStatus?.supervisor?.status || 'UNKNOWN'}
            {systemStatus?.supervisor?.pid && ` (PID: ${systemStatus.supervisor.pid})`}
          </span>
          <span className={`status-indicator ${opsStatus?.system_status === 'RUNNING' ? 'running' : 'stopped'}`}>
            System: {opsStatus?.system_status || 'UNKNOWN'}
          </span>
          <span className="update-time">
            {lastStatusUpdate && `Updated: ${lastStatusUpdate.toLocaleTimeString()}`}
          </span>
        </div>
      </header>

      {/* Context Panel - shows when clicked */}
      {showContextPanel && systemContext && (
        <div className="context-panel">
          <div className="context-panel-content">
            <h3>Project Context Switcher</h3>

            {/* Current Context Info */}
            <div className="context-section">
              <h4>Current Context</h4>
              <div className="context-detail">
                <label>Project:</label>
                <code>{systemContext.active_project_root || 'None (Global Mode)'}</code>
              </div>
              <div className="context-detail">
                <label>Mode:</label>
                <span className={`mode-badge mode-${systemContext.project_mode.toLowerCase()}`}>
                  {systemContext.project_mode}
                </span>
              </div>
              <div className="context-detail">
                <label>Source:</label>
                <span className={`source-badge source-${systemContext.context_source}`}>
                  {systemContext.context_source}
                </span>
              </div>
            </div>

            {/* Project Switcher */}
            <div className="context-section">
              <h4>Set Project Root</h4>

              {/* Dropdown for known projects */}
              {knownProjects.length > 0 && (
                <div className="project-selector">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleSetProject(e.target.value);
                      }
                    }}
                    value=""
                  >
                    <option value="">Select a project...</option>
                    {knownProjects.map(project => (
                      <option key={project.path} value={project.path}>
                        {project.name} ({project.path})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Manual path input */}
              <div className="manual-path-input">
                <input
                  type="text"
                  placeholder="Or paste a project path..."
                  value={manualPath}
                  onChange={(e) => setManualPath(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && manualPath.trim()) {
                      handleSetProject(manualPath.trim());
                    }
                  }}
                />
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => {
                    if (manualPath.trim()) {
                      handleSetProject(manualPath.trim());
                    }
                  }}
                  disabled={!manualPath.trim()}
                >
                  Set Project
                </button>
              </div>

              {/* Clear button */}
              {systemContext.active_project_root && (
                <button
                  className="btn btn-secondary btn-small"
                  onClick={handleClearContext}
                >
                  Clear (Back to Global)
                </button>
              )}
            </div>

            {/* Additional Info */}
            <div className="context-section">
              <h4>System Paths</h4>
              <div className="context-detail">
                <label>ANX Root:</label>
                <code>{systemContext.anx_root}</code>
              </div>
              <div className="context-detail">
                <label>Working Directory:</label>
                <code>{systemContext.working_directory}</code>
              </div>
            </div>

            {systemContext.context_source === 'implicit' && (
              <div className="context-warning">
                ⚠️ Context is implicit - system is guessing project context.
                Use the selector above to set an explicit project root.
              </div>
            )}

            <button className="close-panel" onClick={() => setShowContextPanel(false)}>×</button>
          </div>
        </div>
      )}

      <nav className="tabs">
        <button
          className={activeTab === 'cockpit' ? 'active' : ''}
          onClick={() => setActiveTab('cockpit')}
        >
          Cockpit
        </button>
        <button
          className={activeTab === 'directives' ? 'active' : ''}
          onClick={() => setActiveTab('directives')}
        >
          Directives
        </button>
        <button
          className={activeTab === 'create' ? 'active' : ''}
          onClick={() => setActiveTab('create')}
        >
          Create
        </button>
        <button
          className={activeTab === 'plan' ? 'active' : ''}
          onClick={() => setActiveTab('plan')}
          disabled={!selectedPlan}
        >
          Plan
        </button>
        <button
          className={activeTab === 'jobs' ? 'active' : ''}
          onClick={() => setActiveTab('jobs')}
          disabled={!currentRun}
        >
          Jobs
        </button>
        <button
          className={activeTab === 'ops' ? 'active' : ''}
          onClick={() => setActiveTab('ops')}
        >
          Ops Control
        </button>
      </nav>

      <main className="content">
        {loading && <div className="loading">Loading...</div>}

        {systemStatus?.api?.status === 'offline' && (
          <div className="offline-banner">
            <h3>Backend Offline</h3>
            <p>The API server is not responding. {lastCrashReason}</p>
            {lastKnownStatus && (
              <p className="last-known-info">
                Last known state at {new Date(lastKnownStatus.server_time).toLocaleTimeString()}
                <br />
                <small>System will retry connection...</small>
              </p>
            )}
            <p>
              The supervisor should restart the service automatically.
              <a href="#" onClick={() => window.open(`/receipts/SYSTEM_*.md`, '_blank')}>
                View SYSTEM receipts
              </a>
            </p>
          </div>
        )}

        {activeTab === 'cockpit' && (
          <Cockpit />
        )}

        {activeTab === 'directives' && (
          <DirectiveList
            directives={directives}
            onSelect={(directive) => {
              setSelectedDirective(directive);
              setActiveTab('plan');
            }}
          />
        )}

        {activeTab === 'create' && (
          <DirectiveForm
            onSubmit={handleCreateDirective}
            systemContext={systemContext}
          />
        )}

        {activeTab === 'plan' && selectedPlan && (
          <PlanView
            plan={selectedPlan}
            directive={selectedDirective}
            onExecute={() => handleExecutePlan(selectedPlan.id || selectedPlan.plan?.id)}
          />
        )}

        {activeTab === 'jobs' && currentRun && (
          <JobsView
            run={currentRun}
            onRerunFailed={() =>
              handleRerunFailed(currentRun.plan_id, currentRun.run_id || currentRun.run?.id)
            }
          />
        )}

        {activeTab === 'ops' && opsStatus && (
          <OpsControl
            status={opsStatus}
            onKillSwitch={handleKillSwitch}
            onRefresh={fetchOpsStatus}
          />
        )}
      </main>

      <footer className="App-footer">
        <p>ANX Command Center v1.0 | Local Development</p>
      </footer>
    </div>
  );
}

export default App;