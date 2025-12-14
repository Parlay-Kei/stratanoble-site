import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Detect test type from environment or test file location
const isIntegrationTest = process.env.TEST_TYPE === 'integration' || 
  process.argv.some(arg => arg.includes('integration') || arg.includes('e2e'));

// Base config
const baseConfig = {
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
}

// Unit test config (parallel, fast, no DB)
const unitTestConfig = {
  ...baseConfig,
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
    '!**/integration.test.*',
    '!**/e2e/**',
    '!**/tests/e2e/**',
  ],
  testPathIgnorePatterns: [
    'tests/e2e/',
    'integration\\.test\\.',
    '<rootDir>/.next/',
    '<rootDir>/node_modules/'
  ],
  // Unit tests run in parallel (fast, no shared state)
  maxWorkers: '50%', // Use half of available CPUs
  testTimeout: 5000,
}

// Integration test config (serial or isolated DB per worker)
const integrationTestConfig = {
  ...baseConfig,
  testEnvironment: 'node', // Integration tests may need Node environment
  testMatch: [
    '**/integration.test.*',
    '**/integration-*.test.*',
    '**/tests/**/*.test.*',
    '**/src/lib/test/**/*.test.*',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '**/__tests__/**', // Exclude unit tests
  ],
  // Integration tests run serially to avoid DB conflicts
  // OR use isolated schemas per worker (see getTestSchema in db-reset.ts)
  maxWorkers: process.env.CI ? 1 : 1, // Serial for now, can upgrade to parallel with schema isolation
  testTimeout: 30000,
  // Setup test environment before running
  globalSetup: '<rootDir>/jest.integration-setup.js',
  globalTeardown: '<rootDir>/jest.integration-teardown.js',
  // CRITICAL: Run integration contract test FIRST
  // This test validates environment safety before any other tests run
  testSequencer: '<rootDir>/jest.integration-sequencer.js',
  // Nuclear button prevention test runs in band to prevent env contamination
  testNamePattern: process.env.RUN_NUCLEAR_TEST ? 'Nuclear Button Prevention' : undefined,
  runInBand: process.env.RUN_NUCLEAR_TEST === 'true', // Run nuclear test in band
}

// Choose config based on test type
const customJestConfig = isIntegrationTest ? integrationTestConfig : unitTestConfig;

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig)