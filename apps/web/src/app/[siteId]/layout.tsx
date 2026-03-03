import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { Suspense } from "react";

import { FooterServer, FooterSkeleton } from "@/components/footer";
import { CombinedJsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { PreviewBar } from "@/components/preview-bar";
import { getNavigationData } from "@/lib/navigation";
import { SanityLive } from "@workspace/sanity/live";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const nav = await getNavigationData(siteId);

  return (
    <>
      <Navbar navbarData={nav.navbarData} settingsData={nav.settingsData} />
      {children}
      <Suspense fallback={<FooterSkeleton />}>
        <FooterServer siteId={siteId} />
      </Suspense>
      <SanityLive />
      <CombinedJsonLd siteId={siteId} includeOrganization includeWebsite />
      {(await draftMode()).isEnabled && (
        <>
          <PreviewBar />
          <VisualEditing />
        </>
      )}
    </>
  );
}
