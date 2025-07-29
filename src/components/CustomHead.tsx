import Script from 'next/script';

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

export function CustomHead() {
  return (
    <>
      {/* Preload critical resources */}
      <link rel="preload" href="/img/logo.webp" as="image" type="image/webp" />
      <link rel="preload" href="/img/hero-bg.webp" as="image" type="image/webp" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://plausible.io" />

      {/* Structured data */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Plausible Analytics */}
      <Script
        src="https://plausible.io/js/script.js"
        data-domain="stratanoble.com"
        strategy="afterInteractive"
      />
    </>
  );
}