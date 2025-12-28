/**
 * Client Factory
 * 
 * Creates test client records with sensible defaults.
 */

import { createClient } from '@supabase/supabase-js';

export interface TestClientOptions {
  id?: string;
  stripe_customer_id?: string;
  tier?: 'lite' | 'pro' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended';
  email?: string;
  name?: string;
}

export interface TestClient {
  id: string;
  stripe_customer_id: string;
  tier: string;
  status: string;
  email?: string;
  name?: string;
  created_at: string;
}

/**
 * Create a test client
 */
export async function createTestClient(
  options: TestClientOptions = {}
): Promise<TestClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured for test factory');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const clientData = {
    id: options.id || crypto.randomUUID(),
    stripe_customer_id: options.stripe_customer_id || `cus_test_${Date.now()}`,
    tier: options.tier || 'lite',
    status: options.status || 'active',
    email: options.email || `test-${Date.now()}@example.com`,
    name: options.name || `Test Client ${Date.now()}`,
  };

  const { data, error } = await supabase
    .from('clients')
    .insert(clientData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test client: ${error.message}`);
  }

  return data as TestClient;
}

/**
 * Create multiple test clients
 */
export async function createTestClients(
  count: number,
  options: TestClientOptions = {}
): Promise<TestClient[]> {
  const clients = [];
  for (let i = 0; i < count; i++) {
    clients.push(await createTestClient({ ...options, name: `${options.name || 'Test Client'} ${i + 1}` }));
  }
  return clients;
}
