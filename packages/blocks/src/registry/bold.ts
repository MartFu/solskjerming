import type { BlockRegistry } from "./types.js";

export { resolveBlockComponent } from "./types.js";

export const blockRegistry: BlockRegistry = {
  hero: () => import("../themes/bold/hero/index.js"),
  cta: () => import("../themes/bold/cta/index.js"),
  richTextBlock: () => import("../themes/bold/rich-text-block/index.js"),
  faqAccordion: () => import("../themes/bold/faq-accordion/index.js"),
  featureCardsIcon: () =>
    import("../themes/bold/feature-cards-icon/index.js"),
  imageLinkCards: () => import("../themes/bold/image-link-cards/index.js"),
  subscribeNewsletter: () =>
    import("../themes/bold/subscribe-newsletter/index.js"),
  articleFeed: () => import("../themes/bold/article-feed/index.js"),
  productGrid: () => import("../themes/bold/product-grid/index.js"),
  testimonials: () => import("../themes/bold/testimonials/index.js"),
  stats: () => import("../themes/bold/stats/index.js"),
  logoCloud: () => import("../themes/bold/logo-cloud/index.js"),
  pricingTable: () => import("../themes/bold/pricing-table/index.js"),
  splitContent: () => import("../themes/bold/split-content/index.js"),
  gallery: () => import("../themes/bold/gallery/index.js"),
  videoEmbed: () => import("../themes/bold/video-embed/index.js"),
  timeline: () => import("../themes/bold/timeline/index.js"),
  teamGrid: () => import("../themes/bold/team-grid/index.js"),
};
