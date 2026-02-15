import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function decrypt(encrypted: string, hexKey: string): string {
  const [ivHex, tagHex, ciphertext] = encrypted.split(':');
  const key = Buffer.from(hexKey, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  let dec = decipher.update(ciphertext, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

export async function POST(request: Request, { params }: any) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

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

    // Fetch credential
    const { data: credential, error: getErr } = await supabase
      .from('vault_credentials')
      .select('id, service_name, credential_name, encrypted_value')
      .eq('id', id)
      .single();

    if (getErr || !credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    // Decrypt
    let decryptedValue: string;
    try {
      decryptedValue = decrypt(credential.encrypted_value, vaultKey);
    } catch (decryptErr) {
      return NextResponse.json({ error: 'Decryption failed' }, { status: 500 });
    }

    // Audit log - never store secret values
    await supabase.from('vault_access_log').insert({
      actor_email: user.email,
      action: 'reveal',
      credential_id: credential.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      credential: {
        id: credential.id,
        service_name: credential.service_name,
        credential_name: credential.credential_name,
        value: decryptedValue,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to reveal credential' }, { status: 500 });
  }
}
