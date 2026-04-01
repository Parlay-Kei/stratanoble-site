import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const host = 'https://stratanoble.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/auth/',
        '/dashboard/',
        '/vault/',
        '/checkout/',
        '/campaigns/',
        '/admin-login/',
        '/403',
        '/voice-test/',
      ],
    },
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}
