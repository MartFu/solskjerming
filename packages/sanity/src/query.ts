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

// ─── Shared Fragments ─────────────────────────────────────────────────────────

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

// For article pages where the body field is named "body" (not "richText")
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

const richTextContent = /* groq */ `
  []{
    ...,
    _type == "block" => { ..., ${markDefsFragment} },
    _type == "image" => { ${imageFields}, "caption": caption }
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
  internalRole,
  "slug":slug.current,
  orderRank,
  ${imageFragment},
  publishedAt,
  ${articleAuthorFragment}
`;

const productCardFragment = /* groq */ `
  _id,
  _type,
  title,
  internalRole,
  "slug": slug.current,
  "coverImage": coverImage { ${imageFields} },
  product->{
    _id,
    title,
    category,
    "images": images[]{ ${imageFields} }
  }
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

// ─── Pagebuilder Blocks ───────────────────────────────────────────────────────

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

// CHANGED: articleFeed now queries pages with internalRole == "article"
// instead of _type == "articlePage"
const articleFeedBlock = /* groq */ `
  _type == "articleFeed" => {
    ...,
    "articles": articles[]->{
      ${articleCardFragment}
    },
    "filteredArticles": *[
      _type == "page"
      && internalRole == "article"
      && site._ref == ^.^.site._ref
      && !(_id in path("drafts.**"))
    ] | order(publishedAt desc) [0...12] {
      ${articleCardFragment}
    }
  }
`;

const productGridBlock = /* groq */ `
  _type == "productGrid" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment}
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
    ${richTextBlockFragment},
    ${productGridBlock}
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
      internalRole,
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

// CHANGED: Single type filter replaces the multi-type union.
// Per-type field projections are now conditional on `internalRole`.
export const queryPageBySlug = defineQuery(`
  *[
    _type == "page"
    && site._ref == $siteId
    && slug.current == $slug
  ][0]{
    _id,
    _type,
    "slug": slug.current,
    title,
    description,
    internalRole,
    blueprintKey,
    seoTitle,
    seoDescription,
    seoNoIndex,
    ${pageBuilderFragment},
    "richText": coalesce(body${richTextContent}, richText${richTextContent}),

    // ── articleHub config (was articleRoot) ──────────────────
    internalRole == "articleHub" => {
      postsPerPage,
      "displayFeaturedArticles": displayFeaturedArticles == "yes",
      featuredArticlesCount,
      categories,
    },

    // ── catalog config (was catalogRoot) ────────────────────
    internalRole == "catalog" => {
      filterCategories,
    },

    // ── article fields (was articlePage) ────────────────────
    internalRole == "article" => {
      excerpt,
      publishedAt,
      category,
      ${articleAuthorFragment},
      "coverImage": coverImage { ${imageFields} },
      ${articleBodyFragment},
    },

    // ── productPage fields ─────────────────────────────────
    internalRole == "productPage" => {
      marketingCopy,
      product->{
        _id,
        title,
        "slug": slug.current,
        description,
        category,
        "images": images[]{ ${imageFields} },
        specifications[]{ label, value }
      },
    },
  }
`);

// CHANGED: All slug queries now use _type == "page"
export const queryAllPageSlugsForBuild = defineQuery(`
  *[
    _type == "page"
    && defined(slug.current)
  ]{
    "slug": slug.current
  }
`);

export const queryAllPageSlugs = defineQuery(`
  *[
    _type == "page"
    && site._ref == $siteId
    && defined(slug.current)
  ]{
    _type,
    internalRole,
    "slug": slug.current
  }
`);

export const queryAllRoutableDocumentSlugs = defineQuery(`
  *[
    _type == "page"
    && site._ref == $siteId
    && defined(slug.current)
  ]{
    _type,
    internalRole,
    "slug": slug.current
  }
`);

// ─── Article List ─────────────────────────────────────────────────────────────
// CHANGED: _type == "articlePage" → _type == "page" && internalRole == "article"

export const queryArticleListByParent = defineQuery(`
  *[
    _type == "page"
    && internalRole == "article"
    && site._ref == $siteId
    && parent._ref == $parentId
    && defined(slug.current)
  ] | order(publishedAt desc) [$start...$end] {
    ${articleCardFragment}
  }
`);

export const queryArticleCountByParent = defineQuery(`
  count(*[
    _type == "page"
    && internalRole == "article"
    && site._ref == $siteId
    && parent._ref == $parentId
  ])
`);

// ─── Product List ─────────────────────────────────────────────────────────────
// CHANGED: _type == "productPage" → _type == "page" && internalRole == "productPage"

export const queryProductListByParent = defineQuery(`
  *[
    _type == "page"
    && internalRole == "productPage"
    && site._ref == $siteId
    && parent._ref == $parentId
    && defined(slug.current)
    && ($category == "" || product->category == $category)
  ] | order(sortOrder asc) {
    ${productCardFragment}
  }
`);

// ─── Navigation & Layout ──────────────────────────────────────────────────────
// (unchanged — these query strict data types, not pages)

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

// ─── Site Config ──────────────────────────────────────────────────────────────
// (unchanged)

export const querySiteConfig = defineQuery(`
  *[_type == "site" && _id == $siteId][0]{
    _id,
    title,
    workspace,
    "homePage": homePage->slug.current,
    siteIdentity,
    "organization": organization {
       ..., 
       "logo": logo { ${imageFields} },
       "favicon": favicon { ${imageFields} }
    },
    socialLinks,
    "cookieBanner": cookieBanner {
       bannerTitle,
       bannerDescription,
       categories
    },
    "integrations": integrations {
       googleAnalyticsId,
       gtmContainerId,
       facebookPixelId
    },
    "theme": theme {
       dark,
       light
    },
    "legalDocuments": legalDocuments[]->{
      title,
      "slug": slug.current
    }
  }
`);

export const querySiteMetadata = defineQuery(`
  *[_type == "site" && _id == $siteId][0]{
    "title": metaTitle,
    "description": metaDescription,
    googleSiteVerification,
    bingSiteVerification,
    "logo": organization.logo { ${imageFields} },


    "og": {
      ogTitle,
      ogDescription,
      ogSiteName,
      "ogImage": ogImage { ${imageFields} }
    },
    robots,
    structuredData
  }
`);

// ─── Global Documents ─────────────────────────────────────────────────────────
// (unchanged)

export const queryGlobalSeo = defineQuery(`
  *[_type == "globalSeo"][0]{
    metaTitle,
    metaDescription,
    "ogImage": ogImage { ${imageFields} }
  }
`);

export const queryGlobalOrganization = defineQuery(`
  *[_type == "globalOrganization"][0]{ 
    name,
    email,
    phone,
    address,
    "logo": logo { ${imageFields} }
  }
`);

// ─── Sitemap ──────────────────────────────────────────────────────────────────
// CHANGED: Multi-type union → _type == "page"

export const querySitemapData = defineQuery(`{
  "pages": *[
    _type == "page"
    && site._ref == $siteId
    && defined(slug.current)
  ]{
    "slug": slug.current,
    "lastModified": _updatedAt,
    internalRole
  }
}`);

// ─── Redirects ────────────────────────────────────────────────────────────────
// (unchanged)

export const queryRedirects = defineQuery(`
  *[_type == "redirect" && site._ref == $siteId && status == "active" && defined(source.current) && defined(destination.current)]{
    "source": source.current,
    "destination": destination.current,
    "permanent": permanent == "true"
  }
`);
