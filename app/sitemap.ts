import { MetadataRoute } from 'next';
import { getPublicCollections, getPublicProducts } from '@/lib/queries/storefront';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kawishmooi.com';

  const [collections, products] = await Promise.all([
    getPublicCollections(),
    getPublicProducts(),
  ]);

  const collectionUrls: MetadataRoute.Sitemap = collections.map((col) => ({
    url: `${baseUrl}/collections/${col.slug}`,
    lastModified: new Date(col.updatedAt),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const productUrls: MetadataRoute.Sitemap = products.map((prod) => ({
    url: `${baseUrl}/products/${prod.slug}`,
    lastModified: new Date(prod.updatedAt),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...collectionUrls,
    ...productUrls,
  ];
}
