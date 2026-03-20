import {
  Blocks,
  Book,
  Brush,
  Building2,
  Handbag,
  Rocket,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { StructureBuilder } from "sanity/structure";
import { API_VERSION } from "../constant";
import { DocumentsIcon } from "@sanity/icons";
import { DeploymentDashboard } from "@/components/deployment-dashboard";

// ─────────────────────────────────────────────────────────────
// Global items (workspace-level, shared across sites)
// ─────────────────────────────────────────────────────────────

export function buildGlobalItems(
  S: StructureBuilder,
  enabledPackages: string[],
) {
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

    S.listItem()
      .title("Dokumenter")
      .id("global-documentation")
      .icon(DocumentsIcon)
      .child(
        S.documentList()
          .id("global-documentation-list")
          .title("Dokumenter")
          .filter('_type == "documentation"')
          .apiVersion(API_VERSION)
          .defaultOrdering([{ field: "title", direction: "asc" }]),
      ),

    S.listItem()
      .title("Innstillinger")
      .id("global-settings")
      .icon(Settings)
      .child(
        S.list()
          .id("global-settings-list")
          .title("Innstillinger")
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

    S.divider().title("Verktøy"),

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
  ];
}
