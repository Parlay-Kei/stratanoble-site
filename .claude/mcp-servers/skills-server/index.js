#!/usr/bin/env node
/**
 * ANX Skills Server v2.0
 * Production-grade MCP server with progressive disclosure
 * 
 * Features:
 * - Dynamic skill loading from centralized registry
 * - Progressive disclosure with 3 detail levels
 * - Context-aware skill recommendations
 * - Usage analytics and caching
 * - Hot reload support
 * - Skill versioning
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  skillsRoot: path.resolve(__dirname, '../../skills'),
  manifestPath: path.resolve(__dirname, '../../skills/manifest.json'),
  cachePath: path.resolve(__dirname, 'cache'),
  analyticsPath: path.resolve(__dirname, 'analytics.json'),
  logPath: path.resolve(__dirname, 'server.log'),
};

// Server state
const state = {
  manifest: null,
  skillsCache: new Map(),
  analytics: { usage: {}, lastUpdate: Date.now() },
  startTime: Date.now(),
};

/**
 * Logger with file persistence
 */
class Logger {
  static async log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, message, ...meta };
    
    console.error(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    
    try {
      await fs.appendFile(
        CONFIG.logPath,
        JSON.stringify(entry) + '\n',
        'utf-8'
      );
    } catch (err) {
      console.error('Failed to write log:', err);
    }
  }

  static info(msg, meta) { return this.log('info', msg, meta); }
  static warn(msg, meta) { return this.log('warn', msg, meta); }
  static error(msg, meta) { return this.log('error', msg, meta); }
}

/**
 * Load and parse manifest
 */
async function loadManifest() {
  try {
    const content = await fs.readFile(CONFIG.manifestPath, 'utf-8');
    state.manifest = JSON.parse(content);
    await Logger.info('Manifest loaded', {
      skills: Object.keys(state.manifest.skills).length,
      version: state.manifest.version,
    });
    return state.manifest;
  } catch (err) {
    await Logger.error('Failed to load manifest', { error: err.message });
    throw new Error(`Cannot load manifest: ${err.message}`);
  }
}

/**
 * Load skill content with caching
 */
async function loadSkillContent(skillId) {
  // Check cache
  if (state.skillsCache.has(skillId)) {
    return state.skillsCache.get(skillId);
  }

  // Get skill metadata from manifest
  const skill = state.manifest.skills[skillId];
  if (!skill) {
    await Logger.warn(`Skill not found in manifest: ${skillId}`);
    return null;
  }

  // Use filePath from manifest if available, otherwise fall back to default patterns
  let skillPath;
  if (skill.filePath) {
    // Direct file path specified in manifest
    skillPath = skill.filePath;
  } else if (skill.path) {
    // Directory path with SKILL.md inside
    skillPath = path.join(skill.path, 'SKILL.md');
  } else {
    // Default: try flat file first, then subdirectory
    const flatPath = path.join(CONFIG.skillsRoot, `${skillId}.md`);
    const dirPath = path.join(CONFIG.skillsRoot, skillId, 'SKILL.md');

    // Check if flat file exists
    try {
      await fs.access(flatPath);
      skillPath = flatPath;
    } catch {
      skillPath = dirPath;
    }
  }

  try {
    const content = await fs.readFile(skillPath, 'utf-8');
    state.skillsCache.set(skillId, content);
    await Logger.info(`Skill loaded: ${skillId} from ${skillPath}`);
    return content;
  } catch (err) {
    await Logger.warn(`Failed to load skill: ${skillId}`, { 
      error: err.message,
      attemptedPath: skillPath 
    });
    return null;
  }
}

/**
 * Get progressive disclosure level based on content size
 */
function getProgressiveContent(content, level = 1, skillMeta) {
  if (!skillMeta?.levels) {
    return content; // No progressive disclosure configured
  }

  const levelConfig = skillMeta.levels[level.toString()];
  if (!levelConfig) {
    return content;
  }

  const maxSize = levelConfig.maxSize;
  if (content.length <= maxSize) {
    return content;
  }

  // Extract heading structure for intelligent truncation
  const lines = content.split('\n');
  let result = [];
  let currentSize = 0;
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    // Always include top-level headings
    if (line.startsWith('# ') || line.startsWith('## ')) {
      result.push(line);
      currentSize += line.length + 1;
      continue;
    }

    if (currentSize + line.length > maxSize) {
      break;
    }

    result.push(line);
    currentSize += line.length + 1;
  }

  // Add truncation notice
  result.push('');
  result.push(`\n---\n**[Progressive Disclosure Level ${level}/${Object.keys(skillMeta.levels).length}]**`);
  result.push(`\nShowing ${currentSize} of ~${content.length} characters.`);
  result.push(`\n${levelConfig.description}`);
  
  if (level < Object.keys(skillMeta.levels).length) {
    result.push(`\nFor more detail, use: \`get_skill("${skillMeta.id}", level: ${level + 1})\``);
  }

  return result.join('\n');
}

