# TASK: Stripe Admin Dashboard - Full Implementation

**Priority:** HIGH  
**Estimated Effort:** 16-24 hours  
**Status:** READY FOR DEVELOPMENT  
**Created:** 2024-12-16  
**Dependencies:** Existing Stripe integration, Admin auth system (`assertAdmin`)

---

## Overview

Implement a comprehensive Stripe Admin Dashboard at `/admin/stripe` providing full subscription, customer, invoice, refund, coupon, product, and analytics management without requiring direct Stripe Dashboard access.

---

## Current State Assessment

### What EXISTS ✅
- Checkout Sessions API
- Webhooks with QStash queue
- Customer Portal (authenticated)
- Stripe Connect Onboarding
- Pre-configured Price IDs
- Solution Services Packages (Lite/Core/Premium)

### What's MISSING ❌
- Admin Dashboard UI (`/admin/stripe`)
- Subscription Management CRUD
- Customer Management List/Search
- Revenue Analytics Dashboard
- Refund Processing Interface
- Coupon/Promo Management
- Invoice Management
- Product/Price Admin UI

---

## File Structure to Create

```
apps/website/src/
├── app/
│   ├── admin/
│   │   └── stripe/
│   │       ├── page.tsx                    # Main dashboard
│   │       ├── customers/
│   │       │   └── page.tsx                # Customer management
│   │       ├── subscriptions/
│   │       │   └── page.tsx                # Subscription management
│   │       ├── invoices/
│   │       │   └── page.tsx                # Invoice management
│   │       ├── refunds/
│   │       │   └── page.tsx                # Refund management
│   │       ├── coupons/
│   │       │   └── page.tsx                # Coupon management
│   │       └── products/
│   │           └── page.tsx                # Product/price management
│   └── api/
│       └── admin/
│           └── stripe/
│               ├── analytics/
│               │   └── route.ts            # Revenue metrics
│               ├── customers/
│               │   ├── route.ts            # List/create customers
│               │   └── [customerId]/
│               │       └── route.ts        # Get/update/delete customer
│               ├── subscriptions/
│               │   ├── route.ts            # List/create subscriptions
│               │   └── [subscriptionId]/
│               │       └── route.ts        # Update subscription
│               ├── invoices/
│               │   ├── route.ts            # List/create invoices
│               │   └── [invoiceId]/
│               │       └── route.ts        # Invoice actions
│               ├── refunds/
│               │   └── route.ts            # List/create refunds
│               ├── coupons/
│               │   └── route.ts            # CRUD coupons
│               └── products/
│                   ├── route.ts            # List/create products
│                   └── [productId]/
│                       └── route.ts        # Update/archive product
└── components/
    └── admin/
        └── stripe/
            ├── StripeAdminDashboard.tsx    # Main dashboard component
            ├── StripeNavigation.tsx        # Sub-navigation
            ├── MetricCard.tsx              # Metric display card
            ├── RevenueChart.tsx            # Revenue visualization
            ├── CustomersTable.tsx          # Customer list table
            ├── SubscriptionsTable.tsx      # Subscription list table
            ├── InvoicesTable.tsx           # Invoice list table
            ├── RefundsTable.tsx            # Refund list table
            ├── CouponsTable.tsx            # Coupon list table
            ├── ProductsTable.tsx           # Product list table
            ├── CustomerDetailModal.tsx     # Customer detail view
            ├── RefundModal.tsx             # Create refund modal
            ├── CreateCouponModal.tsx       # Create coupon form
            └── CreateInvoiceModal.tsx      # Create invoice form
```

---

## Phase 1: API Routes

### 1.1 Analytics Endpoint

**File:** `apps/website/src/app/api/admin/stripe/analytics/route.ts`

**Purpose:** Fetch revenue metrics, MRR, customer count, subscription stats

**GET Parameters:**
- `period` - Number of days to analyze (default: 30)

**Response:**
```typescript
{
  metrics: {
    totalRevenue: number;      // Total revenue in period
    mrr: number;               // Monthly Recurring Revenue
    activeSubscriptions: number;
    totalCustomers: number;
    period: number;
  };
  revenueChart: Array<{ date: string; amount: number }>;
  timestamp: string;
}
```

**Implementation Notes:**
- Use `stripe.balanceTransactions.list()` for revenue
- Use `stripe.subscriptions.list({ status: 'active' })` for MRR
- Calculate MRR by summing monthly amounts (divide yearly by 12)

---

### 1.2 Customers Endpoints

**File:** `apps/website/src/app/api/admin/stripe/customers/route.ts`

**GET - List Customers:**
- Parameters: `limit`, `starting_after`, `email` (search)
- Return: Paginated customer list with basic info

**POST - Create Customer:**
- Body: `{ email, name, metadata }`
- Return: Created customer object

**File:** `apps/website/src/app/api/admin/stripe/customers/[customerId]/route.ts`

**GET - Customer Detail:**
- Return: Customer + subscriptions + invoices + payment methods

**PATCH - Update Customer:**
- Body: `{ email?, name?, metadata? }`

**DELETE - Delete Customer:**
- Permanently delete customer from Stripe

---

### 1.3 Subscriptions Endpoints

**File:** `apps/website/src/app/api/admin/stripe/subscriptions/route.ts`

**GET - List Subscriptions:**
- Parameters: `limit`, `starting_after`, `status` (active/canceled/past_due/all)
- Return: Subscriptions with expanded customer data

**POST - Create Subscription:**
- Body: `{ customerId, priceId, metadata }`

**File:** `apps/website/src/app/api/admin/stripe/subscriptions/[subscriptionId]/route.ts`

