import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { db } from '@/lib/supabase';
import { emailService } from '@/lib/email';
import pino from 'pino';

const logger = pino();

export async function POST(request: NextRequest) {
  try {
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
    let order;
    try {
      order = await db.getOrderByStripeSession(sessionId);
    } catch (error) {
      logger.error('Order not found in database:', { sessionId, error });
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
        ...order.metadata as Record<string, unknown>,
        kickoff_email_sent: true,
        kickoff_email_sent_at: new Date().toISOString(),
        kickoff_email_message_id: emailResult.messageId,
      });

      logger.info('Kickoff email sent successfully:', {
        sessionId,
        orderId: order.id,
        customerEmail: session.customer_email,
        messageId: emailResult.messageId,
      });

      return NextResponse.json({
        success: true,
        message: 'Kickoff email sent successfully',
        customer_email: session.customer_email,
        package_type: session.metadata?.package_type,
        order_id: order.id,
      });
    } else {
      logger.error('Failed to send kickoff email:', {
        sessionId,
        error: emailResult.error,
      });
      
      return NextResponse.json(
        { error: `Failed to send kickoff email: ${emailResult.error}` },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Kickoff email error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
