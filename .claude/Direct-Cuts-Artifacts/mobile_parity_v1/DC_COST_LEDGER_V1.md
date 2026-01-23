# Direct Cuts Cost Ledger V1

**Prepared By**: CFO (Economics) Dept\
**Date**: 2026-01-19T20:44:00-08:00\
**Scope**: Direct Cuts (Web + Mobile)\
**Period**: Project Start → Present + 60 Days Forward + 12 Months Run-Rate

---

## Executive Summary

**To-Date Estimated Spend**: $0 - $240 (depending on subscriptions active)\
**60-Day Completion Cost**: $124 - $3,050 (scenario-dependent)\
**12-Month Run-Rate**: $300 - $1,740/year (Lean to Growth scenarios)

**Key Finding**: Direct Cuts has operated on **free tiers** for most services.
The primary costs to-date are likely limited to domain registration and
potentially Claude Pro subscription.

---

## Cost Categories

### A. Fixed Recurring (Subscriptions)

Monthly or annual fees that recur regardless of usage.

### B. Variable Recurring (Usage-Based)

Costs that scale with traffic, storage, API calls, etc.

### C. One-Time Fees

Platform enrollments, domain purchases, certificates, legal fees.

---

## TO-DATE COSTS (Project Start → 2026-01-19)

### Fixed Recurring Costs

