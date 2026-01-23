// fix_test_barber.js
// Add avatar_url and availability_slots to make barber bookable

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wgxiiefnmaxfxfoqsbwl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneGlpZWZubWF4Znhmb3FzYndsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODYxOTA3MywiZXhwIjoyMDg0MTk1MDczfQ.W3axn75qOowYSR9O-NSzkChX_txKKYDsqvIXtEVCXU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  const barberId = '14b77409-4359-48ad-a9df-1061b41ac652';

  console.log('=== Fixing Test Barber for Smoke Gate ===\n');

  // Step 1: Update users.avatar_url
  console.log('Step 1: Adding profile photo (avatar_url)...');
  const { error: avatarError } = await supabase
    .from('users')
    .update({ avatar_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400' })
    .eq('id', barberId);

  if (avatarError) {
    console.error('  Failed to update avatar:', avatarError.message);
  } else {
    console.log('  Avatar URL set successfully');
  }

  // Step 2: Add availability_slots (Mon-Sat, 9am-6pm)
  console.log('\nStep 2: Adding availability slots...');

  // First, check if slots already exist
  const { data: existingSlots, error: checkError } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('barber_id', barberId);

  if (checkError) {
    console.error('  Failed to check existing slots:', checkError.message);
  } else {
    console.log(`  Found ${existingSlots?.length || 0} existing slots`);
  }

  // Delete any existing slots first to avoid duplicates
  if (existingSlots && existingSlots.length > 0) {
    const { error: deleteError } = await supabase
      .from('availability_slots')
      .delete()
      .eq('barber_id', barberId);

    if (deleteError) {
      console.error('  Failed to delete existing slots:', deleteError.message);
    } else {
      console.log('  Deleted existing slots');
    }
  }

  // Insert new slots for Mon-Sat (days 1-6)
  const slots = [];
  for (let day = 1; day <= 6; day++) {
    slots.push({
      barber_id: barberId,
      day_of_week: day,
      start_time: '09:00',
      end_time: '18:00'
    });
  }

  const { error: insertError } = await supabase
    .from('availability_slots')
    .insert(slots);

  if (insertError) {
    console.error('  Failed to insert slots:', insertError.message);
  } else {
    console.log(`  Inserted ${slots.length} availability slots (Mon-Sat, 9am-6pm)`);
  }

  // Step 3: Verify the fixes
  console.log('\nStep 3: Verifying fixes...');

  // Check avatar
  const { data: user } = await supabase
    .from('users')
    .select('avatar_url')
    .eq('id', barberId)
    .single();
  console.log('  Avatar URL:', user?.avatar_url ? 'SET' : 'NOT SET');

  // Check slots
  const { data: newSlots } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('barber_id', barberId);
  console.log('  Availability slots:', newSlots?.length || 0);

  // Step 4: Check bookability again
  console.log('\nStep 4: Checking bookability...');
  const { data: bookability, error: bookError } = await supabase
    .rpc('check_barber_bookability', { p_barber_id: barberId });

  if (bookError) {
    console.error('  Error:', bookError.message);
  } else {
    console.log('  Bookability:', JSON.stringify(bookability, null, 2));
  }

  // Step 5: Try to publish the barber now
  console.log('\nStep 5: Attempting to publish barber...');
  const { error: publishError } = await supabase
    .from('barbers')
    .update({ is_published: true })
    .eq('id', barberId);

  if (publishError) {
    console.error('  Publish failed:', publishError.message);
  } else {
    console.log('  Barber published successfully!');
  }

  // Step 6: Final check - can_barber_accept_bookings
  console.log('\nStep 6: Final acceptance check...');
  const { data: canAccept, error: canError } = await supabase
    .rpc('can_barber_accept_bookings', { p_barber_id: barberId });

  console.log('  can_barber_accept_bookings:', canAccept);
  if (canError) {
    console.error('  Error:', canError.message);
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Barber ID: ${barberId}`);
  console.log(`Avatar: ${user?.avatar_url ? 'SET' : 'MISSING'}`);
  console.log(`Availability slots: ${newSlots?.length || 0}`);
  console.log(`Can accept bookings: ${canAccept}`);

  if (canAccept) {
    console.log('\n Ready to run smoke gate!');
  } else {
    console.log('\n Still not ready. Check blocking reasons above.');
  }
}

main().catch(console.error);
