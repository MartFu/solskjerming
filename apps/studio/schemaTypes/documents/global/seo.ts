import { defineField, defineType } from "sanity";


export const globalSeo = defineType({
    name: "globalSeo",
    title: "Søkemotoroptimalisering",
    type: "document",
    fields: [
        defineField({
            name: "seo",
            type: "seoObject",
        }),
    ],
});