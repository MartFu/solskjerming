import { createClient } from "@sanity/client";
import { env } from "@workspace/env/server";
import { env as clientEnv } from "@workspace/env/client";

export const buildClient = createClient({
  projectId: clientEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: clientEnv.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: clientEnv.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false, // Always fresh at build time
  perspective: "published", // Never drafts
  token: env.SANITY_API_READ_TOKEN,
});

export async function sanityFetchBuild<T>({
  query,
  params,
}: {
  query: string;
  params?: Record<string, any>;
}): Promise<T> {
  return buildClient.fetch(query, params);
}
