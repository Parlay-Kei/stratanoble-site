/**
 * Global JSON-LD (@graph) for SEO / AEO — ENGDEL-SN-SEO-AEO-INFRA-0068
 * Keep in sync with visible site copy and layout metadata.
 */

const SITE = 'https://stratanoble.com';

export function buildGlobalJsonLdGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'ProfessionalService'],
        '@id': `${SITE}/#organization`,
        name: 'Strata Noble',
        url: SITE,
        logo: `${SITE}/stratanoble_logoICON.svg`,
        image: `${SITE}/img/og-image.png`,
        description:
          'Strata Noble helps owner-led businesses turn repetitive office work into simple AI-assisted routines with clear setup, handoff, and human review.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Las Vegas',
          addressLocality: 'Las Vegas',
          addressRegion: 'NV',
          postalCode: '89101',
          addressCountry: 'US',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 36.1699,
          longitude: -115.1398,
        },
        areaServed: {
          '@type': 'Country',
          name: 'United States',
        },
        serviceArea: {
          '@type': 'Country',
          name: 'United States',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-702-721-3566',
          contactType: 'customer service',
          email: 'contact@stratanoble.com',
          areaServed: 'US',
          availableLanguage: 'English',
        },
        telephone: '+1-702-721-3566',
        email: 'contact@stratanoble.com',
        priceRange: '$$$',
        currenciesAccepted: 'USD',
        paymentAccepted: 'Invoice, Credit Card',
        sameAs: [
          'https://linkedin.com/company/strata-noble',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: SITE,
        name: 'Strata Noble',
        inLanguage: 'en-US',
        publisher: { '@id': `${SITE}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE}/#homepage`,
        url: SITE,
        name: 'Strata Noble | Practical AI Setup for Owner-Led Businesses',
        description:
          'AI Fit Calls, AI Operations Reviews, First AI Workday Setups, expansion routines, and quarterly tune-ups for small business operators.',
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#organization` },
        inLanguage: 'en-US',
      },
      {
        '@type': 'HowTo',
        '@id': `${SITE}/#how-we-work`,
        name: 'How Strata Noble Works',
        description: 'From AI fit call to one useful routine your business can keep using.',
        step: [
          {
            '@type': 'HowToStep',
            name: 'Find the routine',
            text: 'We identify one repetitive office workflow where AI can help without adding complexity.',
          },
          {
            '@type': 'HowToStep',
            name: 'Set the rules',
            text: 'We define what AI can draft, what a person must review, and what tools the routine will use.',
          },
          {
            '@type': 'HowToStep',
            name: 'Build the workflow',
            text: 'We set up the prompts, templates, and handoff steps inside your actual workday.',
          },
          {
            '@type': 'HowToStep',
            name: 'Teach and tune',
            text: 'You get a walkthrough, simple instructions, and optional tune-ups as your business changes.',
          },
        ],
      },
      {
        '@type': 'Service',
        '@id': `${SITE}/#service-ai-operations-review`,
        name: 'AI Operations Review',
        description:
          'A practical review of where AI can save time in one owner-led business without adding unnecessary software.',
        provider: { '@id': `${SITE}/#organization` },
        url: `${SITE}/services`,
      },
      {
        '@type': 'Service',
        '@id': `${SITE}/#service-first-ai-workday-setup`,
        name: 'First AI Workday Setup',
        description:
          'One useful AI-assisted office routine built, documented, and handed off in 7 to 10 days.',
        provider: { '@id': `${SITE}/#organization` },
        url: `${SITE}/services`,
      },
    ],
  };
}

export function buildFaqPageJsonLd(
  faqs: ReadonlyArray<{ q: string; a: string }>,
  pageUrl: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: pageUrl,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}
