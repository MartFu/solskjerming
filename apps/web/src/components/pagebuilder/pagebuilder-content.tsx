import type { PageBuilderBlock } from "@/types";
import { CTABlock } from "../sections/cta";
import { FaqAccordion } from "../sections/faq-accordion";
import { FeatureCardsWithIcon } from "../sections/feature-cards-with-icon";
import { HeroBlock } from "../sections/hero";
import { ImageLinkCards } from "../sections/image-link-cards";
import { RichTextBlock } from "../sections/rich-text-block";
import { SubscribeNewsletter } from "../sections/subscribe-newsletter";

// biome-ignore lint/suspicious/noExplicitAny: dynamic component rendering
export const BLOCK_COMPONENTS: Record<string, React.ComponentType<any>> = {
    cta: CTABlock as React.ComponentType,
    faqAccordion: FaqAccordion as React.ComponentType,
    hero: HeroBlock as React.ComponentType,
    featureCardsIcon: FeatureCardsWithIcon as React.ComponentType,
    subscribeNewsletter: SubscribeNewsletter as React.ComponentType,
    imageLinkCards: ImageLinkCards as React.ComponentType,
    richTextBlock: RichTextBlock as React.ComponentType,
    articleFeed: (props) => <div>{JSON.stringify(props)}</div>,
    productGrid: (props) => <div>{JSON.stringify(props)}</div>,
}


export type BlockWrapperFn = (
    block: PageBuilderBlock,
    children: React.ReactNode,
) => React.ReactNode;

export type PageBuilderContentProps = {
    readonly pageBuilder?: PageBuilderBlock[];
    readonly siteId: string;
    readonly blockWrapper?: BlockWrapperFn;
    readonly containerProps?: React.ComponentPropsWithoutRef<"main"> &
        Record<string, unknown>;
};

function UnknownBlockError({ blockType }: { blockType: string }) {
    return (
        <div
            aria-label={`Unknown block type: ${blockType}`}
            className="flex items-center justify-center rounded-lg border-2 border-muted-foreground/20 border-dashed bg-muted p-8 text-center text-muted-foreground"
            role="alert"
        >
            <div className="space-y-2">
                <p>Fant ikke komponenten for blokk:</p>
                <code className="rounded bg-background px-2 py-1 font-mono text-sm">
                    {blockType}
                </code>
            </div>
        </div>
    );
}

export function PageBuilderContent({
    pageBuilder: blocks = [],
    blockWrapper,
    containerProps,
}: PageBuilderContentProps) {
    if (!blocks.length) return null;

    return (
        <main
            className="mx-auto my-16 flex max-w-7xl flex-col gap-16"
            {...containerProps}
        >
            {blocks.map((block) => {
              const Component = BLOCK_COMPONENTS[block._type];

              if (!Component) {
                  return (
                      <UnknownBlockError
                          key={block._key}
                          blockType={block._type}
                      />
                  );
              }

              const content = blockWrapper ? (
                  blockWrapper(block, <Component {...block} />)
              ) : (
                  <Component {...block} />
              );

              return <div key={`${block._type}-${block._key}`}>{content}</div>;
            })}
        </main>
    );
}
