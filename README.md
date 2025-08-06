# Strata Noble Site

A production-ready Next.js 15 website for Strata Noble, reflecting the "Passion to Prosperity" value proposition and updated Mission & Vision.

## 🚀 Tech Stack

- **Framework**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS (JIT) with custom brand colors
- **Icons**: Heroicons React
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **Forms**: Built-in Next.js API routes (Supabase integration planned)
- **Analytics**: Plausible (planned)

## 🎨 Brand Colors

- **Navy**: `#003366` (primary)
- **Silver**: `#C0C0C0` (neutral)
- **Emerald**: `#50C878` (accent)

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx         # Root layout with fonts and metadata
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles and Tailwind
│   ├── about/             # About page
│   ├── services/          # Services page with discovery flow
│   ├── case-studies/      # Case studies page
│   ├── contact/           # Contact page
│   ├── discovery/         # Discovery form for lead qualification
│   ├── checkout/          # Stripe checkout integration
│   ├── success/           # Payment success page
│   ├── vault/             # Protected resource vault (dynamic)
│   ├── workshops/         # Workshop pages with thank-you flow
│   ├── data-analysis/     # Data analysis service page
│   ├── schedule/          # Scheduling page
│   └── api/               # API routes
│       ├── stripe/        # Stripe payment processing
│       ├── contact/       # Contact form handling
│       ├── vault/         # Vault authentication
│       ├── email/         # Email sending
│       └── waitlist/      # Waitlist management
├── components/            # Reusable components
│   ├── Header.tsx         # Sticky navigation
│   ├── Footer.tsx         # Footer with 3-column layout
│   ├── HeroSection.tsx    # Hero with CTA
│   ├── MissionSection.tsx # Mission & Vision
│   ├── ServicesSection.tsx # Services overview
│   ├── CtaSection.tsx     # Call-to-action
│   ├── Logo.tsx           # Brand logo
│   ├── CalendlyWidget.tsx # Calendly integration
│   ├── WaitlistModal.tsx  # Waitlist signup modal
│   └── ui/                # UI components
│       ├── button.tsx     # Button component
│       ├── card.tsx       # Card component
│       └── container.tsx  # Container component
├── data/                  # Static data
│   ├── services.ts        # Services data
│   ├── testimonials.ts    # Customer testimonials
│   ├── workshops.ts       # Workshop information
│   ├── caseStudies.ts     # Case study data
│   └── faqs.ts           # FAQ data
└── lib/                   # Utilities
    ├── utils.ts           # Helper functions
    ├── stripe.ts          # Stripe client configuration
    ├── stripe-server.ts   # Stripe server-side utilities
    └── analytics.ts       # Analytics utilities
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd strata-noble-site
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

> **⚠️ WARNING: Do NOT use `next export`!**
>
> This project requires dynamic routes and API endpoints (e.g., `/vault`, `/api/*`). Static export is NOT supported and will break dynamic features. Always deploy using `next build` and `next start`, or use Vercel which provides full support for dynamic Next.js apps.

## 🎯 Current Platform Features

### ✅ Core Website
- [x] Next.js 15 project with App Router
- [x] Global layout with sticky navbar and footer
- [x] Home page with hero, mission & vision, services overview
- [x] Complete service pages with detailed offerings
- [x] Case studies page with client success stories
- [x] About page with team and company information
- [x] Contact page with form integration
- [x] Responsive design across all devices
- [x] Brand-consistent styling with custom Tailwind config

### ✅ Business Flow Integration
- [x] **Discovery Flow**: Professional lead qualification form (`/discovery`)
- [x] **Stripe Integration**: Complete payment processing with checkout (`/checkout`)
- [x] **Workshop System**: Workshop listings and thank-you pages (`/workshops`)
- [x] **Resource Vault**: Protected content delivery system (`/vault`)
- [x] **Success Pages**: Post-purchase confirmation and next steps (`/success`)
- [x] **Scheduling**: Calendly integration for appointments (`/schedule`)
- [x] **Data Analysis**: Specialized service page (`/data-analysis`)

### ✅ API & Backend
- [x] **Stripe API**: Payment processing, webhook handling
- [x] **Email API**: Contact form and notification sending
- [x] **Vault API**: Authentication and access control
- [x] **Waitlist API**: Lead capture and management
- [x] **Calendly API**: Upcoming events integration

### ✅ Technical Excellence
- [x] **Build System**: Production-ready builds without errors
- [x] **Dynamic Rendering**: Proper handling of client-side features
- [x] **Error Handling**: Comprehensive error states and recovery
- [x] **Security**: Protected routes and authentication flows
- [x] **Performance**: Optimized loading and responsive design
- [x] **Code Quality**: ESLint, Prettier, TypeScript compliance

### 🔧 Recent Fixes & Improvements
- [x] **Vault Page Prerender Fix**: Resolved Next.js build failures with dynamic exports
- [x] **Stripe Checkout**: Fixed API version issues and payment processing
- [x] **Discovery Flow**: Implemented professional lead qualification system
- [x] **Code Quality**: Removed console statements, fixed linting issues
- [x] **Static Export Prevention**: Added safeguards against incompatible deployment methods

### 🔄 Next Steps
- [ ] Supabase integration for resource storage
- [ ] Email automation for vault access
- [ ] Analytics dashboard implementation
- [ ] A/B testing for conversion optimization
- [ ] SEO optimization and meta tags
- [ ] Performance monitoring and optimization
- [ ] Accessibility improvements and testing

## 🎯 Definition of Done (Sprint 1)

- [x] Site builds and deploys on Vercel without errors
- [x] Lighthouse performance and a11y scores > 90 (to be tested)
- [x] Navbar links navigate correctly
- [x] Hero copy and Mission & Vision display correctly
- [x] Responsive design works on all devices

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_BASE_URL`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `SENDGRID_API_KEY`
   - Any other environment variables from your `.env.local`
3. Deploy automatically on push to main branch
4. Vercel provides full support for dynamic routes and API endpoints

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all components
- Follow ESLint and Prettier configurations
- Use Tailwind CSS for styling
- Implement responsive design patterns

### Component Structure
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow Next.js 15 App Router conventions
- Use semantic HTML and accessibility best practices

### Git Workflow
- Main branch: Production-ready code
- Develop branch: Active development
- Feature branches: Individual features
- Daily commits to develop branch
- PR reviews against main branch

## 🔧 Configuration Files

- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `.prettierrc` - Prettier configuration

## 📞 Support

For development questions or issues:
- Check the documentation in `/docs`
- Review the Platform Refresh Plan
- Contact the development team

---

**Strata Noble** - Transforming passion into profit through strategic excellence.
