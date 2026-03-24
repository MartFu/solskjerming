// components/SeoReportsView.tsx
import React, { createContext, useContext, useState } from "react";
import {
    Box,
    Card,
    Container,
    Flex,
    Heading,
    Text,
    Stack,
    Grid,
    Badge,
    Button,
    Spinner,
    Inline,
    Code,
    Select,
    TextInput,
    TabList,
    Tab,
    Label,
    Switch,
    Tooltip,
    Avatar,
    Menu,
    MenuButton,
    MenuItem,
    Dialog,
    useToast,
} from "@sanity/ui";
import { styled } from "styled-components";
import {
    DocumentIcon,
    TrendUpwardIcon,
    SearchIcon,
    ChartUpwardIcon,
    ErrorOutlineIcon,
    LinkIcon,
    CheckmarkIcon,
    CloseIcon,
    InfoOutlineIcon,
    ChevronDownIcon,
    RefreshIcon,
} from "@sanity/icons";

// Types for our SEO Report data
interface SeoReport {
    id: string;
    url: string;
    date: string;
    overallScore: number;
    metrics: SeoMetrics;
    keywords: KeywordRanking[];
    pages: PageSeo[];
    technical: TechnicalSeo;
}

interface SeoMetrics {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
}

interface KeywordRanking {
    keyword: string;
    position: number;
    volume: number;
    difficulty: number;
    previousPosition?: number;
    trend: "up" | "down" | "stable";
}

interface PageSeo {
    url: string;
    title: string;
    metaDescription: string;
    headingStructure: string[];
    score: number;
    issues: string[];
}

interface TechnicalSeo {
    crawlErrors: number;
    brokenLinks: number;
    redirects: number;
    sitemapPresent: boolean;
    robotsTxt: string;
    mobileOptimized: boolean;
}

// Context for SEO data
interface SeoReportsContextValue {
    reports: SeoReport[];
    currentReport: SeoReport | null;
    loading: boolean;
    setCurrentReport: (report: SeoReport) => void;
    refresh: () => void;
}

const SeoReportsContext = createContext<SeoReportsContextValue | undefined>(
    undefined,
);

export const useSeoReports = () => {
    const context = useContext(SeoReportsContext);
    if (!context) {
        throw new Error("useSeoReports must be used within SeoReportsProvider");
    }
    return context;
};

// Mock data generator
const generateMockReports = (): SeoReport[] => {
    const mockData: SeoReport[] = [
        {
            id: "1",
            url: "https://example.com",
            date: "2024-01-15",
            overallScore: 87,
            metrics: {
                performance: 92,
                accessibility: 85,
                bestPractices: 88,
                seo: 83,
            },
            keywords: [
                {
                    keyword: "web design services",
                    position: 3,
                    volume: 1200,
                    difficulty: 65,
                    trend: "up",
                },
                {
                    keyword: "digital agency",
                    position: 8,
                    volume: 3400,
                    difficulty: 78,
                    trend: "down",
                },
                {
                    keyword: "SEO optimization",
                    position: 12,
                    volume: 2900,
                    difficulty: 72,
                    trend: "stable",
                },
            ],
            pages: [
                {
                    url: "/",
                    title: "Home - Digital Agency",
                    metaDescription:
                        "Leading digital agency providing web design and SEO services",
                    headingStructure: [
                        "H1: Digital Solutions",
                        "H2: Our Services",
                        "H2: Portfolio",
                    ],
                    score: 92,
                    issues: ["Missing alt text on 3 images"],
                },
                {
                    url: "/services",
                    title: "Our Services | Digital Agency",
                    metaDescription:
                        "Explore our comprehensive digital services",
                    headingStructure: [
                        "H1: Our Services",
                        "H2: Web Design",
                        "H2: SEO",
                    ],
                    score: 78,
                    issues: [
                        "Meta description too short",
                        "Missing internal links",
                    ],
                },
            ],
            technical: {
                crawlErrors: 2,
                brokenLinks: 3,
                redirects: 5,
                sitemapPresent: true,
                robotsTxt: "User-agent: *\nAllow: /",
                mobileOptimized: true,
            },
        },
        {
            id: "2",
            url: "https://example.com/blog",
            date: "2024-01-14",
            overallScore: 76,
            metrics: {
                performance: 68,
                accessibility: 82,
                bestPractices: 75,
                seo: 79,
            },
            keywords: [
                {
                    keyword: "blogging tips",
                    position: 5,
                    volume: 890,
                    difficulty: 45,
                    trend: "up",
                },
                {
                    keyword: "content strategy",
                    position: 15,
                    volume: 2100,
                    difficulty: 68,
                    trend: "up",
                },
            ],
            pages: [
                {
                    url: "/blog",
                    title: "Blog | Digital Agency",
                    metaDescription:
                        "Latest insights and tips for digital success",
                    headingStructure: ["H1: Blog", "H2: Latest Posts"],
                    score: 76,
                    issues: ["No meta keywords", "Duplicate content detected"],
                },
            ],
            technical: {
                crawlErrors: 5,
                brokenLinks: 8,
                redirects: 12,
                sitemapPresent: true,
                robotsTxt: "User-agent: *\nAllow: /blog",
                mobileOptimized: false,
            },
        },
    ];
    return mockData;
};

