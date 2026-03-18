import { defineField } from "sanity";

import { GROUP } from "@/utils/constant";

export const ogFields = [
    defineField({
        name: "ogTitle",
        title: "OG-Tittel for deling i sosiale medier",
        description:
            "Overstyrer arbeidsromådets globale Open Graph tittel. Hvis feltet er tomt, brukes sidens tittel. Benyttes ved deling i sosiale medier.",
        type: "string",
        validation: (Rule) => Rule.warning("Tittel er påkrevd"),
        group: GROUP.OG,
    }),
    defineField({
        name: "ogDescription",
        title: "OG-Beskrivelse for sosiale medier",
        description:
            "Overstyrer arbeidsromådets globale Open Graph beskrivelse. Hvis tomt, hentes beskrivelsen fra det korresponderende SEO-feltet eller globale innstillinger. Benyttes ved deling i sosiale medier.",
        type: "text",
        rows: 2,
        validation: (Rule) => [
            Rule.warning("Beskrivelse er påkrevd"),
            Rule.max(160).warning("Makismalt 160 tegn"),
        ],
        group: GROUP.OG,
    }),
];
