"use client";

import { DrilldownSection } from "@/hooks/useDrilldownState";
import { asStudioIcon, capitalize } from "@/utils/helper";
import {
    Breadcrumb,
    DocumentTreeNode,
    findAncestors,
    findNode,
} from "@/utils/site/buildSiteDocumentTree";
import {
    SharedAssetReference,
    SiteDeletionPreview,
} from "@/utils/site/getSiteDeletionPreview";
import {
    Badge,
    Box,
    Button,
    Card,
    Dialog,
    Flex,
    Grid,
    Spinner,
    Stack,
    Text,
    TextInput,
    useTheme_v2,
    useToast,
} from "@sanity/ui";
import { Divider, DividerProps } from "@/components/divider";
import { useArchiveSite } from "@/context/ArchiveSiteProvider";
import { SITE_OWNED_TYPES } from "@/schemaTypes/documents";
import { Fragment, useEffect, useState } from "react";
import {
    ArrowRightIcon,
    InfoOutlineIcon,
    WarningOutlineIcon,
} from "@sanity/icons";
import { truncateString } from "sanity";
import {
    BackButton,
    DraftBadge,
    SectionLabel,
    StudioLink,
    TextMono,
} from "@/components/primitives";
import { Breadcrumbs } from "@/components/breadcrumbs";
import styled, { DefaultTheme } from "styled-components";
import { getThemeVariables } from "@/utils/themes/themeToCss";
import {
    getTheme_v2,
    THEME_COLOR_CARD_TONES,
    Theme_v2,
} from "@sanity/ui/theme";
import { useToolLayout } from "@/context/ToolLayoutProvider";

// ─── Type labels ──────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
    SITE_OWNED_TYPES.map((t) => [t, capitalize(t)]),
);

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
    label,
    breadcrumbs,
    onBack,
    onBreadcrumbNavigate,
}: {
    label: string;
    breadcrumbs?: Breadcrumb[];
    onBack?: () => void;
    onBreadcrumbNavigate?: (id: string) => void;
}) {
    return (
        <Flex
            gap={2}
            align="center"
            style={{
                marginBottom: "4px",
            }}
        >
            {onBack && <BackButton onClick={onBack} />}
            {onBack && <Divider />}
            <Flex
                gap={1}
                align="center"
                style={{ marginLeft: 4 }}
            >
                <Box padding={2}>
                    <SectionLabel muted={Boolean(breadcrumbs)}>
                        {label}
                    </SectionLabel>
                </Box>
                {breadcrumbs && onBreadcrumbNavigate && (
                    <>
                        <Box padding={1}>
                            <Text
                                size={1}
                                muted
                            >
                                /
                            </Text>
                        </Box>
                        <Breadcrumbs
                            crumbs={breadcrumbs}
                            onNavigate={onBreadcrumbNavigate}
                        />
                    </>
                )}
            </Flex>
        </Flex>
    );
}

// ─── Document detail view ─────────────────────────────────────────────────────

function DetailField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <>
            <TextMono
                size={1}
                muted
            >
                {label}
            </TextMono>
            <Box>{children}</Box>
        </>
    );
}

function DocumentDetail({
    node,
    breadcrumbs,
    section,
    onBack,
    onBreadcrumbNavigate,
}: {
    node: DocumentTreeNode;
    breadcrumbs: Breadcrumb[];
    section: string;
    onBack: () => void;
    onBreadcrumbNavigate?: (id: string) => void;
}) {
    const { openDocumentInNewTab } = useToolLayout();
    const { site } = useArchiveSite();

    return (
        <Box paddingX={4}>
            <SectionHeader
                label={section}
                breadcrumbs={breadcrumbs.length > 1 ? breadcrumbs : undefined}
                onBack={onBack}
                onBreadcrumbNavigate={onBreadcrumbNavigate}
            />
            <Stack space={3}>
                <Stack space={2}>
                    <Text
                        size={2}
                        weight="semibold"
                    >
                        {node.title}
                    </Text>
                    <Divider
                        opacity={0.1}
                        direction="horizontal"
                        length={"100%"}
                        thickness={1}
                    />
                </Stack>

                <Grid
                    style={{
                        gridTemplateColumns: "72px 1fr",
                        rowGap: "12px",
                        columnGap: "12px",
                    }}
                >
                    {node.slug !== undefined && (
                        <DetailField label="Slug">
                            <TextMono size={1}>{node?.slug || "—"}</TextMono>
                        </DetailField>
                    )}
                    <DetailField label="Status">
                        <Flex
                            align="center"
                            gap={2}
                        >
                            <TextMono size={1}>Publisert</TextMono>
                            {node.hasDraft && <DraftBadge />}
                        </Flex>
                    </DetailField>
                    {node.parent && (
                        <DetailField label="Under">
                            <TextMono size={1}>{node.parent.title}</TextMono>
                        </DetailField>
                    )}
                </Grid>

                <Flex justify="flex-end">
                    <StudioLink
                        onClick={() =>
                            openDocumentInNewTab(
                                node._id,
                                node._type,
                                site._id,
                                site.title,
                            )
                        }
                    />
                </Flex>
            </Stack>
        </Box>
    );
}

