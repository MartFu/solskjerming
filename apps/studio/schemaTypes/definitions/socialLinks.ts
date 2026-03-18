import { defineField, defineType } from "sanity";

export const socialLinks = defineType({
    name: "socialLinks",
    title: "Lenker til sosiale medier",
    description: "Legg til lenker til profiler i sosiale medier.",
    type: "object",
    fields: [
        defineField({
            name: "linkedin",
            title: "LinkedIn-URL",
            description:
                "Fullstendig URL til LinkedIn-profil eller bedriftsside.",
            type: "string",
        }),
        defineField({
            name: "facebook",
            title: "Facebook-URL",
            description: "Fullstendig URL til Facebook-profil eller side.",
            type: "string",
        }),
        defineField({
            name: "twitter",
            title: "Twitter/X-URL",
            description: "Fullstendig URL til Twitter/X-profil.",
            type: "string",
        }),
        defineField({
            name: "instagram",
            title: "Instagram-URL",
            description: "Fullstendig URL til Instagram-profil.",
            type: "string",
        }),
        defineField({
            name: "youtube",
            title: "YouTube-URL",
            description: "Fullstendig URL til YouTube-kanal.",
            type: "string",
        }),
    ],
});