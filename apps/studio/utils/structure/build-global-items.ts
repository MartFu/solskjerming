import {
  Blocks,
  Book,
  Brush,
  Building2,
  Handbag,
  LayoutDashboard,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { StructureBuilder } from "sanity/structure";
import { API_VERSION } from "@/utils/env";
import { DocumentsIcon, JsonIcon, PackageIcon, RobotIcon } from "@sanity/icons";
import { DeploymentDashboard } from "@/components/deployment-dashboard";
import { asStudioIcon, capitalize } from "../helper";
import { packageRegistry } from "@/schemaTypes/documents/packages/index";
import {
  globalRegistry,
  globalSchemaTypes,
} from "@/schemaTypes/documents/globals";
import { moduleRegistry } from "@/schemaTypes/documents/modules";

// ─────────────────────────────────────────────────────────────
// Global items (workspace-level, shared across sites)
// ─────────────────────────────────────────────────────────────

export function buildGlobalItems(
  S: StructureBuilder,
  enabledPackages: string[],
) {
  const packagedGlobals = moduleRegistry
    .globalsForModules(enabledPackages)
    .map((global) =>
      S.listItem()
        .title(global.structureTitle)
        .id(global.structureId)
        .icon(global.icon)
        .child(
          S.documentList()
            .id(`global-${global.type}-list`)
            .title(global.structureTitle)
            .filter(global.filter)
            .apiVersion(API_VERSION)
            .defaultOrdering(global.defaultOrdering),
        ),
    );

  const alwaysAvailableGlobals = globalRegistry.alwaysAvailable.map((global) =>
    S.listItem()
      .title(
        global.schema?.title
          ? capitalize(global.schema.title)
          : capitalize(global.schema.name),
      )
      .id(`global-aa-${global.schema.name}`)
      .icon(global.schema.icon)
      .child(
        S.documentList()
          .id(`global-aa-${global.schema.name}-list`)
          .title(
            global.schema?.title
              ? capitalize(global.schema.title)
              : capitalize(global.schema.name),
          )
          .params({ type: global.schema.name })
          .filter("_type == $type")
          .apiVersion(API_VERSION)
          .defaultOrdering(
            global.sortFields.map((field) => ({ field, direction: "asc" })),
          ),
      ),
  );

  return [
    S.divider().title("Globaler"),

    S.listItem()
      .title("Ressurser")
      .id("resources")
      .icon(PackageIcon)
      .child(
        S.list()
          .id("resources-list")
          .title("Ressurser")
          .items([...packagedGlobals, ...alwaysAvailableGlobals]),
      ),

    // ...filteredPkgScopedGlobals,

    S.listItem()
      .title("Globale Innstillinger")
      .id("global-settings")
      .icon(Settings)
      .child(
        S.list()
          .id("global-settings-list")
          .title("Globale Innstillinger")
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
              .title("Roboter")
              .id("global-robots")
              .icon(RobotIcon)
              .child(
                S.document()
                  .id("global-robots-editor")
                  .schemaType("globalRobots")
                  .documentId("globalRobots")
                  .title("Roboter"),
              ),
            S.listItem()
              .title("Strukturerte Data (JSON-LD)")
              .id("global-structured-data")
              .icon(JsonIcon)
              .child(
                S.document()
                  .id("global-structured-data-editor")
                  .schemaType("globalStructuredData")
                  .documentId("globalStructuredData")
                  .title("Strukturerte Data (JSON-LD)"),
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
            S.listItem()
              .title("GDPR & Juridisk")
              .id("global-consent")
              .icon(asStudioIcon(ShieldCheck))
              .child(
                S.document()
                  .id("global-consent-editor")
                  .schemaType("globalCompliance")
                  .documentId("globalCompliance")
                  .title("GDPR & Juridisk"),
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

    S.listItem()
      .title("SEO Analyse")
      .id("seo-center")
      .icon(Search)
      .child(
        S.component()
          .id("seo-dashboard")
          .component(DeploymentDashboard)
          .title("SEO Analyse"),
      ),

    S.listItem()
      .title("Studio")
      .id("studio-settings")
      .icon(asStudioIcon(LayoutDashboard))
      .child(
        S.document()
          .id("studio-settings-editor")
          .schemaType("studioSettings")
          .documentId("studioSettings")
          .title("Studio"),
      ),
  ];
}
