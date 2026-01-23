# Firebase Cloud Messaging (FCM) Configuration Skill

**Purpose:** Configure Firebase Cloud Messaging for Android push notifications
**Version:** 1.0.0
**Created:** 2025-12-20

---

## Overview

Firebase Cloud Messaging (FCM) is required for sending push notifications to Android devices through OneSignal. This skill provides step-by-step guidance for generating and configuring FCM credentials.

**Important:** Google deprecated legacy FCM APIs in July 2024. All new integrations must use Firebase Cloud Messaging API (V1) with Service Account JSON authentication.

---

## Prerequisites

Before starting FCM configuration:

- [ ] Google account with access to Firebase Console
- [ ] OneSignal account with an app created
- [ ] Admin access to the Firebase project (or ability to create one)

---

## Step-by-Step Setup

### Step 1: Create or Access Firebase Project

1. Navigate to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter project name (e.g., "Direct Cuts")
4. Accept Firebase terms of service
5. Click **"Create Project"**
6. Wait for provisioning, then click **"Continue"**

```
Firebase Console URL: https://console.firebase.google.com/
Project Dashboard: https://console.firebase.google.com/project/YOUR_PROJECT_ID/overview
```

### Step 2: Enable Cloud Messaging API (V1)

This step is **critical** for new and existing projects:

1. In Firebase Console, click the **gear icon** next to "Project Overview"
2. Select **"Project settings"**
3. Go to the **"Cloud Messaging"** tab
4. Verify **"Cloud Messaging API (V1)"** shows as **ENABLED**
5. If disabled, click **"Manage API in Google Cloud Console"** and enable it
6. Note the **"Sender ID"** - you'll need this for OneSignal verification

```
Location: Project Settings → Cloud Messaging tab
API Status: Must show "Enabled" for Cloud Messaging API (V1)
Sender ID: 12-digit number (e.g., 123456789012)
```

### Step 3: Generate Service Account JSON

The Service Account JSON file contains credentials that allow OneSignal to send notifications on your behalf:

1. In Firebase Console, go to **Project settings**
2. Select the **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Confirm by clicking **"Generate key"**
5. A JSON file will download automatically - **store it securely!**

```json
// Example structure (DO NOT use real keys)
{
  "type": "service_account",
  "project_id": "direct-cuts-12345",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@direct-cuts-12345.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

**Critical Fields:**
- `project_id` - Your Firebase project identifier
- `private_key` - RSA private key for authentication
- `client_email` - Service account email address

### Step 4: Upload to OneSignal

1. Log into [OneSignal Dashboard](https://dashboard.onesignal.com)
2. Select your app (or create one)
3. Go to **Settings → Push & In-App → Push Platforms**
4. Click **"Google Android (FCM)"**
5. Click **"Activate"**
6. Under **"Service Account JSON"**, click **"Choose file"**
7. Select your downloaded JSON file
8. Select **"Firebase Cloud Messaging API (V1)"** from the dropdown
9. Verify the **Sender ID** matches your Firebase project
10. Click **"Save"**

```
OneSignal Path: Settings → Push & In-App → Google Android (FCM)
Required: Service Account JSON file
API Version: Firebase Cloud Messaging API (V1)
Verification: Sender ID must match Firebase project
```

---

## Validation Script

Use this script to validate your Firebase credentials:

```typescript
// scripts/validate-fcm-credentials.ts
import * as fs from 'fs';

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

