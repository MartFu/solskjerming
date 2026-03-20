import { DocumentsIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const globalTerms = defineType({
  name: "globalTerms",
  title: "Vilkår og betingelser",
  type: "document",
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: "document",
      title: "Dokument",
      type: "reference",
      to: [{ type: "documentation" }],
      description:
        "Peker mot en dokumentasjonsartikkel som inneholder vilkår og betingelser. Arves av nettsteder uten egne.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Vilkår og betingelser" };
    },
  },
});
