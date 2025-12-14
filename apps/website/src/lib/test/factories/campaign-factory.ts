/**
 * Campaign Factory
 * 
 * Creates test campaign records with sensible defaults.
 */

import { createClient } from '@supabase/supabase-js';

export interface TestCampaignOptions {
  name?: string;
  client_id?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
}

export interface TestCampaign {
  id: string;
  name: string;
  client_id?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

/**
 * Create a test campaign
 */
export async function createTestCampaign(
  options: TestCampaignOptions = {}
): Promise<TestCampaign> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured for test factory');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const campaignData = {
    name: options.name || `Test Campaign ${Date.now()}`,
    client_id: options.client_id,
    status: options.status || 'draft',
    start_date: options.start_date,
    end_date: options.end_date,
  };

  // Assuming a 'campaigns' table exists - adjust table name as needed
  const { data, error } = await supabase
    .from('campaigns')
    .insert(campaignData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test campaign: ${error.message}`);
  }

  return data as TestCampaign;
}
