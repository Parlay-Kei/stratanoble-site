# Direct Cuts - Technology Stack Comparison
**Generated:** December 30, 2024  
**Version:** DC-1 v1.0.0 | DC-2 v2.0.0+1

---

## Overview

Direct Cuts operates as a **two-platform marketplace** targeting both web and mobile users:
- **DC-1:** Web application for desktop/mobile browsers
- **DC-2:** Native mobile application for iOS and Android

Both platforms share the same **Supabase backend** and **Stripe payments** infrastructure.

---

## Platform Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     SHARED BACKEND                       │
├─────────────────────────────────────────────────────────┤
│  • Supabase PostgreSQL (28 schemas, 405+ indexes)      │
│  • 90+ Row Level Security (RLS) policies                │
│  • 7 Edge Functions (Deno runtime)                      │
│  • 4 Storage buckets (avatars, portfolios, docs, temp)  │
│  • Stripe Connect (payment processing)                  │
│  • Stripe Webhooks (0% error rate)                      │
│  • Real-time subscriptions (messaging, updates)         │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
┌───────▼─────────┐                  ┌────────▼────────┐
│     DC-1        │                  │      DC-2       │
│  Web Platform   │                  │  Mobile Apps    │
│  React/Vite     │                  │    Flutter      │
└─────────────────┘                  └─────────────────┘
```

---

## DC-1 (Web Application) - React Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.9.3 | Type safety |
| **Vite** | 6.4.1 | Build tool & dev server |
| **React Router** | 7.11.0 | Client-side routing |

### Backend & Authentication
| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase JS** | 2.89.0 | Backend client, Auth, Database |
| **Supabase Auth** | Built-in | Email/password, OAuth (Google) |
| **PostgreSQL** | 15+ | Primary database |
| **PostGIS** | Extension | Geolocation/geofencing |

### Payments
| Technology | Version | Purpose |
|------------|---------|---------|
| **Stripe.js** | 2.4.0 | Payment processing |
| **Stripe React** | 2.4.0 | React components |
| **Stripe Connect** | API | Barber payouts |
| **Stripe Webhooks** | API | Payment events |

### Maps & Location
| Technology | Version | Purpose |
|------------|---------|---------|
| **Mapbox GL** | 3.17.0 | Primary mapping |
| **React Leaflet** | 4.2.1 | Alternative mapping |
| **Leaflet** | 1.9.4 | Map library |

### UI & Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 4.1.17 | Utility-first CSS |
| **PostCSS** | 8.5.6 | CSS processing |
| **Autoprefixer** | 10.4.23 | CSS vendor prefixing |
| **Lucide React** | 0.562.0 | Icon library (1000+ icons) |
| **Recharts** | 3.6.0 | Charts/analytics |
| **Tailwind Merge** | 3.4.0 | Class merging utility |

### Media & Files
| Technology | Version | Purpose |
|------------|---------|---------|
| **React Dropzone** | 14.3.8 | File uploads |
| **React Image Crop** | 11.0.10 | Image cropping |
| **QRCode React** | 4.2.0 | QR code generation |
| **React Compare Slider** | 3.1.0 | Before/after images |

### Utilities & Features
| Technology | Version | Purpose |
|------------|---------|---------|
| **DND Kit** | 6.3.1 | Drag & drop |
| **React OneSignal** | 3.4.0 | Push notifications (web) |

### Development & Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vitest** | 4.0.16 | Unit testing |
| **Playwright** | 1.49.0 | E2E testing |
| **ESLint** | 9.39.2 | Linting |
| **Prettier** | 3.7.4 | Code formatting |

### Deployment
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vercel** | 50.1.3 | Hosting & CI/CD |
| **Node.js** | 18.0.0+ | Runtime requirement |

### Database Schema Deployment
- 28 database schemas
- 405+ indexes
- 90+ RLS policies
- Migration scripts (idempotent)

---

## DC-2 (Mobile Application) - Flutter Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Flutter SDK** | 3.0.0+ | UI framework |
| **Dart** | 3.0.0+ | Programming language |
| **Material Design** | Built-in | UI components |
| **Cupertino** | Built-in | iOS-style components |

### Backend & Authentication
| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase Flutter** | 2.3.0 | Backend client |
| **Flutter Localizations** | SDK | Internationalization |

### State Management
| Technology | Version | Purpose |
|------------|---------|---------|
| **Riverpod** | 2.4.9 | State management |
| **Riverpod Annotation** | 2.3.3 | Code generation |
| **Riverpod Generator** | 2.3.9 | Build-time generation |

### Navigation
| Technology | Version | Purpose |
|------------|---------|---------|
| **Go Router** | 13.2.0 | Declarative routing |

### Payments
| Technology | Version | Purpose |
|------------|---------|---------|
| **Flutter Stripe** | 10.1.1 | Payment processing |
| **Stripe SDK** | Native | iOS/Android integration |

### Maps & Location
| Technology | Version | Purpose |
|------------|---------|---------|
| **Mapbox Flutter** | 2.3.0 | Primary mapping |
| **Geolocator** | 11.0.0 | Location services |
| **Geocoding** | 2.1.1 | Address ↔ coordinates |
| **HTTP** | 1.1.0 | API requests |

### UI Components
| Technology | Version | Purpose |
|------------|---------|---------|
| **Cached Network Image** | 3.3.1 | Image caching |
| **Shimmer** | 3.0.0 | Loading animations |
| **Flutter SVG** | 2.0.9 | SVG rendering |
| **FL Chart** | 0.68.0 | Charts/analytics |
| **Lucide Icons** | 0.257.0 | Icon library |
| **Cupertino Icons** | 1.0.6 | iOS icons |

### Storage & Security
| Technology | Version | Purpose |
|------------|---------|---------|
| **Flutter Secure Storage** | 9.0.0 | Encrypted key-value storage |
| **Shared Preferences** | 2.2.2 | User preferences |

### Utilities & Permissions
| Technology | Version | Purpose |
|------------|---------|---------|
| **URL Launcher** | 6.2.4 | External links |
| **Image Picker** | 1.0.7 | Camera/gallery access |
| **Permission Handler** | 11.3.0 | Runtime permissions |
| **Intl** | 0.20.2 | Internationalization |
| **Timezone** | 0.9.4 | Timezone handling |

### Push Notifications
| Technology | Version | Purpose |
|------------|---------|---------|
| **OneSignal Flutter** | 5.3.5 | Push notifications |
| **Flutter Local Notifications** | 17.0.0 | Local notifications |

### App Branding
| Technology | Version | Purpose |
|------------|---------|---------|
| **Flutter Native Splash** | 2.3.10 | Splash screen |
| **Flutter Launcher Icons** | 0.13.1 | App icons |

### Development & Code Generation
| Technology | Version | Purpose |
|------------|---------|---------|
| **Build Runner** | 2.4.8 | Code generation |
| **Freezed** | 2.4.6 | Immutable models |
| **JSON Serializable** | 6.7.1 | JSON parsing |
| **Flutter Lints** | 3.0.1 | Linting rules |

### Platform Support
- ✅ **Android:** Min SDK 23 (Android 6.0), Target SDK 34
- ✅ **iOS:** iOS 12.0+
- ⚠️ **Web:** Configured but not primary target
- ⚠️ **Windows:** Configured but not primary target

---

## Shared Infrastructure

### Backend Services (Supabase)
```yaml
Database:
  - PostgreSQL 15+
  - 28 application schemas
  - 405+ performance indexes
  - 90+ Row Level Security policies
  - PostGIS extension (geofencing)
  - Full-text search

