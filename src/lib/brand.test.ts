import { describe, it, expect } from 'vitest';
import { brandColors } from './brand';

describe('brandColors', () => {
  it('exports a non-null object', () => {
    expect(brandColors).not.toBeNull();
    expect(typeof brandColors).toBe('object');
  });
});
