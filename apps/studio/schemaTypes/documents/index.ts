// Site config
import { site } from "@/schemaTypes/documents/site";
import { redirect } from "@/schemaTypes/documents/redirect";

// Site-scoped, routable documents
import {
  articlePage,
  articleRoot,
  catalogRoot,
  page,
  productPage,
} from "@/schemaTypes/documents/pages";

// Site-scoped, non-routable documents
import { footer } from "@/schemaTypes/documents/footer";
import { navbar } from "@/schemaTypes/documents/navbar";

// Workspace-scoped shared assets
import { documentation } from "@/schemaTypes/documents/shared-assets/documentation";
import { video } from "./shared-assets/video";
import { product } from "./shared-assets/product";
import { article } from "@/schemaTypes/documents/shared-assets/article";
import { author } from "@/schemaTypes/documents/shared-assets/author";
import { faq } from "@/schemaTypes/documents/shared-assets/faq";

// Workspace-scoped globals
import { globalSeo } from "@/schemaTypes/documents/global-settings/seo";
import { globalIntegrations } from "@/schemaTypes/documents/global-settings/integrations";
import { globalOrganization } from "@/schemaTypes/documents/global-settings/organization";
import { globalCookieConsent } from "@/schemaTypes/documents/global-settings/cookie-consent";
import { globalPrivacyPolicy } from "@/schemaTypes/documents/global-settings/privacy-policy";
import { globalTerms } from "@/schemaTypes/documents/global-settings/terms";
import { globalTheme } from "@/schemaTypes/documents/global-settings/theme";


export const globals = [
  globalTheme,
  globalSeo,
  globalIntegrations,
  globalOrganization,
  globalCookieConsent,
  globalPrivacyPolicy,
  globalTerms,
];

export const singletons = [
  footer,
  navbar,
  ...globals,
];

export const documents = [
  site,
  redirect, 
  
  page,
  articlePage,
  articleRoot,
  catalogRoot,
  productPage,
  
  documentation,
  video,
  product,
  faq,
  author,
  article,
  ...singletons,
];
