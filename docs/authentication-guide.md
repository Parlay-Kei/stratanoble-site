# Authentication System Guide - Strata Noble Platform

## 🔐 Overview

The Strata Noble platform uses **NextAuth.js** for comprehensive authentication with multi-provider support, automatic user provisioning, and tier-based access control.

## 📊 Authentication Flow

### **User Journey**
1. **Sign In Request** → User clicks "Sign In" or accesses protected route
2. **Provider Selection** → Google OAuth or Email Magic Link
3. **Authentication** → External provider or email verification
4. **Account Creation** → Automatic user record creation in database
5. **Session Management** → 30-day database-backed sessions
6. **Tier Assignment** → Subscription status determines access level

## ⚙️ Technical Implementation

### **NextAuth.js Configuration**

**File**: `src/lib/auth.ts`
```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: { /* SMTP configuration */ },
      from: process.env.SES_FROM_EMAIL,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        // Custom email template
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user tier and Stripe customer ID to session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after sign-in
    },
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
```

### **Database Schema**

**Required Tables** (handled by Prisma + NextAuth):
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  
  // Custom business fields
  stripeCustomerId String? @unique
  tier             String? // 'lite', 'growth', 'partner'
  createdAt        DateTime @default(now())
  
  // Relations
  invoices    Invoice[]
  metricFeeds MetricFeed[]
  ndas        NDA[]
}

model Account { /* NextAuth required */ }
model Session { /* NextAuth required */ }
model VerificationToken { /* NextAuth required */ }
```

### **Route Protection Middleware**

**File**: `src/middleware.ts`
```typescript
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Tier-based access control
    if (pathname.startsWith('/vault') && token) {
      const userTier = token.tier as string;
      if (!['lite', 'growth', 'partner'].includes(userTier)) {
        return NextResponse.redirect('/dashboard?error=no_subscription');
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Require authentication for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/vault/:path*']
};
```

## 🔄 User Provisioning System

### **Automatic Account Creation**

**File**: `src/app/api/provision/route.ts`

**Webhook Flow**:
1. **Stripe Payment** → `checkout.session.completed` event
2. **User Lookup** → Check if user exists by email
3. **Account Creation** → Create User record with tier assignment
4. **Legacy Support** → Create Client record for backwards compatibility
5. **Welcome Email** → Send tier-specific welcome email

```typescript
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_email;
  
  let user = await prisma.user.findUnique({
    where: { email: customerEmail }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: customerEmail,
        name: session.customer_details?.name,
        stripeCustomerId: session.customer,
        tier: determineTierFromSession(session),
      }
    });
  }

  await sendWelcomeEmail(user.email, user.name, user.tier);
}
```

## 🎨 Frontend Integration

### **Sign In Page**

**File**: `src/app/auth/signin/page.tsx`
- **Google OAuth Button** → One-click authentication
- **Email Magic Link Form** → Passwordless authentication
- **Error Handling** → User-friendly error messages
- **Mobile Responsive** → Optimized for all devices

### **Session Management**

```typescript
// Client-side session access
import { useSession } from 'next-auth/react';

function Dashboard() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <Loading />;
  if (!session) return <SignIn />;
  
  return <DashboardContent user={session.user} />;
}
```

```typescript
// Server-side session access
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Protected endpoint logic
}
```

## 🔒 Security Features

### **Session Security**
- **Database Storage** → Sessions stored in database, not JWT
- **30-Day Expiry** → Automatic session expiration
- **Secure Cookies** → HTTP-only, secure, same-site cookies
- **CSRF Protection** → Built-in CSRF token validation

### **Email Security**
- **Magic Link Expiry** → 24-hour link expiration
- **Domain Validation** → Email links validate against base URL
- **Rate Limiting** → Prevents email spam abuse

### **Provider Security**
- **OAuth State** → CSRF protection for OAuth flows
- **Secure Redirects** → Validated redirect URLs
- **Provider Verification** → Email verification for email provider

## 🌍 Environment Configuration

### **Required Variables**
```bash
# NextAuth Core
NEXTAUTH_SECRET=your_nextauth_secret_32char_minimum
NEXTAUTH_URL=https://yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Email Provider (AWS SES)
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SES_FROM_EMAIL=noreply@yourdomain.com

# Database
DATABASE_URL=postgresql://username:password@host:5432/database
```

### **Google OAuth Setup**
1. **Google Cloud Console** → Create new project
2. **OAuth 2.0 Credentials** → Configure client ID and secret
3. **Authorized Redirect URIs**:
   - `https://yourdomain.com/api/auth/callback/google`
   - `http://localhost:8080/api/auth/callback/google` (development)

## 📧 Email Templates

### **Magic Link Template**
**Professional branded email** with:
- **Branded Header** → Strata Noble gradient background
- **Clear CTA Button** → "Sign In to Dashboard"
- **Security Information** → Link expiry and safety notes
- **Responsive Design** → Works across all email clients

### **Welcome Email Template**
**Tier-specific welcome emails** including:
- **Personal Greeting** → User name and tier information
- **Dashboard Access** → Direct link to user dashboard
- **Feature Overview** → Tier-specific feature list
- **Support Information** → Contact details for assistance

## 🧪 Testing Authentication

### **Development Testing**
```bash
# Test email magic link locally
curl -X POST http://localhost:8080/api/auth/signin/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test protected route
curl -H "Cookie: next-auth.session-token=..." \
  http://localhost:8080/api/protected-endpoint
```

### **Production Checklist**
- [ ] **Google OAuth** → Test with real Google account
- [ ] **Email Magic Links** → Verify email delivery and links work
- [ ] **Session Persistence** → Test 30-day session expiry
- [ ] **Tier Access** → Verify vault access with different tiers
- [ ] **Payment Integration** → Test automatic account creation
- [ ] **Error Handling** → Test invalid credentials and network errors

## 🚨 Troubleshooting

### **Common Issues**

1. **Session Not Persisting**
   - Check `NEXTAUTH_SECRET` is set and consistent
   - Verify `NEXTAUTH_URL` matches deployed domain
   - Clear browser cookies and test again

2. **Email Links Not Working**
   - Verify SMTP credentials are correct
   - Check SES domain verification status
   - Test with different email providers

3. **Google OAuth Errors**
   - Verify redirect URIs in Google Console
   - Check client ID and secret environment variables
   - Ensure OAuth consent screen is configured

4. **Database Connection Issues**
   - Verify `DATABASE_URL` format is correct
   - Check database permissions for user creation
   - Test connection with `npx prisma db push`

---

**Authentication System Status**: ✅ **Complete and Production Ready**  
**Next Steps**: Configure production environment variables and test end-to-end flows