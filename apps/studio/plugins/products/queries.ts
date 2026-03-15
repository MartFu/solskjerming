/**
 * All GROQ queries for the Products plugin.
 * Kept in one place to make it easy to audit and optimise.
 */

/**
 * Fetch all products with their folder reference resolved one level deep.
 * Also fetches the folder's parent so we can reconstruct a breadcrumb.
 */
export const PRODUCTS_QUERY = /* groq */ `
  *[_type == "product"] | order(name asc) {
    _id,
    _rev,
    _updatedAt,
    name,
    "slug": slug.current,
    status,
    pricingType,
    basePrice,
    vatRate,
    "optionCount": count(options),
    "folder": folder->{
      _id,
      name,
      color,
      "parent": parent->{ _id, name }
    }
  }
`;

/**
 * Fetch all product folders, fully flattened (parent ref resolved one level).
 */
export const FOLDERS_QUERY = /* groq */ `
  *[_type == "productFolder"] | order(name asc) {
    _id,
    name,
    color,
    "parent": parent->{ _id, name }
  }
`;

/**
 * Fetch the full product document for the detail / edit pane.
 */
export const PRODUCT_DETAIL_QUERY = /* groq */ `
  *[_type == "product" && _id == $id][0] {
    ...,
    "slug": slug.current,
    "folder": folder->{ _id, name, color }
  }
`;

/**
 * For a given product ID, find every document in the dataset that
 * contains a reference to it — regardless of document type or depth.
 *
 * Uses Sanity's built-in references() function which is indexed and fast.
 */
export const PRODUCT_REFERENCES_QUERY = /* groq */ `
  *[references($productId)] {
    _id,
    _type,
    // Resolve a human-readable title from common title fields
    "title": coalesce(title, name, slug.current, _id),
    // Resolve a site association if the referencing doc has one
    "site": coalesce(
      site->{ _id, title },
      workspace->{ _id, title }
    )
  }
`;
