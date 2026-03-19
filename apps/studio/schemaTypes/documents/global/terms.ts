import { DocumentsIcon } from "@sanity/icons";
import { defineType } from "sanity";

import { customRichText } from "@/schemaTypes/definitions/rich-text";

export const globalTerms = defineType({
  name: "globalTerms",
  title: "Vilkår og betingelser",
  type: "document",
  icon: DocumentsIcon,
  fields: [
    customRichText(["block"], {
      name: "content",
      title: "Innhold",
      description:
        "Teksten til vilkår og betingelser. Kan arves av nettsteder som ikke har sine egne.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Vilkår og betingelser" };
    },
  },
});
