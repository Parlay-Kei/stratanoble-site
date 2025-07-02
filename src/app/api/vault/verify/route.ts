import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

// Initialize Supabase client
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { success: false, error: 'Email and token are required' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabase) {
      // console.error('Supabase not configured');
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Verify the token (in production, this would be a JWT or secure token)
    // For now, we'll check if the user has a valid workshop signup
    const { data: signup, error: signupError } = await supabase
      .from('workshop_signups')
      .select('*')
      .eq('customer_email', email)
      .eq('payment_status', 'paid')
      .single();

    if (signupError || !signup) {
      return NextResponse.json(
        { success: false, error: 'No valid workshop purchase found' },
        { status: 403 }
      );
    }

    // In production, you would also verify the token here
    // For now, we'll just check if the email matches a paid signup

    return NextResponse.json({
      success: true,
      message: 'Access granted',
      user: {
        email: email,
        signupDate: signup.created_at,
        eventName: signup.event_name
      }
    });

  } catch (error) {
    // console.error('Error verifying vault access:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify access' },
      { status: 500 }
    );
  }
} 