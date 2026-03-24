import { GROUP, GROUPS } from "@/utils/constant";
import { defineField, defineType, ObjectDefinition } from "sanity";

interface SocialFieldOptions {
    name: string;
    linkedinDescription?: string;
    facebookDescription?: string;
    instagramDescription?: string;
    youtubeDescription?: string;
    twitterDescription?: string;
}

export function createSocialsObject(
    options: SocialFieldOptions = {
        name: "defaultSocials"
    },
): ObjectDefinition {
    const {
        name,
        linkedinDescription = "Fullstendig URL til LinkedIn-profil eller bedriftsside.",
        facebookDescription = "Fullstendig URL til Facebook-profil eller side.",
        instagramDescription = "Fullstendig URL til Instagram-profil.",
        youtubeDescription = "Fullstendig URL til YouTube-kanal.",
        twitterDescription = "Fullstendig URL til Twitter/X-profil.",
    } = options;

    return defineType({
        name,
        title: "Sosiale medier",
        type: "object",
        groups: GROUPS(),
        fields: [
            defineField({
                name: "linkedin",
                title: "LinkedIn-URL",
                type: "string",
                group: GROUP.SOME,
                description: linkedinDescription,
            }),
            defineField({
                name: "facebook",
                title: "Facebook-URL",
                type: "string",
                group: GROUP.SOME,
                description: facebookDescription,
            }),
            defineField({
                name: "instagram",
                title: "Instagram-URL",
                type: "string",
                group: GROUP.SOME,
                description: instagramDescription,
            }),
            defineField({
                name: "youtube",
                title: "YouTube-URL",
                type: "string",
                group: GROUP.SOME,
                description: youtubeDescription,
            }),
            defineField({
                name: "twitter",
                title: "Twitter/X-URL",
                type: "string",
                group: GROUP.SOME,
                description: twitterDescription,
            }),
        ],
    });
}
