import { Logger } from "@workspace/logger";
import { sanityFetch } from "@workspace/sanity/live";
import { queryPageBySlug } from "@workspace/sanity/query";
import { notFound } from "next/navigation";

import { RichText } from "@/components/elements/rich-text";
import { SanityImage } from "@/components/elements/sanity-image";
import { TableOfContent } from "@/components/elements/table-of-content";
import { ArticleJsonLd } from "@/components/json-ld";
import { getSEOMetadata } from "@/lib/seo";

const logger = new Logger("ArticleSlug");

async function fetchArticleSlugPageData(slug: string, siteId: string) {
  return await sanityFetch({
    query: queryPageBySlug,
    params: { slug, siteId },
  });
}

export async function generateStaticParams() {
  logger.info("Sandbox article pages use dynamic params only");
  return [];
}

// Allow dynamic params for paths not generated at build time
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; siteId: string }>;
}) {
  const { slug, siteId } = await params;
  const slugString = `/artikler/${slug}`;
  const { data } = await fetchArticleSlugPageData(slugString, siteId);
  return getSEOMetadata(
    {
      title: data?.seoTitle ?? data?.title ?? undefined,
      description: data?.seoDescription ?? data?.description ?? undefined,
      slug: slugString,
      contentId: data?._id,
      contentType: data?._type,
      pageType: "article",
    },
    siteId,
  );
}

export default async function ArticleSlugPage({
  params,
}: {
  params: Promise<{ slug: string; siteId: string }>;
}) {
  const { slug, siteId } = await params;
  const slugString = `/artikler/${slug}`;
  const { data } = await fetchArticleSlugPageData(slugString, siteId);
  if (!data) {
    return notFound();
  }
  const { title, description, coverImage, richText } = data;

  return (
    <div className="container mx-auto my-16 px-4 md:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <main>
          <ArticleJsonLd article={data} />
          <header className="mb-8">
            <h1 className="mt-2 font-bold text-4xl">{title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          </header>
          {coverImage && (
            <div className="mb-12">
              <SanityImage
                alt={title ?? ""}
                className="h-auto w-full rounded-lg"
                height={900}
                image={coverImage}
                loading="eager"
                width={1600}
              />
            </div>
          )}
          <RichText richText={richText} />
        </main>

        <div className="hidden lg:block">
          <div className="sticky top-4 rounded-lg">
            <TableOfContent richText={richText ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
