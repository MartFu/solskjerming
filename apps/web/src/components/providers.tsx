"use client";

import { SiteConfigProvider } from "@/context/SiteConfigProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuerySiteConfigResult } from "@workspace/sanity/types";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState, type PropsWithChildren } from "react";


interface Props {
  siteConfig: QuerySiteConfigResult;
}

export function Providers({ siteConfig, children }: PropsWithChildren<Props>) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <SiteConfigProvider config={siteConfig}>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableColorScheme
          enableSystem
        >
          {children}
        </NextThemesProvider>
      </QueryClientProvider>
    </SiteConfigProvider>
  );
}
