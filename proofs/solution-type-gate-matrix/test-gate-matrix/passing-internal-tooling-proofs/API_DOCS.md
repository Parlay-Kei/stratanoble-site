# API Documentation: Automated Code Review Bot

## Overview
REST API for the Automated Code Review Bot, providing endpoints for configuration management, statistics, and manual operations.

**Base URL**: `https://api.codebot.internal.company.com/v1`
**Authentication**: Bearer token (JWT)

## Authentication

All API requests require a valid JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

Get your token from the dashboard or request one from Platform Engineering.

## Endpoints

### Repository Management

#### GET /repositories
List all repositories configured for code review.

**Response**:
```json
{
  "repositories": [
    {
      "id": "repo-123",
      "name": "backend-api",
      "owner": "company-org",
      "enabled": true,
      "lastReview": "2026-01-30T10:30:00Z",
      "totalReviews": 245
    }
  ],
  "total": 1
}
```

#### POST /repositories
Add a new repository to code review.

**Request**:
```json
{
  "name": "new-service",
  "owner": "company-org",
  "config": {
    "rules": {
      "style": {"enabled": true, "severity": "warning"},
      "security": {"enabled": true, "severity": "error"}
    }
  }
}
```

#### PUT /repositories/{id}/config
Update repository configuration.

**Request**:
```json
{
  "rules": {
    "coverage": {
      "enabled": true,
      "threshold": 85
    }
  },
  "notifications": {
    "slack": {
      "channel": "#dev-alerts"
    }
  }
}
```

### Review Management

#### GET /repositories/{id}/reviews
Get review history for a repository.

**Query Parameters**:
- `limit`: Number of results (default: 50, max: 200)
- `offset`: Pagination offset
- `from`: Start date (ISO 8601)
- `to`: End date (ISO 8601)

**Response**:
```json
{
  "reviews": [
    {
      "id": "review-789",
      "pullRequestId": 123,
      "status": "completed",
      "findings": {
        "errors": 2,
        "warnings": 5,
        "suggestions": 3
      },
      "reviewedAt": "2026-01-30T09:15:00Z",
      "duration": 2.3
    }
  ]
}
```

#### POST /repositories/{id}/reviews
Manually trigger a review for a pull request.

**Request**:
```json
{
  "pullRequestId": 456,
  "force": false
}
```

### Statistics

#### GET /statistics/overview
Get high-level statistics across all repositories.

**Response**:
```json
{
  "totalRepositories": 25,
  "totalReviews": 1250,
  "avgReviewTime": 1.8,
  "issuesFound": {
    "errors": 145,
    "warnings": 320,
    "suggestions": 890
  },
  "topIssues": [
    {"type": "missing-tests", "count": 89},
    {"type": "style-violation", "count": 67}
  ]
}
```

#### GET /repositories/{id}/statistics
Get detailed statistics for a specific repository.

**Query Parameters**:
- `period`: Time period (day, week, month, quarter)
- `from`: Start date
- `to`: End date

### Rules Management

#### GET /rules/templates
Get available rule templates.

**Response**:
```json
{
  "templates": [
    {
      "id": "javascript-standard",
      "name": "JavaScript Standard Style",
      "description": "Standard linting rules for JavaScript projects",
      "rules": {
        "style": {"enabled": true, "severity": "warning"},
        "security": {"enabled": true, "severity": "error"}
      }
    }
  ]
}
```

#### POST /rules/custom
Create a custom rule.

**Request**:
```json
{
  "name": "Custom Security Rule",
  "description": "Team-specific security checks",
  "pattern": "regex-pattern-here",
  "severity": "error",
  "message": "Custom security violation detected"
}
```

### Health and Status

#### GET /health
Service health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "version": "1.2.0",
  "uptime": 86400,
  "dependencies": {
    "github": "connected",
    "slack": "connected",
    "database": "connected"
  }
}
```

#### GET /status
Detailed service status and metrics.

**Response**:
```json
{
  "service": "codebot-api",
  "version": "1.2.0",
  "environment": "production",
  "metrics": {
    "requestsPerSecond": 12.5,
    "avgResponseTime": 145,
    "errorRate": 0.02
  },
  "queues": {
    "review": {
      "pending": 5,
      "processing": 2
    }
  }
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Repository not found",
    "details": {
      "repositoryId": "invalid-repo-123"
    }
  }
}
```

### Common Error Codes
- `400 BAD_REQUEST`: Invalid request parameters
- `401 UNAUTHORIZED`: Missing or invalid authentication
- `403 FORBIDDEN`: Insufficient permissions
- `404 NOT_FOUND`: Resource not found
- `429 RATE_LIMIT_EXCEEDED`: Too many requests
- `500 INTERNAL_ERROR`: Server error

## Rate Limiting

- **Authenticated requests**: 1000 requests per hour per user
- **Repository operations**: 100 requests per hour per repository
- **Statistics endpoints**: 200 requests per hour per user

Rate limit headers included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when rate limit resets

## SDK Examples

### JavaScript/Node.js
```javascript
const CodeBotAPI = require('@company/codebot-api');

const client = new CodeBotAPI({
  baseURL: 'https://api.codebot.internal.company.com/v1',
  token: process.env.CODEBOT_TOKEN
});

// Get repository statistics
const stats = await client.repositories.getStatistics('repo-123');
console.log(stats);
```

### Python
```python
from codebot_api import CodeBotClient

client = CodeBotClient(
    base_url='https://api.codebot.internal.company.com/v1',
    token=os.environ['CODEBOT_TOKEN']
)

# Trigger manual review
result = client.reviews.create('repo-123', pull_request_id=456)
print(result)
```

---

**API Version**: 1.0.0
**Documentation Updated**: 2026-01-30
**Support**: #api-support on Slack