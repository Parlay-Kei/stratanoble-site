# OpenAI API Reference

## Authentication

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Organization header (optional, for multi-org accounts)
-H "OpenAI-Organization: org-XXXXXXXX"
```

## Base URL

`https://api.openai.com/v1`

## Models

### List Models
```bash
GET /models
```

### Retrieve Model
```bash
GET /models/{model_id}
```

### Key Models (as of knowledge cutoff)
| Model | Context | Use Case |
|-------|---------|----------|
| gpt-4o | 128K | Most capable, multimodal |
| gpt-4o-mini | 128K | Fast, cost-effective |
| gpt-4-turbo | 128K | High capability |
| gpt-3.5-turbo | 16K | Legacy, fast |
| text-embedding-3-large | 8K | Best embeddings |
| text-embedding-3-small | 8K | Cost-effective embeddings |
| whisper-1 | - | Audio transcription |
| tts-1 / tts-1-hd | - | Text-to-speech |
| dall-e-3 | - | Image generation |

## Chat Completions

### Create Completion
```bash
POST /chat/completions

{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "Hello"}
  ],
  "max_tokens": 1000,
  "temperature": 0.7,
  "stream": false
}
```

### Streaming
```bash
POST /chat/completions

{
  "model": "gpt-4o",
  "messages": [...],
  "stream": true
}

# Response: Server-Sent Events
data: {"id":"...","choices":[{"delta":{"content":"Hello"}}]}
data: [DONE]
```

### Tool Calls (Function Calling)
```json
{
  "model": "gpt-4o",
  "messages": [...],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get weather for location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {"type": "string"}
          },
          "required": ["location"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}
```

## Embeddings

### Create Embedding
```bash
POST /embeddings

{
  "model": "text-embedding-3-small",
  "input": "Your text here",
  "encoding_format": "float"
}

# Response:
{
  "data": [
    {"embedding": [0.123, -0.456, ...], "index": 0}
  ],
  "usage": {"prompt_tokens": 5, "total_tokens": 5}
}
```

### Batch Embedding
```json
{
  "model": "text-embedding-3-small",
  "input": ["Text 1", "Text 2", "Text 3"]
}
```

## Images

### Generate Image (DALL-E 3)
```bash
POST /images/generations

{
  "model": "dall-e-3",
  "prompt": "A white cat",
  "n": 1,
  "size": "1024x1024",
  "quality": "standard",
  "response_format": "url"
}
```

### Sizes Available
- DALL-E 3: 1024x1024, 1024x1792, 1792x1024
- DALL-E 2: 256x256, 512x512, 1024x1024

## Audio

### Transcription (Whisper)
```bash
POST /audio/transcriptions
Content-Type: multipart/form-data

file=@audio.mp3
model=whisper-1
language=en  # optional, ISO-639-1
response_format=json|text|srt|verbose_json|vtt
```

### Text-to-Speech
```bash
POST /audio/speech

{
  "model": "tts-1",
  "input": "Hello world",
  "voice": "alloy",
  "response_format": "mp3"
}

# Voices: alloy, echo, fable, onyx, nova, shimmer
# Formats: mp3, opus, aac, flac, wav, pcm
```

## Assistants API

### Create Assistant
```bash
POST /assistants

{
  "model": "gpt-4o",
  "name": "My Assistant",
  "instructions": "You are helpful.",
  "tools": [{"type": "code_interpreter"}]
}
```

### Create Thread
```bash
POST /threads
```

### Add Message to Thread
```bash
POST /threads/{thread_id}/messages

{
  "role": "user",
  "content": "Hello"
}
```

### Run Assistant
```bash
POST /threads/{thread_id}/runs

{
  "assistant_id": "asst_xxx"
}
```

### Check Run Status
```bash
GET /threads/{thread_id}/runs/{run_id}

# Statuses: queued, in_progress, requires_action, completed, failed, cancelled, expired
```

## Batch API

### Create Batch
```bash
POST /batches

{
  "input_file_id": "file-xxx",
  "endpoint": "/v1/chat/completions",
  "completion_window": "24h"
}
```

### Batch File Format (JSONL)
```jsonl
{"custom_id": "req-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-4o", "messages": [...]}}
{"custom_id": "req-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-4o", "messages": [...]}}
```

## Files

### Upload File
```bash
POST /files
Content-Type: multipart/form-data

file=@data.jsonl
purpose=batch|fine-tune|assistants
```

### List Files
```bash
GET /files?purpose=batch
```

## Usage & Billing

### Check Usage (via Dashboard API)
```bash
# Note: Usage API requires separate authentication
# Check dashboard.openai.com for programmatic access
```

## Rate Limits

Rate limits vary by model and tier. Headers returned:

```
x-ratelimit-limit-requests: 10000
x-ratelimit-limit-tokens: 1000000
x-ratelimit-remaining-requests: 9999
x-ratelimit-remaining-tokens: 999000
x-ratelimit-reset-requests: 1s
x-ratelimit-reset-tokens: 1s
```

### Typical Limits (Tier 1)
| Model | RPM | TPM |
|-------|-----|-----|
| gpt-4o | 500 | 30,000 |
| gpt-4o-mini | 500 | 200,000 |
| gpt-3.5-turbo | 3,500 | 200,000 |
| embeddings | 3,000 | 1,000,000 |

## Common Error Codes

| Code | Category | Meaning | Remediation |
|------|----------|---------|-------------|
| 401 | auth | Invalid API key | Verify key in dashboard |
| 403 | auth | No permission for model | Check account access |
| 404 | config | Model/resource not found | Verify model name |
| 429 | rate_limit | Rate limit exceeded | Implement backoff |
| 500 | transient | Server error | Retry with backoff |
| 503 | transient | Service overloaded | Wait and retry |

### Error Response Format
```json
{
  "error": {
    "message": "Description of error",
    "type": "invalid_request_error|authentication_error|rate_limit_error|server_error",
    "param": "field_name",
    "code": "error_code"
  }
}
```

## Best Practices

### Token Counting
Use `tiktoken` library before sending requests:
```python
import tiktoken
enc = tiktoken.encoding_for_model("gpt-4o")
tokens = len(enc.encode("Your text here"))
```

### Retry Strategy
```python
# Exponential backoff for 429/5xx
delays = [1, 2, 4, 8, 16]  # seconds
for delay in delays:
    try:
        response = make_request()
        break
    except RateLimitError:
        time.sleep(delay)
```

### Cost Estimation
Track usage in responses:
```json
{
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 50,
    "total_tokens": 150
  }
}
```

## Console-Only Settings

These require OpenAI dashboard:
- API key management (create/revoke)
- Usage limits and alerts
- Organization billing
- Team member access
- Rate limit tier upgrades
- Fine-tuning management
