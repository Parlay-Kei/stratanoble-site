import './globals.css';

import type { Metadata } from 'next';
import { Bitter, Inter } from 'next/font/google';
import Script from 'next/script';
import { Suspense } from 'react';

import { Analytics } from '@/components/Analytics';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ToastProvider } from '@/components/ui/toast';

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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Strata Noble',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  other: {
    'theme-color': '#003366',
    'msapplication-TileColor': '#003366',
    'color-scheme': 'light dark',
  },
};




export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bitter.variable}`}>
      <body className="font-sans antialiased">
        <Header />
        <ToastProvider>{children}</ToastProvider>
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
