import { getIdFromString } from "@sanity/asset-utils";
import { urlFor } from "@workspace/sanity/client";
import type {
  // QueryBlogSlugPageDataResult,
  QuerySiteConfigResult,
  QuerySiteMetadataResult,
} from "@workspace/sanity/types";
import { stegaClean } from "next-sanity";
import type {
  Answer,
  Article,
  ContactPoint,
  Event,
  FAQPage,
  HowTo,
  HowToStep,
  ImageObject,
  LocalBusiness,
  Offer,
  Organization,
  Person,
  PostalAddress,
  Product,
  Question,
  SearchAction,
  VideoObject,
  WebPage,
  WebSite,
  WithContext,
} from "schema-dts";

import { getBaseUrl } from "@/utils";

// ─── Rich Text Helpers ────────────────────────────────────────────────────────

type RichTextChild = {
  _type: string;
  text?: string;
  marks?: string[];
  _key: string;
};

type RichTextBlock = {
  _type: string;
  children?: RichTextChild[];
  style?: string;
  _key: string;
};

function extractPlainText(
  richText: RichTextBlock[] | null | undefined,
): string {
  if (!Array.isArray(richText)) return "";

  return richText
    .filter((block) => block._type === "block" && Array.isArray(block.children))
    .map(
      (block) =>
        block.children
          ?.filter((child) => child._type === "span" && Boolean(child.text))
          .map((child) => child.text)
          .join("") ?? "",
    )
    .join(" ")
    .trim();
}

// ─── Image Helpers ────────────────────────────────────────────────────────────

const IMAGE_WIDTH = 1920;
const IMAGE_HEIGHT = 1080;
const IMAGE_QUALITY = 80;

/**
 * Resolve any image-like source to a transformed CDN URL.
 * Accepts the shapes we encounter across queries:
 *  - `{ id: "image-abc-200x200-jpg" }`   (from imageFields projection)
 *  - `{ _ref: "image-abc-200x200-jpg" }` (raw asset reference)
 *  - `{ asset: { _ref: "..." } }`        (image object with nested ref)
 *  - a plain ID / URL / path string
 */
function resolveImageUrl(
  source?:
    | { id?: string | null }
    | { _ref?: string | null }
    | { asset?: { _ref?: string | null } | null }
    | string
    | null,
): string | undefined {
  if (!source) return undefined;

  let raw: string | null | undefined;

  if (typeof source === "string") {
    raw = source;
  } else if ("id" in source) {
    raw = source.id;
  } else if ("_ref" in source) {
    raw = source._ref;
  } else if ("asset" in source) {
    raw = source.asset?._ref;
  }

  if (!raw) return undefined;

  try {
    // Normalise ID/URL/path → canonical asset ID
    const assetId = getIdFromString(raw);
    return urlFor({ _id: assetId })
      .size(IMAGE_WIDTH, IMAGE_HEIGHT)
      .dpr(2)
      .auto("format")
      .quality(IMAGE_QUALITY)
      .url();
  } catch {
    return undefined;
  }
}

function imageObject(url: string): ImageObject {
  return { "@type": "ImageObject", url };
}

// ─── JSON-LD Script Renderer ──────────────────────────────────────────────────

export function JsonLdScript<T>({ data, id }: { data: T; id: string }) {
  return (
    <script
      id={id}
      key={id}
      type="application/ld+json"
    >
      {JSON.stringify(data, null, 0)}
    </script>
  );
}

// ─── Shared Helpers ───────────────────────────────────────────────────────────

