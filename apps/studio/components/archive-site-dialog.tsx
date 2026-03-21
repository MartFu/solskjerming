"use client";

import { DrilldownSection } from "@/hooks/useDrilldownState";
import { asStudioIcon, capitalize } from "@/utils/helper";
import { ArchiveResult } from "@/utils/site/archiveSite";
import {
  Breadcrumb,
  DocumentTreeNode,
  PreparedDeletionData,
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
  Stack,
  Text,
} from "@sanity/ui";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Divider, DividerProps } from "./divider";
import { useArchiveSite } from "@/context/ArchiveSiteProvider";
import { SITE_OWNED_TYPES } from "@/schemaTypes/documents";
import { Fragment, useState } from "react";
import { CircleIcon } from "@sanity/icons";
import { truncateString } from "sanity";

const StudioArrowUpRight = asStudioIcon(ArrowUpRight);
const StudioArrowLeft = asStudioIcon(ArrowLeft);
const StudioArrowRight = asStudioIcon(ArrowRight);

// ─── Type labels ──────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  SITE_OWNED_TYPES.map((t) => [t, capitalize(t)]),
);

// ─── Primitives ───────────────────────────────────────────────────────────────

function Mono({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <Text
      style={{
        fontFamily: "var(--font-mono, monospace)",
        letterSpacing: "0.02em",
      }}
      size={0}
      muted={muted}
    >
      {children}
    </Text>
  );
}

function DraftBadge() {
  return (
    <Badge
      tone="caution"
      fontSize={0}
      style={{ transition: "ease-in-out 0.4s" }}
    >
      kladd
    </Badge>
  );
}

function SectionLabel({
  muted,
  children,
}: {
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Text
      muted={muted}
      size={1}
    >
      {children}
    </Text>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      style={{
        cursor: "pointer",
      }}
      padding={1}
      mode="bleed"
      tone="neutral"
    >
      <Flex
        gap={1}
        align="center"
        justify="center"
      >
        <StudioArrowLeft />
      </Flex>
    </Button>
  );
}

function StudioLink({ id, type }: { id: string; type: string }) {
  const { generateStudioHref } = useArchiveSite();

  return (
    <Button
      as={"a"}
      href={generateStudioHref(id, type)}
      target="_blank"
      rel="noreferrer"
      style={{
        cursor: "pointer",
      }}
      tone="primary"
      mode="ghost"
      paddingY={1}
      paddingX={2}
    >
      <Flex
        gap={1}
        align="center"
      >
        <Text size={0}>Åpne i Studio</Text>
        <StudioArrowUpRight />
      </Flex>
    </Button>
  );
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

function Breadcrumbs({
  crumbs,
  onNavigate,
}: {
  crumbs: Breadcrumb[];
  onNavigate: (id: string) => void;
}) {
  return (
    <Flex
      align="center"
      gap={2}
      wrap="wrap"
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <Flex
            key={crumb._id}
            align="center"
            gap={2}
          >
            {i > 0 && <Text size={1}>/</Text>}
            {isLast ? (
              <Box padding={1}>
                <Text size={1}>{crumb.title}</Text>
              </Box>
            ) : (
              <Button
                onClick={() => onNavigate(crumb._id)}
                tone="neutral"
                mode="bleed"
                padding={1}
                fontSize={1}
              >
                {crumb.title}
              </Button>
            )}
          </Flex>
        );
      })}
    </Flex>
  );
}

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
        marginBottom: "14px",
      }}
    >
      {onBack && <BackButton onClick={onBack} />}
      {onBack && <Divider />}
      <Flex
        gap={2}
        align="center"
        style={{ marginLeft: 4 }}
      >
        <SectionLabel muted={Boolean(breadcrumbs)}>{label}</SectionLabel>
        {breadcrumbs && onBreadcrumbNavigate && (
          <>
            <Text
              size={1}
              muted
            >
              /
            </Text>
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
      <Mono muted>{label}</Mono>
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
  onBreadcrumbNavigate: (id: string) => void;
}) {
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
          <Mono muted>{TYPE_LABELS[node._type] ?? node._type}</Mono>
          <Text
            size={2}
            weight="semibold"
          >
            {node.title}
          </Text>
        </Stack>

        <Grid
          style={{
            gridTemplateColumns: "72px 1fr",
            rowGap: "6px",
            columnGap: "12px",
          }}
        >
          {node.slug !== undefined && (
            <DetailField label="Slug">
              <Mono>{node.slug || "—"}</Mono>
            </DetailField>
          )}
          <DetailField label="Status">
            <Flex
              align="center"
              gap={2}
            >
              <Mono>Publisert</Mono>
              {node.hasDraft && <DraftBadge />}
            </Flex>
          </DetailField>
          {node.parent && (
            <DetailField label="Under">
              <Mono>{node.parent.title}</Mono>
            </DetailField>
          )}
        </Grid>

        <Flex justify="flex-end">
          <StudioLink
            type={node._type}
            id={node._id}
          />
        </Flex>
      </Stack>
    </Box>
  );
}

// ─── Page tree row ────────────────────────────────────────────────────────────

