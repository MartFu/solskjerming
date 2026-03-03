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
import { SiteRegistryConfig } from "./sanity.config";
import { DeploymentDashboard } from "./components/deployment-dashboard";

const PREVIEW_ORIGIN =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ?? "http://localhost:3000";

// ─────────────────────────────────────────────────────────────
// Preview URL resolution
// ─────────────────────────────────────────────────────────────

// Extend this map when you add new previewable schema types.
// Each resolver receives the full document and returns a path (or null if
// the document doesn't have enough data to resolve a URL yet).
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
// Default document node — adds a "Forhåndsvisning" tab to
// documents that have a preview URL resolver defined above.
// This is passed to structureTool({ defaultDocumentNode }) in
// workspace.ts and applies across all sites in the workspace.
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
// Structure helpers (unchanged)
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
  workspace
}: CreateSingleTon & { siteId?: string; workspace?: string; }) => {
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
                console.log("----- doc in iframe resolver -----:", doc);
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

type CreateIndexList = {
  S: StructureBuilder;
  list: Base;
  index: Base<SingletonType>;
  context: StructureResolverContext;
};

const createIndexListWithOrderableItems = ({
  S,
  index,
  list,
  context,
}: CreateIndexList) => {
  const indexTitle = index.title ?? getTitleCase(index.type);
  const listTitle = list.title ?? getTitleCase(list.type);
  return S.listItem()
    .title(listTitle)
    .icon(index.icon ?? File)
    .child(
      S.list()
        .title(indexTitle)
        .items([
          S.listItem()
            .title(indexTitle)
            .icon(index.icon ?? File)
            .child(
              S.document()
                .views([S.view.form()])
                .schemaType(index.type)
                .documentId(index.type),
            ),
          orderableDocumentListDeskItem({
            type: list.type,
            S,
            context,
            icon: list.icon ?? File,
            title: `${listTitle}`,
          }),
        ]),
    );
};

// ─────────────────────────────────────────────────────────────
// Site-Specific Structure Builder
// ─────────────────────────────────────────────────────────────

const buildSiteStructure = (
  S: StructureBuilder,
  siteId: string,
  siteTitle: string,
  context: StructureResolverContext,
) => {
  return S.list()
    .title(siteTitle)
    .items([
      createSingleTon({
        S,
        type: "homePage",
        title: "Forside",
        icon: HomeIcon,
        siteId,
      }),
      createSingleTon({
        S,
        type: "articleIndex",
        title: "Innleggsside",
        icon: BookOpen,
        siteId,
      }),

      S.divider(),

      createList({
        S,
        type: "page",
        title: "Sider",
        icon: FileCodeCorner,
        siteId,
      }),

      createList({
        S,
        type: "article",
        title: "Artikler",
        icon: FileText,
        siteId,
      }),

      createList({
        S,
        type: "video",
        title: "Videor",
        icon: PlayCircle,
        siteId,
      }),

      createList({
        S,
        type: "faq",
        title: "FAQs",
        icon: MessageCircle,
        siteId,
      }),

      S.divider(),

      createList({
        S,
        type: "product",
        title: "Produkter",
        icon: Handbag,
        siteId,
      }),

      S.divider(),

      S.listItem()
        .title("Innstilinger")
        .icon(Settings2)
        .child(
          S.list()
            .title("Configuration")
            .items([
              createSingleTon({
                S,
                type: "navbar",
                title: "Header",
                icon: PanelBottom,
                siteId,
              }),
              createSingleTon({
                S,
                type: "footer",
                title: "Footer",
                icon: PanelBottom,
                siteId,
              }),
              createSingleTon({
                S,
                type: "settings",
                title: "Sideinnstillinger",
                icon: CogIcon,
                siteId,
              }),
            ]),
        ),
    ]);
};

// ─────────────────────────────────────────────────────────────
// Main Structure Export
// ─────────────────────────────────────────────────────────────

export const structure = (
  S: StructureBuilder,
  context: StructureResolverContext,
  workspace: string,
  config: SiteRegistryConfig,
) => {
  const baseTitle = getTitleCase(workspace);

  const siteItems = config.sites.map((site) =>
    S.listItem()
      .title(site.title)
      .id(site.id)
      .icon(Globe)
      .child((childId) => {
        console.log("----- childId -----:", childId);

        return buildSiteStructure(S, site.id, site.title, context);
      }),
  );

  return S.list()
    .title(`${baseTitle}`)
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
        .child(
          S.list().title("Globale ressurser").items([]), // empty for now
        ),

      S.listItem()
        .title("Globale innstillinger")
        .id("global-settings")
        .icon(CogIcon)
        .child(
          S.list().title("Globale innstillinger").items([
            createSingleTon({
              S,
              type: "themeDefaults",
              icon: Brush,
              title: "Standard CSS",
              workspace
            })
          ]), // empty for now
        ),
    ]);
};
