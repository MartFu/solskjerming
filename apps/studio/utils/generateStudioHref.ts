import { WorkspaceKey } from "./constant";

/**
 * 
 * Generates a href that allows the Studio to resolve
 * any document within a ``Site``. This link automatically bypasses
 * ``Site`` selection in ``WorkspaceView``, as one would otherwise
 * have to do manually. This ensures the ``ToolLayoutProvider`` is happy
 * and ready to go.
 * 
 * @param workspace 
 * @param siteId 
 * @param docId 
 * @param docType 
 * @returns 
 */
export const generateStudioHref = (
  workspace: WorkspaceKey,
  siteId: string,
  docId: string,
  docType: string,
): string => {
  const cleanId = docId.replace(/^drafts\./, "");
  return `/${workspace}/intent/edit/id=${cleanId};type=${docType}?site=${siteId}`;
};
