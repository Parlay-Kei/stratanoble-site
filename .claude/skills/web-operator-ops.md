---
name: web-operator-ops
description: Web operations skill for fetching URLs, making API calls, and web scraping. Provides autonomous HTTP capabilities for agents.
version: 1.0.0
level: 2
triggers:
  - fetch url
  - web request
  - api call
  - scrape page
  - http get
  - http post
---

# web-operator-ops Skill

Web operations for autonomous HTTP interactions. Enables agents to fetch data, call APIs, and extract information from web pages.

## Quick Commands

| Command | Action |
|---------|--------|
| `fetch` | GET request to URL, return content |
| `post` | POST data to URL |
| `api` | Call API endpoint with auth |
| `scrape` | Extract structured data from page |
| `check` | Health check URL (status code) |

---

## Level 1: Basic Operations

### fetchUrl()
```javascript
/**
 * Fetch content from a URL
 * @param {string} url - Target URL
 * @param {object} options - Fetch options
 */
async function fetchUrl(url, options = {}) {
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'User-Agent': 'ANX-WebOperator/1.0',
      ...options.headers
    },
    ...options
  });

  return {
    status: response.status,
    ok: response.ok,
    headers: Object.fromEntries(response.headers),
    body: await response.text(),
    url: response.url
  };
}
```

### checkHealth()
```javascript
/**
 * Health check a URL
 */
async function checkHealth(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    return {
      url,
      healthy: response.ok,
      status: response.status,
      latencyMs: Date.now() - start
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      url,
      healthy: false,
      error: error.message
    };
  }
}
```

---

## Level 2: API Operations

### callApi()
```javascript
/**
 * Call an API endpoint with authentication
 */
async function callApi(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    auth = null,
    contentType = 'application/json'
  } = options;

  const headers = {
    'Content-Type': contentType,
    'Accept': 'application/json'
  };

  if (auth) {
    if (auth.type === 'bearer') {
      headers['Authorization'] = `Bearer ${auth.token}`;
    } else if (auth.type === 'apikey') {
      headers[auth.header || 'X-API-Key'] = auth.key;
    }
  }

  const response = await fetch(endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => null);

  return {
    success: response.ok,
    status: response.status,
    data,
    error: !response.ok ? data?.error || response.statusText : null
  };
}
```

### batchRequests()
```javascript
/**
 * Execute multiple requests in parallel with rate limiting
 */
async function batchRequests(requests, options = {}) {
  const { concurrency = 5, delayMs = 100 } = options;
  const results = [];

  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(req => fetchUrl(req.url, req.options))
    );
    results.push(...batchResults);

    if (i + concurrency < requests.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return {
    total: requests.length,
    successful: results.filter(r => r.ok).length,
    failed: results.filter(r => !r.ok).length,
    results
  };
}
```

---

## Level 3: Content Extraction

### extractText()
```javascript
/**
 * Extract clean text from HTML
 */
function extractText(html) {
  // Remove script and style elements
  let clean = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove HTML tags
  clean = clean.replace(/<[^>]+>/g, ' ');

  // Decode entities and normalize whitespace
  clean = clean.replace(/&nbsp;/g, ' ');
  clean = clean.replace(/&amp;/g, '&');
  clean = clean.replace(/&lt;/g, '<');
  clean = clean.replace(/&gt;/g, '>');
  clean = clean.replace(/\s+/g, ' ').trim();

  return clean;
}
```

### extractLinks()
```javascript
/**
 * Extract all links from HTML
 */
function extractLinks(html, baseUrl) {
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  const links = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    try {
      const url = new URL(href, baseUrl);
      links.push({
        href: url.href,
        internal: url.host === new URL(baseUrl).host
      });
    } catch {
      // Invalid URL, skip
    }
  }

  return links;
}
```

### extractJson()
```javascript
/**
 * Extract JSON-LD or embedded JSON from HTML
 */
function extractJson(html) {
  const results = [];

  // Extract JSON-LD
  const jsonLdRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      results.push({ type: 'json-ld', data: JSON.parse(match[1]) });
    } catch {}
  }

  // Extract __NEXT_DATA__ (Next.js)
  const nextDataRegex = /<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = nextDataRegex.exec(html)) !== null) {
    try {
      results.push({ type: 'next-data', data: JSON.parse(match[1]) });
    } catch {}
  }

  return results;
}
```

---

## Integration Points

### MCP Tool Interface
```javascript
// MCP tool definition for web-operator-ops
const webOperatorTool = {
  name: 'web_operator',
  description: 'Fetch URLs, call APIs, and extract web content',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['fetch', 'post', 'api', 'scrape', 'check'],
        description: 'Operation to perform'
      },
      url: { type: 'string', description: 'Target URL' },
      body: { type: 'object', description: 'Request body for POST' },
      auth: { type: 'object', description: 'Authentication config' },
      extract: {
        type: 'string',
        enum: ['text', 'links', 'json'],
        description: 'Content extraction type'
      }
    },
    required: ['action', 'url']
  }
};
```

---

## Usage Examples

```bash
# Fetch a URL
web-operator-ops fetch https://api.example.com/status

# POST data
web-operator-ops post https://api.example.com/data --body '{"key":"value"}'

# API call with auth
web-operator-ops api https://api.stripe.com/v1/charges --auth bearer:sk_xxx

# Scrape and extract text
web-operator-ops scrape https://example.com --extract text

# Health check
web-operator-ops check https://directcuts.app
```

---

## Success Criteria

- HTTP requests complete within timeout
- API calls include proper authentication
- Content extraction returns clean data
- Rate limiting prevents abuse
- Errors are handled gracefully
