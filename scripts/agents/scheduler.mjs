import { registry } from './index.ts';
import { AgentEvent } from './registry.ts';
import cron from 'node-cron';

class AgentScheduler {
  start() {
    console.log('📅 Starting agent scheduler...\n');

    // Run hourly agents
    cron.schedule('0 * * * *', async () => {
      console.log(`\n⏰ Hourly trigger: ${new Date().toISOString()}`);
      await registry.executeEvent(AgentEvent.HOURLY);
    });

    // Run daily agents at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log(`\n⏰ Daily trigger: ${new Date().toISOString()}`);
      await registry.executeEvent(AgentEvent.DAILY);
    });

    // Run weekly agents on Sundays at 3 AM
    cron.schedule('0 3 * * 0', async () => {
      console.log(`\n⏰ Weekly trigger: ${new Date().toISOString()}`);
      await registry.executeEvent(AgentEvent.WEEKLY);
    });

    console.log('✅ Agent scheduler started\n');
    console.log('Schedule:');
    console.log('  - Hourly: Every hour');
    console.log('  - Daily: 2:00 AM');
    console.log('  - Weekly: Sunday 3:00 AM\n');
  }
}

const scheduler = new AgentScheduler();
scheduler.start();

// Keep process running
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down agent scheduler...');
  process.exit(0);
});
