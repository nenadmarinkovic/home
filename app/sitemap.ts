import type { MetadataRoute } from "next";

import { getArticles } from "./writing/articles";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/writing",
    "/contact",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
  }));

  const articleRoutes: MetadataRoute.Sitemap = getArticles().map((a) => ({
    url: `${site.url}/writing/${a.slug}`,
    lastModified: new Date(a.date),
  }));

  return [...staticRoutes, ...articleRoutes];
}
