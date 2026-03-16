import type { PageBuilderBlock, PageBuilderBlockTypes } from "@/types";
import { CTABlock } from "../sections/cta";
import { FaqAccordion } from "../sections/faq-accordion";
import { FeatureCardsWithIcon } from "../sections/feature-cards-with-icon";
import { HeroBlock } from "../sections/hero";
import { ImageLinkCards } from "../sections/image-link-cards";
import { RichTextBlock } from "../sections/rich-text-block";
import { SubscribeNewsletter } from "../sections/subscribe-newsletter";

// biome-ignore lint/suspicious/noExplicitAny: dynamic component rendering
export const BLOCK_COMPONENTS = {
  cta: CTABlock,
  faqAccordion: FaqAccordion,
  hero: HeroBlock,
  featureCardsIcon: FeatureCardsWithIcon,
  subscribeNewsletter: SubscribeNewsletter,
  imageLinkCards: ImageLinkCards,
  richTextBlock: RichTextBlock,
} as const satisfies Record<PageBuilderBlockTypes, React.ComponentType<any>>;

export type BlockWrapperFn = (
  block: PageBuilderBlock,
  children: React.ReactNode,
) => React.ReactNode;

export type PageBuilderProps = {
  readonly pageBuilder?: PageBuilderBlock[];
  readonly siteId: string;
  /** Optional wrapper injected per-block. Preview mode uses this to attach data-sanity attributes. */
  readonly blockWrapper?: BlockWrapperFn;
  /** Optional wrapper for the container <main>. Preview mode uses this to attach the container data-sanity attribute. */
  readonly containerProps?: React.ComponentPropsWithoutRef<"main"> & Record<string, unknown>;
};

function UnknownBlockError({ blockType }: { blockType: string }) {
  return (
    <div
      aria-label={`Unknown block type: ${blockType}`}
      className="flex items-center justify-center rounded-lg border-2 border-muted-foreground/20 border-dashed bg-muted p-8 text-center text-muted-foreground"
      role="alert"
    >
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
 * PageBuilder — canonical renderer for both static and preview modes.
 *
 * This is a pure server component with no Sanity visual editing dependencies.
 * Preview mode enhancements (optimistic updates, data-sanity attributes) are
 * injected via the `blockWrapper` and `containerProps` props by PageBuilderPreview.
 */
export function PageBuilder({
  pageBuilder: blocks = [],
  siteId,
  blockWrapper,
  containerProps,
}: PageBuilderProps) {
  if (!blocks.length) {
    return null;
  }

  return (
    <main
      className="mx-auto my-16 flex max-w-7xl flex-col gap-16"
      {...containerProps}
    >
      {blocks.map((block) => {
        // biome-ignore lint/suspicious/noExplicitAny: dynamic component rendering
        const Component =
          BLOCK_COMPONENTS[block._type as keyof typeof BLOCK_COMPONENTS];

        const content = Component ? (
          // biome-ignore lint/suspicious/noExplicitAny: dynamic component rendering
          <Component {...(block as any)} siteId={siteId} />
        ) : (
          <UnknownBlockError blockType={block._type} />
        );

        const wrapped = blockWrapper ? blockWrapper(block, content) : content;

        return <div key={`${block._type}-${block._key}`}>{wrapped}</div>;
      })}
    </main>
  );
}
