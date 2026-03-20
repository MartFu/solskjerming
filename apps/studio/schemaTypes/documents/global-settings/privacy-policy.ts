import { LockIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const globalPrivacyPolicy = defineType({
  name: "globalPrivacyPolicy",
  title: "Personvernerklæring",
  type: "document",
  icon: LockIcon,
  fields: [
    defineField({
      name: "document",
      title: "Dokument",
      type: "reference",
      to: [{ type: "documentation" }],
      description:
        "Peker mot en dokumentasjonsartikkel som inneholder personvernerklæringen. Arves av nettsteder uten egen.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Personvernerklæring" };
    },
  },
});
