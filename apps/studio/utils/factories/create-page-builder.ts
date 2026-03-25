import { defineArrayMember, defineType, SchemaTypeDefinition } from "sanity";

/**
 * Creates a named pagebuilder array type from a set of block schemas.
 *
 * Each root document type gets its own pagebuilder variant with a curated
 * set of allowed blocks. For example:
 *
 *   createPageBuilder("pageBuilder", pageBlocks)
 *   createPageBuilder("blogRootPageBuilder", blogRootBlocks)
 *
 * The insert menu renders block thumbnails from /static/thumbnails/.
 */
export function createPageBuilder(
    name: string,
    blocks: readonly SchemaTypeDefinition[],
) {
    return defineType({
        name,
        type: "array",
        of: blocks.map((block) => defineArrayMember({ type: block.name })),
        options: {
            insertMenu: {
                views: [
                    {
                        name: "grid",
                        previewImageUrl: (schemaTypeName) => {
                            const kebabCase = schemaTypeName
                                .replace(/([a-z])([A-Z])/g, "$1-$2")
                                .toLowerCase();
                            return `/static/thumbnails/preview-${kebabCase}.png`;
                        },
                    },
                ],
            },
        },
    });
}
