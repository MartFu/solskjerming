import { defineField, FieldDefinition, FieldsetDefinition } from "sanity";
import { GROUP } from "../constant";
import slugify from "slugify";

interface CookieCategory {
  label?: string;
  description?: string;
  isNecessary?: boolean;
}

export const createCookieConsentFields = (): FieldDefinition[] => {
  return [
    // --- STATIC BANNER FIELDS ---
    defineField({
      name: "bannerTitle",
      type: "string",
      title: "Bannertittel",
      description:
        "Overskriften i cookie-banneret, f.eks. «Vi bruker informasjonskapsler».",
      group: GROUP.COOKIES,
    }),
    defineField({
      name: "bannerDescription",
      type: "text",
      rows: 3,
      title: "Bannertekst",
      description:
        "Kort forklaring på hvorfor nettstedet bruker informasjonskapsler i cookie-banneret.",
      group: GROUP.COOKIES,
    }),

    defineField({
      name: "categories",
      title: "Samtykkekategorier",
      description:
        "Legg til, endre eller slett kategorier for informasjonskapsler.",
      type: "array",
      group: GROUP.COOKIES,
      // Setting defaults that are fully editable/deletable by the user
      initialValue: [
        {
          id: "necessary",
          label: "Nødvendige",
          description:
            "Disse er påkrevd for at nettsiden skal fungere teknisk.",
          isNecessary: true,
        },
        {
          id: "analytics",
          label: "Analyse",
          description: "Hjelper oss å forstå hvordan nettsiden brukes.",
          isNecessary: false,
        },
        {
          id: "marketing",
          label: "Markedsføring",
          description: "Brukes for å vise relevante annonser i andre kanaler.",
          isNecessary: false,
        },
      ],
      of: [
        {
          type: "object",
          name: "category",
          title: "Kategori",
          fields: [
            defineField({
              name: "label",
              type: "string",
              title: "Navn på kategori",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "id",
              type: "slug",
              title: "ID / Nøkkel",
              description:
                "Kan benyttes av utviklere for å identifisere kategorien i kode.",
              options: {
                source: (_, ctx) => {
                  const parent = ctx.parent as CookieCategory;
                  return typeof parent.label === "string"
                    ? slugify(parent.label)
                    : "pending";
                },
                maxLength: 20,
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              type: "text",
              rows: 3,
              title: "Beskrivelse",
            }),
            defineField({
              name: "isNecessary",
              type: "boolean",
              title: "Er denne obligatorisk?",
              description: "Hvis påskrudd, kan ikke brukeren velge bort denne.",
              initialValue: false,
            }),
          ],
          // This makes the list in Sanity Studio much easier to read
          preview: {
            select: {
              title: "label",
              isNecessary: "isNecessary",
            },
            prepare({ title, isNecessary }) {
              return {
                title: title,
                subtitle: isNecessary ? "Påkrevd" : "Valgfri",
              };
            },
          },
        },
      ],
    }),
  ];
};

// Use this in your main schema object to define the visual boxes
export const cookieFieldsets: FieldsetDefinition[] = [
  {
    name: "necessary",
    title: "Kategori: Nødvendige",
    options: { collapsible: true },
  },
  {
    name: "analytics",
    title: "Kategori: Analyse",
    options: { collapsible: true },
  },
  {
    name: "marketing",
    title: "Kategori: Markedsføring",
    options: { collapsible: true },
  },
];

/* 


    // --- DYNAMIC CATEGORY FIELDS ---
    // ...categories.flatMap((cat) => [
    //   defineField({
    //     name: `${cat.id}Label`,
    //     type: "string",
    //     title: `${cat.labelTitle} - Etikett`,
    //     group: GROUP.COOKIES,
    //     description: `${cat.labelDesc}`,
    //     fieldset: cat.id,
    //   }),
    //   defineField({
    //     name: `${cat.id}Description`,
    //     type: "text",
    //     rows: 3,
    //     title: `${cat.textTitle} - Beskrivelse`,
    //     description: `${cat.textDesc}`,
    //     group: GROUP.COOKIES,
    //     fieldset: cat.id,
    //   }),
    // ]),

type CookieFieldConfig = {
  id: string;
  labelTitle: string;
  labelDesc: string;
  textTitle: string;
  textDesc: string;
  initialLabel?: string;
};

const categories: CookieFieldConfig[] = [
  {
    id: "necessary",
    labelTitle: "Nødvendige - etikett",
    labelDesc: "Navn på kategorien for nødvendige informasjonskapsler.",
    textTitle: "Nødvendige - beskrivelse",
    textDesc:
      "Forklaring til brukeren om hva nødvendige informasjonskapsler brukes til.",
    initialLabel: "Nødvendige",
  },
  {
    id: "analytics",
    labelTitle: "Analyse - etikett",
    labelDesc: "Navn på kategorien for analyseinformasjonskapsler.",
    textTitle: "Analyse - beskrivelse",
    textDesc:
      "Forklaring til brukeren om hva analyseinformasjonskapsler brukes til.",
    initialLabel: "Analyse",
  },
  {
    id: "marketing",
    labelTitle: "Markedsføring - etikett",
    labelDesc: "Navn på kategorien for markedsføringsinformasjonskapsler.",
    textTitle: "Markedsføring - beskrivelse",
    textDesc:
      "Forklaring til brukeren om hva markedsføringsinformasjonskapsler brukes til.",
    initialLabel: "Markedsføring",
  },
];

*/
