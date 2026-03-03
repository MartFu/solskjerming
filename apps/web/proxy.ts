// apps/web/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { client } from "@workspace/sanity/client";
import { queryRedirects } from "@workspace/sanity/query";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Extract siteId from the path (e.g., /terrassemarkise/article)
  const segments = pathname.split("/").filter(Boolean);
  const siteId = segments[0];

  if (siteId) {
    try {
      // 2. Fetch redirects SPECIFIC to this siteId
      // This satisfies the $siteId param required by your query
      const redirects = await client.fetch(queryRedirects, { siteId });

      // 3. Check for a match
      // You may need to normalize the 'source' path depending on how
      // it is stored in Sanity (with or without the siteId prefix)
      const match = redirects.find((r: any) => r.source === pathname);

      if (match) {
        return NextResponse.redirect(new URL(match.destination, request.url), {
          status: match.permanent ? 301 : 302,
        });
      }
    } catch (error) {
      // Avoid crashing the proxy on fetch errors
      console.error("Proxy redirect fetch failed:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Use the matcher to avoid running this on static assets
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
