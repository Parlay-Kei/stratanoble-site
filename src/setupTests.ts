/// <reference lib="dom" />
/// <reference types="node" />
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock IntersectionObserver for jsdom with all required properties
class MockIntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

// Add IntersectionObserver to the global object
globalThis.IntersectionObserver = MockIntersectionObserver;

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
