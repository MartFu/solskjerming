import { LinkIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const globalSocialMedia = defineType({
  name: "globalSocialMedia",
  title: "Sosiale medier",
  type: "document",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "linkedin",
      title: "LinkedIn-URL",
      type: "string",
      description:
        "Fullstendig URL til LinkedIn-profil eller bedriftsside. Arves av nettsteder uten egne lenker.",
    }),
    defineField({
      name: "facebook",
      title: "Facebook-URL",
      type: "string",
      description: "Fullstendig URL til Facebook-profil eller side.",
    }),
    defineField({
      name: "instagram",
      title: "Instagram-URL",
      type: "string",
      description: "Fullstendig URL til Instagram-profil.",
    }),
    defineField({
      name: "youtube",
      title: "YouTube-URL",
      type: "string",
      description: "Fullstendig URL til YouTube-kanal.",
    }),
    defineField({
      name: "twitter",
      title: "Twitter/X-URL",
      type: "string",
      description: "Fullstendig URL til Twitter/X-profil.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Sosiale medier" };
    },
  },
});
