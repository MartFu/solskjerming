import { client } from "@workspace/sanity/client";
import { querySitemapData } from "@workspace/sanity/query";
import type { QuerySitemapDataResult } from "@workspace/sanity/types";
import type { MetadataRoute } from "next";

import { getBaseUrl } from "@/utils";

type Page = QuerySitemapDataResult["slugPages"][number];

const baseUrl = getBaseUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteId = process.env.SITE_ID;
  const { slugPages, articlePages } = await client.fetch(querySitemapData, {
    siteId: siteId ?? ""
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    // ...slugPages.map((page: Page) => ({
    //   url: `${baseUrl}${page.slug}`,
    //   lastModified: new Date(page.lastModified ?? new Date()),
    //   changeFrequency: "weekly" as const,
    //   priority: 0.8,
    // })),
    // ...articlePages.map((page: Page) => ({
    //   url: `${baseUrl}${page.slug}`,
    //   lastModified: new Date(page.lastModified ?? new Date()),
    //   changeFrequency: "weekly" as const,
    //   priority: 0.5,
    // })),
  ];
}
