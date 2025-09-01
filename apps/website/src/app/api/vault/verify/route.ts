import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { assertUserWithTier, UnauthorizedError, ForbiddenError } from '@/lib/authGuard';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

// Initialize Supabase client
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    // Require authentication - any valid user can access vault if they have a workshop signup
    const user = await assertUserWithTier(request, 'any');
    
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { success: false, error: 'Email and token are required' },
        { status: 400 }
      );
    }

    // Verify the authenticated user's email matches the request
    if (user.email !== email) {
      return NextResponse.json(
        { success: false, error: 'Email mismatch - you can only access your own vault' },
        { status: 403 }
      );
    }

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Verify the user has a valid workshop signup
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

    // Additional token validation could be added here
    // For now, JWT authentication + workshop signup verification is sufficient

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
    // Handle authentication errors specifically
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to verify access' },
      { status: 500 }
    );
  }
} 