// (static)/[[...slug]]/page.tsx

import { notFound, redirect } from "next/navigation";
import { getSEOMetadata } from "@/lib/seo";
import { getPageData } from "@/lib/static/pages";
import { getAllPageSlugs } from "@/lib/static/slugs";
import { PageBuilder } from "@/components/pagebuilder.v2";
import { SitePicker } from "@/components/site-picker";
import { getSitesList } from "@/lib/static/getSitesList";

const siteId = process.env.SITE_ID!;

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs(siteId);
  return slugs.map((slug) => ({ slug: slug.split("/").filter(Boolean) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const slugString = slug?.length ? `/${slug.join("/")}` : "/";
  const pageData = await getPageData(slugString, siteId);

  return getSEOMetadata({
    title: pageData?.seoTitle ?? pageData?.title ?? "Page Not Found",
    description:
      pageData?.seoDescription ?? pageData?.description ?? "Page Not Found",
    slug: slugString,
    contentId: pageData?._id,
    contentType: pageData?._type,
  }, siteId);
}

export default async function StaticSlugPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  // Handle root redirect when no SITE_ID (i.e. not a static build)
  if (!siteId) {
    const sites = await getSitesList()
    return <SitePicker sites={sites} />
  }

  const slugString = slug?.length ? `/${slug.join("/")}` : "/";
  const pageData = await getPageData(slugString, siteId);

  if (!pageData) return notFound();

  const { pageBuilder, _id, _type, title } = pageData;

  if (!Array.isArray(pageBuilder) || pageBuilder.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-4 font-semibold text-2xl capitalize">{title}</h1>
        <p className="text-muted-foreground">
          This page has no content blocks yet.
        </p>
      </div>
    );
  }

  return (
    <PageBuilder
      pageBuilder={pageBuilder}
      siteId={siteId}
    />
  );
}
