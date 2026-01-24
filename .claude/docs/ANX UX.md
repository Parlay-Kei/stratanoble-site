flowchart TD
  %% Actors
  U[User] -->|Uses| CCUI[ANX Command Center UI]

  %% Command Center UI responsibilities
  CCUI -->|Start / Stop / View Status| LAUNCHER[Launcher]
  CCUI -->|Reads| CONTRACT[(Runtime Contract JSON\ncommand_center.runtime.json)]
  CCUI -->|Shows| RECEIPTS[(Receipts Directory)]
  CCUI -->|Shows| LOGS[(Logs Directory)]

  %% Launcher and Acceptance Gate
  LAUNCHER -->|Wait-ForRuntimeContract\nAPI + UI readiness| GATE[Acceptance Gate]
  GATE -->|PASS| CCUI
  GATE -->|FAIL (exit code 2 if DEGRADED)| CCUI

  %% Supervisor is the authority
  LAUNCHER -->|Starts| SUP[Supervisor\nanx_supervisor.js]
  SUP -->|Writes atomically| CONTRACT
  SUP -->|Writes receipts| RECEIPTS
  SUP -->|Writes logs| LOGS

  %% Service start and port management
  SUP -->|Start API| API[API Server]
  SUP -->|Start UI| UI[UI Server]

  SUP -->|Port scan 5000-5009| API_PORTS[API Port Selector]
  SUP -->|Port scan 3000-3009| UI_PORTS[UI Port Selector]
  API_PORTS -->|Select available| API
  UI_PORTS -->|Select available| UI

  %% Readiness checks
  SUP -->|HTTP health checks| API_HEALTH[API Health Probe\n/health or equivalent]
  SUP -->|HTTP reachability| UI_HEALTH[UI Reachability Probe]
  API_HEALTH -->|Healthy| SUP
  UI_HEALTH -->|Reachable| SUP

  %% State machine and protections
  SUP --> SM[State Machine\nSTOPPED/STARTING/RUNNING/RESTARTING/DEGRADED]
  SUP --> DEDUPE[Receipt Deduper\n60s window]
  SUP --> RL[Rate Limiter\n3 per 10 min per service]
  SUP --> ROLLOUT[Rollup Receipt Writer]
  SUP --> BACKOFF[Backoff Scheduler\n1s->2s->5s->10s->30s]
  SUP --> CB[Circuit Breaker\nTrip after 5 failures]

  %% Failure flows
  API_HEALTH -->|Fail| SM
  UI_HEALTH -->|Fail| SM
  SM -->|RUNNING -> RESTARTING| BACKOFF
  BACKOFF -->|Retry start| SUP
  SM -->|Trip| CB
  CB -->|Set DEGRADED in contract| CONTRACT
  CB -->|Write DEGRADED receipt| RECEIPTS

  %% Receipt storm guard
  DEDUPE -->|Suppress duplicates| ROLLOUT
  RL -->|Throttle emission| ROLLOUT
  ROLLOUT -->|Periodic summary| RECEIPTS

  %% CI/CD integration
  CI[CI/CD Pipeline] -->|Invokes launcher| LAUNCHER
  GATE -->|Exit status| CI

  %% Contract informs UI and tools
  CONTRACT -->|api_url/ui_url/state/run_id| CCUI
  CONTRACT -->|actual ports| LAUNCHER
