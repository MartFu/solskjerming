import type { SanityClient } from "sanity";
import { SITE_OWNED_TYPES} from "@/schemaTypes/documents";
import { WorkspaceKey } from "../constant";

export type OwnedType = (typeof SITE_OWNED_TYPES)[number];

export type DeletionCandidate = {
  _id: string;
  _type: OwnedType;
  title: string;
  slug?: string;
  parent?: { _id: string; title: string };
  hasDraft: boolean;
};

export type SharedAssetReference = {
  _id: string;
  _type: string;
  title: string;
};

export type SiteDeletionPreview = {
  site: {
    _id: string;
    title: string;
    workspace: WorkspaceKey;
    hasDraft: boolean;
    isAlreadyArchived: boolean;
  };
  owned: DeletionCandidate[];
  sharedAssets: SharedAssetReference[];
  counts: {
    /** Number of published documents (owned + the site document itself) */
    documents: number;
    /** Number of documents that also have a draft */
    drafts: number;
    /** Total mutations: documents + their drafts */
    total: number;
    /** Breakdown of owned documents by type (does NOT include the site doc) */
    byType: Partial<Record<OwnedType, number>>;
  };
};

export async function getSiteDeletionPreview(
  client: SanityClient,
  siteId: string,
): Promise<SiteDeletionPreview> {
  const raw = await client.fetch<{
    site: SiteDeletionPreview["site"] | null;
    owned: DeletionCandidate[];
    sharedRefs: ({ _id: string; _type: string; title: string } | null)[][];
  }>(
    `{
      "site": *[_id == $siteId][0]{
        _id,
        title,
        workspace,
        "hasDraft": defined(*[_id == "drafts." + $siteId][0]),
        "isAlreadyArchived": defined(archivedAt),
      },
      "owned": *[site._ref == $siteId]{
        _id,
        _type,
        title,
        "slug": slug.current,
        "parent": parent->{ _id, title },
        "hasDraft": defined(*[_id == "drafts." + ^._id][0]),
      },
      "sharedRefs": *[site._ref == $siteId]{
        "refs": [
          product->{ _id, _type, title },
          ...coalesce(authors[]->{ _id, _type, title }, []),
        ]
      }.refs,
    }`,
    { siteId },
  );

  if (!raw.site) {
    throw new Error(`Site not found: ${siteId}`);
  }

  // Deduplicate shared asset references across all owned documents
  const seen = new Set<string>();
  const sharedAssets: SharedAssetReference[] = [];

  for (const refs of raw.sharedRefs ?? []) {
    for (const ref of refs ?? []) {
      if (ref && !seen.has(ref._id)) {
        seen.add(ref._id);
        sharedAssets.push(ref);
      }
    }
  }

  const draftsCount =
    raw.owned.filter((d) => d.hasDraft).length + (raw.site.hasDraft ? 1 : 0);

  const byType = Object.fromEntries(
    SITE_OWNED_TYPES.map((t) => [
      t,
      raw.owned.filter((d) => d._type === t).length,
    ]),
  ) as Partial<Record<OwnedType, number>>;

  // FIX #6: `documents` = owned + the site doc itself.
  // `byType` only covers owned docs. The +1 for the site document is
  // intentionally excluded from byType since the site isn't an "owned" type.
  // Added documentation to the type to make this explicit.
  const documents = raw.owned.length + 1;

  return {
    site: raw.site,
    owned: raw.owned,
    sharedAssets,
    counts: {
      documents,
      drafts: draftsCount,
      total: documents + draftsCount,
      byType,
    },
  };
}
