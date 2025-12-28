/**
 * Lead Factory
 * 
 * Creates test lead records with sensible defaults.
 */

import { createClient } from '@supabase/supabase-js';

export interface TestLeadOptions {
  email?: string;
  name?: string;
  phone?: string;
  source?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'converted';
}

export interface TestLead {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  source?: string;
  status: string;
  created_at: string;
}

/**
 * Create a test lead
 */
export async function createTestLead(
  options: TestLeadOptions = {}
): Promise<TestLead> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured for test factory');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const leadData = {
    email: options.email || `test-lead-${Date.now()}@example.com`,
    name: options.name || `Test Lead ${Date.now()}`,
    phone: options.phone,
    source: options.source || 'test',
    status: options.status || 'new',
  };

  // Assuming a 'leads' table exists - adjust table name as needed
  const { data, error } = await supabase
    .from('leads')
    .insert(leadData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test lead: ${error.message}`);
  }

  return data as TestLead;
}
