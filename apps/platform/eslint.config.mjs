import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import path from 'path';
import reactPlugin from 'eslint-plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migrate from next lint (Next.js 15) to direct eslint invocation (Next.js 16).
// eslint-config-next references plugins (eslint-plugin-n, @typescript-eslint)
// that may not be installed. Provide minimal stubs so ESLint 9 does not error
// on unknown rule definitions. Avoid loading the full @typescript-eslint plugin
// as it has circular references that break ESLint's config serialisation.
const stubPlugin = { rules: {} };

const compat = new FlatCompat({ baseDirectory: __dirname });

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
  // Pre-declare plugins referenced by eslint-config-next legacy config
  {
    plugins: {
      n: stubPlugin,
      react: reactPlugin,
      '@typescript-eslint': stubPlugin,
    },
  },
  ...compat.extends('next', 'next/core-web-vitals'),
  {
    rules: {
      // These were warnings in next lint — preserve prior behaviour
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'warn',
      // Disable stub plugin rules
      'n/no-missing-import': 'off',
      'n/global-require': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
