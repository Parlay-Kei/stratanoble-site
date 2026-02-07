# Social Ops MCP Server V1

LinkedIn and TikTok posting automation with Notion integration, approval gates, and comprehensive safety controls.

## Features

### Platforms
- **LinkedIn**: Text posts with images, hashtags, mentions
- **TikTok**: Video uploads with captions, privacy settings

### Safety Controls
- Kill switches per platform
- Rate limiting (configurable)
- Approval gates (Notion-based or explicit)
- Dry-run mode for testing
- Content validation
- Audit logging
- Receipt generation

### Notion Integration
- Pull scheduled posts
- Track post status
- Store post URLs
- Update metrics
- Batch operations

## Setup

### 1. Install Dependencies

```bash
cd mcp-servers/social-ops
npm install
```

### 2. Configure Environment

Copy `.env.template` to `.env` and fill in your values:

```bash
cp .env.template .env
```

Required variables:
- `NOTION_API_KEY`: Your Notion integration API key
- `NOTION_SOCIAL_MEDIA_DB_ID`: Your Notion database ID for social media posts

### 3. Notion Database Setup

Your Notion database should have these properties:
- Platform (Select): LinkedIn, TikTok
- Status (Select): Draft, Scheduled, Approved, Posted, Archived
- Content (Text): Post content for LinkedIn
- Caption (Text): Caption for TikTok videos
- Hashtags (Multi-select): Tags without #
- Scheduled Date (Date): When to post
- Approval Status (Select): Pending, Approved, Rejected
- Post URL (URL): Final post URL (auto-filled)
- Image URL (URL): For LinkedIn images
- Video Path (Text): Local path for TikTok videos

### 4. Authentication

#### Browser Automation (Recommended for V1)

1. Log into LinkedIn/TikTok manually in Chrome
2. Export cookies using a browser extension
3. Add cookies to environment variables as JSON

#### API Access (Future)

When official APIs are available:
- `LINKEDIN_ACCESS_TOKEN`
- `TIKTOK_ACCESS_TOKEN`

## Usage

### Start Server

```bash
npm start
```

### Run in Dry-Run Mode

```bash
npm run dry-run
```

### Run Smoke Tests

```bash
npm test
```

## MCP Tools

### `fetch_scheduled_posts`
Fetch posts scheduled in Notion for a platform.

### `preview_post`
Preview a post before publishing.

### `publish_linkedin_post`
Publish to LinkedIn after approval.

### `publish_tiktok_video`
Upload video to TikTok after approval.

### `check_platform_status`
Check if a platform is enabled.

### `get_receipts`
Retrieve recent action receipts.

## Safety Features

### Kill Switches
Disable platforms instantly:
- Set `LINKEDIN_ENABLED=false`
- Set `TIKTOK_ENABLED=false`

### Rate Limiting
- LinkedIn: 10/hour, 50/day
- TikTok: 5/hour, 20/day
- Configurable via `RATE_LIMIT_REQUESTS_PER_SECOND`

### Approval Gates
- **Notion-based**: Set "Approval Status" = "Approved"
- **Explicit**: Manual approval via OCS command

### Dry-Run Mode
Test everything without posting:
- Set `DRY_RUN_MODE=true`
- All actions logged but not executed

## Receipts

Every action generates a receipt in `receipts/`:
- Unique ID
- Platform
- Action type
- Timestamp
- Dry-run status
- Full action data

## Audit Logs

Daily logs in `audit-logs/`:
- All actions tracked
- Platform-specific files
- JSONL format for analysis

## Error Handling

- Automatic retries with exponential backoff
- Rate limit detection and waiting
- Session validation
- Content validation warnings

## Testing

### Smoke Test Coverage
- Safety controls initialization
- Kill switch functionality
- Rate limiting
- Content validation
- Notion integration
- LinkedIn dry-run posting
- TikTok dry-run upload
- Approval system
- Receipt generation
- Audit logging

### Manual Testing

1. Create test posts in Notion
2. Set `DRY_RUN_MODE=true`
3. Run posting workflows
4. Verify receipts generated
5. Check audit logs

## Security

- Credentials in environment variables only
- No hardcoded secrets
- Session validation
- Content scanning for credentials
- Audit trail for all actions

## Troubleshooting

### "Not logged in" errors
- Refresh session cookies
- Check cookie format (JSON array)

### Rate limit errors
- Check recent receipts
- Wait for reset time
- Adjust `RATE_LIMIT_REQUESTS_PER_SECOND`

### Notion connection issues
- Verify API key
- Check database ID
- Ensure database has required properties

## Future Enhancements

- Official API integration
- Cross-posting logic
- Scheduled posting daemon
- Analytics integration
- Media optimization
- A/B testing support

## Support

For issues or questions, check:
- Smoke test results: `smoke-test-results.json`
- Receipts: `receipts/` directory
- Audit logs: `audit-logs/` directory