// Styled components for custom styling while maintaining Sanity UI consistency
const ScoreCircle = styled.div<{ score: number }>`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: conic-gradient(
        ${(props) => {
            const color =
                props.score >= 90
                    ? "#0f9d58"
                    : props.score >= 70
                      ? "#f4b400"
                      : "#db4437";
            return `${color} 0deg ${props.score * 3.6}deg, #e0e0e0 ${props.score * 3.6}deg 360deg`;
        }}
    );
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &::before {
        content: "";
        position: absolute;
        width: 70px;
        height: 70px;
        background: black;
        border-radius: 50%;
    }

    span {
        position: relative;
        z-index: 1;
        font-size: 24px;
        font-weight: bold;
        color: white;
    }
`;

const TrendIndicator = styled.span<{ trend: "up" | "down" | "stable" }>`
    color: ${(props) => {
        switch (props.trend) {
            case "up":
                return "#0f9d58";
            case "down":
                return "#db4437";
            default:
                return "#f4b400";
        }
    }};
    margin-left: 4px;
`;

// Main View Component
export const SeoReportsView = () => {
    const [reports, setReports] = useState<SeoReport[]>([]);
    const [currentReport, setCurrentReport] = useState<SeoReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const toast = useToast();

    const refresh = () => {
        setLoading(true);
        // Simulate data fetching
        setTimeout(() => {
            const mockData = generateMockReports();
            setReports(mockData);
            setCurrentReport(mockData[0] || null);
            setLoading(false);
        }, 1000);
    };

    React.useEffect(() => {
        refresh();
    }, []);

    const value = {
        reports,
        currentReport,
        loading,
        setCurrentReport,
        refresh,
    };

    if (loading) {
        return (
            <Flex
                align="center"
                justify="center"
                style={{ minHeight: "400px" }}
            >
                <Spinner />
                <Box marginLeft={3}>
                    <Text>Laster SEO rapporter...</Text>
                </Box>
            </Flex>
        );
    }

    return (
        <SeoReportsContext.Provider value={value}>
            <Container width={4}>
                <Box padding={4}>
                    <Stack space={4}>
                        {/* Header */}
                        <Flex
                            align="center"
                            justify="space-between"
                        >
                            <Flex
                                align="center"
                                gap={3}
                            >
                                <Box style={{ flexShrink: 0 }}>
                                    <SearchIcon fontSize={1} />
                                </Box>
                                <Heading as="h1">SEO Rapporter</Heading>
                            </Flex>

                            <Inline space={2}>
                                <Button
                                    text="Refresh"
                                    tone="primary"
                                    mode="ghost"
                                    onClick={refresh}
                                    icon={RefreshIcon}
                                />
                                <MenuButton
                                    id="export-menu-button"
                                    button={
                                        <Button
                                            text="Export"
                                            icon={ChevronDownIcon}
                                            mode="ghost"
                                        />
                                    }
                                    popover={{ placement: "bottom" }}
                                    menu={
                                        <Menu>
                                            <MenuItem text="Eksporter som CSV" />
                                            <MenuItem text="Eksporter som PDF" />
                                            <MenuItem text="Del rapport" />
                                        </Menu>
                                    }
                                />
                            </Inline>
                        </Flex>

                        {/* Main Content */}
                        {currentReport && (
                            <Card
                                tone="default"
                                padding={4}
                            >
                                <Stack space={4}>
                                    {/* URL and Date */}
                                    <Flex
                                        justify="space-between"
                                        align="center"
                                        wrap="wrap"
                                    >
                                        <Flex
                                            align="center"
                                            gap={2}
                                        >
                                            <LinkIcon />
                                            <Text
                                                size={1}
                                                weight="semibold"
                                            >
                                                <Code>{currentReport.url}</Code>
                                            </Text>
                                        </Flex>
                                        <Badge tone="default">
                                            Sist oppdatert: {currentReport.date}
                                        </Badge>
                                    </Flex>

                                    {/* Score Overview */}
                                    <Card
                                        padding={3}
                                        tone="neutral"
                                    >
                                        <Flex
                                            align="center"
                                            gap={4}
                                            wrap="wrap"
                                        >
                                            <ScoreCircle
                                                score={
                                                    currentReport.overallScore
                                                }
                                            >
                                                <span>
                                                    {currentReport.overallScore}
                                                </span>
                                            </ScoreCircle>
                                            <Stack
                                                space={2}
                                                flex={1}
                                            >
                                                <Text
                                                    size={1}
                                                    weight="semibold"
                                                >
                                                    Oppsummert SEO Helse
                                                </Text>
                                                <Text size={2}>
                                                    {currentReport.overallScore >=
                                                    80
                                                        ? "Fantastisk! Siden gjør det bra."
                                                        : currentReport.overallScore >=
                                                            60
                                                          ? "Bra, men fortsatt forbedringspotensiale."
                                                          : "Har behov for umiddelbare forbedringer."}
                                                </Text>
                                            </Stack>
                                        </Flex>
                                    </Card>

                                    {/* Tabs */}
                                    <TabList space={2}>
                                        <Tab
                                            aria-controls="overview-panel"
                                            id="overview-tab"
                                            label="Oversikt"
                                            selected={activeTab === "overview"}
                                            onClick={() =>
                                                setActiveTab("overview")
                                            }
                                        />
                                        <Tab
                                            aria-controls="metrics-panel"
                                            id="metrics-tab"
                                            label="KPIer"
                                            selected={activeTab === "metrics"}
                                            onClick={() =>
                                                setActiveTab("metrics")
                                            }
                                        />
                                        <Tab
                                            aria-controls="keywords-panel"
                                            id="keywords-tab"
                                            label="Nøkkelord"
                                            selected={activeTab === "keywords"}
                                            onClick={() =>
                                                setActiveTab("keywords")
                                            }
                                        />
                                        <Tab
                                            aria-controls="pages-panel"
                                            id="pages-tab"
                                            label="Sider"
                                            selected={activeTab === "pages"}
                                            onClick={() =>
                                                setActiveTab("pages")
                                            }
                                        />
                                        <Tab
                                            aria-controls="technical-panel"
                                            id="technical-tab"
                                            label="Teknisk SEO"
                                            selected={activeTab === "technical"}
                                            onClick={() =>
                                                setActiveTab("technical")
                                            }
                                        />
                                    </TabList>

                                    {/* Overview Tab */}
                                    {activeTab === "overview" && (
                                        <Box
                                            id="overview-panel"
                                            aria-labelledby="overview-tab"
                                        >
                                            <Grid
                                                columns={[1, 2, 3]}
                                                gap={3}
                                            >
                                                {Object.entries(
                                                    currentReport.metrics,
                                                ).map(([key, value]) => (
                                                    <Card
                                                        key={key}
                                                        padding={3}
                                                        shadow={1}
                                                        tone="default"
                                                    >
                                                        <Flex
                                                            align="center"
                                                            justify="space-between"
                                                        >
                                                            <Text
                                                                weight="semibold"
                                                                size={1}
                                                            >
                                                                {key
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    key.slice(
                                                                        1,
                                                                    )}
                                                            </Text>
                                                            <Badge
                                                                tone={
                                                                    value >= 90
                                                                        ? "positive"
                                                                        : value >=
                                                                            70
                                                                          ? "caution"
                                                                          : "critical"
                                                                }
                                                            >
                                                                {value}/100
                                                            </Badge>
                                                        </Flex>
                                                        <Box marginTop={2}>
                                                            <div
                                                                style={{
                                                                    height: "4px",
                                                                    backgroundColor:
                                                                        "#e0e0e0",
                                                                    borderRadius:
                                                                        "2px",
                                                                    overflow:
                                                                        "hidden",
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: `${value}%`,
                                                                        height: "100%",
                                                                        backgroundColor:
                                                                            value >=
                                                                            90
                                                                                ? "#0f9d58"
                                                                                : value >=
                                                                                    70
                                                                                  ? "#f4b400"
                                                                                  : "#db4437",
                                                                    }}
                                                                />
                                                            </div>
                                                        </Box>
                                                    </Card>
                                                ))}
                                            </Grid>
                                        </Box>
                                    )}

                                    {/* Keywords Tab */}
                                    {activeTab === "keywords" && (
                                        <Box
                                            id="keywords-panel"
                                            aria-labelledby="keywords-tab"
                                        >
                                            <Stack space={3}>
                                                {currentReport.keywords.map(
                                                    (kw, idx) => (
                                                        <Card
                                                            key={idx}
                                                            padding={3}
                                                            shadow={1}
                                                        >
                                                            <Flex
                                                                justify="space-between"
                                                                align="center"
                                                                wrap="wrap"
                                                            >
                                                                <Stack
                                                                    flex={2}
                                                                    space={2}
                                                                >
                                                                    <Text weight="semibold">
                                                                        {
                                                                            kw.keyword
                                                                        }
                                                                    </Text>
                                                                    <Inline
                                                                        space={
                                                                            2
                                                                        }
                                                                        marginTop={
                                                                            1
                                                                        }
                                                                    >
                                                                        <Badge tone="default">
                                                                            Volum:{" "}
                                                                            {
                                                                                kw.volume
                                                                            }
                                                                        </Badge>
                                                                        <Badge tone="default">
                                                                            Vanskelighetsgrad:{" "}
                                                                            {
                                                                                kw.difficulty
                                                                            }
                                                                        </Badge>
                                                                    </Inline>
                                                                </Stack>
                                                                <Flex
                                                                    align="center"
                                                                    gap={2}
                                                                >
                                                                    <Badge
                                                                        tone={
                                                                            kw.position <=
                                                                            5
                                                                                ? "positive"
                                                                                : kw.position <=
                                                                                    15
                                                                                  ? "caution"
                                                                                  : "critical"
                                                                        }
                                                                    >
                                                                        Posisjon:{" "}
                                                                        {
                                                                            kw.position
                                                                        }
                                                                    </Badge>
                                                                    <Tooltip
                                                                        content={`${kw.trend === "up" ? "Forbedres" : kw.trend === "down" ? "Forverres" : "Stabil"}`}
                                                                        placement="top"
                                                                    >
                                                                        <TrendIndicator
                                                                            trend={
                                                                                kw.trend
                                                                            }
                                                                        >
                                                                            {kw.trend ===
                                                                                "up" &&
                                                                                "▲"}
                                                                            {kw.trend ===
                                                                                "down" &&
                                                                                "▼"}
                                                                            {kw.trend ===
                                                                                "stable" &&
                                                                                "●"}
                                                                        </TrendIndicator>
                                                                    </Tooltip>
                                                                </Flex>
                                                            </Flex>
                                                        </Card>
                                                    ),
                                                )}
                                            </Stack>
                                        </Box>
                                    )}

                                    {/* Pages Tab */}
                                    {activeTab === "pages" && (
                                        <Box
                                            id="pages-panel"
                                            aria-labelledby="pages-tab"
                                        >
                                            <Stack space={3}>
                                                {currentReport.pages.map(
                                                    (page, idx) => (
                                                        <Card
                                                            key={idx}
                                                            padding={3}
                                                            shadow={1}
                                                        >
                                                            <Flex
                                                                direction="column"
                                                                gap={2}
                                                            >
                                                                <Flex
                                                                    justify="space-between"
                                                                    align="center"
                                                                >
                                                                    <Text weight="semibold">
                                                                        {
                                                                            page.title
                                                                        }
                                                                    </Text>
                                                                    <Badge
                                                                        tone={
                                                                            page.score >=
                                                                            80
                                                                                ? "positive"
                                                                                : page.score >=
                                                                                    60
                                                                                  ? "caution"
                                                                                  : "critical"
                                                                        }
                                                                    >
                                                                        Rangering:{" "}
                                                                        {
                                                                            page.score
                                                                        }
                                                                    </Badge>
                                                                </Flex>
                                                                <Text
                                                                    size={1}
                                                                    muted
                                                                >
                                                                    {page.url}
                                                                </Text>
                                                                <Text size={1}>
                                                                    Meta:{" "}
                                                                    {
                                                                        page.metaDescription
                                                                    }
                                                                </Text>
                                                                {page
                                                                    .headingStructure
                                                                    .length >
                                                                    0 && (
                                                                    <Stack
                                                                        space={
                                                                            1
                                                                        }
                                                                        marginTop={
                                                                            1
                                                                        }
                                                                    >
                                                                        <Text
                                                                            size={
                                                                                1
                                                                            }
                                                                            weight="semibold"
                                                                        >
                                                                            Overskriftsstruktur:
                                                                        </Text>
                                                                        <Inline
                                                                            space={
                                                                                1
                                                                            }
                                                                        >
                                                                            {page.headingStructure.map(
                                                                                (
                                                                                    heading,
                                                                                    i,
                                                                                ) => (
                                                                                    <Badge
                                                                                        key={
                                                                                            i
                                                                                        }
                                                                                        tone="default"
                                                                                        fontSize={
                                                                                            0
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            heading
                                                                                        }
                                                                                    </Badge>
                                                                                ),
                                                                            )}
                                                                        </Inline>
                                                                    </Stack>
                                                                )}
                                                                {page.issues
                                                                    .length >
                                                                    0 && (
                                                                    <Box
                                                                        marginTop={
                                                                            1
                                                                        }
                                                                    >
                                                                        <Flex
                                                                            align="center"
                                                                            gap={
                                                                                1
                                                                            }
                                                                        >
                                                                            <ErrorOutlineIcon
                                                                                style={{
                                                                                    fontSize:
                                                                                        "12px",
                                                                                }}
                                                                            />
                                                                            <Text
                                                                                size={
                                                                                    1
                                                                                }
                                                                            >
                                                                                Problemer:
                                                                            </Text>
                                                                        </Flex>
                                                                        <Stack
                                                                            space={
                                                                                1
                                                                            }
                                                                            marginTop={
                                                                                1
                                                                            }
                                                                        >
                                                                            {page.issues.map(
                                                                                (
                                                                                    issue,
                                                                                    i,
                                                                                ) => (
                                                                                    <Text
                                                                                        key={
                                                                                            i
                                                                                        }
                                                                                        size={
                                                                                            0
                                                                                        }
                                                                                        muted
                                                                                    >
                                                                                        •{" "}
                                                                                        {
                                                                                            issue
                                                                                        }
                                                                                    </Text>
                                                                                ),
                                                                            )}
                                                                        </Stack>
                                                                    </Box>
                                                                )}
                                                            </Flex>
                                                        </Card>
                                                    ),
                                                )}
                                            </Stack>
                                        </Box>
                                    )}

                                    {/* Technical SEO Tab */}
                                    {activeTab === "technical" && (
                                        <Box
                                            id="technical-panel"
                                            aria-labelledby="technical-tab"
                                        >
                                            <Grid
                                                columns={[1, 2]}
                                                gap={3}
                                            >
                                                <Card
                                                    padding={3}
                                                    shadow={1}
                                                >
                                                    <Stack space={2}>
                                                        <Flex
                                                            align="center"
                                                            justify="space-between"
                                                        >
                                                            <Text weight="semibold">
                                                                Crawler feil
                                                            </Text>
                                                            <Badge
                                                                tone={
                                                                    currentReport
                                                                        .technical
                                                                        .crawlErrors ===
                                                                    0
                                                                        ? "positive"
                                                                        : "critical"
                                                                }
                                                            >
                                                                {
                                                                    currentReport
                                                                        .technical
                                                                        .crawlErrors
                                                                }
                                                            </Badge>
                                                        </Flex>
                                                        <Flex
                                                            align="center"
                                                            justify="space-between"
                                                        >
                                                            <Text weight="semibold">
                                                                Brutte lenker
                                                            </Text>
                                                            <Badge
                                                                tone={
                                                                    currentReport
                                                                        .technical
                                                                        .brokenLinks ===
                                                                    0
                                                                        ? "positive"
                                                                        : "critical"
                                                                }
                                                            >
                                                                {
                                                                    currentReport
                                                                        .technical
                                                                        .brokenLinks
                                                                }
                                                            </Badge>
                                                        </Flex>
                                                        <Flex
                                                            align="center"
                                                            justify="space-between"
                                                        >
                                                            <Text weight="semibold">
                                                                Redirigeringer
                                                            </Text>
                                                            <Badge
                                                                tone={
                                                                    currentReport
                                                                        .technical
                                                                        .redirects <
                                                                    10
                                                                        ? "positive"
                                                                        : "caution"
                                                                }
                                                            >
                                                                {
                                                                    currentReport
                                                                        .technical
                                                                        .redirects
                                                                }
                                                            </Badge>
                                                        </Flex>
                                                    </Stack>
                                                </Card>
                                                <Card
                                                    padding={3}
                                                    shadow={1}
                                                >
                                                    <Stack space={2}>
                                                        <Flex
                                                            align="center"
                                                            justify="space-between"
                                                        >
                                                            <Text weight="semibold">
                                                                Har Sitemap
                                                            </Text>
                                                            {currentReport
                                                                .technical
                                                                .sitemapPresent ? (
                                                                <CheckmarkIcon
                                                                    style={{
                                                                        color: "#0f9d58",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <CloseIcon
                                                                    style={{
                                                                        color: "#db4437",
                                                                    }}
                                                                />
                                                            )}
                                                        </Flex>
                                                        <Flex
                                                            align="center"
                                                            justify="space-between"
                                                        >
                                                            <Text weight="semibold">
                                                                Optimalisert for
                                                                mobil
                                                            </Text>
                                                            {currentReport
                                                                .technical
                                                                .mobileOptimized ? (
                                                                <CheckmarkIcon
                                                                    style={{
                                                                        color: "#0f9d58",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <CloseIcon
                                                                    style={{
                                                                        color: "#db4437",
                                                                    }}
                                                                />
                                                            )}
                                                        </Flex>
                                                        <Stack
                                                            space={2}
                                                            marginTop={2}
                                                        >
                                                            <Text
                                                                size={1}
                                                                weight="semibold"
                                                            >
                                                                Robots.txt
                                                            </Text>

                                                            <Card
                                                                tone="neutral"
                                                                padding={2}
                                                            >
                                                                <Code
                                                                    style={{
                                                                        fontSize: 12,
                                                                        fontFamily:
                                                                            "monospace",
                                                                    }}
                                                                >
                                                                    {
                                                                        currentReport
                                                                            .technical
                                                                            .robotsTxt
                                                                    }
                                                                </Code>
                                                            </Card>
                                                        </Stack>
                                                    </Stack>
                                                </Card>
                                            </Grid>
                                        </Box>
                                    )}
                                </Stack>
                            </Card>
                        )}

                        {/* Report Selection */}
                        {reports.length > 0 && (
                            <Card
                                tone="default"
                                padding={2}
                                shadow={1}
                            >
                                <Flex
                                    gap={2}
                                    wrap="wrap"
                                >
                                    {reports.map((report) => (
                                        <Button
                                            key={report.id}
                                            text={new URL(report.url).hostname}
                                            mode={
                                                currentReport?.id === report.id
                                                    ? "default"
                                                    : "ghost"
                                            }
                                            tone={
                                                currentReport?.id === report.id
                                                    ? "primary"
                                                    : "default"
                                            }
                                            onClick={() =>
                                                setCurrentReport(report)
                                            }
                                            padding={3}
                                        />
                                    ))}
                                </Flex>
                            </Card>
                        )}

                        {/* Search and Filter Bar */}
                        <Card
                            tone="default"
                            padding={3}
                            shadow={1}
                        >
                            <Flex
                                gap={3}
                                align="center"
                                wrap="wrap"
                            >
                                <Box flex={1}>
                                    <TextInput
                                        placeholder="Søk i rapporter (URL eller nøkkelord)..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.currentTarget.value)
                                        }
                                        icon={SearchIcon}
                                    />
                                </Box>
                                <Select>
                                    <option>All Rapporter</option>
                                    <option>Siste 7 dager</option>
                                    <option>Siste 30 dager</option>
                                    <option>Siste 90 dager</option>
                                </Select>
                                <Select>
                                    <option>Sorter etter dato</option>
                                    <option>
                                        Sorter etter rangering (høy til lav)
                                    </option>
                                    <option>
                                        Sorter etter rangering (lav til høy)
                                    </option>
                                </Select>
                            </Flex>
                        </Card>
                    </Stack>
                </Box>
            </Container>
        </SeoReportsContext.Provider>
    );
};
