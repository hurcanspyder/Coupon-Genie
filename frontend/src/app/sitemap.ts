import { MetadataRoute } from 'next';

const BASE_URL = 'https://coupongenie.dev';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  let storeRoutes: MetadataRoute.Sitemap = [];

  try {
    // Attempt to fetch stores to include store paths dynamically
    const res = await fetch('http://localhost:5000/api/stores');
    const data = await res.json();
    
    if (data && data.stores) {
      storeRoutes = data.stores.map((store: any) => ({
        url: `${BASE_URL}/store/${store.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.warn('Sitemap generation: API is offline. Generating static sitemap only.', error);
  }

  return [...staticRoutes, ...storeRoutes];
}
