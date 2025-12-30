// Vitest global setup
import { testUtils } from './src/__tests__/testUtils';

// Make test utilities available globally
(globalThis as any).testUtils = testUtils;