Edge Functions (Deno):
  1. handle-background-check (Checkr integration)
  2. checkr-webhook (Background check webhooks)
  3. training-module (Barber certification)
  4. earnings-service (Earnings calculations)
  5. product-service (Product upsells)
  6. subscription-service (Customer subscriptions)
  7. loyalty-service (Loyalty program)
  8. ambassador-service (Referral program)
  9. geofence-service (Location marketing)

Storage Buckets:
  - avatars (user profile photos)
  - portfolios (barber work examples)
  - documents (legal/verification docs)
  - temp (temporary file uploads)

Real-time:
  - Messaging channels
  - Appointment updates
  - Availability changes
  - Notification broadcasts
```

### Payment Processing (Stripe)
```yaml
Stripe Connect:
  - Custom accounts for barbers
  - Automatic payouts (daily/weekly/monthly)
  - 15% platform fee
  - Payment intent flow
  - 3D Secure (SCA compliance)

Webhooks Configured:
  - payment_intent.succeeded
  - payment_intent.payment_failed
  - charge.refunded
  - account.updated
  - payout.paid
  - payout.failed

Error Rate: 0%
```

### Push Notifications (OneSignal)
```yaml
DC-1 (Web):
  - Browser push notifications
  - Service worker integration
  - Safari web push

