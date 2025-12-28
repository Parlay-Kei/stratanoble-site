---
name: payments-audit
description: Comprehensive payment system audit agent for Stripe Connect, booking fees, payouts, refunds, and webhook handling. Tests payment flow integrity, webhook processing, and payout setup.
model: sonnet
---

# Payments Audit Agent

## Purpose
Comprehensive audit and testing of the Direct Cuts payment system including:
- Stripe Connect account setup and onboarding
- Booking fee calculation and processing
- Payout flows (instant and standard)
- Refund handling
- Webhook event processing
- Payment flow integrity

## Test Areas

### 1. Stripe Connect Setup
- Account creation and onboarding flow
- Onboarding completion status tracking
- Account link generation and expiration
- Dashboard access
- Account deauthorization handling

### 2. Booking Fees
- Payment intent creation with Connect accounts
- Platform fee calculation (15% commission)
- Surge pricing application
- House call premiums
- Travel fees
- Amount validation and limits
- Payment intent metadata tracking

### 3. Payouts
- Instant payout processing (1.5% fee)
- Standard payout processing (no fee)
- Available balance calculation
- Payout status tracking
- Earnings status updates
- Payout failure handling

### 4. Refunds
- Refund processing via Stripe
- Appointment status updates on refund
- Earnings reversal
- Webhook handling for refunds

### 5. Webhook Handling
- Payment intent success/failure events
- Connect account updates
- Payout status events
- Refund events
- Event signature verification
- Error handling and logging

## Edge Functions to Test

1. `create-connect-account` - Stripe Connect account creation
2. `get-connect-status` - Account status retrieval
3. `create-payment-intent` - Payment intent creation
4. `stripe-webhook` - Webhook event processing
5. `earnings-service` - Payout processing
6. `create-setup-intent` - Payment method setup

## Database Tables to Verify

- `barbers` - Stripe account IDs and onboarding status
- `appointments` - Payment intent IDs and payment status
- `barber_earnings` - Earnings records and payout tracking
- `barber_payouts` - Payout records and status
- `payment_methods` - Customer payment methods

## Test Execution

Run comprehensive tests for each area with:
- Success scenarios
- Error handling
- Edge cases
- Integration points
- Data consistency checks

