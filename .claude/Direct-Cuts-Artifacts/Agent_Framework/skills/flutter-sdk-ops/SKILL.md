# Flutter SDK Operations Skill

**Purpose:** Flutter SDK integration, configuration, and troubleshooting for mobile applications
**Version:** 1.0.0
**Created:** 2025-12-20
**SDK Version:** OneSignal Flutter SDK 5.3.5

---

## What This Skill Does

This skill provides comprehensive Flutter SDK management for mobile applications, including:

- **OneSignal Flutter SDK**: Installation, configuration, and push notification handling
- **Firebase Flutter SDK**: FCM integration for Android push notifications
- **Platform Configuration**: iOS (Xcode, APNs) and Android (Gradle, FCM) setup
- **Package Management**: pubspec.yaml dependencies and version management
- **Event Handling**: Notification listeners, deep linking, and user management

---

## When to Use This Skill

Use this skill when you need to:

- Install OneSignal Flutter SDK in a new or existing Flutter app
- Configure iOS push notifications with APNs
- Configure Android push notifications with FCM
- Set up notification event listeners
- Handle notification deep links
- Troubleshoot notification delivery issues
- Manage user subscriptions and tags
- Integrate analytics and outcomes

---

## Quick Start

### 1. Install SDK

```yaml
# pubspec.yaml
dependencies:
  onesignal_flutter: ^5.3.5
```

```bash
flutter pub get
```

### 2. Initialize SDK

```dart
import 'package:onesignal_flutter/onesignal_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Debug logging (disable in production)
  OneSignal.Debug.setLogLevel(OSLogLevel.verbose);

  // Initialize with your App ID
  OneSignal.initialize("YOUR_ONESIGNAL_APP_ID");

  // Request permission (iOS)
  OneSignal.Notifications.requestPermission(true);

  runApp(MyApp());
}
```

### 3. Setup Event Listeners

```dart
// Add in your app initialization
void setupNotificationListeners() {
  // Notification clicked
  OneSignal.Notifications.addClickListener((event) {
    final data = event.notification.additionalData;
    handleDeepLink(data);
  });

  // Foreground notification
  OneSignal.Notifications.addForegroundWillDisplayListener((event) {
    print('Notification received: ${event.notification.title}');
    // event.preventDefault(); // To hide notification
  });

  // Permission changes
  OneSignal.Notifications.addPermissionObserver((permission) {
    print('Permission: $permission');
  });
}
```

### 4. Login User

```dart
// After user authenticates
Future<void> onUserLogin(String userId) async {
  await OneSignal.login(userId);
}

// On logout
Future<void> onUserLogout() async {
  await OneSignal.logout();
}
```

---

## Android Configuration

### build.gradle (android/app/)

```gradle
android {
    compileSdkVersion 34

    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 34
    }
}
```

### local.properties (android/)

```properties
flutter.compileSdkVersion=34
```

### Firebase Setup

1. Create Firebase project at https://console.firebase.google.com/
2. Add Android app with your package name
3. Download `google-services.json` to `android/app/`
4. Enable Cloud Messaging API (V1) in Firebase Console
5. Generate Service Account JSON:
   - Project Settings > Service accounts > Generate new private key
6. Upload to OneSignal Dashboard:
   - Settings > Push & In-App > Google Android (FCM)
   - Upload Service Account JSON
   - Select "Firebase Cloud Messaging API (V1)"

---

## iOS Configuration

### Xcode Setup

1. Open `ios/Runner.xcworkspace` in Xcode
2. Select Runner target > Signing & Capabilities
3. Add capabilities:
   - **Push Notifications**
   - **Background Modes** > check "Remote notifications"
   - **App Groups** > add `group.com.yourapp.onesignal`

### Notification Service Extension

Required for rich notifications and confirmed delivery:

1. File > New > Target > Notification Service Extension
2. Name: `OneSignalNotificationServiceExtension`
3. Language: Objective-C (recommended)
4. **DO NOT** click "Activate" when prompted
5. Add App Groups capability to extension with same group ID
6. Update extension Bundle ID: `com.yourapp.OneSignalNotificationServiceExtension`

### Podfile (ios/)

```ruby
platform :ios, '12.0'

# Add before final `end`:
target 'OneSignalNotificationServiceExtension' do
  use_frameworks!
  pod 'OneSignalXCFramework', '>= 5.0.0', '< 6.0'
end
```

```bash
cd ios && pod install && cd ..
```

### APNs Setup

1. Apple Developer Portal > Certificates, Identifiers & Profiles > Keys
2. Create new key with APNs capability
3. Download `.p8` file (one-time download!)
4. Note Key ID (10 characters) and Team ID
5. Upload to OneSignal Dashboard:
   - Settings > Push & In-App > Apple iOS (APNs)
   - Upload `.p8` file
   - Enter Key ID, Team ID, Bundle ID

---

## Complete Notification Service