| Service       | Plan           | Monthly Cost   | Annual Cost      | Status       | Source                                                     |
| ------------- | -------------- | -------------- | ---------------- | ------------ | ---------------------------------------------------------- |
| **Vercel**    | Hobby (Free)   | $0             | $0               | ✅ ASSUMED   | [vercel.com/pricing](https://vercel.com/pricing)           |
| **Supabase**  | Free           | $0             | $0               | ✅ ASSUMED   | [supabase.com/pricing](https://supabase.com/pricing)       |
| **Claude AI** | Pro            | $20/mo         | $240/yr          | ⚠️ UNKNOWN   | [anthropic.com/pricing](https://www.anthropic.com/pricing) |
| **Mapbox**    | Free           | $0             | $0               | ✅ ASSUMED   | [mapbox.com/pricing](https://www.mapbox.com/pricing)       |
| **OneSignal** | Not configured | $0             | $0               | ✅ CONFIRMED | Not yet set up                                             |
| **Stripe**    | Pay-as-you-go  | $0             | $0               | ✅ CONFIRMED | No transactions yet                                        |
| **Domain**    | directcuts.com | ~$12/yr        | $12/yr           | ⚠️ ESTIMATE  | Standard domain pricing                                    |
| **SUBTOTAL**  |                | **$20-$32/mo** | **$252-$384/yr** |              |                                                            |

**Notes**:

- **Vercel Hobby**: Assumed based on single-developer project. Free tier
  includes unlimited deployments, 100GB bandwidth/month.
- **Supabase Free**: Assumed based on early-stage project. Includes 500MB
  database, 1GB storage, 2GB egress.
- **Claude AI Pro**: Unknown if active. If Steve has Claude Pro for development,
  cost is $20/month ($17/month annual billing).
- **Mapbox Free**: Confirmed via code analysis. Using public token (pk.*), free
  tier = 50k map loads/month.
- **Domain**: Estimated $12/year for .com domain (GoDaddy/Namecheap standard
  pricing).

### Variable Recurring Costs (To-Date)

| Service                 | Usage Metric   | Free Tier Limit | Estimated Usage | Overage Cost | Total Cost |
| ----------------------- | -------------- | --------------- | --------------- | ------------ | ---------- |
| **Vercel Bandwidth**    | GB transferred | 100 GB/month    | <10 GB/month    | $0           | $0         |
| **Supabase Database**   | Storage        | 500 MB          | <100 MB         | $0           | $0         |
| **Supabase Storage**    | File storage   | 1 GB            | <500 MB         | $0           | $0         |
| **Supabase Egress**     | Data transfer  | 2 GB/month      | <1 GB/month     | $0           | $0         |
| **Mapbox Map Loads**    | Web map views  | 50k/month       | <5k/month       | $0           | $0         |
| **Stripe Transactions** | Payments       | N/A             | 0 transactions  | $0           | $0         |
| **SUBTOTAL**            |                |                 |                 |              | **$0**     |

**Notes**:

- All services currently operating within free tier limits
- No production traffic yet, so usage is minimal
- Stripe has no fees until first transaction

### One-Time Costs (To-Date)

| Item                    | Cost | Date          | Status         | Source                |
| ----------------------- | ---- | ------------- | -------------- | --------------------- |
| **Domain Registration** | $12  | Unknown       | ⚠️ ESTIMATE    | Standard .com pricing |
| **Apple Developer**     | $0   | Not purchased | ❌ NOT STARTED | Required for iOS      |
| **Google Play Console** | $0   | Not purchased | ❌ NOT STARTED | Required for Android  |
| **LLC Formation**       | $0   | Not started   | ❌ NOT STARTED | Optional              |
| **SUBTOTAL**            |      |               |                | **$0-$12**            |

### **TOTAL TO-DATE COSTS**

| Category                  | Amount      |
| ------------------------- | ----------- |
| Fixed Recurring (Monthly) | $20-$32     |
| Fixed Recurring (Annual)  | $252-$384   |
| Variable Recurring        | $0          |
| One-Time                  | $0-$12      |
| **TOTAL ESTIMATED SPEND** | **$0-$240** |

**Confidence**: Medium (±30%)\
**Assumption**: Project has been running for ~6-12 months on free tiers +
possible Claude Pro subscription.

---

## FORWARD FORECAST: 60 Days to Completion

### Scenario 1: LEAN (Minimal Cost, Self-Service)

**Goal**: Ship web + Android + iOS parity with minimal spend

#### One-Time Costs

| Item                         | Cost     | Timing | Notes                             |
| ---------------------------- | -------- | ------ | --------------------------------- |
| Apple Developer (Individual) | $99      | Week 1 | Annual fee, Individual enrollment |
| Google Play Console          | $25      | Week 1 | One-time lifetime fee             |
| **SUBTOTAL**                 | **$124** |        |                                   |

#### Labor Costs

| Task                        | Hours | Rate | Cost   | Notes                         |
| --------------------------- | ----- | ---- | ------ | ----------------------------- |
| Self-service implementation | 6-7   | $0   | $0     | Steve implements using guides |
| **SUBTOTAL**                |       |      | **$0** |                               |

#### Recurring Costs (60 Days)

| Service      | Plan  | Monthly | 2 Months | Notes                  |
| ------------ | ----- | ------- | -------- | ---------------------- |
| Vercel       | Hobby | $0      | $0       | Stay on free tier      |
| Supabase     | Free  | $0      | $0       | Stay on free tier      |
| Claude AI    | Pro   | $20     | $40      | Assumed already active |
| Mapbox       | Free  | $0      | $0       | Within 50k/month limit |
| OneSignal    | Free  | $0      | $0       | <10k subscribers       |
| **SUBTOTAL** |       |         | **$40**  |                        |

**TOTAL LEAN (60 Days)**: **$164**

---

### Scenario 2: BASE (Balanced, Contractor Support) ⭐ RECOMMENDED

**Goal**: Professional execution, production quality

#### One-Time Costs

| Item                           | Cost     | Timing   | Notes                           |
| ------------------------------ | -------- | -------- | ------------------------------- |
| Apple Developer (Individual)   | $99      | Week 1   | Hybrid approach: Individual now |
| Google Play Console            | $25      | Week 1   | One-time lifetime fee           |
| LLC Formation                  | $150     | Week 1-4 | State filing (estimated)        |
| Apple Developer (Organization) | $99      | Week 4-6 | Transfer to Org when LLC ready  |
| **SUBTOTAL**                   | **$373** |          |                                 |

#### Labor Costs

| Task                                        | Hours  | Rate | Cost       | Notes      |
| ------------------------------------------- | ------ | ---- | ---------- | ---------- |
| Engineering (blocked time + booking detail) | 18     | $100 | $1,800     | Contractor |
| QA (smoke pack + proofs)                    | 3      | $75  | $225       | Contractor |
| DevOps (build config + OneSignal)           | 3      | $125 | $375       | Contractor |
| **SUBTOTAL**                                | **24** |      | **$2,400** |            |

#### Recurring Costs (60 Days)

| Service      | Plan  | Monthly | 2 Months | Notes                  |
| ------------ | ----- | ------- | -------- | ---------------------- |
| Vercel       | Hobby | $0      | $0       | Stay on free tier      |
| Supabase     | Free  | $0      | $0       | Stay on free tier      |
| Claude AI    | Pro   | $20     | $40      | Assumed already active |
| Mapbox       | Free  | $0      | $0       | Within 50k/month limit |
| OneSignal    | Free  | $0      | $0       | <10k subscribers       |
| **SUBTOTAL** |       |         | **$40**  |                        |

#### Contingency (10%)

| Item                | Amount |
| ------------------- | ------ |
| Bug fixes, overruns | $277   |

**TOTAL BASE (60 Days)**: **$3,090**

---

### Scenario 3: GROWTH (Scale-Ready, Paid Tiers)

**Goal**: Investor-grade execution, scale-ready infrastructure

#### One-Time Costs

| Item                           | Cost     | Timing   | Notes                             |
| ------------------------------ | -------- | -------- | --------------------------------- |
| Apple Developer (Organization) | $99      | Week 3-7 | Wait for LLC, no transfer         |
| Google Play Console            | $25      | Week 1   | One-time lifetime fee             |
| LLC Formation (Premium)        | $500     | Week 1-4 | Premium service (LegalZoom, etc.) |
| **SUBTOTAL**                   | **$624** |          |                                   |

#### Labor Costs

| Task                             | Hours  | Rate | Cost       | Notes                  |
| -------------------------------- | ------ | ---- | ---------- | ---------------------- |
| Engineering (comprehensive)      | 28     | $125 | $3,500     | Senior contractor      |
| QA (full suite + automation)     | 5      | $100 | $500       | Comprehensive testing  |
| DevOps (full CI/CD + monitoring) | 5      | $150 | $750       | Production-grade setup |
| Code Review                      | 3      | $125 | $375       | Senior review          |
| **SUBTOTAL**                     | **41** |      | **$5,125** |                        |

#### Recurring Costs (60 Days)

| Service             | Plan          | Monthly  | 2 Months | Notes                                |
| ------------------- | ------------- | -------- | -------- | ------------------------------------ |
| Vercel              | Pro           | $20      | $40      | 1 seat, analytics, priority support  |
| Supabase            | Pro           | $25      | $50      | 8GB database, 100GB storage, backups |
| Claude AI           | Team (1 seat) | $30      | $60      | Team collaboration                   |
| Mapbox              | Free          | $0       | $0       | Still within free tier               |
| OneSignal           | Growth        | $19      | $38      | Advanced features                    |
| Sentry (Monitoring) | Developer     | $26      | $52      | Error tracking                       |
| **SUBTOTAL**        |               | **$120** | **$240** |                                      |

#### Contingency (15%)

| Item                          | Amount |
| ----------------------------- | ------ |
| Bug fixes, overruns, unknowns | $862   |

**TOTAL GROWTH (60 Days)**: **$6,851**

---

## FORWARD FORECAST: 12-Month Run-Rate (Post-Launch)

### Scenario 1: LEAN (Free Tiers, Minimal Traffic)

**Assumptions**:

- <1,000 users/month
- <10k map loads/month
- <5k push notifications/month
- No paid support

| Service                 | Plan                | Monthly      | Annual | Notes                |
| ----------------------- | ------------------- | ------------ | ------ | -------------------- |
| Vercel                  | Hobby               | $0           | $0     | Free tier sufficient |
| Supabase                | Free                | $0           | $0     | Free tier sufficient |
| Claude AI               | Pro                 | $20          | $240   | Development support  |
| Mapbox                  | Free                | $0           | $0     | <50k loads/month     |
| OneSignal               | Free                | $0           | $0     | <10k subscribers     |
| Stripe                  | Pay-per-transaction | ~$5          | ~$60   | Minimal transactions |
| Domain                  | Renewal             | $1           | $12    | Annual renewal       |
| Apple Developer         | Individual          | $8.25        | $99    | Annual renewal       |
| Google Play             | One-time            | $0           | $0     | Already paid         |
| **TOTAL LEAN RUN-RATE** | **~$34/mo**         | **~$411/yr** |        |                      |

---

### Scenario 2: STANDARD (Moderate Growth, Some Paid Tiers)

**Assumptions**:

- 1,000-5,000 users/month
- 20k-40k map loads/month
- 10k-30k push notifications/month
- Moderate transaction volume

| Service                     | Plan                | Monthly        | Annual | Notes                       |
| --------------------------- | ------------------- | -------------- | ------ | --------------------------- |
| Vercel                      | Pro                 | $20            | $240   | Analytics, priority support |
| Supabase                    | Pro                 | $25            | $300   | 8GB database, backups       |
| Claude AI                   | Pro                 | $20            | $240   | Development support         |
| Mapbox                      | Free                | $0             | $0     | Still within free tier      |
| OneSignal                   | Growth              | $19            | $228   | Advanced features           |
| Stripe                      | Pay-per-transaction | ~$30           | ~$360  | 2.9% + 30¢ per transaction  |
| Sentry                      | Developer           | $26            | $312   | Error tracking              |
| Domain                      | Renewal             | $1             | $12    | Annual renewal              |
| Apple Developer             | Individual/Org      | $8.25          | $99    | Annual renewal              |
| Google Play                 | One-time            | $0             | $0     | Already paid                |
| **TOTAL STANDARD RUN-RATE** | **~$149/mo**        | **~$1,791/yr** |        |                             |

---

### Scenario 3: GROWTH (Scale, All Paid Tiers)

**Assumptions**:

- 5,000-20,000 users/month
- 50k-100k map loads/month
- 30k-100k push notifications/month
- Significant transaction volume

| Service                   | Plan                | Monthly        | Annual  | Notes                             |
| ------------------------- | ------------------- | -------------- | ------- | --------------------------------- |
| Vercel                    | Pro (2 seats)       | $40            | $480    | Team collaboration                |
| Supabase                  | Pro + Overages      | $50            | $600    | Usage beyond base plan            |
| Claude AI                 | Team (2 seats)      | $60            | $720    | Team collaboration                |
| Mapbox                    | Pay-as-you-go       | $20            | $240    | 50k-100k loads/month              |
| OneSignal                 | Professional        | $100           | $1,200  | Custom pricing, advanced features |
| Stripe                    | Pay-per-transaction | ~$150          | ~$1,800 | Higher transaction volume         |
| Sentry                    | Team                | $80            | $960    | Team error tracking               |
| Domain                    | Renewal             | $1             | $12     | Annual renewal                    |
| Apple Developer           | Organization        | $8.25          | $99     | Annual renewal                    |
| Google Play               | One-time            | $0             | $0      | Already paid                      |
| **TOTAL GROWTH RUN-RATE** | **~$509/mo**        | **~$6,111/yr** |         |                                   |

---

## Cost Breakdown by Category

### Fixed vs Variable Split (12-Month Standard Scenario)

| Category               | Monthly | Annual | % of Total |
| ---------------------- | ------- | ------ | ---------- |
| **Fixed Recurring**    | $119    | $1,428 | 80%        |
| **Variable Recurring** | $30     | $360   | 20%        |
| **TOTAL**              | $149    | $1,788 | 100%       |

**Key Insight**: 80% of costs are fixed subscriptions, 20% are usage-based
(primarily Stripe transaction fees).

---

## Cost Sensitivity Analysis

### What Makes Costs Spike?

| Trigger                      | Impact                        | Mitigation                     |
| ---------------------------- | ----------------------------- | ------------------------------ |
| **User Growth >10k/month**   | Supabase Pro → Team ($599/mo) | Optimize queries, add caching  |
| **Map Loads >50k/month**     | Mapbox charges $5/1k loads    | Implement map tile caching     |
| **Push Subscribers >10k**    | OneSignal Growth ($19/mo)     | Already budgeted in Standard   |
| **Transaction Volume Spike** | Stripe fees scale linearly    | No mitigation (revenue-linked) |
| **Vercel Bandwidth >100GB**  | $40/100GB overage             | Optimize assets, use CDN       |

---

## Assumptions Register

| Assumption               | Confidence | Source                       | Impact if Wrong          |
| ------------------------ | ---------- | ---------------------------- | ------------------------ |
| Vercel on Hobby plan     | High       | Single-developer project     | +$20/month if Pro needed |
| Supabase on Free plan    | High       | Early-stage, low traffic     | +$25/month if Pro needed |
| Claude AI Pro active     | Medium     | Unknown subscription status  | ±$20/month               |
| Domain cost $12/year     | High       | Standard .com pricing        | ±$5/year                 |
| Mapbox within free tier  | High       | Code analysis confirms       | +$20/month if exceeded   |
| No LLC formed yet        | High       | Steve confirmed $0 cash      | +$150-$500 one-time      |
| No Apple/Google accounts | High       | Steve confirmed not started  | +$124 one-time           |
| Labor rates $75-$150/hr  | Medium     | Market rates for contractors | ±20% variance            |

---

## Data Sources

### Pricing Research (2026-01-19)

| Service         | Source                                                                                  | Last Verified |
| --------------- | --------------------------------------------------------------------------------------- | ------------- |
| Vercel          | [vercel.com/pricing](https://vercel.com/pricing)                                        | 2026-01-19    |
| Supabase        | [supabase.com/pricing](https://supabase.com/pricing)                                    | 2026-01-19    |
| Stripe          | [stripe.com/pricing](https://stripe.com/pricing)                                        | 2026-01-19    |
| OneSignal       | [onesignal.com/pricing](https://onesignal.com/pricing)                                  | 2026-01-19    |
| Mapbox          | [mapbox.com/pricing](https://www.mapbox.com/pricing)                                    | 2026-01-19    |
| Claude AI       | [anthropic.com/pricing](https://www.anthropic.com/pricing)                              | 2026-01-19    |
| Apple Developer | [developer.apple.com](https://developer.apple.com/programs/enroll/)                     | 2026-01-19    |
| Google Play     | [play.google.com/console](https://play.google.com/console/about/programs/distribution/) | 2026-01-19    |

### Code Analysis

| Finding                    | Source File                  | Confidence |
| -------------------------- | ---------------------------- | ---------- |
| Mapbox public token (pk.*) | `lib/config/app_config.dart` | High       |
| OneSignal SDK ready        | `pubspec.yaml`               | High       |
| Stripe integration         | `package.json`               | High       |
| Supabase client            | `src/lib/supabaseClient.ts`  | High       |
| Vercel deployment          | `vercel.json`                | High       |

---

## Recommendations

### Immediate (Week 1)

1. ✅ **Verify Claude AI subscription status** - Confirm if $20/month is active
2. ✅ **Confirm domain registration cost** - Check actual invoice
3. ⚠️ **Decide on Apple enrollment path** - Individual vs Organization vs Hybrid

### Short-Term (60 Days)

1. ✅ **Stay on free tiers** - No need to upgrade until traffic increases
2. ✅ **Monitor Supabase usage** - Set up alerts at 80% of free tier limits
3. ✅ **Budget for platform fees** - $124 minimum (Apple + Google)

### Long-Term (12 Months)

1. ✅ **Plan for Supabase Pro upgrade** - When database >500MB or need backups
2. ✅ **Monitor Mapbox usage** - Set up alerts at 40k loads/month
3. ✅ **Consider Vercel Pro** - When team grows or need analytics

---

## Next Steps

1. **Steve**: Confirm Claude AI subscription status
2. **Steve**: Provide domain registration invoice (if available)
3. **CFO**: Update ledger with actual invoices when received
4. **CFO**: Create monthly cost tracking spreadsheet
5. **CFO**: Set up usage alerts for all services

---

**Prepared by CFO (Economics) Dept**\
**Confidence Level**: Medium (±30% variance)\
**Last Updated**: 2026-01-19T20:44:00-08:00\
**Next Review**: After first production deployment
