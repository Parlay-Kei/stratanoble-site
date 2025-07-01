import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, email, returnUrl } = body;

    // Validate required fields
    if (!businessName || !email || !returnUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: businessName, email, returnUrl' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create a connected account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: email,
      business_type: 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: businessName,
        url: 'https://stratanoble.com',
        mcc: '7399', // Business Services, Not Elsewhere Classified
      },
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: returnUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
      collect: 'eventually_due',
    });

    // TODO: Save connected account ID to your database
    // await saveConnectedAccount({
    //   accountId: account.id,
    //   businessName,
    //   email,
    //   status: 'pending',
    //   createdAt: new Date(),
    // });

    return NextResponse.json({
      success: true,
      accountId: account.id,
      accountLinkUrl: accountLink.url,
      message: 'Merchant onboarding initiated successfully'
    });
  } catch (error) {
    // console.error('Stripe Connect onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate merchant onboarding' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Missing account_id parameter' },
        { status: 400 }
      );
    }

    // Retrieve account details
    const account = await stripe.accounts.retrieve(accountId);

    // Check KYC status
    const kycStatus = {
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: account.requirements,
    };

    return NextResponse.json({
      success: true,
      accountId: account.id,
      kycStatus,
      businessProfile: account.business_profile,
    });
  } catch (error) {
    // console.error('Stripe Connect account retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve account details' },
      { status: 500 }
    );
  }
}
