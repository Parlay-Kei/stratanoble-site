import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { emailService } from '@/lib/email';
import pino from 'pino';

const logger = pino();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, topic, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Store in database
    const submission = await db.createContactSubmission({
      name,
      email,
      phone,
      topic,
      message,
      source: 'website',
    });

    logger.info({
      msg: 'Contact form submission stored',
      submissionId: submission.id,
      email,
    });

    // Send notification email to team
    const teamNotification = await emailService.sendContactFormNotification({
      name,
      email,
      phone,
      topic,
      message,
      submissionId: submission.id,
    });

    // Send confirmation email to customer
    const customerConfirmation = await emailService.sendContactFormConfirmation({
      name,
      email,
      message,
    });

    logger.info({
      msg: 'Contact form emails sent',
      submissionId: submission.id,
      teamNotificationSent: teamNotification.success,
      customerConfirmationSent: customerConfirmation.success,
    });

    return NextResponse.json({ 
      message: 'Contact form submitted successfully',
      submissionId: submission.id,
    }, { status: 200 });

  } catch (error) {
    logger.error({
      msg: 'Contact form error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
