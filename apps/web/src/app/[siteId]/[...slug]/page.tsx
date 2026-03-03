import { sanityFetch } from "@workspace/sanity/live";
import { querySlugPageData } from "@workspace/sanity/query";
import { notFound } from "next/navigation";

import { PageBuilder } from "@/components/pagebuilder";
import { getSEOMetadata } from "@/lib/seo";

async function fetchSlugPageData(slug: string, siteId: string) {
  return await sanityFetch({
    query: querySlugPageData,
    params: { slug, siteId },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ siteId: string; slug: string[] }>;
}) {
  const { siteId, slug } = await params;
  const slugString = `/${slug.join("/")}`;
  const { data: pageData } = await fetchSlugPageData(slugString, siteId);

  console.log("---- frontend ----", siteId, slug)

  return getSEOMetadata({
    title: pageData?.title ?? pageData?.seoTitle,
    description: pageData?.description ?? pageData?.seoDescription,
    slug: slugString,
    contentId: pageData?._id,
    contentType: pageData?._type,
  });
}

// No generateStaticParams — this is a preview app, everything is dynamic
export const dynamic = "force-dynamic";

export default async function SlugPage({
  params,
}: {
  params: Promise<{ siteId: string; slug: string[] }>;
}) {
  const { siteId, slug } = await params;
  const slugString = `/${slug.join("/")}`;
  const { data: pageData } = await fetchSlugPageData(slugString, siteId);

  if (!pageData) {
    return notFound();
  }

  const { title, pageBuilder, _id, _type } = pageData;

  return !Array.isArray(pageBuilder) || pageBuilder.length === 0 ? (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 font-semibold text-2xl capitalize">{title}</h1>
      <p className="mb-6 text-muted-foreground">
        This page has no content blocks yet.
      </p>
    </div>
  ) : (
    <PageBuilder id={_id} pageBuilder={pageBuilder} type={_type} />
  );
}