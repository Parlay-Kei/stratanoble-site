import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';


function encrypt(value: string, hexKey: string) {
  const key = Buffer.from(hexKey, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let enc = cipher.update(value, 'utf8', 'hex');
  enc += cipher.final('hex');
  const tag = cipher.getAuthTag();
  const ivHex = iv.toString('hex');
  const tagHex = tag.toString('hex');
  return `${ivHex}:${tagHex}:${enc}`;
}

export async function POST(request: Request, { params }: any) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { credential_value, is_active } = await request.json() || {};

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const vaultKey = process.env.VAULT_ENCRYPTION_KEY;
    if (!supabaseUrl || !serviceKey || !vaultKey) {
      return NextResponse.json({ error: 'Server env not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // Admin guard
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const adminEmail = process.env.ADMIN_EMAIL || '';
    const isAdmin = (adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase()) || /@stratanoble\.com$/i.test(user.email || '');
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Get rotation frequency
    const { data: existing, error: getErr } = await supabase
      .from('vault_credentials')
      .select('id, rotation_frequency_days')
      .eq('id', id)
      .single();

    if (getErr || !existing) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    const updates: any = {};
    if (credential_value) {
      updates.encrypted_value = encrypt(String(credential_value), vaultKey);
      updates.last_rotated = new Date().toISOString();
      const days = (existing as any).rotation_frequency_days || 90;
      updates.next_rotation_due = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }
    if (typeof is_active === 'boolean') {
      updates.is_active = is_active;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates supplied' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('vault_credentials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: (error as any).message }, { status: 500 });

    return NextResponse.json({ success: true, credential: data });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to rotate credential' }, { status: 500 });
  }
}