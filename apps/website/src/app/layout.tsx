import './globals.css';

import type { Metadata } from 'next';
import { Bitter, Inter } from 'next/font/google';
import Script from 'next/script';
import { Suspense } from 'react';

import { Analytics } from '@/components/Analytics';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ToastProvider } from '@/components/ui/toast';
import RouteGuard from '@/components/RouteGuard';

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
    'We turn your passion into a profitable business through proven strategies, expert guidance, and systematic execution because your vision deserves to thrive.',
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
        url: '/img/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Strata Noble - Transform Your Passion Into Profit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strata Noble - Transform Your Passion Into Profit',
    description:
      'We turn your passion into a profitable business through proven strategies, expert guidance, and systematic execution.',
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
  verification: {
    google: 'your-google-verification-code',
  },
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
    'theme-color': '#30232d',
    'msapplication-TileColor': '#30232d',
    'color-scheme': 'light dark',
  },
};




export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Strata Noble",
    "url": "https://stratanoble.com",
    "logo": "https://stratanoble.com/img/logo.svg",
    "description": "We turn your passion into a profitable business through proven strategies, expert guidance, and systematic execution because your vision deserves to thrive.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Las Vegas",
      "addressRegion": "NV",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-702-707-3168",
      "contactType": "customer service",
      "email": "contact@stratanoble.com"
    },
    "sameAs": [
      "https://linkedin.com/company/strata-noble"
    ],
    "services": [
      {
        "@type": "Service",
        "name": "Idea to Execution Strategy",
        "description": "Complete business strategy from concept to profitable execution"
      },
      {
        "@type": "Service", 
        "name": "AI/No-Code Stack Setup",
        "description": "Implementation of AI tools and no-code solutions for business automation"
      },
      {
        "@type": "Service",
        "name": "Operations & Delegation Blueprint", 
        "description": "Systematic approach to scaling operations and team delegation"
      },
      {
        "@type": "Service",
        "name": "Data Analysis & Optimization",
        "description": "Performance analytics and operational efficiency improvements"
      }
    ]
  }

  return (
    <html lang="en" className={`${inter.variable} ${bitter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Header />
        <ToastProvider>
          <RouteGuard>{children}</RouteGuard>
        </ToastProvider>
        <Footer />
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <Script
          defer
          data-domain="stratanoble.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
