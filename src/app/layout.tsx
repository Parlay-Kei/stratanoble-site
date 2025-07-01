import type { Metadata } from 'next';
import { Bitter, Inter } from 'next/font/google';
import { initializeAnalytics } from '@/lib/analytics';
import { ToastProvider } from '@/components/ui/toast';
import './globals.css';

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
    'We turn your passion into a profitable business through proven strategies, expert guidance, and systematic execution—because your vision deserves to thrive.',
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
  logo: 'https://stratanoble.com/img/logo.png',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bitter.variable}`}>
      <head>
        {/* Plausible Analytics - Privacy-friendly analytics */}
        <script
          defer
          data-domain="stratanoble.com"
          src="https://plausible.io/js/script.js"
        />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
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
        <ToastProvider>{children}</ToastProvider>
        
        {/* Analytics initialization script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize analytics when the page loads
              if (typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  // Analytics will be initialized by the layout component
                  console.log('📊 Analytics initialized');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
