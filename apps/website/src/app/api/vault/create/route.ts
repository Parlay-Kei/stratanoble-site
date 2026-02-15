import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      service_name,
      environment = 'production',
      credential_type,
      credential_name,
      credential_value,
      rotation_days = 90,
      description = null,
      owner_email = null,
      is_active = true,
    } = body || {};

    if (!service_name || !credential_type || !credential_name || !credential_value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
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

    const encrypted_value = encrypt(String(credential_value), vaultKey);
    const next_rotation_due = new Date(Date.now() + rotation_days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('vault_credentials')
      .insert({
        service_name,
        environment,
        credential_type,
        credential_name,
        encrypted_value,
        encryption_key_id: 'vault_key_v1',
        description,
        rotation_frequency_days: rotation_days,
        next_rotation_due,
        is_active,
        owner_email,
        last_rotated: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Audit log - never store secret values
    await supabase.from('vault_access_log').insert({
      actor_email: user.email,
      action: 'create',
      credential_id: data.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, credential: { id: data.id, service_name: data.service_name, credential_name: data.credential_name } });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create credential' }, { status: 500 });
  }
}
