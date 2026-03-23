export const DOCUMENT_NAMES = {
  // Site-scoped
  site: "site",
  redirect: "redirect",
  page: "page",
  articlePage: "articlePage",
  articleRoot: "articleRoot",
  catalogRoot: "catalogRoot",
  productPage: "productPage",
  footer: "footer",
  navbar: "navbar",

  // Shared assets
  documentation: "documentation",
  video: "video",
  product: "product",
  faq: "faq",
  author: "author",
  article: "article",

  // Globals
  globalTheme: "globalTheme",
  globalSeo: "globalSeo",
  globalIntegrations: "globalIntegrations",
  globalOrganization: "globalOrganization",
  globalCompliance: "globalCompliance",
  globalStructuredData: "globalStructuredData",
  globalRobots: "globalRobots",
} as const;

export type DocumentName = (typeof DOCUMENT_NAMES)[keyof typeof DOCUMENT_NAMES];