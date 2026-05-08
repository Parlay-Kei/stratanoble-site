import { createRequire } from 'module';

import sitemap from '@/app/sitemap';

const require = createRequire(import.meta.url);
const nextConfig = require('../../next.config.js');

describe('public route authority', () => {
  it('keeps redirected legacy routes out of the XML sitemap', () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain('https://stratanoble.com/services');
    expect(urls).toContain('https://stratanoble.com/q-suite');
    expect(urls).toContain('https://stratanoble.com/achievery');

    expect(urls).not.toContain('https://stratanoble.com/solutions');
    expect(urls).not.toContain('https://stratanoble.com/platform');
    expect(urls).not.toContain('https://stratanoble.com/achievery-preview');
    expect(urls).not.toContain('https://stratanoble.com/achievery-early-access');
    expect(urls.some((url) => url.includes('/solutions/'))).toBe(false);
  });

  it('declares Next.js as the marketing path canonicalization authority', async () => {
    const redirects = await nextConfig.redirects();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/solutions',
          destination: '/services',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/solutions/:path*',
          destination: '/services',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/platform',
          destination: '/q-suite',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/platform/:path*',
          destination: '/q-suite',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/achievery-preview',
          destination: '/tools',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/achievery-early-access',
          destination: '/achievery',
          permanent: true,
        }),
      ]),
    );
  });
});
