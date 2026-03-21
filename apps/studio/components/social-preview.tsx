import { useMemo } from "react";
import { Box, Card, Flex, Stack, Text } from "@sanity/ui";
import { useFormValue } from "sanity";

// ─── Types ──────────────────────────────────────────────────────────────────

interface SocialPreviewProps {
  /** Field path prefix if SEO fields are nested inside an object, e.g. "seo" */
  basePath?: string;
  /** Site-level defaults for fallback display */
  siteDefaults?: {
    metaTitle?: string;
    metaDescription?: string;
    titlePrefix?: string;
    titleSuffix?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogSiteName?: string;
    ogImage?: string; // resolved URL
  };
  /** The canonical base URL for SERP display, e.g. "https://example.com" */
  siteUrl?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const truncate = (text: string, max: number): string =>
  text.length > max ? text.slice(0, max - 1) + "…" : text;

const PLACEHOLDER = {
  title: "Sidetittel mangler",
  description:
    "Beskrivelse mangler – legg til en metabeskrivelse for å se forhåndsvisning.",
  url: "example.com",
  siteName: "Nettsted",
};

// ─── Component ──────────────────────────────────────────────────────────────

export function SocialPreview(props: SocialPreviewProps) {
  const {
    basePath,
    siteDefaults = {},
    siteUrl = "https://example.com",
  } = props;

  const prefix = basePath ? `${basePath}.` : "";

  // Read live values from the form
  const metaTitle = useFormValue([`${prefix}metaTitle`]) as string | undefined;
  const metaDescription = useFormValue([`${prefix}metaDescription`]) as
    | string
    | undefined;
  const ogTitle = useFormValue([`${prefix}ogTitle`]) as string | undefined;
  const ogDescription = useFormValue([`${prefix}ogDescription`]) as
    | string
    | undefined;
  const slug = useFormValue(["slug", "current"]) as string | undefined;

  // Resolve with fallbacks
  const resolvedSerpTitle = useMemo(() => {
    const base = metaTitle || siteDefaults.metaTitle || PLACEHOLDER.title;
    const parts = [
      siteDefaults.titlePrefix,
      base,
      siteDefaults.titleSuffix,
    ].filter(Boolean);
    return truncate(parts.join(" "), 60);
  }, [metaTitle, siteDefaults]);

  const resolvedSerpDescription = useMemo(
    () =>
      truncate(
        metaDescription ||
          siteDefaults.metaDescription ||
          PLACEHOLDER.description,
        160,
      ),
    [metaDescription, siteDefaults],
  );

  const resolvedOgTitle = useMemo(
    () =>
      truncate(
        ogTitle || metaTitle || siteDefaults.ogTitle || PLACEHOLDER.title,
        60,
      ),
    [ogTitle, metaTitle, siteDefaults],
  );

  const resolvedOgDescription = useMemo(
    () =>
      truncate(
        ogDescription ||
          metaDescription ||
          siteDefaults.ogDescription ||
          PLACEHOLDER.description,
        160,
      ),
    [ogDescription, metaDescription, siteDefaults],
  );

  const resolvedUrl = useMemo(() => {
    const base = siteUrl.replace(/^https?:\/\//, "");
    return slug ? `${base}/${slug}` : base;
  }, [siteUrl, slug]);

  const siteName = siteDefaults.ogSiteName || PLACEHOLDER.siteName;

  // Character counts
  const titleLength = (metaTitle || "").length;
  const descLength = (metaDescription || "").length;

  return (
    <Stack
      space={5}
      paddingY={4}
    >
      {/* ── Google SERP Preview ────────────────────────────────────── */}
      <Stack space={3}>
        <Text
          size={1}
          weight="semibold"
          muted
        >
          Google-søkeresultat
        </Text>
        <Card
          padding={4}
          radius={2}
          shadow={1}
          style={{ background: "#fff", maxWidth: 600 }}
        >
          <Stack space={2}>
            {/* Favicon + site name + URL */}
            <Flex
              align="center"
              gap={2}
            >
              <Box
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#f1f3f4",
                  flexShrink: 0,
                }}
              />
              <Stack space={1}>
                <Text
                  size={0}
                  style={{ color: "#202124" }}
                >
                  {siteName}
                </Text>
                <Text
                  size={0}
                  style={{ color: "#4d5156" }}
                >
                  {resolvedUrl}
                </Text>
              </Stack>
            </Flex>

            {/* Title */}
            <Text
              size={2}
              style={{
                color: "#1a0dab",
                lineHeight: 1.3,
                cursor: "pointer",
              }}
            >
              {resolvedSerpTitle}
            </Text>

            {/* Description */}
            <Text
              size={1}
              style={{ color: "#4d5156", lineHeight: 1.58 }}
            >
              {resolvedSerpDescription}
            </Text>
          </Stack>
        </Card>

        {/* Character counters */}
        <Flex gap={4}>
          <Text
            size={0}
            muted
          >
            Tittel:{" "}
            <span
              style={{
                color:
                  titleLength > 60
                    ? "#e53e3e"
                    : titleLength > 50
                      ? "#d69e2e"
                      : "#38a169",
              }}
            >
              {titleLength}/60
            </span>
          </Text>
          <Text
            size={0}
            muted
          >
            Beskrivelse:{" "}
            <span
              style={{
                color:
                  descLength > 160
                    ? "#e53e3e"
                    : descLength > 140
                      ? "#d69e2e"
                      : "#38a169",
              }}
            >
              {descLength}/160
            </span>
          </Text>
        </Flex>
      </Stack>

      {/* ── Social / OG Card Preview ──────────────────────────────── */}
      <Stack space={3}>
        <Text
          size={1}
          weight="semibold"
          muted
        >
          Forhåndsvisning ved deling (Facebook / LinkedIn)
        </Text>
        <Card
          radius={2}
          shadow={1}
          style={{
            maxWidth: 500,
            overflow: "hidden",
            border: "1px solid #dadde1",
          }}
        >
          {/* OG Image area */}
          <Box
            style={{
              width: "100%",
              aspectRatio: "1200 / 630",
              background: siteDefaults.ogImage
                ? `url(${siteDefaults.ogImage}) center / cover`
                : "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!siteDefaults.ogImage && (
              <Text
                size={0}
                muted
                style={{ opacity: 0.5 }}
              >
                Mangler delingsbilde
              </Text>
            )}
          </Box>

          {/* OG Text content */}
          <Box
            padding={3}
            style={{ background: "#f0f2f5" }}
          >
            <Stack space={2}>
              <Text
                size={0}
                muted
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontSize: 11,
                }}
              >
                {resolvedUrl}
              </Text>
              <Text
                size={1}
                weight="semibold"
                style={{
                  color: "#1d2129",
                  lineHeight: 1.3,
                }}
              >
                {resolvedOgTitle}
              </Text>
              <Text
                size={0}
                style={{
                  color: "#606770",
                  lineHeight: 1.4,
                }}
              >
                {resolvedOgDescription}
              </Text>
            </Stack>
          </Box>
        </Card>
      </Stack>
    </Stack>
  );
}
