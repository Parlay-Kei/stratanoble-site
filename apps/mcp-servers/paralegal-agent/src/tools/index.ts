// Export all tools
export { templateLibraryTool, type TemplateLibraryInput } from './template-library.js';
export { clauseLibraryTool, type ClauseLibraryInput } from './clause-library.js';
export { playbookTool, type PlaybookInput } from './playbook.js';
export { dealContextTool, type DealContextInput } from './deal-context.js';
export { diffEngineTool, compareTexts, type DiffEngineInput } from './diff-engine.js';
export { documentSaveTool, type DocumentSaveInput } from './document-save.js';

// Tool registry for MCP server
export const tools = [
  {
    name: 'get_contract_template',
    tool: () => import('./template-library.js').then(m => m.templateLibraryTool),
  },
  {
    name: 'get_clauses',
    tool: () => import('./clause-library.js').then(m => m.clauseLibraryTool),
  },
  {
    name: 'get_playbook_rules',
    tool: () => import('./playbook.js').then(m => m.playbookTool),
  },
  {
    name: 'get_deal_context',
    tool: () => import('./deal-context.js').then(m => m.dealContextTool),
  },
  {
    name: 'compare_contracts',
    tool: () => import('./diff-engine.js').then(m => m.diffEngineTool),
  },
  {
    name: 'save_contract_draft',
    tool: () => import('./document-save.js').then(m => m.documentSaveTool),
  },
];
