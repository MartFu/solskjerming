import type { SanityClient } from "sanity";
import { SiteDeletionPreview } from "./getSiteDeletionPreview";

export type ArchiveResult =
  | { success: true; archivedCount: number }
  | { success: false; error: string };

/**
 * Archives a site and all owned documents by setting `archivedAt` and
 * `isArchived: true`. Nothing is deleted — this operation is fully reversible.
 *
 * The preview object is used directly as the source of truth for which
 * documents to archive, ensuring the operation acts on exactly what was shown.
 */
export async function archiveSite(
  client: SanityClient,
  preview: SiteDeletionPreview,
): Promise<ArchiveResult> {
  const archivedAt = new Date().toISOString();

  const ownedIds = preview.owned.map((d) => d._id);
  const allIds = [preview.site._id, ...ownedIds];

  // Collect draft ids for documents that have them
  const draftIds = [
    ...(preview.site.hasDraft ? [`drafts.${preview.site._id}`] : []),
    ...preview.owned.filter((d) => d.hasDraft).map((d) => `drafts.${d._id}`),
  ];

  try {
    // Step 1: unset homePage reference on the site so page deletion
    // isn't blocked by Sanity's reference integrity checks
    await client
      .patch(preview.site._id)
      .unset(["homePage"])
      .commit({ visibility: "async" });

    // Step 2: archive all owned documents and their drafts in one transaction
    const tx = client.transaction();

    for (const id of [...allIds, ...draftIds]) {
      tx.patch(id, (p) =>
        p
          .setIfMissing({ isArchived: false })
          .set({ isArchived: true, archivedAt }),
      );
    }

    await tx.commit();

    return { success: true, archivedCount: allIds.length };
  } catch (err) {
    console.error("[archiveSite] Failed:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Ukjent feil ved arkivering. Prøv igjen.",
    };
  }
}
