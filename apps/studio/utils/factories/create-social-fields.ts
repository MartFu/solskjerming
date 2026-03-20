import { GROUP } from "@/utils/constant";
import { defineField } from "sanity";
import type { FieldDefinition } from "sanity";

interface SocialFieldOptions {
  linkedinDescription?: string;
  facebookDescription?: string;
  instagramDescription?: string;
  youtubeDescription?: string;
  twitterDescription?: string;
}

export function createSocialFields(
  options: SocialFieldOptions = {},
): FieldDefinition[] {
  const {
    linkedinDescription = "Fullstendig URL til LinkedIn-profil eller bedriftsside.",
    facebookDescription = "Fullstendig URL til Facebook-profil eller side.",
    instagramDescription = "Fullstendig URL til Instagram-profil.",
    youtubeDescription = "Fullstendig URL til YouTube-kanal.",
    twitterDescription = "Fullstendig URL til Twitter/X-profil.",
  } = options;

  return [
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
  ];
}
