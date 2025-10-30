import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This route returns vault credential metadata only (no secret values)
// Supports optional filters via query params:
// - environment: 'production' | 'staging' | 'development'
// - includeInactive: 'true' to include inactive credentials

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const environment = searchParams.get('environment') || 'all';
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // last resort to avoid hard failure in dev

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Supabase environment not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });    // Admin guard using Authorization: Bearer <token>
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || '';
    const isAdmin = (adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase()) || /@stratanoble\.com$/i.test(user.email || '');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build query for metadata only
    let query = supabase
      .from('vault_credentials')
      .select(
        'id, service_name, environment, credential_type, credential_name, description, last_rotated, next_rotation_due, is_active, owner_email'
      );

    if (environment && environment !== 'all') {
      query = query.eq('environment', environment);
    }
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: rows, error } = await query.order('service_name', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to load credentials' },
        { status: 500 }
      );
    }

    const credentials = (rows || []).map((r: any) => ({
      id: r.id,
      service_name: r.service_name,
      environment: r.environment,
      credential_type: r.credential_type,
      credential_name: r.credential_name,
      description: r.description,
      last_rotated: r.last_rotated,
      next_rotation_due: r.next_rotation_due,
      is_active: r.is_active,
      owner_email: r.owner_email,
    }));

    // Compute rotation summary counts
    const now = Date.now();
    let overdue = 0;
    let urgent = 0;
    let upcoming = 0;
    for (const c of credentials) {
      const due = (c as any)?.next_rotation_due ? new Date((c as any).next_rotation_due).getTime() : null;
      if (!due) continue;
      const daysUntil = Math.floor((due - now) / (1000 * 60 * 60 * 24));
      if (daysUntil < 0) overdue++;
      else if (daysUntil < 7) urgent++;
      else if (daysUntil < 30) upcoming++;
    }

    const summary = {
      total: credentials.length,
      overdue,
      urgent,
      upcoming,
    };

    return NextResponse.json({ credentials, summary });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Unexpected error loading vault credentials' },
      { status: 500 }
    );
  }
}


