# OneSignal Flutter SDK Integration Checklist

**Project:** Direct-Cuts Flutter App (DC-2)
**Location:** `C:\Dev\DC-2`
**SDK Version:** onesignal_flutter ^5.3.5

---

## Pre-requisites

- [ ] Flutter SDK installed (3.0+)
- [ ] Xcode installed (for iOS)
- [ ] Android Studio installed (for Android)
- [ ] OneSignal account created at https://onesignal.com
- [ ] Firebase project created (for FCM)
- [ ] Apple Developer account (for APNs)

---

## Phase 1: OneSignal Dashboard Setup

### 1.1 Create OneSignal App
- [ ] Log in to OneSignal Dashboard
- [ ] Click "New App/Website"
- [ ] Enter app name: "Direct Cuts Mobile"
- [ ] Select platforms: Android + iOS
- [ ] Note the **App ID** (UUID format)

### 1.2 Configure Android (FCM)
- [ ] Go to Firebase Console > Project Settings > Cloud Messaging
- [ ] Verify Cloud Messaging API (V1) is **ENABLED**
- [ ] Note the **Sender ID** (12-digit number)
- [ ] Go to Service Accounts tab > Generate New Private Key
- [ ] Download JSON file (store securely!)
- [ ] In OneSignal: Settings > Push & In-App > Google Android (FCM)
- [ ] Upload Service Account JSON
- [ ] Select "Firebase Cloud Messaging API (V1)"
- [ ] Verify Sender ID matches

### 1.3 Configure iOS (APNs)
- [ ] Go to Apple Developer Portal > Keys
- [ ] Create new key with APNs capability
- [ ] Download .p8 file (one-time download!)
- [ ] Note **Key ID** (10 characters)
- [ ] Note **Team ID** (from Membership page)
- [ ] In OneSignal: Settings > Push & In-App > Apple iOS
- [ ] Upload .p8 file
- [ ] Enter Key ID, Team ID, Bundle ID
- [ ] Save configuration

---

## Phase 2: Flutter Project Setup

### 2.1 Add Dependency
- [ ] Open `pubspec.yaml`
- [ ] Add dependency:
  ```yaml
  dependencies:
    onesignal_flutter: ^5.3.5
  ```
- [ ] Run `flutter pub get`

### 2.2 Android Configuration
- [ ] Verify `android/app/build.gradle`:
  - compileSdkVersion >= 34
  - minSdkVersion >= 21
- [ ] Add `google-services.json` to `android/app/`

### 2.3 iOS Configuration
- [ ] Open `ios/Runner.xcworkspace` in Xcode
- [ ] Add **Push Notifications** capability
- [ ] Add **Background Modes** > Remote notifications
- [ ] Add **App Groups** > `group.com.directcuts.app.onesignal`

### 2.4 Create Notification Service Extension (iOS)
- [ ] File > New > Target > Notification Service Extension
- [ ] Name: `OneSignalNotificationServiceExtension`
- [ ] Language: Objective-C
- [ ] **DO NOT** click "Activate"
- [ ] Add App Groups capability (same group ID)
- [ ] Update extension Bundle ID

### 2.5 Update Podfile
- [ ] Add extension target:
  ```ruby
  target 'OneSignalNotificationServiceExtension' do
    use_frameworks!
    pod 'OneSignalXCFramework', '>= 5.0.0', '< 6.0'
  end
  ```
- [ ] Run `cd ios && pod install && cd ..`

---

## Phase 3: Code Integration

### 3.1 Initialize SDK
- [ ] Add to `lib/main.dart`:
  ```dart
  import 'package:onesignal_flutter/onesignal_flutter.dart';

  void main() async {
    WidgetsFlutterBinding.ensureInitialized();
    OneSignal.Debug.setLogLevel(OSLogLevel.verbose);
    OneSignal.initialize("YOUR_ONESIGNAL_APP_ID");
    OneSignal.Notifications.requestPermission(true);
    runApp(MyApp());
  }
  ```

### 3.2 Setup Event Listeners
- [ ] Create `lib/services/notification_service.dart`
- [ ] Add click listener
- [ ] Add foreground listener
- [ ] Add permission observer
- [ ] Add subscription observer

### 3.3 User Management
- [ ] Call `OneSignal.login(userId)` after authentication
- [ ] Call `OneSignal.logout()` on logout
- [ ] Add user tags for segmentation

### 3.4 Deep Link Handling
- [ ] Parse notification data for deep links
- [ ] Navigate to appropriate screens

---

## Phase 4: Environment Variables

### 4.1 Backend (Supabase Secrets)
- [ ] `supabase secrets set ONESIGNAL_APP_ID=<your-app-id>`
- [ ] `supabase secrets set ONESIGNAL_API_KEY=<your-rest-api-key>`

### 4.2 Verify Configuration
- [ ] Run `supabase secrets list`
- [ ] Verify both secrets are present

---

## Phase 5: Testing

### 5.1 Android Testing
- [ ] Build and run on physical device
- [ ] Verify notification permission prompt appears
- [ ] Check subscription in OneSignal dashboard
- [ ] Send test notification from dashboard
- [ ] Verify notification received

### 5.2 iOS Testing
- [ ] Build and run on physical device (NOT simulator)
- [ ] Verify permission prompt appears
- [ ] Check subscription in OneSignal dashboard
- [ ] Send test notification from dashboard
- [ ] Verify notification received

### 5.3 Integration Testing
- [ ] Login with test user
- [ ] Verify external user ID set in OneSignal
- [ ] Send targeted notification to user
- [ ] Verify deep link navigation works

---

## Phase 6: Production Readiness

### 6.1 Security
- [ ] Remove verbose logging: `OneSignal.Debug.setLogLevel(OSLogLevel.none)`
- [ ] Verify API keys are not in client code
- [ ] Ensure Service Account JSON is in .gitignore

### 6.2 App Store Preparation
- [ ] Add push notification privacy description (iOS)
- [ ] Test on multiple devices
- [ ] Verify notification icons display correctly

---

## Quick Reference

### OneSignal Dashboard
- URL: https://dashboard.onesignal.com
- App ID: `_____________________`
- REST API Key: `_____________________`

### Firebase Console
- URL: https://console.firebase.google.com
- Project ID: `_____________________`
- Sender ID: `_____________________`

### Apple Developer
- Team ID: `_____________________`
- Key ID: `_____________________`
- Bundle ID: `_____________________`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Notifications not received (Android) | Check FCM credentials, compileSdkVersion |
| Notifications not received (iOS) | Use physical device, verify APNs |
| User not in dashboard | Check SDK initialization, permissions |
| Permission prompt not showing | Already denied - guide to Settings |
| Deep links not working | Verify additionalData structure |

---

**Document Version:** 1.0
**Last Updated:** 2025-12-20
