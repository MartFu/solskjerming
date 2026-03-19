import { LockIcon } from "@sanity/icons";
import { defineType } from "sanity";

import { customRichText } from "@/schemaTypes/definitions/rich-text";

export const globalPrivacyPolicy = defineType({
  name: "globalPrivacyPolicy",
  title: "Personvernerklæring",
  type: "document",
  icon: LockIcon,
  fields: [
    customRichText(["block"], {
      name: "content",
      title: "Innhold",
      description:
        "Teksten til personvernerklæringen. Kan arves av nettsteder som ikke har sin egen.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Personvernerklæring" };
    },
  },
});
