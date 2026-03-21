import { useCallback, useEffect, useMemo, useState } from "react";
import { Autocomplete, Stack, Text } from "@sanity/ui";
import { InputProps, set, unset } from "sanity";

const SCHEMA_CACHE_KEY = "sanity_schema_org_types_v3";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Define "Recommended" types based on where the field is used
const CONTEXT_RECOMMENDATIONS: Record<string, string[]> = {
  page: [
    "Article",
    "BlogPosting",
    "WebPage",
    "AboutPage",
    "ContactPage",
    "FAQPage",
  ],
  site: ["Organization", "WebSite", "LocalBusiness", "Corporation"],
  product: ["Product", "IndividualProduct", "SomeProducts"],
  default: ["Thing", "CreativeWork", "Organization"],
};

export function SchemaAutocomplete(props: InputProps & { filterContext?: string }) {
  // Access the custom 'filterContext' passed from the schema
  const {
    elementProps,
    onChange,
    value = "",
    filterContext = "default",
  } = props;
  const [options, setOptions] = useState<
    { value: string; payload: { name: string } }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (options.length > 0) return;

    const cached = localStorage.getItem(SCHEMA_CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        setOptions(data);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch("https://schema.org/docs/tree.jsonld");
      const json = await response.json();

      const allTypes = new Set<string>();
      const extract = (node: any) => {
        if (node.name) allTypes.add(node.name);
        if (node.children) node.children.forEach(extract);
      };
      extract(json);

      const cleanedOptions = Array.from(allTypes)
        .sort()
        .map((name) => ({
          value: name,
          payload: { name },
        }));

      localStorage.setItem(
        SCHEMA_CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data: cleanedOptions,
        }),
      );
      setOptions(cleanedOptions);
    } catch (err) {
      console.error("Failed to fetch Schema types", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Context-Aware Filtering ──────────────────────────────────────────
  // We prioritize recommended types at the top of the search results
  const filteredOptions = useMemo(() => {
    const recommendations = CONTEXT_RECOMMENDATIONS[filterContext] || [];

    // Sort logic: If it's in recommendations, bring it to the top
    return [...options].sort((a, b) => {
      const aRec = recommendations.indexOf(a.value) !== -1;
      const bRec = recommendations.indexOf(b.value) !== -1;
      if (aRec && !bRec) return -1;
      if (!aRec && bRec) return 1;
      return a.value.localeCompare(b.value);
    });
  }, [options, filterContext]);

  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue ? set(newValue) : unset());
    },
    [onChange],
  );



  return (
    <Stack space={2}>
      <Autocomplete
        {...elementProps}
        id="schema-type-search"
        loading={loading}
        options={filteredOptions}
        placeholder={`Søk type (Anbefalt: ${CONTEXT_RECOMMENDATIONS[filterContext][0]}...)`}
        onSelect={handleChange}
        onChange={handleChange}
        value={typeof value === "string" ? value : ""}
        // Custom render to show a "star" or label next to recommended types
        renderOption={(option) => (
          <Stack
            padding={2}
            space={2}
          >
            <Text size={1}>
              {option.value}
              {CONTEXT_RECOMMENDATIONS[filterContext].includes(option.value) &&
                " ✨"}
            </Text>
          </Stack>
        )}
      />
    </Stack>
  );
}


export const PageSchemaInput = (props: InputProps) => (
  <SchemaAutocomplete
    {...props}
    filterContext="page"
  />
);

export const SiteSchemaInput = (props: InputProps) => (
  <SchemaAutocomplete
    {...props}
    filterContext="site"
  />
);

export const ProductSchemaInput = (props: InputProps) => (
  <SchemaAutocomplete
    {...props}
    filterContext="product"
  />
);