import { TrendingUpDown } from "lucide-react";
import type { SanityClient, SlugValue } from "sanity";
import { defineField, defineType, getDraftId, getPublishedId } from "sanity";

import { API_VERSION } from '@/utils/env';
import { DOCUMENT_NAMES } from "../constant";

type Redirect = {
  source: SlugValue;
  destination: SlugValue;
  permanent: boolean;
  status: string;
};

async function validateRedirectLoop(
  client: SanityClient,
  {
    slug,
    _id,
  }: {
    _id: string;
    slug: string;
  }
) {
  const id = getPublishedId(_id);
  const draftId = getDraftId(_id);
  const existingRedirect = await client.fetch(
    `*[_type == "redirect" && !(_id in $ids) && (source.current == $slug ||  destination.current == $slug)]`,
    { slug, ids: [id, draftId] }
  );
  return existingRedirect.length !== 0;
}

export const redirect = defineType({
  name: DOCUMENT_NAMES.redirect,
  title: "Rediringering",
  type: "document",
  description: "Redirigering for next.config.js",
  fields: [
    defineField({
      name: "status",
      type: "string",
      description: "Aktiver eller deaktiver denne redirigeringen.",
      options: {
        list: [
          { title: "Aktive", value: "active" },
          { title: "Inaktiv", value: "inactive" },
        ],
        layout: "radio",
      },
      initialValue: () => "active",
    }),
    defineField({
      name: "source",
      type: "slug",
      description: "Stien det skal redirigeres fra",
      options: {
        isUnique: () => true,
      },
      validation: (rule) => [
        rule.required(),
        rule.custom<SlugValue>(async (value, { document, getClient }) => {
          const source = value?.current;
          if (!(value && source)) {
            return "Kan ikke være tom";
          }
          if (!source.startsWith("/")) {
            return "Stien må starte med /";
          }

          const destination = (document?.destination as SlugValue)?.current;
          if (source === destination) {
            return "Kilden og destinasjonen kan ikke ha samme URL";
          }
          const client = getClient({ apiVersion: API_VERSION });
          const existingRedirect = await validateRedirectLoop(client, {
            _id: document?._id ?? "",
            slug: source,
          });
          if (existingRedirect) {
            return "Denne konfigurasjonen ville ha skapt en redirigeringsløkke - en redirigering eksisterer allerede fra denne kilden";
          }
          return true;
        }),
      ],
    }),
    defineField({
      name: "destination",
      type: "slug",
      description: "Stien det skal redirigeres til",
      options: {
        isUnique: () => true,
      },
      validation: (rule) => [
        rule.required(),
        rule.custom<SlugValue>(async (value, { getClient, document }) => {
          const destination = value?.current;
          if (!(value && destination)) {
            return "Kan ikke være tom";
          }
          if (!destination.startsWith("/")) {
            return "Stien må starte med /";
          }
          const source = (document as unknown as Redirect)?.source?.current;
          if (destination === source) {
            return "Kilden og destinasjonen kan ikke ha samme URL";
          }
          const client = getClient({ apiVersion: API_VERSION });
          const existingRedirect = await validateRedirectLoop(client, {
            _id: document?._id ?? "",
            slug: destination,
          });
          if (existingRedirect) {
            return "Denne konfigurasjonen ville ha skapt en redirigeringsløkke - en redirigering eksisterer allerede fra denne destinasjonen";
          }
          return true;
        }),
      ],
    }),
    defineField({
      name: "permanent",
      type: "string",
      description:
        "Hvorvidt dette er en permanent (301) eller midlertidig (302) redirigering",
      options: {
        list: [
          { title: "Permanent (301)", value: "true" },
          { title: "Midlertidig (302)", value: "false" },
        ],
        layout: "radio",
      },
      initialValue: () => "true",
    }),
    defineField({
      name: "site",
      type: "reference",
      title: "Nettsted",
      to: [{ type: "site" }],
    }),
  ],
  preview: {
    select: {
      title: "source.current",
      subtitle: "destination.current",
      permanent: "permanent",
      status: "status",
    },
    prepare: ({ title, subtitle, permanent, status }) => ({
      title: `${title ?? "Untitled"} to ${subtitle ?? "Untitled"}`,
      subtitle: `${permanent ? "Permanent" : "Temporary"}, ${status}`,
      media: TrendingUpDown,
    }),
  },
});
