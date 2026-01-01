/**
 * Figma MCP Server
 * Model Context Protocol server for Figma integration
 * 
 * Provides tools for AI agents to:
 * - Read Figma file structures
 * - Extract design tokens
 * - Analyze components
 * - Generate React/Tailwind code
 * - Export images
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import * as dotenv from 'dotenv';

import { FigmaClient, FigmaAPIError } from './figma-client.js';
import { extractDesignTokens, generateTailwindConfig, generateCSSVariables } from './token-extractor.js';
import { analyzeNode, analyzeScreen, generateReactComponent } from './component-analyzer.js';
import { FigmaNode, FigmaDocument, DesignTokens, ComponentAnalysis, ScreenAnalysis } from './types.js';

// Load environment variables
dotenv.config();

// Initialize Figma client
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

if (!FIGMA_ACCESS_TOKEN) {
  console.error('Error: FIGMA_ACCESS_TOKEN environment variable is required');
  console.error('Get your token from: https://www.figma.com/developers/api#access-tokens');
  process.exit(1);
}

const figmaClient = new FigmaClient({ accessToken: FIGMA_ACCESS_TOKEN });

// Create MCP server
const server = new Server(
  {
    name: 'figma-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ============================================
// Tool Definitions
// ============================================

const TOOLS: Tool[] = [
  {
    name: 'figma_get_file',
    description: `Get the structure and metadata of a Figma file. 
Returns the document tree with all pages, frames, and components.
Use this to understand the overall structure before diving into specific nodes.`,
    inputSchema: {
      type: 'object',
      properties: {
        file_key: {
          type: 'string',
          description: 'The Figma file key (from URL: figma.com/file/{FILE_KEY}/...)',
        },
        depth: {
          type: 'number',
          description: 'How many levels deep to traverse (default: 2, max: 10)',
        },
      },
      required: ['file_key'],
    },
  },
  {
    name: 'figma_get_node',
    description: `Get detailed information about a specific node in a Figma file.
Returns full properties including styles, layout, effects, and children.
Use this to analyze individual components or frames.`,
    inputSchema: {
      type: 'object',
      properties: {
        file_key: {
          type: 'string',
          description: 'The Figma file key',
        },
        node_id: {
          type: 'string',
          description: 'The node ID (e.g., "1:2" or "123-456")',
        },
        depth: {
          type: 'number',
          description: 'How many levels of children to include (default: 5)',
        },
      },
      required: ['file_key', 'node_id'],
    },
  },
  {
    name: 'figma_export_image',
    description: `Export a frame or component as an image.
Returns a URL to download the exported image.
Supports PNG, JPG, SVG, and PDF formats.`,
    inputSchema: {
      type: 'object',
      properties: {
        file_key: {
          type: 'string',
          description: 'The Figma file key',
        },
        node_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of node IDs to export',
        },
        format: {
          type: 'string',
          enum: ['png', 'jpg', 'svg', 'pdf'],
          description: 'Export format (default: png)',
        },
        scale: {
          type: 'number',
          description: 'Scale factor 0.01-4 (default: 2)',
        },
      },
      required: ['file_key', 'node_ids'],
    },
  },
  {
    name: 'figma_extract_tokens',
    description: `Extract design tokens from a Figma file or node.
Returns colors, typography, spacing, border radius, and shadows.
Use this to create or update your design system.`,
    inputSchema: {
      type: 'object',
      properties: {
        file_key: {
          type: 'string',
          description: 'The Figma file key',
        },
        node_id: {
          type: 'string',
          description: 'Optional: Extract from specific node only',
        },
        output_format: {
          type: 'string',
          enum: ['json', 'tailwind', 'css'],
          description: 'Output format (default: json)',
        },
      },
      required: ['file_key'],
    },
  },
  {
    name: 'figma_analyze_component',
    description: `Analyze a Figma component and generate Tailwind CSS classes.
Returns component structure with suggested Tailwind classes for each element.
Use this to understand how to implement a design in code.`,
    inputSchema: {
      type: 'object',
      properties: {
        file_key: {
          type: 'string',
          description: 'The Figma file key',
        },
        node_id: {
          type: 'string',
          description: 'The component/frame node ID to analyze',
        },
        include_children: {
          type: 'boolean',
          description: 'Include child element analysis (default: true)',
        },
      },
      required: ['file_key', 'node_id'],
    },
  },
  {
    name: 'figma_generate_react',
    description: `Generate React component code from a Figma component.
Returns a React functional component with Tailwind CSS styling.
Use this to quickly scaffold components matching your designs.`,
    inputSchema: {
      type: 'object',
      properties: {
        file_key: {
          type: 'string',
          description: 'The Figma file key',
        },
        node_id: {
          type: 'string',
          description: 'The component/frame node ID',
        },
        component_name: {
          type: 'string',
          description: 'Name for the React component (default: derived from node name)',
        },
      },
      required: ['file_key', 'node_id'],
    },
  },
  {
    name: 'figma_list_components',
    description: `List all components in a Figma file.
Returns component names, IDs, and descriptions.
Use this to discover reusable components in a design system.`,
    inputSchema: {
      type: 'object',
      properties: {
        file_key: {
          type: 'string',
          description: 'The Figma file key',
        },
      },
      required: ['file_key'],
    },
  },
  {
    name: 'figma_list_styles',
    description: `List all shared styles in a Figma file.
Returns color styles, text styles, and effect styles.
Use this to understand the design system's style definitions.`,
    inputSchema: {
      type: 'object',
      properties: {
        file_key: {
          type: 'string',
          description: 'The Figma file key',
        },
      },
      required: ['file_key'],
    },
  },
  {
    name: 'figma_compare_designs',
    description: `Compare two Figma nodes for visual differences.
Returns a list of differences in colors, typography, spacing, and layout.
Use this to identify discrepancies between designs and implementation.`,
    inputSchema: {
      type: 'object',
      properties: {
        file_key: {
          type: 'string',
          description: 'The Figma file key',
        },
        node_id_a: {
          type: 'string',
          description: 'First node ID to compare',
        },
        node_id_b: {
          type: 'string',
          description: 'Second node ID to compare',
        },
      },
      required: ['file_key', 'node_id_a', 'node_id_b'],
    },
  },
  {
    name: 'figma_get_file_versions',
    description: `Get version history of a Figma file.
Returns list of versions with timestamps, labels, and authors.
Use this to track design changes over time.`,
    inputSchema: {
      type: 'object',
      properties: {
        file_key: {
          type: 'string',
          description: 'The Figma file key',
        },
        limit: {
          type: 'number',
          description: 'Number of versions to return (default: 10)',
        },
      },
      required: ['file_key'],
    },
  },
];

// ============================================
// Tool Handlers
// ============================================

async function handleGetFile(fileKey: string, depth: number = 2): Promise<any> {
  const file = await figmaClient.getFile(fileKey, { depth: Math.min(depth, 10) });
  
  // Simplify output for readability
  return {
    name: file.name,
    lastModified: file.lastModified,
    version: file.version,
    pages: file.document.children.map((page) => ({
      id: page.id,
      name: page.name,
      type: page.type,
      childCount: 'children' in page ? page.children?.length || 0 : 0,
      children: 'children' in page 
        ? page.children?.slice(0, 20).map((child) => ({
            id: child.id,
            name: child.name,
            type: child.type,
          }))
        : [],
    })),
    componentCount: Object.keys(file.components).length,
    styleCount: Object.keys(file.styles).length,
  };
}

async function handleGetNode(fileKey: string, nodeId: string, depth: number = 5): Promise<any> {
  const response = await figmaClient.getFileNodes(fileKey, [nodeId], { depth });
  const nodeData = response.nodes[nodeId];
  
  if (!nodeData) {
    throw new Error(`Node ${nodeId} not found in file`);
  }

  return {
    name: response.name,
    node: nodeData.document,
    components: nodeData.components,
    styles: nodeData.styles,
  };
}

async function handleExportImage(
  fileKey: string,
  nodeIds: string[],
  format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png',
  scale: number = 2
): Promise<any> {
  const response = await figmaClient.getImages(fileKey, nodeIds, {
    format,
    scale: Math.min(Math.max(scale, 0.01), 4),
  });

  return {
    images: response.images,
    error: response.err,
  };
}

async function handleExtractTokens(
  fileKey: string,
  nodeId?: string,
  outputFormat: 'json' | 'tailwind' | 'css' = 'json'
): Promise<any> {
  let document: FigmaNode;
  let fileName: string;

  if (nodeId) {
    const response = await figmaClient.getFileNodes(fileKey, [nodeId], { depth: 10 });
    const nodeData = response.nodes[nodeId];
    if (!nodeData) {
      throw new Error(`Node ${nodeId} not found`);
    }
    document = nodeData.document;
    fileName = response.name;
  } else {
    const file = await figmaClient.getFile(fileKey, { depth: 10 });
    document = file.document as unknown as FigmaNode;
    fileName = file.name;
  }

  const tokens = extractDesignTokens(document, fileKey, fileName);

  switch (outputFormat) {
    case 'tailwind':
      return {
        config: generateTailwindConfig(tokens),
        tokenCount: {
          colors: tokens.colors.length,
          typography: tokens.typography.length,
          spacing: tokens.spacing.length,
          borderRadius: tokens.borderRadius.length,
          shadows: tokens.shadows.length,
        },
      };
    case 'css':
      return {
        variables: generateCSSVariables(tokens),
        tokenCount: {
          colors: tokens.colors.length,
          typography: tokens.typography.length,
          spacing: tokens.spacing.length,
          borderRadius: tokens.borderRadius.length,
          shadows: tokens.shadows.length,
        },
      };
    default:
      return tokens;
  }
}

async function handleAnalyzeComponent(
  fileKey: string,
  nodeId: string,
  includeChildren: boolean = true
): Promise<ComponentAnalysis> {
  const response = await figmaClient.getFileNodes(fileKey, [nodeId], {
    depth: includeChildren ? 10 : 1,
  });
  
  const nodeData = response.nodes[nodeId];
  if (!nodeData) {
    throw new Error(`Node ${nodeId} not found`);
  }

  return analyzeNode(nodeData.document);
}

async function handleGenerateReact(
  fileKey: string,
  nodeId: string,
  componentName?: string
): Promise<string> {
  const response = await figmaClient.getFileNodes(fileKey, [nodeId], { depth: 10 });
  const nodeData = response.nodes[nodeId];
  
  if (!nodeData) {
    throw new Error(`Node ${nodeId} not found`);
  }

  const analysis = analyzeNode(nodeData.document);
  return generateReactComponent(analysis, componentName);
}

async function handleListComponents(fileKey: string): Promise<any> {
  const file = await figmaClient.getFile(fileKey, { depth: 1 });
  
  return {
    components: Object.entries(file.components).map(([id, comp]) => ({
      id,
      key: comp.key,
      name: comp.name,
      description: comp.description,
      remote: comp.remote,
      componentSetId: comp.componentSetId,
    })),
    componentSets: Object.entries(file.componentSets).map(([id, set]) => ({
      id,
      key: set.key,
      name: set.name,
      description: set.description,
    })),
  };
}

async function handleListStyles(fileKey: string): Promise<any> {
  const file = await figmaClient.getFile(fileKey, { depth: 1 });
  
  const styles = Object.entries(file.styles).map(([id, style]) => ({
    id,
    key: style.key,
    name: style.name,
    styleType: style.styleType,
    description: style.description,
  }));

  return {
    total: styles.length,
    byType: {
      fill: styles.filter((s) => s.styleType === 'FILL'),
      text: styles.filter((s) => s.styleType === 'TEXT'),
      effect: styles.filter((s) => s.styleType === 'EFFECT'),
      grid: styles.filter((s) => s.styleType === 'GRID'),
    },
  };
}

async function handleCompareDesigns(
  fileKey: string,
  nodeIdA: string,
  nodeIdB: string
): Promise<any> {
  const response = await figmaClient.getFileNodes(fileKey, [nodeIdA, nodeIdB], { depth: 5 });
  
  const nodeA = response.nodes[nodeIdA]?.document;
  const nodeB = response.nodes[nodeIdB]?.document;

  if (!nodeA || !nodeB) {
    throw new Error('One or both nodes not found');
  }

  const analysisA = analyzeNode(nodeA);
  const analysisB = analyzeNode(nodeB);

  // Compare key attributes
  const differences: any[] = [];

  // Compare dimensions
  if (
    analysisA.bounds.width !== analysisB.bounds.width ||
    analysisA.bounds.height !== analysisB.bounds.height
  ) {
    differences.push({
      type: 'dimensions',
      nodeA: { width: analysisA.bounds.width, height: analysisA.bounds.height },
      nodeB: { width: analysisB.bounds.width, height: analysisB.bounds.height },
    });
  }

  // Compare Tailwind classes
  const classesA = new Set(analysisA.tailwindClasses);
  const classesB = new Set(analysisB.tailwindClasses);
  
  const onlyInA = [...classesA].filter((c) => !classesB.has(c));
  const onlyInB = [...classesB].filter((c) => !classesA.has(c));

  if (onlyInA.length > 0 || onlyInB.length > 0) {
    differences.push({
      type: 'tailwind_classes',
      onlyInA,
      onlyInB,
    });
  }

  return {
    nodeA: { id: nodeIdA, name: analysisA.name },
    nodeB: { id: nodeIdB, name: analysisB.name },
    differences,
    identical: differences.length === 0,
  };
}

async function handleGetVersions(fileKey: string, limit: number = 10): Promise<any> {
  const response = await figmaClient.getFileVersions(fileKey, { page_size: limit });
  
  return {
    versions: response.versions.map((v) => ({
      id: v.id,
      createdAt: v.created_at,
      label: v.label,
      description: v.description,
      user: v.user.handle,
    })),
    hasMore: !!response.pagination.next_page,
  };
}

// ============================================
// Register Handlers
// ============================================

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    switch (name) {
      case 'figma_get_file':
        result = await handleGetFile(args.file_key, args.depth);
        break;
      case 'figma_get_node':
        result = await handleGetNode(args.file_key, args.node_id, args.depth);
        break;
      case 'figma_export_image':
        result = await handleExportImage(args.file_key, args.node_ids, args.format, args.scale);
        break;
      case 'figma_extract_tokens':
        result = await handleExtractTokens(args.file_key, args.node_id, args.output_format);
        break;
      case 'figma_analyze_component':
        result = await handleAnalyzeComponent(args.file_key, args.node_id, args.include_children);
        break;
      case 'figma_generate_react':
        result = await handleGenerateReact(args.file_key, args.node_id, args.component_name);
        break;
      case 'figma_list_components':
        result = await handleListComponents(args.file_key);
        break;
      case 'figma_list_styles':
        result = await handleListStyles(args.file_key);
        break;
      case 'figma_compare_designs':
        result = await handleCompareDesigns(args.file_key, args.node_id_a, args.node_id_b);
        break;
      case 'figma_get_file_versions':
        result = await handleGetVersions(args.file_key, args.limit);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const message = error instanceof FigmaAPIError
      ? `Figma API Error (${error.statusCode}): ${error.message}`
      : error instanceof Error
      ? error.message
      : 'Unknown error occurred';

    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// ============================================
// Start Server
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Figma MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
