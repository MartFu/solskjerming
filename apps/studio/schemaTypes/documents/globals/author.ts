import { UserIcon } from "@sanity/icons";
import { defineField } from "sanity";
import { imageWithAltField } from "@/schemaTypes/common";
import { DOCUMENTS } from "@/schemaTypes/constant";
import { defineGlobal } from "@/utils/globals/define-global";

export const author = defineGlobal({
  name: DOCUMENTS.authorAsset,
  title: "Forfatter",
  type: "document",
  sortFields: ["name"],
  icon: UserIcon,
  fields: [
    // Add component linking to the author's creations
    defineField({
      name: "name",
      type: "string",
      title: "Navn",
      description: "Personens fulle navn",
      validation: (Rule) => Rule.required().error("Author name is required"),
    }),
    defineField({
      name: "position",
      type: "string",
      title: "Rolle",
      description:
        "Personens jobbtittel eller rolle, f.eks. 'Redaktør' eller 'Administrator",
    }),
    imageWithAltField({
      title: "Bilde",
      description: "Forfatterens profilbilde. Vises sammen med deres artikler.",
    }),
    defineField({
      name: "bio",
      type: "text",
      title: "Biografi",
      description: "En kort paragraf om forfatterens bakgrunn og ekspertise.",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: "name",
      position: "position",
      media: "image",
      bio: "bio",
    },
    prepare: ({ title, position, media, bio }) => {
      const positionInfo = position ? `${position}` : "Ukjent rolle";
      return {
        title: `${title || "Forfatter uten navn"}`,
        subtitle: `${positionInfo} | ${bio}`,
        media,
      };
    },
  },
});
