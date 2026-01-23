import React, { useState, useEffect } from 'react';
import './App.css';
import DirectiveForm from './components/DirectiveForm';
import DirectiveList from './components/DirectiveList';
import PlanView from './components/PlanView';
import JobsView from './components/JobsView';
import OpsControl from './components/OpsControl';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('directives');
  const [directives, setDirectives] = useState([]);
  const [selectedDirective, setSelectedDirective] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentRun, setCurrentRun] = useState(null);
  const [opsStatus, setOpsStatus] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchDirectives();
    fetchOpsStatus();

    // Refresh every 5 seconds
    const interval = setInterval(() => {
      if (currentRun) {
        fetchCurrentRun();
      }
      fetchOpsStatus();
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
        <div className="status-bar">
          <span className={`status-indicator ${opsStatus?.system_status === 'RUNNING' ? 'running' : 'stopped'}`}>
            System: {opsStatus?.system_status || 'UNKNOWN'}
          </span>
          <span>Queue: {opsStatus?.queue_stats?.pending || 0} pending</span>
          <span>Executing: {opsStatus?.queue_stats?.executing || 0}</span>
        </div>
      </header>

      <nav className="tabs">
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
          <DirectiveForm onSubmit={handleCreateDirective} />
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
        <p>ANX Command Center v1.0 | Local Only (127.0.0.1:5000)</p>
      </footer>
    </div>
  );
}

export default App;