import { defineQuery } from "next-sanity";

// ─── OG / SEO ─────────────────────────────────────────────────────────────────

const ogFieldsFragment = /* groq */ `
  _id,
  _type,
  "title": select(
    defined(ogTitle) => ogTitle,
    defined(seoTitle) => seoTitle,
    title
  ),
  "description": select(
    defined(ogDescription) => ogDescription,
    defined(seoDescription) => seoDescription,
    description
  ),
  "ogImage": ogImage.asset->url + "?w=1200&h=630&dpr=2&fit=max",
  "seoImage": seoImage.asset->url + "?w=1200&h=630&dpr=2&fit=max"
`;

const seoFragment = /* groq */ `
  seoTitle,
  seoDescription,
  seoNoIndex,
`;

export const queryGenericPageOGData = defineQuery(`
  *[defined(slug.current) && _id == $id][0]{
    ${ogFieldsFragment}
  }
`);

const imageFields = /* groq */ `
  "id": asset._ref,
  "preview": asset->metadata.lqip,
  "alt": coalesce(
    alt,
    asset->altText,
    caption,
    asset->originalFilename,
    "untitled"
  ),
  hotspot {
    x,
    y
  },
  crop {
    bottom,
    left,
    right,
    top
  }
`;

const imageFragment = /* groq */ `
  image {
    ${imageFields}
  }
`;

const customLinkFragment = /* groq */ `
  ...customLink{
    openInNewTab,
    "href": select(
      type == "internal" => internal->slug.current,
      type == "external" => external,
      "#"
    ),
  }
`;

const markDefsFragment = /* groq */ `
  markDefs[]{
    ...,
    ${customLinkFragment}
  }
`;

const richTextFragment = /* groq */ `
  richText[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}
    },
    _type == "image" => {
      ${imageFields},
      "caption": caption
    }
  }
`;

// For articlePage documents where the body field is named "body" (not "richText")
const articleBodyFragment = /* groq */ `
  "richText": body[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}
    },
    _type == "image" => {
      ${imageFields},
      "caption": caption
    }
  }
`;

const articleAuthorFragment = /* groq */ `
  authors[0]->{
    _id,
    name,
    position,
    ${imageFragment}
  }
`;

const articleCardFragment = /* groq */ `
  _type,
  _id,
  title,
  description,
  "slug":slug.current,
  orderRank,
  ${imageFragment},
  publishedAt,
  ${articleAuthorFragment}
`;

const buttonsFragment = /* groq */ `
  buttons[]{
    text,
    variant,
    _key,
    _type,
    "openInNewTab": url.openInNewTab,
    "href": select(
      url.type == "internal" => url.internal->slug.current,
      url.type == "external" => url.external,
      url.href
    ),
  }
`;

const ctaBlock = /* groq */ `
  _type == "cta" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
  }
`;

const imageLinkCardsBlock = /* groq */ `
  _type == "imageLinkCards" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
    "cards": array::compact(cards[]{
      ...,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => url.internal->slug.current,
        url.type == "external" => url.external,
        url.href
      ),
      ${imageFragment},
    })
  }
`;

const heroBlock = /* groq */ `
  _type == "hero" => {
    ...,
    ${imageFragment},
    ${buttonsFragment},
    ${richTextFragment}
  }
`;

const faqFragment = /* groq */ `
  "faqs": array::compact(faqs[]->{
    title,
    _id,
    _type,
    ${richTextFragment}
  })
`;

const faqAccordionBlock = /* groq */ `
  _type == "faqAccordion" => {
    ...,
    ${faqFragment},
    link{
      ...,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => url.internal->slug.current,
        url.type == "external" => url.external,
        url.href
      )
    }
  }
`;

const subscribeNewsletterBlock = /* groq */ `
  _type == "subscribeNewsletter" => {
    ...,
    "subTitle": subTitle[]{
      ...,
      ${markDefsFragment}
    },
    "helperText": helperText[]{
      ...,
      ${markDefsFragment}
    }
  }
`;

const featureCardsIconBlock = /* groq */ `
  _type == "featureCardsIcon" => {
    ...,
    ${richTextFragment},
    "cards": array::compact(cards[]{
      ...,
      ${richTextFragment},
    })
  }
`;

const richTextBlockFragment = /* groq */ `
  _type == "richTextBlock" => {
    ...,
    ${richTextFragment}
  }
`;


const articleFeedBlock = /* groq */ `
  _type == "articleFeed" => {
    ...,
    _type,
    _key,
    title,
    eyebrow,
    articleView,
    columns,
    showExcerpt,
    limit,
    // Expand the referenced articles if they are manually selected
    "articles": articles[]->{
      ${articleCardFragment}
    },
    // If you are fetching articles dynamically based on the 'articleView'
    "filteredArticles": *[_type == "articlePage" && !(_id in path("drafts.**"))] | order(publishedAt desc) [0...$limit] {
      ${articleCardFragment}
    }
  }
`;

