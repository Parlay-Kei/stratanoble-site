# ACHIEVERY Access Flow for StrataNoble.com Platform Users

## Overview

ACHIEVERY is a comprehensive platform within the Strata Noble ecosystem that transforms daily activities into meaningful progress tracking for professionals seeking practical growth. This document outlines the complete user access flow from the main StrataNoble.com website to the ACHIEVERY platform.

## Architecture Summary

- **Main Website**: `apps/website/` - Next.js with NextAuth.js authentication
- **ACHIEVERY Platform**: `apps/platform/` - Next.js 15 with App Router and Supabase auth
- **Shared Database**: Supabase PostgreSQL with unified user management
- **Authentication**: Dual system with seamless integration between platforms

## User Access Flow

### 1. Entry Points from StrataNoble.com

#### Primary Access Points:
- **Platform Preview Page**: `/platform` - Main entry point showcasing ACHIEVERY tools
- **CTA Sections**: Multiple call-to-action buttons throughout the main site
- **Methodology Page**: `/methodology` - Links to platform preview
- **Navigation**: Direct platform access for authenticated users

#### Platform Preview Page Features:
- Tool demonstrations and feature explanations
- Pricing information ($47/month for platform access + guided support)
- Early access signup for launch notifications
- Integration messaging with human support services

### 2. Authentication Flow

#### Main Website Authentication (NextAuth.js):
```typescript
// Providers supported:
- Google OAuth
- Email magic links (via SendGrid)
- Session management with JWT tokens
```

#### Platform Authentication (Supabase):
```typescript
// Unified user management:
- Automatic profile creation in clients table
- Default tier assignment ('lite' for platform users)
- Session synchronization between platforms
```

#### Cross-Platform Integration:
- Users authenticated on main site can access platform seamlessly
- Shared user profiles in Supabase `clients` table
- Consistent tier and subscription management

### 3. User Onboarding Journey

#### Step 1: Dream Definition
- **Location**: `/onboarding` (platform)
- **Purpose**: Capture user's professional aspirations
- **Input**: Free-form text describing goals/dreams
- **Examples**: "Start a design agency", "Learn to play guitar", "Write a book"

#### Step 2: Phase Selection
Three phases available:
- **Explore Phase**: Foundation building and skill development
- **Build Phase**: Active creation, testing, and iteration  
- **Launch Phase**: Going live, marketing, and scaling

#### Starter Actions by Phase:
```typescript
explore: [
  'Research people doing what you want to do',
  'Watch tutorials or take a course in this area',
  'Join communities related to your interest',
  'Read articles and books about this topic',
  'Talk to someone who has experience in this field'
]

build: [
  'Create your first prototype or draft',
  'Set up the basic tools and workspace you need',
  'Make a simple version to test your idea',
  'Share early work with trusted friends for feedback',
  'Document what you learn as you build'
]

launch: [
  'Share your work publicly for the first time',
  'Get feedback from real users or customers',
  'Create a simple marketing plan',
  'Set up ways for people to find and contact you',
  'Track results and plan improvements'
]
```

### 4. Platform Navigation Structure

#### Main Navigation Routes:
- **Dashboard** (`/dashboard`) - Progress overview and daily actions
- **Actions** (`/actions`) - Activity logging with AI reframing
- **Narratives** (`/narratives`) - Weekly AI-generated progress summaries
- **Trust Ledger** (`/trust-ledger`) - Private achievement sharing with coaches
- **Roadmap** (`/roadmap`) - Visual progress tracking and phase management
- **Analytics** (`/analytics`) - Advanced progress analytics and insights

#### Mobile-Responsive Design:
- Dedicated mobile navigation component
- Touch-optimized interface
- Progressive web app capabilities

### 5. Tier System and Access Control

#### Subscription Tiers:
```typescript
Free Tier: {
  actions_per_week: 5,
  features: ['Basic action logging', 'Weekly narratives']
}

Growth Tier: {
  actions_per_week: 25,
  features: ['Enhanced features', 'Advanced analytics']
}

Partner Tier: {
  actions_per_week: 100,
  features: ['Full platform access', 'Trust Ledger', 'Coach integration']
}

Enterprise: {
  actions_per_week: 'unlimited',
  features: ['Multi-user coaching tools', 'Strata Noble consultant access']
}
```

#### Access Control Implementation:
- Row-Level Security (RLS) policies in Supabase
- Client-side route guards with tier validation
- API endpoint protection with user context
- Graceful degradation for lower tiers

