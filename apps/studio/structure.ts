import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import {
  BookMarked,
  BookOpen,
  Brush,
  CogIcon,
  File,
  FileCodeCorner,
  FileText,
  Globe,
  Handbag,
  HomeIcon,
  type LucideIcon,
  MessageCircle,
  Package,
  PanelBottom,
  PanelBottomIcon,
  PlayCircle,
  Rocket,
  Settings2,
  TrendingUpDown,
  User,
} from "lucide-react";
import type {
  DefaultDocumentNodeResolver,
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";
import { Iframe } from "sanity-plugin-iframe-pane";

import { createSlugBasedStructure } from "@/components/nested-pages-structure";
import type { SchemaType, SingletonType } from "@/schemaTypes/index";
import { getTitleCase } from "@/utils/helper";
import { DeploymentDashboard } from "./components/deployment-dashboard";
import { API_VERSION } from "./utils/constant";

const PREVIEW_ORIGIN =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ?? "http://localhost:3000";

// ─────────────────────────────────────────────────────────────
// Preview URL resolution
// ─────────────────────────────────────────────────────────────

const previewPathResolvers: Record<
  string,
  (doc: Record<string, any>) => string | null
> = {
  homePage: (doc) => (doc?.siteId ? `/${doc.siteId}` : null),
  articleIndex: (doc) => (doc?.siteId ? `/${doc.siteId}/artikler` : null),
  page: (doc) =>
    doc?.siteId && doc?.slug?.current
      ? `/${doc.siteId}/${doc.slug.current}`
      : null,
  article: (doc) =>
    doc?.siteId && doc?.slug?.current
      ? `/${doc.siteId}/artikler/${doc.slug.current}`
      : null,
  product: (doc) =>
    doc?.siteId && doc?.slug?.current
      ? `/${doc.siteId}/produkter/${doc.slug.current}`
      : null,
  video: (doc) =>
    doc?.siteId && doc?.slug?.current
      ? `/${doc.siteId}/videoer/${doc.slug.current}`
      : null,
};

const PREVIEWABLE_TYPES = new Set(Object.keys(previewPathResolvers));

// ─────────────────────────────────────────────────────────────
// Default document node
// ─────────────────────────────────────────────────────────────

export const defaultDocumentNode: DefaultDocumentNodeResolver = (
  S,
  { schemaType },
) => {
  if (!PREVIEWABLE_TYPES.has(schemaType)) {
    return S.document().views([S.view.form()]);
  }

  return S.document().views([
    S.view.form(),
    S.view
      .component(Iframe)
      .options({
        url: (doc: Record<string, any>) => {
          const path = previewPathResolvers[schemaType]?.(doc);
          return path ? `${PREVIEW_ORIGIN}${path}` : PREVIEW_ORIGIN;
        },
        reload: { button: true },
        showDisplayUrl: true,
      })
      .title("Forhåndsvisning"),
  ]);
};

// ─────────────────────────────────────────────────────────────
// Structure helpers
// ─────────────────────────────────────────────────────────────

type Base<T = SchemaType> = {
  id?: string;
  type: T;
  preview?: boolean;
  title?: string;
  icon?: LucideIcon;
};

type CreateSingleTon = {
  S: StructureBuilder;
} & Base<SingletonType>;

const createSingleTon = ({
  S,
  type,
  title,
  icon,
  siteId,
  workspace,
}: CreateSingleTon & { siteId?: string; workspace?: string }) => {
  const docId = siteId ? `${siteId}-${type}` : `${workspace}-${type}`;

  return S.listItem()
    .title(title ?? getTitleCase(type))
    .id(docId)
    .icon(icon ?? File)
    .child(
      S.document()
        .schemaType(type)
        .documentId(docId)
        .initialValueTemplate(`${type}-with-site`, { siteId })
        .views([
          S.view.form(),
          S.view
            .component(Iframe)
            .options({
              url: (doc: Record<string, any>) => {
                const path = previewPathResolvers[type]?.({ ...doc, siteId });
                return path ? `${PREVIEW_ORIGIN}${path}` : PREVIEW_ORIGIN;
              },
              reload: { button: true },
              showDisplayUrl: true,
            })
            .title("Forhåndsvisning"),
        ]),
    );
};

type CreateList = {
  S: StructureBuilder;
} & Base;

const createList = ({
  S,
  type,
  icon,
  title,
  siteId,
}: CreateList & { siteId: string }) => {
  return S.listItem()
    .title(title ?? getTitleCase(type))
    .id(`${siteId}-${type}-list`)
    .icon(icon ?? File)
    .child(
      S.documentList()
        .title(title ?? getTitleCase(type))
        .filter("_type == $type && siteId == $siteId")
        .params({ type, siteId })
        .defaultOrdering([{ field: "title", direction: "asc" }])
        .initialValueTemplates([
          S.initialValueTemplateItem(`${type}-with-site`, { siteId }),
        ]),
    );
};

// ─────────────────────────────────────────────────────────────
// Returns the flat list of items for a given site.
// Used both for inlining into the top-level pane and for
// building a wrapped S.list() when needed.
// ─────────────────────────────────────────────────────────────

const buildSiteItems = (
  S: StructureBuilder,
  site: { _id: string; title: string; id: string },
  context: StructureResolverContext,
) => [
  createSingleTon({
    S,
    type: "homePage",
    title: "Forside",
    icon: HomeIcon,
    siteId: site._id,
  }),
  createSingleTon({
    S,
    type: "articleIndex",
    title: "Artikkelarkiv",
    icon: BookOpen,
    siteId: site._id,
  }),
  createList({
    S,
    type: "page",
    title: "Andre sider",
    icon: FileCodeCorner,
    siteId: site._id,
  }),
  S.divider(),
  createList({
    S,
    type: "article",
    title: "Artikler",
    icon: FileText,
    siteId: site._id,
  }),
  createList({
    S,
    type: "video",
    title: "Videor",
    icon: PlayCircle,
    siteId: site._id,
  }),
  createList({
    S,
    type: "faq",
    title: "FAQs",
    icon: MessageCircle,
    siteId: site._id,
  }),
  createList({
    S,
    type: "product",
    title: "Produkter",
    icon: Handbag,
    siteId: site._id,
  }),
  S.divider(),
  createSingleTon({
    S,
    id: `${site._id}-navbar`,
    type: "navbar",
    title: "Header",
    icon: PanelBottom,
    siteId: site._id,
  }),
  createSingleTon({
    S,
    id: `${site._id}-footer`,
    type: "footer",
    title: "Footer",
    icon: PanelBottom,
    siteId: site._id,
  }),
  // Title divider — acts as a visual section header for this site
  S.listItem()
    .title(`Sideinnstillinger`)
    .id(`${site.
      _id
    }-settings`)
    .icon(Globe)
    .child(
      // Clicking the title opens the site document itself for editing
      S.document().schemaType("site").documentId(site._id).title(site.title),
    ),
];

// ─────────────────────────────────────────────────────────────
// Main Structure Export
// ─────────────────────────────────────────────────────────────

export const structure = async (
  S: StructureBuilder,
  context: StructureResolverContext,
  workspace: string,
) => {
  const client = context.getClient({ apiVersion: API_VERSION });

  const sites = await client.fetch<
    { _id: string; title: string; id: string }[]
  >(
    `*[_type == "site" && workspace == $workspace] | order(title asc) {
      _id, title, id
    }`,
    { workspace },
  );

  const activeSite = sites[0];

  const siteItems = buildSiteItems(S, activeSite, context);

  // For each site: a non-navigable title divider followed by its items inline.
  // const siteItems = sites.flatMap((site, i) => [
  //   // All site content items rendered directly in this pane
  //   ...buildSiteItems(S, site, context),

  //   // Divider between sites (skip after last)
  //   ...(i < sites.length - 1 ? [S.divider()] : []),
  // ]);

  return S.list()
    .title(`${getTitleCase(workspace)} > ${sites[0].title}`)
    .items([
      ...siteItems,

      S.divider(),
      S.listItem()
        .title("Distribusjonssenter")
        .id("deployment-center")
        .icon(Rocket)
        .child(
          S.component().component(DeploymentDashboard).title("Site Status"),
        ),

      S.listItem()
        .title("Globale ressurser")
        .id("global-resources")
        .icon(Package)
        .child(S.list().title("Globale ressurser").items([])),

      S.listItem()
        .title("Globale innstillinger")
        .id("global-settings")
        .icon(CogIcon)
        .child(
          S.list()
            .title("Globale innstillinger")
            .items([
              createSingleTon({
                S,
                type: "themeDefaults",
                icon: Brush,
                title: "Standard CSS",
                workspace,
              }),
            ]),
        ),
    ]);
};
