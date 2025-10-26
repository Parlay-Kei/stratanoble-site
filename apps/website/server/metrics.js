const metrics = {
  wsConnections: 0,
  wsMessages: 0,
  wsMediaFrames: 0,
  wsErrors: 0,
  aiResponses: 0,
  aiErrors: 0,
  aiTranscriptUser: 0,
  aiTranscriptAssistant: 0,
  startedAt: Date.now(),
};

metrics.jobsQueued = 0;
metrics.jobsStarted = 0;
metrics.jobsCompleted = 0;
metrics.jobsFailed = 0;
metrics.jobsRetried = 0;
metrics.cpsCurrent = 0;
metrics.jobsSuppressed = 0;

module.exports = { metrics };