// ─── Page tree row ────────────────────────────────────────────────────────────

const StyledButton = styled(Button)`
  .reveal-on-hover {
    opacity: 0;
    color: ${({ theme }) => {
        const t = theme as any;

        if (t && t?.sanity) {
            return (
                t.sanity?.v2?.color?.button?.default?.primary?.enabled?.bg ?? ""
            );
        }
    }}};
    transition: opacity 0.2s ease-in-out;
  }

  &:hover {
    & .reveal-on-hover {
      opacity: 1;
    }
  
  }
`;

function TreeRow({
    node,
    depth,
    onSelect,
}: {
    node: DocumentTreeNode;
    depth: number;
    onSelect: (id: string) => void;
}) {
    return (
        <>
            <StyledButton
                onClick={() => onSelect(node._id)}
                tone="neutral"
                mode="bleed"
                paddingX={2}
                style={{
                    height: 28,
                    cursor: "pointer",
                    paddingLeft: `${depth * 8}px`,
                }}
            >
                <Flex
                    gap={1}
                    align="center"
                >
                    {depth > 0 && (
                        <Text
                            muted
                            style={{ opacity: 0.5 }}
                        >
                            └
                        </Text>
                    )}
                    <Grid
                        columns={2}
                        gap={3}
                        style={{ width: "33%" }}
                    >
                        <Text size={1}>{truncateString(node.title, 14)}</Text>
                        <TextMono
                            size={1}
                            muted
                        >
                            {node.slug ?? ""}
                        </TextMono>
                    </Grid>

                    <Flex
                        align="center"
                        justify="flex-end"
                        gap={1}
                        style={{ marginLeft: "auto" }}
                    >
                        {node.hasDraft && <DraftBadge />}
                    </Flex>

                    <ArrowRightIcon
                        style={{ flexShrink: 0 }}
                        fontSize={20}
                        className="reveal-on-hover"
                    />
                </Flex>
            </StyledButton>
            {node.children.map((child) => (
                <TreeRow
                    key={child._id}
                    node={child}
                    depth={depth + 1}
                    onSelect={onSelect}
                />
            ))}
        </>
    );
}

// ─── Pages section ────────────────────────────────────────────────────────────

function PagesSection({
    pageTree,
    view,
    onDrill,
    onBack,
}: {
    pageTree: DocumentTreeNode[];
    view: { type: "summary" } | { type: "detail"; id: string };
    onDrill: (id: string) => void;
    onBack: () => void;
}) {
    if (view.type === "detail") {
        const node = findNode(view.id, pageTree);
        const breadcrumbs = findAncestors(view.id, pageTree) ?? [];
        if (!node) return null;

        return (
            <DocumentDetail
                node={node}
                breadcrumbs={breadcrumbs}
                section="Sider"
                onBack={onBack}
                onBreadcrumbNavigate={onDrill}
            />
        );
    }

    return (
        <Box paddingX={4}>
            <SectionHeader label="Sider" />
            <Flex direction="column">
                {pageTree.map((node) => (
                    <TreeRow
                        key={node._id}
                        node={node}
                        depth={0}
                        onSelect={onDrill}
                    />
                ))}
            </Flex>
        </Box>
    );
}

// ─── Config row ────────────────────────────────────────────────────────────

