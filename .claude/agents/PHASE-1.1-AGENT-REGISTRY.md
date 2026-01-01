# Phase 1.1 Agent Registry

## Status: 🟡 87% Complete

**Development Complete:** December 2, 2024  
**Deployment:** Pending External Config + Testing

---

## Agent Inventory

### Existing Platform Agents

| Agent | Purpose | Status |
|-------|---------|--------|
| `infra-deployment-specialist` | Infrastructure deployment | ✅ Active |
| `cli-deployment-monitor` | CLI monitoring | ✅ Active |
| `claude-skills-manager` | Skills management | ✅ Active |
| `direct-cuts-agent` | Platform operations | ✅ Active |

### Phase 1.1 Agents

| Agent | Sprint | Edge Function | Status |
|-------|--------|---------------|--------|
| `checkr-verification-agent` | 1 | `handle-background-check`, `checkr-webhook` | ✅ Deployed |
| `training-module-agent` | 1 | `training-module` | ✅ Deployed |
| `earnings-payouts-agent` | 2 | `earnings-service` | ✅ Deployed |
| `product-upsell-agent` | 2 | `product-service` | ✅ Deployed |
| `subscription-agent` | 3 | `subscription-service` | ✅ Deployed |
| `loyalty-retention-agent` | 3 | `loyalty-service` | ✅ Deployed |
| `ambassador-program-agent` | 4 | `ambassador-service` | ✅ Deployed |
| `geofencing-marketing-agent` | 4 | `geofence-service` | ✅ Deployed |

---

## Agent Specifications

### Sprint 1 Agents

#### checkr-verification-agent
**Purpose:** Manage barber background check lifecycle

**Capabilities:**
- Submit background check to Checkr API
- Process webhook callbacks
- Update barber status based on results
- Handle adverse action workflow

**Edge Functions:** `handle-background-check`, `checkr-webhook`

**Database Tables:** `background_checks`

---

#### training-module-agent
**Purpose:** Manage barber training and certification

**Capabilities:**
- Serve training modules and quizzes
- Track progress and scores
- Issue certifications on completion
- Generate PDF certificates

**Edge Function:** `training-module`

**Database Tables:** `training_modules`, `training_quiz_questions`, `barber_training_progress`, `barber_certifications`

---

### Sprint 2 Agents

#### earnings-payouts-agent
**Purpose:** Handle barber earnings and payouts

**Capabilities:**
- Calculate earnings with surge pricing
- Process instant payouts via Stripe
- Track performance bonuses
- Manage referral commissions

**Edge Function:** `earnings-service`

**Database Tables:** `surge_pricing_rules`, `barber_earnings`, `barber_payouts`, `barber_referrals`, `performance_bonuses`

---

#### product-upsell-agent
**Purpose:** Manage product catalog and orders

**Capabilities:**
- Product recommendations
- Order processing
- Commission tracking
- Sample management

**Edge Function:** `product-service`

**Database Tables:** `products`, `barber_product_recommendations`, `product_orders`, `product_order_items`, `barber_product_samples`

---

### Sprint 3 Agents

#### subscription-agent
**Purpose:** Handle customer subscription billing

**Capabilities:**
- Plan management
- Stripe subscription integration
- Invoice tracking
- Subscription booking automation

**Edge Function:** `subscription-service`

**Database Tables:** `subscription_plans`, `customer_subscriptions`, `subscription_invoices`, `subscription_bookings`

---

#### loyalty-retention-agent
**Purpose:** Manage loyalty program and retention

**Capabilities:**
- Points calculation and redemption
- Milestone tracking
- Reward fulfillment
- Grooming predictions

**Edge Function:** `loyalty-service`

**Database Tables:** `customer_milestones`, `loyalty_rewards`, `loyalty_redemptions`, `grooming_predictions`, `barber_spotlights`, `barber_milestones`

---

### Sprint 4 Agents

#### ambassador-program-agent
**Purpose:** Manage ambassador referral program

**Capabilities:**
- Application processing
- Referral tracking
- Content submission/approval
- Payout management
- Leaderboard

**Edge Function:** `ambassador-service`

**Actions:** `apply`, `applicationStatus`, `reviewApplication`, `dashboard`, `getReferralCode`, `trackReferral`, `submitContent`, `getContent`, `approveContent`, `redeemFreeCut`, `requestPayout`, `getPayoutHistory`, `leaderboard`

**Database Tables:** `ambassador_applications`, `ambassadors`, `ambassador_referrals`, `ambassador_content`, `ambassador_payouts`

---

#### geofencing-marketing-agent
**Purpose:** Location-based marketing automation

**Capabilities:**
- Geofence management (PostGIS)
- Location tracking and triggers
- Promo code validation
- Venue partnership management
- Event campaigns

**Edge Function:** `geofence-service`

**Actions:** `updateLocation`, `getNearbyPromos`, `validatePromo`, `redeemPromo`, `createGeofence`, `updateGeofence`, `getGeofences`, `createVenuePartnership`, `getVenuePartnerships`, `createLocalEvent`, `getLocalEvents`, `triggerGeofenceEntry`, `getGeofenceAnalytics`

**Database Tables:** `geofences`, `notification_templates`, `venue_partnerships`, `location_promo_codes`, `geofence_events`, `local_events`

---

## Related Documentation

| Document | Link |
|----------|------|
| Main Phase 1.1 Doc | [`PHASE-1.1-NOTION.md`](../docs/PHASE-1.1-NOTION.md) |
| Test Results | [`PHASE-1.1-TEST-RESULTS.md`](../docs/PHASE-1.1-TEST-RESULTS.md) |
| Test Data | [`PHASE-1.1-TEST-DATA.md`](../docs/PHASE-1.1-TEST-DATA.md) |

---

## Changelog

| Date | Update |
|------|--------|
| Dec 1, 2024 | 8 agent specifications created |
| Dec 2, 2024 | All 9 Edge Functions deployed |
| Dec 2, 2024 | Security fixes applied |
| Dec 2, 2024 | **87% Complete** |
