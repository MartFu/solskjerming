import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { GROUPS } from "@/utils/constant";
import { createOrganizationFields } from "@/utils/factories/create-organization-fields";
import { createSocialFields } from "@/utils/factories/create-social-fields";
import { asStudioIcon } from "@/utils/helper";
import { Building2 } from "lucide-react";
import { defineType } from "sanity";

export const globalOrganization = defineType({
  name: DOCUMENT_NAMES.globalOrganization,
  title: "Organisasjon",
  type: "document",
  icon: asStudioIcon(Building2),
  groups: GROUPS(),
  fields: [
    ...createOrganizationFields({
      nameDescription:
        "Det juridiske navnet på organisasjonen, f.eks. «Solskjerming AS». Arves av nettsteder i bunntekst og kontaktsider.",
      organizationNumberDescription:
        "Norsk organisasjonsnummer (9 siffer), f.eks. «123 456 789». Kreves på e-handelssider og i bunntekst.",
      emailDescription: "Primær kontakt-e-post for organisasjonen.",
      phoneDescription: "Primært telefonnummer, f.eks. «+47 123 45 678».",
      addressDescription:
        "Organisasjonens fysiske adresse. Arves av kontaktsider.",
      logoDescription:
        "Organisasjonens logo. Arves av nye nettsteder som ikke har sin egen logo.",
      faviconDescription:
        "Ikonet som vises i nettleserfanen. Arves av nye nettsteder som ikke har sitt eget favicon.",
    }),
    ...createSocialFields({
      linkedinDescription:
        "Fullstendig URL til LinkedIn-profil eller bedriftsside. Arves av nettsteder uten egne lenker.",
      facebookDescription: "Fullstendig URL til Facebook-profil eller side.",
      instagramDescription: "Fullstendig URL til Instagram-profil.",
      youtubeDescription: "Fullstendig URL til YouTube-kanal.",
      twitterDescription: "Fullstendig URL til Twitter/X-profil.",
    }),
  ],
  preview: {
    select: { title: "name" },
    prepare: ({ title }) => ({
      title: title ?? "Organisasjon",
    }),
  },
});
