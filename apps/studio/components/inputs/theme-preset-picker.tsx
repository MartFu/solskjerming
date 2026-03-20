import { Badge, Box, Button, Card, Flex, Grid, Stack, Text } from "@sanity/ui";

import type { ColorTokens, Theme } from "@/utils/themes";
import { themes } from "@/utils/themes";
import { useState } from "react";

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

function ThemeCard({
  theme,
  focus,
  onApply,
}: {
  theme: Theme;
  focus: "light" | "dark" | undefined;
  onApply: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const lightHeight = focus === "light" || !focus ? 32 : 20;
  const darkHeight = focus === "dark" ? 32 : 20;

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Flex
        direction={"column"}
        justify={"space-between"}
        gap={0}
      >
        <Flex
          padding={2}
          justify="space-between"
        >
          <Stack space={2}>
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
              Modus: Lys, mørk
            </Text>
          </Stack>

          <Box style={{ opacity: isHovered ? 1 : 0, transition: "ease"}}>
            <Badge tone="suggest" padding={2}>
              <Text
                size={0}
                style={{ lineHeight: 1.8 }}
              >
                Bruk tema
              </Text>
            </Badge>
          </Box>
        </Flex>

        <Card border>
          <Stack space={0}>
            {/* Light mode palette — taller, primary view */}
            <ColorStrip
              tokens={theme.light}
              height={lightHeight}
            />
            {/* Dark mode palette — narrower hint strip */}
            <ColorStrip
              tokens={theme.dark}
              height={darkHeight}
            />
          </Stack>
        </Card>
      </Flex>
    </Button>
  );
}

// ─── Preset strip ─────────────────────────────────────────────────────────────

export function ThemePresetPicker({
  focusTheme,
  onApply,
}: {
  focusTheme?: "light" | "dark";
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
        {themes.map((t) => (
          <ThemeCard
            key={t.name}
            theme={t}
            onApply={() => onApply(t)}
            focus={focusTheme}
          />
        ))}
      </Grid>
    </Card>
  );
}
