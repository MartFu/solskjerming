import { MoonIcon, SunIcon } from "@sanity/icons";
import { defineType } from "sanity";
import { slate } from "@/utils/themes";
import { createThemeFields } from "@/utils/factories/create-theme";
import { asStudioIcon } from "@/utils/helper";
import { Brush } from "lucide-react";
import { DOCUMENT_NAMES } from "@/schemaTypes/constant";

export const globalTheme = defineType({
  name: DOCUMENT_NAMES.globalTheme,
  title: "CSS Variabler",
  type: "document",
  icon: asStudioIcon(Brush),
  initialValue: {
    light: slate.light,
    dark: slate.dark,
    radius: slate.radius,
  },
  groups: [
    { name: "light", title: "Lys modus", default: true, icon: SunIcon },
    { name: "dark", title: "Mørk modus", icon: MoonIcon },
    { name: "general", title: "Generelt" },
  ],

  fields: createThemeFields(),
  preview: {
    prepare() {
      return { title: "CSS Variabler" };
    },
  },
});
