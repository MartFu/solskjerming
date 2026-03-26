import { defineConfig, defineLocaleResourceBundle } from "sanity";

export const noNBStudio = defineLocaleResourceBundle({
    locale: "no-NB",
    namespace: "studio",
    resources: {
        "field.actions.menu-aria-label": "Feltvalg",
        "field.actions.clear-value-label": "Tøm feltet",
    },
});

export const noNBPresentation = defineLocaleResourceBundle({
    locale: "no-NB",
    namespace: "presentation",
    resources: {
        "presentational.used-in.header": "Vises på",
        "presentational.used-in.no-locations": "Ingen sider funnet",
        "presentational.used-in.loading": "Laster visninger...",
    },
});



export const noNBOverrides = [noNBStudio, noNBPresentation]