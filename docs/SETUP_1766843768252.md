# Strata Noble - Development Setup Guide

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Parlay-Kei/stratanoble-site.git
   cd stratanoble-site
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

## ⚠️ Important Notes

### Environment Variables
The application will run with placeholder values for missing environment variables, but for full functionality you should create a `.env.local` file in the `apps/website/` directory with:

```bash
# Supabase (Required for database operations)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe (Required for payments)
STRIPE_SECRET_KEY=sk_test_your-test-key-here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:8080

# Development flags
NODE_ENV=development
SKIP_RATE_LIMITING=true
SKIP_CSRF_PROTECTION=true
```

### Current Status
- ✅ Development server runs on port 8080
- ✅ Basic pages load with placeholder data
- ✅ CSS and styling working
- ⚠️ Database operations will fail without Supabase credentials
- ⚠️ Payment processing will fail without Stripe credentials
- ⚠️ Authentication will fail without proper OAuth setup

## 🛠️ Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 📁 Project Structure

```
apps/website/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   ├── lib/          # Utility functions and configurations
│   └── types/        # TypeScript type definitions
├── public/            # Static assets
└── prisma/           # Database schema
```

## 🔧 Troubleshooting

### Build Errors
- Clear `.next` directory: `Remove-Item -Recurse -Force apps/website/.next`
- Restart development server: `pnpm dev`

### Environment Issues
- Check that `.env.local` exists in `apps/website/` directory
- Verify all required environment variables are set
- Restart server after changing environment variables

### Port Conflicts
- Change port in `package.json` scripts if 8080 is busy
- Or kill process using port: `netstat -ano | findstr :8080`

## 📞 Support

For issues or questions, please check the main README.md or create an issue in the repository.
