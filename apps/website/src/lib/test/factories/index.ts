/**
 * Test Data Factories
 * 
 * Centralized factory functions for creating test data.
 * Reduces duplicated setup code and improves test stability.
 * 
 * Usage:
 *   import { createTestClient, createTestLead } from '@/lib/test/factories';
 *   const client = await createTestClient({ tier: 'pro' });
 */

export * from './client-factory';
export * from './lead-factory';
export * from './campaign-factory';

// Re-export types
export type { TestClient, TestClientOptions } from './client-factory';
export type { TestLead, TestLeadOptions } from './lead-factory';
export type { TestCampaign, TestCampaignOptions } from './campaign-factory';
