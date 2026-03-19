import { articleFeed } from "@/schemaTypes/blocks/article-feed";
import { cta } from "@/schemaTypes/blocks/cta";
import { faqAccordion } from "@/schemaTypes/blocks/faq-accordion";
import { featureCardsIcon } from "@/schemaTypes/blocks/feature-cards-icon";
import { hero } from "@/schemaTypes/blocks/hero";
import { imageLinkCards } from "@/schemaTypes/blocks/image-link-cards";
import { productGrid } from "@/schemaTypes/blocks/product-grid";
import { richTextBlock } from "@/schemaTypes/blocks/rich-text";
import { subscribeNewsletter } from "@/schemaTypes/blocks/subscribe-newsletter";

export const pageBlocks = [
  hero,
  cta,
  featureCardsIcon,
  faqAccordion,
  imageLinkCards,
  richTextBlock,
  subscribeNewsletter,
];

export const articleRootBlocks = [
  hero,
  cta,
  faqAccordion,
  richTextBlock,
  subscribeNewsletter,
  articleFeed,
];

export const catalogRootBlocks = [
  hero,
  cta,
  featureCardsIcon,
  imageLinkCards,
  richTextBlock,
  productGrid,
];

// Full union for schema registration — Sanity needs every referenced type registered once
export const allPageBuilderBlocks = [
  hero,
  cta,
  featureCardsIcon,
  faqAccordion,
  imageLinkCards,
  richTextBlock,
  subscribeNewsletter,
  articleFeed,
  productGrid,
];
