import { DATASET, PROJECT_ID } from "./env";

export async function fetchProjectStats() {
  const url = `https://${PROJECT_ID}.api.sanity.io/v1/data/stats/${DATASET}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        // Inkluder token hvis prosjektet krever autentisering for stats
        // ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }),
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        `Kunne ikke hente statistikk: ${res.status} ${res.statusText}. ${errorData?.message || ""}`,
      );
    }

    
    const data = await res.json();
    console.log("SANITY STATS", data)
    return data;
  } catch (error) {
    console.error("Error fetching Sanity-stats:", error);
    throw error;
  }
}
