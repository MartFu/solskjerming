import { File, LucideIcon } from "lucide-react";
import {
    Divider,
    ListItem,
    ListItemBuilder,
    StructureBuilder,
} from "sanity/structure";
import { paneId } from "../pane-ids";
import { WorkspaceKey } from "../constant";
import { asStudioIcon, capitalize } from "../helper";

// ─────────────────────────────────────────────────────────────
// Singleton helper
// ─────────────────────────────────────────────────────────────

type Base = {
    type: string;
    id?: string;
    title?: string;
    icon?: LucideIcon | React.ComponentType | ReturnType<typeof asStudioIcon>;
};

export function createSingleton(
    S: StructureBuilder,
    opts: {
        type: string;
        title: string;
        icon: LucideIcon;
        siteId: string;
        workspace: WorkspaceKey;
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

export const createList = (
    S: StructureBuilder,
    { type, icon, title, id }: Base,
) => {
    return S.documentTypeListItem(type)
        .id(id ?? type)
        .title(title ?? capitalize(type))
        .icon(icon ?? asStudioIcon(File));
};