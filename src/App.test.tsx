import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';
import { Header } from './components/Header';
import { CaseStudiesSlider } from './components/CaseStudiesSlider';
import { MetricsSection } from './components/MetricsSection';

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

describe('Header', () => {
  it('renders without crashing', () => {
    render(<Header />);
  });
});

describe('CaseStudiesSlider', () => {
  it('renders without crashing', () => {
    render(<CaseStudiesSlider />);
  });
});

describe('MetricsSection', () => {
  it('renders without crashing', () => {
    render(<MetricsSection />);
  });
});
