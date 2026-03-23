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
import { sanityFetch, SanityLive } from "@workspace/sanity/live";
import { CombinedJsonLd } from "@/components/json-ld";
import { PreviewBar } from "@/components/preview-bar";
import { VisualEditing } from "next-sanity/visual-editing";
import { querySiteConfig, querySiteMetadata } from "@workspace/sanity/query";
import { generateThemeOverrides } from "@/lib/generate-theme-overrides";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preconnect("https://cdn.sanity.io");
  prefetchDNS("https://cdn.sanity.io");
  const siteId = await getSiteId();
  const [configRes, metadataRes, nav, draftStatus] = await Promise.all([
    sanityFetch({
      query: querySiteConfig,
      params: { siteId },
    }),
    sanityFetch({
      query: querySiteMetadata,
      params: { siteId },
    }),
    getNavigationData(siteId),
    draftMode(),
  ]);

 const config = configRes.data;
 const metadata = metadataRes.data;
 const draftModeEnabled = draftStatus.isEnabled;

  const themeOverrides = config?.theme
    ? generateThemeOverrides(config.theme)
    : null;

  console.log(themeOverrides)

  return (
    <html
      lang={"no-NB"}
      suppressHydrationWarning
    >
      <head>
        {themeOverrides && (
          <style 
            id="theme-overrides"
            dangerouslySetInnerHTML={{ __html: themeOverrides }}
          />
        )}
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers siteConfig={config}>
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
            metadata={metadata}
            siteConfig={config}
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
