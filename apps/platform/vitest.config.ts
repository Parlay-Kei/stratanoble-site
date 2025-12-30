/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, '../../src/modules'),
      '@modules/*': path.resolve(__dirname, '../../src/modules/*'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: [
      '../../src/modules/**/*.{test,spec}.ts',
      'src/__tests__/**/*.{test,spec}.ts',
    ],
    exclude: ['node_modules', 'dist', '.next'],
    coverage: {
      include: ['../../src/modules/*/domain/**'],
      exclude: ['**/*.test.*', '**/*.spec.*', '**/*.d.ts'],
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
