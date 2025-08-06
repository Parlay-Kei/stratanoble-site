import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { emailService } from '@/lib/email';
import { ContactFormSchema, validateRequest, createValidationErrorResponse, createSuccessResponse } from '@/lib/validators';
import { withEnhancedCSRFProtection } from '@/lib/csrf';
import pino from 'pino';

const logger = pino();

async function contactHandler(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body using Zod schema
    const validation = validateRequest(ContactFormSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        createValidationErrorResponse(validation.errorMap),
        { status: 422 }
      );
    }

    const { name, email, phone, topic, message, source } = validation.data;

    // Store in database
    const submission = await db.createContactSubmission({
      name,
      email,
      phone,
      topic,
      message,
      source,
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

    return NextResponse.json(
      createSuccessResponse(
        { submissionId: submission.id },
        'Contact form submitted successfully'
      ),
      { status: 200 }
    );

  } catch (error) {
    logger.error({
      msg: 'Contact form error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Apply CSRF protection to the POST handler
export const POST = withEnhancedCSRFProtection(contactHandler);
