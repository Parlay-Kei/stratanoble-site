# Social Media Agent MCP Server

A global, production-ready MCP server for managing social media across all major platforms. Works with any project that uses Claude Code.

## Supported Platforms

| Platform | Content Types | Analytics | Trends | Automation |
|----------|--------------|-----------|--------|------------|
| TikTok | video, short | Yes | Limited | Yes |
| Instagram | post, story, reel, carousel | Yes | Yes | Yes |
| Twitter/X | post, thread | Yes | Yes | Yes |
| YouTube | video, short | Yes | Yes | Yes |
| LinkedIn | post, article | Yes | No | Yes |
| Facebook | post, story | Yes | No | Yes |

## Quick Setup

### 1. Install Dependencies

```bash
cd C:\Dev\.claude-anx\mcp-servers\social-media-agent
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.template .env
# Edit .env with your credentials
```

### 3. Add to Claude Code Settings

Add to your `claude_desktop_config.json` or project's `.claude/settings.json`:

```json
{
  "mcpServers": {
    "social-media": {
      "command": "python",
      "args": ["C:/Dev/.claude-anx/mcp-servers/social-media-agent/server.py"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_KEY": "your-service-key",
        "ANTHROPIC_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

## Available Tools

### Account Management

#### `connect_account`
Get OAuth URL to connect a social media account.

```
"Connect my Instagram account"
```

#### `list_accounts`
List all connected social accounts.

```
"Show me all my connected social accounts"
```

### Content Management

#### `create_content`
Create and schedule social media posts.

```
"Schedule a post to Instagram for tomorrow at 9 AM about our product launch"
```

#### `get_content_queue`
View scheduled and pending content.

```
"Show me all scheduled posts for this week"
```

### Analytics

#### `get_analytics`
Get performance metrics across platforms.

```
"Get analytics for the past 30 days across all platforms"
```

### Trends

#### `get_trends`
Get trending topics for a platform.

```
"What's trending on TikTok right now?"
```

### AI Generation

#### `generate_content`
Generate AI-powered content.

```
"Generate 3 professional LinkedIn posts about AI in business"
```

### Automation

#### `create_automation_rule`
Set up if/then automation rules.

```
"Create a rule to crosspost all my Instagram posts to Twitter"
```

### Compliance

#### `check_compliance`
Check account health and shadowban status.

```
"Check if my Instagram account is shadowbanned"
```

## Database Schema

This server expects the following Supabase tables (run the migration in your project):

- `social_accounts` - Connected social media accounts
- `social_content_queue` - Scheduled content
- `social_analytics` - Performance metrics
- `social_automation_rules` - Automation rules
- `social_automation_logs` - Execution history
- `social_trends` - Cached trending topics
- `social_compliance_audit` - Compliance events
- `social_content_templates` - Reusable templates

## Usage Examples

### Connect an Account
```
User: "Connect my TikTok account"
Claude: Uses connect_account tool to generate OAuth URL
```

### Create Multi-Platform Content
```
User: "Create a post about our sale for Instagram and Twitter"
Claude: Uses generate_content + create_content for each platform
```

### Analyze Performance
```
User: "How did our posts perform last week?"
Claude: Uses get_analytics to aggregate metrics
```

### Set Up Automation
```
User: "Auto-crosspost my Instagram reels to TikTok"
Claude: Uses create_automation_rule with on_publish trigger
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code / MCP Client                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Social Media Agent MCP Server                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Tools     │  │  Adapters   │  │   AI Generator      │  │
│  │  Handler    │──│  (6 plat.)  │──│   (Anthropic)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
│                          │                                   │
│                          ▼                                   │
│              ┌─────────────────────┐                        │
│              │   Database Client   │                        │
│              │     (Supabase)      │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Platform APIs                            │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌──────┐│
│  │TikTok │ │ Insta │ │Twitter│ │YouTube│ │LinkedIn│ │  FB  ││
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └──────┘│
└─────────────────────────────────────────────────────────────┘
```

## Best Practices

1. **Rate Limiting**: The server respects platform rate limits automatically
2. **Token Refresh**: OAuth tokens are refreshed before expiry
3. **Error Handling**: All API errors are caught and reported gracefully
4. **Caching**: Trends and analytics are cached to reduce API calls
5. **Multi-tenant**: Supports multiple organizations via `organization_id`

## Troubleshooting

### "SUPABASE_URL must be set"
Ensure your `.env` file has valid Supabase credentials.

### "MCP SDK not installed"
Run `pip install mcp`

### "No cached trends available"
Connect an account first to fetch live trends.

## License

MIT - Use freely in your projects.
