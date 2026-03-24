import type { BlockRegistry } from "./types.js";

export { resolveBlockComponent } from "./types.js";

export const blockRegistry: BlockRegistry = {
  hero: () => import("../themes/editorial/hero/index.js"),
  cta: () => import("../themes/editorial/cta/index.js"),
  richTextBlock: () => import("../themes/editorial/rich-text-block/index.js"),
  faqAccordion: () => import("../themes/editorial/faq-accordion/index.js"),
  featureCardsIcon: () =>
    import("../themes/editorial/feature-cards-icon/index.js"),
  imageLinkCards: () =>
    import("../themes/editorial/image-link-cards/index.js"),
  subscribeNewsletter: () =>
    import("../themes/editorial/subscribe-newsletter/index.js"),
  articleFeed: () => import("../themes/editorial/article-feed/index.js"),
  productGrid: () => import("../themes/editorial/product-grid/index.js"),
  testimonials: () => import("../themes/editorial/testimonials/index.js"),
  stats: () => import("../themes/editorial/stats/index.js"),
  logoCloud: () => import("../themes/editorial/logo-cloud/index.js"),
  pricingTable: () => import("../themes/editorial/pricing-table/index.js"),
  splitContent: () => import("../themes/editorial/split-content/index.js"),
  gallery: () => import("../themes/editorial/gallery/index.js"),
  videoEmbed: () => import("../themes/editorial/video-embed/index.js"),
  timeline: () => import("../themes/editorial/timeline/index.js"),
  teamGrid: () => import("../themes/editorial/team-grid/index.js"),
};
