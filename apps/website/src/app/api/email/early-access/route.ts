import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { emailService } from '@/lib/email';
import { validateRequest, createValidationErrorResponse, createSuccessResponse } from '@/lib/validators';
import { withEnhancedCSRFProtection } from '@/lib/csrf';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Schema for early access signup validation
const EarlyAccessSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  role: z.string().optional(),
  goals: z.string().optional()
});

async function earlyAccessHandler(request: NextRequest) {
  try {
    // Handle both JSON and form data
    let body;
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else {
      // Handle form data
      const formData = await request.formData();
      const singleName = formData.get('name');
      const fromParts = `${formData.get('firstName') || ''} ${formData.get('lastName') || ''}`.trim();
      const resolvedName =
        (typeof singleName === 'string' && singleName.trim()) || fromParts || '';
      body = {
        name: resolvedName,
        email: formData.get('email'),
        role: formData.get('role'),
        goals: formData.get('goals'),
        updates: formData.get('updates') === 'on' // checkbox value
      };
    }
    
    // Validate request body using Zod schema
    const validation = validateRequest(EarlyAccessSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        createValidationErrorResponse(validation.errorMap),
        { status: 422 }
      );
    }

    const { name, email, role, goals } = validation.data;

    // Extract UTM parameters and referrer from headers/request
    const searchParams = request.nextUrl.searchParams;
    const headers = request.headers;

    // Check if this email has already signed up
    try {
      const existingSignup = await db.getEarlyAccessSignup(email);
      if (existingSignup) {
        return NextResponse.json(
          {
            success: true,
            message: 'You are already on our early access list!',
            data: { alreadySignedUp: true }
          },
          { status: 200 }
        );
      }
    } catch (error) {
      // If the method doesn't exist yet or table doesn't exist, continue
      logger.info('Early access signup check skipped - table may not exist yet');
    }

    // Store in database first (quick operation)
    let signup;
    try {
      signup = await db.createEarlyAccessSignup({
        name,
        email,
        role: role || null,
        goals: goals || null,
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
        referrer: headers.get('referer'),
        metadata: {
          user_agent: headers.get('user-agent'),
          ip_address: headers.get('x-forwarded-for') || headers.get('x-real-ip'),
          submitted_at: new Date().toISOString(),
          form_version: 'achievery-early-access-v1'
        }
      });
    } catch (dbError) {
      logger.error('Database error during early access signup', dbError instanceof Error ? dbError : new Error('Unknown DB error'));
      
      // If database is not available, still allow the flow to continue
      // This enables development mode and graceful degradation
      signup = {
        id: `temp-${Date.now()}`,
        email,
        name,
        created_at: new Date().toISOString()
      };
      
      logger.info('Early access signup continuing without database storage (dev mode)');
    }

    logger.info('Early access signup processed', {
      signupId: signup.id,
      email,
    });

    // Send emails asynchronously - don't wait for them to complete
    // This dramatically improves response time
    Promise.allSettled([
      emailService.sendEarlyAccessConfirmation({
        name,
        email,
        role: role || undefined,
        goals: goals || undefined,
      }),
      emailService.sendEarlyAccessNotification({
        name,
        email,
        role: role || undefined,
        goals: goals || undefined,
        signupId: signup.id,
      })
    ]).then(([confirmationResult, notificationResult]) => {
      logger.info('Early access emails processed', {
        signupId: signup.id,
        confirmationSent: confirmationResult.status === 'fulfilled' && confirmationResult.value?.success,
        notificationSent: notificationResult.status === 'fulfilled' && notificationResult.value?.success,
        confirmationError: confirmationResult.status === 'rejected' ? confirmationResult.reason : undefined,
        notificationError: notificationResult.status === 'rejected' ? notificationResult.reason : undefined,
      });
    }).catch((error) => {
      logger.error('Email processing error', error instanceof Error ? error : new Error('Unknown error'), {
        signupId: signup.id,
      });
    });

    // Return success immediately after storing in database
    return NextResponse.json(
      createSuccessResponse(
        { signupId: signup.id },
        'Successfully added to early access list'
      ),
      { status: 200 }
    );

  } catch (error) {
    logger.error('Early access signup error', error instanceof Error ? error : new Error('Unknown error'));
    
    return NextResponse.json({ 
      error: 'Failed to process early access signup',
      message: 'Please try again later' 
    }, { status: 500 });
  }
}

// Export the handler directly - CSRF temporarily disabled for development
export const POST = earlyAccessHandler;
