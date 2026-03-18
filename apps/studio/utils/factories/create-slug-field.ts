import { defineField, Slug } from "sanity";
import { API_VERSION, GROUP } from "../constant";
import { isSiteDocument } from "../types";
import {
    createSlugErrorValidator,
    createSlugWarningValidator,
    getDocumentTypeConfig,
} from "../slug-validation";

export const createSiteScopedSlugField = (
    options: {
        group?: string;
        description?: string;
        title?: string;
    } = {},
) => {
    const {
        group = GROUP.IDENTITY,
        description = `Denne sidens URL-sti. Må være unik innenfor nettstedet. Kan genereres automatisk fra tittelen.`,
        title = "URL-sti",
    } = options;

    return defineField({
        name: "slug",
        title,
        type: "slug",
        group,
        description,
        validation: (Rule) => [
            Rule.required().custom((value: Slug | undefined, context) => {
                const { document } = context;

                if (!isSiteDocument(document)) {
                    return "Dette dokumentet må være koblet til et nettsted før URL-stien kan settes.";
                }

                const config = getDocumentTypeConfig(document._type);
                const errorValidator = createSlugErrorValidator(config);
                return errorValidator(value); 
            }),

            // 2. Warnings (Length/Suggestions)
            Rule.custom((value: Slug | undefined, context) => {
                const { document } = context;
                if (!document?._type) return true;

                const config = getDocumentTypeConfig(document._type);
                const warningValidator = createSlugWarningValidator(config);
                return warningValidator(value);
            }).warning(),
        ],
        options: {
            source: "title",
            // Your existing isUnique logic remains the same
            isUnique: async (slug, context) => {
                const { getClient, document } = context;
                const client = getClient({ apiVersion: API_VERSION });

                if (!isSiteDocument(document)) return true;

                const siteId = document?.site?._ref;
                if (!siteId) return true;

                const query = `
        count(*[
          _type == $type
          && slug.current == $slug
          && site._ref == $siteId
          && !(_id in [$draftId, $publishedId])
        ]) == 0
      `;
                const params = {
                    slug,
                    siteId,
                    draftId: document._id,
                    publishedId: document._id.replace("drafts.", ""),
                    type: document._type,
                };

                return client.fetch(query, params);
            },
        },
    });
};
