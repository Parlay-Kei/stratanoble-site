import React, { useState, useEffect, useCallback } from 'react';
import './Cockpit.css';
import { buildApiUrl, getApiContext } from '../lib/apiBase';

function Cockpit() {
  const [runtime, setRuntime] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Determine polling interval based on state
  const getPollingInterval = useCallback((state) => {
    if (state === 'STARTING' || state === 'RESTARTING') {
      return 1000; // 1 second
    }
    return 5000; // 5 seconds
  }, []);

  // Fetch runtime status
  const fetchRuntime = useCallback(async () => {
    const runtimeUrl = buildApiUrl('/system/runtime', false);
    try {
      const response = await fetch(runtimeUrl);
      const data = await response.json();
      setRuntime(data);
      setError(null);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError(`Failed to fetch runtime from ${runtimeUrl}: ${err.message}`);
    }
  }, []);

  // Fetch latest receipts
  const fetchReceipts = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('/receipts?limit=10', true));
      const data = await response.json();
      if (data.ok) {
        setReceipts(data.receipts);
      }
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
    }
  }, []);

  // Start system
  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await fetch(buildApiUrl('/start', true), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.ok) {
        setError(null);
        // Immediately poll for updated state
        setTimeout(() => fetchRuntime(), 500);
      } else {
        setError(data.error || 'Failed to start system');
      }
    } catch (err) {
      setError(`Start failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Stop system
  const handleStop = async () => {
    setLoading(true);
    try {
      const response = await fetch(buildApiUrl('/stop', true), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.ok) {
        setError(null);
        // Immediately poll for updated state
        setTimeout(() => fetchRuntime(), 500);
      } else {
        setError(data.error || 'Failed to stop system');
      }
    } catch (err) {
      setError(`Stop failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Copied to clipboard:', text);
    });
  };

  // Set up polling
  useEffect(() => {
    fetchRuntime();
    fetchReceipts();

    const interval = setInterval(() => {
      fetchRuntime();
      if (Math.random() < 0.2) { // Fetch receipts less frequently
        fetchReceipts();
      }
    }, runtime ? getPollingInterval(runtime.state) : 5000);

    return () => clearInterval(interval);
  }, [runtime?.state, fetchRuntime, fetchReceipts, getPollingInterval]);

  // Get state-specific styling
  const getStateBadgeClass = (state) => {
    const baseClass = 'state-badge';
    switch (state) {
      case 'RUNNING': return `${baseClass} state-running`;
      case 'STARTING': return `${baseClass} state-starting`;
      case 'RESTARTING': return `${baseClass} state-restarting`;
      case 'DEGRADED': return `${baseClass} state-degraded`;
      case 'STOPPED': return `${baseClass} state-stopped`;
      default: return `${baseClass} state-unknown`;
    }
  };

  // Get receipt type badge class
  const getReceiptBadgeClass = (type) => {
    const baseClass = 'receipt-badge';
    switch (type) {
      case 'STARTED': return `${baseClass} receipt-started`;
      case 'STOPPED': return `${baseClass} receipt-stopped`;
      case 'RESTART': return `${baseClass} receipt-restart`;
      case 'DEGRADED': return `${baseClass} receipt-degraded`;
      case 'CONTROL': return `${baseClass} receipt-control`;
      default: return `${baseClass} receipt-other`;
    }
  };

  const state = runtime?.state || runtime?.api_status || 'UNKNOWN';
  const isSystemRunning = state === 'RUNNING' || runtime?.api_status === 'running';
  const isSystemStopped = state === 'STOPPED' || (!runtime?.supervisor_running && !runtime?.api_status);
  const isTransitioning = state === 'STARTING' || state === 'RESTARTING';

  return (
    <div className="cockpit">
      <div className="cockpit-header">
        <h1>ANX Command Center Cockpit</h1>
        <div className="last-update">
          Last updated: {lastUpdate || 'Never'}
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* State Banner */}
      <div className="state-section">
        <div className="section-header">
          <h2>System State</h2>
        </div>
        <div className="state-banner">
          <div className="state-info">
            <span className={getStateBadgeClass(state)}>
              {state}
            </span>
            {runtime?.run_id && (
              <span className="run-id">Run ID: {runtime.run_id}</span>
            )}
            {runtime?.supervisor_pid && (
              <span className="process-info">PID: {runtime.supervisor_pid}</span>
            )}
          </div>
          {runtime?.last_failure_reason && (
            <div className="failure-reason">
              <strong>Last failure:</strong> {runtime.last_failure_reason}
            </div>
          )}
          {state === 'DEGRADED' && (
            <div className="degraded-message">
              <strong>⚠️ Manual intervention required</strong> - Service is in degraded state
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="controls-section">
        <div className="section-header">
          <h2>System Controls</h2>
        </div>
        <div className="control-buttons">
          <button
            className="btn btn-start"
            onClick={handleStart}
            disabled={loading || isSystemRunning || isTransitioning}
          >
            {loading && state !== 'STARTING' ? 'Starting...' : 'Start'}
          </button>
          <button
            className="btn btn-stop"
            onClick={handleStop}
            disabled={loading || isSystemStopped || isTransitioning}
          >
            {loading && state !== 'STOPPING' ? 'Stopping...' : 'Stop'}
          </button>
        </div>
        {isTransitioning && (
          <div className="transition-status">
            <div className="spinner"></div>
            <span>System is {state.toLowerCase()}...</span>
          </div>
        )}
      </div>

      {/* URLs Section */}
      <div className="urls-section">
        <div className="section-header">
          <h2>Service URLs</h2>
        </div>
        <div className="urls-grid">
          <div className="url-item">
            <label>API URL:</label>
            <div className="url-controls">
              <span className="url-text">
                {runtime?.api_url || 'Not available'}
              </span>
              {runtime?.api_url && (
                <button
                  className="btn btn-small"
                  onClick={() => copyToClipboard(runtime.api_url)}
                >
                  Copy
                </button>
              )}
            </div>
          </div>
          <div className="url-item">
            <label>UI URL:</label>
            <div className="url-controls">
              <span className="url-text">
                {runtime?.ui_url || 'Not available'}
              </span>
              <div className="url-buttons">
                {runtime?.ui_url && (
                  <>
                    <button
                      className="btn btn-small"
                      onClick={() => copyToClipboard(runtime.ui_url)}
                    >
                      Copy
                    </button>
                    <a
                      href={runtime.ui_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-small btn-primary"
                    >
                      Open UI
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipts Section */}
      <div className="receipts-section">
        <div className="section-header">
          <h2>Latest Receipts</h2>
          <div className="receipts-count">
            {receipts.length} of latest 10
          </div>
        </div>
        <div className="receipts-list">
          {receipts.length === 0 ? (
            <div className="no-receipts">No receipts available</div>
          ) : (
            receipts.map((receipt, index) => (
              <div key={index} className="receipt-item">
                <div className="receipt-header">
                  <span className={getReceiptBadgeClass(receipt.type)}>
                    {receipt.type}
                  </span>
                  <span className="receipt-filename">{receipt.filename}</span>
                  <span className="receipt-time">
                    {new Date(receipt.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="receipt-preview">
                  {receipt.preview}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Runtime Details (Collapsible) */}
      <details className="runtime-details">
        <summary>Runtime Contract Details</summary>
        <pre className="runtime-json">
          {JSON.stringify(runtime, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default Cockpit;