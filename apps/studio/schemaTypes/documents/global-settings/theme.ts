import { ColorWheelIcon, MoonIcon, SunIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { ThemePresetFieldInput } from "@/components/inputs/theme-preset-field-input";
import {
  requiredColorModeField,
  requiredRadiusField,
} from "@/schemaTypes/definitions/theme-tokens";
import { slate } from "@/utils/themes";

export const globalTheme = defineType({
  name: "globalTheme",
  title: "CSS Variabler",
  type: "document",
  icon: ColorWheelIcon,
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

  fields: [
    // No group → renders above the tab bar, always visible
    defineField({
      name: "themePreset",
      title: "Forhåndsdefinerte Temaer",
      description:
        "Kom raskt i gang med et harmonisk, forhåndsdefinert tema eller definer et helt eget.",
      type: "string",
      group: ["light", "dark"],
      components: {
        input: (props) => ThemePresetFieldInput(props, { focusTheme: "light" }),
      },
    }),
    { ...requiredColorModeField("light"), group: "light" },
    { ...requiredColorModeField("dark"), group: "dark" },
    { ...requiredRadiusField, group: "general" },
  ],
  preview: {
    prepare() {
      return { title: "CSS Variabler" };
    },
  },
});
