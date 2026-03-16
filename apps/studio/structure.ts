import {
  BookOpen,
  Brush,
  CogIcon,
  File,
  FileCodeCorner,
  FileText,
  Handbag,
  HomeIcon,
  type LucideIcon,
  MessageCircle,
  Package,
  PanelBottom,
  PanelTop,
  PlayCircle,
  Rocket,
  Wrench,
} from "lucide-react";
import type {
  DefaultDocumentNodeResolver,
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";

import type { SchemaType, SingletonType } from "@/schemaTypes/index";
import { getTitleCase } from "@/utils/helper";
import { PREVIEWABLE_TYPES } from "@/utils/preview";
import { DeploymentDashboard } from "./components/deployment-dashboard";
import { PreviewPane } from "./components/PreviewPane";
import { API_VERSION } from "./utils/constant";
import { getActiveSite } from "./utils/context";
import { Iframe } from "sanity-plugin-iframe-pane";

// ─────────────────────────────────────────────────────────────
// Default document node
// ─────────────────────────────────────────────────────────────

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S) => {
  return S.document().views([S.view.form().title("Innhold")]);
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
        .views([S.view.form().title("Innhold")]),
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
    type: "navbar",
    title: "Header",
    icon: PanelTop,
    siteId: site._id,
  }),
  createSingleTon({
    S,
    type: "footer",
    title: "Footer",
    icon: PanelBottom,
    siteId: site._id,
  }),
  S.listItem()
    .title("Sideinnstillinger")
    .id(`${site._id}-settings`)
    .icon(Wrench)
    .child(S.document().schemaType("site").documentId(site._id)),
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

  const studioContext = getActiveSite(workspace);

  console.log("CONTEXT: ", studioContext);

  let activeSite: {
    _id: string;
    title: string;
    id: string;
  } | null = null;

  if (studioContext?._id) {
    activeSite = await client.fetch<{ _id: string; title: string; id: string }>(
      `*[_type == "site" && _id == $siteId][0] { _id, title, id }`,
      { siteId: studioContext._id },
    );
  } else {
    const sites = await client.fetch<
      { _id: string; title: string; id: string }[]
    >(
      `*[_type == "site" && workspace == $workspace] | order(title asc) { _id, title, id }`,
      { workspace },
    );

    activeSite = sites[0];
  }

  const siteItems = buildSiteItems(S, activeSite, context);

  return S.list()
    .title("Innhold")
    .items([
      ...siteItems,

      S.divider(),
      S.listItem()
        .title("Distribusjonssenter")
        .id("deployment-center")
        .icon(Rocket)
        .child(
          S.component().component(DeploymentDashboard).title("Distribusjonssenter"),
        ),

      createSingleTon({
        S,
        type: "workspaceDefault",
        icon: CogIcon,
        title: "Standardinnstillinger",
        workspace,
      }),
    ]);
};