function ConfigRow({
    doc,
    style,
    onClick,
}: {
    doc: DocumentTreeNode;
    style?: React.CSSProperties;
    onClick: () => void;
}) {
    return (
        <StyledButton
            onClick={onClick}
            tone="neutral"
            mode="bleed"
            padding={1}
            style={{
                height: 24,
                cursor: "pointer",
                ...style,
            }}
        >
            <Flex
                gap={1}
                align="center"
            >
                <Grid
                    columns={2}
                    gap={3}
                    style={{ width: "33%" }}
                >
                    <Text size={1}>
                        {truncateString(
                            TYPE_LABELS[doc._type] ?? doc._type,
                            14,
                        )}
                    </Text>

                    <Text
                        size={1}
                        muted
                    >
                        {doc.title}
                    </Text>
                </Grid>

                <Flex
                    align="center"
                    justify="flex-end"
                    gap={1}
                    style={{ marginLeft: "auto" }}
                >
                    {doc.hasDraft && <DraftBadge />}

                    <ArrowRightIcon
                        style={{ flexShrink: 0 }}
                        fontSize={20}
                        className="reveal-on-hover"
                    />
                </Flex>
            </Flex>
        </StyledButton>
    );
}

// ─── Config section ───────────────────────────────────────────────────────────

function ConfigSection({
    configDocs,
    view,
    onDrill,
    onBack,
}: {
    configDocs: DocumentTreeNode[];
    view: { type: "summary" } | { type: "detail"; id: string };
    onDrill: (id: string) => void;
    onBack: () => void;
}) {
    if (view.type === "detail") {
        const node = configDocs.find((d) => d._id === view.id);
        if (!node) return null;

        return (
            <DocumentDetail
                node={node}
                breadcrumbs={[{ _id: node._id, title: node.title }]}
                section="Konfigurasjon"
                onBack={onBack}
            />
        );
    }

    return (
        <Box paddingX={4}>
            <SectionHeader label="Konfigurasjon" />
            <Stack>
                {configDocs.map((doc) => (
                    <ConfigRow
                        key={doc._id}
                        doc={doc}
                        onClick={() => onDrill(doc._id)}
                    />
                ))}
            </Stack>
        </Box>
    );
}

// ─── Shared asset row ─────────────────────────────────────────────────────────

function SharedRow({
    asset,
    onClick,
}: {
    asset: SharedAssetReference;
    onClick: () => void;
}) {
    return (
        <Button
            onClick={onClick}
            tone="neutral"
            mode="bleed"
            padding={1}
            style={{
                height: 24,
                cursor: "pointer",
                opacity: 0.65,
            }}
        >
            <Flex
                gap={1}
                align="center"
            >
                <Grid
                    columns={2}
                    gap={3}
                    style={{ width: "33%" }}
                >
                    <Text size={1}>
                        {truncateString(
                            TYPE_LABELS[asset._type] ?? asset._type,
                            14,
                        )}
                    </Text>
                    <Text
                        size={1}
                        muted
                    >
                        {asset.title}
                    </Text>
                </Grid>
            </Flex>
        </Button>
    );
}

// ─── Shared assets section ────────────────────────────────────────────────────

function SharedSection({
    sharedAssets,
    view,
    onDrill,
    onBack,
}: {
    sharedAssets: SharedAssetReference[];
    view: { type: "summary" } | { type: "detail"; id: string };
    onDrill: (id: string) => void;
    onBack: () => void;
}) {
    const { openDocumentInNewTab } = useToolLayout();
    const { site } = useArchiveSite();

    if (sharedAssets.length === 0) return null;

    if (view.type === "detail") {
        const asset = sharedAssets.find((a) => a._id === view.id);
        if (!asset) return null;

        return (
            <Box paddingX={4}>
                <SectionHeader
                    label="Delte ressurser"
                    breadcrumbs={[{ _id: asset._id, title: asset.title }]}
                    onBack={onBack}
                    onBreadcrumbNavigate={() => {}}
                />
                <Stack space={3}>
                    <Stack space={2}>
                        <TextMono muted>
                            {TYPE_LABELS[asset._type] ?? asset._type}
                        </TextMono>
                        <Text
                            size={2}
                            weight="semibold"
                        >
                            {asset.title}
                        </Text>
                    </Stack>

                    <Card
                        padding={3}
                        radius={2}
                        tone="caution"
                    >
                        <Flex
                            align="center"
                            gap={2}
                        >
                            <Text size={0}>⚠</Text>
                            <Text
                                size={1}
                                muted
                            >
                                Tilhører arbeidsområdet — vil ikke bli arkivert
                            </Text>
                        </Flex>
                    </Card>

                    <Flex justify="flex-end">
                        <StudioLink
                            onClick={() =>
                                openDocumentInNewTab(
                                    asset._id,
                                    asset._type,
                                    site._id,
                                    site.title,
                                )
                            }
                        />
                    </Flex>
                </Stack>
            </Box>
        );
    }

    return (
        <Box paddingX={4}>
            <SectionHeader label="Delte ressurser" />
            <Text
                size={0}
                muted
                style={{ marginBottom: 8 }}
            >
                Disse tilhører arbeidsområdet og vil ikke bli berørt.
            </Text>
            <Flex direction="column">
                {sharedAssets.map((asset) => (
                    <SharedRow
                        key={asset._id}
                        asset={asset}
                        onClick={() => onDrill(asset._id)}
                    />
                ))}
            </Flex>
        </Box>
    );
}

