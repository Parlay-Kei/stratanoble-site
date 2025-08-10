import { render } from '@testing-library/react'
import { SafeHTML } from '../SafeHTML'

describe('SafeHTML Component', () => {
  it('should render safe HTML content', () => {
    const safeHTML = '<p>This is safe content</p>'
    const { container } = render(<SafeHTML html={safeHTML} />)
    
    expect(container.innerHTML).toContain('<p>This is safe content</p>')
  })

  it('should strip script tags from malicious content', () => {
    const maliciousHTML = '<p>Hello</p><script>alert("XSS")</script><p>World</p>'
    const { container } = render(<SafeHTML html={maliciousHTML} />)
    
    // Should contain the safe content
    expect(container.innerHTML).toContain('<p>Hello</p>')
    expect(container.innerHTML).toContain('<p>World</p>')
    
    // Should NOT contain the script tag
    expect(container.innerHTML).not.toContain('<script>')
    expect(container.innerHTML).not.toContain('alert("XSS")')
  })

  it('should strip onclick handlers and other dangerous attributes', () => {
    const maliciousHTML = '<button onclick="alert(\'XSS\')">Click me</button><div onload="steal()">Content</div>'
    const { container } = render(<SafeHTML html={maliciousHTML} />)
    
    // Should not contain dangerous event handlers
    expect(container.innerHTML).not.toContain('onclick')
    expect(container.innerHTML).not.toContain('onload')
    expect(container.innerHTML).not.toContain('alert')
    expect(container.innerHTML).not.toContain('steal()')
  })

  it('should strip iframe and object tags', () => {
    const maliciousHTML = '<iframe src="javascript:alert(\'XSS\')"></iframe><object data="malicious.swf"></object>'
    const { container } = render(<SafeHTML html={maliciousHTML} />)
    
    expect(container.innerHTML).not.toContain('<iframe')
    expect(container.innerHTML).not.toContain('<object')
  })

  it('should preserve allowed tags and attributes', () => {
    const safeHTML = '<a href="https://example.com" target="_blank" rel="noopener">Link</a><strong>Bold</strong>'
    const { container } = render(<SafeHTML html={safeHTML} />)
    
    expect(container.innerHTML).toContain('<a href="https://example.com"')
    expect(container.innerHTML).toContain('<strong>Bold</strong>')
  })

  it('should handle malformed HTML gracefully', () => {
    const malformedHTML = '<div><p>Unclosed paragraph<script>alert("XSS")</div>'
    const { container } = render(<SafeHTML html={malformedHTML} />)
    
    // Should not crash and should still strip dangerous content
    expect(container.innerHTML).not.toContain('<script>')
    expect(container.innerHTML).not.toContain('alert')
  })

  it('should support custom className prop', () => {
    const html = '<p>Test content</p>'
    const { container } = render(<SafeHTML html={html} className="custom-class" />)
    
    expect(container.firstChild as Element).toHaveClass('custom-class')
  })

  it('should support custom tag prop', () => {
    const html = '<p>Test content</p>'
    const { container } = render(<SafeHTML html={html} tag="section" />)
    
    expect(container.firstChild?.nodeName.toLowerCase()).toBe('section')
  })

  it('should prevent data attributes when ALLOW_DATA_ATTR is false', () => {
    const htmlWithData = '<div data-evil="javascript:alert(\'XSS\')">Content</div>'
    const { container } = render(<SafeHTML html={htmlWithData} />)
    
    expect(container.innerHTML).not.toContain('data-evil')
  })

  it('should handle complex XSS attempts', () => {
    const complexXSS = `
      <img src="x" onerror="alert('XSS')">
      <svg onload="alert('XSS')">
      <style>body{background:url("javascript:alert('XSS')")}</style>
      <link rel="stylesheet" href="javascript:alert('XSS')">
    `
    const { container } = render(<SafeHTML html={complexXSS} />)
    
    expect(container.innerHTML).not.toContain('onerror')
    expect(container.innerHTML).not.toContain('onload')
    expect(container.innerHTML).not.toContain('javascript:')
    expect(container.innerHTML).not.toContain('alert')
  })
})