/**
 * Recommend skills based on context
 */
function recommendSkills(context, maxResults = 3) {
  if (!state.manifest) return [];

  const contextLower = context.toLowerCase();
  const recommendations = [];

  // Check problem type mapping
  for (const [keyword, skillIds] of Object.entries(state.manifest.problemTypeMapping || {})) {
    if (contextLower.includes(keyword)) {
      for (const skillId of skillIds) {
        const skill = state.manifest.skills[skillId];
        if (skill) {
          recommendations.push({
            id: skillId,
            name: skill.name,
            relevance: 'high',
            reason: `Matches keyword: ${keyword}`,
          });
        }
      }
    }
  }

  // Check skill descriptions and capabilities
  for (const [skillId, skill] of Object.entries(state.manifest.skills)) {
    const searchText = `${skill.name} ${skill.description} ${(skill.capabilities || []).join(' ')}`.toLowerCase();
    
    if (searchText.includes(contextLower)) {
      recommendations.push({
        id: skillId,
        name: skill.name,
        relevance: 'medium',
        reason: 'Matches skill description',
      });
    }
  }

  // Deduplicate and sort by relevance
  const unique = new Map();
  for (const rec of recommendations) {
    if (!unique.has(rec.id)) {
      unique.set(rec.id, rec);
    }
  }

  return Array.from(unique.values())
    .sort((a, b) => {
      const relevanceOrder = { high: 0, medium: 1, low: 2 };
      return relevanceOrder[a.relevance] - relevanceOrder[b.relevance];
    })
    .slice(0, maxResults);
}

/**
 * Track skill usage
 */
async function trackUsage(skillId, level) {
  if (!state.analytics.usage[skillId]) {
    state.analytics.usage[skillId] = {
      count: 0,
      levels: {},
      lastUsed: null,
    };
  }

  state.analytics.usage[skillId].count++;
  state.analytics.usage[skillId].levels[level] = (state.analytics.usage[skillId].levels[level] || 0) + 1;
  state.analytics.usage[skillId].lastUsed = Date.now();
  state.analytics.lastUpdate = Date.now();

  // Persist every 10 uses
  if (Object.values(state.analytics.usage).reduce((sum, s) => sum + s.count, 0) % 10 === 0) {
    try {
      await fs.writeFile(CONFIG.analyticsPath, JSON.stringify(state.analytics, null, 2));
    } catch (err) {
      await Logger.warn('Failed to persist analytics', { error: err.message });
    }
  }
}

/**
 * Load analytics
 */
async function loadAnalytics() {
  try {
    const content = await fs.readFile(CONFIG.analyticsPath, 'utf-8');
    state.analytics = JSON.parse(content);
  } catch (err) {
    // File doesn't exist yet, use defaults
    state.analytics = { usage: {}, lastUpdate: Date.now() };
  }
}

/**
 * Initialize server
 */
async function initializeServer() {
  await Logger.info('Starting ANX Skills Server v2.0');
  
  // Ensure directories exist
  await fs.mkdir(CONFIG.cachePath, { recursive: true });
  
  // Load manifest and analytics
  await loadManifest();
  await loadAnalytics();
  
  await Logger.info('Server initialized', {
    skillsCount: Object.keys(state.manifest.skills).length,
    uptime: Date.now() - state.startTime,
  });
}

/**
 * Main server
 */
const server = new Server(
  {
    name: 'anx-skills-server',
    version: '2.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * List available resources (skills)
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  if (!state.manifest) {
    await loadManifest();
  }

  const resources = Object.entries(state.manifest.skills).map(([id, skill]) => ({
    uri: `skill:///${id}`,
    name: skill.name,
    description: skill.description,
    mimeType: 'text/markdown',
  }));

  return { resources };
});

