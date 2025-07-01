import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Ensure these are set in your .env.local or environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase URL or Service Role Key is not defined. Please check environment variables.');
}

// Create a single Supabase client instance
// IMPORTANT: Use the service role key for admin-level access from a secure backend.
// Never expose the service role key on the client-side.
const supabase = supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ message: 'Supabase client is not initialized. Check server logs.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { fullName, email } = body;

    if (!fullName || !email) {
      return NextResponse.json({ message: 'Full name and email are required.' }, { status: 400 });
    }

    // Validate email format (basic)
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('workshop_waitlist')
      .insert([
        {
          full_name: fullName,
          email: email,
          source: 'web', // As per spec
          // created_at is handled by Supabase default now()
        },
      ])
      .select(); // .select() will return the inserted data

    if (error) {
      console.error('Supabase error:', error);
      // Check for unique constraint violation (e.g., email already exists)
      if (error.code === '23505') { // PostgreSQL unique violation error code
        return NextResponse.json({ message: 'This email is already on the waitlist.' }, { status: 409 }); // 409 Conflict
      }
      return NextResponse.json({ message: 'Failed to add to waitlist.', details: error.message }, { status: 500 });
    }

    // Successfully inserted
    return NextResponse.json({ message: 'Successfully added to waitlist.', data: data }, { status: 201 });

  } catch (err: any) {
    console.error('Waitlist API error:', err);
    if (err instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON payload.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.', error: err.message }, { status: 500 });
  }
}
