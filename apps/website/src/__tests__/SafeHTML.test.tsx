/**
 * SafeHTML lives in @strata-noble/ui; this file keeps website Jest coverage for the package export.
 */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SafeHTML } from '@strata-noble/ui';

describe('SafeHTML (via @strata-noble/ui)', () => {
  it('should render safe HTML content', () => {
    const safeHTML = '<p>This is safe content</p>';
    const { container } = render(<SafeHTML html={safeHTML} />);
    expect(container.innerHTML).toContain('<p>This is safe content</p>');
  });

  it('should strip script tags from malicious content', () => {
    const maliciousHTML = '<p>Hello</p><script>alert("XSS")</script><p>World</p>';
    const { container } = render(<SafeHTML html={maliciousHTML} />);
    expect(container.innerHTML).toContain('<p>Hello</p>');
    expect(container.innerHTML).not.toContain('<script>');
  });
});
