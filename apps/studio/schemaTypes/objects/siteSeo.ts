import { defineField, defineType } from "sanity";

export const seo = defineType({
    name: "seoObject",
    type: "object",
    fields: [
        defineField({
            name: "title",
            title: "SEO-tittel",
            type: "string",
            description:
                "Hvis denne er tom, arves tittelen fra Globale Innstillinger.",
        }),
        defineField({
            name: "description",
            title: "SEO-beskrivelse",
            type: "text",
            rows: 3,
            description:
                "Hvis denne er tom, arves beskrivelsen fra Globale Innstillinger.",
            validation: (Rule) => Rule.max(160),
        }),
        defineField({
            name: "image",
            title: "Delingsbilde (Open Graph)",
            type: "image",
            description:
                "Bildet som vises ved deling i sosiale medier. Arves hvis tomt.",
        }),
    ],
});
