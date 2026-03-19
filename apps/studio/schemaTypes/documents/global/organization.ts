import { GROUP, GROUPS } from "@/utils/constant";
import { UsersIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const globalOrganization = defineType({
  name: "globalOrganization",
  title: "Organisasjon",
  type: "document",
  icon: UsersIcon,
  groups: GROUPS(GROUP.IDENTITY),
  fields: [
    defineField({
      name: "name",
      title: "Juridisk navn",
      type: "string",
      group: GROUP.IDENTITY,
      description:
        "Det juridiske navnet på organisasjonen, f.eks. «Solskjerming AS». Arves av nettsteder i bunntekst og kontaktsider.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "organizationNumber",
      title: "Organisasjonsnummer",
      type: "string",
      group: GROUP.IDENTITY,
      description:
        "Norsk organisasjonsnummer (9 siffer), f.eks. «123 456 789». Kreves på e-handelssider og i bunntekst.",
    }),
    defineField({
      name: "email",
      title: "E-postadresse",
      type: "string",
      group: GROUP.IDENTITY,
      description: "Primær kontakt-e-post for organisasjonen.",
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: "phone",
      title: "Telefonnummer",
      type: "string",
      group: GROUP.IDENTITY,
      description: "Primært telefonnummer, f.eks. «+47 123 45 678».",
    }),
    defineField({
      name: "address",
      title: "Adresse",
      type: "address",
      group: GROUP.IDENTITY,
      description: "Organisasjonens fysiske adresse. Arves av kontaktsider.",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: GROUP.IDENTITY,
      description:
        "Organisasjonens logo. Arves av nye nettsteder som ikke har sin egen logo.",
      options: { hotspot: true },
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
      group: GROUP.IDENTITY,
      description:
        "Ikonet som vises i nettleserfanen. Arves av nye nettsteder som ikke har sitt eget favicon.",
    }),
    defineField({
      name: "linkedin",
      title: "LinkedIn-URL",
      type: "string",
      group: GROUP.SOME,
      description:
        "Fullstendig URL til LinkedIn-profil eller bedriftsside. Arves av nettsteder uten egne lenker.",
    }),
    defineField({
      name: "facebook",
      title: "Facebook-URL",
      type: "string",
      group: GROUP.SOME,
      description: "Fullstendig URL til Facebook-profil eller side.",
    }),
    defineField({
      name: "instagram",
      title: "Instagram-URL",
      type: "string",
      group: GROUP.SOME,
      description: "Fullstendig URL til Instagram-profil.",
    }),
    defineField({
      name: "youtube",
      title: "YouTube-URL",
      type: "string",
      group: GROUP.SOME,
      description: "Fullstendig URL til YouTube-kanal.",
    }),
    defineField({
      name: "twitter",
      title: "Twitter/X-URL",
      type: "string",
      group: GROUP.SOME,
      description: "Fullstendig URL til Twitter/X-profil.",
    }),
  ],
  preview: {
    select: { title: "name" },
    prepare: ({ title }) => ({
      title: title ?? "Organisasjon",
    }),
  },
});
