"use client";

import { QuerySitesListResult } from "@workspace/sanity/types";
// components/site-picker.tsx
//
// Rendered when no siteId is present in the URL. Shows a list of available
// Sanity sites and redirects to /[siteId]/ on selection.
// This is a preview-mode-only component — it should never be reachable in a
// static build since SITE_ID is required for that path.

import { useRouter } from "next/navigation";



type SitePickerProps = {
  sites: QuerySitesListResult;
};

export function SitePicker({ sites }: SitePickerProps) {
  const router = useRouter();

  function handleSelect(slug: string) {
    router.push(`/${slug}`);
  }

  if (!sites.length) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md space-y-3 rounded-lg border border-muted bg-muted/40 p-8 text-center">
          <h1 className="text-lg font-semibold">No sites found</h1>
          <p className="text-sm text-muted-foreground">
            No site documents were found in Sanity. Create a site document in
            your Sanity Studio to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Select a site to preview</h1>
          <p className="text-sm text-muted-foreground">
            You are running the preview app without a site selected. Choose one
            below to continue.
          </p>
        </div>

        <ul className="space-y-2">
          {sites.map((site) => (
            <li key={site._id}>
              <button
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => handleSelect(site.slug)}
                type="button"
              >
                <span className="font-medium">{site.title}</span>
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  {site.slug}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
