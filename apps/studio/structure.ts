import {
  Blocks,
  Book,
  Brush,
  Building2,
  CogIcon,
  File,
  Globe,
  Handbag,
  type LucideIcon,
  PanelBottom,
  PanelTop,
  Rocket,
  Search,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import type {
  DefaultDocumentNodeResolver,
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";

import { DeploymentDashboard } from "./components/deployment-dashboard";
import { API_VERSION } from "./utils/constant";
import { getActiveSite } from "./utils/context";
import { paneId } from "./utils/pane-ids";
import { map, merge, fromEvent, switchMap, shareReplay } from "rxjs";
import { SITE_CHANGED_EVENT } from "./utils/structure/structure-channel";
import { ActiveSite } from "./utils/types";
import { capitalize } from "./utils/helper";
import { ALL_ROOT_TYPES, packagesByRootType } from "@/utils/package";
import { buildPageTree } from "./utils/structure/build-page-tree";

// ─────────────────────────────────────────────────────────────
// Default document node
// ─────────────────────────────────────────────────────────────

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S) => {
  return S.document().views([S.view.form().title("Innhold")]);
};

// ─────────────────────────────────────────────────────────────
// Page tree
// ─────────────────────────────────────────────────────────────

/**
 * Builds the children pane for a selected page.
 *
 * - Package root (articleRoot, catalogRoot, etc.)
 *   → shows its specific child type (articlePage, productPage)
 *
 * - Generic page
 *   → shows any page or root that has it as parent
 */
function buildChildrenList(
  S: StructureBuilder,
  parentId: string,
  parentType: string,
  siteId: string,
  enabledPackages: string[],
) {
  const pkg = packagesByRootType.get(parentType);

  if (pkg) {
    return S.documentList()
      .id(`${parentId}-children-list`)
      .title(pkg.childTitle)
      .filter(
        `_type == $childType
                 && parent._ref == $parentId
                 && site._ref == $siteId`,
      )
      .apiVersion(API_VERSION)
      .params({ childType: pkg.childType, parentId, siteId })
      .defaultOrdering([
        { field: "sortOrder", direction: "asc" },
        { field: "title", direction: "asc" },
      ])
      .initialValueTemplates([
        S.initialValueTemplateItem(`${pkg.childType}-with-parent`, {
          siteId,
          parentId,
        }),
      ]);
  }

  // Generic page → nested pages and enabled package roots only
  const activeRootTypes = ALL_ROOT_TYPES.filter(
    (t) => t === "page" || enabledPackages.includes(t),
  );
  const childTypeFilter = activeRootTypes
    .map((t) => `_type == "${t}"`)
    .join(" || ");

  return S.documentList()
    .id(`${parentId}-children-list`)
    .title("Undersider")
    .filter(
      `(${childTypeFilter})
             && parent._ref == $parentId
             && site._ref == $siteId`,
    )
    .apiVersion(API_VERSION)
    .params({ parentId, siteId })
    .defaultOrdering([
      { field: "sortOrder", direction: "asc" },
      { field: "title", direction: "asc" },
    ])
    .initialValueTemplates([
      S.initialValueTemplateItem("page-with-parent", {
        siteId,
        parentId,
      }),
    ]);
}

/**
 * The unified page tree.
 *
 * Pane 1 → "Sider" (this list item)
 * Pane 2 → Top-level pages (async fetch so we know each doc's _type)
 * Pane 3 → "Rediger side" + children of the selected page
 */
// function buildPageTree(
//   S: StructureBuilder,
//   siteId: string,
//   enabledPackages: string[],
//   context: StructureResolverContext,
// ) {
//   // Only include root types that are either "page" or an enabled package
//   const activeRootTypes = ALL_ROOT_TYPES.filter(
//     (t) => t === "page" || enabledPackages.includes(t),
//   );

//   const topLevelFilter = activeRootTypes
//     .map((t) => `_type == "${t}"`)
//     .join(" || ");

//   return S.listItem()
//     .title("Sider")
//     .id(`${siteId}-pages`)
//     .icon(Globe)
//     .child(async () => {
//       const client = context.getClient({ apiVersion: API_VERSION });

//       const topLevelPages = await client.fetch<
//         {
//           _id: string;
//           _type: string;
//           title: string;
//           sortOrder?: number;
//         }[]
//       >(
//         `*[(${topLevelFilter})
//                     && site._ref == $siteId
//                     && !defined(parent)
//                   ] | order(sortOrder asc, title asc) {
//                     _id, _type, title, sortOrder
//                 }`,
//         { siteId },
//       );

//       return S.list()
//         .id(`${siteId}-pages-list`)
//         .title("Sider")
//         .items(
//           topLevelPages.map((page) => {
//             const pkg = packagesByRootType.get(page._type);
//             const icon = pkg?.icon ?? File;

//             return S.listItem()
//               .title(page.title || "Uten tittel")
//               .id(page._id)
//               .icon(icon)
//               .child(
//                 S.list()
//                   .id(`${page._id}-pane`)
//                   .title(page.title || "Uten tittel")
//                   .items([
//                     // Edit this page
//                     S.listItem()
//                       .title("Rediger side")
//                       .id(`${page._id}-edit`)
//                       .icon(Wrench)
//                       .child(
//                         S.document()
//                           .id(`${page._id}-editor`)
//                           .schemaType(page._type)
//                           .documentId(page._id)
//                           .views([S.view.form().title("Innhold")]),
//                       ),

//                     S.divider(),

//                     // Children
//                     S.listItem()
//                       .title(pkg ? pkg.childrenTitle : "Undersider")
//                       .id(`${page._id}-children`)
//                       .icon(pkg?.childIcon ?? File)
//                       .child(
//                         buildChildrenList(
//                           S,
//                           page._id,
//                           page._type,
//                           siteId,
//                           enabledPackages,
//                         ),
//                       ),
//                   ]),
//               );
//           }),
//         );
//     });
// }

// ─────────────────────────────────────────────────────────────
// Singleton helper
// ─────────────────────────────────────────────────────────────

function createSingleton(
  S: StructureBuilder,
  opts: {
    type: string;
    title: string;
    icon: LucideIcon;
    siteId: string;
    workspace: string;
  },
) {
  const docId = paneId.singleton(opts.siteId, opts.type);

  return S.listItem()
    .title(opts.title)
    .id(docId)
    .icon(opts.icon)
    .child(
      S.document()
        .id(`${docId}-editor`)
        .schemaType(opts.type)
        .documentId(docId)
        .views([S.view.form().title("Innhold")]),
    );
}

// ─────────────────────────────────────────────────────────────
// Site content
// ─────────────────────────────────────────────────────────────

function buildSiteItems(
  S: StructureBuilder,
  site: { _id: string; title: string; enabledPackages?: string[] },
  workspace: string,
  context: StructureResolverContext,
) {
  return [
    S.divider().title("Nettstedets Ressurser"),

    buildPageTree(S, site._id, site.enabledPackages ?? [], context),

    createSingleton(S, {
      type: "navbar",
      title: "Header",
      icon: PanelTop,
      siteId: site._id,
      workspace,
    }),
    createSingleton(S, {
      type: "footer",
      title: "Footer",
      icon: PanelBottom,
      siteId: site._id,
      workspace,
    }),

    S.divider(),

    S.listItem()
      .title("Sideinnstillinger")
      .id(`${site._id}-settings`)
      .icon(Settings)
      .child(
        S.document()
          .id(`${site._id}-settings-editor`)
          .schemaType("site")
          .documentId(site._id),
      ),
  ];
}

// ─────────────────────────────────────────────────────────────
// Global items (workspace-level, shared across sites)
// ─────────────────────────────────────────────────────────────

function buildGlobalItems(S: StructureBuilder, enabledPackages: string[]) {
  const pkgScopedGlobals = [
    {
      pkg: "commerce",
      item: S.listItem()
        .title("Produkter")
        .id("global-products")
        .icon(Handbag)
        .child(
          S.documentList()
            .id("global-products-list")
            .title("Produkter")
            .filter('_type == "product"')
            .apiVersion(API_VERSION)
            .defaultOrdering([{ field: "title", direction: "asc" }]),
        ),
    },
    {
      pkg: "articles",
      item: S.listItem()
        .title("Artikler")
        .id("global-articles")
        .icon(Book)
        .child(
          S.documentList()
            .id("global-articles-list")
            .title("Artikler")
            .filter('_type == "article"')
            .apiVersion(API_VERSION)
            .defaultOrdering([{ field: "title", direction: "asc" }]),
        ),
    },

    {
      pkg: "articles",
      item: S.listItem()
        .title("Forfattere")
        .id("global-authors")
        .icon(Users)
        .child(
          S.documentList()
            .id("global-authors-list")
            .title("Forfattere")
            .filter('_type == "author"')
            .apiVersion(API_VERSION)
            .defaultOrdering([{ field: "name", direction: "asc" }]),
        ),
    },
  ];

  const filteredPkgScopedGlobals = pkgScopedGlobals
    .filter((item) => enabledPackages.includes(item.pkg))
    .map((item) => item.item);

  return [
    ...(filteredPkgScopedGlobals.length > 0
      ? [S.divider().title("Globale Ressurser")]
      : []),

    ...filteredPkgScopedGlobals,

    S.divider(),

    S.listItem()
      .title("Distribusjonssenter")
      .id("deployment-center")
      .icon(Rocket)
      .child(
        S.component()
          .id("deployment-dashboard")
          .component(DeploymentDashboard)
          .title("Distribusjonssenter"),
      ),

    S.listItem()
      .title("Globale innstillinger")
      .id("global-settings")
      .icon(CogIcon)
      .child(
        S.list()
          .id("global-settings-list")
          .title("Globale innstillinger")
          .items([
            S.listItem()
              .title("Organisasjon")
              .id("global-branding-item-1")
              .icon(Building2)
              .child(
                S.document()
                  .id("global-branding-editor")
                  .schemaType("globalOrganization")
                  .documentId("globalOrganization")
                  .title("Organisasjon"),
              ),
            S.listItem()
              .title("CSS Variabler")
              .id("global-branding-item-2")
              .icon(Brush)
              .child(
                S.document()
                  .id("global-branding-editor")
                  .schemaType("globalTheme")
                  .documentId("globalTheme")
                  .title("CSS Variabler"),
              ),
            S.listItem()
              .title("SEO & Metadata")
              .id("global-seo")
              .icon(Search)
              .child(
                S.document()
                  .id("global-seo-editor")
                  .schemaType("globalSeo")
                  .documentId("globalSeo")
                  .title("SEO & Metadata"),
              ),
            // S.listItem()
            //   .title("Sosiale medier")
            //   .id("global-social")
            //   .icon(Users)
            //   .child(
            //     S.document()
            //       .id("global-social-editor")
            //       .schemaType("globalSocialMedia")
            //       .documentId("globalSocialMedia")
            //       .title("Sosiale medier"),
            //   ),
            S.listItem()
              .title("Integrasjoner")
              .id("global-integrations")
              .icon(Blocks)
              .child(
                S.document()
                  .id("global-integrations-editor")
                  .schemaType("globalIntegrations")
                  .documentId("globalIntegrations")
                  .title("Integrasjoner"),
              ),
          ]),
      ),
  ];
}

// ─────────────────────────────────────────────────────────────
// Main structure export
// ─────────────────────────────────────────────────────────────

export const createStructure = (
  S: StructureBuilder,
  context: StructureResolverContext,
  workspace: string,
) => {
  const { documentStore } = context;

  const sites$ = documentStore
    .listenQuery(
      `*[_type == "site" && workspace == $workspace]{ _id, title, enabledPackages, _updatedAt }`,
      { workspace },
      {
        tag: "structure-active-site",
        perspective: "published",
        transitions: ["update", "appear"],
      },
    )
    .pipe(shareReplay(1)); // ← one live listener, replays latest to new subscribers

  const siteChanged$ = fromEvent(window, SITE_CHANGED_EVENT);

  return merge(sites$, siteChanged$.pipe(switchMap(() => sites$))).pipe(
    map((sites: ActiveSite[]) => {
      const studioContext = getActiveSite(workspace);
      const activeSite = studioContext?._id
        ? (sites.find((s) => s._id === studioContext._id) ?? sites[0])
        : sites[0];

      return S.list()
        .id(
          `root-${activeSite?._id ?? "default"}-${activeSite?._updatedAt?.split(":").join("-") ?? "default"}`,
        )
        .title(`${capitalize(activeSite?.title)}`)
        .items([
          ...buildSiteItems(S, activeSite, workspace, context),
          ...buildGlobalItems(S, activeSite?.enabledPackages ?? []),
        ]);
    }),
  );
};
