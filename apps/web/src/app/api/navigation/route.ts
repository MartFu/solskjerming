import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

import { getNavigationData } from "@/lib/navigation";

export const revalidate = 360;

export async function GET(request: NextRequest) {
  const siteId = request.nextUrl.searchParams.get("siteId");

  console.log("SITEID", siteId)

  if (!siteId) {
    return NextResponse.json({ error: "siteId is required" }, { status: 400 });
  }

  const data = await getNavigationData(siteId);
  return NextResponse.json(data);
}
