import { ShieldCheck } from "lucide-react";
import { defineField, defineType } from "sanity";

export const globalCookieConsent = defineType({
  name: "globalCookieConsent",
  title: "Cookiesamtykke",
  type: "document",
  icon: ShieldCheck,
  fields: [
    defineField({
      name: "bannerTitle",
      title: "Bannertittel",
      type: "string",
      description: "Overskriften i cookie-banneret, f.eks. «Vi bruker informasjonskapsler».",
    }),
    defineField({
      name: "bannerDescription",
      title: "Bannertekst",
      type: "text",
      description:
        "Kort forklaring i banneret om hvorfor nettstedet bruker informasjonskapsler.",
    }),
    defineField({
      name: "necessaryLabel",
      title: "Nødvendige - etikett",
      type: "string",
      description: "Navn på kategorien for nødvendige informasjonskapsler.",
      initialValue: "Nødvendige",
    }),
    defineField({
      name: "necessaryDescription",
      title: "Nødvendige - beskrivelse",
      type: "text",
      description: "Forklaring til brukeren om hva nødvendige informasjonskapsler brukes til.",
    }),
    defineField({
      name: "analyticsLabel",
      title: "Analyse - etikett",
      type: "string",
      description: "Navn på kategorien for analyseinformasjonskapsler.",
      initialValue: "Analyse",
    }),
    defineField({
      name: "analyticsDescription",
      title: "Analyse - beskrivelse",
      type: "text",
      description:
        "Forklaring til brukeren om hva analyseinformasjonskapsler brukes til (f.eks. Google Analytics).",
    }),
    defineField({
      name: "marketingLabel",
      title: "Markedsføring - etikett",
      type: "string",
      description: "Navn på kategorien for markedsføringsinformasjonskapsler.",
      initialValue: "Markedsføring",
    }),
    defineField({
      name: "marketingDescription",
      title: "Markedsføring - beskrivelse",
      type: "text",
      description:
        "Forklaring til brukeren om hva markedsføringsinformasjonskapsler brukes til (f.eks. Meta Pixel).",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Cookiesamtykke" };
    },
  },
});
