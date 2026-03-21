import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Stack,
  Text,
  Tooltip,
} from "@sanity/ui";

import type { ThemeTokens, Theme } from "@/utils/themes";
import { themes } from "@/utils/themes";
import { useMemo, useState } from "react";
import { InfoOutlineIcon } from "@sanity/icons";
import { formatThemeAsCSS, getThemeVariables } from "@/utils/themes/themeToCss";
import { CopyButton } from "../copy-button";
import { Divider } from "../divider";

// ─── Color strip ──────────────────────────────────────────────────────────────
// Shows the 4 most palette-differentiating tokens as equal-width bands.

const PREVIEW_KEYS: (keyof ThemeTokens)[] = [
  "background",
  "primary",
  "secondary",
  "accent",
];

function ColorStrip({
  tokens,
  height,
}: {
  tokens: Partial<ThemeTokens>;
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
  isActive,
  onApply,
}: {
  theme: Theme;
  focus: "light" | "dark" | undefined;
  isActive: boolean;
  onApply: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);


  const heights = useMemo(
    () => ({
      light: focus === "light" || !focus ? 32 : 20,
      dark: focus === "dark" ? 32 : 20,
    }),
    [focus],
  );

  return (
    <Button
      as="div"
      radius={2}
      padding={0}
      tone="default"
      mode={isActive ? "ghost" : "bleed"}
      style={{
        cursor: "pointer",
        overflow: "hidden",
        textAlign: "left",
      }}
      onClick={() => {
        if (!isActive) onApply();
      }}
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
            <Flex
              align="center"
              gap={2}
            >
              <Text
                size={1}
                weight="semibold"
              >
                {theme.label}
              </Text>

              {isHovered && (
                <CopyButton
                  tooltip="Kopier tema"
                  value={getThemeVariables(theme)}
                />
              )}
            </Flex>

            <Flex
              gap={3}
              align="center"
            >
              <Flex
                align="center"
                gap={1}
              >
                <Text
                  size={0}
                  muted
                >
                  Lys Modus
                </Text>
                <Tooltip
                  content={
                    <Stack space={2}>
                      {Object.keys(theme.light).map((key) => (
                        <Text
                          key={key}
                          size={0}
                          muted
                        >
                          <strong>{key}</strong>
                          {` -> ${theme.light[key as keyof ThemeTokens]}`}
                        </Text>
                      ))}
                    </Stack>
                  }
                  placement="bottom"
                  portal
                >
                  <InfoOutlineIcon style={{ flexShrink: 0 }} />
                </Tooltip>

                <CopyButton
                  tooltip="Kopier lys"
                  value={formatThemeAsCSS(theme.light)}
                />
              </Flex>

              <Divider />

              <Flex
                align="center"
                gap={1}
              >
                <Text
                  size={0}
                  muted
                >
                  Mørk Modus
                </Text>
                <Tooltip
                  content={
                    <Stack space={2}>
                      {Object.keys(theme.dark).map((key) => (
                        <Text
                          key={key}
                          size={0}
                          muted
                        >
                          <strong>{key}</strong>
                          {`-> ${theme.dark[key as keyof ThemeTokens]}`}
                        </Text>
                      ))}
                    </Stack>
                  }
                  portal
                  placement="bottom-end"
                >
                  <InfoOutlineIcon style={{ flexShrink: 0 }} />
                </Tooltip>

                <CopyButton
                  tooltip="Kopier mørk"
                  value={formatThemeAsCSS(theme.dark, ".dark")}
                />
              </Flex>
            </Flex>
          </Stack>

          <Box style={{ opacity: isHovered || isActive ? 1 : 0, transition: "ease" }}>
            <Badge
              tone="suggest"
              padding={2}
            >
              <Text
                size={0}
                style={{ lineHeight: 1.8 }}
              >
                {isActive ? "Aktiv" : "Bruk tema"}
              </Text>
            </Badge>
          </Box>
        </Flex>

        <Card border>
          <Stack space={0}>
            {/* Light mode palette — taller, primary view */}
            <ColorStrip
              tokens={theme.light}
              height={heights.light}
            />
            {/* Dark mode palette — narrower hint strip */}
            <ColorStrip
              tokens={theme.dark}
              height={heights.dark}
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
  currentPreset
}: {
  focusTheme?: "light" | "dark";
  onApply: (theme: Theme) => void;
  currentPreset: Theme["name"] | undefined;
}) {
  return (
    <Card>
      <Grid
        columns={[1, 1, 1, 2]}
        gap={4}
        paddingTop={2}
      >
        {themes.map((t) => (
          <ThemeCard
            isActive={t.name === currentPreset}
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
