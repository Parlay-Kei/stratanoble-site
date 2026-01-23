// discover_availability_schema.js
// Find how availability and photos are stored

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wgxiiefnmaxfxfoqsbwl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneGlpZWZubWF4Znhmb3FzYndsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODYxOTA3MywiZXhwIjoyMDg0MTk1MDczfQ.W3axn75qOowYSR9O-NSzkChX_txKKYDsqvIXtEVCXU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  const barberId = '14b77409-4359-48ad-a9df-1061b41ac652';

  console.log('=== Schema Discovery ===\n');

  // List all public tables
  const tableNames = [
    'users', 'profiles', 'barbers', 'services', 'appointments',
    'barber_subscriptions', 'barber_availability', 'availability',
    'working_hours', 'business_hours', 'schedules', 'time_slots',
    'operating_hours', 'barber_hours', 'hours', 'barber_photos',
    'photos', 'images', 'media', 'barber_images', 'portfolio',
    'barber_portfolio', 'profile_photos'
  ];

  console.log('Checking tables...\n');

  for (const table of tableNames) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`✓ ${table}:`);
      if (data && data.length > 0) {
        console.log(`  Columns: ${Object.keys(data[0]).join(', ')}`);
      } else {
        console.log('  (empty table - checking structure...)');
        // Try to get structure another way
        const { data: d2, error: e2 } = await supabase.from(table).select('*');
        if (!e2) {
          console.log('  Structure available but empty');
        }
      }
    }
  }

  // Check for related barber tables with foreign key
  console.log('\n=== Looking for barber-related data ===\n');

  // Check services (already know this exists)
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('barber_id', barberId);
  console.log(`Services for barber: ${services?.length || 0}`);
  if (services && services.length > 0) {
    console.log('  Columns:', Object.keys(services[0]).join(', '));
  }

  // Check appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('barber_id', barberId)
    .limit(1);
  if (appointments) {
    console.log(`\nAppointments columns: ${appointments.length > 0 ? Object.keys(appointments[0]).join(', ') : '(no records)'}`);
  }

  // Check auth.users connection
  console.log('\n=== Checking auth connection ===');

  // The barber may link to auth.users differently
  // Check if there's a user_id somewhere or if barber.id IS the user_id
  const { data: userById, error: userByIdError } = await supabase
    .from('users')
    .select('*')
    .eq('id', barberId)
    .single();

  if (userById) {
    console.log('\nBarber ID matches user in users table!');
    console.log('User:', JSON.stringify(userById, null, 2));
  } else {
    console.log('\nBarber ID does not match users table. Error:', userByIdError?.message);
  }

  // Try profiles table
  const { data: profileById, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', barberId)
    .single();

  if (profileById) {
    console.log('\nBarber ID matches profiles table!');
    console.log('Profile:', JSON.stringify(profileById, null, 2));
  }

  // Check if check_barber_bookability is checking a specific photo field
  console.log('\n=== Examining check_barber_bookability logic ===');
  console.log('The function checks:');
  console.log('  - has_profile_photo: false');
  console.log('  - has_availability: false');
  console.log('\nNeed to find where these are stored...');

  // Get the function definition if possible
  const { data: funcDef, error: funcError } = await supabase.rpc('check_barber_bookability', { p_barber_id: barberId });
  console.log('\nFull activation_status:', JSON.stringify(funcDef?.activation_status, null, 2));
}

main().catch(console.error);