/** Merge structuredData.sameAs with siteConfig.socials, deduplicated */
function collectSocialLinks(
  sameAs?: string[],
  socials?: NonNullable<QuerySiteConfigResult>["socials"],
): string[] | undefined {
  const links = [
    ...(sameAs ?? []),
    ...(socials
      ? Object.values(socials).filter((v): v is string => Boolean(v))
      : []),
  ];
  const unique = [...new Set(links)];
  return unique.length ? unique : undefined;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SITE-LEVEL JSON-LD
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Organization ─────────────────────────────────────────────────────────────
// Primary: structuredData.organization (from querySiteMetadata)
// Fallback: siteConfig.organization name/email/phone, siteConfig.socials

type OrganizationJsonLdProps = {
  metadata: QuerySiteMetadataResult;
  siteConfig?: QuerySiteConfigResult;
};

export function OrganizationJsonLd({
  metadata,
  siteConfig,
}: OrganizationJsonLdProps) {
  if (!metadata) return null;

  const sd = metadata.structuredData?.organization;
  const org = siteConfig?.organization;
  const baseUrl = getBaseUrl();

  const name = sd?.name ?? org?.name ?? siteConfig?.title;
  if (!name) return null;

  const logoUrl = resolveImageUrl(sd?.logo) ?? resolveImageUrl(org?.logo);

  const contactPoint = sd?.contactPoint ?? {
    email: org?.email,
    telephone: org?.phone,
    contactType: "customer service" as const,
  };

  // structuredData.organization.address uses schema.org field names directly
  const address = sd?.address;

  const data: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    legalName: sd?.legalName ?? undefined,
    description: sd?.description ?? undefined,
    url: sd?.url ?? baseUrl,
    foundingDate: sd?.foundingDate ?? undefined,
    logo: logoUrl ? imageObject(logoUrl) : undefined,
    contactPoint:
      contactPoint?.email || contactPoint?.telephone
        ? ({
            "@type": "ContactPoint",
            email: contactPoint.email ?? undefined,
            telephone: contactPoint.telephone ?? undefined,
            contactType: contactPoint.contactType ?? "customer service",
          } as ContactPoint)
        : undefined,
    address: address
      ? ({
          "@type": "PostalAddress",
          streetAddress: address.streetAddress,
          postalCode: address.postalCode,
          addressLocality: address.addressLocality,
          addressRegion: address.addressRegion,
          addressCountry: address.addressCountry,
        } as PostalAddress)
      : undefined,
    sameAs: collectSocialLinks(sd?.sameAs, siteConfig?.socials),
  };

  return (
    <JsonLdScript
      data={data}
      id="organization-json-ld"
    />
  );
}

// ─── WebSite ──────────────────────────────────────────────────────────────────

type WebSiteJsonLdProps = {
  metadata: QuerySiteMetadataResult;
  siteConfig?: QuerySiteConfigResult;
};