### 6. Core Platform Features

#### Action Logger:
- **Categories**: Learning, Building, Connecting
- **AI Reframing**: OpenAI GPT-4o-mini transforms activities into professional language
- **Real-time Processing**: Immediate feedback and categorization
- **Weekly Limits**: Tier-based action quotas

#### Reframe Engine:
- Transforms casual activities into professional achievements
- Cost-optimized AI prompting
- Fallback to rule-based transformation when AI unavailable
- Context-aware professional language generation

#### Weekly Narratives:
- Automated generation via Supabase Edge Functions
- AI-powered progress summaries
- Scheduled weekly delivery
- Integration with user's dream and phase context

#### Trust Ledger:
- Private achievement sharing with coaches/mentors
- Granular access control (Summary, Detailed, Full Access)
- Secure sharing mechanisms
- Integration with Strata Noble consulting services

### 7. Integration with Strata Noble Ecosystem

#### Shared Services:
- **User Management**: Unified client profiles
- **Payment Processing**: Existing Stripe integration
- **Email Services**: SendGrid for transactional emails
- **Database**: Extended Supabase instance
- **Design System**: Consistent brand experience via `@strata-noble/ui`

#### Business Model Integration:
- Platform subscriptions complement consulting services
- Pathway to higher-tier Strata Noble engagements
- Data insights inform consulting recommendations
- Coach/consultant access through Trust Ledger

### 8. Technical Implementation Details

#### Database Schema:
```sql
-- Core ACHIEVERY tables
user_dreams: User aspirations and phase tracking
user_actions: Daily activity logging with AI reframing
weekly_narratives: Automated progress summaries
trust_ledger_shares: Private achievement sharing
user_platform_settings: Platform preferences and onboarding status
```

#### Security Implementation:
- JWT authentication for platform access
- Row-Level Security for data isolation
- CSRF protection for form submissions
- Rate limiting for AI API calls
- Secure environment variable handling

#### Performance Optimizations:
- Server-side rendering for SEO
- Client-side caching for user data
- Optimized AI API usage
- Lazy loading for non-critical components

### 9. User Journey Examples

#### New User Flow:
1. **Discovery**: User finds ACHIEVERY through StrataNoble.com platform page
2. **Interest**: Reviews tool demonstrations and pricing
3. **Signup**: Creates account via email or Google OAuth
4. **Onboarding**: Completes 2-step dream definition and phase selection
5. **First Actions**: Logs initial activities with AI reframing
6. **Weekly Rhythm**: Receives first AI-generated narrative
7. **Growth**: Upgrades tier for additional features
8. **Integration**: Shares progress with Strata Noble consultant via Trust Ledger

#### Returning User Flow:
1. **Access**: Direct login to platform dashboard
2. **Daily Logging**: Quick action entry with category selection
3. **Progress Review**: Weekly narrative consumption
4. **Phase Evolution**: Progression through Explore → Build → Launch
5. **Advanced Features**: Analytics review and roadmap planning

### 10. Success Metrics and KPIs

#### Platform Engagement:
- Onboarding completion rate: Target 80%+
- Daily active users: Track engagement patterns
- Action logging frequency: Monitor user consistency
- AI reframing satisfaction: User feedback on transformations

#### Business Integration:
- Conversion to consulting services: Track referral rates
- Tier upgrade rates: Monitor subscription growth
- Trust Ledger usage: Measure coach engagement
- Customer lifetime value: Platform + consulting combined

### 11. Future Enhancements

#### Planned Features:
- **AI Diagnostic Wizard**: Personalized assessment tools
- **AI Insight Engine**: Advanced pattern recognition
- **Interactive Strategy Builder**: Goal planning interface
- **Expert Hub**: Marketplace for specialized guidance
- **Resource Marketplace**: Curated tools and templates

#### Integration Roadmap:
- **NDA Workflow**: S3 storage and DocuSign integration
- **Lead Nurture Automation**: Mailchimp journey setup
- **Advanced Analytics**: Predictive progress modeling
- **Mobile App**: Native iOS/Android applications

## Conclusion

The ACHIEVERY access flow represents a sophisticated integration between the main StrataNoble.com website and a dedicated platform for professional growth tracking. The seamless authentication, comprehensive onboarding, and tier-based feature access create a cohesive user experience that bridges casual interest to professional development engagement.

The platform serves as both a standalone tool for individual growth and a strategic entry point into the broader Strata Noble consulting ecosystem, creating multiple touchpoints for user engagement and business growth.
