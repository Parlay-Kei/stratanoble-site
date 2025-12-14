/**
 * ESLint rule to prevent raw database cleanup in test files
 * 
 * This rule blocks ALL patterns that could perform raw database deletes:
 * - .delete().eq( in afterAll/beforeEach
 * - .delete().neq( (workaround attempt)
 * - .from('X').delete() (any delete from Supabase client)
 * - Direct TRUNCATE calls
 * - Raw cleanup code in test files
 * 
 * Use db-reset.ts instead!
 * 
 * The only exception is inside the db-reset.ts file itself.
 */

module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        // Block .delete().eq( pattern
        selector: 'CallExpression[callee.property.name="delete"] > CallExpression[callee.property.name="eq"]',
        message: 'Use testReset() from db-reset.ts instead of raw .delete().eq() cleanup',
      },
      {
        // Block .delete().neq( pattern (workaround attempt)
        selector: 'CallExpression[callee.property.name="delete"] > CallExpression[callee.property.name="neq"]',
        message: 'Use testReset() from db-reset.ts instead of raw .delete().neq() cleanup',
      },
      {
        // Block ANY .from('X').delete() pattern in test files
        selector: 'CallExpression[callee.property.name="delete"][callee.object.property.name="from"]',
        message: 'Use testReset() from db-reset.ts for database cleanup. Raw .from().delete() is blocked in test files.',
      },
      {
        // Block direct TRUNCATE calls
        selector: 'CallExpression[callee.name="TRUNCATE"]',
        message: 'Use testReset() from db-reset.ts instead of raw TRUNCATE',
      },
      {
        // Block .delete() without chaining (catches other patterns)
        selector: 'CallExpression[callee.property.name="delete"]:not([callee.object.property.name="reset"])',
        message: 'Use testReset() from db-reset.ts for database cleanup. Raw .delete() is blocked in test files.',
      },
    ],
    // Also block direct imports of Supabase client for cleanup in test files
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@supabase/supabase-js'],
            message: 'In test files, use testReset() from db-reset.ts instead of direct Supabase client for cleanup operations.',
            // Allow import if it's in db-reset.ts itself or if it's not for cleanup
            // This is a soft check - the syntax rules above catch the actual misuse
          },
        ],
      },
    ],
  },
};
