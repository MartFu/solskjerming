import { author } from "@/schemaTypes/documents/author";
import { article } from "@/schemaTypes/documents/article";
import { articleIndex } from "@/schemaTypes/documents/article-index";
import { faq } from "@/schemaTypes/documents/faq";
import { footer } from "@/schemaTypes/documents/footer";
import { homePage } from "@/schemaTypes/documents/home-page";
import { navbar } from "@/schemaTypes/documents/navbar";
import { page } from "@/schemaTypes/documents/page";
import { redirect } from "@/schemaTypes/documents/redirect";
import { settings } from "@/schemaTypes/documents/settings";
import { site } from "@/schemaTypes/documents/site";
import { video } from "./video";
import { product } from "./product";
import { siteTheme, themeDefaults } from "./css-tokens";
import { workspaceDefaults } from "./workspace-defaults";

export const singletons = [
  homePage,
  articleIndex,
  settings,
  footer,
  navbar,
  siteTheme,
  themeDefaults,
  workspaceDefaults
];

export const documents = [site, article, video, product, page, faq, author, ...singletons, redirect];
