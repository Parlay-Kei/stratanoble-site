import { createRequire } from 'module';

// Migrate from next lint (Next.js 15) to direct eslint invocation (Next.js 16).
// Avoid FlatCompat + eslint-config-next entirely: @eslint/eslintrc's validator
// calls JSON.stringify on plugins, which throws on eslint-plugin-react's
// self-referential configs.flat.plugins.react circular structure.
// Instead configure @next/eslint-plugin-next rules directly in native flat config.

const require = createRequire(import.meta.url);
const nextPlugin = require('@next/eslint-plugin-next');

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
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      // Next.js recommended rules (mirrors eslint-config-next recommended)
      '@next/next/google-font-display': 'warn',
      '@next/next/google-font-preconnect': 'warn',
      '@next/next/inline-script-id': 'error',
      '@next/next/next-script-for-ga': 'warn',
      '@next/next/no-assign-module-variable': 'error',
      '@next/next/no-async-client-component': 'warn',
      '@next/next/no-before-interactive-script-outside-document': 'warn',
      '@next/next/no-css-tags': 'warn',
      '@next/next/no-document-import-in-page': 'error',
      '@next/next/no-duplicate-head': 'error',
      '@next/next/no-head-element': 'warn',
      '@next/next/no-head-import-in-document': 'error',
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-page-custom-font': 'warn',
      '@next/next/no-script-component-in-head': 'error',
      '@next/next/no-styled-jsx-in-document': 'warn',
      '@next/next/no-sync-scripts': 'error',
      '@next/next/no-title-in-document-head': 'warn',
      '@next/next/no-typos': 'warn',
      '@next/next/no-unwanted-polyfillio': 'warn',
    },
  },
];
