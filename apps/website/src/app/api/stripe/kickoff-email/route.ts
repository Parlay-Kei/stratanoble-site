import { NextRequest, NextResponse } from 'next/server';
import { getStripe, hasStripeConfig } from '@/lib/stripe-conditional';
import { db } from '@/lib/supabase';
import { emailService } from '@/lib/email';
import { logger } from '@/lib/logger';
import { Database } from '@/types/database';

type Order = Database['public']['Tables']['orders']['Row'];

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!hasStripeConfig()) {
      return NextResponse.json(
        { error: 'Kickoff email service is currently unavailable' },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Kickoff email service is currently unavailable' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session.customer_email || !session.metadata?.customer_name) {
      return NextResponse.json(
        { error: 'Session missing required customer information' },
        { status: 400 }
      );
    }

    // Check if order exists in database
    let order: Order;
    try {
      order = await db.getOrderByStripeSession(sessionId) as Order;
    } catch (error) {
      logger.error('Order not found in database');
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Send kickoff email
    const emailResult = await emailService.sendOrderKickoffEmail({
      customerName: session.metadata.customer_name,
      customerEmail: session.customer_email,
      packageType: session.metadata?.package_type || 'unknown',
      orderId: order.id,
      amount: session.amount_total || 0,
    });

    if (emailResult.success) {
      // Update order to mark email sent
      await db.updateOrderStatus(sessionId, order.status, {
        ...(order.metadata as Record<string, unknown>),
        kickoff_email_sent: true,
        kickoff_email_sent_at: new Date().toISOString(),
        kickoff_email_message_id: 'sent_via_ses',
      });

      logger.info('Kickoff email sent successfully');

      return NextResponse.json({
        success: true,
        message: 'Kickoff email sent successfully',
        customer_email: session.customer_email,
        package_type: session.metadata?.package_type,
        order_id: order.id,
      });
    } else {
      logger.error('Failed to send kickoff email');
      
      return NextResponse.json(
        { error: `Failed to send kickoff email: ${emailResult.error}` },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Kickoff email error');
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
