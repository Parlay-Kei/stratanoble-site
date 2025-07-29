import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;
const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
const mailchimpAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;

// Initialize Supabase client
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

interface WaitlistRequest {
  fullName: string;
  email: string;
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WaitlistRequest = await request.json();
    const { fullName, email, source = 'web' } = body;

    // Validate required fields
    if (!fullName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Full name and email are required' },
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
      // Supabase insert error: error
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
          // Mailchimp API error: mailchimpResponse.status
          // Don't fail the request if Mailchimp fails
        }
      } catch {
        // Mailchimp integration error
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

  } catch {
    // Waitlist API error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

 