/**
 * Read resource content (get skill)
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  const match = uri.match(/^skill:\/\/\/(.+)/);
  
  if (!match) {
    throw new Error(`Invalid skill URI: ${uri}`);
  }

  const skillId = match[1];
  const skill = state.manifest.skills[skillId];
  
  if (!skill) {
    throw new Error(`Skill not found: ${skillId}`);
  }

  const content = await loadSkillContent(skillId);
  if (!content) {
    throw new Error(`Failed to load skill content: ${skillId}`);
  }

  // Default to level 1 for resource reads
  const level = 1;
  const processedContent = getProgressiveContent(content, level, { ...skill, id: skillId });
  
  await trackUsage(skillId, level);

  return {
    contents: [
      {
        uri,
        mimeType: 'text/markdown',
        text: processedContent,
      },
    ],
  };
});

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_skill',
        description: 'Get skill content with progressive disclosure. Level 1: overview, Level 2: detailed workflows, Level 3: complete reference',
        inputSchema: {
          type: 'object',
          properties: {
            skill_id: {
              type: 'string',
              description: 'The skill identifier (e.g., "frontend-dev-ops")',
            },
            level: {
              type: 'integer',
              description: 'Detail level: 1 (quick), 2 (standard), 3 (complete)',
              minimum: 1,
              maximum: 3,
              default: 1,
            },
          },
          required: ['skill_id'],
        },
      },
      {
        name: 'list_skills',
        description: 'List all available skills with their capabilities',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              description: 'Optional filter by capability or keyword',
            },
          },
        },
      },
      {
        name: 'recommend_skills',
        description: 'Get skill recommendations based on problem context',
        inputSchema: {
          type: 'object',
          properties: {
            context: {
              type: 'string',
              description: 'Description of the problem or task',
            },
            max_results: {
              type: 'integer',
              description: 'Maximum number of recommendations',
              default: 3,
            },
          },
          required: ['context'],
        },
      },
      {
        name: 'get_analytics',
        description: 'Get usage analytics for skills',
        inputSchema: {
          type: 'object',
          properties: {
            skill_id: {
              type: 'string',
              description: 'Optional: get analytics for specific skill',
            },
          },
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'get_skill': {
      const { skill_id, level = 1 } = args;
      const skill = state.manifest.skills[skill_id];
      
      if (!skill) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: Skill not found: ${skill_id}\n\nAvailable skills: ${Object.keys(state.manifest.skills).join(', ')}`,
            },
          ],
        };
      }

      const content = await loadSkillContent(skill_id);
      if (!content) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: Failed to load skill content for: ${skill_id}`,
            },
          ],
        };
      }

      const processedContent = getProgressiveContent(content, level, { ...skill, id: skill_id });
      await trackUsage(skill_id, level);

      return {
        content: [
          {
            type: 'text',
            text: processedContent,
          },
        ],
      };
    }

    case 'list_skills': {
      const { filter } = args;
      let skills = Object.entries(state.manifest.skills);

      if (filter) {
        const filterLower = filter.toLowerCase();
        skills = skills.filter(([id, skill]) => {
          const searchText = `${id} ${skill.name} ${skill.description} ${(skill.capabilities || []).join(' ')}`.toLowerCase();
          return searchText.includes(filterLower);
        });
      }

      const output = ['# Available Skills\n'];
      
      for (const [id, skill] of skills) {
        output.push(`## ${skill.name}`);
        output.push(`**ID:** \`${id}\``);
        output.push(`**Description:** ${skill.description}`);
        
        if (skill.capabilities && skill.capabilities.length > 0) {
          output.push(`**Capabilities:** ${skill.capabilities.join(', ')}`);
        }
        
        if (skill.levels) {
          output.push(`**Progressive Disclosure:** ${Object.keys(skill.levels).length} levels`);
        }
        
        output.push('');
      }

      output.push(`\n**Total Skills:** ${skills.length}`);

      return {
        content: [
          {
            type: 'text',
            text: output.join('\n'),
          },
        ],
      };
    }

    case 'recommend_skills': {
      const { context, max_results = 3 } = args;
      const recommendations = recommendSkills(context, max_results);

      if (recommendations.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No skill recommendations found for context: "${context}"\n\nTry using list_skills to see all available skills.`,
            },
          ],
        };
      }

      const output = [`# Skill Recommendations for: "${context}"\n`];
      
      for (const rec of recommendations) {
        output.push(`## ${rec.name}`);
        output.push(`**ID:** \`${rec.id}\``);
        output.push(`**Relevance:** ${rec.relevance}`);
        output.push(`**Reason:** ${rec.reason}`);
        output.push(`**Load:** \`get_skill("${rec.id}")\``);
        output.push('');
      }

      return {
        content: [
          {
            type: 'text',
            text: output.join('\n'),
          },
        ],
      };
    }

    case 'get_analytics': {
      const { skill_id } = args;

      if (skill_id) {
        const usage = state.analytics.usage[skill_id];
        if (!usage) {
          return {
            content: [
              {
                type: 'text',
                text: `No analytics available for skill: ${skill_id}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                skill_id,
                total_uses: usage.count,
                level_breakdown: usage.levels,
                last_used: new Date(usage.lastUsed).toISOString(),
              }, null, 2),
            },
          ],
        };
      }

      // Overall analytics
      const topSkills = Object.entries(state.analytics.usage)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .map(([id, usage]) => ({ id, count: usage.count }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              server_uptime_ms: Date.now() - state.startTime,
              total_skill_invocations: Object.values(state.analytics.usage).reduce((sum, s) => sum + s.count, 0),
              unique_skills_used: Object.keys(state.analytics.usage).length,
              top_skills: topSkills,
              last_update: new Date(state.analytics.lastUpdate).toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

/**
 * Start server
 */
async function main() {
  try {
    await initializeServer();
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    await Logger.info('Server connected and ready');
  } catch (err) {
    await Logger.error('Server failed to start', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

main();
