#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { getUpdater } = require('./auto-update.js');

const server = new Server(
  {
    name: 'claude-skills',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

let updater;

// Initialize updater
(async () => {
  try {
    updater = await getUpdater({
      githubRepo: 'Parlay-Kei/stratanoble-site',
      branch: 'main',
      skillsPath: 'mcp-servers/claude-skills'
    });
    console.error('[server] Skills auto-updater initialized');
  } catch (error) {
    console.error('[server] Failed to initialize updater:', error);
    process.exit(1);
  }
})();

// List available skills as resources
server.setRequestHandler('resources/list', async () => {
  try {
    const skills = await updater.listSkills();
    
    return {
      resources: skills.map(skill => ({
        uri: `skill:///${skill.name}`,
        name: skill.name,
        description: `${skill.description} (v${skill.version})`,
        mimeType: 'text/markdown'
      }))
    };
  } catch (error) {
    console.error('[server] resources/list error:', error);
    throw error;
  }
});

// Read skill content
server.setRequestHandler('resources/read', async (request) => {
  try {
    const uri = request.params.uri;
    const match = uri.match(/^skill:\/\/\/(.+)$/);
    
    if (!match) {
      throw new Error('Invalid skill URI format. Expected: skill:///skill-name');
    }
    
    const skillName = match[1];
    console.error(`[server] Reading skill: ${skillName}`);
    
    const content = await updater.getSkill(skillName);
    
    return {
      contents: [{
        uri,
        mimeType: 'text/markdown',
        text: content
      }]
    };
  } catch (error) {
    console.error('[server] resources/read error:', error);
    throw error;
  }
});

// Define tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'check_skill_updates',
        description: 'Check for updates to Claude skills from GitHub repository',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'force_skill_update',
        description: 'Force an immediate update check for a specific skill',
        inputSchema: {
          type: 'object',
          properties: {
            skillName: {
              type: 'string',
              description: 'Name of the skill to update (e.g., "call-troubleshooting")',
            },
          },
          required: ['skillName'],
        },
      },
      {
        name: 'list_skill_capabilities',
        description: 'List all capabilities available across all skills',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    if (name === 'check_skill_updates') {
      console.error('[server] Checking for skill updates...');
      const updates = await updater.checkForUpdates();
      
      if (updates.length > 0) {
        const updatesList = updates.map(u => 
          `- ${u.skill.name}: ${u.action} ${u.from ? `(${u.from} → ${u.to})` : `(${u.skill.version})`}`
        ).join('\n');
        
        return {
          content: [{
            type: 'text',
            text: `Found ${updates.length} skill update(s):\n${updatesList}\n\nAll updates have been applied automatically.`
          }]
        };
      } else {
        return {
          content: [{
            type: 'text',
            text: 'All skills are up to date. ✓'
          }]
        };
      }
    }
    
    if (name === 'force_skill_update') {
      const skillName = args.skillName;
      console.error(`[server] Forcing update check for: ${skillName}`);
      
      await updater.checkForUpdates();
      
      const skill = updater.manifest.skills.find(s => s.name === skillName);
      
      if (!skill) {
        throw new Error(`Skill not found: ${skillName}`);
      }
      
      return {
        content: [{
          type: 'text',
          text: `Update check completed for ${skillName} (v${skill.version})`
        }]
      };
    }
    
    if (name === 'list_skill_capabilities') {
      const skills = await updater.listSkills();
      
      const capabilitiesList = skills.map(skill => {
        const caps = skill.capabilities ? skill.capabilities.join(', ') : 'none';
        return `**${skill.name}** (v${skill.version}):\n  ${caps}`;
      }).join('\n\n');
      
      return {
        content: [{
          type: 'text',
          text: `Available Skills and Capabilities:\n\n${capabilitiesList}`
        }]
      };
    }
    
    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    console.error(`[server] Tool ${name} error:`, error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.error('[server] Shutting down...');
  if (updater) {
    updater.destroy();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('[server] Shutting down...');
  if (updater) {
    updater.destroy();
  }
  process.exit(0);
});

// Start server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[server] Claude Skills MCP server running on stdio');
  } catch (error) {
    console.error('[server] Failed to start:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('[server] Fatal error:', error);
  process.exit(1);
});
