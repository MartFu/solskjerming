import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { createIntegrationsField } from "@/utils/factories/create-integration-fields";
import { PlugIcon } from "@sanity/icons";
import { defineGlobal } from "@/utils/globals/define-global";

export const globalIntegrations = defineGlobal({
  sortFields: [],
    name: DOCUMENT_NAMES.globalIntegrations,
    title: "Globale Integrasjoner",
    type: "document",
    icon: PlugIcon,
    fields: [
        createIntegrationsField({ groupsEnabled: false })
    ],
    preview: {
        prepare() {
            return { title: "Globale Integrasjoner" };
        },
    },
});