export function WebSiteJsonLd({ metadata, siteConfig }: WebSiteJsonLdProps) {
  if (!metadata) return null;

  const sd = metadata.structuredData?.website;
  const baseUrl = getBaseUrl();
  const siteName =
    sd?.name ?? siteConfig?.organization?.name ?? siteConfig?.title;
  if (!siteName) return null;

  const data: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    alternateName: sd?.alternateName ?? undefined,
    url: baseUrl,
    publisher: {
      "@type": "Organization",
      name: siteName,
    } as Organization,
    ...(sd?.searchUrlTemplate
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: sd.searchUrlTemplate,
            "query-input": "required name=search_term_string",
          } as SearchAction,
        }
      : {}),
  };

  return (
    <JsonLdScript
      data={data}
      id="website-json-ld"
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE-LEVEL JSON-LD — from per-page structuredData fields
// ═══════════════════════════════════════════════════════════════════════════════

// Mirrors the shape produced by createStructuredDataFields({ isPage: true })
type PageStructuredData = {
  enabled?: boolean;
  type?: string;
  article?: {
    headline?: string;
    datePublished?: string;
    dateModified?: string;
    authorName?: string;
    authorUrl?: string;
    publisherName?: string;
  };
  product?: {
    name?: string;
    description?: string;
    sku?: string;
    brand?: string;
    price?: number;
    priceCurrency?: string;
    availability?: string;
    additionalProperties?: Array<{ name?: string; value?: string }>;
    ratingValue?: number;
    reviewCount?: number;
  };
  faq?: Array<{ question?: string; answer?: string }>;
  event?: {
    name?: string;
    startDate?: string;
    endDate?: string;
    locationName?: string;
    locationAddress?: string;
    eventAttendanceMode?: string;
    eventStatus?: string;
    organizerName?: string;
    offerPrice?: number;
    offerCurrency?: string;
    offerUrl?: string;
  };
  localBusiness?: {
    name?: string;
    description?: string;
    telephone?: string;
    email?: string;
    streetAddress?: string;
    postalCode?: string;
    addressLocality?: string;
    addressCountry?: string;
    geo?: { latitude?: number; longitude?: number };
    priceRange?: string;
    openingHours?: string[];
  };
  video?: {
    name?: string;
    description?: string;
    uploadDate?: string;
    duration?: string;
    contentUrl?: string;
    embedUrl?: string;
    thumbnailUrl?: string;
  };
  howTo?: {
    name?: string;
    description?: string;
    totalTime?: string;
    steps?: Array<{ name?: string; text?: string }>;
  };
  customJsonLd?: string;
};

export { type PageStructuredData };

// ─── Page-level dispatcher ────────────────────────────────────────────────────

type PageJsonLdProps = {
  structuredData?: PageStructuredData | null;
  pageUrl?: string;
  publisherName?: string;
};

export function PageJsonLd({
  structuredData: sd,
  pageUrl,
  publisherName,
}: PageJsonLdProps) {
  if (!sd?.enabled || !sd.type) return null;

  const clean = stegaClean(sd);

  switch (clean.type) {
    case "Article":
    case "BlogPosting":
    case "NewsArticle":
      return renderArticle(clean, pageUrl, publisherName);
    case "Product":
      return renderProduct(clean);
    case "FAQPage":
      return renderPageFaq(clean);
    case "Event":{
      console.warn("Event JSON-LD not yet supported.")
      // return renderEvent(clean);
      return null;
    }
    case "LocalBusiness":
      return renderLocalBusiness(clean);
    case "VideoObject":
      return renderVideo(clean);
    case "HowTo":
      return renderHowTo(clean);
    case "Custom":
      return renderCustom(clean);
    default:
      return null;
  }
}

// ─── Individual page-level renderers ──────────────────────────────────────────

function renderArticle(
  sd: PageStructuredData,
  pageUrl?: string,
  publisherName?: string,
) {
  const a = sd.article;
  if (!a?.headline) return null;

  const data: WithContext<Article> = {
    "@context": "https://schema.org",
    "@type":
      (sd.type as "Article" | "BlogPosting" | "NewsArticle") ?? "Article",
    headline: a.headline,
    datePublished: a.datePublished ?? undefined,
    dateModified: a.dateModified ?? undefined,
    author: a.authorName
      ? ({
          "@type": "Person",
          name: a.authorName,
          url: a.authorUrl ?? undefined,
        } as Person)
      : undefined,
    publisher: {
      "@type": "Organization",
      name: a.publisherName ?? publisherName ?? undefined,
    } as Organization,
    mainEntityOfPage: pageUrl
      ? ({ "@type": "WebPage", "@id": pageUrl } as WebPage)
      : undefined,
  };

  return (
    <JsonLdScript
      data={data}
      id="page-article-json-ld"
    />
  );
}

function renderProduct(sd: PageStructuredData) {
  const p = sd.product;
  if (!p?.name) return null;

  const data: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? undefined,
    sku: p.sku ?? undefined,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    offers:
      p.price != null
        ? ({
            "@type": "Offer",
            price: p.price,
            priceCurrency: p.priceCurrency ?? "NOK",
            availability: p.availability ?? undefined,
          } as Offer)
        : undefined,
    additionalProperty: p.additionalProperties
      ?.filter((prop) => prop.name && prop.value)
      .map((prop) => ({
        "@type": "PropertyValue" as const,
        name: prop.name!,
        value: prop.value!,
      })),
    aggregateRating:
      p.ratingValue != null && p.reviewCount != null
        ? {
            "@type": "AggregateRating" as const,
            ratingValue: p.ratingValue,
            reviewCount: p.reviewCount,
          }
        : undefined,
  };

  return (
    <JsonLdScript
      data={data}
      id="page-product-json-ld"
    />
  );
}

function renderPageFaq(sd: PageStructuredData) {
  const faqs = sd.faq?.filter((f) => f.question && f.answer);
  if (!faqs?.length) return null;

  const data: WithContext<FAQPage> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(
      (faq): Question => ({
        "@type": "Question",
        name: faq.question!,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer!,
        } as Answer,
      }),
    ),
  };

  return (
    <JsonLdScript
      data={data}
      id="page-faq-json-ld"
    />
  );
}

// function renderEvent(sd: PageStructuredData) {
//   const e = sd.event;
//   if (!e?.name) return null;

