import { Command } from "lucide-react";
import { defineField, defineType } from "sanity";

import { capitalize, createRadioListLayout } from "@/utils/helper";

const buttonVariants = ["default", "secondary", "outline", "link"];

export const button = defineType({
    name: "button",
    title: "Knapp",
    type: "object",
    icon: Command,
    fields: [
        defineField({
            name: "variant",
            type: "string",
            title: "Variant",
            description:
                "Velg knappens visuelle uttrykk - 'default' er fylt, 'secondary' er mindre fremtredende, 'outline' har ramme, og 'link' ser ut som vanlig tekst.",
            initialValue: () => "default",
            options: createRadioListLayout(buttonVariants, {
                direction: "horizontal",
            }),
        }),
        defineField({
            name: "text",
            title: "Knappens tekst",
            type: "string",
            description:
                "Teksten som vises på knappen, f.eks. 'Les mer' eller 'Kom i gang'.",
        }),
        defineField({
            name: "url",
            title: "Url",
            type: "customUrl",
            description:
                "Hvor knappen skal føre brukeren – kan være en intern side eller en ekstern nettside.",
        }),
    ],
    preview: {
        select: {
            title: "text",
            variant: "variant",
            externalUrl: "url.external",
            urlType: "url.type",
            internalUrl: "url.internal.slug.current",
            openInNewTab: "url.openInNewTab",
        },
        prepare: ({
            title,
            variant,
            externalUrl,
            urlType,
            internalUrl,
            openInNewTab,
        }) => {
            const url = urlType === "external" ? externalUrl : internalUrl;
            const newTabIndicator = openInNewTab ? " ↗" : "";

            return {
                title: title || "Knapp uten tittel",
                subtitle: `${capitalize(variant ?? "default")} • ${url}${newTabIndicator}`,
            };
        },
    },
});
