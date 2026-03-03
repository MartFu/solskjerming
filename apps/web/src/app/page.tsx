import { redirect } from "next/navigation";

const DEFAULT_SITE_ID = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID ?? "terrassemarkise";

export default function RootPage() {
  redirect(`/${DEFAULT_SITE_ID}`);
}