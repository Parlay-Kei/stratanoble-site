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

module.exports = { metrics };\nmetrics.jobsQueued=metrics.jobsQueued||0; metrics.jobsStarted=metrics.jobsStarted||0; metrics.jobsCompleted=metrics.jobsCompleted||0; metrics.jobsFailed=metrics.jobsFailed||0; metrics.jobsRetried=metrics.jobsRetried||0; metrics.cpsCurrent=metrics.cpsCurrent||0;\n
metrics.jobsSuppressed=metrics.jobsSuppressed||0;

