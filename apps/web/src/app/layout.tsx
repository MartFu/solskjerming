import "@workspace/ui/globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import { preconnect, prefetchDNS } from "react-dom";
import { Providers } from "@/components/providers";
import { getSiteId } from "@/lib/site";
import { draftMode } from "next/headers";
import { getNavigationData } from "@/lib/static/navigation";
import { Navbar } from "@/components/navbar";
import { Suspense } from "react";
import { FooterServer, FooterSkeleton } from "@/components/footer";
import { SanityLive } from "@workspace/sanity/live";
import { CombinedJsonLd } from "@/components/json-ld";
import { PreviewBar } from "@/components/preview-bar";
import { VisualEditing } from "next-sanity/visual-editing";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

// #TODO: Enrich site settings schema in studio
const getSiteConfig = async (siteId: string) => {
  const config = { lang: "en", locale: "no-nb" };
  return config;
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preconnect("https://cdn.sanity.io");
  prefetchDNS("https://cdn.sanity.io");
  const siteId = await getSiteId();
  const [{ lang }, nav, { isEnabled: draftModeEnabled }] = await Promise.all([
    getSiteConfig(siteId),
    getNavigationData(siteId),
    draftMode(),
  ]);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
    >
      <body
        // style={tokens as React.CSSProperties}
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>
          <Navbar
            siteId={siteId}
            navbarData={nav.navbarData}
            settingsData={nav.settingsData}
          />
          {children}
          <Suspense fallback={<FooterSkeleton />}>
            <FooterServer siteId={siteId} />
          </Suspense>
          <SanityLive />
          <CombinedJsonLd
            siteId={siteId}
            includeOrganization
            includeWebsite
          />
          {draftModeEnabled && (
            <>
              <PreviewBar />
              <VisualEditing />
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
