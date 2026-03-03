import { sanityFetch } from "@workspace/sanity/live";
import { queryHomePageData } from "@workspace/sanity/query";
import { notFound } from "next/navigation";

import { PageBuilder } from "@/components/pagebuilder";
import { getSEOMetadata } from "@/lib/seo";


async function fetchHomePageData(siteId: string) {
  const result = await sanityFetch({
    query: queryHomePageData,
    params: { siteId },
  });
  console.log("fetchHomePageData result:", JSON.stringify(result.data));
  return result;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const { data: pageData } = await fetchHomePageData(siteId);

  console.log("---- frontend ----", siteId)

  return getSEOMetadata({
    title: pageData?.title ?? pageData?.seoTitle,
    description: pageData?.description ?? pageData?.seoDescription,
    slug: "/",
    contentId: pageData?._id,
    contentType: pageData?._type,
  });
}

// No generateStaticParams — this is a preview app, everything is dynamic
export const dynamic = "force-dynamic";

export default async function SlugPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const { data: pageData } = await fetchHomePageData(siteId);

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