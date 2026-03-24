import { createThemeFields } from "@/utils/factories/create-theme";
import { MoonIcon, SunIcon } from "@sanity/icons";
import { defineType } from "sanity";

export const theme = defineType({
    name: "theme",
    title: "CSS Variabler",
    type: "object",
    groups: [
        { name: "light", title: "Lys modus", default: true, icon: SunIcon },
        { name: "dark", title: "Mørk modus", icon: MoonIcon },
        { name: "general", title: "Generelt" },
    ],
    fields: [
        ...createThemeFields({
            title: "CSS Variabler",
            description: "Velg en visuell stil for denne nettsiden.",
        }),
    ],
});
