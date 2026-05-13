import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';

// Migrate from next lint (Next.js 15) to direct eslint invocation (Next.js 16).
// Use the native flat config exported by @next/eslint-plugin-next to avoid
// legacy compat shim which pulls in uninstalled plugins (eslint-plugin-n) that
// cause ESLint 9 "definition not found" errors.
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
  nextPlugin.flatConfig.recommended,
  nextPlugin.flatConfig.coreWebVitals,
  {
    plugins: { react: reactPlugin },
    rules: {
      // These were warnings in next lint — preserve prior behaviour
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'warn',
    },
  },
];
