import { asStudioIcon } from "@/utils/helper";
import { CheckmarkIcon, CopyIcon, EarthGlobeIcon } from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from "@sanity/ui";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

interface PreviewPaneProps {
  url: string;
  loading: boolean;
}

export function PreviewPane({ url, loading }: PreviewPaneProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Card
      borderLeft
      flex={collapsed ? 0 : 1}
      style={{
        display: "flex",
        flexDirection: "column",
        width: collapsed ? 48 : 420,
        minWidth: collapsed ? 48 : 420,
        position: "relative",
        flexShrink: collapsed ? 1 : 0,
      }}
    >
      {/* Title bar */}
      {!collapsed && (
        <Card
          borderBottom
          padding={4}
          onClick={() => setCollapsed((c) => !c)}
        >
          {/* Title + open externally — hidden when collapsed */}
          <Flex
            align="center"
            justify={"space-between"}
            gap={2}
            flex={1}
          >
            <Text
              size={1}
              weight="semibold"
            >
              Forhåndsvisning
            </Text>
          </Flex>
        </Card>
      )}

      {/* iframe */}
      {!collapsed && (
        <Box
          flex={1}
          style={{ position: "relative", overflow: "hidden" }}
        >
          {!loading && (
            <>
              <Card
                tone="neutral"
                style={{ flexShrink: 0, overflow: "hidden" }}
                paddingY={2}
                borderBottom
              >
                <Flex
                  align="center"
                  gap={2}
                  paddingX={3}
                >
                  <EarthGlobeIcon style={{ flexShrink: 0 }} />
                  <Flex
                    align="center"
                    style={{
                      position: "relative",
                      flex: 1,
                      overflow: "hidden",
                      height: 16,
                    }}
                  >
                    <Text
                      size={1}
                      style={{ whiteSpace: "nowrap", display: "block" }}
                      muted
                    >
                      {url}
                    </Text>
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 32,
                        background:
                          "linear-gradient(to right, transparent, var(--card-bg-color))",
                        pointerEvents: "none",
                      }}
                    />
                  </Flex>
                  <Flex
                    align="center"
                    gap={1}
                  >
                    <Tooltip
                      content={
                        <Text
                          size={1}
                        >
                          {copied ? "Kopiert!" : "Kopier URL"}
                        </Text>
                      }
                      placement="bottom"
                      portal
                    >
                      <Button
                        icon={copied ? CheckmarkIcon : CopyIcon}
                        mode="bleed"
                        padding={2}
                        style={{ flexShrink: 0 }}
                        onClick={() => {
                          navigator.clipboard.writeText(url);
                          setCopied(true);
                        }}
                      />
                    </Tooltip>
                    <Tooltip
                      content={
                        <Text
                          size={1}
                        >
                          Åpne i ny fane
                        </Text>
                      }
                      placement="bottom"
                      portal
                    >
                      <Button
                        as="a"
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        icon={asStudioIcon(ExternalLink)}
                        mode="bleed"
                        padding={2}
                      />
                    </Tooltip>
                  </Flex>
                </Flex>
              </Card>
              <iframe
                key={url}
                src={url}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </>
          )}

          {loading && (
            <Flex
              justify="center"
              align={"center"}
              padding={6}
              flex={1}
            >
              <Spinner />
            </Flex>
          )}
        </Box>
      )}

      {/* Collapsed label — rotated text */}
      {collapsed && (
        <Flex
          flex={1}
          align="flex-start"
          justify="center"
          paddingX={3}
          paddingY={4}
          style={{ overflow: "hidden" }}
          onClick={() => setCollapsed((c) => !c)}
        >
          <Text
            size={1}
            weight="semibold"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(360deg)",
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
          >
            Forhåndsvisning
          </Text>
        </Flex>
      )}
    </Card>
  );
}
