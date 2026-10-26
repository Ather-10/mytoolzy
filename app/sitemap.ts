
import type { MetadataRoute } from "next";

const BASE_URL = "https://mytoolzy.vercel.app";

// Add your real, public static routes here.
// Do not add private pages, redirects, or noindex pages.
const STATIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
];

export const revalidate = 3600; // Refresh sitemap cache hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route === "/" ? "" : route}`,
  }));
}
