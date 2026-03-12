import "@workspace/env/client";
import "@workspace/env/server";

import { env } from "@workspace/env/client";

import type { NextConfig } from "next";

const fetchSiteConfig = async (siteId?: string) => {
  if (!siteId) return;

  const routes = { shop: "shop", articles: "articles" };
  return { routes };
};

const isStaticBuild = !!process.env.SITE_ID;

// Wrap everything in an async IIFE so next.config.ts has no top-level await
const buildConfig = async (): Promise<NextConfig> => {
  const siteConfig = await fetchSiteConfig(process.env.SITE_ID);
  const routes = siteConfig?.routes ?? { shop: "shop", articles: "articles" };

  return {
    transpilePackages: ["@workspace/ui"],
    output: isStaticBuild ? "export" : undefined,
    reactCompiler: true,
    trailingSlash: true,
    distDir: isStaticBuild ? process.env.DIST_DIR : "out-preview",
    experimental: {
      inlineCss: true,
    },
    logging: {
      fetches: {},
    },
    images: {
      minimumCacheTTL: 31_536_000,
      remotePatterns: [
        {
          protocol: "https",
          hostname: "cdn.sanity.io",
          pathname: `/images/${env.NEXT_PUBLIC_SANITY_PROJECT_ID}/**`,
        },
      ],
    },
    async rewrites() {
      return [
        {
          source: `/:siteId/${routes.shop}/:path*`,
          destination: `/:siteId/shop/:path*`,
        },
        {
          source: `/:siteId/${routes.articles}/:path*`,
          destination: `/:siteId/articles/:path*`,
        },
      ];
    },
  };
};

export default buildConfig();
