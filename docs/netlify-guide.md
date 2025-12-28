# Netlify Deployment Guide - Strata Noble Platform

## 🎯 Five-Minute Deployment Checklist

### ✅ Pre-Deployment Verification

1. **Local Build Test**
   ```bash
   npm run build
   npx serve .next
   ```
   - Verify all pages load correctly
   - Check that CSS/styling is applied
   - Test interactive elements

2. **Configuration Check**
   - ✅ `netlify.toml` properly configured
   - ✅ No `output: "standalone"` or `output: "export"` in `next.config.js`
   - ✅ Tailwind content paths include all directories
   - ✅ Environment variables properly set

### 🔧 Netlify Configuration

#### `netlify.toml` Settings
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
  NETLIFY_NEXT_PLUGIN_SKIP = "false"
```

#### Critical Environment Variables
```bash
# Supabase (Required for database functionality)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe (Required for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# All Stripe Price IDs
STRIPE_PRICE_ID_SOLUTION_LITE=price_...
STRIPE_PRICE_ID_SOLUTION_CORE=price_...
STRIPE_PRICE_ID_SOLUTION_PREMIUM=price_...
STRIPE_PRICE_ID_WORKSHOP_STANDARD=price_...
STRIPE_PRICE_ID_PRESENCE_STANDARD=price_...
STRIPE_PRICE_ID_ANALYSIS_STANDARD=price_...

# SendGrid (Required for emails)
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=contact@stratanoble.com

# Application
NEXT_PUBLIC_BASE_URL=https://stratanoble.com
NODE_ENV=production
```

### 🎨 Tailwind CSS Protection

#### Content Configuration
Our `tailwind.config.js` includes comprehensive content paths:
```javascript
content: [
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  './src/data/**/*.{js,ts,jsx,tsx,mdx}',
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './public/**/*.html',
]
```

#### Safelist Protection
Critical classes are protected from purging:
- All `bg-white` variants
- Dynamic color classes
- Transition utilities
- Transform utilities

### 🚀 Deployment Steps

1. **Connect Repository**
   - Link GitHub repository to Netlify
   - Set branch to `main`

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node.js version: `18`

3. **Set Environment Variables**
   - Add all required environment variables in Netlify dashboard
   - Ensure `NETLIFY_NEXT_PLUGIN_SKIP` is NOT set to `true`

4. **Deploy**
   - Trigger initial deployment
   - Monitor build logs for errors
   - Test all functionality after deployment

### 🔍 Troubleshooting Common Issues

#### Issue: Bare HTML with No Styling

**Cause**: Missing Next.js plugin or incorrect configuration

**Solution**:
1. Verify `@netlify/plugin-nextjs` is in `netlify.toml`
2. Check that `NETLIFY_NEXT_PLUGIN_SKIP` is not set to `true`
3. Ensure `publish = ".next"` in netlify.toml

#### Issue: Tailwind Classes Missing in Production

**Cause**: Content paths don't cover all component locations

**Solution**:
1. Verify all directories are included in `content` array
2. Check safelist for dynamically generated classes
3. Clear Netlify cache and redeploy

#### Issue: API Routes Not Working

**Cause**: Environment variables missing or incorrect

**Solution**:
1. Verify all environment variables are set in Netlify dashboard
2. Check variable names match exactly (case-sensitive)
3. Ensure no trailing spaces in values

### 📊 Post-Deployment Verification

#### Functional Tests
- [ ] Homepage loads with full styling
- [ ] Navigation works between all pages
- [ ] Contact form submits successfully
- [ ] Stripe checkout functions properly
- [ ] Email notifications send correctly
- [ ] All images and assets load
- [ ] Mobile responsiveness maintained

#### Performance Tests
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals pass
- [ ] Page load times < 3 seconds
- [ ] SEO meta tags present

### 🛡️ Security Headers

Our configuration includes essential security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 📱 Mobile & Accessibility

- ✅ Mobile-first responsive design
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation support  
- ✅ Screen reader compatibility
- ✅ Reduced motion support

### 🔄 Continuous Deployment

The platform is configured for automatic deployment:
- Push to `main` branch triggers deployment
- Build status notifications via GitHub
- Automatic cache invalidation
- Branch previews for development

## 🎉 Deployment Ready

The Strata Noble platform is fully configured for seamless Netlify deployment with:
- Optimized build configuration
- Comprehensive environment variable setup
- Protected Tailwind CSS configuration
- Security headers and performance optimization
- Complete functionality testing checklist

Follow this guide to ensure a successful deployment with all features functioning correctly.