export type BlockType =
  | "hero"
  | "cta"
  | "richTextBlock"
  | "faqAccordion"
  | "featureCardsIcon"
  | "imageLinkCards"
  | "subscribeNewsletter"
  | "articleFeed"
  | "productGrid"
  | "testimonials"
  | "stats"
  | "logoCloud"
  | "pricingTable"
  | "splitContent"
  | "gallery"
  | "videoEmbed"
  | "timeline"
  | "teamGrid";

export type BlockComponentModule = { default: React.ComponentType<any> };
export type BlockRegistry = Record<
  BlockType,
  () => Promise<BlockComponentModule>
>;

export async function resolveBlockComponent(
  registry: BlockRegistry,
  blockType: string,
): Promise<React.ComponentType<any> | null> {
  const loader = registry[blockType as BlockType];
  if (!loader) return null;
  return (await loader()).default;
}
