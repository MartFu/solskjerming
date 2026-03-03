import { Logger } from "@workspace/logger";
import { client } from "@workspace/sanity/client";
import { sanityFetch } from "@workspace/sanity/live";
import { queryArticlePaths, queryArticleSlugPageData } from "@workspace/sanity/query";
import { notFound } from "next/navigation";

import { RichText } from "@/components/elements/rich-text";
import { SanityImage } from "@/components/elements/sanity-image";
import { TableOfContent } from "@/components/elements/table-of-content";
import { ArticleJsonLd } from "@/components/json-ld";
import { getSEOMetadata } from "@/lib/seo";
import { QueryArticleSlugPageDataResult } from "@workspace/sanity/types";

const logger = new Logger("ArticleSlug");

async function fetchArticleSlugPageData(slug: string, siteId: string) {
  return await sanityFetch({
    query: queryArticleSlugPageData,
    params: { slug, siteId },
  });
}

interface ArticlePath {
  slug: string;
  siteId: string;
}

async function fetchArticlePaths(): Promise<ArticlePath[]> {
  try {
    // queryArticlePaths now returns Array<{ slug: string; siteId: string }>
    const data = await client.fetch<ArticlePath[]>(
      queryArticlePaths,
    );

    // If no data found, return empty array to prevent build errors
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Filter out any potential malformed entries and return the clean param objects
    return data
      .filter((item): item is ArticlePath =>
        Boolean(item?.slug && item?.siteId),
      )
      .map((item: { slug: string; siteId: string }) => ({
        siteId: item.siteId,
        slug: item.slug,
      }));
  } catch (error) {
    logger.error("Error fetching article paths", error);
    // Return empty array to allow build to continue
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; siteId: string}>;
}) {
  const { slug, siteId } = await params;
  const slugString = `/articles/${slug}`;
  const { data } = await fetchArticleSlugPageData(slugString, siteId);
  return getSEOMetadata({
    title: data?.title ?? data?.seoTitle,
    description: data?.description ?? data?.seoDescription,
    slug: slugString,
    contentId: data?._id,
    contentType: data?._type,
    pageType: "article",
  });
}

export async function generateStaticParams() {
  const paths = await fetchArticlePaths();
  return paths;
}

// Allow dynamic params for paths not generated at build time
export const dynamicParams = true;

export default async function ArticleSlugPage({
  params,
}: {
  params: Promise<{ slug: string; siteId: string; }>;
}) {
  const { slug, siteId } = await params;
  const slugString = `/articles/${slug}`;
  const { data } = await fetchArticleSlugPageData(slugString, siteId);
  if (!data) {
    return notFound();
  }
  const { title, description, image, richText } = data ?? {};

  return (
    <div className="container mx-auto my-16 px-4 md:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <main>
          <ArticleJsonLd article={data} />
          <header className="mb-8">
            <h1 className="mt-2 font-bold text-4xl">{title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          </header>
          {image && (
            <div className="mb-12">
              <SanityImage
                alt={title}
                className="h-auto w-full rounded-lg"
                height={900}
                image={image}
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
