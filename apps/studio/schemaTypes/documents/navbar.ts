import { LayoutPanelLeft, Link, PanelTop } from "lucide-react";
import { defineField, defineType } from "sanity";

import { lucideIconPreview } from "@/components/icon-preview";
import { buttonsField, iconField, siteRelationField } from "@/schemaTypes/common";
import { DOCUMENT_NAMES } from "../constant";

const navbarLink = defineField({
    name: "navbarLink",
    type: "object",
    icon: Link,
    title: "Navigasjonslenke",
    description: "Individuell navigasjonslenke med tekst og URL.",
    fields: [
        defineField({
            name: "name",
            type: "string",
            title: "Lenkens tekst",
            description: "Teksten som vises på denne lenken.",
        }),
        defineField({
            name: "url",
            type: "customUrl",
            title: "Lenkens URL",
            description: "URL-en denne lenken navigerer til ved klikk.",
        }),
    ],
    preview: {
        select: {
            title: "name",
            externalUrl: "url.external",
            urlType: "url.type",
            internalUrl: "url.internal.slug.current",
            openInNewTab: "url.openInNewTab",
            siteId: "siteId",
        },
        prepare({
            title,
            externalUrl,
            urlType,
            internalUrl,
            siteId,
            openInNewTab,
        }) {
            const url = urlType === "external" ? externalUrl : internalUrl;
            const newTabIndicator = openInNewTab ? " ↗" : "";
            const truncatedUrl =
                url?.length > 30 ? `${url.substring(0, 30)}...` : url;

            return {
                title: title || "Untitled Link",
                subtitle: `${urlType === "external" ? "External" : "Internal"} • ${truncatedUrl}${newTabIndicator}  • ${siteId}`,
                media: Link,
            };
        },
    },
});

const navbarColumnLink = defineField({
  name: "navbarColumnLink",
  type: "object",
  icon: LayoutPanelLeft,
  title: "Lenke i navigasjonskolonne",
  fields: [
    iconField,
    defineField({
      name: "name",
      type: "string",
      title: "Lenkens tekst",
      description: "Teksten som vises på denne lenken.",
    }),
    defineField({
      name: "description",
      type: "string",
      title: "Beskrivelse",
      description: "Navigasjonslenkens beskrivelse.",
    }),
    defineField({
      name: "url",
      type: "customUrl",
      title: "Lenke-URL",
      description: "URL-en denne lenken navigerer til ved klikk.",
    }),
  ],
  preview: {
    select: {
      title: "name",
      externalUrl: "url.external",
      urlType: "url.type",
      internalUrl: "url.internal.slug.current",
      openInNewTab: "url.openInNewTab",
      icon: "icon",
    },
    prepare({ title, icon, externalUrl, urlType, internalUrl, openInNewTab }) {
      const url = urlType === "external" ? externalUrl : internalUrl;
      const newTabIndicator = openInNewTab ? " ↗" : "";
      const truncatedUrl =
        url?.length > 30 ? `${url.substring(0, 30)}...` : url;

      return {
        title: title || "Untitled Link",
        subtitle: `${urlType === "external" ? "Ekstern" : "Intern"} • ${truncatedUrl}${newTabIndicator}`,
        media: lucideIconPreview(icon),
      };
    },
  },
});

const navbarColumn = defineField({
    name: "navbarColumn",
    type: "object",
    icon: LayoutPanelLeft,
    title: "Navigasjonskolonne",
    description: "En kolonne med navigasjonslenker og valgfri tittel",
    fields: [
        defineField({
            name: "title",
            type: "string",
            title: "Kolonnens tittel",
            description:
                "Overskrift som vises over denne kolonnen med lenker.",
        }),
        defineField({
            name: "links",
            type: "array",
            title: "Kolonnes lenker",
            validation: (rule) => [rule.required(), rule.unique()],
            description:
                "The list of navigation links to display in this column",
            of: [navbarColumnLink],
        }),
    ],
    preview: {
        select: {
            title: "title",
            links: "links",
        },
        prepare({ title, links = [] }) {
            return {
                title: title || "Untitled Column",
                subtitle: `${links.length} link${links.length === 1 ? "" : "s"}`,
            };
        },
    },
});

export const navbar = defineType({
  name: DOCUMENT_NAMES.navbar,
  title: "Header",
  type: "document",
  icon: PanelTop,
  description: "Konfigurer hovednavigasjonen til siden.",
  fields: [
    siteRelationField,
    defineField({
      name: "columns",
      type: "array",
      title: "Navigasjonsstruktur",
      description:
        "Bygg ut navigasjonen vha. kolonner og lenker. Legg til en kolonne med lenker, eller kun individuelle lenker.",
      of: [navbarColumn, navbarLink],
    }),
    buttonsField,
  ],
  preview: {
    prepare: () => ({
      title: "Navigasjon",
    }),
  },
});