//   const data: WithContext<Event> = {
//     "@context": "https://schema.org",
//     "@type": "Event",
//     name: e.name,
//     startDate: e.startDate ?? undefined,
//     endDate: e.endDate ?? undefined,
//     eventAttendanceMode: e.eventAttendanceMode ?? undefined,
//     eventStatus: e.eventStatus ?? undefined,
//     location:
//       e.locationName || e.locationAddress
//         ? {
//             "@type": "Place" as const,
//             name: e.locationName ?? undefined,
//             address: e.locationAddress ?? undefined,
//           }
//         : undefined,
//     organizer: e.organizerName
//       ? ({
//           "@type": "Organization",
//           name: e.organizerName,
//         } as Organization)
//       : undefined,
//     offers:
//       e.offerPrice != null
//         ? ({
//             "@type": "Offer",
//             price: e.offerPrice,
//             priceCurrency: e.offerCurrency ?? "NOK",
//             url: e.offerUrl ?? undefined,
//           } as Offer)
//         : undefined,
//   };

//   return (
//     <JsonLdScript
//       data={data}
//       id="page-event-json-ld"
//     />
//   );
// }

function renderLocalBusiness(sd: PageStructuredData) {
  const lb = sd.localBusiness;
  if (!lb?.name) return null;

  const hasAddress = lb.streetAddress || lb.postalCode || lb.addressLocality;

  const data: WithContext<LocalBusiness> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: lb.name,
    description: lb.description ?? undefined,
    telephone: lb.telephone ?? undefined,
    email: lb.email ?? undefined,
    address: hasAddress
      ? ({
          "@type": "PostalAddress",
          streetAddress: lb.streetAddress ?? undefined,
          postalCode: lb.postalCode ?? undefined,
          addressLocality: lb.addressLocality ?? undefined,
          addressCountry: lb.addressCountry ?? undefined,
        } as PostalAddress)
      : undefined,
    geo:
      lb.geo?.latitude != null && lb.geo?.longitude != null
        ? {
            "@type": "GeoCoordinates" as const,
            latitude: lb.geo.latitude,
            longitude: lb.geo.longitude,
          }
        : undefined,
    priceRange: lb.priceRange ?? undefined,
    openingHoursSpecification: lb.openingHours?.length
      ? lb.openingHours.map((hours) => ({
          "@type": "OpeningHoursSpecification" as const,
          description: hours,
        }))
      : undefined,
  };

  return (
    <JsonLdScript
      data={data}
      id="page-local-business-json-ld"
    />
  );
}

function renderVideo(sd: PageStructuredData) {
  const v = sd.video;
  if (!v?.name) return null;

  const data: WithContext<VideoObject> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.name,
    description: v.description ?? undefined,
    uploadDate: v.uploadDate ?? undefined,
    duration: v.duration ?? undefined,
    contentUrl: v.contentUrl ?? undefined,
    embedUrl: v.embedUrl ?? undefined,
    thumbnailUrl: v.thumbnailUrl ?? undefined,
  };

  return (
    <JsonLdScript
      data={data}
      id="page-video-json-ld"
    />
  );
}

function renderHowTo(sd: PageStructuredData) {
  const h = sd.howTo;
  if (!h?.name) return null;

  const steps = h.steps?.filter((s) => s.name || s.text);

  const data: WithContext<HowTo> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: h.name,
    description: h.description ?? undefined,
    totalTime: h.totalTime ?? undefined,
    step: steps?.length
      ? steps.map(
          (s): HowToStep => ({
            "@type": "HowToStep",
            name: s.name ?? undefined,
            text: s.text ?? undefined,
          }),
        )
      : undefined,
  };

  return (
    <JsonLdScript
      data={data}
      id="page-howto-json-ld"
    />
  );
}

