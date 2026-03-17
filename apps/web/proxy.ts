import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveSiteId } from "@/lib/site-resolver";
import { Logger } from "@workspace/logger";

const logger = new Logger("middleware");

export async function proxy(request: NextRequest) {
    const hostname = request.headers.get("host") ?? "";
    logger.info("MIDDLEWARE hostname:", hostname);
    const siteId = await resolveSiteId(hostname);
    logger.info("MIDDLEWARE siteId:", siteId);

    const requestHeaders = new Headers(request.headers);
    if (siteId) {
        requestHeaders.set("x-site-id", siteId);
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};