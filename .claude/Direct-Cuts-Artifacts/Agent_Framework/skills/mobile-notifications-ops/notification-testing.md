# Push Notification Testing & Debugging Skill

**Purpose:** Test, debug, and validate push notification delivery across platforms
**Version:** 1.0.0
**Created:** 2025-12-20

---

## Overview

This skill provides comprehensive testing procedures and debugging techniques for push notification systems using OneSignal, Firebase FCM, and APNs.

---

## Testing Checklist

### Pre-Testing Requirements

- [ ] OneSignal App ID configured
- [ ] REST API Key available for API testing
- [ ] FCM Service Account JSON uploaded (Android)
- [ ] APNs credentials uploaded (iOS)
- [ ] Test device with app installed
- [ ] Notification permissions granted

### Platform-Specific Requirements

**Android:**
- [ ] Google Play Services installed on device
- [ ] Battery optimization disabled for app
- [ ] Notification channel created in app

**iOS:**
- [ ] Physical device (not simulator - simulators don't support push)
- [ ] Proper provisioning profile with push capability
- [ ] Background Modes enabled in Xcode
- [ ] Notification Service Extension added (for rich media)

---

## Test Device Setup

### Adding Test Subscriptions in OneSignal

1. Launch your app on a test device
2. Accept the push notification permission prompt
3. Open OneSignal Dashboard → **Audience** → **All Users**
4. Find your device (sorted by most recent)
5. Click the **Options menu (⋮)** → **Add to Test Subscriptions**
6. Name it (e.g., "Dev iPhone - John" or "QA Android - Sarah")

```
Dashboard Path: Audience → All Users → [Device] → Options → Add to Test Subscriptions
```

### Verifying Device Registration

Check that your device appears correctly:

```typescript
// In your app, log the OneSignal player ID
import { OneSignal } from 'react-native-onesignal';

OneSignal.User.pushSubscription.addEventListener('change', (subscription) => {
  console.log('OneSignal Player ID:', subscription.current.id);
  console.log('Push Token:', subscription.current.token);
  console.log('Opted In:', subscription.current.optedIn);
});
```

---

## Testing Methods

### Method 1: OneSignal Dashboard (Recommended for Quick Tests)

1. Go to **Messages** → **New Push**
2. Select **"Test Subscriptions"** as the audience
3. Enter notification content:
   - **Title:** Test Notification
   - **Message:** This is a test message
4. Optionally add:
   - **Image:** URL to test image
   - **Data:** `{"test": true, "timestamp": "2025-12-20"}`
5. Click **"Send"** or **"Review and Send"**

```
Dashboard Path: Messages → New Push → Audience: Test Subscriptions → Send
```

### Method 2: REST API (Recommended for Integration Testing)

**Basic Test Notification:**
```bash
curl -X POST https://onesignal.com/api/v1/notifications \
  -H "Authorization: Basic YOUR_REST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "YOUR_ONESIGNAL_APP_ID",
    "included_segments": ["Test Users"],
    "headings": {"en": "API Test"},
    "contents": {"en": "Notification sent via API at '"$(date)"'"}
  }'
```

**Target Specific User:**
```bash
curl -X POST https://onesignal.com/api/v1/notifications \
  -H "Authorization: Basic YOUR_REST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "YOUR_ONESIGNAL_APP_ID",
    "include_external_user_ids": ["test_user_123"],
    "headings": {"en": "Personal Test"},
    "contents": {"en": "This notification targets your external user ID"}
  }'
```

**Rich Notification with Image:**
```bash
curl -X POST https://onesignal.com/api/v1/notifications \
  -H "Authorization: Basic YOUR_REST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "YOUR_ONESIGNAL_APP_ID",
    "included_segments": ["Test Users"],
    "headings": {"en": "Rich Notification"},
    "contents": {"en": "This notification has an image"},
    "big_picture": "https://example.com/test-image.jpg",
    "ios_attachments": {"image": "https://example.com/test-image.jpg"}
  }'
```

**Notification with Action Buttons:**
```bash
curl -X POST https://onesignal.com/api/v1/notifications \
  -H "Authorization: Basic YOUR_REST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "YOUR_ONESIGNAL_APP_ID",
    "included_segments": ["Test Users"],
    "headings": {"en": "Action Test"},
    "contents": {"en": "Tap a button below"},
    "buttons": [
      {"id": "accept", "text": "Accept"},
      {"id": "decline", "text": "Decline"}
    ]
  }'
```

### Method 3: Node.js Test Script

```typescript
// scripts/test-push-notification.ts
import fetch from 'node-fetch';

interface TestNotificationOptions {
  title: string;
  message: string;
  userIds?: string[];
  segments?: string[];
  data?: Record<string, any>;
}

async function sendTestNotification(options: TestNotificationOptions) {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !apiKey) {
    throw new Error('Missing ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY');
  }

  const body: any = {
    app_id: appId,
    headings: { en: options.title },
    contents: { en: options.message },
    data: options.data || { test: true, timestamp: new Date().toISOString() }
  };

  if (options.userIds?.length) {
    body.include_external_user_ids = options.userIds;
  } else if (options.segments?.length) {
    body.included_segments = options.segments;
  } else {
    body.included_segments = ['Test Users'];
  }

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  console.log('\n=== Notification Test Result ===');
  console.log(`Status: ${response.status === 200 ? '✅ Success' : '❌ Failed'}`);
  console.log(`Notification ID: ${result.id || 'N/A'}`);
  console.log(`Recipients: ${result.recipients || 0}`);

  if (result.errors) {
    console.log('Errors:', result.errors);
  }

  return result;
}

// Run test
sendTestNotification({
  title: 'Test Notification',
  message: `Test sent at ${new Date().toLocaleString()}`
}).catch(console.error);
```

**Run the test:**
```bash
# Set environment variables
export ONESIGNAL_APP_ID="your-app-id"
export ONESIGNAL_REST_API_KEY="your-api-key"

# Run test script
npx ts-node scripts/test-push-notification.ts
```

---

## Debugging Techniques

### 1. Check Device Registration

**In OneSignal Dashboard:**
```
Audience → All Users → Search for device → View details
```

**Check for:**
- ✅ Device appears in list
- ✅ Push token is present
- ✅ Subscribed status is true
- ✅ Last active is recent

**API Check:**
```bash
curl "https://onesignal.com/api/v1/players?app_id=YOUR_APP_ID&limit=10" \
  -H "Authorization: Basic YOUR_REST_API_KEY"
```

### 2. Check Notification Delivery

**In OneSignal Dashboard:**
```
Messages → Sent → [Your notification] → View Details
```

**Check for:**
- Total sent count
- Delivered count
- Clicked count
- Failed count and reasons

**API Check:**
```bash
curl "https://onesignal.com/api/v1/notifications/NOTIFICATION_ID?app_id=YOUR_APP_ID" \
  -H "Authorization: Basic YOUR_REST_API_KEY"
```

### 3. Common Debug Scenarios

**Scenario: Notification sent but not received**

```typescript
// Debug checklist
const debugChecklist = {
  step1: 'Check device is in All Users list',
  step2: 'Verify push token exists and is not empty',
  step3: 'Check notification permissions in device settings',
  step4: 'Verify app is not in Do Not Disturb mode',
  step5: 'Check battery optimization settings (Android)',
  step6: 'Verify FCM/APNs credentials in OneSignal dashboard',
  step7: 'Check notification delivery report in OneSignal'
};
```

**Scenario: Notifications work on Android but not iOS**

```
1. Verify APNs credentials:
   - Dashboard → Settings → Push & In-App → Apple iOS
   - Check credential type (p8 vs p12)
   - Verify Key ID and Team ID

2. Check Xcode configuration:
   - Push Notifications capability added
   - Background Modes → Remote notifications enabled
   - App Groups configured

3. Test on physical device:
   - iOS Simulator does NOT support push notifications
   - Use TestFlight or direct device installation
```

**Scenario: Rich media not showing**

```
iOS:
1. Verify Notification Service Extension is added
2. Check extension bundle ID matches pattern
3. Ensure App Groups capability on both targets
4. Image URL must be HTTPS

Android:
1. Use "big_picture" field for large images
2. Image URL must be HTTPS
3. Image should be under 1MB
```

---

## Automated Testing

### Integration Test Suite

```typescript
// __tests__/notifications.test.ts
import { describe, it, expect, beforeAll } from '@jest/globals';

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

describe('Push Notification Integration', () => {
  beforeAll(() => {
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      throw new Error('Missing OneSignal credentials');
    }
  });

  it('should send notification to test segment', async () => {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ['Test Users'],
        headings: { en: 'Integration Test' },
        contents: { en: 'Automated test notification' },
      }),
    });

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.id).toBeDefined();
    expect(result.errors).toBeUndefined();
  });

  it('should reject notification with invalid app_id', async () => {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: 'invalid-app-id',
        included_segments: ['All'],
        contents: { en: 'Test' },
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should include custom data in notification', async () => {
    const testData = {
      appointmentId: 'test_123',
      type: 'reminder',
      deepLink: '/appointments/test_123'
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ['Test Users'],
        headings: { en: 'Data Test' },
        contents: { en: 'Notification with custom data' },
        data: testData,
      }),
    });

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.id).toBeDefined();
  });
});
```

### CI/CD Integration

```yaml
# .github/workflows/notification-tests.yml
name: Notification Tests

on:
  push:
    paths:
      - 'src/services/notifications/**'
      - 'supabase/functions/send-notification/**'
  workflow_dispatch:

jobs:
  test-notifications:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run notification tests
        env:
          ONESIGNAL_APP_ID: ${{ secrets.ONESIGNAL_APP_ID }}
          ONESIGNAL_REST_API_KEY: ${{ secrets.ONESIGNAL_REST_API_KEY }}
        run: npm run test:notifications

      - name: Send test notification
        if: success()
        run: |
          curl -X POST https://onesignal.com/api/v1/notifications \
            -H "Authorization: Basic ${{ secrets.ONESIGNAL_REST_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{
              "app_id": "${{ secrets.ONESIGNAL_APP_ID }}",
              "included_segments": ["Test Users"],
              "headings": {"en": "CI Test"},
              "contents": {"en": "Build ${{ github.run_number }} passed"}
            }'
```

---

## Monitoring & Alerting

### Delivery Rate Monitoring

```typescript
// Monitor notification delivery rates
async function checkDeliveryRates(): Promise<{
  sent: number;
  delivered: number;
  failed: number;
  rate: number;
}> {
  const response = await fetch(
    `https://onesignal.com/api/v1/notifications?app_id=${ONESIGNAL_APP_ID}&limit=50`,
    {
      headers: {
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
    }
  );

  const data = await response.json();
  const notifications = data.notifications || [];

  let totalSent = 0;
  let totalDelivered = 0;
  let totalFailed = 0;

  for (const n of notifications) {
    totalSent += n.successful || 0;
    totalFailed += n.failed || 0;
    // Note: delivered is tracked separately in outcomes
  }

  return {
    sent: totalSent,
    delivered: totalDelivered,
    failed: totalFailed,
    rate: totalSent > 0 ? ((totalSent - totalFailed) / totalSent) * 100 : 0
  };
}
```

### Alerting on Failures

```typescript
// Alert if delivery rate drops
async function monitorAndAlert() {
  const stats = await checkDeliveryRates();

  if (stats.rate < 90) {
    console.error(`⚠️ Notification delivery rate is low: ${stats.rate}%`);

    // Send alert to Slack/Discord/etc.
    await sendAlert({
      title: 'Low Notification Delivery Rate',
      message: `Delivery rate dropped to ${stats.rate.toFixed(1)}%`,
      severity: 'warning'
    });
  }

  if (stats.rate < 70) {
    // Critical alert
    await sendAlert({
      title: 'Critical: Notification System Issue',
      message: `Delivery rate is critically low at ${stats.rate.toFixed(1)}%`,
      severity: 'critical'
    });
  }
}
```

---

## Troubleshooting Reference

### Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad request | Check payload format, validate app_id |
| 401 | Unauthorized | Verify REST API Key |
| 404 | Not found | Check app_id exists |
| 429 | Rate limited | Reduce request frequency |

### Common Issues Quick Reference

| Issue | Platform | Quick Fix |
|-------|----------|-----------|
| Not received | Both | Check device in All Users list |
| No permission | iOS | Request permission, check Settings |
| Battery killed | Android | Disable battery optimization |
| No sound | Both | Check notification settings |
| Wrong user | Both | Verify external_user_id mapping |
| Delayed | Both | Check internet, battery mode |

---

## Quick Commands

```bash
# Send test notification
curl -X POST https://onesignal.com/api/v1/notifications \
  -H "Authorization: Basic $ONESIGNAL_REST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"app_id":"'$ONESIGNAL_APP_ID'","included_segments":["Test Users"],"contents":{"en":"Quick test"}}'

# List recent notifications
curl "https://onesignal.com/api/v1/notifications?app_id=$ONESIGNAL_APP_ID&limit=5" \
  -H "Authorization: Basic $ONESIGNAL_REST_API_KEY"

# Get notification details
curl "https://onesignal.com/api/v1/notifications/NOTIFICATION_ID?app_id=$ONESIGNAL_APP_ID" \
  -H "Authorization: Basic $ONESIGNAL_REST_API_KEY"

# List devices
curl "https://onesignal.com/api/v1/players?app_id=$ONESIGNAL_APP_ID&limit=10" \
  -H "Authorization: Basic $ONESIGNAL_REST_API_KEY"
```

---

**Last Updated:** 2025-12-20
**Maintained By:** Mobile Notifications Ops Agent