function renderCustom(sd: PageStructuredData) {
  if (!sd.customJsonLd) return null;

  try {
    const parsed = JSON.parse(sd.customJsonLd);
    if (!parsed["@type"]) return null;
    const data = { "@context": "https://schema.org", ...parsed };
    return (
      <JsonLdScript
        data={data}
        id="page-custom-json-ld"
      />
    );
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOG ARTICLE JSON-LD — from QueryBlogSlugPageDataResult
// ═══════════════════════════════════════════════════════════════════════════════

// type BlogArticleJsonLdProps = {
//   article: QueryBlogSlugPageDataResult;
//   siteConfig?: QuerySiteConfigResult;
// };

// export function BlogArticleJsonLd({
//   article: rawArticle,
//   siteConfig,
// }: BlogArticleJsonLdProps) {
//   if (!rawArticle) return null;

//   const article = stegaClean(rawArticle);
//   const baseUrl = getBaseUrl();
//   const articleUrl = `${baseUrl}${article.slug}`;
//   const articleImageUrl = resolveImageUrl(article.image);
//   const logoUrl = resolveImageUrl(siteConfig?.organization?.logo);

//   const data: WithContext<Article> = {
//     "@context": "https://schema.org",
//     "@type": "Article",
//     headline: article.title,
//     description: article.description || undefined,
//     image: articleImageUrl ? [articleImageUrl] : undefined,
//     author: article.authors
//       ? [
//           {
//             "@type": "Person",
//             name: article.authors.name,
//             url: baseUrl,
//             image: article.authors.image
//               ? imageObject(resolveImageUrl(article.authors.image)!)
//               : undefined,
//           } as Person,
//         ]
//       : [],
//     publisher: {
//       "@type": "Organization",
//       name: siteConfig?.organization?.name ?? siteConfig?.title ?? "Website",
//       logo: logoUrl ? imageObject(logoUrl) : undefined,
//     } as Organization,
//     datePublished: new Date(
//       article.publishedAt || article._createdAt || new Date().toISOString(),
//     ).toISOString(),
//     dateModified: new Date(
//       article._updatedAt || new Date().toISOString(),
//     ).toISOString(),
//     url: articleUrl,
//     mainEntityOfPage: {
//       "@type": "WebPage",
//       "@id": articleUrl,
//     } as WebPage,
//   };

//   return (
//     <JsonLdScript
//       data={data}
//       id={`blog-article-json-ld-${article.slug}`}
//     />
//   );
// }

// ═══════════════════════════════════════════════════════════════════════════════
// FAQ JSON-LD — from rich text blocks (e.g. FAQ sections with portable text)
// ═══════════════════════════════════════════════════════════════════════════════

type FlexibleFaq = {
  _id: string;
  title: string;
  richText?: RichTextBlock[] | null;
};

export function FaqJsonLd({ faqs }: { faqs: FlexibleFaq[] }) {
  if (!faqs?.length) return null;

  const validFaqs = stegaClean(
    faqs.filter((faq) => faq?.title && faq?.richText),
  );
  if (!validFaqs.length) return null;

  const data: WithContext<FAQPage> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validFaqs.map(
      (faq): Question => ({
        "@type": "Question",
        name: faq.title,
        acceptedAnswer: {
          "@type": "Answer",
          text: extractPlainText(faq.richText),
        } as Answer,
      }),
    ),
  };

  return (
    <JsonLdScript
      data={data}
      id="faq-json-ld"
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED JSON-LD — pure component, no data fetching
// ═══════════════════════════════════════════════════════════════════════════════

type CombinedJsonLdProps = {
  metadata: QuerySiteMetadataResult;
  siteConfig?: QuerySiteConfigResult;
  // article?: QueryBlogSlugPageDataResult;
  faqs?: FlexibleFaq[];
  pageStructuredData?: PageStructuredData | null;
  pageUrl?: string;
  includeWebsite?: boolean;
  includeOrganization?: boolean;
};

export function CombinedJsonLd({
  metadata,
  siteConfig,
  // article,
  faqs,
  pageStructuredData,
  pageUrl,
  includeWebsite = false,
  includeOrganization = false,
}: CombinedJsonLdProps) {
  if (!metadata) return null;

  const publisherName =
    siteConfig?.organization?.name ?? siteConfig?.title ?? undefined;

  return (
    <>
      {includeWebsite && (
        <WebSiteJsonLd
          metadata={metadata}
          siteConfig={siteConfig}
        />
      )}
      {includeOrganization && (
        <OrganizationJsonLd
          metadata={metadata}
          siteConfig={siteConfig}
        />
      )}
      {/* {article && (
        <BlogArticleJsonLd
          article={article}
          siteConfig={siteConfig}
        />
      )} */}
      {faqs?.length ? <FaqJsonLd faqs={faqs} /> : null}
      {pageStructuredData && (
        <PageJsonLd
          structuredData={pageStructuredData}
          pageUrl={pageUrl}
          publisherName={publisherName}
        />
      )}
    </>
  );
}
