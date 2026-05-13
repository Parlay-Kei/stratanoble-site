import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import path from 'path';
import reactPlugin from 'eslint-plugin-react';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migrate from next lint (Next.js 15) to direct eslint invocation (Next.js 16).
// eslint-config-next references eslint-plugin-n which is not installed — we
// provide a stub plugin so ESLint 9 does not error on unknown rule definitions.
const stubNPlugin = { rules: {} };

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
  // Provide plugins that eslint-config-next references but may not be installed
  {
    plugins: {
      n: stubNPlugin,
      react: reactPlugin,
      '@typescript-eslint': tsPlugin,
    },
  },
  ...compat.extends('next', 'next/core-web-vitals'),
  {
    rules: {
      // These were warnings in next lint — preserve prior behaviour
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'warn',
      // Disable n/ rules that eslint-config-next may reference
      'n/no-missing-import': 'off',
      'n/global-require': 'off',
    },
  },
];
