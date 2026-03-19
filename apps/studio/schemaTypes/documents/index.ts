import { author } from "@/schemaTypes/documents/author";
import { faq } from "@/schemaTypes/documents/faq";
import { footer } from "@/schemaTypes/documents/footer";
import { navbar } from "@/schemaTypes/documents/navbar";
import { redirect } from "@/schemaTypes/documents/redirect";
import { settings } from "@/schemaTypes/documents/settings";
import { site } from "@/schemaTypes/documents/site";
import { video } from "./video";
import { product } from "./product";
import { siteTheme } from "./css-tokens";
import { article } from "@/schemaTypes/documents/article";

// Getting replaced by new pattern
// import { page } from "@/schemaTypes/documents/page";
// import { articleIndex } from "@/schemaTypes/documents/article-index";
// import { homePage } from "@/schemaTypes/documents/home-page";

// New pattern
import {
  articlePage,
  articleRoot,
  catalogRoot,
  page,
  productPage,
} from "@/schemaTypes/documents/pages";

// Workspace-scoped globals
import { globalBranding } from "@/schemaTypes/documents/global/branding";
import { globalSeo } from "@/schemaTypes/documents/global/seo";
import { globalSocialMedia } from "@/schemaTypes/documents/global/social-media";
import { globalIntegrations } from "@/schemaTypes/documents/global/integrations";
import { globalOrganization } from "@/schemaTypes/documents/global/organization";
import { globalCookieConsent } from "@/schemaTypes/documents/global/cookie-consent";
import { globalPrivacyPolicy } from "@/schemaTypes/documents/global/privacy-policy";
import { globalTerms } from "@/schemaTypes/documents/global/terms";
import { globalTheme } from "@/schemaTypes/documents/global/theme";

export const globals = [
  globalTheme,
  globalBranding,
  globalSeo,
  globalSocialMedia,
  globalIntegrations,
  globalOrganization,
  globalCookieConsent,
  globalPrivacyPolicy,
  globalTerms,
];

export const singletons = [
  // homePage,
  // articleIndex,
  settings,
  footer,
  navbar,
  siteTheme,
  ...globals,
];

export const documents = [
  site,
  video,
  product,
  faq,
  author,
  redirect,

  page,
  articlePage,
  articleRoot,
  catalogRoot,
  productPage,

  article,
  // page,
  ...singletons,
];
