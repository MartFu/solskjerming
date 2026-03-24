import { GROUP } from "@/utils/constant";
import { defineField } from "sanity";
import type { FieldDefinition } from "sanity";

interface OrganizationFieldOptions {
  nameDescription?: string;
  organizationNumberDescription?: string;
  emailDescription?: string;
  phoneDescription?: string;
  addressDescription?: string;
  logoDescription?: string;
  faviconDescription?: string;
  includeLogo?: boolean;
  includeFavicon?: boolean;
  includeOrganizationFields?: boolean;
  includeAdressFields?: boolean;
  includeContactFields?: boolean;
}

export function createOrganizationFields(
  options: OrganizationFieldOptions = {},
): FieldDefinition[] {
  const {
    nameDescription = "Det juridiske navnet på organisasjonen som eier nettstedet, f.eks. «Solskjerming AS».",
    organizationNumberDescription = "Norsk organisasjonsnummer (9 siffer), f.eks. «123 456 789».",
    emailDescription = "Primær kontakt-e-post for organisasjonen.",
    phoneDescription = "Primært telefonnummer, f.eks. «+47 123 45 678».",
    addressDescription = "Organisasjonens fysiske adresse.",
    logoDescription = "Organisasjonens logo. Vises på flere steder i nettstedet, f.eks. i navigasjon.",
    faviconDescription = "Ikonet som vises i nettleserfanen.",
    includeLogo = true,
    includeFavicon = true,
    includeOrganizationFields = true,
    includeAdressFields = true,
    includeContactFields = true,
  } = options;

  const organizationFields: FieldDefinition[] = [
    defineField({
      name: "name",
      title: "Juridisk navn",
      type: "string",
      group: GROUP.IDENTITY,
      description: nameDescription,
    }),
    defineField({
      name: "organizationNumber",
      title: "Organisasjonsnummer",
      type: "string",
      group: GROUP.IDENTITY,
      description: organizationNumberDescription,
    }),
  ];

  const contactFields: FieldDefinition[] = [
    defineField({
      name: "email",
      title: "E-postadresse",
      type: "string",
      group: GROUP.IDENTITY,
      description: emailDescription,
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: "phone",
      title: "Telefonnummer",
      type: "string",
      group: GROUP.IDENTITY,
      description: phoneDescription,
    }),
  ];

  const addressFields: FieldDefinition = defineField({
    name: "address",
    title: "Adresse",
    type: "address",
    group: GROUP.IDENTITY,
    description: addressDescription,
  });

  const fields: FieldDefinition[] = [];

  if (includeOrganizationFields) {
    fields.push(...organizationFields);
  }

  if (includeContactFields) {
    fields.push(...contactFields);
  }

  if (includeAdressFields) {
    fields.push(addressFields);
  }

  if (includeLogo) {
    fields.push(
      defineField({
        name: "logo",
        title: "Logo",
        type: "image",
        group: GROUP.BRANDING,
        description: logoDescription,
        options: { hotspot: true },
      }),
    );
  }

  if (includeFavicon) {
    fields.push(
      defineField({
        name: "favicon",
        title: "Favicon",
        type: "image",
        group: GROUP.BRANDING,
        description: faviconDescription,
      }),
    );
  }

  return fields;
}
