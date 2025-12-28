import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { emailService } from '@/lib/email';
import { ContactFormSchema, validateRequest, createValidationErrorResponse, createSuccessResponse } from '@/lib/validators';
import { withEnhancedCSRFProtection } from '@/lib/csrf';
import { logger } from '@/lib/logger';
import { Database } from '@/types/database';

type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row'];

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
    }) as ContactSubmission;

    logger.info('Contact form submission stored', {
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
      logger.info('Contact form emails processed', {
        submissionId: submission.id,
        teamNotificationSent: teamResult.status === 'fulfilled' && teamResult.value.success,
        customerConfirmationSent: customerResult.status === 'fulfilled' && customerResult.value.success,
        teamError: teamResult.status === 'rejected' ? teamResult.reason : undefined,
        customerError: customerResult.status === 'rejected' ? customerResult.reason : undefined,
      });
    }).catch((error) => {
      logger.error('Email processing error', error instanceof Error ? error : new Error('Unknown error'), {
        submissionId: submission.id,
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
    logger.error('Contact form error', error instanceof Error ? error : new Error('Unknown error'));
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Apply CSRF protection to the POST handler
export const POST = withEnhancedCSRFProtection(contactHandler);