const pageBuilderFragment = /* groq */ `
  pagebuilder[]{
    ...,
    _type,
    ${ctaBlock},
    ${articleFeedBlock},
    ${heroBlock},
    ${faqAccordionBlock},
    ${featureCardsIconBlock},
    ${subscribeNewsletterBlock},
    ${imageLinkCardsBlock},
    ${richTextBlockFragment}
  }
`;

export const queryImageType = defineQuery(`
  *[_type == "author" && defined(image)][0]{
    ${imageFragment}
  }.image
`);

// ─── Home Page ────────────────────────────────────────────────────────────────

export const queryHomePageData = defineQuery(`
  *[_type == "site" && _id == $siteId][0]
    .homePage->{
      _id,
      _type,
      "slug": slug.current,
      title,
      description,
      seoTitle,
      seoDescription,
      seoNoIndex,
      ${pageBuilderFragment}
    }
`);

// ─── Sites ────────────────────────────────────────────────────────────────────

export const querySiteDomains = defineQuery(`
  *[_type == "site" && !(_id in path("drafts.**"))] {
    _id,
    "slug": siteIdentity.slug.current,
    "domain": siteIdentity.domain
  }
`);

// ─── Pages ────────────────────────────────────────────────────────────────────
 
export const queryPageBySlug = defineQuery(`
  *[
    _type in ["page","articleRoot","articlePage","catalogRoot","productPage"]
    && site._ref == $siteId
    && slug.current == $slug
  ][0]{
    _id,
    _type,
    "slug": slug.current,
    title,
    description,
    seoTitle,
    seoDescription,
    seoNoIndex,
    ${pageBuilderFragment},
    "displayFeaturedArticles": displayFeaturedArticles == "yes",
    "featuredArticlesCount": featuredArticlesCount,
    excerpt,
    publishedAt,
    ${articleAuthorFragment},
    "coverImage": coverImage { ${imageFields} },
    ${articleBodyFragment},
    product->{
      _id,
      title,
      "slug": slug.current,
    },
    marketingCopy,
  }
`);

export const queryAllPageSlugsForBuild = defineQuery(`
  *[
    _type in ["page","articleRoot","articlePage","catalogRoot","productPage"]
    && defined(slug.current)
  ]{
    "slug": slug.current
  }
`);

export const queryAllPageSlugs = defineQuery(`
  *[
    _type in ["page","articleRoot","articlePage","catalogRoot","productPage"]
    && site._ref == $siteId
    && defined(slug.current)
  ]{
    _type,
    "slug": slug.current
  }
`);

// ─── Navigation & Layout ──────────────────────────────────────────────────────

export const queryFooterData = defineQuery(`
  *[_type == "footer" && site._ref == $siteId][0]{
    _id,
    subtitle,
    columns[]{
      _key,
      title,
      links[]{
        _key,
        name,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => url.internal->slug.current,
          url.type == "external" => url.external,
          url.href
        ),
      }
    }
  }
`);

export const queryNavbarData = defineQuery(`
  *[_type == "navbar" && site._ref == $siteId][0]{
    _id,
    columns[]{
      _key,
      _type == "navbarColumn" => {
        "type": "column",
        title,
        links[]{
          _key,
          name,
          icon,
          description,
          "openInNewTab": url.openInNewTab,
          "href": select(
            url.type == "internal" => url.internal->slug.current,
            url.type == "external" => url.external,
            url.href
          )
        }
      },
      _type == "navbarLink" => {
        "type": "link",
        name,
        description,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => url.internal->slug.current,
          url.type == "external" => url.external,
          url.href
        )
      }
    },
    ${buttonsFragment},
  }
`);

// ─── Site Config (replaces Settings) ──────────────────────────────────────────

export const querySiteConfig = defineQuery(`
  *[_type == "site" && _id == $siteId][0]{
    title,
    "logo": logo { ${imageFields} },
    "favicon": favicon { ${imageFields} },
    social,
    metaTitle,
    metaDescription,
    email,
    phone,
  }
`);

// ─── Sitemap ──────────────────────────────────────────────────────────────────

export const querySitemapData = defineQuery(`{
  "pages": *[
    _type in ["page","articleRoot","articlePage","catalogRoot","productPage"]
    && site._ref == $siteId
    && defined(slug.current)
  ]{
    "slug": slug.current,
    "lastModified": _updatedAt
  }
}`);

// ─── Redirects ────────────────────────────────────────────────────────────────

export const queryRedirects = defineQuery(`
  *[_type == "redirect" && site._ref == $siteId && status == "active" && defined(source.current) && defined(destination.current)]{
    "source": source.current,
    "destination": destination.current,
    "permanent": permanent == "true"
  }
`);