function validateFcmCredentials(jsonPath: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  projectId?: string;
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file exists
  if (!fs.existsSync(jsonPath)) {
    return { valid: false, errors: [`File not found: ${jsonPath}`], warnings };
  }

  // Parse JSON
  let serviceAccount: ServiceAccount;
  try {
    const content = fs.readFileSync(jsonPath, 'utf-8');
    serviceAccount = JSON.parse(content);
  } catch (e) {
    return { valid: false, errors: ['Invalid JSON file'], warnings };
  }

  // Validate required fields
  const requiredFields = [
    'type',
    'project_id',
    'private_key',
    'client_email',
    'auth_uri',
    'token_uri'
  ];

  for (const field of requiredFields) {
    if (!serviceAccount[field as keyof ServiceAccount]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate type
  if (serviceAccount.type !== 'service_account') {
    errors.push(`Invalid type: expected "service_account", got "${serviceAccount.type}"`);
  }

  // Validate private key format
  if (serviceAccount.private_key) {
    if (!serviceAccount.private_key.includes('BEGIN PRIVATE KEY')) {
      errors.push('Invalid private key format');
    }
  }

  // Validate client email format
  if (serviceAccount.client_email) {
    if (!serviceAccount.client_email.includes('@') ||
        !serviceAccount.client_email.includes('.iam.gserviceaccount.com')) {
      warnings.push('Client email may not be a valid service account email');
    }
  }

  // Check for common issues
  if (serviceAccount.private_key?.includes('\\n') &&
      !serviceAccount.private_key.includes('\n')) {
    warnings.push('Private key may have escaped newlines - ensure proper formatting');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    projectId: serviceAccount.project_id
  };
}

// CLI usage
const jsonPath = process.argv[2];
if (!jsonPath) {
  console.log('Usage: npx ts-node validate-fcm-credentials.ts <path-to-json>');
  process.exit(1);
}

const result = validateFcmCredentials(jsonPath);
console.log('\n=== FCM Credentials Validation ===\n');
console.log(`Valid: ${result.valid ? '✅' : '❌'}`);
console.log(`Project ID: ${result.projectId || 'Not found'}`);

if (result.errors.length > 0) {
  console.log('\nErrors:');
  result.errors.forEach(e => console.log(`  ❌ ${e}`));
}

if (result.warnings.length > 0) {
  console.log('\nWarnings:');
  result.warnings.forEach(w => console.log(`  ⚠️ ${w}`));
}

if (result.valid) {
  console.log('\n✅ Credentials are valid and ready for upload to OneSignal');
}
```

---

## Troubleshooting

### Error: "Different Sender ID"

**Symptom:** OneSignal shows "The uploaded JSON file belongs to a different Firebase project"

**Cause:** The Service Account JSON is from a different Firebase project than the one currently configured.

**Solution:**
1. Verify you're using the correct Firebase project
2. Download a new Service Account JSON from the correct project
3. If the original project is unavailable, contact support@onesignal.com with your OneSignal App ID

**Note:** The Sender ID is locked once your app exceeds 100 Android users to prevent accidental token invalidation.

### Error: "Cloud Messaging API (V1) not enabled"

**Symptom:** Upload fails or notifications don't deliver

**Solution:**
1. Go to Firebase Console → Project settings → Cloud Messaging
2. Click "Manage API in Google Cloud Console"
3. Enable "Firebase Cloud Messaging API"
4. Wait 5 minutes for propagation
5. Re-upload the Service Account JSON

### Error: "Invalid service account"

**Symptom:** OneSignal rejects the uploaded JSON

**Solution:**
1. Ensure you downloaded from Service accounts tab (not any other location)
2. Don't modify the JSON file after download
3. Check the file isn't corrupted (should be valid JSON)
4. Generate a new key if issues persist

### Notifications Not Received

**Checklist:**
- [ ] Cloud Messaging API (V1) is enabled
- [ ] Service Account JSON is correctly uploaded
- [ ] Sender ID matches in Firebase and OneSignal
- [ ] Device has Google Play Services installed
- [ ] App has notification permissions
- [ ] Device is not in Do Not Disturb mode
- [ ] App is not battery-optimized (disabled)

---

## Security Best Practices

### Storing Service Account JSON

**DO:**
- Store in a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault)
- Use environment variables for CI/CD
- Encrypt at rest
- Limit access to authorized personnel only

**DON'T:**
- Commit to version control (add to .gitignore)
- Share via email or messaging apps
- Store in public cloud storage
- Include in client-side code

```bash
# Add to .gitignore
**/firebase-*.json
**/service-account*.json
**/google-credentials*.json
```

### Credential Rotation

Rotate Service Account credentials periodically:

1. Generate new key in Firebase Console
2. Upload to OneSignal
3. Verify notifications work
4. Delete old key from Firebase Console

```
Recommended rotation: Every 90 days
After rotation: Test notifications immediately
```

---

## Environment Variables

For server-side FCM usage (optional, if not using OneSignal):

```bash
# Path to service account JSON
GOOGLE_APPLICATION_CREDENTIALS=/secure/path/to/service-account.json

# Or individual values
FIREBASE_PROJECT_ID=direct-cuts-12345
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@direct-cuts-12345.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## Quick Reference

### Firebase Console Locations

| Item | Path |
|------|------|
| Project settings | Gear icon → Project settings |
| Cloud Messaging | Project settings → Cloud Messaging tab |
| Sender ID | Cloud Messaging → Sender ID |
| Service accounts | Project settings → Service accounts tab |
| Generate key | Service accounts → Generate new private key |

### OneSignal Dashboard Locations

| Item | Path |
|------|------|
| FCM config | Settings → Push & In-App → Push Platforms |
| Android setup | Google Android (FCM) → Activate |
| Upload JSON | Service Account JSON → Choose file |

### Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OneSignal Android Setup](https://documentation.onesignal.com/docs/en/android-firebase-credentials)
- [FCM Migration Guide](https://onesignal.com/blog/what-you-should-know-about-the-fcm-deprecation-announcement/)

---

**Last Updated:** 2025-12-20
**Sources:** [OneSignal Documentation](https://documentation.onesignal.com/docs/en/android-firebase-credentials)
