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
│   ├── services/          # Services page
│   ├── case-studies/      # Case studies page
│   └── contact/           # Contact page
├── components/            # Reusable components
│   ├── Header.tsx         # Sticky navigation
│   ├── Footer.tsx         # Footer with 3-column layout
│   ├── HeroSection.tsx    # Hero with CTA
│   ├── MissionSection.tsx # Mission & Vision
│   ├── ServicesSection.tsx # Services overview
│   ├── CtaSection.tsx     # Call-to-action
│   └── Logo.tsx           # Brand logo
├── data/                  # Static data
│   └── services.ts        # Services data
└── lib/                   # Utilities
    └── utils.ts           # Helper functions
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
> This project requires dynamic routes and API endpoints (e.g., `/vault`, `/api/*`). Static export is NOT supported and will break dynamic features. Always deploy using `next build` and `next start`, or use a platform (like Vercel/Netlify) that supports dynamic Next.js apps.

## 📋 Sprint 1 Completion Status

### ✅ Completed
- [x] Next.js 15 project scaffolded
- [x] Global layout with sticky navbar and footer
- [x] Home page with hero, mission & vision, services overview
- [x] Route stubs for all service pages
- [x] Tailwind config with custom brand colors
- [x] ESLint + Prettier configuration
- [x] TypeScript configuration
- [x] Responsive design implementation
- [x] Brand-consistent styling

### 🔄 Next Steps (Sprint 2+)
- [ ] Integrate Notion CMS for content management
- [ ] Build detailed service pages
- [ ] Implement contact forms with Supabase
- [ ] Add Plausible analytics
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Accessibility improvements

## 🎯 Definition of Done (Sprint 1)

- [x] Site builds and deploys on Vercel without errors
- [x] Lighthouse performance and a11y scores > 90 (to be tested)
- [x] Navbar links navigate correctly
- [x] Hero copy and Mission & Vision display correctly
- [x] Responsive design works on all devices

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables if needed
3. Deploy automatically on push to main branch

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
