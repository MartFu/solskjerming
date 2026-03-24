import React, { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Inline,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from "@sanity/ui";
import { fetchProjectStats } from "@/utils/fetch-project-stats";
import { formatBytes } from "@/utils/helper";
import { InfoOutlineIcon, RetryIcon, WarningOutlineIcon } from "@sanity/icons";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatValue {
  value: number;
  limit: number;
  unit: "byte" | "number";
}

interface ProjectStatsData {
  documents: {
    count: StatValue;
    sizeSum: StatValue;
    jsonSizeSum: StatValue;
  };
  fields: { count: StatValue };
  types: { count: StatValue };
  releases: {
    count: StatValue;
    billableCount: StatValue;
  };
  stale: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (stat: StatValue) =>
  stat.unit === "byte"
    ? formatBytes(stat.value)
    : stat.value.toLocaleString("nb-NO");

const fmtLimit = (stat: StatValue) =>
  stat.unit === "byte"
    ? formatBytes(stat.limit)
    : stat.limit.toLocaleString("nb-NO");

const pct = (stat: StatValue): number | null =>
  stat.limit > 0
    ? Math.min(Math.round((stat.value / stat.limit) * 100), 100)
    : null;

function usageTone(
  percentage: number | null,
): "critical" | "caution" | "positive" | "default" {
  if (percentage === null) return "default";
  if (percentage > 90) return "critical";
  if (percentage > 70) return "caution";
  return "positive";
}

// ─── StatCard ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  text?: string;
  stat: StatValue;
  tooltip: string;
}

function StatCard({ label, text, stat, tooltip }: StatCardProps) {
  const percentage = pct(stat);
  const hasLimit = stat.limit > 0;
  const showBar = percentage !== null;

  return (
    <Card
      border
      radius={2}
      paddingX={3}
      paddingTop={4}
      paddingBottom={3}
      flex={1}
      style={{ position: "relative" }}
    >
      <Inline style={{ position: "absolute", top: -10, left: 8 }}>
        <Card
          tone="primary"
          paddingY={1}
          paddingX={2}
        >
          <Flex
            align="center"
            gap={2}
          >
            <Text
              size={1}
              muted
            >
              {label}
            </Text>
            <Tooltip
              content={
                <Box
                  padding={2}
                  style={{ maxWidth: 260 }}
                >
                  <Text
                    size={1}
                    muted
                  >
                    {tooltip}
                  </Text>
                </Box>
              }
              placement="top"
              portal
            >
              <Text
                size={0}
                muted
                style={{ cursor: "help", lineHeight: 1 }}
              >
                <InfoOutlineIcon />
              </Text>
            </Tooltip>
          </Flex>
        </Card>
      </Inline>
      <Stack
        space={3}
        flex={1}
      >
        <Flex
          align="center"
          justify="space-between"
          gap={4}
          flex={1}
        >
          <Flex
            align="baseline"
            gap={1}
          >
            <Text
              size={2}
              weight="semibold"
            >
              {fmt(stat)}
            </Text>
            {hasLimit && (
              <Text
                size={0}
                muted
              >
                av {fmtLimit(stat)}
              </Text>
            )}
          </Flex>
        </Flex>
        {showBar && (
          <Box
            flex={1}
            style={{
              height: 4,
              borderRadius: 2,
              marginTop: 2,
              background: "var(--card-border-color)",
              overflow: "hidden",
            }}
          >
            <Box
              style={{
                width: `${percentage}%`,
                height: "100%",
                borderRadius: 2,
                background:
                  percentage! > 90
                    ? "var(--card-critical-bg-color, #f03e2f)"
                    : percentage! > 70
                      ? "var(--card-caution-bg-color, #e5a305)"
                      : "var(--card-focus-ring-color, #2276fc)",
                transition: "width 0.4s ease",
              }}
            />
          </Box>
        )}
        {text && (
            <Text
              size={0}
              muted
            >
              {text}
            </Text>
        )}
      </Stack>
    </Card>
  );
}

// ─── ProjectStats ────────────────────────────────────────────────────────────

export const ProjectStats = () => {
  const [data, setData] = useState<ProjectStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProjectStats();
      setData(res);
    } catch (err) {
      console.error("Stats fetch failed:", err);
      setError("Kunne ikke hente statistikk");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <Flex
        align="center"
        justify="center"
        gap={2}
        paddingY={5}
      >
        <Spinner
          size={1}
          muted
        />
        <Text
          size={1}
          muted
        >
          Henter forbruksdata…
        </Text>
      </Flex>
    );
  }

  if (error || !data) {
    return (
      <Flex
        align="center"
        justify="space-between"
        paddingY={2}
      >
        <Inline space={2}>
          <Text
            size={1}
            muted
          >
            <WarningOutlineIcon />
          </Text>
          <Text
            size={1}
            muted
          >
            Statistikk midlertidig utilgjengelig
          </Text>
        </Inline>
        <Button
          fontSize={1}
          padding={2}
          mode="bleed"
          icon={RetryIcon}
          onClick={loadStats}
          text="Prøv igjen"
        />
      </Flex>
    );
  }

  return (
    <Stack
      space={3}
      paddingY={4}
    >
      {data.stale && (
        <Inline space={2}>
          <Text
            size={0}
            muted
          >
            <WarningOutlineIcon />
          </Text>
          <Text
            size={0}
            muted
          >
            Dataene kan være noe utdaterte
          </Text>
        </Inline>
      )}

      <Grid
        columns={[1, 1, 3, 5]}
        gap={[4, 4, 3]}
      >
        <StatCard
          label="Dokumenter"
          stat={data.documents.count}
          tooltip="Antall dokumenter i datasettet, inkludert publiserte og utkast."
        />
        <StatCard
          label="Datalagring"
          stat={data.documents.jsonSizeSum}
          tooltip="Total JSON-størrelse for alle dokumenter. Bilder og filer i CDN telles ikke."
        />
        <StatCard
          label="Felt"
          stat={data.fields.count}
          tooltip="Totalt antall felt på tvers av alle skjematyper. Grensen avhenger av planen din."
        />
        <StatCard
          label="Utgivelser"
          stat={data.releases.count}
          tooltip="Aktive utgivelser (releases) for å gruppere og publisere innholdsendringer samlet."
        />
        <StatCard
          label="Dokumenttyper"
          text="Ingen begresning"
          stat={data.types.count}
          tooltip="Antall unike dokumenttyper i studiokonfigurasjonen. Bestemmer hvilke innholdstyper som kan opprettes."
        />
      </Grid>
    </Stack>
  );
};
