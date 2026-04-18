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
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'Strata Noble',
        url: SITE,
        logo: `${SITE}/stratanoble_logoICON.svg`,
        description:
          'Strata Noble builds and operates revenue-producing digital infrastructure for service businesses and early-stage ventures.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Las Vegas',
          addressRegion: 'NV',
          addressCountry: 'US',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-702-721-3566',
          contactType: 'customer service',
          email: 'contact@stratanoble.com',
        },
        sameAs: ['https://linkedin.com/company/strata-noble'],
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
        name: 'Strata Noble — Revenue Pipeline Infrastructure for Service Businesses',
        description:
          'We build and operate lead capture, follow-up automation, and revenue tracking systems for service businesses. Free diagnostic included.',
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#organization` },
        inLanguage: 'en-US',
      },
      {
        '@type': 'HowTo',
        '@id': `${SITE}/#how-we-work`,
        name: 'How Strata Noble Works',
        description: 'From diagnostic to delivered systems in four steps.',
        step: [
          {
            '@type': 'HowToStep',
            name: 'Discovery',
            text: 'We review your business — how you get leads, where things break, and what you actually need built. Free 48-hour diagnostic included.',
          },
          {
            '@type': 'HowToStep',
            name: 'Scope and price',
            text: 'You get a fixed scope, clear price, and timeline before any work starts. No surprises, no open-ended retainers.',
          },
          {
            '@type': 'HowToStep',
            name: 'Build and deliver',
            text: 'Your system gets built and configured for how you actually work. Production-grade, not a template. Delivered with full documentation.',
          },
          {
            '@type': 'HowToStep',
            name: 'Run and support',
            text: 'You own everything we build. Optional monthly support keeps systems running, optimized, and reporting clearly.',
          },
        ],
      },
      {
        '@type': 'Service',
        '@id': `${SITE}/#service-lead-rescue`,
        name: '48-Hour Lead Rescue',
        description:
          'Lead capture and follow-up system installation in 48 hours. Intake form, automated follow-up sequence, and tracking dashboard.',
        provider: { '@id': `${SITE}/#organization` },
        url: `${SITE}/lead-rescue`,
      },
      {
        '@type': 'Service',
        '@id': `${SITE}/#service-pipeline-buildout`,
        name: '21-Day Pipeline Buildout',
        description:
          'Complete lead-to-customer pipeline: capture, follow-up automation, deal tracking, and a full record of everything we built and delivered.',
        provider: { '@id': `${SITE}/#organization` },
        url: `${SITE}/pipeline-buildout`,
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE}/#software-q-suite`,
        name: 'Q Suite',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description:
          'Business tools for client tracking, revenue tracking, follow-up, and secure credential storage — the same set we use to run Strata Noble.',
        offers: {
          '@type': 'Offer',
          url: `${SITE}/q-suite`,
          availability: 'https://schema.org/PreOrder',
        },
        publisher: { '@id': `${SITE}/#organization` },
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
