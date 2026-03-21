import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { createStructuredDataFields } from "@/utils/factories/create-structured-data-fields";
import { JsonIcon } from "@sanity/icons";
import { defineType } from "sanity";

export const globalStructuredData = defineType({
  name: DOCUMENT_NAMES.globalStructuredData,
  title: "Strukturerte Data (JSON-LD)",
  type: "document",
  icon: JsonIcon,
  fields: [
    // ── STRUCTURED DATA ─────────────────────────────────────────
    ...createStructuredDataFields({
      isDefault: true,
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: title ?? "Strukturerte Data (JSON-LD)",
    }),
  },
});
