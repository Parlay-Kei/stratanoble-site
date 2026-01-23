# Mobile Notifications Operations Skill

**Purpose:** Manage push notification infrastructure across OneSignal, Firebase FCM, and APNs
**Version:** 1.0.0
**Created:** 2025-12-20

---

## What This Skill Does

This skill provides comprehensive push notification management for mobile and web applications, including:

- **OneSignal Configuration:** Dashboard setup, SDK integration, and API management
- **Firebase FCM Setup:** Service account generation, Cloud Messaging API configuration
- **APNs Configuration:** p8 token and p12 certificate management for iOS
- **Notification Delivery:** Sending targeted push notifications via REST API
- **Troubleshooting:** Diagnosing and resolving delivery failures across platforms

---

## When to Use This Skill

Use this skill when you need to:

- ✅ Set up push notifications for a new mobile app
- ✅ Configure OneSignal with Firebase FCM credentials
- ✅ Generate and upload APNs certificates for iOS
- ✅ Send push notifications via API
- ✅ Debug notification delivery issues
- ✅ Integrate OneSignal SDK into React Native or web apps
- ✅ Manage notification templates and campaigns

---

## Key Capabilities

### 1. OneSignal Dashboard Configuration

**Create and Configure OneSignal App:**
```typescript
const onesignalConfig = {
  appName: 'Direct Cuts',
  appId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  platforms: ['android', 'ios', 'web'],

  // Dashboard location: Settings → Push & In-App → Push Platforms
  androidConfig: {
    type: 'Firebase Cloud Messaging API (V1)',
    serviceAccountJson: 'path/to/service-account.json',
    senderId: '123456789012'
  },

  iosConfig: {
    type: 'p8 Token',
    keyId: 'ABC123DEF4',
    teamId: 'XYZ987654',
    bundleId: 'com.directcuts.app'
  }
};
```

**Verify Configuration Status:**
```typescript
const configStatus = await verifyOneSignalConfig();

// Returns:
{
  android: { configured: true, senderId: '123456789012', apiVersion: 'v1' },
  ios: { configured: true, credentialType: 'p8', bundleId: 'com.directcuts.app' },
  web: { configured: false, reason: 'No web push configuration' },
  overallStatus: 'partial',
  recommendations: ['Configure web push for PWA support']
}
```

### 2. Firebase FCM Credential Generation

**Step-by-Step Firebase Setup:**
```typescript
const firebaseSetup = {
  // Step 1: Create or access Firebase project
  console: 'https://console.firebase.google.com/',

  // Step 2: Enable Cloud Messaging API (V1)
  path: 'Project Settings → Cloud Messaging → Enable Cloud Messaging API (V1)',

  // Step 3: Generate Service Account JSON
  serviceAccountPath: 'Project Settings → Service accounts → Generate new private key',

  // Step 4: Note critical values
  requiredValues: {
    senderId: 'Found in Cloud Messaging tab',
    projectId: 'Found in Project settings → General',
    serviceAccountJson: 'Downloaded JSON file contains private_key, client_email'
  }
};

// Validation function
async function validateFirebaseCredentials(jsonPath: string) {
  const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const required = ['project_id', 'private_key', 'client_email'];
  const missing = required.filter(key => !serviceAccount[key]);

  return {
    valid: missing.length === 0,
    missing,
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email
  };
}
```

### 3. APNs Configuration for iOS

**p8 Token Setup (Recommended):**
```typescript
const apnsP8Config = {
  // Apple Developer Portal location
  portal: 'https://developer.apple.com/account/resources/authkeys/list',

  steps: [
    'Create new key with APNs capability enabled',
    'Download .p8 file (one-time download only!)',
    'Note Key ID (10-character alphanumeric)',
    'Note Team ID from Membership page',
    'Upload to OneSignal: Settings → Push & In-App → Apple iOS'
  ],

  requiredValues: {
    keyId: 'ABC123DEF4',  // 10 characters
    teamId: 'XYZ987654', // 10 characters
    bundleId: 'com.directcuts.app',
    p8File: 'path/to/AuthKey_ABC123DEF4.p8'
  }
};

// Verify APNs configuration
async function verifyApnsConfig(config: ApnsConfig) {
  return {
    keyIdValid: config.keyId.length === 10,
    teamIdValid: config.teamId.length === 10,
    bundleIdFormat: /^[a-zA-Z][a-zA-Z0-9.-]*$/.test(config.bundleId),
    p8FileExists: fs.existsSync(config.p8File)
  };
}
```

