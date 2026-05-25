import type { MetadataRoute } from "next";

const BASE_URL = "https://bloxtcgshop.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bloxtcgshop.com";
const LOCALES = ["ja", "en", "vi"] as const;

/**
 * Generate a dynamic sitemap for all public pages.
 * Next.js automatically serves this at /sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static pages ──────────────────────────────────────────────
  const staticPaths = [
    "", // homepage
    "/products",
    "/categories",
    "/events",
    "/news",
    "/rankings",
    "/login",
    "/register",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
      priority: path === "" ? 1.0 : 0.8,
    })),
  );

  // ── Dynamic pages (products, categories) ──────────────────────
  const dynamicEntries: MetadataRoute.Sitemap = [];

  try {
    const [productsRes, categoriesRes] = await Promise.allSettled([
      fetch(`${API_URL}/products?limit=1000`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } }),
    ]);

    // Product detail pages
    if (productsRes.status === "fulfilled" && productsRes.value.ok) {
      const data = await productsRes.value.json();
      const products: { slug: string; updatedAt?: string }[] =
        data.data?.items ?? data.data ?? data.items ?? [];

      for (const product of products) {
        for (const locale of LOCALES) {
          dynamicEntries.push({
            url: `${BASE_URL}/${locale}/products/${product.slug}`,
            lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }
    }

    // Category pages
    if (categoriesRes.status === "fulfilled" && categoriesRes.value.ok) {
      const data = await categoriesRes.value.json();
      const categories: { slug: string; updatedAt?: string }[] =
        data.data?.items ?? data.data ?? data.items ?? [];

      for (const category of categories) {
        for (const locale of LOCALES) {
          dynamicEntries.push({
            url: `${BASE_URL}/${locale}/categories/${category.slug}`,
            lastModified: category.updatedAt
              ? new Date(category.updatedAt)
              : now,
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      }
    }
  } catch {
    // If API is unavailable, return only static entries
    console.warn("[sitemap] Could not fetch dynamic data from API");
  }

  return [...staticEntries, ...dynamicEntries];
}
