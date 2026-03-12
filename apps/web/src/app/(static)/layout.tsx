// (static)/layout.tsx

import type { Metadata } from "next";
import { FooterServer, FooterSkeleton } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { CombinedJsonLd } from "@/components/json-ld";
import { CSSProperties, Suspense } from "react";
import { getNavigationData } from "@/lib/static/navigation";

const siteId = process.env.SITE_ID!;

// #TODO: Ensure these geters are properly implemented and have CMS documents to query
const getSiteConfig = async (siteId: string) => {
    const config = {lang: "en", locale: "no-nb"};
    return config;
}
const getSiteTokens = (siteId: string) => {
  const tokens = {
    "--color-background": "",
    "--color-foreground": "",
    "--color-muted": "",
    "--color-muted-foreground": "",
    "--color-primary": "",
    "--color-primary-foreground": "",
    "--color-secondary": "",
    "--color-secondary-foreground": "",
    "--color-accent": "",
    "--color-accent-foreground": "",
    "--font-sans": "",
    "--font-mono": "",
  };

  return tokens as CSSProperties;
};

export async function generateMetadata(): Promise<Metadata> {
  // Language and other site-level metadata resolved from CMS at build time
  const config = await getSiteConfig(siteId);
  return {
    // Allows route group layout to declare lang without touching root layout
    other: { lang: config.locale },
  };
}

export default async function StaticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [nav, tokens] = await Promise.all([
    getNavigationData(siteId),
    getSiteTokens(siteId),
  ]);

  return (
    <div style={tokens} className="css-token-injector">
      <Navbar
        navbarData={nav.navbarData}
        settingsData={nav.settingsData}
        siteId={siteId}
      />
      {children}
      <Suspense fallback={<FooterSkeleton />}>
        <FooterServer siteId={siteId} />
      </Suspense>
      <CombinedJsonLd siteId={siteId} includeOrganization includeWebsite />
    </div>
  );
}
