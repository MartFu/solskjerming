import { useEffect, useState } from "react";
import { useClient } from "sanity";
import type { ProductsPluginConfig, Site } from "../types";
import { API_VERSION } from "@/utils/constant";



/**
 * Fetches all site documents from the dataset and normalises them into the
 * shape the rest of the plugin expects. Config fields control which document
 * type and which fields to read — so the plugin is not coupled to a specific
 * site schema.
 */
export function useSites(config: ProductsPluginConfig): {
  sites: Site[];
  loading: boolean;
} {
  const client = useClient({ apiVersion: API_VERSION });
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const query = `
      *[_type == "site" && workspace == $workspace] {
        _id,
        title
      }
    `;
    client
      .fetch<Site[]>(query, { workspace: config.workspace})
      .then(setSites)
      .catch((err) => {
        console.warn("[products-plugin] Failed to fetch sites:", err);
        setSites([]);
      })
      .finally(() => setLoading(false));
  }, [client, config.workspace]);

  return { sites, loading };
}
