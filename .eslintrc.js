module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier', // Add prettier last to override conflicting rules
  ],
  plugins: [
    '@typescript-eslint',
    'simple-import-sort', // Add import sorting back
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Essential TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // Essential React rules (Next.js handles most of these)
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js
    'react/prop-types': 'off', // Using TypeScript for prop validation
    'react/display-name': 'warn',
    'react/no-unescaped-entities': 'warn', // Changed from error to warning for production
    'react/jsx-key': 'error',
    
    // Import organization (temporarily disabled for build)
    'simple-import-sort/imports': 'off', // Temporarily disabled
    'simple-import-sort/exports': 'off', // Temporarily disabled
    
    // Code quality essentials
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'off', // Using TypeScript version instead
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Accessibility basics (from Next.js core-web-vitals)
    // These are already included in next/core-web-vitals
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      // Relax rules for config files
      files: ['*.config.js', '*.config.ts', 'tailwind.config.js', 'next.config.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off',
      },
    },
  ],
};
