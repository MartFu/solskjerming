import React, { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from "@sanity/ui";
import {
  LinkIcon,
  UnlinkIcon,
  WarningOutlineIcon,
} from "@sanity/icons";
import type { ProductReference,  Site } from "../types";
import { ExternalLink } from "lucide-react";
import { useProductReferences } from "../hooks/useProductReference";

interface ReferencesPanelProps {
  productId: string;
  productName: string;
  onRequestDelete: () => void;
  sites: Site[]
}

/**
 * Groups references by site (using sites to resolve site labels).
 * References whose document type is "site" or matches a site ID are
 * shown as a top-level site group; all others are under "Other".
 */
function groupBySite(
  refs: ProductReference[],
  sites: Site[],
): Array<{
  siteId: string;
  siteTitle: string;
  color?: string;
  docs: ProductReference[];
}> {
  const safeSites = sites && sites?.length > 0 ? sites : [];
  const siteMap = new Map(safeSites.map(s => [s?._id, s]));
  const groups = new Map<
    string,
    {
      siteId: string;
      siteTitle: string;
      color?: string;
      docs: ProductReference[];
    }
  >();

  for (const ref of refs) {
    const siteId = ref.site?._id ?? "__other__";
    const siteTitle = ref.site?.title ?? "Not site-specific";
    const siteConfig = siteMap.get(siteId);

    if (!groups.has(siteId)) {
      groups.set(siteId, {
        siteId,
        siteTitle,
        docs: [],
      });
    }
    groups.get(siteId)!.docs.push(ref);
  }

  // Sort: known sites first (in config order), then "other"
  const known =  safeSites
    .map((s) => groups.get(s?._id))
    .filter(Boolean) as ReturnType<typeof groupBySite>;
  const other = groups.get("__other__");
  return other ? [...known, other] : known;
}

const TYPE_LABELS: Record<string, string> = {
  page: "Page",
  category: "Category",
  site: "Site",
  siteSettings: "Site settings",
  navigation: "Navigation",
};

export function ReferencesPanel({
  productId,
  productName,
  sites,
  onRequestDelete,
}: ReferencesPanelProps) {
  const { references, loading, error, openReference } =
    useProductReferences(productId);
  const [showDereferenceGuide, setShowDereferenceGuide] = useState(false);

  if (loading) {
    return (
      <Flex
        align="center"
        justify="center"
        padding={4}
      >
        <Spinner muted />
      </Flex>
    );
  }

  if (error) {
    return (
      <Card
        tone="critical"
        padding={3}
        radius={2}
      >
        <Text size={1}>Failed to load references: {error.message}</Text>
      </Card>
    );
  }

  const groups = groupBySite(references, sites);
  const totalCount = references.length;

  return (
    <Stack space={4}>
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
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
            References
          </Text>
          <Badge
            tone={totalCount > 0 ? "caution" : "positive"}
            size={0}
          >
            {totalCount}
          </Badge>
        </Flex>

        {totalCount > 0 && (
          <Tooltip
            content={
              <Box
                padding={2}
                style={{ maxWidth: 220 }}
              >
                <Text size={0}>
                  This product is still referenced. You must remove all
                  references before deleting.
                </Text>
              </Box>
            }
            placement="left"
          >
            <Button
              icon={UnlinkIcon}
              text="Deref guide"
              mode="ghost"
              tone="caution"
              fontSize={0}
              padding={2}
              onClick={() => setShowDereferenceGuide(true)}
            />
          </Tooltip>
        )}

        {totalCount === 0 && (
          <Button
            icon={UnlinkIcon}
            text="Delete product"
            mode="ghost"
            tone="critical"
            fontSize={0}
            padding={2}
            onClick={onRequestDelete}
          />
        )}
      </Flex>

      {/* Reference groups */}
      {totalCount === 0 ? (
        <Card
          tone="positive"
          padding={3}
          radius={2}
        >
          <Text
            size={1}
            muted
          >
            No documents reference this product. It is safe to delete.
          </Text>
        </Card>
      ) : (
        <Stack space={3}>
          {groups.map((group) => (
            <Stack
              key={group.siteId}
              space={2}
            >
              {/* Site badge */}
              <Flex
                align="center"
                gap={2}
              >
                <Box
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: group.color ?? "var(--card-muted-fg-color)",
                    flexShrink: 0,
                  }}
                />
                <Text
                  size={0}
                  weight="semibold"
                >
                  {group.siteTitle}
                </Text>
                <Badge size={0}>{group.docs.length}</Badge>
              </Flex>

              {/* Documents in this group */}
              <Stack
                space={1}
                style={{ paddingLeft: 18 }}
              >
                {group.docs.map((ref) => (
                  <Card
                    key={ref._id}
                    as="button"
                    padding={2}
                    radius={2}
                    tone="default"
                    style={{
                      cursor: "pointer",
                      border: "1px solid var(--card-border-color)",
                    }}
                    onClick={() => openReference(ref)}
                  >
                    <Flex
                      align="center"
                      gap={2}
                    >
                      <Box
                        flex={1}
                        style={{ minWidth: 0 }}
                      >
                        <Text
                          size={1}
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {ref.title}
                        </Text>
                        <Text
                          size={0}
                          muted
                        >
                          {TYPE_LABELS[ref._type] ?? ref._type}
                        </Text>
                      </Box>
                      <ExternalLink
                        style={{ flexShrink: 0, fontSize: 12, opacity: 0.5 }}
                      />
                    </Flex>
                  </Card>
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}

      {/* Dereference guide dialog */}
      {showDereferenceGuide && (
        <Dialog
          header={`Remove all references to "${productName}"`}
          id="deref-guide-dialog"
          onClose={() => setShowDereferenceGuide(false)}
          width={1}
        >
          <Box padding={4}>
            <Stack space={4}>
              <Card
                tone="caution"
                padding={3}
                radius={2}
              >
                <Flex
                  align="center"
                  gap={2}
                >
                  <WarningOutlineIcon />
                  <Text size={1}>
                    This product cannot be deleted until all {totalCount}{" "}
                    reference
                    {totalCount !== 1 ? "s are" : " is"} removed.
                  </Text>
                </Flex>
              </Card>

              <Text size={1}>
                Open each document below and remove the reference to this
                product, then return here to delete it.
              </Text>

              <Stack space={2}>
                {references.map((ref) => (
                  <Card
                    key={ref._id}
                    as="button"
                    padding={3}
                    radius={2}
                    tone="default"
                    style={{
                      cursor: "pointer",
                      border: "1px solid var(--card-border-color)",
                    }}
                    onClick={() => openReference(ref)}
                  >
                    <Flex
                      align="center"
                      gap={2}
                    >
                      <Box flex={1}>
                        <Text
                          size={1}
                          weight="semibold"
                        >
                          {ref.title}
                        </Text>
                        <Text
                          size={0}
                          muted
                        >
                          {TYPE_LABELS[ref._type] ?? ref._type}
                          {ref.site ? ` · ${ref.site.title}` : ""}
                        </Text>
                      </Box>
                      <ExternalLink style={{ flexShrink: 0 }} />
                    </Flex>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Box>
        </Dialog>
      )}
    </Stack>
  );
}