DC-2 (Mobile):
  - iOS: APNs integration
  - Android: FCM integration
  - In-app messages
  - User segmentation

Configuration Status: ⚠️ Pending final setup
```

---

## Feature Parity Matrix

| Feature | DC-1 (Web) | DC-2 (Mobile) | Notes |
|---------|------------|---------------|-------|
| **Authentication** | ✅ | ✅ | Shared Supabase Auth |
| **Barber Discovery** | ✅ | ✅ | Geolocation-based |
| **Booking Flow** | ✅ | ✅ | Real-time availability |
| **Payments** | ✅ | ✅ | Stripe integration |
| **Messaging** | ✅ | ✅ | Real-time chat |
| **Push Notifications** | ✅ | ⚠️ | DC-2 needs config |
| **Barber Profiles** | ✅ | ✅ | Portfolio, reviews |
| **Customer Profiles** | ✅ | ✅ | Preferences, history |
| **Admin Dashboard** | ✅ | ⚠️ | DC-2 partial |
| **Analytics** | ✅ | ⚠️ | DC-2 needs setup |
| **Offline Mode** | ❌ | ⚠️ | DC-2 partial support |
| **PWA Features** | ✅ | N/A | DC-1 only |
| **Native Features** | N/A | ⚠️ | Camera, biometrics pending |

---

## Platform-Specific Features

### DC-1 (Web) Exclusive
- PWA capabilities (install to home screen)
- Browser push notifications
- Desktop-optimized layouts
- Multi-window support
- Keyboard shortcuts
- Right-click context menus

### DC-2 (Mobile) Exclusive
- Native camera access
- Biometric authentication (Face ID/Touch ID)
- Haptic feedback
- Native share sheet
- App shortcuts
- Background location (with permission)
- Local notifications

---

## Development Environment

### DC-1 (Web)
```bash
Required:
- Node.js 18.0.0+
- npm or yarn
- Git

Development:
npm run dev              # Start dev server (port 5173)
npm run build            # Production build
npm run preview          # Preview production build
npm run typecheck        # TypeScript validation
npm run lint             # ESLint check
npm run test             # Run tests
npm run test:coverage    # Coverage report

Deployment:
npm run deploy           # Full deployment
npm run vercel:prod      # Deploy to Vercel production
```

### DC-2 (Mobile)
```bash
Required:
- Flutter SDK 3.0.0+
- Dart SDK 3.0.0+
- Android Studio (for Android)
- Xcode 15+ (for iOS, macOS only)

Development:
flutter pub get          # Install dependencies
flutter run              # Run on connected device
flutter build apk        # Build Android APK
flutter build ios        # Build iOS (macOS only)
flutter test             # Run tests
flutter analyze          # Static analysis

