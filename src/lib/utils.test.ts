import { describe, it, expect } from 'vitest';
import * as utils from './utils';

describe('utils', () => {
  it('exports an object', () => {
    expect(typeof utils).toBe('object');
  });
});
