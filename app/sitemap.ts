import type { MetadataRoute } from "next";
import { TOOLS } from "./toolsData";

// Change this one line when the site moves to its own domain.
const BASE_URL = "https://www.mytoolzy.online";

// Pages that are not tools.
const PAGES = ["/", "/tools", "/about", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  // every tool in toolsData.ts is added automatically; a Set removes repeats
  const paths = Array.from(new Set([...PAGES, ...TOOLS.map((tool) => tool.href)]));

  return paths.map((path) => ({
    url: path === "/" ? BASE_URL : `${BASE_URL}${path}`,
  }));
}