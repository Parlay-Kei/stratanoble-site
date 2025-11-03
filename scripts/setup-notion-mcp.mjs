#!/usr/bin/env node
/**
 * Notion MCP Setup Script
 * Configures Notion integration for task management and knowledge base
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function setupNotionMCP() {
  log('\n🔧 Notion MCP Setup\n', 'cyan');
  log('='.repeat(60), 'cyan');

  // Step 1: Check existing credentials
  const envPath = join(__dirname, '../apps/website/.env.local');

  try {
    const envContent = await fs.readFile(envPath, 'utf-8');
    const hasNotionKey = envContent.includes('NOTION_API_KEY');

    if (!hasNotionKey) {
      log('\n⚠️  Notion API key not found in .env.local\n', 'yellow');

      log('📋 Setup Instructions:', 'cyan');
      log('━'.repeat(60), 'cyan');

      log('\n1️⃣  Go to Notion Integrations:', 'cyan');
      log('   https://www.notion.so/my-integrations\n', 'reset');

      log('2️⃣  Create New Integration:', 'cyan');
      log('   • Name: StrataNoble DevOps Agent', 'reset');
      log('   • Associated workspace: Select your workspace', 'reset');
      log('   • Type: Internal integration', 'reset');
      log('   • Capabilities:', 'reset');
      log('     ✓ Read content', 'reset');
      log('     ✓ Update content', 'reset');
      log('     ✓ Insert content\n', 'reset');

      log('3️⃣  Copy Integration Token:', 'cyan');
      log('   • Click "Show" under Internal Integration Token', 'reset');
      log('   • Copy the secret_... token\n', 'reset');

      log('4️⃣  Add to apps/website/.env.local:', 'cyan');
      log('   ─────────────────────────────────────────────', 'cyan');
      log('   # Notion MCP', 'reset');
      log('   NOTION_API_KEY=secret_your_integration_token_here', 'reset');
      log('   ─────────────────────────────────────────────\n', 'cyan');

      log('5️⃣  Share Databases with Integration:', 'cyan');
      log('   • Open each Notion database', 'reset');
      log('   • Click "..." menu → Add connections', 'reset');
      log('   • Select "StrataNoble DevOps Agent"', 'reset');
      log('   • Repeat for all databases you want to access\n', 'reset');

      log('💡 Recommended Notion Databases:', 'cyan');
      log('   ┌─────────────────────────────────────────┐', 'cyan');
      log('   │ 📋 Project Roadmap                      │', 'reset');
      log('   │    Tasks, milestones, sprint planning   │', 'reset');
      log('   │                                         │', 'reset');
      log('   │ 🎯 Feature Backlog                      │', 'reset');
      log('   │    Prioritized features, user stories   │', 'reset');
      log('   │                                         │', 'reset');
      log('   │ 📚 Technical Documentation              │', 'reset');
      log('   │    API docs, architecture, guides       │', 'reset');
      log('   │                                         │', 'reset');
      log('   │ 🐛 Bug Tracker                          │', 'reset');
      log('   │    Issues, resolutions, postmortems     │', 'reset');
      log('   │                                         │', 'reset');
      log('   │ 📝 Meeting Notes                        │', 'reset');
      log('   │    Decisions, action items, follow-ups  │', 'reset');
      log('   │                                         │', 'reset');
      log('   │ 💡 Ideas & Experiments                  │', 'reset');
      log('   │    Innovations, A/B tests, learnings    │', 'reset');
      log('   └─────────────────────────────────────────┘\n', 'reset');

      log('📊 Database Properties Example:', 'cyan');
      log('   Project Roadmap:', 'reset');
      log('   • Title (text)', 'reset');
      log('   • Status (select): Not Started, In Progress, Complete', 'reset');
      log('   • Priority (select): Critical, High, Medium, Low', 'reset');
      log('   • Assignee (person)', 'reset');
      log('   • Due Date (date)', 'reset');
      log('   • Sprint (select)', 'reset');
      log('   • Tags (multi-select)\n', 'reset');

      log('🎁 Benefits of Notion MCP:', 'cyan');
      log('   ✓ Agent can search across all databases', 'green');
      log('   ✓ Create tasks automatically', 'green');
      log('   ✓ Update status based on code changes', 'green');
      log('   ✓ Fetch technical documentation', 'green');
      log('   ✓ Log decisions and action items', 'green');
      log('   ✓ Track bugs and resolutions\n', 'green');

      process.exit(1);
    }

    // Credentials found
    log('\n✅ Notion API key found in .env.local\n', 'green');

    // Step 2: Install Notion MCP server
    log('📦 Installing Notion MCP server...', 'cyan');

    try {
      const { stdout } = await execAsync('npm list -g @modelcontextprotocol/server-notion');
      log('✅ Notion MCP server already installed\n', 'green');
    } catch (error) {
      log('   Installing package globally...', 'reset');
      await execAsync('npm install -g @modelcontextprotocol/server-notion');
      log('✅ Notion MCP server installed successfully\n', 'green');
    }

    // Step 3: Test connection
    log('🔍 Testing Notion API connection...', 'cyan');
    log('   Note: Actual test requires MCP server running in Claude\n', 'yellow');

    // Step 4: Configuration summary
    log('━'.repeat(60), 'cyan');
    log('🎉 Notion MCP Setup Complete!\n', 'green');

    log('📚 Available MCP Tools:', 'cyan');
    log('   • notion-search(query) - Search across databases', 'reset');
    log('   • notion-fetch(page_id) - Get page content', 'reset');
    log('   • notion-create-pages(pages) - Create new pages', 'reset');
    log('   • notion-update-page(page_id, data) - Update existing page', 'reset');
    log('   • notion_find_database_items(database_id, filters) - Query database\n', 'reset');

    log('🔧 Usage Examples:', 'cyan');
    log('   notion-search({ query: "DSLV cold calling" })', 'reset');
    log('   notion-fetch({ page_id: "abc123..." })', 'reset');
    log('   notion-create-pages({', 'reset');
    log('     pages: [{', 'reset');
    log('       database_id: "...",', 'reset');
    log('       properties: {', 'reset');
    log('         Title: { title: [{ text: { content: "New Task" } }] },', 'reset');
    log('         Status: { select: { name: "In Progress" } }', 'reset');
    log('       }', 'reset');
    log('     }]', 'reset');
    log('   })\n', 'reset');

    log('⚡ Agent Workflow Examples:', 'cyan');
    log('   1. Auto-create tasks from PRD analysis', 'yellow');
    log('   2. Update task status when PR is merged', 'yellow');
    log('   3. Log bugs discovered during code review', 'yellow');
    log('   4. Fetch architecture docs before refactoring', 'yellow');
    log('   5. Create meeting notes with action items\n', 'yellow');

    log('⚡ Next Steps:', 'cyan');
    log('   1. Create recommended databases in Notion', 'yellow');
    log('   2. Share databases with integration', 'yellow');
    log('   3. Test MCP connection in Claude Code', 'yellow');
    log('   4. Run: node scripts/test-notion-mcp.mjs\n', 'yellow');

    log('━'.repeat(60), 'cyan');

    return true;

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    log('   Check that apps/website/.env.local exists\n', 'yellow');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupNotionMCP().catch(error => {
    log(`\n❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { setupNotionMCP };
