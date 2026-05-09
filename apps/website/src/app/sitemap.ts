import type { MetadataRoute } from 'next';

const base = 'https://stratanoble.com';

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

/** Indexable public routes (omit noindex pages like /research). */
const paths: Array<{ path: string; changeFrequency: ChangeFrequency; priority: number }> = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/how-it-works', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/tools', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/tools/sample-receipt', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/q-suite', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/proof', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/systems-audit', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/operations-buildout', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/cookies', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/accessibility', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/achievery', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/sitemap', changeFrequency: 'monthly', priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return paths.map(({ path, changeFrequency, priority }) => ({
    url: path === '' ? base : `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
