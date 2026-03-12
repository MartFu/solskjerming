// // proxy.ts (middleware)
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export default function proxy(request: NextRequest) {
//   if (
//     request.nextUrl.pathname === "/" &&
//     !process.env.SITE_ID // not a static build context
//   ) {
//     console.log("Proxy intercepted path:", request.nextUrl.pathname);
//     console.log("SITE_ID value:", process.env.SITE_ID);

    
//     return NextResponse.redirect(
//       new URL(
//         `/${process.env.NEXT_PUBLIC_DEFAULT_SITE_ID ?? "terrassemarkise"}`,
//         request.url,
//       ),
//     );
//   }
// }

// export const config = {
//   matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

export default function proxy() {}