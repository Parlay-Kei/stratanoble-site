// Check and set barber is_active
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wgxiiefnmaxfxfoqsbwl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneGlpZWZubWF4Znhmb3FzYndsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODYxOTA3MywiZXhwIjoyMDg0MTk1MDczfQ.W3axn75qOowYSR9O-NSzkChX_txKKYDsqvIXtEVCXU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  const barberId = '14b77409-4359-48ad-a9df-1061b41ac652';

  // Check barber
  const { data: barber, error } = await supabase
    .from('barbers')
    .select('id, shop_name, is_published, is_verified')
    .eq('id', barberId)
    .single();

  console.log('Current barber state:', barber);

  // Check if there's an is_active column
  const { data: allBarbers } = await supabase
    .from('barbers')
    .select('*')
    .limit(1);

  if (allBarbers && allBarbers.length > 0) {
    console.log('\nBarber columns:', Object.keys(allBarbers[0]));
    console.log('Has is_active?', 'is_active' in allBarbers[0]);
  }

  // The smoke test queries:
  // .from('barbers').select('id, business_name').eq('is_active', true)
  // But our schema has is_verified and is_published instead

  // Let's see what barbers we have
  const { data: activeBarbers } = await supabase
    .from('barbers')
    .select('id, shop_name, is_published, is_verified')
    .eq('is_published', true);

  console.log('\nPublished barbers:', activeBarbers?.length || 0);
  if (activeBarbers) {
    activeBarbers.forEach(b => console.log(`  - ${b.shop_name} (published: ${b.is_published}, verified: ${b.is_verified})`));
  }
}

main();
