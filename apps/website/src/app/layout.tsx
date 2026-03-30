import './globals.css';

import React from 'react'
import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import Script from 'next/script';
import { Suspense } from 'react';

import { Analytics } from '@/components/Analytics';
import { ToastProvider } from '@/components/ui/toast';

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-mono',
});

const clashDisplay = localFont({
  src: [
    { path: '../../public/fonts/ClashDisplay-Light.woff2', weight: '300' },
    { path: '../../public/fonts/ClashDisplay-Regular.woff2', weight: '400' },
    { path: '../../public/fonts/ClashDisplay-Bold.woff2', weight: '700' },
  ],
  variable: '--font-display',
  display: 'swap',
});

const generalSans = localFont({
  src: [
    { path: '../../public/fonts/GeneralSans-Regular.woff2', weight: '400' },
    { path: '../../public/fonts/GeneralSans-Medium.woff2', weight: '500' },
  ],
  variable: '--font-body',
  display: 'swap',
});

// Force dynamic rendering to avoid prerender issues with client components in layout
export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
  title: {
    default: 'Strata Noble',
    template: '%s | Strata Noble',
  },
  description:
    'Operational infrastructure for service businesses. Intake, revenue visibility, and execution control — built on the same Q Suite system we run internally.',
  keywords: [
    'operational infrastructure',
    'business operating system',
    'service business automation',
    'revenue visibility',
    'intake automation',
    'Q Suite',
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
    title: 'Strata Noble',
    description:
      'Operational infrastructure for service businesses. Intake, revenue visibility, and execution control — built on the same Q Suite system we run internally.',
    siteName: 'Strata Noble',
    images: [
      {
        url: '/img/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Strata Noble',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strata Noble',
    description:
      'Operational infrastructure for service businesses. Intake, revenue visibility, and execution control — built on the same Q Suite system we run internally.',
    images: ['/img/og-image.svg'],
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
  // Google verification - remove if not set, or add real value
  // verification: {
  //   google: process.env.GOOGLE_SITE_VERIFICATION || '',
  // },
  category: 'business',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Strata Noble',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
  other: {
    'theme-color': '#0E1A2B',
    'msapplication-TileColor': '#0E1A2B',
    'color-scheme': 'light dark',
    // iOS Smart App Banner - only add if app is published
    ...(process.env.NEXT_PUBLIC_ACHIEVERY_APP_ID ? {
      'apple-itunes-app': `app-id=${process.env.NEXT_PUBLIC_ACHIEVERY_APP_ID}, app-argument=achievery://dashboard`,
      'al:ios:app_store_id': process.env.NEXT_PUBLIC_ACHIEVERY_APP_ID,
    } : {}),
    // Android App Install Banner
    'google-play-app': 'app-id=com.stratanoble.achievery',
    // Deep linking support
    'al:ios:app_name': 'ACHIEVERY',
    'al:ios:url': 'achievery://dashboard',
    'al:android:package': 'com.stratanoble.achievery',
    'al:android:app_name': 'ACHIEVERY',
    'al:android:url': 'achievery://dashboard',
    'al:web:url': 'https://stratanoble.com/achievery',
  },
};




export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Marketing pages use (marketing) route group with SiteShell
  // Root layout only provides base HTML structure

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Strata Noble",
    "url": "https://stratanoble.com",
    "logo": "https://stratanoble.com/stratanoble_logoICON.svg",
    "description": "Operational infrastructure for service businesses. Intake, revenue visibility, and execution control — built on the same Q Suite system we run internally.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Las Vegas",
      "addressRegion": "NV",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-702-721-3566",
      "contactType": "customer service",
      "email": "contact@stratanoble.com"
    },
    "sameAs": [
      "https://linkedin.com/company/strata-noble"
    ],
    "services": [
      {
        "@type": "Service",
        "name": "48-Hour Lead Rescue",
        "description": "Lead capture and follow-up system installation in 48 hours. Intake form, automated follow-up sequence, and tracking dashboard."
      },
      {
        "@type": "Service",
        "name": "21-Day Pipeline Buildout",
        "description": "Complete lead-to-customer pipeline infrastructure with multi-stage deal tracking, automated nurture sequences, and ProofLoop verification."
      }
    ]
  }

  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${generalSans.variable} ${plexMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* Resource hints for performance optimization */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://plausible.io" />
        <link rel="dns-prefetch" href="https://plausible.io" />
        {/* Google Analytics - moved to Script components below */}
      </head>
      <body className="font-sans antialiased pt-12">
        {process.env.NODE_ENV !== 'production' && (
          <Script
            id="sw-unregister-dev"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                (function(){
                  try {
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.getRegistrations().then((regs) => {
                        regs.forEach((reg) => reg.unregister());
                      }).catch(()=>{});
                    }
                    if (typeof caches !== 'undefined' && caches.keys) {
                      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(()=>{});
                    }
                  } catch {}
                })();
              `,
            }}
          />
        )}

        <ToastProvider>
          {children}
        </ToastProvider>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>        {/* Google Analytics with Next.js Script component - lazyOnload to avoid blocking critical path */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0TGKD1S1HB"
          strategy="lazyOnload"
        />
        <Script id="ga-config" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0TGKD1S1HB');
          `}
        </Script>
        <Script
          defer
          data-domain="stratanoble.com"
          src="https://plausible.io/js/script.js"
          strategy="lazyOnload"
        />
                {/* Service Worker Registration */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            id="sw-register"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
