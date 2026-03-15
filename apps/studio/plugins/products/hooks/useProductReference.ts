import { useEffect, useState, useCallback } from "react";
import { useClient } from "sanity";
import { PRODUCT_REFERENCES_QUERY } from "../queries";
import type { ProductReference } from "../types";
import { API_VERSION } from "@/utils/constant";

export function useProductReferences(productId: string | null) {
  const client = useClient({ apiVersion: API_VERSION });

  const [references, setReferences] = useState<ProductReference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!productId) {
      setReferences([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const refs = await client.fetch<ProductReference[]>(
        PRODUCT_REFERENCES_QUERY,
        {
          productId,
        },
      );
      setReferences(refs);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [client, productId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  /**
   * Open any referenced document in the Studio's default document pane.
   * This navigates via the router so it works inside the tool frame.
   */
  const openReference = useCallback((ref: ProductReference) => {
    // Construct the Sanity Studio intent URL
    const intentUrl = `/intent/edit/id=${ref._id};type=${ref._type}/`;
    window.location.hash = intentUrl;
  }, []);

  return { references, loading, error, refresh: fetch, openReference };
}
