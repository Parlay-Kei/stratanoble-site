import { describe, it, expect } from 'vitest';
import { brand } from './brand';

describe('brand', () => {
  it('exports a non-null object', () => {
    expect(brand).not.toBeNull();
  });
}); 