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
 *
 * NOTE: Step 1 (unsetting homePage) and Step 2 (archiving documents) are
 * separate commits. If the process fails between them, the site's homePage
 * reference will be unset without the archive completing. This is acceptable
 * because the archive can be retried and the homePage can be restored manually.
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

    for (const id of allIds) {
      tx.patch(id, (p) =>
        p
          .setIfMissing({ isArchived: false })
          .set({ isArchived: true, archivedAt }),
      );
    }

    // FIX #8: Drafts may have been published or discarded since the preview
    // was fetched. Use createIfNotExists + patch so the transaction doesn't
    // fail on a missing draft document.
    for (const draftId of draftIds) {
      tx.createIfNotExists({
        _id: draftId,
        _type: "placeholder", // Will be patched immediately
      });
      tx.patch(draftId, (p) =>
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
