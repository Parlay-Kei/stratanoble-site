# Flutter SDK Service

**Type**: Service (V13)
**Operator**: Direct Cuts GM

---

## Purpose

Mobile SDK, versioning, release management.

## App Versions

| Platform | Current | Min Supported |
|----------|---------|---------------|
| iOS | X.Y.Z | X.0.0 |
| Android | X.Y.Z | X.0.0 |

## Build Commands

```bash
# iOS build
flutter build ios --release

# Android build
flutter build appbundle --release

# Both
flutter build ios && flutter build appbundle
```

## Release Process

```
1. Version bump
2. Update changelog
3. Build release
4. Internal testing
5. Beta release (TestFlight/Internal Track)
6. Production release
7. Monitor crash rates
```

## Version Numbering

```
Major.Minor.Patch+Build
e.g., 2.3.1+45

Major: Breaking changes
Minor: New features
Patch: Bug fixes
Build: CI increment
```

## Store Submissions

### iOS (App Store Connect)
```
1. Archive in Xcode
2. Upload to TestFlight
3. Beta testing
4. Submit for review
5. Release
```

### Android (Play Console)
```
1. Generate signed bundle
2. Upload to internal track
3. Promote to beta
4. Promote to production
5. Staged rollout
```

## Force Update

| Version Gap | Action |
|-------------|--------|
| 1 minor | Soft prompt |
| 2+ minor | Require update |
| Any major | Force update |

## Incidents

| Issue | Resolution |
|-------|------------|
| Crash spike | Rollback, hotfix |
| Store rejection | Address feedback, resubmit |
| Build failure | Check dependencies, Flutter version |
