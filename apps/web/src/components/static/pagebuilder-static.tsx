// components/pagebuilder-static.tsx
import type { PageBuilderBlock, PageBuilderBlockTypes } from "@/types";
import { CTABlock } from "../sections/cta";
import { FaqAccordion } from "../sections/faq-accordion";
import { FeatureCardsWithIcon } from "../sections/feature-cards-with-icon";
import { HeroBlock } from "../sections/hero";
import { ImageLinkCards } from "../sections/image-link-cards";
import { RichTextBlock } from "../sections/rich-text-block";
import { SubscribeNewsletter } from "../sections/subscribe-newsletter";

export type PageBuilderStaticProps = {
  readonly pageBuilder?: PageBuilderBlock[];
  readonly siteId: string;
};

const BLOCK_COMPONENTS = {
  cta: CTABlock,
  faqAccordion: FaqAccordion,
  hero: HeroBlock,
  featureCardsIcon: FeatureCardsWithIcon,
  subscribeNewsletter: SubscribeNewsletter,
  imageLinkCards: ImageLinkCards,
  richTextBlock: RichTextBlock,
} as const satisfies Record<PageBuilderBlockTypes, React.ComponentType<any>>;

function UnknownBlockError({ blockType }: { blockType: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border-2 border-muted-foreground/20 border-dashed bg-muted p-8 text-center text-muted-foreground">
      <div className="space-y-2">
        <p>Component not found for block type:</p>
        <code className="rounded bg-background px-2 py-1 font-mono text-sm">
          {blockType}
        </code>
      </div>
    </div>
  );
}

/**
 * Static PageBuilder - Server Component for build-time rendering
 * No Sanity visual editing, no optimistic updates, no client-side dependencies
 */
export function PageBuilderStatic({
  pageBuilder: blocks = [],
  siteId,
}: PageBuilderStaticProps) {
  if (!blocks.length) {
    return null;
  }

  return (
    <main className="mx-auto my-16 flex max-w-7xl flex-col gap-16">
      {blocks.map((block) => {
        const Component =
          BLOCK_COMPONENTS[block._type as keyof typeof BLOCK_COMPONENTS];

        if (!Component) {
          return <UnknownBlockError key={block._key} blockType={block._type} />;
        }

        return (
          <div key={`${block._type}-${block._key}`}>
            <Component {...(block as any)} siteId={siteId} />
          </div>
        );
      })}
    </main>
  );
}
