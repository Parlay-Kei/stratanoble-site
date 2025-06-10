import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Basic smoke test to ensure the app renders
    expect(document.body).toBeTruthy();
  });

  it('renders main sections', () => {
    render(<App />);
    // Check for presence of main sections
    expect(document.querySelector('header')).toBeInTheDocument();
    expect(document.querySelector('main')).toBeInTheDocument();
    expect(document.querySelector('footer')).toBeInTheDocument();
  });
});
