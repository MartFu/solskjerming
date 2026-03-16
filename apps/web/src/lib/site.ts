import { headers } from "next/headers";

export async function getSiteId(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-site-id") ??
    process.env.NEXT_PUBLIC_DEFAULT_SITE_ID ??
    "terrassemarkise"
  );
}
