import {
  LayoutDashboard,
  Rocket,
  Search,
  Settings,
} from "lucide-react";
import { StructureBuilder } from "sanity/structure";
import { API_VERSION } from "@/utils/env";
import { PackageIcon} from "@sanity/icons";
import { DeploymentDashboard } from "@/components/deployment-dashboard";
import { asStudioIcon, capitalize } from "../helper";

import { moduleRegistry, globalRegistry, globalSettingsRegistry } from "@/schemaTypes/documents";
import { SeoReportsView } from "@/components/views/SeoReportView";

// ─────────────────────────────────────────────────────────────
// Global items (workspace-level, shared across sites)
// ─────────────────────────────────────────────────────────────

export function buildGlobalItems(
  S: StructureBuilder,
  enabledModules: string[],
) {
  const packagedGlobals = moduleRegistry
    .globalsForModules(enabledModules)
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

    console.log("moduleGlobals", moduleRegistry.globalsForModules(enabledModules), enabledModules)

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

  const globalSettings = [
      ...globalSettingsRegistry.map((g) => ({
          title: g.schema.title ? capitalize(g.schema.title) : capitalize(g.schema.name),
          id: `${g.schema.name}-editor`,
          icon: g.schema.icon,
      })),
      {
        title: "Studioinnstillinger",
        id: "studio-settings-editor",
        icon: asStudioIcon(LayoutDashboard),
      }
  ];


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

      S.listItem()
          .title("Globale Innstillinger")
          .id("global-settings")
          .icon(Settings)
          .child(
              S.list()
                  .id("global-settings-list")
                  .title("Globale Innstillinger")
                  .items([
                      ...globalSettings.map((g) => S.listItem().title(g.title).id(g.id).icon(g.icon)),
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
          .id("seo")
          .icon(Search)
          .child(
              S.component()
                  .id("seo-dashboard")
                  .component(SeoReportsView)
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
