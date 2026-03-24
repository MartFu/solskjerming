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

const SETTINGS_ID = "studioSettings";

export function useStudioSettings(): StudioSettings {
  const client = useClient({ apiVersion: API_VERSION });
  const [settings, setSettings] = useState<StudioSettings>(DEFAULTS);

  const query = `*[_id == $id][0]{ "enabled": tabs.enabled, "maxTabs": tabs.maxTabs }`;
  const params = useMemo(() => ({ id: SETTINGS_ID }), []);

  useEffect(() => {
    // 1. Function to fetch current data
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

    // 2. Initial Fetch
    fetchSettings();

    // 3. Set up the Real-time Listener
    const subscription = client
      .listen(query, params, {
        visibility: "query",
        events: ["mutation"],
      })
      .subscribe((update) => {
        console.log("-- Settings changed in Sanity --", update);
        // You can use the result from the update directly if projected,
        // but re-fetching is the most reliable way to get the final state.
        fetchSettings();
      });

    return () => subscription.unsubscribe();
  }, [client, query, params]);

  return settings;
}