function TreeRow({
  node,
  depth,
  onSelect,
}: {
  node: DocumentTreeNode;
  depth: number;
  onSelect: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <Button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onSelect(node._id)}
        tone="neutral"
        mode="bleed"
        padding={1}
        style={{
          height: 24,

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
            <Text
              size={1}
              muted
            >
              {node.slug ?? ""}
            </Text>
          </Grid>

          <Flex
            align="center"
            justify="flex-end"
            gap={1}
            style={{ marginLeft: "auto" }}
          >
            {node.hasDraft && <DraftBadge />}
            {hovered && <StudioArrowRight />}
          </Flex>
        </Flex>
      </Button>
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
  slug?: string;
  style?: React.CSSProperties;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
            {truncateString(TYPE_LABELS[doc._type] ?? doc._type, 14)}
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
          {hovered && <StudioArrowRight />}
        </Flex>
      </Flex>
    </Button>
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
        section="Konfigurering"
        onBack={onBack}
        onBreadcrumbNavigate={() => {}}
      />
    );
  }

  return (
    <Box paddingX={4}>
      <SectionHeader label="Konfigurasjon" />
      <Flex direction="column">
        {configDocs.map((doc) => (
          <ConfigRow
            key={doc._id}
            doc={doc}
            onClick={() => onDrill(doc._id)}
          />
        ))}
      </Flex>
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
  const [hovered, setHovered] = useState(false);
  return (
    <Button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
            {truncateString(TYPE_LABELS[asset._type] ?? asset._type, 14)}
          </Text>
          <Text
            size={1}
            muted
          >
            {asset.title}
          </Text>
        </Grid>

        <Flex
          align="center"
          justify="flex-end"
          gap={1}
          style={{ marginLeft: "auto" }}
        >
          {hovered && <StudioArrowRight />}
        </Flex>
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
            <Mono muted>{TYPE_LABELS[asset._type] ?? asset._type}</Mono>
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
              type={asset._type}
              id={asset._id}
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
  const pageCount =
    (counts.byType.page ?? 0) +
    (counts.byType.articleRoot ?? 0) +
    (counts.byType.articlePage ?? 0) +
    (counts.byType.catalogRoot ?? 0) +
    (counts.byType.productPage ?? 0);

  const items = [
    pageCount > 0 && `${pageCount} ${pageCount === 1 ? "side" : "sider"}`,
    (counts.byType.redirect ?? 0) > 0 && `${counts.byType.redirect} redirects`,
    (counts.byType.navbar ?? 0) > 0 && "navbar",
    (counts.byType.footer ?? 0) > 0 && "footer",
    counts.drafts > 0 &&
      `${counts.drafts} ${counts.drafts === 1 ? "kladd" : "kladder"}`,
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

// ─── Receipt ──────────────────────────────────────────────────────────────────

/**
 * The receipt content — pure display, no Dialog wrapper.
 * Compose this inside whatever Dialog/Sheet the caller provides.
 */
export function ArchiveSiteDialog({
  data,
  onConfirm,
  onCancel,
  isArchiving,
  isAlreadyArchived,
  archiveResult,
}: {
  data: PreparedDeletionData;
  onConfirm: () => void;
  onCancel: () => void;
  isArchiving: boolean;
  isAlreadyArchived: boolean;
  archiveResult?: ArchiveResult;
}) {
  const { state, drill, back } = useArchiveSite();
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
      header={`Arkivere «${data.siteName}»`}
      onClose={onCancel}
      zOffset={1000}
      width={1}
    >
      <Stack space={3}>
        {/* Header */}

        <Divider {...dividerProps} />
        <Stack
          space={2}
          paddingX={4}
        >
          <Text size={0}>{counts.total} dokumenter totalt</Text>

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
            {sharedAssets.length > 0 && <Divider {...dividerProps} />}
          </>
        )}

        {/* Shared assets */}
        {sharedAssets.length > 0 && (
          <>
            <SharedSection
              sharedAssets={sharedAssets}
              view={state.shared}
              onDrill={drillSection("shared")}
              onBack={backSection("shared")}
            />
          </>
        )}

        {/* Error feedback */}
        {archiveResult && !archiveResult.success && (
          <Box paddingX={4}>
            <Card
              padding={3}
              radius={2}
              tone="critical"
            >
              <Text size={1}>{archiveResult.error}</Text>
            </Card>
          </Box>
        )}

        {/* Actions */}
        <Card
          paddingX={4}
          paddingY={3}
          borderTop
        >
          <Flex
            gap={1}
            align="center"
            justify="flex-end"
          >
            <Button
              onClick={onCancel}
              disabled={isArchiving}
              tone="neutral"
              mode="ghost"
              style={{
                cursor: isArchiving ? "not-allowed" : "pointer",
                opacity: isArchiving ? 0.5 : 1,
              }}
            >
              <Text size={1}>Avbryt</Text>
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isArchiving || isAlreadyArchived}
              loading={isArchiving}
              tone="critical"
              style={{
                cursor:
                  isArchiving || isAlreadyArchived ? "not-allowed" : "pointer",
              }}
            >
              <Text size={1}>
                {isArchiving ? "Arkiverer…" : "Arkiver nettsted"}
              </Text>
            </Button>
          </Flex>
        </Card>
      </Stack>
    </Dialog>
  );
}
