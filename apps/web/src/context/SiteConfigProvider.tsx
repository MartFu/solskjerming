import { QuerySiteConfigResult } from "@workspace/sanity/types";
import { createContext, useContext, ReactNode } from "react";

const SiteConfigContext = createContext<QuerySiteConfigResult | null>(null);

interface SiteConfigProviderProps {
  config: QuerySiteConfigResult;
  children: ReactNode;
}

export function SiteConfigProvider({
  config,
  children,
}: SiteConfigProviderProps) {
  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export const useSiteConfig = (): NonNullable<QuerySiteConfigResult> => {
  const context = useContext(SiteConfigContext);

  if (!context) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider");
  }

  return context as NonNullable<QuerySiteConfigResult>;
};
