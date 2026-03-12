// (preview)/[siteId]/[[...slug]]/page.tsx

import { notFound } from "next/navigation";
import { getSEOMetadata } from "@/lib/seo";
import { getPageData } from "@/lib/pages";
import { PageBuilderPreview as PageBuilder } from "@/components/pagebuilder.v2";



export async function generateMetadata({
  params,
}: {
  params: Promise<{ siteId: string; slug?: string[] }>;
}) {
  const { siteId, slug } = await params;
  const slugString = slug?.length ? `/${slug.join("/")}` : "/";
  const pageData = await getPageData(slugString, siteId);

  return getSEOMetadata({
    title: pageData?.title ?? pageData?.seoTitle,
    description: pageData?.description ?? pageData?.seoDescription,
    slug: slugString,
    contentId: pageData?._id,
    contentType: pageData?._type,
  }, siteId);
}

// No generateStaticParams — this is a preview app, everything is dynamic
export const dynamic = "force-dynamic";

export default async function SlugPage({
  params,
}: {
  params: Promise<{ siteId: string; slug?: string[] }>;
}) {
  const { siteId, slug } = await params;
  const slugString = slug?.length ? `/${slug.join("/")}` : "/";
  const pageData = await getPageData(slugString, siteId);

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
    <PageBuilder id={_id} pageBuilder={pageBuilder} type={_type} siteId={siteId} />
  );
}
