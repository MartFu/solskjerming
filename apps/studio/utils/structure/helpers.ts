import { LucideIcon } from "lucide-react";
import { StructureBuilder } from "sanity/structure";
import { paneId } from "../pane-ids";

// ─────────────────────────────────────────────────────────────
// Singleton helper
// ─────────────────────────────────────────────────────────────

export function createSingleton(
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