```dart
// lib/services/notification_service.dart
import 'package:onesignal_flutter/onesignal_flutter.dart';

class NotificationService {
  static bool _initialized = false;

  static Future<void> initialize(String appId) async {
    if (_initialized) return;

    // Debug mode (disable for production)
    OneSignal.Debug.setLogLevel(OSLogLevel.verbose);

    // Initialize SDK
    OneSignal.initialize(appId);

    // Setup listeners
    _setupListeners();

    _initialized = true;
  }

  static void _setupListeners() {
    // Permission observer
    OneSignal.Notifications.addPermissionObserver((permission) {
      print('Notification permission: $permission');
    });

    // Push subscription observer
    OneSignal.User.pushSubscription.addObserver((state) {
      print('Push subscription changed:');
      print('  ID: ${state.current.id}');
      print('  Token: ${state.current.token}');
      print('  Opted In: ${state.current.optedIn}');
    });

    // Click listener
    OneSignal.Notifications.addClickListener((event) {
      print('Notification clicked: ${event.notification.title}');
      _handleNotificationClick(event.notification);
    });

    // Foreground listener
    OneSignal.Notifications.addForegroundWillDisplayListener((event) {
      print('Foreground notification: ${event.notification.title}');
      // To prevent display: event.preventDefault();
      // To show manually later: event.notification.display();
    });

    // In-App Message listeners
    OneSignal.InAppMessages.addClickListener((event) {
      print('In-App Message clicked: ${event.result.actionId}');
    });
  }

  static void _handleNotificationClick(OSNotification notification) {
    final data = notification.additionalData;
    if (data == null) return;

    final type = data['type'] as String?;
    final deepLink = data['deepLink'] as String?;

    switch (type) {
      case 'appointment_reminder':
        // Navigate to appointments
        break;
      case 'booking_confirmed':
        // Navigate to booking details
        break;
      case 'geofence_alert':
        // Navigate to barber profile
        break;
      case 'message_received':
        // Navigate to messages
        break;
      default:
        if (deepLink != null) {
          // Handle generic deep link
        }
    }
  }

  /// Request notification permission (iOS)
  static Future<bool> requestPermission() async {
    return await OneSignal.Notifications.requestPermission(true);
  }

  /// Check current permission status
  static Future<OSNotificationPermission> getPermissionStatus() async {
    return await OneSignal.Notifications.permissionNative;
  }

  /// Login user (call after authentication)
  static Future<void> login(String externalUserId) async {
    await OneSignal.login(externalUserId);
  }

  /// Logout user
  static Future<void> logout() async {
    await OneSignal.logout();
  }

  /// Add user tags for segmentation
  static Future<void> addTags(Map<String, String> tags) async {
    await OneSignal.User.addTags(tags);
  }

  /// Remove user tags
  static Future<void> removeTags(List<String> keys) async {
    await OneSignal.User.removeTags(keys);
  }

  /// Add user email
  static Future<void> addEmail(String email) async {
    await OneSignal.User.addEmail(email);
  }

  /// Add user SMS number
  static Future<void> addSms(String phoneNumber) async {
    await OneSignal.User.addSms(phoneNumber);
  }

  /// Opt in to push notifications
  static Future<void> optIn() async {
    await OneSignal.User.pushSubscription.optIn();
  }

  /// Opt out of push notifications
  static Future<void> optOut() async {
    await OneSignal.User.pushSubscription.optOut();
  }

  /// Get push subscription ID
  static String? get subscriptionId {
    return OneSignal.User.pushSubscription.id;
  }

  /// Check if user is opted in
  static bool get isOptedIn {
    return OneSignal.User.pushSubscription.optedIn;
  }

  /// Clear all notifications
  static void clearAll() {
    OneSignal.Notifications.clearAll();
  }

  /// Track outcome
  static Future<void> trackOutcome(String name) async {
    await OneSignal.Session.addOutcome(name);
  }

  /// Track unique outcome (once per session)
  static Future<void> trackUniqueOutcome(String name) async {
    await OneSignal.Session.addUniqueOutcome(name);
  }

  /// Track outcome with value
  static Future<void> trackOutcomeWithValue(String name, double value) async {
    await OneSignal.Session.addOutcomeWithValue(name, value);
  }

  /// Add In-App Message trigger
  static Future<void> addTrigger(String key, String value) async {
    await OneSignal.InAppMessages.addTrigger(key, value);
  }

  /// Remove In-App Message trigger
  static Future<void> removeTrigger(String key) async {
    await OneSignal.InAppMessages.removeTrigger(key);
  }

  /// Pause In-App Messages
  static void pauseInAppMessages(bool paused) {
    OneSignal.InAppMessages.paused = paused;
  }
}
```

---

## Usage Examples

### App Initialization

```dart
// lib/main.dart
import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize notifications
  await NotificationService.initialize('YOUR_ONESIGNAL_APP_ID');

  runApp(MyApp());
}
```

### User Authentication Flow