// ─── Summary bar ──────────────────────────────────────────────────────────────

function SummaryBar({ counts }: { counts: SiteDeletionPreview["counts"] }) {
    const pageCount = counts.byType.page ?? 0;

    const items = [
        pageCount > 0 && `${pageCount} ${pageCount === 1 ? "side" : "sider"}`,
        // FIX #13: Use Norwegian consistently
        (counts.byType.redirect ?? 0) > 0 &&
            `${counts.byType.redirect} ${counts.byType.redirect === 1 ? "viderekobling" : "viderekoblinger"}`,
        (counts.byType.navbar ?? 0) > 0 && "navbar",
        (counts.byType.footer ?? 0) > 0 && "footer",
        counts.drafts > 0 &&
            `hvorav ${counts.drafts} ${counts.drafts === 1 ? "kladd" : "kladder"}`,
    ].filter(Boolean) as string[];

    return (
        <Flex
            align="center"
            gap={2}
            paddingY={1}
        >
            {items.map((item, i) => (
                <Fragment key={i}>
                    <Text
                        muted
                        size={1}
                    >
                        {item}
                    </Text>
                    {i < items.length - 1 && <Divider opacity={0.2} />}
                </Fragment>
            ))}
        </Flex>
    );
}

// ─── Archive site dialog ──────────────────────────────────────────────────────

/**
 * The archive confirmation dialog.
 * Uses ArchiveSiteProvider context for all state and actions.
 */
