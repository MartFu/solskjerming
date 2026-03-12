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
  "image": image.asset->url + "?w=566&h=566&dpr=2&fit=max",
  "dominantColor": image.asset->metadata.palette.dominant.background,
  "seoImage": seoImage.asset->url + "?w=1200&h=630&dpr=2&fit=max",
  "logo": *[_type == "settings"][0].logo.asset->url + "?w=80&h=40&dpr=3&fit=max&q=100",
  "date": coalesce(date, _createdAt)
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

const pageBuilderFragment = /* groq */ `
  pageBuilder[]{
    ...,
    _type,
    ${ctaBlock},
    ${heroBlock},
    ${faqAccordionBlock},
    ${featureCardsIconBlock},
    ${subscribeNewsletterBlock},
    ${imageLinkCardsBlock},
    ${richTextBlockFragment}
  }
`;

export const queryImageType = defineQuery(`
  *[_type == "page" && defined(image)][0]{
    ${imageFragment}
  }.image
`);

// ─── Home Page ────────────────────────────────────────────────────────────────

export const queryHomePageData = defineQuery(`
  *[_type == "homePage" && siteId == $siteId][0]{
    ...,
    _id,
    _type,
    "slug": slug.current,
    title,
    description,
    ${pageBuilderFragment}
  }
`);

export const queryHomePageOGData = defineQuery(`
  *[_type == "homePage" && _id == $id][0]{
    ${ogFieldsFragment}
  }
`);

// ─── Sites ────────────────────────────────────────────────────────────────────

export const querySitesList = defineQuery(`*[_type == "site"] | order(title asc) {
  _id,
  title,
  "slug": id
}`);


// ─── Pages ────────────────────────────────────────────────────────────────────

export const querySlugPageData = defineQuery(`
  *[_type == "page" && siteId == $siteId && defined(slug.current) && slug.current == $slug][0]{
    _id,
    _type,
    "slug": slug.current,
    title,
    description,
    seoTitle,
    seoDescription,
    ${pageBuilderFragment}
  }
`);

export const querySlugPagePaths = defineQuery(`
  *[_type == "page" && defined(slug.current) && defined(siteId)]{
    "slug": slug.current,
    "siteId": siteId
  }
`);

export const querySlugPageOGData = defineQuery(`
  *[_type == "page" && _id == $id][0]{
    ${ogFieldsFragment}
  }
`);


export const queryAllPageSlugs = defineQuery(`
  *[_type in ["page", "homePage", "articleIndex", "article"] && siteId == $siteId && defined(slug.current)] {
    _type,
    "slug": slug.current,
    "isHomePage": _type == "homePage"
  }
`);


// ─── Articles (formerly blog) ─────────────────────────────────────────────────

export const queryArticleIndexPageData = defineQuery(`
  *[_type == "articleIndex" && siteId == $siteId][0]{
    ...,
    _id,
    _type,
    title,
    description,
    "displayFeaturedArticles": displayFeaturedArticles == "yes",
    "featuredArticlesCount": featuredArticlesCount,
    ${pageBuilderFragment},
    "slug": slug.current
  }
`);

export const queryArticleIndexPageArticles = defineQuery(`
  *[_type == "article" && siteId == $siteId && (seoHideFromLists != true)]
    | order(orderRank asc) [$start...$end]{
    ${articleCardFragment}
  }
`);

export const queryAllArticleDataForSearch = defineQuery(`
  *[_type == "article" && siteId == $siteId && defined(slug.current) && (seoHideFromLists != true)]{
    ${articleCardFragment}
  }
`);

export const queryArticleIndexPageArticlesCount = defineQuery(`
  count(*[_type == "article" && siteId == $siteId && (seoHideFromLists != true)])
`);

export const queryArticleSlugPageData = defineQuery(`
  *[_type == "article" && siteId == $siteId && slug.current == $slug][0]{
    ...,
    "slug": slug.current,
    ${articleAuthorFragment},
    ${imageFragment},
    ${richTextFragment},
    ${pageBuilderFragment}
  }
`);

export const queryArticlePaths = defineQuery(`
  *[_type == "article" && defined(slug.current) && defined(siteId)]{
    "slug": slug.current,
    "siteId": siteId
  }
`);

export const queryArticlePageOGData = defineQuery(`
  *[_type == "article" && _id == $id][0]{
    ${ogFieldsFragment}
  }
`);



// ─── Navigation & Layout ──────────────────────────────────────────────────────

export const queryFooterData = defineQuery(`
  *[_type == "footer" && siteId == $siteId][0]{
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
  *[_type == "navbar" && siteId == $siteId][0]{
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

// ─── Settings ─────────────────────────────────────────────────────────────────

export const queryGlobalSeoSettings = defineQuery(`
  *[_type == "settings" && siteId == $siteId][0]{
    _id,
    _type,
    siteTitle,
    logo {
      ${imageFields}
    },
    siteDescription,
    socialLinks{
      linkedin,
      facebook,
      twitter,
      instagram,
      youtube
    }
  }
`);

export const querySettingsData = defineQuery(`
  *[_type == "settings" && siteId == $siteId][0]{
    _id,
    _type,
    siteTitle,
    siteDescription,
    "logo": logo.asset->url + "?w=80&h=40&dpr=3&fit=max",
    "socialLinks": socialLinks,
    "contactEmail": contactEmail,
  }
`);

// ─── Sitemap ──────────────────────────────────────────────────────────────────

export const querySitemapData = defineQuery(`{
  "slugPages": *[_type == "page" && siteId == $siteId && defined(slug.current)]{
    "slug": slug.current,
    "lastModified": _updatedAt
  },
  "articlePages": *[_type == "article" && siteId == $siteId && defined(slug.current)]{
    "slug": slug.current,
    "lastModified": _updatedAt
  }
}`);

// ─── Redirects ────────────────────────────────────────────────────────────────

export const queryRedirects = defineQuery(`
  *[_type == "redirect" && siteId == $siteId && status == "active" && defined(source.current) && defined(destination.current)]{
    "source": source.current,
    "destination": destination.current,
    "permanent": permanent == "true"
  }
`);