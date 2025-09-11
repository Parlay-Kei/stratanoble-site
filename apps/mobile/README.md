# ACHIEVERY Mobile App

The mobile companion app for the ACHIEVERY platform - Transform daily activities into meaningful progress tracking.

## Overview

ACHIEVERY Mobile brings the full power of the ACHIEVERY platform to iOS and Android devices, allowing users to:

- **Log Actions**: Quick, on-the-go activity logging with smart categorization
- **AI Reframing**: Transform casual activities into professional achievements
- **Weekly Narratives**: Receive AI-powered progress summaries
- **Progress Tracking**: Visual dashboards and roadmap progression
- **Offline Support**: Log actions without connectivity, sync when online

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase (shared with web platform)
- **State Management**: React hooks + Supabase real-time
- **UI Components**: Custom design system adapted from @strata-noble/ui
- **Authentication**: Supabase Auth with secure storage

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router file-based routing
│   ├── (tabs)/            # Main app tabs
│   │   ├── dashboard.tsx  # Progress overview
│   │   ├── actions.tsx    # Action logging
│   │   ├── roadmap.tsx    # Visual progress
│   │   ├── narratives.tsx # Weekly insights
│   │   └── profile.tsx    # User settings
│   ├── (auth)/            # Authentication screens
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Splash/loading screen
├── src/
│   ├── components/        # Reusable UI components
│   ├── lib/              # Utilities and configurations
│   │   └── supabase.ts   # Database client and helpers
│   └── types/            # TypeScript type definitions
├── assets/               # Images, icons, splash screens
├── app.json             # Expo configuration
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Development Setup

### Prerequisites

- Node.js 20.18.0
- npm >= 10.8.0
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Emulator

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run start

# Run on specific platforms
npm run ios        # iOS Simulator
npm run android    # Android Emulator  
npm run web        # Web browser
```

### Building for Production

```bash
# Build for Android
npm run build:android

# Build for iOS  
npm run build:ios

# Submit to app stores
npm run submit:android
npm run submit:ios
```

## Features

### Core MVP Features ✅

- **Bottom Tab Navigation**: 5-tab structure matching web platform
- **Dashboard**: Progress overview with dream tracking and weekly stats
- **Action Logger**: Full-featured action entry with category selection
- **Mock Data Integration**: Realistic placeholder data for development
- **Responsive Design**: Optimized for mobile screens and touch interaction

### Phase 2 Features (Planned)

- **Authentication**: Supabase auth integration with secure storage
- **Real-time Data**: Live sync with Supabase database
- **Offline Support**: SQLite local storage with background sync
- **Push Notifications**: Weekly narrative delivery and daily reminders
- **AI Reframing**: Professional language transformation via API

### Phase 3 Features (Advanced)

- **Trust Ledger**: Achievement sharing with coaches
- **Advanced Analytics**: Progress insights and pattern recognition
- **Onboarding Flow**: Multi-step dream definition and phase selection
- **Camera Integration**: Photo logging for building/creating activities

## Integration with Strata Noble Platform

### Shared Backend
- **Database**: Same Supabase instance as web platform
- **Authentication**: Unified user management across platforms
- **API Endpoints**: Reuses existing `/api/reframe` and narrative generation

### Business Model Alignment
- **Subscription Tiers**: Consistent limits and feature access
- **Coach Integration**: Trust Ledger connects to Strata Noble consultants
- **Data Insights**: Mobile activity feeds into coaching recommendations

### User Journey
1. **Discovery**: Users find ACHIEVERY through StrataNoble.com
2. **Onboarding**: Complete dream definition on web or mobile
3. **Daily Engagement**: Primary action logging happens on mobile
4. **Weekly Insights**: Receive narratives via push notifications
5. **Coaching Integration**: Share progress with Strata Noble consultants

## Architecture Decisions

### Navigation Strategy
- **Expo Router**: File-based routing for scalability and type safety
- **Bottom Tabs**: Primary navigation mimics successful productivity apps
- **Stack Navigation**: Modal flows for onboarding and detailed views

### Data Management
- **Supabase Client**: Direct integration with existing database
- **Local State**: React hooks for UI state and form management
- **Real-time**: Supabase subscriptions for live progress updates
- **Offline Queue**: Future implementation for action logging without connectivity

### UI/UX Philosophy
- **Mobile-First**: Designed specifically for mobile interaction patterns
- **Quick Actions**: One-tap action logging with smart defaults
- **Visual Feedback**: Progress bars, animations, and status indicators
- **Brand Consistency**: Matches Strata Noble design system

## Development Workflow

### Code Quality
- **TypeScript**: Strict mode with comprehensive type coverage
- **ESLint**: Expo-recommended configuration with custom rules
- **Prettier**: Consistent code formatting across team

### Testing Strategy
- **Unit Tests**: Component logic and utility functions
- **Integration Tests**: Supabase integration and API calls
- **E2E Tests**: Critical user flows using Detox

### Deployment Pipeline
- **EAS Build**: Expo Application Services for cloud builds
- **OTA Updates**: Over-the-air updates for rapid iteration
- **App Store Distribution**: Automated submission pipeline

## Contributing

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature development
- `hotfix/*`: Critical production fixes

### Commit Convention
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code formatting
- `refactor:` Code restructuring
- `test:` Test additions or modifications

## Support

For technical questions or issues:
- Check existing issues in the main repository
- Review the ACHIEVERY access flow documentation
- Contact the development team via internal channels

---

**ACHIEVERY Mobile**: Transforming daily activities into meaningful progress, wherever you are.