export const DOCUMENTS = {
  // Site-scoped
  site: "site",
  redirect: "redirect",
  page: "page",
  footer: "footer",
  navbar: "navbar",

  // Shared assets
  documentAsset: "documentAsset",
  videoAsset: "videoAsset",
  productAsset: "productAsset",
  faqAsset: "faqAsset",
  authorAsset: "authorAsset",
  articleAsset: "articleAsset",
  categoryAsset: "categoryAsset",

  // Globals
  globalTheme: "globalTheme",
  globalSeo: "globalSeo",
  globalIntegrations: "globalIntegrations",
  globalOrganization: "globalOrganization",
  globalCompliance: "globalCompliance",
  globalStructuredData: "globalStructuredData",
  globalRobots: "globalRobots",

  // Studio settings
  studioSettings: "studioSettings"
} as const;

export type DocumentName = (typeof DOCUMENTS)[keyof typeof DOCUMENTS];