import { sanityFetch } from "@workspace/sanity/live";
import {
  queryArticleIndexPageArticles,
  queryArticleIndexPageArticlesCount,
  queryArticleIndexPageData,
} from "@workspace/sanity/query";
import { notFound } from "next/navigation";

import { BlogHeader } from "@/components/blog-card";
import { BlogPageContent } from "@/components/blog-page-content";
import { PageBuilderPreview as PageBuilder } from "@/components/pagebuilder.v2";
import { getSEOMetadata } from "@/lib/seo";
import {
  calculatePaginationMetadata,
  getBlogPaginationStartEnd,
  handleErrors,
} from "@/utils";

async function fetchArticleIndexPageData(siteId: string) {
  const res = await sanityFetch({ query: queryArticleIndexPageData, params: { siteId } });
  return res.data;
}

async function fetchArticleIndexPageBlogs(start: number, end: number, siteId: string) {
  const res = await sanityFetch({
    query: queryArticleIndexPageArticles,
    params: { start, end, siteId },
  });
  return res.data;
}

async function fetchArticleIndexPageArticlesCount(siteId: string) {
  const res = await sanityFetch({
    query: queryArticleIndexPageArticlesCount,
    params: { siteId }
  });
  return res.data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const { data: result } = await sanityFetch({
    query: queryArticleIndexPageData,
  });
  return getSEOMetadata(
    {
      title: result?.title ?? result?.seoTitle,
      description: result?.description ?? result?.seoDescription,
      slug: "/blog",
      contentId: result?._id,
      contentType: result?._type,
    },
    siteId,
  );
}

type BlogPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
  params: Promise<{ siteId: string }>;
};

export default async function BlogIndexPage({
  searchParams,
  params,
}: BlogPageProps) {
  const { page } = await searchParams;
  const { siteId } = await params;
  const currentPage = page ? Number(page) : 1;

  // Fetch page data and total count in parallel
  const [[indexPageData, errIndexPageData], [totalCount, errTotalCount]] =
    await Promise.all([
      handleErrors(fetchArticleIndexPageData(siteId)),
      handleErrors(fetchArticleIndexPageArticlesCount(siteId)),
    ]);

  if (errIndexPageData || !indexPageData) {
    notFound();
  }

  if (errTotalCount || totalCount === null || totalCount === undefined) {
    return (
      <main className="container mx-auto my-16 px-4 md:px-6">
        <BlogHeader
          description={indexPageData.description}
          title={indexPageData.title}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Unable to load blog posts at the moment.
          </p>
        </div>
        {indexPageData.pageBuilder && indexPageData.pageBuilder.length > 0 && (
          <PageBuilder
            siteId={siteId}
            id={indexPageData._id}
            pageBuilder={indexPageData.pageBuilder}
            type={indexPageData._type}
          />
        )}
      </main>
    );
  }

  const featuredBlogsCount = indexPageData.displayFeaturedArticles
    ? Number(indexPageData.featuredArticlesCount) || 0
    : 0;

  const paginationMetadata = calculatePaginationMetadata(
    totalCount,
    currentPage,
  );

  const { start, end } = getBlogPaginationStartEnd(currentPage);
  const blogStart = currentPage === 1 ? 0 : start + featuredBlogsCount;
  const blogEnd = end + featuredBlogsCount;

  const [blogs, errBlogs] = await handleErrors(
    fetchArticleIndexPageBlogs(blogStart, blogEnd, siteId),
  );

  if (errBlogs || !blogs) {
    return (
      <main className="container mx-auto my-16 px-4 md:px-6">
        <BlogHeader
          description={indexPageData.description}
          title={indexPageData.title}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No blog posts available at the moment.
          </p>
        </div>
        {indexPageData.pageBuilder && indexPageData.pageBuilder.length > 0 && (
          <PageBuilder
            siteId={siteId}
            id={indexPageData._id}
            pageBuilder={indexPageData.pageBuilder}
            type={indexPageData._type}
          />
        )}
      </main>
    );
  }

  return (
    <BlogPageContent
      blogs={blogs}
      indexPageData={indexPageData}
      paginationMetadata={paginationMetadata}
    />
  );
}
