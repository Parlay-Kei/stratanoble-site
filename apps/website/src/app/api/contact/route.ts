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

    // Store in database first (quick operation)
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

    // Send emails asynchronously - don't wait for them to complete
    // This dramatically improves response time
    Promise.allSettled([
      emailService.sendContactFormNotification({
        name,
        email,
        phone,
        topic,
        message,
        submissionId: submission.id,
      }),
      emailService.sendContactFormConfirmation({
        name,
        email,
        message,
      })
    ]).then(([teamResult, customerResult]) => {
      logger.info({
        msg: 'Contact form emails processed',
        submissionId: submission.id,
        teamNotificationSent: teamResult.status === 'fulfilled' && teamResult.value.success,
        customerConfirmationSent: customerResult.status === 'fulfilled' && customerResult.value.success,
        teamError: teamResult.status === 'rejected' ? teamResult.reason : undefined,
        customerError: customerResult.status === 'rejected' ? customerResult.reason : undefined,
      });
    }).catch((error) => {
      logger.error({
        msg: 'Email processing error',
        submissionId: submission.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    });

    // Return success immediately after storing in database
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
