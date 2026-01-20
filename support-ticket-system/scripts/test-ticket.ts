/**
 * Test Ticket Creation Script
 * Creates a test ticket in Notion to verify the integration
 */

import { config } from 'dotenv';
import { createTicket, getTicket } from '../src/notion/tickets.js';
import type { CreateTicketInput } from '../src/notion/types.js';

config();

async function main() {
  console.log('=== Test Ticket Creation ===\n');

  const testTicket: CreateTicketInput = {
    summary: `[TEST] Verification ticket created at ${new Date().toISOString()}`,
    client: 'DSLV',
    platform: 'DSLV',
    category: 'Question',
    severity: 'S4 Low',
    impact: 1,
    urgency: 1,
    effort: 1,
    notes: 'This is a test ticket created by the verification script. Safe to delete.'
  };

  console.log('Creating test ticket...');
  console.log('Input:', JSON.stringify(testTicket, null, 2));

  try {
    const ticket = await createTicket(testTicket);

    console.log('\nTicket created successfully!');
    console.log(`  ID: ${ticket.id}`);
    console.log(`  URL: ${ticket.notionUrl}`);
    console.log(`  Title: ${ticket.title}`);
    console.log(`  Client: ${ticket.client}`);
    console.log(`  Status: ${ticket.status}`);
    console.log(`  Priority Score: ${ticket.priorityScore}`);

    // Verify we can retrieve it
    console.log('\nVerifying ticket retrieval...');
    const retrieved = await getTicket(ticket.notionPageId);
    console.log(`  Retrieved: ${retrieved.title}`);

    console.log('\nTest PASSED!');
    console.log(`\nYou can view the test ticket at: ${ticket.notionUrl}`);
    console.log('(Remember to delete this test ticket when done)');

  } catch (error) {
    console.error('\nTest FAILED:', error);
    process.exit(1);
  }
}

main();
