import { EarthGlobeIcon } from "@sanity/icons";
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
import { useState } from "react";

interface PreviewPaneProps {
    url: string;
    loading: boolean;
}

export function PreviewPane({ url, loading }: PreviewPaneProps) {
    const [collapsed, setCollapsed] = useState(false);

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
                    padding={3}
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
                        <Tooltip
                            content={
                                <Text
                                    size={1}
                                    style={{ padding: "4px 8px" }}
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
                                icon={
                                    <ExternalLink
                                        style={{ width: 16, height: 16 }}
                                    />
                                }
                                mode="bleed"
                                padding={2}
                            />
                        </Tooltip>
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
                                style={{
                                    flexShrink: 0,
                                    overflow: "hidden",
                                    textWrap: "nowrap",
                                }}
                                paddingY={2}
                                borderBottom
                            >
                                <Flex
                                    align="center"
                                    gap={2}
                                    paddingLeft={3}
                                    style={{ position: "relative" }}
                                >
                                    <EarthGlobeIcon style={{ flexShrink: 0 }} />
                                    <Text
                                        title={url}
                                        size={1}
                                    >
                                        {url}
                                    </Text>
                                    <Card
                                        paddingRight={3}
                                        paddingLeft={1}
                                        tone="neutral"
                                        style={{
                                            height: "100%",
                                            position: "absolute",
                                            right: 0,
                                            top: 0,
                                            bottom: 0,
                                        }}
                                    >
                                        <Flex
                                            align={"flex-end"}
                                            style={{ height: "100%" }}
                                        >
                                            <Text style={{marginBottom: 2 }} size={1}>...</Text>
                                        </Flex>
                                    </Card>
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
