import { GROUP } from "@/utils/constant";
import { defineArrayMember, defineField } from "sanity";
import type { FieldDefinition} from "sanity";

interface IntegrationFieldOptions {
    groupsEnabled?: boolean;
}


export function createIntegrationsField(
    options: IntegrationFieldOptions = {},
): FieldDefinition {
    const {
        groupsEnabled = false,
    } = options;

    const group = groupsEnabled ? GROUP.INTEGRATIONS : undefined;

    return defineField({
        name: "integrations",
        title: "Integrasjoner",
        description: "Legg til integrasjoner ved å føre inn navn, ID og eventuelt script.",
        type: "array",
        group,
        of: [
            defineArrayMember({
                type: "object",
                name: "customIntegration",
                preview: {
                    select: {
                        title: "title",
                        subtitle: "id",
                    },
                    prepare({ title, subtitle }) {
                        return {
                            title: title || "Navnløs integrasjon",
                            subtitle: subtitle
                                ? `ID: ${subtitle}`
                                : "Ingen ID satt",
                        };
                    },
                },
                fields: [
                    defineField({
                        name: "title",
                        title: "Navn",
                        type: "string",
                        description: "F.eks. 'Google Analytics'",
                    }),
                    defineField({
                        name: "id",
                        title: "ID / Nøkkel",
                        type: "string",
                        description: "ID-en som skal brukes i scriptet",
                    }),
                    defineField({
                        name: "scriptTag",
                        title: "Fullstendig Script (valgfritt)",
                        type: "text",
                        description:
                            "Lim inn hele <script> koden her hvis det trengs.",
                    }),
                ],
            }),
        ],
    });
}
