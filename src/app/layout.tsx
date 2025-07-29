import './globals.css';

import type { Metadata } from 'next';
import { Bitter, Inter } from 'next/font/google';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ToastProvider } from '@/components/ui/toast';
import { initializeAnalytics } from '@/lib/analytics';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const bitter = Bitter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bitter',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'Strata Noble - Transform Your Passion Into Profit',
    template: '%s | Strata Noble',
  },
  description:
    'We turn your passion into a profitable business through proven strategies, expert guidance, and systematic execution – because your vision deserves to thrive.',
  keywords: [
    'business strategy',
    'startup consulting',
    'passion to profit',
    'business coaching',
    'entrepreneurship',
  ],
  authors: [{ name: 'Strata Noble' }],
  creator: 'Strata Noble',
  publisher: 'Strata Noble',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://stratanoble.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://stratanoble.com',
    title: 'Strata Noble - Transform Your Passion Into Profit',
    description:
      'We turn your passion into a profitable business through proven strategies, expert guidance, and systematic execution.',
    siteName: 'Strata Noble',
    images: [
      {
        url: '/img/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Strata Noble - Business Strategy and Consulting',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strata Noble - Transform Your Passion Into Profit',
    description:
      'We turn your passion into a profitable business through proven strategies, expert guidance, and systematic execution.',
    images: ['/img/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'business',
};

// Structured data for better SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Strata Noble',
  url: 'https://stratanoble.com',
  logo: 'https://stratanoble.com/img/logo.webp',
  description:
    'Transform your passion into a profitable business with expert guidance and proven strategies.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Las Vegas',
    addressRegion: 'NV',
    addressCountry: 'US',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-702-707-3168',
    contactType: 'customer service',
    email: 'contact@stratanoble.com',
  },
  sameAs: ['https://linkedin.com/company/strata-noble', 'https://twitter.com/stratanoble'],
  serviceType: 'Business Consulting',
  areaServed: 'Worldwide',
};

// Initialize analytics on the client side
if (typeof window !== 'undefined') {
  initializeAnalytics();
}

// Utility function for Plausible custom event tracking
function trackPlausibleEvent(event: string, props?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof (window as { plausible?: unknown }).plausible === 'function') {
    (window as { plausible: (event: string, options?: { props?: Record<string, unknown> }) => void }).plausible(event, { props });
  }
}

// Critical CSS for above-the-fold content
const criticalCSS = `
  /* Critical styles for hero section */
  .gradient-text {
    background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    transition: all 0.3s ease;
  }
  
  .btn-outline {
    border: 2px solid #059669;
    color: #059669;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    transition: all 0.3s ease;
    background: transparent;
  }
  
  .btn-lg {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }
  
  /* Container and layout */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  /* Hero section critical styles */
  .hero-section {
    background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%);
    padding: 6rem 0;
    position: relative;
    overflow: hidden;
  }
  
  .hero-content {
    text-align: center;
    max-width: 64rem;
    margin: 0 auto;
  }
  
  .hero-title {
    font-size: 3.75rem;
    font-weight: 700;
    line-height: 1;
    color: #1e293b;
    margin-bottom: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
    color: #475569;
    margin-bottom: 2.5rem;
    max-width: 48rem;
    margin-left: auto;
    margin-right: auto;
  }
  
  /* Responsive design */
  @media (max-width: 640px) {
    .hero-title {
      font-size: 2.5rem;
    }
    
    .hero-subtitle {
      font-size: 1.125rem;
    }
    
    .btn-lg {
      padding: 0.875rem 1.5rem;
      font-size: 1rem;
    }
  }
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bitter.variable}`}>
      <head>
        {/* Critical CSS Inline */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/img/logo.webp" as="image" type="image/webp" />
        <link rel="preload" href="/img/hero-bg.webp" as="image" type="image/webp" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://plausible.io" />
        
        {/* Plausible Analytics - Privacy-friendly analytics */}
        <script
          defer
          data-domain="stratanoble.com"
          src="https://plausible.io/js/script.js"
        />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Meta tags for better SEO and social sharing */}
        <meta name="theme-color" content="#003366" />
        <meta name="msapplication-TileColor" content="#003366" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Performance hints */}
        <meta name="color-scheme" content="light dark" />

        {/* Accessibility */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-sans antialiased">
        <Header />
        <ToastProvider>{children}</ToastProvider>
        <Footer />
        
        {/* Analytics initialization script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize analytics and RUM when the page loads
              if (typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  // Initialize Plausible Analytics
                  if (!window.plausible) {
                    window.plausible = function(eventName, options) {
                      // Send to Plausible
                      if (window.plausible && typeof window.plausible === 'function') {
                        window.plausible(eventName, options);
                      }
                      // Log in development
                      if (process.env.NODE_ENV === 'development') {
                        console.log('📊 Analytics Event:', eventName, options);
                      }
                    };
                  }
                  
                  // Make trackPlausibleEvent available globally
                  window.trackPlausibleEvent = ${trackPlausibleEvent.toString()};
                  
                  // Track initial page view
                  if (window.plausible) {
                    window.plausible('pageview');
                  }
                  
                  // Initialize RUM monitoring
                  try {
                    const { initializeRUM } = require('@/lib/rum');
                    initializeRUM();
                  } catch {
                    console.warn('Failed to initialize RUM:', error);
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
