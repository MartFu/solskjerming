import { Box, Button, Card, Flex, Grid, Stack, Text } from "@sanity/ui";

import type { ColorTokens, Theme } from "@/utils/themes";
import { themes } from "@/utils/themes";

// ─── Color strip ──────────────────────────────────────────────────────────────
// Shows the 4 most palette-differentiating tokens as equal-width bands.

const PREVIEW_KEYS: (keyof ColorTokens)[] = [
  "background",
  "primary",
  "secondary",
  "accent",
];

function ColorStrip({
  tokens,
  height,
}: {
  tokens: Partial<ColorTokens>;
  height: number;
}) {
  return (
    <Flex>
      {PREVIEW_KEYS.map((key) => (
        <Box
          key={key}
          flex={1}
          style={{ height, background: tokens[key] }}
        />
      ))}
    </Flex>
  );
}

// ─── Single theme card ────────────────────────────────────────────────────────
// #NOTE: When ready to add richer previews, the ThemeCard component is the right place to extend

function ThemeCard({ theme, onApply }: { theme: Theme; onApply: () => void }) {
  return (
    <Button
      as="button"
      radius={2}
      padding={0}
      tone="default"
      mode="bleed"
      style={{
        cursor: "pointer",
        overflow: "hidden",
        textAlign: "left",
      }}
      onClick={onApply}
    >
      <Flex
        direction={"column"}
        justify={"space-between"}
        gap={0}
      >
        <Box padding={2}>
          <Stack space={1}>
            <Text
              size={1}
              weight="semibold"
            >
              {theme.label}
            </Text>
            <Text
              size={0}
              muted
            >
              Lyst · Mørkt
            </Text>
          </Stack>
        </Box>

        <Card border>
          <Stack space={0}>
            {/* Light mode palette — taller, primary view */}
            <ColorStrip
              tokens={theme.light}
              height={32}
            />
            {/* Dark mode palette — narrower hint strip */}
            <ColorStrip
              tokens={theme.dark}
              height={20}
            />
          </Stack>
        </Card>
      </Flex>
    </Button>
  );
}

// ─── Preset strip ─────────────────────────────────────────────────────────────

export function ThemePresetPicker({
  onApply,
}: {
  onApply: (theme: Theme) => void;
}) {
  return (
    <Card borderLeft>
      <Grid
        columns={[2, 2, 2, 2]}
        gap={4}
        paddingTop={2}
        paddingLeft={2}
      >
        {themes.map((theme) => (
          <ThemeCard
            key={theme.name}
            theme={theme}
            onApply={() => onApply(theme)}
          />
        ))}
      </Grid>
    </Card>
  );
}