### 4. SDK Integration

**React Native Installation:**
```bash
# Install package
npm install react-native-onesignal
# or
yarn add react-native-onesignal

# iOS pod install
cd ios && pod install && cd ..
```

**SDK Initialization:**
```typescript
// App.tsx or index.js
import { OneSignal } from 'react-native-onesignal';

export function initializePushNotifications() {
  // Initialize with App ID
  OneSignal.initialize(process.env.ONESIGNAL_APP_ID);

  // Request permission (iOS requires explicit permission)
  OneSignal.Notifications.requestPermission(true);

  // Set external user ID for targeting
  OneSignal.login(userId);

  // Handle notification clicks
  OneSignal.Notifications.addEventListener('click', (event) => {
    console.log('Notification clicked:', event.notification);
    handleNotificationAction(event.notification.additionalData);
  });

  // Handle notification received in foreground
  OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
    console.log('Notification received:', event.notification);
    // Optionally prevent display
    // event.preventDefault();
  });
}
```

**Xcode Configuration:**
```
Required Capabilities:
1. Push Notifications
2. Background Modes → Remote notifications
3. App Groups → group.com.directcuts.app.onesignal

Required for rich media and confirmed delivery:
- Add Notification Service Extension target
- Name: OneSignalNotificationServiceExtension
- Add same App Groups capability
```

### 5. Sending Notifications

**Via REST API:**
```typescript
interface NotificationPayload {
  title: string;
  message: string;
  userIds?: string[];
  segments?: string[];
  data?: Record<string, any>;
  buttons?: Array<{ id: string; text: string }>;
  image?: string;
  schedule?: Date;
}

async function sendNotification(payload: NotificationPayload) {
  const body: any = {
    app_id: process.env.ONESIGNAL_APP_ID,
    headings: { en: payload.title },
    contents: { en: payload.message },
  };

  // Target by user IDs (external_user_id)
  if (payload.userIds?.length) {
    body.include_external_user_ids = payload.userIds;
  }

  // Target by segments
  if (payload.segments?.length) {
    body.included_segments = payload.segments;
  }

  // Add custom data for deep linking
  if (payload.data) {
    body.data = payload.data;
  }

  // Add action buttons
  if (payload.buttons?.length) {
    body.buttons = payload.buttons;
  }

  // Add big picture (Android) / attachment (iOS)
  if (payload.image) {
    body.big_picture = payload.image;
    body.ios_attachments = { image: payload.image };
  }

  // Schedule for later
  if (payload.schedule) {
    body.send_after = payload.schedule.toISOString();
  }

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  return {
    success: !result.errors,
    notificationId: result.id,
    recipients: result.recipients,
    errors: result.errors
  };
}
```

**Common Notification Types:**
```typescript
// Appointment reminder
await sendNotification({
  title: 'Appointment Tomorrow',
  message: 'Your haircut with Marcus is at 2:00 PM',
  userIds: ['customer_123'],
  data: {
    type: 'appointment_reminder',
    appointmentId: 'apt_456',
    deepLink: '/appointments/apt_456'
  }
});

// Booking confirmation
await sendNotification({
  title: 'Booking Confirmed!',
  message: 'Your appointment has been scheduled',
  userIds: ['customer_123'],
  data: { type: 'booking_confirmed', bookingId: 'bk_789' },
  buttons: [
    { id: 'view', text: 'View Details' },
    { id: 'cancel', text: 'Cancel' }
  ]
});

// Promotional notification
await sendNotification({
  title: '20% Off This Week!',
  message: 'Book any haircut and save',
  segments: ['Active Users'],
  image: 'https://example.com/promo-image.jpg',
  data: { type: 'promotion', promoCode: 'SAVE20' }
});

// Barber notification
await sendNotification({
  title: 'New Booking Request',
  message: 'John D. requested a fade for 3:00 PM',
  userIds: ['barber_456'],
  data: { type: 'new_booking', bookingId: 'bk_789' },
  buttons: [
    { id: 'accept', text: 'Accept' },
    { id: 'decline', text: 'Decline' }
  ]
});
```

---

## Troubleshooting

### Android Troubleshooting

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| Notifications not received | FCM not configured | Upload service account JSON to OneSignal |
| Sender ID mismatch | Wrong Firebase project | Use JSON from correct Firebase project |
| No sound/vibration | Notification channel settings | Check device notification settings |
| Delayed delivery | Battery optimization | Disable battery optimization for app |

