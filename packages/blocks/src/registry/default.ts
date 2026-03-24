import type { BlockRegistry } from "./types.js";

export { resolveBlockComponent } from "./types.js";

export const blockRegistry: BlockRegistry = {
  hero: () => import("../themes/default/hero/index.js"),
  cta: () => import("../themes/default/cta/index.js"),
  richTextBlock: () => import("../themes/default/rich-text-block/index.js"),
  faqAccordion: () => import("../themes/default/faq-accordion/index.js"),
  featureCardsIcon: () =>
    import("../themes/default/feature-cards-icon/index.js"),
  imageLinkCards: () => import("../themes/default/image-link-cards/index.js"),
  subscribeNewsletter: () =>
    import("../themes/default/subscribe-newsletter/index.js"),
  articleFeed: () => import("../themes/default/article-feed/index.js"),
  productGrid: () => import("../themes/default/product-grid/index.js"),
  testimonials: () => import("../themes/default/testimonials/index.js"),
  stats: () => import("../themes/default/stats/index.js"),
  logoCloud: () => import("../themes/default/logo-cloud/index.js"),
  pricingTable: () => import("../themes/default/pricing-table/index.js"),
  splitContent: () => import("../themes/default/split-content/index.js"),
  gallery: () => import("../themes/default/gallery/index.js"),
  videoEmbed: () => import("../themes/default/video-embed/index.js"),
  timeline: () => import("../themes/default/timeline/index.js"),
  teamGrid: () => import("../themes/default/team-grid/index.js"),
};
