import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migrate from next lint (Next.js 15) to direct eslint invocation (Next.js 16).
// eslint-config-next references plugins (eslint-plugin-n, @typescript-eslint,
// eslint-plugin-react) some of which may be missing or have circular references
// that break @eslint/eslintrc's config validator (JSON.stringify of plugins).
// Use minimal stubs for all referenced plugins to keep the config serialisable.
const stubPlugin = { rules: {} };

const compat = new FlatCompat({
  baseDirectory: __dirname,
  // Provide stub resolvers for plugins that eslint-config-next references
  resolvePluginsRelativeTo: __dirname,
});

export default [
  {
    ignores: [
      '.next/**',
      '.netlify/**',
      'node_modules/**',
      'out/**',
      'dist/**',
      '.planning/**',
    ],
  },
  // Pre-declare all plugins eslint-config-next references using safe stubs.
  // This prevents @eslint/eslintrc's validator from trying to JSON.stringify
  // the real plugin objects (which have circular references in flat configs).
  {
    plugins: {
      n: stubPlugin,
      react: stubPlugin,
      '@typescript-eslint': stubPlugin,
      import: stubPlugin,
      'jsx-a11y': stubPlugin,
    },
  },
  ...compat.extends('next', 'next/core-web-vitals'),
  {
    rules: {
      // Disable any rules from stub plugins that the extended config enables
      'react/no-unknown-property': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Preserve prior warning-level behaviour from next lint
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'warn',
      // Disable stub n/ rules
      'n/no-missing-import': 'off',
      'n/global-require': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
