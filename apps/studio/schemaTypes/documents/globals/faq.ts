import { defineField} from "sanity";
import { customRichText } from "@/schemaTypes/definitions/rich-text";
import { asStudioIcon, parseRichTextToString } from "@/utils/helper";
import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { defineGlobal } from "@/utils/globals/define-global";
import { MessageCircleQuestionMark } from "lucide-react";

export const faq = defineGlobal({ 
  name: DOCUMENT_NAMES.faq,
  type: "document",
  icon: asStudioIcon(MessageCircleQuestionMark),
  sortFields: [],
  alwaysAvailable: true,
  title: "Ofte stilte spørsmål (FAQ)",
  description:
    "Et enkelt par med spørsmål og svar som hjelper besøkende med å finne informasjon raskt. Tenk på det som å skrive ned spørsmålene kundene ofte stiller, sammen med klare svar.",
  fields: [
    defineField({
      name: "title",
      title: "Spørsmål",
      type: "string",
      description:
        "Skriv spørsmålet nøyaktig slik noen ville stilt det. For eksempel: «Hvordan nullstiller jeg passordet mitt?»",
      validation: (Rule) => Rule.required(),
    }),
    customRichText(["block"], {
      title: "Svar",
      description:
        "Skriv et vennlig og tydelig svar som svarer direkte på spørsmålet. Hold det enkelt nok til at alle kan forstå det.",
    }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "string",
      options: {
        list: [
          { title: "Generelt", value: "general" },
          { title: "Installasjon", value: "installation" },
          { title: "Vedlikehold", value: "maintenance" },
          { title: "Priser", value: "pricing" },
        ],
      },
    }),
    defineField({
      name: "siteId",
      title: "Nettsted-ID",
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "workspace",
      title: "Arbeidsområde",
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "order",
      title: "Visningsrekkefølge",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "deployment",
      title: "Publiseringsstatus",
      type: "deploymentMeta",
    }),
  ],
  preview: {
    select: {
      title: "title",
      richText: "richText",
    },
    prepare: ({ title, richText }) => {
      // Create a playful subtitle with emojis
      const subtitle = `${parseRichTextToString(richText, 20)}`;

     return {
       title: `❓ ${title || "Uten tittel"}`,
       subtitle,
     };
    },
  },
});
