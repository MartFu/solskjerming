import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { customRichText } from "@/schemaTypes/definitions/rich-text";
import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const documentation = defineType({
  name: DOCUMENT_NAMES.documentation,
  title: "Dokument",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      description:
        "Internt navn på dokumentet, f.eks. «Personvernerklæring 2025».",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "docType",
      title: "Dokumenttype",
      type: "string",
      description:
        "Velg hvilken type juridisk eller informativt dokument dette er.",
      options: {
        list: [
          { title: "Personvernerklæring", value: "privacy-policy" },
          { title: "Vilkår og betingelser", value: "terms" },
          { title: "Informasjonskapselerklæring", value: "cookie-statement" },
          { title: "GDPR-informasjon", value: "gdpr-info" },
          { title: "Annet", value: "other" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    customRichText(["block"], {
      name: "content",
      title: "Innhold",
      description: "Innholdet i dokumentet.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      docType: "docType",
    },
    prepare({ title, docType }) {
      const typeLabels: Record<string, string> = {
        "privacy-policy": "Personvernerklæring",
        terms: "Vilkår og betingelser",
        "cookie-statement": "Informasjonskapselerklæring",
        "gdpr-info": "GDPR-informasjon",
        other: "Annet",
      };
      return {
        title: title ?? "Dokument uten tittel",
        subtitle: typeLabels[docType] ?? docType,
      };
    },
  },
});