**PATCH - Subscription Actions:**
- Body: `{ action: 'cancel' | 'cancel_at_period_end' | 'resume' | 'pause' | 'unpause' | 'change_plan', priceId? }`

---

### 1.4 Invoices Endpoints

**File:** `apps/website/src/app/api/admin/stripe/invoices/route.ts`

**GET - List Invoices:**
- Parameters: `limit`, `starting_after`, `status`, `customer`

**POST - Create Invoice:**
- Body: `{ customerId, items: [{ amount, description }], autoAdvance, daysUntilDue }`

**File:** `apps/website/src/app/api/admin/stripe/invoices/[invoiceId]/route.ts`

**PATCH - Invoice Actions:**
- Body: `{ action: 'send' | 'void' | 'mark_uncollectible' | 'pay' | 'finalize' }`

---

### 1.5 Refunds Endpoint

**File:** `apps/website/src/app/api/admin/stripe/refunds/route.ts`

**GET - List Refunds:**
- Parameters: `limit`, `starting_after`, `charge`

**POST - Create Refund:**
- Body: `{ chargeId?, paymentIntentId?, amount?, reason?, metadata? }`
- Note: Omit `amount` for full refund

---

### 1.6 Coupons Endpoint

**File:** `apps/website/src/app/api/admin/stripe/coupons/route.ts`

**GET - List Coupons:**
- Return: All coupons with redemption stats

**POST - Create Coupon:**
- Body: `{ id?, name, percentOff?, amountOff?, currency?, duration, durationInMonths?, maxRedemptions?, redeemBy? }`

**DELETE - Delete Coupon:**
- Query: `?id=coupon_id`

---

### 1.7 Products Endpoints

**File:** `apps/website/src/app/api/admin/stripe/products/route.ts`

**GET - List Products:**
- Parameters: `limit`, `starting_after`, `active`
- Return: Products with their prices

**POST - Create Product:**
- Body: `{ name, description?, images?, metadata?, price?: { unitAmount, currency, recurring? } }`

**File:** `apps/website/src/app/api/admin/stripe/products/[productId]/route.ts`

**PATCH - Update Product:**
- Body: `{ name?, description?, active?, images?, metadata? }`

**DELETE - Archive Product:**
- Sets `active: false` (Stripe doesn't allow deletion of products with transactions)

---

## Phase 2: Frontend Components

### 2.1 Main Dashboard

**File:** `apps/website/src/app/admin/stripe/page.tsx`

Features:
- 4 metric cards (Total Revenue, MRR, Active Subs, Total Customers)
- Revenue chart (bar chart by day)
- Period selector (7/30/90 days)
- Quick action links to sub-pages
- Refresh button with loading state

### 2.2 Navigation Component

**File:** `apps/website/src/components/admin/stripe/StripeNavigation.tsx`

- Sticky top navigation
- Links: Overview, Customers, Subscriptions, Invoices, Refunds, Coupons, Products
- Back to Admin link
- External link to Stripe Dashboard

### 2.3 Table Components

All tables should include:
- Pagination with cursor-based navigation
- Search/filter functionality where applicable
- Loading skeletons
- Empty states
- Action buttons per row
- Responsive design

---

## Phase 3: Security Requirements

1. **All API routes MUST:**
   - Call `await assertAdmin(request)` before any Stripe operations
   - Use `hasStripeConfig()` check before accessing Stripe
   - Log all admin actions via `logger.info()`
   - Return appropriate error codes (401, 403, 500)

2. **Frontend MUST:**
   - Include Bearer token in Authorization header
   - Handle 401/403 responses with redirect to login
   - Show confirmation dialogs for destructive actions

---

## Environment Variables (Already Configured)

```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

---

## Acceptance Criteria

- [ ] Analytics endpoint returns accurate revenue metrics
- [ ] Admin can list, search, create, update, delete customers
- [ ] Admin can list subscriptions with status filter
- [ ] Admin can cancel, pause, resume, change plan on subscriptions
- [ ] Admin can create, send, void, mark paid invoices
- [ ] Admin can process full and partial refunds
- [ ] Admin can create, view, delete coupons
- [ ] Admin can create, update, archive products and prices
- [ ] All actions require admin authentication
- [ ] All actions are logged for audit trail
- [ ] UI is responsive and matches existing admin design pattern
- [ ] Error states and loading states are handled gracefully

---

## Testing Checklist

- [ ] Analytics: Verify metrics match Stripe Dashboard
- [ ] Customers: CRUD operations work correctly
- [ ] Subscriptions: All status transitions work
- [ ] Invoices: Create → Finalize → Send flow works
- [ ] Refunds: Full and partial refunds process correctly
- [ ] Coupons: New coupons appear in Stripe Dashboard
- [ ] Products: Archive removes from active products
- [ ] Auth: Unauthorized requests return 403
- [ ] Pagination: All lists paginate correctly

---

## Reference Files

- Auth Guard: `apps/website/src/lib/authGuard.ts`
- Stripe Server: `apps/website/src/lib/stripe-server.ts`
- Stripe Conditional: `apps/website/src/lib/stripe-conditional.ts`
- Admin Pattern: `apps/website/src/app/admin/devops/page.tsx`
- DevOps Component: `apps/website/src/components/admin/DevOpsMonitor.tsx`

---

## Stripe API Reference

- Customers: https://stripe.com/docs/api/customers
- Subscriptions: https://stripe.com/docs/api/subscriptions
- Invoices: https://stripe.com/docs/api/invoices
- Refunds: https://stripe.com/docs/api/refunds
- Coupons: https://stripe.com/docs/api/coupons
- Products: https://stripe.com/docs/api/products
- Prices: https://stripe.com/docs/api/prices
