import { defineField } from "sanity";
import { slate } from "@/utils/themes";
import { asStudioIcon } from "@/utils/helper";
import { Brush } from "lucide-react";
import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { defineGlobal } from "@/utils/globals/define-global";

export const globalTheme = defineGlobal({
  sortFields: [],
  name: DOCUMENT_NAMES.globalTheme,
  title: "CSS Variabler",
  type: "document",
  icon: asStudioIcon(Brush),
  initialValue: {
    light: slate.light,
    dark: slate.dark,
    radius: slate.radius,
  },
  fields: [
    defineField({
      name: "theme",
      title: "Tema",
      type: "theme"
    })
  ],
  preview: {
    prepare() {
      return { title: "CSS Variabler" };
    },
  },
});
