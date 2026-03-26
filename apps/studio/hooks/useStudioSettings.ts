/**
 * useStudioSettings.ts
 *
 * Subscribes to the singleton "studio-settings" document and returns
 * the current tab configuration with safe defaults.
 *
 * The document is optional — if it hasn't been created yet, defaults apply.
 * Uses a real-time listener so changes in one browser tab are reflected
 * immediately in all open studio instances.
 */

import { useEffect, useMemo, useState } from "react";
import { useClient } from "sanity";
import { API_VERSION } from "@/utils/env";
import { DOCUMENTS } from "@/schemaTypes/constant";

export interface StudioTabSettings {
  enabled: boolean;
  maxTabs: number;
}


export interface StudioSettings extends StudioTabSettings {
  // Placeholder - remove when more settings are attached
  otherSettings?: unknown;
}

const DEFAULTS: StudioTabSettings = {
  enabled: true,
  maxTabs: 5,
};


export function useStudioSettings(): StudioSettings {
  const client = useClient({ apiVersion: API_VERSION });
  const [settings, setSettings] = useState<StudioSettings>(DEFAULTS);

  const query = `*[_id == $id][0]{ "enabled": tabs.enabled, "maxTabs": tabs.maxTabs }`;
  const params = useMemo(() => ({ id: DOCUMENTS.studioSettings }), []);

  useEffect(() => {
    // Function to fetch current data
    const fetchSettings = async () => {
      try {
        const data = await client.fetch(query, params);
        if (data) {
          setSettings({
            enabled: data.enabled ?? DEFAULTS.enabled,
            maxTabs: data.maxTabs ?? DEFAULTS.maxTabs,
          });
        }
      } catch (err) {
        console.error("Failed to fetch studio settings:", err);
      }
    };

    // Initial Fetch
    fetchSettings();

    // Real-time Listener
    const subscription = client
        .listen(query, params, {
            visibility: "query",
            events: ["mutation"],
        })
        .subscribe(fetchSettings);

    return () => subscription.unsubscribe();
  }, [client, query, params]);

  return settings;
}
