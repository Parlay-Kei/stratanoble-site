# ESLint Configuration Guide

## Issue Resolution Summary

### Problem
ESLint was failing to load the `@typescript-eslint/recommended` configuration due to version compatibility issues between:
- ESLint 8.57.1 (deprecated)
- @typescript-eslint packages v7.18.0
- Complex configuration with potential conflicts

### Solution Implemented
1. **Version Compatibility Fix**: Downgraded @typescript-eslint packages to v6.21.0 for compatibility with ESLint 8.57.1
2. **Simplified Configuration**: Started with Next.js basics and gradually added essential rules
3. **Windows Path Compatibility**: Ensured configuration works with spaces in folder names

## Current Configuration

### Dependencies
```json
"@typescript-eslint/eslint-plugin": "^6.21.0",
"@typescript-eslint/parser": "^6.21.0",
"eslint": "^8.57.0"
```

### ESLint Rules Enabled
- **Next.js Core Web Vitals**: Essential Next.js and React rules
- **TypeScript Recommended**: Core TypeScript linting rules
- **Prettier Integration**: Code formatting consistency
- **Import Sorting**: Automatic import organization
- **Code Quality**: Essential JavaScript/TypeScript best practices

## Available Commands

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type checking
npm run type-check

# Build (includes linting)
npm run build
```

## Configuration Details

### Extends
- `next/core-web-vitals`: Next.js recommended rules including React and accessibility
- `@typescript-eslint/recommended`: TypeScript best practices
- `prettier`: Prettier integration (must be last)

### Key Rules
- **TypeScript**: Unused variables, explicit any warnings, proper typing
- **React**: JSX key requirements, display names, unescaped entities
- **Import Organization**: Automatic sorting and organization
- **Code Quality**: Prefer const, no var, no debugger statements

### Overrides
- **JavaScript Files**: Relaxed TypeScript rules
- **Config Files**: Relaxed console and require rules

## Future Upgrade Path

When ready to upgrade to ESLint 9.x:

1. **Update ESLint**:
   ```bash
   npm install --save-dev eslint@^9.0.0
   ```

2. **Update TypeScript ESLint**:
   ```bash
   npm install --save-dev @typescript-eslint/eslint-plugin@^8.0.0 @typescript-eslint/parser@^8.0.0
   ```

3. **Update Configuration Format**:
   - Consider migrating to `eslint.config.js` (flat config)
   - Update rule syntax for ESLint 9.x compatibility

## Adding More Rules

To gradually enhance the configuration, consider adding:

### Accessibility Rules
```javascript
extends: [
  // ... existing
  'plugin:jsx-a11y/recommended'
]
```

### Import Rules
```javascript
extends: [
  // ... existing
  'plugin:import/recommended',
  'plugin:import/typescript'
]
```

### Additional TypeScript Rules
```javascript
rules: {
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  '@typescript-eslint/prefer-optional-chain': 'error',
  '@typescript-eslint/no-unnecessary-condition': 'warn'
}
```

## Troubleshooting

### Common Issues
1. **Module Resolution Errors**: Ensure `project: './tsconfig.json'` is correct
2. **Windows Path Issues**: Use forward slashes in glob patterns
3. **Plugin Not Found**: Verify all plugins are installed in devDependencies

### Testing Configuration
```bash
# Test specific file
npx eslint src/components/Header.tsx

# Test with specific rules
npx eslint src --rule 'no-console: error'

# Debug configuration
npx eslint --print-config src/components/Header.tsx
```

## Best Practices

1. **Incremental Changes**: Add rules gradually to avoid overwhelming errors
2. **Team Consistency**: Ensure all team members use the same ESLint version
3. **IDE Integration**: Configure your editor to show ESLint warnings in real-time
4. **Pre-commit Hooks**: Consider adding ESLint to pre-commit hooks for consistency

## Status
✅ **RESOLVED**: ESLint configuration is now working properly
✅ **COMPATIBLE**: Works with current Next.js 15.3.3 and TypeScript 5.5.4
✅ **TESTED**: All commands (lint, lint:fix, build) working correctly