Code Generation:
flutter pub run build_runner build        # Generate code
flutter pub run build_runner watch        # Watch mode
```

---

## Key Differences

### Architecture
| Aspect | DC-1 | DC-2 |
|--------|------|------|
| **Paradigm** | Component-based (React) | Widget-based (Flutter) |
| **Rendering** | Virtual DOM | Custom render engine |
| **State** | Context, hooks | Riverpod (reactive) |
| **Styling** | Tailwind CSS | Material/Cupertino + custom |
| **Navigation** | React Router (declarative) | Go Router (declarative) |
| **Build** | JavaScript bundling | Native compilation |

### Performance
| Metric | DC-1 | DC-2 |
|--------|------|------|
| **Initial Load** | ~2-3s (with caching) | ~1s (native) |
| **TTI** | 3-4s | 1-2s |
| **Animations** | 60fps (depends on browser) | 120fps (native) |
| **Memory** | ~50-100MB (browser) | ~30-60MB (native) |
| **Battery** | Higher (browser overhead) | Optimized (native) |

### Development Experience
| Aspect | DC-1 | DC-2 |
|--------|------|------|
| **Hot Reload** | Fast (Vite HMR) | Very fast (Flutter HR) |
| **Build Time** | 30-60s | 2-5 minutes |
| **Platform Testing** | Browser DevTools | Physical devices/simulators |
| **Debugging** | Chrome DevTools | Dart DevTools |
| **Type Safety** | TypeScript | Dart (sound null safety) |

---

## Production Readiness

### DC-1 (Web) - 99% Complete
✅ **Complete:**
- All core features implemented
- Payment processing tested
- Real-time features working
- Responsive design validated
- PWA features configured
- Vercel deployment automated
- Error tracking configured

⚠️ **Needs Attention:**
- Final E2E test execution
- Monitoring dashboard setup
- Analytics integration (GA4/Mixpanel)
- Performance optimization audit

---

### DC-2 (Mobile) - 97% Complete (Features) / 50% (Infrastructure)
✅ **Complete:**
- All core features implemented
- UI matches DC-1 design system
- Supabase integration working
- Stripe payments functional
- Navigation flows complete

⚠️ **Needs Attention:**
- OneSignal push configuration
- Production build generation
- Code signing setup (iOS/Android)
- App store assets preparation
- Firebase Crashlytics integration
- Analytics setup
- Beta testing workflow

❌ **Not Started:**
- App Store Connect submission
- Google Play Console submission
- CI/CD pipeline for mobile
- Mobile-specific security audit
- Device farm testing

---

## Deployment Architecture

### DC-1 (Web)
```
GitHub Repository
       ↓
   [Push to main]
       ↓
   Vercel Build
       ↓
   Production Deploy (direct-cuts.vercel.app)
       ↓
   Custom Domain (directcuts.com)
```

### DC-2 (Mobile)
```
GitHub Repository
       ↓
   [Manual Build Currently]
       ↓
   ❌ CI/CD Pipeline (Not configured)
       ↓
   ❌ TestFlight/Internal Testing (Not configured)
       ↓
   ❌ App Store Submission (Not configured)
```

---

## Security Comparison

### DC-1 (Web)
```yaml
✅ Implemented:
  - HTTPS enforced
  - CSP headers configured
  - XSS protection
  - CSRF tokens
  - Supabase RLS policies
  - Secure cookie storage
  - Rate limiting (Vercel)

⚠️ Needs Review:
  - Security headers audit
  - Penetration testing
  - OWASP Top 10 validation
```

### DC-2 (Mobile)
```yaml
✅ Implemented:
  - Flutter Secure Storage (encryption)
  - Supabase RLS policies (shared)
  - HTTPS enforced

⚠️ Needs Implementation:
  - Certificate pinning
  - Jailbreak/root detection
  - Code obfuscation (ProGuard/R8)
  - Biometric authentication
  - Secure enclave usage (iOS)

❌ Not Audited:
  - Mobile security best practices
  - Platform-specific vulnerabilities
  - Binary security analysis
```

---

## Recommendation

Both platforms share a **solid foundation** with Supabase and Stripe, but have different maturity levels:

**DC-1 (Web):** Production-ready, needs monitoring/analytics  
**DC-2 (Mobile):** Feature-complete, needs infrastructure (builds, stores, monitoring)

**Priority:** Focus on DC-2 infrastructure before launching both platforms simultaneously.

---

**Document Version:** 1.0  
**Last Updated:** December 30, 2024  
**Next Review:** January 6, 2025
