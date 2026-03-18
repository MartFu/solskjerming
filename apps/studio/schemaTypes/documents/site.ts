import { GROUP, GROUPS } from "@/utils/constant";
import { ComposeIcon, ColorWheelIcon, WrenchIcon } from "@sanity/icons";
import { defineField, defineType, FieldGroupDefinition } from "sanity";
import { enabledPackagesField } from "../definitions/enabled-packages";
import {SlugDomainInput} from "@/components/inputs/slug-domain-input";

export const site = defineType({
    name: "site",
    title: "Nettside",
    type: "document",
    groups: GROUPS(GROUP.IDENTITY),
    icon: WrenchIcon,
    fields: [
        defineField({
            name: "title",
            title: "Tittel",
            type: "string",
            group: GROUP.IDENTITY,
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "logo",
            title: "Logo",
            type: "image",
            group: GROUP.BRANDING,
            options: { hotspot: true },
        }),
        defineField({
            name: "favicon",
            title: "Favicon",
            type: "image",
            group: GROUP.BRANDING,
        }),
        defineField({
            name: "workspace",
            title: "Arbeidsrom",
            type: "string",
            group: GROUP.RELATIONSHIPS,
            readOnly: true,
            options: {
                list: [
                    { title: "Solskjerming", value: "solskjerming" },
                    { title: "Vannsport", value: "vannsport" },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        enabledPackagesField,
        defineField({
            name: "siteIdentity",
            title: "Nettadresse",
            group: GROUP.IDENTITY,
            type: "object",
            components: {
                input: SlugDomainInput,

            },
        
            fields: [
                defineField({
                    name: "slug",
                    title: "Nettadresse-ID",
                    type: "slug",
                    description:
                        "Brukes som subdomene for forhåndsvisning (f.eks. terrassemarkise)",
                    options: {
                        source: "title",
                        slugify: (input: string) =>
                            input
                                .toLowerCase()
                                .trim()
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9-]/g, ""),
                    },

                    validation: (Rule) => Rule.required(),
                }),
                defineField({
                    name: "domain",
                    title: "Domene",
                    type: "string",
                    description:
                        "Eget domene (.no, .se eller .dk). F.eks.: terrassemarkise.no",
                    validation: (Rule) =>
                        Rule.custom((value) => {
                            if (!value) return true; // Optional field
                            const pattern =
                                /^[a-zA-Z0-9æøåäöüé-]+\.(no|se|dk)$/;
                            if (!pattern.test(value)) {
                                return "Domenet må være et gyldig .no, .se eller .dk-domene";
                            }
                            return true;
                        }),
                }),
            ],
        }),

        defineField({
            name: "social",
            group: GROUP.BRANDING,
            title: "SOME-lenker",
            type: "socialLinks",
        }),

        defineField({
            name: "contact",
            group: GROUP.BRANDING,
            title: "Kontaktinformasjon",
            description: "Arver fra organisasjon hvis tom",
            type: "address",
        }),
    ],
    preview: {
        select: {
            title: "title",
            workspace: "workspace",
        },
        prepare({ title, workspace }) {
            return {
                title:
                    `${title.slice(0, 1).toUpperCase() + title.slice(1)}` ||
                    "Nettsted uten tittel",
                subtitle:
                    workspace.slice(0, 1).toUpperCase() + workspace.slice(1),
            };
        },
    },
});
