// complete_test_barber_setup.js
// Complete the test barber activation by finding schema and adding required data

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wgxiiefnmaxfxfoqsbwl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneGlpZWZubWF4Znhmb3FzYndsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODYxOTA3MywiZXhwIjoyMDg0MTk1MDczfQ.W3axn75qOowYSR9O-NSzkChX_txKKYDsqvIXtEVCXU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('=== Complete Test Barber Setup ===\n');

  // Step 1: Find all tables to understand schema
  console.log('Step 1: Discovering schema...');
  const { data: tables, error: tablesError } = await supabase
    .rpc('pg_catalog.pg_tables', {})
    .select('*');

  // Alternative: use raw SQL via RPC
  const { data: schemaData, error: schemaError } = await supabase
    .from('barbers')
    .select('*')
    .limit(1);

  if (schemaData && schemaData.length > 0) {
    console.log('Barbers table columns:', Object.keys(schemaData[0]));
  }

  // Step 2: Find the trialing barber
  console.log('\nStep 2: Finding trialing barber...');
  const { data: subscriptions, error: subError } = await supabase
    .from('barber_subscriptions')
    .select('barber_id, status')
    .eq('status', 'trialing');

  if (subError) {
    console.error('Error finding subscriptions:', subError.message);
    return;
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log('No trialing barbers found');
    return;
  }

  const barberId = subscriptions[0].barber_id;
  console.log('Found trialing barber:', barberId);

  // Step 3: Get full barber record
  const { data: barber, error: barberError } = await supabase
    .from('barbers')
    .select('*')
    .eq('id', barberId)
    .single();

  if (barberError) {
    console.error('Error fetching barber:', barberError.message);
    return;
  }

  console.log('\nBarber record:', JSON.stringify(barber, null, 2));

  // Step 4: Try different availability table names
  console.log('\nStep 4: Finding availability table...');
  const availTableNames = [
    'barber_availability',
    'availability',
    'working_hours',
    'business_hours',
    'schedules',
    'schedule',
    'barber_schedules',
    'barber_hours'
  ];

  let availTable = null;
  for (const tableName of availTableNames) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (!error) {
      console.log(`Found table: ${tableName}`);
      if (data && data.length > 0) {
        console.log('  Columns:', Object.keys(data[0]));
      }
      availTable = tableName;
      break;
    }
  }

  if (!availTable) {
    console.log('No availability table found. Checking if embedded in barber...');
    // Check if availability is stored differently
    if (barber.availability || barber.working_hours || barber.schedule) {
      console.log('Availability may be embedded in barber record');
    }
  }

  // Step 5: Check users table for avatar
  console.log('\nStep 5: Checking users table...');
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', barber.user_id)
    .single();

  if (user) {
    console.log('User record:', JSON.stringify(user, null, 2));
  } else if (userError) {
    console.log('Users table error:', userError.message);
  }

  // Step 6: Check what check_barber_bookability needs
  console.log('\nStep 6: Checking bookability requirements...');
  const { data: bookability, error: bookError } = await supabase
    .rpc('check_barber_bookability', { p_barber_id: barberId });

  if (bookError) {
    console.error('Bookability check error:', bookError.message);
  } else {
    console.log('Bookability:', JSON.stringify(bookability, null, 2));
  }

  // Step 7: Try to fix what's missing
  console.log('\nStep 7: Attempting fixes...');

  // If there's a photo field in barbers, update it
  if ('photo_url' in barber || 'profile_image_url' in barber || 'avatar_url' in barber) {
    const photoField = 'photo_url' in barber ? 'photo_url' :
                       'profile_image_url' in barber ? 'profile_image_url' : 'avatar_url';

    const { error: photoError } = await supabase
      .from('barbers')
      .update({ [photoField]: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400' })
      .eq('id', barberId);

    if (photoError) {
      console.error(`Failed to update ${photoField}:`, photoError.message);
    } else {
      console.log(`Updated ${photoField} successfully`);
    }
  }

  // If user has avatar field, update it
  if (user && ('avatar_url' in user || 'photo_url' in user)) {
    const avatarField = 'avatar_url' in user ? 'avatar_url' : 'photo_url';

    const { error: avatarError } = await supabase
      .from('users')
      .update({ [avatarField]: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400' })
      .eq('id', barber.user_id);

    if (avatarError) {
      console.error(`Failed to update user ${avatarField}:`, avatarError.message);
    } else {
      console.log(`Updated user ${avatarField} successfully`);
    }
  }

  // If availability table exists, add records
  if (availTable) {
    console.log(`\nAdding availability to ${availTable}...`);

    // Try different schemas
    const availData = {
      barber_id: barberId,
      day_of_week: 1, // Monday
      start_time: '09:00',
      end_time: '17:00',
      is_available: true
    };

    const { error: availError } = await supabase
      .from(availTable)
      .insert(availData);

    if (availError) {
      console.error('Failed to insert availability:', availError.message);
      // Try upsert
      const { error: upsertError } = await supabase
        .from(availTable)
        .upsert(availData, { onConflict: 'barber_id,day_of_week' });

      if (upsertError) {
        console.error('Upsert also failed:', upsertError.message);
      }
    } else {
      console.log('Availability added successfully');
    }
  }

  // Step 8: Final bookability check
  console.log('\nStep 8: Final bookability check...');
  const { data: finalBookability } = await supabase
    .rpc('check_barber_bookability', { p_barber_id: barberId });

  console.log('Final bookability:', JSON.stringify(finalBookability, null, 2));

  // Step 9: Try can_barber_accept_bookings
  const { data: canAccept, error: canAcceptError } = await supabase
    .rpc('can_barber_accept_bookings', { p_barber_id: barberId });

  console.log('\nCan accept bookings:', canAccept);
  if (canAcceptError) {
    console.error('Error:', canAcceptError.message);
  }
}

main().catch(console.error);