export function ArchiveSiteDialog() {
    const {
        state,
        drill,
        back,
        data,
        archiving,
        previewLoading,
        error,
        close,
        archiveSite,
        isAlreadyArchived,
    } = useArchiveSite();
    const toast = useToast();
    const [confirmName, setConfirmName] = useState("");

    useEffect(() => {
        if (!error) return;

        toast.push({
            title: error,
            duration: 3000,
            status: "error",
        });
    }, [error]);

    const isReady = !previewLoading && data !== null;
    if (!isReady) {
        return (
            <Dialog
                id="archive-site-dialog"
                header="Laster..."
                onClose={close}
            >
                <Flex
                    align="center"
                    justify="center"
                    padding={6}
                >
                    <Spinner />
                </Flex>
            </Dialog>
        );
    }

    const { siteName, pageTree, otherOwned, sharedAssets, counts } = data;

    const drillSection = (section: DrilldownSection) => (id: string) =>
        drill(section, id);
    const backSection = (section: DrilldownSection) => () => back(section);

    const dividerProps: DividerProps = {
        direction: "horizontal",
        length: "100%",
        thickness: 1,
        opacity: 0.1,
    };

    return (
        <Dialog
            id="archive-site-dialog"
            header={`Arkivere «${siteName}»`}
            onClickOutside={close}
            onClose={close}
            zOffset={1000}
            width={1}
        >
            <Stack space={3}>
                <Divider {...dividerProps} />
                <Stack
                    space={3}
                    paddingX={4}
                >
                    <Card
                        padding={3}
                        tone="caution"
                        border
                        radius={2}
                    >
                        <Stack space={3}>
                            <Flex
                                gap={2}
                                align="center"
                            >
                                <WarningOutlineIcon />
                                <Text size={1}>Advarsel</Text>
                            </Flex>
                            <Text
                                size={1}
                                muted
                            >
                                Du er i ferd med å arkivere{" "}
                                <strong>{counts.total}</strong> dokumenter.
                            </Text>
                        </Stack>
                    </Card>

                    {/* Summary — always visible regardless of section drill-down state */}
                    <SummaryBar counts={counts} />
                </Stack>
                <Divider {...dividerProps} />

                {/* Pages */}
                {pageTree.length > 0 && (
                    <>
                        <PagesSection
                            pageTree={pageTree}
                            view={state.pages}
                            onDrill={drillSection("pages")}
                            onBack={backSection("pages")}
                        />
                        <Divider {...dividerProps} />
                    </>
                )}

                {/* Config (navbar, footer, redirects) */}
                {otherOwned.length > 0 && (
                    <>
                        <ConfigSection
                            configDocs={otherOwned}
                            view={state.config}
                            onDrill={drillSection("config")}
                            onBack={backSection("config")}

                        />
                        {sharedAssets.length > 0 && (
                            <Divider {...dividerProps} />
                        )}
                    </>
                )}

                {/* Shared assets */}
                {sharedAssets.length > 0 && (
                    <SharedSection
                        sharedAssets={sharedAssets}
                        view={state.shared}
                        onDrill={drillSection("shared")}
                        onBack={backSection("shared")}
                    />
                )}

                {/* No preview available for types */}
                {sharedAssets.length === 0 &&
                    otherOwned.length === 0 &&
                    pageTree.length === 0 && (
                        <Box
                            paddingX={4}
                            paddingY={3}
                        >
                            <Card
                                padding={4}
                                tone="neutral"
                                border
                                radius={2}
                            >
                                <Flex
                                    gap={4}
                                    align="flex-start"
                                    justify="center"
                                >
                                    <InfoOutlineIcon
                                        style={{
                                            width: 28,
                                            height: 28,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Text size={1}>
                                        Sidens registrerte
                                        {counts.total > 1
                                            ? " dokumenter "
                                            : " dokument "}
                                        har lav betydelse, dermed ble ingen
                                        forhåndsvisning generert. Du kan anse
                                        det som trygt arkivere siden uten å
                                        foreta deg noe mer her.
                                    </Text>
                                </Flex>
                            </Card>
                        </Box>
                    )}

                {/* Error feedback */}
                {error && (
                    <Box paddingX={4}>
                        <Card
                            padding={3}
                            radius={2}
                            tone="critical"
                        >
                            <Text size={1}>{error}</Text>
                        </Card>
                    </Box>
                )}

                {/* Actions */}
                <Card
                    padding={4}
                    borderTop
                >
                    <Flex
                        align="flex-end"
                        justify="space-between"
                    >
                        <Stack space={2}>
                            <Text
                                size={1}
                                muted
                            >
                                Skriv inn <strong>{siteName}</strong> for å
                                bekrefte arkivering.
                            </Text>
                            <TextInput
                                value={confirmName}
                                onChange={(e) =>
                                    setConfirmName(e.currentTarget.value)
                                }
                                placeholder={siteName}
                                disabled={archiving}
                            />
                        </Stack>
                        <Flex
                            gap={1}
                            align="center"
                            justify="flex-end"
                        >
                            <Button
                                onClick={close}
                                disabled={archiving}
                                tone="neutral"
                                mode="ghost"
                                style={{
                                    cursor: archiving
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity: archiving ? 0.5 : 1,
                                }}
                            >
                                <Text size={1}>Avbryt</Text>
                            </Button>
                            <Button
                                onClick={archiveSite}
                                disabled={
                                    archiving ||
                                    isAlreadyArchived ||
                                    confirmName.trim() !== siteName
                                }
                                loading={archiving}
                                tone="critical"
                                style={{
                                    cursor:
                                        archiving ||
                                        isAlreadyArchived ||
                                        confirmName.trim() !== siteName
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                            >
                                <Text size={1}>
                                    {archiving
                                        ? "Arkiverer…"
                                        : "Arkiver nettsted"}
                                </Text>
                            </Button>
                        </Flex>
                    </Flex>
                </Card>
            </Stack>
        </Dialog>
    );
}