```dart
// lib/screens/login_screen.dart
Future<void> handleLogin(User user) async {
  // After successful authentication
  await NotificationService.login(user.id);

  // Add user info tags
  await NotificationService.addTags({
    'user_type': user.isBarber ? 'barber' : 'customer',
    'city': user.city,
  });

  // Add email for multi-channel
  if (user.email != null) {
    await NotificationService.addEmail(user.email!);
  }

  // Request permission after explaining value
  final permission = await NotificationService.getPermissionStatus();
  if (permission == OSNotificationPermission.notDetermined) {
    await showNotificationExplainer(); // Your UI
    await NotificationService.requestPermission();
  }
}
```

### Settings Screen

```dart
// lib/screens/settings_screen.dart
class NotificationSettingsWidget extends StatefulWidget {
  @override
  _NotificationSettingsWidgetState createState() => _NotificationSettingsWidgetState();
}

class _NotificationSettingsWidgetState extends State<NotificationSettingsWidget> {
  bool _isOptedIn = NotificationService.isOptedIn;

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      title: Text('Push Notifications'),
      subtitle: Text('Receive appointment reminders and updates'),
      value: _isOptedIn,
      onChanged: (value) async {
        if (value) {
          await NotificationService.optIn();
        } else {
          await NotificationService.optOut();
        }
        setState(() => _isOptedIn = value);
      },
    );
  }
}
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Notifications not received (Android) | Check FCM credentials in OneSignal dashboard |
| Notifications not received (iOS) | Use physical device, verify APNs credentials |
| Permission prompt not showing | Check if already denied, guide user to Settings |
| User not in dashboard | Verify SDK initialization, check for errors in logs |
| Deep links not working | Verify additionalData structure in notification payload |
| Build errors | Update compileSdkVersion to 34+, run pod install |

### Debug Checklist

```dart
void debugNotifications() {
  print('=== OneSignal Debug ===');
  print('Subscription ID: ${NotificationService.subscriptionId}');
  print('Opted In: ${NotificationService.isOptedIn}');

  OneSignal.Notifications.permissionNative.then((permission) {
    print('Permission: $permission');
  });
}
```

### Log Levels

```dart
// Development
OneSignal.Debug.setLogLevel(OSLogLevel.verbose);

// Production
OneSignal.Debug.setLogLevel(OSLogLevel.none);
```

---

## Environment Variables

### Development (.env or --dart-define)

```bash
flutter run --dart-define=ONESIGNAL_APP_ID=your-app-id
```

```dart
const onesignalAppId = String.fromEnvironment('ONESIGNAL_APP_ID');
```

### Supabase Secrets (Backend)

```bash
supabase secrets set ONESIGNAL_APP_ID=your-app-id
supabase secrets set ONESIGNAL_API_KEY=your-rest-api-key
```

---

## API Quick Reference

### Initialization
- `OneSignal.initialize(appId)` - Initialize SDK
- `OneSignal.Debug.setLogLevel(level)` - Set logging level

### Notifications
- `OneSignal.Notifications.requestPermission(true)` - Request permission
- `OneSignal.Notifications.clearAll()` - Clear all notifications
- `OneSignal.Notifications.addClickListener(callback)` - Click handler
- `OneSignal.Notifications.addForegroundWillDisplayListener(callback)` - Foreground handler
- `OneSignal.Notifications.addPermissionObserver(callback)` - Permission changes

### User Management
- `OneSignal.login(externalId)` - Login with external ID
- `OneSignal.logout()` - Logout
- `OneSignal.User.addTags(tags)` - Add tags
- `OneSignal.User.removeTags(keys)` - Remove tags
- `OneSignal.User.addEmail(email)` - Add email
- `OneSignal.User.addSms(phone)` - Add SMS

### Push Subscription
- `OneSignal.User.pushSubscription.optIn()` - Opt in
- `OneSignal.User.pushSubscription.optOut()` - Opt out
- `OneSignal.User.pushSubscription.id` - Get subscription ID
- `OneSignal.User.pushSubscription.optedIn` - Check opt-in status
- `OneSignal.User.pushSubscription.addObserver(callback)` - Observe changes

### In-App Messages
- `OneSignal.InAppMessages.addTrigger(key, value)` - Add trigger
- `OneSignal.InAppMessages.removeTrigger(key)` - Remove trigger
- `OneSignal.InAppMessages.paused = true/false` - Pause/resume

### Analytics
- `OneSignal.Session.addOutcome(name)` - Track outcome
- `OneSignal.Session.addUniqueOutcome(name)` - Track unique outcome
- `OneSignal.Session.addOutcomeWithValue(name, value)` - Track with value

---

## Resources

- [OneSignal Flutter SDK Docs](https://documentation.onesignal.com/docs/flutter-sdk-setup)
- [pub.dev Package](https://pub.dev/packages/onesignal_flutter)
- [GitHub Repository](https://github.com/OneSignal/OneSignal-Flutter-SDK)
- [Example Project](https://github.com/OneSignal/OneSignal-Flutter-SDK/tree/main/example)
- [OneSignal Dashboard](https://dashboard.onesignal.com)

---

**Last Updated:** 2025-12-20
**Maintained By:** Flutter SDK Ops Agent
