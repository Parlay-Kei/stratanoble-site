# Strata Noble Platform - Production Deployment Guide

## 🚀 Quick Deploy Status

**Platform Status**: Ready for Production  
**Authentication**: ✅ Implemented  
**Payment Processing**: ✅ Complete  
**NDA Workflow**: ✅ Ready  
**Lead Automation**: ✅ Ready  
**Security**: ✅ Hardened  

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

Create `.env.production` with the following variables:

```bash
# Application
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NODE_ENV=production

# NextAuth.js (REQUIRED)
NEXTAUTH_SECRET=your_production_nextauth_secret_32char_min
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Database (REQUIRED)
DATABASE_URL=postgresql://username:password@host:5432/database

# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe (REQUIRED)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
STRIPE_PRICE_ID_LITE=price_your_lite_product_price_id
STRIPE_PRICE_ID_GROWTH=price_your_growth_product_price_id
STRIPE_PRICE_ID_PARTNER=price_your_partner_product_price_id

# Email (REQUIRED)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
SES_FROM_EMAIL=noreply@yourdomain.com
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password

# DocuSign (NDA Feature)
DOCUSIGN_INTEGRATION_KEY=your_docusign_integration_key
DOCUSIGN_USER_ID=your_docusign_user_id
DOCUSIGN_ACCOUNT_ID=your_docusign_account_id
DOCUSIGN_PRIVATE_KEY=your_base64_encoded_private_key
DOCUSIGN_ENVIRONMENT=production

# AWS S3 (Document Storage)
S3_BUCKET_NAME=yourdomain-documents

# Mailchimp (Lead Automation)
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_SERVER_PREFIX=us1
MAILCHIMP_AUDIENCE_ID=your_mailchimp_audience_id

# Security
INTERNAL_API_TOKEN=your_secure_internal_api_token_64char

# Analytics (Optional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com

# Rate Limiting (Recommended)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### 2. Database Setup

```bash
# Run Prisma migrations
npx prisma db push

# Generate Prisma client
npx prisma generate

# Optional: Seed with initial data
npx prisma db seed
```

### 3. Third-Party Service Configuration

#### **Google OAuth Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://yourdomain.com/api/auth/callback/google`
   - `http://localhost:8080/api/auth/callback/google` (for development)

#### **Stripe Configuration**
1. Set up products and prices in Stripe Dashboard
2. Configure webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`

#### **DocuSign Setup** (Optional - for NDA feature)
1. Create DocuSign developer account
2. Generate RSA key pair
3. Create integration application
4. Configure redirect URI: `https://yourdomain.com/api/nda/callback`

#### **AWS Services**
1. **SES**: Verify domain and configure SMTP credentials
2. **S3**: Create bucket for document storage with proper permissions

#### **Mailchimp Setup**
1. Create Mailchimp account and audience
2. Generate API key
3. Set up automation workflows (manual configuration required)

### 4. Security Configuration

#### **Content Security Policy**
The application includes comprehensive CSP headers in `src/middleware/security.ts`.

#### **Environment Security**
- Use strong, unique secrets (32+ characters)
- Enable HSTS in production
- Configure proper CORS origins

### 5. Performance Optimization

```bash
# Build optimization
npm run build

# Check bundle size
npx @next/bundle-analyzer
```

## 🌐 Deployment Platforms

### **Vercel (Recommended)**

1. **Connect Repository**
   ```bash
   npx vercel --prod
   ```

2. **Environment Variables**
   - Add all production environment variables in Vercel dashboard
   - Set `NODE_ENV=production`

3. **Domain Configuration**
   - Add custom domain in Vercel settings
   - Configure DNS records

4. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### **Railway**

```bash
# Deploy to Railway
railway login
railway link
railway up --detach
```

### **AWS Amplify**

1. Connect GitHub repository
2. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```

## 📊 Post-Deployment Testing

### **Critical User Flows**

1. **Authentication Flow**
   ```bash
   # Test Google OAuth
   curl -I https://yourdomain.com/auth/signin
   
   # Test email magic link
   # (Manual testing required)
   ```

2. **Payment Flow**
   ```bash
   # Test checkout session creation
   curl -X POST https://yourdomain.com/api/stripe/checkout \
     -H "Content-Type: application/json" \
     -d '{"priceId": "price_test_id"}'
   ```

3. **Protected Routes**
   ```bash
   # Should redirect to signin
   curl -I https://yourdomain.com/dashboard
   ```

4. **API Endpoints**
   ```bash
   # Test contact form
   curl -X POST https://yourdomain.com/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","message":"Test"}'
   ```

### **Performance Testing**

```bash
# Lighthouse CI
npx @lhci/cli@0.12.x autorun

# Load testing
npx artillery run load-test-config.yml
```

### **Security Testing**

```bash
# Security headers check
curl -I https://yourdomain.com

# SSL/TLS check
nmap --script ssl-enum-ciphers -p 443 yourdomain.com
```

## 🔄 Monitoring & Maintenance

### **Error Tracking**
- Implement Sentry for error tracking
- Monitor application logs
- Set up uptime monitoring

### **Analytics**
- Configure Plausible Analytics
- Monitor conversion rates
- Track user flows

### **Backup Strategy**
- Database automated backups
- Environment variable secure storage
- Code repository backups

### **Update Schedule**
- Dependencies: Monthly security updates
- Node.js: Follow LTS releases
- Next.js: Update quarterly

## 🆘 Troubleshooting

### **Common Issues**

1. **NextAuth Session Issues**
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches domain
   - Clear browser cookies

2. **Database Connection**
   - Verify `DATABASE_URL` format
   - Check database permissions
   - Test connection with Prisma

3. **Stripe Webhooks**
   - Verify webhook endpoint is accessible
   - Check webhook signature verification
   - Monitor webhook delivery in Stripe

4. **Email Delivery**
   - Verify SES domain verification
   - Check SMTP credentials
   - Monitor bounce rates

### **Rollback Plan**

```bash
# Vercel rollback to previous deployment
vercel --prod --force

# Database rollback (if needed)
npx prisma db push --schema=./prisma/schema.backup.prisma
```

## 📞 Support Contacts

- **Technical Issues**: Development team
- **Hosting**: Vercel support
- **Payments**: Stripe support
- **Email**: AWS SES support

---

**🎉 Your Strata Noble platform is production-ready!**

**Next Steps:**
1. Complete environment variable setup
2. Configure third-party services  
3. Deploy to production
4. Test critical user flows
5. Monitor and optimize

**Launch Timeline**: 2-3 days for full deployment and testing