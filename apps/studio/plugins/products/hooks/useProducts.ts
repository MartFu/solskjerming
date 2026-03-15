import { useEffect, useState, useCallback } from "react";
import { useClient } from "sanity";
import { PRODUCTS_QUERY, FOLDERS_QUERY } from "../queries";
import type { ProductListItem, FolderNode } from "../types";
import { API_VERSION } from "@/utils/constant";

export function useProducts() {
  const client = useClient({ apiVersion: API_VERSION });

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, f] = await Promise.all([
        client.fetch<ProductListItem[]>(PRODUCTS_QUERY),
        client.fetch<FolderNode[]>(FOLDERS_QUERY),
      ]);
      setProducts(p);
      setFolders(f);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetch();

    // Live subscription — refresh on any product or folder mutation
    const sub = client
      .listen('*[_type in ["product","productFolder"]]')
      .subscribe(() => fetch());

    return () => sub.unsubscribe();
  }, [client, fetch]);

  return { products, folders, loading, error, refresh: fetch };
}
