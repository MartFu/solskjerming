import { notFound } from "next/navigation";
import { client } from "@workspace/sanity/client";
import { getSiteId } from "@/lib/site";
import { getPageData } from "@/lib/pages";
import { getSEOMetadata } from "@/lib/seo";
import { queryAllPageSlugsForBuild } from "@workspace/sanity/query";
import { PageBuilder } from "@/components/pagebuilder";

export async function generateStaticParams() {
  const slugs = await client.fetch(queryAllPageSlugsForBuild);
  return slugs.map((s: { slug: string }) => ({
    slug: s.slug.split("/").filter(Boolean),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const [{ slug }, siteId] = await Promise.all([params, getSiteId()]);
  const slugString = slug?.length ? `/${slug.join("/")}` : "/";
  const pageData = await getPageData(slugString, siteId);


  return getSEOMetadata(
    {
      title: pageData?.seoTitle ?? pageData?.title ?? "Solskjerming AS",
      description:
        pageData?.seoDescription ??
        pageData?.description ??
        "Solskjerming AS er en norsk importør og nettforhandler.",
      slug: slugString,
      contentId: pageData?._id,
      contentType: pageData?._type,
    },
    siteId,
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const [{ slug }, siteId] = await Promise.all([params, getSiteId()]);
  const slugString = slug?.length ? `/${slug.join("/")}` : "/";
  const pageData = await getPageData(slugString, siteId);

  if (!pageData) return notFound();

  const { pageBuilder, _id, _type, title } = pageData;

  if (!Array.isArray(pageBuilder) || pageBuilder.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-4 font-semibold text-2xl capitalize">{title}</h1>
        <p className="text-muted-foreground">
          {/* #TODO: Add this message to the Global settings in sanity so it can be user defined. */}
          Denne siden har ikke noe innhold enda.
        </p>
      </div>
    );
  }

  return (
    <PageBuilder
      pageBuilder={pageBuilder}
      id={_id}
      type={_type}
      siteId={siteId}
    />
  );
}
