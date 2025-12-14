# Figma MCP Server

A Model Context Protocol (MCP) server that enables AI agents to interact with Figma designs. Extract design tokens, analyze components, and generate React/Tailwind code automatically.

## Features

- **📁 File Navigation** - Browse Figma file structures, pages, and frames
- **🎨 Design Token Extraction** - Extract colors, typography, spacing, shadows
- **🔍 Component Analysis** - Analyze components and get Tailwind class suggestions
- **⚛️ React Code Generation** - Generate React components from Figma designs
- **📸 Image Export** - Export frames as PNG, JPG, SVG, or PDF
- **📊 Design Comparison** - Compare two designs and find differences
- **📜 Version History** - Track design changes over time

## Quick Start

### 1. Get Figma Access Token

1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll to "Personal access tokens"
3. Click "Create new token"
4. Copy the token

### 2. Install & Configure

```bash
cd agents/figma-mcp
npm install
cp .env.example .env
# Edit .env and add your FIGMA_ACCESS_TOKEN
```

### 3. Build & Run

```bash
npm run build
npm start
```

### 4. Add to Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "figma": {
      "command": "node",
      "args": ["C:/Dev/Direct-Cuts/agents/figma-mcp/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

## Available Tools

### `figma_get_file`
Get the structure of a Figma file.

```json
{
  "file_key": "abc123xyz",
  "depth": 2
}
```

### `figma_get_node`
Get detailed info about a specific node.

```json
{
  "file_key": "abc123xyz",
  "node_id": "1:234",
  "depth": 5
}
```

### `figma_export_image`
Export frames as images.

```json
{
  "file_key": "abc123xyz",
  "node_ids": ["1:234", "1:235"],
  "format": "png",
  "scale": 2
}
```

### `figma_extract_tokens`
Extract design tokens.

```json
{
  "file_key": "abc123xyz",
  "output_format": "tailwind"
}
```

Output formats:
- `json` - Raw token data
- `tailwind` - Tailwind config
- `css` - CSS custom properties

### `figma_analyze_component`
Analyze a component and get Tailwind classes.

```json
{
  "file_key": "abc123xyz",
  "node_id": "1:234",
  "include_children": true
}
```

### `figma_generate_react`
Generate React component code.

```json
{
  "file_key": "abc123xyz",
  "node_id": "1:234",
  "component_name": "BarberCard"
}
```

### `figma_list_components`
List all components in a file.

```json
{
  "file_key": "abc123xyz"
}
```

### `figma_list_styles`
List all shared styles.

```json
{
  "file_key": "abc123xyz"
}
```

### `figma_compare_designs`
Compare two nodes for differences.

```json
{
  "file_key": "abc123xyz",
  "node_id_a": "1:234",
  "node_id_b": "1:235"
}
```

### `figma_get_file_versions`
Get version history.

```json
{
  "file_key": "abc123xyz",
  "limit": 10
}
```

## Example Workflows

### Sync Design Tokens

```
1. figma_extract_tokens(file_key, output_format="tailwind")
2. Update tailwind.config.js with extracted tokens
3. Rebuild CSS
```

### Generate Component from Design

```
1. figma_get_file(file_key) - Browse structure
2. figma_analyze_component(file_key, node_id) - Understand styling
3. figma_generate_react(file_key, node_id, "MyComponent") - Get code
4. figma_export_image(file_key, [node_id]) - Get reference image
```

### Design Audit

```
1. figma_extract_tokens(file_key) - Get current design tokens
2. Compare with existing tailwind.config.js
3. figma_list_styles(file_key) - Check for unused styles
4. Generate report of discrepancies
```

## File Key & Node ID

### Finding the File Key

From a Figma URL:
```
https://www.figma.com/file/ABC123xyz/My-Design
                          ^^^^^^^^^ 
                          File Key
```

### Finding Node IDs

From a Figma URL with node selected:
```
https://www.figma.com/file/ABC123xyz/My-Design?node-id=1%3A234
                                                       ^^^^^^
                                                       Node ID (URL encoded)
```

The `1%3A234` decodes to `1:234`.

## Architecture

```
src/
├── index.ts           # MCP server entry point
├── figma-client.ts    # Figma REST API client
├── token-extractor.ts # Design token extraction
├── component-analyzer.ts # Component analysis & code gen
└── types.ts           # TypeScript type definitions
```

## Development

```bash
# Watch mode
npm run dev

# Lint
npm run lint

# Test
npm test
```

## Troubleshooting

### "FIGMA_ACCESS_TOKEN not set"
Ensure your `.env` file exists and contains a valid token.

### "Node not found"
Double-check the node ID. Use `figma_get_file` first to browse available nodes.

### "Rate limited"
Figma API has rate limits. Wait a few minutes before retrying.

### "Permission denied"
Ensure your token has access to the file. For team files, you may need additional permissions.

## License

MIT
