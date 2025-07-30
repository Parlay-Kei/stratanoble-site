import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;
const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
const mailchimpAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;

// Initialize Supabase client
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const waitlistSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').trim(),
  email: z.string().email('Invalid email format').toLowerCase(),
  source: z.string().optional().default('web'),
});

type WaitlistRequest = z.infer<typeof waitlistSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data with Zod
    const validationResult = waitlistSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { fullName, email, source } = validationResult.data;

    // Check if Supabase is configured
    if (!supabase) {
      // Supabase configuration missing
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      );
    }

    // Check if user already exists in waitlist
    const { data: existingUser } = await supabase
      .from('workshop_waitlist')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'You are already on the waitlist!' },
        { status: 409 }
      );
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('workshop_waitlist')
      .insert([
        {
          full_name: fullName.trim(),
          email: email.toLowerCase().trim(),
          source,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to add to waitlist' },
        { status: 500 }
      );
    }

    // Add to Mailchimp if configured
    if (mailchimpApiKey && mailchimpAudienceId) {
      try {
        const mailchimpResponse = await fetch(
          `https://us1.api.mailchimp.com/3.0/lists/${mailchimpAudienceId}/members`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${mailchimpApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email_address: email.toLowerCase().trim(),
              status: 'subscribed',
              merge_fields: {
                FNAME: fullName.split(' ')[0],
                LNAME: fullName.split(' ').slice(1).join(' ') || '',
              },
              tags: ['workshop-waitlist', 'side-hustle'],
            }),
          }
        );

        if (!mailchimpResponse.ok) {
          const errorText = await mailchimpResponse.text();
          console.error('Mailchimp API error:', mailchimpResponse.status, errorText);
          // Don't fail the request if Mailchimp fails
        }
      } catch (mailchimpError) {
        console.error('Mailchimp integration error:', mailchimpError);
        // Don't fail the request if Mailchimp fails
      }
    }

    // Note: Analytics tracking should be done on the client side, not in API routes
    // The client-side code in WaitlistModal.tsx handles this appropriately

    return NextResponse.json({
      success: true,
      message: 'Successfully added to waitlist',
      data: {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
      }
    });

  } catch (error) {
    console.error('Waitlist API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

 