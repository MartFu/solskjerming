import { defineGlobal } from "@/utils/globals/define-global";
import { TagIcon } from "@sanity/icons";
import { defineField } from "sanity";

export const category = defineGlobal({
    name: "category",
    type: "document",
    icon: TagIcon,
    sortFields: [],
    fields: [
        defineField({
            name: "title",
            title: "Tittel",
            type: "string",
            description: "Navnet på kategorien slik det vises i menyer.",
            validation: (Rule) =>
                Rule.required().error("Kategorien må ha et navn."),
        }),
        defineField({
            name: "slug",
            title: "URL-sti",
            type: "slug",
            description: "Brukes for å generere lenken til kategorien.",
            options: {
                source: "title",
                maxLength: 96,
            },
            validation: (Rule) =>
                Rule.required().error("En slug er nødvendig for navigasjon."),
        }),
        defineField({
            name: "description",
            title: "Beskrivelse",
            type: "text",
            rows: 3,
            description: "En kort beskrivelse av kategorien for SEO og lister.",
        }),
        defineField({
            name: "parent",
            title: "Foreldrekategori",
            type: "reference",
            to: [{ type: "category" }],
            description: "Velg hvis dette er en underkategori av en annen.",
        }),
    ],
    preview: {
        select: {
            title: "title",
            subtitle: "description",
        },
    },
});