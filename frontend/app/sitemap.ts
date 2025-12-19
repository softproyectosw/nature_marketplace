import type { MetadataRoute } from 'next';

/**
 * Dynamic Sitemap Generator
 * 
 * Generates sitemap.xml for SEO optimization.
 * Lists all public pages that should be indexed by search engines.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://naturemarketplace.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/welcome`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // TODO: Fetch products from API and generate dynamic URLs
  // const products = await getProducts();
  // const productUrls = products.map((product) => ({
  //   url: `${BASE_URL}/products/${product.category}/${product.slug}`,
  //   lastModified: new Date(product.updatedAt),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.8,
  // }));

  // Mock product URLs for now
  const productUrls: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/products/trees/andean-oak-tree`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/products/trees/ceiba-tree`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/products/retreats/mountain-wellness-retreat`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/products/retreats/forest-bathing-experience`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  return [...staticPages, ...productUrls];
}
