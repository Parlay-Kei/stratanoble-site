/**
 * Jest Integration Test Setup
 * 
 * Sets up test environment for integration tests
 * Ensures TEST_ENV is set and validates environment
 * 
 * NOTE: The integration-contract.test.ts will do the real validation.
 * This setup just ensures basic env vars are set.
 */

module.exports = async () => {
  // Set test environment flag
  process.env.TEST_ENV = 'true';
  process.env.NODE_ENV = 'test';

  console.log('🔧 Integration test environment setup');
  console.log(`   TEST_ENV: ${process.env.TEST_ENV}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log('');
  console.log('⚠️  Integration contract test will validate environment safety.');
  console.log('   If contract test fails, ALL integration tests are blocked.');
  console.log('');
  
  // Validate Supabase credentials are available (soft check)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️  Supabase credentials not found.');
    console.warn('   Integration contract test will fail and block all tests.');
  }
};