### iOS Troubleshooting

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| Invalid APNs credentials | Wrong certificate/key | Verify Key ID, Team ID, Bundle ID |
| Not received on simulator | Simulator limitation | Use physical device for testing |
| No permission prompt | Permission already denied | Reset in Settings → App → Notifications |
| Extension not working | App Groups mismatch | Verify App Groups on both targets |

### General Troubleshooting

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| User not in dashboard | SDK not initialized | Initialize SDK before any user action |
| external_user_id not set | login() not called | Call OneSignal.login(userId) |
| API returns errors | Invalid credentials | Verify REST API Key |

---

## Environment Variables

```bash
# Required for all platforms
ONESIGNAL_APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ONESIGNAL_REST_API_KEY=your-rest-api-key

# Optional for user management
ONESIGNAL_USER_AUTH_KEY=your-user-auth-key

# Firebase reference (for documentation)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SENDER_ID=123456789012
```

---

## Quick Reference

### OneSignal API Endpoints

```bash
# Send notification
POST https://onesignal.com/api/v1/notifications

# View notification
GET https://onesignal.com/api/v1/notifications/{notification_id}?app_id={app_id}

# Get devices
GET https://onesignal.com/api/v1/players?app_id={app_id}

# Update user
PUT https://onesignal.com/api/v1/players/{player_id}
```

### Dashboard URLs

- OneSignal Dashboard: https://dashboard.onesignal.com
- Firebase Console: https://console.firebase.google.com
- Apple Developer: https://developer.apple.com/account

### CLI Commands

```bash
# Test notification via cURL
curl -X POST https://onesignal.com/api/v1/notifications \
  -H "Authorization: Basic $ONESIGNAL_REST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "'$ONESIGNAL_APP_ID'",
    "included_segments": ["Test Users"],
    "headings": {"en": "Test"},
    "contents": {"en": "Test message"}
  }'
```

---

## Integration with Direct-Cuts

### Database Schema for Notifications

```sql
-- Track notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  appointment_reminders BOOLEAN DEFAULT true,
  booking_confirmations BOOLEAN DEFAULT true,
  promotional BOOLEAN DEFAULT true,
  barber_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track sent notifications
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  onesignal_notification_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  sent_at TIMESTAMPTZ DEFAULT now(),
  clicked_at TIMESTAMPTZ,
  status TEXT DEFAULT 'sent'
);
```

### Supabase Edge Function

```typescript
// supabase/functions/send-push-notification/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { userId, type, title, message, data } = await req.json();

  // Check user preferences
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Respect user preferences
  if (!shouldSendNotification(type, prefs)) {
    return new Response(JSON.stringify({ sent: false, reason: 'User preference' }));
  }

  // Send via OneSignal
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Deno.env.get('ONESIGNAL_REST_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: Deno.env.get('ONESIGNAL_APP_ID'),
      include_external_user_ids: [userId],
      headings: { en: title },
      contents: { en: message },
      data: { ...data, type },
    }),
  });

  const result = await response.json();

  // Log notification
  await supabase.from('notification_log').insert({
    user_id: userId,
    onesignal_notification_id: result.id,
    type,
    title,
    message,
    data,
    status: result.errors ? 'failed' : 'sent'
  });

  return new Response(JSON.stringify(result));
});

function shouldSendNotification(type: string, prefs: any): boolean {
  if (!prefs) return true;

  const prefMap: Record<string, string> = {
    'appointment_reminder': 'appointment_reminders',
    'booking_confirmed': 'booking_confirmations',
    'promotion': 'promotional',
    'barber_update': 'barber_updates'
  };

  const prefKey = prefMap[type];
  return prefKey ? prefs[prefKey] !== false : true;
}
```

---

**Last Updated:** 2025-12-20
**Maintained By:** Mobile Notifications Ops Agent

## Sources

- [OneSignal Android Firebase Credentials](https://documentation.onesignal.com/docs/en/android-firebase-credentials)
- [OneSignal React Native SDK Setup](https://documentation.onesignal.com/docs/en/react-native-sdk-setup)
- [OneSignal GitHub Repository](https://github.com/OneSignal/react-native-onesignal)
- [FCM Deprecation Notice](https://onesignal.com/blog/what-you-should-know-about-the-fcm-deprecation-announcement/)
