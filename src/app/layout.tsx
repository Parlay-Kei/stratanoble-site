import type { Metadata } from 'next'
import { Inter, Bitter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const bitter = Bitter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bitter',
})

export const metadata: Metadata = {
  title: 'Strata Noble - Passion to Prosperity',
  description: 'Transform your passion into a profitable business with expert guidance and proven strategies.',
  keywords: ['business strategy', 'entrepreneurship', 'AI automation', 'business growth', 'passion to prosperity'],
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
    title: 'Strata Noble - Passion to Prosperity',
    description: 'Transform your passion into a profitable business with expert guidance and proven strategies.',
    url: 'https://stratanoble.com',
    siteName: 'Strata Noble',
    images: [
      {
        url: '/img/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Strata Noble - Passion to Prosperity',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strata Noble - Passion to Prosperity',
    description: 'Transform your passion into a profitable business with expert guidance and proven strategies.',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bitter.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
} 