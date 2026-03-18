import { author } from "@/schemaTypes/documents/author";
import { faq } from "@/schemaTypes/documents/faq";
import { footer } from "@/schemaTypes/documents/footer";
import { navbar } from "@/schemaTypes/documents/navbar";
import { redirect } from "@/schemaTypes/documents/redirect";
import { settings } from "@/schemaTypes/documents/settings";
import { site } from "@/schemaTypes/documents/site";
import { video } from "./video";
import { product } from "./product";
import { siteTheme, themeDefaults } from "./css-tokens";
import { workspaceDefaults } from "./workspace-defaults";
import { article } from "@/schemaTypes/documents/article";

// Getting replaced by new pattern
// import { page } from "@/schemaTypes/documents/page";
// import { articleIndex } from "@/schemaTypes/documents/article-index";
// import { homePage } from "@/schemaTypes/documents/home-page"; 

// New pattern
import { page, articlePage, articleRoot, catalogRoot, productPage } from "@/schemaTypes/documents/pages"

export const singletons = [
  // homePage,
  // articleIndex,
  settings,
  footer,
  navbar,
  siteTheme,
  themeDefaults,
  workspaceDefaults
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
