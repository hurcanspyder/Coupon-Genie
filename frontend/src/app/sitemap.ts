import { MetadataRoute } from 'next';

// Use the actual deployed frontend URL or fall back to the Vercel URL
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://coupon-genie-bice.vercel.app';

// Use the deployed backend API URL (set in Vercel environment variables)
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api';

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
    // Fetch stores from the deployed backend during build time
    const res = await fetch(`${API_URL}/stores`, {
      next: { revalidate: 3600 }, // Re-fetch every hour
    });

    if (!res.ok) throw new Error(`API responded with status ${res.status}`);

    const data = await res.json();

    if (data && data.stores) {
      storeRoutes = data.stores.map((store: any) => ({
        url: `${BASE_URL}/store/${store.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    // Graceful fallback — build still succeeds with static routes only
    console.warn('Sitemap: Could not reach backend API. Using static routes only.', error);
  }

  return [...staticRoutes, ...storeRoutes];
}
