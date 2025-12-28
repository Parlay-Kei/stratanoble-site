# ACHIEVERY Platform

The internal platform application within the Strata Noble ecosystem. Transforms daily activities into meaningful progress tracking for professionals seeking practical growth.

## Architecture

- **Framework**: Next.js 15 with App Router
- **UI Components**: @strata-noble/ui (shared package)
- **Utilities**: @strata-noble/utils (auth, database, Stripe integration)
- **Database**: Extends existing Strata Noble Supabase instance
- **Authentication**: Integrates with existing Strata Noble auth system

## Development

```bash
# From monorepo root
npm run dev:platform

# Or directly
cd apps/platform
npm run dev
```

## Platform Features

### Core Functionality
- **Pathfinder Onboarding**: Personalized goal discovery
- **Action Logger**: Daily activity tracking  
- **Reframe Engine**: Transform activities into skill development
- **Roadmap View**: Progress visualization without gamification
- **Weekly Narratives**: Reflection and insight generation
- **Trust Ledger**: Private achievement tracking

### Integration Points
- Leverages existing Strata Noble user accounts
- Uses established payment processing for premium tiers
- Connects with consulting services for enhanced client experience
- Shares design system for consistent brand experience

## Business Model

- **Free Tier**: Basic activity tracking (5 active goals)
- **Pro Tier**: Advanced features, unlimited goals, narratives
- **Enterprise**: Multi-user coaching tools for Strata Noble consultants

Part of Strata Noble's expansion from consulting-only to consulting + platform model.